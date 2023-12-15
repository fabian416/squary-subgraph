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
exports.updateVaultSnapshotsAfterReport = exports.updateFinancialsAfterReport = exports._StrategyHarvested = void 0;
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const Prices_1 = require("../Prices");
const constants = __importStar(require("../common/constants"));
const Strategy_1 = require("../../generated/templates/Strategy/Strategy");
function _StrategyHarvested(strategyAddress, vault, wantEarned, block, transaction) {
    const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
    const inputToken = schema_1.Token.load(vault.inputToken);
    const inputTokenAddress = graph_ts_1.Address.fromString(vault.inputToken);
    const inputTokenPrice = (0, Prices_1.getUsdPricePerToken)(inputTokenAddress);
    const inputTokenDecimals = constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal();
    // load performance fee and get the fees percentage
    const performanceFee = utils.readValue(strategyContract.try_performanceFee(), constants.BIGINT_ZERO);
    const supplySideWantEarned = wantEarned
        .times(constants.BIGINT_HUNDRED.minus(performanceFee.div(constants.BIGINT_HUNDRED)))
        .div(constants.BIGINT_HUNDRED);
    const supplySideWantEarnedUSD = supplySideWantEarned
        .toBigDecimal()
        .div(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    const protocolSideWantEarned = wantEarned
        .times(performanceFee.div(constants.BIGINT_HUNDRED))
        .div(constants.BIGINT_HUNDRED);
    const protocolSideWantEarnedUSD = protocolSideWantEarned
        .toBigDecimal()
        .div(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    const totalRevenueUSD = supplySideWantEarnedUSD.plus(protocolSideWantEarnedUSD);
    vault.inputTokenBalance = vault.inputTokenBalance.plus(supplySideWantEarned);
    vault.cumulativeSupplySideRevenueUSD =
        vault.cumulativeSupplySideRevenueUSD.plus(supplySideWantEarnedUSD);
    vault.cumulativeProtocolSideRevenueUSD =
        vault.cumulativeProtocolSideRevenueUSD.plus(protocolSideWantEarnedUSD);
    vault.cumulativeTotalRevenueUSD =
        vault.cumulativeTotalRevenueUSD.plus(totalRevenueUSD);
    vault.save();
    updateFinancialsAfterReport(block, totalRevenueUSD, supplySideWantEarnedUSD, protocolSideWantEarnedUSD);
    updateVaultSnapshotsAfterReport(vault, block, totalRevenueUSD, supplySideWantEarnedUSD, protocolSideWantEarnedUSD);
    graph_ts_1.log.warning("[Harvested] vault: {}, Strategy: {}, supplySideWantEarned: {}, protocolSideWantEarned: {}, inputToken: {}, totalRevenueUSD: {}, TxHash: {}", [
        vault.id,
        strategyAddress.toHexString(),
        supplySideWantEarned.toString(),
        protocolSideWantEarned.toString(),
        inputTokenAddress.toHexString(),
        totalRevenueUSD.toString(),
        transaction.hash.toHexString(),
    ]);
}
exports._StrategyHarvested = _StrategyHarvested;
function updateFinancialsAfterReport(block, totalRevenueUSD, supplySideRevenueUSD, protocolSideRevenueUSD) {
    const financialMetrics = (0, initializers_1.getOrCreateFinancialDailySnapshots)(block);
    const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
    // TotalRevenueUSD Metrics
    financialMetrics.dailyTotalRevenueUSD =
        financialMetrics.dailyTotalRevenueUSD.plus(totalRevenueUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(totalRevenueUSD);
    financialMetrics.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    // SupplySideRevenueUSD Metrics
    financialMetrics.dailySupplySideRevenueUSD =
        financialMetrics.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
    financialMetrics.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
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
exports.updateFinancialsAfterReport = updateFinancialsAfterReport;
function updateVaultSnapshotsAfterReport(vault, block, totalRevenueUSD, supplySideRevenueUSD, protocolSideRevenueUSD) {
    const vaultDailySnapshot = (0, initializers_1.getOrCreateVaultsDailySnapshots)(vault, block);
    const vaultHourlySnapshot = (0, initializers_1.getOrCreateVaultsHourlySnapshots)(vault, block);
    vaultDailySnapshot.cumulativeSupplySideRevenueUSD =
        vault.cumulativeSupplySideRevenueUSD;
    vaultDailySnapshot.dailySupplySideRevenueUSD =
        vaultDailySnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
    vaultDailySnapshot.cumulativeProtocolSideRevenueUSD =
        vault.cumulativeProtocolSideRevenueUSD;
    vaultDailySnapshot.dailyProtocolSideRevenueUSD =
        vaultDailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    vaultDailySnapshot.cumulativeTotalRevenueUSD =
        vault.cumulativeTotalRevenueUSD;
    vaultDailySnapshot.dailyTotalRevenueUSD =
        vaultDailySnapshot.dailyTotalRevenueUSD.plus(totalRevenueUSD);
    vaultHourlySnapshot.cumulativeSupplySideRevenueUSD =
        vault.cumulativeSupplySideRevenueUSD;
    vaultHourlySnapshot.hourlySupplySideRevenueUSD =
        vaultHourlySnapshot.hourlySupplySideRevenueUSD.plus(supplySideRevenueUSD);
    vaultHourlySnapshot.cumulativeProtocolSideRevenueUSD =
        vault.cumulativeProtocolSideRevenueUSD;
    vaultHourlySnapshot.hourlyProtocolSideRevenueUSD =
        vaultHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    vaultHourlySnapshot.cumulativeTotalRevenueUSD =
        vault.cumulativeTotalRevenueUSD;
    vaultHourlySnapshot.hourlyTotalRevenueUSD =
        vaultHourlySnapshot.hourlyTotalRevenueUSD.plus(totalRevenueUSD);
    vaultHourlySnapshot.save();
    vaultDailySnapshot.save();
}
exports.updateVaultSnapshotsAfterReport = updateVaultSnapshotsAfterReport;
