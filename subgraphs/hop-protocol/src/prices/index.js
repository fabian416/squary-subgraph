"use strict";
/* eslint-disable @typescript-eslint/no-magic-numbers */
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
exports.getUsdPrice = exports.getUsdPricePerToken = exports.sqrtPriceX96ToTokenPrices = void 0;
const utils = __importStar(require("./common/utils"));
const constants = __importStar(require("./common/constants"));
const AaveOracle = __importStar(require("./oracles/AaveOracle"));
const CurveRouter = __importStar(require("./routers/CurveRouter"));
const ChainLinkFeed = __importStar(require("./oracles/ChainLinkFeed"));
const YearnLensOracle = __importStar(require("./oracles/YearnLensOracle"));
const UniswapForksRouter = __importStar(require("./routers/UniswapForksRouter"));
const UniswapV2 = __importStar(require("./routers/UniswapV2"));
const CurveCalculations = __importStar(require("./calculations/CalculationsCurve"));
const SushiCalculations = __importStar(require("./calculations/CalculationsSushiswap"));
const UniswapV3_1 = require("../../generated/Bridge/UniswapV3");
const types_1 = require("./common/types");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../sdk/util/constants");
const UniswapPair_1 = require("../../generated/Bridge/UniswapPair");
const Q192 = graph_ts_1.BigInt.fromString("6277101735386680763835789423207666416102355444464034512896");
function sqrtPriceX96ToTokenPrices(sqrtPriceX96) {
    const num = sqrtPriceX96.times(sqrtPriceX96);
    graph_ts_1.log.info("FUNCTION FOUND", []);
    const denom = Q192;
    const price1 = num
        .times(constants_1.PRECISION)
        .div(denom)
        .times((0, constants_1.exponentToBigInt)(18))
        .div((0, constants_1.exponentToBigInt)(18))
        .toBigDecimal()
        .div(constants_1.PRECISION.toBigDecimal());
    const price0 = (0, constants_1.safeDiv)(constants_1.BIGDECIMAL_ONE, price1);
    return [price0, price1];
}
exports.sqrtPriceX96ToTokenPrices = sqrtPriceX96ToTokenPrices;
function getUsdPricePerToken(tokenAddr) {
    if (tokenAddr.toHexString() == constants_1.ZERO_ADDRESS) {
        tokenAddr = graph_ts_1.Address.fromString(constants_1.WETH_ADDRESS);
    }
    if (tokenAddr.equals(constants.NULL.TYPE_ADDRESS)) {
        return new types_1.CustomPriceType();
    }
    if (tokenAddr == graph_ts_1.Address.fromString(constants_1.PolygonHtoken.MATIC)) {
        tokenAddr = graph_ts_1.Address.fromString(constants_1.PolygonToken.MATIC);
    }
    if (tokenAddr.toHexString() == constants_1.PolygonHtoken.ETH) {
        tokenAddr = graph_ts_1.Address.fromString(constants_1.PolygonToken.ETH);
    }
    if (tokenAddr.toHexString() == constants_1.OptimismHtoken.ETH) {
        tokenAddr = graph_ts_1.Address.fromString(constants_1.OptimismToken.ETH);
    }
    if (tokenAddr.toHexString() == constants_1.OptimismHtoken.SNX) {
        tokenAddr = graph_ts_1.Address.fromString(constants_1.OptimismToken.SNX);
    }
    if (tokenAddr.toHexString() == constants_1.XdaiHtoken.ETH) {
        tokenAddr = graph_ts_1.Address.fromString(constants_1.XdaiToken.ETH);
    }
    if (tokenAddr == graph_ts_1.Address.fromString(constants_1.XdaiHtoken.MATIC)) {
        tokenAddr = graph_ts_1.Address.fromString(constants_1.XdaiToken.MATIC);
    }
    if (tokenAddr.toHexString() == constants_1.ArbitrumHtoken.ETH) {
        tokenAddr = graph_ts_1.Address.fromString(constants_1.ArbitrumToken.ETH);
    }
    if (tokenAddr.toHexString() == constants_1.ArbitrumHtoken.rETH) {
        tokenAddr = graph_ts_1.Address.fromString(constants_1.ArbitrumToken.rETH);
    }
    if (constants_1.priceTokens.includes(tokenAddr.toHexString())) {
        return types_1.CustomPriceType.initialize(constants.BIGDECIMAL_USD_PRICE, constants.DEFAULT_USDC_DECIMALS);
    }
    if (tokenAddr.toHexString() == constants_1.OptimismToken.rETH ||
        tokenAddr.toHexString() == constants_1.RewardTokens.rETH_OP ||
        tokenAddr.toHexString() == constants_1.OptimismHtoken.rETH) {
        const uniSwapPair = UniswapV3_1.UniswapV3.bind(graph_ts_1.Address.fromString("0xaefc1edaede6adadcdf3bb344577d45a80b19582"));
        let price;
        const reserve = uniSwapPair.try_slot0();
        if (!reserve.reverted) {
            graph_ts_1.log.warning("[UniswapV3] tokenAddress: {}, SQRT: {}", [
                tokenAddr.toHexString(),
                reserve.value.value1.toString(),
            ]);
            price = sqrtPriceX96ToTokenPrices(reserve.value.value0)[0];
            graph_ts_1.log.warning("[UniswapV3] tokenAddress: {}, Reserve1: {}, Reserve0: {}, Price: {}", [
                tokenAddr.toHexString(),
                reserve.value.value1.toString(),
                reserve.value.value0.toString(),
                price.toString(),
            ]);
            const tokenPrice = getUsdPricePerToken(graph_ts_1.Address.fromString(constants_1.OptimismToken.ETH));
            if (!tokenPrice.reverted) {
                tokenPrice.usdPrice.times(price);
                const val = tokenPrice.usdPrice.times(price);
                const x = types_1.CustomPriceType.initialize(val);
                return x;
            }
        }
    }
    if (tokenAddr.toHexString() == constants_1.ArbitrumHtoken.rETH ||
        tokenAddr.toHexString() == constants_1.RewardTokens.rETH_ARB ||
        tokenAddr.toHexString() == constants_1.ArbitrumToken.rETH) {
        const uniSwapPair = UniswapV3_1.UniswapV3.bind(graph_ts_1.Address.fromString("0x09ba302a3f5ad2bf8853266e271b005a5b3716fe"));
        let price;
        const reserve = uniSwapPair.try_slot0();
        if (!reserve.reverted) {
            graph_ts_1.log.warning("[UniswapV3] tokenAddress: {}, SQRT: {}", [
                tokenAddr.toHexString(),
                reserve.value.value1.toString(),
            ]);
            price = sqrtPriceX96ToTokenPrices(reserve.value.value0)[0];
            graph_ts_1.log.warning("[UniswapV3] tokenAddress: {}, Reserve1: {}, Reserve0: {}, Price: {}", [
                tokenAddr.toHexString(),
                reserve.value.value1.toString(),
                reserve.value.value0.toString(),
                price.toString(),
            ]);
            const tokenPrice = getUsdPricePerToken(graph_ts_1.Address.fromString(constants_1.ArbitrumToken.ETH));
            if (!tokenPrice.reverted) {
                tokenPrice.usdPrice.times(price);
                const val = tokenPrice.usdPrice.times(price);
                const x = types_1.CustomPriceType.initialize(val);
                return x;
            }
        }
    }
    if (tokenAddr.toHexString() == constants_1.XdaiToken.MATIC) {
        const uniSwapPair = UniswapPair_1.UniswapPair.bind(graph_ts_1.Address.fromString("0x70cd033af4dc9763700d348e402dfeddb86e09e1"));
        let price;
        const reserve = uniSwapPair.try_getReserves();
        if (!reserve.reverted) {
            price = reserve.value.value1
                .toBigDecimal()
                .div(reserve.value.value0.toBigDecimal());
            graph_ts_1.log.warning("[UniswapV2Matic] tokenAddress: {}, Reserve1: {}, Reserve0: {}, Price: {}", [
                tokenAddr.toHexString(),
                reserve.value.value1.toString(),
                reserve.value.value0.toString(),
                price.toString(),
            ]);
            const x = types_1.CustomPriceType.initialize(price);
            return x;
        }
    }
    const config = utils.getConfig();
    if (config.network() == "default") {
        graph_ts_1.log.warning("Failed to fetch price: network {} not implemented", [
            graph_ts_1.dataSource.network(),
        ]);
        return new types_1.CustomPriceType();
    }
    if (config.hardcodedStables().includes(tokenAddr)) {
        return types_1.CustomPriceType.initialize(constants.BIGDECIMAL_USD_PRICE, constants.DEFAULT_USDC_DECIMALS);
    }
    // 1. Yearn Lens Oracle
    const yearnLensPrice = YearnLensOracle.getTokenPriceUSDC(tokenAddr);
    if (!yearnLensPrice.reverted) {
        graph_ts_1.log.info("[YearnLensOracle] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            yearnLensPrice.usdPrice.toString(),
        ]);
        return yearnLensPrice;
    }
    // 2. ChainLink Feed Registry
    const chainLinkPrice = ChainLinkFeed.getTokenPriceUSDC(tokenAddr);
    if (!chainLinkPrice.reverted) {
        graph_ts_1.log.info("[ChainLinkFeed] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            chainLinkPrice.usdPrice.toString(),
        ]);
        return chainLinkPrice;
    }
    // 3. CalculationsCurve
    const calculationsCurvePrice = CurveCalculations.getTokenPriceUSDC(tokenAddr);
    if (!calculationsCurvePrice.reverted) {
        graph_ts_1.log.info("[CalculationsCurve] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            calculationsCurvePrice.usdPrice.toString(),
        ]);
        return calculationsCurvePrice;
    }
    // 4. CalculationsSushiSwap
    const calculationsSushiSwapPrice = SushiCalculations.getTokenPriceUSDC(tokenAddr);
    if (!calculationsSushiSwapPrice.reverted) {
        graph_ts_1.log.info("[CalculationsSushiSwap] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            calculationsSushiSwapPrice.usdPrice.toString(),
        ]);
        return calculationsSushiSwapPrice;
    }
    // 6. Aave Oracle
    const aaveOraclePrice = AaveOracle.getTokenPriceUSDC(tokenAddr);
    if (!aaveOraclePrice.reverted) {
        graph_ts_1.log.info("[AaveOracle] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            aaveOraclePrice.usdPrice.toString(),
        ]);
        return aaveOraclePrice;
    }
    // 7. Curve Router
    const curvePrice = CurveRouter.getCurvePriceUsdc(tokenAddr);
    if (!curvePrice.reverted) {
        graph_ts_1.log.info("[CurveRouter] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            curvePrice.usdPrice.toString(),
        ]);
        return curvePrice;
    }
    // 8. uniswapV2
    if (tokenAddr.toHexString() == constants_1.XdaiToken.ETH ||
        tokenAddr.toHexString() == constants_1.XdaiHtoken.ETH) {
        tokenAddr = graph_ts_1.Address.fromString(constants_1.XdaiToken.ETH);
        const uniswapV2Price = UniswapV2.getTokenPriceUSDC(tokenAddr);
        if (!uniswapV2Price.reverted) {
            graph_ts_1.log.info("[UniswapV2Eth] tokenAddress: {}, Price: {}", [
                tokenAddr.toHexString(),
                uniswapV2Price.usdPrice.toString(),
            ]);
            return uniswapV2Price;
        }
    }
    if (tokenAddr.toHexString() == constants_1.RewardTokens.GNO) {
        const uniSwapPair = UniswapPair_1.UniswapPair.bind(graph_ts_1.Address.fromString("0xe9ad744f00f9c3c2458271b7b9f30cce36b74776"));
        let price;
        const reserve = uniSwapPair.try_getReserves();
        if (!reserve.reverted) {
            price = reserve.value.value1.div(reserve.value.value0);
            graph_ts_1.log.warning("[UniswapV2Matic] tokenAddress: {}, Reserve1: {}, Reserve0: {}, Price: {}", [
                tokenAddr.toHexString(),
                reserve.value.value1.toString(),
                reserve.value.value0.toString(),
                price.toString(),
            ]);
            const x = types_1.CustomPriceType.initialize(price.toBigDecimal());
            if (!x.reverted) {
                return x;
            }
        }
    }
    // 10. Uniswap Router
    const uniswapPrice = UniswapForksRouter.getTokenPriceUSDC(tokenAddr);
    if (!uniswapPrice.reverted) {
        graph_ts_1.log.info("[UniswapRouter] tokenAddress: {}, Price: {}", [
            tokenAddr.toHexString(),
            uniswapPrice.usdPrice.toString(),
        ]);
        return uniswapPrice;
    }
    graph_ts_1.log.warning("[Oracle] Failed to Fetch Price, Name: {} Address: {}", [
        utils.getTokenName(tokenAddr),
        tokenAddr.toHexString(),
    ]);
    return new types_1.CustomPriceType();
}
exports.getUsdPricePerToken = getUsdPricePerToken;
function getUsdPrice(tokenAddr, amount) {
    const tokenPrice = getUsdPricePerToken(tokenAddr);
    if (!tokenPrice.reverted) {
        return tokenPrice.usdPrice.times(amount);
    }
    return constants.BIGDECIMAL_ZERO;
}
exports.getUsdPrice = getUsdPrice;
