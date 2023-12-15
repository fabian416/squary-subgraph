"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WRAPPED_BASE_TOKEN = exports.BASE_TOKEN = exports.WHITELIST_TOKENS = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.UNISWAP_ROUTER_ADDRESS = exports.TRADERJOE_ROUTER_ADDRESS = exports.TRADERJOE_CALCULATIONS_ADDRESS = exports.TRADERJOE_WETH_ADDRESS = exports.SUSHISWAP_ROUTER_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.SUSHISWAP_WETH_ADDRESS = exports.CURVE_POOL_REGISTRY_ADDRESS = exports.CURVE_REGISTRY_ADDRESS = exports.CURVE_CALCULATIONS_ADDRESS = exports.NETWORK_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "avalanche";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
exports.CURVE_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
exports.CURVE_POOL_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
///////////////////////////////////////////////////////////////////////////
///////////////////////////// SUSHISWAP CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SUSHISWAP_WETH_ADDRESS = graph_ts_1.Address.fromString("0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7");
exports.SUSHISWAP_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
exports.SUSHISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.SUSHISWAP_ROUTER_ADDRESS.set("routerV1", graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"));
exports.SUSHISWAP_ROUTER_ADDRESS.set("routerV2", graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"));
///////////////////////////////////////////////////////////////////////////
///////////////////////////// UNISWAP CONTRACT ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.TRADERJOE_WETH_ADDRESS = graph_ts_1.Address.fromString("0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7");
exports.TRADERJOE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
exports.TRADERJOE_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.TRADERJOE_ROUTER_ADDRESS.set("routerV1", graph_ts_1.Address.fromString("0x60ae616a2155ee3d9a68541ba4544862310933d4"));
exports.TRADERJOE_ROUTER_ADDRESS.set("routerV2", graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"));
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
exports.WHITELIST_TOKENS.set("WAVAX", graph_ts_1.Address.fromString("0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"));
exports.WHITELIST_TOKENS.set("AVAX", graph_ts_1.Address.fromString("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"));
exports.WHITELIST_TOKENS.set("ETH", graph_ts_1.Address.fromString("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"));
exports.WHITELIST_TOKENS.set("USDT", graph_ts_1.Address.fromString("0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7"));
exports.WHITELIST_TOKENS.set("DAI", graph_ts_1.Address.fromString("0xd586e7f844cea2f87f50152665bcbc2c279d8d70"));
exports.WHITELIST_TOKENS.set("USDC", graph_ts_1.Address.fromString("0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664"));
exports.WHITELIST_TOKENS.set("CRV", graph_ts_1.Address.fromString("0x249848beca43ac405b8102ec90dd5f22ca513c06"));
exports.WHITELIST_TOKENS.set("LINK", graph_ts_1.Address.fromString("0x5947bb275c521040051d82396192181b413227a3"));
exports.WHITELIST_TOKENS.set("WAVAX", graph_ts_1.Address.fromString("0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"));
exports.BASE_TOKEN = "AVAX";
exports.WRAPPED_BASE_TOKEN = "WAVAX";
