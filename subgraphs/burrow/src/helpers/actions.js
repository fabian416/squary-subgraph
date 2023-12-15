"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateLiquidation =
  exports.getOrCreateRepayment =
  exports.getOrCreateBorrow =
  exports.getOrCreateWithdrawal =
  exports.getOrCreateDeposit =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const const_1 = require("../utils/const");
const account_1 = require("./account");
function getOrCreateDeposit(id, receipt) {
  let deposit = schema_1.Deposit.load(id);
  if (!deposit) {
    deposit = new schema_1.Deposit(id);
    deposit.hash = receipt.outcome.id.toBase58();
    deposit.nonce = const_1.BI_ZERO;
    deposit.logIndex = 0;
    deposit.blockNumber = graph_ts_1.BigInt.fromI32(
      receipt.block.header.height
    );
    deposit.timestamp = graph_ts_1.BigInt.fromU64(
      (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
    );
    deposit.account = (0, account_1.getOrCreateAccount)(
      const_1.ADDRESS_ZERO
    ).id;
    deposit.market = "";
    deposit.position = "";
    deposit.asset = "";
    deposit.amount = const_1.BI_ZERO;
    deposit.amountUSD = const_1.BD_ZERO;
  }
  return deposit;
}
exports.getOrCreateDeposit = getOrCreateDeposit;
function getOrCreateWithdrawal(id, receipt) {
  let w = schema_1.Withdraw.load(id);
  if (!w) {
    w = new schema_1.Withdraw(id);
    w.hash = receipt.outcome.id.toBase58();
    w.nonce = const_1.BI_ZERO;
    w.logIndex = 0;
    w.blockNumber = graph_ts_1.BigInt.fromI32(receipt.block.header.height);
    w.timestamp = graph_ts_1.BigInt.fromU64(
      (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
    );
    w.account = (0, account_1.getOrCreateAccount)(const_1.ADDRESS_ZERO).id;
    w.market = "";
    w.position = "";
    w.asset = "";
    w.amount = const_1.BI_ZERO;
    w.amountUSD = const_1.BD_ZERO;
  }
  return w;
}
exports.getOrCreateWithdrawal = getOrCreateWithdrawal;
function getOrCreateBorrow(id, receipt) {
  let b = schema_1.Borrow.load(id);
  if (!b) {
    b = new schema_1.Borrow(id);
    b.hash = receipt.outcome.id.toBase58();
    b.nonce = const_1.BI_ZERO;
    b.logIndex = 0;
    b.blockNumber = graph_ts_1.BigInt.fromI32(receipt.block.header.height);
    b.timestamp = graph_ts_1.BigInt.fromU64(
      (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
    );
    b.account = (0, account_1.getOrCreateAccount)(const_1.ADDRESS_ZERO).id;
    b.market = "";
    b.position = "";
    b.asset = "";
    b.amount = const_1.BI_ZERO;
    b.amountUSD = const_1.BD_ZERO;
  }
  return b;
}
exports.getOrCreateBorrow = getOrCreateBorrow;
function getOrCreateRepayment(id, receipt) {
  let r = schema_1.Repay.load(id);
  if (!r) {
    r = new schema_1.Repay(id);
    r.hash = receipt.outcome.id.toBase58();
    r.nonce = const_1.BI_ZERO;
    r.logIndex = 0;
    r.blockNumber = graph_ts_1.BigInt.fromI32(receipt.block.header.height);
    r.timestamp = graph_ts_1.BigInt.fromU64(
      (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
    );
    r.account = (0, account_1.getOrCreateAccount)(const_1.ADDRESS_ZERO).id;
    r.market = "";
    r.position = "";
    r.asset = "";
    r.amount = const_1.BI_ZERO;
    r.amountUSD = const_1.BD_ZERO;
  }
  return r;
}
exports.getOrCreateRepayment = getOrCreateRepayment;
function getOrCreateLiquidation(id, receipt) {
  let liquidate = schema_1.Liquidate.load(id);
  if (!liquidate) {
    liquidate = new schema_1.Liquidate(id);
    liquidate.hash = receipt.outcome.id.toBase58();
    liquidate.nonce = const_1.BI_ZERO;
    liquidate.logIndex = 0;
    liquidate.blockNumber = graph_ts_1.BigInt.fromI32(
      receipt.block.header.height
    );
    liquidate.timestamp = graph_ts_1.BigInt.fromU64(
      (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
    );
    liquidate.liquidatee = (0, account_1.getOrCreateAccount)(
      const_1.ADDRESS_ZERO
    ).id;
    liquidate.liquidator = (0, account_1.getOrCreateAccount)(
      const_1.ADDRESS_ZERO
    ).id;
    liquidate.market = "";
    liquidate.position = "";
    liquidate.asset = "";
    liquidate.amount = const_1.BI_ZERO;
    liquidate.amountUSD = const_1.BD_ZERO;
    liquidate.profitUSD = const_1.BD_ZERO;
  }
  return liquidate;
}
exports.getOrCreateLiquidation = getOrCreateLiquidation;
