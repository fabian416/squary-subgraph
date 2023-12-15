"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalsIgnoreCase =
  exports.ETH_NAME =
  exports.ETH_SYMBOL =
  exports.UINT256 =
  exports.ADDRESS =
  exports.TRANSFER =
  exports.POOL_PREFIX =
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
  exports.INT_TWENTY_SIX =
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
  exports.TokenType =
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
exports.getNetworkSpecificConstant = exports.NetworkSpecificConstant = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
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
var TokenType;
(function (TokenType) {
  // underlying token created by Axelar, using BURN_MINT
  TokenType.INTERNAL = "INTERNAL";
  // underlying token external to Axelar, using LOCK_RELEASE
  TokenType.EXTERNAL = "EXTERNAL";
})((TokenType = exports.TokenType || (exports.TokenType = {})));
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
exports.INT_TWENTY_SIX = 26;
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
exports.POOL_PREFIX = "Axelar Bridge: ";
exports.TRANSFER = "Transfer(address,address,uint256)";
exports.ADDRESS = "address";
exports.UINT256 = "uint256";
exports.ETH_SYMBOL = "ETH";
exports.ETH_NAME = "Ether";
function equalsIgnoreCase(a, b) {
  return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
///////////////////////////////////////
///// Protocol specific Constants /////
///////////////////////////////////////
class NetworkSpecificConstant {
  constructor(chainId, gasFeeToken, poolAddress) {
    this.chainId = chainId;
    this.gasFeeToken = gasFeeToken;
    this.poolAddress = poolAddress;
  }
  getProtocolId() {
    return this.poolAddress;
  }
  getPoolAddress() {
    return this.poolAddress;
  }
}
exports.NetworkSpecificConstant = NetworkSpecificConstant;
// https://docs.axelar.dev/dev/build/contract-addresses/mainnet
function getNetworkSpecificConstant(chainId = null) {
  let network = graph_ts_1.dataSource.network();
  if (!chainId) {
    chainId = (0, chainIds_1.networkToChainID)(network);
  } else {
    network = (0, chainIds_1.chainIDToNetwork)(chainId);
  }
  if (equalsIgnoreCase(network, Network.MAINNET)) {
    return new NetworkSpecificConstant(
      chainId,
      graph_ts_1.Address.fromString(
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      ), //WETH
      graph_ts_1.Address.fromString(
        "0x4f4495243837681061c4743b74b3eedf548d56a5"
      )
    );
  } else if (equalsIgnoreCase(network, Network.ARBITRUM_ONE)) {
    return new NetworkSpecificConstant(
      chainId,
      graph_ts_1.Address.fromString(
        "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
      ), //WETH
      graph_ts_1.Address.fromString(
        "0xe432150cce91c13a887f7d836923d5597add8e31"
      )
    );
  } else if (equalsIgnoreCase(network, Network.AVALANCHE)) {
    return new NetworkSpecificConstant(
      chainId,
      graph_ts_1.Address.fromString(
        "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"
      ),
      graph_ts_1.Address.fromString(
        "0x5029c0eff6c34351a0cec334542cdb22c7928f78"
      )
    );
  } else if (equalsIgnoreCase(network, Network.BSC)) {
    return new NetworkSpecificConstant(
      chainId,
      graph_ts_1.Address.fromString(
        "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"
      ),
      graph_ts_1.Address.fromString(
        "0x304acf330bbe08d1e512eefaa92f6a57871fd895"
      )
    );
  } else if (equalsIgnoreCase(network, Network.CELO)) {
    return new NetworkSpecificConstant(
      chainId,
      graph_ts_1.Address.fromString(
        "0x471ece3750da237f93b8e339c536989b8978a438"
      ),
      graph_ts_1.Address.fromString(
        "0xe432150cce91c13a887f7d836923d5597add8e31"
      )
    );
  } else if (equalsIgnoreCase(network, Network.FANTOM)) {
    return new NetworkSpecificConstant(
      chainId,
      graph_ts_1.Address.fromString(
        "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"
      ),
      graph_ts_1.Address.fromString(
        "0x304acf330bbe08d1e512eefaa92f6a57871fd895"
      )
    );
  } else if (equalsIgnoreCase(network, Network.KAVA)) {
    return new NetworkSpecificConstant(
      chainId,
      graph_ts_1.Address.fromString(
        "0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b"
      ),
      graph_ts_1.Address.fromString(
        "0x2d5d7d31f671f86c782533cc367f14109a082712"
      )
    );
  } else if (equalsIgnoreCase(network, Network.MATIC)) {
    return new NetworkSpecificConstant(
      chainId,
      graph_ts_1.Address.fromString(
        "0x0000000000000000000000000000000000001010"
      ),
      graph_ts_1.Address.fromString(
        "0x6f015f16de9fc8791b234ef68d486d2bf203fba8"
      )
    );
  } else if (equalsIgnoreCase(network, Network.MOONBEAM)) {
    return new NetworkSpecificConstant(
      chainId,
      graph_ts_1.Address.fromString(
        "0xacc15dc74880c9944775448304b263d191c6077f"
      ),
      graph_ts_1.Address.fromString(
        "0x4f4495243837681061c4743b74b3eedf548d56a5"
      )
    );
  }
  graph_ts_1.log.error("[getNetworkSpecificConstant] Unsupported network: {}", [
    network,
  ]);
  return new NetworkSpecificConstant(
    (0, chainIds_1.networkToChainID)(Network.UNKNOWN_NETWORK),
    graph_ts_1.Address.zero(),
    graph_ts_1.Address.zero()
  );
}
exports.getNetworkSpecificConstant = getNetworkSpecificConstant;
