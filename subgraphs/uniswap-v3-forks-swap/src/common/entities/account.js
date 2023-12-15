"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateAccount = void 0;
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../constants");
function getOrCreateAccount(address) {
    let account = schema_1.Account.load(address);
    if (!account) {
        account = new schema_1.Account(address);
        account.positionCount = constants_1.INT_ZERO;
        account.openPositionCount = constants_1.INT_ZERO;
        account.closedPositionCount = constants_1.INT_ZERO;
        account.depositCount = constants_1.INT_ZERO;
        account.withdrawCount = constants_1.INT_ZERO;
        account.swapCount = constants_1.INT_ZERO;
        return account;
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
