"use strict";
////////////////////
//////Versions//////
////////////////////
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = exports.PROTOCOL_METHODOLOGY_VERSION = exports.PROTOCOL_SUBGRAPH_VERSION = void 0;
const versions_1 = require("../../../../src/versions");
exports.PROTOCOL_SUBGRAPH_VERSION = versions_1.Versions.getSubgraphVersion();
exports.PROTOCOL_METHODOLOGY_VERSION = versions_1.Versions.getMethodologyVersion();
exports.PROTOCOL_NAME = "ApeSwap";
exports.PROTOCOL_SLUG = "apeswap";
