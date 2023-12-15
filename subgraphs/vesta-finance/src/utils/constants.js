"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USDC_ADDRESS = exports.WETH_ADDRESS = exports.VSTA_ADDRESS = exports.VST_ADDRESS = exports.PRICE_ORACLE_V1_ADDRESS = exports.VESTA_PARAMETERS_ADDRESS = exports.TROVE_MANAGER = exports.STABILITY_POOL_MANAGER = exports.ETH_NAME = exports.ETH_SYMBOL = exports.MS_PER_YEAR = exports.DAYS_PER_YEAR = exports.MS_PER_DAY = exports.SECONDS_PER_HOUR = exports.SECONDS_PER_DAY = exports.EMPTY_STRING = exports.MAX_UINT = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.INT_FOUR = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.INT_NEGATIVE_ONE = exports.BIGINT_MAX = exports.BIGINT_THOUSAND = exports.BIGINT_HUNDRED = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.gOHM_DECIMALS = exports.DEFAULT_DECIMALS = exports.ETH_ADDRESS = exports.ZERO_ADDRESS = exports.PositionSide = exports.InterestRateSide = exports.InterestRateType = exports.RiskType = exports.LendingType = exports.RewardTokenType = exports.LiquidityPoolFeeType = exports.VaultFeeType = exports.ProtocolType = exports.Network = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = void 0;
exports.STABILITYPOOL_ASSET = exports.MINUTES_PER_DAY = exports.BONUS_TO_SP = exports.LIQUIDATION_RESERVE_VST = exports.LIQUIDATION_FEE = exports.LIQUIDATION_FEE_PERCENT = exports.MAXIMUM_LTV = exports.MINIMUM_COLLATERAL_RATIO = exports.VST_BALANCER_POOL_CREATED_BLOCK = exports.VSTA_BALANCER_POOL_CREATED_BLOCK = exports.ACTIVE_POOL_CREATED_BLOCK = exports.ACTIVE_POOL_CREATED_TIMESTAMP = exports.ACTIVE_POOL_ADDRESS = exports.SUSHI_WETH_USDC_PAIR_ADDRESS = exports.SUSHI_gOHM_WETH_PAIR_ADDRESS = exports.BAL_VST_DAI_USDT_USDC_POOL_ADDRESS = exports.BAL_WETH_WBTC_USDC_POOL_ADDRESS = exports.BAL_VSTA_WETH_POOL_ADDRESS = exports.gOHM_ADDRESS = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_NAME = "Vesta Finance";
exports.PROTOCOL_SLUG = "vesta-finance";
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
    InterestRateType.FIXED = "FIXED";
})(InterestRateType = exports.InterestRateType || (exports.InterestRateType = {}));
var InterestRateSide;
(function (InterestRateSide) {
    InterestRateSide.LENDER = "LENDER";
    InterestRateSide.BORROWER = "BORROWER";
})(InterestRateSide = exports.InterestRateSide || (exports.InterestRateSide = {}));
var PositionSide;
(function (PositionSide) {
    PositionSide.LENDER = "LENDER";
    PositionSide.BORROWER = "BORROWER";
})(PositionSide = exports.PositionSide || (exports.PositionSide = {}));
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
////////////////////////
///// Type Helpers /////
////////////////////////
exports.DEFAULT_DECIMALS = 18;
exports.gOHM_DECIMALS = 18;
exports.USDC_DECIMALS = 6;
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
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
exports.EMPTY_STRING = "";
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
exports.STABILITY_POOL_MANAGER = "0x8aa2e4b1e9a626954b183966eb6665543c03f386";
exports.TROVE_MANAGER = "0x100ec08129e0fd59959df93a8b914944a3bbd5df";
exports.VESTA_PARAMETERS_ADDRESS = "0x5f51b0a5e940a3a20502b5f59511b13788ec6ddb";
exports.PRICE_ORACLE_V1_ADDRESS = "0xc93408bfbea0bf3e53bedbce7d5c1e64db826702";
exports.VST_ADDRESS = "0x64343594ab9b56e99087bfa6f2335db24c2d1f17";
exports.VSTA_ADDRESS = "0xa684cd057951541187f288294a1e1c2646aa2d24";
exports.WETH_ADDRESS = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
exports.USDC_ADDRESS = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";
exports.gOHM_ADDRESS = "0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1";
exports.BAL_VSTA_WETH_POOL_ADDRESS = "0xc61ff48f94d801c1ceface0289085197b5ec44f0";
exports.BAL_WETH_WBTC_USDC_POOL_ADDRESS = "0x64541216bafffeec8ea535bb71fbc927831d0595";
exports.BAL_VST_DAI_USDT_USDC_POOL_ADDRESS = "0x5a5884fc31948d59df2aeccca143de900d49e1a3";
exports.SUSHI_gOHM_WETH_PAIR_ADDRESS = "0xaa5bd49f2162ffdc15634c87a77ac67bd51c6a6d";
exports.SUSHI_WETH_USDC_PAIR_ADDRESS = "0x905dfcd5649217c42684f23958568e533c711aa3";
exports.ACTIVE_POOL_ADDRESS = "0xbe3de7fb9aa09b3fa931868fb49d5ba5fee2ebb1";
exports.ACTIVE_POOL_CREATED_TIMESTAMP = graph_ts_1.BigInt.fromI32(1644224579);
exports.ACTIVE_POOL_CREATED_BLOCK = graph_ts_1.BigInt.fromI32(5559192);
exports.VSTA_BALANCER_POOL_CREATED_BLOCK = graph_ts_1.BigInt.fromI32(5671673);
exports.VST_BALANCER_POOL_CREATED_BLOCK = graph_ts_1.BigInt.fromI32(9455379);
exports.MINIMUM_COLLATERAL_RATIO = graph_ts_1.BigDecimal.fromString("1.1");
exports.MAXIMUM_LTV = exports.BIGDECIMAL_HUNDRED.div(exports.MINIMUM_COLLATERAL_RATIO);
exports.LIQUIDATION_FEE_PERCENT = graph_ts_1.BigDecimal.fromString("0.5");
exports.LIQUIDATION_FEE = exports.LIQUIDATION_FEE_PERCENT.div(exports.BIGDECIMAL_HUNDRED);
exports.LIQUIDATION_RESERVE_VST = graph_ts_1.BigDecimal.fromString("30");
exports.BONUS_TO_SP = graph_ts_1.BigDecimal.fromString("10");
exports.MINUTES_PER_DAY = graph_ts_1.BigInt.fromI32(24 * 60);
exports.STABILITYPOOL_ASSET = "StabilityPool_Asset";
