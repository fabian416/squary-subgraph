"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiquidityGauge = exports.createSwap = exports.createWithdraw = exports.createDeposit = exports.createPoolFees = exports.createPoolPricingHelper = exports.createLiquidityPool = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const baseTokenDefinition_1 = require("../../common/baseTokenDefinition");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const numbers_1 = require("../../common/utils/numbers");
const schema_1 = require("../../../generated/schema");
// Create a liquidity pool from PairCreated contract call
function createLiquidityPool(protocol, poolAddress, token0Address, token1Address, stable, hardcodedPools, event) {
    // create the tokens and tokentracker
    const token0 = (0, getters_1.getOrCreateToken)(token0Address);
    const token1 = (0, getters_1.getOrCreateToken)(token1Address);
    const LPtoken = (0, getters_1.getOrCreateToken)(poolAddress);
    const pool = new schema_1.LiquidityPool(poolAddress.toHexString());
    pool.protocol = protocol.id;
    pool.name = protocol.name + " " + LPtoken.symbol;
    pool.symbol = LPtoken.symbol;
    pool.inputTokens = [token0.id, token1.id];
    pool.outputToken = LPtoken.id;
    pool.isSingleSided = false;
    pool.createdTimestamp = event.block.timestamp;
    pool.createdBlockNumber = event.block.number;
    pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    pool.inputTokenBalances = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
    pool.inputTokenWeights = [
        graph_ts_1.BigDecimal.fromString("50"),
        graph_ts_1.BigDecimal.fromString("50"),
    ];
    pool.outputTokenSupply = constants_1.BIGINT_ZERO;
    pool.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    pool.stakedOutputTokenAmount = constants_1.BIGINT_ZERO;
    pool.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
    pool.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
    pool._stable = stable;
    const poolTradingFees = createPoolFees(poolAddress, pool._stable ? protocol._stableFee : protocol._volatileFee);
    pool.fees = [poolTradingFees.id];
    createPoolPricingHelper(poolAddress, token0Address, token1Address, hardcodedPools);
    const poolList = stable ? protocol._stablePools : protocol._volatilePools;
    poolList.push(poolAddress);
    if (stable) {
        protocol._stablePools = poolList;
    }
    else {
        protocol._volatilePools = poolList;
    }
    protocol.totalPoolCount += 1;
    pool.save();
    token0.save();
    token1.save();
    LPtoken.save();
    protocol.save();
}
exports.createLiquidityPool = createLiquidityPool;
function createPoolPricingHelper(poolAddress, token0Address, token1Address, hardcodedPools) {
    let helper = schema_1._PoolPricingHelper.load(poolAddress.toHex());
    if (!helper) {
        helper = new schema_1._PoolPricingHelper(poolAddress.toHex());
        const token0Lookup = (0, baseTokenDefinition_1.getBaseTokenLookup)(token0Address, hardcodedPools);
        const token1Lookup = (0, baseTokenDefinition_1.getBaseTokenLookup)(token1Address, hardcodedPools);
        // Reference arrays are in reverse order of priority. i.e. larger index take precedence
        if (token0Lookup.priority > token1Lookup.priority) {
            // token0 is the base token
            helper.whitelisted = true;
            helper.baseToken = token0Address.toHex();
            helper.baseTokenIndex = 0;
            helper.usdPath = token0Lookup.path;
            helper.usdPathBaseTokenIndex = token0Lookup.pathUsdIdx;
        }
        else if (token1Lookup.priority > token0Lookup.priority) {
            // token1 is the base token
            helper.whitelisted = true;
            helper.baseToken = token1Address.toHex();
            helper.baseTokenIndex = 1;
            helper.usdPath = token1Lookup.path;
            helper.usdPathBaseTokenIndex = token1Lookup.pathUsdIdx;
        }
        else {
            // This means token0 == token1 == -1, unidentified base token
            helper.whitelisted = false;
            helper.baseToken = constants_1.ZERO_ADDRESS;
            helper.baseTokenIndex = -1;
            helper.usdPath = [constants_1.ZERO_ADDRESS];
            helper.usdPathBaseTokenIndex = [-1];
        }
        helper.priceTokenInBase = constants_1.BIGDECIMAL_ZERO;
        helper.save();
    }
    return helper;
}
exports.createPoolPricingHelper = createPoolPricingHelper;
function createPoolFees(poolAddress, feePercentage) {
    let poolFee = schema_1.LiquidityPoolFee.load(constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE.concat(poolAddress.toHex()));
    if (!poolFee) {
        poolFee = new schema_1.LiquidityPoolFee(constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE.concat(poolAddress.toHex()));
        poolFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE;
    }
    poolFee.feePercentage = feePercentage;
    poolFee.save();
    return poolFee;
}
exports.createPoolFees = createPoolFees;
// Generate the deposit entity and update deposit account for the according pool.
function createDeposit(protocol, pool, amount0, amount1, from, event) {
    const transfer = (0, getters_1.getOrCreateTransfer)(event);
    const token0 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[0]));
    const token1 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[1]));
    // update exchange info (except balances, sync will cover that)
    const token0Adjusted = (0, numbers_1.applyDecimals)(amount0, token0.decimals);
    const token1Adjusted = (0, numbers_1.applyDecimals)(amount1, token1.decimals);
    const deposit = new schema_1.Deposit("deposit"
        .concat("-")
        .concat(event.transaction.hash.toHex())
        .concat("-")
        .concat(event.logIndex.toString()));
    deposit.hash = event.transaction.hash.toHex();
    deposit.logIndex = event.logIndex.toI32();
    deposit.protocol = protocol.id;
    deposit.to = event.address.toHex();
    deposit.from = from.toHex();
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.inputTokens = pool.inputTokens;
    deposit.outputToken = pool.outputToken;
    deposit.inputTokenAmounts = [amount0, amount1];
    deposit.outputTokenAmount = transfer.liquidity;
    deposit.amountUSD = token0
        .lastPriceUSD.times(token0Adjusted)
        .plus(token1.lastPriceUSD.times(token1Adjusted));
    deposit.pool = pool.id;
    deposit.save();
}
exports.createDeposit = createDeposit;
// Generate the withdraw entity
function createWithdraw(protocol, pool, amount0, amount1, to, event) {
    const transfer = (0, getters_1.getOrCreateTransfer)(event);
    const token0 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[0]));
    const token1 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[1]));
    // update exchange info (except balances, sync will cover that)
    const token0Adjusted = (0, numbers_1.applyDecimals)(amount0, token0.decimals);
    const token1Adjusted = (0, numbers_1.applyDecimals)(amount1, token1.decimals);
    const withdrawal = new schema_1.Withdraw("withdraw"
        .concat("-")
        .concat(event.transaction.hash.toHex())
        .concat("-")
        .concat(event.logIndex.toString()));
    withdrawal.hash = event.transaction.hash.toHex();
    withdrawal.logIndex = event.logIndex.toI32();
    withdrawal.protocol = protocol.id;
    withdrawal.to = to.toHex();
    withdrawal.from = event.address.toHex();
    withdrawal.blockNumber = event.block.number;
    withdrawal.timestamp = event.block.timestamp;
    withdrawal.inputTokens = pool.inputTokens;
    withdrawal.outputToken = pool.outputToken;
    withdrawal.inputTokenAmounts = [amount0, amount1];
    withdrawal.outputTokenAmount = transfer.liquidity;
    withdrawal.amountUSD = token0
        .lastPriceUSD.times(token0Adjusted)
        .plus(token1.lastPriceUSD.times(token1Adjusted));
    withdrawal.pool = pool.id;
    graph_ts_1.store.remove("_Transfer", transfer.id);
    withdrawal.save();
}
exports.createWithdraw = createWithdraw;
function createSwap(protocol, pool, amount0In, amount0Out, amount1In, amount1Out, from, to, event) {
    const token0 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[0]));
    const token1 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[1]));
    const amount0Total = amount0Out.plus(amount0In);
    const amount1Total = amount1Out.plus(amount1In);
    // update exchange info (except balances, sync will cover that)
    const amount0Adjusted = (0, numbers_1.applyDecimals)(amount0Total, token0.decimals);
    const amount1Adjusted = (0, numbers_1.applyDecimals)(amount1Total, token1.decimals);
    const swap = new schema_1.Swap("swap"
        .concat("-")
        .concat(event.transaction.hash.toHex())
        .concat("-")
        .concat(event.logIndex.toString()));
    swap.hash = event.transaction.hash.toHex();
    swap.logIndex = event.logIndex.toI32();
    swap.protocol = protocol.id;
    swap.to = to.toHex();
    swap.from = from.toHex();
    swap.blockNumber = event.block.number;
    swap.timestamp = event.block.timestamp;
    swap.pool = pool.id;
    if (amount0In != constants_1.BIGINT_ZERO) {
        swap.tokenIn = token0.id;
        swap.amountIn = amount0Total;
        swap.amountInUSD = token0.lastPriceUSD.times(amount0Adjusted);
        swap.tokenOut = token1.id;
        swap.amountOut = amount1Total;
        swap.amountOutUSD = token1.lastPriceUSD.times(amount1Adjusted);
    }
    else {
        swap.tokenIn = token1.id;
        swap.amountIn = amount1Total;
        swap.amountInUSD = token1.lastPriceUSD.times(amount1Adjusted);
        swap.tokenOut = token0.id;
        swap.amountOut = amount0Total;
        swap.amountOutUSD = token0.lastPriceUSD.times(amount0Adjusted);
    }
    swap.save();
}
exports.createSwap = createSwap;
function createLiquidityGauge(gaugeAddress, poolAddress) {
    const gauge = new schema_1._LiquidityGauge(gaugeAddress.toHex());
    gauge.pool = poolAddress.toHex();
    gauge.active = true;
    gauge.save();
    return gauge;
}
exports.createLiquidityGauge = createLiquidityGauge;
