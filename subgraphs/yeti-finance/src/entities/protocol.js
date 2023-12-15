"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProtocolBorrowBalance = exports.updateProtocolLockedUSD = exports.updateProtocolUSDLocked = exports.addProtocolLiquidateVolume = exports.incrementProtocolWithdrawCount = exports.incrementProtocolLiquidateCount = exports.incrementProtocolRepayCount = exports.addProtocolDepositVolume = exports.addProtocolBorrowVolume = exports.addSupplySideRevenue = exports.addProtocolSideRevenue = exports.updateUsageMetrics = exports.getOrCreateFinancialsSnapshot = exports.getOrCreateUsageMetricsHourlySnapshot = exports.getOrCreateUsageMetricsSnapshot = exports.getOrCreateYetiProtocol = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const versions_1 = require("../versions");
const token_1 = require("./token");
function getOrCreateYetiProtocol() {
    let protocol = schema_1.LendingProtocol.load(constants_1.TROVE_MANAGER);
    if (!protocol) {
        protocol = new schema_1.LendingProtocol(constants_1.TROVE_MANAGER);
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = constants_1.Network.AVALANCHE;
        protocol.type = constants_1.ProtocolType.LENDING;
        protocol.lendingType = constants_1.LendingType.CDP;
        protocol.riskType = constants_1.RiskType.ISOLATED;
        protocol.mintedTokens = [(0, token_1.getYUSDToken)().id];
        protocol.totalYUSDLocked = constants_1.BIGINT_ZERO;
        protocol.totalStablePoolAssetUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateYetiProtocol = getOrCreateYetiProtocol;
function getOrCreateUsageMetricsSnapshot(event) {
    // Number of days since Unix epoch
    const id = `${event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY}`;
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id);
    if (!usageMetrics) {
        const protocol = getOrCreateYetiProtocol();
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id);
        usageMetrics.protocol = protocol.id;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
        usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.dailyDepositCount = constants_1.INT_ZERO;
        usageMetrics.dailyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.dailyBorrowCount = constants_1.INT_ZERO;
        usageMetrics.dailyRepayCount = constants_1.INT_ZERO;
        usageMetrics.dailyLiquidateCount = constants_1.INT_ZERO;
    }
    usageMetrics.blockNumber = event.block.number;
    usageMetrics.timestamp = event.block.timestamp;
    return usageMetrics;
}
exports.getOrCreateUsageMetricsSnapshot = getOrCreateUsageMetricsSnapshot;
function getOrCreateUsageMetricsHourlySnapshot(event) {
    const timestamp = event.block.timestamp.toI64();
    const hour = timestamp / constants_1.SECONDS_PER_HOUR;
    const id = `${hour}`;
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(id);
    if (!usageMetrics) {
        const protocol = getOrCreateYetiProtocol();
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(id);
        usageMetrics.protocol = protocol.id;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.hourlyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.hourlyBorrowCount = constants_1.INT_ZERO;
        usageMetrics.hourlyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.hourlyDepositCount = constants_1.INT_ZERO;
        usageMetrics.hourlyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.hourlyRepayCount = constants_1.INT_ZERO;
        usageMetrics.hourlyLiquidateCount = constants_1.INT_ZERO;
    }
    usageMetrics.blockNumber = event.block.number;
    usageMetrics.timestamp = event.block.timestamp;
    return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot;
function getOrCreateFinancialsSnapshot(event, protocol) {
    // Number of days since Unix epoch
    const id = `${event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY}`;
    let financialsSnapshot = schema_1.FinancialsDailySnapshot.load(id);
    if (!financialsSnapshot) {
        financialsSnapshot = new schema_1.FinancialsDailySnapshot(id);
        financialsSnapshot.protocol = protocol.id;
        financialsSnapshot.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    }
    financialsSnapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialsSnapshot.mintedTokenSupplies = protocol.mintedTokenSupplies;
    financialsSnapshot.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialsSnapshot.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialsSnapshot.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    financialsSnapshot.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
    financialsSnapshot.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
    financialsSnapshot.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
    financialsSnapshot.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
    financialsSnapshot.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
    financialsSnapshot.blockNumber = event.block.number;
    financialsSnapshot.timestamp = event.block.timestamp;
    return financialsSnapshot;
}
exports.getOrCreateFinancialsSnapshot = getOrCreateFinancialsSnapshot;
// Keep track of cumulative unique users and daily/hourly active users
function updateUsageMetrics(event, from) {
    const timestamp = event.block.timestamp.toI64();
    const day = `${timestamp / constants_1.SECONDS_PER_DAY}`;
    const hour = `${(timestamp % constants_1.SECONDS_PER_DAY) / constants_1.SECONDS_PER_HOUR}`;
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    let accountId = from.toHexString();
    let account = schema_1.Account.load(accountId);
    if (!account) {
        account = new schema_1.Account(accountId);
        account.save();
        const protocol = getOrCreateYetiProtocol();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
        usageMetricsDailySnapshot.cumulativeUniqueUsers += 1;
        usageMetricsHourlySnapshot.cumulativeUniqueUsers += 1;
    }
    // Combine the id and the user address to generate a unique user id for the day
    let dailyActiveAccountId = `${accountId}-${day}`;
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        dailyActiveAccount.save();
        usageMetricsDailySnapshot.dailyActiveUsers += 1;
    }
    // Combine the id, user address and hour to generate a unique user id for the hour
    let hourlyActiveAccountId = `${accountId}-${day}-${hour}`;
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
function addProtocolSideRevenue(event, revenueAmountUSD) {
    const protocol = getOrCreateYetiProtocol();
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(revenueAmountUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(revenueAmountUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyProtocolSideRevenueUSD =
        financialsSnapshot.dailyProtocolSideRevenueUSD.plus(revenueAmountUSD);
    financialsSnapshot.dailyTotalRevenueUSD =
        financialsSnapshot.dailyTotalRevenueUSD.plus(revenueAmountUSD);
    financialsSnapshot.save();
}
exports.addProtocolSideRevenue = addProtocolSideRevenue;
function addSupplySideRevenue(event, revenueAmountUSD) {
    const protocol = getOrCreateYetiProtocol();
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(revenueAmountUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(revenueAmountUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailySupplySideRevenueUSD =
        financialsSnapshot.dailySupplySideRevenueUSD.plus(revenueAmountUSD);
    financialsSnapshot.dailyTotalRevenueUSD =
        financialsSnapshot.dailyTotalRevenueUSD.plus(revenueAmountUSD);
    financialsSnapshot.save();
}
exports.addSupplySideRevenue = addSupplySideRevenue;
function addProtocolBorrowVolume(event, borrowedUSD) {
    const protocol = getOrCreateYetiProtocol();
    protocol.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD.plus(borrowedUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyBorrowUSD =
        financialsSnapshot.dailyBorrowUSD.plus(borrowedUSD);
    financialsSnapshot.save();
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    usageMetricsDailySnapshot.dailyBorrowCount += 1;
    usageMetricsDailySnapshot.dailyTransactionCount += 1;
    usageMetricsDailySnapshot.save();
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    usageMetricsHourlySnapshot.hourlyBorrowCount += 1;
    usageMetricsHourlySnapshot.hourlyTransactionCount += 1;
    usageMetricsHourlySnapshot.save();
}
exports.addProtocolBorrowVolume = addProtocolBorrowVolume;
function addProtocolDepositVolume(event, depositedUSD) {
    const protocol = getOrCreateYetiProtocol();
    protocol.cumulativeDepositUSD =
        protocol.cumulativeBorrowUSD.plus(depositedUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyDepositUSD =
        financialsSnapshot.dailyDepositUSD.plus(depositedUSD);
    financialsSnapshot.save();
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    usageMetricsDailySnapshot.dailyDepositCount += 1;
    usageMetricsDailySnapshot.dailyTransactionCount += 1;
    usageMetricsDailySnapshot.save();
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    usageMetricsHourlySnapshot.hourlyDepositCount += 1;
    usageMetricsHourlySnapshot.hourlyTransactionCount += 1;
    usageMetricsHourlySnapshot.save();
}
exports.addProtocolDepositVolume = addProtocolDepositVolume;
function incrementProtocolRepayCount(event) {
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    usageMetricsDailySnapshot.dailyRepayCount += 1;
    usageMetricsDailySnapshot.dailyTransactionCount += 1;
    usageMetricsDailySnapshot.save();
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    usageMetricsHourlySnapshot.hourlyRepayCount += 1;
    usageMetricsHourlySnapshot.hourlyTransactionCount += 1;
    usageMetricsHourlySnapshot.save();
}
exports.incrementProtocolRepayCount = incrementProtocolRepayCount;
function incrementProtocolLiquidateCount(event) {
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    usageMetricsDailySnapshot.dailyLiquidateCount += 1;
    usageMetricsDailySnapshot.dailyTransactionCount += 1;
    usageMetricsDailySnapshot.save();
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    usageMetricsHourlySnapshot.hourlyLiquidateCount += 1;
    usageMetricsHourlySnapshot.hourlyTransactionCount += 1;
    usageMetricsHourlySnapshot.save();
}
exports.incrementProtocolLiquidateCount = incrementProtocolLiquidateCount;
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
function addProtocolLiquidateVolume(event, liquidatedUSD) {
    const protocol = getOrCreateYetiProtocol();
    protocol.cumulativeLiquidateUSD =
        protocol.cumulativeLiquidateUSD.plus(liquidatedUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyLiquidateUSD =
        financialsSnapshot.dailyLiquidateUSD.plus(liquidatedUSD);
    financialsSnapshot.save();
}
exports.addProtocolLiquidateVolume = addProtocolLiquidateVolume;
function updateProtocolUSDLocked(event, netChangeUSD) {
    const protocol = getOrCreateYetiProtocol();
    const totalValueLocked = protocol.totalValueLockedUSD.plus(netChangeUSD);
    protocol.totalValueLockedUSD = totalValueLocked;
    protocol.totalDepositBalanceUSD = totalValueLocked;
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocolUSDLocked = updateProtocolUSDLocked;
function updateProtocolLockedUSD(event, totalValueLocked) {
    const protocol = getOrCreateYetiProtocol();
    protocol.totalValueLockedUSD = totalValueLocked;
    protocol.totalDepositBalanceUSD = totalValueLocked;
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocolLockedUSD = updateProtocolLockedUSD;
function updateProtocolBorrowBalance(event, borrowedUSD, totalYUSDSupply) {
    const protocol = getOrCreateYetiProtocol();
    protocol.totalBorrowBalanceUSD = borrowedUSD;
    protocol.mintedTokenSupplies = [totalYUSDSupply];
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocolBorrowBalance = updateProtocolBorrowBalance;
