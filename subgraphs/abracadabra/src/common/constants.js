"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEGENBOX_ADDRESS_AVALANCHE =
  exports.DEGENBOX_ADDRESS_MAINNET =
  exports.BENTOBOX_ADDRESS_BSC =
  exports.BENTOBOX_ADDRESS_FANTOM =
  exports.BENTOBOX_ADDRESS_ARBITRUM =
  exports.BENTOBOX_ADDRESS_AVALANCHE =
  exports.BENTOBOX_ADDRESS_MAINNET =
  exports.MS_PER_YEAR =
  exports.DAYS_PER_YEAR =
  exports.MS_PER_DAY =
  exports.SECONDS_PER_YEAR =
  exports.SECONDS_PER_DAY =
  exports.SECONDS_PER_HOUR =
  exports.MAX_UINT =
  exports.BIGDECIMAL_ONE_HUNDRED =
  exports.BIGDECIMAL_TWO =
  exports.BIGDECIMAL_ONE =
  exports.BIGDECIMAL_ZERO =
  exports.NEG_INT_ONE =
  exports.INT_TWO =
  exports.INT_ONE =
  exports.INT_ZERO =
  exports.BIGINT_MAX =
  exports.BIGINT_THOUSAND =
  exports.BIGINT_TWO =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.USDC_DENOMINATOR =
  exports.USDC_DECIMALS =
  exports.DEFAULT_DECIMALS =
  exports.AVAX_JOE_BAR_MARKET_ADDRESS =
  exports.USD_BTC_ETH_ABRA_ADDRESS =
  exports.USDT_WETH_PAIR =
  exports.DAI_WETH_PAIR =
  exports.USDC_WETH_PAIR =
  exports.WETH_ADDRESS =
  exports.UNISWAP_V2_FACTORY =
  exports.ETH_ADDRESS =
  exports.ZERO_ADDRESS =
  exports.PositionSide =
  exports.EventType =
  exports.InterestRateSide =
  exports.InterestRateType =
  exports.RiskType =
  exports.LendingType =
  exports.RewardTokenType =
  exports.LiquidityPoolFeeType =
  exports.VaultFeeType =
  exports.ProtocolType =
  exports.Network =
    void 0;
exports.AVALANCHE_NETWORK =
  exports.BSC_NETWORK =
  exports.ARB_NETWORK =
  exports.FTM_NETWORK =
  exports.ETH_NETWORK =
  exports.CHAINLINK_ORACLE_DECIMALS =
  exports.ABRA_PROTOCOL_REVENUE_SHARE =
  exports.ABRA_USER_REVENUE_SHARE =
  exports.HIGH_RISK_LIQUIDATION_PENALTY =
  exports.LOW_RISK_LIQUIDATION_PENALTY =
  exports.HIGH_RISK_INTEREST_RATE =
  exports.LOW_RISK_INTEREST_RATE =
  exports.STABLE_RISK_COLLATERAL_RATE =
  exports.HIGH_RISK_COLLATERAL_RATE =
  exports.LOW_RISK_COLLATERAL_RATE =
  exports.COLLATERIZATION_RATE_PRECISION =
  exports.XSUSHI_MARKET =
  exports.YV_USDC_MARKET =
  exports.YV_YFI_MARKET =
  exports.YV_WETH_MARKET =
  exports.YV_USDT_MARKET =
  exports.STAKED_SPELL_FANTOM =
  exports.STAKED_SPELL_ARBITRUM =
  exports.STAKED_SPELL_AVALANCHE =
  exports.STAKED_SPELL_MAINNET =
  exports.MIM_BSC =
  exports.MIM_FANTOM =
  exports.MIM_ARBITRUM =
  exports.MIM_AVALANCHE =
  exports.MIM_MAINNET =
  exports.ABRA_ACCOUNTS =
  exports.DEGENBOX_ADDRESS_BSC =
  exports.DEGENBOX_ADDRESS_FANTOM =
  exports.DEGENBOX_ADDRESS_ARBITRUM =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////////
