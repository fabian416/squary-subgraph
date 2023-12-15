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
exports.getOrCreateUsageMetricsHourlySnapshot = exports.getOrCreateUsageMetricsDailySnapshot = exports.updateUsageMetrics = void 0;
const schema_1 = require("../../generated/schema");
const protocol_1 = require("./protocol");
const constants = __importStar(require("./constants"));
const account_1 = require("./account");
function updateUsageMetrics(block, from, callType = "") {
    const account = (0, account_1.getOrCreateAccount)(from.toHexString());
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const usageMetricsDaily = getOrCreateUsageMetricsDailySnapshot(block);
    const usageMetricsHourly = getOrCreateUsageMetricsHourlySnapshot(block);
    usageMetricsDaily.blockNumber = block.number;
    usageMetricsHourly.blockNumber = block.number;
    usageMetricsDaily.timestamp = block.timestamp;
    usageMetricsHourly.timestamp = block.timestamp;
    usageMetricsDaily.dailyTransactionCount += 1;
    usageMetricsHourly.hourlyTransactionCount += 1;
    usageMetricsDaily.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsHourly.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    let dailyActiveAccountId = (block.timestamp.toI64() / constants.SECONDS_PER_DAY)
        .toString()
        .concat("-")
        .concat(from.toHexString());
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        dailyActiveAccount.save();
        usageMetricsDaily.dailyActiveUsers += 1;
        usageMetricsHourly.hourlyActiveUsers += 1;
    }
    if (callType === constants.CallType.DEPOSIT) {
        usageMetricsDaily.dailyDepositCount += 1;
        usageMetricsHourly.hourlyDepositCount += 1;
    }
    else if (callType === constants.CallType.WITHDRAW) {
        usageMetricsDaily.dailyWithdrawCount += 1;
        usageMetricsHourly.hourlyWithdrawCount += 1;
    }
    usageMetricsDaily.save();
    usageMetricsHourly.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
function getOrCreateUsageMetricsDailySnapshot(block) {
    let id = block.timestamp.toI64() / constants.SECONDS_PER_DAY;
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id.toString());
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id.toString());
        usageMetrics.protocol = constants.PROTOCOL_ID;
        usageMetrics.dailyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.dailyTransactionCount = 0;
        usageMetrics.dailyDepositCount = 0;
        usageMetrics.dailyWithdrawCount = 0;
        usageMetrics.blockNumber = block.number;
        usageMetrics.timestamp = block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsDailySnapshot = getOrCreateUsageMetricsDailySnapshot;
function getOrCreateUsageMetricsHourlySnapshot(block) {
    let metricsID = (block.timestamp.toI64() / constants.SECONDS_PER_DAY)
        .toString()
        .concat("-")
        .concat((block.timestamp.toI64() / constants.SECONDS_PER_HOUR).toString());
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(metricsID);
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(metricsID);
        usageMetrics.protocol = constants.PROTOCOL_ID;
        usageMetrics.hourlyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.hourlyTransactionCount = 0;
        usageMetrics.hourlyDepositCount = 0;
        usageMetrics.hourlyWithdrawCount = 0;
        usageMetrics.blockNumber = block.number;
        usageMetrics.timestamp = block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot;
