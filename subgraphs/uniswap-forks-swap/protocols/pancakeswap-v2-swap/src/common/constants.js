"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = exports.PROTOCOL_METHODOLOGY_VERSION = exports.PROTOCOL_SUBGRAPH_VERSION = void 0;
////////////////////
//////Versions/////
////////////////////
const versions_1 = require("../../../../src/versions");
exports.PROTOCOL_SUBGRAPH_VERSION = versions_1.Versions.getSubgraphVersion();
exports.PROTOCOL_METHODOLOGY_VERSION = versions_1.Versions.getMethodologyVersion();
exports.PROTOCOL_NAME = "Pancakeswap V2 - Swap";
exports.PROTOCOL_SLUG = "pancakeswap-v2-swap";
