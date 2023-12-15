"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MASTERCHEFV2_SUSHI_PER_BLOCK = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = exports.PROTOCOL_METHODOLOGY_VERSION = exports.PROTOCOL_SUBGRAPH_VERSION = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
//////Versions//////
////////////////////
const versions_1 = require("../../../../src/versions");
exports.PROTOCOL_SUBGRAPH_VERSION = versions_1.Versions.getSubgraphVersion();
exports.PROTOCOL_METHODOLOGY_VERSION = versions_1.Versions.getMethodologyVersion();
exports.PROTOCOL_NAME = "SushiSwap";
exports.PROTOCOL_SLUG = "sushiswap";
exports.MASTERCHEFV2_SUSHI_PER_BLOCK = graph_ts_1.BigInt.fromI64(20000000000000000000);
