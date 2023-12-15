"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAKING_V1 =
  exports.REGISTRY_ADDRESS =
  exports.EPX_ADDRESS =
  exports.EPS_ADDRESS =
  exports.BBTC_ADDRESS =
  exports.USDC_ADDRESS =
  exports.BUSD_ADDRESS =
  exports.WBNB_ADDRESS =
  exports.PANCAKE_FACTORY_ADDRESS =
  exports.FACTORY_ADDRESS =
  exports.FEE_DENOMINATOR_DECIMALS =
  exports.ETH_NAME =
  exports.ETH_SYMBOL =
  exports.SNAPSHOT_SECONDS =
  exports.MS_PER_YEAR =
  exports.DAYS_PER_YEAR =
  exports.MS_PER_DAY =
  exports.SECONDS_PER_HOUR =
  exports.SECONDS_PER_DAY =
  exports.BIGDECIMAL_ZERO =
  exports.BIGINT_MAX =
  exports.BIGINT_TEN_TO_EIGHTEENTH =
  exports.BIGINT_THOUSAND =
  exports.BIGINT_HUNDRED =
  exports.BIGINT_TWO =
  exports.BIGINT_NEG_ONE =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.USDC_DENOMINATOR =
  exports.USDC_DECIMALS =
  exports.DEFAULT_DECIMALS_BIG_DECIMAL =
  exports.DEFAULT_DECIMALS =
  exports.ETH_ADDRESS =
  exports.ADDRESS_ZERO =
  exports.ZERO_ADDRESS =
  exports.UsageType =
  exports.InterestRateSide =
  exports.InterestRateType =
  exports.RiskType =
  exports.LendingType =
  exports.RewardTokenType =
  exports.LiquidityPoolFeeType =
  exports.VaultFeeType =
  exports.ProtocolType =
  exports.Network =
  exports.PROTOCOL_METHODOLOGY_VERSION =
  exports.PROTOCOL_SUBGRAPH_VERSION =
  exports.PROTOCOL_SCHEMA_VERSION =
  exports.PROTOCOL_SLUG =
  exports.PROTOCOL_NAME =
    void 0;
exports.EPS_POOL_ADDRESS =
  exports.REGISTRY_ADDRESS_V2 =
  exports.DEFAULT_ADMIN_FEE =
  exports.DEFAULT_POOL_FEE =
  exports.FEE_DENOMINATOR =
  exports.FEE_DENOMINATOR_BIGINT =
  exports.BIG_DECIMAL_SECONDS_PER_DAY =
  exports.BIGDECIMAL_NEGATIVE_ONE =
  exports.BIGDECIMAL_HUNDRED =
  exports.BIGINT_NEGATIVE_ONE =
  exports.BIGINT_TEN =
  exports.BSC_AVERAGE_BLOCK_PER_HOUR =
  exports.NULL =
  exports.RewardIntervalType =
  exports.EARLY_BASEPOOLS =
  exports.PoolType =
  exports.ADMIN_FEE =
  exports.POOL_FEE =
  exports.ELLIPSIS_PLATFORM_ID =
  exports.BASE_POOL_MAP =
  exports.POOL_LP_TOKEN_MAP =
  exports.STAKING_V2 =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_NAME = "Ellipsis Finance";
