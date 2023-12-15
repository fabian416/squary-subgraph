"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiquidityGauge = exports.getOrCreateTransfer = exports.getDaysSinceEpoch = exports.getOrCreateDex = exports.getOrCreateFinancialsDailySnapshot = exports.getOrCreateLiquidityPoolHourlySnapshot = exports.getOrCreateLiquidityPoolDailySnapshot = exports.getOrCreateUsageMetricHourlySnapshot = exports.getOrCreateUsageMetricDailySnapshot = exports.getLiquidityPool = exports.getOrCreateRewardToken = exports.getOrCreateToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const tokens_1 = require("./tokens");
const constants_1 = require("../common/constants");
const versions_1 = require("../versions");
const schema_1 = require("../../generated/schema");
function getOrCreateToken(tokenAddress) {
    const tokenId = tokenAddress.toHexString();
    let token = schema_1.Token.load(tokenId);
    // fetch info if null
    if (!token) {
        token = new schema_1.Token(tokenId);
        token.symbol = (0, tokens_1.fetchTokenSymbol)(tokenAddress);
        token.name = (0, tokens_1.fetchTokenName)(tokenAddress);
        token.decimals = (0, tokens_1.fetchTokenDecimals)(tokenAddress);
        token.lastPriceUSD =
            tokenAddress == graph_ts_1.Address.fromString(constants_1.USDC_ADDRESS)
                ? constants_1.BIGDECIMAL_ONE
                : constants_1.BIGDECIMAL_ZERO;
        token.lastPriceBlockNumber = constants_1.BIGINT_ZERO;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(address) {
    const rewardTokenId = constants_1.RewardTokenType.DEPOSIT.toString()
        .concat("-")
        .concat(address.toHex());
    let rewardToken = schema_1.RewardToken.load(rewardTokenId);
    if (rewardToken == null) {
        const token = getOrCreateToken(address);
        rewardToken = new schema_1.RewardToken(rewardTokenId);
        rewardToken.token = token.id;
        rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
        rewardToken.save();
        return rewardToken;
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getLiquidityPool(poolAddress) {
    return schema_1.LiquidityPool.load(poolAddress.toHex());
}
exports.getLiquidityPool = getLiquidityPool;
function getOrCreateUsageMetricDailySnapshot(protocol, event) {
    // Number of days since Unix epoch
    const id = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const dayId = id.toString();
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(dayId);
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(dayId);
        usageMetrics.protocol = protocol.id;
        usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
        usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.dailyDepositCount = constants_1.INT_ZERO;
        usageMetrics.dailyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.dailySwapCount = constants_1.INT_ZERO;
        usageMetrics.totalPoolCount = constants_1.INT_ZERO;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricDailySnapshot = getOrCreateUsageMetricDailySnapshot;
function getOrCreateUsageMetricHourlySnapshot(protocol, event) {
    // Number of days since Unix epoch
    const hour = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const hourId = hour.toString();
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(hourId);
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(hourId);
        usageMetrics.protocol = protocol.id;
        usageMetrics.hourlyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
        usageMetrics.hourlyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.hourlyDepositCount = constants_1.INT_ZERO;
        usageMetrics.hourlyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.hourlySwapCount = constants_1.INT_ZERO;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricHourlySnapshot = getOrCreateUsageMetricHourlySnapshot;
function getOrCreateLiquidityPoolDailySnapshot(pool, block) {
    const day = block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const dayId = day.toString();
    let poolMetrics = schema_1.LiquidityPoolDailySnapshot.load(pool.id.concat("-").concat(dayId));
    if (!poolMetrics) {
        poolMetrics = new schema_1.LiquidityPoolDailySnapshot(pool.id.concat("-").concat(dayId));
        poolMetrics.protocol = pool.protocol;
        poolMetrics.pool = pool.id;
        poolMetrics.blockNumber = block.number;
        poolMetrics.timestamp = block.timestamp;
        poolMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
        poolMetrics.cumulativeSupplySideRevenueUSD =
            pool.cumulativeSupplySideRevenueUSD;
        poolMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeProtocolSideRevenueUSD =
            pool.cumulativeProtocolSideRevenueUSD;
        poolMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
        poolMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyVolumeByTokenAmount = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
        poolMetrics.dailyVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
        poolMetrics.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
        poolMetrics.inputTokenBalances = pool.inputTokenBalances;
        poolMetrics.inputTokenWeights = pool.inputTokenWeights;
        // poolMetrics.outputTokenSupply = pool.outputTokenSupply
        // poolMetrics.outputTokenPriceUSD = pool.outputTokenPriceUSD
        poolMetrics.save();
    }
    return poolMetrics;
}
exports.getOrCreateLiquidityPoolDailySnapshot = getOrCreateLiquidityPoolDailySnapshot;
function getOrCreateLiquidityPoolHourlySnapshot(pool, block) {
    const hour = block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const hourId = hour.toString();
    let poolMetrics = schema_1.LiquidityPoolHourlySnapshot.load(pool.id.concat("-").concat(hourId));
    if (!poolMetrics) {
        poolMetrics = new schema_1.LiquidityPoolHourlySnapshot(pool.id.concat("-").concat(hourId));
        poolMetrics.protocol = pool.protocol;
        poolMetrics.pool = pool.id;
        poolMetrics.blockNumber = block.number;
        poolMetrics.timestamp = block.timestamp;
        poolMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
        poolMetrics.cumulativeSupplySideRevenueUSD =
            pool.cumulativeSupplySideRevenueUSD;
        poolMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeProtocolSideRevenueUSD =
            pool.cumulativeProtocolSideRevenueUSD;
        poolMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
        poolMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyVolumeByTokenAmount = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
        poolMetrics.hourlyVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
        poolMetrics.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
        poolMetrics.inputTokenBalances = pool.inputTokenBalances;
        poolMetrics.inputTokenWeights = pool.inputTokenWeights;
        // poolMetrics.outputTokenSupply = pool.outputTokenSupply
        // poolMetrics.outputTokenPriceUSD = pool.outputTokenPriceUSD
        poolMetrics.blockNumber = block.number;
        poolMetrics.timestamp = block.timestamp;
        poolMetrics.save();
    }
    return poolMetrics;
}
exports.getOrCreateLiquidityPoolHourlySnapshot = getOrCreateLiquidityPoolHourlySnapshot;
function getOrCreateFinancialsDailySnapshot(protocol, event) {
    // Number of days since Unix epoch
    const dayID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const id = dayID.toString();
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(id);
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(id);
        financialMetrics.protocol = protocol.id;
        financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
        financialMetrics.dailyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD =
            protocol.cumulativeSupplySideRevenueUSD;
        financialMetrics.cumulativeProtocolSideRevenueUSD =
            protocol.cumulativeProtocolSideRevenueUSD;
        financialMetrics.cumulativeTotalRevenueUSD =
            protocol.cumulativeTotalRevenueUSD;
        financialMetrics.blockNumber = event.block.number;
        financialMetrics.timestamp = event.block.timestamp;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancialsDailySnapshot = getOrCreateFinancialsDailySnapshot;
///////////////////////////
///// DexAmm Specific /////
///////////////////////////
function getOrCreateDex(protocolId, protocolName, protocolSlug) {
    let protocol = schema_1.DexAmmProtocol.load(protocolId);
    if (!protocol) {
        protocol = new schema_1.DexAmmProtocol(protocolId);
        protocol.name = protocolName;
        protocol.slug = protocolSlug;
        protocol.network = constants_1.Network.OPTIMISM; // Need to change this
        protocol.type = constants_1.ProtocolType.EXCHANGE;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.totalPoolCount = constants_1.INT_ZERO;
        protocol._stableFee = graph_ts_1.BigDecimal.fromString("0.02"); // Value hardcoded in factory constructor
        protocol._volatileFee = graph_ts_1.BigDecimal.fromString("0.02"); // Value hardcoded in factory constructor
        protocol._stablePools = [];
        protocol._volatilePools = [];
        protocol._lastFeeCheckBlockNumber = constants_1.BIGINT_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateDex = getOrCreateDex;
function getDaysSinceEpoch(secondsSinceEpoch) {
    return Math.floor(secondsSinceEpoch / constants_1.SECONDS_PER_DAY).toString();
}
exports.getDaysSinceEpoch = getDaysSinceEpoch;
function getOrCreateTransfer(event) {
    let transfer = schema_1._Transfer.load(event.transaction.hash.toHexString());
    if (!transfer) {
        transfer = new schema_1._Transfer(event.transaction.hash.toHexString());
        transfer.blockNumber = event.block.number;
        transfer.timestamp = event.block.timestamp;
    }
    transfer.save();
    return transfer;
}
exports.getOrCreateTransfer = getOrCreateTransfer;
function getLiquidityGauge(gaugeAddress) {
    return schema_1._LiquidityGauge.load(gaugeAddress.toHex());
}
exports.getLiquidityGauge = getLiquidityGauge;
