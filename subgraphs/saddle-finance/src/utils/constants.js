"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHITELISTED_STABLE_ADDRESSES = exports.LIQUIDITY_THRESHOLD_FOR_SADDLE_PRICING = exports.FEE_PRECISION = exports.DEPLOYER_ADDRESS = exports.ETH_NAME = exports.ETH_SYMBOL = exports.MS_PER_YEAR = exports.DAYS_PER_YEAR = exports.MS_PER_DAY = exports.SECONDS_PER_HOUR = exports.SECONDS_PER_DAY = exports.MAX_UINT = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.INT_FOUR = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.INT_NEGATIVE_ONE = exports.BIGINT_MAX = exports.BIGINT_TEN_TO_EIGHTEENTH = exports.BIGINT_THOUSAND = exports.BIGINT_HUNDRED = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.DEFAULT_DECIMALS = exports.USDT_WETH_PAIR = exports.DAI_WETH_PAIR = exports.USDC_WETH_PAIR = exports.WETH_ADDRESS = exports.UNISWAP_V2_FACTORY = exports.ETH_ADDRESS = exports.ZERO_ADDRESS = exports.UsageType = exports.InterestRateSide = exports.InterestRateType = exports.RiskType = exports.LendingType = exports.RewardTokenType = exports.LiquidityPoolFeeType = exports.VaultFeeType = exports.ProtocolType = exports.Network = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = void 0;
exports.POOL_DATA = exports.BROKEN_POOLS = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const strings_1 = require("./strings");
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_NAME = "Saddle Finance";
exports.PROTOCOL_SLUG = "saddle-finance";
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
var LiquidityPoolFeeType;
(function (LiquidityPoolFeeType) {
    LiquidityPoolFeeType.FIXED_TRADING_FEE = "FIXED_TRADING_FEE";
    LiquidityPoolFeeType.TIERED_TRADING_FEE = "TIERED_TRADING_FEE";
    LiquidityPoolFeeType.DYNAMIC_TRADING_FEE = "DYNAMIC_TRADING_FEE";
    LiquidityPoolFeeType.FIXED_LP_FEE = "FIXED_LP_FEE";
    LiquidityPoolFeeType.DYNAMIC_LP_FEE = "DYNAMIC_LP_FEE";
    LiquidityPoolFeeType.FIXED_PROTOCOL_FEE = "FIXED_PROTOCOL_FEE";
    LiquidityPoolFeeType.DYNAMIC_PROTOCOL_FEE = "DYNAMIC_PROTOCOL_FEE";
    LiquidityPoolFeeType.DEPOSIT_FEE = "DEPOSIT_FEE";
    LiquidityPoolFeeType.WITHDRAWAL_FEE = "WITHDRAWAL_FEE";
})(LiquidityPoolFeeType = exports.LiquidityPoolFeeType || (exports.LiquidityPoolFeeType = {}));
var RewardTokenType;
(function (RewardTokenType) {
    RewardTokenType.DEPOSIT = "DEPOSIT";
    RewardTokenType.BORROW = "BORROW";
})(RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}));
var LendingType;
(function (LendingType) {
    LendingType.CDP = "CDP";
    LendingType.POOLED = "POOLED";
})(LendingType = exports.LendingType || (exports.LendingType = {}));
var RiskType;
(function (RiskType) {
    RiskType.GLOBAL = "GLOBAL";
    RiskType.ISOLATED = "ISOLATED";
})(RiskType = exports.RiskType || (exports.RiskType = {}));
var InterestRateType;
(function (InterestRateType) {
    InterestRateType.STABLE = "STABLE";
    InterestRateType.VARIABLE = "VARIABLE";
    InterestRateType.FIXED_TERM = "FIXED_TERM";
})(InterestRateType = exports.InterestRateType || (exports.InterestRateType = {}));
var InterestRateSide;
(function (InterestRateSide) {
    InterestRateSide.LENDER = "LENDER";
    InterestRateSide.BORROWER = "BORROWER";
})(InterestRateSide = exports.InterestRateSide || (exports.InterestRateSide = {}));
var UsageType;
(function (UsageType) {
    UsageType.DEPOSIT = "DEPOSIT";
    UsageType.WITHDRAW = "WITHDRAW";
    UsageType.SWAP = "SWAP";
})(UsageType = exports.UsageType || (exports.UsageType = {}));
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
exports.UNISWAP_V2_FACTORY = "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f";
exports.WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
exports.USDC_WETH_PAIR = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"; // created 10008355
exports.DAI_WETH_PAIR = "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11"; // created block 10042267
exports.USDT_WETH_PAIR = "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"; // created block 10093341
////////////////////////
///// Type Helpers /////
////////////////////////
exports.DEFAULT_DECIMALS = 18;
exports.USDC_DECIMALS = 6;
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromString("10").pow(18);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString("115792089237316195423570985008687907853269984665640564039457584007913129639935");
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(graph_ts_1.BigInt.fromI32(255));
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000));
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(365));
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)));
////////////////
///// Misc /////
////////////////
exports.ETH_SYMBOL = "ETH";
exports.ETH_NAME = "Ether";
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.DEPLOYER_ADDRESS = "0x5bdb37d0ddea3a90f233c7b7f6b9394b6b2eef34";
exports.FEE_PRECISION = 10;
exports.LIQUIDITY_THRESHOLD_FOR_SADDLE_PRICING = graph_ts_1.BigDecimal.fromString("100000.00");
const MAINNET_STABLES = new Set();
MAINNET_STABLES.add("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"); // USDC mainnet
MAINNET_STABLES.add("0xdac17f958d2ee523a2206206994597c13d831ec7"); // USDT mainnet
MAINNET_STABLES.add("0x6b175474e89094c44da98b954eedeac495271d0f"); // DAI  mainnet
exports.WHITELISTED_STABLE_ADDRESSES = new Map();
exports.WHITELISTED_STABLE_ADDRESSES.set(Network.MAINNET.toLowerCase(), MAINNET_STABLES);
exports.BROKEN_POOLS = new Set();
exports.BROKEN_POOLS.add("0x2334b53ce1309e83a889c337d9422a2a3953dd5a");
exports.BROKEN_POOLS.add("0xa2c27d1cad627f0ec39a18bd305e13731a948e92");
class PoolData {
}
exports.POOL_DATA = new Map();
// BTCv1
exports.POOL_DATA.set((0, strings_1.prefixID)(Network.MAINNET, "0x4f6a43ad7cba042606decaca730d4ce0a57ac62e"), {
    createdTimestamp: graph_ts_1.BigInt.fromI64(1611057088),
    createdBlockNumber: graph_ts_1.BigInt.fromI64(11685572),
});
// sUSD Meta v1
exports.POOL_DATA.set((0, strings_1.prefixID)(Network.MAINNET, "0x0c8bae14c9f9bf2c953997c881befac7729fd314"), {
    createdTimestamp: graph_ts_1.BigInt.fromI64(1627451981),
    createdBlockNumber: graph_ts_1.BigInt.fromI64(12912720),
});
// wCUSD Meta v1
exports.POOL_DATA.set((0, strings_1.prefixID)(Network.MAINNET, "0x3f1d224557afa4365155ea77ce4bc32d5dae2174"), {
    createdTimestamp: graph_ts_1.BigInt.fromI64(1630728602),
    createdBlockNumber: graph_ts_1.BigInt.fromI64(13156995),
});
// sUSD Meta v2
exports.POOL_DATA.set((0, strings_1.prefixID)(Network.MAINNET, "0x824dcd7b044d60df2e89b1bb888e66d8bcf41491"), {
    createdTimestamp: graph_ts_1.BigInt.fromI64(1639529917),
    createdBlockNumber: graph_ts_1.BigInt.fromI64(13806669),
});
// ftmUSD (Fantom)
exports.POOL_DATA.set((0, strings_1.prefixID)(Network.FANTOM, "0xbea9f78090bdb9e662d8cb301a00ad09a5b756e9"), {
    createdTimestamp: graph_ts_1.BigInt.fromI64(1642808458),
    createdBlockNumber: graph_ts_1.BigInt.fromI64(28679173),
});
// arbUSD (Arbitrum)
exports.POOL_DATA.set((0, strings_1.prefixID)(Network.ARBITRUM_ONE, "0xbea9f78090bdb9e662d8cb301a00ad09a5b756e9"), {
    createdTimestamp: graph_ts_1.BigInt.fromI64(1637038159),
    createdBlockNumber: graph_ts_1.BigInt.fromI64(3073795),
});
// FRAX (Arbitrum)
exports.POOL_DATA.set((0, strings_1.prefixID)(Network.ARBITRUM_ONE, "0xfeea4d1bacb0519e8f952460a70719944fe56ee0"), {
    createdTimestamp: graph_ts_1.BigInt.fromI64(1640123527),
    createdBlockNumber: graph_ts_1.BigInt.fromI64(4006435),
});
// USDs Meta (Arbitrum)
exports.POOL_DATA.set((0, strings_1.prefixID)(Network.ARBITRUM_ONE, "0x5dd186f8809147f96d3ffc4508f3c82694e58c9c"), {
    createdTimestamp: graph_ts_1.BigInt.fromI64(1643930648),
    createdBlockNumber: graph_ts_1.BigInt.fromI64(5401331),
});
// optUSD (Optimism)
exports.POOL_DATA.set((0, strings_1.prefixID)(Network.OPTIMISM, "0x5847f8177221268d279cf377d0e01ab3fd993628"), {
    createdTimestamp: graph_ts_1.BigInt.fromI64(1642521534),
    createdBlockNumber: graph_ts_1.BigInt.fromI64(2404204),
});
// FRAX Meta (Optimism)
exports.POOL_DATA.set((0, strings_1.prefixID)(Network.OPTIMISM, "0xc55e8c79e5a6c3216d4023769559d06fa9a7732e"), {
    createdTimestamp: graph_ts_1.BigInt.fromI64(1642521534),
    createdBlockNumber: graph_ts_1.BigInt.fromI64(2404225),
});
