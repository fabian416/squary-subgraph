"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePoolDailySnapshot =
  exports.updatePoolHourlySnapshot =
  exports.updateUsageMetricsDailySnapshot =
  exports.updateUsageMetricsHourlySnapshot =
  exports.updateFinancialsDailySnapshot =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const getters_1 = require("./getters");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
function updateFinancialsDailySnapshot(tokenAddress, isDeposit, amount, event) {
  const day = (0, utils_1.getDaysSinceEpoch)(event.block.timestamp.toI32());
  const snapshot = (0, getters_1.getOrCreateFinancialsDailySnapshot)(
    day,
    event.block
  );
  const protocol = (0, getters_1.getOrCreateProtocol)();
  const token = (0, getters_1.getOrCreateToken)(tokenAddress, event);
  const amountUSD = (0, utils_1.bigIntToBigDecimal)(
    amount,
    token.decimals
  ).times(token.lastPriceUSD);
  snapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
  snapshot.cumulativeDepositVolumeUSD = protocol.cumulativeDepositVolumeUSD;
  snapshot.cumulativeWithdrawalVolumeUSD =
    protocol.cumulativeWithdrawalVolumeUSD;
  snapshot.cumulativeTotalVolumeUSD = protocol.cumulativeTotalVolumeUSD;
  snapshot.netVolumeUSD = protocol.netVolumeUSD;
  if (isDeposit) {
    snapshot.dailyDepositVolumeUSD =
      snapshot.dailyDepositVolumeUSD.plus(amountUSD);
  } else {
    snapshot.dailyWithdrawalVolumeUSD =
      snapshot.dailyWithdrawalVolumeUSD.plus(amountUSD);
  }
  snapshot.dailyTotalVolumeUSD = snapshot.dailyDepositVolumeUSD.plus(
    snapshot.dailyWithdrawalVolumeUSD
  );
  snapshot.dailyNetVolumeUSD = snapshot.dailyDepositVolumeUSD.minus(
    snapshot.dailyWithdrawalVolumeUSD
  );
  snapshot.timestamp = event.block.timestamp;
  snapshot.blockNumber = event.block.number;
  (0, utils_1.fillInMissingFinancialsDailySnapshots)(day);
  snapshot.save();
}
exports.updateFinancialsDailySnapshot = updateFinancialsDailySnapshot;
function updateUsageMetricsHourlySnapshot(accountAddress, event) {
  const hour = (0, utils_1.getHoursSinceEpoch)(event.block.timestamp.toI32());
  const snapshot = (0, getters_1.getOrCreateUsageMetricsHourlySnapshot)(
    hour,
    event.block
  );
  const protocol = (0, getters_1.getOrCreateProtocol)();
  const id = graph_ts_1.Bytes.empty()
    .concat(graph_ts_1.Bytes.fromUTF8("hourly"))
    .concat(graph_ts_1.Bytes.fromI32(hour))
    .concat(graph_ts_1.Bytes.fromUTF8("-"))
    .concat(accountAddress);
  const account = (0, getters_1.getOrCreateActiveAccount)(id);
  if (!account.deposits.length && !account.withdraws.length) {
    snapshot.hourlyActiveUsers += constants_1.INT_ONE;
  }
  snapshot.hourlyTransactionCount += constants_1.INT_ONE;
  snapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  snapshot.timestamp = event.block.timestamp;
  snapshot.blockNumber = event.block.number;
  snapshot.save();
}
exports.updateUsageMetricsHourlySnapshot = updateUsageMetricsHourlySnapshot;
function updateUsageMetricsDailySnapshot(
  accountAddress,
  isDeposit,
  eventID,
  event
) {
  const day = (0, utils_1.getDaysSinceEpoch)(event.block.timestamp.toI32());
  const snapshot = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(
    day,
    event.block
  );
  const protocol = (0, getters_1.getOrCreateProtocol)();
  snapshot.cumulativeUniqueDepositors = protocol.cumulativeUniqueDepositors;
  snapshot.cumulativeUniqueWithdrawers = protocol.cumulativeUniqueWithdrawers;
  snapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  snapshot.cumulativeDepositCount = protocol.cumulativeDepositCount;
  snapshot.cumulativeWithdrawalCount = protocol.cumulativeWithdrawalCount;
  snapshot.cumulativeTransactionCount = protocol.cumulativeTransactionCount;
  snapshot.totalPoolCount = protocol.totalPoolCount;
  const id = graph_ts_1.Bytes.empty()
    .concat(graph_ts_1.Bytes.fromUTF8("daily"))
    .concat(graph_ts_1.Bytes.fromI32(day))
    .concat(graph_ts_1.Bytes.fromUTF8("-"))
    .concat(accountAddress);
  const account = (0, getters_1.getOrCreateActiveAccount)(id);
  if (!account.deposits.length && !account.withdraws.length) {
    snapshot.dailyActiveUsers += constants_1.INT_ONE;
  }
  if (isDeposit) {
    if (!account.deposits.length) {
      snapshot.dailyActiveDepositors += constants_1.INT_ONE;
    }
    account.deposits = (0, utils_1.addToArrayAtIndex)(
      account.deposits,
      eventID
    );
    snapshot.dailyDepositCount += constants_1.INT_ONE;
  } else {
    if (!account.withdraws.length) {
      snapshot.dailyActiveWithdrawers += constants_1.INT_ONE;
    }
    account.withdraws = (0, utils_1.addToArrayAtIndex)(
      account.withdraws,
      eventID
    );
    snapshot.dailyWithdrawalCount += constants_1.INT_ONE;
  }
  snapshot.dailyTransactionCount += constants_1.INT_ONE;
  snapshot.timestamp = event.block.timestamp;
  snapshot.blockNumber = event.block.number;
  (0, utils_1.fillInMissingUsageMetricsDailySnapshots)(day);
  snapshot.save();
  account.save();
}
exports.updateUsageMetricsDailySnapshot = updateUsageMetricsDailySnapshot;
function updatePoolHourlySnapshot(poolAddress, event) {
  const hour = (0, utils_1.getHoursSinceEpoch)(event.block.timestamp.toI32());
  const snapshot = (0, getters_1.getOrCreatePoolHourlySnapshot)(
    poolAddress,
    hour,
    event.block
  );
  const pool = (0, getters_1.getPool)(poolAddress);
  snapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
  snapshot.inputTokenBalances = pool.inputTokenBalances;
  snapshot.inputTokenBalancesUSD = pool.inputTokenBalancesUSD;
  snapshot.timestamp = event.block.timestamp;
  snapshot.blockNumber = event.block.number;
  snapshot.save();
}
exports.updatePoolHourlySnapshot = updatePoolHourlySnapshot;
function updatePoolDailySnapshot(
  poolAddress,
  tokenAddress,
  isDeposit,
  amount,
  event
) {
  const day = (0, utils_1.getDaysSinceEpoch)(event.block.timestamp.toI32());
  const snapshot = (0, getters_1.getOrCreatePoolDailySnapshot)(
    poolAddress,
    day,
    event.block
  );
  const pool = (0, getters_1.getPool)(poolAddress);
  const token = (0, getters_1.getOrCreateToken)(tokenAddress, event);
  snapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
  snapshot.inputTokenBalances = pool.inputTokenBalances;
  snapshot.inputTokenBalancesUSD = pool.inputTokenBalancesUSD;
  snapshot.cumulativeDepositVolumeAmount = pool.cumulativeDepositVolumeAmount;
  snapshot.cumulativeDepositVolumeUSD = pool.cumulativeDepositVolumeUSD;
  snapshot.cumulativeWithdrawalVolumeAmount =
    pool.cumulativeWithdrawalVolumeAmount;
  snapshot.cumulativeWithdrawalVolumeUSD = pool.cumulativeWithdrawalVolumeUSD;
  snapshot.cumulativeTotalVolumeAmount = pool.cumulativeTotalVolumeAmount;
  snapshot.cumulativeTotalVolumeUSD = pool.cumulativeTotalVolumeUSD;
  snapshot.netVolumeAmount = pool.netVolumeAmount;
  snapshot.netVolumeUSD = pool.netVolumeUSD;
  snapshot.cumulativeUniqueDepositors = pool.cumulativeUniqueDepositors;
  snapshot.cumulativeUniqueWithdrawers = pool.cumulativeUniqueWithdrawers;
  snapshot.cumulativeDepositCount = pool.cumulativeDepositCount;
  snapshot.cumulativeWithdrawalCount = pool.cumulativeWithdrawalCount;
  snapshot.cumulativeTransactionCount = pool.cumulativeTransactionCount;
  if (isDeposit) {
    snapshot.dailyDepositVolumeAmount =
      snapshot.dailyDepositVolumeAmount.plus(amount);
    snapshot.dailyDepositVolumeUSD = (0, utils_1.bigIntToBigDecimal)(
      snapshot.dailyDepositVolumeAmount
    ).times(token.lastPriceUSD);
    snapshot.dailyDepositCount += constants_1.INT_ONE;
  } else {
    snapshot.dailyWithdrawalVolumeAmount =
      snapshot.dailyWithdrawalVolumeAmount.plus(amount);
    snapshot.dailyWithdrawalVolumeUSD = (0, utils_1.bigIntToBigDecimal)(
      snapshot.dailyWithdrawalVolumeAmount
    ).times(token.lastPriceUSD);
    snapshot.dailyWithdrawalCount += constants_1.INT_ONE;
  }
  snapshot.dailyTotalVolumeAmount = snapshot.dailyDepositVolumeAmount.plus(
    snapshot.dailyWithdrawalVolumeAmount
  );
  snapshot.dailyTotalVolumeUSD = snapshot.dailyDepositVolumeUSD.plus(
    snapshot.dailyWithdrawalVolumeUSD
  );
  snapshot.dailyNetVolumeAmount = snapshot.dailyDepositVolumeAmount.minus(
    snapshot.dailyWithdrawalVolumeAmount
  );
  snapshot.dailyNetVolumeUSD = snapshot.dailyDepositVolumeUSD.minus(
    snapshot.dailyWithdrawalVolumeUSD
  );
  snapshot.dailyTransactionCount += constants_1.INT_ONE;
  snapshot.timestamp = event.block.timestamp;
  snapshot.blockNumber = event.block.number;
  (0, utils_1.fillInMissingPoolDailySnapshots)(poolAddress, day);
  snapshot.save();
}
exports.updatePoolDailySnapshot = updatePoolDailySnapshot;
