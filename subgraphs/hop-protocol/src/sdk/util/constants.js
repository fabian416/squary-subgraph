"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MS_PER_DAY = exports.SECONDS_PER_HOUR = exports.SECONDS_PER_DAY = exports.MAX_UINT = exports.BIGDECIMAL_MINUS_ONE = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.INT_FOUR = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.INT_NEGATIVE_ONE = exports.BIGINT_MAX = exports.EIGHTY_SIX_FOUR_HUNDRED = exports.BIGINT_TEN_TO_SIX = exports.BIGINT_TEN_TO_EIGHTEENTH = exports.BIGINT_TEN_THOUSAND = exports.BIGINT_THOUSAND = exports.BIGINT_HUNDRED = exports.BIGINT_FOUR = exports.BIGINT_TWO = exports.FOUR = exports.THREE = exports.SIX = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.USDC_DENOMINATOR = exports.USDC_DECIMALS = exports.DEFAULT_DECIMALS = exports.USDT_WETH_PAIR = exports.DAI_WETH_PAIR = exports.USDC_WETH_PAIR = exports.WETH_ADDRESS = exports.UNISWAP_V2_FACTORY = exports.ETH_ADDRESS = exports.BIGINT_MINUS_ONE = exports.RewardTokenType = exports.UsageType = exports.PositionSide = exports.InterestRateSide = exports.InterestRateType = exports.RiskType = exports.LendingType = exports.LiquidityPoolFeeType = exports.VaultFeeType = exports.ProtocolType = exports.Network = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = void 0;
exports.LineaBridge = exports.BaseRewardToken = exports.BaseHToken = exports.BaseToken = exports.BaseAmm = exports.BaseBridge = exports.PolygonRewardToken = exports.PolygonHtoken = exports.PolygonToken = exports.PolygonAmm = exports.PolygonBridge = exports.ArbitrumNovaRewardToken = exports.ArbitrumNovaHtoken = exports.ArbitrumNovaToken = exports.ArbitrumNovaAmm = exports.ArbitrumNovaBridge = exports.OptimismRewardToken = exports.OptimismHtoken = exports.OptimismToken = exports.OptimismAmm = exports.OptimismBridge = exports.ArbitrumRewardToken = exports.ArbitrumHtoken = exports.ArbitrumToken = exports.ArbitrumAmm = exports.ArbitrumBridge = exports.MainnetBridge = exports.MainnetToken = exports.XdaiRewardToken = exports.XdaiHtoken = exports.XdaiToken = exports.XdaiAmm = exports.XdaiBridge = exports.ZERO_ADDRESS = exports.LP_FEE_TO_OFF = exports.PROTOCOL_FEE_TO_OFF = exports.LP_FEE_TO_ON = exports.PROTOCOL_FEE_TO_ON = exports.TRADING_FEE = exports.FACTORY_ADDRESS = exports.safeDiv = exports.PRECISION = exports.exponentToBigInt = exports.exponentToBigDecimal = exports.ETH_NAME = exports.ETH_SYMBOL = exports.SECONDS_PER_HOUR_BI = exports.SECONDS_PER_DAY_BI = exports.MS_PER_YEAR = exports.DAYS_PER_YEAR = void 0;
exports.SIX_DECIMAL_TOKENS = exports.WETH_REWARDS = exports.WMATIC_REWARDS = exports.RPL_REWARDS = exports.OP_REWARDS = exports.HOP_REWARDS = exports.GNO_REWARDS = exports.RewardTokens = exports.MESSENGER_EVENT_SIGNATURES = exports.ARBITRUM_L1_SIGNATURE = exports.XDAI_L1_SIGNATURE = exports.OPTIMISM_L2_SIGNATURE = exports.OPTIMISM_L1_SIGNATURE = exports.XDAI_L2_SIGNATURE = exports.OPTIMISM_GENESIS_HASHES = exports.MESSENGER_ADDRESSES = exports.priceTokens = exports.LineaRewardToken = exports.LineaHToken = exports.LineaToken = exports.LineaAmm = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_NAME = "Uniswap v2";
exports.PROTOCOL_SLUG = "uniswap-v2";
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
    Network.ARBITRUM_NOVA = "ARBITRUM_NOVA";
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
    PositionSide.LENDER = "LENDER";
    PositionSide.BORROWER = "BORROWER";
})(PositionSide = exports.PositionSide || (exports.PositionSide = {}));
var UsageType;
(function (UsageType) {
    UsageType.DEPOSIT = "DEPOSIT";
    UsageType.WITHDRAW = "WITHDRAW";
    UsageType.SWAP = "SWAP";
})(UsageType = exports.UsageType || (exports.UsageType = {}));
var RewardTokenType;
(function (RewardTokenType) {
    RewardTokenType.DEPOSIT = "DEPOSIT";
    RewardTokenType.BORROW = "BORROW";
})(RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}));
exports.BIGINT_MINUS_ONE = graph_ts_1.BigInt.fromI32(-1);
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
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
exports.SIX = 6;
exports.THREE = 3;
exports.FOUR = 4;
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_FOUR = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
exports.BIGINT_TEN_THOUSAND = graph_ts_1.BigInt.fromI32(10000);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromString("10").pow(18);
exports.BIGINT_TEN_TO_SIX = graph_ts_1.BigInt.fromString("10").pow(6);
exports.EIGHTY_SIX_FOUR_HUNDRED = 86400;
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString("115792089237316195423570985008687907853269984665640564039457584007913129639935");
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_MINUS_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_MINUS_ONE);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(graph_ts_1.BigInt.fromI32(255));
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000));
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(365));
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)));
exports.SECONDS_PER_DAY_BI = graph_ts_1.BigInt.fromI32(exports.SECONDS_PER_DAY);
exports.SECONDS_PER_HOUR_BI = graph_ts_1.BigInt.fromI32(exports.SECONDS_PER_HOUR);
////////////////
///// Misc /////
////////////////
exports.ETH_SYMBOL = "ETH";
exports.ETH_NAME = "Ether";
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
function exponentToBigDecimal(decimals) {
    let bd = graph_ts_1.BigDecimal.fromString("1");
    for (let i = exports.BIGINT_ZERO; i.lt(decimals); i = i.plus(exports.BIGINT_ONE)) {
        bd = bd.times(graph_ts_1.BigDecimal.fromString("10"));
    }
    return bd;
}
exports.exponentToBigDecimal = exponentToBigDecimal;
function exponentToBigInt(n) {
    return graph_ts_1.BigInt.fromI32(10).pow(n);
}
exports.exponentToBigInt = exponentToBigInt;
exports.PRECISION = graph_ts_1.BigInt.fromString("100000000000000000");
// return 0 if denominator is 0 in division
function safeDiv(amount0, amount1) {
    if (amount1.equals(exports.BIGDECIMAL_ZERO)) {
        return exports.BIGDECIMAL_ZERO;
    }
    else {
        return amount0.div(amount1);
    }
}
exports.safeDiv = safeDiv;
exports.FACTORY_ADDRESS = "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f";
exports.TRADING_FEE = graph_ts_1.BigDecimal.fromString("3");
exports.PROTOCOL_FEE_TO_ON = graph_ts_1.BigDecimal.fromString("0.5");
exports.LP_FEE_TO_ON = graph_ts_1.BigDecimal.fromString("2.5");
exports.PROTOCOL_FEE_TO_OFF = graph_ts_1.BigDecimal.fromString("0.0");
exports.LP_FEE_TO_OFF = graph_ts_1.BigDecimal.fromString("3");
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// source: https://github.com/hop-protocol/hop/blob/develop/packages/core/src/addresses/mainnet.ts
var XdaiBridge;
(function (XdaiBridge) {
    XdaiBridge.USDC = "0x25d8039bb044dc227f741a9e381ca4ceae2e6ae8";
    XdaiBridge.USDT = "0xfd5a186a7e8453eb867a360526c5d987a00acac2";
    XdaiBridge.MATIC = "0x7ac71c29fedf94bac5a5c9ab76e1dd12ea885ccc";
    XdaiBridge.DAI = "0x0460352b91d7cf42b0e1c1c30f06b602d9ef2238";
    XdaiBridge.ETH = "0xd8926c12c0b2e5cd40cfda49ecaff40252af491b";
})(XdaiBridge = exports.XdaiBridge || (exports.XdaiBridge = {}));
var XdaiAmm;
(function (XdaiAmm) {
    XdaiAmm.USDC = "0x5c32143c8b198f392d01f8446b754c181224ac26";
    XdaiAmm.USDT = "0x3aa637d6853f1d9a9354fe4301ab852a88b237e7";
    XdaiAmm.MATIC = "0xaa30d6bba6285d0585722e2440ff89e23ef68864";
    XdaiAmm.DAI = "0x24afdca4653042c6d08fb1a754b2535dacf6eb24";
    XdaiAmm.ETH = "0x4014dc015641c08788f15bd6eb20da4c47d936d8";
})(XdaiAmm = exports.XdaiAmm || (exports.XdaiAmm = {}));
var XdaiToken;
(function (XdaiToken) {
    XdaiToken.USDC = "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83";
    XdaiToken.USDT = "0x4ecaba5870353805a9f068101a40e0f32ed605c6";
    XdaiToken.MATIC = "0x7122d7661c4564b7c6cd4878b06766489a6028a2";
    XdaiToken.DAI = "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d";
    XdaiToken.ETH = "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1";
})(XdaiToken = exports.XdaiToken || (exports.XdaiToken = {}));
var XdaiHtoken;
(function (XdaiHtoken) {
    XdaiHtoken.USDC = "0x9ec9551d4a1a1593b0ee8124d98590cc71b3b09d";
    XdaiHtoken.USDT = "0x91f8490ec27cbb1b2faedd29c2ec23011d7355fb";
    XdaiHtoken.MATIC = "0xe38faf9040c7f09958c638bbdb977083722c5156";
    XdaiHtoken.DAI = "0xb1ea9fed58a317f81eeefc18715dd323fdef45c4";
    XdaiHtoken.ETH = "0xc46f2004006d4c770346f60a7baa3f1cc67dfd1c";
})(XdaiHtoken = exports.XdaiHtoken || (exports.XdaiHtoken = {}));
var XdaiRewardToken;
(function (XdaiRewardToken) {
    XdaiRewardToken.USDC_A = "0x5d13179c5fa40b87d53ff67ca26245d3d5b2f872";
    XdaiRewardToken.USDC_B = "0x636a7ee78facd079dabc8f81eda1d09aa9d440a7";
    XdaiRewardToken.USDT_A = "0x2c2ab81cf235e86374468b387e241df22459a265";
    XdaiRewardToken.USDT_B = "0x3d4cc8a61c7528fd86c55cfe061a78dcba48edd1";
    XdaiRewardToken.DAI_A = "0x12a3a66720dd925fa93f7c895bc20ca9560adfe7";
    XdaiRewardToken.DAI_B = "0xbf7a02d963b23d84313f07a04ad663409cee5a92";
    XdaiRewardToken.ETH_A = "0xc61ba16e864efbd06a9fe30aab39d18b8f63710a";
    XdaiRewardToken.ETH_B = "0x712f0cf37bdb8299d0666727f73a5caba7c1c24c";
})(XdaiRewardToken = exports.XdaiRewardToken || (exports.XdaiRewardToken = {}));
var MainnetToken;
(function (MainnetToken) {
    MainnetToken.USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    MainnetToken.USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
    MainnetToken.MATIC = "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0";
    MainnetToken.DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
    MainnetToken.ETH = exports.ZERO_ADDRESS;
    MainnetToken.SNX = "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f";
    MainnetToken.sUSD = "0x57ab1ec28d129707052df4df418d58a2d46d5f51";
    MainnetToken.rETH = "0xae78736cd615f374d3085123a210448e74fc6393";
    MainnetToken.MAGIC = "0xb0c7a3ba49c7a6eaba6cd4a96c55a1391070ac9a";
})(MainnetToken = exports.MainnetToken || (exports.MainnetToken = {}));
var MainnetBridge;
(function (MainnetBridge) {
    MainnetBridge.USDC = "0x3666f603cc164936c1b87e207f36beba4ac5f18a";
    MainnetBridge.USDT = "0x3e4a3a4796d16c0cd582c382691998f7c06420b6";
    MainnetBridge.MATIC = "0x22b1cbb8d98a01a3b71d034bb899775a76eb1cc2";
    MainnetBridge.DAI = "0x3d4cc8a61c7528fd86c55cfe061a78dcba48edd1";
    MainnetBridge.ETH = "0xb8901acb165ed027e32754e0ffe830802919727f";
    MainnetBridge.SNX = "0x893246facf345c99e4235e5a7bbee7404c988b96";
    MainnetBridge.sUSD = "0x36443fc70e073fe9d50425f82a3ee19fef697d62";
    MainnetBridge.rETH = "0x87269b23e73305117d0404557badc459ced0dbec";
    MainnetBridge.MAGIC = "0xf074540eb83c86211f305e145eb31743e228e57d";
})(MainnetBridge = exports.MainnetBridge || (exports.MainnetBridge = {}));
var ArbitrumBridge;
(function (ArbitrumBridge) {
    ArbitrumBridge.USDC = "0x0e0e3d2c5c292161999474247956ef542cabf8dd";
    ArbitrumBridge.USDT = "0x72209fe68386b37a40d6bca04f78356fd342491f";
    ArbitrumBridge.DAI = "0x7ac115536fe3a185100b2c4de4cb328bf3a58ba6";
    ArbitrumBridge.ETH = "0x3749c4f034022c39ecaffaba182555d4508caccc";
    ArbitrumBridge.rETH = "0xc315239cfb05f1e130e7e28e603cea4c014c57f0";
    ArbitrumBridge.MAGIC = "0xea5abf2c909169823d939de377ef2bf897a6ce98";
})(ArbitrumBridge = exports.ArbitrumBridge || (exports.ArbitrumBridge = {}));
var ArbitrumAmm;
(function (ArbitrumAmm) {
    ArbitrumAmm.USDC = "0x10541b07d8ad2647dc6cd67abd4c03575dade261";
    ArbitrumAmm.USDT = "0x18f7402b673ba6fb5ea4b95768aabb8aad7ef18a";
    ArbitrumAmm.DAI = "0xa5a33ab9063395a90ccbea2d86a62eccf27b5742";
    ArbitrumAmm.ETH = "0x652d27c0f72771ce5c76fd400edd61b406ac6d97";
    ArbitrumAmm.rETH = "0x0ded0d521ac7b0d312871d18ea4fde79f03ee7ca";
    ArbitrumAmm.MAGIC = "0x50a3a623d00fd8b8a4f3cbc5aa53d0bc6fa912dd";
})(ArbitrumAmm = exports.ArbitrumAmm || (exports.ArbitrumAmm = {}));
var ArbitrumToken;
(function (ArbitrumToken) {
    ArbitrumToken.USDC = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";
    ArbitrumToken.USDT = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";
    ArbitrumToken.DAI = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1";
    ArbitrumToken.ETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
    ArbitrumToken.rETH = "0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8";
    ArbitrumToken.MAGIC = "0x539bde0d7dbd336b79148aa742883198bbf60342";
})(ArbitrumToken = exports.ArbitrumToken || (exports.ArbitrumToken = {}));
var ArbitrumHtoken;
(function (ArbitrumHtoken) {
    ArbitrumHtoken.USDC = "0x0ce6c85cf43553de10fc56ceca0aef6ff0dd444d";
    ArbitrumHtoken.USDT = "0x12e59c59d282d2c00f3166915bed6dc2f5e2b5c7";
    ArbitrumHtoken.DAI = "0x46ae9bab8cea96610807a275ebd36f8e916b5c61";
    ArbitrumHtoken.ETH = "0xda7c0de432a9346bb6e96ac74e3b61a36d8a77eb";
    ArbitrumHtoken.rETH = "0x588bae9c85a605a7f14e551d144279984469423b";
    ArbitrumHtoken.MAGIC = "0xc315239cfb05f1e130e7e28e603cea4c014c57f0";
})(ArbitrumHtoken = exports.ArbitrumHtoken || (exports.ArbitrumHtoken = {}));
var ArbitrumRewardToken;
(function (ArbitrumRewardToken) {
    ArbitrumRewardToken.USDC = "0xb0cabfe930642ad3e7decdc741884d8c3f7ebc70";
    ArbitrumRewardToken.USDT = "0x9dd8685463285ad5a94d2c128bda3c5e8a6173c8";
    ArbitrumRewardToken.DAI = "0xd4d28588ac1d9ef272aa29d4424e3e2a03789d1e";
    ArbitrumRewardToken.ETH = "0x755569159598f3702bdd7dff6233a317c156d3dd";
    ArbitrumRewardToken.rETH = "0x3d4cad734b464ed6edcf6254c2a3e5fa5d449b32";
    ArbitrumRewardToken.MAGIC = "0x4e9840f3c1ff368a10731d15c11516b9fe7e1898";
})(ArbitrumRewardToken = exports.ArbitrumRewardToken || (exports.ArbitrumRewardToken = {}));
var OptimismBridge;
(function (OptimismBridge) {
    OptimismBridge.USDC = "0xa81d244a1814468c734e5b4101f7b9c0c577a8fc";
    OptimismBridge.USDT = "0x46ae9bab8cea96610807a275ebd36f8e916b5c61";
    OptimismBridge.DAI = "0x7191061d5d4c60f598214cc6913502184baddf18";
    OptimismBridge.ETH = "0x83f6244bd87662118d96d9a6d44f09dfff14b30e";
    OptimismBridge.SNX = "0x1990bc6dfe2ef605bfc08f5a23564db75642ad73";
    OptimismBridge.rETH = "0xa0075e8ce43dcb9970cb7709b9526c1232cc39c2";
    OptimismBridge.sUSD = "0x33fe5bb8da466da55a8a32d6ade2bb104e2c5201";
})(OptimismBridge = exports.OptimismBridge || (exports.OptimismBridge = {}));
var OptimismAmm;
(function (OptimismAmm) {
    OptimismAmm.USDC = "0x3c0ffaca566fccfd9cc95139fef6cba143795963";
    OptimismAmm.USDT = "0xec4b41af04cf917b54aeb6df58c0f8d78895b5ef";
    OptimismAmm.DAI = "0xf181ed90d6cfac84b8073fdea6d34aa744b41810";
    OptimismAmm.ETH = "0xaa30d6bba6285d0585722e2440ff89e23ef68864";
    OptimismAmm.rETH = "0x9dd8685463285ad5a94d2c128bda3c5e8a6173c8";
    OptimismAmm.sUSD = "0x8d4063e82a4db8cdaed46932e1c71e03ca69bede";
    OptimismAmm.SNX = "0x1990bc6dfe2ef605bfc08f5a23564db75642ad73";
})(OptimismAmm = exports.OptimismAmm || (exports.OptimismAmm = {}));
var OptimismToken;
(function (OptimismToken) {
    OptimismToken.USDC = "0x7f5c764cbc14f9669b88837ca1490cca17c31607";
    OptimismToken.USDT = "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58";
    OptimismToken.DAI = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1";
    OptimismToken.sUSD = "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9";
    OptimismToken.ETH = "0x4200000000000000000000000000000000000006";
    OptimismToken.rETH = "0x9bcef72be871e61ed4fbbc7630889bee758eb81d";
    OptimismToken.SNX = "0x8700daec35af8ff88c16bdf0418774cb3d7599b4";
})(OptimismToken = exports.OptimismToken || (exports.OptimismToken = {}));
var OptimismHtoken;
(function (OptimismHtoken) {
    OptimismHtoken.USDC = "0x25d8039bb044dc227f741a9e381ca4ceae2e6ae8";
    OptimismHtoken.USDT = "0x2057c8ecb70afd7bee667d76b4cd373a325b1a20";
    OptimismHtoken.DAI = "0x56900d66d74cb14e3c86895789901c9135c95b16";
    OptimismHtoken.ETH = "0xe38faf9040c7f09958c638bbdb977083722c5156";
    OptimismHtoken.SNX = "0x13b7f51bd865410c3acc4d56083c5b56ab38d203";
    OptimismHtoken.rETH = "0x755569159598f3702bdd7dff6233a317c156d3dd";
    OptimismHtoken.sUSD = "0x6f03052743cd99ce1b29265e377e320cd24eb632";
})(OptimismHtoken = exports.OptimismHtoken || (exports.OptimismHtoken = {}));
var OptimismRewardToken;
(function (OptimismRewardToken) {
    OptimismRewardToken.USDC = "0xf587b9309c603feedf0445af4d3b21300989e93a";
    OptimismRewardToken.USDT = "0xaeb1b49921e0d2d96fcdbe0d486190b2907b3e0b";
    OptimismRewardToken.DAI = "0x392b9780cfd362bd6951edfa9ebc31e68748b190";
    OptimismRewardToken.ETH = "0x95d6a95becfd98a7032ed0c7d950ff6e0fa8d697";
    OptimismRewardToken.SNX_A = "0x25a5a48c35e75bd2eff53d94f0bb60d5a00e36ea";
    OptimismRewardToken.SNX_B = "0x09992dd7b32f7b35d347de9bdaf1919a57d38e82";
    OptimismRewardToken.rETH = "0x266e2dc3c4c59e42aa07afee5b09e964cffe6778";
    OptimismRewardToken.sUSD_A = "0x2935008ee9943f859c4fbb863c5402ffc06f462e";
    OptimismRewardToken.sUSD_B = "0x25fb92e505f752f730cad0bd4fa17ece4a384266";
})(OptimismRewardToken = exports.OptimismRewardToken || (exports.OptimismRewardToken = {}));
var ArbitrumNovaBridge;
(function (ArbitrumNovaBridge) {
    ArbitrumNovaBridge.ETH = "0x8796860ca1677bf5d54ce5a348fe4b779a8212f3";
    ArbitrumNovaBridge.MAGIC = "0xe638433e2c1df5f7a3a21b0a6b5c4b37278e55dc";
})(ArbitrumNovaBridge = exports.ArbitrumNovaBridge || (exports.ArbitrumNovaBridge = {}));
var ArbitrumNovaAmm;
(function (ArbitrumNovaAmm) {
    ArbitrumNovaAmm.ETH = "0xd6bfb71b5ad5fd378cac15c72d8652e3b8d542c4";
    ArbitrumNovaAmm.MAGIC = "0x40c8fdff725b20862e22953affa0bbaf42d4b467";
})(ArbitrumNovaAmm = exports.ArbitrumNovaAmm || (exports.ArbitrumNovaAmm = {}));
var ArbitrumNovaToken;
(function (ArbitrumNovaToken) {
    ArbitrumNovaToken.ETH = "0x722e8bdd2ce80a4422e880164f2079488e115365";
    ArbitrumNovaToken.MAGIC = "0xe8936ac97a85d708d5312d52c30c18d4533b8a9c";
})(ArbitrumNovaToken = exports.ArbitrumNovaToken || (exports.ArbitrumNovaToken = {}));
var ArbitrumNovaHtoken;
(function (ArbitrumNovaHtoken) {
    ArbitrumNovaHtoken.ETH = "0xba9d3040e79ec1e27c67fe8b184f552fe9398f07";
    ArbitrumNovaHtoken.MAGIC = "0xe3b4a0a9904d75a0334893989d06814ad969d80f";
})(ArbitrumNovaHtoken = exports.ArbitrumNovaHtoken || (exports.ArbitrumNovaHtoken = {}));
var ArbitrumNovaRewardToken;
(function (ArbitrumNovaRewardToken) {
    ArbitrumNovaRewardToken.MAGIC = "0xeb35dac45077319042d62a735aa0f9edd1f01fa6";
})(ArbitrumNovaRewardToken = exports.ArbitrumNovaRewardToken || (exports.ArbitrumNovaRewardToken = {}));
var PolygonBridge;
(function (PolygonBridge) {
    PolygonBridge.USDC = "0x25d8039bb044dc227f741a9e381ca4ceae2e6ae8";
    PolygonBridge.USDT = "0x6c9a1acf73bd85463a46b0afc076fbdf602b690b";
    PolygonBridge.DAI = "0xecf268be00308980b5b3fcd0975d47c4c8e1382a";
    PolygonBridge.ETH = "0xb98454270065a31d71bf635f6f7ee6a518dfb849";
    PolygonBridge.MATIC = "0x553bc791d746767166fa3888432038193ceed5e2";
})(PolygonBridge = exports.PolygonBridge || (exports.PolygonBridge = {}));
var PolygonAmm;
(function (PolygonAmm) {
    PolygonAmm.USDC = "0x5c32143c8b198f392d01f8446b754c181224ac26";
    PolygonAmm.USDT = "0xb2f7d27b21a69a033f85c42d5eb079043baadc81";
    PolygonAmm.DAI = "0x25fb92e505f752f730cad0bd4fa17ece4a384266";
    PolygonAmm.ETH = "0x266e2dc3c4c59e42aa07afee5b09e964cffe6778";
    PolygonAmm.MATIC = "0x3d4cc8a61c7528fd86c55cfe061a78dcba48edd1";
})(PolygonAmm = exports.PolygonAmm || (exports.PolygonAmm = {}));
var PolygonToken;
(function (PolygonToken) {
    PolygonToken.USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
    PolygonToken.USDT = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";
    PolygonToken.DAI = "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063";
    PolygonToken.ETH = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619";
    PolygonToken.MATIC = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
})(PolygonToken = exports.PolygonToken || (exports.PolygonToken = {}));
var PolygonHtoken;
(function (PolygonHtoken) {
    PolygonHtoken.USDC = "0x9ec9551d4a1a1593b0ee8124d98590cc71b3b09d";
    PolygonHtoken.USDT = "0x9f93aca246f457916e49ec923b8ed099e313f763";
    PolygonHtoken.DAI = "0xb8901acb165ed027e32754e0ffe830802919727f";
    PolygonHtoken.ETH = "0x1fdeaf938267ca43388ed1fdb879eaf91e920c7a";
    PolygonHtoken.MATIC = "0x712f0cf37bdb8299d0666727f73a5caba7c1c24c";
})(PolygonHtoken = exports.PolygonHtoken || (exports.PolygonHtoken = {}));
var PolygonRewardToken;
(function (PolygonRewardToken) {
    PolygonRewardToken.USDC_A = "0x7811737716942967ae6567b26a5051cc72af550e";
    PolygonRewardToken.USDC_B = "0x2c2ab81cf235e86374468b387e241df22459a265";
    PolygonRewardToken.USDT_A = "0x297e5079df8173ae1696899d3eacd708f0af82ce";
    PolygonRewardToken.USDT_B = "0x07932e9a5ab8800922b2688fb1fa0daad8341772";
    PolygonRewardToken.DAI_A = "0xd6dc6f69f81537fe9decc18152b7005b45dc2ee7";
    PolygonRewardToken.DAI_B = "0x4aeb0b5b1f3e74314a7fa934db090af603e8289b";
    PolygonRewardToken.MATIC = "0x7deebcad1416110022f444b03aeb1d20eb4ea53f";
    PolygonRewardToken.ETH_A = "0xaa7b3a4a084e6461d486e53a03cf45004f0963b7";
    PolygonRewardToken.ETH_B = "0x7bceda1db99d64f25efa279bb11ce48e15fda427";
})(PolygonRewardToken = exports.PolygonRewardToken || (exports.PolygonRewardToken = {}));
var BaseBridge;
(function (BaseBridge) {
    BaseBridge.USDC = "0x46ae9bab8cea96610807a275ebd36f8e916b5c61";
    BaseBridge.ETH = "0x3666f603cc164936c1b87e207f36beba4ac5f18a";
})(BaseBridge = exports.BaseBridge || (exports.BaseBridge = {}));
var BaseAmm;
(function (BaseAmm) {
    BaseAmm.USDC = "0x022c5ce6f1add7423268d41e08df521d5527c2a0";
    BaseAmm.ETH = "0x0ce6c85cf43553de10fc56ceca0aef6ff0dd444d";
})(BaseAmm = exports.BaseAmm || (exports.BaseAmm = {}));
var BaseToken;
(function (BaseToken) {
    BaseToken.USDC = "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca";
    BaseToken.ETH = "0x4200000000000000000000000000000000000006";
})(BaseToken = exports.BaseToken || (exports.BaseToken = {}));
var BaseHToken;
(function (BaseHToken) {
    BaseHToken.USDC = "0x74fa978eaffa312bc92e76df40fcc1bfe7637aeb";
    BaseHToken.ETH = "0xc1985d7a3429cdc85e59e2e4fcc805b857e6ee2e";
})(BaseHToken = exports.BaseHToken || (exports.BaseHToken = {}));
var BaseRewardToken;
(function (BaseRewardToken) {
    BaseRewardToken.USDC = "0x7ac115536fe3a185100b2c4de4cb328bf3a58ba6";
    BaseRewardToken.ETH = "0x12e59c59d282d2c00f3166915bed6dc2f5e2b5c7";
})(BaseRewardToken = exports.BaseRewardToken || (exports.BaseRewardToken = {}));
var LineaBridge;
(function (LineaBridge) {
    LineaBridge.ETH = "0xcbb852a6274e03fa00fb4895de0463f66df27a11";
})(LineaBridge = exports.LineaBridge || (exports.LineaBridge = {}));
var LineaAmm;
(function (LineaAmm) {
    LineaAmm.ETH = "0x2935173357c010f8b56c8719a44f9fbdda90f67c";
})(LineaAmm = exports.LineaAmm || (exports.LineaAmm = {}));
var LineaToken;
(function (LineaToken) {
    LineaToken.ETH = "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f";
})(LineaToken = exports.LineaToken || (exports.LineaToken = {}));
var LineaHToken;
(function (LineaHToken) {
    LineaHToken.ETH = "0xdc38c5af436b9652225f92c370a011c673fa7ba5";
})(LineaHToken = exports.LineaHToken || (exports.LineaHToken = {}));
var LineaRewardToken;
(function (LineaRewardToken) {
    LineaRewardToken.ETH = "0xa50395bdeaca7062255109fede012efe63d6d402";
})(LineaRewardToken = exports.LineaRewardToken || (exports.LineaRewardToken = {}));
exports.priceTokens = [
    OptimismToken.USDC,
    OptimismToken.USDT,
    OptimismToken.sUSD,
    OptimismToken.DAI,
    OptimismHtoken.USDT,
    OptimismHtoken.USDC,
    OptimismHtoken.DAI,
    OptimismHtoken.sUSD,
    XdaiToken.USDC,
    XdaiHtoken.USDC,
    XdaiToken.USDT,
    XdaiHtoken.USDT,
    XdaiToken.DAI,
    XdaiHtoken.DAI,
    PolygonToken.USDC,
    PolygonToken.USDT,
    PolygonHtoken.USDC,
    PolygonHtoken.USDT,
    PolygonToken.DAI,
    PolygonHtoken.DAI,
    ArbitrumToken.USDT,
    ArbitrumToken.USDC,
    ArbitrumHtoken.USDT,
    ArbitrumHtoken.USDC,
    ArbitrumToken.DAI,
    ArbitrumHtoken.DAI,
];
exports.MESSENGER_ADDRESSES = [
    "0x25ace71c97b33cc4729cf772ae268934f7ab5fa1",
    "0x4200000000000000000000000000000000000007",
    "0x4c36d2919e407f0cc2ee3c993ccf8ac26d9ce64e",
    "0x75df5af045d91108662d8080fd1fefad6aa0bb59",
    "0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f", //ARBITRUM_L1
];
exports.OPTIMISM_GENESIS_HASHES = [
    "0x9168732d683634ce7155a8f6cbc6a1798582ccfa830a4351939d7343cbef675f",
    "0xb164734917a3ab5987544d99f6a5875a95bbb30d57c30dfec8db8d13789490ee",
    "0xa392dd41af7be095e026578a0c756e949fbef19a0ca5da6da4cf7ea409fd52f6",
    "0x657e0c1d2500f62f3027c59bd24bf1495e4ecb99ab50739b3d44cdc64a96a289",
    "0xb496953b1c04dd8e6ea5bb009b613870afd7848d56d1f56d7ebbb076bd0916cc",
    "0xee86691a2a4854a472734e98c72c2a8763a7927ba0019d4b4c58d56bd2b3d9bd", //SUSD
];
exports.XDAI_L2_SIGNATURE = "0x5df9cc3eb93d8a9a481857a3b70a8ca966e6b80b25cf0ee2cce180ec5afa80a1"; //XDAI_L2
exports.OPTIMISM_L1_SIGNATURE = "0xcb0f7ffd78f9aee47a248fae8db181db6eee833039123e026dcbff529522e52a"; //OPTIMISM_L1
exports.OPTIMISM_L2_SIGNATURE = "0x4641df4a962071e12719d8c8c8e5ac7fc4d97b927346a3d7a335b1f7517e133c"; //OPTIMISM_L2
exports.XDAI_L1_SIGNATURE = "0x27333edb8bdcd40a0ae944fb121b5e2d62ea782683946654a0f5e607a908d578"; //XDAI_L1
exports.ARBITRUM_L1_SIGNATURE = "0xff64905f73a67fb594e0f940a8075a860db489ad991e032f48c81123eb52d60b"; //ARBITRUM_L1
exports.MESSENGER_EVENT_SIGNATURES = [
    exports.ARBITRUM_L1_SIGNATURE,
    exports.XDAI_L1_SIGNATURE,
    exports.OPTIMISM_L1_SIGNATURE,
    exports.OPTIMISM_L2_SIGNATURE,
    exports.XDAI_L2_SIGNATURE,
];
var RewardTokens;
(function (RewardTokens) {
    RewardTokens.HOP = "0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc";
    RewardTokens.OP = "0x4200000000000000000000000000000000000042";
    RewardTokens.GNO = "0x9c58bacc331c9aa871afd802db6379a98e80cedb";
    RewardTokens.rETH_OP = "0xc81d1f0eb955b0c020e5d5b264e1ff72c14d1401";
    RewardTokens.rETH_ARB = "0xb766039cc6db368759c1e56b79affe831d0cc507";
    RewardTokens.WETH = "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1";
    RewardTokens.WMATIC_POLYGON = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
    RewardTokens.WMATIC_XDAI = "0x7122d7661c4564b7c6cd4878b06766489a6028a2";
})(RewardTokens = exports.RewardTokens || (exports.RewardTokens = {}));
exports.GNO_REWARDS = [
    XdaiRewardToken.DAI_A,
    XdaiRewardToken.USDC_A,
    XdaiRewardToken.USDT_A,
    XdaiRewardToken.ETH_A,
];
exports.HOP_REWARDS = [
    ArbitrumRewardToken.ETH,
    ArbitrumRewardToken.DAI,
    ArbitrumRewardToken.USDC,
    ArbitrumRewardToken.USDT,
    ArbitrumRewardToken.MAGIC,
    ArbitrumNovaRewardToken.MAGIC,
    OptimismRewardToken.DAI,
    OptimismRewardToken.SNX_A,
    OptimismRewardToken.ETH,
    OptimismRewardToken.rETH,
    OptimismRewardToken.sUSD_A,
    OptimismRewardToken.USDC,
    OptimismRewardToken.USDT,
    PolygonRewardToken.ETH_A,
    PolygonRewardToken.USDC_A,
    PolygonRewardToken.USDT_A,
    PolygonRewardToken.DAI_A,
    XdaiRewardToken.DAI_B,
    XdaiRewardToken.USDC_B,
    XdaiRewardToken.ETH_B,
    XdaiRewardToken.USDT_B,
    BaseRewardToken.USDC,
    BaseRewardToken.ETH,
];
exports.OP_REWARDS = [
    OptimismRewardToken.SNX_B,
    OptimismRewardToken.sUSD_B,
];
exports.RPL_REWARDS = [OptimismRewardToken.rETH, ArbitrumRewardToken.rETH];
exports.WMATIC_REWARDS = [
    PolygonRewardToken.USDC_B,
    PolygonRewardToken.USDT_B,
    PolygonRewardToken.DAI_B,
    PolygonRewardToken.MATIC,
    PolygonRewardToken.ETH_B,
];
exports.WETH_REWARDS = [LineaRewardToken.ETH];
exports.SIX_DECIMAL_TOKENS = [
    ArbitrumToken.USDT,
    ArbitrumToken.USDC,
    OptimismToken.USDC,
    OptimismToken.USDT,
    PolygonToken.USDC,
    PolygonToken.USDT,
    XdaiToken.USDT,
    XdaiToken.USDC,
];
