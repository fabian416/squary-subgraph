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
exports.getOrCreateLiquidityPool =
  exports.getOrCreateLpToken =
  exports.getOrCreateLiquidityGauge =
  exports.getOrCreateLiquidityPoolHourlySnapshots =
  exports.getOrCreateLiquidityPoolDailySnapshots =
  exports.getOrCreateUsageMetricsHourlySnapshot =
  exports.getOrCreateUsageMetricsDailySnapshot =
  exports.getOrCreateFinancialDailySnapshots =
  exports.getOrCreateToken =
  exports.getOrCreateDexAmmProtocol =
  exports.getOrCreateLiquidityPoolFee =
  exports.getOrCreateRewardToken =
  exports.getOrCreateAccount =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const utils = __importStar(require("./utils"));
const templates_1 = require("../../generated/templates");
const versions_1 = require("../versions");
const constants = __importStar(require("./constants"));
const prices_1 = require("../prices");
const validation_1 = require("../prices/common/validation");
const schema_2 = require("../../generated/schema");
const ERC20_1 = require("../../generated/templates/PoolTemplate/ERC20");
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
function getOrCreateDexAmmProtocol() {
  const protocolId = constants.PROTOCOL_ID.toHexString();
  let protocol = schema_1.DexAmmProtocol.load(protocolId);
  if (!protocol) {
    protocol = new schema_1.DexAmmProtocol(protocolId);
    protocol.name = constants.Protocol.NAME;
    protocol.slug = constants.Protocol.SLUG;
    protocol.schemaVersion = constants.Protocol.SCHEMA_VERSION;
    protocol.subgraphVersion = constants.Protocol.SUBGRAPH_VERSION;
    protocol.methodologyVersion = constants.Protocol.METHODOLOGY_VERSION;
    protocol.network = constants.Protocol.NETWORK;
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
  }
  protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
  protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
  protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
  protocol.save();
  return protocol;
}
exports.getOrCreateDexAmmProtocol = getOrCreateDexAmmProtocol;
function getOrCreateToken(
  address,
  block,
  fetchLatestPrice = false,
  skipPricing = false
) {
  let token = schema_1.Token.load(address.toHexString());
  if (!token) {
    token = new schema_1.Token(address.toHexString());
    const contract = ERC20_1.ERC20.bind(address);
    token.name = utils.readValue(contract.try_name(), "");
    token.symbol = utils.readValue(contract.try_symbol(), "");
    token.decimals = utils
      .readValue(contract.try_decimals(), constants.DEFAULT_DECIMALS)
      .toI32();
    token.lastPriceUSD = constants.BIGDECIMAL_ZERO;
    token.isBasePoolLpToken = false;
    token._totalSupply = constants.BIGINT_ZERO;
    token._totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    token._largePriceChangeBuffer = 0;
    token._largeTVLImpactBuffer = 0;
    if (address.equals(constants.ETH_ADDRESS)) {
      token.name = "ETH";
      token.symbol = "ETH";
      token.decimals = constants.DEFAULT_DECIMALS.toI32();
    }
    token.save();
  }
  if (skipPricing) return token;
  if (
    fetchLatestPrice ||
    !token.lastPriceUSD ||
    !token.lastPriceBlockNumber ||
    block.number
      .minus(token.lastPriceBlockNumber)
      .gt(constants.PRICE_CACHING_BLOCKS)
  ) {
    const latestPrice = (0, prices_1.getUsdPricePerToken)(address, block);
    token.lastPriceUSD = (0, validation_1.protocolLevelPriceValidation)(
      token,
      latestPrice.usdPrice
    );
    token.lastPriceBlockNumber = block.number;
    token.oracleType = latestPrice.oracleType;
    token.save();
  }
  return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateFinancialDailySnapshots(block) {
  const id = block.timestamp.toI64() / constants.SECONDS_PER_DAY;
  let financialMetrics = schema_1.FinancialsDailySnapshot.load(id.toString());
  if (!financialMetrics) {
    financialMetrics = new schema_1.FinancialsDailySnapshot(id.toString());
    financialMetrics.protocol = constants.PROTOCOL_ID.toHexString();
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
    usageMetrics.protocol = constants.PROTOCOL_ID.toHexString();
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
    usageMetrics.protocol = constants.PROTOCOL_ID.toHexString();
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
    poolSnapshots.protocol = constants.PROTOCOL_ID.toHexString();
    poolSnapshots.pool = poolId;
    const pool = getOrCreateLiquidityPool(
      graph_ts_1.Address.fromString(poolId),
      block
    );
    const inputTokenLength = pool.inputTokens.length;
    poolSnapshots.dailyVolumeByTokenAmount = new Array(inputTokenLength).fill(
      constants.BIGINT_ZERO
    );
    poolSnapshots.dailyVolumeByTokenUSD = new Array(inputTokenLength).fill(
      constants.BIGDECIMAL_ZERO
    );
    poolSnapshots.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolSnapshots.inputTokenBalances = pool.inputTokenBalances;
    poolSnapshots.inputTokenWeights = pool.inputTokenWeights;
    poolSnapshots.outputTokenSupply = pool.outputTokenSupply;
    poolSnapshots.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolSnapshots.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
    poolSnapshots.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    poolSnapshots.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
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
    poolSnapshots.protocol = constants.PROTOCOL_ID.toHexString();
    poolSnapshots.pool = poolId;
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
    poolSnapshots.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolSnapshots.inputTokenBalances = pool.inputTokenBalances;
    poolSnapshots.inputTokenWeights = pool.inputTokenWeights;
    poolSnapshots.outputTokenSupply = pool.outputTokenSupply;
    poolSnapshots.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolSnapshots.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
    poolSnapshots.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    poolSnapshots.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
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
function getOrCreateLiquidityGauge(gaugeAddress, poolAddress = null) {
  let liquidityGauge = schema_1._LiquidityGauge.load(
    gaugeAddress.toHexString()
  );
  if (!liquidityGauge) {
    liquidityGauge = new schema_1._LiquidityGauge(gaugeAddress.toHexString());
    liquidityGauge.poolAddress = constants.NULL.TYPE_STRING;
    liquidityGauge.save();
    if (poolAddress) {
      const context = new graph_ts_1.DataSourceContext();
      context.setString("poolAddress", poolAddress.toHexString());
      templates_1.LiquidityGauge.createWithContext(gaugeAddress, context);
    }
  }
  return liquidityGauge;
}
exports.getOrCreateLiquidityGauge = getOrCreateLiquidityGauge;
function getOrCreateLpToken(lpTokenAddress) {
  let lpToken = schema_1._LpToken.load(lpTokenAddress.toHexString());
  if (!lpToken) {
    lpToken = new schema_1._LpToken(lpTokenAddress.toHexString());
    lpToken.poolAddress = constants.NULL.TYPE_STRING;
    lpToken.registryAddress = constants.NULL.TYPE_STRING;
    lpToken.save();
  }
  return lpToken;
}
exports.getOrCreateLpToken = getOrCreateLpToken;
function getOrCreateLiquidityPool(poolAddress, block) {
  let pool = schema_2.LiquidityPool.load(poolAddress.toHexString());
  if (!pool) {
    pool = new schema_2.LiquidityPool(poolAddress.toHexString());
    pool.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    pool._tvlUSDExcludingBasePoolLpTokens = constants.BIGDECIMAL_ZERO;
    pool.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    pool.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    pool.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    pool.cumulativeVolumeUSD = constants.BIGDECIMAL_ZERO;
    const lpToken = utils.getLpTokenFromPool(poolAddress, block);
    if (lpToken.id != constants.NULL.TYPE_STRING) {
      const lpTokenAddress = graph_ts_1.Address.fromString(lpToken.id);
      const lpTokenStore = getOrCreateLpToken(lpTokenAddress);
      lpTokenStore.poolAddress = poolAddress.toHexString();
      lpTokenStore.save();
      if (
        constants.HARDCODED_BASEPOOLS_LP_TOKEN.includes(lpTokenAddress) ||
        utils.isMainRegistryPool(poolAddress)
      ) {
        lpToken.isBasePoolLpToken = true;
        lpToken.save();
      }
    }
    pool.name = lpToken.name;
    pool.symbol = lpToken.symbol;
    pool.protocol = constants.PROTOCOL_ID.toHexString();
    pool._inputTokensOrdered = utils.getPoolCoins(poolAddress, block);
    pool.inputTokens = pool._inputTokensOrdered.sort();
    pool.inputTokenBalances = utils.getPoolBalances(pool);
    pool.inputTokenWeights = utils.getPoolTokenWeights(
      pool.inputTokens,
      pool.inputTokenBalances,
      block
    );
    pool.outputToken = lpToken.id;
    pool.outputTokenSupply = constants.BIGINT_ZERO;
    pool.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
    pool.rewardTokens = [];
    pool.rewardTokenEmissionsAmount = [];
    pool.rewardTokenEmissionsUSD = [];
    pool.fees = utils.getPoolFees(poolAddress).stringIds();
    pool.isSingleSided = false;
    pool.createdBlockNumber = block.number;
    pool.createdTimestamp = block.timestamp;
    utils.updateProtocolAfterNewLiquidityPool(poolAddress);
    pool._registryAddress = constants.NULL.TYPE_STRING;
    pool._gaugeAddress = constants.NULL.TYPE_STRING;
    pool._isMetapool = false;
    if (constants.HARDCODED_METAPOOLS.includes(poolAddress))
      pool._isMetapool = true;
    pool.save();
    templates_1.PoolTemplate.create(poolAddress);
    graph_ts_1.log.warning(
      "[NewLiquidityPool] Pool: {}, inputTokens: [{}], outputToken/lpToken: {}",
      [pool.id, pool.inputTokens.join(", "), lpToken.id]
    );
  }
  return pool;
}
exports.getOrCreateLiquidityPool = getOrCreateLiquidityPool;
