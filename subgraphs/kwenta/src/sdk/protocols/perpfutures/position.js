"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Position = exports.PositionManager = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("../../util/constants"));
const schema_1 = require("../../../../generated/schema");
/**
 * This file contains the Position class, which is used to
 * make all of the storage changes that occur in the position and
 * its corresponding snapshots.
 *
 * Schema Version:  1.3.3
 * SDK Version:     1.1.6
 * Author(s):
 *  - @harsh9200
 *  - @dhruv-chauhan
 *  - @dmelotik
 */
class LoadPositionResponse {
    constructor(position, isNewPosition) {
        this.position = position;
        this.isNewPosition = isNewPosition;
    }
}
class PositionManager {
    constructor(protocol, tokens) {
        this.protocol = protocol;
        this.tokens = tokens;
    }
    getPositionId(pool, account, getLastPosition = false) {
        const positionId = account
            .getBytesId()
            .concat(graph_ts_1.Bytes.fromUTF8("-"))
            .concat(pool.getBytesID());
        let positionCounter = schema_1._PositionCounter.load(positionId);
        if (!positionCounter) {
            positionCounter = new schema_1._PositionCounter(positionId);
            positionCounter.nextCount = 0;
            positionCounter.save();
        }
        else if (!getLastPosition) {
            positionCounter.nextCount += 1;
            positionCounter.save();
        }
        return positionCounter.id
            .concat(graph_ts_1.Bytes.fromUTF8("-"))
            .concatI32(positionCounter.nextCount);
    }
    loadLastPosition(pool, account) {
        const positionId = this.getPositionId(pool, account, true);
        const entity = schema_1.Position.load(positionId);
        if (entity != null) {
            return new Position(this.protocol, this.tokens, pool, account, entity, true);
        }
        return null;
    }
    loadPosition(pool, account, asset, collateral, positionSide, eventPosition, getLastPosition = false) {
        let positionId = this.getPositionId(pool, account, getLastPosition);
        let openPosition = false;
        let entity = schema_1.Position.load(positionId);
        // if entity.hashClosed is not null that means last position is closed, and we have to open a new position
        if (entity != null && !!entity.hashClosed) {
            positionId = this.getPositionId(pool, account, false);
            entity = null;
            openPosition = true;
        }
        if (!entity) {
            openPosition = true;
            entity = new schema_1.Position(positionId);
            entity.account = account.getBytesId();
            entity.liquidityPool = pool.getBytesID();
            entity.collateral = collateral.id;
            entity.asset = asset.id;
            const event = this.protocol.getCurrentEvent();
            entity.hashOpened = event.transaction.hash;
            entity.blockNumberOpened = event.block.number;
            entity.timestampOpened = event.block.timestamp;
            entity.side = positionSide;
            entity.fundingrateOpen = constants.BIGDECIMAL_ZERO;
            entity.leverage = constants.BIGDECIMAL_ZERO;
            entity.balance = constants.BIGINT_ZERO;
            entity.balanceUSD = constants.BIGDECIMAL_ZERO;
            entity.collateralBalance = constants.BIGINT_ZERO;
            entity.collateralBalanceUSD = constants.BIGDECIMAL_ZERO;
            entity.collateralInCount = 0;
            entity.collateralOutCount = 0;
            entity.liquidationCount = 0;
            entity.price = eventPosition.params.lastPrice;
            entity.fundingIndex = eventPosition.params.fundingIndex;
            entity.size = eventPosition.params.size;
            entity.save();
        }
        const position = new Position(this.protocol, this.tokens, pool, account, entity, openPosition);
        return new LoadPositionResponse(position, openPosition);
    }
}
exports.PositionManager = PositionManager;
class Position {
    constructor(protocol, tokens, pool, account, position, openPosition = true) {
        this.protocol = protocol;
        this.tokens = tokens;
        this.pool = pool;
        this.account = account;
        this.position = position;
        if (openPosition) {
            this.openPosition();
        }
    }
    getBytesID() {
        return this.position.id;
    }
    getRealisedPnlUsd() {
        return this.position.realisedPnlUSD !== null
            ? this.position.realisedPnlUSD
            : constants.BIGDECIMAL_ZERO;
    }
    getFundingIndex() {
        return this.position.fundingIndex;
    }
    getSize() {
        return this.position.size;
    }
    getPrice() {
        return this.position.price;
    }
    save() {
        this.position.save();
        this.takePositionSnapshot();
    }
    openPosition() {
        this.account.openPosition(this.position.side);
        this.pool.openPosition(this.position.side);
        this.protocol.openPosition(this.position.side);
    }
    closePosition() {
        const event = this.protocol.getCurrentEvent();
        this.position.hashClosed = event.transaction.hash;
        this.position.blockNumberClosed = event.block.number;
        this.position.timestampClosed = event.block.timestamp;
        this.save();
        this.account.closePosition(this.position.side);
        this.pool.closePosition(this.position.side);
        this.protocol.closePosition(this.position.side);
    }
    /**
     * Sets the position's fundingrateOpen value.
     * @param amount
     */
    setFundingrateOpen(amount) {
        this.position.fundingrateOpen = amount;
        this.save();
    }
    setPrice(amount) {
        this.position.price = amount;
        this.save();
    }
    setSize(amount) {
        this.position.size = amount;
        this.save();
    }
    setFundingIndex(amount) {
        this.position.fundingIndex = amount;
        this.save();
    }
    /**
     * Sets the position's fundingrateClosed value.
     * @param amount
     */
    setFundingrateClosed(amount) {
        this.position.fundingrateClosed = amount;
        this.save();
    }
    /**
     * Sets the position's leverage value.
     * @param amount
     */
    setLeverage(amount) {
        this.position.leverage = amount;
        this.save();
    }
    /**
     * Sets the position's balance value.
     * @param token
     * @param amount
     */
    setBalance(token, amount) {
        this.position.balance = amount;
        this.position.balanceUSD = this.protocol
            .getTokenPricer()
            .getAmountValueUSD(token, amount, this.protocol.event.block);
        this.save();
    }
    /**
     * Sets the position's collateralBalance value.
     * @param token
     * @param amount
     */
    setCollateralBalance(token, amount) {
        this.position.collateralBalance = amount;
        this.position.collateralBalanceUSD = this.protocol
            .getTokenPricer()
            .getAmountValueUSD(token, amount, this.protocol.event.block);
        this.save();
    }
    /**
     * Sets the position's closeBalanceUSD value.
     * @param token
     * @param amount
     */
    setBalanceClosed(token, amount) {
        this.position.closeBalanceUSD = this.protocol
            .getTokenPricer()
            .getAmountValueUSD(token, amount, this.protocol.event.block);
        this.save();
    }
    /**
     * Sets the position's closeCollateralBalanceUSD value.
     * @param token
     * @param amount
     */
    setCollateralBalanceClosed(token, amount) {
        this.position.closeCollateralBalanceUSD = this.protocol
            .getTokenPricer()
            .getAmountValueUSD(token, amount, this.protocol.event.block);
        this.save();
    }
    /**
     * Sets the position's realisedPnlUSD value.
     * @param token
     * @param amount
     */
    setRealisedPnlClosed(token, amount) {
        this.position.realisedPnlUSD = this.protocol
            .getTokenPricer()
            .getAmountValueUSD(token, amount, this.protocol.event.block);
        this.save();
    }
    setRealisedPnlUsdClosed(amount) {
        this.position.realisedPnlUSD = amount;
        this.save();
    }
    /**
     * Adds 1 to the account position collateralIn count.
     */
    addCollateralInCount() {
        this.position.collateralInCount += 1;
        this.save();
    }
    /**
     * Adds 1 to the account position collateralOut count.
     */
    addCollateralOutCount() {
        this.position.collateralOutCount += 1;
        this.save();
    }
    /**
     * Adds 1 to the account position liquidation count.
     */
    addLiquidationCount() {
        this.position.liquidationCount += 1;
        this.save();
    }
    takePositionSnapshot() {
        const event = this.protocol.getCurrentEvent();
        const snapshotId = this.position.id
            .concat(event.transaction.hash)
            .concat(graph_ts_1.Bytes.fromUTF8(event.transaction.index.toString()));
        const snapshot = new schema_1.PositionSnapshot(snapshotId);
        snapshot.hash = event.transaction.hash;
        snapshot.logIndex = event.transaction.index.toI32();
        snapshot.nonce = event.transaction.nonce;
        snapshot.position = this.position.id;
        snapshot.account = this.position.account;
        snapshot.fundingrate = this.position.fundingrateOpen;
        snapshot.balance = this.position.balance;
        snapshot.collateralBalance = this.position.collateralBalance;
        snapshot.balanceUSD = this.position.balanceUSD;
        snapshot.collateralBalanceUSD = this.position.collateralBalanceUSD;
        snapshot.realisedPnlUSD = this.position.realisedPnlUSD;
        snapshot.blockNumber = this.protocol.event.block.number;
        snapshot.timestamp = this.protocol.event.block.timestamp;
        snapshot.save();
    }
}
exports.Position = Position;
