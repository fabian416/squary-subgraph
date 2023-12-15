"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwapTokens = exports.createSwapHandleVolumeAndFees = exports.createLiquidityPool = exports.createPoolFees = void 0;
// import { log } from "@graphprotocol/graph-ts";
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../../configurations/configure");
const schema_1 = require("../../../../generated/schema");
const templates_1 = require("../../../../generated/templates");
const constants_1 = require("../../../../src/common/constants");
const getters_1 = require("../../../../src/common/getters");
const updateMetrics_1 = require("../../../../src/common/updateMetrics");
const utils_1 = require("../../../../src/common/utils/utils");
const price_1 = require("../../../../src/price/price");
const constants_2 = require("./constants");
const updateMetrics_2 = require("./updateMetrics");
function getOrCreateLiquidityPoolFee(id) {
    let fee = schema_1.LiquidityPoolFee.load(id);
    if (!fee) {
        fee = new schema_1.LiquidityPoolFee(id);
    }
    return fee;
}
// Create seperate fees for both tokens to handle directional fees
// If fee percent is not the same for both tokens, then fee types are set to dynamic and amounts to null
function createPoolFees(poolAddress, token0TradingFee = null, token1TradingFee = null) {
    const poolLpFee = getOrCreateLiquidityPoolFee(poolAddress.concat("-lp-fee"));
    const poolLpFeeToken0 = getOrCreateLiquidityPoolFee(poolAddress.concat("-lp-fee-0"));
    const poolLpFeeToken1 = getOrCreateLiquidityPoolFee(poolAddress.concat("-lp-fee-1"));
    const poolProtocolFee = getOrCreateLiquidityPoolFee(poolAddress.concat("-protocol-fee"));
    const poolProtocolFeeToken0 = getOrCreateLiquidityPoolFee(poolAddress.concat("-protocol-fee-0"));
    const poolProtocolFeeToken1 = getOrCreateLiquidityPoolFee(poolAddress.concat("-protocol-fee-1"));
    const poolTradingFee = getOrCreateLiquidityPoolFee(poolAddress.concat("-trading-fee"));
    const poolTradingFeeToken0 = getOrCreateLiquidityPoolFee(poolAddress.concat("-trading-fee-0"));
    const poolTradingFeeToken1 = getOrCreateLiquidityPoolFee(poolAddress.concat("-trading-fee-1"));
    if (token0TradingFee && token1TradingFee) {
        if (token0TradingFee.notEqual(token1TradingFee)) {
            poolLpFee.feeType = constants_1.LiquidityPoolFeeType.DYNAMIC_LP_FEE;
            poolLpFee.feePercentage = null;
            poolProtocolFee.feeType = constants_1.LiquidityPoolFeeType.DYNAMIC_PROTOCOL_FEE;
            poolProtocolFee.feePercentage = null;
            poolTradingFee.feeType = constants_1.LiquidityPoolFeeType.DYNAMIC_LP_FEE;
            poolTradingFee.feePercentage = null;
        }
        else {
            poolLpFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_LP_FEE;
            poolProtocolFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE;
            poolTradingFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE;
            poolTradingFee.feePercentage = token0TradingFee;
        }
        poolLpFeeToken0.feeType = constants_1.LiquidityPoolFeeType.FIXED_LP_FEE;
        poolProtocolFeeToken0.feeType = constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE;
        poolTradingFeeToken0.feeType = constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE;
        poolTradingFeeToken0.feePercentage = token0TradingFee;
        poolLpFeeToken1.feeType = constants_1.LiquidityPoolFeeType.FIXED_LP_FEE;
        poolProtocolFeeToken1.feeType = constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE;
        poolTradingFeeToken1.feeType = constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE;
        poolTradingFeeToken1.feePercentage = token1TradingFee;
    }
    let protocolFeeShare = schema_1.LiquidityPoolFee.load(constants_2.PROTOCOL_FEE_SHARE_ID);
    if (!protocolFeeShare) {
        protocolFeeShare = new schema_1.LiquidityPoolFee(constants_2.PROTOCOL_FEE_SHARE_ID);
        protocolFeeShare.feeType = constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE;
        protocolFeeShare.feePercentage = constants_1.BIGDECIMAL_FIFTY_PERCENT;
        protocolFeeShare.save();
    }
    if (poolTradingFee.feePercentage) {
        poolProtocolFee.feePercentage = (0, utils_1.percToDec)(protocolFeeShare.feePercentage).times(poolTradingFee.feePercentage);
        poolLpFee.feePercentage = poolTradingFee.feePercentage.minus(poolProtocolFee.feePercentage);
    }
    poolProtocolFeeToken0.feePercentage = (0, utils_1.percToDec)(protocolFeeShare.feePercentage).times(poolTradingFeeToken0.feePercentage);
    poolLpFeeToken0.feePercentage = poolTradingFeeToken0.feePercentage.minus(poolProtocolFeeToken0.feePercentage);
    poolProtocolFeeToken1.feePercentage = (0, utils_1.percToDec)(protocolFeeShare.feePercentage).times(poolTradingFeeToken1.feePercentage);
    poolLpFeeToken1.feePercentage = poolTradingFeeToken1.feePercentage.minus(poolProtocolFeeToken1.feePercentage);
    poolLpFee.save();
    poolProtocolFee.save();
    poolTradingFee.save();
    poolLpFeeToken0.save();
    poolProtocolFeeToken0.save();
    poolTradingFeeToken0.save();
    poolLpFeeToken1.save();
    poolProtocolFeeToken1.save();
    poolTradingFeeToken1.save();
    return [poolLpFee.id, poolProtocolFee.id, poolTradingFee.id];
}
exports.createPoolFees = createPoolFees;
// Create a liquidity pool from PairCreated event emission.
function createLiquidityPool(event, poolAddress, token0Address, token1Address) {
    const protocol = (0, getters_1.getOrCreateProtocol)();
    // create the tokens and tokentracker
    const token0 = (0, getters_1.getOrCreateToken)(event, token0Address);
    const token1 = (0, getters_1.getOrCreateToken)(event, token1Address);
    const LPtoken = (0, getters_1.getOrCreateLPToken)(poolAddress, token0, token1);
    (0, updateMetrics_1.updateTokenWhitelists)(token0, token1, poolAddress);
    const pool = new schema_1.LiquidityPool(poolAddress);
    const poolAmounts = new schema_1._LiquidityPoolAmount(poolAddress);
    pool.protocol = protocol.id;
    pool.name = protocol.name + " " + LPtoken.symbol;
    pool.symbol = LPtoken.symbol;
    pool.inputTokens = [token0.id, token1.id];
    pool.outputToken = LPtoken.id;
    pool.fees = createPoolFees(poolAddress, configure_1.NetworkConfigs.getTradeFee(constants_1.BIGINT_ZERO), configure_1.NetworkConfigs.getTradeFee(constants_1.BIGINT_ZERO));
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
    pool.stakedOutputTokenAmount = constants_1.BIGINT_ZERO;
    poolAmounts.inputTokens = [token0.id, token1.id];
    poolAmounts.inputTokenBalances = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    const helperStore = new schema_1._HelperStore(poolAddress);
    // Used to track the number of deposits in a liquidity pool
    helperStore.valueInt = constants_1.INT_ZERO;
    // Liquidity pool pair type
    helperStore.valueString = constants_2.PairType.VOLATILE;
    // update number of pools
    protocol.totalPoolCount += 1;
    protocol.save();
    // Create and track the newly created pool contract based on the template specified in the subgraph.yaml file.
    templates_1.Pair.create(graph_ts_1.Address.fromString(poolAddress));
    pool.save();
    token0.save();
    token1.save();
    LPtoken.save();
    poolAmounts.save();
    helperStore.save();
}
exports.createLiquidityPool = createLiquidityPool;
// Handle swaps data and update entities volumes and fees
function createSwapHandleVolumeAndFees(event, to, sender, amount0In, amount1In, amount0Out, amount1Out) {
    if (amount0Out.gt(constants_1.BIGINT_ZERO) && amount1Out.gt(constants_1.BIGINT_ZERO)) {
        // If there are two output tokens with non-zero values, this is an invalid swap. Ignore it.
        graph_ts_1.log.error("Two output tokens - Invalid Swap: amount0Out: {} amount1Out: {}", [amount0Out.toString(), amount1Out.toString()]);
        return;
    }
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const pool = (0, getters_1.getLiquidityPool)(event.address.toHexString());
    const poolAmounts = (0, getters_1.getLiquidityPoolAmounts)(event.address.toHexString());
    const token0 = (0, getters_1.getOrCreateToken)(event, pool.inputTokens[0]);
    const token1 = (0, getters_1.getOrCreateToken)(event, pool.inputTokens[1]);
    // totals for volume updates
    const amount0 = amount0In.minus(amount0Out);
    const amount1 = amount1In.minus(amount1Out);
    token0._totalSupply = token0._totalSupply.plus(amount0);
    token1._totalSupply = token1._totalSupply.plus(amount1);
    token0._totalValueLockedUSD = (0, utils_1.convertTokenToDecimal)(token0._totalSupply, token0.decimals).times(token0.lastPriceUSD);
    token1._totalValueLockedUSD = (0, utils_1.convertTokenToDecimal)(token1._totalSupply, token1.decimals).times(token1.lastPriceUSD);
    token0.save();
    token1.save();
    // Gets the tokenIn and tokenOut payload based on the amounts
    const swapTokens = getSwapTokens(token0, token1, amount0In, amount0Out, amount1In, amount1Out);
    const reserve0Amount = pool.inputTokenBalances[0];
    const reserve1Amount = pool.inputTokenBalances[1];
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
    swap.reserveAmounts = [reserve0Amount, reserve1Amount];
    swap.pool = pool.id;
    swap.save();
    // only accounts for volume through white listed tokens
    const trackedAmountUSD = (0, price_1.getTrackedVolumeUSD)(poolAmounts, swapTokens.amountInConverted, swapTokens.tokenIn, swapTokens.amountOutConverted, swapTokens.tokenOut);
    (0, updateMetrics_2.updateVolumeAndFees)(event, protocol, pool, trackedAmountUSD, pool.inputTokens.indexOf(swapTokens.tokenIn.id), amount0.abs(), amount1.abs());
}
exports.createSwapHandleVolumeAndFees = createSwapHandleVolumeAndFees;
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
    const tokenInUSD = tokenIn.lastPriceUSD.times(amountInConverted);
    const tokenOutUSD = tokenOut.lastPriceUSD.times(amountOutConverted);
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
exports.getSwapTokens = getSwapTokens;
