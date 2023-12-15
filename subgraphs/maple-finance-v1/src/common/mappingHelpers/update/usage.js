"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUsageMetrics = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../generated/schema");
const constants_1 = require("../../constants");
const snapshots_1 = require("../getOrCreate/snapshots");
const protocol_1 = require("../getOrCreate/protocol");
/**
 * Update usage metrics, this should be called on every transaction.
 * @param event event from the transaction
 * @param accountAddress account using the protocol
 * @param transactionType type of transaction, this should be a TransactionType
 */
function updateUsageMetrics(event, accountAddress, transactionType) {
    const usageDailyMetric = (0, snapshots_1.getOrCreateUsageDailyMetric)(event);
    const usageHourlyMetric = (0, snapshots_1.getOrCreateUsageHourlyMetric)(event);
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    ////
    // Updates directly from protocol
    ////
    usageDailyMetric.totalPoolCount = protocol.totalPoolCount;
    ////
    // Update cumulative accounts
    ////
    let account = schema_1.Account.load(accountAddress.toHexString());
    if (!account) {
        account = new schema_1.Account(accountAddress.toHexString());
        account.save();
        protocol.cumulativeUniqueUsers += constants_1.ONE_I32;
        protocol.save();
    }
    usageDailyMetric.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageHourlyMetric.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    ////
    // Update active accounts
    ////
    const dailyAccountId = accountAddress.toHexString() + "-" + usageDailyMetric.id;
    const hourlyAccountId = dailyAccountId + "-" + usageHourlyMetric.id;
    let activeDailyAccount = schema_1.ActiveAccount.load(dailyAccountId);
    let activeHourlyAccount = schema_1.ActiveAccount.load(hourlyAccountId);
    if (!activeDailyAccount) {
        activeDailyAccount = new schema_1.ActiveAccount(dailyAccountId);
        activeDailyAccount.save();
        usageDailyMetric.dailyActiveUsers += constants_1.ONE_I32;
    }
    if (!activeHourlyAccount) {
        activeHourlyAccount = new schema_1.ActiveAccount(hourlyAccountId);
        activeHourlyAccount.save();
        usageHourlyMetric.hourlyActiveUsers += constants_1.ONE_I32;
    }
    ////
    // Update tx counts
    ////
    usageDailyMetric.dailyTransactionCount += constants_1.ONE_I32;
    usageHourlyMetric.hourlyTransactionCount += constants_1.ONE_I32;
    if (constants_1.TransactionType.BORROW == transactionType) {
        usageDailyMetric.dailyBorrowCount += constants_1.ONE_I32;
        usageHourlyMetric.hourlyBorrowCount += constants_1.ONE_I32;
    }
    else if (constants_1.TransactionType.DEPOSIT == transactionType) {
        usageDailyMetric.dailyDepositCount += constants_1.ONE_I32;
        usageHourlyMetric.hourlyDepositCount += constants_1.ONE_I32;
    }
    else if (constants_1.TransactionType.LIQUIDATE == transactionType) {
        usageDailyMetric.dailyLiquidateCount += constants_1.ONE_I32;
        usageHourlyMetric.hourlyLiquidateCount += constants_1.ONE_I32;
    }
    else if (constants_1.TransactionType.REPAY == transactionType) {
        usageDailyMetric.dailyRepayCount += constants_1.ONE_I32;
        usageHourlyMetric.hourlyRepayCount += constants_1.ONE_I32;
    }
    else if (constants_1.TransactionType.STAKE == transactionType) {
        usageDailyMetric._dailyStakeCount += constants_1.ONE_I32;
        usageHourlyMetric._hourlyStakeCount += constants_1.ONE_I32;
    }
    else if (constants_1.TransactionType.UNSTAKE == transactionType) {
        usageDailyMetric._dailyUnstakeCount += constants_1.ONE_I32;
        usageHourlyMetric._hourlyUnstakeCount += constants_1.ONE_I32;
    }
    else if (constants_1.TransactionType.WITHDRAW == transactionType) {
        usageDailyMetric.dailyWithdrawCount += constants_1.ONE_I32;
        usageHourlyMetric.hourlyWithdrawCount += constants_1.ONE_I32;
    }
    else if (constants_1.TransactionType.CLAIM == transactionType) {
        usageDailyMetric._dailyClaimCount += constants_1.ONE_I32;
        usageHourlyMetric._hourlyClaimCount += constants_1.ONE_I32;
    }
    else {
        graph_ts_1.log.warning("update usage metric called with invalid transactionType: {}", [transactionType]);
    }
    usageDailyMetric.save();
    usageHourlyMetric.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
