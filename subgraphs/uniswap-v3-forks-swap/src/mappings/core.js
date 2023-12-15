"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSwap = exports.handleInitialize = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const dexEventHandler_1 = require("../common/dexEventHandler");
const pool_1 = require("../common/entities/pool");
const constants_1 = require("../common/constants");
// Handle mint event emmitted from a pool contract.
function handleInitialize(event) {
    const pool = (0, pool_1.getLiquidityPool)(event.address);
    pool.tick = graph_ts_1.BigInt.fromI32(event.params.tick);
    pool.save();
}
exports.handleInitialize = handleInitialize;
// Handle a swap event emitted from a pool contract.
function handleSwap(event) {
    const pool = (0, pool_1.getLiquidityPool)(event.address);
    const deltas = new dexEventHandler_1.RawDeltas([event.params.amount0, event.params.amount1]);
    const dexEventHandler = new dexEventHandler_1.DexEventHandler(event, pool, deltas);
    // 0 if amount0 is positive, 1 if amount1 is positive
    const tokenInIdx = event.params.amount0.gt(constants_1.BIGINT_ZERO) ? 0 : 1;
    const tokenOutIdx = tokenInIdx === 0 ? 1 : 0;
    dexEventHandler.createSwap(tokenInIdx, tokenOutIdx, event.transaction.from, graph_ts_1.BigInt.fromI32(event.params.tick));
    dexEventHandler.updateAndSaveLiquidityPoolEntity();
    dexEventHandler.updateAndSaveAccountEntity();
}
exports.handleSwap = handleSwap;
