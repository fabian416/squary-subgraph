"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRevenue = exports.updateFinancials = exports.updateUsageMetrics = exports.updatePoolMetrics = void 0;
const constants_1 = require("./constants");
const getters_1 = require("./getters");
const schema_1 = require("../../generated/schema");
// Update Pool Snapshots entities
function updatePoolMetrics(poolAddress, event) {
    const poolMetricsDaily = (0, getters_1.getOrCreatePoolDailySnapshot)(event);
    const poolMetricsHourly = (0, getters_1.getOrCreatePoolHourlySnapshot)(event);
    const pool = (0, getters_1.getOrCreatePool)(poolAddress, event);
    poolMetricsDaily.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetricsDaily.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetricsDaily.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetricsDaily.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolMetricsDaily.inputTokenBalances = pool.inputTokenBalances;
    poolMetricsDaily.inputTokenBalancesUSD = pool.inputTokenBalancesUSD;
    poolMetricsDaily.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
    poolMetricsDaily.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    poolMetricsDaily.blockNumber = event.block.number;
    poolMetricsDaily.timestamp = event.block.timestamp;
    poolMetricsHourly.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetricsHourly.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetricsHourly.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetricsHourly.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolMetricsHourly.inputTokenBalances = pool.inputTokenBalances;
    poolMetricsHourly.inputTokenBalancesUSD = pool.inputTokenBalancesUSD;
    poolMetricsHourly.rewardTokenEmissionsAmount =
        pool.rewardTokenEmissionsAmount;
    poolMetricsHourly.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    poolMetricsHourly.blockNumber = event.block.number;
    poolMetricsHourly.timestamp = event.block.timestamp;
    poolMetricsDaily.save();
    poolMetricsHourly.save();
}
exports.updatePoolMetrics = updatePoolMetrics;
// Update usage metrics entities
function updateUsageMetrics(event) {
    const from = event.transaction.from.toHexString();
    const usageMetricsDaily = (0, getters_1.getOrCreateUsageMetricDailySnapshot)(event);
    const usageMetricsHourly = (0, getters_1.getOrCreateUsageMetricHourlySnapshot)(event);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    // Update the block number and timestamp to that of the last transaction of that day
    usageMetricsDaily.blockNumber = event.block.number;
    usageMetricsDaily.timestamp = event.block.timestamp;
    usageMetricsDaily.dailyTransactionCount += constants_1.INT_ONE;
    usageMetricsHourly.blockNumber = event.block.number;
    usageMetricsHourly.timestamp = event.block.timestamp;
    usageMetricsHourly.hourlyTransactionCount += constants_1.INT_ONE;
    // Number of days since Unix epoch
    const day = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const hour = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const dayId = day.toString();
    const hourId = hour.toString();
    // Combine the id and the user address to generate a unique user id for the day
    const dailyActiveAccountId = from.concat("-").concat(dayId);
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        usageMetricsDaily.dailyActiveUsers += constants_1.INT_ONE;
        dailyActiveAccount.save();
    }
    const hourlyActiveAccountId = from.concat("-").concat(hourId);
    let hourlyActiveAccount = schema_1.ActiveAccount.load(hourlyActiveAccountId);
    if (!hourlyActiveAccount) {
        hourlyActiveAccount = new schema_1.ActiveAccount(hourlyActiveAccountId);
        usageMetricsHourly.hourlyActiveUsers += constants_1.INT_ONE;
        hourlyActiveAccount.save();
    }
    let account = schema_1.Account.load(from);
    if (!account) {
        account = new schema_1.Account(from);
        protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
        account.save();
    }
    usageMetricsDaily.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsHourly.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsDaily.totalPoolCount = protocol.totalPoolCount;
    usageMetricsDaily.save();
    usageMetricsHourly.save();
    protocol.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
// Update FinancialsDailySnapshots entity
function updateFinancials(event) {
    const financialMetricsDaily = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const pools = protocol.pools;
    let tvl = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < pools.length; i++) {
        const pool = (0, getters_1.getOrCreatePool)(pools[i], event);
        tvl = tvl.plus(pool.totalValueLockedUSD);
    }
    protocol.totalValueLockedUSD = tvl;
    financialMetricsDaily.blockNumber = event.block.number;
    financialMetricsDaily.timestamp = event.block.timestamp;
    financialMetricsDaily.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialMetricsDaily.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialMetricsDaily.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialMetricsDaily.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    financialMetricsDaily.save();
    protocol.save();
}
exports.updateFinancials = updateFinancials;
function updateRevenue(event, poolAddress, relayerFeeUsd, protocolFeeUsd) {
    const pool = (0, getters_1.getOrCreatePool)(poolAddress, event);
    pool.cumulativeTotalRevenueUSD =
        pool.cumulativeTotalRevenueUSD.plus(relayerFeeUsd);
    pool.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD.plus(protocolFeeUsd);
    pool.cumulativeSupplySideRevenueUSD = pool.cumulativeTotalRevenueUSD.minus(pool.cumulativeProtocolSideRevenueUSD);
    pool.save();
    const poolMetricsDaily = (0, getters_1.getOrCreatePoolDailySnapshot)(event);
    poolMetricsDaily.dailyTotalRevenueUSD =
        poolMetricsDaily.dailyTotalRevenueUSD.plus(relayerFeeUsd);
    poolMetricsDaily.dailyProtocolSideRevenueUSD =
        poolMetricsDaily.dailyProtocolSideRevenueUSD.plus(protocolFeeUsd);
    poolMetricsDaily.dailySupplySideRevenueUSD =
        poolMetricsDaily.dailyTotalRevenueUSD.minus(poolMetricsDaily.dailyProtocolSideRevenueUSD);
    poolMetricsDaily.save();
    const poolMetricsHourly = (0, getters_1.getOrCreatePoolHourlySnapshot)(event);
    poolMetricsHourly.hourlyTotalRevenueUSD =
        poolMetricsHourly.hourlyTotalRevenueUSD.plus(relayerFeeUsd);
    poolMetricsHourly.hourlyProtocolSideRevenueUSD =
        poolMetricsHourly.hourlyProtocolSideRevenueUSD.plus(protocolFeeUsd);
    poolMetricsHourly.hourlySupplySideRevenueUSD =
        poolMetricsHourly.hourlyTotalRevenueUSD.minus(poolMetricsHourly.hourlyProtocolSideRevenueUSD);
    poolMetricsHourly.save();
    const protocol = (0, getters_1.getOrCreateProtocol)();
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(relayerFeeUsd);
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(protocolFeeUsd);
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.minus(protocol.cumulativeProtocolSideRevenueUSD);
    protocol.save();
    const financialMetricsDaily = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    financialMetricsDaily.dailyTotalRevenueUSD =
        financialMetricsDaily.dailyTotalRevenueUSD.plus(relayerFeeUsd);
    financialMetricsDaily.dailyProtocolSideRevenueUSD =
        financialMetricsDaily.dailyProtocolSideRevenueUSD.plus(protocolFeeUsd);
    financialMetricsDaily.dailySupplySideRevenueUSD =
        financialMetricsDaily.dailyTotalRevenueUSD.minus(financialMetricsDaily.dailyProtocolSideRevenueUSD);
    financialMetricsDaily.save();
}
exports.updateRevenue = updateRevenue;
