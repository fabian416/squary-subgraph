"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCollectPool = exports.handleSwap = exports.handleBurn = exports.handleMint = exports.handleInitialize = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const deposit_1 = require("../common/entities/deposit");
const dexEventHandler_1 = require("../common/dexEventHandler");
const token_1 = require("../common/entities/token");
const pool_1 = require("../common/entities/pool");
const tick_1 = require("../common/entities/tick");
const swap_1 = require("../common/entities/swap");
const withdraw_1 = require("../common/entities/withdraw");
const constants_1 = require("../common/constants");
// Emitted when a given liquidity pool is first created.
function handleInitialize(event) {
    const pool = (0, pool_1.getLiquidityPool)(event.address);
    pool.tick = graph_ts_1.BigInt.fromI32(event.params.tick);
    pool.save();
}
exports.handleInitialize = handleInitialize;
// Handle mint event emmitted from a pool contract.
function handleMint(event) {
    const pool = (0, pool_1.getLiquidityPool)(event.address);
    const deltas = (0, deposit_1.getDepositDeltas)(pool, event.params.amount, event.params.amount0, event.params.amount1, graph_ts_1.BigInt.fromI32(event.params.tickLower), graph_ts_1.BigInt.fromI32(event.params.tickUpper));
    const dexEventHandler = new dexEventHandler_1.DexEventHandler(event, pool, false, deltas);
    dexEventHandler.createDeposit(event.transaction.from, (0, tick_1.getOrCreateTick)(event, pool, graph_ts_1.BigInt.fromI32(event.params.tickLower)), (0, tick_1.getOrCreateTick)(event, pool, graph_ts_1.BigInt.fromI32(event.params.tickUpper)), null);
    dexEventHandler.processLPBalanceChanges();
    (0, deposit_1.incrementDepositHelper)(dexEventHandler.pool.id);
}
exports.handleMint = handleMint;
// Handle burn event emmitted from a pool contract.
function handleBurn(event) {
    const pool = (0, pool_1.getLiquidityPool)(event.address);
    const deltas = (0, withdraw_1.getWithdrawDeltas)(pool, event.params.amount, constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO, graph_ts_1.BigInt.fromI32(event.params.tickLower), graph_ts_1.BigInt.fromI32(event.params.tickUpper));
    const dexEventHandler = new dexEventHandler_1.DexEventHandler(event, pool, false, deltas);
    dexEventHandler.tickLower = (0, tick_1.getOrCreateTick)(event, pool, graph_ts_1.BigInt.fromI32(event.params.tickLower));
    dexEventHandler.tickUpper = (0, tick_1.getOrCreateTick)(event, pool, graph_ts_1.BigInt.fromI32(event.params.tickUpper));
    dexEventHandler.processLPBalanceChanges();
}
exports.handleBurn = handleBurn;
// Handle a swap event emitted from a pool contract.
function handleSwap(event) {
    (0, token_1.updateTokenPrices)(event, event.params.sqrtPriceX96);
    const pool = (0, pool_1.getLiquidityPool)(event.address);
    const deltas = (0, swap_1.getSwapDeltas)(pool, event.params.liquidity, event.params.amount0, event.params.amount1);
    const dexEventHandler = new dexEventHandler_1.DexEventHandler(event, pool, true, deltas);
    // 0 if amount0 is positive, 1 if amount1 is positive
    const tokenInIdx = event.params.amount0.gt(constants_1.BIGINT_ZERO) ? 0 : 1;
    const tokenOutIdx = tokenInIdx === 0 ? 1 : 0;
    dexEventHandler.createSwap(tokenInIdx, tokenOutIdx, event.transaction.from, graph_ts_1.BigInt.fromI32(event.params.tick));
    dexEventHandler.processLPBalanceChanges();
}
exports.handleSwap = handleSwap;
// Handle a collect event emitted from a pool contract.
// Collects uncollectedTokens
function handleCollectPool(event) {
    const pool = (0, pool_1.getLiquidityPool)(event.address);
    const deltas = (0, withdraw_1.getWithdrawDeltas)(pool, constants_1.BIGINT_ZERO, event.params.amount0, event.params.amount1, graph_ts_1.BigInt.fromI32(event.params.tickLower), graph_ts_1.BigInt.fromI32(event.params.tickUpper));
    const dexEventHandler = new dexEventHandler_1.DexEventHandler(event, pool, false, deltas);
    dexEventHandler.createWithdraw(event.transaction.from, null, null, null);
    dexEventHandler.processLPBalanceChanges();
}
exports.handleCollectPool = handleCollectPool;