///// Schema Enums /////
////////////////////////
// The enum values are derived from Coingecko slugs (converted to uppercase
// and replaced hyphens with underscores for Postgres enum compatibility)
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
var LiquidityPoolFeeType;
(function (LiquidityPoolFeeType) {
  LiquidityPoolFeeType.FIXED_TRADING_FEE = "FIXED_TRADING_FEE";
  LiquidityPoolFeeType.TIERED_TRADING_FEE = "TIERED_TRADING_FEE";
  LiquidityPoolFeeType.DYNAMIC_TRADING_FEE = "DYNAMIC_TRADING_FEE";
  LiquidityPoolFeeType.PROTOCOL_FEE = "PROTOCOL_FEE";
})(
  (LiquidityPoolFeeType =
    exports.LiquidityPoolFeeType || (exports.LiquidityPoolFeeType = {}))
);
var RewardTokenType;
(function (RewardTokenType) {
  RewardTokenType.DEPOSIT = "DEPOSIT";
  RewardTokenType.BORROW = "BORROW";
})(
  (RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}))
);
var LendingType;
(function (LendingType) {
  LendingType.CDP = "CDP";
  LendingType.POOLED = "POOLED";
})((LendingType = exports.LendingType || (exports.LendingType = {})));
var RiskType;
(function (RiskType) {
  RiskType.GLOBAL = "GLOBAL";
  RiskType.ISOLATED = "ISOLATED";
})((RiskType = exports.RiskType || (exports.RiskType = {})));
var InterestRateType;
(function (InterestRateType) {
  InterestRateType.STABLE = "STABLE";
  InterestRateType.VARIABLE = "VARIABLE";
  InterestRateType.FIXED_TERM = "FIXED";
})(
  (InterestRateType =
    exports.InterestRateType || (exports.InterestRateType = {}))
);
var InterestRateSide;
(function (InterestRateSide) {
  InterestRateSide.LENDER = "LENDER";
  InterestRateSide.BORROW = "BORROWER";
})(
  (InterestRateSide =
    exports.InterestRateSide || (exports.InterestRateSide = {}))
);
var EventType;
(function (EventType) {
  EventType.BORROW = "BORROW";
  EventType.DEPOSIT = "DEPOSIT";
  EventType.WITHDRAW = "WITHDRAW";
  EventType.REPAY = "REPAY";
  EventType.LIQUIDATEE = "LIQUIDATEE";
  EventType.LIQUIDATOR = "LIQUIDATOR";
})((EventType = exports.EventType || (exports.EventType = {})));
var PositionSide;
(function (PositionSide) {
  PositionSide.LENDER = "LENDER";
  PositionSide.BORROWER = "BORROWER";
})((PositionSide = exports.PositionSide || (exports.PositionSide = {})));
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
exports.USD_BTC_ETH_ABRA_ADDRESS = "0x5958a8db7dfe0cc49382209069b00f54e17929c2";
exports.AVAX_JOE_BAR_MARKET_ADDRESS =
  "0x3b63f81ad1fc724e44330b4cf5b5b6e355ad964b";
////////////////////////
///// Type Helpers /////
////////////////////////
exports.DEFAULT_DECIMALS = 18;
exports.USDC_DECIMALS = 6;
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.NEG_INT_ONE = -1;
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_ONE_HUNDRED = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(100)
);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(
  graph_ts_1.BigInt.fromI32(255)
);
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_HOUR = 60 * 60; // 360
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_YEAR = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(60 * 60 * 24 * 365)
);
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)
);
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(365)
);
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(
  new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000))
);
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.BENTOBOX_ADDRESS_MAINNET = "0xf5bce5077908a1b7370b9ae04adc565ebd643966";
exports.BENTOBOX_ADDRESS_AVALANCHE =
  "0xf4f46382c2be1603dc817551ff9a7b333ed1d18f";
