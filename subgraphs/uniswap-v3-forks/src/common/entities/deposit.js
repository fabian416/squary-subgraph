"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepositDeltas = exports.incrementDepositHelper = void 0;
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../constants");
const dexEventHandler_1 = require("../dexEventHandler");
// Update store that tracks the deposit count per pool
function incrementDepositHelper(pool) {
    const poolDeposits = schema_1._HelperStore.load(pool);
    poolDeposits.valueInt = poolDeposits.valueInt + constants_1.INT_ONE;
    poolDeposits.save();
}
exports.incrementDepositHelper = incrementDepositHelper;
function getDepositDeltas(pool, amount, amount0, amount1, tickLower, tickUpper) {
    let activeLiquidityDelta = constants_1.BIGINT_ZERO;
    // Make sure the liquidity is within the current tick range to update active liquidity.
    if (pool.tick !== null &&
        tickLower.le(pool.tick) &&
        tickUpper.gt(pool.tick)) {
        activeLiquidityDelta = amount;
    }
    return new dexEventHandler_1.RawDeltas([amount0, amount1], amount, activeLiquidityDelta, [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO], [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO]);
}
exports.getDepositDeltas = getDepositDeltas;
