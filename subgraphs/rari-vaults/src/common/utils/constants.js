"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAI_VAULT_MANAGER_ADDRESS = exports.DAI_VAULT_ADDRESS = exports.USDC_VAULT_SYMBOL = exports.USDC_VAULT_NAME = exports.RARI_STABLE_POOL_TOKEN = exports.USDC_VAULT_MANAGER_ADDRESS = exports.USDC_VAULT_ADDRESS = exports.YIELD_VAULT_SYMBOL = exports.YIELD_VAULT_NAME = exports.RARI_YIELD_POOL_TOKEN = exports.YIELD_VAULT_MANAGER_ADDRESS = exports.YIELD_VAULT_ADDRESS = exports.TOKEN_MAPPING = exports.BLOCKS_PER_YEAR = exports.MS_PER_YEAR = exports.DAYS_PER_YEAR = exports.MS_PER_DAY = exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR = exports.MAX_UINT = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.BIGINT_MAX = exports.BIGINT_THOUSAND = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.DEFAULT_DECIMALS = exports.ETH_SYMBOL = exports.ETH_NAME = exports.ETH_ADDRESS = exports.ZERO_ADDRESS = exports.ActivityType = exports.RariPool = exports.TransactionType = exports.InterestRateSide = exports.InterestRateType = exports.RiskType = exports.LendingType = exports.RewardTokenType = exports.LiquidityPoolFeeType = exports.VaultFeeType = exports.ProtocolType = exports.Network = void 0;
exports.PROTOCOL_TYPE = exports.PROTOCOL_NETWORK = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = exports.RARI_DEPLOYER = exports.ETHER_VAULT_SYMBOL = exports.ETHER_VAULT_NAME = exports.RARI_ETHER_POOL_TOKEN = exports.ETHER_VAULT_MANAGER_ADDRESS = exports.ETHER_VAULT_ADDRESS = exports.DAI_VAULT_SYMBOL = exports.DAI_VAULT_NAME = exports.RARI_DAI_POOL_TOKEN = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////////
///// Schema Enums /////
////////////////////////
// The network names corresponding to the Network enum in the schema.
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
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
var RariPool;
(function (RariPool) {
    RariPool.YIELD_POOL = "Yield Pool";
    RariPool.STABLE_POOL = "Stable Pool"; // USDC and DAI
    RariPool.ETHER_POOL = "Ether Pool";
})(RariPool = exports.RariPool || (exports.RariPool = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType.DAILY = "DAILY";
    ActivityType.HOURLY = "HOURLY";
})(ActivityType = exports.ActivityType || (exports.ActivityType = {}));
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
exports.ETH_NAME = "Ether";
exports.ETH_SYMBOL = "ETH";
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
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString("115792089237316195423570985008687907853269984665640564039457584007913129639935");
exports.INT_ZERO = exports.BIGINT_ZERO.toI32();
exports.INT_ONE = exports.BIGINT_ONE.toI32();
exports.INT_TWO = exports.BIGINT_TWO.toI32();
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(graph_ts_1.BigInt.fromI32(255));
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000));
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(365));
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)));
exports.BLOCKS_PER_YEAR = graph_ts_1.BigDecimal.fromString("2102400");
///////////////////////////
//// Rari Input Tokens ////
///////////////////////////
// Note: Deposit/Withdrawal events store the asset as an indexed string
// This means the asset symbol is hashed using keccak256 and the result is stored in the transaction logs
// Learn more here: https://medium.com/mycrypto/understanding-event-logs-on-the-ethereum-blockchain-f4ae7ba50378
exports.TOKEN_MAPPING = new Map();
exports.TOKEN_MAPPING.set("0xa5e92f3efb6826155f1f728e162af9d7cda33a574a1153b58f03ea01cc37e568", "0x6B175474E89094C44Da98b954EedeAC495271d0F"); // DAI
exports.TOKEN_MAPPING.set("0xd6aca1be9729c13d677335161321649cccae6a591554772516700f986f942eaa", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"); // USDC
exports.TOKEN_MAPPING.set("0x8b1a1d9c2b109e527c9134b25b1a1833b16b6594f92daa9f6d9b7a6024bce9d0", "0xdAC17F958D2ee523a2206206994597C13D831ec7"); // USDT
exports.TOKEN_MAPPING.set("0xa1b8d8f7e538bb573797c963eeeed40d0bcb9f28c56104417d0da1b372ae3051", "0x0000000000085d4780B73119b644AE5ecd22b376"); // TUSD
exports.TOKEN_MAPPING.set("0x54c512ac779647672b8d02e2fe2dc10f79bbf19f719d887221696215fd24e9f1", "0x4Fabb145d64652a948d72533023f6E7A623C7C53"); //BUSD
exports.TOKEN_MAPPING.set("0x87ef9bf44f9ed3d4aeadafb38d9bc9470e7aac44fdcb9f7ffb957b862954cf2c", "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51"); // sUSD
exports.TOKEN_MAPPING.set("0x33d80a03b5585b94e68b56bdea4f57fd2e459401902cb2f61772e1b630afb4b2", "0xe2f2a5C287993345a840Db3B0845fbC70f5935a5"); // mUSD
//////////////////////////////////
//// Rari Yield Pool Specific ////
//////////////////////////////////
exports.YIELD_VAULT_ADDRESS = "0x9245efB59f6491Ed1652c2DD8a4880cBFADc3ffA"; // RariPoolController.sol
exports.YIELD_VAULT_MANAGER_ADDRESS = "0x59FA438cD0731EBF5F4cDCaf72D4960EFd13FCe6"; // RariPoolManager.sol
exports.RARI_YIELD_POOL_TOKEN = "0x3baa6B7Af0D72006d3ea770ca29100Eb848559ae";
exports.YIELD_VAULT_NAME = "Rari Yield Pool";
exports.YIELD_VAULT_SYMBOL = "RYPT"; // RYPT = rari yield pool token ie, R(X)PT
/////////////////////////////////
//// Rari USDC Pool Specific ////
/////////////////////////////////
exports.USDC_VAULT_ADDRESS = "0x66f4856f1bbd1eb09e1c8d9d646f5a3a193da569"; // RariPoolController.sol
exports.USDC_VAULT_MANAGER_ADDRESS = "0xC6BF8C8A55f77686720E0a88e2Fd1fEEF58ddf4a"; // RariPoolManager.sol
exports.RARI_STABLE_POOL_TOKEN = "0x016bf078ABcaCB987f0589a6d3BEAdD4316922B0";
exports.USDC_VAULT_NAME = "Rari USDC Pool";
exports.USDC_VAULT_SYMBOL = "RSPT"; // RSPT = rari stable pool token
////////////////////////////////
//// Rari DAI Pool Specific ////
////////////////////////////////
exports.DAI_VAULT_ADDRESS = "0xaFD2AaDE64E6Ea690173F6DE59Fc09F5C9190d74"; // RariPoolController.sol
exports.DAI_VAULT_MANAGER_ADDRESS = "0xB465BAF04C087Ce3ed1C266F96CA43f4847D9635"; // RariPoolManager.sol
exports.RARI_DAI_POOL_TOKEN = "0x0833cfcb11A5ba89FbAF73a407831c98aD2D7648";
exports.DAI_VAULT_NAME = "Rari DAI Pool";
exports.DAI_VAULT_SYMBOL = "RDPT"; // RDPT = rari dai pool token
//////////////////////////////////
//// Rari Ether Pool Specific ////
//////////////////////////////////
exports.ETHER_VAULT_ADDRESS = "0x3F4931A8E9D4cdf8F56e7E8A8Cfe3BeDE0E43657"; // RariPoolController.sol
exports.ETHER_VAULT_MANAGER_ADDRESS = "0xD6e194aF3d9674b62D1b30Ec676030C23961275e"; // RariPoolManager.sol
exports.RARI_ETHER_POOL_TOKEN = "0xCda4770d65B4211364Cb870aD6bE19E7Ef1D65f4";
exports.ETHER_VAULT_NAME = "Rari Ether Pool";
exports.ETHER_VAULT_SYMBOL = "REPT"; // REPT = rariether pool token
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.RARI_DEPLOYER = "0xb8f02248d53f7edfa38e79263e743e9390f81942"; // using as "protocol address" b/c no factory contract
exports.PROTOCOL_NAME = "Rari Vaults";
exports.PROTOCOL_SLUG = "rari-vaults";
exports.PROTOCOL_NETWORK = Network.MAINNET;
exports.PROTOCOL_TYPE = ProtocolType.YIELD;
