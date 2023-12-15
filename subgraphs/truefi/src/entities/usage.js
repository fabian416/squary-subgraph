"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementProtocolTotalPoolCount = exports.incrementProtocolLiquidateCount = exports.incrementProtocolRepayCount = exports.incrementProtocolWithdrawCount = exports.incrementProtocolBorrowCount = exports.incrementProtocolDepositCount = exports.updateUsageMetrics = exports.getOrCreateUsageMetricsHourlySnapshot = exports.getOrCreateUsageMetricsSnapshot = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const protocol_1 = require("./protocol");
function getOrCreateUsageMetricsSnapshot(event) {
    const id = `${event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY}`;
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id);
    if (!usageMetrics) {
        const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id);
        usageMetrics.protocol = protocol.id;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.cumulativeUniqueDepositors =
            protocol.cumulativeUniqueDepositors;
        usageMetrics.cumulativeUniqueBorrowers = protocol.cumulativeUniqueBorrowers;
        usageMetrics.cumulativeUniqueLiquidators =
            protocol.cumulativeUniqueLiquidators;
        usageMetrics.cumulativeUniqueLiquidatees =
            protocol.cumulativeUniqueLiquidatees;
        usageMetrics.totalPoolCount = protocol.totalPoolCount;
        usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.dailyActiveDepositors = constants_1.INT_ZERO;
        usageMetrics.dailyActiveBorrowers = constants_1.INT_ZERO;
        usageMetrics.dailyActiveLiquidators = constants_1.INT_ZERO;
        usageMetrics.dailyActiveLiquidatees = constants_1.INT_ZERO;
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
        const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(id);
        usageMetrics.protocol = protocol.id;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.hourlyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.hourlyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.hourlyDepositCount = constants_1.INT_ZERO;
        usageMetrics.hourlyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.hourlyBorrowCount = constants_1.INT_ZERO;
        usageMetrics.hourlyRepayCount = constants_1.INT_ZERO;
        usageMetrics.hourlyLiquidateCount = constants_1.INT_ZERO;
    }
    usageMetrics.blockNumber = event.block.number;
    usageMetrics.timestamp = event.block.timestamp;
    return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot;
function updateUsageMetrics(event, from) {
    const timestamp = event.block.timestamp.toI64();
    const day = `${timestamp / constants_1.SECONDS_PER_DAY}`;
    const hour = `${timestamp / constants_1.SECONDS_PER_HOUR}`;
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    let accountId = from.toHexString();
    // Combine the id and the user address to generate a unique user id for the day
    let dailyActiveAccountId = `daily-${accountId}-${day}`;
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        dailyActiveAccount.save();
        usageMetricsDailySnapshot.dailyActiveUsers += 1;
    }
    // Combine the id, user address and hour to generate a unique user id for the hour
    let hourlyActiveAccountId = `hourly-${accountId}-${hour}`;
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
function isUniqueDailyUser(event, account, action) {
    const timestamp = event.block.timestamp.toI64();
    const day = `${timestamp / constants_1.SECONDS_PER_DAY}`;
    // Combine the id, user address, and action to generate a unique user id for the day
    let dailyActionActiveAccountId = `daily-${action}-${account.id}-${day}`;
    let dailyActionActiveAccount = schema_1.ActiveAccount.load(dailyActionActiveAccountId);
    if (!dailyActionActiveAccount) {
        dailyActionActiveAccount = new schema_1.ActiveAccount(dailyActionActiveAccountId);
        dailyActionActiveAccount.save();
        return true;
    }
    return false;
}
function incrementProtocolDepositCount(event, account) {
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    usageMetricsDailySnapshot.dailyDepositCount += 1;
    usageMetricsDailySnapshot.dailyTransactionCount += 1;
    if (isUniqueDailyUser(event, account, "deposit")) {
        usageMetricsDailySnapshot.dailyActiveDepositors += 1;
    }
    usageMetricsDailySnapshot.save();
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    usageMetricsHourlySnapshot.hourlyDepositCount += 1;
    usageMetricsHourlySnapshot.hourlyTransactionCount += 1;
    usageMetricsHourlySnapshot.save();
}
exports.incrementProtocolDepositCount = incrementProtocolDepositCount;
function incrementProtocolBorrowCount(event, account) {
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    usageMetricsDailySnapshot.dailyBorrowCount += 1;
    usageMetricsDailySnapshot.dailyTransactionCount += 1;
    if (isUniqueDailyUser(event, account, "borrow")) {
        usageMetricsDailySnapshot.dailyActiveBorrowers += 1;
    }
    usageMetricsDailySnapshot.save();
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    usageMetricsHourlySnapshot.hourlyBorrowCount += 1;
    usageMetricsHourlySnapshot.hourlyTransactionCount += 1;
    usageMetricsHourlySnapshot.save();
}
exports.incrementProtocolBorrowCount = incrementProtocolBorrowCount;
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
function incrementProtocolLiquidateCount(event, account, liquidator) {
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    usageMetricsDailySnapshot.dailyLiquidateCount += 1;
    usageMetricsDailySnapshot.dailyTransactionCount += 1;
    if (isUniqueDailyUser(event, account, "liquidatee")) {
        usageMetricsDailySnapshot.dailyActiveLiquidatees += 1;
    }
    if (isUniqueDailyUser(event, liquidator, "liquidator")) {
        usageMetricsDailySnapshot.dailyActiveLiquidators += 1;
    }
    usageMetricsDailySnapshot.save();
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    usageMetricsHourlySnapshot.hourlyLiquidateCount += 1;
    usageMetricsHourlySnapshot.hourlyTransactionCount += 1;
    usageMetricsHourlySnapshot.save();
}
exports.incrementProtocolLiquidateCount = incrementProtocolLiquidateCount;
function incrementProtocolTotalPoolCount(event) {
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    const dailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    protocol.totalPoolCount += 1;
    dailySnapshot.totalPoolCount += 1;
    protocol.save();
    dailySnapshot.save();
}
exports.incrementProtocolTotalPoolCount = incrementProtocolTotalPoolCount;
