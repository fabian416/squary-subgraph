"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHITELIST_TOKENS =
  exports.USDC_DECIMALS =
  exports.ONE_INCH_ORACLE_CONTRACT_ADDRESS =
  exports.AAVE_ORACLE_CONTRACT_ADDRESS =
  exports.CHAIN_LINK_CONTRACT_ADDRESS =
  exports.YEARN_LENS_CONTRACT_ADDRESS =
  exports.UNISWAP_PATH_OVERRIDE =
  exports.UNISWAP_ROUTER_ADDRESS =
  exports.SUSHISWAP_ROUTER_ADDRESS =
  exports.SUSHISWAP_WETH_ADDRESS =
  exports.SUSHISWAP_CALCULATIONS_ADDRESS =
  exports.CURVE_POOL_REGISTRY_ADDRESS =
  exports.CURVE_REGISTRY_ADDRESS =
  exports.CURVE_CALCULATIONS_ADDRESS =
  exports.NETWORK_STRING =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "optimism";
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
  "0x0000000000000000000000000000000000000000"
);
exports.SUSHISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.SUSHISWAP_ROUTER_ADDRESS.set(
  "routerV1",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000")
);
exports.SUSHISWAP_ROUTER_ADDRESS.set(
  "routerV2",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000")
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// UNISWAP CONTRACT ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.UNISWAP_ROUTER_ADDRESS.set(
  "routerV1",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000")
);
exports.UNISWAP_ROUTER_ADDRESS.set(
  "routerV2",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000")
);
exports.UNISWAP_PATH_OVERRIDE = new graph_ts_1.TypedMap();
///////////////////////////////////////////////////////////////////////////
///////////////////////////// YEARNLENS CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000000";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CHAINLINK CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CHAIN_LINK_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CHAINLINK CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.AAVE_ORACLE_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0xD81eb3728a631871a7eBBaD631b5f424909f0c77"
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CHAINLINK CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.ONE_INCH_ORACLE_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0x11DEE30E710B8d4a8630392781Cc3c0046365d4c"
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.USDC_DECIMALS = graph_ts_1.BigInt.fromI32(8);
exports.WHITELIST_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELIST_TOKENS.set(
  "WETH",
  graph_ts_1.Address.fromString("0x4200000000000000000000000000000000000006")
);
exports.WHITELIST_TOKENS.set(
  "USDT",
  graph_ts_1.Address.fromString("0x94b008aa00579c1307b0ef2c499ad98a8ce58e58")
);
exports.WHITELIST_TOKENS.set(
  "DAI",
  graph_ts_1.Address.fromString("0xda10009cbd5d07dd0cecc66161fc93d7c9000da1")
);
exports.WHITELIST_TOKENS.set(
  "USDC",
  graph_ts_1.Address.fromString("0x7f5c764cbc14f9669b88837ca1490cca17c31607")
);
exports.WHITELIST_TOKENS.set(
  "ETH",
  graph_ts_1.Address.fromString("0x4200000000000000000000000000000000000042")
);
exports.WHITELIST_TOKENS.set(
  "WBTC",
  graph_ts_1.Address.fromString("0x68f180fcce6836688e9084f035309e29bf0a2095")
);
exports.WHITELIST_TOKENS.set(
  "LINK",
  graph_ts_1.Address.fromString("0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6")
);
