"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHITELIST_TOKENS =
  exports.USDC_DECIMALS =
  exports.ONE_INCH_ORACLE_CONTRACT_ADDRESS =
  exports.AAVE_ORACLE_CONTRACT_ADDRESS =
  exports.CHAIN_LINK_CONTRACT_ADDRESS =
  exports.YEARN_LENS_CONTRACT_ADDRESS =
  exports.QUICKSWAP_PATH_OVERRIDE =
  exports.QUICKSWAP_ROUTER_ADDRESS =
  exports.SUSHISWAP_ROUTER_ADDRESS =
  exports.SUSHISWAP_WETH_ADDRESS =
  exports.SUSHISWAP_CALCULATIONS_ADDRESS =
  exports.CURVE_POOL_REGISTRY_ADDRESS =
  exports.CURVE_REGISTRY_ADDRESS =
  exports.CURVE_CALCULATIONS_ADDRESS =
  exports.NETWORK_STRING =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "matic";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
exports.CURVE_REGISTRY_ADDRESS = graph_ts_1.Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
exports.CURVE_POOL_REGISTRY_ADDRESS = graph_ts_1.Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// SUSHISWAP CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SUSHISWAP_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
exports.SUSHISWAP_WETH_ADDRESS = graph_ts_1.Address.fromString(
  "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" // WMATIC
);
exports.SUSHISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.SUSHISWAP_ROUTER_ADDRESS.set(
  "routerV1",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000")
);
exports.SUSHISWAP_ROUTER_ADDRESS.set(
  "routerV2",
  graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506")
);
///////////////////////////////////////////////////////////////////////////
////////////////////////// QUICKSWAP CONTRACT ///////////////////////////
///////////////////////////////////////////////////////////////////////////
// NOTE: QUICKSWAP is a Uniswap V2 Fork
exports.QUICKSWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.QUICKSWAP_ROUTER_ADDRESS.set(
  "routerV1",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000")
);
exports.QUICKSWAP_ROUTER_ADDRESS.set(
  "routerV2",
  graph_ts_1.Address.fromString("0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff")
);
exports.QUICKSWAP_PATH_OVERRIDE = new graph_ts_1.TypedMap();
exports.QUICKSWAP_PATH_OVERRIDE.set(
  graph_ts_1.Address.fromString("0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"), // WBTC - WBTC/WMATIC liquidity too low， use WBTC/USDC directly
  [
    graph_ts_1.Address.fromString("0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"),
    graph_ts_1.Address.fromString("0x2791bca1f2de4661ed88a30c99a7a9449aa84174"), // USDC
  ]
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// YEARNLENS CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000000";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CHAINLINK CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
// No Chainlink feed registry on polygon
exports.CHAIN_LINK_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CHAINLINK CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.AAVE_ORACLE_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CHAINLINK CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.ONE_INCH_ORACLE_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.USDC_DECIMALS = graph_ts_1.BigInt.fromI32(6);
exports.WHITELIST_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELIST_TOKENS.set(
  "WETH",
  graph_ts_1.Address.fromString("0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270") // WMATIC
);
exports.WHITELIST_TOKENS.set(
  "USDT",
  graph_ts_1.Address.fromString("0xc2132d05d31c914a87c6611c10748aeb04b58e8f")
);
exports.WHITELIST_TOKENS.set(
  "DAI",
  graph_ts_1.Address.fromString("0x8f3cf7ad23cd3cadbd9735aff958023239c6a063")
);
exports.WHITELIST_TOKENS.set(
  "USDC",
  graph_ts_1.Address.fromString("0x2791bca1f2de4661ed88a30c99a7a9449aa84174")
);
exports.WHITELIST_TOKENS.set(
  "ETH",
  graph_ts_1.Address.fromString("0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0") // MATIC
);
exports.WHITELIST_TOKENS.set(
  "WBTC",
  graph_ts_1.Address.fromString("0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6")
);
exports.WHITELIST_TOKENS.set(
  "EURS",
  graph_ts_1.Address.fromString("0xe111178a87a3bff0c8d18decba5798827539ae99")
);
exports.WHITELIST_TOKENS.set(
  "LINK",
  graph_ts_1.Address.fromString("0xb0897686c545045afc77cf20ec7a532e3120e0f1")
);
