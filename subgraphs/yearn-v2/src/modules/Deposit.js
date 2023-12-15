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
exports._Deposit = exports.calculateAmountDeposited = exports.createDepositTransaction = void 0;
const schema_1 = require("../../generated/schema");
const initializers_1 = require("../common/initializers");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const utils = __importStar(require("../common/utils"));
const Prices_1 = require("../Prices");
const Price_1 = require("./Price");
const constants = __importStar(require("../common/constants"));
const Vault_1 = require("../../generated/Registry_v1/Vault");
function createDepositTransaction(to, vaultAddress, transaction, block, assetId, amount, amountUSD) {
    const transactionId = "deposit-" + transaction.hash.toHexString();
    let depositTransaction = schema_1.Deposit.load(transactionId);
    if (!depositTransaction) {
        depositTransaction = new schema_1.Deposit(transactionId);
        depositTransaction.vault = vaultAddress.toHexString();
        depositTransaction.protocol = constants.PROTOCOL_ID;
        depositTransaction.to = to.toHexString();
        depositTransaction.from = transaction.from.toHexString();
        depositTransaction.hash = transaction.hash.toHexString();
        // log index is zero cause no events are emitted on vault deposit
        depositTransaction.logIndex = 0;
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
function calculateAmountDeposited(vaultAddress, sharesMinted) {
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    const totalAssets = utils.readValue(vaultContract.try_totalAssets(), constants.BIGINT_ZERO);
    const totalSupply = utils.readValue(vaultContract.try_totalSupply(), constants.BIGINT_ZERO);
    const amount = totalSupply.isZero()
        ? constants.BIGINT_ZERO
        : sharesMinted.times(totalAssets).div(totalSupply);
    return amount;
}
exports.calculateAmountDeposited = calculateAmountDeposited;
function _Deposit(to, transaction, block, vault, sharesMinted, depositAmount) {
    const vaultAddress = graph_ts_1.Address.fromString(vault.id);
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
    if (depositAmount.toString() == "-1" ||
        depositAmount.toString() == constants.MAX_UINT256_STR) {
        depositAmount = calculateAmountDeposited(vaultAddress, sharesMinted);
        graph_ts_1.log.info("[Deposit_MAX_UINT] TxHash: {}, vaultAddress: {}, _sharesMinted: {}, _depositAmount: {}", [
            transaction.hash.toHexString(),
            vault.id,
            sharesMinted.toString(),
            depositAmount.toString(),
        ]);
    }
    const inputToken = schema_1.Token.load(vault.inputToken);
    const inputTokenAddress = graph_ts_1.Address.fromString(vault.inputToken);
    const inputTokenPrice = (0, Prices_1.getUsdPricePerToken)(inputTokenAddress);
    const inputTokenDecimals = constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal();
    const depositAmountUSD = depositAmount
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
    vault.totalAssets = vault.totalAssets.plus(depositAmount);
    vault.save();
    createDepositTransaction(to, vaultAddress, transaction, block, vault.inputToken, depositAmount, depositAmountUSD);
    // Update hourly and daily deposit transaction count
    const metricsDailySnapshot = (0, initializers_1.getOrCreateUsageMetricsDailySnapshot)(block);
    const metricsHourlySnapshot = (0, initializers_1.getOrCreateUsageMetricsHourlySnapshot)(block);
    metricsDailySnapshot.dailyDepositCount += 1;
    metricsHourlySnapshot.hourlyDepositCount += 1;
    metricsDailySnapshot.save();
    metricsHourlySnapshot.save();
    protocol.save();
    utils.updateProtocolTotalValueLockedUSD();
    graph_ts_1.log.info("[Deposit] TxHash: {}, vaultAddress: {}, _sharesMinted: {}, _depositAmount: {}", [
        transaction.hash.toHexString(),
        vault.id,
        sharesMinted.toString(),
        depositAmount.toString(),
    ]);
}
exports._Deposit = _Deposit;
