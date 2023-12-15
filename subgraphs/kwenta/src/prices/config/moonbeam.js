"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.USDC_ADDRESS = exports.WETH_ADDRESS = exports.ETH_ADDRESS = exports.USDC_TOKEN_DECIMALS = exports.HARDCODED_STABLES = exports.SUSHI_CALCULATIONS_BLACKSLIST = exports.CURVE_CALCULATIONS_BLACKSLIST = exports.AAVE_ORACLE_BLACKLIST = exports.YEARN_LENS_BLACKLIST = exports.UNISWAP_FORKS_ROUTER_ADDRESSES = exports.CURVE_REGISTRY_ADDRESSES = exports.CURVE_CALCULATIONS_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.AAVE_ORACLE_CONTRACT_ADDRESS = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.NETWORK_STRING = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers, @typescript-eslint/no-unused-vars */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("../common/types");
exports.NETWORK_STRING = "moonbeam";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = new types_1.OracleContract();
exports.CHAIN_LINK_CONTRACT_ADDRESS = new types_1.OracleContract();
exports.AAVE_ORACLE_CONTRACT_ADDRESS = new types_1.OracleContract();
exports.SUSHISWAP_CALCULATIONS_ADDRESS = new types_1.OracleContract();
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = new types_1.OracleContract();
exports.CURVE_REGISTRY_ADDRESSES = [
    new types_1.OracleContract("0xc2b1df84112619d190193e48148000e3990bf627", 1452049),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
    new types_1.OracleContract("0x445fe580ef8d70ff569ab36e80c647af338db351", 503734), // SushiSwap
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// BLACKLISTED TOKENS ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_BLACKLIST = [];
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
exports.USDC_TOKEN_DECIMALS = graph_ts_1.BigInt.fromI32(6);
exports.ETH_ADDRESS = graph_ts_1.Address.fromString("0xfa9343c3897324496a05fc75abed6bac29f8a40f");
exports.WETH_ADDRESS = graph_ts_1.Address.fromString("0xacc15dc74880c9944775448304b263d191c6077f");
exports.USDC_ADDRESS = graph_ts_1.Address.fromString("0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b");
class config {
    network() {
        return exports.NETWORK_STRING;
    }
    yearnLens() {
        return exports.YEARN_LENS_CONTRACT_ADDRESS;
    }
    chainLink() {
        return exports.CHAIN_LINK_CONTRACT_ADDRESS;
    }
    yearnLensBlacklist() {
        return exports.YEARN_LENS_BLACKLIST;
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
    ethAddress() {
        return exports.ETH_ADDRESS;
    }
    wethAddress() {
        return exports.WETH_ADDRESS;
    }
    usdcAddress() {
        return exports.USDC_ADDRESS;
    }
    usdcTokenDecimals() {
        return exports.USDC_TOKEN_DECIMALS;
    }
}
exports.config = config;
