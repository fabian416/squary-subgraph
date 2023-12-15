"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateActivityHelper = exports.incrementProtocolTakerCount = exports.incrementProtocolWithdrawCount = exports.incrementProtocolDepositCount = exports.updateActiveAccounts = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const protocol_1 = require("./protocol");
function updateActiveAccounts(event, account) {
    const activityHelper = getOrCreateActivityHelper();
    const timestamp = event.block.timestamp.toI64();
    const days = `${timestamp / constants_1.SECONDS_PER_DAY}`;
    const hours = `${timestamp / constants_1.SECONDS_PER_HOUR}`;
    // Combine the id and the user address to generate a unique user id for the day
    const dailyActiveAccountId = graph_ts_1.Bytes.fromUTF8(`daily-${account.id.toHex()}-${days}`);
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        dailyActiveAccount.save();
        activityHelper.dailyActiveUsers += 1;
        activityHelper.save();
    }
    // Combine the id, user address and hour to generate a unique user id for the hour
    const hourlyActiveAccountId = graph_ts_1.Bytes.fromUTF8(`hourly-${account.id.toHex()}-${hours}`);
    let hourlyActiveAccount = schema_1.ActiveAccount.load(hourlyActiveAccountId);
    if (!hourlyActiveAccount) {
        hourlyActiveAccount = new schema_1.ActiveAccount(hourlyActiveAccountId);
        hourlyActiveAccount.save();
        activityHelper.hourlyActiveUsers += 1;
        activityHelper.save();
    }
}
exports.updateActiveAccounts = updateActiveAccounts;
function isUniqueUser(account, action) {
    const id = graph_ts_1.Bytes.fromUTF8(`${account.id.toHex()}-${action}`);
    let activeAccount = schema_1.ActiveAccount.load(id);
    if (!activeAccount) {
        activeAccount = new schema_1.ActiveAccount(id);
        activeAccount.save();
        return true;
    }
    return false;
}
function isUniqueDailyUser(event, account, action) {
    const timestamp = event.block.timestamp.toI64();
    const day = `${timestamp / constants_1.SECONDS_PER_DAY}`;
    // Combine the id, user address, and action to generate a unique user id for the day
    const dailyActionActiveAccountId = graph_ts_1.Bytes.fromUTF8(`daily-${account.id.toHex()}-${action}-${day}`);
    let dailyActionActiveAccount = schema_1.ActiveAccount.load(dailyActionActiveAccountId);
    if (!dailyActionActiveAccount) {
        dailyActionActiveAccount = new schema_1.ActiveAccount(dailyActionActiveAccountId);
        dailyActionActiveAccount.save();
        return true;
    }
    return false;
}
function incrementProtocolDepositCount(event, account) {
    updateActiveAccounts(event, account);
    if (isUniqueUser(account, "lp")) {
        (0, protocol_1.incrementProtocolUniqueLPs)();
    }
    const activityHelper = getOrCreateActivityHelper();
    activityHelper.dailyDepositCount += 1;
    activityHelper.dailyTransactionCount += 1;
    activityHelper.hourlyDepositCount += 1;
    activityHelper.hourlyTransactionCount += 1;
    if (isUniqueDailyUser(event, account, "lp")) {
        activityHelper.dailyUniqueLP += 1;
    }
    activityHelper.save();
}
exports.incrementProtocolDepositCount = incrementProtocolDepositCount;
function incrementProtocolWithdrawCount(event, account) {
    updateActiveAccounts(event, account);
    if (isUniqueUser(account, "lp")) {
        (0, protocol_1.incrementProtocolUniqueLPs)();
    }
    const activityHelper = getOrCreateActivityHelper();
    activityHelper.dailyWithdrawCount += 1;
    activityHelper.dailyTransactionCount += 1;
    activityHelper.hourlyWithdrawCount += 1;
    activityHelper.hourlyTransactionCount += 1;
    if (isUniqueDailyUser(event, account, "lp")) {
        activityHelper.dailyUniqueLP += 1;
    }
    activityHelper.save();
}
exports.incrementProtocolWithdrawCount = incrementProtocolWithdrawCount;
function incrementProtocolTakerCount(event, account) {
    updateActiveAccounts(event, account);
    if (isUniqueUser(account, "taker")) {
        (0, protocol_1.incrementProtocolUniqueTakers)();
    }
    const activityHelper = getOrCreateActivityHelper();
    if (isUniqueDailyUser(event, account, "taker")) {
        activityHelper.dailyUniqueTakers += 1;
        activityHelper.save();
    }
}
exports.incrementProtocolTakerCount = incrementProtocolTakerCount;
function getOrCreateActivityHelper() {
    let activityHelper = schema_1._ActivityHelper.load(constants_1.ActivityHelperID);
    if (!activityHelper) {
        activityHelper = new schema_1._ActivityHelper(constants_1.ActivityHelperID);
        activityHelper.hourlyActiveUsers = constants_1.INT_ZERO;
        activityHelper.dailyActiveUsers = constants_1.INT_ZERO;
        activityHelper.hourlyUniqueLP = constants_1.INT_ZERO;
        activityHelper.dailyUniqueLP = constants_1.INT_ZERO;
        activityHelper.hourlyUniqueTakers = constants_1.INT_ZERO;
        activityHelper.dailyUniqueTakers = constants_1.INT_ZERO;
        activityHelper.hourlyTransactionCount = constants_1.INT_ZERO;
        activityHelper.dailyTransactionCount = constants_1.INT_ZERO;
        activityHelper.hourlyDepositCount = constants_1.INT_ZERO;
        activityHelper.dailyDepositCount = constants_1.INT_ZERO;
        activityHelper.hourlyWithdrawCount = constants_1.INT_ZERO;
        activityHelper.dailyWithdrawCount = constants_1.INT_ZERO;
        activityHelper.save();
    }
    return activityHelper;
}
exports.getOrCreateActivityHelper = getOrCreateActivityHelper;
