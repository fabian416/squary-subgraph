"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDepositHelper = exports.updateVolumeAndFees = exports.updateTvlAndTokenPrices = exports.updateInputTokenBalances = exports.updateTokenWhitelists = exports.updatePoolMetrics = exports.updateUsageMetrics = exports.updateFinancials = void 0;
const schema_1 = require("../../generated/schema");
const getters_1 = require("./getters");
const constants_1 = require("./constants");
const utils_1 = require("./utils/utils");
const configure_1 = require("../../configurations/configure");
const creators_1 = require("./creators");
// Update FinancialsDailySnapshots entity
// Updated on Swap, Burn, and Mint events.
function updateFinancials(event) {
    const financialMetricsDaily = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    // Update the block number and timestamp to that of the last transaction of that day
    financialMetricsDaily.blockNumber = event.block.number;
    financialMetricsDaily.timestamp = event.block.timestamp;
    financialMetricsDaily.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialMetricsDaily.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD;
    financialMetricsDaily.save();
}
exports.updateFinancials = updateFinancials;
// Update usage metrics entities
// Updated on Swap, Burn, and Mint events.
function updateUsageMetrics(event, fromAddress, usageType) {
    const from = fromAddress.toHexString();
    const usageMetricsDaily = (0, getters_1.getOrCreateUsageMetricDailySnapshot)(event);
    const usageMetricsHourly = (0, getters_1.getOrCreateUsageMetricHourlySnapshot)(event);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    // Update the block number and timestamp to that of the last transaction of that day
    usageMetricsDaily.blockNumber = event.block.number;
    usageMetricsDaily.timestamp = event.block.timestamp;
    usageMetricsDaily.dailyTransactionCount += constants_1.INT_ONE;
    usageMetricsHourly.blockNumber = event.block.number;
    usageMetricsHourly.timestamp = event.block.timestamp;
    usageMetricsHourly.hourlyTransactionCount += constants_1.INT_ONE;
    if (usageType == constants_1.UsageType.DEPOSIT) {
        usageMetricsDaily.dailyDepositCount += constants_1.INT_ONE;
        usageMetricsHourly.hourlyDepositCount += constants_1.INT_ONE;
    }
    else if (usageType == constants_1.UsageType.WITHDRAW) {
        usageMetricsDaily.dailyWithdrawCount += constants_1.INT_ONE;
        usageMetricsHourly.hourlyWithdrawCount += constants_1.INT_ONE;
    }
    else if (usageType == constants_1.UsageType.SWAP) {
        usageMetricsDaily.dailySwapCount += constants_1.INT_ONE;
        usageMetricsHourly.hourlySwapCount += constants_1.INT_ONE;
    }
    // Number of days since Unix epoch
    const day = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const hour = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const dayId = day.toString();
    const hourId = hour.toString();
    // Combine the id and the user address to generate a unique user id for the day
    const dailyActiveAccountId = from.concat("-").concat(dayId);
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        usageMetricsDaily.dailyActiveUsers += constants_1.INT_ONE;
        dailyActiveAccount.save();
    }
    const hourlyActiveAccountId = from.concat("-").concat(hourId);
    let hourlyActiveAccount = schema_1.ActiveAccount.load(hourlyActiveAccountId);
    if (!hourlyActiveAccount) {
        hourlyActiveAccount = new schema_1.ActiveAccount(hourlyActiveAccountId);
        usageMetricsHourly.hourlyActiveUsers += constants_1.INT_ONE;
        hourlyActiveAccount.save();
    }
    let account = schema_1.Account.load(from);
    if (!account) {
        account = new schema_1.Account(from);
        protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
        account.save();
    }
    usageMetricsDaily.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsHourly.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsDaily.save();
    usageMetricsHourly.save();
    protocol.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
