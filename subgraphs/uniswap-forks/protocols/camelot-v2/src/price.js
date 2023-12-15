"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findStablePairUSDPriceForToken = void 0;
const index_1 = require("@graphprotocol/graph-ts/index");
const schema_1 = require("../../../generated/schema");
const Pair_1 = require("../../../generated/templates/Pair/Pair");
const constants_1 = require("../../../src/common/constants");
const getters_1 = require("../../../src/common/getters");
const constants_2 = require("./common/constants");
function findStablePairUSDPriceForToken(pool, whitelistToken, token) {
    // Check whether current pool is a stable pair using a different formula
    const helperStore = schema_1._HelperStore.load(pool.id);
    const stable = constants_2.PairType.STABLE == helperStore.valueString;
    if (stable) {
        const rate = calculateRateForStablePair(pool, Pair_1.Pair.bind(index_1.Address.fromString(pool.id)), token, whitelistToken);
        if (!rate) {
            return null;
        }
        return rate.times(whitelistToken.lastPriceUSD);
    }
    return null;
}
exports.findStablePairUSDPriceForToken = findStablePairUSDPriceForToken;
// Tried to return null from here and it did not
function get_token_index(pool, token) {
    if (pool.inputTokens[0] == token.id) {
        return 0;
    }
    if (pool.inputTokens[1] == token.id) {
        return 1;
    }
    return -1;
}
function calculateRateForStablePair(pool, pair, tokenIn, tokenOut) {
    const tokenIndex = get_token_index(pool, tokenIn);
    const fee = (0, getters_1.getLiquidityPoolFee)(pool.fees[tokenIndex].concat(`-${tokenIndex}`));
    let amount = constants_1.BIGINT_TEN.pow(tokenIn.decimals);
    // Add fee to the amount being converted, because it will be subtracted before the calculation in getAmountOut
    amount = amount
        .divDecimal(constants_1.BIGDECIMAL_ONE.minus(fee.feePercentage))
        .truncate(0).digits;
    const rate = try_callGetAmountOut(pair, amount, index_1.Address.fromString(tokenIn.id));
    if (!rate) {
        return null;
    }
    return rate.divDecimal(constants_1.BIGINT_TEN.pow(tokenOut.decimals).toBigDecimal());
}
function try_callGetAmountOut(contract, amountIn, tokenIn) {
    const result = contract.tryCall("getAmountOut", "getAmountOut(uint256,address):(uint256)", [
        index_1.ethereum.Value.fromUnsignedBigInt(amountIn),
        index_1.ethereum.Value.fromAddress(tokenIn),
    ]);
    if (result.reverted) {
        return null;
    }
    const value = result.value;
    return value[0].toBigInt();
}
