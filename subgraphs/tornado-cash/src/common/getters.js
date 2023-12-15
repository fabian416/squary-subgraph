"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateFinancialsDailySnapshot = exports.getOrCreateUsageMetricHourlySnapshot = exports.getOrCreateUsageMetricDailySnapshot = exports.getOrCreatePoolHourlySnapshot = exports.getOrCreatePoolDailySnapshot = exports.getOrCreatePool = exports.getOrCreateRewardToken = exports.getOrCreateToken = exports.getOrCreateProtocol = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const tokens_1 = require("./tokens");
const constants_1 = require("./constants");
const prices_1 = require("../prices");
const arrays_1 = require("./utils/arrays");
const numbers_1 = require("./utils/numbers");
const datetime_1 = require("./utils/datetime");
const configure_1 = require("../../configurations/configure");
const TornadoCashERC20_1 = require("../../generated/TornadoCash01/TornadoCashERC20");
const schema_1 = require("../../generated/schema");
const versions_1 = require("../versions");
function getOrCreateProtocol() {
    let protocol = schema_1.Protocol.load(configure_1.NetworkConfigs.getFactoryAddress());
    if (!protocol) {
        protocol = new schema_1.Protocol(configure_1.NetworkConfigs.getFactoryAddress());
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = configure_1.NetworkConfigs.getNetwork();
        protocol.type = constants_1.ProtocolType.GENERIC;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = 0;
        protocol.totalPoolCount = 0;
        protocol.pools = [];
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
function getOrCreateToken(tokenAddress, blockNumber) {
    let token = schema_1.Token.load(tokenAddress.toHexString());
    if (!token) {
        token = new schema_1.Token(tokenAddress.toHexString());
        if ((0, tokens_1.isNativeToken)(tokenAddress)) {
            const conf = configure_1.NetworkConfigs.getNativeToken();
            token.name = conf.get("name");
            token.symbol = conf.get("symbol");
            token.decimals = parseInt(conf.get("decimals"));
        }
        else if ((0, tokens_1.isRewardToken)(tokenAddress)) {
            const conf = configure_1.NetworkConfigs.getRewardToken();
            token.name = conf.get("name");
            token.symbol = conf.get("symbol");
            token.decimals = parseInt(conf.get("decimals"));
        }
        else {
            token.name = (0, tokens_1.fetchTokenName)(tokenAddress);
            token.symbol = (0, tokens_1.fetchTokenSymbol)(tokenAddress);
            token.decimals = (0, tokens_1.fetchTokenDecimals)(tokenAddress);
        }
        token.lastPriceBlockNumber = blockNumber;
    }
    if (!token.lastPriceUSD || token.lastPriceBlockNumber < blockNumber) {
        const price = (0, prices_1.getUsdPricePerToken)(tokenAddress, blockNumber);
        if (price.reverted) {
            token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        }
        else {
            token.lastPriceUSD = price.usdPrice.div(price.decimalsBaseTen);
        }
        token.lastPriceBlockNumber = blockNumber;
    }
    token.save();
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(address, blockNumber) {
    let rewardToken = schema_1.RewardToken.load(constants_1.RewardTokenType.DEPOSIT.concat("-").concat(address.toHexString()));
    if (!rewardToken) {
        const token = getOrCreateToken(address, blockNumber);
        rewardToken = new schema_1.RewardToken(constants_1.RewardTokenType.DEPOSIT.concat("-").concat(address.toHexString()));
        rewardToken.token = token.id;
        rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
        rewardToken.save();
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getOrCreatePool(poolAddress, event) {
    let pool = schema_1.Pool.load(poolAddress);
    if (!pool) {
        pool = new schema_1.Pool(poolAddress);
        let token;
        const contractTCERC20 = TornadoCashERC20_1.TornadoCashERC20.bind(graph_ts_1.Address.fromString(poolAddress));
        const token_call = contractTCERC20.try_token();
        if (!token_call.reverted) {
            token = getOrCreateToken(token_call.value, event.block.number);
        }
        else {
            token = getOrCreateToken(graph_ts_1.Address.fromString(configure_1.NetworkConfigs.getNativeToken().get("address")), event.block.number);
        }
        pool.inputTokens = [token.id];
        const denomination = configure_1.NetworkConfigs.getPoolDenomination((0, tokens_1.isNativeToken)(graph_ts_1.Address.fromString(token.id)), poolAddress);
        pool.name = `TornadoCash ${(0, numbers_1.bigIntToBigDecimal)(denomination, token.decimals)}${token.symbol}`;
        pool.symbol = `${(0, numbers_1.bigIntToBigDecimal)(denomination, token.decimals)}${token.symbol}`;
        pool._denomination = denomination;
        pool.rewardTokens = [
            getOrCreateRewardToken(graph_ts_1.Address.fromString(configure_1.NetworkConfigs.getRewardToken().get("address")), event.block.number).id,
        ];
        pool._apEmissionsAmount = [constants_1.BIGINT_ZERO];
        pool.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
        pool.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
        pool.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        pool._fee = constants_1.BIGINT_ZERO;
        pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.inputTokenBalances = [constants_1.BIGINT_ZERO];
        pool.inputTokenBalancesUSD = [constants_1.BIGDECIMAL_ZERO];
        pool.createdTimestamp = event.block.timestamp;
        pool.createdBlockNumber = event.block.number;
        pool.save();
        const protocol = getOrCreateProtocol();
        protocol.pools = (0, arrays_1.addToArrayAtIndex)(protocol.pools, pool.id);
        protocol.totalPoolCount = protocol.totalPoolCount + 1;
        protocol.save();
    }
    return pool;
}
exports.getOrCreatePool = getOrCreatePool;
function getOrCreatePoolDailySnapshot(event) {
    const dayId = (0, datetime_1.getDaysSinceEpoch)(event.block.timestamp.toI32());
    let poolMetrics = schema_1.PoolDailySnapshot.load(event.address.toHexString().concat("-").concat(dayId));
    if (!poolMetrics) {
        poolMetrics = new schema_1.PoolDailySnapshot(event.address.toHexString().concat("-").concat(dayId));
        poolMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        poolMetrics.pool = event.address.toHexString();
        poolMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.inputTokenBalances = [constants_1.BIGINT_ZERO];
        poolMetrics.inputTokenBalancesUSD = [constants_1.BIGDECIMAL_ZERO];
        poolMetrics.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
        poolMetrics.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
        poolMetrics.blockNumber = event.block.number;
        poolMetrics.timestamp = event.block.timestamp;
        poolMetrics.save();
    }
    return poolMetrics;
}
exports.getOrCreatePoolDailySnapshot = getOrCreatePoolDailySnapshot;
function getOrCreatePoolHourlySnapshot(event) {
    const hourId = (0, datetime_1.getHoursSinceEpoch)(event.block.timestamp.toI32());
    let poolMetrics = schema_1.PoolHourlySnapshot.load(event.address.toHexString().concat("-").concat(hourId));
    if (!poolMetrics) {
        poolMetrics = new schema_1.PoolHourlySnapshot(event.address.toHexString().concat("-").concat(hourId));
        poolMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        poolMetrics.pool = event.address.toHexString();
        poolMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.inputTokenBalances = [constants_1.BIGINT_ZERO];
        poolMetrics.inputTokenBalancesUSD = [constants_1.BIGDECIMAL_ZERO];
        poolMetrics.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
        poolMetrics.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
        poolMetrics.blockNumber = event.block.number;
        poolMetrics.timestamp = event.block.timestamp;
        poolMetrics.save();
    }
    return poolMetrics;
}
exports.getOrCreatePoolHourlySnapshot = getOrCreatePoolHourlySnapshot;
function getOrCreateUsageMetricDailySnapshot(event) {
    const dayId = (0, datetime_1.getDaysSinceEpoch)(event.block.timestamp.toI32());
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(dayId);
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(dayId);
        usageMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
        usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.totalPoolCount = constants_1.INT_ZERO;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricDailySnapshot = getOrCreateUsageMetricDailySnapshot;
function getOrCreateUsageMetricHourlySnapshot(event) {
    const hourId = (0, datetime_1.getHoursSinceEpoch)(event.block.timestamp.toI32());
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(hourId);
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(hourId);
        usageMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        usageMetrics.hourlyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
        usageMetrics.hourlyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricHourlySnapshot = getOrCreateUsageMetricHourlySnapshot;
function getOrCreateFinancialsDailySnapshot(event) {
    const dayId = (0, datetime_1.getDaysSinceEpoch)(event.block.timestamp.toI32());
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(dayId);
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(dayId);
        financialMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        financialMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
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
