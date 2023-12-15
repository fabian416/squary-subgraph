"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwap = exports.createWithdraw = exports.createDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const numbers_1 = require("../utils/numbers");
const price_1 = require("../utils/price");
const pool_1 = require("./pool");
const protocol_1 = require("./protocol");
const pool_2 = require("./pool");
function createDeposit(event, inputTokenAmounts, // these come sorted as in the contract, which might not match pool.inputTokens positions.
totalOutputTokenAmount, provider) {
    const pool = (0, pool_1.getOrCreatePool)(event.address);
    const deposit = new schema_1.Deposit(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    deposit.pool = pool.id;
    deposit.hash = event.transaction.hash.toHexString();
    deposit.logIndex = event.logIndex.toI32();
    deposit.protocol = (0, protocol_1.getOrCreateProtocol)().id;
    deposit.to = pool.id;
    deposit.from = provider.toHexString();
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.inputTokens = pool.inputTokens;
    deposit.outputToken = pool.outputToken;
    deposit.inputTokenAmounts = getInputTokenAmounts(inputTokenAmounts, pool);
    deposit.outputTokenAmount = totalOutputTokenAmount.minus(pool.outputTokenSupply);
    deposit.amountUSD = (0, price_1.getTokenAmountsSumUSD)(event, deposit.inputTokenAmounts, pool.inputTokens);
    deposit.save();
    (0, pool_1.handlePoolDeposit)(event, pool, deposit);
    (0, protocol_1.updateUsageMetrics)(event, provider);
}
exports.createDeposit = createDeposit;
function createWithdraw(event, inputTokenAmounts, // these come sorted as in the contract, which might not match pool.inputTokens positions.
totalOutputTokenAmount, provider) {
    const pool = (0, pool_1.getOrCreatePool)(event.address);
    const withdraw = new schema_1.Withdraw(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    withdraw.pool = pool.id;
    withdraw.hash = event.transaction.hash.toHexString();
    withdraw.logIndex = event.logIndex.toI32();
    withdraw.protocol = (0, protocol_1.getOrCreateProtocol)().id;
    withdraw.to = provider.toHexString();
    withdraw.from = pool.id;
    withdraw.blockNumber = event.block.number;
    withdraw.timestamp = event.block.timestamp;
    withdraw.inputTokens = pool.inputTokens;
    withdraw.outputToken = pool.outputToken;
    withdraw.inputTokenAmounts = getInputTokenAmounts(inputTokenAmounts, pool);
    withdraw.outputTokenAmount = pool.outputTokenSupply.minus(totalOutputTokenAmount);
    withdraw.amountUSD = (0, price_1.getTokenAmountsSumUSD)(event, withdraw.inputTokenAmounts, pool.inputTokens);
    withdraw.save();
    (0, pool_1.handlePoolWithdraw)(event, pool, withdraw);
    (0, protocol_1.updateUsageMetrics)(event, provider);
}
exports.createWithdraw = createWithdraw;
function createSwap(pool, event, tokenIn, amountIn, tokenOut, amountOut, buyer) {
    const swap = new schema_1.Swap(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    swap.pool = pool.id;
    swap.hash = event.transaction.hash.toHexString();
    swap.logIndex = event.logIndex.toI32();
    swap.protocol = (0, protocol_1.getOrCreateProtocol)().id;
    swap.to = buyer.toHexString();
    swap.from = buyer.toHexString();
    swap.blockNumber = event.block.number;
    swap.timestamp = event.block.timestamp;
    swap.tokenIn = tokenIn.id;
    swap.amountIn = amountIn;
    swap.amountInUSD = (0, numbers_1.bigIntToBigDecimal)(amountIn, tokenIn.decimals).times((0, price_1.getPriceUSD)(tokenIn, event));
    swap.tokenOut = tokenOut.id;
    swap.amountOut = amountOut;
    swap.amountOutUSD = (0, numbers_1.bigIntToBigDecimal)(amountOut, tokenOut.decimals).times((0, price_1.getPriceUSD)(tokenOut, event));
    swap.save();
    (0, pool_1.handlePoolSwap)(event, pool, swap);
    (0, protocol_1.updateUsageMetrics)(event, buyer);
}
exports.createSwap = createSwap;
// getInputTokenAmounts will return the token balances of each pool.inputTokens
// sorted to match the order of inputTokens. It expects the param tokenAmounts to be
// sorted as they are in the contract (which might differ from pool.inputTokens).
// If the pool is a meta pool, the base token will be replaced with the underlying amounts.
// To be able to sort those properly, since they are already sorted inside pool._basePool.inputTokens
// we need to sort them as in the contract to then sort them again together with the pool tokens.
// Attempting to explain in a more visual way, given a pool:
// pool [tokenA, tokenB, baseToken(tokenC, tokenD)]
// When decomposing the baseToken and sorting the tokens on our entity
// it might end up being:
// pool[tokenC, tokenA, tokenD, tokenB]
// So we have to make sure that we move the tokenAmounts in the same way token IDs move.
function getInputTokenAmounts(tokenAmounts, pool) {
    if (!pool._basePool) {
        return (0, pool_2.sortValuesByTokenOrder)(pool._inputTokensOrdered, pool.inputTokens, tokenAmounts);
    }
    const lpTokenBalance = tokenAmounts.pop();
    const basePool = (0, pool_1.getOrCreatePool)(graph_ts_1.Address.fromString(pool._basePool));
    const totalLPTokenSupply = basePool.outputTokenSupply;
    // Calculate input token amounts based on LP token ratio
    let bpTokenAmounts = new Array();
    for (let i = 0; i < basePool.inputTokenBalances.length; i++) {
        const balance = basePool.inputTokenBalances[i];
        bpTokenAmounts.push(balance.times(lpTokenBalance).div(totalLPTokenSupply));
    }
    // sort BP token amounts as in the contract
    bpTokenAmounts = (0, pool_2.sortValuesByTokenOrder)(basePool.inputTokens, basePool._inputTokensOrdered, bpTokenAmounts);
    // sort all token amounts together.
    return (0, pool_2.sortValuesByTokenOrder)(pool._inputTokensOrdered, pool.inputTokens, tokenAmounts.concat(bpTokenAmounts));
}
