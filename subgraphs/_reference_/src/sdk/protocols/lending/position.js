"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionManager = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../generated/schema");
const constants_1 = require("./constants");
const snapshots_1 = require("./snapshots");
const token_1 = require("./token");
const constants_2 = require("./constants");
/**
 * This file contains the PositionManager class, which is used to
 * make changes to a given position.
 *
 * Schema Version:  3.1.1
 * SDK Version:     1.0.8
 * Author(s):
 *  - @melotik
 *  - @dhruv-chauhan
 */
class PositionManager {
  constructor(account, market, side, interestType = null) {
    this.position = null;
    this.interestType = null;
    this.counterID = account.id
      .toHexString()
      .concat("-")
      .concat(market.id.toHexString())
      .concat("-")
      .concat(side);
    if (interestType) {
      this.counterID = this.counterID.concat("-").concat(interestType);
    }
    const positionCounter = schema_1._PositionCounter.load(this.counterID);
    if (positionCounter) {
      const positionID = positionCounter.id
        .concat("-")
        .concat(positionCounter.nextCount.toString());
      this.position = schema_1.Position.load(positionID);
    }
    this.market = market;
    this.account = account;
    this.side = side;
    this.interestType = interestType;
  }
  getPositionID() {
    if (this.position) {
      return this.position.id;
    }
    return null;
  }
  setCollateral(isCollateral) {
    if (this.position) {
      this.position.isCollateral = isCollateral;
      this.position.save();
    }
  }
  setIsolation(isIsolated) {
    if (this.position) {
      this.position.isIsolated = isIsolated;
      this.position.save();
    }
  }
  addPosition(
    event,
    asset,
    protocol,
    newBalance,
    transactionType,
    priceUSD,
    principal = null
  ) {
    let positionCounter = schema_1._PositionCounter.load(this.counterID);
    if (!positionCounter) {
      positionCounter = new schema_1._PositionCounter(this.counterID);
      positionCounter.nextCount = 0;
      positionCounter.lastTimestamp = event.block.timestamp;
      positionCounter.save();
    }
    const positionID = positionCounter.id
      .concat("-")
      .concat(positionCounter.nextCount.toString());
    let position = schema_1.Position.load(positionID);
    const openPosition = position == null;
    if (!openPosition) {
      // update existing position
      position = position;
      position.balance = newBalance;
      if (principal) position.principal = principal;
      if (transactionType == constants_1.TransactionType.DEPOSIT) {
        position.depositCount += constants_1.INT_ONE;
      } else if (transactionType == constants_1.TransactionType.BORROW) {
        position.borrowCount += constants_1.INT_ONE;
      } else if (transactionType == constants_1.TransactionType.TRANSFER) {
        position.receivedCount += constants_1.INT_ONE;
      }
      // Note: liquidateCount is not incremented here
      position.save();
      this.position = position;
      //
      // take position snapshot
      //
      this.snapshotPosition(event, priceUSD);
      return;
    }
    position = new schema_1.Position(positionID);
    position.account = this.account.id;
    position.market = this.market.id;
    position.asset = asset;
    position.hashOpened = event.transaction.hash;
    position.blockNumberOpened = event.block.number;
    position.timestampOpened = event.block.timestamp;
    position.side = this.side;
    if (this.interestType) {
      position.type = this.interestType;
    }
    position.balance = newBalance;
    if (principal) position.principal = principal;
    position.depositCount = constants_1.INT_ZERO;
    position.withdrawCount = constants_1.INT_ZERO;
    position.borrowCount = constants_1.INT_ZERO;
    position.repayCount = constants_1.INT_ZERO;
    position.liquidationCount = constants_1.INT_ZERO;
    position.transferredCount = constants_1.INT_ZERO;
    position.receivedCount = constants_1.INT_ZERO;
    if (transactionType == constants_1.TransactionType.DEPOSIT) {
      position.depositCount += constants_1.INT_ONE;
    } else if (transactionType == constants_1.TransactionType.BORROW) {
      position.borrowCount += constants_1.INT_ONE;
    } else if (transactionType == constants_1.TransactionType.TRANSFER) {
      position.receivedCount += constants_1.INT_ONE;
    }
    position.save();
    //
    // update account position
    //
    this.account.positionCount += 1;
    this.account.openPositionCount += 1;
    this.account.save();
    //
    // update market position
    //
    this.market.positionCount += 1;
    this.market.openPositionCount += 1;
    if (
      transactionType == constants_1.TransactionType.DEPOSIT ||
      transactionType == constants_1.TransactionType.TRANSFER
    ) {
      this.market.lendingPositionCount += 1;
    } else if (transactionType == constants_1.TransactionType.BORROW) {
      this.market.borrowingPositionCount += 1;
    }
    this.market.save();
    //
    // update protocol position
    //
    protocol.cumulativePositionCount += 1;
    protocol.openPositionCount += 1;
    protocol.save();
    this.position = position;
    //
    // take position snapshot
    //
    this.snapshotPosition(event, priceUSD);
    this.dailyActivePosition(positionCounter, event, protocol);
  }
  subtractPosition(
    event,
    protocol,
    newBalance,
    transactionType,
    priceUSD,
    principal = null
  ) {
    const positionCounter = schema_1._PositionCounter.load(this.counterID);
    if (!positionCounter) {
      graph_ts_1.log.warning(
        "[subtractPosition] position counter {} not found",
        [this.counterID]
      );
      return;
    }
    const positionID = positionCounter.id
      .concat("-")
      .concat(positionCounter.nextCount.toString());
    const position = schema_1.Position.load(positionID);
    if (!position) {
      graph_ts_1.log.warning("[subtractPosition] position {} not found", [
        positionID,
      ]);
      return;
    }
    position.balance = newBalance;
    if (principal) position.principal = principal;
    if (transactionType == constants_1.TransactionType.WITHDRAW) {
      position.withdrawCount += constants_1.INT_ONE;
    } else if (transactionType == constants_1.TransactionType.REPAY) {
      position.repayCount += constants_1.INT_ONE;
    } else if (transactionType == constants_1.TransactionType.TRANSFER) {
      position.transferredCount += constants_1.INT_ONE;
    } else if (transactionType == constants_1.TransactionType.LIQUIDATE) {
      position.liquidationCount += constants_1.INT_ONE;
    }
    position.save();
    const closePosition = position.balance == constants_1.BIGINT_ZERO;
    if (closePosition) {
      //
      // update position counter
      //
      positionCounter.nextCount += constants_1.INT_ONE;
      positionCounter.save();
      //
      // close position
      //
      position.hashClosed = event.transaction.hash;
      position.blockNumberClosed = event.block.number;
      position.timestampClosed = event.block.timestamp;
      position.save();
      //
      // update account position
      //
      this.account.openPositionCount -= constants_1.INT_ONE;
      this.account.closedPositionCount += constants_1.INT_ONE;
      this.account.save();
      //
      // update market position
      //
      this.market.openPositionCount -= constants_1.INT_ONE;
      this.market.closedPositionCount += constants_1.INT_ONE;
      this.market.save();
      //
      // update protocol position
      //
      protocol.openPositionCount -= constants_1.INT_ONE;
      protocol.save();
    }
    this.position = position;
    //
    // update position snapshot
    //
    this.snapshotPosition(event, priceUSD);
    this.dailyActivePosition(positionCounter, event, protocol);
  }
  snapshotPosition(event, priceUSD) {
    const snapshot = new schema_1.PositionSnapshot(
      this.position.id
        .concat("-")
        .concat(event.transaction.hash.toHexString())
        .concat("-")
        .concat(event.logIndex.toString())
    );
    const token = new token_1.TokenManager(this.position.asset, event);
    const mantissaFactorBD = (0, constants_1.exponentToBigDecimal)(
      token.getDecimals()
    );
    snapshot.hash = event.transaction.hash;
    snapshot.logIndex = event.logIndex.toI32();
    snapshot.nonce = event.transaction.nonce;
    snapshot.account = this.account.id;
    snapshot.position = this.position.id;
    snapshot.balance = this.position.balance;
    snapshot.balanceUSD = this.position.balance
      .toBigDecimal()
      .div(mantissaFactorBD)
      .times(priceUSD);
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    if (this.position.principal) snapshot.principal = this.position.principal;
    if (
      this.market.borrowIndex &&
      this.position.side == constants_2.PositionSide.BORROWER
    ) {
      snapshot.index = this.market.borrowIndex;
    } else if (
      this.market.supplyIndex &&
      this.position.side == constants_2.PositionSide.COLLATERAL
    ) {
      snapshot.index = this.market.supplyIndex;
    }
    snapshot.save();
  }
  dailyActivePosition(counter, event, protocol) {
    const lastDay = counter.lastTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const currentDay =
      event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    if (lastDay == currentDay) {
      return;
    }
    // this is a new active position
    const snapshots = new snapshots_1.SnapshotManager(
      event,
      protocol,
      this.market
    );
    snapshots.addDailyActivePosition(this.side);
    counter.lastTimestamp = event.block.timestamp;
    counter.save();
  }
}
exports.PositionManager = PositionManager;
