"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTempUsageMetrics = exports.getOrCreateTempUsageMetricsHourlySnapshot = exports.getOrCreateTempUsageMetricsDailySnapshot = exports.takeUsageMetricsHourlySnapshot = exports.takeUsageMetricsDailySnapshot = exports.takeFinancialDailySnapshot = exports.takeLiquidityPoolHourlySnapshot = exports.takeLiquidityPoolDailySnapshot = exports.takeSnapshots = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const event_1 = require("./event");
const protocol_1 = require("./protocol");
const pool_1 = require("./pool");
const constants_1 = require("../utils/constants");
const logger_1 = require("../utils/logger");
// snapshots are only snapped once per interval for efficiency.
function takeSnapshots(event, pool) {
    const dayID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const hourID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const logger = new logger_1.Logger(event, "takeSnapshots");
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const protocolSnapshotDayID = protocol._lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const protocolSnapshotHourID = protocol._lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    if (protocolSnapshotDayID != dayID && protocolSnapshotDayID != constants_1.INT_ZERO) {
        takeFinancialDailySnapshot(protocol, protocolSnapshotDayID, logger);
        takeUsageMetricsDailySnapshot(protocol, protocolSnapshotDayID);
        (0, protocol_1.updateProtocolSnapshotDayID)(protocolSnapshotDayID);
    }
    if (protocolSnapshotHourID != hourID && protocolSnapshotHourID != constants_1.INT_ZERO) {
        takeUsageMetricsHourlySnapshot(protocol, protocolSnapshotHourID);
    }
    const poolSnapshotDayID = pool._lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const poolSnapshotHourID = pool._lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    if (poolSnapshotDayID != dayID && poolSnapshotDayID != constants_1.INT_ZERO) {
        takeLiquidityPoolDailySnapshot(pool, poolSnapshotDayID, logger);
        (0, pool_1.updatePoolSnapshotDayID)(event, pool, poolSnapshotDayID);
    }
    if (poolSnapshotHourID != hourID && poolSnapshotHourID != constants_1.INT_ZERO) {
        takeLiquidityPoolHourlySnapshot(pool, poolSnapshotHourID, logger);
        (0, pool_1.updatePoolSnapshotHourID)(event, pool, poolSnapshotHourID);
    }
}
exports.takeSnapshots = takeSnapshots;
function takeLiquidityPoolDailySnapshot(pool, day, logger) {
    const id = pool.id.concatI32(day);
    if (schema_1.LiquidityPoolDailySnapshot.load(id)) {
        return;
    }
    const poolMetrics = new schema_1.LiquidityPoolDailySnapshot(id);
    const prevPoolMetrics = schema_1.LiquidityPoolDailySnapshot.load(pool.id.concatI32(pool._lastSnapshotDayID.toI32()));
    const inputTokenLength = pool.inputTokens.length;
    let prevCumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeStakeSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevInputTokens = [];
    let prevCumulativeInflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeClosedInflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeOutflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeVolumeByTokenAmount = new Array(inputTokenLength).fill(constants_1.BIGINT_ZERO);
    let prevCumulativeVolumeByTokenUSD = new Array(inputTokenLength).fill(constants_1.BIGDECIMAL_ZERO);
    let prevCumulativeInflowVolumeByTokenAmount = new Array(inputTokenLength).fill(constants_1.BIGINT_ZERO);
    let prevCumulativeInflowVolumeByTokenUSD = new Array(inputTokenLength).fill(constants_1.BIGDECIMAL_ZERO);
    let prevCumulativeOutflowVolumeByTokenAmount = new Array(inputTokenLength).fill(constants_1.BIGINT_ZERO);
    let prevCumulativeOutflowVolumeByTokenUSD = new Array(inputTokenLength).fill(constants_1.BIGDECIMAL_ZERO);
    let prevCumulativeClosedInflowVolumeByTokenAmount = new Array(inputTokenLength).fill(constants_1.BIGINT_ZERO);
    let prevCumulativeClosedInflowVolumeByTokenUSD = new Array(inputTokenLength).fill(constants_1.BIGDECIMAL_ZERO);
    let prevCumulativeUniqueUsers = constants_1.INT_ZERO;
    let prevCumulativeUniqueDepositors = constants_1.INT_ZERO;
    let prevCumulativeUniqueBorrowers = constants_1.INT_ZERO;
    let prevCumulativeUniqueLiquidators = constants_1.INT_ZERO;
    let prevCumulativeUniqueLiquidatees = constants_1.INT_ZERO;
    let prevLongPositionCount = constants_1.INT_ZERO;
    let prevShortPositionCount = constants_1.INT_ZERO;
    let prevOpenPositionCount = constants_1.INT_ZERO;
    let prevClosedPositionCount = constants_1.INT_ZERO;
    let prevCumulativePositionCount = constants_1.INT_ZERO;
    let prevCumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    if (prevPoolMetrics) {
        prevCumulativeVolumeUSD = prevPoolMetrics.cumulativeVolumeUSD;
        prevCumulativeSupplySideRevenueUSD =
            prevPoolMetrics.cumulativeSupplySideRevenueUSD;
        prevCumulativeProtocolSideRevenueUSD =
            prevPoolMetrics.cumulativeProtocolSideRevenueUSD;
        prevCumulativeStakeSideRevenueUSD =
            prevPoolMetrics.cumulativeStakeSideRevenueUSD;
        prevCumulativeTotalRevenueUSD = prevPoolMetrics.cumulativeTotalRevenueUSD;
        prevCumulativeEntryPremiumUSD = prevPoolMetrics.cumulativeEntryPremiumUSD;
        prevCumulativeExitPremiumUSD = prevPoolMetrics.cumulativeExitPremiumUSD;
        prevCumulativeTotalPremiumUSD = prevPoolMetrics.cumulativeTotalPremiumUSD;
        prevCumulativeDepositPremiumUSD =
            prevPoolMetrics.cumulativeDepositPremiumUSD;
        prevCumulativeWithdrawPremiumUSD =
            prevPoolMetrics.cumulativeWithdrawPremiumUSD;
        prevCumulativeTotalLiquidityPremiumUSD =
            prevPoolMetrics.cumulativeTotalLiquidityPremiumUSD;
        prevInputTokens = prevPoolMetrics._inputTokens;
        prevCumulativeInflowVolumeUSD = prevPoolMetrics.cumulativeInflowVolumeUSD;
        prevCumulativeClosedInflowVolumeUSD =
            prevPoolMetrics.cumulativeClosedInflowVolumeUSD;
        prevCumulativeOutflowVolumeUSD = prevPoolMetrics.cumulativeOutflowVolumeUSD;
        prevCumulativeVolumeByTokenAmount =
            prevPoolMetrics.cumulativeVolumeByTokenAmount;
        prevCumulativeVolumeByTokenUSD = prevPoolMetrics.cumulativeVolumeByTokenUSD;
        prevCumulativeInflowVolumeByTokenAmount =
            prevPoolMetrics.cumulativeInflowVolumeByTokenAmount;
        prevCumulativeInflowVolumeByTokenUSD =
            prevPoolMetrics.cumulativeInflowVolumeByTokenUSD;
        prevCumulativeOutflowVolumeByTokenAmount =
            prevPoolMetrics.cumulativeOutflowVolumeByTokenAmount;
        prevCumulativeOutflowVolumeByTokenUSD =
            prevPoolMetrics.cumulativeOutflowVolumeByTokenUSD;
        prevCumulativeClosedInflowVolumeByTokenAmount =
            prevPoolMetrics.cumulativeClosedInflowVolumeByTokenAmount;
        prevCumulativeClosedInflowVolumeByTokenUSD =
            prevPoolMetrics.cumulativeClosedInflowVolumeByTokenUSD;
        prevCumulativeUniqueUsers = prevPoolMetrics.cumulativeUniqueUsers;
        prevCumulativeUniqueDepositors = prevPoolMetrics.cumulativeUniqueDepositors;
        prevCumulativeUniqueBorrowers = prevPoolMetrics.cumulativeUniqueBorrowers;
        prevCumulativeUniqueLiquidators =
            prevPoolMetrics.cumulativeUniqueLiquidators;
        prevCumulativeUniqueLiquidatees =
            prevPoolMetrics.cumulativeUniqueLiquidatees;
        prevLongPositionCount = prevPoolMetrics.longPositionCount;
        prevShortPositionCount = prevPoolMetrics.shortPositionCount;
        prevOpenPositionCount = prevPoolMetrics.openPositionCount;
        prevClosedPositionCount = prevPoolMetrics.closedPositionCount;
        prevCumulativePositionCount = prevPoolMetrics.cumulativePositionCount;
    }
    else if (pool._lastSnapshotDayID > constants_1.BIGINT_ZERO) {
        logger.error("Missing daily pool snapshot at ID that has been snapped: Pool {}, ID {} ", [pool.id.toHexString(), pool._lastSnapshotDayID.toString()]);
    }
    poolMetrics.days = day;
    poolMetrics.protocol = pool.protocol;
    poolMetrics.pool = pool.id;
    poolMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetrics.dailyLongOpenInterestUSD = pool.longOpenInterestUSD;
    poolMetrics.dailyShortOpenInterestUSD = pool.shortOpenInterestUSD;
    poolMetrics.dailyTotalOpenInterestUSD = pool.totalOpenInterestUSD;
    poolMetrics._inputTokens = pool.inputTokens;
    poolMetrics.inputTokenBalances = pool.inputTokenBalances;
    poolMetrics.inputTokenWeights = pool.inputTokenWeights;
    poolMetrics.outputTokenSupply = pool.outputTokenSupply;
    poolMetrics.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetrics.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    poolMetrics.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
    poolMetrics.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    poolMetrics.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetrics.dailySupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD.minus(prevCumulativeSupplySideRevenueUSD);
    poolMetrics.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetrics.dailyProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD.minus(prevCumulativeProtocolSideRevenueUSD);
    poolMetrics.cumulativeStakeSideRevenueUSD =
        pool.cumulativeStakeSideRevenueUSD;
    poolMetrics.dailyStakeSideRevenueUSD =
        pool.cumulativeStakeSideRevenueUSD.minus(prevCumulativeStakeSideRevenueUSD);
    poolMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolMetrics.dailyTotalRevenueUSD = pool.cumulativeTotalRevenueUSD.minus(prevCumulativeTotalRevenueUSD);
    poolMetrics.dailyFundingrate = pool.fundingrate;
    poolMetrics.dailyEntryPremiumUSD = pool.cumulativeEntryPremiumUSD.minus(prevCumulativeEntryPremiumUSD);
    poolMetrics.cumulativeEntryPremiumUSD = pool.cumulativeEntryPremiumUSD;
    poolMetrics.dailyExitPremiumUSD = pool.cumulativeExitPremiumUSD.minus(prevCumulativeExitPremiumUSD);
    poolMetrics.cumulativeExitPremiumUSD = pool.cumulativeExitPremiumUSD;
    poolMetrics.dailyTotalPremiumUSD = pool.cumulativeTotalPremiumUSD.minus(prevCumulativeTotalPremiumUSD);
    poolMetrics.cumulativeTotalPremiumUSD = pool.cumulativeTotalPremiumUSD;
    poolMetrics.dailyDepositPremiumUSD = pool.cumulativeDepositPremiumUSD.minus(prevCumulativeDepositPremiumUSD);
    poolMetrics.cumulativeDepositPremiumUSD = pool.cumulativeDepositPremiumUSD;
    poolMetrics.dailyWithdrawPremiumUSD = pool.cumulativeWithdrawPremiumUSD.minus(prevCumulativeWithdrawPremiumUSD);
    poolMetrics.cumulativeWithdrawPremiumUSD = pool.cumulativeWithdrawPremiumUSD;
    poolMetrics.dailyTotalLiquidityPremiumUSD =
        pool.cumulativeTotalLiquidityPremiumUSD.minus(prevCumulativeTotalLiquidityPremiumUSD);
    poolMetrics.cumulativeTotalLiquidityPremiumUSD =
        pool.cumulativeTotalLiquidityPremiumUSD;
    poolMetrics.dailyVolumeUSD = pool.cumulativeVolumeUSD.minus(prevCumulativeVolumeUSD);
    poolMetrics.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
    poolMetrics.dailyInflowVolumeUSD = pool.cumulativeInflowVolumeUSD.minus(prevCumulativeInflowVolumeUSD);
    poolMetrics.cumulativeInflowVolumeUSD = pool.cumulativeInflowVolumeUSD;
    poolMetrics.dailyClosedInflowVolumeUSD =
        pool.cumulativeClosedInflowVolumeUSD.minus(prevCumulativeClosedInflowVolumeUSD);
    poolMetrics.cumulativeClosedInflowVolumeUSD =
        pool.cumulativeClosedInflowVolumeUSD;
    poolMetrics.dailyOutflowVolumeUSD = pool.cumulativeOutflowVolumeUSD.minus(prevCumulativeOutflowVolumeUSD);
    poolMetrics.cumulativeOutflowVolumeUSD = pool.cumulativeOutflowVolumeUSD;
    poolMetrics.cumulativeVolumeByTokenAmount =
        pool.cumulativeVolumeByTokenAmount;
    poolMetrics.cumulativeVolumeByTokenUSD = pool.cumulativeVolumeByTokenUSD;
    poolMetrics.cumulativeInflowVolumeByTokenAmount =
        pool.cumulativeInflowVolumeByTokenAmount;
    poolMetrics.cumulativeInflowVolumeByTokenUSD =
        pool.cumulativeInflowVolumeByTokenUSD;
    poolMetrics.cumulativeOutflowVolumeByTokenAmount =
        pool.cumulativeOutflowVolumeByTokenAmount;
    poolMetrics.cumulativeOutflowVolumeByTokenUSD =
        pool.cumulativeOutflowVolumeByTokenUSD;
    poolMetrics.cumulativeClosedInflowVolumeByTokenAmount =
        pool.cumulativeClosedInflowVolumeByTokenAmount;
    poolMetrics.cumulativeClosedInflowVolumeByTokenUSD =
        pool.cumulativeClosedInflowVolumeByTokenUSD;
    const dailyVolumeByTokenAmount = pool.cumulativeVolumeByTokenAmount;
    const dailyVolumeByTokenUSD = pool.cumulativeVolumeByTokenUSD;
    const dailyInflowVolumeByTokenAmount = pool.cumulativeInflowVolumeByTokenAmount;
    const dailyInflowVolumeByTokenUSD = pool.cumulativeInflowVolumeByTokenUSD;
    const dailyClosedInflowVolumeByTokenAmount = pool.cumulativeClosedInflowVolumeByTokenAmount;
    const dailyClosedInflowVolumeByTokenUSD = pool.cumulativeClosedInflowVolumeByTokenUSD;
    const dailyOutflowVolumeByTokenAmount = pool.cumulativeOutflowVolumeByTokenAmount;
    const dailyOutflowVolumeByTokenUSD = pool.cumulativeOutflowVolumeByTokenUSD;
    for (let i = 0; i < inputTokenLength; i++) {
        for (let j = 0; j < prevInputTokens.length; j++) {
            if (pool.inputTokens[i] == prevInputTokens[j]) {
                dailyVolumeByTokenAmount[i] = dailyVolumeByTokenAmount[i].minus(prevCumulativeVolumeByTokenAmount[j]);
                dailyVolumeByTokenUSD[i] = dailyVolumeByTokenUSD[i].minus(prevCumulativeVolumeByTokenUSD[j]);
                dailyInflowVolumeByTokenAmount[i] = dailyInflowVolumeByTokenAmount[i].minus(prevCumulativeInflowVolumeByTokenAmount[j]);
                dailyInflowVolumeByTokenUSD[i] = dailyInflowVolumeByTokenUSD[i].minus(prevCumulativeInflowVolumeByTokenUSD[j]);
                dailyClosedInflowVolumeByTokenAmount[i] =
                    dailyClosedInflowVolumeByTokenAmount[i].minus(prevCumulativeClosedInflowVolumeByTokenAmount[j]);
                dailyClosedInflowVolumeByTokenUSD[i] =
                    dailyClosedInflowVolumeByTokenUSD[i].minus(prevCumulativeClosedInflowVolumeByTokenUSD[j]);
                dailyOutflowVolumeByTokenAmount[i] = dailyOutflowVolumeByTokenAmount[i].minus(prevCumulativeOutflowVolumeByTokenAmount[j]);
                dailyOutflowVolumeByTokenUSD[i] = dailyOutflowVolumeByTokenUSD[i].minus(prevCumulativeOutflowVolumeByTokenUSD[j]);
            }
        }
    }
    poolMetrics.dailyVolumeByTokenAmount = dailyVolumeByTokenAmount;
    poolMetrics.dailyVolumeByTokenUSD = dailyVolumeByTokenUSD;
    poolMetrics.dailyInflowVolumeByTokenAmount = dailyInflowVolumeByTokenAmount;
    poolMetrics.dailyInflowVolumeByTokenUSD = dailyInflowVolumeByTokenUSD;
    poolMetrics.dailyClosedInflowVolumeByTokenAmount =
        dailyClosedInflowVolumeByTokenAmount;
    poolMetrics.dailyClosedInflowVolumeByTokenUSD =
        dailyClosedInflowVolumeByTokenUSD;
    poolMetrics.dailyOutflowVolumeByTokenAmount = dailyOutflowVolumeByTokenAmount;
    poolMetrics.dailyOutflowVolumeByTokenUSD = dailyOutflowVolumeByTokenUSD;
    poolMetrics.dailyActiveUsers =
        pool.cumulativeUniqueUsers - prevCumulativeUniqueUsers;
    poolMetrics.cumulativeUniqueUsers = pool.cumulativeUniqueUsers;
    poolMetrics.dailyActiveDepositors =
        pool.cumulativeUniqueDepositors - prevCumulativeUniqueDepositors;
    poolMetrics.cumulativeUniqueDepositors = pool.cumulativeUniqueDepositors;
    poolMetrics.dailyActiveBorrowers =
        pool.cumulativeUniqueBorrowers - prevCumulativeUniqueBorrowers;
    poolMetrics.cumulativeUniqueBorrowers = pool.cumulativeUniqueBorrowers;
    poolMetrics.dailyActiveLiquidators =
        pool.cumulativeUniqueLiquidators - prevCumulativeUniqueLiquidators;
    poolMetrics.cumulativeUniqueLiquidators = pool.cumulativeUniqueLiquidators;
    poolMetrics.dailyActiveLiquidatees =
        pool.cumulativeUniqueLiquidatees - prevCumulativeUniqueLiquidatees;
    poolMetrics.cumulativeUniqueLiquidatees = pool.cumulativeUniqueLiquidatees;
    poolMetrics.dailyLongPositionCount =
        pool.longPositionCount - prevLongPositionCount >= 0
            ? pool.longPositionCount - prevLongPositionCount
            : constants_1.INT_ZERO;
    poolMetrics.longPositionCount = pool.longPositionCount;
    poolMetrics.dailyShortPositionCount =
        pool.shortPositionCount - prevShortPositionCount >= 0
            ? pool.shortPositionCount - prevShortPositionCount
            : constants_1.INT_ZERO;
    poolMetrics.shortPositionCount = pool.shortPositionCount;
    poolMetrics.dailyOpenPositionCount =
        pool.openPositionCount - prevOpenPositionCount >= 0
            ? pool.openPositionCount - prevOpenPositionCount
            : constants_1.INT_ZERO;
    poolMetrics.openPositionCount = pool.openPositionCount;
    poolMetrics.dailyClosedPositionCount =
        pool.closedPositionCount - prevClosedPositionCount;
    poolMetrics.closedPositionCount = pool.closedPositionCount;
    poolMetrics.dailyCumulativePositionCount =
        pool.cumulativePositionCount - prevCumulativePositionCount;
    poolMetrics.cumulativePositionCount = pool.cumulativePositionCount;
    poolMetrics.save();
}
exports.takeLiquidityPoolDailySnapshot = takeLiquidityPoolDailySnapshot;
function takeLiquidityPoolHourlySnapshot(pool, hour, logger) {
    const id = pool.id.concatI32(hour);
    if (schema_1.LiquidityPoolHourlySnapshot.load(id)) {
        return;
    }
    const poolMetrics = new schema_1.LiquidityPoolHourlySnapshot(id);
    const prevPoolMetrics = schema_1.LiquidityPoolHourlySnapshot.load(pool.id.concatI32(pool._lastSnapshotHourID.toI32()));
    const inputTokenLength = pool.inputTokens.length;
    let prevCumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeStakeSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevInputTokens = [];
    let prevCumulativeInflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeClosedInflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeOutflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeVolumeByTokenAmount = new Array(inputTokenLength).fill(constants_1.BIGINT_ZERO);
    let prevCumulativeVolumeByTokenUSD = new Array(inputTokenLength).fill(constants_1.BIGDECIMAL_ZERO);
    let prevCumulativeInflowVolumeByTokenAmount = new Array(inputTokenLength).fill(constants_1.BIGINT_ZERO);
    let prevCumulativeInflowVolumeByTokenUSD = new Array(inputTokenLength).fill(constants_1.BIGDECIMAL_ZERO);
    let prevCumulativeOutflowVolumeByTokenAmount = new Array(inputTokenLength).fill(constants_1.BIGINT_ZERO);
    let prevCumulativeOutflowVolumeByTokenUSD = new Array(inputTokenLength).fill(constants_1.BIGDECIMAL_ZERO);
    let prevCumulativeClosedInflowVolumeByTokenAmount = new Array(inputTokenLength).fill(constants_1.BIGINT_ZERO);
    let prevCumulativeClosedInflowVolumeByTokenUSD = new Array(inputTokenLength).fill(constants_1.BIGDECIMAL_ZERO);
    let prevCumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    if (prevPoolMetrics) {
        prevCumulativeVolumeUSD = prevPoolMetrics.cumulativeVolumeUSD;
        prevCumulativeSupplySideRevenueUSD =
            prevPoolMetrics.cumulativeSupplySideRevenueUSD;
        prevCumulativeProtocolSideRevenueUSD =
            prevPoolMetrics.cumulativeProtocolSideRevenueUSD;
        prevCumulativeStakeSideRevenueUSD =
            prevPoolMetrics.cumulativeStakeSideRevenueUSD;
        prevCumulativeTotalRevenueUSD = prevPoolMetrics.cumulativeTotalRevenueUSD;
        prevCumulativeEntryPremiumUSD = prevPoolMetrics.cumulativeEntryPremiumUSD;
        prevCumulativeExitPremiumUSD = prevPoolMetrics.cumulativeExitPremiumUSD;
        prevCumulativeTotalPremiumUSD = prevPoolMetrics.cumulativeTotalPremiumUSD;
        prevCumulativeDepositPremiumUSD =
            prevPoolMetrics.cumulativeDepositPremiumUSD;
        prevCumulativeWithdrawPremiumUSD =
            prevPoolMetrics.cumulativeWithdrawPremiumUSD;
        prevCumulativeTotalLiquidityPremiumUSD =
            prevPoolMetrics.cumulativeTotalLiquidityPremiumUSD;
        prevInputTokens = prevPoolMetrics._inputTokens;
        prevCumulativeInflowVolumeUSD = prevPoolMetrics.cumulativeInflowVolumeUSD;
        prevCumulativeClosedInflowVolumeUSD =
            prevPoolMetrics.cumulativeClosedInflowVolumeUSD;
        prevCumulativeOutflowVolumeUSD = prevPoolMetrics.cumulativeOutflowVolumeUSD;
        prevCumulativeVolumeByTokenAmount =
            prevPoolMetrics.cumulativeVolumeByTokenAmount;
        prevCumulativeVolumeByTokenUSD = prevPoolMetrics.cumulativeVolumeByTokenUSD;
        prevCumulativeInflowVolumeByTokenAmount =
            prevPoolMetrics.cumulativeInflowVolumeByTokenAmount;
        prevCumulativeInflowVolumeByTokenUSD =
            prevPoolMetrics.cumulativeInflowVolumeByTokenUSD;
        prevCumulativeOutflowVolumeByTokenAmount =
            prevPoolMetrics.cumulativeOutflowVolumeByTokenAmount;
        prevCumulativeOutflowVolumeByTokenUSD =
            prevPoolMetrics.cumulativeOutflowVolumeByTokenUSD;
        prevCumulativeClosedInflowVolumeByTokenAmount =
            prevPoolMetrics.cumulativeClosedInflowVolumeByTokenAmount;
        prevCumulativeClosedInflowVolumeByTokenUSD =
            prevPoolMetrics.cumulativeClosedInflowVolumeByTokenUSD;
    }
    else if (pool._lastSnapshotHourID > constants_1.BIGINT_ZERO) {
        logger.error("Missing hourly pool snapshot at ID that has been snapped: Pool {}, ID {} ", [pool.id.toHexString(), pool._lastSnapshotHourID.toString()]);
    }
    poolMetrics.hours = hour;
    poolMetrics.protocol = pool.protocol;
    poolMetrics.pool = pool.id;
    poolMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetrics.hourlyLongOpenInterestUSD = pool.longOpenInterestUSD;
    poolMetrics.hourlyShortOpenInterestUSD = pool.shortOpenInterestUSD;
    poolMetrics.hourlyTotalOpenInterestUSD = pool.totalOpenInterestUSD;
    poolMetrics._inputTokens = pool.inputTokens;
    poolMetrics.inputTokenBalances = pool.inputTokenBalances;
    poolMetrics.inputTokenWeights = pool.inputTokenWeights;
    poolMetrics.outputTokenSupply = pool.outputTokenSupply;
    poolMetrics.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetrics.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    poolMetrics.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
    poolMetrics.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    poolMetrics.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolMetrics.hourlySupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD.minus(prevCumulativeSupplySideRevenueUSD);
    poolMetrics.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolMetrics.hourlyProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD.minus(prevCumulativeProtocolSideRevenueUSD);
    poolMetrics.cumulativeStakeSideRevenueUSD =
        pool.cumulativeStakeSideRevenueUSD;
    poolMetrics.hourlyStakeSideRevenueUSD =
        pool.cumulativeStakeSideRevenueUSD.minus(prevCumulativeStakeSideRevenueUSD);
    poolMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolMetrics.hourlyTotalRevenueUSD = pool.cumulativeTotalRevenueUSD.minus(prevCumulativeTotalRevenueUSD);
    poolMetrics.hourlyFundingrate = pool.fundingrate;
    poolMetrics.hourlyEntryPremiumUSD = pool.cumulativeEntryPremiumUSD.minus(prevCumulativeEntryPremiumUSD);
    poolMetrics.cumulativeEntryPremiumUSD = pool.cumulativeEntryPremiumUSD;
    poolMetrics.hourlyExitPremiumUSD = pool.cumulativeExitPremiumUSD.minus(prevCumulativeExitPremiumUSD);
    poolMetrics.cumulativeExitPremiumUSD = pool.cumulativeExitPremiumUSD;
    poolMetrics.hourlyTotalPremiumUSD = pool.cumulativeTotalPremiumUSD.minus(prevCumulativeTotalPremiumUSD);
    poolMetrics.cumulativeTotalPremiumUSD = pool.cumulativeTotalPremiumUSD;
    poolMetrics.hourlyDepositPremiumUSD = pool.cumulativeDepositPremiumUSD.minus(prevCumulativeDepositPremiumUSD);
    poolMetrics.cumulativeDepositPremiumUSD = pool.cumulativeDepositPremiumUSD;
    poolMetrics.hourlyWithdrawPremiumUSD =
        pool.cumulativeWithdrawPremiumUSD.minus(prevCumulativeWithdrawPremiumUSD);
    poolMetrics.cumulativeWithdrawPremiumUSD = pool.cumulativeWithdrawPremiumUSD;
    poolMetrics.hourlyTotalLiquidityPremiumUSD =
        pool.cumulativeTotalLiquidityPremiumUSD.minus(prevCumulativeTotalLiquidityPremiumUSD);
    poolMetrics.cumulativeTotalLiquidityPremiumUSD =
        pool.cumulativeTotalLiquidityPremiumUSD;
    poolMetrics.hourlyVolumeUSD = pool.cumulativeVolumeUSD.minus(prevCumulativeVolumeUSD);
    poolMetrics.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
    poolMetrics.hourlyInflowVolumeUSD = pool.cumulativeInflowVolumeUSD.minus(prevCumulativeInflowVolumeUSD);
    poolMetrics.cumulativeInflowVolumeUSD = pool.cumulativeInflowVolumeUSD;
    poolMetrics.hourlyClosedInflowVolumeUSD =
        pool.cumulativeClosedInflowVolumeUSD.minus(prevCumulativeClosedInflowVolumeUSD);
    poolMetrics.cumulativeClosedInflowVolumeUSD =
        pool.cumulativeClosedInflowVolumeUSD;
    poolMetrics.hourlyOutflowVolumeUSD = pool.cumulativeOutflowVolumeUSD.minus(prevCumulativeOutflowVolumeUSD);
    poolMetrics.cumulativeOutflowVolumeUSD = pool.cumulativeOutflowVolumeUSD;
    poolMetrics.cumulativeVolumeByTokenAmount =
        pool.cumulativeVolumeByTokenAmount;
    poolMetrics.cumulativeVolumeByTokenUSD = pool.cumulativeVolumeByTokenUSD;
    poolMetrics.cumulativeInflowVolumeByTokenAmount =
        pool.cumulativeInflowVolumeByTokenAmount;
    poolMetrics.cumulativeInflowVolumeByTokenUSD =
        pool.cumulativeInflowVolumeByTokenUSD;
    poolMetrics.cumulativeOutflowVolumeByTokenAmount =
        pool.cumulativeOutflowVolumeByTokenAmount;
    poolMetrics.cumulativeOutflowVolumeByTokenUSD =
        pool.cumulativeOutflowVolumeByTokenUSD;
    poolMetrics.cumulativeClosedInflowVolumeByTokenAmount =
        pool.cumulativeClosedInflowVolumeByTokenAmount;
    poolMetrics.cumulativeClosedInflowVolumeByTokenUSD =
        pool.cumulativeClosedInflowVolumeByTokenUSD;
    const hourlyVolumeByTokenAmount = pool.cumulativeVolumeByTokenAmount;
    const hourlyVolumeByTokenUSD = pool.cumulativeVolumeByTokenUSD;
    const hourlyInflowVolumeByTokenAmount = pool.cumulativeInflowVolumeByTokenAmount;
    const hourlyInflowVolumeByTokenUSD = pool.cumulativeInflowVolumeByTokenUSD;
    const hourlyClosedInflowVolumeByTokenAmount = pool.cumulativeClosedInflowVolumeByTokenAmount;
    const hourlyClosedInflowVolumeByTokenUSD = pool.cumulativeClosedInflowVolumeByTokenUSD;
    const hourlyOutflowVolumeByTokenAmount = pool.cumulativeOutflowVolumeByTokenAmount;
    const hourlyOutflowVolumeByTokenUSD = pool.cumulativeOutflowVolumeByTokenUSD;
    for (let i = 0; i < inputTokenLength; i++) {
        for (let j = 0; j < prevInputTokens.length; j++) {
            if (pool.inputTokens[i] == prevInputTokens[j]) {
                hourlyVolumeByTokenAmount[i] = hourlyVolumeByTokenAmount[i].minus(prevCumulativeVolumeByTokenAmount[j]);
                hourlyVolumeByTokenUSD[i] = hourlyVolumeByTokenUSD[i].minus(prevCumulativeVolumeByTokenUSD[j]);
                hourlyInflowVolumeByTokenAmount[i] = hourlyInflowVolumeByTokenAmount[i].minus(prevCumulativeInflowVolumeByTokenAmount[j]);
                hourlyInflowVolumeByTokenUSD[i] = hourlyInflowVolumeByTokenUSD[i].minus(prevCumulativeInflowVolumeByTokenUSD[j]);
                hourlyClosedInflowVolumeByTokenAmount[i] =
                    hourlyClosedInflowVolumeByTokenAmount[i].minus(prevCumulativeClosedInflowVolumeByTokenAmount[j]);
                hourlyClosedInflowVolumeByTokenUSD[i] =
                    hourlyClosedInflowVolumeByTokenUSD[i].minus(prevCumulativeClosedInflowVolumeByTokenUSD[j]);
                hourlyOutflowVolumeByTokenAmount[i] = hourlyOutflowVolumeByTokenAmount[i].minus(prevCumulativeOutflowVolumeByTokenAmount[j]);
                hourlyOutflowVolumeByTokenUSD[i] = hourlyOutflowVolumeByTokenUSD[i].minus(prevCumulativeOutflowVolumeByTokenUSD[j]);
            }
        }
    }
    poolMetrics.hourlyVolumeByTokenAmount = hourlyVolumeByTokenAmount;
    poolMetrics.hourlyVolumeByTokenUSD = hourlyVolumeByTokenUSD;
    poolMetrics.hourlyInflowVolumeByTokenAmount = hourlyInflowVolumeByTokenAmount;
    poolMetrics.hourlyInflowVolumeByTokenUSD = hourlyInflowVolumeByTokenUSD;
    poolMetrics.hourlyClosedInflowVolumeByTokenAmount =
        hourlyClosedInflowVolumeByTokenAmount;
    poolMetrics.hourlyClosedInflowVolumeByTokenUSD =
        hourlyClosedInflowVolumeByTokenUSD;
    poolMetrics.hourlyOutflowVolumeByTokenAmount =
        hourlyOutflowVolumeByTokenAmount;
    poolMetrics.hourlyOutflowVolumeByTokenUSD = hourlyOutflowVolumeByTokenUSD;
    poolMetrics.save();
}
exports.takeLiquidityPoolHourlySnapshot = takeLiquidityPoolHourlySnapshot;
function takeFinancialDailySnapshot(protocol, day, logger) {
    const id = graph_ts_1.Bytes.fromI32(day);
    if (schema_1.FinancialsDailySnapshot.load(id)) {
        return;
    }
    const financialMetrics = new schema_1.FinancialsDailySnapshot(id);
    const prevFinancialMetrics = schema_1.FinancialsDailySnapshot.load(graph_ts_1.Bytes.fromI32(protocol._lastSnapshotDayID.toI32()));
    let prevCumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeInflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeClosedInflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeOutflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeStakeSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    let prevCumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    if (prevFinancialMetrics) {
        prevCumulativeVolumeUSD = prevFinancialMetrics.cumulativeVolumeUSD;
        prevCumulativeInflowVolumeUSD =
            prevFinancialMetrics.cumulativeInflowVolumeUSD;
        prevCumulativeClosedInflowVolumeUSD =
            prevFinancialMetrics.cumulativeClosedInflowVolumeUSD;
        prevCumulativeOutflowVolumeUSD =
            prevFinancialMetrics.cumulativeOutflowVolumeUSD;
        prevCumulativeSupplySideRevenueUSD =
            prevFinancialMetrics.cumulativeSupplySideRevenueUSD;
        prevCumulativeProtocolSideRevenueUSD =
            prevFinancialMetrics.cumulativeProtocolSideRevenueUSD;
        prevCumulativeStakeSideRevenueUSD =
            prevFinancialMetrics.cumulativeStakeSideRevenueUSD;
        prevCumulativeTotalRevenueUSD =
            prevFinancialMetrics.cumulativeTotalRevenueUSD;
        prevCumulativeEntryPremiumUSD =
            prevFinancialMetrics.cumulativeEntryPremiumUSD;
        prevCumulativeExitPremiumUSD =
            prevFinancialMetrics.cumulativeExitPremiumUSD;
        prevCumulativeTotalPremiumUSD =
            prevFinancialMetrics.cumulativeTotalPremiumUSD;
        prevCumulativeDepositPremiumUSD =
            prevFinancialMetrics.cumulativeDepositPremiumUSD;
        prevCumulativeWithdrawPremiumUSD =
            prevFinancialMetrics.cumulativeWithdrawPremiumUSD;
        prevCumulativeTotalLiquidityPremiumUSD =
            prevFinancialMetrics.cumulativeTotalLiquidityPremiumUSD;
    }
    else if (protocol._lastSnapshotDayID > constants_1.BIGINT_ZERO) {
        logger.error("Missing protocol snapshot at ID that has been snapped: Protocol {}, ID {} ", [protocol.id.toHexString(), protocol._lastSnapshotDayID.toString()]);
    }
    financialMetrics.days = day;
    financialMetrics.protocol = protocol.id;
    financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialMetrics.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD;
    financialMetrics.dailyVolumeUSD = protocol.cumulativeVolumeUSD.minus(prevCumulativeVolumeUSD);
    financialMetrics.cumulativeInflowVolumeUSD =
        protocol.cumulativeInflowVolumeUSD;
    financialMetrics.dailyInflowVolumeUSD =
        protocol.cumulativeInflowVolumeUSD.minus(prevCumulativeInflowVolumeUSD);
    financialMetrics.cumulativeClosedInflowVolumeUSD =
        protocol.cumulativeClosedInflowVolumeUSD;
    financialMetrics.dailyClosedInflowVolumeUSD =
        protocol.cumulativeClosedInflowVolumeUSD.minus(prevCumulativeClosedInflowVolumeUSD);
    financialMetrics.cumulativeOutflowVolumeUSD =
        protocol.cumulativeOutflowVolumeUSD;
    financialMetrics.dailyOutflowVolumeUSD =
        protocol.cumulativeOutflowVolumeUSD.minus(prevCumulativeOutflowVolumeUSD);
    financialMetrics.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialMetrics.dailySupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.minus(prevCumulativeSupplySideRevenueUSD);
    financialMetrics.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialMetrics.dailyProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.minus(prevCumulativeProtocolSideRevenueUSD);
    financialMetrics.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    financialMetrics.dailyTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.minus(prevCumulativeTotalRevenueUSD);
    financialMetrics.cumulativeStakeSideRevenueUSD =
        protocol.cumulativeStakeSideRevenueUSD;
    financialMetrics.dailyStakeSideRevenueUSD =
        protocol.cumulativeStakeSideRevenueUSD.minus(prevCumulativeStakeSideRevenueUSD);
    financialMetrics.dailyEntryPremiumUSD =
        protocol.cumulativeEntryPremiumUSD.minus(prevCumulativeEntryPremiumUSD);
    financialMetrics.cumulativeEntryPremiumUSD =
        protocol.cumulativeEntryPremiumUSD;
    financialMetrics.dailyExitPremiumUSD =
        protocol.cumulativeExitPremiumUSD.minus(prevCumulativeExitPremiumUSD);
    financialMetrics.cumulativeExitPremiumUSD = protocol.cumulativeExitPremiumUSD;
    financialMetrics.dailyTotalPremiumUSD =
        protocol.cumulativeTotalPremiumUSD.minus(prevCumulativeTotalPremiumUSD);
    financialMetrics.cumulativeTotalPremiumUSD =
        protocol.cumulativeTotalPremiumUSD;
    financialMetrics.dailyDepositPremiumUSD =
        protocol.cumulativeDepositPremiumUSD.minus(prevCumulativeDepositPremiumUSD);
    financialMetrics.cumulativeDepositPremiumUSD =
        protocol.cumulativeDepositPremiumUSD;
    financialMetrics.dailyWithdrawPremiumUSD =
        protocol.cumulativeWithdrawPremiumUSD.minus(prevCumulativeWithdrawPremiumUSD);
    financialMetrics.cumulativeWithdrawPremiumUSD =
        protocol.cumulativeWithdrawPremiumUSD;
    financialMetrics.dailyTotalLiquidityPremiumUSD =
        protocol.cumulativeTotalLiquidityPremiumUSD.minus(prevCumulativeTotalLiquidityPremiumUSD);
    financialMetrics.cumulativeTotalLiquidityPremiumUSD =
        protocol.cumulativeTotalLiquidityPremiumUSD;
    financialMetrics.dailyLongOpenInterestUSD = protocol.longOpenInterestUSD;
    financialMetrics.dailyShortOpenInterestUSD = protocol.shortOpenInterestUSD;
    financialMetrics.dailyTotalOpenInterestUSD = protocol.totalOpenInterestUSD;
    financialMetrics.save();
}
exports.takeFinancialDailySnapshot = takeFinancialDailySnapshot;
function takeUsageMetricsDailySnapshot(protocol, day) {
    // Create unique id for the day
    const id = graph_ts_1.Bytes.fromI32(day);
    if (schema_1.UsageMetricsDailySnapshot.load(id)) {
        return;
    }
    const usageMetrics = new schema_1.UsageMetricsDailySnapshot(graph_ts_1.Bytes.fromI32(day));
    usageMetrics.days = day;
    usageMetrics.protocol = protocol.id;
    const tempUsageMetrics = schema_1._TempUsageMetricsDailySnapshot.load(id);
    if (tempUsageMetrics) {
        usageMetrics.dailyLongPositionCount =
            tempUsageMetrics.dailyLongPositionCount;
        usageMetrics.dailyShortPositionCount =
            tempUsageMetrics.dailyShortPositionCount;
        usageMetrics.dailyOpenPositionCount =
            tempUsageMetrics.dailyOpenPositionCount;
        usageMetrics.dailyClosedPositionCount =
            tempUsageMetrics.dailyClosedPositionCount;
        usageMetrics.dailyCumulativePositionCount =
            tempUsageMetrics.dailyCumulativePositionCount;
        usageMetrics.dailyTransactionCount = tempUsageMetrics.dailyTransactionCount;
        usageMetrics.dailyDepositCount = tempUsageMetrics.dailyDepositCount;
        usageMetrics.dailyWithdrawCount = tempUsageMetrics.dailyWithdrawCount;
        usageMetrics.dailyBorrowCount = tempUsageMetrics.dailyBorrowCount;
        usageMetrics.dailySwapCount = tempUsageMetrics.dailySwapCount;
        usageMetrics.dailyActiveDepositors = tempUsageMetrics.dailyActiveDepositors;
        usageMetrics.dailyActiveBorrowers = tempUsageMetrics.dailyActiveBorrowers;
        usageMetrics.dailyActiveLiquidators =
            tempUsageMetrics.dailyActiveLiquidators;
        usageMetrics.dailyActiveLiquidatees =
            tempUsageMetrics.dailyActiveLiquidatees;
        usageMetrics.dailyActiveUsers = tempUsageMetrics.dailyActiveUsers;
        usageMetrics.dailyCollateralIn = tempUsageMetrics.dailyCollateralIn;
        usageMetrics.dailyCollateralOut = tempUsageMetrics.dailyCollateralOut;
    }
    else {
        usageMetrics.dailyLongPositionCount = constants_1.INT_ZERO;
        usageMetrics.dailyShortPositionCount = constants_1.INT_ZERO;
        usageMetrics.dailyOpenPositionCount = constants_1.INT_ZERO;
        usageMetrics.dailyClosedPositionCount = constants_1.INT_ZERO;
        usageMetrics.dailyCumulativePositionCount = constants_1.INT_ZERO;
        usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.dailyDepositCount = constants_1.INT_ZERO;
        usageMetrics.dailyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.dailyBorrowCount = constants_1.INT_ZERO;
        usageMetrics.dailySwapCount = constants_1.INT_ZERO;
        usageMetrics.dailyActiveDepositors = constants_1.INT_ZERO;
        usageMetrics.dailyActiveBorrowers = constants_1.INT_ZERO;
        usageMetrics.dailyActiveLiquidators = constants_1.INT_ZERO;
        usageMetrics.dailyActiveLiquidatees = constants_1.INT_ZERO;
        usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.dailyCollateralIn = constants_1.INT_ZERO;
        usageMetrics.dailyCollateralOut = constants_1.INT_ZERO;
    }
    usageMetrics.longPositionCount = protocol.longPositionCount;
    usageMetrics.shortPositionCount = protocol.shortPositionCount;
    usageMetrics.openPositionCount = protocol.openPositionCount;
    usageMetrics.closedPositionCount = protocol.closedPositionCount;
    usageMetrics.cumulativePositionCount = protocol.cumulativePositionCount;
    usageMetrics.cumulativeUniqueDepositors = protocol.cumulativeUniqueDepositors;
    usageMetrics.cumulativeUniqueBorrowers = protocol.cumulativeUniqueBorrowers;
    usageMetrics.cumulativeUniqueLiquidators =
        protocol.cumulativeUniqueLiquidators;
    usageMetrics.cumulativeUniqueLiquidatees =
        protocol.cumulativeUniqueLiquidatees;
    usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetrics.cumulativeCollateralIn = protocol.collateralInCount;
    usageMetrics.cumulativeCollateralOut = protocol.collateralOutCount;
    usageMetrics.totalPoolCount = protocol.totalPoolCount;
    usageMetrics.save();
}
exports.takeUsageMetricsDailySnapshot = takeUsageMetricsDailySnapshot;
function takeUsageMetricsHourlySnapshot(protocol, hour) {
    // Create unique id for the hour
    const id = graph_ts_1.Bytes.fromI32(hour);
    if (schema_1.UsageMetricsHourlySnapshot.load(id)) {
        return;
    }
    const usageMetrics = new schema_1.UsageMetricsHourlySnapshot(id);
    usageMetrics.hours = hour;
    usageMetrics.protocol = protocol.id;
    const tempUsageMetrics = schema_1._TempUsageMetricsHourlySnapshot.load(id);
    if (tempUsageMetrics) {
        usageMetrics.hourlyActiveUsers = tempUsageMetrics.hourlyActiveUsers;
        usageMetrics.hourlyTransactionCount =
            tempUsageMetrics.hourlyTransactionCount;
        usageMetrics.hourlyDepositCount = tempUsageMetrics.hourlyDepositCount;
        usageMetrics.hourlyWithdrawCount = tempUsageMetrics.hourlyWithdrawCount;
        usageMetrics.hourlySwapCount = tempUsageMetrics.hourlySwapCount;
        usageMetrics.hourlyBorrowCount = tempUsageMetrics.hourlyBorrowCount;
    }
    else {
        usageMetrics.hourlyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.hourlyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.hourlyDepositCount = constants_1.INT_ZERO;
        usageMetrics.hourlyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.hourlySwapCount = constants_1.INT_ZERO;
        usageMetrics.hourlyBorrowCount = constants_1.INT_ZERO;
    }
    usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetrics.save();
    return;
}
exports.takeUsageMetricsHourlySnapshot = takeUsageMetricsHourlySnapshot;
function getOrCreateTempUsageMetricsDailySnapshot(event) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    // Number of days since Unix epoch
    const day = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    // Create unique id for the day
    const id = graph_ts_1.Bytes.fromI32(day);
    let usageMetrics = schema_1._TempUsageMetricsDailySnapshot.load(id);
    if (!usageMetrics) {
        usageMetrics = new schema_1._TempUsageMetricsDailySnapshot(id);
        usageMetrics.days = day;
        usageMetrics.protocol = protocol.id;
        usageMetrics.dailyLongPositionCount = constants_1.INT_ZERO;
        usageMetrics.dailyShortPositionCount = constants_1.INT_ZERO;
        usageMetrics.dailyOpenPositionCount = constants_1.INT_ZERO;
        usageMetrics.dailyClosedPositionCount = constants_1.INT_ZERO;
        usageMetrics.dailyCumulativePositionCount = constants_1.INT_ZERO;
        usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.dailyDepositCount = constants_1.INT_ZERO;
        usageMetrics.dailyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.dailyBorrowCount = constants_1.INT_ZERO;
        usageMetrics.dailySwapCount = constants_1.INT_ZERO;
        usageMetrics.dailyActiveDepositors = constants_1.INT_ZERO;
        usageMetrics.dailyActiveBorrowers = constants_1.INT_ZERO;
        usageMetrics.dailyActiveLiquidators = constants_1.INT_ZERO;
        usageMetrics.dailyActiveLiquidatees = constants_1.INT_ZERO;
        usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.dailyCollateralIn = constants_1.INT_ZERO;
        usageMetrics.dailyCollateralOut = constants_1.INT_ZERO;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateTempUsageMetricsDailySnapshot = getOrCreateTempUsageMetricsDailySnapshot;
function getOrCreateTempUsageMetricsHourlySnapshot(event) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    // Number of hours since Unix epoch
    const hour = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const id = graph_ts_1.Bytes.fromI32(hour);
    // Create unique id for the day
    let usageMetrics = schema_1._TempUsageMetricsHourlySnapshot.load(id);
    if (!usageMetrics) {
        usageMetrics = new schema_1._TempUsageMetricsHourlySnapshot(id);
        usageMetrics.hours = hour;
        usageMetrics.protocol = protocol.id;
        usageMetrics.hourlyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.hourlyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.hourlyDepositCount = constants_1.INT_ZERO;
        usageMetrics.hourlyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.hourlySwapCount = constants_1.INT_ZERO;
        usageMetrics.hourlyBorrowCount = constants_1.INT_ZERO;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateTempUsageMetricsHourlySnapshot = getOrCreateTempUsageMetricsHourlySnapshot;
// Update temp usage metrics entities
function updateTempUsageMetrics(event, fromAddress, eventType, openPositionCount, positionSide) {
    const usageMetricsDaily = getOrCreateTempUsageMetricsDailySnapshot(event);
    const usageMetricsHourly = getOrCreateTempUsageMetricsHourlySnapshot(event);
    usageMetricsDaily.dailyTransactionCount += constants_1.INT_ONE;
    usageMetricsHourly.hourlyTransactionCount += constants_1.INT_ONE;
    switch (eventType) {
        case event_1.EventType.Deposit:
            usageMetricsDaily.dailyDepositCount += constants_1.INT_ONE;
            usageMetricsHourly.hourlyDepositCount += constants_1.INT_ONE;
            if (isUniqueDailyUser(event, fromAddress, eventType)) {
                usageMetricsDaily.dailyActiveDepositors += constants_1.INT_ONE;
            }
            break;
        case event_1.EventType.Withdraw:
            usageMetricsDaily.dailyWithdrawCount += constants_1.INT_ONE;
            usageMetricsHourly.hourlyWithdrawCount += constants_1.INT_ONE;
            break;
        case event_1.EventType.CollateralIn:
            usageMetricsDaily.dailyCollateralIn += constants_1.INT_ONE;
            usageMetricsDaily.dailyBorrowCount += constants_1.INT_ONE;
            usageMetricsHourly.hourlyBorrowCount += constants_1.INT_ONE;
            if (isUniqueDailyUser(event, fromAddress, eventType)) {
                usageMetricsDaily.dailyActiveBorrowers += constants_1.INT_ONE;
            }
            break;
        case event_1.EventType.CollateralOut:
            usageMetricsDaily.dailyCollateralOut += constants_1.INT_ONE;
            break;
        case event_1.EventType.Swap:
            usageMetricsDaily.dailySwapCount += constants_1.INT_ONE;
            usageMetricsHourly.hourlySwapCount += constants_1.INT_ONE;
            break;
        case event_1.EventType.Liquidate:
            if (isUniqueDailyUser(event, fromAddress, eventType)) {
                usageMetricsDaily.dailyActiveLiquidators += constants_1.INT_ONE;
            }
            break;
        case event_1.EventType.Liquidated:
            if (isUniqueDailyUser(event, fromAddress, eventType)) {
                usageMetricsDaily.dailyActiveLiquidatees += constants_1.INT_ONE;
            }
            break;
        default:
            break;
    }
    // Number of days since Unix epoch
    const day = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const hour = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    // Combine the id and the user address to generate a unique user id for the day
    const dailyActiveAccountId = fromAddress.concatI32(day);
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        usageMetricsDaily.dailyActiveUsers += constants_1.INT_ONE;
        dailyActiveAccount.save();
    }
    const hourlyActiveAccountId = fromAddress.concatI32(hour);
    let hourlyActiveAccount = schema_1.ActiveAccount.load(hourlyActiveAccountId);
    if (!hourlyActiveAccount) {
        hourlyActiveAccount = new schema_1.ActiveAccount(hourlyActiveAccountId);
        usageMetricsHourly.hourlyActiveUsers += constants_1.INT_ONE;
        hourlyActiveAccount.save();
    }
    if (openPositionCount > constants_1.INT_ZERO) {
        if (constants_1.PositionSide.LONG == positionSide) {
            usageMetricsDaily.dailyLongPositionCount += constants_1.INT_ONE;
        }
        else {
            usageMetricsDaily.dailyShortPositionCount += constants_1.INT_ONE;
        }
        usageMetricsDaily.dailyOpenPositionCount += constants_1.INT_ONE;
        usageMetricsDaily.dailyCumulativePositionCount += constants_1.INT_ONE;
    }
    else if (openPositionCount < constants_1.INT_ZERO) {
        usageMetricsDaily.dailyClosedPositionCount += constants_1.INT_ONE;
    }
    usageMetricsDaily.save();
    usageMetricsHourly.save();
}
exports.updateTempUsageMetrics = updateTempUsageMetrics;
function isUniqueDailyUser(event, fromAddress, eventType) {
    const day = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    // Combine the id, user address, and action to generate a unique user id for the day
    const dailyActionActiveAccountId = fromAddress
        .concatI32(day)
        .concat(graph_ts_1.Bytes.fromUTF8(eventType.toString()));
    let dailyActionActiveAccount = schema_1.ActiveAccount.load(dailyActionActiveAccountId);
    if (!dailyActionActiveAccount) {
        dailyActionActiveAccount = new schema_1.ActiveAccount(dailyActionActiveAccountId);
        dailyActionActiveAccount.save();
        return true;
    }
    return false;
}
