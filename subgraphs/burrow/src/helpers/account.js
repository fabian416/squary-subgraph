"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateAccount = void 0;
const schema_1 = require("../../generated/schema");
const const_1 = require("../utils/const");
function getOrCreateAccount(id) {
  let account = schema_1.Account.load(id);
  if (!account) {
    account = new schema_1.Account(id);
    account.borrowCount = 0;
    account.depositCount = 0;
    account.withdrawCount = 0;
    account.repayCount = 0;
    account.liquidateCount = 0;
    account.liquidationCount = 0;
    account.positionCount = 0;
    account.closedPositionCount = 0;
    account.openPositionCount = 0;
    account._lastActiveTimestamp = (0, const_1.BI)("0");
    account.save();
  }
  return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
