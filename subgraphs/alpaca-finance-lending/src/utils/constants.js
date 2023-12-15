"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KILL_FACTOR =
  exports.MS_PER_YEAR =
  exports.DAYS_PER_YEAR =
  exports.MS_PER_DAY =
  exports.SECONDS_PER_YEAR =
  exports.SECONDS_PER_HOUR =
  exports.BIGINT_SECONDS_PER_DAY =
  exports.SECONDS_PER_DAY =
  exports.MAX_UINT =
  exports.BIGDECIMAL_HUNDRED =
  exports.BIGDECIMAL_TEN =
  exports.BIGDECIMAL_TWO =
  exports.BIGDECIMAL_ONE =
  exports.BIGDECIMAL_ZERO =
  exports.BIGDECIMAL_NEGATIVE_ONE =
  exports.INT_FOUR =
  exports.INT_TWO =
  exports.INT_ONE =
  exports.INT_ZERO =
  exports.INT_NEGATIVE_ONE =
  exports.BIGINT_MAX =
  exports.BIGINT_TEN_TO_EIGHTEENTH =
  exports.BIGINT_TEN_THOUSAND =
  exports.BIGINT_THOUSAND =
  exports.BIGINT_HUNDRED =
  exports.BIGINT_TEN =
  exports.BIGINT_TWO =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.BIGINT_NEGATIVE_ONE =
  exports.WBNB_ADDRESS_BSC =
  exports.BUSD_ADDRESS_BSC =
  exports.SIMPLE_PRICE_ORACLE_BSC =
  exports.FAIRLAUNCH_ADDRESS_BSC =
  exports.ETH_ADDRESS =
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
  exports.PROTOCOL_SLUG =
  exports.PROTOCOL_NAME =
  exports.PROTOCOL_ID =
  exports.PositionSide =
    void 0;
exports.LIQUIDATION_PROTOCOL_SIDE_RATIO =
  exports.BLOCKS_PER_HOUR_BSC =
  exports.PRICE_LIB_START_BLOCK_BSC =
  exports.PROTOCOL_LENDING_FEE =
  exports.BIGINT_PROTOCOL_LENDING_FEE =
  exports.LIQUIDATION_BONUS =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
///// Versions /////
////////////////////
var PositionSide;
(function (PositionSide) {
  PositionSide.LENDER = "LENDER";
  PositionSide.BORROWER = "BORROWER";
})((PositionSide = exports.PositionSide || (exports.PositionSide = {})));
exports.PROTOCOL_ID = "Alpaca Lending";
exports.PROTOCOL_NAME = "Alpaca Finance Lending Protocol";
exports.PROTOCOL_SLUG = "alpaca-finance-lending";
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
exports.ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
exports.FAIRLAUNCH_ADDRESS_BSC = "0xA625AB01B08ce023B2a342Dbb12a16f2C8489A8F";
exports.SIMPLE_PRICE_ORACLE_BSC = "0x166f56F2EDa9817cAB77118AE4FCAA0002A17eC7";
exports.BUSD_ADDRESS_BSC = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
exports.WBNB_ADDRESS_BSC = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
////////////////////////
///// Type Helpers /////
////////////////////////
exports.BIGINT_NEGATIVE_ONE = graph_ts_1.BigInt.fromI32(-1);
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
exports.BIGINT_TEN_THOUSAND = graph_ts_1.BigInt.fromI32(10000);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromString("10").pow(18);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.BIGDECIMAL_NEGATIVE_ONE = new graph_ts_1.BigDecimal(
  exports.BIGINT_NEGATIVE_ONE
);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_TEN = new graph_ts_1.BigDecimal(exports.BIGINT_TEN);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(
  graph_ts_1.BigInt.fromI32(255)
);
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.BIGINT_SECONDS_PER_DAY = graph_ts_1.BigInt.fromI32(
  exports.SECONDS_PER_DAY
);
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.SECONDS_PER_YEAR = graph_ts_1.BigInt.fromI32(31556952);
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)
);
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(365)
);
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(
  new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000))
);
////////////////
///// Misc /////
////////////////
exports.KILL_FACTOR = graph_ts_1.BigDecimal.fromString("90");
exports.LIQUIDATION_BONUS = graph_ts_1.BigDecimal.fromString("5");
exports.BIGINT_PROTOCOL_LENDING_FEE = graph_ts_1.BigInt.fromI32(19);
exports.PROTOCOL_LENDING_FEE = new graph_ts_1.BigDecimal(
  exports.BIGINT_PROTOCOL_LENDING_FEE
);
exports.PRICE_LIB_START_BLOCK_BSC = graph_ts_1.BigInt.fromI32(6810080);
exports.BLOCKS_PER_HOUR_BSC = graph_ts_1.BigInt.fromI32(1200);
exports.LIQUIDATION_PROTOCOL_SIDE_RATIO =
  graph_ts_1.BigDecimal.fromString("0.8");
