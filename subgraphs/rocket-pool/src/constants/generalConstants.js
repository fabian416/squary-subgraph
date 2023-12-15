"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROCKETPOOL_RPL_REWARD_INTERVAL_ID_PREFIX = exports.ROCKETPOOL_PROTOCOL_ROOT_ID = exports.ONE_ETHER_IN_WEI = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
// Used in calculations that handle amounts in WEI.
exports.ONE_ETHER_IN_WEI = graph_ts_1.BigInt.fromI32(1000000000).times(graph_ts_1.BigInt.fromI32(1000000000));
// Represents the RocketPool protocol ID.
exports.ROCKETPOOL_PROTOCOL_ROOT_ID = "ROCKETPOOL - DECENTRALIZED ETH2.0 STAKING PROTOCOL";
// Used as a prefix for RPL reward intervals.
exports.ROCKETPOOL_RPL_REWARD_INTERVAL_ID_PREFIX = "ROCKETPOOL_RPL_REWARD_INTERVAL_ID_";
