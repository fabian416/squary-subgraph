"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVolumeAndFees = void 0;
const constants_1 = require("../../../../src/common/constants");
const getters_1 = require("../../../../src/common/getters");
const utils_1 = require("../../../../src/common/utils/utils");
const creators_1 = require("./creators");
const getters_2 = require("../../../../src/common/getters");
// Update the volume and fees from financial metrics snapshot, pool metrics snapshot, protocol, and pool entities.
// Updated on Swap event.
function updateVolumeAndFees(event, protocol, pool, trackedAmountUSD, inTokenIndex, token0Amount, token1Amount) {
    const financialMetrics = (0, getters_2.getOrCreateFinancialsDailySnapshot)(event);
    const poolMetricsDaily = (0, getters_2.getOrCreateLiquidityPoolDailySnapshot)(event);
    const poolMetricsHourly = (0, getters_2.getOrCreateLiquidityPoolHourlySnapshot)(event);
    // Ensure fees are up to date
    pool.fees = (0, creators_1.createPoolFees)(pool.id);
    // Append token index to pool fees to handle directional fees
    const supplyFee = (0, getters_1.getLiquidityPoolFee)(pool.fees[constants_1.INT_ZERO].concat(`-${inTokenIndex}`));
    const protocolFee = (0, getters_1.getLiquidityPoolFee)(pool.fees[constants_1.INT_ONE].concat(`-${inTokenIndex}`));
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
    const supplyFeeAmountUSD = trackedAmountUSD[inTokenIndex].times((0, utils_1.percToDec)(supplyFee.feePercentage));
    const protocolFeeAmountUSD = trackedAmountUSD[inTokenIndex].times((0, utils_1.percToDec)(protocolFee.feePercentage));
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
