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
exports.getLpTokenTotalLiquidityUsdc =
  exports.getLpTokenPriceUsdc =
  exports.getPriceFromRouter =
  exports.getPriceFromRouterUsdc =
  exports.getPriceUsdc =
  exports.isLpToken =
    void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const UniswapPair_1 = require("../../../../../generated/templates/CToken/UniswapPair");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const UniswapRouter_1 = require("../../../../../generated/templates/CToken/UniswapRouter");
function isLpToken(tokenAddress, network) {
  if (tokenAddress == constants.WHITELIST_TOKENS_MAP.get(network).get("ETH")) {
    return false;
  }
  const lpToken = UniswapRouter_1.UniswapRouter.bind(tokenAddress);
  const isFactoryAvailable = utils.readValue(
    lpToken.try_factory(),
    constants.ZERO_ADDRESS
  );
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
  return getPriceFromRouter(
    tokenAddress,
    constants.WHITELIST_TOKENS_MAP.get(network).get("USDC"),
    network
  );
}
exports.getPriceFromRouterUsdc = getPriceFromRouterUsdc;
function getPriceFromRouter(token0Address, token1Address, network) {
  const ethAddress = constants.WHITELIST_TOKENS_MAP.get(network).get("ETH");
  const wethAddress = constants.WHITELIST_TOKENS_MAP.get(network).get("WETH");
  // Convert ETH address to WETH
  if (token0Address == ethAddress) {
    token0Address = wethAddress;
  }
  if (token1Address == ethAddress) {
    token1Address = wethAddress;
  }
  const path = [];
  let numberOfJumps;
  const inputTokenIsWeth =
    token0Address == wethAddress || token1Address == wethAddress;
  if (inputTokenIsWeth) {
    // Path = [token0, weth] or [weth, token1]
    numberOfJumps = graph_ts_1.BigInt.fromI32(1);
    path.push(token0Address);
    path.push(token1Address);
  } else {
    // Path = [token0, weth, token1]
    numberOfJumps = graph_ts_1.BigInt.fromI32(2);
    path.push(token0Address);
    path.push(wethAddress);
    path.push(token1Address);
  }
  const token0Decimals = utils.getTokenDecimals(token0Address);
  const amountIn = graph_ts_1.BigInt.fromI32(10).pow(token0Decimals.toI32());
  const routerAddressV1 =
    constants.UNISWAP_ROUTER_CONTRACT_ADDRESSES.get(network).get("routerV1");
  const routerAddressV2 =
    constants.UNISWAP_ROUTER_CONTRACT_ADDRESSES.get(network).get("routerV2");
  let amountOutArray;
  if (routerAddressV1) {
    const uniswapRouterV1 = UniswapRouter_1.UniswapRouter.bind(routerAddressV1);
    amountOutArray = uniswapRouterV1.try_getAmountsOut(amountIn, path);
    if (amountOutArray.reverted && routerAddressV2) {
      const uniswapRouterV2 =
        UniswapRouter_1.UniswapRouter.bind(routerAddressV2);
      amountOutArray = uniswapRouterV2.try_getAmountsOut(amountIn, path);
      if (amountOutArray.reverted) {
        return new types_1.CustomPriceType();
      }
    }
    const amountOut = amountOutArray.value[amountOutArray.value.length - 1];
    const feeBips = graph_ts_1.BigInt.fromI32(30); // .3% per swap fees
    const amountOutBigDecimal = amountOut
      .times(constants.BIGINT_TEN_THOUSAND)
      .div(constants.BIGINT_TEN_THOUSAND.minus(feeBips.times(numberOfJumps)))
      .toBigDecimal();
    return types_1.CustomPriceType.initialize(
      amountOutBigDecimal,
      constants.DEFAULT_USDC_DECIMALS
    );
  }
  return new types_1.CustomPriceType();
}
exports.getPriceFromRouter = getPriceFromRouter;
function getLpTokenPriceUsdc(tokenAddress, network) {
  const uniSwapPair = UniswapPair_1.UniswapPair.bind(tokenAddress);
  const totalLiquidity = getLpTokenTotalLiquidityUsdc(tokenAddress, network);
  const totalSupply = utils.readValue(
    uniSwapPair.try_totalSupply(),
    constants.BIGINT_ZERO
  );
  if (totalSupply == constants.BIGINT_ZERO || totalLiquidity.reverted) {
    return new types_1.CustomPriceType();
  }
  let pairDecimals;
  const pairDecimalsCall = uniSwapPair.try_decimals();
  if (pairDecimalsCall.reverted) {
    pairDecimals = constants.DEFAULT_DECIMALS.toI32();
  } else {
    pairDecimals = pairDecimalsCall.value;
  }
  const pricePerLpTokenUsdc = totalLiquidity.usdPrice
    .times(constants.BIGINT_TEN.pow(pairDecimals).toBigDecimal())
    .div(totalSupply.toBigDecimal());
  return types_1.CustomPriceType.initialize(
    pricePerLpTokenUsdc,
    constants.DEFAULT_USDC_DECIMALS
  );
}
exports.getLpTokenPriceUsdc = getLpTokenPriceUsdc;
function getLpTokenTotalLiquidityUsdc(tokenAddress, network) {
  const uniSwapPair = UniswapPair_1.UniswapPair.bind(tokenAddress);
  const token0Address = utils.readValue(
    uniSwapPair.try_token0(),
    constants.ZERO_ADDRESS
  );
  const token1Address = utils.readValue(
    uniSwapPair.try_token1(),
    constants.ZERO_ADDRESS
  );
  if (
    token0Address.toHex() == constants.ZERO_ADDRESS_STRING ||
    token1Address.toHex() == constants.ZERO_ADDRESS_STRING
  ) {
    return new types_1.CustomPriceType();
  }
  const token0Decimals = utils.getTokenDecimals(token0Address);
  const token1Decimals = utils.getTokenDecimals(token1Address);
  const reserves = utils.readValue(
    uniSwapPair.try_getReserves(),
    constants.UNISWAP_DEFAULT_RESERVE_CALL
  );
  const token0Price = getPriceUsdc(token0Address, network);
  const token1Price = getPriceUsdc(token1Address, network);
  if (token0Price.reverted || token1Price.reverted) {
    return new types_1.CustomPriceType();
  }
  const reserve0 = reserves.value0;
  const reserve1 = reserves.value1;
  if (
    reserve0.notEqual(constants.BIGINT_ZERO) ||
    reserve1.notEqual(constants.BIGINT_ZERO)
  ) {
    const liquidity0 = reserve0
      .div(constants.BIGINT_TEN.pow(token0Decimals.toI32()))
      .toBigDecimal()
      .times(token0Price.usdPrice);
    const liquidity1 = reserve1
      .div(constants.BIGINT_TEN.pow(token1Decimals.toI32()))
      .toBigDecimal()
      .times(token1Price.usdPrice);
    const totalLiquidity = liquidity0.plus(liquidity1);
    return types_1.CustomPriceType.initialize(
      totalLiquidity,
      constants.DEFAULT_USDC_DECIMALS
    );
  }
  return new types_1.CustomPriceType();
}
exports.getLpTokenTotalLiquidityUsdc = getLpTokenTotalLiquidityUsdc;
