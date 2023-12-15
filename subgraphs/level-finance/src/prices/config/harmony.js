"use strict";
/* eslint-disable @typescript-eslint/no-magic-numbers */
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.WHITELISTED_TOKENS = exports.HARDCODED_STABLES = exports.SUSHI_CALCULATIONS_BLACKSLIST = exports.CURVE_CALCULATIONS_BLACKSLIST = exports.AAVE_ORACLE_BLACKLIST = exports.INCH_ORACLE_BLACKLIST = exports.YEARN_LENS_BLACKLIST = exports.UNISWAP_FORKS_ROUTER_ADDRESSES = exports.CURVE_REGISTRY_ADDRESSES = exports.AAVE_ORACLE_CONTRACT_ADDRESS = exports.NETWORK_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("../common/types");
exports.NETWORK_STRING = "harmony";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.AAVE_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x3c90887ede8d65ccb2777a5d577beab2548280ad"), graph_ts_1.BigInt.fromI32(23930344));
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_REGISTRY_ADDRESSES = [
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x0a53fada2d943057c47a301d25a4d9b3b8e01e8e"), graph_ts_1.BigInt.fromI32(18003250)),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"), // SushiSwap
    graph_ts_1.BigInt.fromI32(11256069)),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// BLACKLISTED TOKENS ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_BLACKLIST = [];
exports.INCH_ORACLE_BLACKLIST = [];
exports.AAVE_ORACLE_BLACKLIST = [];
exports.CURVE_CALCULATIONS_BLACKSLIST = [];
exports.SUSHI_CALCULATIONS_BLACKSLIST = [];
///////////////////////////////////////////////////////////////////////////
//////////////////////////// HARDCODED STABLES ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.HARDCODED_STABLES = [];
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.WHITELISTED_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELISTED_TOKENS.set("USDC", types_1.TokenInfo.set("USDC", 6, graph_ts_1.Address.fromString("0x985458e523db3d53125813ed68c274899e9dfab4")));
exports.WHITELISTED_TOKENS.set("USDT", types_1.TokenInfo.set("USDT", 6, graph_ts_1.Address.fromString("0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f")));
exports.WHITELISTED_TOKENS.set("DAI", types_1.TokenInfo.set("DAI", 18, graph_ts_1.Address.fromString("0xef977d2f931c1978db5f6747666fa1eacb0d0339")));
exports.WHITELISTED_TOKENS.set("WETH", types_1.TokenInfo.set("WETH", 18, graph_ts_1.Address.fromString("0x6983d1e6def3690c4d616b13597a09e6193ea013")));
exports.WHITELISTED_TOKENS.set("NATIVE_TOKEN", types_1.TokenInfo.set("WONE", 18, graph_ts_1.Address.fromString("0xcf664087a5bb0237a0bad6742852ec6c8d69a27a")));
class config {
    yearnLens() {
        return null;
    }
    yearnLensBlacklist() {
        return exports.YEARN_LENS_BLACKLIST;
    }
    inchOracle() {
        return null;
    }
    inchOracleBlacklist() {
        return exports.INCH_ORACLE_BLACKLIST;
    }
    chainLink() {
        return null;
    }
    aaveOracle() {
        return exports.AAVE_ORACLE_CONTRACT_ADDRESS;
    }
    aaveOracleBlacklist() {
        return exports.AAVE_ORACLE_BLACKLIST;
    }
    curveCalculations() {
        return null;
    }
    curveCalculationsBlacklist() {
        return exports.CURVE_CALCULATIONS_BLACKSLIST;
    }
    sushiCalculations() {
        return null;
    }
    sushiCalculationsBlacklist() {
        return exports.SUSHI_CALCULATIONS_BLACKSLIST;
    }
    uniswapForks() {
        return exports.UNISWAP_FORKS_ROUTER_ADDRESSES;
    }
    curveRegistry() {
        return exports.CURVE_REGISTRY_ADDRESSES;
    }
    hardcodedStables() {
        return exports.HARDCODED_STABLES;
    }
    whitelistedTokens() {
        return exports.WHITELISTED_TOKENS;
    }
}
exports.config = config;
