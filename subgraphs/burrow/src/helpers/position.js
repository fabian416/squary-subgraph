"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreatePositionSnapshot = exports.getOrCreatePosition = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const const_1 = require("../utils/const");
function getOrCreatePosition(account, market, side, receipt, count) {
  const id = account.id
    .concat("-")
    .concat(market.id)
    .concat("-")
    .concat(side)
    .concat("-")
    .concat(count.toString());
  let position = schema_1.Position.load(id);
  if (!position) {
    const currTimestamp = graph_ts_1.BigInt.fromU64(
      (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
    );
    position = new schema_1.Position(id);
    position.account = account.id;
    position.market = market.id;
    position.hashOpened = receipt.receipt.id.toBase58();
    position.hashClosed = null;
    position.blockNumberOpened = graph_ts_1.BigInt.fromU64(
      receipt.block.header.height
    );
    position.blockNumberClosed = null;
    position.timestampOpened = currTimestamp;
    position.timestampClosed = null;
    position.side = side;
    position.isCollateral = true;
    position.balance = const_1.BI_ZERO;
    position.depositCount = 0;
    position.withdrawCount = 0;
    position.borrowCount = 0;
    position.repayCount = 0;
    position.liquidationCount = 0;
    position._lastActiveTimestamp = currTimestamp;
    position.save();
    account.openPositionCount += 1;
    account.positionCount += 1;
    market.openPositionCount += 1;
    market.positionCount += 1;
    if (side == "LENDER") {
      market.lendingPositionCount += 1;
    } else {
      market.borrowingPositionCount += 1;
    }
  }
  return position;
}
exports.getOrCreatePosition = getOrCreatePosition;
function getOrCreatePositionSnapshot(position, receipt) {
  const id = position.id
    .concat("-")
    .concat(position.timestampOpened.toString());
  let snapshot = schema_1.PositionSnapshot.load(id);
  if (!snapshot) {
    snapshot = new schema_1.PositionSnapshot(id);
    snapshot.position = position.id;
    snapshot.timestamp = graph_ts_1.BigInt.fromU64(
      (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
    );
    snapshot.blockNumber = graph_ts_1.BigInt.fromU64(
      receipt.block.header.height
    );
    snapshot.nonce = const_1.BI_ZERO;
    snapshot.logIndex = 0;
    snapshot.hash = receipt.outcome.id.toBase58();
    snapshot.balance = position.balance;
    snapshot.save();
  }
  return snapshot;
}
exports.getOrCreatePositionSnapshot = getOrCreatePositionSnapshot;
