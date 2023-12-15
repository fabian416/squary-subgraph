"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLACKLIST_TOKENS = exports.DEFAULT_DECIMALS = exports.DEFAULT_USDC_DECIMALS = exports.AAVE_ORACLE_DECIMALS = exports.BIGDECIMAL_USD_PRICE = exports.BIGDECIMAL_ZERO = exports.BIGINT_TEN_THOUSAND = exports.BIGINT_TEN = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.PRICE_LIB_VERSION = exports.CHAIN_LINK_USD_ADDRESS = exports.NULL = void 0;
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
exports.BLACKLIST_TOKENS = [
    graph_ts_1.Address.fromString("0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3"),
    graph_ts_1.Address.fromString("0xd9a8bb44968f35282f1b91c353f77a61baf31a4b"),
    graph_ts_1.Address.fromString("0xbc0071caa8d58a85c9bacbd27bb2b22cbf4ff479"),
    graph_ts_1.Address.fromString("0xd52d9ba6fcbadb1fe1e3aca52cbb72c4d9bbb4ec"),
    graph_ts_1.Address.fromString("0x337dc89ebcc33a337307d58a51888af92cfdc81b"),
    graph_ts_1.Address.fromString("0xbd31ea8212119f94a611fa969881cba3ea06fa3d"),
    graph_ts_1.Address.fromString("0xd2877702675e6ceb975b4a1dff9fb7baf4c91ea9"),
    graph_ts_1.Address.fromString("0x4674672bcddda2ea5300f5207e1158185c944bc0"),
    graph_ts_1.Address.fromString("0x050cbff7bff0432b6096dd15cd9499913ddf8e23"),
    graph_ts_1.Address.fromString("0x924828a9fb17d47d0eb64b57271d10706699ff11"),
    graph_ts_1.Address.fromString("0x363053c3eb5c25bce94f0ce6568fa7292f600614"), // ESMPTOKIN polygon
];
