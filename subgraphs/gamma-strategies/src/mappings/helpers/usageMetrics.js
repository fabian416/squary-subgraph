"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementTotalPoolCount = exports.createHourlyActiveAccount = exports.createDailyActiveAccount = exports._createActiveAccount = exports.createAccount = exports.updateUsageMetrics = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const datetime_1 = require("../../common/utils/datetime");
//  Update usage related fields and entities
function updateUsageMetrics(accountAddress, eventType, event) {
    const timestamp = event.block.timestamp.toI32();
    // Add account
    let isNewAccount = createAccount(accountAddress, timestamp);
    // Add active accounts
    let isNewDailyAccount = createDailyActiveAccount(accountAddress, timestamp);
    let isNewHourlyAccount = createHourlyActiveAccount(accountAddress, timestamp);
    // Update entities
    let protocol = (0, getters_1.getOrCreateYieldAggregator)(constants_1.REGISTRY_ADDRESS_MAP.get(graph_ts_1.dataSource.network()));
    let dailyUsageSnapshot = (0, getters_1.getOrCreateUsageMetricDailySnapshot)(event);
    let hourlyUsageSnapshot = (0, getters_1.getOrCreateUsageMetricHourlySnapshot)(event);
    let cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    if (isNewAccount) {
        cumulativeUniqueUsers += 1;
    }
    if (isNewDailyAccount) {
        dailyUsageSnapshot.dailyActiveUsers += 1;
    }
    if (isNewHourlyAccount) {
        hourlyUsageSnapshot.hourlyActiveUsers += 1;
    }
    if (eventType === constants_1.UsageType.DEPOSIT) {
        dailyUsageSnapshot.dailyDepositCount += 1;
        hourlyUsageSnapshot.hourlyDepositCount += 1;
    }
    if (eventType === constants_1.UsageType.WITHDRAW) {
        dailyUsageSnapshot.dailyWithdrawCount += 1;
        hourlyUsageSnapshot.hourlyWithdrawCount += 1;
    }
    protocol.cumulativeUniqueUsers = cumulativeUniqueUsers;
    dailyUsageSnapshot.blockNumber = event.block.number;
    dailyUsageSnapshot.timestamp = event.block.timestamp;
    dailyUsageSnapshot.dailyTransactionCount += 1;
    dailyUsageSnapshot.cumulativeUniqueUsers = cumulativeUniqueUsers;
    dailyUsageSnapshot.totalPoolCount = protocol.totalPoolCount;
    hourlyUsageSnapshot.blockNumber = event.block.number;
    hourlyUsageSnapshot.timestamp = event.block.timestamp;
    hourlyUsageSnapshot.hourlyTransactionCount += 1;
    hourlyUsageSnapshot.cumulativeUniqueUsers = cumulativeUniqueUsers;
    // hourlyUsageSnapshot.totalPoolCount = protocol.totalPoolCount;
    protocol.save();
    dailyUsageSnapshot.save();
    hourlyUsageSnapshot.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
function createAccount(accountAddress, timestamp) {
    let isNewAccount = false;
    let accountId = accountAddress.toHex();
    let account = schema_1.Account.load(accountId);
    if (!account) {
        isNewAccount = true;
        account = new schema_1.Account(accountId);
        account.save();
    }
    return isNewAccount;
}
exports.createAccount = createAccount;
function _createActiveAccount(accountId) {
    let isNewAccount = false;
    let account = schema_1.ActiveAccount.load(accountId);
    if (!account) {
        isNewAccount = true;
        account = new schema_1.ActiveAccount(accountId);
        account.save();
    }
    return isNewAccount;
}
exports._createActiveAccount = _createActiveAccount;
function createDailyActiveAccount(accountAddress, timestamp) {
    const dailyAccountId = "daily"
        .concat("-")
        .concat(accountAddress.toHex())
        .concat("-")
        .concat((0, datetime_1.getDaysSinceEpoch)(timestamp));
    return _createActiveAccount(dailyAccountId);
}
exports.createDailyActiveAccount = createDailyActiveAccount;
function createHourlyActiveAccount(accountAddress, timestamp) {
    const hourlyAccountId = "hourly"
        .concat("-")
        .concat(accountAddress.toHex())
        .concat("-")
        .concat((0, datetime_1.getHoursSinceEpoch)(timestamp));
    return _createActiveAccount(hourlyAccountId);
}
exports.createHourlyActiveAccount = createHourlyActiveAccount;
function incrementTotalPoolCount(event) {
    let protocol = (0, getters_1.getOrCreateYieldAggregator)(constants_1.REGISTRY_ADDRESS_MAP.get(graph_ts_1.dataSource.network()));
    let usageMetricsDaily = (0, getters_1.getOrCreateUsageMetricDailySnapshot)(event);
    // let usageMetricsHourly = getOrCreateUsageMetricHourlySnapshot(event);
    protocol.totalPoolCount += constants_1.INT_ONE;
    usageMetricsDaily.totalPoolCount += constants_1.INT_ONE;
    // usageMetricsHourly.totalPoolCount += INT_ONE
    protocol.save();
    usageMetricsDaily.save();
}
exports.incrementTotalPoolCount = incrementTotalPoolCount;
