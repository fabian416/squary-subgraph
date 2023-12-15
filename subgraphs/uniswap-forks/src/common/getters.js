"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateRewardToken = exports.getOrCreateLPToken = exports.getOrCreateToken = exports.getOrCreateFinancialsDailySnapshot = exports.getOrCreateLiquidityPoolHourlySnapshot = exports.getOrCreateLiquidityPoolDailySnapshot = exports.getOrCreateUsageMetricHourlySnapshot = exports.getOrCreateUsageMetricDailySnapshot = exports.getOrCreateTransfer = exports.getOrCreateTokenWhitelist = exports.getLiquidityPoolFee = exports.getLiquidityPoolAmounts = exports.getLiquidityPool = exports.getOrCreateProtocol = void 0;
// import { log } from "@graphprotocol/graph-ts";
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../configurations/configure");
const TokenABI_1 = require("../../generated/Factory/TokenABI");
const schema_1 = require("../../generated/schema");
const versions_1 = require("../versions");
const constants_1 = require("./constants");
const price_1 = require("../price/price");
function getOrCreateProtocol() {
    let protocol = schema_1.DexAmmProtocol.load(configure_1.NetworkConfigs.getFactoryAddress());
    if (!protocol) {
        protocol = new schema_1.DexAmmProtocol(configure_1.NetworkConfigs.getFactoryAddress());
        protocol.name = configure_1.NetworkConfigs.getProtocolName();
        protocol.slug = configure_1.NetworkConfigs.getProtocolSlug();
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.network = configure_1.NetworkConfigs.getNetwork();
        protocol.type = constants_1.ProtocolType.EXCHANGE;
        protocol.totalPoolCount = constants_1.INT_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
function getLiquidityPool(poolAddress) {
    const pool = schema_1.LiquidityPool.load(poolAddress);
    return pool;
}
exports.getLiquidityPool = getLiquidityPool;
function getLiquidityPoolAmounts(poolAddress) {
    return schema_1._LiquidityPoolAmount.load(poolAddress);
}
exports.getLiquidityPoolAmounts = getLiquidityPoolAmounts;
function getLiquidityPoolFee(id) {
    return schema_1.LiquidityPoolFee.load(id);
}
exports.getLiquidityPoolFee = getLiquidityPoolFee;
function getOrCreateTokenWhitelist(tokenAddress) {
    let tokenTracker = schema_1._TokenWhitelist.load(tokenAddress);
    // fetch info if null
    if (!tokenTracker) {
        tokenTracker = new schema_1._TokenWhitelist(tokenAddress);
        tokenTracker.whitelistPools = [];
        tokenTracker.save();
    }
    return tokenTracker;
}
exports.getOrCreateTokenWhitelist = getOrCreateTokenWhitelist;
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
function getOrCreateUsageMetricDailySnapshot(event) {
    // Number of days since Unix epoch
    const id = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const dayId = id.toString();
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(dayId);
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(dayId);
        usageMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
        usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.dailyDepositCount = constants_1.INT_ZERO;
        usageMetrics.dailyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.dailySwapCount = constants_1.INT_ZERO;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        const protocol = getOrCreateProtocol();
        usageMetrics.totalPoolCount = protocol.totalPoolCount;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricDailySnapshot = getOrCreateUsageMetricDailySnapshot;
function getOrCreateUsageMetricHourlySnapshot(event) {
    // Number of days since Unix epoch
    const hour = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const hourId = hour.toString();
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(hourId);
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(hourId);
        usageMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
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
function getOrCreateLiquidityPoolDailySnapshot(event) {
    const day = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const dayId = day.toString();
    let poolMetrics = schema_1.LiquidityPoolDailySnapshot.load(event.address.toHexString().concat("-").concat(dayId));
    if (!poolMetrics) {
        poolMetrics = new schema_1.LiquidityPoolDailySnapshot(event.address.toHexString().concat("-").concat(dayId));
        poolMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        poolMetrics.pool = event.address.toHexString();
        poolMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyVolumeByTokenAmount = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
        poolMetrics.dailyVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
        poolMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.inputTokenBalances = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
        poolMetrics.inputTokenWeights = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
        poolMetrics.blockNumber = event.block.number;
        poolMetrics.timestamp = event.block.timestamp;
        poolMetrics.save();
    }
    return poolMetrics;
}
exports.getOrCreateLiquidityPoolDailySnapshot = getOrCreateLiquidityPoolDailySnapshot;
function getOrCreateLiquidityPoolHourlySnapshot(event) {
    const hour = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const hourId = hour.toString();
    let poolMetrics = schema_1.LiquidityPoolHourlySnapshot.load(event.address.toHexString().concat("-").concat(hourId));
    if (!poolMetrics) {
        poolMetrics = new schema_1.LiquidityPoolHourlySnapshot(event.address.toHexString().concat("-").concat(hourId));
        poolMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        poolMetrics.pool = event.address.toHexString();
        poolMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyVolumeByTokenAmount = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
        poolMetrics.hourlyVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
        poolMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.inputTokenBalances = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
        poolMetrics.inputTokenWeights = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
        poolMetrics.blockNumber = event.block.number;
        poolMetrics.timestamp = event.block.timestamp;
        poolMetrics.save();
    }
    return poolMetrics;
}
exports.getOrCreateLiquidityPoolHourlySnapshot = getOrCreateLiquidityPoolHourlySnapshot;
function getOrCreateFinancialsDailySnapshot(event) {
    // Number of days since Unix epoch
    const dayID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const id = dayID.toString();
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(id);
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(id);
        financialMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        financialMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.blockNumber = event.block.number;
        financialMetrics.timestamp = event.block.timestamp;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancialsDailySnapshot = getOrCreateFinancialsDailySnapshot;
function getOrCreateToken(event, address, getNewPrice = true) {
    let token = schema_1.Token.load(address);
    if (!token) {
        token = new schema_1.Token(address);
        let name = "";
        let symbol = "";
        let decimals = constants_1.DEFAULT_DECIMALS;
        if (!configure_1.NetworkConfigs.getBrokenERC20Tokens().includes(address)) {
            const erc20Contract = TokenABI_1.TokenABI.bind(graph_ts_1.Address.fromString(address));
            // TODO: add overrides for name and symbol
            const nameCall = erc20Contract.try_name();
            if (!nameCall.reverted)
                name = nameCall.value;
            const symbolCall = erc20Contract.try_symbol();
            if (!symbolCall.reverted)
                symbol = symbolCall.value;
            const decimalsCall = erc20Contract.try_decimals();
            if (!decimalsCall.reverted)
                decimals = decimalsCall.value;
        }
        token.name = name;
        token.symbol = symbol;
        token.decimals = decimals;
        token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        token.lastPriceBlockNumber = constants_1.BIGINT_ZERO;
        token._totalSupply = constants_1.BIGINT_ZERO;
        token._totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        token._largeTVLImpactBuffer = 0;
        token._largePriceChangeBuffer = 0;
        token.save();
    }
    if (token.lastPriceBlockNumber &&
        event.block.number.minus(token.lastPriceBlockNumber).gt(constants_1.BIGINT_TEN) &&
        getNewPrice) {
        const newPrice = (0, price_1.findUSDPricePerToken)(event, token);
        token.lastPriceUSD = newPrice;
        token.lastPriceBlockNumber = event.block.number;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateLPToken(tokenAddress, token0, token1) {
    let token = schema_1.Token.load(tokenAddress);
    // fetch info if null
    if (token === null) {
        token = new schema_1.Token(tokenAddress);
        token.symbol = token0.name + "/" + token1.name;
        token.name = token0.name + "/" + token1.name + " LP";
        token.decimals = constants_1.DEFAULT_DECIMALS;
        token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        token.lastPriceBlockNumber = constants_1.BIGINT_ZERO;
        token._totalSupply = constants_1.BIGINT_ZERO;
        token._totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        token._largeTVLImpactBuffer = 0;
        token._largePriceChangeBuffer = 0;
        token.save();
    }
    return token;
}
exports.getOrCreateLPToken = getOrCreateLPToken;
function getOrCreateRewardToken(event, address) {
    let rewardToken = schema_1.RewardToken.load(address);
    if (rewardToken == null) {
        const token = getOrCreateToken(event, address);
        rewardToken = new schema_1.RewardToken(constants_1.RewardTokenType.DEPOSIT + "-" + address);
        rewardToken.token = token.id;
        rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
        rewardToken.save();
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
