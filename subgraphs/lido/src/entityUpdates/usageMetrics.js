"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateUsageMetricsHourlySnapshot = exports.getOrCreateUsageMetricsDailySnapshot = exports.updateUsageMetrics = void 0;
const protocol_1 = require("../entities/protocol");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
function updateUsageMetrics(block, from) {
    const accountId = from.toHexString();
    let account = schema_1.Account.load(accountId);
    if (!account) {
        account = new schema_1.Account(accountId);
        account.save();
        const protocol = (0, protocol_1.getOrCreateProtocol)();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const usageMetricsDailySnapshot = getOrCreateUsageMetricsDailySnapshot(block);
    const usageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(block);
    usageMetricsDailySnapshot.dailyTransactionCount += 1;
    usageMetricsHourlySnapshot.hourlyTransactionCount += 1;
    usageMetricsDailySnapshot.cumulativeUniqueUsers =
        protocol.cumulativeUniqueUsers;
    usageMetricsHourlySnapshot.cumulativeUniqueUsers =
        protocol.cumulativeUniqueUsers;
    let dailyActiveAccountId = (block.timestamp.toI64() / constants_1.SECONDS_PER_DAY)
        .toString()
        .concat("-")
        .concat(accountId);
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        dailyActiveAccount.save();
        usageMetricsDailySnapshot.dailyActiveUsers += 1;
        usageMetricsHourlySnapshot.hourlyActiveUsers += 1;
    }
    usageMetricsDailySnapshot.blockNumber = block.number;
    usageMetricsHourlySnapshot.blockNumber = block.number;
    usageMetricsDailySnapshot.timestamp = block.timestamp;
    usageMetricsHourlySnapshot.timestamp = block.timestamp;
    usageMetricsDailySnapshot.save();
    usageMetricsHourlySnapshot.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
function getOrCreateUsageMetricsDailySnapshot(block) {
    let dayId = (block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(dayId);
    if (!usageMetrics) {
        const protocol = (0, protocol_1.getOrCreateProtocol)();
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(dayId);
        usageMetrics.protocol = protocol.id;
        usageMetrics.totalPoolCount = protocol.totalPoolCount;
        usageMetrics.dailyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.dailyTransactionCount = 0;
        usageMetrics.blockNumber = block.number;
        usageMetrics.timestamp = block.timestamp;
    }
    usageMetrics.save();
    return usageMetrics;
}
exports.getOrCreateUsageMetricsDailySnapshot = getOrCreateUsageMetricsDailySnapshot;
function getOrCreateUsageMetricsHourlySnapshot(block) {
    let hourId = (block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR).toString();
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(hourId);
    if (!usageMetrics) {
        const protocol = (0, protocol_1.getOrCreateProtocol)();
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(hourId);
        usageMetrics.protocol = protocol.id;
        usageMetrics.hourlyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.hourlyTransactionCount = 0;
        usageMetrics.blockNumber = block.number;
        usageMetrics.timestamp = block.timestamp;
    }
    usageMetrics.save();
    return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot;
