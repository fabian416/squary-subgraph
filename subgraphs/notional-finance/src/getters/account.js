"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateAccount = void 0;
const schema_1 = require("../../generated/schema");
const protocol_1 = require("./protocol");
function getOrCreateAccount(accountId) {
    let account = schema_1.Account.load(accountId);
    if (!account) {
        account = new schema_1.Account(accountId);
        account.positionCount = 0;
        account.openPositions = [];
        account.openPositionCount = 0;
        account.closedPositions = [];
        account.closedPositionCount = 0;
        account.depositCount = 0;
        account.withdrawCount = 0;
        account.borrowCount = 0;
        account.repayCount = 0;
        account.liquidateCount = 0;
        account.liquidationCount = 0;
        account.save();
        const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
