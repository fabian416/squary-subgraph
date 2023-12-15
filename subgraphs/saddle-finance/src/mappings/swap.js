"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTokenSwapUnderlying = exports.handleTokenSwap = exports.handleRemoveLiquidityOne = exports.handleRemoveLiquidityImbalance = exports.handleRemoveLiquidity = exports.handleNewSwapFee = exports.handleNewAdminFee = exports.handleAddLiquidity = void 0;
const Swap_1 = require("../../generated/templates/Swap/Swap");
const constants_1 = require("../utils/constants");
const event_1 = require("../entities/event");
const pool_1 = require("../entities/pool");
const fee_1 = require("../entities/fee");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const token_1 = require("../entities/token");
function handleAddLiquidity(event) {
    (0, event_1.createDeposit)(event, event.params.tokenAmounts, event.params.lpTokenSupply, event.params.provider);
}
exports.handleAddLiquidity = handleAddLiquidity;
function handleNewAdminFee(event) {
    const contract = Swap_1.Swap.bind(event.address);
    (0, fee_1.createOrUpdateAllFees)(event.address, contract.swapStorage().value4 /* swapFee */, event.params.newAdminFee);
}
exports.handleNewAdminFee = handleNewAdminFee;
function handleNewSwapFee(event) {
    const contract = Swap_1.Swap.bind(event.address);
    (0, fee_1.createOrUpdateAllFees)(event.address, event.params.newSwapFee, contract.swapStorage().value5 /* adminFee */);
}
exports.handleNewSwapFee = handleNewSwapFee;
function handleRemoveLiquidity(event) {
    (0, event_1.createWithdraw)(event, event.params.tokenAmounts, event.params.lpTokenSupply, event.params.provider);
}
exports.handleRemoveLiquidity = handleRemoveLiquidity;
function handleRemoveLiquidityImbalance(event) {
    (0, event_1.createWithdraw)(event, event.params.tokenAmounts, event.params.lpTokenSupply, event.params.provider);
}
exports.handleRemoveLiquidityImbalance = handleRemoveLiquidityImbalance;
function handleRemoveLiquidityOne(event) {
    const pool = (0, pool_1.getOrCreatePool)(event.address);
    let inputTokenCount = pool.inputTokens.length;
    if (pool._basePool) {
        const basePool = (0, pool_1.getOrCreatePool)(graph_ts_1.Address.fromString(pool._basePool));
        inputTokenCount = inputTokenCount - basePool.inputTokens.length + 1;
    }
    const inputTokenAmounts = new Array(inputTokenCount).map(() => constants_1.BIGINT_ZERO);
    inputTokenAmounts[event.params.boughtId.toI32()] = event.params.tokensBought;
    (0, event_1.createWithdraw)(event, inputTokenAmounts, event.params.lpTokenSupply.minus(event.params.lpTokenAmount), event.params.provider);
}
exports.handleRemoveLiquidityOne = handleRemoveLiquidityOne;
function handleTokenSwap(event) {
    const pool = (0, pool_1.getOrCreatePool)(event.address);
    let tokenIn = (0, token_1.getOrCreateTokenFromString)(pool._inputTokensOrdered[event.params.soldId.toI32()]);
    let tokenOut = (0, token_1.getOrCreateTokenFromString)(pool._inputTokensOrdered[event.params.boughtId.toI32()]);
    if (isLPSwap(event, pool)) {
        const basePool = (0, pool_1.getOrCreatePool)(graph_ts_1.Address.fromString(pool._basePool));
        const lpToken = (0, token_1.getOrCreateTokenFromString)(basePool.outputToken);
        if (event.params.soldId.gt(event.params.boughtId)) {
            tokenIn = lpToken;
        }
        else {
            tokenOut = lpToken;
        }
    }
    (0, event_1.createSwap)(pool, event, tokenIn, event.params.tokensSold, tokenOut, event.params.tokensBought, event.params.buyer);
}
exports.handleTokenSwap = handleTokenSwap;
// isLPSwap will return true if any of the tokens being swapped is an LP token from
// another saddle pool. Since metapools can be used to swap against the LP
// or against its underlying tokens.
function isLPSwap(event, pool) {
    if (!pool._basePool) {
        return false;
    }
    const basePool = (0, pool_1.getOrCreatePool)(graph_ts_1.Address.fromString(pool._basePool));
    const lpTokenIndex = pool.inputTokens.length - basePool.inputTokens.length;
    return (event.params.soldId.toI32() == lpTokenIndex ||
        event.params.boughtId.toI32() == lpTokenIndex);
}
function handleTokenSwapUnderlying(event) {
    const pool = (0, pool_1.getOrCreatePool)(event.address);
    const basePool = (0, pool_1.getOrCreatePool)(graph_ts_1.Address.fromString(pool._basePool));
    const lpTokenIndex = pool.inputTokens.length - basePool.inputTokens.length;
    const soldId = event.params.soldId.toI32();
    const boughtId = event.params.boughtId.toI32();
    if (soldId >= lpTokenIndex && boughtId >= lpTokenIndex) {
        // Swap is already handled in underlying pool
        return;
    }
    const tokenIn = (0, token_1.getOrCreateTokenFromString)(pool._inputTokensOrdered[soldId]);
    const tokenOut = (0, token_1.getOrCreateTokenFromString)(pool._inputTokensOrdered[boughtId]);
    (0, event_1.createSwap)(pool, event, tokenIn, event.params.tokensSold, tokenOut, event.params.tokensBought, event.params.buyer);
}
exports.handleTokenSwapUnderlying = handleTokenSwapUnderlying;
