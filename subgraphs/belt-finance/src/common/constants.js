"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BELT_TOKEN_ADDRESS =
  exports.PROTOCOL_ID =
  exports.STRATEGIES_CACHING_BLOCKS =
  exports.PRICE_CACHING_BLOCKS =
  exports.BIG_DECIMAL_SECONDS_PER_DAY =
  exports.BIGDECIMAL_NEGATIVE_ONE =
  exports.BIGDECIMAL_HUNDRED =
  exports.BIGDECIMAL_ZERO =
  exports.BIGDECIMAL_ONE =
  exports.BSC_BLOCK_RATE =
  exports.BIGINT_HUNDRED =
  exports.BIGINT_TEN =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.DEFAULT_DECIMALS =
  exports.MAX_BPS =
  exports.SECONDS_PER_DAY =
  exports.SECONDS_PER_HOUR =
  exports.Protocol =
  exports.NULL =
  exports.RewardIntervalType =
  exports.RewardTokenType =
  exports.VaultFeeType =
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
  Network.AVALANCHE = "AVALANCHE";
  Network.BOBA = "BOBA";
  Network.AURORA = "AURORA";
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
var VaultFeeType;
(function (VaultFeeType) {
  VaultFeeType.MANAGEMENT_FEE = "MANAGEMENT_FEE";
  VaultFeeType.PERFORMANCE_FEE = "PERFORMANCE_FEE";
  VaultFeeType.DEPOSIT_FEE = "DEPOSIT_FEE";
  VaultFeeType.WITHDRAWAL_FEE = "WITHDRAWAL_FEE";
})((VaultFeeType = exports.VaultFeeType || (exports.VaultFeeType = {})));
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
var NULL;
(function (NULL) {
  NULL.TYPE_STRING = "0x0000000000000000000000000000000000000000";
  NULL.TYPE_ADDRESS = graph_ts_1.Address.fromString(NULL.TYPE_STRING);
})((NULL = exports.NULL || (exports.NULL = {})));
var Protocol;
(function (Protocol) {
  Protocol.NAME = "Belt Finance";
  Protocol.SLUG = "belt-finance";
})((Protocol = exports.Protocol || (exports.Protocol = {})));
exports.SECONDS_PER_HOUR = 60 * 60;
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.MAX_BPS = graph_ts_1.BigInt.fromI32(10000);
exports.DEFAULT_DECIMALS = graph_ts_1.BigInt.fromI32(18);
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BSC_BLOCK_RATE = graph_ts_1.BigDecimal.fromString("3.9");
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigDecimal.fromString("100");
exports.BIGDECIMAL_NEGATIVE_ONE = graph_ts_1.BigDecimal.fromString("-1");
exports.BIG_DECIMAL_SECONDS_PER_DAY = graph_ts_1.BigDecimal.fromString("86400");
exports.PRICE_CACHING_BLOCKS = graph_ts_1.BigInt.fromI32(1200);
exports.STRATEGIES_CACHING_BLOCKS = graph_ts_1.BigInt.fromI32(1200);
exports.PROTOCOL_ID = graph_ts_1.Address.fromString(
  "0xB543248F75fd9f64D10c247b5a57F142EFF88Aac"
);
exports.BELT_TOKEN_ADDRESS = graph_ts_1.Address.fromString(
  "0xe0e514c71282b6f4e823703a39374cf58dc3ea4f"
);
