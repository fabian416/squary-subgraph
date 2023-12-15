"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHITELIST_TOKENS =
  exports.CHAIN_LINK_CONTRACT_ADDRESS =
  exports.YEARN_LENS_CONTRACT_ADDRESS =
  exports.UNISWAP_ROUTER_ADDRESS =
  exports.SUSHISWAP_ROUTER_ADDRESS =
  exports.SUSHISWAP_WETH_ADDRESS =
  exports.SUSHISWAP_CALCULATIONS_ADDRESS =
  exports.CURVE_POOL_REGISTRY_ADDRESS =
  exports.CURVE_REGISTRY_ADDRESS =
  exports.CURVE_CALCULATIONS_ADDRESS =
  exports.NETWORK_SUFFIX =
  exports.NETWORK_CHAIN_ID =
  exports.NETWORK_STRING =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "moonbeam";
exports.NETWORK_CHAIN_ID = 1284;
exports.NETWORK_SUFFIX = "-" + exports.NETWORK_CHAIN_ID.toString();
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
  graph_ts_1.Address.fromString("0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506")
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
  graph_ts_1.Address.fromString("0x70085a09D30D6f8C4ecF6eE10120d1847383BB57") //Stellaswap
);
exports.UNISWAP_ROUTER_ADDRESS.set(
  "routerV2",
  graph_ts_1.Address.fromString("0x96b244391D98B62D19aE89b1A4dCcf0fc56970C7") //Beamswap
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// YEARNLENS CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CHAINLINK CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CHAIN_LINK_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.WHITELIST_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELIST_TOKENS.set(
  "WETH",
  graph_ts_1.Address.fromString("0xAcc15dC74880C9944775448304B263D191c6077F")
);
exports.WHITELIST_TOKENS.set(
  "ETH",
  graph_ts_1.Address.fromString("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")
);
exports.WHITELIST_TOKENS.set(
  "USDT",
  graph_ts_1.Address.fromString("0x8e70cD5B4Ff3f62659049e74b6649c6603A0E594")
);
exports.WHITELIST_TOKENS.set(
  "DAI",
  graph_ts_1.Address.fromString("0x765277EebeCA2e31912C9946eAe1021199B39C61")
);
exports.WHITELIST_TOKENS.set(
  "USDC",
  graph_ts_1.Address.fromString("0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9")
);
exports.WHITELIST_TOKENS.set(
  "WBTC",
  graph_ts_1.Address.fromString("0x1DC78Acda13a8BC4408B207c9E48CDBc096D95e0")
);
exports.WHITELIST_TOKENS.set(
  "LINK",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000")
);
exports.WHITELIST_TOKENS.set(
  "CRV",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000")
);
