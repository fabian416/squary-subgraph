"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETH_DECIMALS =
  exports.comptrollerAddr =
  exports.USDC_DECIMALS =
  exports.PROTOCOL_SLUG =
  exports.PROTOCOL_NAME =
  exports.CTUSD_ADDRESS =
  exports.CUSDT_ADDRESS =
  exports.CCOMP_ADDRESS =
  exports.COMP_ADDRESS =
  exports.CETH_ADDRESS =
  exports.CUSDC_ADDRESS =
  exports.USDC_ADDRESS =
  exports.SAI_ADDRESS =
  exports.PRICE_ORACLE1_ADDRESS =
  exports.COMPTROLLER_ADDRESS =
  exports.ETH_SYMBOL =
  exports.ETH_NAME =
  exports.ETH_ADDRESS =
  exports.ZERO_ADDRESS =
  exports.AccountActiity =
  exports.TransactionType =
  exports.InterestRateSide =
  exports.InterestRateType =
  exports.RiskType =
  exports.LendingType =
  exports.RewardTokenType =
  exports.ProtocolType =
  exports.Network =
    void 0;
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
  Network.UNKNOWN_NETWORK = "UNKNOWN_NETWORK";
})((Network = exports.Network || (exports.Network = {})));
var ProtocolType;
(function (ProtocolType) {
  ProtocolType.EXCHANGE = "EXCHANGE";
  ProtocolType.LENDING = "LENDING";
  ProtocolType.YIELD = "YIELD";
  ProtocolType.BRIDGE = "BRIDGE";
  ProtocolType.GENERIC = "GENERIC";
})((ProtocolType = exports.ProtocolType || (exports.ProtocolType = {})));
var RewardTokenType;
(function (RewardTokenType) {
  RewardTokenType.DEPOSIT = "DEPOSIT";
  RewardTokenType.BORROW = "BORROW";
})(
  (RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}))
);
var LendingType;
(function (LendingType) {
  LendingType.CDP = "CDP";
  LendingType.POOLED = "POOLED";
})((LendingType = exports.LendingType || (exports.LendingType = {})));
var RiskType;
(function (RiskType) {
  RiskType.GLOBAL = "GLOBAL";
  RiskType.ISOLATED = "ISOLATED";
})((RiskType = exports.RiskType || (exports.RiskType = {})));
var InterestRateType;
(function (InterestRateType) {
  InterestRateType.STABLE = "STABLE";
  InterestRateType.VARIABLE = "VARIABLE";
  InterestRateType.FIXED = "FIXED";
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
var TransactionType;
(function (TransactionType) {
  TransactionType.DEPOSIT = "DEPOSIT";
  TransactionType.WITHDRAW = "WITHDRAW";
  TransactionType.BORROW = "BORROW";
  TransactionType.REPAY = "REPAY";
  TransactionType.LIQUIDATE = "LIQUIDATE";
})(
  (TransactionType = exports.TransactionType || (exports.TransactionType = {}))
);
var AccountActiity;
(function (AccountActiity) {
  AccountActiity.DAILY = "DAILY";
  AccountActiity.HOURLY = "HOURLY";
})((AccountActiity = exports.AccountActiity || (exports.AccountActiity = {})));
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
exports.ETH_NAME = "Ether";
exports.ETH_SYMBOL = "ETH";
exports.COMPTROLLER_ADDRESS = "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b";
exports.PRICE_ORACLE1_ADDRESS = "0x02557a5e05defeffd4cae6d83ea3d173b272c904";
exports.SAI_ADDRESS = "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359";
exports.USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
exports.CUSDC_ADDRESS = "0x39aa39c021dfbae8fac545936693ac917d5e7563";
exports.CETH_ADDRESS = "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5";
exports.COMP_ADDRESS = "0xc00e94cb662c3520282e6f5717214004a7f26888";
exports.CCOMP_ADDRESS = "0x70e36f6bf80a52b3b46b3af8e106cc0ed743e8e4";
exports.CUSDT_ADDRESS = "0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9";
exports.CTUSD_ADDRESS = "0x12392f67bdf24fae0af363c24ac620a2f67dad86";
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.PROTOCOL_NAME = "Compound v2";
exports.PROTOCOL_SLUG = "compound-v2";
exports.USDC_DECIMALS = 6;
exports.comptrollerAddr = graph_ts_1.Address.fromString(
  exports.COMPTROLLER_ADDRESS
);
exports.ETH_DECIMALS = 18;
