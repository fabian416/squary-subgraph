"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwap = exports.createLiquidityPool = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const getters_1 = require("./getters");
const utils_1 = require("./utils");
const schema_1 = require("../../generated/schema");
const templates_1 = require("../../generated/templates");
// Create a liquidity pool from PairCreated event emission.
function createLiquidityPool(event, poolAddress, token0Address, token1Address) {
    const protocol = (0, getters_1.getOrCreateProtocol)();
    // create the tokens and tokentracker
    const token0 = (0, getters_1.getOrCreateToken)(token0Address);
    const token1 = (0, getters_1.getOrCreateToken)(token1Address);
    if (token0.decimals < constants_1.EXPONENT_MIN ||
        token0.decimals > constants_1.EXPONENT_MAX ||
        token0.decimals < constants_1.EXPONENT_MIN ||
        token1.decimals > constants_1.EXPONENT_MAX) {
        // If decimals for any of the input tokens are not in range [-6143, 6144]. Ignore it.
        // https://github.com/messari/subgraphs/issues/2375
        graph_ts_1.log.error("Decimals for token(s) out of range - Ignore creating pair: token0: {} token1: {}", [token0.id, token1.id]);
        return;
    }
    const LPtoken = (0, getters_1.getOrCreateLPToken)(poolAddress, token0, token1);
    const pool = new schema_1.LiquidityPool(poolAddress);
    pool.protocol = protocol.id;
    pool.name = protocol.name + " " + LPtoken.symbol;
    pool.symbol = LPtoken.symbol;
    pool.inputTokens = [token0.id, token1.id];
    pool.outputToken = LPtoken.id;
    pool.fees = [];
    pool.isSingleSided = false;
    pool.createdTimestamp = event.block.timestamp;
    pool.createdBlockNumber = event.block.number;
    pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    pool.inputTokenBalances = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
    pool.inputTokenWeights = [constants_1.BIGDECIMAL_FIFTY_PERCENT, constants_1.BIGDECIMAL_FIFTY_PERCENT];
    pool.outputTokenSupply = constants_1.BIGINT_ZERO;
    pool.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    pool.save();
    // update number of pools
    protocol.totalPoolCount += 1;
    protocol.save();
    // Create and track the newly created pool contract based on the template specified in the subgraph.yaml file.
    templates_1.Pair.create(graph_ts_1.Address.fromString(poolAddress));
}
exports.createLiquidityPool = createLiquidityPool;
// Handle swaps data and update entities volumes and fees
function createSwap(event, to, sender, amount0In, amount1In, amount0Out, amount1Out) {
    if (amount0Out.gt(constants_1.BIGINT_ZERO) && amount1Out.gt(constants_1.BIGINT_ZERO)) {
        // If there are two output tokens with non-zero values, this is an invalid swap. Ignore it.
        graph_ts_1.log.error("Two output tokens - Invalid Swap: amount0Out: {} amount1Out: {}", [amount0Out.toString(), amount1Out.toString()]);
        return;
    }
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const pool = (0, getters_1.getLiquidityPool)(event.address.toHexString());
    const token0 = (0, getters_1.getOrCreateToken)(pool.inputTokens[0]);
    const token1 = (0, getters_1.getOrCreateToken)(pool.inputTokens[1]);
    // totals for volume updates
    const amount0 = amount0In.minus(amount0Out);
    const amount1 = amount1In.minus(amount1Out);
    token0._totalSupply = token0._totalSupply.plus(amount0);
    token1._totalSupply = token1._totalSupply.plus(amount1);
    token0._totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    token1._totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    token0.save();
    token1.save();
    // Gets the tokenIn and tokenOut payload based on the amounts
    const swapTokens = getSwapTokens(token0, token1, amount0In, amount0Out, amount1In, amount1Out);
    const logIndexI32 = event.logIndex.toI32();
    const transactionHash = event.transaction.hash.toHexString();
    const swap = new schema_1.Swap(transactionHash.concat("-").concat(event.logIndex.toString()));
    // update swap event
    swap.hash = transactionHash;
    swap.logIndex = logIndexI32;
    swap.protocol = protocol.id;
    swap.to = to;
    swap.from = sender;
    swap.blockNumber = event.block.number;
    swap.timestamp = event.block.timestamp;
    swap.tokenIn = swapTokens.tokenIn.id;
    swap.amountIn = swapTokens.amountIn;
    swap.amountInUSD = swapTokens.tokenInUSD;
    swap.tokenOut = swapTokens.tokenOut.id;
    swap.amountOut = swapTokens.amountOut;
    swap.amountOutUSD = swapTokens.tokenOutUSD;
    swap.reserveAmounts = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
    swap.pool = pool.id;
    swap.save();
}
exports.createSwap = createSwap;
class SwapTokens {
}
// The purpose of this function is to identity input and output tokens for a swap event
function getSwapTokens(token0, token1, amount0In, amount0Out, amount1In, amount1Out) {
    let tokenIn;
    let tokenOut;
    let amountIn;
    let amountOut;
    if (amount0Out.gt(constants_1.BIGINT_ZERO)) {
        tokenIn = token1;
        tokenOut = token0;
        amountIn = amount1In.minus(amount1Out);
        amountOut = amount0In.minus(amount0Out).times(constants_1.BIGINT_NEG_ONE);
    }
    else {
        tokenIn = token0;
        tokenOut = token1;
        amountIn = amount0In.minus(amount0Out);
        amountOut = amount1In.minus(amount1Out).times(constants_1.BIGINT_NEG_ONE);
    }
    const amountInConverted = (0, utils_1.convertTokenToDecimal)(amountIn, tokenIn.decimals);
    const amountOutConverted = (0, utils_1.convertTokenToDecimal)(amountOut, tokenOut.decimals);
    const tokenInUSD = constants_1.BIGDECIMAL_ZERO;
    const tokenOutUSD = constants_1.BIGDECIMAL_ZERO;
    return {
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        amountInConverted,
        amountOutConverted,
        tokenInUSD,
        tokenOutUSD,
    };
}
