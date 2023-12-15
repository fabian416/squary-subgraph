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
exports.updateProtocolRevenue =
  exports.updateSnapshotsVolume =
  exports.updateTokenVolume =
  exports.updateFinancials =
  exports.updatePoolSnapshots =
  exports.updateUsageMetrics =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const Revenue_1 = require("./Revenue");
function updateUsageMetrics(block, from) {
  (0, initializers_1.getOrCreateAccount)(from.toHexString());
  const protocol = (0, initializers_1.getOrCreateDexAmmProtocol)();
  const usageMetricsDaily = (0,
  initializers_1.getOrCreateUsageMetricsDailySnapshot)(block);
  const usageMetricsHourly = (0,
  initializers_1.getOrCreateUsageMetricsHourlySnapshot)(block);
  usageMetricsDaily.blockNumber = block.number;
  usageMetricsHourly.blockNumber = block.number;
  usageMetricsDaily.timestamp = block.timestamp;
  usageMetricsHourly.timestamp = block.timestamp;
  usageMetricsDaily.dailyTransactionCount += 1;
  usageMetricsHourly.hourlyTransactionCount += 1;
  usageMetricsDaily.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  usageMetricsHourly.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  const dailyActiveAccountId = (
    block.timestamp.toI64() / constants.SECONDS_PER_DAY
  )
    .toString()
    .concat("-")
    .concat(from.toHexString());
  let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
  if (!dailyActiveAccount) {
    dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
    dailyActiveAccount.save();
    usageMetricsDaily.dailyActiveUsers += 1;
    usageMetricsHourly.hourlyActiveUsers += 1;
  }
  usageMetricsDaily.save();
  usageMetricsHourly.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
function updatePoolSnapshots(poolAddress, block) {
  const pool = schema_1.LiquidityPool.load(poolAddress.toHexString());
  if (!pool) return;
  const poolDailySnapshots = (0,
  initializers_1.getOrCreateLiquidityPoolDailySnapshots)(
    poolAddress.toHexString(),
    block
  );
  const poolHourlySnapshots = (0,
  initializers_1.getOrCreateLiquidityPoolHourlySnapshots)(
    poolAddress.toHexString(),
    block
  );
  poolDailySnapshots.totalValueLockedUSD = pool.totalValueLockedUSD;
  poolHourlySnapshots.totalValueLockedUSD = pool.totalValueLockedUSD;
  poolDailySnapshots.inputTokenBalances = pool.inputTokenBalances;
  poolHourlySnapshots.inputTokenBalances = pool.inputTokenBalances;
  poolDailySnapshots.inputTokenWeights = pool.inputTokenWeights;
  poolHourlySnapshots.inputTokenWeights = pool.inputTokenWeights;
  poolDailySnapshots.outputTokenSupply = pool.outputTokenSupply;
  poolHourlySnapshots.outputTokenSupply = pool.outputTokenSupply;
  poolDailySnapshots.outputTokenPriceUSD = pool.outputTokenPriceUSD;
  poolHourlySnapshots.outputTokenPriceUSD = pool.outputTokenPriceUSD;
  poolDailySnapshots.rewardTokenEmissionsAmount =
    pool.rewardTokenEmissionsAmount;
  poolHourlySnapshots.rewardTokenEmissionsAmount =
    pool.rewardTokenEmissionsAmount;
  poolDailySnapshots.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
  poolHourlySnapshots.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
  poolDailySnapshots.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
  poolHourlySnapshots.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
  poolDailySnapshots.cumulativeProtocolSideRevenueUSD =
    pool.cumulativeProtocolSideRevenueUSD;
  poolHourlySnapshots.cumulativeProtocolSideRevenueUSD =
    pool.cumulativeProtocolSideRevenueUSD;
  poolDailySnapshots.cumulativeSupplySideRevenueUSD =
    pool.cumulativeSupplySideRevenueUSD;
  poolHourlySnapshots.cumulativeSupplySideRevenueUSD =
    pool.cumulativeSupplySideRevenueUSD;
  poolDailySnapshots.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
  poolHourlySnapshots.cumulativeTotalRevenueUSD =
    pool.cumulativeTotalRevenueUSD;
  poolDailySnapshots.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
  poolHourlySnapshots.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
  poolDailySnapshots.blockNumber = block.number;
  poolHourlySnapshots.blockNumber = block.number;
  poolDailySnapshots.timestamp = block.timestamp;
  poolHourlySnapshots.timestamp = block.timestamp;
  poolHourlySnapshots.save();
  poolDailySnapshots.save();
}
exports.updatePoolSnapshots = updatePoolSnapshots;
function updateFinancials(block) {
  const protocol = (0, initializers_1.getOrCreateDexAmmProtocol)();
  const financialMetrics = (0,
  initializers_1.getOrCreateFinancialDailySnapshots)(block);
  financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
  financialMetrics.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD;
  financialMetrics.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD;
  financialMetrics.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD;
  financialMetrics.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD;
  financialMetrics.blockNumber = block.number;
  financialMetrics.timestamp = block.timestamp;
  financialMetrics.save();
}
exports.updateFinancials = updateFinancials;
function updateTokenVolume(
  poolAddress,
  tokenAddress,
  tokenAmount,
  tokenAmountUSD,
  block,
  underlying
) {
  if (
    poolAddress ==
    graph_ts_1.Address.fromString("0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d")
  )
    underlying = false;
  if (underlying) return;
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(poolAddress, block);
  const poolDailySnaphot = (0,
  initializers_1.getOrCreateLiquidityPoolDailySnapshots)(
    poolAddress.toHexString(),
    block
  );
  const poolHourlySnaphot = (0,
  initializers_1.getOrCreateLiquidityPoolHourlySnapshots)(
    poolAddress.toHexString(),
    block
  );
  const tokenIndex = pool.inputTokens.indexOf(tokenAddress);
  if (tokenIndex == -1 && !underlying) return;
  const dailyVolumeByTokenAmount = poolDailySnaphot.dailyVolumeByTokenAmount;
  dailyVolumeByTokenAmount[tokenIndex] =
    dailyVolumeByTokenAmount[tokenIndex].plus(tokenAmount);
  const hourlyVolumeByTokenAmount = poolHourlySnaphot.hourlyVolumeByTokenAmount;
  hourlyVolumeByTokenAmount[tokenIndex] =
    hourlyVolumeByTokenAmount[tokenIndex].plus(tokenAmount);
  const dailyVolumeByTokenUSD = poolDailySnaphot.dailyVolumeByTokenUSD;
  dailyVolumeByTokenUSD[tokenIndex] =
    dailyVolumeByTokenUSD[tokenIndex].plus(tokenAmountUSD);
  const hourlyVolumeByTokenUSD = poolHourlySnaphot.hourlyVolumeByTokenUSD;
  hourlyVolumeByTokenUSD[tokenIndex] =
    hourlyVolumeByTokenUSD[tokenIndex].plus(tokenAmountUSD);
  poolDailySnaphot.dailyVolumeByTokenAmount = dailyVolumeByTokenAmount;
  poolHourlySnaphot.hourlyVolumeByTokenAmount = hourlyVolumeByTokenAmount;
  poolDailySnaphot.dailyVolumeByTokenUSD = dailyVolumeByTokenUSD;
  poolHourlySnaphot.hourlyVolumeByTokenUSD = hourlyVolumeByTokenUSD;
  poolHourlySnaphot.save();
  poolDailySnaphot.save();
}
exports.updateTokenVolume = updateTokenVolume;
function updateSnapshotsVolume(poolAddress, volumeUSD, block) {
  const protcol = (0, initializers_1.getOrCreateDexAmmProtocol)();
  const financialsDailySnapshot = (0,
  initializers_1.getOrCreateFinancialDailySnapshots)(block);
  const poolDailySnaphot = (0,
  initializers_1.getOrCreateLiquidityPoolDailySnapshots)(
    poolAddress.toHexString(),
    block
  );
  const poolHourlySnaphot = (0,
  initializers_1.getOrCreateLiquidityPoolHourlySnapshots)(
    poolAddress.toHexString(),
    block
  );
  financialsDailySnapshot.dailyVolumeUSD =
    financialsDailySnapshot.dailyVolumeUSD.plus(volumeUSD);
  poolDailySnaphot.dailyVolumeUSD =
    poolDailySnaphot.dailyVolumeUSD.plus(volumeUSD);
  poolHourlySnaphot.hourlyVolumeUSD =
    poolHourlySnaphot.hourlyVolumeUSD.plus(volumeUSD);
  protcol.cumulativeVolumeUSD = protcol.cumulativeVolumeUSD.plus(volumeUSD);
  financialsDailySnapshot.save();
  poolHourlySnaphot.save();
  poolDailySnaphot.save();
  protcol.save();
}
exports.updateSnapshotsVolume = updateSnapshotsVolume;
function updateProtocolRevenue(liquidityPoolAddress, volumeUSD, block) {
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    liquidityPoolAddress,
    block
  );
  const poolFees = utils.getPoolFees(liquidityPoolAddress);
  const supplySideRevenueUSD = poolFees.getLpFees.times(volumeUSD);
  const protocolSideRevenueUSD = poolFees.getProtocolFees.times(volumeUSD);
  (0, Revenue_1.updateRevenueSnapshots)(
    pool,
    supplySideRevenueUSD,
    protocolSideRevenueUSD,
    block
  );
}
exports.updateProtocolRevenue = updateProtocolRevenue;
