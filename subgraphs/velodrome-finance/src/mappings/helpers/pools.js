"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePoolFeesForList = exports.updateAllPoolFees = exports.updatePoolVolume = exports.updatePoolValue = exports.updateTokenBalances = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const numbers_1 = require("../../common/utils/numbers");
const entities_1 = require("./entities");
function getPoolTokenWeights(totalValueLockedUSD, inputTokens, inputTokenBalances) {
    const inputTokenWeights = [];
    for (let idx = 0; idx < inputTokens.length; idx++) {
        if (totalValueLockedUSD == constants_1.BIGDECIMAL_ZERO) {
            inputTokenWeights.push(constants_1.BIGDECIMAL_ZERO);
            continue;
        }
        const balance = inputTokenBalances[idx];
        const inputToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(inputTokens[idx]));
        const balanceUSD = balance
            .divDecimal(constants_1.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal())
            .times(inputToken.lastPriceUSD);
        const weight = balanceUSD
            .div(totalValueLockedUSD)
            .times(constants_1.BIGDECIMAL_HUNDRED);
        inputTokenWeights.push(weight);
    }
    return inputTokenWeights;
}
//  Update token balances, which also updates token weights
function updateTokenBalances(pool, balance0, balance1) {
    pool.inputTokenBalances = [balance0, balance1];
    pool.inputTokenWeights = getPoolTokenWeights(pool.totalValueLockedUSD, pool.inputTokens, pool.inputTokenBalances);
    pool.save();
}
exports.updateTokenBalances = updateTokenBalances;
// Updates TVL and output token price
function updatePoolValue(protocol, pool, block) {
    const token0 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[0]));
    const token1 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[1]));
    const lpToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.id));
    const reserve0USD = (0, numbers_1.applyDecimals)(pool.inputTokenBalances[0], token0.decimals).times(token0.lastPriceUSD);
    const reserve1USD = (0, numbers_1.applyDecimals)(pool.inputTokenBalances[1], token1.decimals).times(token1.lastPriceUSD);
    const previousPoolTvlUSD = pool.totalValueLockedUSD;
    pool.totalValueLockedUSD = reserve0USD.plus(reserve1USD);
    protocol.totalValueLockedUSD = protocol.totalValueLockedUSD
        .minus(previousPoolTvlUSD)
        .plus(reserve0USD.plus(reserve1USD));
    pool.outputTokenPriceUSD = (0, numbers_1.safeDiv)(pool.totalValueLockedUSD, (0, numbers_1.applyDecimals)(pool.outputTokenSupply, lpToken.decimals));
    lpToken.lastPriceUSD = pool.outputTokenPriceUSD;
    lpToken.lastPriceBlockNumber = block.number;
    protocol.save();
    pool.save();
    lpToken.save();
}
exports.updatePoolValue = updatePoolValue;
function updatePoolVolume(protocol, pool, amount0, amount1, event) {
    const token0 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[0]));
    const token1 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[1]));
    // Need token USD (0,1)
    let amount0USD = (0, numbers_1.applyDecimals)(amount0, token0.decimals).times(token0.lastPriceUSD);
    let amount1USD = (0, numbers_1.applyDecimals)(amount1, token1.decimals).times(token1.lastPriceUSD);
    let amountTotalUSD = constants_1.BIGDECIMAL_ZERO;
    if (token0.lastPriceUSD != constants_1.BIGDECIMAL_ZERO &&
        token1.lastPriceUSD != constants_1.BIGDECIMAL_ZERO) {
        amountTotalUSD = amount0USD.plus(amount1USD).div(constants_1.BIGDECIMAL_TWO);
    }
    else if (token0.lastPriceUSD == constants_1.BIGDECIMAL_ZERO &&
        token1.lastPriceUSD != constants_1.BIGDECIMAL_ZERO) {
        // Token0 price is zero but token1 is not. Use token1 amount only
        amount0USD = amount1USD;
        amountTotalUSD = amount1USD.times(constants_1.BIGDECIMAL_TWO);
    }
    else if (token0.lastPriceUSD != constants_1.BIGDECIMAL_ZERO &&
        token1.lastPriceUSD == constants_1.BIGDECIMAL_ZERO) {
        // Token1 price is zero but token0 is not. Use 2x token1
        amount1USD = amount0USD;
        amountTotalUSD = amount0USD.times(constants_1.BIGDECIMAL_TWO);
    }
    else {
        // Both amounts are zero, nothing to update
        return;
    }
    // Update entities
    pool.cumulativeVolumeUSD = pool.cumulativeVolumeUSD.plus(amountTotalUSD);
    protocol.cumulativeVolumeUSD =
        protocol.cumulativeVolumeUSD.plus(amountTotalUSD);
    const financialsDailySnapshot = (0, getters_1.getOrCreateFinancialsDailySnapshot)(protocol, event);
    financialsDailySnapshot.dailyVolumeUSD =
        financialsDailySnapshot.dailyVolumeUSD.plus(amountTotalUSD);
    financialsDailySnapshot.cumulativeVolumeUSD =
        financialsDailySnapshot.cumulativeVolumeUSD.plus(amountTotalUSD);
    financialsDailySnapshot.blockNumber = event.block.number;
    financialsDailySnapshot.timestamp = event.block.timestamp;
    const poolDailySnapshot = (0, getters_1.getOrCreateLiquidityPoolDailySnapshot)(pool, event.block);
    poolDailySnapshot.dailyVolumeUSD =
        poolDailySnapshot.dailyVolumeUSD.plus(amountTotalUSD);
    poolDailySnapshot.dailyVolumeByTokenAmount = [
        poolDailySnapshot.dailyVolumeByTokenAmount[0].plus(amount0),
        poolDailySnapshot.dailyVolumeByTokenAmount[1].plus(amount1),
    ];
    poolDailySnapshot.dailyVolumeByTokenUSD = [
        poolDailySnapshot.dailyVolumeByTokenUSD[0].plus(amount0USD),
        poolDailySnapshot.dailyVolumeByTokenUSD[1].plus(amount1USD),
    ];
    poolDailySnapshot.cumulativeVolumeUSD =
        poolDailySnapshot.cumulativeVolumeUSD.plus(amountTotalUSD);
    poolDailySnapshot.blockNumber = event.block.number;
    poolDailySnapshot.timestamp = event.block.timestamp;
    const poolHourlySnapshot = (0, getters_1.getOrCreateLiquidityPoolHourlySnapshot)(pool, event.block);
    poolHourlySnapshot.hourlyVolumeUSD =
        poolHourlySnapshot.hourlyVolumeUSD.plus(amountTotalUSD);
    poolHourlySnapshot.hourlyVolumeByTokenAmount = [
        poolHourlySnapshot.hourlyVolumeByTokenAmount[0].plus(amount0),
        poolHourlySnapshot.hourlyVolumeByTokenAmount[1].plus(amount1),
    ];
    poolHourlySnapshot.hourlyVolumeByTokenUSD = [
        poolHourlySnapshot.hourlyVolumeByTokenUSD[0].plus(amount0USD),
        poolHourlySnapshot.hourlyVolumeByTokenUSD[1].plus(amount1USD),
    ];
    poolHourlySnapshot.cumulativeVolumeUSD =
        poolHourlySnapshot.cumulativeVolumeUSD.plus(amountTotalUSD);
    poolHourlySnapshot.blockNumber = event.block.number;
    poolHourlySnapshot.timestamp = event.block.timestamp;
    pool.save();
    protocol.save();
    financialsDailySnapshot.save();
    poolDailySnapshot.save();
    poolHourlySnapshot.save();
}
exports.updatePoolVolume = updatePoolVolume;
function updateAllPoolFees(protocol, stableFee, volatileFee, block, forceUpdate = false) {
    const blocksSinceLastChecked = block.number.minus(protocol._lastFeeCheckBlockNumber);
    if (!forceUpdate && blocksSinceLastChecked < constants_1.FEE_CHECK_INTERVAL_BLOCKS) {
        return;
    }
    const stableFeeChanged = stableFee != protocol._stableFee;
    const volatileFeeChanged = volatileFee != protocol._volatileFee;
    if (!(stableFeeChanged && volatileFeeChanged)) {
        return;
    }
    if (stableFeeChanged) {
        protocol._stableFee = stableFee;
        updatePoolFeesForList(protocol._stablePools, stableFee);
    }
    if (volatileFeeChanged) {
        protocol._volatileFee = volatileFee;
        updatePoolFeesForList(protocol._volatilePools, volatileFee);
    }
    protocol._lastFeeCheckBlockNumber = block.number;
    protocol.save();
}
exports.updateAllPoolFees = updateAllPoolFees;
function updatePoolFeesForList(poolList, fee) {
    for (let i = 0; i < poolList.length; i++) {
        const pool = (0, getters_1.getLiquidityPool)(graph_ts_1.Address.fromBytes(poolList[i]));
        if (!pool)
            return;
        if (pool._customFeeApplied)
            continue;
        (0, entities_1.createPoolFees)(graph_ts_1.Address.fromBytes(poolList[i]), fee);
    }
}
exports.updatePoolFeesForList = updatePoolFeesForList;
