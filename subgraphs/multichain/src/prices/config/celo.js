"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.USDC_ADDRESS = exports.WETH_ADDRESS = exports.ETH_ADDRESS = exports.USDC_TOKEN_DECIMALS = exports.HARDCODED_STABLES = exports.SUSHI_CALCULATIONS_BLACKSLIST = exports.CURVE_CALCULATIONS_BLACKSLIST = exports.AAVE_ORACLE_BLACKLIST = exports.YEARN_LENS_BLACKLIST = exports.UNISWAP_FORKS_ROUTER_ADDRESSES = exports.CURVE_REGISTRY_ADDRESSES = exports.CURVE_CALCULATIONS_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.AAVE_ORACLE_CONTRACT_ADDRESS = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.NETWORK_STRING = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("../common/types");
exports.NETWORK_STRING = "celo";
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
exports.CURVE_REGISTRY_ADDRESSES = [];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
    new types_1.OracleContract("0xe3d8bd6aed4f159bc8000a9cd47cffdb95f96121", 5272598),
    new types_1.OracleContract("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506", 7254057), // Sushiswap
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
exports.ETH_ADDRESS = graph_ts_1.Address.fromString("0x122013fd7df1c6f636a5bb8f03108e876548b455");
exports.WETH_ADDRESS = graph_ts_1.Address.fromString("0x471ece3750da237f93b8e339c536989b8978a438" // Celo native asset (CELO)
);
exports.USDC_ADDRESS = graph_ts_1.Address.fromString("0x37f750b7cc259a2f741af45294f6a16572cf5cad");
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
