"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwapDeltas = void 0;
const constants_1 = require("../constants");
const dexEventHandler_1 = require("../dexEventHandler");
function getSwapDeltas(pool, newActiveLiquidity, amount0, amount1) {
    if (amount0.gt(constants_1.BIGINT_ZERO)) {
        return new dexEventHandler_1.RawDeltas([amount0, amount1], constants_1.BIGINT_ZERO, newActiveLiquidity.minus(pool.activeLiquidity), [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO], [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO]);
    }
    return new dexEventHandler_1.RawDeltas([amount0, amount1], constants_1.BIGINT_ZERO, newActiveLiquidity.minus(pool.activeLiquidity), [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO], [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO]);
}
exports.getSwapDeltas = getSwapDeltas;
