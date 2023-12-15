"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateAccountBalanceDailySnapshot = exports.updateAccountBalanceDailySnapshot = exports.decreaseAccountBalance = exports.increaseAccountBalance = exports.getOrCreateAccountBalance = exports.getOrCreateAccount = exports.isNewAccount = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
function isNewAccount(accountAddress) {
    let accountId = accountAddress.toHex();
    let existingAccount = schema_1.Account.load(accountId);
    if (existingAccount != null) {
        return false;
    }
    return true;
}
exports.isNewAccount = isNewAccount;
function getOrCreateAccount(accountAddress) {
    let accountId = accountAddress.toHex();
    let existingAccount = schema_1.Account.load(accountId);
    if (existingAccount != null) {
        return existingAccount;
    }
    let newAccount = new schema_1.Account(accountId);
    return newAccount;
}
exports.getOrCreateAccount = getOrCreateAccount;
function getOrCreateAccountBalance(account, token) {
    let balanceId = account.id + "-" + token.id;
    let previousBalance = schema_1.AccountBalance.load(balanceId);
    if (previousBalance != null) {
        return previousBalance;
    }
    let newBalance = new schema_1.AccountBalance(balanceId);
    newBalance.account = account.id;
    newBalance.token = token.id;
    newBalance.amount = constants_1.BIGINT_ZERO;
    return newBalance;
}
exports.getOrCreateAccountBalance = getOrCreateAccountBalance;
function increaseAccountBalance(account, token, amount) {
    let balance = getOrCreateAccountBalance(account, token);
    balance.amount = balance.amount.plus(amount);
    return balance;
}
exports.increaseAccountBalance = increaseAccountBalance;
function decreaseAccountBalance(account, token, amount) {
    let balance = getOrCreateAccountBalance(account, token);
    balance.amount = balance.amount.minus(amount);
    if (balance.amount < constants_1.BIGINT_ZERO) {
        balance.amount = constants_1.BIGINT_ZERO;
    }
    return balance;
}
exports.decreaseAccountBalance = decreaseAccountBalance;
function updateAccountBalanceDailySnapshot(balance, event) {
    let snapshot = getOrCreateAccountBalanceDailySnapshot(balance, event.block);
    snapshot.amount = balance.amount;
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    snapshot.save();
}
exports.updateAccountBalanceDailySnapshot = updateAccountBalanceDailySnapshot;
function getOrCreateAccountBalanceDailySnapshot(balance, block) {
    let snapshotId = balance.account +
        "-" +
        balance.token +
        "-" +
        (block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    let previousSnapshot = schema_1.AccountBalanceDailySnapshot.load(snapshotId);
    if (previousSnapshot != null) {
        return previousSnapshot;
    }
    let newSnapshot = new schema_1.AccountBalanceDailySnapshot(snapshotId);
    newSnapshot.account = balance.account;
    newSnapshot.token = balance.token;
    return newSnapshot;
}
exports.getOrCreateAccountBalanceDailySnapshot = getOrCreateAccountBalanceDailySnapshot;
