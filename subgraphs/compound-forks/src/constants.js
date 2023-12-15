"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZERO_ADDRESS =
  exports.bigDecimalToBigInt =
  exports.equalsIgnoreCase =
  exports.BDChangeDecimals =
  exports.exponentToBigDecimal =
  exports.cTokenDecimalsBD =
  exports.mantissaFactorBD =
  exports.cTokenDecimals =
  exports.mantissaFactor =
  exports.ARBITRUM_BLOCKS_PER_YEAR =
  exports.MATIC_BLOCKS_PER_YEAR =
  exports.BSC_BLOCKS_PER_YEAR =
  exports.FANTOM_BLOCKS_PER_YEAR =
  exports.AVALANCHE_BLOCKS_PER_YEAR =
  exports.ETHEREUM_BLOCKS_PER_YEAR =
  exports.SECONDS_PER_HOUR =
  exports.SECONDS_PER_DAY =
  exports.SECONDS_PER_YEAR =
  exports.DAYS_PER_YEAR =
  exports.BIGDECIMAL_HUNDRED =
  exports.BIGDECIMAL_ONE =
  exports.BIGDECIMAL_ZERO =
  exports.BIGINT_TEN =
  exports.BIGINT_TEN_TO_EIGHTEENTH =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.INT_FOUR =
  exports.INT_TWO =
  exports.INT_ONE =
  exports.INT_ZERO =
  exports.INT_NEGATIVE_ONE =
  exports.PositionSide =
  exports.ActivityType =
  exports.InterestRateSide =
  exports.InterestRateType =
  exports.RewardTokenType =
  exports.RiskType =
  exports.LendingType =
  exports.ProtocolType =
  exports.Network =
    void 0;
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
var RewardTokenType;
(function (RewardTokenType) {
  RewardTokenType.DEPOSIT = "DEPOSIT";
  RewardTokenType.BORROW = "BORROW";
})(
  (RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}))
);
var InterestRateType;
(function (InterestRateType) {
  InterestRateType.STABLE = "STABLE";
  InterestRateType.VARIABLE = "VARIABLE";
  InterestRateType.FIXED = "FIXED";
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
var ActivityType;
(function (ActivityType) {
  ActivityType.DAILY = "DAILY";
  ActivityType.HOURLY = "HOURLY";
})((ActivityType = exports.ActivityType || (exports.ActivityType = {})));
var PositionSide;
(function (PositionSide) {
  PositionSide.LENDER = "LENDER";
  PositionSide.BORROWER = "BORROWER";
})((PositionSide = exports.PositionSide || (exports.PositionSide = {})));
////////////////////////
///// Type Helpers /////
////////////////////////
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromString("10").pow(18);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(100)
);
/////////////////////
///// Date/Time /////
/////////////////////
exports.DAYS_PER_YEAR = 365;
exports.SECONDS_PER_YEAR = 60 * 60 * 24 * exports.DAYS_PER_YEAR;
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.ETHEREUM_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 13; // 13 = seconds per block
exports.AVALANCHE_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 2; // 2 = seconds per block. This is NOT ideal since avalanche has variable block time.
exports.FANTOM_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 1; // 1 = seconds per block. This is NOT ideal since fantom has variable block time.
exports.BSC_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 3; // 3 = seconds per block
exports.MATIC_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 2; // 2 = seconds per block
exports.ARBITRUM_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 1; // 1 = seconds per block.
/////////////////////////////
/////        Math       /////
/////////////////////////////
exports.mantissaFactor = 18;
exports.cTokenDecimals = 8;
exports.mantissaFactorBD = exponentToBigDecimal(exports.mantissaFactor);
exports.cTokenDecimalsBD = exponentToBigDecimal(exports.cTokenDecimals);
// n => 10^n
function exponentToBigDecimal(decimals) {
  let result = exports.BIGINT_ONE;
  const ten = graph_ts_1.BigInt.fromI32(10);
  for (let i = 0; i < decimals; i++) {
    result = result.times(ten);
  }
  return result.toBigDecimal();
}
exports.exponentToBigDecimal = exponentToBigDecimal;
//change number of decimals for BigDecimal
function BDChangeDecimals(x, from, to) {
  if (to > from) {
    // increase number of decimals
    const diffMagnitude = exponentToBigDecimal(to - from);
    return x.times(diffMagnitude);
  } else if (to < from) {
    // decrease number of decimals
    const diffMagnitude = exponentToBigDecimal(from - to);
    return x.div(diffMagnitude);
  } else {
    return x;
  }
}
exports.BDChangeDecimals = BDChangeDecimals;
function equalsIgnoreCase(a, b) {
  return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
// truncate bigdecimal to bigint (removing numbers right of decimal place)
function bigDecimalToBigInt(n) {
  return graph_ts_1.BigInt.fromString(n.toString().split(".")[0]);
}
exports.bigDecimalToBigInt = bigDecimalToBigInt;
/////////////////////////////
/////     Addresses     /////
/////////////////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
