"use strict";
/* eslint-disable @typescript-eslint/no-magic-numbers */
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.WHITELISTED_TOKENS = exports.HARDCODED_STABLES = exports.AAVE_ORACLE_BLACKLIST = exports.INCH_ORACLE_BLACKLIST = exports.CURVE_CALCULATIONS_BLACKSLIST = exports.SUSHI_CALCULATIONS_BLACKSLIST = exports.YEARN_LENS_BLACKLIST = exports.UNISWAP_FORKS_ROUTER_ADDRESSES = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.CURVE_REGISTRY_ADDRESSES = exports.CURVE_CALCULATIONS_ADDRESS = exports.AAVE_ORACLE_CONTRACT_ADDRESS = exports.INCH_ORACLE_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.NETWORK_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("../common/types");
exports.NETWORK_STRING = "arbitrum-one";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x043518ab266485dc085a1db095b8d9c2fc78e9b9"), graph_ts_1.BigInt.fromI32(2396321));
exports.INCH_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x735247fb0a604c0adc6cab38ace16d0dba31295f"), graph_ts_1.BigInt.fromI32(781467));
exports.AAVE_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0xb56c2f0b653b2e0b10c9b928c8580ac5df02c7c7"), graph_ts_1.BigInt.fromI32(7740843));
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x3268c3bda100ef0ff3c2d044f23eab62c80d78d2"), graph_ts_1.BigInt.fromI32(11707234));
exports.CURVE_REGISTRY_ADDRESSES = [
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x445fe580ef8d70ff569ab36e80c647af338db351"), graph_ts_1.BigInt.fromI32(1362056)),
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x0e9fbb167df83ede3240d6a5fa5d40c6c6851e15"), graph_ts_1.BigInt.fromI32(4530115)),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SUSHISWAP_CALCULATIONS_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x5ea7e501c9a23f4a76dc7d33a11d995b13a1dd25"), graph_ts_1.BigInt.fromI32(2396120));
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"), // SushiSwap
    graph_ts_1.BigInt.fromI32(73)),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// BLACKLISTED TOKENS ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_BLACKLIST = [
    graph_ts_1.Address.fromString("0x5979d7b546e38e414f7e9822514be443a4800529"),
    graph_ts_1.Address.fromString("0x3f56e0c36d275367b8c502090edf38289b3dea0d"),
    graph_ts_1.Address.fromString("0x64343594ab9b56e99087bfa6f2335db24c2d1f17"),
    graph_ts_1.Address.fromString("0xf0b5ceefc89684889e5f7e0a7775bd100fcd3709"), // digital dollar
];
exports.SUSHI_CALCULATIONS_BLACKSLIST = [
    graph_ts_1.Address.fromString("0x5979d7b546e38e414f7e9822514be443a4800529"), // Wrapped liquid staked Ether 2.0 token
];
exports.CURVE_CALCULATIONS_BLACKSLIST = [
    graph_ts_1.Address.fromString("0x5979d7b546e38e414f7e9822514be443a4800529"), // Wrapped liquid staked Ether 2.0 token
];
exports.INCH_ORACLE_BLACKLIST = [];
exports.AAVE_ORACLE_BLACKLIST = [];
///////////////////////////////////////////////////////////////////////////
//////////////////////////// HARDCODED STABLES ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.HARDCODED_STABLES = [
    graph_ts_1.Address.fromString("0x641441c631e2f909700d2f41fd87f0aa6a6b4edb"),
    graph_ts_1.Address.fromString("0x8616e8ea83f048ab9a5ec513c9412dd2993bce3f"),
    graph_ts_1.Address.fromString("0xeb466342c4d449bc9f53a865d5cb90586f405215"),
    graph_ts_1.Address.fromString("0x625e7708f30ca75bfd92586e17077590c60eb4cd"),
    graph_ts_1.Address.fromString("0x6ab707aca953edaefbc4fd23ba73294241490620"),
    graph_ts_1.Address.fromString("0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee"), // Aave Arbitrum DAI
];
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.WHITELISTED_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELISTED_TOKENS.set("USDC", types_1.TokenInfo.set("USDC", 6, graph_ts_1.Address.fromString("0xff970a61a04b1ca14834a43f5de4533ebddb5cc8")));
exports.WHITELISTED_TOKENS.set("USDT", types_1.TokenInfo.set("USDT", 6, graph_ts_1.Address.fromString("0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9")));
exports.WHITELISTED_TOKENS.set("DAI", types_1.TokenInfo.set("DAI", 18, graph_ts_1.Address.fromString("0xda10009cbd5d07dd0cecc66161fc93d7c9000da1")));
exports.WHITELISTED_TOKENS.set("WETH", types_1.TokenInfo.set("WETH", 18, graph_ts_1.Address.fromString("0x82af49447d8a07e3bd95bd0d56f35241523fbab1")));
exports.WHITELISTED_TOKENS.set("NATIVE_TOKEN", types_1.TokenInfo.set("ETH", 18, graph_ts_1.Address.fromString("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")));
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
