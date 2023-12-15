"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLACKLISTED_TOKENS = exports.NATIVE_TOKEN_STRING = exports.STABLE_TOKENS = exports.STABLE_TOKENS_STRINGS = exports.BIGINT_THIRTY = exports.INT_SEVEN = exports.INT_EIGHT = exports.DEFAULT_DECIMALS = exports.PRICE_CHANGE_BUFFER_LIMIT = exports.DEFAULT_AAVE_ORACLE_DECIMALS = exports.DEFAULT_USDC_DECIMALS = exports.BIGDECIMAL_TEN_BILLION = exports.BIGDECIMAL_FIVE_PERCENT = exports.BIGDECIMAL_USD_PRICE = exports.BIGDECIMAL_NEG_ONE = exports.BIGDECIMAL_ZERO = exports.BIGDECIMAL_TEN = exports.BIGDECIMAL_TWO = exports.BIGINT_TEN_THOUSAND = exports.BIGINT_NEG_ONE = exports.BIGINT_TEN = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.ETH_ADDRESS = exports.CHAIN_LINK_USD_ADDRESS = exports.NULL = exports.OracleType = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
///////////////////////////////////////////////////////////////////////////
/////////////////////////////////// COMMON ////////////////////////////////
///////////////////////////////////////////////////////////////////////////
var OracleType;
(function (OracleType) {
    OracleType.AAVE_ORACLE = "AaveOracle";
    OracleType.INCH_ORACLE = "InchOracle";
    OracleType.CURVE_ROUTER = "CurveRouter";
    OracleType.CHAINLINK_FEED = "ChainlinkFeed";
    OracleType.YEARN_LENS_ORACLE = "YearnLensOracle";
    OracleType.CURVE_CALCULATIONS = "CurveCalculations";
    OracleType.UNISWAP_FORKS_ROUTER = "UniswapForksRouter";
    OracleType.SUSHI_CALCULATIONS = "SushiswapCalculations";
})(OracleType = exports.OracleType || (exports.OracleType = {}));
var NULL;
(function (NULL) {
    NULL.TYPE_STRING = "0x0000000000000000000000000000000000000000";
    NULL.TYPE_ADDRESS = graph_ts_1.Address.fromString(NULL.TYPE_STRING);
})(NULL = exports.NULL || (exports.NULL = {}));
exports.CHAIN_LINK_USD_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000348");
exports.ETH_ADDRESS = graph_ts_1.Address.fromString("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_NEG_ONE = graph_ts_1.BigInt.fromI32(-1);
exports.BIGINT_TEN_THOUSAND = graph_ts_1.BigInt.fromI32(10000);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_TEN = new graph_ts_1.BigDecimal(exports.BIGINT_TEN);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_NEG_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_NEG_ONE);
exports.BIGDECIMAL_USD_PRICE = graph_ts_1.BigDecimal.fromString("1000000");
exports.BIGDECIMAL_FIVE_PERCENT = graph_ts_1.BigDecimal.fromString("0.05");
exports.BIGDECIMAL_TEN_BILLION = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromString("10000000000"));
exports.DEFAULT_USDC_DECIMALS = 6;
exports.DEFAULT_AAVE_ORACLE_DECIMALS = 8;
exports.PRICE_CHANGE_BUFFER_LIMIT = 5;
exports.DEFAULT_DECIMALS = graph_ts_1.BigInt.fromI32(18);
exports.INT_EIGHT = 8;
exports.INT_SEVEN = 7;
exports.BIGINT_THIRTY = graph_ts_1.BigInt.fromI32(30);
var STABLE_TOKENS_STRINGS;
(function (STABLE_TOKENS_STRINGS) {
    STABLE_TOKENS_STRINGS.USDC = "USDC";
    STABLE_TOKENS_STRINGS.WETH = "WETH";
    STABLE_TOKENS_STRINGS.USDT = "USDT";
    STABLE_TOKENS_STRINGS.DAI = "DAI";
})(STABLE_TOKENS_STRINGS = exports.STABLE_TOKENS_STRINGS || (exports.STABLE_TOKENS_STRINGS = {}));
exports.STABLE_TOKENS = ["DAI", "USDT", "USDC", "WETH"];
exports.NATIVE_TOKEN_STRING = "NATIVE_TOKEN";
exports.BLACKLISTED_TOKENS = [
    graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"),
    graph_ts_1.Address.fromString("0xb755b949c126c04e0348dd881a5cf55d424742b2"),
    graph_ts_1.Address.fromString("0xd79138c49c49200a1afc935171d1bdad084fdc95"),
    graph_ts_1.Address.fromString("0x37c9be6c81990398e9b87494484afc6a4608c25d"),
    graph_ts_1.Address.fromString("0xf72beacc6fd334e14a7ddac25c3ce1eb8a827e10"),
    graph_ts_1.Address.fromString("0xae6aab43c4f3e0cea4ab83752c278f8debaba689"), // dForce
];
