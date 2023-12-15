"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRewards =
  exports.updateRevenue =
  exports.updateVaultSnapshots =
  exports.updateFinancials =
  exports.updateUsageMetricsAfterWithdraw =
  exports.updateUsageMetricsAfterDeposit =
  exports.updateUsageMetrics =
  exports.updateProtocolTotalValueLockedUSD =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const getters_1 = require("../common/getters");
const constants_1 = require("../common/constants");
const rewards_1 = require("../common/rewards");
const datetime_1 = require("./utils/datetime");
const ethereum_1 = require("./utils/ethereum");
const numbers_1 = require("./utils/numbers");
const configure_1 = require("../../configurations/configure");
const schema_1 = require("../../generated/schema");
const BaseRewardPool_1 = require("../../generated/Booster-v1/BaseRewardPool");
function updateProtocolTotalValueLockedUSD() {
  const protocol = (0, getters_1.getOrCreateYieldAggregator)();
  const vaultIds = protocol._vaultIds;
  let totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  for (let idx = 0; idx < vaultIds.length; idx++) {
    const vault = schema_1.Vault.load(vaultIds[idx]);
    if (!vault) continue;
    totalValueLockedUSD = totalValueLockedUSD.plus(vault.totalValueLockedUSD);
  }
  protocol.totalValueLockedUSD = totalValueLockedUSD;
  protocol.save();
}
exports.updateProtocolTotalValueLockedUSD = updateProtocolTotalValueLockedUSD;
function updateUsageMetrics(event) {
  const protocol = (0, getters_1.getOrCreateYieldAggregator)();
  const usageMetricsDaily = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(
    event
  );
  const usageMetricsHourly = (0,
  getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
  usageMetricsDaily.blockNumber = event.block.number;
  usageMetricsHourly.blockNumber = event.block.number;
  usageMetricsDaily.timestamp = event.block.timestamp;
  usageMetricsHourly.timestamp = event.block.timestamp;
  usageMetricsDaily.dailyTransactionCount += constants_1.INT_ONE;
  usageMetricsHourly.hourlyTransactionCount += constants_1.INT_ONE;
  const from = event.transaction.from.toHexString();
  const dayId = (0, datetime_1.getDaysSinceEpoch)(
    event.block.timestamp.toI32()
  );
  const hourId = (0, datetime_1.getHoursSinceEpoch)(
    event.block.timestamp.toI32()
  );
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
function updateUsageMetricsAfterDeposit(event) {
  const usageMetricsDailySnapshot = (0,
  getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
  const usageMetricsHourlySnapshot = (0,
  getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
  usageMetricsDailySnapshot.dailyDepositCount += 1;
  usageMetricsHourlySnapshot.hourlyDepositCount += 1;
  usageMetricsDailySnapshot.save();
  usageMetricsHourlySnapshot.save();
}
exports.updateUsageMetricsAfterDeposit = updateUsageMetricsAfterDeposit;
function updateUsageMetricsAfterWithdraw(event) {
  const usageMetricsDailySnapshot = (0,
  getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
  const usageMetricsHourlySnapshot = (0,
  getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
  usageMetricsDailySnapshot.dailyWithdrawCount += 1;
  usageMetricsHourlySnapshot.hourlyWithdrawCount += 1;
  usageMetricsDailySnapshot.save();
  usageMetricsHourlySnapshot.save();
}
exports.updateUsageMetricsAfterWithdraw = updateUsageMetricsAfterWithdraw;
function updateFinancials(event) {
  const protocol = (0, getters_1.getOrCreateYieldAggregator)();
  const financialMetrics = (0, getters_1.getOrCreateFinancialDailySnapshots)(
    event
  );
  financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
  financialMetrics.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD;
  financialMetrics.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD;
  financialMetrics.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD;
  financialMetrics.blockNumber = event.block.number;
  financialMetrics.timestamp = event.block.timestamp;
  financialMetrics.save();
}
exports.updateFinancials = updateFinancials;
function updateVaultSnapshots(boosterAddr, poolId, event) {
  const vault = (0, getters_1.getOrCreateVault)(boosterAddr, poolId, event);
  if (!vault) return;
  const vaultDailySnapshots = (0, getters_1.getOrCreateVaultDailySnapshots)(
    vault.id,
    event
  );
  const vaultHourlySnapshots = (0, getters_1.getOrCreateVaultHourlySnapshots)(
    vault.id,
    event
  );
  vaultDailySnapshots.totalValueLockedUSD = vault.totalValueLockedUSD;
  vaultHourlySnapshots.totalValueLockedUSD = vault.totalValueLockedUSD;
  vaultDailySnapshots.inputTokenBalance = vault.inputTokenBalance;
  vaultHourlySnapshots.inputTokenBalance = vault.inputTokenBalance;
  vaultDailySnapshots.outputTokenSupply = vault.outputTokenSupply;
  vaultHourlySnapshots.outputTokenSupply = vault.outputTokenSupply;
  vaultDailySnapshots.outputTokenPriceUSD = vault.outputTokenPriceUSD;
  vaultHourlySnapshots.outputTokenPriceUSD = vault.outputTokenPriceUSD;
  vaultDailySnapshots.pricePerShare = vault.pricePerShare;
  vaultHourlySnapshots.pricePerShare = vault.pricePerShare;
  vaultDailySnapshots.rewardTokenEmissionsAmount =
    vault.rewardTokenEmissionsAmount;
  vaultHourlySnapshots.rewardTokenEmissionsAmount =
    vault.rewardTokenEmissionsAmount;
  vaultDailySnapshots.rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
  vaultHourlySnapshots.rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
  vaultDailySnapshots.cumulativeProtocolSideRevenueUSD =
    vault.cumulativeProtocolSideRevenueUSD;
  vaultHourlySnapshots.cumulativeProtocolSideRevenueUSD =
    vault.cumulativeProtocolSideRevenueUSD;
  vaultDailySnapshots.cumulativeSupplySideRevenueUSD =
    vault.cumulativeSupplySideRevenueUSD;
  vaultHourlySnapshots.cumulativeSupplySideRevenueUSD =
    vault.cumulativeSupplySideRevenueUSD;
  vaultDailySnapshots.cumulativeTotalRevenueUSD =
    vault.cumulativeTotalRevenueUSD;
  vaultHourlySnapshots.cumulativeTotalRevenueUSD =
    vault.cumulativeTotalRevenueUSD;
  vaultDailySnapshots.blockNumber = event.block.number;
  vaultHourlySnapshots.blockNumber = event.block.number;
  vaultDailySnapshots.timestamp = event.block.timestamp;
  vaultHourlySnapshots.timestamp = event.block.timestamp;
  vaultDailySnapshots.save();
  vaultHourlySnapshots.save();
}
exports.updateVaultSnapshots = updateVaultSnapshots;
function updateRevenue(boosterAddr, poolId, totalRevenueUSD, totalFees, event) {
  const protocolSideRevenueUSD = totalFees.times(totalRevenueUSD);
  const supplySideRevenueUSD =
    constants_1.BIGDECIMAL_ONE.minus(totalFees).times(totalRevenueUSD);
  const protocol = (0, getters_1.getOrCreateYieldAggregator)();
  const vault = (0, getters_1.getOrCreateVault)(boosterAddr, poolId, event);
  if (!vault) return;
  const financialMetrics = (0, getters_1.getOrCreateFinancialDailySnapshots)(
    event
  );
  const vaultDailySnapshot = (0, getters_1.getOrCreateVaultDailySnapshots)(
    vault.id,
    event
  );
  const vaultHourlySnapshot = (0, getters_1.getOrCreateVaultHourlySnapshots)(
    vault.id,
    event
  );
  protocol.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
  vault.cumulativeSupplySideRevenueUSD =
    vault.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
  financialMetrics.dailySupplySideRevenueUSD =
    financialMetrics.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
  vaultDailySnapshot.dailySupplySideRevenueUSD =
    vaultDailySnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
  vaultHourlySnapshot.hourlySupplySideRevenueUSD =
    vaultHourlySnapshot.hourlySupplySideRevenueUSD.plus(supplySideRevenueUSD);
  protocol.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  vault.cumulativeProtocolSideRevenueUSD =
    vault.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  financialMetrics.dailyProtocolSideRevenueUSD =
    financialMetrics.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  vaultDailySnapshot.dailyProtocolSideRevenueUSD =
    vaultDailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  vaultHourlySnapshot.hourlyProtocolSideRevenueUSD =
    vaultHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(
      protocolSideRevenueUSD
    );
  protocol.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD.plus(totalRevenueUSD);
  vault.cumulativeTotalRevenueUSD =
    vault.cumulativeTotalRevenueUSD.plus(totalRevenueUSD);
  financialMetrics.dailyTotalRevenueUSD =
    financialMetrics.dailyTotalRevenueUSD.plus(totalRevenueUSD);
  vaultDailySnapshot.dailyTotalRevenueUSD =
    vaultDailySnapshot.dailyTotalRevenueUSD.plus(totalRevenueUSD);
  vaultHourlySnapshot.hourlyTotalRevenueUSD =
    vaultHourlySnapshot.hourlyTotalRevenueUSD.plus(totalRevenueUSD);
  vaultHourlySnapshot.save();
  vaultDailySnapshot.save();
  vault.save();
  financialMetrics.save();
  protocol.save();
}
exports.updateRevenue = updateRevenue;
function updateRewards(boosterAddr, poolId, poolRewardsAddress, event) {
  const poolRewardsContract =
    BaseRewardPool_1.BaseRewardPool.bind(poolRewardsAddress);
  const rewardTokenAddr = graph_ts_1.Address.fromString(
    configure_1.NetworkConfigs.getRewardToken()
  );
  let balRewardRate = constants_1.BIGINT_ZERO;
  const periodFinishCall = poolRewardsContract.try_periodFinish();
  if (
    !periodFinishCall.reverted &&
    periodFinishCall.value >= event.block.timestamp
  ) {
    balRewardRate = (0, ethereum_1.readValue)(
      poolRewardsContract.try_rewardRate(),
      constants_1.BIGINT_ZERO
    );
  }
  const auraRewardRate = (0, rewards_1.getAuraMintAmount)(
    rewardTokenAddr,
    balRewardRate
  );
  const rewardsPerDay = (0, rewards_1.getRewardsPerDay)(
    event.block.timestamp,
    event.block.number,
    auraRewardRate,
    constants_1.RewardIntervalType.TIMESTAMP
  );
  const vault = (0, getters_1.getOrCreateVault)(boosterAddr, poolId, event);
  if (!vault) return;
  const rewardToken = (0, getters_1.getOrCreateToken)(
    rewardTokenAddr,
    event.block.number
  );
  vault.rewardTokenEmissionsAmount = [
    (0, numbers_1.bigDecimalToBigInt)(rewardsPerDay),
  ];
  vault.rewardTokenEmissionsUSD = [
    (0, numbers_1.bigIntToBigDecimal)(
      vault.rewardTokenEmissionsAmount[0],
      rewardToken.decimals
    ).times(rewardToken.lastPriceUSD),
  ];
  vault.save();
}
exports.updateRewards = updateRewards;
