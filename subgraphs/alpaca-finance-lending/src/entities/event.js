"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiquidate =
  exports.createRepay =
  exports.createBorrow =
  exports.createWithdraw =
  exports.createDeposit =
  exports.EventType =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const account_1 = require("./account");
const market_1 = require("./market");
const position_1 = require("./position");
const price_1 = require("./price");
const token_1 = require("./token");
const usage_1 = require("./usage");
const constants_1 = require("../utils/constants");
var EventType;
(function (EventType) {
  EventType[(EventType["Deposit"] = 0)] = "Deposit";
  EventType[(EventType["Withdraw"] = 1)] = "Withdraw";
  EventType[(EventType["Borrow"] = 2)] = "Borrow";
  EventType[(EventType["Repay"] = 3)] = "Repay";
  EventType[(EventType["Liquidate"] = 4)] = "Liquidate";
  EventType[(EventType["Liquidated"] = 5)] = "Liquidated";
})((EventType = exports.EventType || (exports.EventType = {})));
function createDeposit(
  event,
  market,
  reserve,
  user,
  amount,
  isTransfer = false
) {
  if (amount.le(constants_1.BIGINT_ZERO)) {
    graph_ts_1.log.warning("Invalid deposit amount: {}", [amount.toString()]);
    return;
  }
  const account = (0, account_1.getOrCreateAccount)(user);
  const position = (0, position_1.getOrCreateUserPosition)(
    event,
    account,
    market,
    constants_1.PositionSide.LENDER
  );
  const asset = (0, token_1.getOrCreateToken)(reserve);
  const deposit = new schema_1.Deposit(
    `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
  );
  deposit.hash = event.transaction.hash.toHexString();
  deposit.nonce = event.transaction.nonce;
  deposit.logIndex = event.logIndex.toI32();
  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.account = account.id;
  deposit.market = market.id;
  deposit.position = position.id;
  deposit.asset = asset.id;
  deposit.amount = amount;
  deposit.amountUSD = (0, price_1.amountInUSD)(
    amount,
    asset,
    event.block.number
  );
  deposit.save();
  (0, usage_1.updateUsageMetrics)(event, event.transaction.from);
  if (!isTransfer) {
    (0, market_1.addMarketVolume)(
      event,
      market,
      deposit.amountUSD,
      EventType.Deposit
    );
    (0, usage_1.incrementProtocolDepositCount)(event, account);
  }
  (0, account_1.incrementAccountDepositCount)(account);
  (0, position_1.incrementPositionDepositCount)(position);
}
exports.createDeposit = createDeposit;
function createWithdraw(
  event,
  market,
  reserve,
  user,
  amount,
  isTransfer = false
) {
  if (amount.le(constants_1.BIGINT_ZERO)) {
    graph_ts_1.log.warning("Invalid withdraw amount: {}", [amount.toString()]);
    return;
  }
  const account = (0, account_1.getOrCreateAccount)(user);
  const position = (0, position_1.getOrCreateUserPosition)(
    event,
    account,
    market,
    constants_1.PositionSide.LENDER
  );
  const asset = (0, token_1.getOrCreateToken)(reserve);
  const withdraw = new schema_1.Withdraw(
    `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
  );
  withdraw.hash = event.transaction.hash.toHexString();
  withdraw.nonce = event.transaction.nonce;
  withdraw.logIndex = event.logIndex.toI32();
  withdraw.blockNumber = event.block.number;
  withdraw.timestamp = event.block.timestamp;
  withdraw.account = account.id;
  withdraw.market = market.id;
  withdraw.position = position.id;
  withdraw.asset = asset.id;
  withdraw.amount = amount;
  withdraw.amountUSD = (0, price_1.amountInUSD)(
    amount,
    asset,
    event.block.number
  );
  withdraw.save();
  (0, usage_1.updateUsageMetrics)(event, user);
  if (!isTransfer) {
    (0, market_1.addMarketVolume)(
      event,
      market,
      withdraw.amountUSD,
      EventType.Withdraw
    );
    (0, usage_1.incrementProtocolWithdrawCount)(event);
  }
  (0, account_1.incrementAccountWithdrawCount)(account);
  (0, position_1.incrementPositionWithdrawCount)(position);
}
exports.createWithdraw = createWithdraw;
function createBorrow(event, market, reserve, borrower, amount) {
  if (amount.le(constants_1.BIGINT_ZERO)) {
    graph_ts_1.log.warning("Invalid borrow amount: {}", [amount.toString()]);
    return;
  }
  const account = (0, account_1.getOrCreateAccount)(borrower);
  const position = (0, position_1.getOrCreateUserPosition)(
    event,
    account,
    market,
    constants_1.PositionSide.BORROWER
  );
  const asset = (0, token_1.getOrCreateToken)(reserve);
  const borrow = new schema_1.Borrow(
    `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
  );
  borrow.hash = event.transaction.hash.toHexString();
  borrow.nonce = event.transaction.nonce;
  borrow.logIndex = event.logIndex.toI32();
  borrow.blockNumber = event.block.number;
  borrow.timestamp = event.block.timestamp;
  borrow.account = account.id;
  borrow.market = market.id;
  borrow.position = position.id;
  borrow.asset = asset.id;
  borrow.amount = amount;
  borrow.amountUSD = (0, price_1.amountInUSD)(
    amount,
    asset,
    event.block.number
  );
  borrow.save();
  (0, usage_1.updateUsageMetrics)(event, borrower);
  (0, market_1.addMarketVolume)(
    event,
    market,
    borrow.amountUSD,
    EventType.Borrow
  );
  (0, usage_1.incrementProtocolBorrowCount)(event, account);
  (0, account_1.incrementAccountBorrowCount)(account);
  (0, position_1.incrementPositionBorrowCount)(position);
}
exports.createBorrow = createBorrow;
function createRepay(event, market, reserve, user, amount) {
  if (amount.le(constants_1.BIGINT_ZERO)) {
    graph_ts_1.log.warning("Invalid repay amount: {}", [amount.toString()]);
    return;
  }
  const asset = (0, token_1.getOrCreateToken)(reserve);
  const account = (0, account_1.getOrCreateAccount)(user);
  const position = (0, position_1.getOrCreateUserPosition)(
    event,
    account,
    market,
    constants_1.PositionSide.BORROWER
  );
  const repay = new schema_1.Repay(
    `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
  );
  repay.hash = event.transaction.hash.toHexString();
  repay.nonce = event.transaction.nonce;
  repay.logIndex = event.logIndex.toI32();
  repay.blockNumber = event.block.number;
  repay.timestamp = event.block.timestamp;
  repay.account = account.id;
  repay.market = market.id;
  repay.position = position.id;
  repay.asset = asset.id;
  repay.amount = amount;
  repay.amountUSD = (0, price_1.amountInUSD)(amount, asset, event.block.number);
  repay.save();
  (0, usage_1.updateUsageMetrics)(event, user);
  (0, market_1.addMarketVolume)(
    event,
    market,
    repay.amountUSD,
    EventType.Repay
  );
  (0, usage_1.incrementProtocolRepayCount)(event);
  (0, account_1.incrementAccountRepayCount)(account);
  (0, position_1.incrementPositionRepayCount)(position);
}
exports.createRepay = createRepay;
function createLiquidate(
  event,
  market,
  collateralAsset,
  amountLiquidated,
  debtAsset,
  profitAmount,
  protocolSideProfitAmount,
  liquidator,
  liquidatee
) {
  const debtToken = (0, token_1.getOrCreateToken)(debtAsset);
  const collateralToken = (0, token_1.getOrCreateToken)(collateralAsset);
  const userAccount = (0, account_1.getOrCreateAccount)(liquidatee);
  const liquidatorAccount = (0, account_1.getOrCreateAccount)(liquidator);
  const lenderPosition = (0, position_1.getOrCreateUserPosition)(
    event,
    userAccount,
    market,
    constants_1.PositionSide.LENDER
  );
  const borrowerPosition = (0, position_1.getOrCreateUserPosition)(
    event,
    userAccount,
    market,
    constants_1.PositionSide.BORROWER
  );
  const liquidate = new schema_1.Liquidate(
    `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
  );
  liquidate.hash = event.transaction.hash.toHexString();
  liquidate.nonce = event.transaction.nonce;
  liquidate.logIndex = event.logIndex.toI32();
  liquidate.blockNumber = event.block.number;
  liquidate.timestamp = event.block.timestamp;
  liquidate.liquidator = liquidatorAccount.id;
  liquidate.liquidatee = userAccount.id;
  liquidate.market = market.id;
  liquidate.position = borrowerPosition.id;
  liquidate.lenderPosition = lenderPosition.id;
  liquidate.asset = debtToken.id;
  liquidate.amount = amountLiquidated;
  liquidate.amountUSD = (0, price_1.amountInUSD)(
    amountLiquidated,
    collateralToken,
    event.block.number
  );
  liquidate.profitUSD = (0, price_1.amountInUSD)(
    profitAmount,
    debtToken,
    event.block.number
  );
  liquidate.save();
  (0, usage_1.updateUsageMetrics)(event, liquidator);
  const protocolSideProfitUSD = (0, price_1.amountInUSD)(
    protocolSideProfitAmount,
    debtToken,
    event.block.number
  );
  (0, market_1.addMarketProtocolSideRevenue)(
    event,
    market,
    protocolSideProfitUSD
  );
  (0, market_1.addMarketSupplySideRevenue)(
    event,
    market,
    liquidate.profitUSD.minus(protocolSideProfitUSD)
  );
  (0, market_1.addMarketVolume)(
    event,
    market,
    liquidate.amountUSD,
    EventType.Liquidate
  );
  (0, usage_1.incrementProtocolLiquidateCount)(
    event,
    userAccount,
    liquidatorAccount
  );
  (0, account_1.incrementAccountLiquidationCount)(userAccount);
  (0, position_1.incrementPositionLiquidationCount)(borrowerPosition);
  (0, position_1.incrementPositionLiquidationCount)(lenderPosition);
  (0, account_1.incrementAccountLiquidatorCount)(liquidatorAccount);
  (0, position_1.checkIfPositionClosed)(
    event,
    userAccount,
    market,
    lenderPosition
  );
  (0, position_1.checkIfPositionClosed)(
    event,
    userAccount,
    market,
    borrowerPosition
  );
}
exports.createLiquidate = createLiquidate;
