"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHITELIST_TOKENS = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.UNISWAP_ROUTER_ADDRESS = exports.SUSHISWAP_ROUTER_ADDRESS = exports.SUSHISWAP_WETH_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.CURVE_POOL_REGISTRY_ADDRESS = exports.CURVE_REGISTRY_ADDRESS = exports.CURVE_CALCULATIONS_ADDRESS = exports.NETWORK_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "arbitrum-one";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x26f698491daf32771217abc1356dae48c7230c75");
exports.CURVE_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x445fe580ef8d70ff569ab36e80c647af338db351");
exports.CURVE_POOL_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x0e9fbb167df83ede3240d6a5fa5d40c6c6851e15");
///////////////////////////////////////////////////////////////////////////
///////////////////////////// SUSHISWAP CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SUSHISWAP_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x5ea7e501c9a23f4a76dc7d33a11d995b13a1dd25");
exports.SUSHISWAP_WETH_ADDRESS = graph_ts_1.Address.fromString("0x82af49447d8a07e3bd95bd0d56f35241523fbab1");
exports.SUSHISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.SUSHISWAP_ROUTER_ADDRESS.set("routerV1", graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"));
exports.SUSHISWAP_ROUTER_ADDRESS.set("routerV2", graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"));
///////////////////////////////////////////////////////////////////////////
///////////////////////////// UNISWAP CONTRACT ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.UNISWAP_ROUTER_ADDRESS.set("routerV1", graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"));
exports.UNISWAP_ROUTER_ADDRESS.set("routerV2", graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"));
///////////////////////////////////////////////////////////////////////////
///////////////////////////// YEARNLENS CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CHAINLINK CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CHAIN_LINK_CONTRACT_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.WHITELIST_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELIST_TOKENS.set("WETH", graph_ts_1.Address.fromString("0x82af49447d8a07e3bd95bd0d56f35241523fbab1"));
exports.WHITELIST_TOKENS.set("ETH", graph_ts_1.Address.fromString("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"));
exports.WHITELIST_TOKENS.set("USDT", graph_ts_1.Address.fromString("0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"));
exports.WHITELIST_TOKENS.set("DAI", graph_ts_1.Address.fromString("0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"));
exports.WHITELIST_TOKENS.set("USDC", graph_ts_1.Address.fromString("0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"));
exports.WHITELIST_TOKENS.set("WBTC", graph_ts_1.Address.fromString("0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f"));
exports.WHITELIST_TOKENS.set("LINK", graph_ts_1.Address.fromString("0xf97f4df75117a78c1a5a0dbb814af92458539fb4"));
exports.WHITELIST_TOKENS.set("CRV", graph_ts_1.Address.fromString("0x11cdb42b0eb46d95f990bedd4695a6e3fa034978"));
