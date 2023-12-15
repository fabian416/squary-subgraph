"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REWARDS_LOGGER_ADDRESS =
  exports.DIGG_TOKEN_ADDRESS =
  exports.CRV_DAO_TOKEN =
  exports.BVECVX_VAULT_ADDRESS =
  exports.CVX_TOKEN_ADDRESS =
  exports.CONTROLLER_ADDRESS =
  exports.BDIGG_VAULT_ADDRESS =
  exports.PROTOCOL_ID =
  exports.ETH_AVERAGE_BLOCK_PER_HOUR =
  exports.REWARDS_LOGGER_CACHING =
  exports.MAX_BPS =
  exports.BIGDECIMAL_HUNDRED =
  exports.BIGDECIMAL_ZERO =
  exports.BIGINT_HUNDRED =
  exports.BIGINT_TEN =
  exports.BIGINT_NEGATIVE_ONE =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.SECONDS_PER_DAY =
  exports.SECONDS_PER_HOUR =
  exports.DEFAULT_DECIMALS =
  exports.NULL =
  exports.Protocol =
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
var Protocol;
(function (Protocol) {
  Protocol.NAME = "Badger DAO";
  Protocol.SLUG = "badger-dao";
  Protocol.SCHEMA_VERSION = "1.3.0";
  Protocol.SUBGRAPH_VERSION = "1.1.0";
  Protocol.METHODOLOGY_VERSION = "1.0.0";
})((Protocol = exports.Protocol || (exports.Protocol = {})));
var NULL;
(function (NULL) {
  NULL.TYPE_STRING = "0x0000000000000000000000000000000000000000";
  NULL.TYPE_ADDRESS = graph_ts_1.Address.fromString(NULL.TYPE_STRING);
})((NULL = exports.NULL || (exports.NULL = {})));
exports.DEFAULT_DECIMALS = 18;
exports.SECONDS_PER_HOUR = 60 * 60;
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_NEGATIVE_ONE = graph_ts_1.BigInt.fromI32(-1);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigDecimal.fromString("100");
exports.MAX_BPS = graph_ts_1.BigDecimal.fromString("10000");
exports.REWARDS_LOGGER_CACHING = graph_ts_1.BigInt.fromI32(20000);
exports.ETH_AVERAGE_BLOCK_PER_HOUR = graph_ts_1.BigInt.fromI32(3756);
exports.PROTOCOL_ID = "0x63cf44b2548e4493fd099222a1ec79f3344d9682";
exports.BDIGG_VAULT_ADDRESS = graph_ts_1.Address.fromString(
  "0x7e7E112A68d8D2E221E11047a72fFC1065c38e1a"
);
exports.CONTROLLER_ADDRESS = graph_ts_1.Address.fromString(
  "0x63cF44B2548e4493Fd099222A1eC79F3344D9682"
);
exports.CVX_TOKEN_ADDRESS = graph_ts_1.Address.fromString(
  "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B"
);
exports.BVECVX_VAULT_ADDRESS = graph_ts_1.Address.fromString(
  "0xfd05D3C7fe2924020620A8bE4961bBaA747e6305"
);
exports.CRV_DAO_TOKEN = graph_ts_1.Address.fromString(
  "0xd533a949740bb3306d119cc777fa900ba034cd52"
);
exports.DIGG_TOKEN_ADDRESS = graph_ts_1.Address.fromString(
  "0x798D1bE841a82a273720CE31c822C61a67a601C3"
);
exports.REWARDS_LOGGER_ADDRESS = graph_ts_1.Address.fromString(
  "0x0A4F4e92C3334821EbB523324D09E321a6B0d8ec"
);
