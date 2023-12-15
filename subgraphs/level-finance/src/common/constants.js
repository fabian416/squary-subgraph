"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEVEL_TOKEN_ADDRESS = exports.SENIOR_LLP_ADDRESS = exports.OUTPUT_TOKEN_ADDRESS = exports.VAULT_ADDRESS = exports.POOL_SYMBOL = exports.POOL_NAME = exports.PROTOCOL_ID = exports.ETH_NAME = exports.ETH_SYMBOL = exports.MS_PER_YEAR = exports.DAYS_PER_YEAR = exports.MS_PER_DAY = exports.SECONDS_PER_HOUR = exports.SECONDS_PER_DAY = exports.MAX_UINT = exports.BIGDECIMAL_THOUSAND = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.INT_FOUR = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.INT_NEGATIVE_ONE = exports.BIGINT_MAX = exports.BIGINT_TEN_TO_EIGHTEENTH = exports.BIGINT_THOUSAND = exports.BIGINT_HUNDRED = exports.BIGINT_TEN = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.BIGINT_NEGONE = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.DEFAULT_DECIMALS = exports.NULL = exports.PositionSide = exports.InterestRateSide = exports.InterestRateType = exports.RiskType = exports.LendingType = exports.RewardTokenType = exports.LiquidityPoolFeeType = exports.VaultFeeType = exports.ProtocolType = exports.Network = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = void 0;
exports.IS_COLLATERAL_IN_USD = exports.STARTING_INFLATION_RATE = exports.INFLATION_INTERVAL = exports.MasterChef = exports.Side = exports.FUNDING_RATE_PRECISION = exports.PRICE_FEED_PRECISION = exports.DEFAULT_DECIMALS_PRECISION = exports.VALUE_PRECISION = exports.FEE_PRECISION = exports.PRICE_FEED_DECIMALS = exports.INTEREST_RATE_DECIMALS = exports.VALUE_DECIMALS = exports.SUPPLY_SIDE_REVENUE_PERCENT = exports.STAKE_SIDE_REVENUE_PERCENT = exports.PROTOCOL_SIDE_REVENUE_PERCENT = exports.PRICE_CACHING_BLOCKS = exports.PRICE_PRECISION_DECIMALS = exports.PRICE_PRECISION = exports.LEVEL_STAKE_ADDRESS = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_NAME = "Level Finance";
exports.PROTOCOL_SLUG = "LVL";
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
    ProtocolType.OPTION = "OPTION";
    ProtocolType.PERPETUAL = "PERPETUAL";
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
    LiquidityPoolFeeType.FIXED_STAKE_FEE = "FIXED_STAKE_FEE";
    LiquidityPoolFeeType.DYNAMIC_STAKE_FEE = "DYNAMIC_STAKE_FEE";
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
    InterestRateType.FIXED = "FIXED";
})(InterestRateType = exports.InterestRateType || (exports.InterestRateType = {}));
var InterestRateSide;
(function (InterestRateSide) {
    InterestRateSide.LENDER = "LENDER";
    InterestRateSide.BORROWER = "BORROWER";
})(InterestRateSide = exports.InterestRateSide || (exports.InterestRateSide = {}));
var PositionSide;
(function (PositionSide) {
    PositionSide.LONG = "LONG";
    PositionSide.SHORT = "SHORT";
})(PositionSide = exports.PositionSide || (exports.PositionSide = {}));
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
var NULL;
(function (NULL) {
    NULL.TYPE_STRING = "0x0000000000000000000000000000000000000000";
    NULL.TYPE_ADDRESS = graph_ts_1.Address.fromString(NULL.TYPE_STRING);
})(NULL = exports.NULL || (exports.NULL = {}));
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
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
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
exports.BIGDECIMAL_THOUSAND = new graph_ts_1.BigDecimal(exports.BIGINT_THOUSAND);
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
exports.PROTOCOL_ID = "0xa5abfb56a78d2bd4689b25b8a77fd49bb0675874";
exports.POOL_NAME = "LevelVault";
exports.POOL_SYMBOL = "Vault";
exports.VAULT_ADDRESS = graph_ts_1.Address.fromString("0xa5abfb56a78d2bd4689b25b8a77fd49bb0675874");
exports.OUTPUT_TOKEN_ADDRESS = graph_ts_1.Address.fromString("0xb5c42f84ab3f786bca9761240546aa9cec1f8821");
exports.SENIOR_LLP_ADDRESS = graph_ts_1.Address.fromString("0xb5c42f84ab3f786bca9761240546aa9cec1f8821");
exports.LEVEL_TOKEN_ADDRESS = graph_ts_1.Address.fromString("0xb64e280e9d1b5dbec4accedb2257a87b400db149");
exports.LEVEL_STAKE_ADDRESS = graph_ts_1.Address.fromString("0x08a12ffedf49fa5f149c73b07e31f99249e40869");
exports.PRICE_PRECISION = graph_ts_1.BigInt.fromI32(10).pow(30);
exports.PRICE_PRECISION_DECIMALS = 12;
exports.PRICE_CACHING_BLOCKS = graph_ts_1.BigInt.fromI32(7000);
exports.PROTOCOL_SIDE_REVENUE_PERCENT = graph_ts_1.BigDecimal.fromString("0.35");
exports.STAKE_SIDE_REVENUE_PERCENT = graph_ts_1.BigDecimal.fromString("0.2");
exports.SUPPLY_SIDE_REVENUE_PERCENT = graph_ts_1.BigDecimal.fromString("0.45");
exports.VALUE_DECIMALS = 30;
exports.INTEREST_RATE_DECIMALS = 10;
exports.PRICE_FEED_DECIMALS = 12;
exports.FEE_PRECISION = graph_ts_1.BigInt.fromI32(10).pow(10);
exports.VALUE_PRECISION = graph_ts_1.BigInt.fromI32(10).pow(exports.VALUE_DECIMALS);
exports.DEFAULT_DECIMALS_PRECISION = graph_ts_1.BigInt.fromI32(10).pow(exports.DEFAULT_DECIMALS);
exports.PRICE_FEED_PRECISION = graph_ts_1.BigInt.fromI32(10).pow(exports.PRICE_FEED_DECIMALS);
exports.FUNDING_RATE_PRECISION = graph_ts_1.BigDecimal.fromString("0.00001");
var Side;
(function (Side) {
    Side[Side["LONG"] = 0] = "LONG";
    Side[Side["SHORT"] = 1] = "SHORT";
})(Side = exports.Side || (exports.Side = {}));
var MasterChef;
(function (MasterChef) {
    MasterChef.MINICHEF = "MINICHEF";
    MasterChef.MASTERCHEF = "MASTERCHEF";
    MasterChef.MASTERCHEFV2 = "MASTERCHEFV2";
    MasterChef.MASTERCHEFV3 = "MASTERCHEFV3";
})(MasterChef = exports.MasterChef || (exports.MasterChef = {}));
exports.INFLATION_INTERVAL = "TIMESTAMP";
exports.STARTING_INFLATION_RATE = exports.BIGINT_ZERO;
exports.IS_COLLATERAL_IN_USD = false;
