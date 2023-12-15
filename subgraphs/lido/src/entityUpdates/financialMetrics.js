"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreatePoolsHourlySnapshot = exports.getOrCreatePoolsDailySnapshot = exports.getOrCreateFinancialDailyMetrics = exports.updateSupplySideRevenueMetrics = exports.updateProtocolSideRevenueMetrics = exports.updateTotalRevenueMetrics = exports.updateSnapshotsTvl = exports.updateProtocolAndPoolTvl = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const numbers_1 = require("../utils/numbers");
const protocol_1 = require("../entities/protocol");
const pool_1 = require("../entities/pool");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const token_1 = require("../entities/token");
function updateProtocolAndPoolTvl(block, amount) {
    const pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp);
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    // Pool
    pool.inputTokenBalances = [pool.inputTokenBalances[0].plus(amount)];
    // inputToken is ETH, price with ETH
    const ethPriceUSD = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS), block.number).lastPriceUSD;
    pool.inputTokenBalancesUSD = [
        (0, numbers_1.bigIntToBigDecimal)(pool.inputTokenBalances[0]).times(ethPriceUSD),
    ];
    pool.totalValueLockedUSD = (0, numbers_1.bigIntToBigDecimal)(pool.inputTokenBalances[0]).times(ethPriceUSD);
    pool.outputTokenPriceUSD = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.PROTOCOL_ID), block.number).lastPriceUSD;
    pool.save();
    // Protocol
    protocol.totalValueLockedUSD = pool.totalValueLockedUSD;
    protocol.save();
    updateSnapshotsTvl(block);
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
    poolMetricsDailySnapshot.outputTokenSupply = pool.outputTokenSupply;
    poolMetricsDailySnapshot.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetricsDailySnapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetricsDailySnapshot.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetricsDailySnapshot.cumulativeTotalRevenueUSD =
        pool.cumulativeTotalRevenueUSD;
    poolMetricsDailySnapshot.save();
    // Pool Hourly
    poolMetricsHourlySnapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetricsHourlySnapshot.inputTokenBalances = pool.inputTokenBalances;
    poolMetricsHourlySnapshot.inputTokenBalancesUSD = pool.inputTokenBalancesUSD;
    poolMetricsHourlySnapshot.outputTokenSupply = pool.outputTokenSupply;
    poolMetricsHourlySnapshot.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetricsHourlySnapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetricsHourlySnapshot.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetricsHourlySnapshot.cumulativeTotalRevenueUSD =
        pool.cumulativeTotalRevenueUSD;
    poolMetricsHourlySnapshot.save();
    // Financials Daily
    financialMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
    financialMetrics.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    financialMetrics.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    financialMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    financialMetrics.save();
}
exports.updateSnapshotsTvl = updateSnapshotsTvl;
function updateTotalRevenueMetrics(block, revenueETH, totalSupply) {
    const pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp);
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const financialMetrics = getOrCreateFinancialDailyMetrics(block);
    const poolMetricsDailySnapshot = getOrCreatePoolsDailySnapshot(block);
    const poolMetricsHourlySnapshot = getOrCreatePoolsHourlySnapshot(block);
    // Staking Rewards
    const stakingRewards = (0, numbers_1.bigIntToBigDecimal)(revenueETH);
    const stakingRewardsUSD = stakingRewards.times((0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS), block.number)
        .lastPriceUSD);
    // Pool
    pool.cumulativeTotalRevenueUSD =
        pool.cumulativeTotalRevenueUSD.plus(stakingRewardsUSD);
    pool.outputTokenSupply = totalSupply;
    pool.outputTokenPriceUSD = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.PROTOCOL_ID), block.number).lastPriceUSD;
    pool.save();
    // Pool Daily
    poolMetricsDailySnapshot.cumulativeTotalRevenueUSD =
        pool.cumulativeTotalRevenueUSD;
    poolMetricsDailySnapshot.dailyTotalRevenueUSD =
        poolMetricsDailySnapshot.dailyTotalRevenueUSD.plus(stakingRewardsUSD);
    poolMetricsDailySnapshot.outputTokenSupply = pool.outputTokenSupply;
    poolMetricsDailySnapshot.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetricsDailySnapshot.save();
    // Pool Hourly
    poolMetricsHourlySnapshot.cumulativeTotalRevenueUSD =
        pool.cumulativeTotalRevenueUSD;
    poolMetricsHourlySnapshot.hourlyTotalRevenueUSD =
        poolMetricsHourlySnapshot.hourlyTotalRevenueUSD.plus(stakingRewardsUSD);
    poolMetricsHourlySnapshot.outputTokenSupply = pool.outputTokenSupply;
    poolMetricsHourlySnapshot.outputTokenPriceUSD = pool.outputTokenPriceUSD;
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
function updateProtocolSideRevenueMetrics(block, amount) {
    const pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp);
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const financialMetrics = getOrCreateFinancialDailyMetrics(block);
    const poolMetricsDailySnapshot = getOrCreatePoolsDailySnapshot(block);
    const poolMetricsHourlySnapshot = getOrCreatePoolsHourlySnapshot(block);
    // Staking rewards revenue is in ETH (rebased in stETH for user), price in ETH
    const amountUSD = (0, numbers_1.bigIntToBigDecimal)(amount).times((0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS), block.number)
        .lastPriceUSD);
    // Pool
    pool.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD.plus(amountUSD);
    pool.save();
    // Pool Daily
    poolMetricsDailySnapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetricsDailySnapshot.dailyProtocolSideRevenueUSD =
        poolMetricsDailySnapshot.dailyProtocolSideRevenueUSD.plus(amountUSD);
    poolMetricsDailySnapshot.save();
    // Pool Hourly
    poolMetricsHourlySnapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetricsHourlySnapshot.hourlyProtocolSideRevenueUSD =
        poolMetricsHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(amountUSD);
    poolMetricsHourlySnapshot.save();
    // Protocol
    protocol.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    protocol.save();
    // Financial Daily
    financialMetrics.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    financialMetrics.dailyProtocolSideRevenueUSD =
        financialMetrics.dailyProtocolSideRevenueUSD.plus(amountUSD);
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
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(dayId);
        financialMetrics.protocol = constants_1.PROTOCOL_ID;
        financialMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
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
        poolMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.inputTokenBalances = [constants_1.BIGINT_ZERO];
        poolMetrics.inputTokenBalancesUSD = [constants_1.BIGDECIMAL_ZERO];
        poolMetrics.outputTokenSupply = constants_1.BIGINT_ZERO;
        poolMetrics.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
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
    if (!poolMetrics) {
        poolMetrics = new schema_1.PoolHourlySnapshot(hourId);
        poolMetrics.protocol = (0, protocol_1.getOrCreateProtocol)().id;
        poolMetrics.pool = (0, pool_1.getOrCreatePool)(block.number, block.timestamp).id;
        poolMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.inputTokenBalances = [constants_1.BIGINT_ZERO];
        poolMetrics.inputTokenBalancesUSD = [constants_1.BIGDECIMAL_ZERO];
        poolMetrics.outputTokenSupply = constants_1.BIGINT_ZERO;
        poolMetrics.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    }
    // Set block number and timestamp to the latest for snapshots
    poolMetrics.blockNumber = block.number;
    poolMetrics.timestamp = block.timestamp;
    poolMetrics.save();
    return poolMetrics;
}
exports.getOrCreatePoolsHourlySnapshot = getOrCreatePoolsHourlySnapshot;
