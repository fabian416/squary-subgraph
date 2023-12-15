"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateConnection = exports.getOrCreateAccount = exports.getOrCreatePool = exports.getOrCreateProtocol = exports.getOrCreateToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const prices_1 = require("./prices");
const versions_1 = require("../versions");
const configure_1 = require("../../configurations/configure");
const schema_1 = require("../../generated/schema");
function getOrCreateToken(event) {
    const tokenAddress = graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS);
    let token = schema_1.Token.load(tokenAddress);
    if (!token) {
        token = new schema_1.Token(tokenAddress);
        token.name = constants_1.ETH_NAME;
        token.symbol = constants_1.ETH_SYMBOL;
        token.decimals = constants_1.ETH_DECIMALS;
        token.lastPriceBlockNumber = event.block.number;
    }
    if (!token.lastPriceUSD || token.lastPriceBlockNumber < event.block.number) {
        const priceUSD = (0, prices_1.getUsdPricePerEth)();
        token.lastPriceUSD = priceUSD;
        token.lastPriceBlockNumber = event.block.number;
    }
    token.save();
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
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
        protocol.cumulativeBuyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSellVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.netVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueBuyers = constants_1.INT_ZERO;
        protocol.cumulativeUniqueSellers = constants_1.INT_ZERO;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.cumulativeBuyCount = constants_1.INT_ZERO;
        protocol.cumulativeSellCount = constants_1.INT_ZERO;
        protocol.cumulativeTransactionCount = constants_1.INT_ZERO;
        protocol.totalPoolCount = constants_1.INT_ZERO;
        protocol._lastDailySnapshotTimestamp = constants_1.BIGINT_ZERO;
        protocol._lastHourlySnapshotTimestamp = constants_1.BIGINT_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
function getOrCreatePool(protocol, poolAddress, event) {
    let pool = schema_1.Pool.load(poolAddress);
    if (!pool) {
        pool = new schema_1.Pool(poolAddress);
        pool.protocol = protocol.id;
        pool.name = "Subject-" + poolAddress.toHexString();
        pool.symbol = "S-" + poolAddress.toHexString();
        pool.inputTokens = [graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS)];
        pool.createdTimestamp = event.block.timestamp;
        pool.createdBlockNumber = event.block.number;
        pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.inputTokenBalances = [constants_1.BIGINT_ZERO];
        pool.inputTokenBalancesUSD = [constants_1.BIGDECIMAL_ZERO];
        pool.cumulativeBuyVolumeAmount = constants_1.BIGINT_ZERO;
        pool.cumulativeBuyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeSellVolumeAmount = constants_1.BIGINT_ZERO;
        pool.cumulativeSellVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeTotalVolumeAmount = constants_1.BIGINT_ZERO;
        pool.cumulativeTotalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.netVolumeAmount = constants_1.BIGINT_ZERO;
        pool.netVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeUniqueUsers = constants_1.INT_ZERO;
        pool.cumulativeBuyCount = constants_1.INT_ZERO;
        pool.cumulativeSellCount = constants_1.INT_ZERO;
        pool.cumulativeTransactionCount = constants_1.INT_ZERO;
        pool.supply = constants_1.BIGINT_ZERO;
        pool.sharePriceAmount = constants_1.BIGINT_ZERO;
        pool.sharePriceUSD = constants_1.BIGDECIMAL_ZERO;
        pool.traders = [];
        pool._lastDailySnapshotTimestamp = constants_1.BIGINT_ZERO;
        pool._lastHourlySnapshotTimestamp = constants_1.BIGINT_ZERO;
        protocol.totalPoolCount += constants_1.INT_ONE;
    }
    return pool;
}
exports.getOrCreatePool = getOrCreatePool;
function getOrCreateAccount(traderAddress, event) {
    let trader = schema_1.Account.load(traderAddress);
    if (!trader) {
        trader = new schema_1.Account(traderAddress);
        trader.cumulativeBuyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        trader.cumulativeSellVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        trader.cumulativeTotalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        trader.netVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        trader.cumulativeBuyCount = constants_1.INT_ZERO;
        trader.cumulativeSellCount = constants_1.INT_ZERO;
        trader.cumulativeTransactionCount = constants_1.INT_ZERO;
        trader.createdTimestamp = event.block.timestamp;
        trader.createdBlockNumber = event.block.number;
        trader.buys = [];
        trader.sells = [];
        trader.subjects = [];
    }
    return trader;
}
exports.getOrCreateAccount = getOrCreateAccount;
function getOrCreateConnection(traderAddress, subjectAddress, event) {
    const id = graph_ts_1.Bytes.empty()
        .concat(traderAddress)
        .concat(graph_ts_1.Bytes.fromUTF8("-"))
        .concat(subjectAddress);
    let connection = schema_1.Connection.load(id);
    if (!connection) {
        connection = new schema_1.Connection(id);
        connection.trader = traderAddress;
        connection.subject = subjectAddress;
        connection.shares = constants_1.BIGINT_ZERO;
        connection.cumulativeBuyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        connection.cumulativeSellVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        connection.cumulativeTotalVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        connection.netVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        connection.cumulativeBuyCount = constants_1.INT_ZERO;
        connection.cumulativeSellCount = constants_1.INT_ZERO;
        connection.cumulativeTransactionCount = constants_1.INT_ZERO;
        connection.createdTimestamp = event.block.timestamp;
        connection.createdBlockNumber = event.block.number;
    }
    return connection;
}
exports.getOrCreateConnection = getOrCreateConnection;
