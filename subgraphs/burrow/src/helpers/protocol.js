"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateFinancialDailySnapshot =
  exports.getOrCreateUsageMetricsHourlySnapshot =
  exports.getOrCreateUsageMetricsDailySnapshot =
  exports.getOrCreateProtocol =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const const_1 = require("../utils/const");
const versions_1 = require("../versions");
function getOrCreateProtocol() {
  let protocol = schema_1.LendingProtocol.load(
    graph_ts_1.dataSource.address().toString()
  );
  if (!protocol) {
    protocol = new schema_1.LendingProtocol(
      graph_ts_1.dataSource.address().toString()
    );
    protocol.name = const_1.PROTOCOL_NAME;
    protocol.slug = const_1.PROTOCOL_SLUG;
    protocol.network = const_1.Network.NEAR_MAINNET;
    protocol.type = const_1.ProtocolType.LENDING;
    protocol.lendingType = const_1.LendingType.POOLED;
    protocol.riskType = const_1.RiskType.GLOBAL;
    protocol.totalValueLockedUSD = const_1.BD_ZERO;
    protocol.totalDepositBalanceUSD = const_1.BD_ZERO;
    protocol.totalBorrowBalanceUSD = const_1.BD_ZERO;
    protocol.cumulativeDepositUSD = const_1.BD_ZERO;
    protocol.cumulativeBorrowUSD = const_1.BD_ZERO;
    protocol.cumulativeLiquidateUSD = const_1.BD_ZERO;
    protocol.cumulativeUniqueUsers = 0;
    protocol.cumulativeUniqueDepositors = 0;
    protocol.cumulativeUniqueBorrowers = 0;
    protocol.cumulativeUniqueLiquidators = 0;
    protocol.cumulativeUniqueLiquidatees = 0;
    protocol.cumulativeSupplySideRevenueUSD = const_1.BD_ZERO;
    protocol.cumulativeProtocolSideRevenueUSD = const_1.BD_ZERO;
    protocol.cumulativeTotalRevenueUSD = const_1.BD_ZERO;
    protocol.totalPoolCount = 0;
    protocol.openPositionCount = 0;
    protocol.cumulativePositionCount = 0;
    protocol._oracle = "";
    protocol._maxAssets = 0;
    protocol._booster = "";
    protocol._boosterMultiplier = (0, const_1.BI)("0");
    protocol._owner = "";
    protocol._marketIds = [];
  }
  protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
  protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
  protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
  protocol.save();
  return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
function getOrCreateUsageMetricsDailySnapshot(receipt) {
  const timestamp = (0, const_1.NANOS_TO_DAY)(
    receipt.block.header.timestampNanosec
  );
  const id = timestamp.toString();
  let usageMetricsDailySnapshot = schema_1.UsageMetricsDailySnapshot.load(id);
  const protocol = getOrCreateProtocol();
  if (!usageMetricsDailySnapshot) {
    usageMetricsDailySnapshot = new schema_1.UsageMetricsDailySnapshot(id);
    usageMetricsDailySnapshot.protocol = protocol.id;
    usageMetricsDailySnapshot.dailyActiveUsers = 0;
    usageMetricsDailySnapshot.dailyActiveDepositors = 0;
    usageMetricsDailySnapshot.dailyActiveBorrowers = 0;
    usageMetricsDailySnapshot.dailyActiveLiquidators = 0;
    usageMetricsDailySnapshot.dailyActiveLiquidatees = 0;
    usageMetricsDailySnapshot.dailyTransactionCount = 0;
    usageMetricsDailySnapshot.dailyDepositCount = 0;
    usageMetricsDailySnapshot.dailyWithdrawCount = 0;
    usageMetricsDailySnapshot.dailyBorrowCount = 0;
    usageMetricsDailySnapshot.dailyRepayCount = 0;
    usageMetricsDailySnapshot.dailyLiquidateCount = 0;
  }
  usageMetricsDailySnapshot.cumulativeUniqueLiquidatees =
    protocol.cumulativeUniqueLiquidatees;
  usageMetricsDailySnapshot.cumulativeUniqueLiquidators =
    protocol.cumulativeUniqueLiquidators;
  usageMetricsDailySnapshot.cumulativeUniqueUsers =
    protocol.cumulativeUniqueUsers;
  usageMetricsDailySnapshot.cumulativeUniqueDepositors =
    protocol.cumulativeUniqueDepositors;
  usageMetricsDailySnapshot.cumulativeUniqueBorrowers =
    protocol.cumulativeUniqueBorrowers;
  usageMetricsDailySnapshot.totalPoolCount = protocol._marketIds.length;
  usageMetricsDailySnapshot.blockNumber = graph_ts_1.BigInt.fromU64(
    receipt.block.header.height
  );
  usageMetricsDailySnapshot.timestamp = graph_ts_1.BigInt.fromU64(
    (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
  );
  usageMetricsDailySnapshot.save();
  return usageMetricsDailySnapshot;
}
exports.getOrCreateUsageMetricsDailySnapshot =
  getOrCreateUsageMetricsDailySnapshot;
// UsageMetricsHourlySnapshot
function getOrCreateUsageMetricsHourlySnapshot(receipt) {
  const timestamp = (0, const_1.NANOS_TO_HOUR)(
    receipt.block.header.timestampNanosec
  );
  const id = timestamp.toString();
  let usageMetricsHourlySnapshot = schema_1.UsageMetricsHourlySnapshot.load(id);
  const protocol = getOrCreateProtocol();
  if (!usageMetricsHourlySnapshot) {
    usageMetricsHourlySnapshot = new schema_1.UsageMetricsHourlySnapshot(id);
    usageMetricsHourlySnapshot.protocol = protocol.id;
    usageMetricsHourlySnapshot.hourlyActiveUsers = 0;
    usageMetricsHourlySnapshot.hourlyTransactionCount = 0;
    usageMetricsHourlySnapshot.hourlyDepositCount = 0;
    usageMetricsHourlySnapshot.hourlyWithdrawCount = 0;
    usageMetricsHourlySnapshot.hourlyBorrowCount = 0;
    usageMetricsHourlySnapshot.hourlyRepayCount = 0;
    usageMetricsHourlySnapshot.hourlyLiquidateCount = 0;
  }
  usageMetricsHourlySnapshot.cumulativeUniqueUsers =
    protocol.cumulativeUniqueUsers;
  usageMetricsHourlySnapshot.blockNumber = graph_ts_1.BigInt.fromU64(
    receipt.block.header.height
  );
  usageMetricsHourlySnapshot.timestamp = graph_ts_1.BigInt.fromU64(
    (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
  );
  usageMetricsHourlySnapshot.save();
  return usageMetricsHourlySnapshot;
}
exports.getOrCreateUsageMetricsHourlySnapshot =
  getOrCreateUsageMetricsHourlySnapshot;
function getOrCreateFinancialDailySnapshot(receipt) {
  const timestamp = (0, const_1.NANOS_TO_DAY)(
    receipt.block.header.timestampNanosec
  );
  const id = timestamp.toString();
  let financialsDailySnapshot = schema_1.FinancialsDailySnapshot.load(id);
  const protocol = getOrCreateProtocol();
  if (!financialsDailySnapshot) {
    financialsDailySnapshot = new schema_1.FinancialsDailySnapshot(id);
    financialsDailySnapshot.protocol = protocol.id;
    financialsDailySnapshot.protocolControlledValueUSD = const_1.BD_ZERO;
    financialsDailySnapshot.dailySupplySideRevenueUSD = const_1.BD_ZERO;
    financialsDailySnapshot.dailyProtocolSideRevenueUSD = const_1.BD_ZERO;
    financialsDailySnapshot.dailyTotalRevenueUSD = const_1.BD_ZERO;
    financialsDailySnapshot.dailyDepositUSD = const_1.BD_ZERO;
    financialsDailySnapshot.dailyBorrowUSD = const_1.BD_ZERO;
    financialsDailySnapshot.dailyLiquidateUSD = const_1.BD_ZERO;
    financialsDailySnapshot.dailyWithdrawUSD = const_1.BD_ZERO;
    financialsDailySnapshot.dailyRepayUSD = const_1.BD_ZERO;
  }
  financialsDailySnapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
  financialsDailySnapshot.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD;
  financialsDailySnapshot.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD;
  financialsDailySnapshot.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD;
  financialsDailySnapshot.totalDepositBalanceUSD =
    protocol.totalDepositBalanceUSD;
  financialsDailySnapshot.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
  financialsDailySnapshot.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
  financialsDailySnapshot.totalBorrowBalanceUSD =
    protocol.totalBorrowBalanceUSD;
  financialsDailySnapshot.cumulativeLiquidateUSD =
    protocol.cumulativeLiquidateUSD;
  financialsDailySnapshot.blockNumber = graph_ts_1.BigInt.fromU64(
    receipt.block.header.height
  );
  financialsDailySnapshot.timestamp = graph_ts_1.BigInt.fromU64(
    (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
  );
  financialsDailySnapshot.save();
  return financialsDailySnapshot;
}
exports.getOrCreateFinancialDailySnapshot = getOrCreateFinancialDailySnapshot;
