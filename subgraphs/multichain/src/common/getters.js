"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateAccount = exports.getOrCreateFinancialsDailySnapshot = exports.getOrCreateUsageMetricHourlySnapshot = exports.getOrCreateUsageMetricDailySnapshot = exports.getOrCreatePoolRouteSnapshot = exports.getOrCreatePoolHourlySnapshot = exports.getOrCreatePoolDailySnapshot = exports.getOrCreatePoolRoute = exports.getOrCreatePool = exports.getOrCreateCrosschainToken = exports.getOrCreateToken = exports.getOrCreateProtocol = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const tokens_1 = require("./tokens");
const constants_1 = require("./constants");
const datetime_1 = require("./utils/datetime");
const versions_1 = require("../versions");
const prices_1 = require("../prices");
const configure_1 = require("../../configurations/configure");
const schema_1 = require("../../generated/schema");
const templates_1 = require("../../generated/templates");
const anyToken_1 = require("../../generated/Router-0/anyToken");
function getOrCreateProtocol() {
    let protocol = schema_1.BridgeProtocol.load(graph_ts_1.Bytes.fromHexString(configure_1.NetworkConfigs.getFactoryAddress()));
    if (!protocol) {
        protocol = new schema_1.BridgeProtocol(graph_ts_1.Bytes.fromHexString(configure_1.NetworkConfigs.getFactoryAddress()));
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = configure_1.NetworkConfigs.getNetwork();
        protocol.type = constants_1.ProtocolType.BRIDGE;
        protocol.permissionType = constants_1.BridgePermissionType.WHITELIST;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.netVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.cumulativeUniqueTransferSenders = constants_1.INT_ZERO;
        protocol.cumulativeUniqueTransferReceivers = constants_1.INT_ZERO;
        protocol.cumulativeUniqueLiquidityProviders = constants_1.INT_ZERO;
        protocol.cumulativeUniqueMessageSenders = constants_1.INT_ZERO;
        protocol.cumulativeTransactionCount = constants_1.INT_ZERO;
        protocol.cumulativeTransferOutCount = constants_1.INT_ZERO;
        protocol.cumulativeTransferInCount = constants_1.INT_ZERO;
        protocol.cumulativeLiquidityDepositCount = constants_1.INT_ZERO;
        protocol.cumulativeLiquidityWithdrawCount = constants_1.INT_ZERO;
        protocol.cumulativeMessageSentCount = constants_1.INT_ZERO;
        protocol.cumulativeMessageReceivedCount = constants_1.INT_ZERO;
        protocol.supportedNetworks = [];
        protocol.totalPoolCount = constants_1.INT_ZERO;
        protocol.totalPoolRouteCount = constants_1.INT_ZERO;
        protocol.totalCanonicalRouteCount = constants_1.INT_ZERO;
        protocol.totalWrappedRouteCount = constants_1.INT_ZERO;
        protocol.totalSupportedTokenCount = constants_1.INT_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
function getOrCreateToken(protocol, tokenAddress, chainID, block) {
    let token = schema_1.Token.load(tokenAddress);
    if (!token) {
        token = new schema_1.Token(tokenAddress);
        token.name = (0, tokens_1.fetchTokenName)(tokenAddress);
        token.symbol = (0, tokens_1.fetchTokenSymbol)(tokenAddress);
        token.decimals = (0, tokens_1.fetchTokenDecimals)(tokenAddress);
        token.lastPriceBlockNumber = block.number;
        protocol.totalSupportedTokenCount += constants_1.INT_ONE;
    }
    token._totalSupply = (0, tokens_1.fetchTokenSupply)(tokenAddress);
    if (!token.lastPriceUSD || token.lastPriceBlockNumber < block.number) {
        token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        const network = constants_1.NETWORK_BY_ID.get(chainID.toString())
            ? constants_1.NETWORK_BY_ID.get(chainID.toString())
            : constants_1.Network.UNKNOWN_NETWORK;
        if (!constants_1.INACCURATE_PRICEFEED_TOKENS.get(network).includes(graph_ts_1.Address.fromBytes(token.id))) {
            if (network == constants_1.Network.ARBITRUM_ONE &&
                graph_ts_1.Address.fromBytes(token.id) ==
                    graph_ts_1.Address.fromHexString("0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a")) {
                token.lastPriceUSD = constants_1.BIGDECIMAL_ONE;
            }
            else if (network == constants_1.Network.MAINNET &&
                graph_ts_1.Address.fromBytes(token.id) ==
                    graph_ts_1.Address.fromHexString("0xbbc4a8d076f4b1888fec42581b6fc58d242cf2d5") &&
                block.number == graph_ts_1.BigInt.fromString("14983245")) {
                token.lastPriceUSD = constants_1.BIGDECIMAL_ONE;
            }
            else {
                let pricedTokenAddress = tokenAddress;
                const anyTokenContract = anyToken_1.anyToken.bind(tokenAddress);
                const underlyingTokenCall = anyTokenContract.try_underlying();
                if (!underlyingTokenCall.reverted &&
                    underlyingTokenCall.value != graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
                    pricedTokenAddress = underlyingTokenCall.value;
                }
                const price = (0, prices_1.getUsdPricePerToken)(pricedTokenAddress, block);
                if (!price.reverted) {
                    token.lastPriceUSD = price.usdPrice;
                }
            }
        }
        token.lastPriceBlockNumber = block.number;
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateCrosschainToken(token, crosschainID, crosschainTokenAddress, crosschainTokenType) {
    const crosschainTokenID = graph_ts_1.Bytes.fromByteArray(graph_ts_1.Bytes.fromBigInt(crosschainID).concat(token.id));
    let crosschainToken = schema_1.CrosschainToken.load(crosschainTokenID);
    if (!crosschainToken) {
        crosschainToken = new schema_1.CrosschainToken(crosschainTokenID);
        crosschainToken.chainID = crosschainID;
        const network = constants_1.NETWORK_BY_ID.get(crosschainID.toString())
            ? constants_1.NETWORK_BY_ID.get(crosschainID.toString())
            : constants_1.Network.UNKNOWN_NETWORK;
        crosschainToken.network = network;
        crosschainToken.address = crosschainTokenAddress;
        crosschainToken.type = crosschainTokenType;
        crosschainToken.token = token.id;
    }
    return crosschainToken;
}
exports.getOrCreateCrosschainToken = getOrCreateCrosschainToken;
function getOrCreatePool(protocol, token, poolID, poolType, crosschainID, block) {
    let pool = schema_1.Pool.load(poolID);
    if (!pool) {
        pool = new schema_1.Pool(poolID);
        pool.inputToken = token.id;
        pool.inputTokenBalance = constants_1.BIGINT_ZERO;
        pool.type = poolType;
        if (poolType == constants_1.BridgePoolType.LIQUIDITY) {
            const context = new graph_ts_1.DataSourceContext();
            context.setString(constants_1.CONTEXT_KEY_POOLID, pool.id.toHexString());
            context.setString(constants_1.CONTEXT_KEY_CHAINID, configure_1.NetworkConfigs.getChainID().toString());
            context.setString(constants_1.CONTEXT_KEY_CROSSCHAINID, crosschainID.toString());
            templates_1.LiquidityPoolTemplate.createWithContext(graph_ts_1.Address.fromBytes(pool.id), context);
        }
        else if (poolType == constants_1.BridgePoolType.BURN_MINT) {
            pool.mintSupply = token._totalSupply;
        }
        pool.protocol = protocol.id;
        pool.name = token.name;
        pool.symbol = token.symbol;
        pool.destinationTokens = [];
        pool.routes = [];
        pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeVolumeIn = constants_1.BIGINT_ZERO;
        pool.cumulativeVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeVolumeOut = constants_1.BIGINT_ZERO;
        pool.cumulativeVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        pool.netVolume = constants_1.BIGINT_ZERO;
        pool.netVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.createdTimestamp = block.timestamp;
        pool.createdBlockNumber = block.number;
        protocol.totalPoolCount += constants_1.INT_ONE;
    }
    return pool;
}
exports.getOrCreatePool = getOrCreatePool;
function getOrCreatePoolRoute(protocol, token, crosschainToken, pool, chainID, crosschainID) {
    const lowerChainID = chainID < crosschainID ? chainID : crosschainID;
    const greaterChainID = chainID > crosschainID ? chainID : crosschainID;
    const routeID = pool.id.concat(graph_ts_1.Bytes.fromUTF8("-"
        .concat(lowerChainID.toString())
        .concat("-")
        .concat(greaterChainID.toString())));
    let poolRoute = schema_1.PoolRoute.load(routeID);
    if (!poolRoute) {
        poolRoute = new schema_1.PoolRoute(routeID);
        poolRoute.pool = pool.id;
        poolRoute.inputToken = token.id;
        poolRoute.crossToken = crosschainToken.id;
        if (pool.type == constants_1.BridgePoolType.LIQUIDITY) {
            poolRoute.counterType = constants_1.BridgePoolType.LIQUIDITY;
        }
        else if (pool.type == constants_1.BridgePoolType.BURN_MINT) {
            poolRoute.counterType = constants_1.BridgePoolType.LOCK_RELEASE;
        }
        if (crosschainToken.type == constants_1.CrosschainTokenType.CANONICAL) {
            protocol.totalCanonicalRouteCount += constants_1.INT_ONE;
        }
        else {
            protocol.totalWrappedRouteCount += constants_1.INT_ONE;
        }
        poolRoute.isSwap = false;
        if (crosschainToken.token != token.id) {
            poolRoute.isSwap = true;
        }
        poolRoute.cumulativeVolumeIn = constants_1.BIGINT_ZERO;
        poolRoute.cumulativeVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        poolRoute.cumulativeVolumeOut = constants_1.BIGINT_ZERO;
        poolRoute.cumulativeVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        poolRoute.createdTimestamp = constants_1.BIGINT_ZERO;
        poolRoute.createdBlockNumber = constants_1.BIGINT_ZERO;
        protocol.totalPoolRouteCount += constants_1.INT_ONE;
        addCrosschainTokenToPoolIfNotExists(pool, crosschainToken);
    }
    return poolRoute;
}
exports.getOrCreatePoolRoute = getOrCreatePoolRoute;
function addCrosschainTokenToPoolIfNotExists(pool, crossToken) {
    if (pool.destinationTokens.indexOf(crossToken.id) >= constants_1.INT_ZERO) {
        return;
    }
    const tokens = pool.destinationTokens;
    tokens.push(crossToken.id);
    pool.destinationTokens = tokens;
    pool.save();
}
function getOrCreatePoolDailySnapshot(protocol, pool, block) {
    const dayId = (0, datetime_1.getDaysSinceEpoch)(block.timestamp.toI32());
    const snapshotID = pool.id.concat(graph_ts_1.Bytes.fromUTF8("-".concat(dayId)));
    let poolMetrics = schema_1.PoolDailySnapshot.load(snapshotID);
    if (!poolMetrics) {
        poolMetrics = new schema_1.PoolDailySnapshot(snapshotID);
        poolMetrics.day = graph_ts_1.BigInt.fromString(dayId).toI32();
        poolMetrics.protocol = protocol.id;
        poolMetrics.pool = pool.id;
        poolMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeVolumeIn = constants_1.BIGINT_ZERO;
        poolMetrics.dailyVolumeIn = constants_1.BIGINT_ZERO;
        poolMetrics.cumulativeVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeVolumeOut = constants_1.BIGINT_ZERO;
        poolMetrics.dailyVolumeOut = constants_1.BIGINT_ZERO;
        poolMetrics.cumulativeVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.dailyVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.netCumulativeVolume = constants_1.BIGINT_ZERO;
        poolMetrics.netDailyVolume = constants_1.BIGINT_ZERO;
        poolMetrics.netCumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.netDailyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.routes = [];
        poolMetrics.inputTokenBalance = constants_1.BIGINT_ZERO;
        poolMetrics.blockNumber = block.number;
        poolMetrics.timestamp = block.timestamp;
    }
    return poolMetrics;
}
exports.getOrCreatePoolDailySnapshot = getOrCreatePoolDailySnapshot;
function getOrCreatePoolHourlySnapshot(protocol, pool, block) {
    const hourId = (0, datetime_1.getHoursSinceEpoch)(block.timestamp.toI32());
    const snapshotID = pool.id.concat(graph_ts_1.Bytes.fromUTF8("-".concat(hourId)));
    let poolMetrics = schema_1.PoolHourlySnapshot.load(snapshotID);
    if (!poolMetrics) {
        poolMetrics = new schema_1.PoolHourlySnapshot(snapshotID);
        poolMetrics.hour = graph_ts_1.BigInt.fromString(hourId).toI32();
        poolMetrics.protocol = protocol.id;
        poolMetrics.pool = pool.id;
        poolMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeVolumeIn = constants_1.BIGINT_ZERO;
        poolMetrics.hourlyVolumeIn = constants_1.BIGINT_ZERO;
        poolMetrics.cumulativeVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.cumulativeVolumeOut = constants_1.BIGINT_ZERO;
        poolMetrics.hourlyVolumeOut = constants_1.BIGINT_ZERO;
        poolMetrics.cumulativeVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.hourlyVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.netCumulativeVolume = constants_1.BIGINT_ZERO;
        poolMetrics.netHourlyVolume = constants_1.BIGINT_ZERO;
        poolMetrics.netCumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.netHourlyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolMetrics.routes = [];
        poolMetrics.inputTokenBalance = constants_1.BIGINT_ZERO;
        poolMetrics.blockNumber = block.number;
        poolMetrics.timestamp = block.timestamp;
    }
    return poolMetrics;
}
exports.getOrCreatePoolHourlySnapshot = getOrCreatePoolHourlySnapshot;
function getOrCreatePoolRouteSnapshot(poolRoute, poolSnapshotID, block) {
    const routeSnapshotID = poolRoute.id.concat(graph_ts_1.Bytes.fromUTF8("-").concat(poolSnapshotID));
    let poolRouteSnapshot = schema_1.PoolRouteSnapshot.load(routeSnapshotID);
    if (!poolRouteSnapshot) {
        poolRouteSnapshot = new schema_1.PoolRouteSnapshot(routeSnapshotID);
        poolRouteSnapshot.poolRoute = poolRoute.id;
        poolRouteSnapshot.cumulativeVolumeIn = constants_1.BIGINT_ZERO;
        poolRouteSnapshot.snapshotVolumeIn = constants_1.BIGINT_ZERO;
        poolRouteSnapshot.cumulativeVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        poolRouteSnapshot.snapshotVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        poolRouteSnapshot.cumulativeVolumeOut = constants_1.BIGINT_ZERO;
        poolRouteSnapshot.snapshotVolumeOut = constants_1.BIGINT_ZERO;
        poolRouteSnapshot.cumulativeVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        poolRouteSnapshot.snapshotVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        poolRouteSnapshot.blockNumber = block.number;
        poolRouteSnapshot.timestamp = block.timestamp;
    }
    return poolRouteSnapshot;
}
exports.getOrCreatePoolRouteSnapshot = getOrCreatePoolRouteSnapshot;
function getOrCreateUsageMetricDailySnapshot(protocol, block) {
    const dayId = (0, datetime_1.getDaysSinceEpoch)(block.timestamp.toI32());
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(graph_ts_1.Bytes.fromUTF8(dayId));
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(graph_ts_1.Bytes.fromUTF8(dayId));
        usageMetrics.day = graph_ts_1.BigInt.fromString(dayId).toI32();
        usageMetrics.protocol = protocol.id;
        usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
        usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueTransferSenders = constants_1.INT_ZERO;
        usageMetrics.dailyActiveTransferSenders = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueTransferReceivers = constants_1.INT_ZERO;
        usageMetrics.dailyActiveTransferReceivers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueLiquidityProviders = constants_1.INT_ZERO;
        usageMetrics.dailyActiveLiquidityProviders = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueMessageSenders = constants_1.INT_ZERO;
        usageMetrics.dailyActiveMessageSenders = constants_1.INT_ZERO;
        usageMetrics.cumulativeTransactionCount = constants_1.INT_ZERO;
        usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.cumulativeTransferOutCount = constants_1.INT_ZERO;
        usageMetrics.dailyTransferOutCount = constants_1.INT_ZERO;
        usageMetrics.cumulativeTransferInCount = constants_1.INT_ZERO;
        usageMetrics.dailyTransferInCount = constants_1.INT_ZERO;
        usageMetrics.cumulativeLiquidityDepositCount = constants_1.INT_ZERO;
        usageMetrics.dailyLiquidityDepositCount = constants_1.INT_ZERO;
        usageMetrics.cumulativeLiquidityWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.dailyLiquidityWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.cumulativeMessageSentCount = constants_1.INT_ZERO;
        usageMetrics.dailyMessageSentCount = constants_1.INT_ZERO;
        usageMetrics.cumulativeMessageReceivedCount = constants_1.INT_ZERO;
        usageMetrics.dailyMessageReceivedCount = constants_1.INT_ZERO;
        usageMetrics.totalPoolCount = constants_1.INT_ZERO;
        usageMetrics.totalPoolRouteCount = constants_1.INT_ZERO;
        usageMetrics.totalCanonicalRouteCount = constants_1.INT_ZERO;
        usageMetrics.totalWrappedRouteCount = constants_1.INT_ZERO;
        usageMetrics.totalSupportedTokenCount = constants_1.INT_ZERO;
        usageMetrics.blockNumber = block.number;
        usageMetrics.timestamp = block.timestamp;
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricDailySnapshot = getOrCreateUsageMetricDailySnapshot;
function getOrCreateUsageMetricHourlySnapshot(protocol, block) {
    const hourId = (0, datetime_1.getHoursSinceEpoch)(block.timestamp.toI32());
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(graph_ts_1.Bytes.fromUTF8(hourId));
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(graph_ts_1.Bytes.fromUTF8(hourId));
        usageMetrics.hour = graph_ts_1.BigInt.fromString(hourId).toI32();
        usageMetrics.protocol = protocol.id;
        usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
        usageMetrics.hourlyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueTransferSenders = constants_1.INT_ZERO;
        usageMetrics.hourlyActiveTransferSenders = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueTransferReceivers = constants_1.INT_ZERO;
        usageMetrics.hourlyActiveTransferReceivers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueLiquidityProviders = constants_1.INT_ZERO;
        usageMetrics.hourlyActiveLiquidityProviders = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueMessageSenders = constants_1.INT_ZERO;
        usageMetrics.hourlyActiveMessageSenders = constants_1.INT_ZERO;
        usageMetrics.cumulativeTransactionCount = constants_1.INT_ZERO;
        usageMetrics.hourlyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.cumulativeTransferOutCount = constants_1.INT_ZERO;
        usageMetrics.hourlyTransferOutCount = constants_1.INT_ZERO;
        usageMetrics.cumulativeTransferInCount = constants_1.INT_ZERO;
        usageMetrics.hourlyTransferInCount = constants_1.INT_ZERO;
        usageMetrics.cumulativeLiquidityDepositCount = constants_1.INT_ZERO;
        usageMetrics.hourlyLiquidityDepositCount = constants_1.INT_ZERO;
        usageMetrics.cumulativeLiquidityWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.hourlyLiquidityWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.cumulativeMessageSentCount = constants_1.INT_ZERO;
        usageMetrics.hourlyMessageSentCount = constants_1.INT_ZERO;
        usageMetrics.cumulativeMessageReceivedCount = constants_1.INT_ZERO;
        usageMetrics.hourlyMessageReceivedCount = constants_1.INT_ZERO;
        usageMetrics.blockNumber = block.number;
        usageMetrics.timestamp = block.timestamp;
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricHourlySnapshot = getOrCreateUsageMetricHourlySnapshot;
function getOrCreateFinancialsDailySnapshot(protocol, block) {
    const dayId = (0, datetime_1.getDaysSinceEpoch)(block.timestamp.toI32());
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(graph_ts_1.Bytes.fromUTF8(dayId));
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(graph_ts_1.Bytes.fromUTF8(dayId));
        financialMetrics.day = graph_ts_1.BigInt.fromString(dayId).toI32();
        financialMetrics.protocol = protocol.id;
        financialMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyNetVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeNetVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.blockNumber = block.number;
        financialMetrics.timestamp = block.timestamp;
    }
    return financialMetrics;
}
exports.getOrCreateFinancialsDailySnapshot = getOrCreateFinancialsDailySnapshot;
function getOrCreateAccount(protocol, accountID) {
    let account = schema_1.Account.load(graph_ts_1.Bytes.fromUTF8(accountID));
    if (!account) {
        account = new schema_1.Account(graph_ts_1.Bytes.fromUTF8(accountID));
        account.chains = [];
        account.transferOutCount = constants_1.INT_ZERO;
        account.transferInCount = constants_1.INT_ZERO;
        account.depositCount = constants_1.INT_ZERO;
        account.withdrawCount = constants_1.INT_ZERO;
        account.messageSentCount = constants_1.INT_ZERO;
        account.messageReceivedCount = constants_1.INT_ZERO;
        account.save();
        protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
