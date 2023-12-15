"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfPositionClosed =
  exports.incrementPositionLiquidationCount =
  exports.incrementPositionRepayCount =
  exports.incrementPositionBorrowCount =
  exports.incrementPositionWithdrawCount =
  exports.incrementPositionDepositCount =
  exports.setUserLenderPositionIsCollateral =
  exports.updateUserPosition =
  exports.getOrCreatePositionSnapshot =
  exports.getOrCreateUserPosition =
  exports.getUserPosition =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const account_1 = require("./account");
const market_1 = require("./market");
const constants_1 = require("../utils/constants");
function getUserPosition(account, market, positionSide) {
  const positionId = `${account.id}-${market.id}-${positionSide}`;
  const openPositions = account.openPositions;
  for (let i = 0; i < openPositions.length; i++) {
    if (openPositions[i].startsWith(positionId)) {
      return schema_1.Position.load(openPositions[i]);
    }
  }
  return null;
}
exports.getUserPosition = getUserPosition;
function getOrCreateUserPosition(event, account, market, positionSide) {
  let position = getUserPosition(account, market, positionSide);
  if (position != null) {
    return position;
  }
  if (constants_1.PositionSide.LENDER == positionSide) {
    (0, market_1.openMarketLenderPosition)(market);
  } else {
    (0, market_1.openMarketBorrowerPosition)(market);
  }
  const positionId = `${account.id}-${market.id}-${positionSide}-${account.positionCount}`;
  position = new schema_1.Position(positionId);
  position.account = account.id;
  position.market = market.id;
  position.hashOpened = event.transaction.hash.toHexString();
  position.blockNumberOpened = event.block.number;
  position.timestampOpened = event.block.timestamp;
  position.side = positionSide;
  position.balance = constants_1.BIGINT_ZERO;
  position.depositCount = constants_1.INT_ZERO;
  position.withdrawCount = constants_1.INT_ZERO;
  position.borrowCount = constants_1.INT_ZERO;
  position.repayCount = constants_1.INT_ZERO;
  position.liquidationCount = constants_1.INT_ZERO;
  if (constants_1.PositionSide.LENDER == positionSide) {
    position.isCollateral = false;
  } else {
    position._stableDebtBalance = constants_1.BIGINT_ZERO;
    position._variableDebtBalance = constants_1.BIGINT_ZERO;
  }
  position.save();
  const openPositions = account.openPositions;
  openPositions.push(position.id);
  account.openPositions = openPositions;
  account.openPositionCount += 1;
  account.positionCount += 1;
  account.save();
  return position;
}
exports.getOrCreateUserPosition = getOrCreateUserPosition;
function getOrCreatePositionSnapshot(event, position) {
  const hash = event.transaction.hash.toHexString();
  const logIndex = event.transactionLogIndex.toI32();
  const id = `${position.id}-${hash}-${logIndex}`;
  let snapshot = schema_1.PositionSnapshot.load(id);
  if (!snapshot) {
    snapshot = new schema_1.PositionSnapshot(id);
    snapshot.position = position.id;
  }
  snapshot.balance = position.balance;
  snapshot.hash = hash;
  snapshot.logIndex = logIndex;
  snapshot.nonce = event.transaction.nonce;
  snapshot.blockNumber = event.block.number;
  snapshot.timestamp = event.block.timestamp;
  snapshot.save();
}
exports.getOrCreatePositionSnapshot = getOrCreatePositionSnapshot;
function updateUserPosition(
  event,
  user,
  market,
  newTotalBalance,
  positionSide,
  isStableBorrowerPosition
) {
  const account = (0, account_1.getOrCreateAccount)(user);
  const position = getOrCreateUserPosition(
    event,
    account,
    market,
    positionSide
  );
  if (constants_1.PositionSide.LENDER == positionSide) {
    position.balance = newTotalBalance;
  } else if (constants_1.PositionSide.BORROWER == positionSide) {
    if (isStableBorrowerPosition) {
      position._stableDebtBalance = newTotalBalance;
    } else {
      position._variableDebtBalance = newTotalBalance;
    }
    position.balance = position._stableDebtBalance.plus(
      position._variableDebtBalance
    );
  }
  position.save();
  checkIfPositionClosed(event, account, market, position);
  getOrCreatePositionSnapshot(event, position);
}
exports.updateUserPosition = updateUserPosition;
function setUserLenderPositionIsCollateral(user, marketAddress, isCollateral) {
  const account = (0, account_1.getOrCreateAccount)(user);
  const position = getUserPosition(
    account,
    (0, market_1.getMarket)(marketAddress),
    constants_1.PositionSide.LENDER
  );
  if (!position) {
    // Position was already closed, do nothing
    return;
  }
  position.isCollateral = isCollateral;
  position.save();
}
exports.setUserLenderPositionIsCollateral = setUserLenderPositionIsCollateral;
function incrementPositionDepositCount(position) {
  position.depositCount += 1;
  position.save();
}
exports.incrementPositionDepositCount = incrementPositionDepositCount;
function incrementPositionWithdrawCount(position) {
  position.withdrawCount += 1;
  position.save();
}
exports.incrementPositionWithdrawCount = incrementPositionWithdrawCount;
function incrementPositionBorrowCount(position) {
  position.borrowCount += 1;
  position.save();
}
exports.incrementPositionBorrowCount = incrementPositionBorrowCount;
function incrementPositionRepayCount(position) {
  position.repayCount += 1;
  position.save();
}
exports.incrementPositionRepayCount = incrementPositionRepayCount;
function incrementPositionLiquidationCount(position) {
  position.liquidationCount += 1;
  position.save();
}
exports.incrementPositionLiquidationCount = incrementPositionLiquidationCount;
function checkIfPositionClosed(event, account, market, position) {
  if (position.balance.gt(constants_1.BIGINT_ZERO)) {
    return;
  }
  if (position.balance.lt(constants_1.BIGINT_ZERO)) {
    graph_ts_1.log.error(
      "Negative balance in position {}, balance: {}, setting to zero",
      [position.id, position.balance.toString()]
    );
    position.balance = constants_1.BIGINT_ZERO;
  }
  position.blockNumberClosed = event.block.number;
  position.hashClosed = event.transaction.hash.toHexString();
  position.timestampClosed = event.block.timestamp;
  if (position.side == constants_1.PositionSide.LENDER) {
    position.isCollateral = false;
  }
  position.save();
  const openPositions = account.openPositions;
  openPositions.splice(openPositions.indexOf(position.id), 1);
  account.openPositions = openPositions;
  account.openPositionCount -= 1;
  account.closedPositionCount += 1;
  account.save();
  (0, market_1.closeMarketPosition)(market);
}
exports.checkIfPositionClosed = checkIfPositionClosed;
