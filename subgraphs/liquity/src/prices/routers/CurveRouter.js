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
exports.getPriceUsdc = exports.cryptoPoolUnderlyingTokensAddressesByPoolAddress = exports.cryptoPoolTokenAmountUsdc = exports.cryptoPoolLpTotalValueUsdc = exports.cryptoPoolLpPriceUsdc = exports.getPriceUsdcRecommended = exports.getVirtualPrice = exports.getPreferredCoinFromCoins = exports.getUnderlyingCoinFromPool = exports.getBasePrice = exports.getCurvePriceUsdc = exports.isPoolCryptoPool = exports.isLpCryptoPool = exports.getPoolFromLpToken = exports.isCurveLpToken = void 0;
const __1 = require("..");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const CurvePool_1 = require("../../../generated/TroveManager/CurvePool");
const CurveRegistry_1 = require("../../../generated/TroveManager/CurveRegistry");
function isCurveLpToken(lpAddress) {
    const poolAddress = getPoolFromLpToken(lpAddress);
    if (poolAddress.notEqual(constants.NULL.TYPE_ADDRESS))
        return true;
    return false;
}
exports.isCurveLpToken = isCurveLpToken;
function getPoolFromLpToken(lpAddress) {
    const config = utils.getConfig();
    const curveRegistryAdresses = config.curveRegistry();
    for (let idx = 0; idx < curveRegistryAdresses.length; idx++) {
        const curveRegistryContract = CurveRegistry_1.CurveRegistry.bind(curveRegistryAdresses[idx]);
        const poolAddress = utils.readValue(curveRegistryContract.try_get_pool_from_lp_token(lpAddress), constants.NULL.TYPE_ADDRESS);
        if (poolAddress.notEqual(constants.NULL.TYPE_ADDRESS))
            return poolAddress;
    }
    return constants.NULL.TYPE_ADDRESS;
}
exports.getPoolFromLpToken = getPoolFromLpToken;
function isLpCryptoPool(lpAddress) {
    const poolAddress = getPoolFromLpToken(lpAddress);
    if (poolAddress != constants.NULL.TYPE_ADDRESS) {
        return isPoolCryptoPool(poolAddress);
    }
    return false;
}
exports.isLpCryptoPool = isLpCryptoPool;
function isPoolCryptoPool(poolAddress) {
    const poolContract = CurvePool_1.CurvePool.bind(poolAddress);
    const priceOracleCall = poolContract.try_price_oracle();
    if (!priceOracleCall.reverted)
        return true;
    const priceOracle1Call = poolContract.try_price_oracle1(constants.BIGINT_ZERO);
    if (!priceOracle1Call.reverted)
        return true;
    return false;
}
exports.isPoolCryptoPool = isPoolCryptoPool;
function getCurvePriceUsdc(lpAddress) {
    if (isLpCryptoPool(lpAddress)) {
        return cryptoPoolLpPriceUsdc(lpAddress);
    }
    const basePrice = getBasePrice(lpAddress);
    const virtualPrice = getVirtualPrice(lpAddress).toBigDecimal();
    const config = utils.getConfig();
    const usdcTokenDecimals = config.usdcTokenDecimals();
    const decimalsAdjustment = constants.DEFAULT_DECIMALS.minus(usdcTokenDecimals);
    const priceUsdc = virtualPrice
        .times(basePrice.usdPrice)
        .times(constants.BIGINT_TEN.pow(decimalsAdjustment.toI32()).toBigDecimal());
    return types_1.CustomPriceType.initialize(priceUsdc, decimalsAdjustment.plus(constants.DEFAULT_DECIMALS).toI32());
}
exports.getCurvePriceUsdc = getCurvePriceUsdc;
function getBasePrice(lpAddress) {
    const poolAddress = getPoolFromLpToken(lpAddress);
    if (poolAddress.equals(constants.NULL.TYPE_ADDRESS))
        return new types_1.CustomPriceType();
    const underlyingCoinAddress = getUnderlyingCoinFromPool(poolAddress);
    const basePrice = getPriceUsdcRecommended(underlyingCoinAddress);
    return basePrice;
}
exports.getBasePrice = getBasePrice;
function getUnderlyingCoinFromPool(poolAddress) {
    const config = utils.getConfig();
    const curveRegistryAdresses = config.curveRegistry();
    for (let idx = 0; idx < curveRegistryAdresses.length; idx++) {
        const curveRegistryContract = CurveRegistry_1.CurveRegistry.bind(curveRegistryAdresses[idx]);
        const coins = utils.readValue(curveRegistryContract.try_get_underlying_coins(poolAddress), []);
        if (coins.length != 0)
            return getPreferredCoinFromCoins(coins);
    }
    return constants.NULL.TYPE_ADDRESS;
}
exports.getUnderlyingCoinFromPool = getUnderlyingCoinFromPool;
function getPreferredCoinFromCoins(coins) {
    let preferredCoinAddress = constants.NULL.TYPE_ADDRESS;
    for (let coinIdx = 0; coinIdx < 8; coinIdx++) {
        const coinAddress = coins[coinIdx];
        if (coinAddress.notEqual(constants.NULL.TYPE_ADDRESS)) {
            preferredCoinAddress = coinAddress;
        }
        // Found preferred coin and we're at the end of the token array
        if ((preferredCoinAddress.notEqual(constants.NULL.TYPE_ADDRESS) &&
            coinAddress.equals(constants.NULL.TYPE_ADDRESS)) ||
            coinIdx == 7) {
            break;
        }
    }
    return preferredCoinAddress;
}
exports.getPreferredCoinFromCoins = getPreferredCoinFromCoins;
function getVirtualPrice(curveLpTokenAddress) {
    const config = utils.getConfig();
    const curveRegistryAdresses = config.curveRegistry();
    for (let idx = 0; idx < curveRegistryAdresses.length; idx++) {
        const curveRegistryContract = CurveRegistry_1.CurveRegistry.bind(curveRegistryAdresses[idx]);
        const virtualPriceCall = curveRegistryContract.try_get_virtual_price_from_lp_token(curveLpTokenAddress);
        if (!virtualPriceCall.reverted)
            return virtualPriceCall.value;
    }
    return constants.BIGINT_ZERO;
}
exports.getVirtualPrice = getVirtualPrice;
function getPriceUsdcRecommended(tokenAddress) {
    return (0, __1.getUsdPricePerToken)(tokenAddress);
}
exports.getPriceUsdcRecommended = getPriceUsdcRecommended;
function cryptoPoolLpPriceUsdc(lpAddress) {
    const totalSupply = utils.getTokenSupply(lpAddress);
    const totalValueUsdc = cryptoPoolLpTotalValueUsdc(lpAddress);
    const priceUsdc = totalValueUsdc
        .times(constants.BIGINT_TEN.pow(constants.DEFAULT_DECIMALS.toI32()).toBigDecimal())
        .div(totalSupply.toBigDecimal());
    return types_1.CustomPriceType.initialize(priceUsdc, 0);
}
exports.cryptoPoolLpPriceUsdc = cryptoPoolLpPriceUsdc;
function cryptoPoolLpTotalValueUsdc(lpAddress) {
    const poolAddress = getPoolFromLpToken(lpAddress);
    const underlyingTokensAddresses = cryptoPoolUnderlyingTokensAddressesByPoolAddress(poolAddress);
    let totalValue = constants.BIGDECIMAL_ZERO;
    for (let tokenIdx = 0; tokenIdx < underlyingTokensAddresses.length; tokenIdx++) {
        const tokenValueUsdc = cryptoPoolTokenAmountUsdc(poolAddress, underlyingTokensAddresses[tokenIdx], graph_ts_1.BigInt.fromI32(tokenIdx));
        totalValue = totalValue.plus(tokenValueUsdc);
    }
    return totalValue;
}
exports.cryptoPoolLpTotalValueUsdc = cryptoPoolLpTotalValueUsdc;
function cryptoPoolTokenAmountUsdc(poolAddress, tokenAddress, tokenIdx) {
    const poolContract = CurvePool_1.CurvePool.bind(poolAddress);
    const tokenBalance = utils
        .readValue(poolContract.try_balances(tokenIdx), constants.BIGINT_ZERO)
        .toBigDecimal();
    const tokenDecimals = utils.getTokenDecimals(tokenAddress);
    const tokenPrice = getPriceUsdcRecommended(tokenAddress);
    const tokenValueUsdc = tokenBalance
        .times(tokenPrice.usdPrice)
        .div(constants.BIGINT_TEN.pow(tokenDecimals.toI32()).toBigDecimal());
    return tokenValueUsdc;
}
exports.cryptoPoolTokenAmountUsdc = cryptoPoolTokenAmountUsdc;
function cryptoPoolUnderlyingTokensAddressesByPoolAddress(poolAddress) {
    const poolContract = CurvePool_1.CurvePool.bind(poolAddress);
    let idx = 0;
    const coins = [];
    while (idx >= 0) {
        const coin = utils.readValue(poolContract.try_coins(graph_ts_1.BigInt.fromI32(idx)), constants.NULL.TYPE_ADDRESS);
        if (coin.equals(constants.NULL.TYPE_ADDRESS)) {
            return coins;
        }
        coins.push(coin);
        idx += 1;
    }
    return coins;
}
exports.cryptoPoolUnderlyingTokensAddressesByPoolAddress = cryptoPoolUnderlyingTokensAddressesByPoolAddress;
function getPriceUsdc(tokenAddress) {
    if (isCurveLpToken(tokenAddress)) {
        return getCurvePriceUsdc(tokenAddress);
    }
    const poolContract = CurvePool_1.CurvePool.bind(tokenAddress);
    const virtualPrice = utils
        .readValue(poolContract.try_get_virtual_price(), constants.BIGINT_ZERO)
        .toBigDecimal();
    const coins = [];
    for (let i = 0; i < 8; i++) {
        const coin = utils.readValue(poolContract.try_coins(graph_ts_1.BigInt.fromI32(i)), constants.NULL.TYPE_ADDRESS);
        coins.push(coin);
    }
    const preferredCoin = getPreferredCoinFromCoins(coins);
    const price = getPriceUsdcRecommended(preferredCoin);
    return types_1.CustomPriceType.initialize(price.usdPrice.times(virtualPrice), constants.DEFAULT_DECIMALS.toI32());
}
exports.getPriceUsdc = getPriceUsdc;
