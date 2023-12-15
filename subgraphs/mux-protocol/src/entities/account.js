"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementAccountEventCount = exports.decrementAccountOpenPositionCount = exports.incrementAccountOpenPositionCount = exports.getOrCreateAccount = void 0;
const schema_1 = require("../../generated/schema");
const pool_1 = require("./pool");
const event_1 = require("./event");
const constants_1 = require("../utils/constants");
function getOrCreateAccount(event, pool, address) {
    let account = schema_1.Account.load(address);
    if (!account) {
        account = new schema_1.Account(address);
        account.cumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        account.cumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        account.cumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        account.cumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        account.cumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        account.cumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        account.longPositionCount = constants_1.INT_ZERO;
        account.shortPositionCount = constants_1.INT_ZERO;
        account.openPositionCount = constants_1.INT_ZERO;
        account.closedPositionCount = constants_1.INT_ZERO;
        account.cumulativeUniqueLiquidatees = constants_1.INT_ZERO;
        account.depositCount = constants_1.INT_ZERO;
        account.withdrawCount = constants_1.INT_ZERO;
        account.borrowCount = constants_1.INT_ZERO;
        account.collateralInCount = constants_1.INT_ZERO;
        account.collateralOutCount = constants_1.INT_ZERO;
        account.liquidateCount = constants_1.INT_ZERO;
        account.liquidationCount = constants_1.INT_ZERO;
        account.swapCount = constants_1.INT_ZERO;
        account.save();
        (0, pool_1.incrementPoolUniqueUsers)(event, pool);
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
function incrementAccountOpenPositionCount(account, positionSide) {
    if (constants_1.PositionSide.LONG == positionSide) {
        account.longPositionCount += constants_1.INT_ONE;
    }
    else {
        account.shortPositionCount += constants_1.INT_ONE;
    }
    account.openPositionCount += constants_1.INT_ONE;
    account.save();
}
exports.incrementAccountOpenPositionCount = incrementAccountOpenPositionCount;
function decrementAccountOpenPositionCount(account, positionSide) {
    if (constants_1.PositionSide.LONG == positionSide) {
        account.longPositionCount -= constants_1.INT_ONE;
    }
    else {
        account.shortPositionCount -= constants_1.INT_ONE;
    }
    account.openPositionCount -= constants_1.INT_ONE;
    account.closedPositionCount += constants_1.INT_ONE;
    account.save();
}
exports.decrementAccountOpenPositionCount = decrementAccountOpenPositionCount;
function incrementAccountEventCount(event, pool, account, eventType, sizeDelta) {
    switch (eventType) {
        case event_1.EventType.Deposit:
            if (account.depositCount == constants_1.INT_ZERO) {
                (0, pool_1.incrementPoolUniqueDepositors)(event, pool);
            }
            account.depositCount += constants_1.INT_ONE;
            break;
        case event_1.EventType.Withdraw:
            account.withdrawCount += constants_1.INT_ONE;
            break;
        case event_1.EventType.CollateralIn:
            account.collateralInCount += constants_1.INT_ONE;
            if (sizeDelta > constants_1.BIGINT_ZERO) {
                if (account.borrowCount == constants_1.INT_ZERO) {
                    (0, pool_1.incrementPoolUniqueBorrowers)(event, pool);
                }
                account.borrowCount += constants_1.INT_ONE;
            }
            break;
        case event_1.EventType.CollateralOut:
            account.collateralOutCount += constants_1.INT_ONE;
            break;
        case event_1.EventType.Liquidate:
            if (account.liquidateCount == constants_1.INT_ZERO) {
                (0, pool_1.incrementPoolUniqueLiquidators)(event, pool);
            }
            account.liquidateCount += constants_1.INT_ONE;
            break;
        case event_1.EventType.Liquidated:
            if (account.liquidationCount == constants_1.INT_ZERO) {
                (0, pool_1.incrementPoolUniqueLiquidatees)(event, pool);
            }
            account.liquidationCount += constants_1.INT_ONE;
        case event_1.EventType.Swap:
            account.swapCount += constants_1.INT_ONE;
            break;
        default:
            break;
    }
    account.save();
}
exports.incrementAccountEventCount = incrementAccountEventCount;
