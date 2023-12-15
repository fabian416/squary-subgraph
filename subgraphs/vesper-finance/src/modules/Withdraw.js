"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Withdraw = exports.getWithdrawFeePercentage = exports.UpdateMetricsAfterWithdraw = exports.createWithdrawTransaction = void 0;
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const Prices_1 = require("./Prices");
const Revenue_1 = require("./Revenue");
const index_1 = require("../prices/index");
const Pool_1 = require("../../generated/templates/PoolAccountant/Pool");
function createWithdrawTransaction(vault, amount, amountUSD, transaction, block) {
    let withdrawTransactionId = "withdraw-" + transaction.hash.toHexString();
    let withdrawTransaction = schema_1.Withdraw.load(withdrawTransactionId);
    if (!withdrawTransaction) {
        withdrawTransaction = new schema_1.Withdraw(withdrawTransactionId);
        withdrawTransaction.vault = vault.id;
        withdrawTransaction.protocol = constants.PROTOCOL_ID;
        withdrawTransaction.to = transaction.to.toHexString();
        withdrawTransaction.from = transaction.from.toHexString();
        withdrawTransaction.hash = transaction.hash.toHexString();
        withdrawTransaction.logIndex = transaction.index.toI32();
        withdrawTransaction.asset = vault.inputToken;
        withdrawTransaction.amount = amount;
        withdrawTransaction.amountUSD = amountUSD;
        withdrawTransaction.timestamp = block.timestamp;
        withdrawTransaction.blockNumber = block.number;
        withdrawTransaction.save();
    }
    return withdrawTransaction;
}
exports.createWithdrawTransaction = createWithdrawTransaction;
function UpdateMetricsAfterWithdraw(block) {
    const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
    // Update hourly and daily deposit transaction count
    const metricsDailySnapshot = (0, initializers_1.getOrCreateUsageMetricsDailySnapshot)(block);
    const metricsHourlySnapshot = (0, initializers_1.getOrCreateUsageMetricsHourlySnapshot)(block);
    metricsDailySnapshot.dailyWithdrawCount += 1;
    metricsHourlySnapshot.hourlyWithdrawCount += 1;
    metricsDailySnapshot.save();
    metricsHourlySnapshot.save();
    protocol.save();
}
exports.UpdateMetricsAfterWithdraw = UpdateMetricsAfterWithdraw;
function getWithdrawFeePercentage(vaultContract) {
    let withdrawFeePercentage = utils.readValue(vaultContract.try_withdrawFee(), constants.BIGINT_ZERO);
    if (withdrawFeePercentage.gt(constants.BIGINT_TEN.pow(14))) {
        // v1 pools withdraw fee is stored in pow(10, 16) format
        return withdrawFeePercentage.div(constants.BIGINT_TEN.pow(14));
    }
    return withdrawFeePercentage;
}
exports.getWithdrawFeePercentage = getWithdrawFeePercentage;
function Withdraw(vaultAddress, withdrawAmount, sharesBurnt, transaction, block) {
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
    let vaultContract = Pool_1.Pool.bind(vaultAddress);
    let inputToken = schema_1.Token.load(vault.inputToken);
    let inputTokenAddress = graph_ts_1.Address.fromString(vault.inputToken);
    let inputTokenPrice = (0, index_1.getUsdPricePerToken)(inputTokenAddress);
    let inputTokenDecimals = constants.BIGINT_TEN.pow(inputToken.decimals);
    let withdrawAmountUSD = withdrawAmount
        .toBigDecimal()
        .div(inputTokenDecimals.toBigDecimal())
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    let withdrawFeePercentage = getWithdrawFeePercentage(vaultContract);
    let withdrawalFee = sharesBurnt
        .times(withdrawFeePercentage)
        .div(constants.MAX_BPS);
    vault.outputTokenSupply = utils.readValue(vaultContract.try_totalSupply(), constants.BIGINT_ZERO);
    let totalValue = utils.readValue(vaultContract.try_totalValue(), constants.BIGINT_ZERO);
    if (totalValue.equals(constants.BIGINT_ZERO)) {
        let vaultTokenLocked = utils.readValue(vaultContract.try_tokenLocked(), constants.BIGINT_ZERO);
        let tokenInVault = utils.readValue(vaultContract.try_tokensHere(), constants.BIGINT_ZERO);
        totalValue = vaultTokenLocked.plus(tokenInVault);
    }
    vault.inputTokenBalance = totalValue;
    vault.totalValueLockedUSD = vault.inputTokenBalance
        .toBigDecimal()
        .div(inputTokenDecimals.toBigDecimal())
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    vault.outputTokenPriceUSD = (0, Prices_1.getPriceOfOutputTokens)(vaultAddress);
    let outputTokenDecimals = utils.getTokenDecimals(vaultAddress);
    // Protocol Side Revenue USD
    let withdrawalFeeUSD = withdrawalFee
        .toBigDecimal()
        .div(outputTokenDecimals)
        .times(vault.outputTokenPriceUSD);
    vault.save();
    createWithdrawTransaction(vault, withdrawAmount, withdrawAmountUSD, transaction, block);
    (0, Revenue_1.updateRevenueSnapshots)(vault, constants.BIGDECIMAL_ZERO, withdrawalFeeUSD, block);
    utils.updateProtocolTotalValueLockedUSD();
    UpdateMetricsAfterWithdraw(block);
    graph_ts_1.log.info("[Withdraw] vault: {}, sharesBurnt: {}, withdrawalFee: {}, withdrawalFeeUSD: {}, withdrawAmount: {}, withdrawAmountUSD: {}, outputTokenPriceUSD: {}, TxnHash: {}", [
        vaultAddress.toHexString(),
        sharesBurnt.toString(),
        withdrawalFee.toString(),
        withdrawalFeeUSD.toString(),
        withdrawAmount.toString(),
        withdrawAmountUSD.toString(),
        vault.outputTokenPriceUSD.toString(),
        transaction.hash.toHexString(),
    ]);
}
exports.Withdraw = Withdraw;
