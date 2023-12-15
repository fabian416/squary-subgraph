"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolBalance =
  exports.getOrCreateActiveAccount =
  exports.getOrCreateAccount =
  exports.getOrCreatePoolHourlySnapshot =
  exports.getOrCreatePoolDailySnapshot =
  exports.getPool =
  exports.createPool =
  exports.getOrCreateFinancialsDailySnapshot =
  exports.getOrCreateUsageMetricsHourlySnapshot =
  exports.getOrCreateUsageMetricsDailySnapshot =
  exports.getOrCreateProtocol =
  exports.getOrCreateToken =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const tokens_1 = require("./tokens");
const prices_1 = require("../prices");
const versions_1 = require("../versions");
const configure_1 = require("../../configurations/configure");
const schema_1 = require("../../generated/schema");
const Strategy_1 = require("../../generated/StrategyManager/Strategy");
function getOrCreateToken(tokenAddress, event) {
  let token = schema_1.Token.load(tokenAddress);
  if (!token) {
    token = new schema_1.Token(tokenAddress);
    if (
      tokenAddress == graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS)
    ) {
      token.name = constants_1.ETH_NAME;
      token.symbol = constants_1.ETH_SYMBOL;
      token.decimals = 18;
    } else {
      token.name = (0, tokens_1.fetchTokenName)(tokenAddress);
      token.symbol = (0, tokens_1.fetchTokenSymbol)(tokenAddress);
      token.decimals = (0, tokens_1.fetchTokenDecimals)(tokenAddress);
    }
    token.lastPriceBlockNumber = event.block.number;
  }
  if (!token.lastPriceUSD || token.lastPriceBlockNumber < event.block.number) {
    token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
    const price = (0, prices_1.getUsdPricePerToken)(tokenAddress);
    if (!price.reverted) {
      token.lastPriceUSD = price.usdPrice;
    }
    token.lastPriceBlockNumber = event.block.number;
  }
  token.save();
  return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateProtocol() {
  let protocol = schema_1.Protocol.load(
    configure_1.NetworkConfigs.getFactoryAddress()
  );
  if (!protocol) {
    protocol = new schema_1.Protocol(
      configure_1.NetworkConfigs.getFactoryAddress()
    );
    protocol.name = constants_1.PROTOCOL_NAME;
    protocol.slug = constants_1.PROTOCOL_SLUG;
    protocol.network = configure_1.NetworkConfigs.getNetwork();
    protocol.type = constants_1.ProtocolType.GENERIC;
    protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeDepositVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeWithdrawalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.netVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeUniqueDepositors = constants_1.INT_ZERO;
    protocol.cumulativeUniqueWithdrawers = constants_1.INT_ZERO;
    protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
    protocol.cumulativeDepositCount = constants_1.INT_ZERO;
    protocol.cumulativeWithdrawalCount = constants_1.INT_ZERO;
    protocol.cumulativeTransactionCount = constants_1.INT_ZERO;
    protocol.totalEigenPodCount = constants_1.INT_ZERO;
    protocol.totalStrategyCount = constants_1.INT_ZERO;
    protocol.totalPoolCount = constants_1.INT_ZERO;
  }
  protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
  protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
  protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
  protocol.save();
  return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
function getOrCreateUsageMetricsDailySnapshot(day, block = null) {
  let snapshot = schema_1.UsageMetricsDailySnapshot.load(
    graph_ts_1.Bytes.fromI32(day)
  );
  if (!snapshot) {
    snapshot = new schema_1.UsageMetricsDailySnapshot(
      graph_ts_1.Bytes.fromI32(day)
    );
    snapshot.day = day;
    snapshot.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    snapshot.dailyActiveDepositors = constants_1.INT_ZERO;
    snapshot.cumulativeUniqueDepositors = constants_1.INT_ZERO;
    snapshot.dailyActiveWithdrawers = constants_1.INT_ZERO;
    snapshot.cumulativeUniqueWithdrawers = constants_1.INT_ZERO;
    snapshot.dailyActiveUsers = constants_1.INT_ZERO;
    snapshot.cumulativeUniqueUsers = constants_1.INT_ZERO;
    snapshot.dailyDepositCount = constants_1.INT_ZERO;
    snapshot.cumulativeDepositCount = constants_1.INT_ZERO;
    snapshot.dailyWithdrawalCount = constants_1.INT_ZERO;
    snapshot.cumulativeWithdrawalCount = constants_1.INT_ZERO;
    snapshot.dailyTransactionCount = constants_1.INT_ZERO;
    snapshot.cumulativeTransactionCount = constants_1.INT_ZERO;
    snapshot.totalPoolCount = constants_1.INT_ZERO;
    if (block) {
      snapshot.timestamp = block.timestamp;
      snapshot.blockNumber = block.number;
    }
  }
  return snapshot;
}
exports.getOrCreateUsageMetricsDailySnapshot =
  getOrCreateUsageMetricsDailySnapshot;
function getOrCreateUsageMetricsHourlySnapshot(hour, block = null) {
  let snapshot = schema_1.UsageMetricsHourlySnapshot.load(
    graph_ts_1.Bytes.fromI32(hour)
  );
  if (!snapshot) {
    snapshot = new schema_1.UsageMetricsHourlySnapshot(
      graph_ts_1.Bytes.fromI32(hour)
    );
    snapshot.hour = hour;
    snapshot.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    snapshot.hourlyActiveUsers = constants_1.INT_ZERO;
    snapshot.cumulativeUniqueUsers = constants_1.INT_ZERO;
    snapshot.hourlyTransactionCount = constants_1.INT_ZERO;
    snapshot.cumulativeTransactionCount = constants_1.INT_ZERO;
    if (block) {
      snapshot.timestamp = block.timestamp;
      snapshot.blockNumber = block.number;
    }
  }
  return snapshot;
}
exports.getOrCreateUsageMetricsHourlySnapshot =
  getOrCreateUsageMetricsHourlySnapshot;
function getOrCreateFinancialsDailySnapshot(day, block = null) {
  let snapshot = schema_1.FinancialsDailySnapshot.load(
    graph_ts_1.Bytes.fromI32(day)
  );
  if (!snapshot) {
    snapshot = new schema_1.FinancialsDailySnapshot(
      graph_ts_1.Bytes.fromI32(day)
    );
    snapshot.day = day;
    snapshot.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    snapshot.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyDepositVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeDepositVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyWithdrawalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeWithdrawalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyTotalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeTotalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyNetVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.netVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    if (block) {
      snapshot.timestamp = block.timestamp;
      snapshot.blockNumber = block.number;
    }
  }
  return snapshot;
}
exports.getOrCreateFinancialsDailySnapshot = getOrCreateFinancialsDailySnapshot;
function createPool(
  poolAddress,
  poolName,
  poolSymbol,
  poolType,
  poolTokenAddress,
  poolIsActive,
  event
) {
  const protocol = getOrCreateProtocol();
  const pool = new schema_1.Pool(poolAddress);
  pool.protocol = protocol.id;
  pool.name = poolName;
  pool.symbol = poolSymbol;
  pool.type = poolType;
  pool.inputTokens = [poolTokenAddress];
  pool.active = poolIsActive;
  pool.createdTimestamp = event.block.timestamp;
  pool.createdBlockNumber = event.block.number;
  pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  pool.inputTokenBalances = [constants_1.BIGINT_ZERO];
  pool.inputTokenBalancesUSD = [constants_1.BIGDECIMAL_ZERO];
  pool.cumulativeDepositVolumeAmount = constants_1.BIGINT_ZERO;
  pool.cumulativeDepositVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  pool.cumulativeWithdrawalVolumeAmount = constants_1.BIGINT_ZERO;
  pool.cumulativeWithdrawalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  pool.cumulativeTotalVolumeAmount = constants_1.BIGINT_ZERO;
  pool.cumulativeTotalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  pool.netVolumeAmount = constants_1.BIGINT_ZERO;
  pool.netVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  pool.cumulativeUniqueDepositors = constants_1.INT_ZERO;
  pool.cumulativeUniqueWithdrawers = constants_1.INT_ZERO;
  pool.cumulativeDepositCount = constants_1.INT_ZERO;
  pool.cumulativeWithdrawalCount = constants_1.INT_ZERO;
  pool.cumulativeTransactionCount = constants_1.INT_ZERO;
  pool.save();
  if (poolType == constants_1.PoolType.EIGEN_POD) {
    protocol.totalEigenPodCount += 1;
  } else {
    protocol.totalStrategyCount += 1;
  }
  protocol.totalPoolCount += 1;
  protocol.save();
  return pool;
}
exports.createPool = createPool;
function getPool(poolAddress) {
  return schema_1.Pool.load(poolAddress);
}
exports.getPool = getPool;
function getOrCreatePoolDailySnapshot(poolAddress, day, block = null) {
  const id = graph_ts_1.Bytes.empty()
    .concat(poolAddress)
    .concat(graph_ts_1.Bytes.fromUTF8("-"))
    .concat(graph_ts_1.Bytes.fromI32(day));
  let snapshot = schema_1.PoolDailySnapshot.load(id);
  if (!snapshot) {
    snapshot = new schema_1.PoolDailySnapshot(id);
    snapshot.day = day;
    snapshot.pool = poolAddress;
    snapshot.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    snapshot.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.inputTokenBalances = [constants_1.BIGINT_ZERO];
    snapshot.inputTokenBalancesUSD = [constants_1.BIGDECIMAL_ZERO];
    snapshot.dailyDepositVolumeAmount = constants_1.BIGINT_ZERO;
    snapshot.dailyDepositVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeDepositVolumeAmount = constants_1.BIGINT_ZERO;
    snapshot.cumulativeDepositVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyWithdrawalVolumeAmount = constants_1.BIGINT_ZERO;
    snapshot.dailyWithdrawalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeWithdrawalVolumeAmount = constants_1.BIGINT_ZERO;
    snapshot.cumulativeWithdrawalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyTotalVolumeAmount = constants_1.BIGINT_ZERO;
    snapshot.dailyTotalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeTotalVolumeAmount = constants_1.BIGINT_ZERO;
    snapshot.cumulativeTotalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyNetVolumeAmount = constants_1.BIGINT_ZERO;
    snapshot.dailyNetVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.netVolumeAmount = constants_1.BIGINT_ZERO;
    snapshot.netVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeUniqueDepositors = constants_1.INT_ZERO;
    snapshot.cumulativeUniqueWithdrawers = constants_1.INT_ZERO;
    snapshot.dailyDepositCount = constants_1.INT_ZERO;
    snapshot.cumulativeDepositCount = constants_1.INT_ZERO;
    snapshot.dailyWithdrawalCount = constants_1.INT_ZERO;
    snapshot.cumulativeWithdrawalCount = constants_1.INT_ZERO;
    snapshot.dailyTransactionCount = constants_1.INT_ZERO;
    snapshot.cumulativeTransactionCount = constants_1.INT_ZERO;
    if (block) {
      snapshot.timestamp = block.timestamp;
      snapshot.blockNumber = block.number;
    }
  }
  return snapshot;
}
exports.getOrCreatePoolDailySnapshot = getOrCreatePoolDailySnapshot;
function getOrCreatePoolHourlySnapshot(poolAddress, hour, block = null) {
  const id = graph_ts_1.Bytes.empty()
    .concat(poolAddress)
    .concat(graph_ts_1.Bytes.fromUTF8("-"))
    .concat(graph_ts_1.Bytes.fromI32(hour));
  let snapshot = schema_1.PoolHourlySnapshot.load(id);
  if (!snapshot) {
    snapshot = new schema_1.PoolHourlySnapshot(id);
    snapshot.hour = hour;
    snapshot.pool = poolAddress;
    snapshot.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    snapshot.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.inputTokenBalances = [constants_1.BIGINT_ZERO];
    snapshot.inputTokenBalancesUSD = [constants_1.BIGDECIMAL_ZERO];
    if (block) {
      snapshot.timestamp = block.timestamp;
      snapshot.blockNumber = block.number;
    }
  }
  return snapshot;
}
exports.getOrCreatePoolHourlySnapshot = getOrCreatePoolHourlySnapshot;
function getOrCreateAccount(accountAddress) {
  let account = schema_1.Account.load(accountAddress);
  if (!account) {
    account = new schema_1.Account(accountAddress);
    account.pools = [];
    account.poolBalances = [];
    account.poolBalancesUSD = [];
    account.deposits = [];
    account.withdrawsQueued = [];
    account.withdrawsCompleted = [];
    account._hasWithdrawnFromPool = [];
    account.save();
  }
  return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
function getOrCreateActiveAccount(id) {
  let account = schema_1.ActiveAccount.load(id);
  if (!account) {
    account = new schema_1.ActiveAccount(id);
    account.deposits = [];
    account.withdraws = [];
    account.save();
  }
  return account;
}
exports.getOrCreateActiveAccount = getOrCreateActiveAccount;
function getPoolBalance(poolAddress) {
  const strategyContract = Strategy_1.Strategy.bind(poolAddress);
  const totalSharesResult = strategyContract.try_totalShares();
  if (totalSharesResult.reverted) {
    graph_ts_1.log.error(
      "[getPoolBalance] strategyContract.try_totalShares() reverted for strategy: {}",
      [poolAddress.toHexString()]
    );
    return constants_1.BIGINT_ZERO;
  }
  const sharesToUnderlyingResult = strategyContract.try_sharesToUnderlying(
    totalSharesResult.value
  );
  if (sharesToUnderlyingResult.reverted) {
    graph_ts_1.log.error(
      "[getPoolBalance] strategyContract.try_sharesToUnderlying() reverted for strategy: {} and value: {}",
      [poolAddress.toHexString(), totalSharesResult.value.toString()]
    );
    return constants_1.BIGINT_ZERO;
  }
  return sharesToUnderlyingResult.value;
}
exports.getPoolBalance = getPoolBalance;
