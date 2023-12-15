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
exports.NETWORK_STRING = "matic";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.INCH_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(
  graph_ts_1.Address.fromString("0x7f069df72b7a39bce9806e3afaf579e54d8cf2b9"),
  graph_ts_1.BigInt.fromI32(15030523)
);
exports.AAVE_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(
  graph_ts_1.Address.fromString("0xb023e699f5a33916ea823a16485e259257ca8bd1"),
  graph_ts_1.BigInt.fromI32(25825996)
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_REGISTRY_ADDRESSES = [
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0x094d12e5b541784701fd8d65f11fc0598fbc6332"),
    graph_ts_1.BigInt.fromI32(13991825)
  ),
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0x47bb542b9de58b970ba50c9dae444ddb4c16751a"),
    graph_ts_1.BigInt.fromI32(23556360)
  ),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff"), // QuickSwap
    graph_ts_1.BigInt.fromI32(4931900)
  ),
  types_1.ContractInfo.set(
    graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"), // SushiSwap
    graph_ts_1.BigInt.fromI32(11333235)
  ),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// BLACKLISTED TOKENS ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_BLACKLIST = [];
exports.INCH_ORACLE_BLACKLIST = [
  graph_ts_1.Address.fromString("0xf8a57c1d3b9629b77b6726a042ca48990a84fb49"),
  graph_ts_1.Address.fromString("0xdad97f7713ae9437fa9249920ec8507e5fbb23d3"), // Curve USD-BTC-ETH
];
exports.AAVE_ORACLE_BLACKLIST = [];
exports.CURVE_CALCULATIONS_BLACKSLIST = [];
exports.SUSHI_CALCULATIONS_BLACKSLIST = [];
///////////////////////////////////////////////////////////////////////////
//////////////////////////// HARDCODED STABLES ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.HARDCODED_STABLES = [
  graph_ts_1.Address.fromString("0x1a13f4ca1d028320a707d99520abfefca3998b7f"),
  graph_ts_1.Address.fromString("0x27f8d03b3a2196956ed754badc28d73be8830a6e"),
  graph_ts_1.Address.fromString("0x60d55f02a771d515e077c9c2403a1ef324885cec"),
  graph_ts_1.Address.fromString("0xe2aa7db6da1dae97c5f5c6914d285fbfcc32a128"),
  graph_ts_1.Address.fromString("0x7bdf330f423ea880ff95fc41a280fd5ecfd3d09f"),
  graph_ts_1.Address.fromString("0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171"), // Curve.fi amDAI/amUSDC/amUSDT
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
    graph_ts_1.Address.fromString("0x2791bca1f2de4661ed88a30c99a7a9449aa84174")
  )
);
exports.WHITELISTED_TOKENS.set(
  "USDT",
  types_1.TokenInfo.set(
    "USDT",
    6,
    graph_ts_1.Address.fromString("0xc2132d05d31c914a87c6611c10748aeb04b58e8f")
  )
);
exports.WHITELISTED_TOKENS.set(
  "DAI",
  types_1.TokenInfo.set(
    "DAI",
    18,
    graph_ts_1.Address.fromString("0x8f3cf7ad23cd3cadbd9735aff958023239c6a063")
  )
);
exports.WHITELISTED_TOKENS.set(
  "WETH",
  types_1.TokenInfo.set(
    "WETH",
    18,
    graph_ts_1.Address.fromString("0x7ceb23fd6bc0add59e62ac25578270cff1b9f619")
  )
);
exports.WHITELISTED_TOKENS.set(
  "NATIVE_TOKEN",
  types_1.TokenInfo.set(
    "MATIC",
    18,
    graph_ts_1.Address.fromString("0x0000000000000000000000000000000000001010")
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
