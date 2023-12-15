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
exports.updateFinancialsAfterRewardAdded = exports.updateRewardTokenEmission = void 0;
const constants = __importStar(require("../common/constants"));
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Gauge_1 = require("../../generated/templates/Gauge/Gauge");
const initializers_1 = require("../common/initializers");
function updateRewardTokenEmission(vaultAddress, gaugeAddress, rewardTokenIdx, rewardTokenAddress, rewardTokenDecimals, rewardTokenPricePerToken) {
    const vault = schema_1.Vault.load(vaultAddress.toHexString());
    if (!vault)
        return;
    const gaugeContract = Gauge_1.Gauge.bind(gaugeAddress);
    const rewardDataCall = gaugeContract.try_rewardData(rewardTokenAddress);
    if (rewardDataCall.reverted)
        return;
    const rewardRate = rewardDataCall.value.value3;
    const rewardEmissionRatePerDay = rewardRate.times(constants.BIGINT_SECONDS_PER_DAY);
    let rewardTokenEmissionsAmount = [constants.BIGINT_ZERO];
    if (vault.rewardTokenEmissionsAmount) {
        rewardTokenEmissionsAmount = vault.rewardTokenEmissionsAmount;
    }
    let rewardTokenEmissionsUSD = [constants.BIGDECIMAL_ZERO];
    if (vault.rewardTokenEmissionsUSD) {
        rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
    }
    rewardTokenEmissionsAmount[rewardTokenIdx] = rewardEmissionRatePerDay;
    rewardTokenEmissionsUSD[rewardTokenIdx] = rewardEmissionRatePerDay
        .toBigDecimal()
        .times(rewardTokenPricePerToken.usdPrice)
        .div(rewardTokenPricePerToken.decimalsBaseTen)
        .div(rewardTokenDecimals);
    vault.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
    vault.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
    vault.save();
    graph_ts_1.log.warning("[RewardTokenEmission] rewardEmissionRatePerDay: {}, rewardTokenEmissionsUSD: {}", [
        rewardEmissionRatePerDay.toString(),
        vault.rewardTokenEmissionsUSD[rewardTokenIdx].toString()
    ]);
}
exports.updateRewardTokenEmission = updateRewardTokenEmission;
function updateFinancialsAfterRewardAdded(block, totalRevenueUSD, supplySideRevenueUSD, protocolSideRevenueUSD) {
    const financialMetrics = (0, initializers_1.getOrCreateFinancialDailySnapshots)(block);
    const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
    // TotalRevenueUSD Metrics
    financialMetrics.dailyTotalRevenueUSD = financialMetrics.dailyTotalRevenueUSD.plus(totalRevenueUSD);
    protocol.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD.plus(totalRevenueUSD);
    financialMetrics.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    // SupplySideRevenueUSD Metrics
    financialMetrics.dailySupplySideRevenueUSD = financialMetrics.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
    protocol.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
    financialMetrics.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    // ProtocolSideRevenueUSD Metrics
    financialMetrics.dailyProtocolSideRevenueUSD = financialMetrics.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    protocol.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    financialMetrics.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialMetrics.save();
    protocol.save();
}
exports.updateFinancialsAfterRewardAdded = updateFinancialsAfterRewardAdded;
