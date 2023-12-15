"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateYieldAggregator =
  exports.getOrCreateVaultHourlySnapshot =
  exports.getOrCreateVaultDailySnapshot =
  exports.getOrCreateFinancialsDailySnapshot =
  exports.getOrCreateUsageMetricHourlySnapshot =
  exports.getOrCreateUsageMetricDailySnapshot =
  exports.getOrCreateRewardToken =
  exports.getOrCreateToken =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const tokens_1 = require("./tokens");
const constants_1 = require("../common/constants");
const datetime_1 = require("./utils/datetime");
const versions_1 = require("../versions");
function getOrCreateToken(tokenAddress) {
  let token = schema_1.Token.load(tokenAddress.toHexString());
  // fetch info if null
  if (!token) {
    token = new schema_1.Token(tokenAddress.toHexString());
    token.symbol = (0, tokens_1.fetchTokenSymbol)(tokenAddress);
    token.name = (0, tokens_1.fetchTokenName)(tokenAddress);
    token.decimals = (0, tokens_1.fetchTokenDecimals)(tokenAddress);
    token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
    token.lastPriceBlockNumber = constants_1.BIGINT_ZERO;
    token._lastPriceTimestamp = constants_1.BIGINT_ZERO;
    token.save();
  }
  return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(address, type) {
  const rewardTokenId = `${type}-${address.toHexString()}`;
  let rewardToken = schema_1.RewardToken.load(rewardTokenId);
  if (!rewardToken) {
    const token = getOrCreateToken(address);
    rewardToken = new schema_1.RewardToken(rewardTokenId);
    rewardToken.token = token.id;
    rewardToken.type = type;
    rewardToken.save();
  }
  return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getOrCreateUsageMetricDailySnapshot(event) {
  // Number of days since Unix epoch
  const id = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
  const dayId = id.toString();
  // Create unique id for the day
  let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(dayId);
  if (!usageMetrics) {
    usageMetrics = new schema_1.UsageMetricsDailySnapshot(dayId);
    usageMetrics.protocol = constants_1.REGISTRY_ADDRESS_MAP.get(
      graph_ts_1.dataSource.network()
    ).toHex();
    usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
    usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
    usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
    usageMetrics.dailyDepositCount = constants_1.INT_ZERO;
    usageMetrics.dailyWithdrawCount = constants_1.INT_ZERO;
    usageMetrics.totalPoolCount = constants_1.INT_ZERO;
    usageMetrics.blockNumber = event.block.number;
    usageMetrics.timestamp = event.block.timestamp;
    usageMetrics.save();
  }
  return usageMetrics;
}
exports.getOrCreateUsageMetricDailySnapshot =
  getOrCreateUsageMetricDailySnapshot;
function getOrCreateUsageMetricHourlySnapshot(event) {
  // Number of days since Unix epoch
  const hour = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
  const hourId = hour.toString();
  // Create unique id for the day
  let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(hourId);
  if (!usageMetrics) {
    usageMetrics = new schema_1.UsageMetricsHourlySnapshot(hourId);
    usageMetrics.protocol = constants_1.REGISTRY_ADDRESS_MAP.get(
      graph_ts_1.dataSource.network()
    ).toHex();
    usageMetrics.hourlyActiveUsers = constants_1.INT_ZERO;
    usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
    usageMetrics.hourlyTransactionCount = constants_1.INT_ZERO;
    usageMetrics.hourlyDepositCount = constants_1.INT_ZERO;
    usageMetrics.hourlyWithdrawCount = constants_1.INT_ZERO;
    usageMetrics.blockNumber = event.block.number;
    usageMetrics.timestamp = event.block.timestamp;
    usageMetrics.save();
  }
  return usageMetrics;
}
exports.getOrCreateUsageMetricHourlySnapshot =
  getOrCreateUsageMetricHourlySnapshot;
function getOrCreateFinancialsDailySnapshot(event) {
  // Number of days since Unix epoch
  const dayID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
  const id = dayID.toString();
  let financialMetrics = schema_1.FinancialsDailySnapshot.load(id);
  if (!financialMetrics) {
    const protocol = getOrCreateYieldAggregator(
      constants_1.REGISTRY_ADDRESS_MAP.get(graph_ts_1.dataSource.network())
    );
    financialMetrics = new schema_1.FinancialsDailySnapshot(id);
    financialMetrics.protocol = protocol.id;
    financialMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.protocolControlledValueUSD = null;
    financialMetrics.cumulativeSupplySideRevenueUSD =
      protocol.cumulativeSupplySideRevenueUSD;
    financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeProtocolSideRevenueUSD =
      protocol.cumulativeProtocolSideRevenueUSD;
    financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeTotalRevenueUSD =
      protocol.cumulativeTotalRevenueUSD;
    financialMetrics.blockNumber = event.block.number;
    financialMetrics.timestamp = event.block.timestamp;
    financialMetrics.save();
  }
  return financialMetrics;
}
exports.getOrCreateFinancialsDailySnapshot = getOrCreateFinancialsDailySnapshot;
function getOrCreateVaultDailySnapshot(vaultAddress, block) {
  const snapshotId = vaultAddress
    .toHex()
    .concat("-")
    .concat((0, datetime_1.getDaysSinceEpoch)(block.timestamp.toI32()));
  let snapshot = schema_1.VaultDailySnapshot.load(snapshotId);
  if (!snapshot) {
    snapshot = new schema_1.VaultDailySnapshot(snapshotId);
    snapshot.protocol = constants_1.REGISTRY_ADDRESS_MAP.get(
      graph_ts_1.dataSource.network()
    ).toHex();
    snapshot.vault = vaultAddress.toHex();
    snapshot.totalValueLockedUSD = graph_ts_1.BigDecimal.zero();
    snapshot.cumulativeSupplySideRevenueUSD = graph_ts_1.BigDecimal.zero();
    snapshot.dailySupplySideRevenueUSD = graph_ts_1.BigDecimal.zero();
    snapshot.cumulativeProtocolSideRevenueUSD = graph_ts_1.BigDecimal.zero();
    snapshot.dailyProtocolSideRevenueUSD = graph_ts_1.BigDecimal.zero();
    snapshot.cumulativeTotalRevenueUSD = graph_ts_1.BigDecimal.zero();
    snapshot.dailyTotalRevenueUSD = graph_ts_1.BigDecimal.zero();
    snapshot.inputTokenBalance = constants_1.BIGINT_ZERO;
    snapshot.outputTokenSupply = constants_1.BIGINT_ZERO;
    snapshot.outputTokenPriceUSD = graph_ts_1.BigDecimal.zero();
    snapshot.pricePerShare = null;
    snapshot.stakedOutputTokenAmount = null;
    snapshot.rewardTokenEmissionsAmount = null;
    snapshot.rewardTokenEmissionsUSD = null;
    snapshot._token0 = "";
    snapshot._token1 = "";
    snapshot._token0Amount = constants_1.BIGINT_ZERO;
    snapshot._token1Amount = constants_1.BIGINT_ZERO;
    snapshot._token0AmountUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot._token1AmountUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.blockNumber = block.number;
    snapshot.timestamp = block.timestamp;
    snapshot.save();
  }
  return snapshot;
}
exports.getOrCreateVaultDailySnapshot = getOrCreateVaultDailySnapshot;
function getOrCreateVaultHourlySnapshot(vaultAddress, block) {
  const snapshotId = vaultAddress
    .toHex()
    .concat("-")
    .concat((0, datetime_1.getHoursSinceEpoch)(block.timestamp.toI32()));
  let snapshot = schema_1.VaultHourlySnapshot.load(snapshotId);
  if (!snapshot) {
    snapshot = new schema_1.VaultHourlySnapshot(snapshotId);
    snapshot.protocol = constants_1.REGISTRY_ADDRESS_MAP.get(
      graph_ts_1.dataSource.network()
    ).toHex();
    snapshot.vault = vaultAddress.toHex();
    snapshot.totalValueLockedUSD = graph_ts_1.BigDecimal.zero();
    snapshot.cumulativeSupplySideRevenueUSD = graph_ts_1.BigDecimal.zero();
    snapshot.hourlySupplySideRevenueUSD = graph_ts_1.BigDecimal.zero();
    snapshot.cumulativeProtocolSideRevenueUSD = graph_ts_1.BigDecimal.zero();
    snapshot.hourlyProtocolSideRevenueUSD = graph_ts_1.BigDecimal.zero();
    snapshot.cumulativeTotalRevenueUSD = graph_ts_1.BigDecimal.zero();
    snapshot.hourlyTotalRevenueUSD = graph_ts_1.BigDecimal.zero();
    snapshot.inputTokenBalance = constants_1.BIGINT_ZERO;
    snapshot.outputTokenSupply = constants_1.BIGINT_ZERO;
    snapshot.outputTokenPriceUSD = graph_ts_1.BigDecimal.zero();
    snapshot.pricePerShare = null;
    snapshot.stakedOutputTokenAmount = null;
    snapshot.rewardTokenEmissionsAmount = null;
    snapshot.rewardTokenEmissionsUSD = null;
    snapshot.blockNumber = block.number;
    snapshot.timestamp = block.timestamp;
    snapshot.save();
  }
  return snapshot;
}
exports.getOrCreateVaultHourlySnapshot = getOrCreateVaultHourlySnapshot;
//////////////////////////
///// Yield Specific /////
//////////////////////////
function getOrCreateYieldAggregator(registryAddress) {
  const registryId = registryAddress.toHexString();
  let protocol = schema_1.YieldAggregator.load(registryId);
  if (!protocol) {
    protocol = new schema_1.YieldAggregator(registryId);
    protocol.name = constants_1.PROTOCOL_NAME;
    protocol.slug = constants_1.PROTOCOL_SLUG;
    protocol.network = graph_ts_1.dataSource
      .network()
      .toUpperCase()
      .replace("-", "_");
    protocol.type = constants_1.ProtocolType.YIELD;
    protocol.totalValueLockedUSD = graph_ts_1.BigDecimal.zero();
    protocol.protocolControlledValueUSD = null;
    protocol.cumulativeSupplySideRevenueUSD = graph_ts_1.BigDecimal.zero();
    protocol.cumulativeProtocolSideRevenueUSD = graph_ts_1.BigDecimal.zero();
    protocol.cumulativeTotalRevenueUSD = graph_ts_1.BigDecimal.zero();
    protocol.totalPoolCount = constants_1.INT_ZERO;
    protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
  }
  protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
  protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
  protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
  protocol.save();
  return protocol;
}
exports.getOrCreateYieldAggregator = getOrCreateYieldAggregator;
