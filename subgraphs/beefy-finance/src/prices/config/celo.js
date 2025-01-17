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
exports.NETWORK_STRING = "celo";
exports.NETWORK_CHAIN_ID = 42220;
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
  "0x3Ad443d769A07f287806874F8E5405cE3Ac902b9"
);
exports.SUSHISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.SUSHISWAP_ROUTER_ADDRESS.set(
  "routerV1",
  graph_ts_1.Address.fromString("0x1421bDe4B10e8dd459b3BCb598810B1337D56842")
);
exports.SUSHISWAP_ROUTER_ADDRESS.set(
  "routerV2",
  graph_ts_1.Address.fromString("0x1421bDe4B10e8dd459b3BCb598810B1337D56842")
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
  graph_ts_1.Address.fromString("0x3Ad443d769A07f287806874F8E5405cE3Ac902b9")
);
exports.WHITELIST_TOKENS.set(
  "ETH",
  graph_ts_1.Address.fromString("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")
);
exports.WHITELIST_TOKENS.set(
  "USDT",
  graph_ts_1.Address.fromString("0x88eeC49252c8cbc039DCdB394c0c2BA2f1637EA0")
);
exports.WHITELIST_TOKENS.set(
  "DAI",
  graph_ts_1.Address.fromString("0xE4fE50cdD716522A56204352f00AA110F731932d")
);
exports.WHITELIST_TOKENS.set(
  "USDC",
  graph_ts_1.Address.fromString("0xef4229c8c3250C675F21BCefa42f58EfbfF6002a")
);
exports.WHITELIST_TOKENS.set(
  "WBTC",
  graph_ts_1.Address.fromString("0xBAAB46E28388d2779e6E31Fd00cF0e5Ad95E327B")
);
exports.WHITELIST_TOKENS.set(
  "LINK",
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000")
);
exports.WHITELIST_TOKENS.set(
  "CRV",
  graph_ts_1.Address.fromString("0x0a7432cF27F1aE3825c313F3C81e7D3efD7639aB")
);
