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
exports.getUsdPrice = exports.getUsdPricePerToken = void 0;
const constants = __importStar(require("./common/constants"));
const types_1 = require("./common/types");
const CurveRouter_1 = require("./routers/CurveRouter");
const ChainLinkFeed_1 = require("./oracles/ChainLinkFeed");
const YearnLensOracle_1 = require("./oracles/YearnLensOracle");
const UniswapRouter_1 = require("./routers/UniswapRouter");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const SushiSwapRouter_1 = require("./routers/SushiSwapRouter");
const CalculationsSushiswap_1 = require("./calculations/CalculationsSushiswap");
const CalculationsCurve_1 = require("./calculations/CalculationsCurve");
const constants_1 = require("../common/constants");
function getUsdPricePerToken(tokenAddr, skipSources = []) {
    // Check if tokenAddr is a NULL Address
    if (tokenAddr.toHex() == constants.ZERO_ADDRESS_STRING) {
        return new types_1.CustomPriceType();
    }
    let network = graph_ts_1.dataSource.network();
    // Skip optimism as support has not been added
    if (network == "optimism") {
        return new types_1.CustomPriceType();
    }
    // 1. Yearn Lens Oracle
    if (!skipSources.includes(constants_1.PriceSource.YEARN)) {
        let yearnLensPrice = (0, YearnLensOracle_1.getTokenPriceFromYearnLens)(tokenAddr, network);
        if (!yearnLensPrice.reverted) {
            graph_ts_1.log.warning("[YearnLensOracle] tokenAddress: {}, Price: {}", [
                tokenAddr.toHexString(),
                yearnLensPrice.usdPrice.div(yearnLensPrice.decimalsBaseTen).toString(),
            ]);
            return yearnLensPrice;
        }
    }
    // 2. ChainLink Feed Registry
    if (!skipSources.includes(constants_1.PriceSource.CHAINLINK)) {
        let chainLinkPrice = (0, ChainLinkFeed_1.getTokenPriceFromChainLink)(tokenAddr, network);
        if (!chainLinkPrice.reverted) {
            graph_ts_1.log.warning("[ChainLinkFeed] tokenAddress: {}, Price: {}", [
                tokenAddr.toHexString(),
                chainLinkPrice.usdPrice.div(chainLinkPrice.decimalsBaseTen).toString(),
            ]);
            return chainLinkPrice;
        }
    }
    // 3. CalculationsCurve
    if (!skipSources.includes(constants_1.PriceSource.CURVE_CALC)) {
        let calculationsCurvePrice = (0, CalculationsCurve_1.getTokenPriceFromCalculationCurve)(tokenAddr, network);
        if (!calculationsCurvePrice.reverted) {
            graph_ts_1.log.warning("[CalculationsCurve] tokenAddress: {}, Price: {}", [
                tokenAddr.toHexString(),
                calculationsCurvePrice.usdPrice
                    .div(calculationsCurvePrice.decimalsBaseTen)
                    .toString(),
            ]);
            return calculationsCurvePrice;
        }
    }
    // 4. CalculationsSushiSwap
    if (!skipSources.includes(constants_1.PriceSource.SUSHISWAP_CALC)) {
        let calculationsSushiSwapPrice = (0, CalculationsSushiswap_1.getTokenPriceFromSushiSwap)(tokenAddr, network);
        if (!calculationsSushiSwapPrice.reverted) {
            graph_ts_1.log.warning("[CalculationsSushiSwap] tokenAddress: {}, Price: {}", [
                tokenAddr.toHexString(),
                calculationsSushiSwapPrice.usdPrice
                    .div(calculationsSushiSwapPrice.decimalsBaseTen)
                    .toString(),
            ]);
            return calculationsSushiSwapPrice;
        }
    }
    // 5. Curve Router
    if (!skipSources.includes(constants_1.PriceSource.CURVE_ROUTER)) {
        let curvePrice = (0, CurveRouter_1.getCurvePriceUsdc)(tokenAddr, network);
        if (!curvePrice.reverted) {
            graph_ts_1.log.warning("[CurveRouter] tokenAddress: {}, Price: {}", [
                tokenAddr.toHexString(),
                curvePrice.usdPrice.div(curvePrice.decimalsBaseTen).toString(),
            ]);
            return curvePrice;
        }
    }
    // 6. Uniswap Router
    if (!skipSources.includes(constants_1.PriceSource.UNISWAP_ROUTER)) {
        let uniswapPrice = (0, UniswapRouter_1.getPriceUsdc)(tokenAddr, network);
        if (!uniswapPrice.reverted) {
            graph_ts_1.log.warning("[UniswapRouter] tokenAddress: {}, Price: {}", [
                tokenAddr.toHexString(),
                uniswapPrice.usdPrice.div(uniswapPrice.decimalsBaseTen).toString(),
            ]);
            return uniswapPrice;
        }
    }
    // 7. SushiSwap Router
    if (!skipSources.includes(constants_1.PriceSource.SUSHISWAP_ROUTER)) {
        let sushiswapPrice = (0, SushiSwapRouter_1.getPriceUsdc)(tokenAddr, network);
        if (!sushiswapPrice.reverted) {
            graph_ts_1.log.warning("[SushiSwapRouter] tokenAddress: {}, Price: {}", [
                tokenAddr.toHexString(),
                sushiswapPrice.usdPrice.div(sushiswapPrice.decimalsBaseTen).toString(),
            ]);
            return sushiswapPrice;
        }
    }
    graph_ts_1.log.warning("[Oracle] Failed to Fetch Price, tokenAddr: {}", [
        tokenAddr.toHexString(),
    ]);
    return new types_1.CustomPriceType();
}
exports.getUsdPricePerToken = getUsdPricePerToken;
function getUsdPrice(tokenAddr, amount) {
    let tokenPrice = getUsdPricePerToken(tokenAddr);
    if (!tokenPrice.reverted) {
        return tokenPrice.usdPrice.times(amount).div(tokenPrice.decimalsBaseTen);
    }
    return constants.BIGDECIMAL_ZERO;
}
exports.getUsdPrice = getUsdPrice;