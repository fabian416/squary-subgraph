"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const account_1 = require("./account");
const protocol_1 = require("./protocol");
const pool_1 = require("./pool");
const tokens_1 = require("./tokens");
const constants_1 = require("../../util/constants");
const events_1 = require("../../util/events");
class SDK {
    constructor(config, pricer, tokenInitializer, event) {
        this.Protocol = protocol_1.Bridge.load(config, pricer, event);
        this.Tokens = new tokens_1.TokenManager(this.Protocol, tokenInitializer);
        this.Accounts = new account_1.AccountManager(this.Protocol, this.Tokens);
        this.Pools = new pool_1.PoolManager(this.Protocol, this.Tokens);
        this.Pricer = pricer;
        this.Protocol.sdk = this;
    }
    static initializeFromEvent(config, pricer, tokenInitializer, event) {
        const customEvent = events_1.CustomEventType.initialize(event.block, event.transaction, event.logIndex, event);
        return new SDK(config, pricer, tokenInitializer, customEvent);
    }
    static initializeFromCall(config, pricer, tokenInitializer, event) {
        const customEvent = events_1.CustomEventType.initialize(event.block, event.transaction, constants_1.BIGINT_ZERO);
        return new SDK(config, pricer, tokenInitializer, customEvent);
    }
    /**
     * @deprecated https://github.com/messari/subgraphs/pull/1595: Use initializeFromEvent or initializeFromCall instead
     */
    static initialize(config, pricer, tokenInitializer, event) {
        if (event instanceof graph_ts_1.ethereum.Event) {
            const customEvent = events_1.CustomEventType.initialize(event.block, event.transaction, event.logIndex, event);
            return new SDK(config, pricer, tokenInitializer, customEvent);
        }
        if (event instanceof graph_ts_1.ethereum.Call) {
            const customEvent = events_1.CustomEventType.initialize(event.block, event.transaction, constants_1.BIGINT_ZERO);
            return new SDK(config, pricer, tokenInitializer, customEvent);
        }
        return new SDK(config, pricer, tokenInitializer, new events_1.CustomEventType());
    }
}
exports.SDK = SDK;
