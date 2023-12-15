"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exponentToBigInt =
  exports.exponentToBigDecimal =
  exports.INT_EIGHTEEN =
  exports.INT_TEN =
  exports.INT_SIX =
  exports.hundredBD =
  exports.oneBD =
  exports.zeroBI =
  exports.zeroBD =
  exports.secondsPerHour =
  exports.secondsPerDay =
  exports.UsdtDecimals =
  exports.UsdcDecimals =
  exports.DaiDecimals =
  exports.UsdtAddr =
  exports.UsdcAddr =
  exports.DaiAddr =
  exports.BnBntAddr =
  exports.BntAddr =
  exports.EthAddr =
  exports.BancorNetworkInfoAddr =
  exports.BancorNetworkAddr =
  exports.UsageType =
  exports.InterestRateSide =
  exports.InterestRateType =
  exports.RewardTokenType =
  exports.LiquidityPoolFeeType =
  exports.ProtocolType =
  exports.Network =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
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
})((Network = exports.Network || (exports.Network = {})));
var ProtocolType;
(function (ProtocolType) {
  ProtocolType.EXCHANGE = "EXCHANGE";
  ProtocolType.LENDING = "LENDING";
  ProtocolType.YIELD = "YIELD";
  ProtocolType.BRIDGE = "BRIDGE";
  ProtocolType.GENERIC = "GENERIC";
})((ProtocolType = exports.ProtocolType || (exports.ProtocolType = {})));
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
var InterestRateType;
(function (InterestRateType) {
  InterestRateType.STABLE = "STABLE";
  InterestRateType.VARIABLE = "VARIABLE";
  InterestRateType.FIXED_TERM = "FIXED_TERM";
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
var UsageType;
(function (UsageType) {
  UsageType.DEPOSIT = "DEPOSIT";
  UsageType.WITHDRAW = "WITHDRAW";
  UsageType.SWAP = "SWAP";
})((UsageType = exports.UsageType || (exports.UsageType = {})));
// eslint-disable-next-line rulesdir/no-checksum-addresses
exports.BancorNetworkAddr = "0xeEF417e1D5CC832e619ae18D2F140De2999dD4fB";
exports.BancorNetworkInfoAddr = "0x8e303d296851b320e6a697bacb979d13c9d6e760";
exports.EthAddr = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
exports.BntAddr = "0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c";
exports.BnBntAddr = "0xab05cf7c6c3a288cd36326e4f7b8600e7268e344";
exports.DaiAddr = "0x6b175474e89094c44da98b954eedeac495271d0f";
exports.UsdcAddr = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
exports.UsdtAddr = "0xdac17f958d2ee523a2206206994597c13d831ec7";
exports.DaiDecimals = "18";
exports.UsdcDecimals = "6";
exports.UsdtDecimals = "6";
exports.secondsPerDay = 24 * 60 * 60;
exports.secondsPerHour = 60 * 60;
exports.zeroBD = graph_ts_1.BigDecimal.zero();
exports.zeroBI = graph_ts_1.BigInt.zero();
exports.oneBD = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(1));
exports.hundredBD = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(100));
exports.INT_SIX = 6;
exports.INT_TEN = 10;
exports.INT_EIGHTEEN = 18;
function exponentToBigDecimal(n) {
  return exponentToBigInt(n).toBigDecimal();
}
exports.exponentToBigDecimal = exponentToBigDecimal;
function exponentToBigInt(n) {
  return graph_ts_1.BigInt.fromI32(10).pow(n);
}
exports.exponentToBigInt = exponentToBigInt;
