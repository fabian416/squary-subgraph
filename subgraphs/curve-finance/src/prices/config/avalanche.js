"use strict";
/* eslint-disable @typescript-eslint/no-magic-numbers */
Object.defineProperty(exports, "__esModule", { value: true });
exports.config =
  exports.WHITELISTED_TOKENS =
  exports.HARDCODED_STABLES =
  exports.SUSHI_CALCULATIONS_BLACKSLIST =
  exports.CURVE_CALCULATIONS_BLACKSLIST =
  exports.AAVE_ORACLE_BLACKLIST =
  exports.INCH_ORACLE_BLACKLIST =
  exports.YEARN_LENS_BLACKLIST =
  exports.UNISWAP_FORKS_ROUTER_ADDRESSES =
  exports.CURVE_REGISTRY_ADDRESSES =
  exports.AAVE_ORACLE_CONTRACT_ADDRESS =
  exports.INCH_ORACLE_CONTRACT_ADDRESS =
  exports.NETWORK_STRING =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("../common/types");
exports.NETWORK_STRING = "avalanche";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.INCH_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(
  graph_ts_1.Address.fromString("0xbd0c7aaf0bf082712ebe919a9dd94b2d978f79a9"),
  graph_ts_1.BigInt.fromI32(8608685)
);
exports.AAVE_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(
  graph_ts_1.Address.fromString("0xebd36016b3ed09d4693ed4251c67bd858c3c7c9c"),
  graph_ts_1.BigInt.fromI32(0)
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_REGISTRY_ADDRESSES = [
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0x8474ddbe98f5aa3179b3b3f5942d724afcdec9f6"),
    graph_ts_1.BigInt.fromI32(5254206)
  ),
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0x90f421832199e93d01b64daf378b183809eb0988"),
    graph_ts_1.BigInt.fromI32(9384663)
  ),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0x60ae616a2155ee3d9a68541ba4544862310933d4"), // TraderJOE
    graph_ts_1.BigInt.fromI32(2486393)
  ),
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0xe54ca86531e17ef3616d22ca28b0d458b6c89106"), // Pangolin
    graph_ts_1.BigInt.fromI32(56879)
  ),
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"), // SushiSwap
    graph_ts_1.BigInt.fromI32(506236)
  ),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// BLACKLISTED TOKENS ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_BLACKLIST = [];
exports.INCH_ORACLE_BLACKLIST = [];
exports.AAVE_ORACLE_BLACKLIST = [];
exports.CURVE_CALCULATIONS_BLACKSLIST = [];
exports.SUSHI_CALCULATIONS_BLACKSLIST = [];
///////////////////////////////////////////////////////////////////////////
//////////////////////////// HARDCODED STABLES ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.HARDCODED_STABLES = [
  graph_ts_1.Address.fromString("0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee"),
  graph_ts_1.Address.fromString("0xfab550568c688d5d8a52c7d794cb93edc26ec0ec"),
  graph_ts_1.Address.fromString("0xc5fa5669e326da8b2c35540257cd48811f40a36b"),
  graph_ts_1.Address.fromString("0x6ab707aca953edaefbc4fd23ba73294241490620"),
  graph_ts_1.Address.fromString("0x6807ed4369d9399847f306d7d835538915fa749d"),
  graph_ts_1.Address.fromString("0x18cb11c9f2b6f45a7ac0a95efd322ed4cf9eeebf"),
  graph_ts_1.Address.fromString("0x943df430f7f9f734ec7625b561dc5e17a173adf8"),
  graph_ts_1.Address.fromString("0x025ab35ff6abcca56d57475249baaeae08419039"),
  graph_ts_1.Address.fromString("0x28690ec942671ac8d9bc442b667ec338ede6dfd3"),
  graph_ts_1.Address.fromString("0x1337bedc9d22ecbe766df105c9623922a27963ec"), // av3CRV
];
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.WHITELISTED_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELISTED_TOKENS.set(
  "USDC",
  types_1.TokenInfo.set(
    "USDC",
    6,
    graph_ts_1.Address.fromString("0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664")
  )
);
exports.WHITELISTED_TOKENS.set(
  "USDT",
  types_1.TokenInfo.set(
    "USDT",
    6,
    graph_ts_1.Address.fromString("0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7")
  )
);
exports.WHITELISTED_TOKENS.set(
  "DAI",
  types_1.TokenInfo.set(
    "DAI",
    18,
    graph_ts_1.Address.fromString("0xd586e7f844cea2f87f50152665bcbc2c279d8d70")
  )
);
exports.WHITELISTED_TOKENS.set(
  "WETH",
  types_1.TokenInfo.set(
    "WETH",
    18,
    graph_ts_1.Address.fromString("0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab")
  )
);
exports.WHITELISTED_TOKENS.set(
  "NATIVE_TOKEN",
  types_1.TokenInfo.set(
    "WAVAX",
    18,
    graph_ts_1.Address.fromString("0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7")
  )
);
class config {
  yearnLens() {
    return null;
  }
  yearnLensBlacklist() {
    return exports.YEARN_LENS_BLACKLIST;
  }
  inchOracle() {
    return exports.INCH_ORACLE_CONTRACT_ADDRESS;
  }
  inchOracleBlacklist() {
    return exports.INCH_ORACLE_BLACKLIST;
  }
  chainLink() {
    return null;
  }
  aaveOracle() {
    return exports.AAVE_ORACLE_CONTRACT_ADDRESS;
  }
  aaveOracleBlacklist() {
    return exports.AAVE_ORACLE_BLACKLIST;
  }
  curveCalculations() {
    return null;
  }
  curveCalculationsBlacklist() {
    return exports.CURVE_CALCULATIONS_BLACKSLIST;
  }
  sushiCalculations() {
    return null;
  }
  sushiCalculationsBlacklist() {
    return exports.SUSHI_CALCULATIONS_BLACKSLIST;
  }
  uniswapForks() {
    return exports.UNISWAP_FORKS_ROUTER_ADDRESSES;
  }
  curveRegistry() {
    return exports.CURVE_REGISTRY_ADDRESSES;
  }
  hardcodedStables() {
    return exports.HARDCODED_STABLES;
  }
  whitelistedTokens() {
    return exports.WHITELISTED_TOKENS;
  }
}
exports.config = config;
