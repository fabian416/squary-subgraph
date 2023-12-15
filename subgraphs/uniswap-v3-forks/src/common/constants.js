"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECONDS_PER_DAY = exports.DAYS_PER_YEAR = exports.MAX_UINT = exports.INT_FIVE_HUNDRED = exports.INT_HUNDRED = exports.PRICE_CHANGE_BUFFER_LIMIT = exports.INT_THREE = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.PRECISION_DECIMAL = exports.PRECISION = exports.Q192 = exports.BIGDECIMAL_TEN_BILLION = exports.BIGDECIMAL_BILLION = exports.BIGDECIMAL_MILLION = exports.BIGDECIMAL_TEN_THOUSAND = exports.BIGDECIMAL_192 = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_FIFTY = exports.BIGDECIMAL_TEN = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_FIVE_PERCENT = exports.BIGDECIMAL_ZERO = exports.BIGDECIMAL_NEG_ONE = exports.BIGINT_MAX = exports.BIGINT_MILLION = exports.BIGINT_TEN_THOUSAND = exports.BIGINT_192 = exports.BIGINT_HUNDRED = exports.BIGINT_FIFTY = exports.BIGINT_TEN = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.BIGINT_NEG_ONE = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.DEFAULT_DECIMALS = exports.ZERO_ADDRESS = exports.RewardIntervalType = exports.TokenType = exports.FeeSwitch = exports.EventType = exports.HelperStoreType = exports.LiquidityPoolFeeType = exports.VaultFeeType = exports.ProtocolType = exports.Network = void 0;
exports.TICK_BASE = exports.MOST_RECENT_TRANSACTION = exports.MS_PER_YEAR = exports.MS_PER_DAY = exports.SECONDS_PER_HOUR = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////////
///// Schema Enums /////
////////////////////////
// The network names corresponding to the Network enum in the schema.
// They also correspond to the ones in `dataSource.network()` after converting to lower case.
// See below for a complete list:
// https://thegraph.com/docs/en/hosted-service/what-is-hosted-service/#supported-networks-on-the-hosted-service
var Network;
(function (Network) {
    Network.ARBITRUM_ONE = "ARBITRUM_ONE";
    Network.AVALANCHE = "AVALANCHE";
    Network.AURORA = "AURORA";
    Network.BSC = "BSC"; // aka BNB Chain
    Network.BASE = "BASE";
    Network.CELO = "CELO";
    Network.MAINNET = "MAINNET"; // Ethereum mainnet
    Network.FANTOM = "FANTOM";
    Network.FUSE = "FUSE";
    Network.MOONBEAM = "MOONBEAM";
    Network.MOONRIVER = "MOONRIVER";
    Network.NEAR_MAINNET = "NEAR_MAINNET";
    Network.OPTIMISM = "OPTIMISM";
    Network.MATIC = "MATIC"; // aka Polygon
    Network.XDAI = "XDAI"; // aka Gnosis Chain
})(Network = exports.Network || (exports.Network = {}));
var ProtocolType;
(function (ProtocolType) {
    ProtocolType.EXCHANGE = "EXCHANGE";
    ProtocolType.LENDING = "LENDING";
    ProtocolType.YIELD = "YIELD";
    ProtocolType.BRIDGE = "BRIDGE";
    ProtocolType.GENERIC = "GENERIC";
})(ProtocolType = exports.ProtocolType || (exports.ProtocolType = {}));
var VaultFeeType;
(function (VaultFeeType) {
    VaultFeeType.MANAGEMENT_FEE = "MANAGEMENT_FEE";
    VaultFeeType.PERFORMANCE_FEE = "PERFORMANCE_FEE";
    VaultFeeType.DEPOSIT_FEE = "DEPOSIT_FEE";
    VaultFeeType.WITHDRAWAL_FEE = "WITHDRAWAL_FEE";
})(VaultFeeType = exports.VaultFeeType || (exports.VaultFeeType = {}));
var LiquidityPoolFeeType;
(function (LiquidityPoolFeeType) {
    LiquidityPoolFeeType.FIXED_TRADING_FEE = "FIXED_TRADING_FEE";
    LiquidityPoolFeeType.TIERED_TRADING_FEE = "TIERED_TRADING_FEE";
    LiquidityPoolFeeType.DYNAMIC_TRADING_FEE = "DYNAMIC_TRADING_FEE";
    LiquidityPoolFeeType.FIXED_LP_FEE = "FIXED_LP_FEE";
    LiquidityPoolFeeType.DYNAMIC_LP_FEE = "DYNAMIC_LP_FEE";
    LiquidityPoolFeeType.FIXED_PROTOCOL_FEE = "FIXED_PROTOCOL_FEE";
    LiquidityPoolFeeType.DYNAMIC_PROTOCOL_FEE = "DYNAMIC_PROTOCOL_FEE";
})(LiquidityPoolFeeType = exports.LiquidityPoolFeeType || (exports.LiquidityPoolFeeType = {}));
var HelperStoreType;
(function (HelperStoreType) {
    HelperStoreType.NATIVE_TOKEN = graph_ts_1.Bytes.fromHexString("NATIVE_TOKEN");
    HelperStoreType.USERS = graph_ts_1.Bytes.fromHexString("xUSERS");
    // Pool addresses are also stored in the HelperStore
})(HelperStoreType = exports.HelperStoreType || (exports.HelperStoreType = {}));
var EventType;
(function (EventType) {
    EventType.DEPOSIT = 0;
    EventType.WITHDRAW = 1;
    EventType.SWAP = 2;
    EventType.UNKNOWN = 3;
})(EventType = exports.EventType || (exports.EventType = {}));
var FeeSwitch;
(function (FeeSwitch) {
    FeeSwitch.ON = "ON";
    FeeSwitch.OFF = "OFF";
    // Pool addresses are also stored in the HelperStore
})(FeeSwitch = exports.FeeSwitch || (exports.FeeSwitch = {}));
var TokenType;
(function (TokenType) {
    TokenType.MULTIPLE = "MULTIPLE";
    TokenType.UNKNOWN = "UNKNOWN";
    TokenType.ERC20 = "ERC20";
    TokenType.ERC721 = "ERC721";
    TokenType.ERC1155 = "ERC1155";
    TokenType.BEP20 = "BEP20";
    TokenType.BEP721 = "BEP721";
    TokenType.BEP1155 = "BEP1155";
    // Pool addresses are also stored in the HelperStore
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var RewardIntervalType;
(function (RewardIntervalType) {
    RewardIntervalType.BLOCK = "BLOCK";
    RewardIntervalType.TIMESTAMP = "TIMESTAMP";
    RewardIntervalType.NONE = "NONE";
})(RewardIntervalType = exports.RewardIntervalType || (exports.RewardIntervalType = {}));
exports.ZERO_ADDRESS = graph_ts_1.Address.fromHexString("0x0000000000000000000000000000000000000000");
exports.DEFAULT_DECIMALS = 18;
exports.USDC_DECIMALS = 6;
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.BIGINT_NEG_ONE = graph_ts_1.BigInt.fromI32(-1);
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_FIFTY = graph_ts_1.BigInt.fromI32(50);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_192 = graph_ts_1.BigInt.fromI32(192);
exports.BIGINT_TEN_THOUSAND = graph_ts_1.BigInt.fromI32(10000);
exports.BIGINT_MILLION = graph_ts_1.BigInt.fromI32(1000000);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString("115792089237316195423570985008687907853269984665640564039457584007913129639935");
exports.BIGDECIMAL_NEG_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_NEG_ONE);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_FIVE_PERCENT = graph_ts_1.BigDecimal.fromString("0.05");
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_TEN = new graph_ts_1.BigDecimal(exports.BIGINT_TEN);
exports.BIGDECIMAL_FIFTY = new graph_ts_1.BigDecimal(exports.BIGINT_FIFTY);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.BIGDECIMAL_192 = new graph_ts_1.BigDecimal(exports.BIGINT_192);
exports.BIGDECIMAL_TEN_THOUSAND = new graph_ts_1.BigDecimal(exports.BIGINT_TEN_THOUSAND);
exports.BIGDECIMAL_MILLION = new graph_ts_1.BigDecimal(exports.BIGINT_MILLION);
exports.BIGDECIMAL_BILLION = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromString("1000000000"));
exports.BIGDECIMAL_TEN_BILLION = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromString("10000000000"));
exports.Q192 = graph_ts_1.BigInt.fromString("6277101735386680763835789423207666416102355444464034512896");
exports.PRECISION = graph_ts_1.BigInt.fromString("100000000000000000");
exports.PRECISION_DECIMAL = new graph_ts_1.BigDecimal(exports.PRECISION);
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_THREE = 3;
exports.PRICE_CHANGE_BUFFER_LIMIT = 5;
exports.INT_HUNDRED = 100;
exports.INT_FIVE_HUNDRED = 500;
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(graph_ts_1.BigInt.fromI32(255));
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(365));
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.SECONDS_PER_HOUR = 60 * 60;
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000));
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)));
exports.MOST_RECENT_TRANSACTION = "MOST_RECENT_TRANSACTION";
exports.TICK_BASE = graph_ts_1.BigDecimal.fromString("1.0001");
