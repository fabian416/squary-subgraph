"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMISSION_START_BLOCK = exports.DOLA_ADDRESS = exports.XINV_ADDRESS = exports.INV_ADDRESS = exports.FACTORY_ADDRESS = exports.MANTISSA_DECIMALS = exports.BLOCKS_PER_YEAR = exports.BLOCKS_PER_DAY = exports.MS_PER_YEAR = exports.MS_PER_DAY = exports.SECONDS_PER_HOUR = exports.SECONDS_PER_DAY = exports.DAYS_PER_YEAR = exports.MAX_UINT = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.BIGINT_MAX = exports.BIGINT_THOUSAND = exports.BIGINT_HUNDRED = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.DEFAULT_DECIMALS = exports.ZERO_ADDRESS = exports.InterestRateSide = exports.InterestRateType = exports.RiskType = exports.LendingType = exports.HelperStoreType = exports.RewardTokenType = exports.LiquidityPoolFeeType = exports.ProtocolType = exports.Network = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////////
///// Schema Enums /////
////////////////////////
var Network;
(function (Network) {
    Network.ARBITRUM_ONE = "ARBITRUM_ONE";
    Network.AVALANCHE = "AVALANCHE";
    Network.AURORA = "AURORA";
    Network.BSC = "BSC";
    Network.CELO = "CELO";
    Network.ETHEREUM = "MAINNET";
    Network.FANTOM = "FANTOM";
    Network.FUSE = "FUSE";
    Network.MOONBEAM = "MOONBEAM";
    Network.MOONRIVER = "MOONRIVER";
    Network.NEAR_MAINNET = "NEAR_MAINNET";
    Network.OPTIMISM = "OPTIMISM";
    Network.POLYGON = "MATIC";
    Network.XDAI = "XDAI";
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
    LiquidityPoolFeeType.FIXED_PROTOCOL_FEE = "FIXED_PROTOCOL_FEE";
    LiquidityPoolFeeType.DYNAMIC_PROTOCOL_FEE = "DYNAMIC_PROTOCOL_FEE";
})(LiquidityPoolFeeType = exports.LiquidityPoolFeeType || (exports.LiquidityPoolFeeType = {}));
var RewardTokenType;
(function (RewardTokenType) {
    RewardTokenType.DEPOSIT = "DEPOSIT";
    RewardTokenType.BORROW = "BORROW";
})(RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}));
var HelperStoreType;
(function (HelperStoreType) {
    HelperStoreType.TOTALVOLUME = "totalVolume";
})(HelperStoreType = exports.HelperStoreType || (exports.HelperStoreType = {}));
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
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.DEFAULT_DECIMALS = 18;
exports.USDC_DECIMALS = 6;
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString("115792089237316195423570985008687907853269984665640564039457584007913129639935");
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(graph_ts_1.BigInt.fromI32(255));
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(365));
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.SECONDS_PER_HOUR = 60 * 60;
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000));
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)));
exports.BLOCKS_PER_DAY = graph_ts_1.BigDecimal.fromString("6570"); // blocks every 13.15 seconds
exports.BLOCKS_PER_YEAR = exports.BLOCKS_PER_DAY.times(exports.DAYS_PER_YEAR);
exports.MANTISSA_DECIMALS = 18;
//////////////
exports.FACTORY_ADDRESS = "0x4dcf7407ae5c07f8681e1659f626e114a7667339";
// INV contract address
exports.INV_ADDRESS = "0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68";
// xINV contract address
exports.XINV_ADDRESS = "0x65b35d6eb7006e0e607bc54eb2dfd459923476fe";
exports.DOLA_ADDRESS = "0x865377367054516e17014ccded1e7d814edc9ce4";
//Creation of the factory contract
exports.EMISSION_START_BLOCK = graph_ts_1.BigInt.fromString("11915867");
