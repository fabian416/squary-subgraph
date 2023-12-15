"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPositionBalances = exports.updateSPUserPositionBalances = exports.incrementPositionLiquidationCount = exports.incrementPositionRepayCount = exports.incrementPositionBorrowCount = exports.incrementPositionWithdrawCount = exports.incrementPositionDepositCount = exports.getOrCreatePositionSnapshot = exports.getOrCreateUserPosition = exports.getUserPosition = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const constants_2 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const account_1 = require("./account");
const event_1 = require("./event");
const market_1 = require("./market");
const token_1 = require("./token");
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
    if (constants_2.PositionSide.LENDER == positionSide) {
        (0, market_1.openMarketLenderPosition)(market);
    }
    else {
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
    if (constants_2.PositionSide.LENDER == positionSide) {
        position.isCollateral = true;
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
function updateSPUserPositionBalances(event, sp, depositor, newBalance) {
    const account = (0, account_1.getOrCreateAccount)(depositor);
    const position = getOrCreateUserPosition(event, account, sp, constants_2.PositionSide.LENDER);
    const delta = newBalance.minus(position.balance);
    position.balance = newBalance;
    if (position.balance.equals(constants_1.BIGINT_ZERO)) {
        closePosition(event, account, sp, position);
    }
    position.save();
    getOrCreatePositionSnapshot(event, position);
    const deltaUSD = (0, token_1.getCurrentLUSDPrice)().times((0, numbers_1.bigIntToBigDecimal)(delta));
    if (delta.gt(constants_1.BIGINT_ZERO)) {
        (0, event_1.createDeposit)(event, sp, graph_ts_1.Address.fromString(constants_1.LUSD_ADDRESS), delta, deltaUSD, depositor);
    } // negative doesn't imply withdrawal.
}
exports.updateSPUserPositionBalances = updateSPUserPositionBalances;
function updateUserPositionBalances(event, trove) {
    const market = (0, market_1.getOrCreateMarket)();
    const account = (0, account_1.getOrCreateAccount)(graph_ts_1.Address.fromString(trove.id));
    const borrowerPosition = getOrCreateUserPosition(event, account, market, constants_2.PositionSide.BORROWER);
    borrowerPosition.balance = trove.debt;
    if (borrowerPosition.balance.equals(constants_1.BIGINT_ZERO)) {
        closePosition(event, account, market, borrowerPosition);
    }
    borrowerPosition.save();
    getOrCreatePositionSnapshot(event, borrowerPosition);
    const lenderPosition = getOrCreateUserPosition(event, account, market, constants_2.PositionSide.LENDER);
    lenderPosition.balance = trove.collateral;
    if (lenderPosition.balance.equals(constants_1.BIGINT_ZERO)) {
        closePosition(event, account, market, lenderPosition);
    }
    lenderPosition.save();
    getOrCreatePositionSnapshot(event, lenderPosition);
}
exports.updateUserPositionBalances = updateUserPositionBalances;
function closePosition(event, account, market, position) {
    position.blockNumberClosed = event.block.number;
    position.timestampClosed = event.block.timestamp;
    position.hashClosed = event.transaction.hash.toHexString();
    if (position.side == constants_2.PositionSide.LENDER) {
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
