"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.USDC_ADDRESS = exports.WETH_ADDRESS = exports.ETH_ADDRESS = exports.USDC_TOKEN_DECIMALS = exports.HARDCODED_STABLES = exports.SUSHI_CALCULATIONS_BLACKSLIST = exports.CURVE_CALCULATIONS_BLACKSLIST = exports.AAVE_ORACLE_BLACKLIST = exports.YEARN_LENS_BLACKLIST = exports.UNISWAP_FACTORY_ADDRESSES = exports.UNISWAP_FORKS_ROUTER_ADDRESSES = exports.CURVE_REGISTRY_ADDRESSES = exports.CURVE_CALCULATIONS_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.AAVE_ORACLE_CONTRACT_ADDRESS = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.NETWORK_STRING = void 0;
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../sdk/util/constants");
exports.NETWORK_STRING = "arbitrum-one";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = graph_ts_1.Address.fromString("0x043518ab266485dc085a1db095b8d9c2fc78e9b9");
exports.CHAIN_LINK_CONTRACT_ADDRESS = constants.NULL.TYPE_ADDRESS;
exports.AAVE_ORACLE_CONTRACT_ADDRESS = graph_ts_1.Address.fromString("0xb56c2f0b653b2e0b10c9b928c8580ac5df02c7c7");
exports.SUSHISWAP_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x5ea7e501c9a23f4a76dc7d33a11d995b13a1dd25");
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x3268c3bda100ef0ff3c2d044f23eab62c80d78d2");
exports.CURVE_REGISTRY_ADDRESSES = [
    graph_ts_1.Address.fromString("0x445fe580ef8d70ff569ab36e80c647af338db351"),
    graph_ts_1.Address.fromString("0x0e9fbb167df83ede3240d6a5fa5d40c6c6851e15"),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
    graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"), // SushiSwap
];
exports.UNISWAP_FACTORY_ADDRESSES = graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS);
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
exports.ETH_ADDRESS = graph_ts_1.Address.fromString("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
exports.WETH_ADDRESS = graph_ts_1.Address.fromString("0x82af49447d8a07e3bd95bd0d56f35241523fbab1");
exports.USDC_ADDRESS = graph_ts_1.Address.fromString("0xff970a61a04b1ca14834a43f5de4533ebddb5cc8");
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
    uniswapFactory() {
        return exports.UNISWAP_FACTORY_ADDRESSES;
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
