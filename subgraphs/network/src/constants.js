"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NETWORK_NAME = exports.ZERO_ADDRESS = exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ZERO = exports.BIGINT_MAX = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.INT_NINE = exports.INT_FOUR = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.INT_NEGATIVE_ONE = exports.IntervalType = exports.DataType = exports.SubgraphNetwork = exports.Network = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
/////////////////////////
//// Enums / Classes ////
/////////////////////////
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
    Network.CLOVER = "CLOVER";
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
    Network.GNOSIS = "GNOSIS"; // aka Gnosis Chain
})(Network = exports.Network || (exports.Network = {}));
// This is how the Network displays on thegraph.com
// These match the network.json config files
var SubgraphNetwork;
(function (SubgraphNetwork) {
    SubgraphNetwork.ARBITRUM = "arbitrum-one";
    SubgraphNetwork.ARWEAVE = "arweave-mainnet";
    SubgraphNetwork.AVALANCHE = "avalanche";
    SubgraphNetwork.AURORA = "aurora";
    SubgraphNetwork.BOBA = "boba";
    SubgraphNetwork.BSC = "bsc";
    SubgraphNetwork.CELO = "celo";
    SubgraphNetwork.CLOVER = "clover";
    SubgraphNetwork.CRONOS = "cronos";
    SubgraphNetwork.COSMOS = "cosmoshub-4";
    SubgraphNetwork.ETHEREUM = "mainnet";
    SubgraphNetwork.FANTOM = "fantom";
    SubgraphNetwork.HARMONY = "harmony";
    SubgraphNetwork.JUNO = "juno";
    SubgraphNetwork.FUSE = "fuse";
    SubgraphNetwork.MOONBEAM = "moonbeam";
    SubgraphNetwork.MOONRIVER = "moonriver";
    SubgraphNetwork.NEAR = "near-mainnet";
    SubgraphNetwork.OPTIMISM = "optimism";
    SubgraphNetwork.OSMOSIS = "osmosis-1";
    SubgraphNetwork.POLYGON = "matic";
    SubgraphNetwork.GNOSIS = "gnosis";
})(SubgraphNetwork = exports.SubgraphNetwork || (exports.SubgraphNetwork = {}));
var DataType;
(function (DataType) {
    DataType.AUTHORS = "AUTHORS";
    DataType.DIFFICULTY = "DIFFICULTY";
    DataType.GAS_USED = "GAS_USED";
    DataType.GAS_LIMIT = "GAS_LIMIT";
    DataType.BURNT_FEES = "BURNT_FEES";
    DataType.REWARDS = "REWARDS";
    DataType.SIZE = "SIZE";
    DataType.CHUNKS = "CHUNKS";
    DataType.SUPPLY = "SUPPLY";
    DataType.TRANSACTIONS = "TRANSACTIONS";
    DataType.BLOCKS = "BLOCKS";
    DataType.BLOCK_INTERVAL = "BLOCK_INTERVAL";
    DataType.GAS_PRICE = "GAS_PRICE";
})(DataType = exports.DataType || (exports.DataType = {}));
var IntervalType;
(function (IntervalType) {
    IntervalType.DAILY = "DAILY";
    IntervalType.HOURLY = "HOURLY";
})(IntervalType = exports.IntervalType || (exports.IntervalType = {}));
/////////////////
//// Numbers ////
/////////////////
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.INT_NINE = 9; // nano second > second conversion
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(exports.INT_ZERO);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(exports.INT_ONE);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString("115792089237316195423570985008687907853269984665640564039457584007913129639935");
exports.BIGDECIMAL_ZERO = graph_ts_1.BigDecimal.fromString("0");
exports.BIGDECIMAL_TWO = graph_ts_1.BigDecimal.fromString("2");
/////////////////////
//// Date / Time ////
/////////////////////
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR * 24; // 86400
///////////////////
//// Addresses ////
///////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
///////////////////////////
//// Network constants ////
///////////////////////////
exports.NETWORK_NAME = graph_ts_1.dataSource.network();
