"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateUsageMetricsDailySnapshot = exports.getOrCreateUsageMetricsHourlySnapshot = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const protocol_1 = require("./protocol");
function getOrCreateUsageMetricsHourlySnapshot(event) {
    // Number of hours since Unix epoch
    const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    // Create unique id for the hour
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(id.toString());
    if (!usageMetrics) {
        const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(id.toString());
        usageMetrics.protocol = (0, protocol_1.getOrCreateLendingProtocol)().id;
        usageMetrics.hourlyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.hourlyTransactionCount = 0;
        usageMetrics.hourlyDepositCount = 0;
        usageMetrics.hourlyBorrowCount = 0;
        usageMetrics.hourlyWithdrawCount = 0;
        usageMetrics.hourlyRepayCount = 0;
        usageMetrics.hourlyLiquidateCount = 0;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot;
function getOrCreateUsageMetricsDailySnapshot(event) {
    // Number of days since Unix epoch
    const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id.toString());
    if (!usageMetrics) {
        const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id.toString());
        usageMetrics.protocol = (0, protocol_1.getOrCreateLendingProtocol)().id;
        usageMetrics.dailyTransactionCount = 0;
        usageMetrics.dailyDepositCount = 0;
        usageMetrics.dailyBorrowCount = 0;
        usageMetrics.dailyWithdrawCount = 0;
        usageMetrics.dailyRepayCount = 0;
        usageMetrics.dailyLiquidateCount = 0;
        usageMetrics.totalPoolCount = 0;
        usageMetrics.dailyActiveUsers = 0;
        usageMetrics.dailyActiveDepositors = 0;
        usageMetrics.dailyActiveBorrowers = 0;
        usageMetrics.dailyActiveLiquidators = 0;
        usageMetrics.dailyActiveLiquidatees = 0;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.cumulativeUniqueDepositors =
            protocol.cumulativeUniqueDepositors;
        usageMetrics.cumulativeUniqueBorrowers = protocol.cumulativeUniqueBorrowers;
        usageMetrics.cumulativeUniqueLiquidators =
            protocol.cumulativeUniqueLiquidators;
        usageMetrics.cumulativeUniqueLiquidatees =
            protocol.cumulativeUniqueLiquidatees;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsDailySnapshot = getOrCreateUsageMetricsDailySnapshot;
