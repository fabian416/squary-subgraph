"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWithdrawDeltas = void 0;
const dexEventHandler_1 = require("../dexEventHandler");
const constants_1 = require("../constants");
function getWithdrawDeltas(pool, amount, amount0, amount1, tickLower, tickUpper) {
    let activeLiquidityDelta = constants_1.BIGINT_ZERO;
    // Make sure the liquidity is within the current tick range to update active liquidity.
    if (pool.tick !== null &&
        tickLower.le(pool.tick) &&
        tickUpper.gt(pool.tick)) {
        activeLiquidityDelta = amount.times(constants_1.BIGINT_NEG_ONE);
    }
    return new dexEventHandler_1.RawDeltas([amount0.times(constants_1.BIGINT_NEG_ONE), amount1.times(constants_1.BIGINT_NEG_ONE)], amount.times(constants_1.BIGINT_NEG_ONE), activeLiquidityDelta, [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO], [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO]);
}
exports.getWithdrawDeltas = getWithdrawDeltas;
