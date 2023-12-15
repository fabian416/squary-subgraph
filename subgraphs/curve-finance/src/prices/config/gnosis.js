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
  exports.INCH_ORACLE_CONTRACT_ADDRESS =
  exports.NETWORK_STRING =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("../common/types");
exports.NETWORK_STRING = "xdai";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.INCH_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(
  graph_ts_1.Address.fromString("0x142db045195cecabe415161e1df1cf0337a4d02e"),
  graph_ts_1.BigInt.fromI32(19731993)
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_REGISTRY_ADDRESSES = [
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0x55e91365697eb8032f98290601847296ec847210"),
    graph_ts_1.BigInt.fromI32(20754886)
  ),
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0x8a4694401be8f8fccbc542a3219af1591f87ce17"),
    graph_ts_1.BigInt.fromI32(23334728)
  ),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"), // SushiSwap
    graph_ts_1.BigInt.fromI32(14735910)
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
exports.HARDCODED_STABLES = [];
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.WHITELISTED_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELISTED_TOKENS.set(
  "USDC",
  types_1.TokenInfo.set(
    "USDC",
    6,
    graph_ts_1.Address.fromString("0xddafbb505ad214d7b80b1f830fccc89b60fb7a83")
  )
);
exports.WHITELISTED_TOKENS.set(
  "USDT",
  types_1.TokenInfo.set(
    "USDT",
    6,
    graph_ts_1.Address.fromString("0x4ecaba5870353805a9f068101a40e0f32ed605c6")
  )
);
exports.WHITELISTED_TOKENS.set(
  "DAI",
  types_1.TokenInfo.set(
    "DAI",
    18,
    graph_ts_1.Address.fromString("0xe91d153e0b41518a2ce8dd3d7944fa863463a97d")
  )
);
exports.WHITELISTED_TOKENS.set(
  "WETH",
  types_1.TokenInfo.set(
    "WETH",
    18,
    graph_ts_1.Address.fromString("0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1")
  )
);
exports.WHITELISTED_TOKENS.set(
  "NATIVE_TOKEN",
  types_1.TokenInfo.set(
    "GNOSIS",
    18,
    graph_ts_1.Address.fromString("0x9c58bacc331c9aa871afd802db6379a98e80cedb")
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
