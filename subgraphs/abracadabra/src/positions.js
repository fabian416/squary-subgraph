"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiquidatePosition =
  exports.updatePositions =
  exports.addAccountToProtocol =
  exports.getOrCreateAccount =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../generated/schema");
const Cauldron_1 = require("../generated/templates/Cauldron/Cauldron");
const constants_1 = require("./common/constants");
const getters_1 = require("./common/getters");
function getOrCreateAccount(accountId, protocol) {
  let account = schema_1.Account.load(accountId);
  if (!account) {
    account = new schema_1.Account(accountId);
    account.positionCount = 0;
    account.openPositionCount = 0;
    account.closedPositionCount = 0;
    account.depositCount = 0;
    account.withdrawCount = 0;
    account.borrowCount = 0;
    account.repayCount = 0;
    account.liquidateCount = 0;
    account.liquidationCount = 0;
    account.save();
    protocol.cumulativeUniqueUsers++;
    protocol.save();
  }
  return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
function addAccountToProtocol(eventType, account, event, protocol) {
  const dailyId = (
    event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY
  ).toString();
  // get daily active account
  const activeEventId = "daily"
    .concat("-")
    .concat(account.id)
    .concat("-")
    .concat(dailyId)
    .concat("-")
    .concat(eventType);
  let activeEvent = schema_1.ActiveEventAccount.load(activeEventId);
  // get cumulative account by event type
  const activeAccountId = account.id.concat("-").concat(eventType);
  let activeAccount = schema_1.ActiveAccount.load(activeAccountId);
  const dailySnapshot = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(
    event
  );
  if (eventType == constants_1.EventType.DEPOSIT) {
    if (!activeAccount) {
      protocol.cumulativeUniqueDepositors++;
      activeAccount = new schema_1.ActiveAccount(activeAccountId);
      activeAccount.save();
    }
    if (!activeEvent) {
      activeEvent = new schema_1.ActiveEventAccount(activeEventId);
      activeEvent.save();
      dailySnapshot.dailyActiveDepositors += 1;
    }
  } else if (eventType == constants_1.EventType.BORROW) {
    if (!activeAccount) {
      protocol.cumulativeUniqueBorrowers++;
      activeAccount = new schema_1.ActiveAccount(activeAccountId);
      activeAccount.save();
    }
    if (!activeEvent) {
      activeEvent = new schema_1.ActiveEventAccount(activeEventId);
      activeEvent.save();
      dailySnapshot.dailyActiveBorrowers += 1;
    }
  } else if (eventType == constants_1.EventType.LIQUIDATOR) {
    if (!activeAccount) {
      protocol.cumulativeUniqueLiquidators++;
      activeAccount = new schema_1.ActiveAccount(activeAccountId);
      activeAccount.save();
    }
    if (!activeEvent) {
      activeEvent = new schema_1.ActiveEventAccount(activeEventId);
      activeEvent.save();
      dailySnapshot.dailyActiveLiquidators += 1;
    }
  } else if (eventType == constants_1.EventType.LIQUIDATEE) {
    if (!activeAccount) {
      protocol.cumulativeUniqueLiquidatees++;
      activeAccount = new schema_1.ActiveAccount(activeAccountId);
      activeAccount.save();
    }
    if (!activeEvent) {
      activeEvent = new schema_1.ActiveEventAccount(activeEventId);
      activeEvent.save();
      dailySnapshot.dailyActiveLiquidatees += 1;
    }
    protocol.save();
  }
  dailySnapshot.cumulativeUniqueDepositors =
    protocol.cumulativeUniqueDepositors;
  dailySnapshot.cumulativeUniqueBorrowers = protocol.cumulativeUniqueBorrowers;
  dailySnapshot.cumulativeUniqueLiquidators =
    protocol.cumulativeUniqueLiquidators;
  dailySnapshot.cumulativeUniqueLiquidatees =
    protocol.cumulativeUniqueLiquidatees;
  dailySnapshot.save();
}
exports.addAccountToProtocol = addAccountToProtocol;
function updatePositions(
  side,
  protocol,
  market,
  eventType,
  account,
  event,
  liquidation = false
) {
  if (
    eventType == constants_1.EventType.DEPOSIT ||
    eventType == constants_1.EventType.BORROW ||
    eventType == constants_1.EventType.LIQUIDATOR ||
    eventType == constants_1.EventType.LIQUIDATEE
  ) {
    graph_ts_1.log.warning("updatePositions: {}", [eventType]);
    addAccountToProtocol(eventType, account, event, protocol);
  }
  const balance = getAccountBalance(
    graph_ts_1.Address.fromString(market.id),
    graph_ts_1.Address.fromString(account.id),
    side
  );
  if (
    eventType == constants_1.EventType.DEPOSIT ||
    eventType == constants_1.EventType.BORROW
  ) {
    // add position
    return addPosition(
      protocol,
      market,
      account,
      balance,
      eventType,
      side,
      event
    ).id;
  } else {
    const position = subtractPosition(
      protocol,
      market,
      account,
      balance,
      side,
      eventType,
      event
    );
    if (!position) {
      return "";
    }
    if (liquidation) {
      position.liquidationCount += 1;
      position.save();
    }
    return position.id;
  }
}
exports.updatePositions = updatePositions;
// grab an individual accounts balances on a market
function getAccountBalance(marketAddress, accountAddress, positionSide) {
  const cauldronContract = Cauldron_1.Cauldron.bind(marketAddress);
  let tryBalance;
  if (positionSide == constants_1.InterestRateSide.BORROW) {
    // grab an accounts MIM borrow from a given collateral mkt
    tryBalance = cauldronContract.try_userBorrowPart(accountAddress);
  } else {
    // grab an accounts inputTokenBalance
    tryBalance = cauldronContract.try_userCollateralShare(accountAddress);
  }
  return tryBalance.reverted ? constants_1.BIGINT_ZERO : tryBalance.value;
}
function getLiquidatePosition(side, marketId, accountId) {
  const positionCounter = schema_1.PositionCounter.load(
    accountId.concat("-").concat(marketId).concat("-").concat(side)
  );
  if (!positionCounter) {
    graph_ts_1.log.warning(
      "No liquidation position found for account {} on market {}",
      [accountId, marketId]
    );
    return "";
  }
  const position = schema_1.Position.load(
    positionCounter.id.concat("-").concat(positionCounter.nextCount.toString())
  );
  if (!position) {
    graph_ts_1.log.warning(
      "No liquidation position found for account {} on market {}",
      [accountId, marketId]
    );
    return "";
  }
  return position.id;
}
exports.getLiquidatePosition = getLiquidatePosition;
// A series of side effects on position added
// They include:
// * Create a new position when needed or reuse the existing position
// * Update position related data in protocol, market, account
// * Take position snapshot
function addPosition(
  protocol,
  market,
  account,
  newBalance,
  eventType,
  side,
  event
) {
  const counterID = account.id
    .concat("-")
    .concat(market.id)
    .concat("-")
    .concat(side);
  let positionCounter = schema_1.PositionCounter.load(counterID);
  if (!positionCounter) {
    positionCounter = new schema_1.PositionCounter(counterID);
    positionCounter.nextCount = 0;
    positionCounter.save();
  }
  const positionID = positionCounter.id
    .concat("-")
    .concat(positionCounter.nextCount.toString());
  let position = schema_1.Position.load(positionID);
  const openPosition = position == null;
  if (!openPosition) {
    position = position;
    position.balance = newBalance;
    if (eventType == constants_1.EventType.DEPOSIT) {
      position.depositCount += 1;
      account.depositCount += 1;
    } else if (eventType == constants_1.EventType.BORROW) {
      position.borrowCount += 1;
      account.borrowCount += 1;
    }
    account.save();
    position.save();
    snapshotPosition(position, event);
    return position;
  }
  // open a new position
  position = new schema_1.Position(positionID);
  position.account = account.id;
  position.market = market.id;
  position.hashOpened = event.transaction.hash.toHexString();
  position.blockNumberOpened = event.block.number;
  position.timestampOpened = event.block.timestamp;
  position.side = side;
  if (side == constants_1.PositionSide.LENDER) {
    position.isCollateral = market.canUseAsCollateral;
  }
  position.balance = newBalance;
  position.depositCount = 0;
  position.withdrawCount = 0;
  position.borrowCount = 0;
  position.repayCount = 0;
  position.liquidationCount = 0;
  if (eventType == constants_1.EventType.DEPOSIT) {
    position.depositCount += 1;
    account.depositCount += 1;
  } else if (eventType == constants_1.EventType.BORROW) {
    position.borrowCount += 1;
    account.borrowCount += 1;
  }
  position.save();
  //
  // update account position
  //
  account.positionCount += 1;
  account.openPositionCount += 1;
  account.save();
  //
  // update market position
  //
  market.positionCount += 1;
  market.openPositionCount += 1;
  if (eventType == constants_1.EventType.DEPOSIT) {
    market.lendingPositionCount += 1;
  } else if (eventType == constants_1.EventType.BORROW) {
    market.borrowingPositionCount += 1;
  }
  market.save();
  //
  // update protocol position
  //
  protocol.cumulativePositionCount += 1;
  protocol.openPositionCount += 1;
  protocol.save();
  //
  // take position snapshot
  //
  snapshotPosition(position, event);
  return position;
}
// A series of side effects on position subtracted
// They include:
// * Close a position when needed or reuse the exisitng position
// * Update position related data in protocol, market, account
// * Take position snapshot
function subtractPosition(
  protocol,
  market,
  account,
  newBalance,
  side,
  eventType,
  event
) {
  const counterID = account.id
    .concat("-")
    .concat(market.id)
    .concat("-")
    .concat(side);
  const positionCounter = schema_1.PositionCounter.load(counterID);
  if (!positionCounter) {
    graph_ts_1.log.warning("[subtractPosition] position counter {} not found", [
      counterID,
    ]);
    return null;
  }
  const positionID = positionCounter.id
    .concat("-")
    .concat(positionCounter.nextCount.toString());
  const position = schema_1.Position.load(positionID);
  if (!position) {
    graph_ts_1.log.warning("[subtractPosition] position {} not found", [
      positionID,
    ]);
    return null;
  }
  position.balance = newBalance;
  if (eventType == constants_1.EventType.WITHDRAW) {
    position.withdrawCount += 1;
    account.withdrawCount += 1;
  } else if (eventType == constants_1.EventType.REPAY) {
    position.repayCount += 1;
    account.repayCount += 1;
  }
  account.save();
  position.save();
  const closePosition = position.balance == constants_1.BIGINT_ZERO;
  if (closePosition) {
    //
    // update position counter
    //
    positionCounter.nextCount += 1;
    positionCounter.save();
    //
    // close position
    //
    position.hashClosed = event.transaction.hash.toHexString();
    position.blockNumberClosed = event.block.number;
    position.timestampClosed = event.block.timestamp;
    position.save();
    //
    // update account position
    //
    account.openPositionCount -= 1;
    account.closedPositionCount += 1;
    account.save();
    //
    // update market position
    //
    market.openPositionCount -= 1;
    market.closedPositionCount += 1;
    market.save();
    //
    // update protocol position
    //
    protocol.openPositionCount -= 1;
    protocol.save();
  }
  //
  // update position snapshot
  //
  snapshotPosition(position, event);
  return position;
}
function snapshotPosition(position, event) {
  const snapshot = new schema_1.PositionSnapshot(
    position.id
      .concat("-")
      .concat(event.transaction.hash.toHexString())
      .concat("-")
      .concat(event.logIndex.toString())
  );
  snapshot.hash = event.transaction.hash.toHexString();
  snapshot.logIndex = event.logIndex.toI32();
  snapshot.nonce = event.transaction.nonce;
  snapshot.position = position.id;
  snapshot.balance = position.balance;
  snapshot.blockNumber = event.block.number;
  snapshot.timestamp = event.block.timestamp;
  snapshot.save();
}
