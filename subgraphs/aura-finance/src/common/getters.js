"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateRewardPool =
  exports.getOrCreateVaultHourlySnapshots =
  exports.getOrCreateVaultDailySnapshots =
  exports.getOrCreateVault =
  exports.getFees =
  exports.getOrCreateFeeType =
  exports.getOrCreateRewardToken =
  exports.getOrCreateToken =
  exports.getOrCreateBalancerPoolToken =
  exports.getOrCreateFinancialDailySnapshots =
  exports.getOrCreateUsageMetricsHourlySnapshot =
  exports.getOrCreateUsageMetricsDailySnapshot =
  exports.getOrCreateYieldAggregator =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const configure_1 = require("../../configurations/configure");
const prices_1 = require("../prices");
const tokens_1 = require("./tokens");
const datetime_1 = require("./utils/datetime");
const strings_1 = require("./utils/strings");
const ethereum_1 = require("./utils/ethereum");
const numbers_1 = require("./utils/numbers");
const types_1 = require("./types");
const pools_1 = require("./pools");
const versions_1 = require("../versions");
const schema_1 = require("../../generated/schema");
const templates_1 = require("../../generated/templates");
const BaseRewardPool_1 = require("../../generated/Booster-v1/BaseRewardPool");
const Booster_1 = require("../../generated/Booster-v1/Booster");
function getOrCreateYieldAggregator() {
  const protocolId = configure_1.NetworkConfigs.getFactoryAddress();
  let protocol = schema_1.YieldAggregator.load(protocolId);
  if (!protocol) {
    protocol = new schema_1.YieldAggregator(protocolId);
    protocol.name = configure_1.NetworkConfigs.getProtocolName();
    protocol.slug = configure_1.NetworkConfigs.getProtocolSlug();
    protocol.network = configure_1.NetworkConfigs.getNetwork();
    protocol.type = constants_1.ProtocolType.YIELD;
    protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeUniqueUsers = 0;
    protocol.totalPoolCount = 0;
    protocol._activePoolCount = constants_1.BIGINT_ZERO;
    protocol._vaultIds = [];
  }
  protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
  protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
  protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
  protocol.save();
  return protocol;
}
exports.getOrCreateYieldAggregator = getOrCreateYieldAggregator;
function getOrCreateUsageMetricsDailySnapshot(event) {
  const dayId = (0, datetime_1.getDaysSinceEpoch)(
    event.block.timestamp.toI32()
  );
  let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(dayId);
  if (!usageMetrics) {
    usageMetrics = new schema_1.UsageMetricsDailySnapshot(dayId);
    usageMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    usageMetrics.dailyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = 0;
    usageMetrics.dailyTransactionCount = 0;
    usageMetrics.dailyDepositCount = 0;
    usageMetrics.dailyWithdrawCount = 0;
    const protocol = getOrCreateYieldAggregator();
    usageMetrics.totalPoolCount = protocol.totalPoolCount;
    usageMetrics.blockNumber = event.block.number;
    usageMetrics.timestamp = event.block.timestamp;
    usageMetrics.save();
  }
  return usageMetrics;
}
exports.getOrCreateUsageMetricsDailySnapshot =
  getOrCreateUsageMetricsDailySnapshot;
