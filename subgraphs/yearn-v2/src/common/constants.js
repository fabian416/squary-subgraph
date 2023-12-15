"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLACKLISTED_TRANSACTION = exports.MAX_UINT256_STR = exports.MAX_UINT256 = exports.YEARN_TREASURY_VAULT = exports.PROTOCOL_ID = exports.LOCKED_PROFIT_DEGRADATION = exports.USDC_DENOMINATOR = exports.DEGRADATION_COEFFICIENT = exports.DEFAULT_DECIMALS = exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR = exports.USDC_DECIMALS = exports.BIGDECIMAL_NEGATIVE_ONE = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_ZERO = exports.BIGINT_HUNDRED = exports.BIGINT_TEN = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.DEFAULT_WITHDRAWAL_FEE = exports.DEFAULT_PERFORMANCE_FEE = exports.DEFAULT_MANAGEMENT_FEE = exports.VaultVersions = exports.Protocol = exports.NULL = exports.RewardTokenType = exports.VaultFeeType = exports.ProtocolType = exports.Network = void 0;
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
var NULL;
(function (NULL) {
    NULL.TYPE_STRING = "0x0000000000000000000000000000000000000000";
    NULL.TYPE_ADDRESS = graph_ts_1.Address.fromString(NULL.TYPE_STRING);
})(NULL = exports.NULL || (exports.NULL = {}));
var Protocol;
(function (Protocol) {
    Protocol.NAME = "Yearn v2";
    Protocol.SLUG = "yearn-v2";
    Protocol.NETWORK = Network.MAINNET;
})(Protocol = exports.Protocol || (exports.Protocol = {}));
var VaultVersions;
(function (VaultVersions) {
    VaultVersions.v0_3_0 = "0.3.0";
    VaultVersions.v0_3_1 = "0.3.1";
    VaultVersions.v0_3_2 = "0.3.2";
    VaultVersions.v0_3_3 = "0.3.3";
    VaultVersions.v0_3_5 = "0.3.5";
    VaultVersions.v0_4_3 = "0.4.3";
})(VaultVersions = exports.VaultVersions || (exports.VaultVersions = {}));
exports.DEFAULT_MANAGEMENT_FEE = graph_ts_1.BigInt.fromI32(200);
exports.DEFAULT_PERFORMANCE_FEE = graph_ts_1.BigInt.fromI32(2000);
exports.DEFAULT_WITHDRAWAL_FEE = graph_ts_1.BigInt.fromI32(50);
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigDecimal.fromString("100");
exports.BIGDECIMAL_NEGATIVE_ONE = graph_ts_1.BigDecimal.fromString("-1");
exports.USDC_DECIMALS = 6;
exports.SECONDS_PER_HOUR = 60 * 60;
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.DEFAULT_DECIMALS = graph_ts_1.BigInt.fromI32(18);
exports.DEGRADATION_COEFFICIENT = exports.BIGINT_TEN.pow(18);
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.LOCKED_PROFIT_DEGRADATION = graph_ts_1.BigInt.fromString("46000000000000");
exports.PROTOCOL_ID = "0xe15461b18ee31b7379019dc523231c57d1cbc18c";
exports.YEARN_TREASURY_VAULT = graph_ts_1.Address.fromString("0x93a62da5a14c80f265dabc077fcee437b1a0efde");
exports.MAX_UINT256 = graph_ts_1.BigInt.fromI32(
// eslint-disable-next-line @typescript-eslint/no-loss-of-precision
115792089237316195423570985008687907853269984665640564039457584007913129639935);
exports.MAX_UINT256_STR = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
exports.BLACKLISTED_TRANSACTION = [
    graph_ts_1.Bytes.fromHexString("0xc0ce9effb23616906fb04c5400764fc5f036c2977939c976e959aad23326fb55"),
    graph_ts_1.Bytes.fromHexString("0x0603adc7020c93dfa207b9cc00d4474fb6767ae2f0caf1aa7db64bf23cd67822"),
    graph_ts_1.Bytes.fromHexString("0x8dfecd98048998b91223303890f3e0f28b0b863077f98189090a837932fa6041"),
    graph_ts_1.Bytes.fromHexString("0x216abefbba23885d385278cb44573f407e250c9f4f65260c4bc71921e0ceeb19"),
    graph_ts_1.Bytes.fromHexString("0x4f7e0254eee6a2e2847cd4562fc2178d978b2ebfe424c8b5a6b93a3662f41525"),
    graph_ts_1.Bytes.fromHexString("0x4fc4e03751af80bf1bd548346ef6cdcb0ee99219379ffb7e9088585a4ef73c7e"),
    graph_ts_1.Bytes.fromHexString("0x09d08d6a2caeb6f4f1c90ac68adea93f758dc57d173acfa6621d92f3dc3277d0"),
    graph_ts_1.Bytes.fromHexString("0x151be1c35cbf00fd29e0e370cf5a0469d96656df16b74f19a597b3e87d8f724d"),
    graph_ts_1.Bytes.fromHexString("0x66847f4dc80a6b4c32666972a9a68416d802d78b54619503fd0aec358fedb185"),
];
