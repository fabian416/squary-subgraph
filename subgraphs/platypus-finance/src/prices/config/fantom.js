"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WRAPPED_BASE_TOKEN = exports.BASE_TOKEN = exports.WHITELIST_TOKENS = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.SPOOKY_SWAP_ROUTER_ADDRESS = exports.SUSHISWAP_ROUTER_ADDRESS = exports.SUSHISWAP_WETH_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.CURVE_POOL_REGISTRY_ADDRESS = exports.CURVE_REGISTRY_ADDRESS = exports.CURVE_CALCULATIONS_ADDRESS = exports.NETWORK_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "fantom";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x0b53e9df372e72d8fdcdbedfbb56059957a37128");
exports.CURVE_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x0f854ea9f38cea4b1c2fc79047e9d0134419d5d6");
exports.CURVE_POOL_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x4fb93d7d320e8a263f22f62c2059dfc2a8bcbc4c");
///////////////////////////////////////////////////////////////////////////
///////////////////////////// SUSHISWAP CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SUSHISWAP_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0xec7ac8ac897f5082b2c3d4e8d2173f992a097f24");
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
exports.WHITELIST_TOKENS.set("WETH", graph_ts_1.Address.fromString("0x658b0c7613e890ee50b8c4bc6a3f41ef411208ad"));
exports.WHITELIST_TOKENS.set("ETH", graph_ts_1.Address.fromString("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"));
exports.WHITELIST_TOKENS.set("gfUSDT", graph_ts_1.Address.fromString("0x940f41f0ec9ba1a34cf001cc03347ac092f5f6b5"));
exports.WHITELIST_TOKENS.set("DAI", graph_ts_1.Address.fromString("0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e"));
exports.WHITELIST_TOKENS.set("USDC", graph_ts_1.Address.fromString("0x04068da6c83afcfa0e13ba15a6696662335d5b75"));
exports.WHITELIST_TOKENS.set("WFTM", graph_ts_1.Address.fromString("0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"));
exports.WHITELIST_TOKENS.set("WBTC", graph_ts_1.Address.fromString("0x321162cd933e2be498cd2267a90534a804051b11"));
exports.WHITELIST_TOKENS.set("fBTC", graph_ts_1.Address.fromString("0xe1146b9ac456fcbb60644c36fd3f868a9072fc6e"));
exports.WHITELIST_TOKENS.set("FRAX", graph_ts_1.Address.fromString("0xdc301622e621166bd8e82f2ca0a26c13ad0be355"));
exports.WHITELIST_TOKENS.set("LINK", graph_ts_1.Address.fromString("0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8"));
exports.WHITELIST_TOKENS.set("CRV", graph_ts_1.Address.fromString("0x1e4f97b9f9f913c46f1632781732927b9019c68b"));
exports.BASE_TOKEN = "FTM";
exports.WRAPPED_BASE_TOKEN = "WFTM";