exports.PROTOCOL_SLUG = "ellipses-finance";
exports.PROTOCOL_SCHEMA_VERSION = "1.3.0";
exports.PROTOCOL_SUBGRAPH_VERSION = "1.0.1";
exports.PROTOCOL_METHODOLOGY_VERSION = "1.0.0";
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
})((Network = exports.Network || (exports.Network = {})));
var ProtocolType;
(function (ProtocolType) {
  ProtocolType.EXCHANGE = "EXCHANGE";
  ProtocolType.LENDING = "LENDING";
  ProtocolType.YIELD = "YIELD";
  ProtocolType.BRIDGE = "BRIDGE";
  ProtocolType.GENERIC = "GENERIC";
})((ProtocolType = exports.ProtocolType || (exports.ProtocolType = {})));
var VaultFeeType;
(function (VaultFeeType) {
  VaultFeeType.MANAGEMENT_FEE = "MANAGEMENT_FEE";
  VaultFeeType.PERFORMANCE_FEE = "PERFORMANCE_FEE";
  VaultFeeType.DEPOSIT_FEE = "DEPOSIT_FEE";
  VaultFeeType.WITHDRAWAL_FEE = "WITHDRAWAL_FEE";
})((VaultFeeType = exports.VaultFeeType || (exports.VaultFeeType = {})));
var LiquidityPoolFeeType;
(function (LiquidityPoolFeeType) {
  LiquidityPoolFeeType.FIXED_TRADING_FEE = "FIXED_TRADING_FEE";
  LiquidityPoolFeeType.TIERED_TRADING_FEE = "TIERED_TRADING_FEE";
  LiquidityPoolFeeType.DYNAMIC_TRADING_FEE = "DYNAMIC_TRADING_FEE";
  LiquidityPoolFeeType.FIXED_LP_FEE = "FIXED_LP_FEE";
  LiquidityPoolFeeType.DYNAMIC_LP_FEE = "DYNAMIC_LP_FEE";
  LiquidityPoolFeeType.FIXED_PROTOCOL_FEE = "FIXED_PROTOCOL_FEE";
  LiquidityPoolFeeType.DYNAMIC_PROTOCOL_FEE = "DYNAMIC_PROTOCOL_FEE";
})(
  (LiquidityPoolFeeType =
    exports.LiquidityPoolFeeType || (exports.LiquidityPoolFeeType = {}))
);
var RewardTokenType;
(function (RewardTokenType) {
  RewardTokenType.DEPOSIT = "DEPOSIT";
  RewardTokenType.BORROW = "BORROW";
})(
  (RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}))
);
var LendingType;
(function (LendingType) {
  LendingType.CDP = "CDP";
  LendingType.POOLED = "POOLED";
})((LendingType = exports.LendingType || (exports.LendingType = {})));
var RiskType;
(function (RiskType) {
  RiskType.GLOBAL = "GLOBAL";
  RiskType.ISOLATED = "ISOLATED";
})((RiskType = exports.RiskType || (exports.RiskType = {})));
var InterestRateType;
(function (InterestRateType) {
  InterestRateType.STABLE = "STABLE";
  InterestRateType.VARIABLE = "VARIABLE";
  InterestRateType.FIXED_TERM = "FIXED_TERM";
})(
  (InterestRateType =
    exports.InterestRateType || (exports.InterestRateType = {}))
);
var InterestRateSide;
(function (InterestRateSide) {
  InterestRateSide.LENDER = "LENDER";
  InterestRateSide.BORROWER = "BORROWER";
})(
  (InterestRateSide =
    exports.InterestRateSide || (exports.InterestRateSide = {}))
);
var UsageType;
(function (UsageType) {
  UsageType.DEPOSIT = "DEPOSIT";
  UsageType.WITHDRAW = "WITHDRAW";
  UsageType.SWAP = "SWAP";
})((UsageType = exports.UsageType || (exports.UsageType = {})));
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.ADDRESS_ZERO = graph_ts_1.Address.fromString(exports.ZERO_ADDRESS);
exports.ETH_ADDRESS = graph_ts_1.Address.fromString(
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
);
////////////////////////
///// Type Helpers /////
////////////////////////
exports.DEFAULT_DECIMALS = 18;
exports.DEFAULT_DECIMALS_BIG_DECIMAL = graph_ts_1.BigDecimal.fromString("18");
exports.USDC_DECIMALS = 6;
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_NEG_ONE = graph_ts_1.BigInt.fromI32(-1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromString("10").pow(18);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)
);
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(365)
);
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(
  new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000))
);
exports.SNAPSHOT_SECONDS = exports.SECONDS_PER_DAY;
////////////////
///// Misc /////
////////////////
exports.ETH_SYMBOL = "ETH";
exports.ETH_NAME = "ETH";
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.FEE_DENOMINATOR_DECIMALS = 10;
exports.FACTORY_ADDRESS = graph_ts_1.Address.fromString(
  "0xf65BEd27e96a367c61e0E06C54e14B16b84a5870"
);
exports.PANCAKE_FACTORY_ADDRESS = graph_ts_1.Address.fromString(
  "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"
);
exports.WBNB_ADDRESS = graph_ts_1.Address.fromString(
  "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
);
exports.BUSD_ADDRESS = graph_ts_1.Address.fromString(
  "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
);
exports.USDC_ADDRESS = graph_ts_1.Address.fromString(
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
);
exports.BBTC_ADDRESS = graph_ts_1.Address.fromString(
  "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"
);
exports.EPS_ADDRESS = graph_ts_1.Address.fromString(
  "0xA7f552078dcC247C2684336020c03648500C6d9F"
);
exports.EPX_ADDRESS = graph_ts_1.Address.fromString(
  "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71"
);
exports.REGISTRY_ADDRESS = graph_ts_1.Address.fromString(
  "0x266Bb386252347b03C7B6eB37F950f476D7c3E63"
);
exports.STAKING_V1 = "0xcce949De564fE60e7f96C85e55177F8B9E4CF61b";
exports.STAKING_V2 = "0x5B74C99AA2356B4eAa7B85dC486843eDff8Dfdbe";
exports.POOL_LP_TOKEN_MAP = new Map();
exports.POOL_LP_TOKEN_MAP.set(
  "0x160CAed03795365F3A589f10C379FfA7d75d4E76".toLowerCase(),
  graph_ts_1.Address.fromString("0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452")
);
exports.POOL_LP_TOKEN_MAP.set(
  "0x2477fB288c5b4118315714ad3c7Fd7CC69b00bf9".toLowerCase(),
  graph_ts_1.Address.fromString("0x2a435Ecb3fcC0E316492Dc1cdd62d0F189be5640")
);
exports.POOL_LP_TOKEN_MAP.set(
  "0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d".toLowerCase(),
  graph_ts_1.Address.fromString("0x5b5bD8913D766D005859CE002533D4838B0Ebbb5")
);
exports.POOL_LP_TOKEN_MAP.set(
  "0xfA715E7C8fA704Cf425Dd7769f4a77b81420fbF2".toLowerCase(),
  graph_ts_1.Address.fromString("0xdC7f3E34C43f8700B0EB58890aDd03AA84F7B0e1")
);
exports.BASE_POOL_MAP = new Map();
exports.BASE_POOL_MAP.set(
  graph_ts_1.Address.fromString(
    "0x5A7d2F9595eA00938F3B5BA1f97a85274f20b96c".toLowerCase()
  ),
  graph_ts_1.Address.fromString("0x160CAed03795365F3A589f10C379FfA7d75d4E76")
);
exports.ELLIPSIS_PLATFORM_ID = "ellipsis";
exports.POOL_FEE = graph_ts_1.BigDecimal.fromString("0.0004");
exports.ADMIN_FEE = graph_ts_1.BigDecimal.fromString("0.5");
var PoolType;
(function (PoolType) {
  PoolType.LENDING = "LENDING";
  PoolType.PLAIN = "PLAIN";
  PoolType.METAPOOL = "METAPOOL";
  PoolType.BASEPOOL = "BASEPOOL";
})((PoolType = exports.PoolType || (exports.PoolType = {})));
exports.EARLY_BASEPOOLS = [
  graph_ts_1.Address.fromString(
    "0x160CAed03795365F3A589f10C379FfA7d75d4E76".toLowerCase()
  ),
  graph_ts_1.Address.fromString(
    "0x2477fB288c5b4118315714ad3c7Fd7CC69b00bf9".toLowerCase()
  ),
];
var RewardIntervalType;
(function (RewardIntervalType) {
  RewardIntervalType.BLOCK = "BLOCK";
  RewardIntervalType.TIMESTAMP = "TIMESTAMP";
})(
  (RewardIntervalType =
    exports.RewardIntervalType || (exports.RewardIntervalType = {}))
);
var NULL;
(function (NULL) {
  NULL.TYPE_STRING = "0x0000000000000000000000000000000000000000";
  NULL.TYPE_ADDRESS = graph_ts_1.Address.fromString(NULL.TYPE_STRING);
})((NULL = exports.NULL || (exports.NULL = {})));
exports.BSC_AVERAGE_BLOCK_PER_HOUR = graph_ts_1.BigInt.fromString("10000");
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_NEGATIVE_ONE = graph_ts_1.BigInt.fromString("-1");
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigDecimal.fromString("100");
exports.BIGDECIMAL_NEGATIVE_ONE = graph_ts_1.BigDecimal.fromString("-1");
exports.BIG_DECIMAL_SECONDS_PER_DAY = graph_ts_1.BigDecimal.fromString("86400");
exports.FEE_DENOMINATOR_BIGINT = exports.BIGINT_TEN.pow(10);
exports.FEE_DENOMINATOR = graph_ts_1.BigDecimal.fromString("10000000000");
exports.DEFAULT_POOL_FEE = graph_ts_1.BigInt.fromString("4000000");
exports.DEFAULT_ADMIN_FEE = graph_ts_1.BigInt.fromString("5000000000");
exports.REGISTRY_ADDRESS_V2 = graph_ts_1.Address.fromString(
  "0x266Bb386252347b03C7B6eB37F950f476D7c3E63"
);
exports.EPS_POOL_ADDRESS = graph_ts_1.Address.fromString(
  "0x19ec9e3f7b21dd27598e7ad5aae7dc0db00a806d"
);
