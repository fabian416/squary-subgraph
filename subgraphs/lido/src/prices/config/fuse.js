"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.USDC_ADDRESS = exports.WETH_ADDRESS = exports.ETH_ADDRESS = exports.USDC_TOKEN_DECIMALS = exports.HARDCODED_STABLES = exports.SUSHI_CALCULATIONS_BLACKSLIST = exports.CURVE_CALCULATIONS_BLACKSLIST = exports.AAVE_ORACLE_BLACKLIST = exports.YEARN_LENS_BLACKLIST = exports.UNISWAP_FORKS_ROUTER_ADDRESSES = exports.CURVE_REGISTRY_ADDRESSES = exports.CURVE_CALCULATIONS_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.AAVE_ORACLE_CONTRACT_ADDRESS = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.NETWORK_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("../common/types");
exports.NETWORK_STRING = "fuse";
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
    new types_1.OracleContract("0xe3f85aad0c8dd7337427b9df5d0fb741d65eeeb5", 15645719),
    new types_1.OracleContract("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506", 12936314), // Sushiswap
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
exports.ETH_ADDRESS = graph_ts_1.Address.fromString("0xa722c13135930332eb3d749b2f0906559d2c5b99");
exports.WETH_ADDRESS = graph_ts_1.Address.fromString("0x0be9e53fd7edac9f859882afdda116645287c629" // Wrapped Fuse (WFUSE)
);
exports.USDC_ADDRESS = graph_ts_1.Address.fromString("0x620fd5fa44be6af63715ef4e65ddfa0387ad13f5");
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
    getOracleOverride(tokenAddr, block) {
        return null;
    }
}
exports.config = config;
