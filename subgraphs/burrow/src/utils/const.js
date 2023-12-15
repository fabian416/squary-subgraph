"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BIGDECIMAL_ZERO =
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
  exports.USDC_DENOMINATOR =
  exports.USDC_DECIMALS =
  exports.DEFAULT_DECIMALS =
  exports.IntervalType =
  exports.UsageType =
  exports.PositionSide =
  exports.InterestRateSide =
  exports.InterestRateType =
  exports.RiskType =
  exports.LendingType =
  exports.RewardTokenType =
  exports.LiquidityPoolFeeType =
  exports.VaultFeeType =
  exports.ProtocolType =
  exports.AccountTime =
  exports.Network =
  exports.PROTOCOL_SLUG =
  exports.PROTOCOL_NAME =
  exports.NANOS_TO_HOUR =
  exports.NANOS_TO_DAY =
  exports.NANOS_TO_MS =
  exports.NANOSEC_TO_SEC =
  exports.BIGDECIMAL_100 =
  exports.BIGDECIMAL_SIX =
  exports.BIGDECIMAL_TWELVE =
  exports.BIGDECIMAL_THREE =
  exports.BIGDECIMAL_TWO =
  exports.BIGDECIMAL_ONE =
  exports.BI =
  exports.BD =
  exports.BD_BI =
  exports.BI_BD =
  exports.ADDRESS_ZERO =
  exports.BD_ONE =
  exports.BD_ZERO =
  exports.BI_ONE =
  exports.BI_ZERO =
    void 0;
