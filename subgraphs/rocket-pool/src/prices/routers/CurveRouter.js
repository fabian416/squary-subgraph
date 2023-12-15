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
exports.isBasicToken = exports.getPriceUsdcRecommended = exports.getVirtualPrice = exports.getUnderlyingCoinFromPool = exports.getBasePrice = exports.getPoolFromLpToken = exports.getCurvePriceUsdc = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const SushiSwapRouter_1 = require("./SushiSwapRouter");
const CurveRegistry_1 = require("../../../generated/rocketStorage/CurveRegistry");
const CurvePoolRegistry_1 = require("../../../generated/rocketStorage/CurvePoolRegistry");
function getCurvePriceUsdc(curveLpTokenAddress, network) {
    const tokensMapping = constants.WHITELIST_TOKENS_MAP.get(network);
    const curveRegistry = CurveRegistry_1.CurveRegistry.bind(constants.CURVE_REGISTRY_ADDRESS_MAP.get(network));
    const basePrice = getBasePrice(curveLpTokenAddress, curveRegistry, network);
    const virtualPrice = getVirtualPrice(curveLpTokenAddress);
    const usdcDecimals = utils.getTokenDecimals(tokensMapping.get("USDC"));
    const decimalsAdjustment = constants.DEFAULT_DECIMALS.minus(usdcDecimals);
    const price = virtualPrice
        .times(basePrice.usdPrice)
        .times(constants.BIGINT_TEN.pow(decimalsAdjustment.toI32()).toBigDecimal())
        .div(constants.BIGINT_TEN.pow(decimalsAdjustment.plus(constants.DEFAULT_DECIMALS).toI32()).toBigDecimal());
    return types_1.CustomPriceType.initialize(price, constants.DEFAULT_USDC_DECIMALS);
}
exports.getCurvePriceUsdc = getCurvePriceUsdc;
function getPoolFromLpToken(lpAddress, curveRegistry, network) {
    let poolAddress = utils.readValue(curveRegistry.try_get_pool_from_lp_token(lpAddress), constants.ZERO_ADDRESS);
    if (poolAddress.toHex() == constants.ZERO_ADDRESS_STRING) {
        const curvePoolRegistry = CurvePoolRegistry_1.CurvePoolRegistry.bind(constants.CURVE_POOL_REGISTRY_ADDRESS_MAP.get(network));
        poolAddress = utils.readValue(curvePoolRegistry.try_get_pool_from_lp_token(lpAddress), constants.ZERO_ADDRESS);
    }
    return poolAddress;
}
exports.getPoolFromLpToken = getPoolFromLpToken;
function getBasePrice(curveLpTokenAddress, curveRegistry, network) {
    const poolAddress = getPoolFromLpToken(curveLpTokenAddress, curveRegistry, network);
    if (poolAddress.toHex() == constants.ZERO_ADDRESS_STRING) {
        return new types_1.CustomPriceType();
    }
    const underlyingCoinAddress = getUnderlyingCoinFromPool(poolAddress, curveRegistry, network);
    const basePrice = getPriceUsdcRecommended(underlyingCoinAddress, network);
    return basePrice;
}
exports.getBasePrice = getBasePrice;
function getUnderlyingCoinFromPool(poolAddress, curveRegistry, network) {
    const coinsArray = curveRegistry.try_get_underlying_coins(poolAddress);
    let coins;
    if (coinsArray.reverted) {
        return constants.ZERO_ADDRESS;
    }
    else {
        coins = coinsArray.value;
    }
    //? Use first coin from pool and if that is empty (due to error) fall back to second coin
    let preferredCoinAddress = coins[0];
    if (preferredCoinAddress.toHex() == constants.ZERO_ADDRESS_STRING) {
        preferredCoinAddress = coins[1];
    }
    //? Look for preferred coins (basic coins)
    let coinAddress;
    for (let coinIdx = 0; coinIdx < coins.length; coinIdx++) {
        coinAddress = coins[coinIdx];
        if (coinAddress.toHex() == constants.ZERO_ADDRESS_STRING) {
            break;
        }
        if (isBasicToken(coinAddress, network)) {
            preferredCoinAddress = coinAddress;
            break;
        }
    }
    return preferredCoinAddress;
}
exports.getUnderlyingCoinFromPool = getUnderlyingCoinFromPool;
function getVirtualPrice(curveLpTokenAddress) {
    const network = graph_ts_1.dataSource.network();
    const curveRegistry = CurveRegistry_1.CurveRegistry.bind(constants.CURVE_REGISTRY_ADDRESS_MAP.get(network));
    const virtualPrice = utils
        .readValue(curveRegistry.try_get_virtual_price_from_lp_token(curveLpTokenAddress), constants.BIGINT_ZERO)
        .toBigDecimal();
    return virtualPrice;
}
exports.getVirtualPrice = getVirtualPrice;
function getPriceUsdcRecommended(tokenAddress, network) {
    return (0, SushiSwapRouter_1.getPriceUsdc)(tokenAddress, network);
}
exports.getPriceUsdcRecommended = getPriceUsdcRecommended;
function isBasicToken(tokenAddress, network) {
    for (let basicTokenIdx = 0; basicTokenIdx < constants.WHITELIST_TOKENS_LIST.length; basicTokenIdx++) {
        const basicTokenName = constants.WHITELIST_TOKENS_LIST[basicTokenIdx];
        const basicTokenAddress = constants.WHITELIST_TOKENS_MAP.get(network).get(basicTokenName);
        if (basicTokenAddress &&
            tokenAddress.toHex() == basicTokenAddress.toHex()) {
            return true;
        }
    }
    return false;
}
exports.isBasicToken = isBasicToken;
