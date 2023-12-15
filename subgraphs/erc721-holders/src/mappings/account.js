"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountBalanceDailySnapshot = exports.getOrCreateAccountBalance = exports.getOrCreateAccount = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
function getOrCreateAccount(accountAddress) {
    let existingAccount = schema_1.Account.load(accountAddress);
    if (existingAccount != null) {
        return existingAccount;
    }
    let newAccount = new schema_1.Account(accountAddress);
    newAccount.tokenCount = constants_1.BIGINT_ZERO;
    return newAccount;
}
exports.getOrCreateAccount = getOrCreateAccount;
function getOrCreateAccountBalance(account, collection) {
    let balanceId = account + "-" + collection;
    let previousBalance = schema_1.AccountBalance.load(balanceId);
    if (previousBalance != null) {
        return previousBalance;
    }
    let newBalance = new schema_1.AccountBalance(balanceId);
    newBalance.account = account;
    newBalance.collection = collection;
    newBalance.tokenCount = constants_1.BIGINT_ZERO;
    return newBalance;
}
exports.getOrCreateAccountBalance = getOrCreateAccountBalance;
function updateAccountBalanceDailySnapshot(balance, event) {
    let snapshot = getOrCreateAccountBalanceDailySnapshot(balance, event.block);
    snapshot.tokenCount = balance.tokenCount;
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    snapshot.save();
}
exports.updateAccountBalanceDailySnapshot = updateAccountBalanceDailySnapshot;
function getOrCreateAccountBalanceDailySnapshot(balance, block) {
    let snapshotId = balance.account +
        "-" +
        balance.collection +
        "-" +
        (block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    let previousSnapshot = schema_1.AccountBalanceDailySnapshot.load(snapshotId);
    if (previousSnapshot != null) {
        return previousSnapshot;
    }
    let newSnapshot = new schema_1.AccountBalanceDailySnapshot(snapshotId);
    newSnapshot.account = balance.account;
    newSnapshot.collection = balance.collection;
    newSnapshot.tokenCount = balance.tokenCount;
    return newSnapshot;
}
