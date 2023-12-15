"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECONDS_PER_DAY = exports.DAYS_PER_YEAR = exports.MAX_UINT = exports.BIGDECIMAL_FIFTY_PERCENT = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_TEN = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.BIGDECIMAL_NEG_ONE = exports.INT_FIVE = exports.INT_FOUR = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.INT_NEGATIVE_ONE = exports.BIGINT_MAX = exports.BIGINT_FOUR_HUNDRED_THOUSAND = exports.BIGINT_TWO_HUNDRED_FIFTY_THOUSAND = exports.BIGINT_ONE_HUNDRED_THOUSAND = exports.BIGINT_TWENTY_FIVE_THOUSAND = exports.BIGINT_TEN_THOUSAND = exports.BIGINT_FIVE_THOUSAND = exports.BIGINT_THREE_THOUSAND = exports.BIGINT_THOUSAND = exports.BIGINT_HUNDRED = exports.BIGINT_FIFTY = exports.BIGINT_TEN = exports.RECENT_BLOCK_THRESHOLD = exports.BIGINT_FIVE = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.BIGINT_NEG_ONE = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.DEFAULT_DECIMALS = exports.MasterChef = exports.RewardIntervalType = exports.UsageType = exports.FeeSwitch = exports.TransferType = exports.HelperStoreType = exports.RewardTokenType = exports.LiquidityPoolFeeType = exports.VaultFeeType = exports.ProtocolType = exports.Network = exports.Protocol = exports.PROTOCOL_SCHEMA_VERSION = void 0;
exports.BIGDECIMAL_FIVE_PERCENT = exports.BIGDECIMAL_TEN_BILLION = exports.PRICE_CHANGE_BUFFER_LIMIT = exports.ZERO_ADDRESS = exports.MINIMUM_LIQUIDITY_FOUR_HUNDRED_THOUSAND = exports.MINIMUM_LIQUIDITY_TWO_HUNDRED_FIFTY_THOUSAND = exports.MINIMUM_LIQUIDITY_ONE_HUNDRED_THOUSAND = exports.MINIMUM_LIQUIDITY_ONE_THOUSAND = exports.MINIMUM_LIQUIDITY_TWENTY_FIVE_THOUSAND = exports.MINIMUM_LIQUIDITY_TEN_THOUSAND = exports.MINIMUM_LIQUIDITY_FIVE_THOUSAND = exports.MINIMUM_LIQUIDITY_THREE_THOUSAND = exports.MS_PER_YEAR = exports.ONE_WEEK_IN_DAYS = exports.MS_PER_DAY = exports.SECONDS_PER_HOUR = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const versions_1 = require("../../src/versions");
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_SCHEMA_VERSION = versions_1.Versions.getSchemaVersion();
/////////////////////
///// Protocols /////
/////////////////////
var Protocol;
(function (Protocol) {
    Protocol.APESWAP = "Apeswap";
    Protocol.UNISWAP_V2 = "Uniswap V2";
    Protocol.SUSHISWAP = "Sushiswap";
})(Protocol = exports.Protocol || (exports.Protocol = {}));
////////////////////////
///// Schema Enums /////
////////////////////////
// The network names corresponding to the Network enum in the schema.
// They are mainly intended for convenience on the data consumer side.
// The enum values are derived from Coingecko slugs (converted to uppercase
// and replaced hyphens with underscores for Postgres enum compatibility)
var Network;
(function (Network) {
    Network.ARBITRUM_ONE = "ARBITRUM_ONE";
    Network.AVALANCHE = "AVALANCHE";
    Network.AURORA = "AURORA";
    Network.BASE = "BASE";
    Network.BSC = "BSC"; // aka BNB Chain
    Network.CELO = "CELO";
    Network.CRONOS = "CRONOS";
    Network.HARMONY = "HARMONY";
    Network.MAINNET = "MAINNET"; // Ethereum mainnet
    Network.FANTOM = "FANTOM";
    Network.FUSE = "FUSE";
    Network.MOONBEAM = "MOONBEAM";
    Network.MOONRIVER = "MOONRIVER";
    Network.NEAR_MAINNET = "NEAR_MAINNET";
    Network.OPTIMISM = "OPTIMISM";
    Network.MATIC = "MATIC"; // aka Polygon
    Network.GNOSIS = "GNOSIS"; // aka Gnosis Chain
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
var RewardTokenType;
(function (RewardTokenType) {
    RewardTokenType.DEPOSIT = "DEPOSIT";
    RewardTokenType.BORROW = "BORROW";
})(RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}));
var HelperStoreType;
(function (HelperStoreType) {
    HelperStoreType.NATIVE_TOKEN = "NATIVE_TOKEN";
    HelperStoreType.USERS = "USERS";
    // Pool addresses are also stored in the HelperStore
})(HelperStoreType = exports.HelperStoreType || (exports.HelperStoreType = {}));
var TransferType;
(function (TransferType) {
    TransferType.MINT = "MINT";
    TransferType.BURN = "BURN";
    // Pool addresses are also stored in the HelperStore
})(TransferType = exports.TransferType || (exports.TransferType = {}));
var FeeSwitch;
(function (FeeSwitch) {
    FeeSwitch.ON = "ON";
    FeeSwitch.OFF = "OFF";
    // Pool addresses are also stored in the HelperStore
})(FeeSwitch = exports.FeeSwitch || (exports.FeeSwitch = {}));
var UsageType;
(function (UsageType) {
    UsageType.DEPOSIT = "DEPOSIT";
    UsageType.WITHDRAW = "WITHDRAW";
    UsageType.SWAP = "SWAP";
})(UsageType = exports.UsageType || (exports.UsageType = {}));
var RewardIntervalType;
(function (RewardIntervalType) {
    RewardIntervalType.BLOCK = "BLOCK";
    RewardIntervalType.TIMESTAMP = "TIMESTAMP";
    RewardIntervalType.NONE = "NONE";
})(RewardIntervalType = exports.RewardIntervalType || (exports.RewardIntervalType = {}));
var MasterChef;
(function (MasterChef) {
    MasterChef.MINICHEF = "MINICHEF";
    MasterChef.MASTERCHEF = "MASTERCHEF";
    MasterChef.MASTERCHEFV2 = "MASTERCHEFV2";
    MasterChef.MASTERCHEFV3 = "MASTERCHEFV3";
})(MasterChef = exports.MasterChef || (exports.MasterChef = {}));
exports.DEFAULT_DECIMALS = 18;
exports.USDC_DECIMALS = 6;
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.BIGINT_NEG_ONE = graph_ts_1.BigInt.fromI32(-1);
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_FIVE = graph_ts_1.BigInt.fromI32(5);
exports.RECENT_BLOCK_THRESHOLD = graph_ts_1.BigInt.fromI32(5);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_FIFTY = graph_ts_1.BigInt.fromI32(50);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
exports.BIGINT_THREE_THOUSAND = graph_ts_1.BigInt.fromI32(3000);
exports.BIGINT_FIVE_THOUSAND = graph_ts_1.BigInt.fromI32(5000);
exports.BIGINT_TEN_THOUSAND = graph_ts_1.BigInt.fromI32(10000);
exports.BIGINT_TWENTY_FIVE_THOUSAND = graph_ts_1.BigInt.fromI32(25000);
exports.BIGINT_ONE_HUNDRED_THOUSAND = graph_ts_1.BigInt.fromI32(100000);
exports.BIGINT_TWO_HUNDRED_FIFTY_THOUSAND = graph_ts_1.BigInt.fromI32(250000);
exports.BIGINT_FOUR_HUNDRED_THOUSAND = graph_ts_1.BigInt.fromI32(400000);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString("115792089237316195423570985008687907853269984665640564039457584007913129639935");
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.INT_FIVE = 5;
exports.BIGDECIMAL_NEG_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_NEG_ONE);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_TEN = new graph_ts_1.BigDecimal(exports.BIGINT_TEN);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.BIGDECIMAL_FIFTY_PERCENT = new graph_ts_1.BigDecimal(exports.BIGINT_FIFTY);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(graph_ts_1.BigInt.fromI32(255));
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(365));
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.SECONDS_PER_HOUR = 60 * 60;
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000));
exports.ONE_WEEK_IN_DAYS = graph_ts_1.BigInt.fromI32(7);
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)));
// Imported into configurations typescript file to set minimum liquidity thresholds for estimating price using a liquidity pool;
exports.MINIMUM_LIQUIDITY_THREE_THOUSAND = new graph_ts_1.BigDecimal(exports.BIGINT_THREE_THOUSAND);
exports.MINIMUM_LIQUIDITY_FIVE_THOUSAND = new graph_ts_1.BigDecimal(exports.BIGINT_FIVE_THOUSAND);
exports.MINIMUM_LIQUIDITY_TEN_THOUSAND = new graph_ts_1.BigDecimal(exports.BIGINT_TEN_THOUSAND);
exports.MINIMUM_LIQUIDITY_TWENTY_FIVE_THOUSAND = new graph_ts_1.BigDecimal(exports.BIGINT_TWENTY_FIVE_THOUSAND);
exports.MINIMUM_LIQUIDITY_ONE_THOUSAND = new graph_ts_1.BigDecimal(exports.BIGINT_THOUSAND);
exports.MINIMUM_LIQUIDITY_ONE_HUNDRED_THOUSAND = new graph_ts_1.BigDecimal(exports.BIGINT_ONE_HUNDRED_THOUSAND);
exports.MINIMUM_LIQUIDITY_TWO_HUNDRED_FIFTY_THOUSAND = new graph_ts_1.BigDecimal(exports.BIGINT_TWO_HUNDRED_FIFTY_THOUSAND);
exports.MINIMUM_LIQUIDITY_FOUR_HUNDRED_THOUSAND = new graph_ts_1.BigDecimal(exports.BIGINT_FOUR_HUNDRED_THOUSAND);
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.PRICE_CHANGE_BUFFER_LIMIT = 5;
exports.BIGDECIMAL_TEN_BILLION = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromString("10000000000"));
exports.BIGDECIMAL_FIVE_PERCENT = graph_ts_1.BigDecimal.fromString("0.05");
