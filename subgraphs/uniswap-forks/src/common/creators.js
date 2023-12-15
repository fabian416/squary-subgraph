"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwapTokens = exports.createSwapHandleVolumeAndFees = exports.createWithdraw = exports.createDeposit = exports.createAndIncrementAccount = exports.createLiquidityPool = exports.createPoolFees = void 0;
// import { log } from "@graphprotocol/graph-ts";
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const templates_1 = require("../../generated/templates");
const constants_1 = require("./constants");
const getters_1 = require("./getters");
const utils_1 = require("./utils/utils");
const updateMetrics_1 = require("./updateMetrics");
const configure_1 = require("../../configurations/configure");
const price_1 = require("../price/price");
/**
 * Create the fee for a pool depending on the the protocol and network specific fee structure.
 * Specified in the typescript configuration file.
 */
function createPoolFees(poolAddress, blockNumber) {
    // get or create fee entities, set fee types
    let poolLpFee = schema_1.LiquidityPoolFee.load(poolAddress.concat("-lp-fee"));
    if (!poolLpFee) {
        poolLpFee = new schema_1.LiquidityPoolFee(poolAddress.concat("-lp-fee"));
        poolLpFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_LP_FEE;
    }
    let poolProtocolFee = schema_1.LiquidityPoolFee.load(poolAddress.concat("-protocol-fee"));
    if (!poolProtocolFee) {
        poolProtocolFee = new schema_1.LiquidityPoolFee(poolAddress.concat("-protocol-fee"));
        poolProtocolFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE;
    }
    let poolTradingFee = schema_1.LiquidityPoolFee.load(poolAddress.concat("-trading-fee"));
    if (!poolTradingFee) {
        poolTradingFee = new schema_1.LiquidityPoolFee(poolAddress.concat("-trading-fee"));
        poolTradingFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE;
    }
    // set fees
    if (configure_1.NetworkConfigs.getFeeOnOff() == constants_1.FeeSwitch.ON) {
        poolLpFee.feePercentage = configure_1.NetworkConfigs.getLPFeeToOn(blockNumber);
        poolProtocolFee.feePercentage =
            configure_1.NetworkConfigs.getProtocolFeeToOn(blockNumber);
    }
    else {
        poolLpFee.feePercentage = configure_1.NetworkConfigs.getLPFeeToOff();
        poolProtocolFee.feePercentage = configure_1.NetworkConfigs.getProtocolFeeToOff();
    }
    poolTradingFee.feePercentage = configure_1.NetworkConfigs.getTradeFee(blockNumber);
    poolLpFee.save();
    poolProtocolFee.save();
    poolTradingFee.save();
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
    pool.fees = createPoolFees(poolAddress, event.block.number);
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
    poolAmounts.inputTokens = [token0.id, token1.id];
    poolAmounts.inputTokenBalances = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    // Used to track the number of deposits in a liquidity pool
    const poolDeposits = new schema_1._HelperStore(poolAddress);
    poolDeposits.valueInt = constants_1.INT_ZERO;
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
    poolDeposits.save();
}
exports.createLiquidityPool = createLiquidityPool;
// Create Account entity for participating account
function createAndIncrementAccount(accountId) {
    let account = schema_1.Account.load(accountId);
    if (!account) {
        account = new schema_1.Account(accountId);
        account.save();
        return constants_1.INT_ONE;
    }
    return constants_1.INT_ZERO;
}
exports.createAndIncrementAccount = createAndIncrementAccount;
// Create a Deposit entity and update deposit count on a Mint event for the specific pool..
function createDeposit(event, amount0, amount1) {
    const transfer = (0, getters_1.getOrCreateTransfer)(event);
    const pool = (0, getters_1.getLiquidityPool)(event.address.toHexString());
    const token0 = (0, getters_1.getOrCreateToken)(event, pool.inputTokens[constants_1.INT_ZERO]);
    const token1 = (0, getters_1.getOrCreateToken)(event, pool.inputTokens[constants_1.INT_ONE]);
    token0._totalSupply = token0._totalSupply.plus(amount0);
    token1._totalSupply = token1._totalSupply.plus(amount1);
    token0._totalValueLockedUSD = (0, utils_1.convertTokenToDecimal)(token0._totalSupply, token0.decimals).times(token0.lastPriceUSD);
    token1._totalValueLockedUSD = (0, utils_1.convertTokenToDecimal)(token1._totalSupply, token1.decimals).times(token1.lastPriceUSD);
    token0.save();
    token1.save();
    // update exchange info (except balances, sync will cover that)
    const token0Amount = (0, utils_1.convertTokenToDecimal)(amount0, token0.decimals);
    const token1Amount = (0, utils_1.convertTokenToDecimal)(amount1, token1.decimals);
    const reserve0Amount = pool.inputTokenBalances[0];
    const reserve1Amount = pool.inputTokenBalances[1];
    const logIndexI32 = event.logIndex.toI32();
    const transactionHash = event.transaction.hash.toHexString();
    const deposit = new schema_1.Deposit(transactionHash.concat("-").concat(event.logIndex.toString()));
    deposit.hash = transactionHash;
    deposit.logIndex = logIndexI32;
    deposit.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    deposit.to = pool.id;
    deposit.from = transfer.sender;
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.inputTokens = [pool.inputTokens[constants_1.INT_ZERO], pool.inputTokens[constants_1.INT_ONE]];
    deposit.outputToken = pool.outputToken;
    deposit.inputTokenAmounts = [amount0, amount1];
    deposit.outputTokenAmount = transfer.liquidity;
    deposit.reserveAmounts = [reserve0Amount, reserve1Amount];
    deposit.amountUSD = token0
        .lastPriceUSD.times(token0Amount)
        .plus(token1.lastPriceUSD.times(token1Amount));
    deposit.pool = pool.id;
    (0, updateMetrics_1.updateDepositHelper)(event.address);
    deposit.save();
}
exports.createDeposit = createDeposit;
// Create a Withdraw entity on a Burn event for the specific pool..
function createWithdraw(event, amount0, amount1) {
    const transfer = (0, getters_1.getOrCreateTransfer)(event);
    const pool = (0, getters_1.getLiquidityPool)(event.address.toHexString());
    const token0 = (0, getters_1.getOrCreateToken)(event, pool.inputTokens[constants_1.INT_ZERO]);
    const token1 = (0, getters_1.getOrCreateToken)(event, pool.inputTokens[constants_1.INT_ONE]);
    token0._totalSupply = token0._totalSupply.minus(amount0);
    token1._totalSupply = token1._totalSupply.minus(amount1);
    token0._totalValueLockedUSD = (0, utils_1.convertTokenToDecimal)(token0._totalSupply, token0.decimals).times(token0.lastPriceUSD);
    token1._totalValueLockedUSD = (0, utils_1.convertTokenToDecimal)(token1._totalSupply, token1.decimals).times(token1.lastPriceUSD);
    token0.save();
    token1.save();
    // update exchange info (except balances, sync will cover that)
    const token0Amount = (0, utils_1.convertTokenToDecimal)(amount0, token0.decimals);
    const token1Amount = (0, utils_1.convertTokenToDecimal)(amount1, token1.decimals);
    const reserve0Amount = pool.inputTokenBalances[0];
    const reserve1Amount = pool.inputTokenBalances[1];
    const logIndexI32 = event.logIndex.toI32();
    const transactionHash = event.transaction.hash.toHexString();
    const withdrawal = new schema_1.Withdraw(transactionHash.concat("-").concat(event.logIndex.toString()));
    withdrawal.hash = transactionHash;
    withdrawal.logIndex = logIndexI32;
    withdrawal.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    withdrawal.to = transfer.sender;
    withdrawal.from = pool.id;
    withdrawal.blockNumber = event.block.number;
    withdrawal.timestamp = event.block.timestamp;
    withdrawal.inputTokens = [
        pool.inputTokens[constants_1.INT_ZERO],
        pool.inputTokens[constants_1.INT_ONE],
    ];
    withdrawal.outputToken = pool.outputToken;
    withdrawal.inputTokenAmounts = [amount0, amount1];
    withdrawal.outputTokenAmount = transfer.liquidity;
    withdrawal.reserveAmounts = [reserve0Amount, reserve1Amount];
    withdrawal.amountUSD = token0
        .lastPriceUSD.times(token0Amount)
        .plus(token1.lastPriceUSD.times(token1Amount));
    withdrawal.pool = pool.id;
    graph_ts_1.store.remove("_Transfer", transfer.id);
    withdrawal.save();
}
exports.createWithdraw = createWithdraw;
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
    (0, updateMetrics_1.updateVolumeAndFees)(event, protocol, pool, trackedAmountUSD, amount0.abs(), amount1.abs());
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
