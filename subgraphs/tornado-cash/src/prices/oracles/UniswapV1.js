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
exports.getTokenPriceFromUniswapV1 = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const UniswapV1DAI_1 = require("../../../generated/TornadoCash01/UniswapV1DAI");
const UniswapV1USDC_1 = require("../../../generated/TornadoCash01/UniswapV1USDC");
const UniswapV1cDAI_1 = require("../../../generated/TornadoCash01/UniswapV1cDAI");
function getUniswapV1DaiContract(network) {
    return UniswapV1DAI_1.UniswapV1DAI.bind(constants.UNISWAP_DAI_CONTRACT_ADDRESS.get(network));
}
function getUniswapV1UsdcContract(network) {
    return UniswapV1USDC_1.UniswapV1USDC.bind(constants.UNISWAP_USDC_CONTRACT_ADDRESS.get(network));
}
function getUniswapV1cDAIContract(network) {
    return UniswapV1cDAI_1.UniswapV1cDAI.bind(constants.UNISWAP_cDAI_CONTRACT_ADDRESS.get(network));
}
function getTokenPriceFromUniswapV1(tokenAddr, network) {
    let tokensMapping = constants.WHITELIST_TOKENS_MAP.get(network);
    if (tokenAddr == tokensMapping.get("USDC")) {
        return types_1.CustomPriceType.initialize(graph_ts_1.BigInt.fromString("10")
            .pow(constants.DEFAULT_USDC_DECIMALS)
            .toBigDecimal(), constants.DEFAULT_USDC_DECIMALS);
    }
    else if (tokenAddr == tokensMapping.get("USDT")) {
        return types_1.CustomPriceType.initialize(graph_ts_1.BigInt.fromString("10")
            .pow(constants.DEFAULT_USDT_DECIMALS)
            .toBigDecimal(), constants.DEFAULT_USDT_DECIMALS);
    }
    else if (tokenAddr == tokensMapping.get("DAI")) {
        return types_1.CustomPriceType.initialize(graph_ts_1.BigInt.fromString("10")
            .pow(constants.DEFAULT_DAI_DECIMALS)
            .toBigDecimal(), constants.DEFAULT_DAI_DECIMALS);
    }
    const daiContract = getUniswapV1DaiContract(network);
    const usdcContract = getUniswapV1UsdcContract(network);
    if (!daiContract || !usdcContract) {
        return new types_1.CustomPriceType();
    }
    let daiToEthPrice = utils
        .readValue(daiContract.try_getTokenToEthOutputPrice(graph_ts_1.BigInt.fromString("10").pow(constants.DEFAULT_ETH_DECIMALS)), constants.BIGINT_ZERO)
        .toBigDecimal();
    let usdcToEthPrice = utils
        .readValue(usdcContract.try_getTokenToEthOutputPrice(graph_ts_1.BigInt.fromString("10").pow(constants.DEFAULT_ETH_DECIMALS)), constants.BIGINT_ZERO)
        .toBigDecimal();
    let ethPrice = daiToEthPrice
        .div(graph_ts_1.BigInt.fromString("10")
        .pow(constants.DEFAULT_DAI_DECIMALS)
        .toBigDecimal())
        .plus(usdcToEthPrice.div(graph_ts_1.BigInt.fromString("10")
        .pow(constants.DEFAULT_USDC_DECIMALS)
        .toBigDecimal()))
        .times(graph_ts_1.BigInt.fromString("10")
        .pow(constants.DEFAULT_ETH_DECIMALS)
        .toBigDecimal())
        .div(graph_ts_1.BigDecimal.fromString("2"));
    if (tokenAddr == tokensMapping.get("ETH")) {
        return types_1.CustomPriceType.initialize(ethPrice, constants.DEFAULT_ETH_DECIMALS);
    }
    else if (tokenAddr == tokensMapping.get("cDAI")) {
        let cDAIContract = getUniswapV1cDAIContract(network);
        let ethTocDAIPrice = utils
            .readValue(cDAIContract.try_getEthToTokenOutputPrice(graph_ts_1.BigInt.fromString("10").pow(constants.DEFAULT_cDAI_DECIMALS)), constants.BIGINT_ZERO)
            .toBigDecimal();
        let cDAIPrice = ethTocDAIPrice.times(ethPrice);
        return types_1.CustomPriceType.initialize(cDAIPrice, 2 * constants.DEFAULT_ETH_DECIMALS);
    }
    return new types_1.CustomPriceType();
}
exports.getTokenPriceFromUniswapV1 = getTokenPriceFromUniswapV1;
