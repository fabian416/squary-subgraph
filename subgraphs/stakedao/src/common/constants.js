"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZERO_ADDRESS_STRING = exports.POOL_MANAGER_ADDRESS = exports.STABLE_MASTER_ADDRESS = exports.ANGLE_USDC_VAULT_ADDRESS = exports.ZERO_ADDRESS = exports.USDC_DENOMINATOR = exports.DEFAULT_DECIMALS = exports.USDC_DECIMALS = exports.ETHEREUM_PROTOCOL_ID = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.DENOMINATOR = exports.BIGINT_SECONDS_PER_DAY = exports.BIGINT_HUNDRED = exports.BIGINT_TEN = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.INT_TEN = exports.BASE_TOKENS = exports.BASE_PARAMS = exports.DEFAULT_WITHDRAWAL_FEE = exports.DEFAULT_PERFORMANCE_FEE = exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR = exports.Protocol = exports.RewardTokenType = exports.VaultFeeType = exports.ProtocolType = exports.Network = void 0;
/* eslint-disable rulesdir/no-checksum-addresses */
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
var Protocol;
(function (Protocol) {
    Protocol.NAME = "Stake DAO";
    Protocol.SLUG = "stake-dao";
    Protocol.NETWORK = Network.MAINNET;
    Protocol.TYPE = ProtocolType.YIELD;
})(Protocol = exports.Protocol || (exports.Protocol = {}));
exports.SECONDS_PER_HOUR = 60 * 60;
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.DEFAULT_PERFORMANCE_FEE = graph_ts_1.BigInt.fromI32(1500);
exports.DEFAULT_WITHDRAWAL_FEE = graph_ts_1.BigInt.fromI32(50);
exports.BASE_PARAMS = graph_ts_1.BigInt.fromString("1000000000");
exports.BASE_TOKENS = graph_ts_1.BigInt.fromString("1000000000000000000");
exports.INT_TEN = 10;
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_SECONDS_PER_DAY = graph_ts_1.BigInt.fromI32(exports.SECONDS_PER_DAY);
exports.DENOMINATOR = graph_ts_1.BigDecimal.fromString("10000");
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigDecimal.fromString("100");
exports.ETHEREUM_PROTOCOL_ID = "0x29D3782825432255041Db2EAfCB7174f5273f08A";
exports.USDC_DECIMALS = 6;
exports.DEFAULT_DECIMALS = graph_ts_1.BigInt.fromI32(18);
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.ZERO_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
exports.ANGLE_USDC_VAULT_ADDRESS = graph_ts_1.Address.fromString("0xf3c2bdfCCb75CAFdA3D69d807c336bede956563f");
exports.STABLE_MASTER_ADDRESS = graph_ts_1.Address.fromString("0x5adDc89785D75C86aB939E9e15bfBBb7Fc086A87");
exports.POOL_MANAGER_ADDRESS = graph_ts_1.Address.fromString("0xe9f183FC656656f1F17af1F2b0dF79b8fF9ad8eD");
exports.ZERO_ADDRESS_STRING = "0x0000000000000000000000000000000000000000";
