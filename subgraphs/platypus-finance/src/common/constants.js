"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POOL_PROXY = exports.PTPAddress = exports.PROTOCOL_ADMIN = exports.WAVAX_ADDRESS = exports.ETH_NAME = exports.ETH_SYMBOL = exports.MS_PER_YEAR = exports.DAYS_PER_YEAR = exports.MS_PER_DAY = exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR = exports.MAX_UINT = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.INT_FOUR = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.INT_NEGATIVE_ONE = exports.BIGINT_MAX = exports.BIGINT_TEN_TO_EIGHTEENTH = exports.BIGINT_THOUSAND = exports.BIGINT_HUNDRED = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.DEFAULT_DECIMALS = exports.USDT_WETH_PAIR = exports.DAI_WETH_PAIR = exports.USDC_WETH_PAIR = exports.WETH_ADDRESS = exports.UNISWAP_V2_FACTORY = exports.MasterPlatypusFactory_ADDRESS = exports.MasterPlatypusOld_ADDRESS = exports.MasterPlatypus_ADDRESS = exports.ZERO_ADDRESS = exports.ETH_ADDRESS = exports.ZERO_ADDRESS_STRING = exports.InterestRateSide = exports.InterestRateType = exports.RiskType = exports.LendingType = exports.RewardTokenType = exports.LiquidityPoolFeeType = exports.VaultFeeType = exports.ProtocolType = exports.Network = void 0;
exports.TransactionType = exports.poolDetail = void 0;
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
    LiquidityPoolFeeType.WITHDRAWAL_FEE = "WITHDRAWAL_FEE";
    LiquidityPoolFeeType.DEPOSIT_FEE = "DEPOSIT_FEE";
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
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ZERO_ADDRESS_STRING = "0x0000000000000000000000000000000000000000";
exports.ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
exports.ZERO_ADDRESS = graph_ts_1.Address.fromString(exports.ZERO_ADDRESS_STRING);
exports.MasterPlatypus_ADDRESS = graph_ts_1.Address.fromString("0x68c5f4374228beedfa078e77b5ed93c28a2f713e");
exports.MasterPlatypusOld_ADDRESS = graph_ts_1.Address.fromString("0xb0523f9f473812fb195ee49bc7d2ab9873a98044");
exports.MasterPlatypusFactory_ADDRESS = graph_ts_1.Address.fromString("0x7125b4211357d7c3a90f796c956c12c681146ebb");
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
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
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
////////////////
///// Misc /////
////////////////
exports.ETH_SYMBOL = "ETH";
exports.ETH_NAME = "Ether";
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.WAVAX_ADDRESS = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";
exports.PROTOCOL_ADMIN = "0x416a7989a964c9ed60257b064efc3a30fe6bf2ee";
exports.PTPAddress = "0x22d4002028f537599be9f666d1c4fa138522f9c8";
// Main USD Pool
exports.POOL_PROXY = "0x66357dcace80431aee0a7507e2e361b7e2402370";
class poolDetail {
    // Initialize a Token Definition with its attributes
    constructor(name, symbol, address, ignore) {
        this.address = address;
        this.symbol = symbol;
        this.name = name;
        this.ignore = ignore == "true";
    }
    static getAltPoolAddressArray() {
        return [
            // We comment out the main pool as we already are "watching" its events
            // As per the subgraph.yaml manifest definition
            // "0x66357dCaCe80431aee0A7507e2E361B7e2402370",
            "0xe0d166de15665bc4b7185b2e35e847e51316e126",
            "0xb8e567fc23c39c94a1f6359509d7b43d1fbed824",
            "0x30c30d826be87cd0a4b90855c2f38f7fcfe4eaa7",
            "0xc828d995c686aaba78a4ac89dfc8ec0ff4c5be83",
            "0x4658ea7e9960d6158a261104aaa160cc953bb6ba",
            "0x39de4e02f76dbd4352ec2c926d8d64db8abdf5b2",
            "0x233ba46b01d2fbf1a31bdbc500702e286d6de218",
            "0x91bb10d68c72d64a7ce10482b453153eea03322c",
            "0x27912ae6ba9a54219d8287c3540a8969ff35500b",
            "0x853ea32391aaa14c112c645fd20ba389ab25c5e0",
            "0x3b55e45fd6bd7d4724f5c47e0d1bcaedd059263e",
        ];
    }
    // Get all tokens with a static defintion
    static getPoolDetails() {
        const poolDetailArray = new Array();
        const detailsJson = [
            ["Main Pool", "Main Pool", "0x66357dcace80431aee0a7507e2e361b7e2402370", "false"],
            ["Alt Pool UST", "UST-USDC Pool", "0xe0d166de15665bc4b7185b2e35e847e51316e126", "false"],
            ["Alt Pool Frax", "Frax-USDC Pool", "0xb8e567fc23c39c94a1f6359509d7b43d1fbed824", "false"],
            ["Alt Pool MIM", "MIM-USDC Pool", "0x30c30d826be87cd0a4b90855c2f38f7fcfe4eaa7", "false"],
            ["Alt Pool YUSD", "YUSD-USDC Pool", "0xc828d995c686aaba78a4ac89dfc8ec0ff4c5be83", "false"],
            ["Alt Pool sAVAX", "sAVAX-AVAX Pool", "0x4658ea7e9960d6158a261104aaa160cc953bb6ba", "false"],
            ["Alt Pool BTC.b-WBTC.e", "BTC.b-WBTC.e Pool", "0x39de4e02f76dbd4352ec2c926d8d64db8abdf5b2", "false"],
            ["Factory Pool H2O", "H2O-USDC Pool", "0x233ba46b01d2fbf1a31bdbc500702e286d6de218", "false"],
            ["Factory Pool TSD", "TSD-USDC Pool", "0x91bb10d68c72d64a7ce10482b453153eea03322c", "false"],
            ["Factory Pool MONEY", "MONEY-USDC Pool", "0x27912ae6ba9a54219d8287c3540a8969ff35500b", "false"],
            ["Factory Pool dForce USX", "USX-USDC Pool", "0x89e9efd9614621309ada948a761d364f0236edea", "false"],
            ["Factory Pool MAI", "MiMatic-USDC Pool", "0x1abb6bf97506c9b4ac985f558c4ee6eeb9c11f1d", "false"],
            // Ignore pools while calculating TVL not in above list
            ["Withdraw Pool MIM", "MIM-Ignore", "0x6c84f0580c8ffab0c716c87e66ab474e4bea97d9", "true"],
            ["Withdraw Pool UST", "UST-USDC-Ignore", "0xefa5d088a58a2d4ee5504102c5ffde69301527b0", "true"],
            ["Multisig (Treasury)", "Multisig-Treasury", "0x068e297e8ff74115c9e1c4b5b83b700fda5afdeb", "true"],
            ["Multisig (Incentives)", "Multisig-Incentives", "0xd2805cff8877235d9ec88f683f85a8213dc288bc", "true"],
            ["Admin (Address)", "Admin-Address", "0x416a7989a964c9ed60257b064efc3a30fe6bf2ee", "true"],
            // Ignore all unknown pools
            ["unknown pool", "unknown pool", "unknown", "true"],
        ];
        for (let i = 0; i < detailsJson.length; i++) {
            const details = new poolDetail(detailsJson[i][0], detailsJson[i][1], detailsJson[i][2], detailsJson[i][3]);
            poolDetailArray.push(details);
        }
        return poolDetailArray;
    }
    static fromAddress(poolAddress) {
        const details = this.getPoolDetails();
        for (let i = 0; i < details.length; i++) {
            if (details[i].address.toLowerCase() == poolAddress.toLowerCase()) {
                return details[i];
            }
        }
        return details[details.length - 1];
    }
}
exports.poolDetail = poolDetail;
var TransactionType;
(function (TransactionType) {
    TransactionType[TransactionType["DEPOSIT"] = 0] = "DEPOSIT";
    TransactionType[TransactionType["WITHDRAW"] = 1] = "WITHDRAW";
    TransactionType[TransactionType["SWAP"] = 2] = "SWAP";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
