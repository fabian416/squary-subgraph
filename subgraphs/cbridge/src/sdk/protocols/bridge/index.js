"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK = exports.CustomEventType = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const account_1 = require("./account");
const protocol_1 = require("./protocol");
const pool_1 = require("./pool");
const tokens_1 = require("./tokens");
const constants_1 = require("../../util/constants");
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
    this.address = graph_ts_1.Address.zero();
    this.event = null;
  }
  static initialize(block, transaction, logIndex, address, event = null) {
    const customEvent = new CustomEventType();
    customEvent.block = block;
    customEvent.transaction = transaction;
    customEvent.logIndex = logIndex;
    customEvent.address = address;
    customEvent.event = event;
    return customEvent;
  }
}
exports.CustomEventType = CustomEventType;
class SDK {
  constructor(config, pricer, tokenInitializer, event) {
    this.Protocol = protocol_1.Bridge.load(config, pricer, event);
    this.Tokens = new tokens_1.TokenManager(this.Protocol, tokenInitializer);
    this.Accounts = new account_1.AccountManager(this.Protocol, this.Tokens);
    this.Pools = new pool_1.PoolManager(this.Protocol, this.Tokens);
    this.Pricer = pricer;
    this.Protocol.sdk = this;
  }
  static initialize(config, pricer, tokenInitializer, event) {
    if (event instanceof graph_ts_1.ethereum.Event) {
      const customEvent = CustomEventType.initialize(
        event.block,
        event.transaction,
        event.logIndex,
        event
      );
      return new SDK(config, pricer, tokenInitializer, customEvent);
    }
    if (event instanceof graph_ts_1.ethereum.Call) {
      const customEvent = CustomEventType.initialize(
        event.block,
        event.transaction,
        constants_1.BIGINT_ZERO
      );
      return new SDK(config, pricer, tokenInitializer, customEvent);
    }
    return new SDK(config, pricer, tokenInitializer, new CustomEventType());
  }
}
exports.SDK = SDK;
