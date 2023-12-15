"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTempUsageMetrics =
  exports.getOrCreateTempUsageMetricsHourlySnapshot =
  exports.getOrCreateTempUsageMetricsDailySnapshot =
  exports.takeUsageMetricsHourlySnapshot =
  exports.takeUsageMetricsDailySnapshot =
  exports.takeFinancialDailySnapshot =
  exports.takeLiquidityPoolHourlySnapshot =
  exports.takeLiquidityPoolDailySnapshot =
  exports.takeSnapshots =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const event_1 = require("./event");
const protocol_1 = require("./protocol");
const pool_1 = require("./pool");
const constants_1 = require("../utils/constants");
// snapshots are only snapped once per interval for efficiency.
function takeSnapshots(event, poolAddress) {
  const dayID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
  const hourID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
  const protocol = (0, protocol_1.getOrCreateProtocol)();
  const protocolSnapshotDayID =
    protocol._lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
  const protocolSnapshotHourID =
    protocol._lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_HOUR;
  if (
    protocolSnapshotDayID != dayID &&
    protocolSnapshotDayID != constants_1.INT_ZERO
  ) {
    takeFinancialDailySnapshot(event, protocol, protocolSnapshotDayID);
    takeUsageMetricsDailySnapshot(event, protocol, protocolSnapshotDayID);
    (0, protocol_1.updateProtocolSnapshotDayID)(protocolSnapshotDayID);
  }
  if (
    protocolSnapshotHourID != hourID &&
    protocolSnapshotHourID != constants_1.INT_ZERO
  ) {
    takeUsageMetricsHourlySnapshot(event, protocol, protocolSnapshotHourID);
  }
  const pool = (0, pool_1.getOrCreateLiquidityPool)(event, poolAddress);
  const poolSnapshotDayID =
    pool._lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
  const poolSnapshotHourID =
    pool._lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_HOUR;
  if (poolSnapshotDayID != dayID && poolSnapshotDayID != constants_1.INT_ZERO) {
    takeLiquidityPoolDailySnapshot(event, pool, poolSnapshotDayID);
    (0, pool_1.updatePoolSnapshotDayID)(pool, poolSnapshotDayID);
  }
  if (
    poolSnapshotHourID != hourID &&
    poolSnapshotHourID != constants_1.INT_ZERO
  ) {
    takeLiquidityPoolHourlySnapshot(event, pool, poolSnapshotHourID);
    (0, pool_1.updatePoolSnapshotHourID)(pool, poolSnapshotHourID);
  }
}
exports.takeSnapshots = takeSnapshots;
function takeLiquidityPoolDailySnapshot(event, pool, day) {
  const id = pool.id.concatI32(day);
  if (schema_1.LiquidityPoolDailySnapshot.load(id)) {
    return;
  }
  const poolMetrics = new schema_1.LiquidityPoolDailySnapshot(id);
  const prevPoolMetrics = schema_1.LiquidityPoolDailySnapshot.load(
    pool.id.concatI32(pool._lastSnapshotDayID)
  );
  const inputTokenLength = pool.inputTokens.length;
  let prevCumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeCollateralVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeDepositedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeWithdrawVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeClosedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeExerciseVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeVolumeByTokenAmount = new Array(inputTokenLength).fill(
    constants_1.BIGINT_ZERO
  );
  let prevCumulativeVolumeByTokenUSD = new Array(inputTokenLength).fill(
    constants_1.BIGDECIMAL_ZERO
  );
  let prevCumulativeDepositedVolumeByTokenAmount = new Array(
    inputTokenLength
  ).fill(constants_1.BIGINT_ZERO);
  let prevCumulativeDepositedVolumeByTokenUSD = new Array(
    inputTokenLength
  ).fill(constants_1.BIGDECIMAL_ZERO);
  let prevCumulativeWithdrawVolumeByTokenAmount = new Array(
    inputTokenLength
  ).fill(constants_1.BIGINT_ZERO);
  let prevCumulativeWithdrawVolumeByTokenUSD = new Array(inputTokenLength).fill(
    constants_1.BIGDECIMAL_ZERO
  );
  let prevCumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCallsMintedCount = constants_1.INT_ZERO;
  let prevPutsMintedCount = constants_1.INT_ZERO;
  let prevContractsMintedCount = constants_1.INT_ZERO;
  let prevContractsTakenCount = constants_1.INT_ZERO;
  let prevContractsExpiredCount = constants_1.INT_ZERO;
  let prevContractsExercisedCount = constants_1.INT_ZERO;
  let prevContractsClosedCount = constants_1.INT_ZERO;
  if (prevPoolMetrics) {
    prevCumulativeSupplySideRevenueUSD =
      prevPoolMetrics.cumulativeSupplySideRevenueUSD;
    prevCumulativeProtocolSideRevenueUSD =
      prevPoolMetrics.cumulativeProtocolSideRevenueUSD;
    prevCumulativeTotalRevenueUSD = prevPoolMetrics.cumulativeTotalRevenueUSD;
    prevCumulativeVolumeUSD = prevPoolMetrics.cumulativeVolumeUSD;
    prevCumulativeCollateralVolumeUSD =
      prevPoolMetrics.cumulativeCollateralVolumeUSD;
    prevCumulativeDepositedVolumeUSD =
      prevPoolMetrics.cumulativeDepositedVolumeUSD;
    prevCumulativeWithdrawVolumeUSD =
      prevPoolMetrics.cumulativeWithdrawVolumeUSD;
    prevCumulativeClosedVolumeUSD = prevPoolMetrics.cumulativeClosedVolumeUSD;
    prevCumulativeExerciseVolumeUSD =
      prevPoolMetrics.cumulativeExerciseVolumeUSD;
    prevCumulativeVolumeByTokenAmount =
      prevPoolMetrics.cumulativeVolumeByTokenAmount;
    prevCumulativeVolumeByTokenUSD = prevPoolMetrics.cumulativeVolumeByTokenUSD;
    prevCumulativeDepositedVolumeByTokenAmount =
      prevPoolMetrics.cumulativeDepositedVolumeByTokenAmount;
    prevCumulativeDepositedVolumeByTokenUSD =
      prevPoolMetrics.cumulativeDepositedVolumeByTokenUSD;
    prevCumulativeWithdrawVolumeByTokenAmount =
      prevPoolMetrics.cumulativeWithdrawVolumeByTokenAmount;
    prevCumulativeWithdrawVolumeByTokenUSD =
      prevPoolMetrics.cumulativeWithdrawVolumeByTokenUSD;
    prevCumulativeEntryPremiumUSD = prevPoolMetrics.cumulativeEntryPremiumUSD;
    prevCumulativeExitPremiumUSD = prevPoolMetrics.cumulativeExitPremiumUSD;
    prevCumulativeTotalPremiumUSD = prevPoolMetrics.cumulativeTotalPremiumUSD;
    prevCumulativeDepositPremiumUSD =
      prevPoolMetrics.cumulativeDepositPremiumUSD;
    prevCumulativeWithdrawPremiumUSD =
      prevPoolMetrics.cumulativeWithdrawPremiumUSD;
    prevCumulativeTotalLiquidityPremiumUSD =
      prevPoolMetrics.cumulativeTotalLiquidityPremiumUSD;
    prevCallsMintedCount = prevPoolMetrics.callsMintedCount;
    prevPutsMintedCount = prevPoolMetrics.putsMintedCount;
    prevContractsMintedCount = prevPoolMetrics.contractsMintedCount;
    prevContractsTakenCount = prevPoolMetrics.contractsTakenCount;
    prevContractsExpiredCount = prevPoolMetrics.contractsExpiredCount;
    prevContractsExercisedCount = prevPoolMetrics.contractsExercisedCount;
    prevContractsClosedCount = prevPoolMetrics.contractsClosedCount;
  } else if (pool._lastSnapshotDayID > constants_1.INT_ZERO) {
    graph_ts_1.log.error(
      "Missing daily pool snapshot at ID that has been snapped: Pool {}, ID {} ",
      [pool.id.toHexString(), pool._lastSnapshotDayID.toString()]
    );
  }
  poolMetrics.days = day;
  poolMetrics.protocol = pool.protocol;
  poolMetrics.pool = pool.id;
  poolMetrics.timestamp = event.block.timestamp;
  poolMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
  poolMetrics.inputTokenBalances = pool.inputTokenBalances;
  poolMetrics.inputTokenWeights = pool.inputTokenWeights;
  poolMetrics.outputTokenSupply = pool.outputTokenSupply;
  poolMetrics.outputTokenPriceUSD = pool.outputTokenPriceUSD;
  poolMetrics.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
  poolMetrics.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
  poolMetrics.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
  poolMetrics.dailySupplySideRevenueUSD =
    pool.cumulativeSupplySideRevenueUSD.minus(
      prevCumulativeSupplySideRevenueUSD
    );
  poolMetrics.cumulativeSupplySideRevenueUSD =
    pool.cumulativeSupplySideRevenueUSD;
  poolMetrics.dailySupplySideRevenueUSD =
    pool.cumulativeSupplySideRevenueUSD.minus(
      prevCumulativeSupplySideRevenueUSD
    );
  poolMetrics.cumulativeProtocolSideRevenueUSD =
    pool.cumulativeProtocolSideRevenueUSD;
  poolMetrics.dailyProtocolSideRevenueUSD =
    pool.cumulativeProtocolSideRevenueUSD.minus(
      prevCumulativeProtocolSideRevenueUSD
    );
  poolMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
  poolMetrics.dailyTotalRevenueUSD = pool.cumulativeTotalRevenueUSD.minus(
    prevCumulativeTotalRevenueUSD
  );
  poolMetrics.openInterestUSD = pool.openInterestUSD;
  poolMetrics.dailyEntryPremiumUSD = pool.cumulativeEntryPremiumUSD.minus(
    prevCumulativeEntryPremiumUSD
  );
  poolMetrics.cumulativeEntryPremiumUSD = pool.cumulativeEntryPremiumUSD;
  poolMetrics.dailyExitPremiumUSD = pool.cumulativeExitPremiumUSD.minus(
    prevCumulativeExitPremiumUSD
  );
  poolMetrics.cumulativeExitPremiumUSD = pool.cumulativeExitPremiumUSD;
  poolMetrics.dailyTotalPremiumUSD = pool.cumulativeTotalPremiumUSD.minus(
    prevCumulativeTotalPremiumUSD
  );
  poolMetrics.cumulativeTotalPremiumUSD = pool.cumulativeTotalPremiumUSD;
  poolMetrics.dailyDepositPremiumUSD = pool.cumulativeDepositPremiumUSD.minus(
    prevCumulativeDepositPremiumUSD
  );
  poolMetrics.cumulativeDepositPremiumUSD = pool.cumulativeDepositPremiumUSD;
  poolMetrics.dailyWithdrawPremiumUSD = pool.cumulativeWithdrawPremiumUSD.minus(
    prevCumulativeWithdrawPremiumUSD
  );
  poolMetrics.cumulativeWithdrawPremiumUSD = pool.cumulativeWithdrawPremiumUSD;
  poolMetrics.dailyTotalLiquidityPremiumUSD =
    pool.cumulativeTotalLiquidityPremiumUSD.minus(
      prevCumulativeTotalLiquidityPremiumUSD
    );
  poolMetrics.cumulativeTotalLiquidityPremiumUSD =
    pool.cumulativeTotalLiquidityPremiumUSD;
  poolMetrics.dailyVolumeUSD = pool.cumulativeVolumeUSD.minus(
    prevCumulativeVolumeUSD
  );
  poolMetrics.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
  poolMetrics.dailyCollateralVolumeUSD =
    pool.cumulativeCollateralVolumeUSD.minus(prevCumulativeCollateralVolumeUSD);
  poolMetrics.cumulativeCollateralVolumeUSD =
    pool.cumulativeCollateralVolumeUSD;
  poolMetrics.dailyDepositedVolumeUSD = pool.cumulativeDepositedVolumeUSD.minus(
    prevCumulativeDepositedVolumeUSD
  );
  poolMetrics.cumulativeDepositedVolumeUSD = pool.cumulativeDepositedVolumeUSD;
  poolMetrics.dailyWithdrawVolumeUSD = pool.cumulativeWithdrawVolumeUSD.minus(
    prevCumulativeWithdrawVolumeUSD
  );
  poolMetrics.cumulativeWithdrawVolumeUSD = pool.cumulativeWithdrawVolumeUSD;
  poolMetrics.dailyClosedVolumeUSD = pool.cumulativeClosedVolumeUSD.minus(
    prevCumulativeClosedVolumeUSD
  );
  poolMetrics.cumulativeClosedVolumeUSD = pool.cumulativeClosedVolumeUSD;
  poolMetrics.dailyExerciseVolumeUSD = pool.cumulativeExercisedVolumeUSD.minus(
    prevCumulativeExerciseVolumeUSD
  );
  poolMetrics.cumulativeExerciseVolumeUSD = pool.cumulativeExercisedVolumeUSD;
  poolMetrics.cumulativeVolumeByTokenAmount =
    pool.cumulativeVolumeByTokenAmount;
  poolMetrics.cumulativeVolumeByTokenUSD = pool.cumulativeVolumeByTokenUSD;
  poolMetrics.cumulativeDepositedVolumeByTokenAmount =
    pool.cumulativeDepositedVolumeByTokenAmount;
  poolMetrics.cumulativeDepositedVolumeByTokenUSD =
    pool.cumulativeDepositedVolumeByTokenUSD;
  poolMetrics.cumulativeWithdrawVolumeByTokenAmount =
    pool.cumulativeWithdrawVolumeByTokenAmount;
  poolMetrics.cumulativeWithdrawVolumeByTokenUSD =
    pool.cumulativeWithdrawVolumeByTokenUSD;
  const dailyVolumeByTokenAmount = pool.cumulativeVolumeByTokenAmount;
  const dailyVolumeByTokenUSD = pool.cumulativeVolumeByTokenUSD;
  const dailyDepositedVolumeByTokenAmount =
    pool.cumulativeDepositedVolumeByTokenAmount;
  const dailyDepositedVolumeByTokenUSD =
    pool.cumulativeDepositedVolumeByTokenUSD;
  const dailyWithdrawVolumeByTokenAmount =
    pool.cumulativeWithdrawVolumeByTokenAmount;
  const dailyWithdrawVolumeByTokenUSD = pool.cumulativeWithdrawVolumeByTokenUSD;
  for (let i = 0; i < inputTokenLength; i++) {
    dailyVolumeByTokenAmount[i] = dailyVolumeByTokenAmount[i].minus(
      prevCumulativeVolumeByTokenAmount[i]
    );
    dailyVolumeByTokenUSD[i] = dailyVolumeByTokenUSD[i].minus(
      prevCumulativeVolumeByTokenUSD[i]
    );
    dailyDepositedVolumeByTokenAmount[i] = dailyDepositedVolumeByTokenAmount[
      i
    ].minus(prevCumulativeDepositedVolumeByTokenAmount[i]);
    dailyDepositedVolumeByTokenUSD[i] = dailyDepositedVolumeByTokenUSD[i].minus(
      prevCumulativeDepositedVolumeByTokenUSD[i]
    );
    dailyWithdrawVolumeByTokenAmount[i] = dailyWithdrawVolumeByTokenAmount[
      i
    ].minus(prevCumulativeWithdrawVolumeByTokenAmount[i]);
    dailyWithdrawVolumeByTokenUSD[i] = dailyWithdrawVolumeByTokenUSD[i].minus(
      prevCumulativeWithdrawVolumeByTokenUSD[i]
    );
  }
  poolMetrics.dailyVolumeByTokenAmount = dailyVolumeByTokenAmount;
  poolMetrics.dailyVolumeByTokenUSD = dailyVolumeByTokenUSD;
  poolMetrics.dailyDepositedVolumeByTokenAmount =
    dailyDepositedVolumeByTokenAmount;
  poolMetrics.dailyDepositedVolumeByTokenUSD = dailyDepositedVolumeByTokenUSD;
  poolMetrics.dailyWithdrawVolumeByTokenAmount =
    dailyWithdrawVolumeByTokenAmount;
  poolMetrics.dailyWithdrawVolumeByTokenUSD = dailyWithdrawVolumeByTokenUSD;
  poolMetrics.dailyCallsMintedCount =
    pool.callsMintedCount - prevCallsMintedCount;
  poolMetrics.callsMintedCount = pool.callsMintedCount;
  poolMetrics.dailyPutsMintedCount = pool.putsMintedCount - prevPutsMintedCount;
  poolMetrics.putsMintedCount = pool.putsMintedCount;
  poolMetrics.dailyContractsMintedCount =
    pool.contractsMintedCount - prevContractsMintedCount;
  poolMetrics.contractsMintedCount = pool.contractsMintedCount;
  poolMetrics.dailyContractsTakenCount =
    pool.contractsTakenCount - prevContractsTakenCount;
  poolMetrics.contractsTakenCount = pool.contractsTakenCount;
  poolMetrics.dailyContractsExpiredCount =
    pool.contractsExpiredCount - prevContractsExpiredCount;
  poolMetrics.contractsExpiredCount = pool.contractsExpiredCount;
  poolMetrics.dailyContractsExercisedCount =
    pool.contractsExercisedCount - prevContractsExercisedCount;
  poolMetrics.contractsExercisedCount = pool.contractsExercisedCount;
  poolMetrics.dailyContractsClosedCount =
    pool.contractsClosedCount - prevContractsClosedCount;
  poolMetrics.contractsClosedCount = pool.contractsClosedCount;
  poolMetrics.dailyContractsExercisedCount =
    pool.contractsExercisedCount - prevContractsExercisedCount;
  poolMetrics.contractsExercisedCount = pool.contractsExercisedCount;
  poolMetrics.openPositionCount = pool.openPositionCount;
  poolMetrics.closedPositionCount = pool.closedPositionCount;
  poolMetrics.save();
}
exports.takeLiquidityPoolDailySnapshot = takeLiquidityPoolDailySnapshot;
function takeLiquidityPoolHourlySnapshot(event, pool, hour) {
  const id = pool.id.concatI32(hour);
  if (schema_1.LiquidityPoolHourlySnapshot.load(id)) {
    return;
  }
  const poolMetrics = new schema_1.LiquidityPoolHourlySnapshot(id);
  const prevPoolMetrics = schema_1.LiquidityPoolHourlySnapshot.load(
    pool.id.concatI32(pool._lastSnapshotHourID)
  );
  const inputTokenLength = pool.inputTokens.length;
  let prevCumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeDepositedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeWithdrawVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeVolumeByTokenAmount = new Array(inputTokenLength).fill(
    constants_1.BIGINT_ZERO
  );
  let prevCumulativeVolumeByTokenUSD = new Array(inputTokenLength).fill(
    constants_1.BIGDECIMAL_ZERO
  );
  let prevCumulativeDepositedVolumeByTokenAmount = new Array(
    inputTokenLength
  ).fill(constants_1.BIGINT_ZERO);
  let prevCumulativeDepositedVolumeByTokenUSD = new Array(
    inputTokenLength
  ).fill(constants_1.BIGDECIMAL_ZERO);
  let prevCumulativeWithdrawVolumeByTokenAmount = new Array(
    inputTokenLength
  ).fill(constants_1.BIGINT_ZERO);
  let prevCumulativeWithdrawVolumeByTokenUSD = new Array(inputTokenLength).fill(
    constants_1.BIGDECIMAL_ZERO
  );
  if (prevPoolMetrics) {
    prevCumulativeSupplySideRevenueUSD =
      prevPoolMetrics.cumulativeSupplySideRevenueUSD;
    prevCumulativeProtocolSideRevenueUSD =
      prevPoolMetrics.cumulativeProtocolSideRevenueUSD;
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
    prevCumulativeVolumeUSD = prevPoolMetrics.cumulativeVolumeUSD;
    prevCumulativeDepositedVolumeUSD =
      prevPoolMetrics.cumulativeDepositVolumeUSD;
    prevCumulativeWithdrawVolumeUSD =
      prevPoolMetrics.cumulativeWithdrawVolumeUSD;
    prevCumulativeVolumeByTokenAmount =
      prevPoolMetrics.cumulativeVolumeByTokenAmount;
    prevCumulativeVolumeByTokenUSD = prevPoolMetrics.cumulativeVolumeByTokenUSD;
    prevCumulativeDepositedVolumeByTokenAmount =
      prevPoolMetrics.cumulativeDepositVolumeByTokenAmount;
    prevCumulativeDepositedVolumeByTokenUSD =
      prevPoolMetrics.cumulativeDepositVolumeByTokenUSD;
    prevCumulativeWithdrawVolumeByTokenAmount =
      prevPoolMetrics.cumulativeWithdrawVolumeByTokenAmount;
    prevCumulativeWithdrawVolumeByTokenUSD =
      prevPoolMetrics.cumulativeWithdrawVolumeByTokenUSD;
  } else if (pool._lastSnapshotHourID > constants_1.INT_ZERO) {
    graph_ts_1.log.error(
      "Missing hourly pool snapshot at ID that has been snapped: Pool {}, ID {} ",
      [pool.id.toHexString(), pool._lastSnapshotHourID.toString()]
    );
  }
  poolMetrics.hours = hour;
  poolMetrics.protocol = pool.protocol;
  poolMetrics.pool = pool.id;
  poolMetrics.timestamp = event.block.timestamp;
  poolMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
  poolMetrics.openInterestUSD = pool.openInterestUSD;
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
    pool.cumulativeSupplySideRevenueUSD.minus(
      prevCumulativeSupplySideRevenueUSD
    );
  poolMetrics.cumulativeProtocolSideRevenueUSD =
    pool.cumulativeProtocolSideRevenueUSD;
  poolMetrics.hourlyProtocolSideRevenueUSD =
    pool.cumulativeProtocolSideRevenueUSD.minus(
      prevCumulativeProtocolSideRevenueUSD
    );
  poolMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
  poolMetrics.hourlyTotalRevenueUSD = pool.cumulativeTotalRevenueUSD.minus(
    prevCumulativeTotalRevenueUSD
  );
  poolMetrics.hourlyEntryPremiumUSD = pool.cumulativeEntryPremiumUSD.minus(
    prevCumulativeEntryPremiumUSD
  );
  poolMetrics.cumulativeEntryPremiumUSD = pool.cumulativeEntryPremiumUSD;
  poolMetrics.hourlyExitPremiumUSD = pool.cumulativeExitPremiumUSD.minus(
    prevCumulativeExitPremiumUSD
  );
  poolMetrics.cumulativeExitPremiumUSD = pool.cumulativeExitPremiumUSD;
  poolMetrics.hourlyTotalPremiumUSD = pool.cumulativeTotalPremiumUSD.minus(
    prevCumulativeTotalPremiumUSD
  );
  poolMetrics.cumulativeTotalPremiumUSD = pool.cumulativeTotalPremiumUSD;
  poolMetrics.hourlyDepositPremiumUSD = pool.cumulativeDepositPremiumUSD.minus(
    prevCumulativeDepositPremiumUSD
  );
  poolMetrics.cumulativeDepositPremiumUSD = pool.cumulativeDepositPremiumUSD;
  poolMetrics.hourlyWithdrawPremiumUSD =
    pool.cumulativeWithdrawPremiumUSD.minus(prevCumulativeWithdrawPremiumUSD);
  poolMetrics.cumulativeWithdrawPremiumUSD = pool.cumulativeWithdrawPremiumUSD;
  poolMetrics.hourlyTotalLiquidityPremiumUSD =
    pool.cumulativeTotalLiquidityPremiumUSD.minus(
      prevCumulativeTotalLiquidityPremiumUSD
    );
  poolMetrics.cumulativeTotalLiquidityPremiumUSD =
    pool.cumulativeTotalLiquidityPremiumUSD;
  poolMetrics.hourlyVolumeUSD = pool.cumulativeVolumeUSD.minus(
    prevCumulativeVolumeUSD
  );
  poolMetrics.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
  poolMetrics.hourlyDepositVolumeUSD = pool.cumulativeDepositedVolumeUSD.minus(
    prevCumulativeDepositedVolumeUSD
  );
  poolMetrics.cumulativeDepositVolumeUSD = pool.cumulativeDepositedVolumeUSD;
  poolMetrics.hourlyWithdrawVolumeUSD = pool.cumulativeWithdrawVolumeUSD.minus(
    prevCumulativeWithdrawVolumeUSD
  );
  poolMetrics.cumulativeWithdrawVolumeUSD = pool.cumulativeWithdrawVolumeUSD;
  poolMetrics.cumulativeVolumeByTokenAmount =
    pool.cumulativeVolumeByTokenAmount;
  poolMetrics.cumulativeVolumeByTokenUSD = pool.cumulativeVolumeByTokenUSD;
  poolMetrics.cumulativeDepositVolumeByTokenAmount =
    pool.cumulativeDepositedVolumeByTokenAmount;
  poolMetrics.cumulativeDepositVolumeByTokenUSD =
    pool.cumulativeDepositedVolumeByTokenUSD;
  poolMetrics.cumulativeWithdrawVolumeByTokenAmount =
    pool.cumulativeWithdrawVolumeByTokenAmount;
  poolMetrics.cumulativeWithdrawVolumeByTokenUSD =
    pool.cumulativeWithdrawVolumeByTokenUSD;
  const hourlyVolumeByTokenAmount = pool.cumulativeVolumeByTokenAmount;
  const hourlyVolumeByTokenUSD = pool.cumulativeVolumeByTokenUSD;
  const hourlyDepositedVolumeByTokenAmount =
    pool.cumulativeDepositedVolumeByTokenAmount;
  const hourlyDepositedVolumeByTokenUSD =
    pool.cumulativeDepositedVolumeByTokenUSD;
  const hourlyWithdrawVolumeByTokenAmount =
    pool.cumulativeWithdrawVolumeByTokenAmount;
  const hourlyWithdrawVolumeByTokenUSD =
    pool.cumulativeWithdrawVolumeByTokenUSD;
  for (let i = 0; i < inputTokenLength; i++) {
    hourlyVolumeByTokenAmount[i] = hourlyVolumeByTokenAmount[i].minus(
      prevCumulativeVolumeByTokenAmount[i]
    );
    hourlyVolumeByTokenUSD[i] = hourlyVolumeByTokenUSD[i].minus(
      prevCumulativeVolumeByTokenUSD[i]
    );
    hourlyDepositedVolumeByTokenAmount[i] = hourlyDepositedVolumeByTokenAmount[
      i
    ].minus(prevCumulativeDepositedVolumeByTokenAmount[i]);
    hourlyDepositedVolumeByTokenUSD[i] = hourlyDepositedVolumeByTokenUSD[
      i
    ].minus(prevCumulativeDepositedVolumeByTokenUSD[i]);
    hourlyWithdrawVolumeByTokenAmount[i] = hourlyWithdrawVolumeByTokenAmount[
      i
    ].minus(prevCumulativeWithdrawVolumeByTokenAmount[i]);
    hourlyWithdrawVolumeByTokenUSD[i] = hourlyWithdrawVolumeByTokenUSD[i].minus(
      prevCumulativeWithdrawVolumeByTokenUSD[i]
    );
  }
  poolMetrics.hourlyVolumeByTokenAmount = hourlyVolumeByTokenAmount;
  poolMetrics.hourlyVolumeByTokenUSD = hourlyVolumeByTokenUSD;
  poolMetrics.hourlyDepositVolumeByTokenAmount =
    hourlyDepositedVolumeByTokenAmount;
  poolMetrics.hourlyDepositVolumeByTokenUSD = hourlyDepositedVolumeByTokenUSD;
  poolMetrics.hourlyWithdrawVolumeByTokenAmount =
    hourlyWithdrawVolumeByTokenAmount;
  poolMetrics.hourlyWithdrawVolumeByTokenUSD = hourlyWithdrawVolumeByTokenUSD;
  poolMetrics.save();
}
exports.takeLiquidityPoolHourlySnapshot = takeLiquidityPoolHourlySnapshot;
function takeFinancialDailySnapshot(event, protocol, day) {
  const id = graph_ts_1.Bytes.fromI32(day);
  if (schema_1.FinancialsDailySnapshot.load(id)) {
    return;
  }
  const financialMetrics = new schema_1.FinancialsDailySnapshot(id);
  const prevFinancialMetrics = schema_1.FinancialsDailySnapshot.load(
    graph_ts_1.Bytes.fromI32(protocol._lastSnapshotDayID)
  );
  let prevCumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeCollateralVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeExercisedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeClosedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevCumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
  let prevPutsMintedCount = constants_1.INT_ZERO;
  let prevCallsMintedCount = constants_1.INT_ZERO;
  let prevContractsMintedCount = constants_1.INT_ZERO;
  let prevContractsTakenCount = constants_1.INT_ZERO;
  let prevContractsExpiredCount = constants_1.INT_ZERO;
  let prevContractsExercisedCount = constants_1.INT_ZERO;
  let prevContractsClosedCount = constants_1.INT_ZERO;
  if (prevFinancialMetrics) {
    prevCumulativeVolumeUSD = prevFinancialMetrics.cumulativeVolumeUSD;
    prevCumulativeCollateralVolumeUSD =
      prevFinancialMetrics.cumulativeCollateralVolumeUSD;
    prevCumulativeExercisedVolumeUSD =
      prevFinancialMetrics.cumulativeExercisedVolumeUSD;
    prevCumulativeClosedVolumeUSD =
      prevFinancialMetrics.cumulativeClosedVolumeUSD;
    prevCumulativeSupplySideRevenueUSD =
      prevFinancialMetrics.cumulativeSupplySideRevenueUSD;
    prevCumulativeProtocolSideRevenueUSD =
      prevFinancialMetrics.cumulativeProtocolSideRevenueUSD;
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
    prevPutsMintedCount = prevFinancialMetrics.putsMintedCount;
    prevCallsMintedCount = prevFinancialMetrics.callsMintedCount;
    prevContractsMintedCount = prevFinancialMetrics.contractsMintedCount;
    prevContractsTakenCount = prevFinancialMetrics.contractsTakenCount;
    prevContractsExpiredCount = prevFinancialMetrics.contractsExpiredCount;
    prevContractsExercisedCount = prevFinancialMetrics.contractsExercisedCount;
    prevContractsClosedCount = prevFinancialMetrics.contractsClosedCount;
  } else if (protocol._lastSnapshotDayID > constants_1.INT_ZERO) {
    graph_ts_1.log.error(
      "Missing protocol snapshot at ID that has been snapped: Protocol {}, ID {} ",
      [protocol.id.toHexString(), protocol._lastSnapshotDayID.toString()]
    );
  }
  financialMetrics.days = day;
  financialMetrics.protocol = protocol.id;
  financialMetrics.timestamp = event.block.timestamp;
  financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
  financialMetrics.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD;
  financialMetrics.dailyVolumeUSD = protocol.cumulativeVolumeUSD.minus(
    prevCumulativeVolumeUSD
  );
  financialMetrics.cumulativeCollateralVolumeUSD =
    protocol.cumulativeCollateralVolumeUSD;
  financialMetrics.dailyCollateralVolumeUSD =
    protocol.cumulativeCollateralVolumeUSD.minus(
      prevCumulativeCollateralVolumeUSD
    );
  financialMetrics.cumulativeExercisedVolumeUSD =
    protocol.cumulativeExercisedVolumeUSD;
  financialMetrics.dailyExercisedVolumeUSD =
    protocol.cumulativeExercisedVolumeUSD.minus(
      prevCumulativeExercisedVolumeUSD
    );
  financialMetrics.cumulativeClosedVolumeUSD =
    protocol.cumulativeClosedVolumeUSD;
  financialMetrics.dailyClosedVolumeUSD =
    protocol.cumulativeClosedVolumeUSD.minus(prevCumulativeClosedVolumeUSD);
  financialMetrics.openInterestUSD = protocol.openInterestUSD;
  financialMetrics.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD;
  financialMetrics.dailySupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD.minus(
      prevCumulativeSupplySideRevenueUSD
    );
  financialMetrics.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD;
  financialMetrics.dailyProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD.minus(
      prevCumulativeProtocolSideRevenueUSD
    );
  financialMetrics.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD;
  financialMetrics.dailyTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD.minus(prevCumulativeTotalRevenueUSD);
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
    protocol.cumulativeWithdrawPremiumUSD.minus(
      prevCumulativeWithdrawPremiumUSD
    );
  financialMetrics.cumulativeWithdrawPremiumUSD =
    protocol.cumulativeWithdrawPremiumUSD;
  financialMetrics.dailyTotalLiquidityPremiumUSD =
    protocol.cumulativeTotalLiquidityPremiumUSD.minus(
      prevCumulativeTotalLiquidityPremiumUSD
    );
  financialMetrics.cumulativeTotalLiquidityPremiumUSD =
    protocol.cumulativeTotalLiquidityPremiumUSD;
  financialMetrics.dailyPutsMintedCount =
    protocol.putsMintedCount - prevPutsMintedCount;
  financialMetrics.putsMintedCount = protocol.putsMintedCount;
  financialMetrics.dailyCallsMintedCount =
    protocol.callsMintedCount - prevCallsMintedCount;
  financialMetrics.callsMintedCount = protocol.callsMintedCount;
  financialMetrics.dailyContractsMintedCount =
    protocol.contractsMintedCount - prevContractsMintedCount;
  financialMetrics.contractsMintedCount = protocol.contractsMintedCount;
  financialMetrics.dailyContractsTakenCount =
    protocol.contractsTakenCount - prevContractsTakenCount;
  financialMetrics.contractsTakenCount = protocol.contractsTakenCount;
  financialMetrics.dailyContractsExpiredCount =
    protocol.contractsExpiredCount - prevContractsExpiredCount;
  financialMetrics.contractsExpiredCount = protocol.contractsExpiredCount;
  financialMetrics.dailyContractsExercisedCount =
    protocol.contractsExercisedCount - prevContractsExercisedCount;
  financialMetrics.contractsExercisedCount = protocol.contractsExercisedCount;
  financialMetrics.dailyContractsClosedCount =
    protocol.contractsClosedCount - prevContractsClosedCount;
  financialMetrics.contractsClosedCount = protocol.contractsClosedCount;
  financialMetrics.openPositionCount = protocol.openPositionCount;
  financialMetrics.closedPositionCount = protocol.closedPositionCount;
  financialMetrics.save();
}
exports.takeFinancialDailySnapshot = takeFinancialDailySnapshot;
function takeUsageMetricsDailySnapshot(event, protocol, day) {
  // Create unique id for the day
  const id = graph_ts_1.Bytes.fromI32(day);
  if (schema_1.UsageMetricsDailySnapshot.load(id)) {
    return;
  }
  const usageMetrics = new schema_1.UsageMetricsDailySnapshot(
    graph_ts_1.Bytes.fromI32(day)
  );
  usageMetrics.days = day;
  usageMetrics.protocol = protocol.id;
  usageMetrics.timestamp = event.block.timestamp;
  const tempUsageMetrics = schema_1._TempUsageMetricsDailySnapshot.load(id);
  if (tempUsageMetrics) {
    usageMetrics.dailyActiveUsers = tempUsageMetrics.dailyActiveUsers;
    usageMetrics.dailyUniqueLP = tempUsageMetrics.dailyActiveUsers;
    usageMetrics.dailyUniqueTakers = tempUsageMetrics.dailyActiveUsers;
    usageMetrics.dailyTransactionCount = tempUsageMetrics.dailyTransactionCount;
    usageMetrics.dailyDepositCount = tempUsageMetrics.dailyDepositCount;
    usageMetrics.dailyWithdrawCount = tempUsageMetrics.dailyWithdrawCount;
    usageMetrics.dailySwapCount = tempUsageMetrics.dailySwapCount;
  } else {
    usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
    usageMetrics.dailyUniqueLP = constants_1.INT_ZERO;
    usageMetrics.dailyUniqueTakers = constants_1.INT_ZERO;
    usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
    usageMetrics.dailyDepositCount = constants_1.INT_ZERO;
    usageMetrics.dailyWithdrawCount = constants_1.INT_ZERO;
    usageMetrics.dailySwapCount = constants_1.INT_ZERO;
  }
  usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  usageMetrics.cumulativeUniqueLP = protocol.cumulativeUniqueLP;
  usageMetrics.cumulativeUniqueTakers = protocol.cumulativeUniqueTakers;
  usageMetrics.totalPoolCount = protocol.totalPoolCount;
  usageMetrics.save();
}
exports.takeUsageMetricsDailySnapshot = takeUsageMetricsDailySnapshot;
function takeUsageMetricsHourlySnapshot(event, protocol, hour) {
  // Create unique id for the hour
  const id = graph_ts_1.Bytes.fromI32(hour);
  if (schema_1.UsageMetricsHourlySnapshot.load(id)) {
    return;
  }
  const usageMetrics = new schema_1.UsageMetricsHourlySnapshot(id);
  usageMetrics.hours = hour;
  usageMetrics.protocol = protocol.id;
  usageMetrics.timestamp = event.block.timestamp;
  const tempUsageMetrics = schema_1._TempUsageMetricsHourlySnapshot.load(id);
  if (tempUsageMetrics) {
    usageMetrics.hourlyActiveUsers = tempUsageMetrics.hourlyActiveUsers;
    usageMetrics.hourlyTransactionCount =
      tempUsageMetrics.hourlyTransactionCount;
    usageMetrics.hourlyDepositCount = tempUsageMetrics.hourlyDepositCount;
    usageMetrics.hourlyWithdrawCount = tempUsageMetrics.hourlyWithdrawCount;
    usageMetrics.hourlySwapCount = tempUsageMetrics.hourlySwapCount;
  } else {
    usageMetrics.hourlyActiveUsers = constants_1.INT_ZERO;
    usageMetrics.hourlyTransactionCount = constants_1.INT_ZERO;
    usageMetrics.hourlyDepositCount = constants_1.INT_ZERO;
    usageMetrics.hourlyWithdrawCount = constants_1.INT_ZERO;
    usageMetrics.hourlySwapCount = constants_1.INT_ZERO;
  }
  usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  usageMetrics.cumulativeUniqueLP = protocol.cumulativeUniqueLP;
  usageMetrics.cumulativeUniqueTakers = protocol.cumulativeUniqueTakers;
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
    usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
    usageMetrics.dailyUniqueLP = constants_1.INT_ZERO;
    usageMetrics.dailyUniqueTakers = constants_1.INT_ZERO;
    usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
    usageMetrics.dailyDepositCount = constants_1.INT_ZERO;
    usageMetrics.dailyWithdrawCount = constants_1.INT_ZERO;
    usageMetrics.dailySwapCount = constants_1.INT_ZERO;
    usageMetrics.save();
  }
  return usageMetrics;
}
exports.getOrCreateTempUsageMetricsDailySnapshot =
  getOrCreateTempUsageMetricsDailySnapshot;
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
    usageMetrics.save();
  }
  return usageMetrics;
}
exports.getOrCreateTempUsageMetricsHourlySnapshot =
  getOrCreateTempUsageMetricsHourlySnapshot;
