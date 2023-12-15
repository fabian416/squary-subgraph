"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INT_NEGATIVE_ONE = exports.BIGINT_MAX = exports.BIGINT_TEN_TO_EIGHTEENTH = exports.BIGINT_THOUSAND = exports.BIGINT_ONE_HUNDRED_TWENTY = exports.BIGINT_HUNDRED = exports.BIGINT_SEVENTY_FIVE = exports.BIGINT_TWENTY_FOUR = exports.BIGINT_TWELVE = exports.BIGINT_SIX = exports.BIGINT_FOUR = exports.BIGINT_THREE = exports.BIGINT_TWO = exports.BIGINT_NEG_ONE = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.DEFAULT_DECIMALS = exports.WStETH_ADDRESS = exports.USDT_ADDRESS = exports.USDC_ADDRESS = exports.WETH_ADDRESS = exports.VIEW_V2_START_BLOCK_NUMBER = exports.FTT_ADDRESS = exports.EUL_MARKET_ADDRESS = exports.EUL_ADDRESS = exports.EULSTAKES_ADDRESS = exports.CRYPTEX_MARKET_ID = exports.EULER_GENERAL_VIEW_V2_ADDRESS = exports.EULER_GENERAL_VIEW_ADDRESS = exports.USDC_ERC20_ADDRESS = exports.USDC_WETH_03_ADDRESS = exports.EXEC_PROXY_ADDRESS = exports.EULER_ADDRESS = exports.ETH_ADDRESS = exports.ZERO_ADDRESS = exports.ActivityType = exports.TransactionType = exports.InterestRateSide = exports.InterestRateType = exports.RiskType = exports.LendingType = exports.RewardTokenType = exports.LiquidityPoolFeeType = exports.VaultFeeType = exports.ProtocolType = exports.Network = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = void 0;
exports.EUL_DIST = exports.PRICINGTYPE__CHAINLINK = exports.PRICINGTYPE__UNKNOWN = exports.BLOCKS_PER_EPOCH = exports.START_EPOCH_BLOCK = exports.MAX_EPOCHS = exports.START_EPOCH = exports.INITIAL_INTEREST_ACCUMULATOR = exports.MODULEID__MARKETS = exports.MODULEID__RISK_MANAGER = exports.MODULEID__EXEC = exports.INTERNAL_DEBT_PRECISION = exports.INTEREST_RATE_DECIMALS = exports.INTEREST_RATE_PRECISION = exports.UNISWAP_Q192 = exports.EXEC_START_BLOCK_NUMBER = exports.INITIAL_RESERVES = exports.EUL_DECIMALS = exports.RESERVE_PRECISION = exports.UNDERLYING_RESERVES_FEE = exports.DEFAULT_RESERVE_FEE = exports.RESERVE_FEE_SCALE = exports.CONFIG_FACTOR_SCALE = exports.DECIMAL_PRECISION = exports.USDC_SYMBOL = exports.ETH_NAME = exports.ETH_SYMBOL = exports.BLOCKS_PER_DAY = exports.SECONDS_PER_BLOCK = exports.MS_PER_YEAR = exports.SECONDS_PER_YEAR = exports.DAYS_PER_YEAR = exports.MS_PER_DAY = exports.SECONDS_PER_HOUR = exports.SECONDS_PER_DAY = exports.MAX_UINT = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_ONE_HUNDRED_TWENTY = exports.BIGDECIMAL_TWENTY_FOUR = exports.BIGDECIMAL_TWELVE = exports.BIGDECIMAL_SIX = exports.BIGDECIMAL_FOUR = exports.BIGDECIMAL_THREE = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.INT_FOUR = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_NAME = "Euler";
exports.PROTOCOL_SLUG = "euler";
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
    InterestRateType.FIXED_TERM = "FIXED_TERM";
})(InterestRateType = exports.InterestRateType || (exports.InterestRateType = {}));
var InterestRateSide;
(function (InterestRateSide) {
    InterestRateSide.LENDER = "LENDER";
    InterestRateSide.BORROWER = "BORROWER";
})(InterestRateSide = exports.InterestRateSide || (exports.InterestRateSide = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType.DEPOSIT = "DEPOSIT";
    TransactionType.WITHDRAW = "WITHDRAW";
    TransactionType.BORROW = "BORROW";
    TransactionType.LIQUIDATE = "LIQUIDATE";
    TransactionType.REPAY = "REPAY";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType.DAILY = "DAILY";
    ActivityType.HOURLY = "HOURLY";
})(ActivityType = exports.ActivityType || (exports.ActivityType = {}));
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
exports.EULER_ADDRESS = "0x27182842e098f60e3d576794a5bffb0777e025d3";
exports.EXEC_PROXY_ADDRESS = "0x59828fdf7ee634aaad3f58b19fdba3b03e2d9d80";
exports.USDC_WETH_03_ADDRESS = "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8";
exports.USDC_ERC20_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
exports.EULER_GENERAL_VIEW_ADDRESS = "0x9d2b3052f5a3c156a34fc32cd08e9f5501720ea4";
exports.EULER_GENERAL_VIEW_V2_ADDRESS = "0xacc25c4d40651676feed43a3467f3169e3e68e42";
exports.CRYPTEX_MARKET_ID = "0x321c2fe4446c7c963dc41dd58879af648838f98d";
exports.EULSTAKES_ADDRESS = "0xc697bb6625d9f7adcf0fbf0cbd4dcf50d8716cd3";
// EUL token address is the same as EUL market address
exports.EUL_ADDRESS = "0xd9fcd98c322942075a5c3860693e9f4f03aae07b";
exports.EUL_MARKET_ADDRESS = "0xd9fcd98c322942075a5c3860693e9f4f03aae07b";
exports.FTT_ADDRESS = "0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9";
exports.VIEW_V2_START_BLOCK_NUMBER = graph_ts_1.BigInt.fromI32(14482429);
exports.WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
exports.USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
exports.USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
exports.WStETH_ADDRESS = "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0";
////////////////////////
///// Type Helpers /////
////////////////////////
exports.DEFAULT_DECIMALS = 18;
exports.USDC_DECIMALS = 6;
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_NEG_ONE = graph_ts_1.BigInt.fromI32(-1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_THREE = graph_ts_1.BigInt.fromI32(3);
exports.BIGINT_FOUR = graph_ts_1.BigInt.fromI32(4);
exports.BIGINT_SIX = graph_ts_1.BigInt.fromI32(6);
exports.BIGINT_TWELVE = graph_ts_1.BigInt.fromI32(12);
exports.BIGINT_TWENTY_FOUR = graph_ts_1.BigInt.fromI32(24);
exports.BIGINT_SEVENTY_FIVE = graph_ts_1.BigInt.fromI32(75);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_ONE_HUNDRED_TWENTY = graph_ts_1.BigInt.fromI32(120);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromI32(10).pow(18);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString("115792089237316195423570985008687907853269984665640564039457584007913129639935");
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_THREE = new graph_ts_1.BigDecimal(exports.BIGINT_THREE);
exports.BIGDECIMAL_FOUR = new graph_ts_1.BigDecimal(exports.BIGINT_FOUR);
exports.BIGDECIMAL_SIX = new graph_ts_1.BigDecimal(exports.BIGINT_SIX);
exports.BIGDECIMAL_TWELVE = new graph_ts_1.BigDecimal(exports.BIGINT_TWELVE);
exports.BIGDECIMAL_TWENTY_FOUR = new graph_ts_1.BigDecimal(exports.BIGINT_TWENTY_FOUR);
exports.BIGDECIMAL_ONE_HUNDRED_TWENTY = new graph_ts_1.BigDecimal(exports.BIGINT_ONE_HUNDRED_TWENTY);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(graph_ts_1.BigInt.fromI32(255));
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000));
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(365));
exports.SECONDS_PER_YEAR = exports.DAYS_PER_YEAR.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60)));
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)));
exports.SECONDS_PER_BLOCK = 13;
exports.BLOCKS_PER_DAY = exports.SECONDS_PER_DAY / exports.SECONDS_PER_BLOCK;
////////////////
///// Misc /////
////////////////
exports.ETH_SYMBOL = "ETH";
exports.ETH_NAME = "Ether";
exports.USDC_SYMBOL = "USDC";
//////////////////////////
///// Euler Specific /////
//////////////////////////
exports.DECIMAL_PRECISION = exports.BIGINT_TEN_TO_EIGHTEENTH.toBigDecimal();
exports.CONFIG_FACTOR_SCALE = graph_ts_1.BigDecimal.fromString("4e9");
exports.RESERVE_FEE_SCALE = graph_ts_1.BigDecimal.fromString("4e9");
exports.DEFAULT_RESERVE_FEE = graph_ts_1.BigDecimal.fromString("0.23").times(exports.RESERVE_FEE_SCALE);
// How much of a liquidation is credited to the underlying's reserves.
exports.UNDERLYING_RESERVES_FEE = graph_ts_1.BigDecimal.fromString("0.02").times(exports.DECIMAL_PRECISION);
// if delta Reverse < delta totalBalances +/- RESERVE_PRECISION
// consider them equal
exports.RESERVE_PRECISION = graph_ts_1.BigInt.fromI32(10).pow(9);
exports.EUL_DECIMALS = 1e18;
exports.INITIAL_RESERVES = graph_ts_1.BigInt.fromI32(1e6);
exports.EXEC_START_BLOCK_NUMBER = graph_ts_1.BigInt.fromI32(13711556);
exports.UNISWAP_Q192 = graph_ts_1.BigDecimal.fromString(graph_ts_1.BigInt.fromI32(2).pow(192).toString());
exports.INTEREST_RATE_PRECISION = graph_ts_1.BigDecimal.fromString("1e25");
exports.INTEREST_RATE_DECIMALS = graph_ts_1.BigDecimal.fromString("1e27");
exports.INTERNAL_DEBT_PRECISION = graph_ts_1.BigDecimal.fromString("1e9");
exports.MODULEID__EXEC = graph_ts_1.BigInt.fromI32(5);
exports.MODULEID__RISK_MANAGER = graph_ts_1.BigInt.fromI32(1000000);
exports.MODULEID__MARKETS = graph_ts_1.BigInt.fromI32(2);
exports.INITIAL_INTEREST_ACCUMULATOR = graph_ts_1.BigInt.fromI32(10).pow(27);
// the EulStakes.sol was deployed at block 14975091, or epoch 6
exports.START_EPOCH = 6;
exports.MAX_EPOCHS = 90;
exports.START_EPOCH_BLOCK = graph_ts_1.BigInt.fromI32(14930000);
exports.BLOCKS_PER_EPOCH = 100000;
exports.PRICINGTYPE__UNKNOWN = 0;
exports.PRICINGTYPE__CHAINLINK = 4;
exports.EUL_DIST = [
    41836.14, 43231.14, 44800.97, 46564.39, 48541.27, 50752.38, 53219.03, 55962.62, 59004.03, 62362.78, 66056.03, 70097.3,
    8000.0, 8000.0, 8000.0, 8000.0, 8000.0, 8000.0, 107723.4, 114028.05, 120350.07, 126576.02, 132578.4, 138219.39,
    143356.23, 147847.72, 151561.68, 154382.67, 156219.3, 157010.35, 156729.02, 155384.87, 153023.12, 149721.46,
    145584.72, 140738.06, 135319.35, 129471.49, 123335.4, 117044.06, 110718, 104462.21, 98364.54, 92495.32, 86907.93,
    81640.16, 76715.96, 72147.47, 67937.09, 64079.46, 60563.32, 57373.05, 54490.13, 51894.21, 49564.05, 47478.22,
    45615.66, 43956.02, 42480, 41169.47, 40007.56, 38978.76, 38068.84, 37264.86, 36555.12, 35929.04, 35377.14, 34890.91,
    34462.77, 34085.94, 33754.42, 33462.85, 33206.5, 32981.18, 32783.18, 32609.22, 32456.41, 32322.2, 32204.35, 32100.87,
    32010.02, 31930.27, 31860.26, 31798.82, 31744.89, 31697.56, 31656.03, 31619.58, 31587.6, 31559.53, 17864.18,
];
