"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DECIMALS = exports.DEFAULT_USDC_DECIMALS = exports.AAVE_ORACLE_DECIMALS = exports.BIGDECIMAL_USD_PRICE = exports.BIGDECIMAL_ZERO = exports.BIGINT_TEN_THOUSAND = exports.BIGINT_TEN = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.PRICE_LIB_VERSION = exports.CHAIN_LINK_USD_ADDRESS = exports.NULL = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
///////////////////////////////////////////////////////////////////////////
/////////////////////////////////// COMMON ////////////////////////////////
///////////////////////////////////////////////////////////////////////////
var NULL;
(function (NULL) {
    NULL.TYPE_STRING = "0x0000000000000000000000000000000000000000";
    NULL.TYPE_ADDRESS = graph_ts_1.Address.fromString(NULL.TYPE_STRING);
})(NULL = exports.NULL || (exports.NULL = {}));
exports.CHAIN_LINK_USD_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000348");
exports.PRICE_LIB_VERSION = "1.1.0";
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_TEN_THOUSAND = graph_ts_1.BigInt.fromI32(10000);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_USD_PRICE = graph_ts_1.BigDecimal.fromString("1000000");
exports.AAVE_ORACLE_DECIMALS = 8;
exports.DEFAULT_USDC_DECIMALS = 6;
exports.DEFAULT_DECIMALS = graph_ts_1.BigInt.fromI32(18);
