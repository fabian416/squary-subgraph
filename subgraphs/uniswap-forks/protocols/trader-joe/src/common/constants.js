"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRADER_JOE_AVALANCHE_REWARD_TOKEN_RATE = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = exports.PROTOCOL_METHODOLOGY_VERSION = exports.PROTOCOL_SUBGRAPH_VERSION = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
//////Versions//////
////////////////////
const versions_1 = require("../../../../src/versions");
exports.PROTOCOL_SUBGRAPH_VERSION = versions_1.Versions.getSubgraphVersion();
exports.PROTOCOL_METHODOLOGY_VERSION = versions_1.Versions.getMethodologyVersion();
exports.PROTOCOL_NAME = "Trader Joe";
exports.PROTOCOL_SLUG = "trader-joe";
exports.TRADER_JOE_AVALANCHE_REWARD_TOKEN_RATE = graph_ts_1.BigInt.fromString("30000000000000000000");
