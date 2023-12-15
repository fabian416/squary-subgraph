"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOL_ID = exports.RIBBON_PLATFORM_ID = exports.GAUGE_CONTROLLER_ADDRESS = exports.RBN_TOKEN = exports.ETH_CALL_V2_CONTRACT = exports.FEE_DENOMINATOR = exports.FEE_DENOMINATOR_BIGINT = exports.BIG_DECIMAL_SECONDS_PER_DAY = exports.BIGINT_NEGATIVE_ONE = exports.USDC_ADDRESS = exports.BIGDECIMAL_NEGATIVE_ONE = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_ZERO = exports.BIGINT_HUNDRED = exports.BIGINT_TEN = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.INT_SIX = exports.DEFAULT_DECIMALS = exports.MAX_BPS = exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR = exports.NULL = exports.TransactionType = exports.RewardIntervalType = exports.RewardTokenType = exports.VaultFeeType = exports.ProtocolType = exports.Network = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_NAME = "Ribbon Finance";
exports.PROTOCOL_SLUG = "ribbon-finance";
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
var TransactionType;
(function (TransactionType) {
    TransactionType.DEPOSIT = "DEPOSIT";
    TransactionType.WITHDRAW = "WITHDRAW";
    TransactionType.REFRESH = "REFRESH";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
var NULL;
(function (NULL) {
    NULL.TYPE_STRING = "0x0000000000000000000000000000000000000000";
    NULL.TYPE_ADDRESS = graph_ts_1.Address.fromString(NULL.TYPE_STRING);
})(NULL = exports.NULL || (exports.NULL = {}));
exports.SECONDS_PER_HOUR = 60 * 60;
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.MAX_BPS = graph_ts_1.BigInt.fromI32(10000);
exports.DEFAULT_DECIMALS = graph_ts_1.BigInt.fromI32(18);
exports.INT_SIX = 6;
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigDecimal.fromString("100");
exports.BIGDECIMAL_NEGATIVE_ONE = graph_ts_1.BigDecimal.fromString("-1");
exports.USDC_ADDRESS = graph_ts_1.Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
exports.BIGINT_NEGATIVE_ONE = graph_ts_1.BigInt.fromString("-1");
exports.BIG_DECIMAL_SECONDS_PER_DAY = graph_ts_1.BigDecimal.fromString("86400");
exports.FEE_DENOMINATOR_BIGINT = exports.BIGINT_TEN.pow(10);
exports.FEE_DENOMINATOR = graph_ts_1.BigDecimal.fromString("10000000000");
exports.ETH_CALL_V2_CONTRACT = graph_ts_1.Address.fromString("0x25751853eab4d0eb3652b5eb6ecb102a2789644b");
exports.RBN_TOKEN = graph_ts_1.Address.fromString("0x6123b0049f904d730db3c36a31167d9d4121fa6b");
exports.GAUGE_CONTROLLER_ADDRESS = graph_ts_1.Address.fromString("0x0cb9cc35cefa5622e8d25af36dd56de142ef6415");
exports.RIBBON_PLATFORM_ID = "ribbon";
exports.PROTOCOL_ID = "0x25751853eab4d0eb3652b5eb6ecb102a2789644b";