// Update temp usage metrics entities
function updateTempUsageMetrics(event, fromAddress, eventType) {
  const usageMetricsDaily = getOrCreateTempUsageMetricsDailySnapshot(event);
  const usageMetricsHourly = getOrCreateTempUsageMetricsHourlySnapshot(event);
  usageMetricsDaily.dailyTransactionCount += constants_1.INT_ONE;
  usageMetricsHourly.hourlyTransactionCount += constants_1.INT_ONE;
  switch (eventType) {
    case event_1.EventType.Deposit:
      usageMetricsDaily.dailyDepositCount += constants_1.INT_ONE;
      usageMetricsHourly.hourlyDepositCount += constants_1.INT_ONE;
      if (isUniqueDailyUser(event, fromAddress, eventType)) {
        usageMetricsDaily.dailyUniqueLP += constants_1.INT_ONE;
      }
      break;
    case event_1.EventType.Withdraw:
      usageMetricsDaily.dailyWithdrawCount += constants_1.INT_ONE;
      usageMetricsHourly.hourlyWithdrawCount += constants_1.INT_ONE;
      break;
    case event_1.EventType.Purchase:
      usageMetricsDaily.dailySwapCount += constants_1.INT_ONE;
      usageMetricsHourly.hourlySwapCount += constants_1.INT_ONE;
      if (isUniqueDailyUser(event, fromAddress, eventType)) {
        usageMetricsDaily.dailyUniqueTakers += constants_1.INT_ONE;
      }
      usageMetricsDaily;
      break;
    case event_1.EventType.Settle:
      usageMetricsDaily.dailySwapCount += constants_1.INT_ONE;
      usageMetricsHourly.hourlySwapCount += constants_1.INT_ONE;
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
  let dailyActionActiveAccount = schema_1.ActiveAccount.load(
    dailyActionActiveAccountId
  );
  if (!dailyActionActiveAccount) {
    dailyActionActiveAccount = new schema_1.ActiveAccount(
      dailyActionActiveAccountId
    );
    dailyActionActiveAccount.save();
    return true;
  }
  return false;
}
