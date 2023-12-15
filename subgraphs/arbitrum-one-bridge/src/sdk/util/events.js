"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnixHours = exports.getUnixDays = exports.CustomEventType = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
class CustomEventType {
  constructor() {
    this.block = new graph_ts_1.ethereum.Block(
      graph_ts_1.Bytes.empty(),
      graph_ts_1.Bytes.empty(),
      graph_ts_1.Bytes.empty(),
      graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS),
      graph_ts_1.Bytes.empty(),
      graph_ts_1.Bytes.empty(),
      graph_ts_1.Bytes.empty(),
      constants_1.BIGINT_ZERO,
      constants_1.BIGINT_ZERO,
      constants_1.BIGINT_ZERO,
      constants_1.BIGINT_ZERO,
      constants_1.BIGINT_ZERO,
      constants_1.BIGINT_ZERO,
      null,
      null
    );
    this.transaction = new graph_ts_1.ethereum.Transaction(
      graph_ts_1.Bytes.empty(),
      constants_1.BIGINT_ZERO,
      graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS),
      null,
      constants_1.BIGINT_ZERO,
      constants_1.BIGINT_ZERO,
      constants_1.BIGINT_ZERO,
      graph_ts_1.Bytes.empty(),
      constants_1.BIGINT_ZERO
    );
    this.logIndex = constants_1.BIGINT_ZERO;
    this.event = null;
  }
  static initialize(block, transaction, logIndex, event = null) {
    const customEvent = new CustomEventType();
    customEvent.block = block;
    customEvent.transaction = transaction;
    customEvent.logIndex = logIndex;
    customEvent.event = event;
    return customEvent;
  }
}
exports.CustomEventType = CustomEventType;
function getUnixDays(block) {
  return block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
}
exports.getUnixDays = getUnixDays;
function getUnixHours(block) {
  return block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
}
exports.getUnixHours = getUnixHours;