exports.assets = exports.MAX_UINT = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.BI_ZERO = graph_ts_1.BigInt.fromString("0");
exports.BI_ONE = graph_ts_1.BigInt.fromString("1");
exports.BD_ZERO = graph_ts_1.BigDecimal.fromString("0");
exports.BD_ONE = graph_ts_1.BigDecimal.fromString("1");
exports.ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
const BI_BD = (n) => graph_ts_1.BigDecimal.fromString(n.toString());
exports.BI_BD = BI_BD;
const BD_BI = (n) => graph_ts_1.BigInt.fromString(n.truncate(0).toString());
exports.BD_BI = BD_BI;
const BD = (n) => graph_ts_1.BigDecimal.fromString(n);
exports.BD = BD;
const BI = (n) => graph_ts_1.BigInt.fromString(n);
exports.BI = BI;
exports.BIGDECIMAL_ONE = (0, exports.BD)("1");
exports.BIGDECIMAL_TWO = (0, exports.BD)("2");
exports.BIGDECIMAL_THREE = (0, exports.BD)("3");
exports.BIGDECIMAL_TWELVE = (0, exports.BD)("12");
exports.BIGDECIMAL_SIX = (0, exports.BD)("6");
exports.BIGDECIMAL_100 = (0, exports.BD)("100");
const NANOSEC_TO_SEC = (time) => time / 1000000000;
exports.NANOSEC_TO_SEC = NANOSEC_TO_SEC;
const NANOS_TO_MS = (time) => time / 1000000;
exports.NANOS_TO_MS = NANOS_TO_MS;
const NANOS_TO_DAY = (time) => time / (1000000000 * 86400);
exports.NANOS_TO_DAY = NANOS_TO_DAY;
const NANOS_TO_HOUR = (time) => time / (1000000000 * 3600);
exports.NANOS_TO_HOUR = NANOS_TO_HOUR;
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_NAME = "Burrow";
exports.PROTOCOL_SLUG = "burrow-near";
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
  Network.AURORA = "AURORA";
  Network.AVALANCHE = "AVALANCHE";
  Network.BOBA = "BOBA";
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
var AccountTime;
(function (AccountTime) {
  AccountTime.HOURLY = "HOURLY";
  AccountTime.DAILY = "DAILY";
})((AccountTime = exports.AccountTime || (exports.AccountTime = {})));
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
  LiquidityPoolFeeType.FIXED_LP_FEE = "FIXED_LP_FEE";
  LiquidityPoolFeeType.DYNAMIC_LP_FEE = "DYNAMIC_LP_FEE";
  LiquidityPoolFeeType.FIXED_PROTOCOL_FEE = "FIXED_PROTOCOL_FEE";
  LiquidityPoolFeeType.DYNAMIC_PROTOCOL_FEE = "DYNAMIC_PROTOCOL_FEE";
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
var PositionSide;
(function (PositionSide) {
  PositionSide.LENDER = "LENDER";
  PositionSide.BORROWER = "BORROWER";
})((PositionSide = exports.PositionSide || (exports.PositionSide = {})));
var UsageType;
(function (UsageType) {
  UsageType.DEPOSIT = "DEPOSIT";
  UsageType.WITHDRAW = "WITHDRAW";
  UsageType.SWAP = "SWAP";
})((UsageType = exports.UsageType || (exports.UsageType = {})));
var IntervalType;
(function (IntervalType) {
  IntervalType.DAILY = "DAILY";
  IntervalType.HOURLY = "HOURLY";
})((IntervalType = exports.IntervalType || (exports.IntervalType = {})));
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
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(
  graph_ts_1.BigInt.fromI32(255)
);
exports.assets = new graph_ts_1.TypedMap();
class TokenMetadata {
  constructor(name, symbol, decimals, extraDecimals) {
    this.name = name;
    this.symbol = symbol;
    this.decimals = decimals;
    this.extraDecimals = extraDecimals;
  }
}
exports.assets.set(
  "meta-pool.near",
  new TokenMetadata("Staked NEAR", "stNEAR", 24, 0)
);
exports.assets.set("usn", new TokenMetadata("USN Stablecoin", "USN", 18, 0));
exports.assets.set(
  "token.burrow.near",
  new TokenMetadata("Burrow", "BRRR", 18, 0)
);
exports.assets.set(
  "wrap.near",
  new TokenMetadata("Wrapped Near", "wNEAR", 24, 0)
);
exports.assets.set(
  "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
  new TokenMetadata("Tether USD", "USDT", 6, 12)
);
exports.assets.set(
  "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
  new TokenMetadata("USD Coin", "USDC", 6, 12)
);
exports.assets.set(
  "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near",
  new TokenMetadata("DAI Stablecoin", "DAI", 18, 0)
);
exports.assets.set(
  "2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near",
  new TokenMetadata("Wrapped BTC", "wBTC", 8, 10)
);
exports.assets.set("aurora", new TokenMetadata("Ethereum", "ETH", 18, 0));
exports.assets.set(
  "linear-protocol.near",
  new TokenMetadata("LiNEAR", "liNEAR", 24, 0)
);
exports.assets.set(
  "4691937a7508860f876c9c0a2a617e7d9e945d4b.factory.bridge.near",
  new TokenMetadata("Wootrade Network", "WOO", 18, 0)
);
exports.assets.set(
  "aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near",
  new TokenMetadata("Aurora", "AURORA", 18, 0)
);
exports.assets.set(
  "meta-token.near",
  new TokenMetadata("Meta Token", "META", 18, 0)
);
// v2-nearx.stader-labs.near
exports.assets.set(
  "v2-nearx.stader-labs.near",
  new TokenMetadata("Stader NearX", "NEARX", 18, 0)
);
// wrapped near
exports.assets.set(
  "c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.factory.bridge.near",
  new TokenMetadata("Wrapped Ether", "WETH", 18, 0)
);
// chainlink
exports.assets.set(
  "514910771af9ca656af840dff83e8264ecf986ca.factory.bridge.near",
  new TokenMetadata("Chainlink", "LINK", 18, 0)
);
// ref
exports.assets.set(
  "token.v2.ref-finance.near",
  new TokenMetadata("Ref Finance", "REF", 18, 0)
);
// skyward
exports.assets.set(
  "token.skyward.near",
  new TokenMetadata("Skyward Finance", "SKYWARD", 18, 0)
);
// octopus
exports.assets.set(
  "f5cfbc74057c610c8ef151a439252680ac68c6dc.factory.bridge.near",
  new TokenMetadata("Octopus", "OCT", 18, 0)
);
