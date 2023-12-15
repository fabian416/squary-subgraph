"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePositionRealisedPnlUSD = exports.getPositionIdWithKey = exports.createPositionMap = exports.createPositionSnapshot = exports.updateUserPosition = exports.getOrCreateUserPosition = exports.createUserPosition = exports.getUserPosition = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const account_1 = require("./account");
const pool_1 = require("./pool");
const event_1 = require("./event");
const constants_1 = require("../utils/constants");
function getUserPosition(account, pool, collateralTokenAddress, indexTokenAddress, positionSide) {
    const positionId = getPositionID(account, pool, collateralTokenAddress, indexTokenAddress, positionSide);
    return schema_1.Position.load(positionId);
}
exports.getUserPosition = getUserPosition;
function createUserPosition(event, account, pool, collateralTokenAddress, indexTokenAddress, positionSide) {
    const positionId = getPositionID(account, pool, collateralTokenAddress, indexTokenAddress, positionSide);
    const position = new schema_1.Position(positionId);
    position.account = account.id;
    position.liquidityPool = pool.id;
    position.hashOpened = event.transaction.hash;
    position.blockNumberOpened = event.block.number;
    position.timestampOpened = event.block.timestamp;
    position.collateral = collateralTokenAddress;
    position.asset = indexTokenAddress;
    position.side = positionSide;
    position.fundingrateOpen = constants_1.BIGDECIMAL_ZERO;
    const fundingTokenIndex = pool.inputTokens.indexOf(collateralTokenAddress);
    if (fundingTokenIndex >= 0) {
        position.fundingrateOpen = pool.fundingrate[fundingTokenIndex];
    }
    position.fundingrateClosed = constants_1.BIGDECIMAL_ZERO;
    position.leverage = constants_1.BIGDECIMAL_ZERO;
    position.balance = constants_1.BIGINT_ZERO;
    position.collateralBalance = constants_1.BIGINT_ZERO;
    position.balanceUSD = constants_1.BIGDECIMAL_ZERO;
    position.collateralBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    position.collateralInCount = constants_1.INT_ZERO;
    position.collateralOutCount = constants_1.INT_ZERO;
    position.liquidationCount = constants_1.INT_ZERO;
    position.save();
    (0, account_1.incrementAccountOpenPositionCount)(account, positionSide);
    (0, pool_1.incrementPoolOpenPositionCount)(event, pool, positionSide);
    return position;
}
exports.createUserPosition = createUserPosition;
function getOrCreateUserPosition(event, account, pool, collateralTokenAddress, indexTokenAddress, positionSide) {
    const position = getUserPosition(account, pool, collateralTokenAddress, indexTokenAddress, positionSide);
    if (position) {
        return position;
    }
    return createUserPosition(event, account, pool, collateralTokenAddress, indexTokenAddress, positionSide);
}
exports.getOrCreateUserPosition = getOrCreateUserPosition;
function updateUserPosition(event, account, pool, collateralTokenAddress, collateralBalance, collateralBalanceUSD, indexTokenAddress, balance, balanceUSD, pnlUSD, positionSide, eventType) {
    const position = getOrCreateUserPosition(event, account, pool, collateralTokenAddress, indexTokenAddress, positionSide);
    switch (eventType) {
        case event_1.EventType.CollateralIn:
            position.collateralInCount += constants_1.INT_ONE;
            break;
        case event_1.EventType.CollateralOut:
            position.collateralOutCount += constants_1.INT_ONE;
            break;
        case event_1.EventType.Liquidated:
            position.liquidationCount += constants_1.INT_ONE;
            break;
        default:
            break;
    }
    const prevBalanceUSD = position.balanceUSD;
    const prevCollateralBalanceUSD = position.collateralBalanceUSD;
    position.balance = balance;
    position.balanceUSD = balanceUSD;
    position.collateralBalance = collateralBalance;
    position.collateralBalanceUSD = collateralBalanceUSD;
    if (position.collateralBalanceUSD != constants_1.BIGDECIMAL_ZERO) {
        position.leverage = position.balanceUSD.div(position.collateralBalanceUSD);
    }
    position.save();
    if (eventType != event_1.EventType.CollateralIn && position.balance == constants_1.BIGINT_ZERO) {
        closePosition(event, account, pool, position, prevBalanceUSD, prevCollateralBalanceUSD, pnlUSD);
    }
    createPositionSnapshot(event, position);
    return position;
}
exports.updateUserPosition = updateUserPosition;
function createPositionSnapshot(event, position) {
    const id = position.id
        .concat(event.transaction.hash)
        .concatI32(event.transactionLogIndex.toI32());
    const snapshot = new schema_1.PositionSnapshot(id);
    snapshot.account = position.account;
    snapshot.hash = event.transaction.hash;
    snapshot.logIndex = event.transactionLogIndex.toI32();
    snapshot.nonce = event.transaction.nonce;
    snapshot.position = position.id;
    snapshot.fundingrate = position.fundingrateOpen;
    snapshot.balance = position.balance;
    snapshot.collateralBalance = position.collateralBalance;
    snapshot.balanceUSD = position.balanceUSD;
    snapshot.collateralBalanceUSD = position.collateralBalanceUSD;
    snapshot.realisedPnlUSD = position.realisedPnlUSD;
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    snapshot.save();
}
exports.createPositionSnapshot = createPositionSnapshot;
function createPositionMap(positionKey, account, pool, collateralTokenAddress, indexTokenAddress, positionSide) {
    const positionMap = new schema_1._PositionMap(positionKey);
    positionMap.positionId = getPositionID(account, pool, collateralTokenAddress, indexTokenAddress, positionSide);
    positionMap.save();
    return positionMap;
}
exports.createPositionMap = createPositionMap;
function getPositionIdWithKey(positionKey) {
    const positionMap = schema_1._PositionMap.load(positionKey);
    if (positionMap) {
        return positionMap.positionId;
    }
    return null;
}
exports.getPositionIdWithKey = getPositionIdWithKey;
function updatePositionRealisedPnlUSD(positionKey, realisedPnlUSD) {
    const positionMap = schema_1._PositionMap.load(positionKey);
    if (!positionMap) {
        return;
    }
    const position = schema_1.Position.load(positionMap.positionId);
    if (!position) {
        return;
    }
    position.realisedPnlUSD = realisedPnlUSD;
    position.save();
}
exports.updatePositionRealisedPnlUSD = updatePositionRealisedPnlUSD;
function closePosition(event, account, pool, position, prevBalanceUSD, prevCollateralBalanceUSD, pnlUSD) {
    const fundingTokenIndex = pool.inputTokens.indexOf(position.collateral);
    if (fundingTokenIndex >= 0) {
        position.fundingrateClosed = pool.fundingrate[fundingTokenIndex];
    }
    position.leverage = constants_1.BIGDECIMAL_ZERO;
    position.balance = constants_1.BIGINT_ZERO;
    position.balanceUSD = constants_1.BIGDECIMAL_ZERO;
    position.collateralBalance = constants_1.BIGINT_ZERO;
    position.collateralBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    position.closeBalanceUSD = prevBalanceUSD;
    position.closeCollateralBalanceUSD = prevCollateralBalanceUSD;
    if (pnlUSD) {
        position.realisedPnlUSD = pnlUSD;
    }
    position.hashClosed = event.transaction.hash;
    position.blockNumberClosed = event.block.number;
    position.timestampClosed = event.block.timestamp;
    position.save();
    const counterID = account.id
        .concat(pool.id)
        .concat(graph_ts_1.Bytes.fromUTF8(position.side))
        .concat(position.collateral)
        .concat(position.asset);
    const positionCounter = schema_1._PositionCounter.load(counterID);
    if (positionCounter) {
        positionCounter.nextCount += constants_1.INT_ONE;
        positionCounter.save();
    }
    (0, account_1.decrementAccountOpenPositionCount)(account, position.side);
    (0, pool_1.decrementPoolOpenPositionCount)(event, pool, position.side);
}
function getPositionID(account, pool, collateralTokenAddress, indexTokenAddress, positionSide) {
    const counterID = account.id
        .concat(pool.id)
        .concat(graph_ts_1.Bytes.fromUTF8(positionSide))
        .concat(collateralTokenAddress)
        .concat(indexTokenAddress);
    let positionCounter = schema_1._PositionCounter.load(counterID);
    if (!positionCounter) {
        positionCounter = new schema_1._PositionCounter(counterID);
        positionCounter.nextCount = 0;
        positionCounter.save();
    }
    return positionCounter.id.concatI32(positionCounter.nextCount);
}
