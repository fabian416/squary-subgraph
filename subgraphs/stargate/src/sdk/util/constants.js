"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETH_NAME = exports.ETH_SYMBOL = exports.MS_PER_YEAR = exports.DAYS_PER_YEAR = exports.MS_PER_DAY = exports.SECONDS_PER_HOUR_BI = exports.SECONDS_PER_DAY_BI = exports.SECONDS_PER_HOUR = exports.SECONDS_PER_DAY = exports.MAX_UINT = exports.BIGDECIMAL_MINUS_ONE = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.INT_SIXTEEN = exports.INT_NINE = exports.INT_FOUR = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.INT_NEGATIVE_ONE = exports.BIGINT_MAX = exports.BIGINT_MINUS_ONE = exports.BIGINT_TEN_TO_EIGHTEENTH = exports.BIGINT_THOUSAND = exports.BIGINT_HUNDRED = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.DEFAULT_DECIMALS = exports.ETH_ADDRESS = exports.ZERO_ADDRESS = exports.UsageType = exports.InterestRateSide = exports.InterestRateType = exports.RiskType = exports.LendingType = exports.RewardTokenType = exports.LiquidityPoolFeeType = exports.VaultFeeType = exports.ProtocolType = exports.Network = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers, rulesdir/no-checksum-addresses */
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
    // other networks
    Network.UBIQ = "UBIQ";
    Network.SONGBIRD = "SONGBIRD";
    Network.ELASTOS = "ELASTOS";
    Network.KARDIACHAIN = "KARDIACHAIN";
    Network.CRONOS = "CRONOS";
    Network.RSK = "RSK";
    Network.TELOS = "TELOS";
    Network.XDC = "XDC";
    Network.ZYX = "ZYX";
    Network.CSC = "CSC";
    Network.SYSCOIN = "SYSCOIN";
    Network.GOCHAIN = "GOCHAIN";
    Network.ETHEREUMCLASSIC = "ETHEREUMCLASSIC";
    Network.OKEXCHAIN = "OKEXCHAIN";
    Network.HOO = "HOO";
    Network.METER = "METER";
    Network.NOVA_NETWORK = "NOVA_NETWORK";
    Network.TOMOCHAIN = "TOMOCHAIN";
    Network.VELAS = "VELAS";
    Network.THUNDERCORE = "THUNDERCORE";
    Network.HECO = "HECO";
    Network.XDAIARB = "XDAIARB";
    Network.ENERGYWEB = "ENERGYWEB";
    Network.HPB = "HPB";
    Network.BOBA = "BOBA";
    Network.KUCOIN = "KUCOIN";
    Network.SHIDEN = "SHIDEN";
    Network.THETA = "THETA";
    Network.SX = "SX";
    Network.CANDLE = "CANDLE";
    Network.ASTAR = "ASTAR";
    Network.CALLISTO = "CALLISTO";
    Network.WANCHAIN = "WANCHAIN";
    Network.METIS = "METIS";
    Network.ULTRON = "ULTRON";
    Network.STEP = "STEP";
    Network.DOGECHAIN = "DOGECHAIN";
    Network.RONIN = "RONIN";
    Network.KAVA = "KAVA";
    Network.IOTEX = "IOTEX";
    Network.XLC = "XLC";
    Network.NAHMII = "NAHMII";
    Network.TOMBCHAIN = "TOMBCHAIN";
    Network.CANTO = "CANTO";
    Network.KLAYTN = "KLAYTN";
    Network.EVMOS = "EVMOS";
    Network.SMARTBCH = "SMARTBCH";
    Network.BITGERT = "BITGERT";
    Network.FUSION = "FUSION";
    Network.OHO = "OHO";
    Network.ARB_NOVA = "ARB_NOVA";
    Network.OASIS = "OASIS";
    Network.REI = "REI";
    Network.REICHAIN = "REICHAIN";
    Network.GODWOKEN = "GODWOKEN";
    Network.POLIS = "POLIS";
    Network.KEKCHAIN = "KEKCHAIN";
    Network.VISION = "VISION";
    Network.HARMONY = "HARMONY";
    Network.PALM = "PALM";
    Network.CURIO = "CURIO";
    Network.BASE = "BASE";
    Network.UNKNOWN_NETWORK = "UNKNOWN_NETWORK";
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
exports.ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
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
exports.BIGINT_MINUS_ONE = graph_ts_1.BigInt.fromI32(-1);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString("115792089237316195423570985008687907853269984665640564039457584007913129639935");
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.INT_NINE = 9;
exports.INT_SIXTEEN = 16;
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.BIGDECIMAL_MINUS_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_MINUS_ONE);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(graph_ts_1.BigInt.fromI32(255));
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.SECONDS_PER_DAY_BI = graph_ts_1.BigInt.fromI32(exports.SECONDS_PER_DAY);
exports.SECONDS_PER_HOUR_BI = graph_ts_1.BigInt.fromI32(exports.SECONDS_PER_HOUR);
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000));
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(365));
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)));
////////////////
///// Misc /////
////////////////
exports.ETH_SYMBOL = "ETH";
exports.ETH_NAME = "Ether";
