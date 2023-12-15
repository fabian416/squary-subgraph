"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillInMissingFinancialsDailySnapshots =
  exports.findPreviousFinancialsDailySnapshot =
  exports.fillInMissingUsageMetricsDailySnapshots =
  exports.findPreviousUsageMetricsDailySnapshot =
  exports.fillInMissingPoolDailySnapshots =
  exports.findPreviousPoolDailySnapshot =
  exports.accountArraySort =
  exports.updateArrayAtIndex =
  exports.removeFromArrayAtIndex =
  exports.addToArrayAtIndex =
  exports.bigIntToBigDecimal =
  exports.getDaysSinceEpoch =
  exports.getHoursSinceEpoch =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const getters_1 = require("./getters");
const schema_1 = require("../../generated/schema");
function getHoursSinceEpoch(secondsSinceEpoch) {
  return Math.floor(secondsSinceEpoch / constants_1.SECONDS_PER_HOUR);
}
exports.getHoursSinceEpoch = getHoursSinceEpoch;
function getDaysSinceEpoch(secondsSinceEpoch) {
  return Math.floor(secondsSinceEpoch / constants_1.SECONDS_PER_DAY);
}
exports.getDaysSinceEpoch = getDaysSinceEpoch;
function bigIntToBigDecimal(quantity, decimals = constants_1.ETH_DECIMALS) {
  return quantity.divDecimal(
    constants_1.BIGINT_TEN.pow(decimals).toBigDecimal()
  );
}
exports.bigIntToBigDecimal = bigIntToBigDecimal;
function addToArrayAtIndex(x, item, index = -1) {
  if (x.length == 0) {
    return [item];
  }
  if (index == -1 || index > x.length) {
    index = x.length;
  }
  const retval = new Array();
  let i = 0;
  while (i < index) {
    retval.push(x[i]);
    i += 1;
  }
  retval.push(item);
  while (i < x.length) {
    retval.push(x[i]);
    i += 1;
  }
  return retval;
}
exports.addToArrayAtIndex = addToArrayAtIndex;
function removeFromArrayAtIndex(x, index) {
  const retval = new Array(x.length - 1);
  let nI = 0;
  for (let i = 0; i < x.length; i++) {
    if (i != index) {
      retval[nI] = x[i];
      nI += 1;
    }
  }
  return retval;
}
exports.removeFromArrayAtIndex = removeFromArrayAtIndex;
function updateArrayAtIndex(x, item, index) {
  if (x.length == 0) {
    return [item];
  }
  if (index == -1 || index > x.length) {
    index = x.length;
  }
  const retval = new Array();
  let i = 0;
  while (i < index) {
    retval.push(x[i]);
    i += 1;
  }
  retval.push(item);
  i += 1;
  while (i < x.length) {
    retval.push(x[i]);
    i += 1;
  }
  return retval;
}
exports.updateArrayAtIndex = updateArrayAtIndex;
function accountArraySort(
  pools,
  poolBalance,
  poolBalanceUSD,
  _hasWithdrawnFromPool
) {
  if (
    pools.length != poolBalance.length ||
    pools.length != poolBalanceUSD.length ||
    pools.length != _hasWithdrawnFromPool.length
  ) {
    return;
  }
  const sorter = [];
  for (let i = 0; i < pools.length; i++) {
    sorter[i] = [
      pools[i].toHexString(),
      poolBalance[i].toString(),
      poolBalanceUSD[i].toString(),
      _hasWithdrawnFromPool[i].toString(),
    ];
  }
  sorter.sort(function (a, b) {
    if (a[0] < b[0]) {
      return -1;
    }
    return 1;
  });
  for (let i = 0; i < sorter.length; i++) {
    pools[i] = graph_ts_1.Bytes.fromHexString(sorter[i][0]);
    poolBalance[i] = graph_ts_1.BigInt.fromString(sorter[i][1]);
    poolBalanceUSD[i] = graph_ts_1.BigDecimal.fromString(sorter[i][2]);
    _hasWithdrawnFromPool[i] = sorter[i][3] == "true";
  }
}
exports.accountArraySort = accountArraySort;
function findPreviousPoolDailySnapshot(poolAddress, currentSnapshotDay) {
  let previousDay = currentSnapshotDay - 1;
  let previousId = graph_ts_1.Bytes.empty()
    .concat(poolAddress)
    .concat(graph_ts_1.Bytes.fromUTF8("-"))
    .concat(graph_ts_1.Bytes.fromI32(previousDay));
  let previousSnapshot = schema_1.PoolDailySnapshot.load(previousId);
  while (!previousSnapshot && previousDay > 0) {
    previousDay--;
    previousId = graph_ts_1.Bytes.empty()
      .concat(poolAddress)
      .concat(graph_ts_1.Bytes.fromUTF8("-"))
      .concat(graph_ts_1.Bytes.fromI32(previousDay));
    previousSnapshot = schema_1.PoolDailySnapshot.load(previousId);
  }
  return previousSnapshot;
}
exports.findPreviousPoolDailySnapshot = findPreviousPoolDailySnapshot;
function fillInMissingPoolDailySnapshots(poolAddress, currentSnapshotDay) {
  const previousSnapshot = findPreviousPoolDailySnapshot(
    poolAddress,
    currentSnapshotDay
  );
  if (previousSnapshot) {
    let counter = 1;
    for (let i = previousSnapshot.day + 1; i < currentSnapshotDay; i++) {
      const snapshot = (0, getters_1.getOrCreatePoolDailySnapshot)(
        poolAddress,
        i
      );
      snapshot.totalValueLockedUSD = previousSnapshot.totalValueLockedUSD;
      snapshot.inputTokenBalances = previousSnapshot.inputTokenBalances;
      snapshot.inputTokenBalancesUSD = previousSnapshot.inputTokenBalancesUSD;
      snapshot.cumulativeDepositVolumeAmount =
        previousSnapshot.cumulativeDepositVolumeAmount;
      snapshot.cumulativeDepositVolumeUSD =
        previousSnapshot.cumulativeDepositVolumeUSD;
      snapshot.cumulativeWithdrawalVolumeAmount =
        previousSnapshot.cumulativeWithdrawalVolumeAmount;
      snapshot.cumulativeWithdrawalVolumeUSD =
        previousSnapshot.cumulativeWithdrawalVolumeUSD;
      snapshot.cumulativeTotalVolumeAmount =
        previousSnapshot.cumulativeTotalVolumeAmount;
      snapshot.cumulativeTotalVolumeUSD =
        previousSnapshot.cumulativeTotalVolumeUSD;
      snapshot.netVolumeAmount = previousSnapshot.netVolumeAmount;
      snapshot.netVolumeUSD = previousSnapshot.netVolumeUSD;
      snapshot.cumulativeUniqueDepositors =
        previousSnapshot.cumulativeUniqueDepositors;
      snapshot.cumulativeUniqueWithdrawers =
        previousSnapshot.cumulativeUniqueWithdrawers;
      snapshot.cumulativeDepositCount = previousSnapshot.cumulativeDepositCount;
      snapshot.cumulativeWithdrawalCount =
        previousSnapshot.cumulativeWithdrawalCount;
      snapshot.cumulativeTransactionCount =
        previousSnapshot.cumulativeTransactionCount;
      snapshot.timestamp = previousSnapshot.timestamp.plus(
        graph_ts_1.BigInt.fromI32(counter * constants_1.SECONDS_PER_DAY)
      );
      snapshot.blockNumber = previousSnapshot.blockNumber.plus(
        graph_ts_1.BigInt.fromI32(
          counter * constants_1.ETHEREUM_AVG_BLOCKS_PER_DAY
        )
      );
      counter++;
      snapshot.save();
    }
  }
}
exports.fillInMissingPoolDailySnapshots = fillInMissingPoolDailySnapshots;
function findPreviousUsageMetricsDailySnapshot(currentSnapshotDay) {
  let previousDay = currentSnapshotDay - 1;
  let previousId = graph_ts_1.Bytes.fromI32(previousDay);
  let previousSnapshot = schema_1.UsageMetricsDailySnapshot.load(previousId);
  while (!previousSnapshot && previousDay > 0) {
    previousDay--;
    previousId = graph_ts_1.Bytes.fromI32(previousDay);
    previousSnapshot = schema_1.UsageMetricsDailySnapshot.load(previousId);
  }
  return previousSnapshot;
}
exports.findPreviousUsageMetricsDailySnapshot =
  findPreviousUsageMetricsDailySnapshot;
