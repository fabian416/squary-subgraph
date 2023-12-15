"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAD = exports.RAY = exports.WAD = exports.MAX_UINT = exports.BIGDECIMAL_ONE_RAY = exports.BIGDECIMAL_ONE_WAD = exports.BIGDECIMAL_NEG_ONE = exports.BIGDECIMAL_ONE_THOUSAND = exports.BIGDECIMAL_ONE_HUNDRED = exports.BIGDECIMAL_TWELVE = exports.BIGDECIMAL_SIX = exports.BIGDECIMAL_THREE = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.NEG_INT_ONE = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.BIGINT_ONE_RAY = exports.BIGINT_ONE_WAD = exports.BIGINT_NEG_HUNDRED = exports.BIGINT_NEG_ONE = exports.BIGINT_MAX = exports.BIGINT_THOUSAND = exports.BIGINT_TWELVE = exports.BIGINT_SIX = exports.BIGINT_THREE = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.DEFAULT_DECIMALS = exports.ZERO_ADDRESS = exports.ActivityType = exports.EventType = exports.PositionSide = exports.ProtocolSideRevenueType = exports.InterestRateSide = exports.InterestRateType = exports.RiskType = exports.LendingType = exports.RewardTokenType = exports.LiquidityPoolFeeType = exports.VaultFeeType = exports.ProtocolType = exports.Network = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = void 0;
exports.ILK_ETH_A = exports.ILK_SAI = exports.CAT_V1_ADDRESS = exports.MIGRATION_ADDRESS = exports.DAI_ADDRESS = exports.VOW_ADDRESS = exports.VAT_ADDRESS = exports.MS_PER_YEAR = exports.DAYS_PER_YEAR = exports.MS_PER_DAY = exports.SECONDS_PER_YEAR_BIGDECIMAL = exports.SECONDS_PER_YEAR_BIGINT = exports.SECONDS_PER_YEAR = exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_NAME = "MakerDAO";
exports.PROTOCOL_SLUG = "makerdao";
////////////////////////
///// Schema Enums /////
////////////////////////
// The enum values are derived from Coingecko slugs (converted to uppercase
// and replaced hyphens with underscores for Postgres enum compatibility)
var Network;
(function (Network) {
    Network.ARBITRUM_ONE = "ARBITRUM_ONE";
    Network.ARWEAVE_MAINNET = "ARWEAVE_MAINNET";
    Network.AURORA = "AURORA";
    Network.AVALANCHE = "AVALANCHE";
    Network.BOBA = "BOBA";
    Network.BSC = "BSC"; // aka BNB Chain
    Network.CELO = "CELO";
    Network.COSMOS = "COSMOS";
    Network.CRONOS = "CRONOS";
    Network.MAINNET = "MAINNET"; // Ethereum mainnet
    Network.FANTOM = "FANTOM";
    Network.FUSE = "FUSE";
    Network.HARMONY = "HARMONY";
    Network.JUNO = "JUNO";
    Network.MOONBEAM = "MOONBEAM";
    Network.MOONRIVER = "MOONRIVER";
    Network.NEAR_MAINNET = "NEAR_MAINNET";
    Network.OPTIMISM = "OPTIMISM";
    Network.OSMOSIS = "OSMOSIS";
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
    LiquidityPoolFeeType.PROTOCOL_FEE = "PROTOCOL_FEE";
})(LiquidityPoolFeeType = exports.LiquidityPoolFeeType || (exports.LiquidityPoolFeeType = {}));
var RewardTokenType;
(function (RewardTokenType) {
    RewardTokenType.DEPOSIT = "DEPOSIT";
    RewardTokenType.BORROW = "BORROW";
})(RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}));
var LendingType;
(function (LendingType) {
    LendingType.CDP = "CDP";
    LendingType.POOLED = "POOLED";
})(LendingType = exports.LendingType || (exports.LendingType = {}));
var RiskType;
(function (RiskType) {
    RiskType.GLOBAL = "GLOBAL";
    RiskType.ISOLATED = "ISOLATED";
})(RiskType = exports.RiskType || (exports.RiskType = {}));
var InterestRateType;
(function (InterestRateType) {
    InterestRateType.STABLE = "STABLE";
    InterestRateType.VARIABLE = "VARIABLE";
    InterestRateType.FIXED = "FIXED";
})(InterestRateType = exports.InterestRateType || (exports.InterestRateType = {}));
var InterestRateSide;
(function (InterestRateSide) {
    InterestRateSide.LENDER = "LENDER";
    InterestRateSide.BORROW = "BORROWER";
})(InterestRateSide = exports.InterestRateSide || (exports.InterestRateSide = {}));
// They are defined as u32 for use with switch/case
var ProtocolSideRevenueType;
(function (ProtocolSideRevenueType) {
    ProtocolSideRevenueType.STABILITYFEE = 1;
    ProtocolSideRevenueType.LIQUIDATION = 2;
    ProtocolSideRevenueType.PSM = 3;
})(ProtocolSideRevenueType = exports.ProtocolSideRevenueType || (exports.ProtocolSideRevenueType = {}));
var PositionSide;
(function (PositionSide) {
    PositionSide.LENDER = "LENDER";
    PositionSide.BORROWER = "BORROWER";
})(PositionSide = exports.PositionSide || (exports.PositionSide = {}));
var EventType;
(function (EventType) {
    EventType.DEPOSIT = "DEPOSIT";
    EventType.WITHDRAW = "WITHDRAW";
    EventType.BORROW = "BORROW";
    EventType.REPAY = "REPAY";
    EventType.LIQUIDATOR = "LIQUIDAOTR";
    EventType.LIQUIDATEE = "LIQUIDATEE";
})(EventType = exports.EventType || (exports.EventType = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType.DAILY = "DAILY";
    ActivityType.HOURLY = "HOURLY";
})(ActivityType = exports.ActivityType || (exports.ActivityType = {}));
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
////////////////////////
///// Type Helpers /////
////////////////////////
exports.DEFAULT_DECIMALS = 18;
exports.USDC_DECIMALS = 6;
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_THREE = graph_ts_1.BigInt.fromI32(3);
exports.BIGINT_SIX = graph_ts_1.BigInt.fromI32(6);
exports.BIGINT_TWELVE = graph_ts_1.BigInt.fromI32(12);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString("115792089237316195423570985008687907853269984665640564039457584007913129639935");
exports.BIGINT_NEG_ONE = graph_ts_1.BigInt.fromI32(-1);
exports.BIGINT_NEG_HUNDRED = graph_ts_1.BigInt.fromI32(-100);
//10^18
exports.BIGINT_ONE_WAD = graph_ts_1.BigInt.fromString("1000000000000000000");
// 10^27
exports.BIGINT_ONE_RAY = graph_ts_1.BigInt.fromString("1000000000000000000000000000");
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.NEG_INT_ONE = -1;
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_THREE = new graph_ts_1.BigDecimal(exports.BIGINT_THREE);
exports.BIGDECIMAL_SIX = new graph_ts_1.BigDecimal(exports.BIGINT_SIX);
exports.BIGDECIMAL_TWELVE = new graph_ts_1.BigDecimal(exports.BIGINT_TWELVE);
exports.BIGDECIMAL_ONE_HUNDRED = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(100));
exports.BIGDECIMAL_ONE_THOUSAND = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(1000));
exports.BIGDECIMAL_NEG_ONE = graph_ts_1.BigDecimal.fromString("-1");
exports.BIGDECIMAL_ONE_WAD = exports.BIGINT_ONE_WAD.toBigDecimal();
exports.BIGDECIMAL_ONE_RAY = exports.BIGINT_ONE_RAY.toBigDecimal();
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(graph_ts_1.BigInt.fromI32(255));
exports.WAD = 18;
exports.RAY = 27;
exports.RAD = 45;
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_HOUR = 60 * 60; // 360
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_YEAR = 60 * 60 * 24 * 365;
exports.SECONDS_PER_YEAR_BIGINT = graph_ts_1.BigInt.fromI32(60 * 60 * 24 * 365);
exports.SECONDS_PER_YEAR_BIGDECIMAL = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(60 * 60 * 24 * 365));
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000));
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(365));
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)));
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.VAT_ADDRESS = "0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b".toLowerCase();
exports.VOW_ADDRESS = "0xa950524441892a31ebddf91d3ceefa04bf454466".toLowerCase();
exports.DAI_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f".toLowerCase();
exports.MIGRATION_ADDRESS = "0xc73e0383f3aff3215e6f04b0331d58cecf0ab849";
exports.CAT_V1_ADDRESS = "0x78f2c2af65126834c51822f56be0d7469d7a523e";
// unconventional token requiring special handling
exports.ILK_SAI = "0x5341490000000000000000000000000000000000000000000000000000000000";
// the first market, used to detect cat/dog contract
exports.ILK_ETH_A = "0x4554482d41000000000000000000000000000000000000000000000000000000";
