"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOL_INTEREST_RATE_TYPE = exports.PROTOCOL_RISK_TYPE = exports.PROTOCOL_LENDING_TYPE = exports.PROTOCOL_TYPE = exports.PROTOCOL_NETWORK = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = exports.MS_PER_YEAR = exports.DAYS_PER_YEAR = exports.MS_PER_DAY = exports.SECONDS_PER_YEAR = exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR = exports.MAX_UINT = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.INT_HUNDRED = exports.INT_ONE = exports.INT_ZERO = exports.INT_NEGATIVE_ONE = exports.BIGINT_MAX = exports.BIGINT_TEN_TO_EIGHTEENTH = exports.BIGINT_THOUSAND = exports.BIGINT_HUNDRED = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.DEFAULT_DECIMALS = exports.cWBTC_ADDRESS = exports.cUSDC_ADDRESS = exports.cDAI_ADDRESS = exports.cETH_ADDRESS = exports.UNPROVIDED_NAME = exports.ETH_SYMBOL = exports.ETH_NAME = exports.ETH_ADDRESS = exports.ZERO_ADDRESS = exports.PoolState = exports.TransactionType = exports.InterestRateSide = exports.InterestRateType = exports.RiskType = exports.LendingType = exports.RewardTokenType = exports.ProtocolType = exports.Network = void 0;
exports.BASIS_POINTS = exports.RATE_PRECISION_DECIMALS = exports.RATE_PRECISION = exports.PROTOCOL_ID = exports.PROTOCOL_INTEREST_RATE_SIDE = void 0;
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
    Network.AURORA = "AURORA";
    Network.AVALANCHE = "AVALANCHE";
    Network.BOBA = "BOBA";
    Network.BSC = "BSC"; // aka BNB Chain
    Network.CELO = "CELO";
    Network.COSMOS = "COSMOS";
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
    Network.CRONOS = "CRONOS"; // Crypto.com Cronos chain
})(Network = exports.Network || (exports.Network = {}));
var ProtocolType;
(function (ProtocolType) {
    ProtocolType.EXCHANGE = "EXCHANGE";
    ProtocolType.LENDING = "LENDING";
    ProtocolType.YIELD = "YIELD";
    ProtocolType.BRIDGE = "BRIDGE";
    ProtocolType.GENERIC = "GENERIC";
})(ProtocolType = exports.ProtocolType || (exports.ProtocolType = {}));
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
var TransactionType;
(function (TransactionType) {
    TransactionType.BORROW = "BORROW";
    TransactionType.DEPOSIT = "DEPOSIT";
    TransactionType.WITHDRAW = "WITHDRAW";
    TransactionType.REPAY = "REPAY";
    TransactionType.LIQUIDATEE = "LIQUIDATEE";
    TransactionType.LIQUIDATOR = "LIQUIDATOR";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
////////////////////////////
///// Solifidity Enums /////
////////////////////////////
var PoolState;
(function (PoolState) {
    PoolState.Initialized = 0;
    PoolState.Finalized = 1;
    PoolState.Deactivated = 2;
})(PoolState = exports.PoolState || (exports.PoolState = {}));
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ZERO_ADDRESS = graph_ts_1.Address.zero();
exports.ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
exports.ETH_NAME = "Ether";
exports.ETH_SYMBOL = "ETH";
exports.UNPROVIDED_NAME = "NOT_PROVIDED";
exports.cETH_ADDRESS = "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5";
exports.cDAI_ADDRESS = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
exports.cUSDC_ADDRESS = "0x39aa39c021dfbae8fac545936693ac917d5e7563";
// export const cWBTC_ADDRESS = "0xC11b1268C1A384e55C48c2391d8d480264A3A7F4";
exports.cWBTC_ADDRESS = "0xccf4429db6322d5c611ee964527d42e5d685dd6a";
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
exports.INT_HUNDRED = 100;
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(graph_ts_1.BigInt.fromI32(255));
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_HOUR = 60 * 60; // 360
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_YEAR = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(60 * 60 * 24 * 365));
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000));
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(365));
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)));
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
// metadata
exports.PROTOCOL_NAME = "Notional v2";
exports.PROTOCOL_SLUG = "notional-v2";
exports.PROTOCOL_NETWORK = Network.MAINNET;
// lending
exports.PROTOCOL_TYPE = ProtocolType.LENDING;
exports.PROTOCOL_LENDING_TYPE = LendingType.POOLED;
exports.PROTOCOL_RISK_TYPE = RiskType.ISOLATED;
exports.PROTOCOL_INTEREST_RATE_TYPE = InterestRateType.FIXED;
exports.PROTOCOL_INTEREST_RATE_SIDE = InterestRateSide.BORROWER;
// contracts/addresses
exports.PROTOCOL_ID = "0x1344a36a1b56144c3bc62e7757377d288fde0369";
// revenue
// note: not being used, fee amounts left for reference
// export const NOTIONAL_TRADE_FEES = BigDecimal.fromString("0.003");
// export const NOTIONAL_SUPPLY_SIDE_REVENUE_SHARE = BIGDECIMAL_ZERO;
// export const NOTIONAL_PROTOCOL_SIDE_REVENUE_SHARE = BIGDECIMAL_ZERO;
exports.RATE_PRECISION = 1000000000;
exports.RATE_PRECISION_DECIMALS = 9;
exports.BASIS_POINTS = 100000;