function fillInMissingUsageMetricsDailySnapshots(currentSnapshotDay) {
  const previousSnapshot =
    findPreviousUsageMetricsDailySnapshot(currentSnapshotDay);
  if (previousSnapshot) {
    let counter = 1;
    for (let i = previousSnapshot.day + 1; i < currentSnapshotDay; i++) {
      const snapshot = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(i);
      snapshot.cumulativeUniqueDepositors =
        previousSnapshot.cumulativeUniqueDepositors;
      snapshot.cumulativeUniqueWithdrawers =
        previousSnapshot.cumulativeUniqueWithdrawers;
      snapshot.cumulativeUniqueUsers = previousSnapshot.cumulativeUniqueUsers;
      snapshot.cumulativeDepositCount = previousSnapshot.cumulativeDepositCount;
      snapshot.cumulativeWithdrawalCount =
        previousSnapshot.cumulativeWithdrawalCount;
      snapshot.cumulativeTransactionCount =
        previousSnapshot.cumulativeTransactionCount;
      snapshot.totalPoolCount = previousSnapshot.totalPoolCount;
      snapshot.timestamp = previousSnapshot.timestamp.plus(
        graph_ts_1.BigInt.fromI32(counter * constants_1.SECONDS_PER_DAY)
      );
      snapshot.blockNumber = previousSnapshot.blockNumber.plus(
        graph_ts_1.BigInt.fromI32(
          counter * constants_1.ETHEREUM_AVG_BLOCKS_PER_DAY
        )
      );
      counter++;
      snapshot.save();
    }
  }
}
exports.fillInMissingUsageMetricsDailySnapshots =
  fillInMissingUsageMetricsDailySnapshots;
