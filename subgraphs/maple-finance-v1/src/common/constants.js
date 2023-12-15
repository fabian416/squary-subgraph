"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOL_INTEREST_RATE_SIDE = exports.PROTOCOL_INTEREST_RATE_TYPE = exports.PROTOCOL_GLOBAL_PARAMS_TREASURY_FEE_KEY = exports.PROTOCOL_RISK_TYPE = exports.PROTOCOL_LENDING_TYPE = exports.PROTOCOL_TYPE = exports.PROTOCOL_NETWORK = exports.PROTOCOL_INITIAL_TREASURY_FEE = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = exports.POOL_WAD_DECIMALS = exports.ETH_DECIMALS = exports.SEC_PER_DAY = exports.SEC_PER_HOUR = exports.MPL_REWARDS_DEFAULT_DURATION_TIME_S = exports.ONE_I32 = exports.ZERO_I32 = exports.TEN_BD = exports.ONE_BI = exports.ONE_BD = exports.ZERO_BI = exports.ZERO_BD = exports.LOAN_V2_IMPLEMENTATION_ADDRESS = exports.MAPLE_POOL_LIB_ADDRESS = exports.MAPLE_GLOBALS_ORACLE_QUOTE_DECIMALS = exports.YEARN_ORACLE_QUOTE_DECIMALS = exports.YEARN_ORACLE_ADDRESS = exports.CHAIN_LINK_ORACLE_QUOTE_DECIMALS = exports.CHAIN_LINK_USD_ADDRESS = exports.CHAIN_LINK_ORACLE_ADDRESS = exports.PROTOCOL_ID = exports.MAPLE_GLOBALS_ADDRESS = exports.UNPROVIDED_NAME = exports.ETH_SYMBOL = exports.ETH_NAME = exports.ETH_ADDRESS = exports.ZERO_ADDRESS = exports.PoolState = exports.LoanVersion = exports.OracleType = exports.StakeType = exports.TransactionType = exports.InterestRateSide = exports.InterestRateType = exports.RiskType = exports.LendingType = exports.RewardTokenType = exports.ProtocolType = exports.Network = void 0;
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
    TransactionType.DEPOSIT = "DEPOSIT";
    TransactionType.WITHDRAW = "WITHDRAW";
    TransactionType.CLAIM = "CLAIM";
    TransactionType.BORROW = "BORROW";
    TransactionType.REPAY = "REPAY";
    TransactionType.LIQUIDATE = "LIQUIDATE";
    TransactionType.STAKE = "STAKE";
    TransactionType.UNSTAKE = "UNSTAKE";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
var StakeType;
(function (StakeType) {
    StakeType.STAKE_LOCKER = "STAKE_LOCKER";
    StakeType.MPL_LP_REWARDS = "MPL_LP_REWARDS";
    StakeType.MPL_STAKE_REWARDS = "MPL_STAKE_REWARDS";
})(StakeType = exports.StakeType || (exports.StakeType = {}));
var OracleType;
(function (OracleType) {
    OracleType.NONE = "NONE";
    OracleType.MAPLE = "MAPLE";
    OracleType.CHAIN_LINK = "CHAIN_LINK";
    OracleType.YEARN_LENS = "YEARN_LENS";
    OracleType.CURVE_CALC = "CURVE_CALC";
    OracleType.SUSHISWAP_CALC = "SUSHISWAP_CALC";
    OracleType.CURVE_ROUTE = "CURVE_ROUTE";
    OracleType.UNISWAP_ROUTE = "UNISWAP_ROUTE";
    OracleType.SUSHISWAP_ROUTE = "SUSHISWAP_ROUTE";
    OracleType.ERROR_NOT_FOUND = "ERROR_NOT_FOUND";
})(OracleType = exports.OracleType || (exports.OracleType = {}));
var LoanVersion;
(function (LoanVersion) {
    LoanVersion.V1 = "V1";
    LoanVersion.V2 = "V2";
    LoanVersion.V3 = "V3";
})(LoanVersion = exports.LoanVersion || (exports.LoanVersion = {}));
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
exports.ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
exports.ETH_NAME = "Ether";
exports.ETH_SYMBOL = "ETH";
exports.UNPROVIDED_NAME = "NOT_PROVIDED";
exports.MAPLE_GLOBALS_ADDRESS = graph_ts_1.Address.fromString("0xC234c62c8C09687DFf0d9047e40042cd166F3600");
exports.PROTOCOL_ID = exports.MAPLE_GLOBALS_ADDRESS.toHexString();
// Oracle addresses
exports.CHAIN_LINK_ORACLE_ADDRESS = graph_ts_1.Address.fromString("0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf");
exports.CHAIN_LINK_USD_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000348");
exports.CHAIN_LINK_ORACLE_QUOTE_DECIMALS = 8;
exports.YEARN_ORACLE_ADDRESS = graph_ts_1.Address.fromString("0x83d95e0D5f402511dB06817Aff3f9eA88224B030");
exports.YEARN_ORACLE_QUOTE_DECIMALS = 6;
exports.MAPLE_GLOBALS_ORACLE_QUOTE_DECIMALS = graph_ts_1.BigInt.fromString("8");
exports.MAPLE_POOL_LIB_ADDRESS = graph_ts_1.Address.fromString("0x2c1C30fb8cC313Ef3cfd2E2bBf2da88AdD902C30");
exports.LOAN_V2_IMPLEMENTATION_ADDRESS = graph_ts_1.Address.fromString("0x97940C7aea99998da4c56922211ce012E7765395");
////////////////////////
///// Type Helpers /////
////////////////////////
exports.ZERO_BD = graph_ts_1.BigDecimal.zero();
exports.ZERO_BI = graph_ts_1.BigInt.zero();
exports.ONE_BD = graph_ts_1.BigDecimal.fromString("1");
exports.ONE_BI = graph_ts_1.BigInt.fromString("1");
exports.TEN_BD = graph_ts_1.BigDecimal.fromString("10");
exports.ZERO_I32 = 0;
exports.ONE_I32 = 1;
exports.MPL_REWARDS_DEFAULT_DURATION_TIME_S = graph_ts_1.BigInt.fromString("604800"); // 7 days
exports.SEC_PER_HOUR = graph_ts_1.BigInt.fromString("3600");
exports.SEC_PER_DAY = graph_ts_1.BigInt.fromString("86400");
exports.ETH_DECIMALS = 18;
exports.POOL_WAD_DECIMALS = 18;
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.PROTOCOL_NAME = "Maple v1";
exports.PROTOCOL_SLUG = "maple-v1";
exports.PROTOCOL_INITIAL_TREASURY_FEE = graph_ts_1.BigDecimal.fromString("0.005");
exports.PROTOCOL_NETWORK = Network.MAINNET;
exports.PROTOCOL_TYPE = ProtocolType.LENDING;
exports.PROTOCOL_LENDING_TYPE = LendingType.POOLED;
exports.PROTOCOL_RISK_TYPE = RiskType.ISOLATED;
exports.PROTOCOL_GLOBAL_PARAMS_TREASURY_FEE_KEY = "TREASURY_FEE";
exports.PROTOCOL_INTEREST_RATE_TYPE = InterestRateType.FIXED;
exports.PROTOCOL_INTEREST_RATE_SIDE = InterestRateSide.BORROWER;
