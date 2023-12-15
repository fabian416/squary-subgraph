"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDailyFinancialSnapshot =
  exports.updateDailyFinancialSnapshot =
  exports.updateUsageMetricsHourlySnapshot =
  exports.updateUsageMetricsDailySnapshot =
  exports.getProtocolHourlyId =
  exports.getProtocolDailyId =
    void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../prices/common/constants");
const time_1 = require("./time");
function getProtocolDailyId(block, protocol) {
  const daysSinceEpoch = (0, time_1.getDaysSinceEpoch)(
    block.timestamp.toI32()
  ).toString();
  const id = protocol.id.concat("-").concat(daysSinceEpoch);
  return id;
}
exports.getProtocolDailyId = getProtocolDailyId;
function getProtocolHourlyId(block, protocol) {
  const daysSinceEpoch = (0, time_1.getHoursSinceEpoch)(
    block.timestamp.toI32()
  );
  const id = protocol.id.concat("-").concat(daysSinceEpoch.toString());
  return id;
}
exports.getProtocolHourlyId = getProtocolHourlyId;
function updateUsageMetricsDailySnapshot(event, protocol, deposit, withdraw) {
  const id = getProtocolDailyId(event.block, protocol);
  let protocolDailySnapshot = schema_1.UsageMetricsDailySnapshot.load(id);
  if (protocolDailySnapshot == null) {
    protocolDailySnapshot = new schema_1.UsageMetricsDailySnapshot(id);
    protocolDailySnapshot.protocol = protocol.id;
    protocolDailySnapshot.dailyActiveUsers = isNewDailyActiveUser(
      event.transaction.from,
      event.block
    );
    protocolDailySnapshot.cumulativeUniqueUsers =
      protocol.cumulativeUniqueUsers;
    protocolDailySnapshot.dailyTransactionCount =
      deposit || withdraw ? constants_1.BIGINT_ONE : constants_1.BIGINT_ZERO;
    protocolDailySnapshot.dailyDepositCount = deposit
      ? constants_1.BIGINT_ONE
      : constants_1.BIGINT_ZERO;
    protocolDailySnapshot.dailyWithdrawCount = withdraw
      ? constants_1.BIGINT_ONE
      : constants_1.BIGINT_ZERO;
    protocolDailySnapshot.blockNumber = event.block.number;
    protocolDailySnapshot.timestamp = event.block.timestamp;
    protocolDailySnapshot.save();
  } else {
    protocolDailySnapshot.dailyActiveUsers =
      protocolDailySnapshot.dailyActiveUsers.plus(
        isNewDailyActiveUser(event.transaction.from, event.block)
      );
    protocolDailySnapshot.cumulativeUniqueUsers =
      protocol.cumulativeUniqueUsers;
    protocolDailySnapshot.dailyTransactionCount =
      deposit || withdraw
        ? protocolDailySnapshot.dailyTransactionCount.plus(
            constants_1.BIGINT_ONE
          )
        : protocolDailySnapshot.dailyTransactionCount;
    protocolDailySnapshot.dailyDepositCount = deposit
      ? protocolDailySnapshot.dailyDepositCount.plus(constants_1.BIGINT_ONE)
      : protocolDailySnapshot.dailyDepositCount;
    protocolDailySnapshot.dailyWithdrawCount = withdraw
      ? protocolDailySnapshot.dailyWithdrawCount.plus(constants_1.BIGINT_ONE)
      : protocolDailySnapshot.dailyWithdrawCount;
    protocolDailySnapshot.blockNumber = event.block.number;
    protocolDailySnapshot.timestamp = event.block.timestamp;
    protocolDailySnapshot.save();
  }
  return protocolDailySnapshot;
}
exports.updateUsageMetricsDailySnapshot = updateUsageMetricsDailySnapshot;
function updateUsageMetricsHourlySnapshot(event, protocol, deposit, withdraw) {
  const id = getProtocolHourlyId(event.block, protocol);
  let protocolHourlySnapshot = schema_1.UsageMetricsHourlySnapshot.load(id);
  if (protocolHourlySnapshot == null) {
    protocolHourlySnapshot = new schema_1.UsageMetricsHourlySnapshot(id);
    protocolHourlySnapshot.protocol = protocol.id;
    protocolHourlySnapshot.hourlyActiveUsers = isNewHourlyActiveUser(
      event.transaction.from,
      event.block
    );
    protocolHourlySnapshot.cumulativeUniqueUsers =
      protocol.cumulativeUniqueUsers;
    protocolHourlySnapshot.hourlyTransactionCount =
      deposit || withdraw ? constants_1.BIGINT_ONE : constants_1.BIGINT_ZERO;
    protocolHourlySnapshot.hourlyDepositCount = deposit
      ? constants_1.BIGINT_ONE
      : constants_1.BIGINT_ZERO;
    protocolHourlySnapshot.hourlyWithdrawCount = withdraw
      ? constants_1.BIGINT_ONE
      : constants_1.BIGINT_ZERO;
    protocolHourlySnapshot.blockNumber = event.block.number;
    protocolHourlySnapshot.timestamp = event.block.timestamp;
    protocolHourlySnapshot.save();
  } else {
    protocolHourlySnapshot.hourlyActiveUsers =
      protocolHourlySnapshot.hourlyActiveUsers.plus(
        isNewHourlyActiveUser(event.transaction.from, event.block)
      );
    protocolHourlySnapshot.cumulativeUniqueUsers =
      protocol.cumulativeUniqueUsers;
    protocolHourlySnapshot.hourlyTransactionCount =
      deposit || withdraw
        ? protocolHourlySnapshot.hourlyTransactionCount.plus(
            constants_1.BIGINT_ONE
          )
        : protocolHourlySnapshot.hourlyTransactionCount;
    protocolHourlySnapshot.hourlyDepositCount = deposit
      ? protocolHourlySnapshot.hourlyDepositCount.plus(constants_1.BIGINT_ONE)
      : protocolHourlySnapshot.hourlyDepositCount;
    protocolHourlySnapshot.hourlyWithdrawCount = withdraw
      ? protocolHourlySnapshot.hourlyWithdrawCount.plus(constants_1.BIGINT_ONE)
      : protocolHourlySnapshot.hourlyWithdrawCount;
    protocolHourlySnapshot.blockNumber = event.block.number;
    protocolHourlySnapshot.timestamp = event.block.timestamp;
    protocolHourlySnapshot.save();
  }
  return protocolHourlySnapshot;
}
exports.updateUsageMetricsHourlySnapshot = updateUsageMetricsHourlySnapshot;
function updateDailyFinancialSnapshot(block, protocol) {
  const id = getProtocolDailyId(block, protocol);
  let dailyFinancialSnapshot = schema_1.FinancialsDailySnapshot.load(id);
  if (!dailyFinancialSnapshot) {
    dailyFinancialSnapshot = createDailyFinancialSnapshot(block, protocol);
  }
  dailyFinancialSnapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
  dailyFinancialSnapshot.protocolControlledValueUSD =
    protocol.protocolControlledValueUSD;
  dailyFinancialSnapshot.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD;
  dailyFinancialSnapshot.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD;
  dailyFinancialSnapshot.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD;
  const previousSnapshot = findPreviousFinancialSnapshot(block);
  if (previousSnapshot) {
    dailyFinancialSnapshot.dailySupplySideRevenueUSD =
      protocol.cumulativeSupplySideRevenueUSD.minus(
        previousSnapshot.cumulativeSupplySideRevenueUSD
      );
    dailyFinancialSnapshot.dailyProtocolSideRevenueUSD =
      protocol.cumulativeProtocolSideRevenueUSD.minus(
        previousSnapshot.cumulativeProtocolSideRevenueUSD
      );
    dailyFinancialSnapshot.dailyTotalRevenueUSD =
      protocol.cumulativeTotalRevenueUSD.minus(
        previousSnapshot.cumulativeTotalRevenueUSD
      );
  } else {
    dailyFinancialSnapshot.dailySupplySideRevenueUSD =
      protocol.cumulativeSupplySideRevenueUSD;
    dailyFinancialSnapshot.dailyProtocolSideRevenueUSD =
      protocol.cumulativeProtocolSideRevenueUSD;
    dailyFinancialSnapshot.dailyTotalRevenueUSD =
      protocol.cumulativeTotalRevenueUSD;
  }
  dailyFinancialSnapshot.blockNumber = block.number;
  dailyFinancialSnapshot.timestamp = block.timestamp;
  dailyFinancialSnapshot.save();
  return dailyFinancialSnapshot;
}
exports.updateDailyFinancialSnapshot = updateDailyFinancialSnapshot;
function createDailyFinancialSnapshot(block, protocol) {
  const id = getProtocolDailyId(block, protocol);
  const dailyFinancialSnapshot = new schema_1.FinancialsDailySnapshot(id);
  dailyFinancialSnapshot.protocol = protocol.id;
  dailyFinancialSnapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
  dailyFinancialSnapshot.protocolControlledValueUSD =
    dailyFinancialSnapshot.protocolControlledValueUSD;
  dailyFinancialSnapshot.dailySupplySideRevenueUSD =
    constants_1.BIGDECIMAL_ZERO;
  dailyFinancialSnapshot.dailyProtocolSideRevenueUSD =
    constants_1.BIGDECIMAL_ZERO;
  dailyFinancialSnapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  dailyFinancialSnapshot.cumulativeSupplySideRevenueUSD =
    constants_1.BIGDECIMAL_ZERO;
  dailyFinancialSnapshot.cumulativeProtocolSideRevenueUSD =
    constants_1.BIGDECIMAL_ZERO;
  dailyFinancialSnapshot.cumulativeTotalRevenueUSD =
    constants_1.BIGDECIMAL_ZERO;
  dailyFinancialSnapshot.blockNumber = block.number;
  dailyFinancialSnapshot.timestamp = block.timestamp;
  dailyFinancialSnapshot.save();
  return dailyFinancialSnapshot;
}
exports.createDailyFinancialSnapshot = createDailyFinancialSnapshot;
function isNewDailyActiveUser(user, block) {
  const id =
    "daily-" +
    user.toHexString() +
    (0, time_1.getDaysSinceEpoch)(block.timestamp.toI32()).toString();
  let userEntity = schema_1.ActiveUser.load(id);
  if (userEntity == null) {
    userEntity = new schema_1.ActiveUser(id);
    userEntity.save();
    return constants_1.BIGINT_ONE;
  } else {
    return constants_1.BIGINT_ZERO;
  }
}
function isNewHourlyActiveUser(user, block) {
  const id =
    "hourly-" +
    user.toHexString() +
    (0, time_1.getHoursSinceEpoch)(block.timestamp.toI32()).toString();
  let userEntity = schema_1.ActiveUser.load(id);
  if (userEntity == null) {
    userEntity = new schema_1.ActiveUser(id);
    userEntity.save();
    return constants_1.BIGINT_ONE;
  } else {
    return constants_1.BIGINT_ZERO;
  }
}
function findPreviousFinancialSnapshot(block) {
  let day = (0, time_1.getDaysSinceEpoch)(block.timestamp.toI32()) - 1;
  let previousSnapshot = schema_1.FinancialsDailySnapshot.load(
    constants_1.PROTOCOL_ID.concat("-").concat(day.toString())
  );
  while (!previousSnapshot && day > 0) {
    day--;
    previousSnapshot = schema_1.FinancialsDailySnapshot.load(
      constants_1.PROTOCOL_ID.concat("-").concat(day.toString())
    );
  }
  return previousSnapshot;
}
