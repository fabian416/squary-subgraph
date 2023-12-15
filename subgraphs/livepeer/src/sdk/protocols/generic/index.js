"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK = void 0;
const pool_1 = require("./pool");
const account_1 = require("./account");
const protocol_1 = require("./protocol");
const constants_1 = require("../../util/constants");
const events_1 = require("../../util/events");
const tokens_1 = require("./tokens");
/**
 * This file contains the SDK class, which initializes
 * all managers from event or call.
 * Schema Version:  2.1.1
 * SDK Version:     1.0.0
 * Author(s):
 *  - @steegecs
 *  - @shashwatS22

 */
class SDK {
    constructor(config, pricer, tokenInitializer, event) {
        this.Protocol = protocol_1.ProtocolManager.load(config, pricer, event);
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
}
exports.SDK = SDK;
