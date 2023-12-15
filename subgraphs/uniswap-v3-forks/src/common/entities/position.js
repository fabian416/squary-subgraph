"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePositionSnapshot = exports.getOrCreatePosition = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../configurations/configure");
const NonFungiblePositionManager_1 = require("../../../generated/NonFungiblePositionManager/NonFungiblePositionManager");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../constants");
function getOrCreatePosition(event, tokenId) {
    const id = graph_ts_1.Bytes.fromHexString("xPosition-").concatI32(tokenId.toI32());
    let position = schema_1.Position.load(id);
    if (position === null) {
        const contract = NonFungiblePositionManager_1.NonFungiblePositionManager.bind(event.address);
        const positionCall = contract.try_positions(tokenId);
        if (!positionCall.reverted) {
            const positionResult = positionCall.value;
            const poolAddress = configure_1.NetworkConfigs.getFactoryContract().getPool(positionResult.value2, positionResult.value3, positionResult.value4);
            position = new schema_1.Position(id);
            // Gets updated on transfer events
            position.account = event.transaction.from;
            position.pool = poolAddress;
            position.hashOpened = event.transaction.hash;
            position.blockNumberOpened = event.block.number;
            position.timestampOpened = event.block.timestamp;
            position.liquidityTokenType = constants_1.TokenType.ERC721;
            position.liquidity = constants_1.BIGINT_ZERO;
            position.liquidityUSD = constants_1.BIGDECIMAL_ZERO;
            position.tickLower = position.pool.concatI32(positionResult.value5);
            position.tickUpper = position.pool.concatI32(positionResult.value6);
            position.cumulativeDepositTokenAmounts = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
            position.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
            position.cumulativeWithdrawTokenAmounts = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
            position.cumulativeWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
            position.depositCount = constants_1.INT_ZERO;
            position.withdrawCount = constants_1.INT_ZERO;
            position.save();
        }
    }
    return position;
}
exports.getOrCreatePosition = getOrCreatePosition;
// Save Position Snapshot
function savePositionSnapshot(position, event) {
    const id = graph_ts_1.Bytes.fromHexString("xPositionSnapshot-").concat(event.transaction.hash);
    const positionSnapshot = new schema_1.PositionSnapshot(id);
    positionSnapshot.hash = event.transaction.hash;
    positionSnapshot.logIndex = event.logIndex.toI32();
    positionSnapshot.nonce = event.transaction.nonce;
    positionSnapshot.position = position.id;
    positionSnapshot.liquidity = position.liquidity;
    positionSnapshot.liquidityUSD = position.liquidityUSD;
    positionSnapshot.cumulativeDepositTokenAmounts =
        position.cumulativeDepositTokenAmounts;
    positionSnapshot.cumulativeDepositUSD = position.cumulativeDepositUSD;
    positionSnapshot.cumulativeWithdrawTokenAmounts =
        position.cumulativeWithdrawTokenAmounts;
    positionSnapshot.cumulativeWithdrawUSD = position.cumulativeWithdrawUSD;
    positionSnapshot.depositCount = position.depositCount;
    positionSnapshot.withdrawCount = position.withdrawCount;
    positionSnapshot.blockNumber = event.block.number;
    positionSnapshot.timestamp = event.block.timestamp;
    positionSnapshot.save();
}
exports.savePositionSnapshot = savePositionSnapshot;
