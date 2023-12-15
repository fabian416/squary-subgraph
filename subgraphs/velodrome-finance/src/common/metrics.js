"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePoolMetrics = exports.updateUsageMetrics = exports.updateRevenue = exports.updateFinancials = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const getters_1 = require("./getters");
const numbers_1 = require("./utils/numbers");
const schema_1 = require("../../generated/schema");
// Update FinancialsDailySnapshots entity
function updateFinancials(protocol, event) {
    const financialMetricsDaily = (0, getters_1.getOrCreateFinancialsDailySnapshot)(protocol, event);
    // Update the block number and timestamp to that of the last transaction of that day
    financialMetricsDaily.blockNumber = event.block.number;
    financialMetricsDaily.timestamp = event.block.timestamp;
    financialMetricsDaily.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialMetricsDaily.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD;
    financialMetricsDaily.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialMetricsDaily.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialMetricsDaily.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    financialMetricsDaily.save();
}
exports.updateFinancials = updateFinancials;
function updateRevenue(protocol, pool, amount0, amount1, event) {
    const financialsDailySnapshot = (0, getters_1.getOrCreateFinancialsDailySnapshot)(protocol, event);
    const poolDailySnapshot = (0, getters_1.getOrCreateLiquidityPoolDailySnapshot)(pool, event.block);
    const poolHourlySnapshot = (0, getters_1.getOrCreateLiquidityPoolHourlySnapshot)(pool, event.block);
    const token0 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[0]));
    const token1 = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[1]));
    const amount0USD = (0, numbers_1.applyDecimals)(amount0, token0.decimals).times(token0.lastPriceUSD);
    const amount1USD = (0, numbers_1.applyDecimals)(amount1, token1.decimals).times(token1.lastPriceUSD);
    const protocolSideRevenue = amount0USD.plus(amount1USD);
    // no need to calculate supply side, as all fees are protocol side.
    //Update pool cumulatives
    pool.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenue);
    pool.cumulativeTotalRevenueUSD =
        pool.cumulativeTotalRevenueUSD.plus(protocolSideRevenue);
    // Update protocol cumulatives
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenue);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(protocolSideRevenue);
    // Update Financial snapshot - daily
    financialsDailySnapshot.dailyProtocolSideRevenueUSD =
        financialsDailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenue);
    financialsDailySnapshot.dailyTotalRevenueUSD =
        financialsDailySnapshot.dailyTotalRevenueUSD.plus(protocolSideRevenue);
    // Sync financial snapshot cumulatives with protocol
    financialsDailySnapshot.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialsDailySnapshot.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    //Update daily/hourly snapshots
    poolDailySnapshot.dailyProtocolSideRevenueUSD =
        poolDailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenue);
    poolDailySnapshot.dailyTotalRevenueUSD =
        poolDailySnapshot.dailyTotalRevenueUSD.plus(protocolSideRevenue);
    poolHourlySnapshot.hourlyProtocolSideRevenueUSD =
        poolHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(protocolSideRevenue);
    poolHourlySnapshot.hourlyTotalRevenueUSD =
        poolHourlySnapshot.hourlyTotalRevenueUSD.plus(protocolSideRevenue);
    poolHourlySnapshot;
    // Sync pool snapshot cumulatives with pool
    poolDailySnapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolDailySnapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolHourlySnapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolHourlySnapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    // Update timestamps
    financialsDailySnapshot.blockNumber = event.block.number;
    financialsDailySnapshot.timestamp = event.block.timestamp;
    poolDailySnapshot.blockNumber = event.block.number;
    poolDailySnapshot.timestamp = event.block.timestamp;
    poolHourlySnapshot.blockNumber = event.block.number;
    poolHourlySnapshot.timestamp = event.block.timestamp;
    pool.save();
    protocol.save();
    financialsDailySnapshot.save();
    poolDailySnapshot.save();
    poolHourlySnapshot.save();
}
exports.updateRevenue = updateRevenue;
// Update usage metrics entities
function updateUsageMetrics(protocol, fromAddress, usageType, event) {
    const from = fromAddress.toHexString();
    const usageMetricsDaily = (0, getters_1.getOrCreateUsageMetricDailySnapshot)(protocol, event);
    const usageMetricsHourly = (0, getters_1.getOrCreateUsageMetricHourlySnapshot)(protocol, event);
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
    const dailyActiveAccountId = "daily".concat(from).concat("-").concat(dayId);
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        usageMetricsDaily.dailyActiveUsers += constants_1.INT_ONE;
        dailyActiveAccount.save();
    }
    const hourlyActiveAccountId = "hourly"
        .concat(from)
        .concat("-")
        .concat(hourId);
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
    usageMetricsDaily.totalPoolCount = protocol.totalPoolCount;
    usageMetricsHourly.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsDaily.save();
    usageMetricsHourly.save();
    protocol.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
// Update Pool Snapshots entities
function updatePoolMetrics(pool, block) {
    // get or create pool metrics
    const poolMetricsDaily = (0, getters_1.getOrCreateLiquidityPoolDailySnapshot)(pool, block);
    const poolMetricsHourly = (0, getters_1.getOrCreateLiquidityPoolHourlySnapshot)(pool, block);
    // Update the block number and timestamp to that of the last transaction of that day
    poolMetricsDaily.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetricsDaily.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetricsDaily.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetricsDaily.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolMetricsDaily.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
    poolMetricsDaily.inputTokenBalances = pool.inputTokenBalances;
    poolMetricsDaily.inputTokenWeights = pool.inputTokenWeights;
    poolMetricsDaily.outputTokenSupply = pool.outputTokenSupply;
    poolMetricsDaily.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetricsDaily.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    poolMetricsDaily.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
    poolMetricsDaily.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    poolMetricsDaily.blockNumber = block.number;
    poolMetricsDaily.timestamp = block.timestamp;
    poolMetricsHourly.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetricsHourly.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetricsHourly.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetricsHourly.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolMetricsHourly.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
    poolMetricsHourly.inputTokenBalances = pool.inputTokenBalances;
    poolMetricsHourly.inputTokenWeights = pool.inputTokenWeights;
    poolMetricsHourly.outputTokenSupply = pool.outputTokenSupply;
    poolMetricsHourly.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetricsHourly.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    poolMetricsHourly.rewardTokenEmissionsAmount =
        pool.rewardTokenEmissionsAmount;
    poolMetricsHourly.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    poolMetricsHourly.blockNumber = block.number;
    poolMetricsHourly.timestamp = block.timestamp;
    poolMetricsDaily.save();
    poolMetricsHourly.save();
}
exports.updatePoolMetrics = updatePoolMetrics;
