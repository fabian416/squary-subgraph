"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExchangeRate = exports.getBaseTokenRateInUSDC = exports.updatePoolPriceFromSwap = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const numbers_1 = require("../../common/utils/numbers");
const schema_1 = require("../../../generated/schema");
function updatePoolPriceFromSwap(pool, amount0In, amount0Out, amount1In, amount1Out, event) {
    const helper = schema_1._PoolPricingHelper.load(event.address.toHex());
    if (!helper.whitelisted) {
        return;
    }
    if (pool.totalValueLockedUSD < constants_1.MINIMUM_LIQUIDITY_USD) {
        return;
    }
    const token0 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[0]));
    const token1 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[1]));
    const token0IsBase = helper.baseTokenIndex == 0 ? true : false;
    let token = token1;
    let amountBaseIn = amount0In.toBigDecimal();
    let amountBaseOut = amount0Out.toBigDecimal();
    let amountTokenIn = amount1In.toBigDecimal();
    let amountTokenOut = amount1Out.toBigDecimal();
    if (!token0IsBase) {
        token = token0;
        amountBaseIn = amount1In.toBigDecimal();
        amountBaseOut = amount1Out.toBigDecimal();
        amountTokenIn = amount0In.toBigDecimal();
        amountTokenOut = amount0Out.toBigDecimal();
    }
    if (event.block.number <= token.lastPriceBlockNumber) {
        return;
    }
    if (amount0In > constants_1.BIGINT_ZERO && amount1Out > constants_1.BIGINT_ZERO) {
        // Swap is from token0 to token1
        helper.priceTokenInBase = token0IsBase
            ? amountBaseIn.div(amountTokenOut) //  Base In -> Token Out swap
            : amountBaseOut.div(amountTokenIn); //  Token In -> Base Out swap
    }
    else if (amount1In > constants_1.BIGINT_ZERO && amount0Out > constants_1.BIGINT_ZERO) {
        // Swap is from token1 to token0
        helper.priceTokenInBase = token0IsBase
            ? amountBaseOut.div(amountTokenIn) // Token In -> Base Out swap
            : amountBaseIn.div(amountTokenOut); // Base In -> Token Out swap
    }
    else {
        graph_ts_1.log.warning("Could not identify swap direction for tx: {}, log Index: {}", [
            event.transaction.hash.toHex(),
            event.logIndex.toString(),
        ]);
    }
    helper.save();
    if (event.block.number > token.lastPriceBlockNumber) {
        token.lastPriceUSD = helper.priceTokenInBase
            .times(getBaseTokenRateInUSDC(event.address))
            .times((0, numbers_1.exponentToBigDecimal)(token.decimals))
            .div((0, numbers_1.exponentToBigDecimal)(constants_1.USDC_DECIMALS));
        token.lastPriceBlockNumber = event.block.number;
        token.save();
    }
}
exports.updatePoolPriceFromSwap = updatePoolPriceFromSwap;
function getBaseTokenRateInUSDC(poolAddress) {
    let rate = constants_1.BIGDECIMAL_ZERO;
    const helper = schema_1._PoolPricingHelper.load(poolAddress.toHex());
    if (helper != null) {
        if (helper.baseToken == constants_1.ZERO_ADDRESS) {
            rate = constants_1.BIGDECIMAL_ZERO;
        }
        else if (helper.baseToken == constants_1.USDC_ADDRESS) {
            rate = constants_1.BIGDECIMAL_ONE;
        }
        else {
            rate = constants_1.BIGDECIMAL_ONE;
            for (let i = 0; i < helper.usdPath.length; i++) {
                const intermediateRate = getExchangeRate(graph_ts_1.Address.fromString(helper.usdPath[i]), helper.usdPathBaseTokenIndex[i]);
                rate = rate.times(intermediateRate);
            }
        }
    }
    return rate;
}
exports.getBaseTokenRateInUSDC = getBaseTokenRateInUSDC;
function getExchangeRate(poolAddress, baseTokenIndex) {
    const helper = schema_1._PoolPricingHelper.load(poolAddress.toHex());
    let rate = constants_1.BIGDECIMAL_ZERO;
    if (baseTokenIndex == helper.baseTokenIndex) {
        rate = helper.priceTokenInBase;
    }
    else {
        rate = (0, numbers_1.safeDiv)(constants_1.BIGDECIMAL_ONE, helper.priceTokenInBase);
    }
    return rate;
}
exports.getExchangeRate = getExchangeRate;
