"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IavsTokenType =
  exports.SECONDS_PER_DAY =
  exports.SECONDS_PER_HOUR =
  exports.RAY_OFFSET =
  exports.DEFAULT_DECIMALS =
  exports.BIGDECIMAL_NEG_ONE_CENT =
  exports.BIGDECIMAL_HUNDRED =
  exports.BIGDECIMAL_THREE =
  exports.BIGDECIMAL_ONE =
  exports.BIGDECIMAL_ZERO =
  exports.BIGINT_ONE_RAY =
  exports.BIGINT_TEN_TO_EIGHTEENTH =
  exports.BIGINT_TEN =
  exports.BIGINT_THREE =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.INT_FOUR =
  exports.INT_TWO =
  exports.INT_ONE =
  exports.INT_ZERO =
  exports.INT_NEGATIVE_ONE =
  exports.INIT_LIQUIDITY_INDEX =
  exports.USDC_TOKEN_ADDRESS =
  exports.ZERO_ADDRESS =
  exports.InterestRateMode =
  exports.ActivityType =
  exports.EventType =
  exports.InterestRateSide =
  exports.RiskType =
  exports.LendingType =
  exports.ProtocolType =
  exports.Network =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
// The network names corresponding to the Network enum in the schema.
// They also correspond to the ones in `dataSource.network()` after converting to lower case.
// See below for a complete list:
// https://thegraph.com/docs/en/hosted-service/what-is-hosted-service/#supported-networks-on-the-hosted-service
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
  Network.GNOSIS = "GNOSIS"; // aka xDAI
  Network.METIS = "ANDROMEDA";
  Network.BASE = "BASE";
})((Network = exports.Network || (exports.Network = {})));
var ProtocolType;
(function (ProtocolType) {
  ProtocolType.EXCHANGE = "EXCHANGE";
  ProtocolType.LENDING = "LENDING";
  ProtocolType.YIELD = "YIELD";
  ProtocolType.BRIDGE = "BRIDGE";
  ProtocolType.GENERIC = "GENERIC";
})((ProtocolType = exports.ProtocolType || (exports.ProtocolType = {})));
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
var InterestRateSide;
(function (InterestRateSide) {
  InterestRateSide.LENDER = "LENDER";
  InterestRateSide.BORROWER = "BORROWER";
})(
  (InterestRateSide =
    exports.InterestRateSide || (exports.InterestRateSide = {}))
);
var EventType;
(function (EventType) {
  EventType.DEPOSIT = 1;
  EventType.WITHDRAW = 2;
  EventType.BORROW = 3;
  EventType.REPAY = 4;
  EventType.LIQUIDATOR = 5;
  EventType.LIQUIDATEE = 6;
})((EventType = exports.EventType || (exports.EventType = {})));
var ActivityType;
(function (ActivityType) {
  ActivityType.DAILY = "DAILY";
  ActivityType.HOURLY = "HOURLY";
})((ActivityType = exports.ActivityType || (exports.ActivityType = {})));
var InterestRateMode;
(function (InterestRateMode) {
  InterestRateMode.NONE = 0;
  InterestRateMode.STABLE = 1;
  InterestRateMode.VARIABLE = 2;
})(
  (InterestRateMode =
    exports.InterestRateMode || (exports.InterestRateMode = {}))
);
/////////////////////
///// Addresses /////
/////////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.USDC_TOKEN_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // used for Mainnet pricing
///////////////////
///// Numbers /////
///////////////////
exports.INIT_LIQUIDITY_INDEX = graph_ts_1.BigInt.fromString(
  "1000000000000000000000000000"
);
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_THREE = graph_ts_1.BigInt.fromI32(3);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromString("10").pow(18);
exports.BIGINT_ONE_RAY = graph_ts_1.BigInt.fromString("10").pow(27);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_THREE = new graph_ts_1.BigDecimal(exports.BIGINT_THREE);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(100)
);
exports.BIGDECIMAL_NEG_ONE_CENT = graph_ts_1.BigDecimal.fromString("-0.01");
exports.DEFAULT_DECIMALS = 18;
exports.RAY_OFFSET = 27;
exports.SECONDS_PER_HOUR = 60 * 60;
exports.SECONDS_PER_DAY = 60 * 60 * 24;
var IavsTokenType;
(function (IavsTokenType) {
  IavsTokenType.ATOKEN = "ATOKEN";
  IavsTokenType.INPUTTOKEN = "INPUTTOKEN";
  IavsTokenType.VTOKEN = "VTOKEN";
  IavsTokenType.STOKEN = "STOKEN";
})((IavsTokenType = exports.IavsTokenType || (exports.IavsTokenType = {})));
