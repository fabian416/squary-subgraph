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
  exports.NETWORK_STRING =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("../common/types");
exports.NETWORK_STRING = "moonbeam";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_REGISTRY_ADDRESSES = [
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0xc2b1df84112619d190193e48148000e3990bf627"),
    graph_ts_1.BigInt.fromI32(1452049)
  ),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0x96b244391d98b62d19ae89b1a4dccf0fc56970c7"), // BeamSwap
    graph_ts_1.BigInt.fromI32(199158)
  ),
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"), // SushiSwap
    graph_ts_1.BigInt.fromI32(503734)
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
  graph_ts_1.Address.fromString("0x14df360966a1c4582d2b18edbdae432ea0a27575"),
  graph_ts_1.Address.fromString("0xca01a1d0993565291051daff390892518acfad3a"),
  graph_ts_1.Address.fromString("0xdfd74af792bc6d45d1803f425ce62dd16f8ae038"),
  graph_ts_1.Address.fromString("0x765277eebeca2e31912c9946eae1021199b39c61"),
  graph_ts_1.Address.fromString("0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c"),
  graph_ts_1.Address.fromString("0x8e70cd5b4ff3f62659049e74b6649c6603a0e594"),
  graph_ts_1.Address.fromString("0xc234a67a4f840e61ade794be47de455361b52413"), // DAI
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
    graph_ts_1.Address.fromString("0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b")
  )
);
exports.WHITELISTED_TOKENS.set(
  "USDT",
  types_1.TokenInfo.set(
    "USDT",
    6,
    graph_ts_1.Address.fromString("0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73")
  )
);
exports.WHITELISTED_TOKENS.set(
  "DAI",
  types_1.TokenInfo.set(
    "DAI",
    18,
    graph_ts_1.Address.fromString("0x765277eebeca2e31912c9946eae1021199b39c61")
  )
);
exports.WHITELISTED_TOKENS.set(
  "WETH",
  types_1.TokenInfo.set(
    "WETH",
    18,
    graph_ts_1.Address.fromString("0x30d2a9f5fdf90ace8c17952cbb4ee48a55d916a7")
  )
);
exports.WHITELISTED_TOKENS.set(
  "NATIVE_TOKEN",
  types_1.TokenInfo.set(
    "GLMR",
    18,
    graph_ts_1.Address.fromString("0xacc15dc74880c9944775448304b263d191c6077f")
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
    return null;
  }
  inchOracleBlacklist() {
    return exports.INCH_ORACLE_BLACKLIST;
  }
  chainLink() {
    return null;
  }
  aaveOracle() {
    return null;
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