exports.BENTOBOX_ADDRESS_ARBITRUM =
  "0x74c764d41b77dbbb4fe771dab1939b00b146894a";
exports.BENTOBOX_ADDRESS_FANTOM = "0xf5bce5077908a1b7370b9ae04adc565ebd643966";
exports.BENTOBOX_ADDRESS_BSC = "0x090185f2135308bad17527004364ebcc2d37e5f6";
exports.DEGENBOX_ADDRESS_MAINNET = "0xd96f48665a1410c0cd669a88898eca36b9fc2cce";
exports.DEGENBOX_ADDRESS_AVALANCHE =
  "0x1fc83f75499b7620d53757f0b01e2ae626aae530";
exports.DEGENBOX_ADDRESS_ARBITRUM = exports.ZERO_ADDRESS;
exports.DEGENBOX_ADDRESS_FANTOM = "0x74a0bca2eeedf8883cb91e37e9ff49430f20a616";
exports.DEGENBOX_ADDRESS_BSC = exports.ZERO_ADDRESS;
exports.ABRA_ACCOUNTS = [
  // same on all chains
  "0xfddfe525054efaad204600d00ca86adb1cc2ea8a",
  "0xb4efda6daf5ef75d08869a0f9c0213278fb43b6c",
];
exports.MIM_MAINNET = "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3";
exports.MIM_AVALANCHE = "0x130966628846bfd36ff31a822705796e8cb8c18d";
exports.MIM_ARBITRUM = "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a";
exports.MIM_FANTOM = "0x82f0b8b456c1a451378467398982d4834b6829c1";
exports.MIM_BSC = "0xfe19f0b51438fd612f6fd59c1dbb3ea319f433ba";
exports.STAKED_SPELL_MAINNET = "0x26fa3fffb6efe8c1e69103acb4044c26b9a106a9";
exports.STAKED_SPELL_AVALANCHE = "0x3ee97d514bbef95a2f110e6b9b73824719030f7a";
exports.STAKED_SPELL_ARBITRUM = "0xf7428ffcb2581a2804998efbb036a43255c8a8d3";
exports.STAKED_SPELL_FANTOM = "0xbb29d2a58d880af8aa5859e30470134deaf84f2b";
exports.YV_USDT_MARKET = "0x551a7cff4de931f32893c928bbc3d25bf1fc5147";
exports.YV_WETH_MARKET = "0x6ff9061bb8f97d948942cef376d98b51fa38b91f";
exports.YV_YFI_MARKET = "0xffbf4892822e0d552cff317f65e1ee7b5d3d9ae6";
exports.YV_USDC_MARKET = "0x6cbafee1fab76ca5b5e144c43b3b50d42b7c8c8f";
exports.XSUSHI_MARKET = "0xbb02a884621fb8f5bfd263a67f58b65df5b090f3";
exports.COLLATERIZATION_RATE_PRECISION = 5;
exports.LOW_RISK_COLLATERAL_RATE = 90000;
exports.HIGH_RISK_COLLATERAL_RATE = 75000;
exports.STABLE_RISK_COLLATERAL_RATE = 100000;
exports.LOW_RISK_INTEREST_RATE = 253509908;
exports.HIGH_RISK_INTEREST_RATE = 475331078;
exports.LOW_RISK_LIQUIDATION_PENALTY = 103000;
exports.HIGH_RISK_LIQUIDATION_PENALTY = 112500;
exports.ABRA_USER_REVENUE_SHARE = graph_ts_1.BigDecimal.fromString("0.75");
exports.ABRA_PROTOCOL_REVENUE_SHARE = graph_ts_1.BigDecimal.fromString("0.25");
exports.CHAINLINK_ORACLE_DECIMALS = 8;
exports.ETH_NETWORK = "mainnet";
exports.FTM_NETWORK = "fantom";
exports.ARB_NETWORK = "arbitrum-one";
exports.BSC_NETWORK = "bsc";
exports.AVALANCHE_NETWORK = "avalanche";
