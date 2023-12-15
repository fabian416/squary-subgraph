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
exports.updateFinancialsAfterWithdrawal = exports._Withdraw = exports.createWithdrawTransaction = void 0;
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const Prices_1 = require("../Prices");
const constants = __importStar(require("../common/constants"));
const Price_1 = require("./Price");
const Vault_1 = require("../../generated/Controller/Vault");
const Strategy_1 = require("../../generated/Controller/Strategy");
const StableMaster_1 = require("../../generated/Controller/StableMaster");
function createWithdrawTransaction(to, vaultAddress, transaction, block, assetId, amount, amountUSD) {
    const withdrawTransactionId = "withdraw-" + transaction.hash.toHexString();
    let withdrawTransaction = schema_1.Withdraw.load(withdrawTransactionId);
    if (!withdrawTransaction) {
        withdrawTransaction = new schema_1.Withdraw(withdrawTransactionId);
        withdrawTransaction.vault = vaultAddress.toHexString();
        withdrawTransaction.protocol = constants.ETHEREUM_PROTOCOL_ID;
        withdrawTransaction.to = to.toHexString();
        withdrawTransaction.from = transaction.from.toHexString();
        withdrawTransaction.hash = transaction.hash.toHexString();
        withdrawTransaction.logIndex = transaction.index.toI32();
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
function _Withdraw(to, transaction, block, vault, sharesBurnt) {
    const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
    const vaultAddress = graph_ts_1.Address.fromString(vault.id);
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    const strategyAddress = graph_ts_1.Address.fromString(vault._strategy);
    const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
    let withdrawAmount;
    if (vaultAddress.equals(constants.ANGLE_USDC_VAULT_ADDRESS)) {
        const stableMasterContract = StableMaster_1.StableMaster.bind(constants.STABLE_MASTER_ADDRESS);
        const collateralMap = stableMasterContract.collateralMap(constants.POOL_MANAGER_ADDRESS);
        const sanRate = collateralMap.value5;
        const slpDataSlippage = collateralMap.value7.slippage;
        // StableMasterFront: (amount * (BASE_PARAMS - col.slpData.slippage) * col.sanRate) / (BASE_TOKENS * BASE_PARAMS)
        withdrawAmount = sharesBurnt
            .times(constants.BASE_PARAMS.minus(slpDataSlippage))
            .times(sanRate)
            .div(constants.BASE_TOKENS.times(constants.BASE_PARAMS));
    }
    else {
        // calculate withdraw amount as per the withdraw function in vault
        // contract address
        withdrawAmount = vault.inputTokenBalance
            .times(sharesBurnt)
            .div(vault.outputTokenSupply);
    }
    const inputToken = schema_1.Token.load(vault.inputToken);
    const inputTokenAddress = graph_ts_1.Address.fromString(vault.inputToken);
    const inputTokenPrice = (0, Prices_1.getUsdPricePerToken)(inputTokenAddress);
    const inputTokenDecimals = constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal();
    vault.inputTokenBalance = vault.inputTokenBalance.minus(withdrawAmount);
    vault.outputTokenSupply = vault.outputTokenSupply.minus(sharesBurnt);
    const withdrawalFees = utils
        .readValue(strategyContract.try_withdrawalFee(), constants.BIGINT_ZERO)
        .toBigDecimal()
        .div(constants.DENOMINATOR);
    const protocolSideWithdrawalAmount = withdrawAmount
        .toBigDecimal()
        .times(withdrawalFees)
        .div(inputTokenDecimals);
    const supplySideWithdrawalAmount = withdrawAmount
        .toBigDecimal()
        .div(inputTokenDecimals)
        .minus(protocolSideWithdrawalAmount);
    const withdrawAmountUSD = supplySideWithdrawalAmount
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    vault.totalValueLockedUSD = vault.inputTokenBalance
        .toBigDecimal()
        .div(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    vault.outputTokenPriceUSD = (0, Price_1.getPriceOfOutputTokens)(vaultAddress, inputTokenAddress, inputTokenDecimals);
    vault.pricePerShare = utils
        .readValue(vaultContract.try_getPricePerFullShare(), constants.BIGINT_ZERO)
        .toBigDecimal();
    const protocolSideWithdrawalAmountUSD = protocolSideWithdrawalAmount
        .div(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    // Update hourly and daily withdraw transaction count
    const metricsDailySnapshot = (0, initializers_1.getOrCreateUsageMetricsDailySnapshot)(block);
    const metricsHourlySnapshot = (0, initializers_1.getOrCreateUsageMetricsHourlySnapshot)(block);
    metricsDailySnapshot.dailyWithdrawCount += 1;
    metricsHourlySnapshot.hourlyWithdrawCount += 1;
    metricsDailySnapshot.save();
    metricsHourlySnapshot.save();
    protocol.save();
    vault.save();
    utils.updateProtocolTotalValueLockedUSD();
    createWithdrawTransaction(to, vaultAddress, transaction, block, vault.inputToken, withdrawAmount, withdrawAmountUSD);
    updateFinancialsAfterWithdrawal(block, protocolSideWithdrawalAmountUSD);
    graph_ts_1.log.warning("[Withdrawn] TxHash: {}, vaultAddress: {}, withdrawAmount: {}, sharesBurnt: {}, supplySideWithdrawAmount: {}, protocolSideWithdrawAmount: {}", [
        transaction.hash.toHexString(),
        vault.id,
        withdrawAmount.toString(),
        sharesBurnt.toString(),
        supplySideWithdrawalAmount.toString(),
        protocolSideWithdrawalAmount.toString(),
    ]);
}
exports._Withdraw = _Withdraw;
function updateFinancialsAfterWithdrawal(block, protocolSideRevenueUSD) {
    const financialMetrics = (0, initializers_1.getOrCreateFinancialDailySnapshots)(block);
    const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
    // TotalRevenueUSD Metrics
    financialMetrics.dailyTotalRevenueUSD =
        financialMetrics.dailyTotalRevenueUSD.plus(protocolSideRevenueUSD);
    protocol.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD.plus(protocolSideRevenueUSD);
    financialMetrics.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    // ProtocolSideRevenueUSD Metrics
    financialMetrics.dailyProtocolSideRevenueUSD =
        financialMetrics.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    financialMetrics.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialMetrics.save();
    protocol.save();
}
exports.updateFinancialsAfterWithdrawal = updateFinancialsAfterWithdrawal;
