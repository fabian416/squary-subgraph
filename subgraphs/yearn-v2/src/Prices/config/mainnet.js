"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHITELIST_TOKENS = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.UNISWAP_ROUTER_ADDRESS = exports.SUSHISWAP_ROUTER_ADDRESS = exports.SUSHISWAP_WETH_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.CURVE_POOL_REGISTRY_ADDRESS = exports.CURVE_REGISTRY_ADDRESS = exports.CURVE_CALCULATIONS_ADDRESS = exports.NETWORK_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "mainnet";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x25bf7b72815476dd515044f9650bf79bad0df655");
exports.CURVE_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x7d86446ddb609ed0f5f8684acf30380a356b2b4c");
exports.CURVE_POOL_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x8f942c20d02befc377d41445793068908e2250d0");
///////////////////////////////////////////////////////////////////////////
///////////////////////////// SUSHISWAP CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SUSHISWAP_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x8263e161a855b644f582d9c164c66aabee53f927");
exports.SUSHISWAP_WETH_ADDRESS = graph_ts_1.Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
exports.SUSHISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.SUSHISWAP_ROUTER_ADDRESS.set("routerV1", graph_ts_1.Address.fromString("0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f"));
exports.SUSHISWAP_ROUTER_ADDRESS.set("routerV2", graph_ts_1.Address.fromString("0x7a250d5630b4cf539739df2c5dacb4c659f2488d"));
///////////////////////////////////////////////////////////////////////////
///////////////////////////// UNISWAP CONTRACT ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.UNISWAP_ROUTER_ADDRESS.set("routerV1", graph_ts_1.Address.fromString("0x7a250d5630b4cf539739df2c5dacb4c659f2488d"));
exports.UNISWAP_ROUTER_ADDRESS.set("routerV2", graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"));
///////////////////////////////////////////////////////////////////////////
///////////////////////////// YEARNLENS CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = "0x83d95e0d5f402511db06817aff3f9ea88224b030";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CHAINLINK CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CHAIN_LINK_CONTRACT_ADDRESS = graph_ts_1.Address.fromString("0x47fb2585d2c56fe188d0e6ec628a38b74fceeedf");
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.WHITELIST_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELIST_TOKENS.set("WETH", graph_ts_1.Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"));
exports.WHITELIST_TOKENS.set("USDT", graph_ts_1.Address.fromString("0xdac17f958d2ee523a2206206994597c13d831ec7"));
exports.WHITELIST_TOKENS.set("DAI", graph_ts_1.Address.fromString("0x6b175474e89094c44da98b954eedeac495271d0f"));
exports.WHITELIST_TOKENS.set("USDC", graph_ts_1.Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"));
exports.WHITELIST_TOKENS.set("ETH", graph_ts_1.Address.fromString("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"));
exports.WHITELIST_TOKENS.set("WBTC", graph_ts_1.Address.fromString("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"));
exports.WHITELIST_TOKENS.set("EURS", graph_ts_1.Address.fromString("0xdb25f211ab05b1c97d595516f45794528a807ad8"));
exports.WHITELIST_TOKENS.set("LINK", graph_ts_1.Address.fromString("0x514910771af9ca656af840dff83e8264ecf986ca"));
