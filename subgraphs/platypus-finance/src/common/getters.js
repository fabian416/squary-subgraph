"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateRewardToken = exports.getOrCreateAsset = exports.getOrCreateDexAmm = exports.getOrCreateFinancialsDailySnapshot = exports.getOrCreateLiquidityPoolHourlySnapshot = exports.getOrCreateLiquidityPoolDailySnapshot = exports.getOrCreateHourlyUsageMetricSnapshot = exports.getOrCreateDailyUsageMetricSnapshot = exports.getAssetAddressForPoolToken = exports.getOrCreateAssetPool = exports.getTokenHelperId = exports.getOrCreateLiquidityPoolParamsHelper = exports.getOrCreateToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const graph_ts_2 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const tokens_1 = require("./tokens");
const constants_1 = require("../common/constants");
const numbers_1 = require("./utils/numbers");
const prices_1 = require("../prices");
const versions_1 = require("../versions");
function getOrCreateToken(event, tokenAddress) {
    let token = schema_1.Token.load(tokenAddress.toHexString());
    // fetch info if null
    if (!token) {
        token = new schema_1.Token(tokenAddress.toHexString());
        token.symbol = (0, tokens_1.fetchTokenSymbol)(tokenAddress);
        token.name = (0, tokens_1.fetchTokenName)(tokenAddress);
        token.decimals = (0, tokens_1.fetchTokenDecimals)(tokenAddress);
        token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        token.lastPriceBlockNumber = event.block.number;
    }
    if (token.lastPriceBlockNumber && token.lastPriceBlockNumber < event.block.number) {
        token.lastPriceUSD = (0, prices_1.getUsdPrice)(tokenAddress, graph_ts_2.BigDecimal.fromString("1"));
        if (!token.lastPriceUSD) {
            token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        }
        token.lastPriceBlockNumber = event.block.number;
    }
    token.save();
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateLiquidityPoolParamsHelper(event, poolAddress) {
    let poolParam = schema_1._LiquidityPoolParamsHelper.load(poolAddress.toHexString());
    if (!poolParam) {
        poolParam = new schema_1._LiquidityPoolParamsHelper(poolAddress.toHexString());
        poolParam.SlippageParamsK = graph_ts_2.BigDecimal.fromString("0.00002e18");
        poolParam.SlippageParamsN = graph_ts_2.BigDecimal.fromString("7");
        poolParam.SlippageParamsC1 = graph_ts_2.BigDecimal.fromString("376927610599998308");
        poolParam.SlippageParamsXThreshold = graph_ts_2.BigDecimal.fromString("329811659274998519");
        poolParam.HaircutRate = graph_ts_2.BigDecimal.fromString("0.0003e18");
        poolParam.RetentionRatio = (0, numbers_1.exponentToBigDecimal)(18);
        poolParam.PriceDeviation = graph_ts_2.BigDecimal.fromString("0.02e18");
        poolParam.updateBlockNumber = event.block.number;
        poolParam.save();
    }
    return poolParam;
}
exports.getOrCreateLiquidityPoolParamsHelper = getOrCreateLiquidityPoolParamsHelper;
function getOrCreateLiquidityPoolFeeType(feeType, poolAddress) {
    const id = feeType.concat("-").concat(poolAddress.toHexString());
    let liquidityPoolFee = schema_1.LiquidityPoolFee.load(id);
    if (!liquidityPoolFee) {
        liquidityPoolFee = new schema_1.LiquidityPoolFee(id);
        liquidityPoolFee.feeType = feeType;
        liquidityPoolFee.save();
    }
    return liquidityPoolFee;
}
function getOrCreateLiquidityPoolFeeTypes(poolAddress) {
    const tradingFee = getOrCreateLiquidityPoolFeeType(constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE, poolAddress);
    const withdrawFee = getOrCreateLiquidityPoolFeeType(constants_1.LiquidityPoolFeeType.WITHDRAWAL_FEE, poolAddress);
    const depositFee = getOrCreateLiquidityPoolFeeType(constants_1.LiquidityPoolFeeType.DEPOSIT_FEE, poolAddress);
    return [tradingFee.id, withdrawFee.id, depositFee.id];
}
function addPoolToProtocol(poolId, ignore) {
    const protocol = getOrCreateDexAmm();
    const _pools = protocol.pools;
    if (!ignore && !_pools.includes(poolId)) {
        _pools.push(poolId);
        protocol.pools = _pools.sort();
        protocol.totalPoolCount = _pools.length;
        protocol.save();
    }
}
function getTokenHelperId(poolAddress, tokenAddress) {
    return poolAddress.toHexString().concat("-").concat(tokenAddress.toHexString());
}
exports.getTokenHelperId = getTokenHelperId;
function indexAssetForPoolToken(poolAddress, assetAddress, tokenAddress) {
    const id = getTokenHelperId(poolAddress, tokenAddress);
    let helper = schema_1._LiquidityPoolAssetTokenHelper.load(id);
    if (!helper) {
        helper = new schema_1._LiquidityPoolAssetTokenHelper(id);
        helper.asset = assetAddress.toHexString();
        helper.save();
    }
}
function getOrCreateAssetPool(event, assetAddress, poolAddress, tokenAddress) {
    const poolId = assetAddress.toHexString();
    let pool = schema_1.LiquidityPool.load(poolId);
    if (!pool) {
        pool = new schema_1.LiquidityPool(poolId);
        pool.poolAddress = poolAddress.toHexString();
        pool.protocol = constants_1.PROTOCOL_ADMIN;
        pool.fees = getOrCreateLiquidityPoolFeeTypes(poolAddress);
        const token = getOrCreateToken(event, tokenAddress);
        const detail = constants_1.poolDetail.fromAddress(poolAddress.toHexString());
        pool.name = token.symbol.concat(" on ").concat(detail.name);
        pool.symbol = token.symbol.concat("-").concat(detail.symbol);
        pool.inputTokens = [token.id];
        pool.outputToken = getOrCreateToken(event, assetAddress).id;
        pool.inputTokenBalances = [constants_1.BIGINT_ZERO];
        pool._ignore = detail.ignore;
        pool.isSingleSided = true;
        pool.createdBlockNumber = event.block.number;
        pool.createdTimestamp = event.block.timestamp;
        pool.inputTokenWeights = [graph_ts_2.BigDecimal.fromString("100")];
        pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.save();
        indexAssetForPoolToken(poolAddress, assetAddress, tokenAddress);
        addPoolToProtocol(poolId, pool._ignore);
    }
    return pool;
}
exports.getOrCreateAssetPool = getOrCreateAssetPool;
function getAssetAddressForPoolToken(event, poolAddress, tokenAddress) {
    const id = getTokenHelperId(poolAddress, tokenAddress);
    const helper = schema_1._LiquidityPoolAssetTokenHelper.load(id);
    if (helper) {
        return graph_ts_2.Address.fromString(helper.asset);
    }
    return constants_1.ZERO_ADDRESS;
}
exports.getAssetAddressForPoolToken = getAssetAddressForPoolToken;
function getOrCreateDailyUsageMetricSnapshot(event) {
    // Number of days since Unix epoch
    const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id.toString());
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id.toString());
        usageMetrics.protocol = constants_1.PROTOCOL_ADMIN;
        usageMetrics.dailyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.dailyTransactionCount = 0;
        usageMetrics.dailyDepositCount = 0;
        usageMetrics.dailyWithdrawCount = 0;
        usageMetrics.dailySwapCount = 0;
        usageMetrics.totalPoolCount = 0;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateDailyUsageMetricSnapshot = getOrCreateDailyUsageMetricSnapshot;
