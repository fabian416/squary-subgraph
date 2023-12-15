"use strict";
/* eslint-disable @typescript-eslint/no-magic-numbers */
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.WHITELISTED_TOKENS = exports.HARDCODED_STABLES = exports.CURVE_CALCULATIONS_BLACKSLIST = exports.AAVE_ORACLE_BLACKLIST = exports.INCH_ORACLE_BLACKLIST = exports.SUSHI_CALCULATIONS_BLACKSLIST = exports.YEARN_LENS_BLACKLIST = exports.UNISWAP_FORKS_ROUTER_ADDRESSES = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.CURVE_REGISTRY_ADDRESSES = exports.CURVE_CALCULATIONS_ADDRESS = exports.AAVE_ORACLE_CONTRACT_ADDRESS = exports.INCH_ORACLE_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.NETWORK_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("../common/types");
exports.NETWORK_STRING = "fantom";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x57aa88a0810dfe3f9b71a9b179dd8bf5f956c46a"), graph_ts_1.BigInt.fromI32(17091856));
exports.INCH_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0xe8e598a1041b6fdb13999d275a202847d9b654ca"), graph_ts_1.BigInt.fromI32(34026291));
exports.AAVE_ORACLE_CONTRACT_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0xfd6f3c1845604c8ae6c6e402ad17fb9885160754"), graph_ts_1.BigInt.fromI32(33142059));
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x0b53e9df372e72d8fdcdbedfbb56059957a37128"), graph_ts_1.BigInt.fromI32(27067399));
exports.CURVE_REGISTRY_ADDRESSES = [
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x0f854ea9f38cea4b1c2fc79047e9d0134419d5d6"), graph_ts_1.BigInt.fromI32(5655918)),
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x4fb93d7d320e8a263f22f62c2059dfc2a8bcbc4c"), graph_ts_1.BigInt.fromI32(27552509)),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SUSHISWAP_CALCULATIONS_ADDRESS = types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x44536de2220987d098d1d29d3aafc7f7348e9ee4"), graph_ts_1.BigInt.fromI32(3809480));
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0xbe4fc72f8293f9d3512d58b969c98c3f676cb957"), // Uniswap
    graph_ts_1.BigInt.fromI32(3796241)),
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"), // SushiSwap
    graph_ts_1.BigInt.fromI32(2457904)),
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0x16327e3fbdaca3bcf7e38f5af2599d2ddc33ae52"), // Spiritswap
    graph_ts_1.BigInt.fromI32(4250168)),
    types_1.ContractInfo.set(graph_ts_1.Address.fromString("0xf491e7b69e4244ad4002bc14e878a34207e38c29"), // SpookySwap
    graph_ts_1.BigInt.fromI32(4242185)),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// BLACKLISTED TOKENS ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_BLACKLIST = [
    graph_ts_1.Address.fromString("0xe578c856933d8e1082740bf7661e379aa2a30b26"),
    graph_ts_1.Address.fromString("0xe3a486c1903ea794eed5d5fa0c9473c7d7708f40"),
    graph_ts_1.Address.fromString("0xc664fc7b8487a3e10824cda768c1d239f2403bbe"),
    graph_ts_1.Address.fromString("0x940f41f0ec9ba1a34cf001cc03347ac092f5f6b5"),
    graph_ts_1.Address.fromString("0x95dd59343a893637be1c3228060ee6afbf6f0730"),
    graph_ts_1.Address.fromString("0xdbf31df14b66535af65aac99c32e9ea844e14501"),
    graph_ts_1.Address.fromString("0xc931f61b1534eb21d8c11b24f3f5ab2471d4ab50"),
    graph_ts_1.Address.fromString("0xad84341756bf337f5a0164515b1f6f993d194e1f"),
    graph_ts_1.Address.fromString("0x658b0c7613e890ee50b8c4bc6a3f41ef411208ad"),
    graph_ts_1.Address.fromString("0x25c130b2624cf12a4ea30143ef50c5d68cefa22f"), // geistETH
];
exports.SUSHI_CALCULATIONS_BLACKSLIST = [
    graph_ts_1.Address.fromString("0xdbf31df14b66535af65aac99c32e9ea844e14501"),
    graph_ts_1.Address.fromString("0xc931f61b1534eb21d8c11b24f3f5ab2471d4ab50"),
    graph_ts_1.Address.fromString("0xad84341756bf337f5a0164515b1f6f993d194e1f"),
    graph_ts_1.Address.fromString("0x658b0c7613e890ee50b8c4bc6a3f41ef411208ad"), // fETH
];
exports.INCH_ORACLE_BLACKLIST = [];
exports.AAVE_ORACLE_BLACKLIST = [];
exports.CURVE_CALCULATIONS_BLACKSLIST = [];
///////////////////////////////////////////////////////////////////////////
//////////////////////////// HARDCODED STABLES ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.HARDCODED_STABLES = [];
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.WHITELISTED_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELISTED_TOKENS.set("USDC", types_1.TokenInfo.set("USDC", 6, graph_ts_1.Address.fromString("0x04068da6c83afcfa0e13ba15a6696662335d5b75")));
exports.WHITELISTED_TOKENS.set("USDT", types_1.TokenInfo.set("USDT", 6, graph_ts_1.Address.fromString("0x049d68029688eabf473097a2fc38ef61633a3c7a")));
exports.WHITELISTED_TOKENS.set("DAI", types_1.TokenInfo.set("DAI", 18, graph_ts_1.Address.fromString("0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e")));
exports.WHITELISTED_TOKENS.set("WETH", types_1.TokenInfo.set("WETH", 18, graph_ts_1.Address.fromString("0x25c130b2624cf12a4ea30143ef50c5d68cefa22f")));
exports.WHITELISTED_TOKENS.set("NATIVE_TOKEN", types_1.TokenInfo.set("WFTM", 18, graph_ts_1.Address.fromString("0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83")));
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
