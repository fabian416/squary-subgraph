"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.WHITELISTED_TOKENS = exports.HARDCODED_STABLES = exports.SUSHI_CALCULATIONS_BLACKSLIST = exports.AAVE_ORACLE_BLACKLIST = exports.INCH_ORACLE_BLACKLIST = exports.CURVE_CALCULATIONS_BLACKSLIST = exports.YEARN_LENS_BLACKLIST = exports.INCH_ORACLE_CONTRACT_ADDRESS = exports.UNISWAP_FORKS_ROUTER_ADDRESSES = exports.CURVE_REGISTRY_ADDRESSES = exports.NETWORK_STRING = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("../common/types");
exports.NETWORK_STRING = "bsc";
///////////////////////////////////////////////////////////////////////////
/////////////////////////// CURVE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_REGISTRY_ADDRESSES = [];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x10ed43c718714eb63d5aa57b78b54704e256024e"), // PancakeSwap V2
    graph_ts_1.BigInt.fromI32(6810080)),
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x05ff2b0db69458a0750badebc4f9e13add608c7f"), // PancakeSwap V1
    graph_ts_1.BigInt.fromI32(586899)),
];
exports.INCH_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x27950ecaebb4462e18e8041aaf6ea13ca47af001"), graph_ts_1.BigInt.fromI32(27113941));
///////////////////////////////////////////////////////////////////////////
/////////////////////////// BLACKLISTED TOKENS ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_BLACKLIST = [];
exports.CURVE_CALCULATIONS_BLACKSLIST = [];
exports.INCH_ORACLE_BLACKLIST = [];
exports.AAVE_ORACLE_BLACKLIST = [];
exports.SUSHI_CALCULATIONS_BLACKSLIST = [];
///////////////////////////////////////////////////////////////////////////
//////////////////////////// HARDCODED STABLES ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.HARDCODED_STABLES = [];
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.WHITELISTED_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELISTED_TOKENS.set("USDC", types_1.TokenInfo.set("USDC", 18, graph_ts_1.Address.fromString("0x55d398326f99059ff775485246999027b3197955")));
exports.WHITELISTED_TOKENS.set("USDT", types_1.TokenInfo.set("USDT", 18, graph_ts_1.Address.fromString("0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d")));
exports.WHITELISTED_TOKENS.set("DAI", types_1.TokenInfo.set("DAI", 18, graph_ts_1.Address.fromString("0x6b175474e89094c44da98b954eedeac495271d0f")));
exports.WHITELISTED_TOKENS.set("WETH", types_1.TokenInfo.set("WETH", 18, graph_ts_1.Address.fromString("0x2170ed0880ac9a755fd29b2688956bd959f933f8")));
exports.WHITELISTED_TOKENS.set("NATIVE_TOKEN", types_1.TokenInfo.set("ETH", 18, graph_ts_1.Address.fromString("0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c")));
class config {
    yearnLens() {
        return null;
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
        return null;
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
