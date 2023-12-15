"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POOL_TOKENS_ADDRESS = exports.STAKING_REWARDS_ADDRESS = exports.MEMBERSHIP_VAULT_ADDRESS = exports.WETH_ADDRESS = exports.GFI_ADDRESS = exports.FIDU_ADDRESS = exports.USDC_ADDRESS = exports.SENIOR_POOL_ADDRESS = exports.FACTORY_ADDRESS = exports.CONFIG_KEYS_ADDRESSES = exports.CONFIG_KEYS_NUMBERS = exports.USDC_DECIMALS = exports.GFI_DECIMALS = exports.FIDU_DECIMALS = exports.BACKER_REWARDS_EPOCH = exports.V2_2_MIGRATION_TIME = exports.ARBITRUM_BLOCKS_PER_YEAR = exports.MATIC_BLOCKS_PER_YEAR = exports.BSC_BLOCKS_PER_YEAR = exports.FANTOM_BLOCKS_PER_YEAR = exports.AVALANCHE_BLOCKS_PER_YEAR = exports.ETHEREUM_BLOCKS_PER_YEAR = exports.DAYS_PER_EPOCH = exports.SECONDS_PER_HOUR = exports.SECONDS_PER_DAY = exports.SECONDS_PER_YEAR = exports.DAYS_PER_YEAR = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.BIGINT_TEN_TO_EIGHTEENTH = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.INT_FOUR = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.INT_NEGATIVE_ONE = exports.PositionSide = exports.ActivityType = exports.TransactionType = exports.InterestRateSide = exports.InterestRateType = exports.RewardTokenType = exports.RiskType = exports.LendingType = exports.ProtocolType = exports.Network = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = void 0;
exports.INVALID_POOLS = exports.USDC_WETH_UniswapV2_Pair = exports.WETH_GFI_UniswapV2_Pair = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_NAME = "Goldfinch";
exports.PROTOCOL_SLUG = "goldfinch";
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
var RewardTokenType;
(function (RewardTokenType) {
    RewardTokenType.DEPOSIT = "DEPOSIT";
    RewardTokenType.BORROW = "BORROW";
})(RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}));
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
    TransactionType.BORROW = "BORROW";
    TransactionType.LIQUIDATE = "LIQUIDATE";
    TransactionType.REPAY = "REPAY";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType.DAILY = "DAILY";
    ActivityType.HOURLY = "HOURLY";
})(ActivityType = exports.ActivityType || (exports.ActivityType = {}));
var PositionSide;
(function (PositionSide) {
    PositionSide.LENDER = "LENDER";
    PositionSide.BORROWER = "BORROWER";
})(PositionSide = exports.PositionSide || (exports.PositionSide = {}));
////////////////////////
///// Type Helpers /////
////////////////////////
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromString("10").pow(18);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(100));
/////////////////////
///// Date/Time /////
/////////////////////
exports.DAYS_PER_YEAR = 365;
exports.SECONDS_PER_YEAR = 60 * 60 * 24 * exports.DAYS_PER_YEAR;
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.DAYS_PER_EPOCH = 7;
exports.ETHEREUM_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 13; // 13 = seconds per block
exports.AVALANCHE_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 2; // 2 = seconds per block. This is NOT ideal since avalanche has variable block time.
exports.FANTOM_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 1; // 1 = seconds per block. This is NOT ideal since fantom has variable block time.
exports.BSC_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 3; // 3 = seconds per block
exports.MATIC_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 2; // 2 = seconds per block
exports.ARBITRUM_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 1; // 1 = seconds per block. This is NOT ideal since fantom has variable block time.
exports.V2_2_MIGRATION_TIME = "1643943600";
exports.BACKER_REWARDS_EPOCH = "1644021439";
exports.FIDU_DECIMALS = graph_ts_1.BigDecimal.fromString("1000000000000000000"); // 18 zeroes
exports.GFI_DECIMALS = graph_ts_1.BigDecimal.fromString("1000000000000000000"); // 18 zeroes
exports.USDC_DECIMALS = graph_ts_1.BigDecimal.fromString("1000000"); // 6 zeroes
// This config represents the enum config on protocol/core/ConfigOptions.sol where order is fixed
// (search for `library ConfigOptions` and `CONFIG_KEYS_BY_TYPE`)
var CONFIG_KEYS_NUMBERS;
(function (CONFIG_KEYS_NUMBERS) {
    CONFIG_KEYS_NUMBERS[CONFIG_KEYS_NUMBERS["TransactionLimit"] = 0] = "TransactionLimit";
    CONFIG_KEYS_NUMBERS[CONFIG_KEYS_NUMBERS["TotalFundsLimit"] = 1] = "TotalFundsLimit";
    CONFIG_KEYS_NUMBERS[CONFIG_KEYS_NUMBERS["MaxUnderwriterLimit"] = 2] = "MaxUnderwriterLimit";
    CONFIG_KEYS_NUMBERS[CONFIG_KEYS_NUMBERS["ReserveDenominator"] = 3] = "ReserveDenominator";
    CONFIG_KEYS_NUMBERS[CONFIG_KEYS_NUMBERS["WithdrawFeeDenominator"] = 4] = "WithdrawFeeDenominator";
    CONFIG_KEYS_NUMBERS[CONFIG_KEYS_NUMBERS["LatenessGracePeriodInDays"] = 5] = "LatenessGracePeriodInDays";
    CONFIG_KEYS_NUMBERS[CONFIG_KEYS_NUMBERS["LatenessMaxDays"] = 6] = "LatenessMaxDays";
    CONFIG_KEYS_NUMBERS[CONFIG_KEYS_NUMBERS["DrawdownPeriodInSeconds"] = 7] = "DrawdownPeriodInSeconds";
    CONFIG_KEYS_NUMBERS[CONFIG_KEYS_NUMBERS["TransferRestrictionPeriodInDays"] = 8] = "TransferRestrictionPeriodInDays";
    CONFIG_KEYS_NUMBERS[CONFIG_KEYS_NUMBERS["LeverageRatio"] = 9] = "LeverageRatio";
})(CONFIG_KEYS_NUMBERS = exports.CONFIG_KEYS_NUMBERS || (exports.CONFIG_KEYS_NUMBERS = {}));
var CONFIG_KEYS_ADDRESSES;
(function (CONFIG_KEYS_ADDRESSES) {
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["Pool"] = 0] = "Pool";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["CreditLineImplementation"] = 1] = "CreditLineImplementation";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["GoldfinchFactory"] = 2] = "GoldfinchFactory";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["CreditDesk"] = 3] = "CreditDesk";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["Fidu"] = 4] = "Fidu";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["USDC"] = 5] = "USDC";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["TreasuryReserve"] = 6] = "TreasuryReserve";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["ProtocolAdmin"] = 7] = "ProtocolAdmin";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["OneInch"] = 8] = "OneInch";
    // TrustedForwarder is deprecated because we no longer use GSN
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["TrustedForwarder"] = 9] = "TrustedForwarder";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["CUSDCContract"] = 10] = "CUSDCContract";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["GoldfinchConfig"] = 11] = "GoldfinchConfig";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["PoolTokens"] = 12] = "PoolTokens";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["TranchedPoolImplementation"] = 13] = "TranchedPoolImplementation";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["SeniorPool"] = 14] = "SeniorPool";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["SeniorPoolStrategy"] = 15] = "SeniorPoolStrategy";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["MigratedTranchedPoolImplementation"] = 16] = "MigratedTranchedPoolImplementation";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["BorrowerImplementation"] = 17] = "BorrowerImplementation";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["GFI"] = 18] = "GFI";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["Go"] = 19] = "Go";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["BackerRewards"] = 20] = "BackerRewards";
    CONFIG_KEYS_ADDRESSES[CONFIG_KEYS_ADDRESSES["StakingRewards"] = 21] = "StakingRewards";
})(CONFIG_KEYS_ADDRESSES = exports.CONFIG_KEYS_ADDRESSES || (exports.CONFIG_KEYS_ADDRESSES = {}));
////////////////////////
///// ADDRESSES /////
////////////////////////
exports.FACTORY_ADDRESS = "0xd20508e1e971b80ee172c73517905bfffcbd87f9";
exports.SENIOR_POOL_ADDRESS = "0x8481a6ebaf5c7dabc3f7e09e44a89531fd31f822";
exports.USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
exports.FIDU_ADDRESS = "0x6a445e9f40e0b97c92d0b8a3366cef1d67f700bf";
exports.GFI_ADDRESS = "0xdab396ccf3d84cf2d07c4454e10c8a6f5b008d2b";
exports.WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
exports.MEMBERSHIP_VAULT_ADDRESS = "0x375b906b25e00bdd43017400cd4cefb36fbf9c18";
exports.STAKING_REWARDS_ADDRESS = "0xfd6ff39da508d281c2d255e9bbbfab34b6be60c3";
exports.POOL_TOKENS_ADDRESS = "0x57686612c601cb5213b01aa8e80afeb24bbd01df";
exports.WETH_GFI_UniswapV2_Pair = "0xa0ce0b8fdbed2b63a28e4f2d23e075c7f16a8259";
exports.USDC_WETH_UniswapV2_Pair = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc";
exports.INVALID_POOLS = new Set();
exports.INVALID_POOLS.add("0x0e2e11dc77bbe75b2b65b57328a8e4909f7da1eb");
exports.INVALID_POOLS.add("0x4b2ae066681602076adbe051431da7a3200166fd");
exports.INVALID_POOLS.add("0x6b42b1a43abe9598052bb8c21fd34c46c9fbcb8b");
exports.INVALID_POOLS.add("0x7bdf2679a9f3495260e64c0b9e0dfeb859bad7e0");
exports.INVALID_POOLS.add("0x95715d3dcbb412900deaf91210879219ea84b4f8");
exports.INVALID_POOLS.add("0xa49506632ce8ec826b0190262b89a800353675ec");
exports.INVALID_POOLS.add("0xfce88c5d0ec3f0cb37a044738606738493e9b450");
exports.INVALID_POOLS.add("0x294371f9ec8b6ddf59d4a2ceba377d19b9735d34");
