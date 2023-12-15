"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VWBTC_POOL = exports.VUSDC_POOL = exports.PROTOCOL_ID = exports.BIGDECIMAL_NEGATIVE_ONE = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_ZERO = exports.BIGINT_HUNDRED = exports.BIGINT_TEN = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.DEFAULT_DECIMALS = exports.MAX_BPS = exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR = exports.Protocol = exports.NULL = exports.RewardIntervalType = exports.RewardTokenType = exports.VaultFeeType = exports.ProtocolType = exports.Network = void 0;
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
var RewardTokenType;
(function (RewardTokenType) {
    RewardTokenType.DEPOSIT = "DEPOSIT";
    RewardTokenType.BORROW = "BORROW";
})(RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}));
var RewardIntervalType;
(function (RewardIntervalType) {
    RewardIntervalType.BLOCK = "BLOCK";
    RewardIntervalType.TIMESTAMP = "TIMESTAMP";
})(RewardIntervalType = exports.RewardIntervalType || (exports.RewardIntervalType = {}));
var NULL;
(function (NULL) {
    NULL.TYPE_STRING = "0x0000000000000000000000000000000000000000";
    NULL.TYPE_ADDRESS = graph_ts_1.Address.fromString(NULL.TYPE_STRING);
})(NULL = exports.NULL || (exports.NULL = {}));
var Protocol;
(function (Protocol) {
    Protocol.NAME = "Vesper Finance";
    Protocol.SLUG = "vesper-finance";
})(Protocol = exports.Protocol || (exports.Protocol = {}));
exports.SECONDS_PER_HOUR = 60 * 60;
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.MAX_BPS = graph_ts_1.BigInt.fromI32(10000);
exports.DEFAULT_DECIMALS = graph_ts_1.BigInt.fromI32(18);
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigDecimal.fromString("100");
exports.BIGDECIMAL_NEGATIVE_ONE = graph_ts_1.BigDecimal.fromString("-1");
exports.PROTOCOL_ID = "0xa4F1671d3Aee73C05b552d57f2d16d3cfcBd0217";
exports.VUSDC_POOL = graph_ts_1.Address.fromString("0x0c49066c0808ee8c673553b7cbd99bcc9abf113d");
exports.VWBTC_POOL = graph_ts_1.Address.fromString("0x4b2e76ebbc9f2923d83f5fbde695d8733db1a17b");
