"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateUsageMetricHourlySnapshot = exports.getOrCreateUsageMetricDailySnapshot = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../configurations/configure");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../constants");
function getOrCreateUsageMetricDailySnapshot(event) {
    // Number of days since Unix epoch
    const day = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(graph_ts_1.Bytes.fromI32(day));
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(graph_ts_1.Bytes.fromI32(day));
        usageMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        usageMetrics.day = constants_1.INT_ZERO;
        usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
        usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.dailyDepositCount = constants_1.INT_ZERO;
        usageMetrics.dailyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.dailySwapCount = constants_1.INT_ZERO;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.totalPoolCount = 0;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricDailySnapshot = getOrCreateUsageMetricDailySnapshot;
function getOrCreateUsageMetricHourlySnapshot(event) {
    // Number of days since Unix epoch
    const hour = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(graph_ts_1.Bytes.fromI32(hour));
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(graph_ts_1.Bytes.fromI32(hour));
        usageMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        usageMetrics.hour = constants_1.INT_ZERO;
        usageMetrics.hourlyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
        usageMetrics.hourlyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.hourlyDepositCount = constants_1.INT_ZERO;
        usageMetrics.hourlyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.hourlySwapCount = constants_1.INT_ZERO;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricHourlySnapshot = getOrCreateUsageMetricHourlySnapshot;
