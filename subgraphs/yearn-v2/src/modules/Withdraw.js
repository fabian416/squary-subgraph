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
exports._Withdraw = exports.calculateAmountWithdrawn = exports.calculateSharesBurnt = exports.createWithdrawTransaction = void 0;
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const Prices_1 = require("../Prices");
const constants = __importStar(require("../common/constants"));
const Price_1 = require("./Price");
const Vault_1 = require("../../generated/Registry_v1/Vault");
function createWithdrawTransaction(to, vaultAddress, transaction, block, assetId, amount, amountUSD) {
    const withdrawTransactionId = "withdraw-" + transaction.hash.toHexString();
    let withdrawTransaction = schema_1.Withdraw.load(withdrawTransactionId);
    if (!withdrawTransaction) {
        withdrawTransaction = new schema_1.Withdraw(withdrawTransactionId);
        withdrawTransaction.vault = vaultAddress.toHexString();
        withdrawTransaction.protocol = constants.PROTOCOL_ID;
        withdrawTransaction.to = to.toHexString();
        withdrawTransaction.from = transaction.from.toHexString();
        withdrawTransaction.hash = transaction.hash.toHexString();
        // log index is zero cause no events are emitted on vault withdraw
        withdrawTransaction.logIndex = 0;
        withdrawTransaction.asset = assetId;
        withdrawTransaction.amount = amount;
        withdrawTransaction.amountUSD = amountUSD;
        withdrawTransaction.timestamp = block.timestamp;
        withdrawTransaction.blockNumber = block.number;
        withdrawTransaction.save();
    }
    return withdrawTransaction;
}
exports.createWithdrawTransaction = createWithdrawTransaction;
function calculateSharesBurnt(vaultAddress, withdrawAmount) {
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    const totalAssets = utils.readValue(vaultContract.try_totalAssets(), constants.BIGINT_ZERO);
    const totalSupply = utils.readValue(vaultContract.try_totalSupply(), constants.BIGINT_ZERO);
    const sharesBurnt = totalAssets.equals(constants.BIGINT_ZERO)
        ? withdrawAmount
        : withdrawAmount.times(totalSupply).div(totalAssets);
    return sharesBurnt;
}
exports.calculateSharesBurnt = calculateSharesBurnt;
function calculateAmountWithdrawn(vaultAddress, sharesBurnt) {
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    const totalAssets = utils.readValue(vaultContract.try_totalAssets(), constants.BIGINT_ZERO);
    const totalSupply = utils.readValue(vaultContract.try_totalSupply(), constants.BIGINT_ZERO);
    const amount = totalSupply.isZero()
        ? constants.BIGINT_ZERO
        : sharesBurnt.times(totalAssets).div(totalSupply);
    return amount;
}
exports.calculateAmountWithdrawn = calculateAmountWithdrawn;
function _Withdraw(to, transaction, block, vault, withdrawAmount, sharesBurnt) {
    const vaultAddress = graph_ts_1.Address.fromString(vault.id);
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
    if (sharesBurnt.toString() == "-1" ||
        sharesBurnt.toString() == constants.MAX_UINT256_STR) {
        sharesBurnt = calculateSharesBurnt(vaultAddress, withdrawAmount);
        graph_ts_1.log.info("[Withdraw_Shares_MAX_UINT] TxHash: {}, vaultAddress: {}, _sharesBurnt: {}, _withdrawAmount: {}", [
            transaction.hash.toHexString(),
            vault.id,
            sharesBurnt.toString(),
            withdrawAmount.toString(),
        ]);
    }
    if (withdrawAmount.toString() == "-1" ||
        withdrawAmount.toString() == constants.MAX_UINT256_STR) {
        withdrawAmount = calculateAmountWithdrawn(vaultAddress, sharesBurnt);
        graph_ts_1.log.info("[Withdraw_Amount_MAX_UINT] TxHash: {}, vaultAddress: {}, _sharesBurnt: {}, _withdrawAmount: {}", [
            transaction.hash.toHexString(),
            vault.id,
            sharesBurnt.toString(),
            withdrawAmount.toString(),
        ]);
    }
    const inputToken = schema_1.Token.load(vault.inputToken);
    const inputTokenAddress = graph_ts_1.Address.fromString(vault.inputToken);
    const inputTokenPrice = (0, Prices_1.getUsdPricePerToken)(inputTokenAddress);
    const inputTokenDecimals = constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal();
    const withdrawAmountUSD = withdrawAmount
        .toBigDecimal()
        .div(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    const totalSupply = utils.readValue(vaultContract.try_totalSupply(), constants.BIGINT_ZERO);
    vault.outputTokenSupply = totalSupply;
    const totalAssets = utils.readValue(vaultContract.try_totalAssets(), constants.BIGINT_ZERO);
    vault.inputTokenBalance = totalAssets;
    vault.totalValueLockedUSD = vault.inputTokenBalance
        .toBigDecimal()
        .div(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    vault.outputTokenPriceUSD = (0, Price_1.getPriceOfOutputTokens)(vaultAddress, inputTokenAddress, inputTokenDecimals);
    vault.pricePerShare = utils
        .readValue(vaultContract.try_pricePerShare(), constants.BIGINT_ZERO)
        .toBigDecimal();
    vault.totalAssets = vault.totalAssets.minus(withdrawAmount);
    vault.save();
    createWithdrawTransaction(to, vaultAddress, transaction, block, vault.inputToken, withdrawAmount, withdrawAmountUSD);
    // Update hourly and daily withdraw transaction count
    const metricsDailySnapshot = (0, initializers_1.getOrCreateUsageMetricsDailySnapshot)(block);
    const metricsHourlySnapshot = (0, initializers_1.getOrCreateUsageMetricsHourlySnapshot)(block);
    metricsDailySnapshot.dailyWithdrawCount += 1;
    metricsHourlySnapshot.hourlyWithdrawCount += 1;
    metricsDailySnapshot.save();
    metricsHourlySnapshot.save();
    protocol.save();
    utils.updateProtocolTotalValueLockedUSD();
    graph_ts_1.log.info("[Withdrawn] TxHash: {}, vaultAddress: {}, _sharesBurnt: {}, _withdrawAmount: {}", [
        transaction.hash.toHexString(),
        vault.id,
        sharesBurnt.toString(),
        withdrawAmount.toString(),
    ]);
}
exports._Withdraw = _Withdraw;
