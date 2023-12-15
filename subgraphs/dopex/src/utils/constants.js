"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOL_ID =
  exports.PROTOCOL_SLUG =
  exports.PROTOCOL_NAME =
  exports.ETH_NAME =
  exports.ETH_SYMBOL =
  exports.MS_PER_YEAR =
  exports.DAYS_PER_YEAR =
  exports.MS_PER_DAY =
  exports.SECONDS_PER_HOUR =
  exports.SECONDS_PER_DAY =
  exports.MAX_UINT =
  exports.BIGDECIMAL_THOUSAND =
  exports.BIGDECIMAL_HUNDRED =
  exports.BIGDECIMAL_TWO =
  exports.BIGDECIMAL_ONE =
  exports.BIGDECIMAL_ZERO =
  exports.BIGDECIMAL_NEGONE =
  exports.INT_FOUR =
  exports.INT_TWO =
  exports.INT_ONE =
  exports.INT_ZERO =
  exports.INT_NEGATIVE_ONE =
  exports.BIGINT_MAX =
  exports.BIGINT_TEN_TO_EIGHTEENTH =
  exports.BIGINT_THOUSAND =
  exports.BIGINT_HUNDRED =
  exports.BIGINT_TWO =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.BIGINT_NEGONE =
  exports.USDC_DENOMINATOR =
  exports.USDC_DECIMALS =
  exports.DEFAULT_DECIMALS =
  exports.USDT_WETH_PAIR =
  exports.DAI_WETH_PAIR =
  exports.USDC_WETH_PAIR =
  exports.WETH_ADDRESS =
  exports.UNISWAP_V2_FACTORY =
  exports.ETH_ADDRESS =
  exports.ZERO_ADDRESS =
  exports.OptionType =
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
exports.addressLookupTable =
  exports.CHAIN_LINK =
  exports.PRICE_PRECISION =
  exports.PRICE_CACHING_BLOCKS =
  exports.PROTOCOL_ADDRESS_POLYGON =
  exports.PROTOCOL_ADDRESS_ARBITRUM =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
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
})((Network = exports.Network || (exports.Network = {})));
var ProtocolType;
(function (ProtocolType) {
  ProtocolType.EXCHANGE = "EXCHANGE";
  ProtocolType.LENDING = "LENDING";
  ProtocolType.YIELD = "YIELD";
  ProtocolType.BRIDGE = "BRIDGE";
  ProtocolType.OPTION = "OPTION";
  ProtocolType.PERPETUAL = "PERPETUAL";
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
  LiquidityPoolFeeType.FIXED_LP_FEE = "FIXED_LP_FEE";
  LiquidityPoolFeeType.DYNAMIC_LP_FEE = "DYNAMIC_LP_FEE";
  LiquidityPoolFeeType.FIXED_PROTOCOL_FEE = "FIXED_PROTOCOL_FEE";
  LiquidityPoolFeeType.DYNAMIC_PROTOCOL_FEE = "DYNAMIC_PROTOCOL_FEE";
  LiquidityPoolFeeType.FIXED_STAKE_FEE = "FIXED_STAKE_FEE";
  LiquidityPoolFeeType.DYNAMIC_STAKE_FEE = "DYNAMIC_STAKE_FEE";
  LiquidityPoolFeeType.DEPOSIT_FEE = "DEPOSIT_FEE";
  LiquidityPoolFeeType.WITHDRAWAL_FEE = "WITHDRAWAL_FEE";
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
  InterestRateType.FIXED = "FIXED";
})(
  (InterestRateType =
    exports.InterestRateType || (exports.InterestRateType = {}))
);
var InterestRateSide;
(function (InterestRateSide) {
  InterestRateSide.LENDER = "LENDER";
  InterestRateSide.BORROWER = "BORROWER";
})(
  (InterestRateSide =
    exports.InterestRateSide || (exports.InterestRateSide = {}))
);
var OptionType;
(function (OptionType) {
  OptionType.CALL = "CALL";
  OptionType.PUT = "PUT";
})((OptionType = exports.OptionType || (exports.OptionType = {})));
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
exports.BIGINT_NEGONE = graph_ts_1.BigInt.fromI32(-1);
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromString("10").pow(18);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.BIGDECIMAL_NEGONE = new graph_ts_1.BigDecimal(exports.BIGINT_NEGONE);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.BIGDECIMAL_THOUSAND = new graph_ts_1.BigDecimal(
  exports.BIGINT_THOUSAND
);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(
  graph_ts_1.BigInt.fromI32(255)
);
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)
);
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(365)
);
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(
  new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000))
);
////////////////
///// Misc /////
////////////////
exports.ETH_SYMBOL = "ETH";
exports.ETH_NAME = "Ether";
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.PROTOCOL_NAME = "Dopex";
exports.PROTOCOL_SLUG = "dopex";
exports.PROTOCOL_ID = "DPX";
exports.PROTOCOL_ADDRESS_ARBITRUM =
  "0x10fd85ec522C245a63239b9FC64434F58520bd1f";
exports.PROTOCOL_ADDRESS_POLYGON = "0x4ee9fe9500e7c4fe849add9b14beec5ec5b7d955";
exports.PRICE_CACHING_BLOCKS = graph_ts_1.BigInt.fromI32(7000);
exports.PRICE_PRECISION = graph_ts_1.BigDecimal.fromString("100000000");
exports.CHAIN_LINK = "chainlink";
exports.addressLookupTable = new graph_ts_1.TypedMap();
exports.addressLookupTable.set(
  "rDPX",
  "0x32eb7902d4134bf98a28b963d26de779af92a212"
);
exports.addressLookupTable.set(
  "DPX",
  "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55"
);
exports.addressLookupTable.set(
  "stETH",
  "0x5979d7b546e38e414f7e9822514be443a4800529"
);
exports.addressLookupTable.set(
  "BTC",
  "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f"
);
exports.addressLookupTable.set(
  "ETH",
  "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
);
exports.addressLookupTable.set(
  "CRV",
  "0x11cdb42b0eb46d95f990bedd4695a6e3fa034978"
);
exports.addressLookupTable.set(
  "GMX",
  "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a"
);
exports.addressLookupTable.set(
  "gOHM",
  "0x8d9ba570d6cb60C7e3e0f31343efe75ab8e65fb1"
);
exports.addressLookupTable.set(
  "MATIC",
  "0x0000000000000000000000000000000000001010"
);
