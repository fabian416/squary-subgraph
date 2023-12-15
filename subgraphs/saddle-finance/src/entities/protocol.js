"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementProtocolTotalPoolCount = exports.updateProtocolTVL = exports.addProtocolUSDRevenue = exports.addProtocolUSDVolume = exports.incrementProtocolSwapCount = exports.incrementProtocolWithdrawCount = exports.incrementProtocolDepositCount = exports.getOrCreateFinancialsSnapshot = exports.updateUsageMetrics = exports.getOrCreateUsageMetricsHourlySnapshot = exports.getOrCreateUsageMetricsSnapshot = exports.getOrCreateProtocol = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const versions_1 = require("../versions");
const pool_1 = require("./pool");
function getOrCreateProtocol() {
    let protocol = schema_1.DexAmmProtocol.load(constants_1.DEPLOYER_ADDRESS);
    if (!protocol) {
        protocol = new schema_1.DexAmmProtocol(constants_1.DEPLOYER_ADDRESS);
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = graph_ts_1.dataSource.network().toUpperCase().replace("-", "_");
        protocol.type = constants_1.ProtocolType.EXCHANGE;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.totalPoolCount = constants_1.INT_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
function getOrCreateUsageMetricsSnapshot(event) {
    // Number of days since Unix epoch
    const id = `${event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY}`;
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id);
    if (!usageMetrics) {
        const protocol = getOrCreateProtocol();
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id);
        usageMetrics.protocol = protocol.id;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.totalPoolCount = protocol.totalPoolCount;
        usageMetrics.dailyActiveUsers = 0;
        usageMetrics.dailyTransactionCount = 0;
        usageMetrics.dailyDepositCount = 0;
        usageMetrics.dailyWithdrawCount = 0;
        usageMetrics.dailySwapCount = 0;
    }
    usageMetrics.blockNumber = event.block.number;
    usageMetrics.timestamp = event.block.timestamp;
    return usageMetrics;
}
exports.getOrCreateUsageMetricsSnapshot = getOrCreateUsageMetricsSnapshot;
function getOrCreateUsageMetricsHourlySnapshot(event) {
    const timestamp = event.block.timestamp.toI64();
    const hours = timestamp / constants_1.SECONDS_PER_HOUR;
    // Number of hours since Unix epoch
    const id = `${hours}`;
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(id);
    if (!usageMetrics) {
        const protocol = getOrCreateProtocol();
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(id);
        usageMetrics.protocol = protocol.id;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.hourlyActiveUsers = 0;
        usageMetrics.hourlyTransactionCount = 0;
        usageMetrics.hourlyDepositCount = 0;
        usageMetrics.hourlyWithdrawCount = 0;
        usageMetrics.hourlySwapCount = 0;
    }
    usageMetrics.blockNumber = event.block.number;
    usageMetrics.timestamp = event.block.timestamp;
    return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot;
function updateUsageMetrics(event, from) {
    const timestamp = event.block.timestamp.toI64();
    const day = `${timestamp / constants_1.SECONDS_PER_DAY}`;
    const hour = `${(timestamp % constants_1.SECONDS_PER_DAY) / constants_1.SECONDS_PER_HOUR}`;
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    const accountId = from.toHexString();
    let account = schema_1.Account.load(accountId);
    if (!account) {
        account = new schema_1.Account(accountId);
        account.save();
        const protocol = getOrCreateProtocol();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
        usageMetricsDailySnapshot.cumulativeUniqueUsers += 1;
        usageMetricsHourlySnapshot.cumulativeUniqueUsers += 1;
    }
    // Combine the id and the user address to generate a unique user id for the day
    const dailyActiveAccountId = `${accountId}-${day}`;
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        dailyActiveAccount.save();
        usageMetricsDailySnapshot.dailyActiveUsers += 1;
    }
    // Combine the id, user address and hour to generate a unique user id for the hour
    const hourlyActiveAccountId = `${accountId}-${day}-${hour}`;
    let hourlyActiveAccount = schema_1.ActiveAccount.load(hourlyActiveAccountId);
    if (!hourlyActiveAccount) {
        hourlyActiveAccount = new schema_1.ActiveAccount(hourlyActiveAccountId);
        hourlyActiveAccount.save();
        usageMetricsHourlySnapshot.hourlyActiveUsers += 1;
    }
    usageMetricsDailySnapshot.save();
    usageMetricsHourlySnapshot.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
function getOrCreateFinancialsSnapshot(event, protocol) {
    // Number of days since Unix epoch
    const id = `${event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY}`;
    let financialsSnapshot = schema_1.FinancialsDailySnapshot.load(id);
    if (!financialsSnapshot) {
        financialsSnapshot = new schema_1.FinancialsDailySnapshot(id);
        financialsSnapshot.protocol = protocol.id;
        financialsSnapshot.dailyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    }
    financialsSnapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialsSnapshot.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD;
    financialsSnapshot.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialsSnapshot.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialsSnapshot.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    financialsSnapshot.blockNumber = event.block.number;
    financialsSnapshot.timestamp = event.block.timestamp;
    return financialsSnapshot;
}
exports.getOrCreateFinancialsSnapshot = getOrCreateFinancialsSnapshot;
function incrementProtocolDepositCount(event) {
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    usageMetricsDailySnapshot.dailyDepositCount += 1;
    usageMetricsDailySnapshot.dailyTransactionCount += 1;
    usageMetricsDailySnapshot.save();
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    usageMetricsHourlySnapshot.hourlyDepositCount += 1;
    usageMetricsHourlySnapshot.hourlyTransactionCount += 1;
    usageMetricsHourlySnapshot.save();
}
exports.incrementProtocolDepositCount = incrementProtocolDepositCount;
function incrementProtocolWithdrawCount(event) {
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    usageMetricsDailySnapshot.dailyWithdrawCount += 1;
    usageMetricsDailySnapshot.dailyTransactionCount += 1;
    usageMetricsDailySnapshot.save();
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    usageMetricsHourlySnapshot.hourlyWithdrawCount += 1;
    usageMetricsHourlySnapshot.hourlyTransactionCount += 1;
    usageMetricsHourlySnapshot.save();
}
exports.incrementProtocolWithdrawCount = incrementProtocolWithdrawCount;
function incrementProtocolSwapCount(event) {
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    usageMetricsDailySnapshot.dailySwapCount += 1;
    usageMetricsDailySnapshot.dailyTransactionCount += 1;
    usageMetricsDailySnapshot.save();
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    usageMetricsHourlySnapshot.hourlySwapCount += 1;
    usageMetricsHourlySnapshot.hourlyTransactionCount += 1;
    usageMetricsHourlySnapshot.save();
}
exports.incrementProtocolSwapCount = incrementProtocolSwapCount;
function addProtocolUSDVolume(event, volumeUSD) {
    const protocol = getOrCreateProtocol();
    protocol.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD.plus(volumeUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyVolumeUSD =
        financialsSnapshot.dailyVolumeUSD.plus(volumeUSD);
    financialsSnapshot.save();
}
exports.addProtocolUSDVolume = addProtocolUSDVolume;
function addProtocolUSDRevenue(event, pool, supplySideRevenueUSD, protocolSideRevenueUSD) {
    const protocol = getOrCreateProtocol();
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(protocol.cumulativeProtocolSideRevenueUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailySupplySideRevenueUSD =
        financialsSnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
    financialsSnapshot.dailyProtocolSideRevenueUSD =
        financialsSnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    financialsSnapshot.dailyTotalRevenueUSD =
        financialsSnapshot.dailySupplySideRevenueUSD.plus(financialsSnapshot.dailyProtocolSideRevenueUSD);
    financialsSnapshot.save();
    pool.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
    pool.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    pool.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD.plus(supplySideRevenueUSD.plus(protocolSideRevenueUSD));
    pool.save();
    const poolDailySnapshot = (0, pool_1.getOrCreatePoolDailySnapshot)(event, pool);
    poolDailySnapshot.dailySupplySideRevenueUSD =
        poolDailySnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
    poolDailySnapshot.dailyProtocolSideRevenueUSD =
        poolDailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    poolDailySnapshot.dailyTotalRevenueUSD =
        poolDailySnapshot.dailyTotalRevenueUSD.plus(supplySideRevenueUSD.plus(protocolSideRevenueUSD));
    poolDailySnapshot.save();
    const poolHourlySnapshot = (0, pool_1.getOrCreatePoolHourlySnapshot)(event, pool);
    poolHourlySnapshot.hourlySupplySideRevenueUSD =
        poolHourlySnapshot.hourlySupplySideRevenueUSD.plus(supplySideRevenueUSD);
    poolHourlySnapshot.hourlyProtocolSideRevenueUSD =
        poolHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    poolHourlySnapshot.hourlyTotalRevenueUSD =
        poolHourlySnapshot.hourlyTotalRevenueUSD.plus(supplySideRevenueUSD.plus(protocolSideRevenueUSD));
    poolHourlySnapshot.save();
}
exports.addProtocolUSDRevenue = addProtocolUSDRevenue;
function updateProtocolTVL(event, tvlChange) {
    const protocol = getOrCreateProtocol();
    protocol.totalValueLockedUSD = protocol.totalValueLockedUSD.plus(tvlChange);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocolTVL = updateProtocolTVL;
function incrementProtocolTotalPoolCount() {
    const protocol = getOrCreateProtocol();
    protocol.totalPoolCount += 1;
    protocol.save();
}
exports.incrementProtocolTotalPoolCount = incrementProtocolTotalPoolCount;
