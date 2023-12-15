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
const utils = __importStar(require("./common/utils"));
const constants = __importStar(require("./common/constants"));
const types_1 = require("./common/types");
const AaveOracle = __importStar(require("./oracles/AaveOracle"));
const InchOracle = __importStar(require("./oracles/InchOracle"));
const CurveRouter = __importStar(require("./routers/CurveRouter"));
const ChainLinkFeed = __importStar(require("./oracles/ChainLinkFeed"));
const YearnLensOracle = __importStar(require("./oracles/YearnLensOracle"));
const UniswapForksRouter = __importStar(require("./routers/UniswapForksRouter"));
const CurveCalculations = __importStar(require("./calculations/CalculationsCurve"));
const SushiCalculations = __importStar(require("./calculations/CalculationsSushiswap"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
function getUsdPricePerToken(tokenAddr, block = null) {
    const config = utils.getConfig();
    if (!config || constants.BLACKLISTED_TOKENS.includes(tokenAddr))
        return new types_1.CustomPriceType();
    if (config.hardcodedStables().includes(tokenAddr))
        return types_1.CustomPriceType.initializePegged();
    if (tokenAddr.equals(constants.ETH_ADDRESS))
        return getUsdPricePerToken(config.whitelistedTokens().mustGet(constants.STABLE_TOKENS_STRINGS.WETH)
            .address, block);
    // 1. YearnLens Oracle
    const yearnLensPrice = YearnLensOracle.getTokenPriceUSDC(tokenAddr, block);
    if (!yearnLensPrice.reverted) {
        graph_ts_1.log.info("[YearnLensOracle] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            yearnLensPrice.usdPrice.toString(),
        ]);
        return yearnLensPrice;
    }
    // 2. InchOracle
    const inchOraclePrice = InchOracle.getTokenPriceUSDC(tokenAddr, block);
    if (!inchOraclePrice.reverted) {
        graph_ts_1.log.info("[InchOracle] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            inchOraclePrice.usdPrice.toString(),
        ]);
        return inchOraclePrice;
    }
    // 3. ChainLink Feed Registry
    const chainLinkPrice = ChainLinkFeed.getTokenPriceUSDC(tokenAddr, block);
    if (!chainLinkPrice.reverted) {
        graph_ts_1.log.info("[ChainLinkFeed] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            chainLinkPrice.usdPrice.toString(),
        ]);
        return chainLinkPrice;
    }
    // 4. CalculationsCurve
    const calculationsCurvePrice = CurveCalculations.getTokenPriceUSDC(tokenAddr, block);
    if (!calculationsCurvePrice.reverted) {
        graph_ts_1.log.info("[CalculationsCurve] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            calculationsCurvePrice.usdPrice.toString(),
        ]);
        return calculationsCurvePrice;
    }
    // 5. CalculationsSushiSwap
    const calculationsSushiSwapPrice = SushiCalculations.getTokenPriceUSDC(tokenAddr, block);
    if (!calculationsSushiSwapPrice.reverted) {
        graph_ts_1.log.info("[CalculationsSushiSwap] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            calculationsSushiSwapPrice.usdPrice.toString(),
        ]);
        return calculationsSushiSwapPrice;
    }
    // 6. Aave Oracle
    const aaveOraclePrice = AaveOracle.getTokenPriceUSDC(tokenAddr, block);
    if (!aaveOraclePrice.reverted) {
        graph_ts_1.log.info("[AaveOracle] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            aaveOraclePrice.usdPrice.toString(),
        ]);
        return aaveOraclePrice;
    }
    // 7. Curve Router
    const curvePrice = CurveRouter.getPriceUsdc(tokenAddr, block);
    if (!curvePrice.reverted) {
        graph_ts_1.log.info("[CurveRouter] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            curvePrice.usdPrice.toString(),
        ]);
        return curvePrice;
    }
    // 8. Uniswap Router
    const uniswapPrice = UniswapForksRouter.getTokenPriceUSDC(tokenAddr);
    if (!uniswapPrice.reverted) {
        graph_ts_1.log.info("[UniswapRouter] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            uniswapPrice.usdPrice.toString(),
        ]);
        return uniswapPrice;
    }
    graph_ts_1.log.warning("[Oracle] Failed to Fetch Price, tokenAddr: {}", [
        tokenAddr.toHexString(),
    ]);
    return new types_1.CustomPriceType();
}
exports.getUsdPricePerToken = getUsdPricePerToken;
function getUsdPrice(tokenAddr, amount, block) {
    const tokenPrice = getUsdPricePerToken(tokenAddr, block);
    if (!tokenPrice.reverted)
        return tokenPrice.usdPrice.times(amount);
    return constants.BIGDECIMAL_ZERO;
}
exports.getUsdPrice = getUsdPrice;
