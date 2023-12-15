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
exports.NETWORK_STRING = "mainnet";
///////////////////////////////////////////////////////////////////////////
///////////////////// CALCULATIONS/ORACLE CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0x83d95e0d5f402511db06817aff3f9ea88224b030"
);
exports.CHAIN_LINK_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"
);
exports.AAVE_ORACLE_CONTRACT_ADDRESS = constants.NULL.TYPE_ADDRESS;
exports.SUSHISWAP_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString(
  "0x8263e161A855B644f582d9C164C66aABEe53f927"
);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString(
  "0x25BF7b72815476Dd515044F9650Bf79bAd0Df655"
);
exports.CURVE_REGISTRY_ADDRESSES = [
  graph_ts_1.Address.fromString("0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c"),
  graph_ts_1.Address.fromString("0x8F942C20D02bEfc377D41445793068908E2250D0"),
];
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP FORKS CONTRACT ////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_FORKS_ROUTER_ADDRESSES = [
  graph_ts_1.Address.fromString("0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"),
  graph_ts_1.Address.fromString("0x7a250d5630b4cf539739df2c5dacb4c659f2488d"), // Uniswap
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
  graph_ts_1.Address.fromString("0x5f98805a4e8be255a32880fdec7f6728c6568ba0"),
  graph_ts_1.Address.fromString("0x8f4063446f5011bc1c9f79a819efe87776f23704"),
  graph_ts_1.Address.fromString("0xb0f75e97a114a4eb4a425edc48990e6760726709"),
  graph_ts_1.Address.fromString("0xc8c79fcd0e859e7ec81118e91ce8e4379a481ee6"),
  graph_ts_1.Address.fromString("0xd997f35c9b1281b82c8928039d14cddab5e13c20"),
  graph_ts_1.Address.fromString("0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb2"),
  graph_ts_1.Address.fromString("0x4fd63966879300cafafbb35d157dc5229278ed23"),
  graph_ts_1.Address.fromString("0x9210f1204b5a24742eba12f710636d76240df3d0"),
  graph_ts_1.Address.fromString("0x804cdb9116a10bb78768d3252355a1b18067bf8f"),
  graph_ts_1.Address.fromString("0x2bbf681cc4eb09218bee85ea2a5d3d13fa40fc0c"),
  graph_ts_1.Address.fromString("0x652d486b80c461c397b0d95612a404da936f3db3"),
  graph_ts_1.Address.fromString("0xa3823e50f20982656557a4a6a9c06ba5467ae908"),
  graph_ts_1.Address.fromString("0xe6bcc79f328eec93d4ec8f7ed35534d9ab549faa"),
  graph_ts_1.Address.fromString("0x82698aecc9e28e9bb27608bd52cf57f704bd1b83"),
  graph_ts_1.Address.fromString("0xae37d54ae477268b9997d4161b96b8200755935c"),
  graph_ts_1.Address.fromString("0x2f4eb100552ef93840d5adc30560e5513dfffacb"), // bb-a-USDT
];
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.USDC_TOKEN_DECIMALS = graph_ts_1.BigInt.fromI32(6);
exports.ETH_ADDRESS = graph_ts_1.Address.fromString(
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
);
exports.WETH_ADDRESS = graph_ts_1.Address.fromString(
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
);
exports.USDC_ADDRESS = graph_ts_1.Address.fromString(
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
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
