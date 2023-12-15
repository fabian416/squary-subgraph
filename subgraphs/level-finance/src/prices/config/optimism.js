"use strict";
/* eslint-disable @typescript-eslint/no-magic-numbers */
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.WHITELISTED_TOKENS = exports.HARDCODED_STABLES = exports.SUSHI_CALCULATIONS_BLACKSLIST = exports.CURVE_CALCULATIONS_BLACKSLIST = exports.AAVE_ORACLE_BLACKLIST = exports.INCH_ORACLE_BLACKLIST = exports.YEARN_LENS_BLACKLIST = exports.UNISWAP_FORKS_ROUTER_ADDRESSES = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.CURVE_REGISTRY_ADDRESSES = exports.CURVE_CALCULATIONS_ADDRESS = exports.AAVE_ORACLE_CONTRACT_ADDRESS = exports.INCH_ORACLE_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.NETWORK_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("../common/types");
exports.NETWORK_STRING = "optimism";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0xb082d9f4734c535d9d80536f7e87a6f4f471bf65"), graph_ts_1.BigInt.fromI32(18109291));
exports.INCH_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x11dee30e710b8d4a8630392781cc3c0046365d4c"), graph_ts_1.BigInt.fromI32(0));
exports.AAVE_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0xd81eb3728a631871a7ebbad631b5f424909f0c77"), graph_ts_1.BigInt.fromI32(4365625));
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x0ffe8434eae67c9838b12c3cd11ac4005daa7227"), graph_ts_1.BigInt.fromI32(18368996));
exports.CURVE_REGISTRY_ADDRESSES = [
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0xc5cfada84e902ad92dd40194f0883ad49639b023"), graph_ts_1.BigInt.fromI32(2373837)),
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x7da64233fefb352f8f501b357c018158ed8aa455"), graph_ts_1.BigInt.fromI32(3729171)),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SUSHISWAP_CALCULATIONS_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x5fd3815dcb668200a662114fbc9af13ac0a55b4d"), graph_ts_1.BigInt.fromI32(18216910));
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x9c12939390052919af3155f41bf4160fd3666a6f"), // Velodrame
    graph_ts_1.BigInt.fromI32(19702709)),
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
exports.WHITELISTED_TOKENS.set("USDC", types_1.TokenInfo.set("USDC", 6, graph_ts_1.Address.fromString("0x7f5c764cbc14f9669b88837ca1490cca17c31607")));
exports.WHITELISTED_TOKENS.set("USDT", types_1.TokenInfo.set("USDT", 6, graph_ts_1.Address.fromString("0x94b008aa00579c1307b0ef2c499ad98a8ce58e58")));
exports.WHITELISTED_TOKENS.set("DAI", types_1.TokenInfo.set("DAI", 18, graph_ts_1.Address.fromString("0xda10009cbd5d07dd0cecc66161fc93d7c9000da1")));
exports.WHITELISTED_TOKENS.set("WETH", types_1.TokenInfo.set("WETH", 18, graph_ts_1.Address.fromString("0x4200000000000000000000000000000000000006")));
exports.WHITELISTED_TOKENS.set("NATIVE_TOKEN", types_1.TokenInfo.set("Optimism", 18, graph_ts_1.Address.fromString("0x4200000000000000000000000000000000000042")));
class config {
    yearnLens() {
        return exports.YEARN_LENS_CONTRACT_ADDRESS;
    }
    yearnLensBlacklist() {
        return exports.YEARN_LENS_BLACKLIST;
    }
    inchOracle() {
        return exports.INCH_ORACLE_CONTRACT_ADDRESS;
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
        return exports.CURVE_CALCULATIONS_ADDRESS;
    }
    curveCalculationsBlacklist() {
        return exports.CURVE_CALCULATIONS_BLACKSLIST;
    }
    sushiCalculations() {
        return exports.SUSHISWAP_CALCULATIONS_ADDRESS;
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
