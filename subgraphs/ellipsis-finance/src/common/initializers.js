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
exports.getOrCreateRewardToken =
  exports.getOrCreateAccount =
  exports.getOrCreateLiquidityPoolFee =
  exports.getOrCreateToken =
  exports.getOrCreateLiquidityPoolHourlySnapshots =
  exports.getOrCreateLiquidityPoolDailySnapshots =
  exports.getOrCreateUsageMetricsHourlySnapshot =
  exports.getOrCreateUsageMetricsDailySnapshot =
  exports.getOrCreateFinancialDailySnapshots =
  exports.getOrCreateDexAmmProtocol =
  exports.getOrCreateLiquidityPool =
    void 0;
const schema_1 = require("../../generated/schema");
const utils = __importStar(require("./utils"));
const constants = __importStar(require("./constants"));
const prices_1 = require("../prices");
const LpToken_1 = require("../../generated/Factory/LpToken");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC20_1 = require("../../generated/templates/PoolTemplate/ERC20");
const templates_1 = require("../../generated/templates");
function getOrCreateLiquidityPool(
  address,
  block,
  registryAddress = constants.ADDRESS_ZERO
) {
  const poolId = address.toHexString();
  let liquidityPool = schema_1.LiquidityPool.load(poolId);
  if (!liquidityPool) {
    liquidityPool = new schema_1.LiquidityPool(poolId);
    liquidityPool.protocol = constants.REGISTRY_ADDRESS.toHexString();
    liquidityPool.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    liquidityPool.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    liquidityPool.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    liquidityPool.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    liquidityPool.cumulativeVolumeUSD = constants.BIGDECIMAL_ZERO;
    if (!registryAddress.equals(constants.ADDRESS_ZERO)) {
      liquidityPool._registry = registryAddress.toHexString();
    }
    const lpToken = utils.getLpTokenFromPool(address, block, registryAddress);
    const lpTokenContract = LpToken_1.LpToken.bind(
      graph_ts_1.Address.fromString(lpToken.id)
    );
    liquidityPool.name = utils.readValue(lpTokenContract.try_name(), "");
    liquidityPool.symbol = utils.readValue(lpTokenContract.try_symbol(), "");
    liquidityPool.inputTokens = utils.getPoolCoins(address, block);
    liquidityPool._underlyingTokens = utils.getPoolUnderlyingCoins(
      address,
      registryAddress
    );
    liquidityPool.inputTokenBalances = utils.getPoolBalances(
      address,
      liquidityPool.inputTokens
    );
    liquidityPool.inputTokenWeights = utils.getPoolTokenWeights(
      liquidityPool.inputTokens,
      liquidityPool.inputTokenBalances,
      constants.BIGDECIMAL_ZERO,
      block
    );
    liquidityPool.fees = utils.getPoolFees(address).stringIds();
    liquidityPool.outputToken = lpToken.id;
    liquidityPool.outputTokenSupply = constants.BIGINT_ZERO;
    liquidityPool.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
    liquidityPool.rewardTokens = [];
    liquidityPool.rewardTokenEmissionsAmount = [];
    liquidityPool.rewardTokenEmissionsUSD = [];
    liquidityPool.isSingleSided = false;
    liquidityPool.createdTimestamp = block.timestamp;
    liquidityPool.createdBlockNumber = block.number;
    utils.updateProtocolAfterNewLiquidityPool(address);
    liquidityPool.save();
    templates_1.PoolTemplate.create(address);
  }
  return liquidityPool;
}
exports.getOrCreateLiquidityPool = getOrCreateLiquidityPool;
function getOrCreateDexAmmProtocol() {
  let protocol = schema_1.DexAmmProtocol.load(
    constants.REGISTRY_ADDRESS.toHexString()
  );
  if (!protocol) {
    protocol = new schema_1.DexAmmProtocol(
      constants.REGISTRY_ADDRESS.toHexString()
    );
    protocol.name = constants.PROTOCOL_NAME;
    protocol.slug = constants.PROTOCOL_SLUG;
    protocol.schemaVersion = constants.PROTOCOL_SCHEMA_VERSION;
    protocol.subgraphVersion = constants.PROTOCOL_SUBGRAPH_VERSION;
    protocol.methodologyVersion = constants.PROTOCOL_METHODOLOGY_VERSION;
    protocol.network = constants.Network.BSC;
    protocol.type = constants.ProtocolType.EXCHANGE;
    //////// Quantitative Data ////////
    protocol.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeVolumeUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeUniqueUsers = 0;
    protocol.totalPoolCount = 0;
    protocol._poolIds = [];
    protocol.save();
  }
  return protocol;
}
exports.getOrCreateDexAmmProtocol = getOrCreateDexAmmProtocol;
function getOrCreateFinancialDailySnapshots(block) {
  const id = block.timestamp.toI64() / constants.SECONDS_PER_DAY;
  let financialMetrics = schema_1.FinancialsDailySnapshot.load(id.toString());
  if (!financialMetrics) {
    financialMetrics = new schema_1.FinancialsDailySnapshot(id.toString());
    financialMetrics.protocol = constants.REGISTRY_ADDRESS.toHexString();
    financialMetrics.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.dailyVolumeUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeVolumeUSD = constants.BIGDECIMAL_ZERO;
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
    usageMetrics.protocol = constants.REGISTRY_ADDRESS.toHexString();
    usageMetrics.dailyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = 0;
    usageMetrics.dailyTransactionCount = 0;
    usageMetrics.dailyDepositCount = 0;
    usageMetrics.dailyWithdrawCount = 0;
    usageMetrics.dailySwapCount = 0;
    usageMetrics.blockNumber = block.number;
    usageMetrics.timestamp = block.timestamp;
    const protocol = getOrCreateDexAmmProtocol();
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
    usageMetrics.protocol = constants.REGISTRY_ADDRESS.toHexString();
    usageMetrics.hourlyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = 0;
    usageMetrics.hourlyTransactionCount = 0;
    usageMetrics.hourlyDepositCount = 0;
    usageMetrics.hourlyWithdrawCount = 0;
    usageMetrics.hourlySwapCount = 0;
    usageMetrics.blockNumber = block.number;
    usageMetrics.timestamp = block.timestamp;
    usageMetrics.save();
  }
  return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot =
  getOrCreateUsageMetricsHourlySnapshot;
function getOrCreateLiquidityPoolDailySnapshots(poolId, block) {
  const id = poolId
    .concat("-")
    .concat((block.timestamp.toI64() / constants.SECONDS_PER_DAY).toString());
  let poolSnapshots = schema_1.LiquidityPoolDailySnapshot.load(id);
  if (!poolSnapshots) {
    poolSnapshots = new schema_1.LiquidityPoolDailySnapshot(id);
    poolSnapshots.protocol = constants.REGISTRY_ADDRESS.toHexString();
    poolSnapshots.pool = poolId;
    const pool = getOrCreateLiquidityPool(
      graph_ts_1.Address.fromString(poolId),
      block
    );
    const inputTokenLength = pool.inputTokens.length;
    poolSnapshots.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.dailyVolumeByTokenAmount = new Array(inputTokenLength).fill(
      constants.BIGINT_ZERO
    );
    poolSnapshots.dailyVolumeByTokenUSD = new Array(inputTokenLength).fill(
      constants.BIGDECIMAL_ZERO
    );
    poolSnapshots.inputTokenBalances = pool.inputTokenBalances;
    poolSnapshots.inputTokenWeights = pool.inputTokenWeights;
    poolSnapshots.outputTokenSupply = constants.BIGINT_ZERO;
    poolSnapshots.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.rewardTokenEmissionsAmount = null;
    poolSnapshots.rewardTokenEmissionsUSD = null;
    poolSnapshots.stakedOutputTokenAmount = null;
    poolSnapshots.dailySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.dailyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.dailyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.dailyVolumeUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.cumulativeVolumeUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.blockNumber = block.number;
    poolSnapshots.timestamp = block.timestamp;
    poolSnapshots.save();
  }
  return poolSnapshots;
}
exports.getOrCreateLiquidityPoolDailySnapshots =
  getOrCreateLiquidityPoolDailySnapshots;
function getOrCreateLiquidityPoolHourlySnapshots(poolId, block) {
  const id = poolId
    .concat("-")
    .concat((block.timestamp.toI64() / constants.SECONDS_PER_HOUR).toString());
  let poolSnapshots = schema_1.LiquidityPoolHourlySnapshot.load(id);
  if (!poolSnapshots) {
    poolSnapshots = new schema_1.LiquidityPoolHourlySnapshot(id);
    poolSnapshots.protocol = constants.REGISTRY_ADDRESS.toHexString();
    poolSnapshots.pool = poolId;
    poolSnapshots.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    const pool = getOrCreateLiquidityPool(
      graph_ts_1.Address.fromString(poolId),
      block
    );
    const inputTokenLength = pool.inputTokens.length;
    poolSnapshots.hourlyVolumeByTokenAmount = new Array(inputTokenLength).fill(
      constants.BIGINT_ZERO
    );
    poolSnapshots.hourlyVolumeByTokenUSD = new Array(inputTokenLength).fill(
      constants.BIGDECIMAL_ZERO
    );
    poolSnapshots.inputTokenBalances = pool.inputTokenBalances;
    poolSnapshots.inputTokenWeights = pool.inputTokenWeights;
    poolSnapshots.outputTokenSupply = constants.BIGINT_ZERO;
    poolSnapshots.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.rewardTokenEmissionsAmount = null;
    poolSnapshots.rewardTokenEmissionsUSD = null;
    poolSnapshots.stakedOutputTokenAmount = null;
    poolSnapshots.hourlySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.hourlyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.hourlyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.hourlyVolumeUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.cumulativeVolumeUSD = constants.BIGDECIMAL_ZERO;
    poolSnapshots.blockNumber = block.number;
    poolSnapshots.timestamp = block.timestamp;
    poolSnapshots.save();
  }
  return poolSnapshots;
}
exports.getOrCreateLiquidityPoolHourlySnapshots =
  getOrCreateLiquidityPoolHourlySnapshots;
function getOrCreateToken(address, block) {
  let token = schema_1.Token.load(address.toHexString());
  if (!token) {
    token = new schema_1.Token(address.toHexString());
    const contract = ERC20_1.ERC20.bind(address);
    token.name = utils.readValue(contract.try_name(), "");
    token.symbol = utils.readValue(contract.try_symbol(), "");
    token.decimals = utils.readValue(
      contract.try_decimals(),
      graph_ts_1.BigInt.fromI32(constants.DEFAULT_DECIMALS).toI32()
    );
    if (address.equals(constants.ETH_ADDRESS)) {
      token.name = constants.ETH_NAME;
      token.symbol = constants.ETH_SYMBOL;
      token.decimals = constants.DEFAULT_DECIMALS;
    }
    const tokenPrice = (0, prices_1.getUsdPricePerToken)(address);
    token.lastPriceUSD = tokenPrice.usdPrice;
    token.lastPriceBlockNumber = block.number;
    token.save();
  }
  if (
    !token.lastPriceUSD ||
    !token.lastPriceBlockNumber ||
    block.number
      .minus(token.lastPriceBlockNumber)
      .gt(constants.BSC_AVERAGE_BLOCK_PER_HOUR)
  ) {
    const tokenPrice = (0, prices_1.getUsdPricePerToken)(address);
    token.lastPriceUSD = tokenPrice.usdPrice;
    token.lastPriceBlockNumber = block.number;
    token.save();
  }
  return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateLiquidityPoolFee(
  feeId,
  feeType,
  feePercentage = constants.BIGDECIMAL_ZERO
) {
  let fees = schema_1.LiquidityPoolFee.load(feeId);
  if (!fees) {
    fees = new schema_1.LiquidityPoolFee(feeId);
    fees.feeType = feeType;
    fees.feePercentage = feePercentage;
    fees.save();
  }
  if (feePercentage.notEqual(constants.BIGDECIMAL_ZERO)) {
    fees.feePercentage = feePercentage;
    fees.save();
  }
  return fees;
}
exports.getOrCreateLiquidityPoolFee = getOrCreateLiquidityPoolFee;
function getOrCreateAccount(id) {
  let account = schema_1.Account.load(id);
  if (!account) {
    account = new schema_1.Account(id);
    account.save();
    const protocol = getOrCreateDexAmmProtocol();
    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }
  return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
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
