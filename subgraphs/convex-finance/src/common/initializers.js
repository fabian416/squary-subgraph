"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateVault =
  exports.getOrCreateRewardPoolInfo =
  exports.getOrCreateFinancialDailySnapshots =
  exports.getOrCreateVaultsHourlySnapshots =
  exports.getOrCreateVaultsDailySnapshots =
  exports.getOrCreateAccount =
  exports.getOrCreateUsageMetricsHourlySnapshot =
  exports.getOrCreateUsageMetricsDailySnapshot =
  exports.getOrCreateRewardToken =
  exports.getOrCreateToken =
  exports.getOrCreateYieldAggregator =
    void 0;
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const utils = __importStar(require("./utils"));
const constants = __importStar(require("./constants"));
const Fees_1 = require("../modules/Fees");
const ERC20_1 = require("../../generated/Booster/ERC20");
const templates_1 = require("../../generated/templates");
const versions_1 = require("../versions");
function getOrCreateYieldAggregator() {
  const protocolId = constants.CONVEX_BOOSTER_ADDRESS.toHexString();
  let protocol = schema_1.YieldAggregator.load(protocolId);
  if (!protocol) {
    protocol = new schema_1.YieldAggregator(protocolId);
    protocol.name = constants.Protocol.NAME;
    protocol.slug = constants.Protocol.SLUG;
    protocol.network = constants.Network.MAINNET;
    protocol.type = constants.ProtocolType.YIELD;
    //////// Quantitative Data ////////
    protocol.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    protocol.protocolControlledValueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeUniqueUsers = 0;
    protocol.totalPoolCount = 0;
    protocol._poolCount = constants.BIGINT_ZERO;
    protocol._vaultIds = [];
  }
  protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
  protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
  protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
  protocol.save();
  return protocol;
}
exports.getOrCreateYieldAggregator = getOrCreateYieldAggregator;
function getOrCreateToken(address) {
  let token = schema_1.Token.load(address.toHexString());
  if (!token) {
    token = new schema_1.Token(address.toHexString());
    const contract = ERC20_1.ERC20.bind(address);
    token.name = utils.readValue(contract.try_name(), "");
    token.symbol = utils.readValue(contract.try_symbol(), "");
    token.decimals = utils.readValue(
      contract.try_decimals(),
      constants.INT_EIGHTEEN
    );
    token.save();
  }
  return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(address) {
  let rewardToken = schema_1.RewardToken.load(address.toHexString());
  if (!rewardToken) {
    rewardToken = new schema_1.RewardToken(address.toHexString());
    const token = getOrCreateToken(address);
    rewardToken.token = token.id;
    rewardToken.type = constants.RewardTokenType.DEPOSIT;
    rewardToken.save();
  }
  return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getOrCreateUsageMetricsDailySnapshot(block) {
  const id = (block.timestamp.toI64() / constants.SECONDS_PER_DAY).toString();
  let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id);
  if (!usageMetrics) {
    usageMetrics = new schema_1.UsageMetricsDailySnapshot(id);
    usageMetrics.protocol = constants.CONVEX_BOOSTER_ADDRESS.toHexString();
    usageMetrics.dailyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = 0;
    usageMetrics.dailyTransactionCount = 0;
    usageMetrics.dailyDepositCount = 0;
    usageMetrics.dailyWithdrawCount = 0;
    const protocol = getOrCreateYieldAggregator();
    usageMetrics.totalPoolCount = protocol.totalPoolCount;
    usageMetrics.blockNumber = block.number;
    usageMetrics.timestamp = block.timestamp;
    usageMetrics.save();
  }
  return usageMetrics;
}
exports.getOrCreateUsageMetricsDailySnapshot =
  getOrCreateUsageMetricsDailySnapshot;
function getOrCreateUsageMetricsHourlySnapshot(block) {
  const metricsID = (
    block.timestamp.toI64() / constants.SECONDS_PER_HOUR
  ).toString();
  let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(metricsID);
  if (!usageMetrics) {
    usageMetrics = new schema_1.UsageMetricsHourlySnapshot(metricsID);
    usageMetrics.protocol = constants.CONVEX_BOOSTER_ADDRESS.toHexString();
    usageMetrics.hourlyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = 0;
    usageMetrics.hourlyTransactionCount = 0;
    usageMetrics.hourlyDepositCount = 0;
    usageMetrics.hourlyWithdrawCount = 0;
    usageMetrics.blockNumber = block.number;
    usageMetrics.timestamp = block.timestamp;
    usageMetrics.save();
  }
  return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot =
  getOrCreateUsageMetricsHourlySnapshot;
function getOrCreateAccount(id) {
  let account = schema_1.Account.load(id);
  if (!account) {
    account = new schema_1.Account(id);
    account.save();
    const protocol = getOrCreateYieldAggregator();
    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }
  return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
function getOrCreateVaultsDailySnapshots(vault, block) {
  const id = vault.id
    .concat("-")
    .concat((block.timestamp.toI64() / constants.SECONDS_PER_DAY).toString());
  let vaultSnapshots = schema_1.VaultDailySnapshot.load(id);
  if (!vaultSnapshots) {
    vaultSnapshots = new schema_1.VaultDailySnapshot(id);
    vaultSnapshots.protocol = vault.protocol;
    vaultSnapshots.vault = vault.id;
    vaultSnapshots.totalValueLockedUSD = vault.totalValueLockedUSD;
    vaultSnapshots.inputTokenBalance = vault.inputTokenBalance;
    vaultSnapshots.outputTokenSupply = vault.outputTokenSupply
      ? vault.outputTokenSupply
      : constants.BIGINT_ZERO;
    vaultSnapshots.pricePerShare = vault.pricePerShare
      ? vault.pricePerShare
      : constants.BIGDECIMAL_ZERO;
    vaultSnapshots.rewardTokenEmissionsAmount =
      vault.rewardTokenEmissionsAmount;
    vaultSnapshots.rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
    vaultSnapshots.dailySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.cumulativeSupplySideRevenueUSD =
      vault.cumulativeSupplySideRevenueUSD;
    vaultSnapshots.dailyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.cumulativeProtocolSideRevenueUSD =
      vault.cumulativeProtocolSideRevenueUSD;
    vaultSnapshots.dailyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.cumulativeTotalRevenueUSD = vault.cumulativeTotalRevenueUSD;
    vaultSnapshots.blockNumber = block.number;
    vaultSnapshots.timestamp = block.timestamp;
    vaultSnapshots.save();
  }
  return vaultSnapshots;
}
exports.getOrCreateVaultsDailySnapshots = getOrCreateVaultsDailySnapshots;
function getOrCreateVaultsHourlySnapshots(vault, block) {
  const id = vault.id
    .concat("-")
    .concat((block.timestamp.toI64() / constants.SECONDS_PER_HOUR).toString());
  let vaultSnapshots = schema_1.VaultHourlySnapshot.load(id);
  if (!vaultSnapshots) {
    vaultSnapshots = new schema_1.VaultHourlySnapshot(id);
    vaultSnapshots.protocol = vault.protocol;
    vaultSnapshots.vault = vault.id;
    vaultSnapshots.totalValueLockedUSD = vault.totalValueLockedUSD;
    vaultSnapshots.inputTokenBalance = vault.inputTokenBalance;
    vaultSnapshots.outputTokenSupply = vault.outputTokenSupply
      ? vault.outputTokenSupply
      : constants.BIGINT_ZERO;
    vaultSnapshots.pricePerShare = vault.pricePerShare
      ? vault.pricePerShare
      : constants.BIGDECIMAL_ZERO;
    vaultSnapshots.rewardTokenEmissionsAmount =
      vault.rewardTokenEmissionsAmount;
    vaultSnapshots.rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
    vaultSnapshots.hourlySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.cumulativeSupplySideRevenueUSD =
      vault.cumulativeSupplySideRevenueUSD;
    vaultSnapshots.hourlyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.cumulativeProtocolSideRevenueUSD =
      vault.cumulativeProtocolSideRevenueUSD;
    vaultSnapshots.hourlyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.cumulativeTotalRevenueUSD = vault.cumulativeTotalRevenueUSD;
    vaultSnapshots.blockNumber = block.number;
    vaultSnapshots.timestamp = block.timestamp;
    vaultSnapshots.save();
  }
  return vaultSnapshots;
}
exports.getOrCreateVaultsHourlySnapshots = getOrCreateVaultsHourlySnapshots;
function getOrCreateFinancialDailySnapshots(block) {
  const id = (block.timestamp.toI64() / constants.SECONDS_PER_DAY).toString();
  let financialMetrics = schema_1.FinancialsDailySnapshot.load(id);
  if (!financialMetrics) {
    financialMetrics = new schema_1.FinancialsDailySnapshot(id);
    financialMetrics.protocol = constants.CONVEX_BOOSTER_ADDRESS.toHexString();
    financialMetrics.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.protocolControlledValueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.dailySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.dailyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeProtocolSideRevenueUSD =
      constants.BIGDECIMAL_ZERO;
    financialMetrics.dailyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.blockNumber = block.number;
    financialMetrics.timestamp = block.timestamp;
    financialMetrics.save();
  }
  return financialMetrics;
}
exports.getOrCreateFinancialDailySnapshots = getOrCreateFinancialDailySnapshots;
function getOrCreateRewardPoolInfo(poolId, crvRewardPoolAddress, block) {
  const rewardPoolInfoId = poolId
    .toString()
    .concat("-")
    .concat(crvRewardPoolAddress.toHexString());
  let rewardPoolInfo = schema_1._RewardPoolInfo.load(rewardPoolInfoId);
  if (!rewardPoolInfo) {
    rewardPoolInfo = new schema_1._RewardPoolInfo(rewardPoolInfoId);
    rewardPoolInfo.historicalRewards = constants.BIGINT_ZERO;
    rewardPoolInfo.lastRewardTimestamp = block.timestamp;
    rewardPoolInfo.save();
  }
  return rewardPoolInfo;
}
exports.getOrCreateRewardPoolInfo = getOrCreateRewardPoolInfo;
function getOrCreateVault(poolId, block) {
  const vaultId = constants.CONVEX_BOOSTER_ADDRESS.toHexString()
    .concat("-")
    .concat(poolId.toString());
  let vault = schema_1.Vault.load(vaultId);
  if (!vault) {
    vault = new schema_1.Vault(vaultId);
    const poolInfo = utils.getPoolInfoFromPoolId(poolId);
    if (!poolInfo) {
      graph_ts_1.log.error(
        "[NewVault]: PoolInfo Reverted, PoolId: {}, block: {}",
        [poolId.toString(), block.number.toString()]
      );
      return null;
    }
    const lpTokenContract = ERC20_1.ERC20.bind(poolInfo.lpToken);
    vault.name = utils.readValue(lpTokenContract.try_name(), "");
    vault.symbol = utils.readValue(lpTokenContract.try_symbol(), "");
    vault.protocol = constants.CONVEX_BOOSTER_ADDRESS.toHexString();
    const inputToken = getOrCreateToken(poolInfo.lpToken);
    vault.inputToken = inputToken.id;
    vault.inputTokenBalance = constants.BIGINT_ZERO;
    const outputToken = getOrCreateToken(poolInfo.token);
    vault.outputToken = outputToken.id;
    vault.outputTokenSupply = constants.BIGINT_ZERO;
    vault.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
    vault.pricePerShare = constants.BIGDECIMAL_ZERO;
    vault.createdBlockNumber = block.number;
    vault.createdTimestamp = block.timestamp;
    vault.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    vault.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    vault.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    vault.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    const poolAddress = utils.getPool(poolInfo.lpToken);
    if (poolAddress == constants.NULL.TYPE_ADDRESS) {
      graph_ts_1.log.warning("Could not find pool for lp token {}", [
        poolInfo.lpToken.toHexString(),
      ]);
    }
    const performanceFeeId = utils
      .enumToPrefix(constants.VaultFeeType.PERFORMANCE_FEE)
      .concat(constants.CONVEX_BOOSTER_ADDRESS.toHexString());
    const performanceFee = (0, Fees_1.getTotalFees)();
    utils.createFeeType(
      performanceFeeId,
      constants.VaultFeeType.PERFORMANCE_FEE,
      performanceFee.totalFees().times(constants.BIGDECIMAL_HUNDRED)
    );
    vault.fees = [performanceFeeId];
    vault._crvRewards = poolInfo.crvRewards.toHexString();
    vault._pool = poolAddress.toHexString();
    vault._gauge = poolInfo.gauge.toHexString();
    vault._lpToken = poolInfo.lpToken.toHexString();
    vault.depositLimit = constants.BIGINT_ZERO;
    const context = new graph_ts_1.DataSourceContext();
    context.setString("poolId", poolId.toString());
    templates_1.PoolCrvRewards.createWithContext(poolInfo.crvRewards, context);
    utils.updateProtocolAfterNewVault(vault.id);
    vault.save();
    graph_ts_1.log.warning(
      "[NewVault] poolId: {}, name: {}, inputToken: {}, pool: {}",
      [poolId.toString(), vault.name, inputToken.id, poolAddress.toHexString()]
    );
  }
  return vault;
}
exports.getOrCreateVault = getOrCreateVault;
