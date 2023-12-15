"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STABLE_COIN_START_BLOCK = exports.STABLE_COIN_DENOM = exports.ATOM_DENOM = exports.OSMO_DENOM = exports.ZERO_ADDRESS_STRING = exports.ZERO_ADDRESS = exports.USDC_DENOMINATOR = exports.DENOMINATOR = exports.DEFAULT_DECIMALS = exports.USDC_DECIMALS = exports.BIGDECIMAL_SECONDS_PER_DAY = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_TEN = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.BIGINT_SECONDS_PER_DAY = exports.BIGINT_HUNDRED = exports.BIGINT_TEN = exports.BIGINT_ONE = exports.BIGINT_NEG_ONE = exports.BIGINT_ZERO = exports.INT_ONE = exports.INT_ZERO = exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR = exports.Messages = exports.UsageType = exports.Protocol = exports.RewardTokenType = exports.LiquidityPoolFeeType = exports.ProtocolType = exports.Network = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
// The network names corresponding to the Network enum in the schema.
// They also correspond to the ones in `dataSource.network()` after converting to lower case.
// See below for a complete list:
// https://thegraph.com/docs/en/hosted-service/what-is-hosted-service/#supported-networks-on-the-hosted-service
var Network;
(function (Network) {
    Network.ARBITRUM_ONE = "ARBITRUM_ONE";
    Network.AVALANCHE = "AVALANCHE";
    Network.AURORA = "AURORA";
    Network.BSC = "BSC"; // aka BNB Chain
    Network.CELO = "CELO";
    Network.MAINNET = "MAINNET"; // Ethereum mainnet
    Network.FANTOM = "FANTOM";
    Network.FUSE = "FUSE";
    Network.MOONBEAM = "MOONBEAM";
    Network.MOONRIVER = "MOONRIVER";
    Network.NEAR_MAINNET = "NEAR_MAINNET";
    Network.OPTIMISM = "OPTIMISM";
    Network.MATIC = "MATIC"; // aka Polygon
    Network.XDAI = "XDAI"; // aka Gnosis Chain
    Network.OSMOSIS = "OSMOSIS";
})(Network = exports.Network || (exports.Network = {}));
var ProtocolType;
(function (ProtocolType) {
    ProtocolType.EXCHANGE = "EXCHANGE";
    ProtocolType.LENDING = "LENDING";
    ProtocolType.YIELD = "YIELD";
    ProtocolType.BRIDGE = "BRIDGE";
    ProtocolType.GENERIC = "GENERIC";
})(ProtocolType = exports.ProtocolType || (exports.ProtocolType = {}));
var LiquidityPoolFeeType;
(function (LiquidityPoolFeeType) {
    LiquidityPoolFeeType.FIXED_TRADING_FEE = "FIXED_TRADING_FEE";
    LiquidityPoolFeeType.TIERED_TRADING_FEE = "TIERED_TRADING_FEE";
    LiquidityPoolFeeType.DYNAMIC_TRADING_FEE = "DYNAMIC_TRADING_FEE";
    LiquidityPoolFeeType.FIXED_LP_FEE = "FIXED_LP_FEE";
    LiquidityPoolFeeType.DYNAMIC_LP_FEE = "DYNAMIC_LP_FEE";
    LiquidityPoolFeeType.FIXED_PROTOCOL_FEE = "FIXED_PROTOCOL_FEE";
    LiquidityPoolFeeType.DYNAMIC_PROTOCOL_FEE = "DYNAMIC_PROTOCOL_FEE";
})(LiquidityPoolFeeType = exports.LiquidityPoolFeeType || (exports.LiquidityPoolFeeType = {}));
var RewardTokenType;
(function (RewardTokenType) {
    RewardTokenType.DEPOSIT = "DEPOSIT";
    RewardTokenType.BORROW = "BORROW";
})(RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}));
var Protocol;
(function (Protocol) {
    Protocol.NAME = "Osmosis";
    Protocol.SLUG = "osmosis";
    Protocol.SCHEMA_VERSION = "1.3.0";
    Protocol.SUBGRAPH_VERSION = "1.0.0";
    Protocol.METHODOLOGY_VERSION = "1.0.0";
})(Protocol = exports.Protocol || (exports.Protocol = {}));
var UsageType;
(function (UsageType) {
    UsageType.DEPOSIT = "DEPOSIT";
    UsageType.WITHDRAW = "WITHDRAW";
    UsageType.SWAP = "SWAP";
})(UsageType = exports.UsageType || (exports.UsageType = {}));
var Messages;
(function (Messages) {
    Messages.MsgCreatePool = "/osmosis.gamm.v1beta1.MsgCreatePool"; // 11918
    Messages.MsgJoinPool = "/osmosis.gamm.v1beta1.MsgJoinPool"; // 44445
    Messages.MsgExitPool = "/osmosis.gamm.v1beta1.MsgExitPool"; // 44433
    Messages.MsgCreateBalancerPool = "/osmosis.gamm.v1beta1.MsgCreateBalancerPool"; // 4355226
    Messages.MsgSwapExactAmountIn = "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn"; // 44445
    Messages.MsgSwapExactAmountOut = "/osmosis.gamm.v1beta1.MsgSwapExactAmountOut";
    Messages.MsgJoinSwapShareAmountOut = "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut";
    Messages.MsgExitSwapShareAmountIn = "/osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn";
    Messages.MsgJoinSwapExternAmountIn = "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn"; // 4713063
    Messages.MsgExitSwapExternAmountOut = "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut";
    Messages.MsgWithdrawDelegatorReward = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward"; // 44444
    Messages.MsgWithdrawValidatorCommission = "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission"; // 44444
    Messages.MsgDelegate = "/cosmos.staking.v1beta1.MsgDelegate"; // 44446
    Messages.MsgDeposit = "/cosmos.gov.v1beta1.MsgDeposit"; // 24383
})(Messages = exports.Messages || (exports.Messages = {}));
exports.SECONDS_PER_HOUR = 60 * 60;
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_NEG_ONE = graph_ts_1.BigInt.fromI32(-1);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_SECONDS_PER_DAY = graph_ts_1.BigInt.fromI32(exports.SECONDS_PER_DAY);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TEN = new graph_ts_1.BigDecimal(exports.BIGINT_TEN);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.BIGDECIMAL_SECONDS_PER_DAY = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(exports.SECONDS_PER_DAY));
exports.USDC_DECIMALS = 6;
exports.DEFAULT_DECIMALS = graph_ts_1.BigInt.fromI32(18);
exports.DENOMINATOR = graph_ts_1.BigDecimal.fromString("10000");
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.ZERO_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
exports.ZERO_ADDRESS_STRING = "0x0000000000000000000000000000000000000000";
exports.OSMO_DENOM = "uosmo";
exports.ATOM_DENOM = "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
exports.STABLE_COIN_DENOM = [
    "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
    "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
    "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E",
    "ibc/71B441E27F1BBB44DD0891BCD370C2794D404D60A4FFE5AECCD9B1E28BC89805",
];
exports.STABLE_COIN_START_BLOCK = 5000000;
