"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHITELIST_TOKENS = exports.USDC_DECIMALS = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.QUICKSWAP_PATH_OVERRIDE = exports.QUICKSWAP_ROUTER_ADDRESS = exports.SUSHISWAP_ROUTER_ADDRESS = exports.SUSHISWAP_WETH_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.CURVE_POOL_REGISTRY_ADDRESS = exports.CURVE_REGISTRY_ADDRESS = exports.CURVE_CALCULATIONS_ADDRESS = exports.NETWORK_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "matic";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
exports.CURVE_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
exports.CURVE_POOL_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
///////////////////////////////////////////////////////////////////////////
///////////////////////////// SUSHISWAP CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SUSHISWAP_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
exports.SUSHISWAP_WETH_ADDRESS = graph_ts_1.Address.fromString("0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" // WMATIC
);
exports.SUSHISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.SUSHISWAP_ROUTER_ADDRESS.set("routerV1", graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"));
exports.SUSHISWAP_ROUTER_ADDRESS.set("routerV2", graph_ts_1.Address.fromString("0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"));
///////////////////////////////////////////////////////////////////////////
////////////////////////// QUICKSWAP CONTRACT ///////////////////////////
///////////////////////////////////////////////////////////////////////////
// NOTE: QUICKSWAP is a Uniswap V2 Fork
exports.QUICKSWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.QUICKSWAP_ROUTER_ADDRESS.set("routerV1", graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"));
exports.QUICKSWAP_ROUTER_ADDRESS.set("routerV2", graph_ts_1.Address.fromString("0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"));
exports.QUICKSWAP_PATH_OVERRIDE = new graph_ts_1.TypedMap();
exports.QUICKSWAP_PATH_OVERRIDE.set(graph_ts_1.Address.fromString("0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"), // WBTC - WBTC/WMATIC liquidity too low， use WBTC/USDC directly
[
    graph_ts_1.Address.fromString("0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"),
    graph_ts_1.Address.fromString("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"), // USDC
]);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// YEARNLENS CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CHAINLINK CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
// No Chainlink feed registry on polygon
exports.CHAIN_LINK_CONTRACT_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.USDC_DECIMALS = 6;
exports.WHITELIST_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELIST_TOKENS.set("WETH", graph_ts_1.Address.fromString("0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270") // WMATIC
);
exports.WHITELIST_TOKENS.set("USDT", graph_ts_1.Address.fromString("0xc2132D05D31c914a87C6611C10748AEb04B58e8F"));
exports.WHITELIST_TOKENS.set("DAI", graph_ts_1.Address.fromString("0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"));
exports.WHITELIST_TOKENS.set("USDC", graph_ts_1.Address.fromString("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"));
exports.WHITELIST_TOKENS.set("ETH", graph_ts_1.Address.fromString("0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0") // MATIC
);
exports.WHITELIST_TOKENS.set("WBTC", graph_ts_1.Address.fromString("0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"));
exports.WHITELIST_TOKENS.set("EURS", graph_ts_1.Address.fromString("0xE111178A87A3BFf0c8d18DECBa5798827539Ae99"));
exports.WHITELIST_TOKENS.set("LINK", graph_ts_1.Address.fromString("0xb0897686c545045aFc77CF20eC7A532E3120E0F1"));
