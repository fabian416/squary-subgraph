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
exports.config = exports.USDC_ADDRESS = exports.WETH_ADDRESS = exports.ETH_ADDRESS = exports.USDC_TOKEN_DECIMALS = exports.HARDCODED_STABLES = exports.SUSHI_CALCULATIONS_BLACKSLIST = exports.CURVE_CALCULATIONS_BLACKSLIST = exports.AAVE_ORACLE_BLACKLIST = exports.YEARN_LENS_BLACKLIST = exports.UNISWAP_FORKS_ROUTER_ADDRESSES = exports.CURVE_REGISTRY_ADDRESSES = exports.CURVE_CALCULATIONS_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.AAVE_ORACLE_CONTRACT_ADDRESS = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.NETWORK_STRING = void 0;
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "mainnet";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = graph_ts_1.Address.fromString("0x83d95e0d5f402511db06817aff3f9ea88224b030");
exports.CHAIN_LINK_CONTRACT_ADDRESS = graph_ts_1.Address.fromString("0x47fb2585d2c56fe188d0e6ec628a38b74fceeedf");
exports.AAVE_ORACLE_CONTRACT_ADDRESS = constants.NULL.TYPE_ADDRESS;
exports.SUSHISWAP_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x8263e161a855b644f582d9c164c66aabee53f927");
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x25bf7b72815476dd515044f9650bf79bad0df655");
exports.CURVE_REGISTRY_ADDRESSES = [
    graph_ts_1.Address.fromString("0x7d86446ddb609ed0f5f8684acf30380a356b2b4c"),
    graph_ts_1.Address.fromString("0x8f942c20d02befc377d41445793068908e2250d0"),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
    graph_ts_1.Address.fromString("0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f"),
    graph_ts_1.Address.fromString("0x7a250d5630b4cf539739df2c5dacb4c659f2488d"), // Uniswap
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// BLACKLISTED TOKENS ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_BLACKLIST = [
    graph_ts_1.Address.fromString("0x5f98805a4e8be255a32880fdec7f6728c6568ba0"),
    graph_ts_1.Address.fromString("0x8daebade922df735c38c80c7ebd708af50815faa"),
    graph_ts_1.Address.fromString("0x0316eb71485b0ab14103307bf65a021042c6d380"),
    graph_ts_1.Address.fromString("0xca3d75ac011bf5ad07a98d02f18225f9bd9a6bdf"), // crvTriCrypto
];
exports.AAVE_ORACLE_BLACKLIST = [];
exports.CURVE_CALCULATIONS_BLACKSLIST = [
    graph_ts_1.Address.fromString("0xca3d75ac011bf5ad07a98d02f18225f9bd9a6bdf"),
    graph_ts_1.Address.fromString("0xc4ad29ba4b3c580e6d59105fff484999997675ff"), // crv3Crypto
];
exports.SUSHI_CALCULATIONS_BLACKSLIST = [];
///////////////////////////////////////////////////////////////////////////
//////////////////////////// HARDCODED STABLES ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.HARDCODED_STABLES = [
    graph_ts_1.Address.fromString("0xd632f22692fac7611d2aa1c0d552930d43caed3b"),
    graph_ts_1.Address.fromString("0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3"),
    graph_ts_1.Address.fromString("0x5a6a4d54456819380173272a5e8e9b9904bdf41b"),
    graph_ts_1.Address.fromString("0xbc6da0fe9ad5f3b0d58160288917aa56653660e9"),
    graph_ts_1.Address.fromString("0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c"),
    graph_ts_1.Address.fromString("0x57ab1ec28d129707052df4df418d58a2d46d5f51"),
    graph_ts_1.Address.fromString("0xc25a3a3b969415c80451098fa907ec722572917f"),
    graph_ts_1.Address.fromString("0x0000000000085d4780b73119b644ae5ecd22b376"),
    graph_ts_1.Address.fromString("0xecd5e75afb02efa118af914515d6521aabd189f1"),
    graph_ts_1.Address.fromString("0xfd2a8fa60abd58efe3eee34dd494cd491dc14900"),
    graph_ts_1.Address.fromString("0x8ee017541375f6bcd802ba119bddc94dad6911a1"),
    graph_ts_1.Address.fromString("0x5b3b5df2bf2b6543f78e053bd91c4bdd820929f1"),
    graph_ts_1.Address.fromString("0x04b727c7e246ca70d496ecf52e6b6280f3c8077d"),
    graph_ts_1.Address.fromString("0x3175df0976dfa876431c2e9ee6bc45b65d3473cc"),
    graph_ts_1.Address.fromString("0xbcb91e689114b9cc865ad7871845c95241df4105"),
    graph_ts_1.Address.fromString("0x26ea744e5b887e5205727f55dfbe8685e3b21951"),
    graph_ts_1.Address.fromString("0xc2cb1040220768554cf699b0d863a3cd4324ce32"),
    graph_ts_1.Address.fromString("0x04bc0ab673d88ae9dbc9da2380cb6b79c4bca9ae"),
    graph_ts_1.Address.fromString("0xe6354ed5bc4b393a5aad09f21c46e101e692d447"),
    graph_ts_1.Address.fromString("0x3b3ac5386837dc563660fb6a0937dfaa5924333b"),
    graph_ts_1.Address.fromString("0xc2f5fea5197a3d92736500fd7733fcc7a3bbdf3f"),
    graph_ts_1.Address.fromString("0x0c10bf8fcb7bf5412187a595ab97a3609160b5c6"),
    graph_ts_1.Address.fromString("0x028171bca77440897b824ca71d1c56cac55b68a3"),
    graph_ts_1.Address.fromString("0x3ed3b47dd13ec9a98b44e6204a523e766b225811"),
    graph_ts_1.Address.fromString("0xbcca60bb61934080951369a648fb03df4f96263c"),
    graph_ts_1.Address.fromString("0x6c5024cd4f8a59110119c56f8933403a539555eb"),
    graph_ts_1.Address.fromString("0xd71ecff9342a5ced620049e616c5035f1db98620"), // Synth sEUR
];
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.USDC_TOKEN_DECIMALS = graph_ts_1.BigInt.fromI32(6);
exports.ETH_ADDRESS = graph_ts_1.Address.fromString("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
exports.WETH_ADDRESS = graph_ts_1.Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
exports.USDC_ADDRESS = graph_ts_1.Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
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
