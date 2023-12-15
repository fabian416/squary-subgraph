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
exports.getLpTokenTotalLiquidityUsdc = exports.getLpTokenPriceUsdc = exports.getPriceFromRouter = exports.getPriceFromRouterUSDC = exports.getTokenPriceUSDC = exports.isLpToken = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const UniswapPair_1 = require("../../../generated/Controller/UniswapPair");
const UniswapRouter_1 = require("../../../generated/Controller/UniswapRouter");
function isLpToken(tokenAddress, ethAddress) {
    if (tokenAddress.equals(ethAddress))
        return false;
    const lpToken = UniswapRouter_1.UniswapRouter.bind(tokenAddress);
    const isFactoryAvailable = utils.readValue(lpToken.try_factory(), constants.NULL.TYPE_ADDRESS);
    if (isFactoryAvailable.equals(constants.NULL.TYPE_ADDRESS))
        return false;
    return true;
}
exports.isLpToken = isLpToken;
function getTokenPriceUSDC(tokenAddress, block = null) {
    const config = utils.getConfig();
    if (!config)
        return new types_1.CustomPriceType();
    const ethAddress = config.ethAddress();
    const usdcAddress = config.usdcAddress();
    if (isLpToken(tokenAddress, ethAddress)) {
        return getLpTokenPriceUsdc(tokenAddress, block);
    }
    return getPriceFromRouterUSDC(tokenAddress, usdcAddress, block);
}
exports.getTokenPriceUSDC = getTokenPriceUSDC;
function getPriceFromRouterUSDC(tokenAddress, usdcAddress, block = null) {
    return getPriceFromRouter(tokenAddress, usdcAddress, block);
}
exports.getPriceFromRouterUSDC = getPriceFromRouterUSDC;
function getPriceFromRouter(token0Address, token1Address, block = null) {
    const config = utils.getConfig();
    const ethAddress = config.ethAddress();
    const wethAddress = config.wethAddress();
    // Construct swap path
    const path = [];
    let numberOfJumps;
    // Convert ETH address to WETH
    if (token0Address == ethAddress)
        token0Address = wethAddress;
    if (token1Address == ethAddress)
        token1Address = wethAddress;
    const inputTokenIsWeth = token0Address.equals(wethAddress) || token1Address.equals(wethAddress);
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
    const token0Decimals = utils.getTokenDecimals(token0Address);
    const amountIn = constants.BIGINT_TEN.pow(token0Decimals.toI32());
    const routerAddresses = config.uniswapForks();
    let amountOut = constants.BIGINT_ZERO;
    for (let idx = 0; idx < routerAddresses.length; idx++) {
        const routerAddress = routerAddresses[idx];
        if (block && routerAddress.startBlock.gt(block.number))
            continue;
        const uniswapForkRouter = UniswapRouter_1.UniswapRouter.bind(routerAddress.address);
        const amountOutArray = uniswapForkRouter.try_getAmountsOut(amountIn, path);
        if (!amountOutArray.reverted) {
            amountOut = amountOutArray.value[amountOutArray.value.length - 1];
            break;
        }
    }
    const feeBips = graph_ts_1.BigInt.fromI32(30);
    const amountOutBigDecimal = amountOut
        .times(constants.BIGINT_TEN_THOUSAND)
        .div(constants.BIGINT_TEN_THOUSAND.minus(feeBips.times(numberOfJumps)))
        .toBigDecimal();
    return types_1.CustomPriceType.initialize(amountOutBigDecimal, config.usdcTokenDecimals().toI32(), constants.OracleType.UNISWAP_FORKS_ROUTER);
}
exports.getPriceFromRouter = getPriceFromRouter;
function getLpTokenPriceUsdc(tokenAddress, block = null) {
    const uniSwapPair = UniswapPair_1.UniswapPair.bind(tokenAddress);
    const totalLiquidity = getLpTokenTotalLiquidityUsdc(tokenAddress, block);
    const totalSupply = utils.readValue(uniSwapPair.try_totalSupply(), constants.BIGINT_ZERO);
    if (totalSupply == constants.BIGINT_ZERO || totalLiquidity.reverted) {
        return new types_1.CustomPriceType();
    }
    let pairDecimals;
    const pairDecimalsCall = uniSwapPair.try_decimals();
    if (pairDecimalsCall.reverted) {
        graph_ts_1.log.warning("[UniswapForksRouter] Failed to fetch pair decimals, tokenAddress: {}", [tokenAddress.toHexString()]);
        return new types_1.CustomPriceType();
    }
    else {
        pairDecimals = pairDecimalsCall.value;
    }
    const pricePerLpTokenUsdc = totalLiquidity.usdPrice
        .times(constants.BIGINT_TEN.pow(pairDecimals).toBigDecimal())
        .div(totalSupply.toBigDecimal());
    return types_1.CustomPriceType.initialize(pricePerLpTokenUsdc, constants.DEFAULT_USDC_DECIMALS, constants.OracleType.UNISWAP_FORKS_ROUTER);
}
exports.getLpTokenPriceUsdc = getLpTokenPriceUsdc;
function getLpTokenTotalLiquidityUsdc(tokenAddress, block = null) {
    const uniSwapPair = UniswapPair_1.UniswapPair.bind(tokenAddress);
    const token0Address = utils.readValue(uniSwapPair.try_token0(), constants.NULL.TYPE_ADDRESS);
    const token1Address = utils.readValue(uniSwapPair.try_token1(), constants.NULL.TYPE_ADDRESS);
    if (token0Address.equals(constants.NULL.TYPE_ADDRESS) ||
        token1Address.equals(constants.NULL.TYPE_ADDRESS)) {
        return new types_1.CustomPriceType();
    }
    const token0Decimals = utils.getTokenDecimals(token0Address);
    const token1Decimals = utils.getTokenDecimals(token1Address);
    const reservesCall = uniSwapPair.try_getReserves();
    if (reservesCall.reverted)
        return new types_1.CustomPriceType();
    const token0Price = getTokenPriceUSDC(token0Address, block);
    const token1Price = getTokenPriceUSDC(token1Address, block);
    if (token0Price.reverted || token1Price.reverted) {
        return new types_1.CustomPriceType();
    }
    const reserves = reservesCall.value;
    const reserve0 = reserves.value0;
    const reserve1 = reserves.value1;
    if (reserve0.notEqual(constants.BIGINT_ZERO) ||
        reserve1.notEqual(constants.BIGINT_ZERO)) {
        const liquidity0 = reserve0
            .div(constants.BIGINT_TEN.pow(token0Decimals.toI32()))
            .toBigDecimal()
            .times(token0Price.usdPrice);
        const liquidity1 = reserve1
            .div(constants.BIGINT_TEN.pow(token1Decimals.toI32()))
            .toBigDecimal()
            .times(token1Price.usdPrice);
        const totalLiquidity = liquidity0.plus(liquidity1);
        return types_1.CustomPriceType.initialize(totalLiquidity, constants.DEFAULT_USDC_DECIMALS, constants.OracleType.UNISWAP_FORKS_ROUTER);
    }
    return new types_1.CustomPriceType();
}
exports.getLpTokenTotalLiquidityUsdc = getLpTokenTotalLiquidityUsdc;