function findPreviousFinancialsDailySnapshot(currentSnapshotDay) {
  let previousDay = currentSnapshotDay - 1;
  let previousId = graph_ts_1.Bytes.fromI32(previousDay);
  let previousSnapshot = schema_1.FinancialsDailySnapshot.load(previousId);
  while (!previousSnapshot && previousDay > 0) {
    previousDay--;
    previousId = graph_ts_1.Bytes.fromI32(previousDay);
    previousSnapshot = schema_1.FinancialsDailySnapshot.load(previousId);
  }
  return previousSnapshot;
}
exports.findPreviousFinancialsDailySnapshot =
  findPreviousFinancialsDailySnapshot;
function fillInMissingFinancialsDailySnapshots(currentSnapshotDay) {
  const previousSnapshot =
    findPreviousFinancialsDailySnapshot(currentSnapshotDay);
  if (previousSnapshot) {
    let counter = 1;
    for (let i = previousSnapshot.day + 1; i < currentSnapshotDay; i++) {
      const snapshot = (0, getters_1.getOrCreateFinancialsDailySnapshot)(i);
      snapshot.totalValueLockedUSD = previousSnapshot.totalValueLockedUSD;
      snapshot.cumulativeDepositVolumeUSD =
        previousSnapshot.cumulativeDepositVolumeUSD;
      snapshot.cumulativeWithdrawalVolumeUSD =
        previousSnapshot.cumulativeWithdrawalVolumeUSD;
      snapshot.cumulativeTotalVolumeUSD =
        previousSnapshot.cumulativeTotalVolumeUSD;
      snapshot.netVolumeUSD = previousSnapshot.netVolumeUSD;
      snapshot.timestamp = previousSnapshot.timestamp.plus(
        graph_ts_1.BigInt.fromI32(counter * constants_1.SECONDS_PER_DAY)
      );
      snapshot.blockNumber = previousSnapshot.blockNumber.plus(
        graph_ts_1.BigInt.fromI32(
          counter * constants_1.ETHEREUM_AVG_BLOCKS_PER_DAY
        )
      );
      counter++;
      snapshot.save();
    }
  }
}
exports.fillInMissingFinancialsDailySnapshots =
  fillInMissingFinancialsDailySnapshots;
