"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
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
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "bsc";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = constants.NULL.TYPE_ADDRESS;
exports.CHAIN_LINK_CONTRACT_ADDRESS = constants.NULL.TYPE_ADDRESS;
exports.AAVE_ORACLE_CONTRACT_ADDRESS = constants.NULL.TYPE_ADDRESS;
exports.SUSHISWAP_CALCULATIONS_ADDRESS = constants.NULL.TYPE_ADDRESS;
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = constants.NULL.TYPE_ADDRESS;
exports.CURVE_REGISTRY_ADDRESSES = [];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
  graph_ts_1.Address.fromString("0x10ED43C718714eb63d5aA57B78B54704E256024E"),
  graph_ts_1.Address.fromString("0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F"), // PancakeSwap v1
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
exports.HARDCODED_STABLES = [
  graph_ts_1.Address.fromString("0x1075bea848451a13fd6f696b5d0fda52743e6439"),
  graph_ts_1.Address.fromString("0x18b497f4d5f84958b3ba7911401e145397d73604"),
  graph_ts_1.Address.fromString("0x1a76fe224963818bb3aaa9d6c0603c6178804bf6"),
  graph_ts_1.Address.fromString("0x2240928ce2010b6d069d381a1c82e57bbf887662"),
  graph_ts_1.Address.fromString("0x2aa50d69f00d48ee9cfb97c702f2bce09a11cdc9"),
  graph_ts_1.Address.fromString("0x2c31c265b83c67d4ec5266f621d576d4a7c123ea"),
  graph_ts_1.Address.fromString("0x2d871631058827b703535228fb9ab5f35cf19e76"),
  graph_ts_1.Address.fromString("0x3d4350cd54aef9f9b2c29435e0fa809957b3f30a"),
  graph_ts_1.Address.fromString("0x3f56e0c36d275367b8c502090edf38289b3dea0d"),
  graph_ts_1.Address.fromString("0x469f70cc3f3c3ec11b842c02878c0778a79a34f5"),
  graph_ts_1.Address.fromString("0x52d36668ec4cedd02e3de25b12ecaf4be789198b"),
  graph_ts_1.Address.fromString("0x59a48b66228e601a6873c9faee96a15e59756fbe"),
  graph_ts_1.Address.fromString("0x5b5bd8913d766d005859ce002533d4838b0ebbb5"),
  graph_ts_1.Address.fromString("0x5ee318b2ad8b45675dc169c68a273caf8fb26ee0"),
  graph_ts_1.Address.fromString("0x655853e962dd3cc97077163b19d45375d02a0c19"),
  graph_ts_1.Address.fromString("0x67ff854d61b0f7a4aa3bf4da1f960439fc1df637"),
  graph_ts_1.Address.fromString("0x7b1cf59492391b416c160ad9788d0983def4f23a"),
  graph_ts_1.Address.fromString("0x7ee5010cbd5e499b7d66a7cba2ec3bde5fca8e00"),
  graph_ts_1.Address.fromString("0x8602f98f7738afe9edb37ca945f9b3e1ab2e1204"),
  // Address.fromString("0x88fd584df3f97c64843cd474bdc6f78e398394f4"), // ARTH USD Rebase
  graph_ts_1.Address.fromString("0x8b02998366f7437f6c4138f4b543ea5c000cd608"),
  graph_ts_1.Address.fromString("0x8eb98a16f9a6aa139b3021e23debd7f24ddad06b"),
  graph_ts_1.Address.fromString("0x90c97f71e18723b0cf0dfa30ee176ab653e89f40"),
  graph_ts_1.Address.fromString("0xaa7dfcfa0f90213aff443a7a27c32d386c1f4786"),
  graph_ts_1.Address.fromString("0xaf4de8e872131ae328ce21d909c74705d3aaf452"),
  graph_ts_1.Address.fromString("0xb38b49bae104bbb6a82640094fd61b341a858f78"),
  graph_ts_1.Address.fromString("0xb5102cee1528ce2c760893034a4603663495fd72"),
  graph_ts_1.Address.fromString("0xb69a424df8c737a122d0e60695382b3eec07ff4b"),
  graph_ts_1.Address.fromString("0xb7d9b83c7dc3c7fab2d0159f8b3fa7c4fb081741"),
  graph_ts_1.Address.fromString("0xc1a52e938ffd0eda3c6ad78ce86179adc9d59feb"),
  graph_ts_1.Address.fromString("0xd17479997f34dd9156deef8f95a52d81d265be9c"),
  graph_ts_1.Address.fromString("0xd295f4b58d159167db247de06673169425b50ef2"),
  graph_ts_1.Address.fromString("0xdcecf0664c33321ceca2effce701e710a2d28a3f"),
  graph_ts_1.Address.fromString("0xde7d1ce109236b12809c45b23d22f30dba0ef424"),
  graph_ts_1.Address.fromString("0xe04fe47516c4ebd56bc6291b15d46a47535e736b"),
  graph_ts_1.Address.fromString("0xe1c7c46b666506c6690dce134fcba3f09456e4a9"),
  graph_ts_1.Address.fromString("0xe68b79e51bf826534ff37aa9cee71a3842ee9c70"), // CZUSD
];
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.USDC_TOKEN_DECIMALS = graph_ts_1.BigInt.fromI32(18);
exports.ETH_ADDRESS = constants.NULL.TYPE_ADDRESS;
exports.WETH_ADDRESS = graph_ts_1.Address.fromString(
  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"
);
exports.USDC_ADDRESS = graph_ts_1.Address.fromString(
  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
);
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
