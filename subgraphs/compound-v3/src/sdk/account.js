"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountManager = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("./constants");
/**
 * This file contains the AccountClass, which does
 * the operations on the Account entity. This includes:
 *  - Creating a new Account
 *  - Updating an existing Account
 *  - Making a position
 *  - Making position snapshots
 *
 * Schema Version:  3.1.0
 * SDK Version:     1.0.5
 * Author(s):
 *  - @melotik
 *  - @dhruv-chauhan
 */
class AccountManager {
  constructor(account) {
    let _account = schema_1.Account.load(account);
    if (!_account) {
      _account = new schema_1.Account(account);
      _account.positionCount = constants_1.INT_ZERO;
      _account.openPositionCount = constants_1.INT_ZERO;
      _account.closedPositionCount = constants_1.INT_ZERO;
      _account.depositCount = constants_1.INT_ZERO;
      _account.withdrawCount = constants_1.INT_ZERO;
      _account.borrowCount = constants_1.INT_ZERO;
      _account.repayCount = constants_1.INT_ZERO;
      _account.liquidateCount = constants_1.INT_ZERO;
      _account.liquidationCount = constants_1.INT_ZERO;
      _account.transferredCount = constants_1.INT_ZERO;
      _account.receivedCount = constants_1.INT_ZERO;
      _account.flashloanCount = constants_1.INT_ZERO;
      _account.save();
      this.isNew = true;
    } else {
      this.isNew = false;
    }
    this.account = _account;
  }
  getAccount() {
    return this.account;
  }
  // returns true if the account was created in this instance
  isNewUser() {
    if (this.isNew) {
      return true;
    }
    // true if there have been no transactions submitted by the user
    // ie, liquidations and receives don't count (did not spend gas)
    return (
      this.account.depositCount == constants_1.INT_ZERO &&
      this.account.withdrawCount == constants_1.INT_ZERO &&
      this.account.borrowCount == constants_1.INT_ZERO &&
      this.account.repayCount == constants_1.INT_ZERO &&
      this.account.liquidateCount == constants_1.INT_ZERO &&
      this.account.transferredCount == constants_1.INT_ZERO &&
      this.account.flashloanCount == constants_1.INT_ZERO
    );
  }
  countFlashloan() {
    this.account.flashloanCount += constants_1.INT_ONE;
    this.account.save();
  }
  // Ensure this is called on the liquidators account
  countLiquidate() {
    this.account.liquidateCount += constants_1.INT_ONE;
    this.account.save();
  }
}
exports.AccountManager = AccountManager;
