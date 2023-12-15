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
  exports.getOrCreateVaultsHourlySnapshots =
  exports.getOrCreateVaultsDailySnapshots =
  exports.getOrCreateUsageMetricsHourlySnapshot =
  exports.getOrCreateUsageMetricsDailySnapshot =
  exports.getOrCreateFinancialDailySnapshots =
  exports.getOrCreateVaultFee =
  exports.getOrCreateRewardToken =
  exports.getOrCreateWantToken =
  exports.getOrCreateToken =
  exports.getOrCreateYieldAggregator =
  exports.getOrCreateAccount =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const utils = __importStar(require("./utils"));
const versions_1 = require("../versions");
const constants = __importStar(require("./constants"));
const prices_1 = require("../prices");
const schema_2 = require("../../generated/schema");
const templates_1 = require("../../generated/templates");
const ERC20_1 = require("../../generated/templates/Strategy/ERC20");
const Vault_1 = require("../../generated/templates/Strategy/Vault");
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
function getOrCreateYieldAggregator() {
  let protocol = schema_1.YieldAggregator.load(constants.PROTOCOL_ID);
  if (!protocol) {
    protocol = new schema_1.YieldAggregator(constants.PROTOCOL_ID);
    protocol.name = constants.Protocol.NAME;
    protocol.slug = constants.Protocol.SLUG;
    protocol.network = constants.Network.MAINNET;
    protocol.type = constants.ProtocolType.YIELD;
    //////// Quantitative Data ////////
    protocol.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeUniqueUsers = 0;
    protocol.totalPoolCount = 0;
    protocol._vaultIds = [];
  }
  protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
  protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
  protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
  protocol.save();
  return protocol;
}
exports.getOrCreateYieldAggregator = getOrCreateYieldAggregator;
function getOrCreateToken(address, block) {
  let token = schema_1.Token.load(address.toHexString());
  if (!token) {
    token = new schema_1.Token(address.toHexString());
    const contract = ERC20_1.ERC20.bind(address);
    token.name = utils.readValue(contract.try_name(), "");
    token.symbol = utils.readValue(contract.try_symbol(), "");
    token.decimals = utils.readValue(contract.try_decimals(), 0);
    token.save();
  }
  if (
    !token.lastPriceUSD ||
    !token.lastPriceBlockNumber ||
    block.number
      .minus(token.lastPriceBlockNumber)
      .gt(constants.ETH_AVERAGE_BLOCK_PER_HOUR)
  ) {
    const tokenPrice = (0, prices_1.getUsdPricePerToken)(address, block);
    token.lastPriceUSD = tokenPrice.usdPrice;
    token.lastPriceBlockNumber = block.number;
    token.save();
  }
  return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateWantToken(wantToken, vaultAddress) {
  let wantTokenStore = schema_1._WantToken.load(wantToken.toHexString());
  if (!wantTokenStore) {
    wantTokenStore = new schema_1._WantToken(wantToken.toHexString());
    if (!vaultAddress) vaultAddress = constants.NULL.TYPE_ADDRESS;
    wantTokenStore.vaultAddress = vaultAddress.toHexString();
    wantTokenStore.save();
  }
  return wantTokenStore;
}
exports.getOrCreateWantToken = getOrCreateWantToken;
function getOrCreateRewardToken(address, block) {
  let rewardToken = schema_1.RewardToken.load(address.toHexString());
  if (!rewardToken) {
    rewardToken = new schema_1.RewardToken(address.toHexString());
    const token = getOrCreateToken(address, block);
    rewardToken.token = token.id;
    rewardToken.type = constants.RewardTokenType.DEPOSIT;
    rewardToken.save();
  }
  return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getOrCreateVaultFee(feeId, feeType, feePercentage = null) {
  let fees = schema_1.VaultFee.load(feeId);
  if (!fees) {
    fees = new schema_1.VaultFee(feeId);
    fees.feeType = feeType;
    fees.feePercentage = feePercentage;
    fees.save();
  }
  if (feePercentage) {
    fees.feePercentage = feePercentage;
    fees.save();
  }
  return fees;
}
exports.getOrCreateVaultFee = getOrCreateVaultFee;
function getOrCreateFinancialDailySnapshots(block) {
  const id = block.timestamp.toI64() / constants.SECONDS_PER_DAY;
  let financialMetrics = schema_1.FinancialsDailySnapshot.load(id.toString());
  if (!financialMetrics) {
    financialMetrics = new schema_1.FinancialsDailySnapshot(id.toString());
    financialMetrics.protocol = constants.PROTOCOL_ID;
    financialMetrics.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
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
function getOrCreateUsageMetricsDailySnapshot(block) {
  const id = (block.timestamp.toI64() / constants.SECONDS_PER_DAY).toString();
  let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id);
  if (!usageMetrics) {
    usageMetrics = new schema_1.UsageMetricsDailySnapshot(id);
    usageMetrics.protocol = constants.PROTOCOL_ID;
    usageMetrics.dailyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = 0;
    usageMetrics.dailyTransactionCount = 0;
    usageMetrics.dailyDepositCount = 0;
    usageMetrics.dailyWithdrawCount = 0;
    usageMetrics.blockNumber = block.number;
    usageMetrics.timestamp = block.timestamp;
    const protocol = getOrCreateYieldAggregator();
    usageMetrics.totalPoolCount = protocol.totalPoolCount;
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
    usageMetrics.protocol = constants.PROTOCOL_ID;
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
    vaultSnapshots.outputTokenPriceUSD = vault.outputTokenPriceUSD
      ? vault.outputTokenPriceUSD
      : constants.BIGDECIMAL_ZERO;
    vaultSnapshots.pricePerShare = vault.pricePerShare
      ? vault.pricePerShare
      : constants.BIGDECIMAL_ZERO;
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
    vaultSnapshots.outputTokenPriceUSD = vault.outputTokenPriceUSD
      ? vault.outputTokenPriceUSD
      : constants.BIGDECIMAL_ZERO;
    vaultSnapshots.pricePerShare = vault.pricePerShare
      ? vault.pricePerShare
      : constants.BIGDECIMAL_ZERO;
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
function getOrCreateVault(vaultAddress, block) {
  let vault = schema_2.Vault.load(vaultAddress.toHexString());
  if (!vault) {
    vault = new schema_2.Vault(vaultAddress.toHexString());
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    vault.name = utils.readValue(vaultContract.try_name(), "");
    vault.symbol = utils.readValue(vaultContract.try_symbol(), "");
    // There is no deposit limit on Badger DAO
    vault.depositLimit = constants.BIGINT_ZERO;
    vault.protocol = constants.PROTOCOL_ID;
    const inputTokenAddress = utils.readValue(
      vaultContract.try_token(),
      constants.NULL.TYPE_ADDRESS
    );
    const inputToken = getOrCreateToken(inputTokenAddress, block);
    getOrCreateWantToken(inputTokenAddress, vaultAddress);
    vault.inputToken = inputToken.id;
    vault.inputTokenBalance = constants.BIGINT_ZERO;
    const outputToken = getOrCreateToken(vaultAddress, block);
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
    const controllerAddress = utils.getControllerAddress(vaultAddress);
    const strategyAddress = utils.getVaultStrategy(
      vaultAddress,
      inputTokenAddress
    );
    if (strategyAddress.notEqual(constants.NULL.TYPE_ADDRESS)) {
      const context = new graph_ts_1.DataSourceContext();
      context.setString("vaultAddress", vaultAddress.toHexString());
      templates_1.Strategy.createWithContext(strategyAddress, context);
    }
    const bribesAddress = utils.getBribesProcessor(
      vaultAddress,
      strategyAddress
    );
    vault.fees = utils.getVaultFees(vaultAddress, strategyAddress).stringIds();
    vault._lastRewardsBlockNumber = block.number;
    vault._bribesProcessor = bribesAddress.toHexString();
    vault._controller = controllerAddress.toHexString();
    vault._strategy = strategyAddress.toHexString();
    vault.save();
    utils.updateProtocolAfterNewVault(vaultAddress);
    graph_ts_1.log.warning(
      "[NewVault] VaultId: {}, inputToken: {}, strategy: {}",
      [
        vaultAddress.toHexString(),
        inputTokenAddress.toHexString(),
        strategyAddress.toHexString(),
      ]
    );
  }
  if (
    block.number
      .minus(vault._lastRewardsBlockNumber)
      .gt(constants.REWARDS_LOGGER_CACHING)
  ) {
    utils.deactivateFinishedRewards(vault, block);
    vault._lastRewardsBlockNumber = block.number;
    vault.save();
  }
  return vault;
}
exports.getOrCreateVault = getOrCreateVault;