// Update UsagePoolDailySnapshot entity
// Updated on Swap, Burn, and Mint events.
function updatePoolMetrics(event) {
    // get or create pool metrics
    const poolMetricsDaily = (0, getters_1.getOrCreateLiquidityPoolDailySnapshot)(event);
    const poolMetricsHourly = (0, getters_1.getOrCreateLiquidityPoolHourlySnapshot)(event);
    const pool = (0, getters_1.getLiquidityPool)(event.address.toHexString());
    // Update the block number and timestamp to that of the last transaction of that day
    poolMetricsDaily.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetricsDaily.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
    poolMetricsDaily.inputTokenBalances = pool.inputTokenBalances;
    poolMetricsDaily.inputTokenWeights = pool.inputTokenWeights;
    poolMetricsDaily.outputTokenSupply = pool.outputTokenSupply;
    poolMetricsDaily.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetricsDaily.blockNumber = event.block.number;
    poolMetricsDaily.timestamp = event.block.timestamp;
    poolMetricsDaily.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
    poolMetricsDaily.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    poolMetricsDaily.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    poolMetricsDaily.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolMetricsDaily.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetricsDaily.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetricsHourly.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetricsHourly.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
    poolMetricsHourly.inputTokenBalances = pool.inputTokenBalances;
    poolMetricsHourly.inputTokenWeights = pool.inputTokenWeights;
    poolMetricsHourly.outputTokenSupply = pool.outputTokenSupply;
    poolMetricsHourly.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetricsHourly.blockNumber = event.block.number;
    poolMetricsHourly.timestamp = event.block.timestamp;
    poolMetricsHourly.rewardTokenEmissionsAmount =
        pool.rewardTokenEmissionsAmount;
    poolMetricsHourly.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    poolMetricsHourly.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    poolMetricsHourly.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolMetricsHourly.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetricsHourly.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetricsDaily.save();
    poolMetricsHourly.save();
}
exports.updatePoolMetrics = updatePoolMetrics;
// These whiteslists are used to track what pools the tokens are a part of. Used in price calculations.
// Updated at the time of pool created (poolCreated event)
function updateTokenWhitelists(token0, token1, poolAddress) {
    const tokenWhitelist0 = (0, getters_1.getOrCreateTokenWhitelist)(token0.id);
    const tokenWhitelist1 = (0, getters_1.getOrCreateTokenWhitelist)(token1.id);
    // update white listed pools
    if (configure_1.NetworkConfigs.getWhitelistTokens().includes(tokenWhitelist0.id)) {
        const newPools = tokenWhitelist1.whitelistPools;
        newPools.push(poolAddress);
        tokenWhitelist1.whitelistPools = newPools;
        tokenWhitelist1.save();
    }
    if (configure_1.NetworkConfigs.getWhitelistTokens().includes(tokenWhitelist1.id)) {
        const newPools = tokenWhitelist0.whitelistPools;
        newPools.push(poolAddress);
        tokenWhitelist0.whitelistPools = newPools;
        tokenWhitelist0.save();
    }
}
exports.updateTokenWhitelists = updateTokenWhitelists;
// Upate token balances based on reserves emitted from the Sync event.
function updateInputTokenBalances(event, poolAddress, reserve0, reserve1) {
    const pool = (0, getters_1.getLiquidityPool)(poolAddress);
    const poolAmounts = (0, getters_1.getLiquidityPoolAmounts)(poolAddress);
    const token0 = (0, getters_1.getOrCreateToken)(event, pool.inputTokens[constants_1.INT_ZERO]);
    const token1 = (0, getters_1.getOrCreateToken)(event, pool.inputTokens[constants_1.INT_ONE]);
    const tokenDecimal0 = (0, utils_1.convertTokenToDecimal)(reserve0, token0.decimals);
    const tokenDecimal1 = (0, utils_1.convertTokenToDecimal)(reserve1, token1.decimals);
    poolAmounts.inputTokenBalances = [tokenDecimal0, tokenDecimal1];
    pool.inputTokenBalances = [reserve0, reserve1];
    poolAmounts.save();
    pool.save();
}
exports.updateInputTokenBalances = updateInputTokenBalances;
// Update tvl an token prices in the Sync event.
function updateTvlAndTokenPrices(event, poolAddress) {
    const pool = (0, getters_1.getLiquidityPool)(poolAddress);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const token0 = (0, getters_1.getOrCreateToken)(event, pool.inputTokens[0]);
    const token1 = (0, getters_1.getOrCreateToken)(event, pool.inputTokens[1]);
    // Subtract the old pool tvl
    protocol.totalValueLockedUSD = protocol.totalValueLockedUSD.minus(pool.totalValueLockedUSD);
    const inputToken0 = (0, utils_1.convertTokenToDecimal)(pool.inputTokenBalances[0], token0.decimals);
    const inputToken1 = (0, utils_1.convertTokenToDecimal)(pool.inputTokenBalances[1], token1.decimals);
    // Get new tvl
    const newTvl = token0
        .lastPriceUSD.times(inputToken0)
        .plus(token1.lastPriceUSD.times(inputToken1));
    // Add the new pool tvl
    pool.totalValueLockedUSD = newTvl;
    protocol.totalValueLockedUSD = protocol.totalValueLockedUSD.plus(newTvl);
    const outputTokenSupply = (0, utils_1.convertTokenToDecimal)(pool.outputTokenSupply, constants_1.DEFAULT_DECIMALS);
    // Update LP token prices
    if (pool.outputTokenSupply == constants_1.BIGINT_ZERO) {
        pool.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    }
    else {
        pool.outputTokenPriceUSD = newTvl.div(outputTokenSupply);
    }
    pool.save();
    protocol.save();
    token0.save();
    token1.save();
}
exports.updateTvlAndTokenPrices = updateTvlAndTokenPrices;
// Update the volume and fees from financial metrics snapshot, pool metrics snapshot, protocol, and pool entities.
// Updated on Swap event.
function updateVolumeAndFees(event, protocol, pool, trackedAmountUSD, token0Amount, token1Amount) {
    const financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    const poolMetricsDaily = (0, getters_1.getOrCreateLiquidityPoolDailySnapshot)(event);
    const poolMetricsHourly = (0, getters_1.getOrCreateLiquidityPoolHourlySnapshot)(event);
    // Ensure fees are up to date
    pool.fees = (0, creators_1.createPoolFees)(pool.id, event.block.number);
    const supplyFee = (0, getters_1.getLiquidityPoolFee)(pool.fees[constants_1.INT_ZERO]);
    const protocolFee = (0, getters_1.getLiquidityPoolFee)(pool.fees[constants_1.INT_ONE]);
    // Update volume occurred during swaps
    poolMetricsDaily.dailyVolumeByTokenUSD = [
        poolMetricsDaily.dailyVolumeByTokenUSD[constants_1.INT_ZERO].plus(trackedAmountUSD[constants_1.INT_ZERO]),
        poolMetricsDaily.dailyVolumeByTokenUSD[constants_1.INT_ONE].plus(trackedAmountUSD[constants_1.INT_ONE]),
    ];
    poolMetricsDaily.dailyVolumeByTokenAmount = [
        poolMetricsDaily.dailyVolumeByTokenAmount[constants_1.INT_ZERO].plus(token0Amount),
        poolMetricsDaily.dailyVolumeByTokenAmount[constants_1.INT_ONE].plus(token1Amount),
    ];
    poolMetricsHourly.hourlyVolumeByTokenUSD = [
        poolMetricsHourly.hourlyVolumeByTokenUSD[constants_1.INT_ZERO].plus(trackedAmountUSD[constants_1.INT_ZERO]),
        poolMetricsHourly.hourlyVolumeByTokenUSD[constants_1.INT_ONE].plus(trackedAmountUSD[constants_1.INT_ONE]),
    ];
    poolMetricsHourly.hourlyVolumeByTokenAmount = [
        poolMetricsHourly.hourlyVolumeByTokenAmount[constants_1.INT_ZERO].plus(token0Amount),
        poolMetricsHourly.hourlyVolumeByTokenAmount[constants_1.INT_ONE].plus(token1Amount),
    ];
    poolMetricsDaily.dailyVolumeUSD = poolMetricsDaily.dailyVolumeUSD.plus(trackedAmountUSD[constants_1.INT_TWO]);
    poolMetricsHourly.hourlyVolumeUSD = poolMetricsHourly.hourlyVolumeUSD.plus(trackedAmountUSD[constants_1.INT_TWO]);
    financialMetrics.dailyVolumeUSD = financialMetrics.dailyVolumeUSD.plus(trackedAmountUSD[constants_1.INT_TWO]);
    pool.cumulativeVolumeUSD = pool.cumulativeVolumeUSD.plus(trackedAmountUSD[constants_1.INT_TWO]);
    protocol.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD.plus(trackedAmountUSD[constants_1.INT_TWO]);
    const supplyFeeAmountUSD = trackedAmountUSD[constants_1.INT_TWO].times((0, utils_1.percToDec)(supplyFee.feePercentage));
    const protocolFeeAmountUSD = trackedAmountUSD[constants_1.INT_TWO].times((0, utils_1.percToDec)(protocolFee.feePercentage));
    const tradingFeeAmountUSD = supplyFeeAmountUSD.plus(protocolFeeAmountUSD);
    // Update fees collected during swaps
    // Protocol
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(tradingFeeAmountUSD);
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(supplyFeeAmountUSD);
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(protocolFeeAmountUSD);
    // Pool
    pool.cumulativeTotalRevenueUSD =
        pool.cumulativeTotalRevenueUSD.plus(tradingFeeAmountUSD);
    pool.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD.plus(supplyFeeAmountUSD);
    pool.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD.plus(protocolFeeAmountUSD);
    // Daily Financials
    financialMetrics.dailyTotalRevenueUSD =
        financialMetrics.dailyTotalRevenueUSD.plus(tradingFeeAmountUSD);
    financialMetrics.dailySupplySideRevenueUSD =
        financialMetrics.dailySupplySideRevenueUSD.plus(supplyFeeAmountUSD);
    financialMetrics.dailyProtocolSideRevenueUSD =
        financialMetrics.dailyProtocolSideRevenueUSD.plus(protocolFeeAmountUSD);
    financialMetrics.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    financialMetrics.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialMetrics.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    // Daily Pool Metrics
    poolMetricsDaily.dailyTotalRevenueUSD =
        poolMetricsDaily.dailyTotalRevenueUSD.plus(tradingFeeAmountUSD);
    poolMetricsDaily.dailySupplySideRevenueUSD =
        poolMetricsDaily.dailySupplySideRevenueUSD.plus(supplyFeeAmountUSD);
    poolMetricsDaily.dailyProtocolSideRevenueUSD =
        poolMetricsDaily.dailyProtocolSideRevenueUSD.plus(protocolFeeAmountUSD);
    poolMetricsDaily.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolMetricsDaily.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetricsDaily.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    // Hourly Pool Metrics
    poolMetricsHourly.hourlyTotalRevenueUSD =
        poolMetricsHourly.hourlyTotalRevenueUSD.plus(tradingFeeAmountUSD);
    poolMetricsHourly.hourlySupplySideRevenueUSD =
        poolMetricsHourly.hourlySupplySideRevenueUSD.plus(supplyFeeAmountUSD);
    poolMetricsHourly.hourlyProtocolSideRevenueUSD =
        poolMetricsHourly.hourlyProtocolSideRevenueUSD.plus(protocolFeeAmountUSD);
    poolMetricsHourly.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolMetricsHourly.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetricsHourly.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    financialMetrics.save();
    poolMetricsDaily.save();
    poolMetricsHourly.save();
    protocol.save();
    pool.save();
}
exports.updateVolumeAndFees = updateVolumeAndFees;
// Update store that tracks the deposit count per pool
function updateDepositHelper(poolAddress) {
    const poolDeposits = schema_1._HelperStore.load(poolAddress.toHexString());
    poolDeposits.valueInt = poolDeposits.valueInt + constants_1.INT_ONE;
    poolDeposits.save();
}
exports.updateDepositHelper = updateDepositHelper;
