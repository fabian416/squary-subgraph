"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkSpecificConstant =
  exports.getOrCreateGasFeeToken =
  exports.NetworkSpecificConstant =
  exports.PoolName =
  exports.equalsIgnoreCase =
  exports.ETH_NAME =
  exports.ETH_SYMBOL =
  exports.MS_PER_YEAR =
  exports.DAYS_PER_YEAR =
  exports.MS_PER_DAY =
  exports.SECONDS_PER_HOUR_BI =
  exports.SECONDS_PER_DAY_BI =
  exports.SECONDS_PER_HOUR =
  exports.SECONDS_PER_DAY =
  exports.MAX_UINT =
  exports.BIGDECIMAL_MINUS_ONE =
  exports.BIGDECIMAL_HUNDRED =
  exports.BIGDECIMAL_TWO =
  exports.BIGDECIMAL_ONE =
  exports.BIGDECIMAL_ZERO =
  exports.INT_FOUR =
  exports.INT_TWO =
  exports.INT_ONE =
  exports.INT_ZERO =
  exports.INT_NEGATIVE_ONE =
  exports.BIGINT_MAX =
  exports.BIGINT_MINUS_ONE =
  exports.BIGINT_TEN_TO_EIGHTEENTH =
  exports.BIGINT_THOUSAND =
  exports.BIGINT_HUNDRED =
  exports.BIGINT_TWO =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.USDC_DENOMINATOR =
  exports.USDC_DECIMALS =
  exports.DEFAULT_DECIMALS =
  exports.ETH_ADDRESS =
  exports.ZERO_ADDRESS =
  exports.UsageType =
  exports.InterestRateSide =
  exports.InterestRateType =
  exports.RiskType =
  exports.LendingType =
  exports.RewardTokenType =
  exports.LiquidityPoolFeeType =
  exports.VaultFeeType =
  exports.ProtocolType =
  exports.Network =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const chainIds_1 = require("../protocols/bridge/chainIds");
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
var VaultFeeType;
(function (VaultFeeType) {
  VaultFeeType.MANAGEMENT_FEE = "MANAGEMENT_FEE";
  VaultFeeType.PERFORMANCE_FEE = "PERFORMANCE_FEE";
  VaultFeeType.DEPOSIT_FEE = "DEPOSIT_FEE";
  VaultFeeType.WITHDRAWAL_FEE = "WITHDRAWAL_FEE";
})((VaultFeeType = exports.VaultFeeType || (exports.VaultFeeType = {})));
var LiquidityPoolFeeType;
(function (LiquidityPoolFeeType) {
  LiquidityPoolFeeType.FIXED_TRADING_FEE = "FIXED_TRADING_FEE";
  LiquidityPoolFeeType.TIERED_TRADING_FEE = "TIERED_TRADING_FEE";
  LiquidityPoolFeeType.DYNAMIC_TRADING_FEE = "DYNAMIC_TRADING_FEE";
  LiquidityPoolFeeType.FIXED_LP_FEE = "FIXED_LP_FEE";
  LiquidityPoolFeeType.DYNAMIC_LP_FEE = "DYNAMIC_LP_FEE";
  LiquidityPoolFeeType.FIXED_PROTOCOL_FEE = "FIXED_PROTOCOL_FEE";
  LiquidityPoolFeeType.DYNAMIC_PROTOCOL_FEE = "DYNAMIC_PROTOCOL_FEE";
})(
  (LiquidityPoolFeeType =
    exports.LiquidityPoolFeeType || (exports.LiquidityPoolFeeType = {}))
);
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
  InterestRateType.FIXED_TERM = "FIXED_TERM";
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
var UsageType;
(function (UsageType) {
  UsageType.DEPOSIT = "DEPOSIT";
  UsageType.WITHDRAW = "WITHDRAW";
  UsageType.SWAP = "SWAP";
})((UsageType = exports.UsageType || (exports.UsageType = {})));
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
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
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.BIGDECIMAL_MINUS_ONE = new graph_ts_1.BigDecimal(
  exports.BIGINT_MINUS_ONE
);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(
  graph_ts_1.BigInt.fromI32(255)
);
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.SECONDS_PER_DAY_BI = graph_ts_1.BigInt.fromI32(exports.SECONDS_PER_DAY);
exports.SECONDS_PER_HOUR_BI = graph_ts_1.BigInt.fromI32(
  exports.SECONDS_PER_HOUR
);
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)
);
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(365)
);
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(
  new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000))
);
////////////////
///// Misc /////
////////////////
exports.ETH_SYMBOL = "ETH";
exports.ETH_NAME = "Ether";
function equalsIgnoreCase(a, b) {
  return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
///////////////////////////////////////
///// Protocol specific Constants /////
///////////////////////////////////////
var PoolName;
(function (PoolName) {
  PoolName.PoolBasedBridge = "PoolBasedBridge";
  PoolName.OriginalTokenVault = "OriginalTokenVault";
  PoolName.OriginalTokenVaultV2 = "OriginalTokenVaultV2";
  PoolName.PeggedTokenBridge = "PeggedTokenBridge";
  PoolName.PeggedTokenBridgeV2 = "PeggedTokenBridgeV2";
})((PoolName = exports.PoolName || (exports.PoolName = {})));
class NetworkSpecificConstant {
  constructor(
    chainId,
    gasFeeToken,
    // assume protocolId is the address of pool-based bridge
    //public readonly protocolId: Bytes,
    poolBasedBridge,
    originalTokenVault,
    originalTokenVaultV2,
    peggedTokenBridge,
    peggedTokenBridgeV2
  ) {
    this.chainId = chainId;
    this.gasFeeToken = gasFeeToken;
    this.poolBasedBridge = poolBasedBridge;
    this.originalTokenVault = originalTokenVault;
    this.originalTokenVaultV2 = originalTokenVaultV2;
    this.peggedTokenBridge = peggedTokenBridge;
    this.peggedTokenBridgeV2 = peggedTokenBridgeV2;
  }
  getProtocolId() {
    return this.poolBasedBridge;
  }
  getPoolAddress(poolName) {
    if (poolName == PoolName.OriginalTokenVault) return this.originalTokenVault;
    if (poolName == PoolName.OriginalTokenVaultV2)
      return this.originalTokenVaultV2;
    if (poolName == PoolName.PeggedTokenBridge) return this.peggedTokenBridge;
    if (poolName == PoolName.PeggedTokenBridgeV2)
      return this.peggedTokenBridgeV2;
    if (poolName == PoolName.PoolBasedBridge) return this.poolBasedBridge;
    return this.poolBasedBridge;
  }
}
exports.NetworkSpecificConstant = NetworkSpecificConstant;
function getOrCreateGasFeeToken(id, name, symbol, decimals) {
  let token = schema_1.Token.load(id);
  if (token) {
    return token;
  }
  token = new schema_1.Token(id);
  token.name = name;
  token.symbol = symbol;
  token.decimals = decimals;
  token.save();
  return token;
}
exports.getOrCreateGasFeeToken = getOrCreateGasFeeToken;
// https://cbridge-docs.celer.network/reference/contract-addresses
function getNetworkSpecificConstant(chainId = null) {
  let network = graph_ts_1.dataSource.network();
  if (!chainId) {
    chainId = (0, chainIds_1.networkToChainID)(network);
  } else {
    network = (0, chainIds_1.chainIDToNetwork)(chainId);
  }
  // default gas token
  const gasFeeToken = getOrCreateGasFeeToken(
    graph_ts_1.Address.zero(),
    `Gas fee token ${network}`,
    "Unknown",
    18
  );
  if (equalsIgnoreCase(network, Network.MAINNET)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(exports.ETH_ADDRESS),
        exports.ETH_NAME,
        exports.ETH_SYMBOL,
        18
      ),
      graph_ts_1.Address.fromString(
        "0x5427fefa711eff984124bfbb1ab6fbf5e3da1820"
      ),
      graph_ts_1.Address.fromString(
        "0xb37d31b2a74029b5951a2778f959282e2d518595"
      ),
      graph_ts_1.Address.fromString(
        "0x7510792a3b1969f9307f3845ce88e39578f2bae1"
      ),
      graph_ts_1.Address.fromString(
        "0x16365b45eb269b5b5dacb34b4a15399ec79b95eb"
      ),
      graph_ts_1.Address.fromString(
        "0x52e4f244f380f8fa51816c8a10a63105dd4de084"
      )
    );
  } else if (equalsIgnoreCase(network, Network.ARB_NOVA)) {
    return new NetworkSpecificConstant(
      chainId,
      gasFeeToken,
      graph_ts_1.Address.fromString(
        "0xb3833ecd19d4ff964fa7bc3f8ac070ad5e360e56"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero()
    );
  } else if (equalsIgnoreCase(network, Network.ARBITRUM_ONE)) {
    return new NetworkSpecificConstant(
      chainId,
      gasFeeToken,
      graph_ts_1.Address.fromString(
        "0x1619de6b6b20ed217a58d00f37b9d47c7663feca"
      ),
      graph_ts_1.Address.fromString(
        "0xfe31bfc4f7c9b69246a6dc0087d91a91cb040f76"
      ),
      graph_ts_1.Address.fromString(
        "0xea4b1b0aa3c110c55f650d28159ce4ad43a4a58b"
      ),
      graph_ts_1.Address.fromString(
        "0xbdd2739ae69a054895be33a22b2d2ed71a1de778"
      ),
      graph_ts_1.Address.zero()
    );
  } else if (equalsIgnoreCase(network, Network.ASTAR)) {
    return new NetworkSpecificConstant(
      chainId,
      gasFeeToken,
      graph_ts_1.Address.fromString(
        "0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"
      ),
      graph_ts_1.Address.fromString(
        "0xbcfef6bb4597e724d720735d32a9249e0640aa11"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0xbb7684cc5408f4dd0921e5c2cadd547b8f1ad573"
      ),
      graph_ts_1.Address.fromString(
        "0x3b53d2c7b44d40be05fa5e2309ffeb6eb2492d88"
      )
    );
  } else if (equalsIgnoreCase(network, Network.AURORA)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0xaaaaaa20d9e0e2461697782ef11675f668207961"
        ),
        "Aurora",
        "AURORA",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0xbcfef6bb4597e724d720735d32a9249e0640aa11"
      ),
      graph_ts_1.Address.fromString(
        "0x4384d5a9d7354c65ce3aee411337bd40493ad1bc"
      ),
      graph_ts_1.Address.fromString(
        "0xbdd2739ae69a054895be33a22b2d2ed71a1de778"
      )
    );
  } else if (equalsIgnoreCase(network, Network.AVALANCHE)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x85f138bfee4ef8e540890cfb48f620571d67eda3"
        ),
        // Real address is non-EVM compatible
        //Address.fromString("FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z"),
        "Avalanche",
        "AVAX",
        9
      ),
      graph_ts_1.Address.fromString(
        "0xef3c714c9425a8f3697a9c969dc1af30ba82e5d4"
      ),
      graph_ts_1.Address.fromString(
        "0x5427fefa711eff984124bfbb1ab6fbf5e3da1820"
      ),
      graph_ts_1.Address.fromString(
        "0xb51541df05de07be38dcfc4a80c05389a54502bb"
      ),
      graph_ts_1.Address.fromString(
        "0x88dcdc47d2f83a99cf0000fdf667a468bb958a78"
      ),
      graph_ts_1.Address.fromString(
        "0xb774c6f82d1d5dbd36894762330809e512fed195"
      )
    );
  } else if (equalsIgnoreCase(network, Network.BSC)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x242a1ff6ee06f2131b7924cacb74c7f9e3a5edc9"
        ),
        "BNB Token",
        "BNB",
        18
      ),
      graph_ts_1.Address.fromString(
        "0xdd90e5e87a2081dcf0391920868ebc2ffb81a1af"
      ),
      graph_ts_1.Address.fromString(
        "0x78bc5ee9f11d133a08b331c2e18fe81be0ed02dc"
      ),
      graph_ts_1.Address.fromString(
        "0x11a0c9270d88c99e221360bca50c2f6fda44a980"
      ),
      graph_ts_1.Address.fromString(
        "0xd443fe6bf23a4c9b78312391a30ff881a097580e"
      ),
      graph_ts_1.Address.fromString(
        "0x26c76f7fef00e02a5dd4b5cc8a0f717eb61e1e4b"
      )
    );
  } else if (equalsIgnoreCase(network, Network.BOBA)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x42bbfa2e77757c645eeaad1655e0911a7553efbc"
        ),
        "Boba Token",
        "BOBA",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"
      ),
      graph_ts_1.Address.fromString(
        "0x8db213be5268a2b8b78af08468ff1ea422073da0"
      ),
      graph_ts_1.Address.fromString(
        "0x4c882ec256823ee773b25b414d36f92ef58a7c0c"
      ),
      graph_ts_1.Address.fromString(
        "0xc5ef662b833de914b9ba7a3532c6bb008a9b23a6"
      ),
      graph_ts_1.Address.zero()
    );
  } else if (equalsIgnoreCase(network, Network.CELO)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x471ece3750da237f93b8e339c536989b8978a438"
        ),
        "Celo Token",
        "CELO",
        18
      ),
      graph_ts_1.Address.fromString(
        "0xbb7684cc5408f4dd0921e5c2cadd547b8f1ad573"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0xda1dd66924b0470501ac7736372d4171cdd1162e"
      ),
      graph_ts_1.Address.zero()
    );
  } /* //Clover, Conflux, and Crab Smart Chain are not included in Network
    else if (equalsIgnoreCase(network, Network.CLOVER)) {
      return new NetworkSpecificConstant(
        chainId,
        Address.fromString("0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"),
        Address.zero(),
        Address.zero(),
        Address.zero(),
        Address.fromString("0x3b53d2c7b44d40be05fa5e2309ffeb6eb2492d88")
      );
    } else if (equalsIgnoreCase(network, Network.CONFLUX)) {
      return new NetworkSpecificConstant(
        chainId,
        Address.fromString("0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"),
        Address.zero(),
        Address.zero(),
        Address.zero(),
        Address.fromString("0x3b53d2c7b44d40be05fa5e2309ffeb6eb2492d88")
      );
    } else if (equalsIgnoreCase(network, Network.CRAB)) {
      return new NetworkSpecificConstant(
        chainId,
        Address.fromString("0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"),
        Address.zero(),
        Address.zero(),
        Address.zero(),
        Address.fromString("0x3b53d2c7b44d40be05fa5e2309ffeb6eb2492d88")
      );
    } */ else if (equalsIgnoreCase(network, Network.EVMOS)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0xbf183e0d2f06872e10f5dbec745999adfcb5f000"
        ),
        "EVMOS",
        "EVMOS",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x5f52b9d1c0853da636e178169e6b426e4ccfa813"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0xc1d6e421a062fdbb26c31db4a2113df0f678cd04"
      )
    );
  } else if (equalsIgnoreCase(network, Network.FANTOM)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x4e15361fd6b4bb609fa63c81a2be19d873717870"
        ),
        "Fantom Token",
        "FTM",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x374b8a9f3ec5eb2d97eca84ea27aca45aa1c57ef"
      ),
      graph_ts_1.Address.fromString(
        "0x7d91603e79ea89149baf73c9038c51669d8f03e9"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0x38d1e20b0039bfbeef4096be00175227f8939e51"
      ),
      graph_ts_1.Address.fromString(
        "0x30f7aa65d04d289ce319e88193a33a8eb1857fb9"
      )
    );
  } /* // non-EVM chain not supported
    else if (equalsIgnoreCase(network, Network.FLOW)) {
      return new NetworkSpecificConstant(
        chainId,
        "A.08dd120226ec2213.cBridge",
        "A.08dd120226ec2213.SafeBox",
        Address.zero(),
        Address.zero(),
        "A.08dd120226ec2213.PegBridge"
      );
    } */ else if (equalsIgnoreCase(network, Network.XDAI)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(graph_ts_1.Address.zero(), "xDAI", "xDAI", 18),
      graph_ts_1.Address.fromString(
        "0x3795c36e7d12a8c252a20c5a7b455f7c57b60283"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0xd4c058380d268d85bc7c758072f561e8f2db5975"
      ),
      graph_ts_1.Address.zero()
    );
  } else if (equalsIgnoreCase(network, Network.HARMONY)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x799a4202c12ca952cb311598a024c80ed371a41e"
        ),
        "Harmony One",
        "ONE",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x78a21c1d3ed53a82d4247b9ee5bf001f4620ceec"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0xdd90e5e87a2081dcf0391920868ebc2ffb81a1af"
      ),
      graph_ts_1.Address.zero()
    );
  } else if (equalsIgnoreCase(network, Network.HECO)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(graph_ts_1.Address.zero(), "HECO Token", "HT", 18),
      graph_ts_1.Address.fromString(
        "0xbb7684cc5408f4dd0921e5c2cadd547b8f1ad573"
      ),
      graph_ts_1.Address.fromString(
        "0x5d96d4287d1ff115ee50fac0526cf43ecf79bfc6"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c"
      ),
      graph_ts_1.Address.zero()
    );
  } else if (equalsIgnoreCase(network, Network.KAVA)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0xb66a437693992d9c94f0c315270f869c016432b9"
        ),
        "Kava Token",
        "KAVA",
        18
      ),
      graph_ts_1.Address.fromString(
        "0xb51541df05de07be38dcfc4a80c05389a54502bb"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0xf8bf9988206c4de87f52a3c24486e4367b7088cb"
      )
    );
  } else if (equalsIgnoreCase(network, Network.KLAYTN)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x393126c0653f49e079500cc0f218a27c793136a0"
        ),
        "Klaytn Token",
        "KLAY",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x4c882ec256823ee773b25b414d36f92ef58a7c0c"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0xb3833ecd19d4ff964fa7bc3f8ac070ad5e360e56"
      )
    );
  } else if (equalsIgnoreCase(network, Network.MATIC)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x0000000000000000000000000000000000001010"
        ),
        "Matic Token",
        "MATIC",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0x3bbadff9aeee4a74d3cf6da05c30868c9ff85bb8"
      ),
      graph_ts_1.Address.fromString(
        "0xb3833ecd19d4ff964fa7bc3f8ac070ad5e360e56"
      )
    );
  } /* // Milkomeda Cardano is not included in Network
    else if (equalsIgnoreCase(network, Network.MILKOMEDA)) {
      return new NetworkSpecificConstant(
        chainId,
        Address.fromString("0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"),
        Address.zero(),
        Address.fromString("0xb51541df05de07be38dcfc4a80c05389a54502bb"),
        Address.fromString("0x3b53d2c7b44d40be05fa5e2309ffeb6eb2492d88"),
        Address.fromString("0x3b53d2c7b44d40be05fa5e2309ffeb6eb2492d88")
      );
    } */ else if (equalsIgnoreCase(network, Network.MOONBEAM)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x017be64db48dfc962221c984b9a6937a5d09e81a"
        ),
        "Moonbeam Token",
        "GLMR",
        9
      ),
      graph_ts_1.Address.fromString(
        "0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0xbb7684cc5408f4dd0921e5c2cadd547b8f1ad573"
      ),
      graph_ts_1.Address.fromString(
        "0x3b53d2c7b44d40be05fa5e2309ffeb6eb2492d88"
      )
    );
  } else if (equalsIgnoreCase(network, Network.MOONRIVER)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0xaa4483bd555f6cddfe34c2ee6a5a798e5c75775a"
        ),
        "Moonriver Token",
        "MOVR",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0x374b8a9f3ec5eb2d97eca84ea27aca45aa1c57ef"
      ),
      graph_ts_1.Address.zero()
    );
  } else if (equalsIgnoreCase(network, Network.GODWOKEN)) {
    return new NetworkSpecificConstant(
      chainId,
      gasFeeToken,
      graph_ts_1.Address.fromString(
        "0x4c882ec256823ee773b25b414d36f92ef58a7c0c"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0xb3833ecd19d4ff964fa7bc3f8ac070ad5e360e56"
      ),
      graph_ts_1.Address.fromString(
        "0xb3833ecd19d4ff964fa7bc3f8ac070ad5e360e56"
      )
    );
  } else if (equalsIgnoreCase(network, Network.OKEXCHAIN)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0xe302bf71b1f6f3024e7642f9c824ac86b58436a0"
        ),
        "OKEx Token",
        "OKB",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x6a2d262d56735dba19dd70682b39f6be9a931d98"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0x48284eb583a1f3058f4bce0a685d44fe29d4539e"
      ),
      graph_ts_1.Address.zero()
    );
  } else if (equalsIgnoreCase(network, Network.OASIS)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x30589d7c60490c72c2452a04f4d1a95653ba056f"
        ),
        "Oasis Token",
        "OAC",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0xbb7684cc5408f4dd0921e5c2cadd547b8f1ad573"
      ),
      graph_ts_1.Address.fromString(
        "0x3b53d2c7b44d40be05fa5e2309ffeb6eb2492d88"
      )
    );
  } /* // ONTOLOGY is not included in Network
    else if (equalsIgnoreCase(network, Network.ONTOLOGY)) {
      return new NetworkSpecificConstant(
        chainId,
        Address.fromString("0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"),
        Address.zero(),
        Address.zero(),
        Address.fromString("0xd4c058380d268d85bc7c758072f561e8f2db5975"),
        Address.fromString("0xd4c058380d268d85bc7c758072f561e8f2db5975")
      );
    } */ else if (equalsIgnoreCase(network, Network.OPTIMISM)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0xb2ea9527bf05bc3b73320a1ec18bd4f2fe88d952"
        ),
        "Optimism Token",
        "OP",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x9d39fc627a6d9d9f8c831c16995b209548cc3401"
      ),
      graph_ts_1.Address.fromString(
        "0xbcfef6bb4597e724d720735d32a9249e0640aa11"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0x61f85ff2a2f4289be4bb9b72fc7010b3142b5f41"
      ),
      graph_ts_1.Address.zero()
    );
  } /* // PlatON is not included in Network
    else if (equalsIgnoreCase(network, Network.PLATON)) {
      return new NetworkSpecificConstant(
        chainId,
        Address.fromString("0xbf2b2757f0b2a2f70136c4a6627e99d8ec5cc7b9"),
        Address.zero(),
        Address.zero(),
        Address.fromString("0xd340bc3ec35e63bcf929c5a9ad3ae5b1ebdbe678"),
        Address.fromString("0xd340bc3ec35e63bcf929c5a9ad3ae5b1ebdbe678")
      );
    } */ else if (equalsIgnoreCase(network, Network.METIS)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x9e32b13ce7f2e80a01932b42553652e053d6ed8e"
        ),
        "Metis Token",
        "METIS",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x88dcdc47d2f83a99cf0000fdf667a468bb958a78"
      ),
      graph_ts_1.Address.fromString(
        "0xc1a2d967dfaa6a10f3461bc21864c23c1dd51eea"
      ),
      graph_ts_1.Address.fromString(
        "0x4c882ec256823ee773b25b414d36f92ef58a7c0c"
      ),
      graph_ts_1.Address.fromString(
        "0x4d58fdc7d0ee9b674f49a0ade11f26c3c9426f7a"
      ),
      graph_ts_1.Address.fromString(
        "0xb51541df05de07be38dcfc4a80c05389a54502bb"
      )
    );
  } else if (equalsIgnoreCase(network, Network.REI)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x3e9d9124596af6d8faaefc9b3e07b3ce397d34f7"
        ),
        "REI Token",
        "REIT",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0x9b36f165bab9ebe611d491180418d8de4b8f3a1f"
      ),
      graph_ts_1.Address.fromString(
        "0x9b36f165bab9ebe611d491180418d8de4b8f3a1f"
      )
    );
  } else if (equalsIgnoreCase(network, Network.SX)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x99fe3b1391503a1bc1788051347a1324bff41452"
        ),
        "SX Network Token",
        "SX",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x9b36f165bab9ebe611d491180418d8de4b8f3a1f"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.fromString(
        "0x9bb46d5100d2db4608112026951c9c965b233f4d"
      ),
      graph_ts_1.Address.fromString(
        "0x9bb46d5100d2db4608112026951c9c965b233f4d"
      )
    );
  } else if (equalsIgnoreCase(network, Network.SHIDEN)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x00e856ee945a49bb73436e719d96910cd9d116a4"
        ),
        "SHIDEN Token",
        "SDN",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"
      ),
      graph_ts_1.Address.fromString(
        "0xbb7684cc5408f4dd0921e5c2cadd547b8f1ad573"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero()
    );
  } /* // SWIMMER Network is not included in Network
    else if (equalsIgnoreCase(network, Network.SWIMMER)) {
      return new NetworkSpecificConstant(
        chainId,
        Address.fromString("0xb51541df05de07be38dcfc4a80c05389a54502bb"),
        Address.zero(),
        Address.zero(),
        Address.fromString("0xf8bf9988206c4de87f52a3c24486e4367b7088cb"),
        Address.fromString("0xf8bf9988206c4de87f52a3c24486e4367b7088cb")
      );
    }*/ else if (equalsIgnoreCase(network, Network.SYSCOIN)) {
    return new NetworkSpecificConstant(
      chainId,
      getOrCreateGasFeeToken(
        graph_ts_1.Address.fromString(
          "0x3a0d746b3ea1d8ccdf19ad915913bd68391133ca"
        ),
        "Syscoin Token",
        "SYSX",
        18
      ),
      graph_ts_1.Address.fromString(
        "0x841ce48f9446c8e281d3f1444cb859b4a6d0738c"
      ),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero(),
      graph_ts_1.Address.zero()
    );
  }
  graph_ts_1.log.error("[getNetworkSpecificConstant] Unsupported network: {}", [
    network,
  ]);
  return new NetworkSpecificConstant(
    (0, chainIds_1.networkToChainID)(Network.UNKNOWN_NETWORK),
    gasFeeToken,
    graph_ts_1.Address.zero(),
    graph_ts_1.Address.zero(),
    graph_ts_1.Address.zero(),
    graph_ts_1.Address.zero(),
    graph_ts_1.Address.zero()
  );
}
exports.getNetworkSpecificConstant = getNetworkSpecificConstant;
