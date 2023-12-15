"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STANDARD_FEE = exports.PRECISION_BD = exports.ORACLE = exports.VAULT_NAME = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.PROTOCOL_NAME = "Gains Trade";
exports.PROTOCOL_SLUG = "gains-trade";
exports.VAULT_NAME = "gDAI Vault";
exports.ORACLE = "chainlink";
exports.PRECISION_BD = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromString("10000000000"));
exports.STANDARD_FEE = graph_ts_1.BigInt.fromI32(6)
    .toBigDecimal()
    .div(graph_ts_1.BigInt.fromI32(100).toBigDecimal());
