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
exports.NETWORK_STRING = "oasis";
exports.NETWORK_CHAIN_ID = 42262;
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
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000") //TODO: Yuzuswap
);
exports.UNISWAP_ROUTER_ADDRESS.set(
  "routerV2",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000")
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
  graph_ts_1.Address.fromString("0x21C718C22D52d0F3a789b752D4c2fD5908a8A733")
);
exports.WHITELIST_TOKENS.set(
  "ETH",
  graph_ts_1.Address.fromString("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")
);
exports.WHITELIST_TOKENS.set(
  "USDT",
  graph_ts_1.Address.fromString("0xdC19A122e268128B5eE20366299fc7b5b199C8e3")
);
exports.WHITELIST_TOKENS.set(
  "DAI",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000")
);
exports.WHITELIST_TOKENS.set(
  "USDC",
  graph_ts_1.Address.fromString("0x94fbfFe5698DB6f54d6Ca524DbE673a7729014Be")
);
exports.WHITELIST_TOKENS.set(
  "WBTC",
  graph_ts_1.Address.fromString("0xd43ce0aa2a29DCb75bDb83085703dc589DE6C7eb")
);
exports.WHITELIST_TOKENS.set(
  "LINK",
  graph_ts_1.Address.fromString("0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055")
);
exports.WHITELIST_TOKENS.set(
  "CRV",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000")
);
