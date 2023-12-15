"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementAccountLiquidationCount = exports.incrementAccountLiquidatorCount = exports.incrementAccountRepayCount = exports.incrementAccountBorrowCount = exports.incrementAccountWithdrawCount = exports.incrementAccountDepositCount = exports.getOrCreateAccount = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const protocol_1 = require("./protocol");
function getOrCreateAccount(address) {
    const id = address.toHexString();
    let account = schema_1.Account.load(id);
    if (!account) {
        account = new schema_1.Account(id);
        account.positionCount = constants_1.INT_ZERO;
        account.openPositions = [];
        account.openPositionCount = constants_1.INT_ZERO;
        account.closedPositionCount = constants_1.INT_ZERO;
        account.depositCount = constants_1.INT_ZERO;
        account.withdrawCount = constants_1.INT_ZERO;
        account.borrowCount = constants_1.INT_ZERO;
        account.repayCount = constants_1.INT_ZERO;
        account.liquidateCount = constants_1.INT_ZERO;
        account.liquidationCount = constants_1.INT_ZERO;
        account.save();
        (0, protocol_1.incrementProtocolUniqueUsers)();
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
function incrementAccountDepositCount(account) {
    if (account.depositCount == 0) {
        (0, protocol_1.incrementProtocolUniqueDepositors)();
    }
    account.depositCount += 1;
    account.save();
}
exports.incrementAccountDepositCount = incrementAccountDepositCount;
function incrementAccountWithdrawCount(account) {
    account.withdrawCount += 1;
    account.save();
}
exports.incrementAccountWithdrawCount = incrementAccountWithdrawCount;
function incrementAccountBorrowCount(account) {
    if (account.borrowCount == 0) {
        (0, protocol_1.incrementProtocolUniqueBorrowers)();
    }
    account.borrowCount += 1;
    account.save();
}
exports.incrementAccountBorrowCount = incrementAccountBorrowCount;
function incrementAccountRepayCount(account) {
    account.repayCount += 1;
    account.save();
}
exports.incrementAccountRepayCount = incrementAccountRepayCount;
function incrementAccountLiquidatorCount(account) {
    if (account.liquidateCount == 0) {
        (0, protocol_1.incrementProtocolUniqueLiquidators)();
    }
    account.liquidateCount += 1;
    account.save();
}
exports.incrementAccountLiquidatorCount = incrementAccountLiquidatorCount;
function incrementAccountLiquidationCount(account) {
    if (account.liquidationCount == 0) {
        (0, protocol_1.incrementProtocolUniqueLiquidatees)();
    }
    account.liquidationCount += 1;
    account.save();
}
exports.incrementAccountLiquidationCount = incrementAccountLiquidationCount;
