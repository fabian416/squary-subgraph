"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHITELIST_TOKENS = exports.USDC_DECIMALS = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.SPOOKY_SWAP_PATH_OVERRIDE = exports.SPOOKY_SWAP_ROUTER_ADDRESS = exports.SUSHISWAP_ROUTER_ADDRESS = exports.SUSHISWAP_WETH_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.CURVE_POOL_REGISTRY_ADDRESS = exports.CURVE_REGISTRY_ADDRESS = exports.CURVE_CALCULATIONS_ADDRESS = exports.NETWORK_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "fantom";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x0b53e9df372e72d8fdcdbedfbb56059957a37128");
exports.CURVE_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x0f854EA9F38ceA4B1c2FC79047E9D0134419D5d6");
exports.CURVE_POOL_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x4fb93D7d320E8A263F22f62C2059dFC2A8bCbC4c");
///////////////////////////////////////////////////////////////////////////
///////////////////////////// SUSHISWAP CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SUSHISWAP_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0xec7Ac8AC897f5082B2c3d4e8D2173F992A097F24");
exports.SUSHISWAP_WETH_ADDRESS = graph_ts_1.Address.fromString("0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83");
exports.SUSHISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.SUSHISWAP_ROUTER_ADDRESS.set("routerV1", graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"));
exports.SUSHISWAP_ROUTER_ADDRESS.set("routerV2", graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"));
///////////////////////////////////////////////////////////////////////////
///////////////////////////// UNISWAP CONTRACT ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SPOOKY_SWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.SPOOKY_SWAP_ROUTER_ADDRESS.set("routerV1", graph_ts_1.Address.fromString("0xbe4fc72f8293f9d3512d58b969c98c3f676cb957"));
exports.SPOOKY_SWAP_ROUTER_ADDRESS.set("routerV2", graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"));
exports.SPOOKY_SWAP_PATH_OVERRIDE = new graph_ts_1.TypedMap();
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
exports.USDC_DECIMALS = 6;
exports.WHITELIST_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELIST_TOKENS.set("WETH", graph_ts_1.Address.fromString("0x658b0c7613e890ee50b8c4bc6a3f41ef411208ad") // fETH
);
exports.WHITELIST_TOKENS.set("ETH", graph_ts_1.Address.fromString("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"));
exports.WHITELIST_TOKENS.set("gfUSDT", graph_ts_1.Address.fromString("0x940f41f0ec9ba1a34cf001cc03347ac092f5f6b5"));
exports.WHITELIST_TOKENS.set("DAI", graph_ts_1.Address.fromString("0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e"));
exports.WHITELIST_TOKENS.set("USDC", graph_ts_1.Address.fromString("0x04068da6c83afcfa0e13ba15a6696662335d5b75"));
exports.WHITELIST_TOKENS.set("WFTM", graph_ts_1.Address.fromString("0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"));
exports.WHITELIST_TOKENS.set("WBTC", graph_ts_1.Address.fromString("0x321162Cd933E2Be498Cd2267a90534A804051b11"));
exports.WHITELIST_TOKENS.set("fBTC", graph_ts_1.Address.fromString("0xe1146b9ac456fcbb60644c36fd3f868a9072fc6e"));
exports.WHITELIST_TOKENS.set("FRAX", graph_ts_1.Address.fromString("0xdc301622e621166bd8e82f2ca0a26c13ad0be355"));
exports.WHITELIST_TOKENS.set("LINK", graph_ts_1.Address.fromString("0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8"));
exports.WHITELIST_TOKENS.set("CRV", graph_ts_1.Address.fromString("0x1E4F97b9f9F913c46F1632781732927B9019C68b"));
