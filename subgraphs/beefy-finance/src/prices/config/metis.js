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
exports.NETWORK_STRING = "metis";
exports.NETWORK_CHAIN_ID = 1088;
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
  graph_ts_1.Address.fromString("0x81b9FA50D5f5155Ee17817C21702C3AE4780AD09")
);
exports.UNISWAP_ROUTER_ADDRESS.set(
  "routerV2",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000") //TODO: Netswap???
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
  graph_ts_1.Address.fromString("0x75cb093E4D61d2A2e65D8e0BBb01DE8d89b53481")
);
exports.WHITELIST_TOKENS.set(
  "ETH",
  graph_ts_1.Address.fromString("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")
);
exports.WHITELIST_TOKENS.set(
  "USDT",
  graph_ts_1.Address.fromString("0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC")
);
exports.WHITELIST_TOKENS.set(
  "DAI",
  graph_ts_1.Address.fromString("0x4651B38e7ec14BB3db731369BFE5B08F2466Bd0A")
);
exports.WHITELIST_TOKENS.set(
  "USDC",
  graph_ts_1.Address.fromString("0xEA32A96608495e54156Ae48931A7c20f0dcc1a21")
);
exports.WHITELIST_TOKENS.set(
  "WBTC",
  graph_ts_1.Address.fromString("0xa5B55ab1dAF0F8e1EFc0eB1931a957fd89B918f4")
);
exports.WHITELIST_TOKENS.set(
  "LINK",
  graph_ts_1.Address.fromString("0xf5F66d5daa89c090A7afa10E6C1553B2887a9A33")
);
exports.WHITELIST_TOKENS.set(
  "CRV",
  graph_ts_1.Address.fromString("0x87DD4a7Ad23B95cD9fF9C26B5cF325905CaF8663")
);
