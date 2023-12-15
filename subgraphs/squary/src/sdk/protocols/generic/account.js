"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = exports.AccountWasActive = exports.AccountManager = void 0;
const schema_1 = require("../../../../generated/schema");
const events_1 = require("../../util/events");
/**
 * This file contains the AccountClass, which does
 * the operations on the Account entity. This includes:
 *  - Creating a new Account
 *  - Updating an existing Account
 *
 * Schema Version:  2.1.1
 * SDK Version:     1.0.1
 * Author(s):
 *  - @steegecs
 *  - @shashwatS22
 */
class AccountManager {
    constructor(protocol, tokens) {
        this.protocol = protocol;
        this.tokens = tokens;
    }
    loadAccount(address) {
        let acc = schema_1.Account.load(address.toHexString());
        if (acc) {
            return new Account(this.protocol, acc, this.tokens);
        }
        acc = new schema_1.Account(address.toHexString());
        acc.save();
        this.protocol.addUser();
        return new Account(this.protocol, acc, this.tokens);
    }
}
exports.AccountManager = AccountManager;
class AccountWasActive {
}
exports.AccountWasActive = AccountWasActive;
class Account {
    constructor(protocol, account, tokens) {
        this.account = account;
        this.protocol = protocol;
        this.event = protocol.getCurrentEvent();
        this.tokens = tokens;
    }
    trackActivity() {
        const days = (0, events_1.getUnixDays)(this.event.block);
        const hours = (0, events_1.getUnixHours)(this.event.block);
        const generalHourlyID = `${this.account.id}-hourly-${hours}`;
        const generalDailyID = `${this.account.id}-daily-${days}`;
        const generalActivity = {
            daily: this.isActiveByActivityID(generalDailyID),
            hourly: this.isActiveByActivityID(generalHourlyID),
        };
        this.protocol.addActiveUser(generalActivity);
        this.protocol.addTransaction();
    }
    isActiveByActivityID(id) {
        const dAct = schema_1.ActiveAccount.load(id);
        if (!dAct) {
            new schema_1.ActiveAccount(id).save();
            return true;
        }
        return false;
    }
}
exports.Account = Account;
