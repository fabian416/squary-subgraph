"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAccountToProtocol = exports.updateUsageMetrics = void 0;
const protocol_1 = require("../getters/protocol");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const usageMetrics_1 = require("../getters/usageMetrics");
const arrays_1 = require("../common/arrays");
function updateUsageMetrics(event, from, to, transactionType) {
    const hourlyId = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    const dailyId = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const usageHourlySnapshot = (0, usageMetrics_1.getOrCreateUsageMetricsHourlySnapshot)(event);
    const usageDailySnapshot = (0, usageMetrics_1.getOrCreateUsageMetricsDailySnapshot)(event);
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    // Update the block number and timestamp to that of the last transaction of that day
    usageHourlySnapshot.blockNumber = event.block.number;
    usageHourlySnapshot.timestamp = event.block.timestamp;
    usageHourlySnapshot.hourlyTransactionCount += 1;
    usageDailySnapshot.blockNumber = event.block.number;
    usageDailySnapshot.timestamp = event.block.timestamp;
    usageDailySnapshot.dailyTransactionCount += 1;
    usageHourlySnapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageDailySnapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    // Combine the id and the user address to generate a unique user id for the hour/day
    const hourlyActiveAccountIdFrom = "hourly-" + from.toHexString() + "-" + hourlyId.toString();
    let hourlyActiveAccountFrom = schema_1.ActiveAccount.load(hourlyActiveAccountIdFrom);
    if (!hourlyActiveAccountFrom) {
        hourlyActiveAccountFrom = new schema_1.ActiveAccount(hourlyActiveAccountIdFrom);
        hourlyActiveAccountFrom.save();
        usageHourlySnapshot.hourlyActiveUsers += 1;
    }
    const hourlyActiveAccountIdTo = "hourly-" + to.toHexString() + "-" + hourlyId.toString();
    let hourlyActiveAccountTo = schema_1.ActiveAccount.load(hourlyActiveAccountIdTo);
    if (!hourlyActiveAccountTo) {
        hourlyActiveAccountTo = new schema_1.ActiveAccount(hourlyActiveAccountIdTo);
        hourlyActiveAccountTo.save();
        usageHourlySnapshot.hourlyActiveUsers += 1;
    }
    const dailyActiveAccountIdFrom = "daily-" + from.toHexString() + "-" + dailyId.toString();
    let dailyActiveAccountFrom = schema_1.ActiveAccount.load(dailyActiveAccountIdFrom);
    if (!dailyActiveAccountFrom) {
        dailyActiveAccountFrom = new schema_1.ActiveAccount(dailyActiveAccountIdFrom);
        dailyActiveAccountFrom.save();
        usageDailySnapshot.dailyActiveUsers += 1;
    }
    const dailyActiveAccountIdTo = "daily-" + to.toHexString() + "-" + dailyId.toString();
    let dailyActiveAccountTo = schema_1.ActiveAccount.load(dailyActiveAccountIdTo);
    if (!dailyActiveAccountTo) {
        dailyActiveAccountTo = new schema_1.ActiveAccount(dailyActiveAccountIdTo);
        dailyActiveAccountTo.save();
        usageDailySnapshot.dailyActiveUsers += 1;
    }
    if (transactionType == constants_1.TransactionType.DEPOSIT) {
        usageHourlySnapshot.hourlyDepositCount += 1;
        usageDailySnapshot.dailyDepositCount += 1;
    }
    else if (transactionType == constants_1.TransactionType.WITHDRAW) {
        usageHourlySnapshot.hourlyWithdrawCount += 1;
        usageDailySnapshot.dailyWithdrawCount += 1;
    }
    else if (transactionType == constants_1.TransactionType.BORROW) {
        usageHourlySnapshot.hourlyBorrowCount += 1;
        usageDailySnapshot.dailyBorrowCount += 1;
    }
    else if (transactionType == constants_1.TransactionType.REPAY) {
        usageHourlySnapshot.hourlyRepayCount += 1;
        usageDailySnapshot.dailyRepayCount += 1;
    }
    else if (transactionType == constants_1.TransactionType.LIQUIDATEE) {
        usageHourlySnapshot.hourlyLiquidateCount += 1;
        usageDailySnapshot.dailyLiquidateCount += 1;
    }
    usageDailySnapshot.totalPoolCount = protocol.totalPoolCount;
    usageHourlySnapshot.save();
    usageDailySnapshot.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
function addAccountToProtocol(transactionType, account, event) {
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    const dailyId = (event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    const activeEventId = `daily-${account.id}-${dailyId}-${transactionType}`;
    let activeEvent = schema_1.ActiveEventAccount.load(activeEventId);
    const dailySnapshot = (0, usageMetrics_1.getOrCreateUsageMetricsDailySnapshot)(event);
    if (transactionType == constants_1.TransactionType.DEPOSIT) {
        if (protocol._depositors.indexOf(account.id) < 0) {
            protocol._depositors = (0, arrays_1.addToArrayAtIndex)(protocol._depositors, account.id, 0);
            dailySnapshot.cumulativeUniqueDepositors = protocol._depositors.length;
            protocol.cumulativeUniqueDepositors = protocol._depositors.length;
        }
        if (!activeEvent) {
            activeEvent = new schema_1.ActiveEventAccount(activeEventId);
            dailySnapshot.dailyActiveDepositors += 1;
        }
    }
    else if (transactionType == constants_1.TransactionType.BORROW) {
        if (protocol._borrowers.indexOf(account.id) < 0) {
            protocol._borrowers = (0, arrays_1.addToArrayAtIndex)(protocol._borrowers, account.id, 0);
            dailySnapshot.cumulativeUniqueBorrowers = protocol._borrowers.length;
            protocol.cumulativeUniqueBorrowers = protocol._borrowers.length;
        }
        if (!activeEvent) {
            activeEvent = new schema_1.ActiveEventAccount(activeEventId);
            dailySnapshot.dailyActiveBorrowers += 1;
        }
    }
    else if (transactionType == constants_1.TransactionType.LIQUIDATOR) {
        if (protocol._liquidators.indexOf(account.id) < 0) {
            protocol._liquidators = (0, arrays_1.addToArrayAtIndex)(protocol._liquidators, account.id, 0);
            dailySnapshot.cumulativeUniqueLiquidators = protocol._liquidators.length;
            protocol.cumulativeUniqueLiquidators = protocol._liquidators.length;
        }
        if (!activeEvent) {
            activeEvent = new schema_1.ActiveEventAccount(activeEventId);
            dailySnapshot.dailyActiveLiquidators += 1;
        }
        account.liquidateCount += 1;
    }
    else if (transactionType == constants_1.TransactionType.LIQUIDATEE) {
        if (protocol._liquidatees.indexOf(account.id) < 0) {
            protocol._liquidatees = (0, arrays_1.addToArrayAtIndex)(protocol._liquidatees, account.id, 0);
            dailySnapshot.cumulativeUniqueLiquidatees = protocol._liquidatees.length;
            protocol.cumulativeUniqueLiquidatees = protocol._liquidatees.length;
        }
        if (!activeEvent) {
            activeEvent = new schema_1.ActiveEventAccount(activeEventId);
            dailySnapshot.dailyActiveLiquidatees += 1;
        }
        account.liquidationCount += 1;
    }
    activeEvent.save();
    account.save();
    protocol.save();
    dailySnapshot.save();
}
exports.addAccountToProtocol = addAccountToProtocol;
