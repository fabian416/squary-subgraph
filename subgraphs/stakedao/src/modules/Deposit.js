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
exports._Deposit = exports.createDepositTransaction = void 0;
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const Prices_1 = require("../Prices");
const Price_1 = require("./Price");
const constants = __importStar(require("../common/constants"));
const Vault_1 = require("../../generated/Controller/Vault");
function createDepositTransaction(to, vaultAddress, transaction, block, assetId, amount, amountUSD) {
    let transactionId = "deposit-" + transaction.hash.toHexString();
    let depositTransaction = schema_1.Deposit.load(transactionId);
    if (!depositTransaction) {
        depositTransaction = new schema_1.Deposit(transactionId);
        depositTransaction.vault = vaultAddress.toHexString();
        depositTransaction.protocol = constants.ETHEREUM_PROTOCOL_ID;
        depositTransaction.to = to.toHexString();
        depositTransaction.from = transaction.from.toHexString();
        depositTransaction.hash = transaction.hash.toHexString();
        depositTransaction.logIndex = transaction.index.toI32();
        depositTransaction.asset = assetId;
        depositTransaction.amount = amount;
        depositTransaction.amountUSD = amountUSD;
        depositTransaction.timestamp = block.timestamp;
        depositTransaction.blockNumber = block.number;
        depositTransaction.save();
    }
    return depositTransaction;
}
exports.createDepositTransaction = createDepositTransaction;
function _Deposit(to, transaction, block, vault, depositAmount) {
    const vaultAddress = graph_ts_1.Address.fromString(vault.id);
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
    let sharesMinted;
    if (vaultAddress.equals(constants.ANGLE_USDC_VAULT_ADDRESS)) {
        sharesMinted = utils
            .readValue(vaultContract.try_totalSupply(), constants.BIGINT_ZERO)
            .minus(vault.outputTokenSupply);
    }
    else {
        // calculate shares minted as per the deposit function in vault contract address
        sharesMinted = vault.outputTokenSupply.isZero()
            ? depositAmount
            : depositAmount
                .times(vault.outputTokenSupply)
                .div(vault.inputTokenBalance);
    }
    let inputToken = schema_1.Token.load(vault.inputToken);
    let inputTokenAddress = graph_ts_1.Address.fromString(vault.inputToken);
    let inputTokenPrice = (0, Prices_1.getUsdPricePerToken)(inputTokenAddress);
    let inputTokenDecimals = constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal();
    let depositAmountUSD = depositAmount
        .toBigDecimal()
        .div(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    vault.inputTokenBalance = vault.inputTokenBalance.plus(depositAmount);
    vault.outputTokenSupply = vault.outputTokenSupply.plus(sharesMinted);
    vault.totalValueLockedUSD = vault.inputTokenBalance
        .toBigDecimal()
        .div(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    vault.outputTokenPriceUSD = (0, Price_1.getPriceOfOutputTokens)(vaultAddress, inputTokenAddress, inputTokenDecimals);
    vault.pricePerShare = utils
        .readValue(vaultContract.try_getPricePerFullShare(), constants.BIGINT_ZERO)
        .toBigDecimal();
    // Update hourly and daily deposit transaction count
    const metricsDailySnapshot = (0, initializers_1.getOrCreateUsageMetricsDailySnapshot)(block);
    const metricsHourlySnapshot = (0, initializers_1.getOrCreateUsageMetricsHourlySnapshot)(block);
    metricsDailySnapshot.dailyDepositCount += 1;
    metricsHourlySnapshot.hourlyDepositCount += 1;
    metricsDailySnapshot.save();
    metricsHourlySnapshot.save();
    protocol.save();
    vault.save();
    utils.updateProtocolTotalValueLockedUSD();
    createDepositTransaction(to, vaultAddress, transaction, block, vault.inputToken, depositAmount, depositAmountUSD);
    graph_ts_1.log.warning("[Deposit] TxHash: {}, vaultAddress: {}, _sharesMinted: {}, _depositAmount: {}", [
        transaction.hash.toHexString(),
        vault.id,
        sharesMinted.toString(),
        depositAmount.toString(),
    ]);
}
exports._Deposit = _Deposit;
