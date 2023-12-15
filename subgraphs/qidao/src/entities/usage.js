"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementProtocolLiquidateCount = exports.incrementProtocolRepayCount = exports.incrementProtocolWithdrawCount = exports.incrementProtocolBorrowCount = exports.incrementProtocolDepositCount = exports.updateUsageMetrics = exports.getOrCreateUsageMetricsHourlySnapshot = exports.getOrCreateUsageMetricsSnapshot = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const protocol_1 = require("./protocol");
function getOrCreateUsageMetricsSnapshot(event) {
    // Number of days since Unix epoch
    const id = `${event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY}`;
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id);
    if (!usageMetrics) {
        const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id);
        usageMetrics.protocol = protocol.id;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.dailyDepositCount = constants_1.INT_ZERO;
        usageMetrics.dailyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.dailyBorrowCount = constants_1.INT_ZERO;
        usageMetrics.dailyRepayCount = constants_1.INT_ZERO;
        usageMetrics.dailyLiquidateCount = constants_1.INT_ZERO;
        usageMetrics.totalPoolCount = protocol.totalPoolCount;
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
    const hour = `${(timestamp % constants_1.SECONDS_PER_DAY) / constants_1.SECONDS_PER_HOUR}`;
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(event);
    const accountId = from.toHexString();
    let account = schema_1.Account.load(accountId);
    if (!account) {
        account = new schema_1.Account(accountId);
        account.save();
        const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
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
function incrementProtocolBorrowCount(event) {
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsSnapshot(event);
    usageMetricsDailySnapshot.dailyBorrowCount += 1;
    usageMetricsDailySnapshot.dailyTransactionCount += 1;
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
