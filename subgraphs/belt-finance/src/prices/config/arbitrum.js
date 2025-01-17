"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config =
  exports.USDC_ADDRESS =
  exports.WETH_ADDRESS =
  exports.ETH_ADDRESS =
  exports.USDC_TOKEN_DECIMALS =
  exports.HARDCODED_STABLES =
  exports.SUSHI_CALCULATIONS_BLACKSLIST =
  exports.CURVE_CALCULATIONS_BLACKSLIST =
  exports.AAVE_ORACLE_BLACKLIST =
  exports.YEARN_LENS_BLACKLIST =
  exports.UNISWAP_FORKS_ROUTER_ADDRESSES =
  exports.CURVE_REGISTRY_ADDRESSES =
  exports.CURVE_CALCULATIONS_ADDRESS =
  exports.SUSHISWAP_CALCULATIONS_ADDRESS =
  exports.AAVE_ORACLE_CONTRACT_ADDRESS =
  exports.CHAIN_LINK_CONTRACT_ADDRESS =
  exports.YEARN_LENS_CONTRACT_ADDRESS =
  exports.NETWORK_STRING =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "arbitrum-one";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0x043518ab266485dc085a1db095b8d9c2fc78e9b9"
);
exports.CHAIN_LINK_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"
);
exports.AAVE_ORACLE_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0xb56c2F0B653B2e0b10C9b928C8580Ac5Df02C7C7"
);
exports.SUSHISWAP_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString(
  "0x5ea7e501c9a23f4a76dc7d33a11d995b13a1dd25"
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString(
  "0x3268c3bda100ef0ff3c2d044f23eab62c80d78d2"
);
exports.CURVE_REGISTRY_ADDRESSES = [
  graph_ts_1.Address.fromString("0x445FE580eF8d70FF569aB36e80c647af338db351"),
  graph_ts_1.Address.fromString("0x0E9fBb167DF83EdE3240D6a5fa5d40c6C6851e15"),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
  graph_ts_1.Address.fromString("0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"), // SushiSwap
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
exports.ETH_ADDRESS = graph_ts_1.Address.fromString(
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
);
exports.WETH_ADDRESS = graph_ts_1.Address.fromString(
  "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
);
exports.USDC_ADDRESS = graph_ts_1.Address.fromString(
  "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"
);
class config {
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
