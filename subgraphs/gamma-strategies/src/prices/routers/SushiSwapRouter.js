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
exports.getLpTokenTotalLiquidityUsdc = exports.getLpTokenPriceUsdc = exports.getPriceFromRouter = exports.getPriceFromRouterUsdc = exports.getPriceUsdc = exports.isLpToken = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const SushiSwapPair_1 = require("../../../generated/templates/Hypervisor/SushiSwapPair");
const SushiSwapRouter_1 = require("../../../generated/templates/Hypervisor/SushiSwapRouter");
function isLpToken(tokenAddress, network) {
    if (tokenAddress.equals(constants.WHITELIST_TOKENS_MAP.get(network).get("ETH"))) {
        return false;
    }
    const lpToken = SushiSwapPair_1.SushiSwapPair.bind(tokenAddress);
    let isFactoryAvailable = utils.readValue(lpToken.try_factory(), constants.ZERO_ADDRESS);
    if (isFactoryAvailable.toHex() == constants.ZERO_ADDRESS_STRING) {
        return false;
    }
    return true;
}
exports.isLpToken = isLpToken;
function getPriceUsdc(tokenAddress, network) {
    if (isLpToken(tokenAddress, network)) {
        return getLpTokenPriceUsdc(tokenAddress, network);
    }
    return getPriceFromRouterUsdc(tokenAddress, network);
}
exports.getPriceUsdc = getPriceUsdc;
function getPriceFromRouterUsdc(tokenAddress, network) {
    return getPriceFromRouter(tokenAddress, constants.WHITELIST_TOKENS_MAP.get(network).get("USDC"), network);
}
exports.getPriceFromRouterUsdc = getPriceFromRouterUsdc;
function getPriceFromRouter(token0Address, token1Address, network) {
    let wethAddress = constants.SUSHISWAP_WETH_ADDRESS.get(network);
    let ethAddress = constants.WHITELIST_TOKENS_MAP.get(network).get("ETH");
    // Convert ETH address to WETH
    if (token0Address == ethAddress) {
        token0Address = wethAddress;
    }
    if (token1Address == ethAddress) {
        token1Address = wethAddress;
    }
    let path = [];
    let numberOfJumps;
    let inputTokenIsWeth = token0Address == wethAddress || token1Address == wethAddress;
    if (inputTokenIsWeth) {
        // Path = [token0, weth] or [weth, token1]
        numberOfJumps = graph_ts_1.BigInt.fromI32(1);
        path.push(token0Address);
        path.push(token1Address);
    }
    else {
        // Path = [token0, weth, token1]
        numberOfJumps = graph_ts_1.BigInt.fromI32(2);
        path.push(token0Address);
        path.push(wethAddress);
        path.push(token1Address);
    }
    let token0Decimals = utils.getTokenDecimals(token0Address);
    let amountIn = constants.BIGINT_TEN.pow(token0Decimals.toI32());
    const routerAddresses = constants.SUSHISWAP_ROUTER_ADDRESS_MAP.get(network);
    let routerAddressV1 = routerAddresses.get("routerV1");
    let routerAddressV2 = routerAddresses.get("routerV2");
    let amountOutArray;
    if (routerAddressV1) {
        const sushiSwapRouterV1 = SushiSwapRouter_1.SushiSwapRouter.bind(routerAddressV1);
        amountOutArray = sushiSwapRouterV1.try_getAmountsOut(amountIn, path);
        if (amountOutArray.reverted && routerAddressV2) {
            const sushiSwapRouterV2 = SushiSwapRouter_1.SushiSwapRouter.bind(routerAddressV2);
            amountOutArray = sushiSwapRouterV2.try_getAmountsOut(amountIn, path);
            if (amountOutArray.reverted) {
                return new types_1.CustomPriceType();
            }
        }
        let amountOut = amountOutArray.value[amountOutArray.value.length - 1];
        let feeBips = graph_ts_1.BigInt.fromI32(30); // .3% per swap fees
        let amountOutBigDecimal = amountOut
            .times(constants.BIGINT_TEN_THOUSAND)
            .div(constants.BIGINT_TEN_THOUSAND.minus(feeBips.times(numberOfJumps)))
            .toBigDecimal();
        return types_1.CustomPriceType.initialize(amountOutBigDecimal, constants.DEFAULT_USDC_DECIMALS);
    }
    return new types_1.CustomPriceType();
}
exports.getPriceFromRouter = getPriceFromRouter;
function getLpTokenPriceUsdc(tokenAddress, network) {
    const sushiswapPair = SushiSwapPair_1.SushiSwapPair.bind(tokenAddress);
    let totalLiquidity = getLpTokenTotalLiquidityUsdc(tokenAddress, network);
    let totalSupply = utils.readValue(sushiswapPair.try_totalSupply(), constants.BIGINT_ZERO);
    if (totalSupply == constants.BIGINT_ZERO) {
        return new types_1.CustomPriceType();
    }
    let pairDecimals = utils.readValue(sushiswapPair.try_decimals(), constants.DEFAULT_DECIMALS.toI32());
    let pricePerLpTokenUsdc = totalLiquidity.usdPrice
        .times(constants.BIGINT_TEN.pow(pairDecimals).toBigDecimal())
        .div(totalSupply.toBigDecimal());
    return types_1.CustomPriceType.initialize(pricePerLpTokenUsdc, constants.DEFAULT_USDC_DECIMALS);
}
exports.getLpTokenPriceUsdc = getLpTokenPriceUsdc;
function getLpTokenTotalLiquidityUsdc(tokenAddress, network) {
    const sushiSwapPair = SushiSwapPair_1.SushiSwapPair.bind(tokenAddress);
    let token0Address = utils.readValue(sushiSwapPair.try_token0(), constants.ZERO_ADDRESS);
    let token1Address = utils.readValue(sushiSwapPair.try_token1(), constants.ZERO_ADDRESS);
    if (token0Address.toHex() == constants.ZERO_ADDRESS_STRING ||
        token1Address.toHex() == constants.ZERO_ADDRESS_STRING) {
        return new types_1.CustomPriceType();
    }
    let token0Decimals = utils.getTokenDecimals(token0Address);
    let token1Decimals = utils.getTokenDecimals(token1Address);
    let reserves = utils.readValue(sushiSwapPair.try_getReserves(), constants.SUSHISWAP_DEFAULT_RESERVE_CALL);
    let token0Price = getPriceUsdc(token0Address, network);
    let token1Price = getPriceUsdc(token1Address, network);
    if (token0Price.reverted || token1Price.reverted) {
        return new types_1.CustomPriceType();
    }
    let reserve0 = reserves.value0;
    let reserve1 = reserves.value1;
    if (reserve0.notEqual(constants.BIGINT_ZERO) || reserve1.notEqual(constants.BIGINT_ZERO)) {
        let liquidity0 = reserve0
            .div(constants.BIGINT_TEN.pow(token0Decimals.toI32()))
            .toBigDecimal()
            .times(token0Price.usdPrice);
        let liquidity1 = reserve1
            .div(constants.BIGINT_TEN.pow(token1Decimals.toI32()))
            .toBigDecimal()
            .times(token1Price.usdPrice);
        let totalLiquidity = liquidity0.plus(liquidity1);
        return types_1.CustomPriceType.initialize(totalLiquidity, constants.DEFAULT_USDC_DECIMALS);
    }
    return new types_1.CustomPriceType();
}
exports.getLpTokenTotalLiquidityUsdc = getLpTokenTotalLiquidityUsdc;