function getOrCreateHourlyUsageMetricSnapshot(event) {
    // " { # of hours since Unix epoch time } "
    const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(id.toString());
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(id.toString());
        usageMetrics.protocol = constants_1.PROTOCOL_ADMIN;
        usageMetrics.hourlyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.hourlyTransactionCount = 0;
        usageMetrics.hourlyDepositCount = 0;
        usageMetrics.hourlyWithdrawCount = 0;
        usageMetrics.hourlySwapCount = 0;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateHourlyUsageMetricSnapshot = getOrCreateHourlyUsageMetricSnapshot;
function getOrCreateLiquidityPoolDailySnapshot(event, assetAddress, poolAddress, tokenAddress) {
    const timestamp = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const id = assetAddress.toHexString().concat("-").concat(timestamp.toString());
    let poolDailyMetrics = schema_1.LiquidityPoolDailySnapshot.load(id);
    if (!poolDailyMetrics) {
        const pool = getOrCreateAssetPool(event, assetAddress, poolAddress, tokenAddress);
        poolDailyMetrics = new schema_1.LiquidityPoolDailySnapshot(id);
        poolDailyMetrics.protocol = constants_1.PROTOCOL_ADMIN;
        poolDailyMetrics.pool = pool.id;
        poolDailyMetrics.blockNumber = event.block.number;
        poolDailyMetrics.timestamp = event.block.timestamp;
        poolDailyMetrics.inputTokenWeights = pool.inputTokenWeights;
        poolDailyMetrics.inputTokenBalances = pool.inputTokenBalances;
        poolDailyMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
        poolDailyMetrics.cumulativeSupplySideRevenueUSD = pool.cumulativeSupplySideRevenueUSD;
        poolDailyMetrics.cumulativeProtocolSideRevenueUSD = pool.cumulativeProtocolSideRevenueUSD;
        poolDailyMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
        poolDailyMetrics.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
        poolDailyMetrics.outputTokenSupply = pool.outputTokenSupply;
        poolDailyMetrics.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
        poolDailyMetrics.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
        poolDailyMetrics.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
        poolDailyMetrics.dailyVolumeByTokenAmount = [constants_1.BIGINT_ZERO];
        poolDailyMetrics.dailyVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO];
        poolDailyMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolDailyMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolDailyMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolDailyMetrics.dailyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolDailyMetrics.save();
    }
    return poolDailyMetrics;
}
exports.getOrCreateLiquidityPoolDailySnapshot = getOrCreateLiquidityPoolDailySnapshot;
function getOrCreateLiquidityPoolHourlySnapshot(event, assetAddress, poolAddress, tokenAddress) {
    const timestamp = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    const id = assetAddress.toHexString().concat("-").concat(timestamp.toString());
    let poolHourlyMetrics = schema_1.LiquidityPoolHourlySnapshot.load(id);
    if (!poolHourlyMetrics) {
        const pool = getOrCreateAssetPool(event, assetAddress, poolAddress, tokenAddress);
        poolHourlyMetrics = new schema_1.LiquidityPoolHourlySnapshot(id);
        poolHourlyMetrics.protocol = constants_1.PROTOCOL_ADMIN;
        poolHourlyMetrics.pool = pool.id;
        poolHourlyMetrics.blockNumber = event.block.number;
        poolHourlyMetrics.timestamp = event.block.timestamp;
        poolHourlyMetrics.inputTokenWeights = pool.inputTokenWeights;
        poolHourlyMetrics.inputTokenBalances = pool.inputTokenBalances;
        poolHourlyMetrics.totalValueLockedUSD = pool.totalValueLockedUSD;
        poolHourlyMetrics.cumulativeSupplySideRevenueUSD = pool.cumulativeSupplySideRevenueUSD;
        poolHourlyMetrics.cumulativeProtocolSideRevenueUSD = pool.cumulativeProtocolSideRevenueUSD;
        poolHourlyMetrics.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
        poolHourlyMetrics.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
        poolHourlyMetrics.outputTokenSupply = pool.outputTokenSupply;
        poolHourlyMetrics.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
        poolHourlyMetrics.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
        poolHourlyMetrics.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
        poolHourlyMetrics.hourlyVolumeByTokenAmount = [constants_1.BIGINT_ZERO];
        poolHourlyMetrics.hourlyVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO];
        poolHourlyMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolHourlyMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolHourlyMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolHourlyMetrics.hourlyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolHourlyMetrics.save();
    }
    return poolHourlyMetrics;
}
exports.getOrCreateLiquidityPoolHourlySnapshot = getOrCreateLiquidityPoolHourlySnapshot;
function getOrCreateFinancialsDailySnapshot(event) {
    // Number of days since Unix epoch
    const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(id.toString());
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(id.toString());
        financialMetrics.protocol = constants_1.PROTOCOL_ADMIN;
        financialMetrics.blockNumber = event.block.number;
        financialMetrics.timestamp = event.block.timestamp;
        financialMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancialsDailySnapshot = getOrCreateFinancialsDailySnapshot;
///////////////////////////
///// DexAmm Specific /////
///////////////////////////
function getOrCreateDexAmm() {
    let protocol = schema_1.DexAmmProtocol.load(constants_1.PROTOCOL_ADMIN);
    if (!protocol) {
        protocol = new schema_1.DexAmmProtocol(constants_1.PROTOCOL_ADMIN);
        protocol.name = "Platypus Finance";
        protocol.slug = "platypus-finance";
        protocol.network = constants_1.Network.AVALANCHE;
        protocol.type = constants_1.ProtocolType.EXCHANGE;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
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
exports.getOrCreateDexAmm = getOrCreateDexAmm;
function getOrCreateAsset(event, tokenAddress, assetAddress) {
    const id = assetAddress.toHexString();
    let _asset = schema_1._Asset.load(id);
    // fetch info if null
    if (!_asset) {
        _asset = new schema_1._Asset(id);
        _asset.symbol = (0, tokens_1.fetchTokenSymbol)(assetAddress);
        _asset.name = (0, tokens_1.fetchTokenName)(assetAddress);
        _asset.decimals = (0, tokens_1.fetchTokenDecimals)(assetAddress);
        _asset.token = tokenAddress.toHexString();
        _asset.blockNumber = event.block.number;
        _asset.timestamp = event.block.timestamp;
        _asset.cash = graph_ts_1.BigInt.zero();
        _asset.amountStaked = constants_1.BIGINT_ZERO;
        _asset.rewardTokens = [];
        _asset.rewardTokenEmissionsAmount = [];
        _asset.rewardTokenEmissionsUSD = [];
        _asset.save();
    }
    return _asset;
}
exports.getOrCreateAsset = getOrCreateAsset;
function getOrCreateRewardToken(event, tokenAddress) {
    const id = constants_1.RewardTokenType.DEPOSIT.concat("-").concat(tokenAddress.toHexString());
    let rewardToken = schema_1.RewardToken.load(id);
    if (!rewardToken) {
        rewardToken = new schema_1.RewardToken(id);
        rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
        rewardToken.token = getOrCreateToken(event, tokenAddress).id;
        rewardToken.save();
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
