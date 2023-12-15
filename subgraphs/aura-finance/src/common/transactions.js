"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWithdrawTransaction = exports.createDepositTransaction = void 0;
const configure_1 = require("../../configurations/configure");
const schema_1 = require("../../generated/schema");
function createDepositTransaction(vault, amount, amountUSD, event) {
  const transactionId = "deposit"
    .concat("-")
    .concat(event.transaction.hash.toHexString());
  let depositTransaction = schema_1.Deposit.load(transactionId);
  if (!depositTransaction) {
    depositTransaction = new schema_1.Deposit(transactionId);
    depositTransaction.to = vault.id;
    depositTransaction.from = event.transaction.from.toHexString();
    depositTransaction.hash = event.transaction.hash.toHexString();
    depositTransaction.logIndex = event.transaction.index.toI32();
    depositTransaction.vault = vault.id;
    depositTransaction.protocol =
      configure_1.NetworkConfigs.getFactoryAddress();
    depositTransaction.asset = vault.inputToken;
    depositTransaction.amount = amount;
    depositTransaction.amountUSD = amountUSD;
    depositTransaction.timestamp = event.block.timestamp;
    depositTransaction.blockNumber = event.block.number;
    depositTransaction.save();
  }
  return depositTransaction;
}
exports.createDepositTransaction = createDepositTransaction;
function createWithdrawTransaction(vault, amount, amountUSD, event) {
  const withdrawTransactionId = "withdraw"
    .concat("-")
    .concat(event.transaction.hash.toHexString());
  let withdrawTransaction = schema_1.Withdraw.load(withdrawTransactionId);
  if (!withdrawTransaction) {
    withdrawTransaction = new schema_1.Withdraw(withdrawTransactionId);
    withdrawTransaction.vault = vault.id;
    withdrawTransaction.protocol =
      configure_1.NetworkConfigs.getFactoryAddress();
    withdrawTransaction.to = event.transaction.to.toHexString();
    withdrawTransaction.from = event.transaction.from.toHexString();
    withdrawTransaction.hash = event.transaction.hash.toHexString();
    withdrawTransaction.logIndex = event.transaction.index.toI32();
    withdrawTransaction.asset = vault.inputToken;
    withdrawTransaction.amount = amount;
    withdrawTransaction.amountUSD = amountUSD;
    withdrawTransaction.timestamp = event.block.timestamp;
    withdrawTransaction.blockNumber = event.block.number;
    withdrawTransaction.save();
  }
  return withdrawTransaction;
}
exports.createWithdrawTransaction = createWithdrawTransaction;
