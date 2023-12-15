"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairType = exports.INT_FIVE = exports.INT_THREE = exports.XGRAIL_ADDRESS = exports.FACTORY_ADDRESS = exports.PROTOCOL_FEE_SHARE_ID = exports.PROTOCOL_SCHEMA_VERSION = exports.PROTOCOL_METHODOLOGY_VERSION = exports.PROTOCOL_SUBGRAPH_VERSION = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = void 0;
const versions_1 = require("../../../../src/versions");
exports.PROTOCOL_NAME = "Camelot V2";
exports.PROTOCOL_SLUG = "camelot-v2";
exports.PROTOCOL_SUBGRAPH_VERSION = versions_1.Versions.getSubgraphVersion();
exports.PROTOCOL_METHODOLOGY_VERSION = versions_1.Versions.getMethodologyVersion();
exports.PROTOCOL_SCHEMA_VERSION = versions_1.Versions.getSchemaVersion();
exports.PROTOCOL_FEE_SHARE_ID = "protocol-fee-share";
exports.FACTORY_ADDRESS = "0x6eccab422d763ac031210895c81787e87b43a652";
exports.XGRAIL_ADDRESS = "0x3caae25ee616f2c8e13c74da0813402eae3f496b";
exports.INT_THREE = 3;
exports.INT_FIVE = 5;
var PairType;
(function (PairType) {
    PairType.VOLATILE = "VOLATILE";
    PairType.STABLE = "STABLE";
})(PairType = exports.PairType || (exports.PairType = {}));
