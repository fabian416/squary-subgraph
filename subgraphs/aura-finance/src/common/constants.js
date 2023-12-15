"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INACURATE_PRICEFEED_TOKENS =
  exports.BAL_TOKEN_ADDR =
  exports.FEE_DENOMINATOR =
  exports.MS_PER_YEAR =
  exports.DAYS_PER_YEAR =
  exports.MS_PER_DAY =
  exports.SECONDS_PER_HOUR =
  exports.SECONDS_PER_DAY =
  exports.MAX_UINT =
  exports.BIGDECIMAL_1E18 =
  exports.BIGDECIMAL_HUNDRED =
  exports.BIGDECIMAL_TWO =
  exports.BIGDECIMAL_ONE =
  exports.BIGDECIMAL_ZERO =
  exports.INT_FOUR =
  exports.INT_TWO =
  exports.INT_ONE =
  exports.INT_ZERO =
  exports.INT_NEGATIVE_ONE =
  exports.BIGINT_MAX =
  exports.BIGINT_TEN_TO_EIGHTEENTH =
  exports.BIGINT_THOUSAND =
  exports.BIGINT_HUNDRED =
  exports.BIGINT_TEN =
  exports.BIGINT_TWO =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.ETH_ADDRESS =
  exports.ZERO_ADDRESS =
  exports.ETH_DECIMALS =
  exports.ETH_SYMBOL =
  exports.ETH_NAME =
  exports.VaultFeeType =
  exports.RewardIntervalType =
  exports.RewardTokenType =
  exports.ProtocolType =
  exports.Network =
  exports.PROTOCOL_SLUG =
  exports.PROTOCOL_NAME =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_NAME = "Aura Finance";
exports.PROTOCOL_SLUG = "aura-finance";
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
var RewardTokenType;
(function (RewardTokenType) {
  RewardTokenType.DEPOSIT = "DEPOSIT";
  RewardTokenType.BORROW = "BORROW";
})(
  (RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}))
);
var RewardIntervalType;
(function (RewardIntervalType) {
  RewardIntervalType.BLOCK = "BLOCK";
  RewardIntervalType.TIMESTAMP = "TIMESTAMP";
})(
  (RewardIntervalType =
    exports.RewardIntervalType || (exports.RewardIntervalType = {}))
);
var VaultFeeType;
(function (VaultFeeType) {
  VaultFeeType.MANAGEMENT_FEE = "MANAGEMENT_FEE";
  VaultFeeType.PERFORMANCE_FEE = "PERFORMANCE_FEE";
  VaultFeeType.DEPOSIT_FEE = "DEPOSIT_FEE";
  VaultFeeType.WITHDRAWAL_FEE = "WITHDRAWAL_FEE";
})((VaultFeeType = exports.VaultFeeType || (exports.VaultFeeType = {})));
////////////////////
///// Ethereum /////
////////////////////
exports.ETH_NAME = "Ether";
exports.ETH_SYMBOL = "ETH";
exports.ETH_DECIMALS = 18;
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
////////////////////////
///// Type Helpers /////
////////////////////////
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromString("10").pow(18);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.BIGDECIMAL_1E18 = new graph_ts_1.BigDecimal(exports.BIGINT_TEN.pow(18));
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(
  graph_ts_1.BigInt.fromI32(255)
);
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
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.FEE_DENOMINATOR = graph_ts_1.BigDecimal.fromString("10000");
exports.BAL_TOKEN_ADDR = graph_ts_1.Address.fromString(
  "0xba100000625a3754423978a60c9317c58a424e3D"
);
exports.INACURATE_PRICEFEED_TOKENS = [
  graph_ts_1.Address.fromString("0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB"),
  graph_ts_1.Address.fromString("0x798d1be841a82a273720ce31c822c61a67a601c3"),
  graph_ts_1.Address.fromString("0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8"), // SILO
];