function getOrCreateUsageMetricsHourlySnapshot(event) {
  const hourId = (0, datetime_1.getHoursSinceEpoch)(
    event.block.timestamp.toI32()
  );
  let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(hourId);
  if (!usageMetrics) {
    usageMetrics = new schema_1.UsageMetricsHourlySnapshot(hourId);
    usageMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    usageMetrics.hourlyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = 0;
    usageMetrics.hourlyTransactionCount = 0;
    usageMetrics.hourlyDepositCount = 0;
    usageMetrics.hourlyWithdrawCount = 0;
    usageMetrics.blockNumber = event.block.number;
    usageMetrics.timestamp = event.block.timestamp;
    usageMetrics.save();
  }
  return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot =
  getOrCreateUsageMetricsHourlySnapshot;
function getOrCreateFinancialDailySnapshots(event) {
  const dayId = (0, datetime_1.getDaysSinceEpoch)(
    event.block.timestamp.toI32()
  );
  let financialMetrics = schema_1.FinancialsDailySnapshot.load(dayId);
  if (!financialMetrics) {
    financialMetrics = new schema_1.FinancialsDailySnapshot(dayId);
    financialMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    financialMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeSupplySideRevenueUSD =
      constants_1.BIGDECIMAL_ZERO;
    financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeProtocolSideRevenueUSD =
      constants_1.BIGDECIMAL_ZERO;
    financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.blockNumber = event.block.number;
    financialMetrics.timestamp = event.block.timestamp;
    financialMetrics.save();
  }
  return financialMetrics;
}
exports.getOrCreateFinancialDailySnapshots = getOrCreateFinancialDailySnapshots;
function getOrCreateBalancerPoolToken(poolAddress, blockNumber) {
  const bpt = getOrCreateToken(poolAddress, blockNumber);
  const poolTokensInfo = (0, pools_1.getPoolTokensInfo)(poolAddress);
  const inputTokens = poolTokensInfo.getInputTokens;
  const balances = poolTokensInfo.getBalances;
  const supply = poolTokensInfo.getSupply;
  const popIndex = poolTokensInfo.getPopIndex;
  const tokens = [];
  let knownPriceForAtleastOnePoolToken = false;
  let knownPricePoolTokenIndex = -1;
  for (let idx = 0; idx < inputTokens.length; idx++) {
    const tokenAddress = graph_ts_1.Address.fromString(inputTokens[idx]);
    let token = getOrCreateToken(tokenAddress, blockNumber);
    if ((0, pools_1.isBPT)(tokenAddress)) {
      token = getOrCreateBalancerPoolToken(tokenAddress, blockNumber);
    }
    if (
      constants_1.INACURATE_PRICEFEED_TOKENS.includes(
        graph_ts_1.Address.fromString(token.id)
      )
    ) {
      token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
    }
    if (
      !knownPriceForAtleastOnePoolToken &&
      token.lastPriceUSD != constants_1.BIGDECIMAL_ZERO
    ) {
      knownPriceForAtleastOnePoolToken = true;
      knownPricePoolTokenIndex = idx;
    }
    tokens.push(token);
  }
  if (knownPriceForAtleastOnePoolToken) {
    const knownPricePoolToken = tokens[knownPricePoolTokenIndex];
    let poolTVL = constants_1.BIGDECIMAL_ZERO;
    for (let idx = 0; idx < tokens.length; idx++) {
      if (tokens[idx].lastPriceUSD == constants_1.BIGDECIMAL_ZERO) {
        const weights = (0, pools_1.getPoolTokenWeights)(poolAddress, popIndex);
        if (weights.length == tokens.length) {
          const unknownPricePoolToken = tokens[idx];
          const knownPricePoolTokenValueUSD = (0, numbers_1.bigIntToBigDecimal)(
            balances[knownPricePoolTokenIndex],
            knownPricePoolToken.decimals
          ).times(knownPricePoolToken.lastPriceUSD);
          const unknownPricePoolTokenValueUSD = (0, numbers_1.divide)(
            weights[idx].times(knownPricePoolTokenValueUSD),
            weights[knownPricePoolTokenIndex]
          );
          unknownPricePoolToken.lastPriceUSD = (0, numbers_1.divide)(
            unknownPricePoolTokenValueUSD,
            (0, numbers_1.bigIntToBigDecimal)(
              balances[idx],
              unknownPricePoolToken.decimals
            )
          );
          unknownPricePoolToken.save();
        }
      }
      const tokenValueUSD = (0, numbers_1.bigIntToBigDecimal)(
        balances[idx],
        tokens[idx].decimals
      ).times(tokens[idx].lastPriceUSD);
      poolTVL = poolTVL.plus(tokenValueUSD);
    }
    bpt.lastPriceUSD = (0, numbers_1.divide)(
      poolTVL,
      (0, numbers_1.bigIntToBigDecimal)(supply, bpt.decimals)
    );
    bpt.lastPriceBlockNumber = blockNumber;
    bpt.save();
  } else {
    graph_ts_1.log.warning(
      "[getOrCreateBalancerPoolToken] No price for Balancer Pool input tokens. Balancer Pool Token: {} Input Tokens: {}",
      [poolAddress.toHexString(), inputTokens.toString()]
    );
  }
  return bpt;
}
exports.getOrCreateBalancerPoolToken = getOrCreateBalancerPoolToken;
function getOrCreateToken(tokenAddress, blockNumber) {
  let token = schema_1.Token.load(tokenAddress.toHexString());
  if (!token) {
    token = new schema_1.Token(tokenAddress.toHexString());
    token.name = (0, tokens_1.fetchTokenName)(tokenAddress);
    token.symbol = (0, tokens_1.fetchTokenSymbol)(tokenAddress);
    token.decimals = (0, tokens_1.fetchTokenDecimals)(tokenAddress);
    token.lastPriceBlockNumber = blockNumber;
  }
  if (!token.lastPriceUSD || token.lastPriceBlockNumber < blockNumber) {
    const price = (0, prices_1.getUsdPricePerToken)(tokenAddress);
    if (price.reverted) {
      token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
    } else {
      token.lastPriceUSD = price.usdPrice.div(price.decimalsBaseTen);
    }
    token.lastPriceBlockNumber = blockNumber;
  }
  token.save();
  return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(address, blockNumber) {
  let rewardToken = schema_1.RewardToken.load(
    constants_1.RewardTokenType.DEPOSIT.concat("-").concat(
      address.toHexString()
    )
  );
  if (!rewardToken) {
    const token = getOrCreateToken(address, blockNumber);
    rewardToken = new schema_1.RewardToken(
      constants_1.RewardTokenType.DEPOSIT.concat("-").concat(
        address.toHexString()
      )
    );
    rewardToken.token = token.id;
    rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
    rewardToken.save();
  }
  return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getOrCreateFeeType(feeId, feeType, feePercentage) {
  let fees = schema_1.VaultFee.load(feeId);
  if (!fees) {
    fees = new schema_1.VaultFee(feeId);
  }
  fees.feeType = feeType;
  fees.feePercentage = feePercentage;
  fees.save();
  return fees;
}
exports.getOrCreateFeeType = getOrCreateFeeType;
function getFees(boosterAddr) {
  const boosterContract = Booster_1.Booster.bind(boosterAddr);
  const lockIncentive = (0, ethereum_1.readValue)(
    boosterContract.try_lockIncentive(),
    constants_1.BIGINT_ZERO
  );
  const callIncentive = (0, ethereum_1.readValue)(
    boosterContract.try_earmarkIncentive(),
    constants_1.BIGINT_ZERO
  );
  const stakerIncentive = (0, ethereum_1.readValue)(
    boosterContract.try_stakerIncentive(),
    constants_1.BIGINT_ZERO
  );
  const platformFee = (0, ethereum_1.readValue)(
    boosterContract.try_platformFee(),
    constants_1.BIGINT_ZERO
  );
  return new types_1.CustomFeesType(
    lockIncentive,
    callIncentive,
    stakerIncentive,
    platformFee
  );
}
exports.getFees = getFees;
function getOrCreateVault(boosterAddr, poolId, event) {
  const vaultId = boosterAddr
    .toHexString()
    .concat("-")
    .concat(poolId.toString());
  let vault = schema_1.Vault.load(vaultId);
  if (!vault) {
    vault = new schema_1.Vault(vaultId);
    const boosterContract = Booster_1.Booster.bind(boosterAddr);
    const poolInfoCall = boosterContract.try_poolInfo(poolId);
    if (poolInfoCall.reverted) {
      graph_ts_1.log.error(
        "[NewVault]: PoolInfo Reverted, PoolId: {}, block: {}",
        [poolId.toString(), event.block.number.toString()]
      );
      return null;
    }
    const poolInfo = new types_1.PoolInfoType(poolInfoCall.value);
    const inputToken = getOrCreateBalancerPoolToken(
      poolInfo.lpToken,
      event.block.number
    );
    vault.inputToken = inputToken.id;
    vault.inputTokenBalance = constants_1.BIGINT_ZERO;
    vault.name = inputToken.name;
    vault.symbol = inputToken.symbol;
    vault.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    const outputToken = getOrCreateToken(poolInfo.token, event.block.number);
    vault.outputToken = outputToken.id;
    vault.outputTokenSupply = constants_1.BIGINT_ZERO;
    vault.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    vault.pricePerShare = constants_1.BIGDECIMAL_ZERO;
    vault.createdBlockNumber = event.block.number;
    vault.createdTimestamp = event.block.timestamp;
    vault.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    vault.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    vault.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    vault.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    const performanceFeeId = (0, strings_1.prefixID)(
      constants_1.VaultFeeType.PERFORMANCE_FEE,
      boosterAddr.toHexString()
    );
    getOrCreateFeeType(
      performanceFeeId,
      constants_1.VaultFeeType.PERFORMANCE_FEE,
      getFees(boosterAddr).totalFees().times(constants_1.BIGDECIMAL_HUNDRED)
    );
    vault.fees = [performanceFeeId];
    vault.rewardTokens = [
      getOrCreateRewardToken(
        graph_ts_1.Address.fromString(
          configure_1.NetworkConfigs.getRewardToken()
        ),
        event.block.number
      ).id,
    ];
    vault.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
    vault.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
    vault._balRewards = poolInfo.crvRewards.toHexString();
    vault._gauge = poolInfo.gauge.toHexString();
    vault._lpToken = poolInfo.lpToken.toHexString();
    vault._active = true;
    vault.depositLimit = constants_1.BIGINT_ZERO;
    const context = new graph_ts_1.DataSourceContext();
    context.setString("poolId", poolId.toString());
    templates_1.RewardPool.createWithContext(poolInfo.crvRewards, context);
    vault.save();
  }
  return vault;
}
exports.getOrCreateVault = getOrCreateVault;
function getOrCreateVaultDailySnapshots(vaultId, event) {
  const id = vaultId
    .concat("-")
    .concat((0, datetime_1.getDaysSinceEpoch)(event.block.timestamp.toI32()));
  let vaultSnapshots = schema_1.VaultDailySnapshot.load(id);
  if (!vaultSnapshots) {
    vaultSnapshots = new schema_1.VaultDailySnapshot(id);
    vaultSnapshots.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    vaultSnapshots.vault = vaultId;
    vaultSnapshots.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.inputTokenBalance = constants_1.BIGINT_ZERO;
    vaultSnapshots.outputTokenSupply = constants_1.BIGINT_ZERO;
    vaultSnapshots.pricePerShare = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
    vaultSnapshots.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
    vaultSnapshots.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.cumulativeProtocolSideRevenueUSD =
      constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.blockNumber = event.block.number;
    vaultSnapshots.timestamp = event.block.timestamp;
    vaultSnapshots.save();
  }
  return vaultSnapshots;
}
exports.getOrCreateVaultDailySnapshots = getOrCreateVaultDailySnapshots;
function getOrCreateVaultHourlySnapshots(vaultId, event) {
  const id = vaultId
    .concat("-")
    .concat((0, datetime_1.getHoursSinceEpoch)(event.block.timestamp.toI32()));
  let vaultSnapshots = schema_1.VaultHourlySnapshot.load(id);
  if (!vaultSnapshots) {
    vaultSnapshots = new schema_1.VaultHourlySnapshot(id);
    vaultSnapshots.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    vaultSnapshots.vault = vaultId;
    vaultSnapshots.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.inputTokenBalance = constants_1.BIGINT_ZERO;
    vaultSnapshots.outputTokenSupply = constants_1.BIGINT_ZERO;
    vaultSnapshots.pricePerShare = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
    vaultSnapshots.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
    vaultSnapshots.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.cumulativeProtocolSideRevenueUSD =
      constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    vaultSnapshots.blockNumber = event.block.number;
    vaultSnapshots.timestamp = event.block.timestamp;
    vaultSnapshots.save();
  }
  return vaultSnapshots;
}
exports.getOrCreateVaultHourlySnapshots = getOrCreateVaultHourlySnapshots;
function getOrCreateRewardPool(poolId, rewardPoolAddr, block) {
  const rewardPoolId = poolId
    .toString()
    .concat("-")
    .concat(rewardPoolAddr.toHexString());
  let rewardPool = schema_1._RewardPool.load(rewardPoolId);
  if (!rewardPool) {
    rewardPool = new schema_1._RewardPool(rewardPoolId);
    rewardPool.historicalRewards = constants_1.BIGINT_ZERO;
    rewardPool.lastAddedRewards = constants_1.BIGINT_ZERO;
    rewardPool.lastRewardTimestamp = block.timestamp;
  }
  if (
    !rewardPool.historicalRewards ||
    rewardPool.lastRewardTimestamp < block.timestamp
  ) {
    const rewardPoolContract =
      BaseRewardPool_1.BaseRewardPool.bind(rewardPoolAddr);
    const historicalRewardsUpdated = (0, ethereum_1.readValue)(
      rewardPoolContract.try_historicalRewards(),
      constants_1.BIGINT_ZERO
    );
    rewardPool.lastAddedRewards = historicalRewardsUpdated.minus(
      rewardPool.historicalRewards
    );
    rewardPool.historicalRewards = historicalRewardsUpdated;
    rewardPool.lastRewardTimestamp = block.timestamp;
  }
  rewardPool.save();
  return rewardPool;
}
exports.getOrCreateRewardPool = getOrCreateRewardPool;
