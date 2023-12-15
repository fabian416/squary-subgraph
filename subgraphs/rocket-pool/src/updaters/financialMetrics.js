"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreatePoolsHourlySnapshot = exports.getOrCreatePoolsDailySnapshot = exports.getOrCreateFinancialDailyMetrics = exports.updateSupplySideRevenueMetrics = exports.updateProtocolSideRevenueMetrics = exports.updateTotalRevenueMetrics = exports.updateTotalRewardsMetrics = exports.updateSnapshotsTvl = exports.updateProtocolAndPoolTvl = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const numbers_1 = require("../utils/numbers");
const protocol_1 = require("../entities/protocol");
const pool_1 = require("../entities/pool");
const schema_1 = require("../../generated/schema");
const token_1 = require("../entities/token");
const constants_1 = require("../utils/constants");
const PROTOCOL_ID = constants_1.RETH_ADDRESS;
function updateProtocolAndPoolTvl(blockNumber, blockTimestamp, rplTVL, ethTVL) {
    const pool = (0, pool_1.getOrCreatePool)(blockNumber, blockTimestamp);
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const inputTokenBalances = [];
    inputTokenBalances.push(rplTVL);
    inputTokenBalances.push(ethTVL);
    pool.inputTokenBalances = inputTokenBalances;
    const ethTVLUSD = (0, numbers_1.bigIntToBigDecimal)(inputTokenBalances[1]).times((0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS), blockNumber).lastPriceUSD);
    const rplTVLUSD = (0, numbers_1.bigIntToBigDecimal)(inputTokenBalances[0]).times((0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.RPL_ADDRESS), blockNumber).lastPriceUSD);
    pool.inputTokenBalancesUSD = [rplTVLUSD, ethTVLUSD];
    const totalValueLockedUSD = ethTVLUSD.plus(rplTVLUSD);
    pool.totalValueLockedUSD = totalValueLockedUSD;
    pool.save();
    // Protocol
    protocol.totalValueLockedUSD = pool.totalValueLockedUSD;
    protocol.save();
}
exports.updateProtocolAndPoolTvl = updateProtocolAndPoolTvl;
function updateSnapshotsTvl(block) {
    const pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp);
    const poolMetricsDailySnapshot = getOrCreatePoolsDailySnapshot(block);
    const poolMetricsHourlySnapshot = getOrCreatePoolsHourlySnapshot(block);
    const financialMetrics = getOrCreateFinancialDailyMetrics(block);
    // Pool Daily
    poolMetricsDailySnapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetricsDailySnapshot.inputTokenBalances = pool.inputTokenBalances;
    poolMetricsDailySnapshot.inputTokenBalancesUSD = pool.inputTokenBalancesUSD;
    poolMetricsDailySnapshot.save();
    // Pool Hourly
    poolMetricsHourlySnapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetricsHourlySnapshot.inputTokenBalances = pool.inputTokenBalances;
    poolMetricsHourlySnapshot.inputTokenBalancesUSD = pool.inputTokenBalancesUSD;
    poolMetricsHourlySnapshot.save();
    // Financials Daily
    financialMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
    financialMetrics.save();
}
exports.updateSnapshotsTvl = updateSnapshotsTvl;
function updateTotalRewardsMetrics(block, additionalRewards) {
    const financialMetrics = getOrCreateFinancialDailyMetrics(block);
    const poolMetricsDailySnapshot = getOrCreatePoolsDailySnapshot(block);
    const poolMetricsHourlySnapshot = getOrCreatePoolsHourlySnapshot(block);
    const lastRewardPriceUsd = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.RPL_ADDRESS), block.number).lastPriceUSD;
    const newDailyEmissions = poolMetricsDailySnapshot.rewardTokenEmissionsAmount[0].plus(additionalRewards);
    const newHourlyEmissions = poolMetricsDailySnapshot.rewardTokenEmissionsAmount[0].plus(additionalRewards);
    poolMetricsDailySnapshot.rewardTokenEmissionsAmount = [newDailyEmissions];
    poolMetricsDailySnapshot.rewardTokenEmissionsUSD = [
        (0, numbers_1.bigIntToBigDecimal)(newDailyEmissions).times(lastRewardPriceUsd),
    ];
    poolMetricsDailySnapshot.save();
    poolMetricsHourlySnapshot.rewardTokenEmissionsAmount = [newHourlyEmissions];
    poolMetricsHourlySnapshot.rewardTokenEmissionsUSD = [
        (0, numbers_1.bigIntToBigDecimal)(newHourlyEmissions).times(lastRewardPriceUsd),
    ];
    poolMetricsHourlySnapshot.save();
    financialMetrics.save();
}
exports.updateTotalRewardsMetrics = updateTotalRewardsMetrics;
function updateTotalRevenueMetrics(block, additionalRevenue, totalShares // of rETH
) {
    const pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp);
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const financialMetrics = getOrCreateFinancialDailyMetrics(block);
    const poolMetricsDailySnapshot = getOrCreatePoolsDailySnapshot(block);
    const poolMetricsHourlySnapshot = getOrCreatePoolsHourlySnapshot(block);
    const additionalRewards = (0, numbers_1.bigIntToBigDecimal)(additionalRevenue);
    const lastPriceUsd = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS), block.number).lastPriceUSD;
    // Pool
    pool.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD.plus(additionalRewards.times(lastPriceUsd));
    pool.outputTokenSupply = totalShares;
    pool.stakedOutputTokenAmount = totalShares;
    pool.outputTokenPriceUSD = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(PROTOCOL_ID), block.number).lastPriceUSD;
    pool.save();
    // Pool Daily
    poolMetricsDailySnapshot.cumulativeTotalRevenueUSD =
        pool.cumulativeTotalRevenueUSD;
    poolMetricsDailySnapshot.dailyTotalRevenueUSD =
        poolMetricsDailySnapshot.dailyTotalRevenueUSD.plus(additionalRewards.times(lastPriceUsd));
    poolMetricsDailySnapshot.outputTokenSupply = pool.outputTokenSupply;
    poolMetricsDailySnapshot.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetricsDailySnapshot.stakedOutputTokenAmount = pool.outputTokenSupply;
    poolMetricsDailySnapshot.save();
    // Pool Hourly
    poolMetricsHourlySnapshot.cumulativeTotalRevenueUSD =
        pool.cumulativeTotalRevenueUSD;
    poolMetricsHourlySnapshot.hourlyTotalRevenueUSD =
        poolMetricsHourlySnapshot.hourlyTotalRevenueUSD.plus(additionalRewards.times(lastPriceUsd));
    poolMetricsHourlySnapshot.outputTokenSupply = pool.outputTokenSupply;
    poolMetricsHourlySnapshot.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetricsHourlySnapshot.stakedOutputTokenAmount = pool.outputTokenSupply;
    poolMetricsHourlySnapshot.save();
    // Protocol
    protocol.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    protocol.save();
    // Financials Daily
    financialMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    financialMetrics.dailyTotalRevenueUSD =
        poolMetricsDailySnapshot.dailyTotalRevenueUSD;
    financialMetrics.save();
}
exports.updateTotalRevenueMetrics = updateTotalRevenueMetrics;
function updateProtocolSideRevenueMetrics(block, additionalRevenue) {
    const pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp);
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const financialMetrics = getOrCreateFinancialDailyMetrics(block);
    const poolMetricsDailySnapshot = getOrCreatePoolsDailySnapshot(block);
    const poolMetricsHourlySnapshot = getOrCreatePoolsHourlySnapshot(block);
    const additionalRewards = additionalRevenue;
    const lastPriceUsd = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS), block.number).lastPriceUSD;
    // Pool
    pool.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD.plus(additionalRewards.times(lastPriceUsd));
    pool.save();
    // Pool Daily
    poolMetricsDailySnapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetricsDailySnapshot.dailyProtocolSideRevenueUSD =
        poolMetricsDailySnapshot.dailyProtocolSideRevenueUSD.plus(additionalRewards.times(lastPriceUsd));
    poolMetricsDailySnapshot.save();
    // Pool Hourly
    poolMetricsHourlySnapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetricsHourlySnapshot.hourlyProtocolSideRevenueUSD =
        poolMetricsHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(additionalRewards.times(lastPriceUsd));
    poolMetricsHourlySnapshot.save();
    // Protocol
    protocol.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    protocol.save();
    // Financial Daily
    financialMetrics.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    financialMetrics.dailyProtocolSideRevenueUSD =
        financialMetrics.dailyProtocolSideRevenueUSD.plus(additionalRewards.times(lastPriceUsd));
    financialMetrics.save();
}
exports.updateProtocolSideRevenueMetrics = updateProtocolSideRevenueMetrics;
function updateSupplySideRevenueMetrics(block) {
    const pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp);
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const financialMetrics = getOrCreateFinancialDailyMetrics(block);
    const poolMetricsDailySnapshot = getOrCreatePoolsDailySnapshot(block);
    const poolMetricsHourlySnapshot = getOrCreatePoolsHourlySnapshot(block);
    // Pool
    pool.cumulativeSupplySideRevenueUSD =
        pool.cumulativeTotalRevenueUSD <= pool.cumulativeProtocolSideRevenueUSD
            ? constants_1.BIGDECIMAL_ZERO
            : pool.cumulativeTotalRevenueUSD.minus(pool.cumulativeProtocolSideRevenueUSD);
    pool.save();
    // Pool Daily
    poolMetricsDailySnapshot.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetricsDailySnapshot.dailySupplySideRevenueUSD =
        poolMetricsDailySnapshot.dailyTotalRevenueUSD <=
            poolMetricsDailySnapshot.dailyProtocolSideRevenueUSD
            ? constants_1.BIGDECIMAL_ZERO
            : poolMetricsDailySnapshot.dailyTotalRevenueUSD.minus(poolMetricsDailySnapshot.dailyProtocolSideRevenueUSD);
    poolMetricsDailySnapshot.save();
    // Pool Hourly
    poolMetricsHourlySnapshot.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetricsHourlySnapshot.hourlySupplySideRevenueUSD =
        poolMetricsHourlySnapshot.hourlyTotalRevenueUSD <=
            poolMetricsHourlySnapshot.hourlyProtocolSideRevenueUSD
            ? constants_1.BIGDECIMAL_ZERO
            : poolMetricsHourlySnapshot.hourlyTotalRevenueUSD.minus(poolMetricsHourlySnapshot.hourlyProtocolSideRevenueUSD);
    poolMetricsHourlySnapshot.save();
    // Protocol
    protocol.cumulativeSupplySideRevenueUSD = pool.cumulativeSupplySideRevenueUSD;
    protocol.save();
    // Financial Daily
    financialMetrics.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    financialMetrics.dailySupplySideRevenueUSD =
        financialMetrics.dailyTotalRevenueUSD <=
            financialMetrics.dailyProtocolSideRevenueUSD
            ? constants_1.BIGDECIMAL_ZERO
            : financialMetrics.dailyTotalRevenueUSD.minus(financialMetrics.dailyProtocolSideRevenueUSD);
    financialMetrics.save();
}
exports.updateSupplySideRevenueMetrics = updateSupplySideRevenueMetrics;
function getOrCreateFinancialDailyMetrics(block) {
    const dayId = (block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(dayId);
    const pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp);
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(dayId);
        financialMetrics.protocol = PROTOCOL_ID;
        financialMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD =
            pool.cumulativeProtocolSideRevenueUSD;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD =
            pool.cumulativeSupplySideRevenueUSD;
    }
    // Set block number and timestamp to the latest for snapshots
    financialMetrics.blockNumber = block.number;
    financialMetrics.timestamp = block.timestamp;
    financialMetrics.save();
    return financialMetrics;
}
exports.getOrCreateFinancialDailyMetrics = getOrCreateFinancialDailyMetrics;
function getOrCreatePoolsDailySnapshot(block) {
    const dayId = (block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    let poolMetrics = schema_1.PoolDailySnapshot.load(dayId);
    if (!poolMetrics) {
        poolMetrics = new schema_1.PoolDailySnapshot(dayId);
        poolMetrics.protocol = (0, protocol_1.getOrCreateProtocol)().id;
        poolMetrics.pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp).id;
        const pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp);
        poolMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
        poolMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
        poolMetrics.cumulativeSupplySideRevenueUSD =
            pool.cumulativeSupplySideRevenueUSD;
        poolMetrics.cumulativeProtocolSideRevenueUSD =
            pool.cumulativeProtocolSideRevenueUSD;
        poolMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.inputTokenBalances = pool.inputTokenBalances;
        poolMetrics.inputTokenBalancesUSD = pool.inputTokenBalancesUSD;
        poolMetrics.outputTokenSupply = pool.outputTokenSupply;
        poolMetrics.outputTokenPriceUSD = pool.outputTokenPriceUSD;
        poolMetrics.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
        poolMetrics.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
        poolMetrics.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    }
    // Set block number and timestamp to the latest for snapshots
    poolMetrics.blockNumber = block.number;
    poolMetrics.timestamp = block.timestamp;
    poolMetrics.save();
    return poolMetrics;
}
exports.getOrCreatePoolsDailySnapshot = getOrCreatePoolsDailySnapshot;
function getOrCreatePoolsHourlySnapshot(block) {
    const hourId = (block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR).toString();
    let poolMetrics = schema_1.PoolHourlySnapshot.load(hourId);
    const pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp);
    if (!poolMetrics) {
        poolMetrics = new schema_1.PoolHourlySnapshot(hourId);
        poolMetrics.protocol = (0, protocol_1.getOrCreateProtocol)().id;
        poolMetrics.pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp).id;
        poolMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
        poolMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
        poolMetrics.cumulativeSupplySideRevenueUSD =
            pool.cumulativeSupplySideRevenueUSD;
        poolMetrics.cumulativeProtocolSideRevenueUSD =
            pool.cumulativeProtocolSideRevenueUSD;
        poolMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.inputTokenBalances = pool.inputTokenBalances;
        poolMetrics.inputTokenBalancesUSD = pool.inputTokenBalancesUSD;
        poolMetrics.outputTokenSupply = pool.outputTokenSupply;
        poolMetrics.outputTokenPriceUSD = pool.outputTokenPriceUSD;
        poolMetrics.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
        poolMetrics.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
        poolMetrics.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    }
    // Set block number and timestamp to the latest for snapshots
    poolMetrics.blockNumber = block.number;
    poolMetrics.timestamp = block.timestamp;
    poolMetrics.save();
    return poolMetrics;
}
exports.getOrCreatePoolsHourlySnapshot = getOrCreatePoolsHourlySnapshot;
