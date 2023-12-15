"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMetrics = exports.updateSupplySideRevenue = exports.updateSnapshotsVolume = exports.updateTokenVolumeAndBalance = exports.updateFinancials = exports.updatePoolSnapshots = exports.updateUsageMetrics = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants = __importStar(require("../common/constants"));
const initializer_1 = require("../common/initializer");
const Revenue_1 = require("./Revenue");
function updateUsageMetrics(block, from) {
    const protocol = (0, initializer_1.getOrCreateDexAmmProtocol)();
    const usageMetricsDaily = (0, initializer_1.getOrCreateUsageMetricsDailySnapshot)(block);
    const usageMetricsHourly = (0, initializer_1.getOrCreateUsageMetricsHourlySnapshot)(block);
    const blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
    usageMetricsDaily.blockNumber = blockNumber;
    usageMetricsHourly.blockNumber = blockNumber;
    const timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
    usageMetricsDaily.timestamp = timestamp;
    usageMetricsHourly.timestamp = timestamp;
    usageMetricsDaily.dailyTransactionCount += 1;
    usageMetricsHourly.hourlyTransactionCount += 1;
    usageMetricsDaily.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsHourly.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    const dailyActiveAccountId = (block.header.time.seconds / constants.SECONDS_PER_DAY)
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
function updatePoolSnapshots(liquidityPoolId, block) {
    const pool = schema_1.LiquidityPool.load(liquidityPoolId);
    if (!pool) {
        return;
    }
    const poolDailySnapshots = (0, initializer_1.getOrCreateLiquidityPoolDailySnapshots)(liquidityPoolId, block);
    const poolHourlySnapshots = (0, initializer_1.getOrCreateLiquidityPoolHourlySnapshots)(liquidityPoolId, block);
    if (!poolDailySnapshots || !poolHourlySnapshots) {
        return;
    }
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
    poolDailySnapshots.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    poolHourlySnapshots.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    poolDailySnapshots.rewardTokenEmissionsAmount =
        pool.rewardTokenEmissionsAmount;
    poolHourlySnapshots.rewardTokenEmissionsAmount =
        pool.rewardTokenEmissionsAmount;
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
    poolDailySnapshots.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
    poolHourlySnapshots.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
    const timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
    poolDailySnapshots.timestamp = timestamp;
    poolHourlySnapshots.timestamp = timestamp;
    poolHourlySnapshots.save();
    poolDailySnapshots.save();
}
exports.updatePoolSnapshots = updatePoolSnapshots;
function updateFinancials(block) {
    const protocol = (0, initializer_1.getOrCreateDexAmmProtocol)();
    const financialMetrics = (0, initializer_1.getOrCreateFinancialDailySnapshots)(block);
    financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialMetrics.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD;
    financialMetrics.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialMetrics.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialMetrics.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    financialMetrics.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
    financialMetrics.timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
    financialMetrics.save();
}
exports.updateFinancials = updateFinancials;
function updateTokenVolumeAndBalance(liquidityPoolId, tokenAddress, tokenAmount, tokenAmountUSD, block) {
    const pool = schema_1.LiquidityPool.load(liquidityPoolId);
    if (!pool) {
        return;
    }
    const poolDailySnaphot = (0, initializer_1.getOrCreateLiquidityPoolDailySnapshots)(liquidityPoolId, block);
    const poolHourlySnaphot = (0, initializer_1.getOrCreateLiquidityPoolHourlySnapshots)(liquidityPoolId, block);
    if (!poolDailySnaphot || !poolHourlySnaphot) {
        return;
    }
    const tokenIndex = pool.inputTokens.indexOf(tokenAddress);
    if (tokenIndex < 0) {
        return;
    }
    const dailyVolumeByTokenAmount = poolDailySnaphot.dailyVolumeByTokenAmount;
    dailyVolumeByTokenAmount[tokenIndex] = dailyVolumeByTokenAmount[tokenIndex].plus(tokenAmount);
    const hourlyVolumeByTokenAmount = poolHourlySnaphot.hourlyVolumeByTokenAmount;
    hourlyVolumeByTokenAmount[tokenIndex] = hourlyVolumeByTokenAmount[tokenIndex].plus(tokenAmount);
    poolDailySnaphot.dailyVolumeByTokenAmount = dailyVolumeByTokenAmount;
    poolHourlySnaphot.hourlyVolumeByTokenAmount = hourlyVolumeByTokenAmount;
    const dailyVolumeByTokenUSD = poolDailySnaphot.dailyVolumeByTokenUSD;
    dailyVolumeByTokenUSD[tokenIndex] = dailyVolumeByTokenUSD[tokenIndex].plus(tokenAmountUSD);
    const hourlyVolumeByTokenUSD = poolHourlySnaphot.hourlyVolumeByTokenUSD;
    hourlyVolumeByTokenUSD[tokenIndex] = hourlyVolumeByTokenUSD[tokenIndex].plus(tokenAmountUSD);
    poolDailySnaphot.dailyVolumeByTokenUSD = dailyVolumeByTokenUSD;
    poolHourlySnaphot.hourlyVolumeByTokenUSD = hourlyVolumeByTokenUSD;
    poolHourlySnaphot.save();
    poolDailySnaphot.save();
}
exports.updateTokenVolumeAndBalance = updateTokenVolumeAndBalance;
function updateSnapshotsVolume(liquidityPoolId, volumeUSD, block) {
    const protocol = (0, initializer_1.getOrCreateDexAmmProtocol)();
    const financialsDailySnapshot = (0, initializer_1.getOrCreateFinancialDailySnapshots)(block);
    const liquidityPool = schema_1.LiquidityPool.load(liquidityPoolId);
    if (!liquidityPool) {
        return;
    }
    const poolDailySnaphot = (0, initializer_1.getOrCreateLiquidityPoolDailySnapshots)(liquidityPoolId, block);
    const poolHourlySnaphot = (0, initializer_1.getOrCreateLiquidityPoolHourlySnapshots)(liquidityPoolId, block);
    if (!poolDailySnaphot || !poolHourlySnaphot) {
        return;
    }
    const blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
    const timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
    protocol.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD.plus(volumeUSD);
    financialsDailySnapshot.dailyVolumeUSD = financialsDailySnapshot.dailyVolumeUSD.plus(volumeUSD);
    financialsDailySnapshot.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD;
    financialsDailySnapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialsDailySnapshot.blockNumber = blockNumber;
    financialsDailySnapshot.timestamp = timestamp;
    poolDailySnaphot.dailyVolumeUSD = poolDailySnaphot.dailyVolumeUSD.plus(volumeUSD);
    poolDailySnaphot.cumulativeVolumeUSD = liquidityPool.cumulativeVolumeUSD;
    poolDailySnaphot.totalValueLockedUSD = liquidityPool.totalValueLockedUSD;
    poolDailySnaphot.inputTokenBalances = liquidityPool.inputTokenBalances;
    poolDailySnaphot.inputTokenWeights = liquidityPool.inputTokenWeights;
    poolDailySnaphot.outputTokenSupply = liquidityPool.outputTokenSupply;
    poolDailySnaphot.outputTokenPriceUSD = liquidityPool.outputTokenPriceUSD;
    poolDailySnaphot.blockNumber = blockNumber;
    poolDailySnaphot.timestamp = timestamp;
    poolHourlySnaphot.hourlyVolumeUSD = poolHourlySnaphot.hourlyVolumeUSD.plus(volumeUSD);
    poolHourlySnaphot.cumulativeVolumeUSD = liquidityPool.cumulativeVolumeUSD;
    poolHourlySnaphot.totalValueLockedUSD = liquidityPool.totalValueLockedUSD;
    poolHourlySnaphot.inputTokenBalances = liquidityPool.inputTokenBalances;
    poolHourlySnaphot.inputTokenWeights = liquidityPool.inputTokenWeights;
    poolHourlySnaphot.outputTokenSupply = liquidityPool.outputTokenSupply;
    poolHourlySnaphot.outputTokenPriceUSD = liquidityPool.outputTokenPriceUSD;
    poolHourlySnaphot.blockNumber = blockNumber;
    poolHourlySnaphot.timestamp = timestamp;
    protocol.save();
    financialsDailySnapshot.save();
    poolDailySnaphot.save();
    poolHourlySnaphot.save();
}
exports.updateSnapshotsVolume = updateSnapshotsVolume;
function updateSupplySideRevenue(liquidityPoolId, volumeUSD, block) {
    const pool = schema_1.LiquidityPool.load(liquidityPoolId);
    if (!pool) {
        return;
    }
    const poolFees = pool.fees;
    if (!poolFees || poolFees.length != 3) {
        return;
    }
    const tradingFee = schema_1.LiquidityPoolFee.load(poolFees[0]);
    if (!tradingFee || !tradingFee.feePercentage) {
        return;
    }
    const supplySideRevenueUSD = volumeUSD
        .times(tradingFee.feePercentage)
        .div(constants.BIGDECIMAL_HUNDRED);
    (0, Revenue_1.updateRevenueSnapshots)(pool, supplySideRevenueUSD, constants.BIGDECIMAL_ZERO, block);
}
exports.updateSupplySideRevenue = updateSupplySideRevenue;
function updateMetrics(block, from, usageType) {
    const protocol = (0, initializer_1.getOrCreateDexAmmProtocol)();
    // Update hourly and daily deposit transaction count
    const metricsDailySnapshot = (0, initializer_1.getOrCreateUsageMetricsDailySnapshot)(block);
    const metricsHourlySnapshot = (0, initializer_1.getOrCreateUsageMetricsHourlySnapshot)(block);
    metricsDailySnapshot.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
    metricsDailySnapshot.timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
    metricsDailySnapshot.dailyTransactionCount += 1;
    metricsHourlySnapshot.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
    metricsHourlySnapshot.timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
    metricsHourlySnapshot.hourlyTransactionCount += 1;
    if (usageType == constants.UsageType.DEPOSIT) {
        metricsDailySnapshot.dailyDepositCount += 1;
        metricsHourlySnapshot.hourlyDepositCount += 1;
    }
    else if (usageType == constants.UsageType.WITHDRAW) {
        metricsDailySnapshot.dailyWithdrawCount += 1;
        metricsHourlySnapshot.hourlyWithdrawCount += 1;
    }
    else if (usageType == constants.UsageType.SWAP) {
        metricsDailySnapshot.dailySwapCount += 1;
        metricsHourlySnapshot.hourlySwapCount += 1;
    }
    // Number of days since Unix epoch
    const day = block.header.time.seconds / constants.SECONDS_PER_DAY;
    const hour = block.header.time.seconds / constants.SECONDS_PER_HOUR;
    const dayId = day.toString();
    const hourId = hour.toString();
    // Combine the id and the user address to generate a unique user id for the day
    const dailyActiveAccountId = from.concat("-").concat(dayId);
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        metricsDailySnapshot.dailyActiveUsers += 1;
        dailyActiveAccount.save();
    }
    const hourlyActiveAccountId = from.concat("-").concat(hourId);
    let hourlyActiveAccount = schema_1.ActiveAccount.load(hourlyActiveAccountId);
    if (!hourlyActiveAccount) {
        hourlyActiveAccount = new schema_1.ActiveAccount(hourlyActiveAccountId);
        metricsHourlySnapshot.hourlyActiveUsers += 1;
        hourlyActiveAccount.save();
    }
    let account = schema_1.Account.load(from);
    if (!account) {
        account = new schema_1.Account(from);
        protocol.cumulativeUniqueUsers += 1;
        account.save();
    }
    metricsDailySnapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    metricsHourlySnapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    metricsDailySnapshot.save();
    metricsHourlySnapshot.save();
    protocol.save();
}
exports.updateMetrics = updateMetrics;
