"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.takePoolSnapshots = exports.takePoolHourlySnapshot = exports.takePoolDailySnapshot = exports.takeProtocolSnapshots = exports.takeFinancialsDailySnapshot = exports.takeUsageMetricsHourlySnapshot = exports.takeUsageMetricsDailySnapshot = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const configure_1 = require("../../configurations/configure");
const schema_1 = require("../../generated/schema");
function takeUsageMetricsDailySnapshot(protocol, event) {
    const day = (0, utils_1.getDaysSinceEpoch)(event.block.timestamp.toI32());
    const snapshot = new schema_1.UsageMetricsDailySnapshot(graph_ts_1.Bytes.fromI32(day));
    snapshot.day = day;
    snapshot.protocol = protocol.id;
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    snapshot.cumulativeUniqueBuyers = protocol.cumulativeUniqueBuyers;
    snapshot.cumulativeUniqueSellers = protocol.cumulativeUniqueSellers;
    snapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    snapshot.cumulativeBuyCount = protocol.cumulativeBuyCount;
    snapshot.cumulativeSellCount = protocol.cumulativeSellCount;
    snapshot.cumulativeTransactionCount = protocol.cumulativeTransactionCount;
    snapshot.totalPoolCount = protocol.totalPoolCount;
    let activeBuyersDelta = snapshot.cumulativeUniqueBuyers;
    let activeSellersDelta = snapshot.cumulativeUniqueSellers;
    let activeUsersDelta = snapshot.cumulativeUniqueUsers;
    let buyCountDelta = snapshot.cumulativeBuyCount;
    let sellCountDelta = snapshot.cumulativeSellCount;
    let transactionCountDelta = snapshot.cumulativeTransactionCount;
    const previousDay = (0, utils_1.getDaysSinceEpoch)(protocol._lastDailySnapshotTimestamp.toI32());
    const previousSnapshot = schema_1.UsageMetricsDailySnapshot.load(graph_ts_1.Bytes.fromI32(previousDay));
    if (previousSnapshot) {
        activeBuyersDelta =
            snapshot.cumulativeUniqueBuyers - previousSnapshot.cumulativeUniqueBuyers;
        activeSellersDelta =
            snapshot.cumulativeUniqueSellers -
                previousSnapshot.cumulativeUniqueSellers;
        activeUsersDelta =
            snapshot.cumulativeUniqueUsers - previousSnapshot.cumulativeUniqueUsers;
        buyCountDelta =
            snapshot.cumulativeBuyCount - previousSnapshot.cumulativeBuyCount;
        sellCountDelta =
            snapshot.cumulativeSellCount - previousSnapshot.cumulativeSellCount;
        transactionCountDelta =
            snapshot.cumulativeTransactionCount -
                previousSnapshot.cumulativeTransactionCount;
    }
    snapshot.dailyActiveBuyers = activeBuyersDelta;
    snapshot.dailyActiveSellers = activeSellersDelta;
    snapshot.dailyActiveUsers = activeUsersDelta;
    snapshot.dailyBuyCount = buyCountDelta;
    snapshot.dailySellCount = sellCountDelta;
    snapshot.dailyTransactionCount = transactionCountDelta;
    snapshot.save();
}
exports.takeUsageMetricsDailySnapshot = takeUsageMetricsDailySnapshot;
function takeUsageMetricsHourlySnapshot(protocol, event) {
    const hour = (0, utils_1.getHoursSinceEpoch)(event.block.timestamp.toI32());
    const snapshot = new schema_1.UsageMetricsHourlySnapshot(graph_ts_1.Bytes.fromI32(hour));
    snapshot.hour = hour;
    snapshot.protocol = protocol.id;
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    snapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    snapshot.cumulativeTransactionCount = protocol.cumulativeTransactionCount;
    let activeUsersDelta = snapshot.cumulativeUniqueUsers;
    let transactionCountDelta = snapshot.cumulativeTransactionCount;
    const previousHour = (0, utils_1.getHoursSinceEpoch)(protocol._lastHourlySnapshotTimestamp.toI32());
    const previousSnapshot = schema_1.UsageMetricsHourlySnapshot.load(graph_ts_1.Bytes.fromI32(previousHour));
    if (previousSnapshot) {
        activeUsersDelta =
            snapshot.cumulativeUniqueUsers - previousSnapshot.cumulativeUniqueUsers;
        transactionCountDelta =
            snapshot.cumulativeTransactionCount -
                previousSnapshot.cumulativeTransactionCount;
    }
    snapshot.hourlyActiveUsers = activeUsersDelta;
    snapshot.hourlyTransactionCount = transactionCountDelta;
    snapshot.save();
}
exports.takeUsageMetricsHourlySnapshot = takeUsageMetricsHourlySnapshot;
function takeFinancialsDailySnapshot(protocol, event) {
    const day = (0, utils_1.getDaysSinceEpoch)(event.block.timestamp.toI32());
    const snapshot = new schema_1.FinancialsDailySnapshot(graph_ts_1.Bytes.fromI32(day));
    snapshot.day = day;
    snapshot.protocol = protocol.id;
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    snapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
    snapshot.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
    snapshot.cumulativeBuyVolumeUSD = protocol.cumulativeBuyVolumeUSD;
    snapshot.cumulativeSellVolumeUSD = protocol.cumulativeSellVolumeUSD;
    snapshot.cumulativeTotalVolumeUSD = protocol.cumulativeTotalVolumeUSD;
    snapshot.netVolumeUSD = protocol.netVolumeUSD;
    let supplySideRevenueUSDDelta = snapshot.cumulativeSupplySideRevenueUSD;
    let protocolSideRevenueUSDDelta = snapshot.cumulativeProtocolSideRevenueUSD;
    let totalRevenueUSDDelta = snapshot.cumulativeTotalRevenueUSD;
    let buyVolumeUSDDelta = snapshot.cumulativeBuyVolumeUSD;
    let sellVolumeUSDDelta = snapshot.cumulativeSellVolumeUSD;
    let totalVolumeUSDDelta = snapshot.cumulativeTotalVolumeUSD;
    let netVolumeUSDDelta = snapshot.netVolumeUSD;
    const previousDay = (0, utils_1.getDaysSinceEpoch)(protocol._lastDailySnapshotTimestamp.toI32());
    const previousSnapshot = schema_1.FinancialsDailySnapshot.load(graph_ts_1.Bytes.fromI32(previousDay));
    if (previousSnapshot) {
        supplySideRevenueUSDDelta = snapshot.cumulativeSupplySideRevenueUSD.minus(previousSnapshot.cumulativeSupplySideRevenueUSD);
        protocolSideRevenueUSDDelta =
            snapshot.cumulativeProtocolSideRevenueUSD.minus(previousSnapshot.cumulativeProtocolSideRevenueUSD);
        totalRevenueUSDDelta = snapshot.cumulativeTotalRevenueUSD.minus(previousSnapshot.cumulativeTotalRevenueUSD);
        buyVolumeUSDDelta = snapshot.cumulativeBuyVolumeUSD.minus(previousSnapshot.cumulativeBuyVolumeUSD);
        sellVolumeUSDDelta = snapshot.cumulativeSellVolumeUSD.minus(previousSnapshot.cumulativeSellVolumeUSD);
        totalVolumeUSDDelta = snapshot.cumulativeTotalVolumeUSD.minus(previousSnapshot.cumulativeTotalVolumeUSD);
        netVolumeUSDDelta = snapshot.netVolumeUSD.minus(previousSnapshot.netVolumeUSD);
    }
    snapshot.dailySupplySideRevenueUSD = supplySideRevenueUSDDelta;
    snapshot.dailyProtocolSideRevenueUSD = protocolSideRevenueUSDDelta;
    snapshot.dailyTotalRevenueUSD = totalRevenueUSDDelta;
    snapshot.dailyBuyVolumeUSD = buyVolumeUSDDelta;
    snapshot.dailySellVolumeUSD = sellVolumeUSDDelta;
    snapshot.dailyTotalVolumeUSD = totalVolumeUSDDelta;
    snapshot.dailyNetVolumeUSD = netVolumeUSDDelta;
    snapshot.save();
}
exports.takeFinancialsDailySnapshot = takeFinancialsDailySnapshot;
function takeProtocolSnapshots(protocol, event) {
    if (protocol._lastDailySnapshotTimestamp
        .plus(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY))
        .lt(event.block.timestamp)) {
        takeUsageMetricsDailySnapshot(protocol, event);
        takeFinancialsDailySnapshot(protocol, event);
        protocol._lastDailySnapshotTimestamp = event.block.timestamp;
        protocol.save();
    }
    if (protocol._lastHourlySnapshotTimestamp
        .plus(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_HOUR))
        .lt(event.block.timestamp)) {
        takeUsageMetricsHourlySnapshot(protocol, event);
        protocol._lastHourlySnapshotTimestamp = event.block.timestamp;
        protocol.save();
    }
}
exports.takeProtocolSnapshots = takeProtocolSnapshots;
function takePoolDailySnapshot(pool, event) {
    const day = (0, utils_1.getDaysSinceEpoch)(event.block.timestamp.toI32());
    const id = graph_ts_1.Bytes.empty()
        .concat(pool.id)
        .concat(graph_ts_1.Bytes.fromUTF8("-"))
        .concat(graph_ts_1.Bytes.fromI32(day));
    const snapshot = new schema_1.PoolDailySnapshot(id);
    snapshot.day = day;
    snapshot.pool = pool.id;
    snapshot.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    snapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    snapshot.inputTokenBalances = pool.inputTokenBalances;
    snapshot.inputTokenBalancesUSD = pool.inputTokenBalancesUSD;
    snapshot.cumulativeSupplySideRevenueUSD = pool.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    snapshot.cumulativeBuyVolumeAmount = pool.cumulativeBuyVolumeAmount;
    snapshot.cumulativeBuyVolumeUSD = pool.cumulativeBuyVolumeUSD;
    snapshot.cumulativeSellVolumeAmount = pool.cumulativeSellVolumeAmount;
    snapshot.cumulativeSellVolumeUSD = pool.cumulativeSellVolumeUSD;
    snapshot.cumulativeTotalVolumeAmount = pool.cumulativeTotalVolumeAmount;
    snapshot.cumulativeTotalVolumeUSD = pool.cumulativeTotalVolumeUSD;
    snapshot.netVolumeAmount = pool.netVolumeAmount;
    snapshot.netVolumeUSD = pool.netVolumeUSD;
    snapshot.cumulativeUniqueUsers = pool.cumulativeUniqueUsers;
    snapshot.cumulativeBuyCount = pool.cumulativeBuyCount;
    snapshot.cumulativeSellCount = pool.cumulativeSellCount;
    snapshot.cumulativeTransactionCount = pool.cumulativeTransactionCount;
    let supplySideRevenueUSDDelta = snapshot.cumulativeSupplySideRevenueUSD;
    let protocolSideRevenueUSDDelta = snapshot.cumulativeProtocolSideRevenueUSD;
    let totalRevenueUSDDelta = snapshot.cumulativeTotalRevenueUSD;
    let buyVolumeAmountDelta = snapshot.cumulativeBuyVolumeAmount;
    let buyVolumeUSDDelta = snapshot.cumulativeBuyVolumeUSD;
    let sellVolumeAmountDelta = snapshot.cumulativeSellVolumeAmount;
    let sellVolumeUSDDelta = snapshot.cumulativeSellVolumeUSD;
    let totalVolumeAmountDelta = snapshot.cumulativeTotalVolumeAmount;
    let totalVolumeUSDDelta = snapshot.cumulativeTotalVolumeUSD;
    let netVolumeAmountDelta = snapshot.netVolumeAmount;
    let netVolumeUSDDelta = snapshot.netVolumeUSD;
    let activeUsersDelta = snapshot.cumulativeUniqueUsers;
    let buyCountDelta = snapshot.cumulativeBuyCount;
    let sellCountDelta = snapshot.cumulativeSellCount;
    let transactionCountDelta = snapshot.cumulativeTransactionCount;
    const previousDay = (0, utils_1.getDaysSinceEpoch)(pool._lastDailySnapshotTimestamp.toI32());
    const previousSnapshot = schema_1.PoolDailySnapshot.load(graph_ts_1.Bytes.fromI32(previousDay));
    if (previousSnapshot) {
        supplySideRevenueUSDDelta = snapshot.cumulativeSupplySideRevenueUSD.minus(previousSnapshot.cumulativeSupplySideRevenueUSD);
        protocolSideRevenueUSDDelta =
            snapshot.cumulativeProtocolSideRevenueUSD.minus(previousSnapshot.cumulativeProtocolSideRevenueUSD);
        totalRevenueUSDDelta = snapshot.cumulativeTotalRevenueUSD.minus(previousSnapshot.cumulativeTotalRevenueUSD);
        buyVolumeUSDDelta = snapshot.cumulativeBuyVolumeUSD.minus(previousSnapshot.cumulativeBuyVolumeUSD);
        buyVolumeAmountDelta = snapshot.cumulativeBuyVolumeAmount.minus(previousSnapshot.cumulativeBuyVolumeAmount);
        sellVolumeUSDDelta = snapshot.cumulativeSellVolumeUSD.minus(previousSnapshot.cumulativeSellVolumeUSD);
        sellVolumeAmountDelta = snapshot.cumulativeSellVolumeAmount.minus(previousSnapshot.cumulativeSellVolumeAmount);
        totalVolumeUSDDelta = snapshot.cumulativeTotalVolumeUSD.minus(previousSnapshot.cumulativeTotalVolumeUSD);
        totalVolumeAmountDelta = snapshot.cumulativeTotalVolumeAmount.minus(previousSnapshot.cumulativeTotalVolumeAmount);
        netVolumeUSDDelta = snapshot.netVolumeUSD.minus(previousSnapshot.netVolumeUSD);
        netVolumeAmountDelta = snapshot.netVolumeAmount.minus(previousSnapshot.netVolumeAmount);
        activeUsersDelta =
            snapshot.cumulativeUniqueUsers - previousSnapshot.cumulativeUniqueUsers;
        buyCountDelta =
            snapshot.cumulativeBuyCount - previousSnapshot.cumulativeBuyCount;
        sellCountDelta =
            snapshot.cumulativeSellCount - previousSnapshot.cumulativeSellCount;
        transactionCountDelta =
            snapshot.cumulativeTransactionCount -
                previousSnapshot.cumulativeTransactionCount;
    }
    snapshot.dailySupplySideRevenueUSD = supplySideRevenueUSDDelta;
    snapshot.dailyProtocolSideRevenueUSD = protocolSideRevenueUSDDelta;
    snapshot.dailyTotalRevenueUSD = totalRevenueUSDDelta;
    snapshot.dailyBuyVolumeAmount = buyVolumeAmountDelta;
    snapshot.dailyBuyVolumeUSD = buyVolumeUSDDelta;
    snapshot.dailySellVolumeAmount = sellVolumeAmountDelta;
    snapshot.dailySellVolumeUSD = sellVolumeUSDDelta;
    snapshot.dailyTotalVolumeAmount = totalVolumeAmountDelta;
    snapshot.dailyTotalVolumeUSD = totalVolumeUSDDelta;
    snapshot.dailyNetVolumeAmount = netVolumeAmountDelta;
    snapshot.dailyNetVolumeUSD = netVolumeUSDDelta;
    snapshot.dailyActiveUsers = activeUsersDelta;
    snapshot.dailyBuyCount = buyCountDelta;
    snapshot.dailySellCount = sellCountDelta;
    snapshot.dailyTransactionCount = transactionCountDelta;
    snapshot.save();
}
exports.takePoolDailySnapshot = takePoolDailySnapshot;
function takePoolHourlySnapshot(pool, event) {
    const hour = (0, utils_1.getHoursSinceEpoch)(event.block.timestamp.toI32());
    const id = graph_ts_1.Bytes.empty()
        .concat(pool.id)
        .concat(graph_ts_1.Bytes.fromUTF8("-"))
        .concat(graph_ts_1.Bytes.fromI32(hour));
    const snapshot = new schema_1.PoolHourlySnapshot(id);
    snapshot.hour = hour;
    snapshot.pool = pool.id;
    snapshot.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    snapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    snapshot.inputTokenBalances = pool.inputTokenBalances;
    snapshot.inputTokenBalancesUSD = pool.inputTokenBalancesUSD;
    snapshot.cumulativeSupplySideRevenueUSD = pool.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    let supplySideRevenueUSDDelta = snapshot.cumulativeSupplySideRevenueUSD;
    let protocolSideRevenueUSDDelta = snapshot.cumulativeProtocolSideRevenueUSD;
    let totalRevenueUSDDelta = snapshot.cumulativeTotalRevenueUSD;
    const previousHour = (0, utils_1.getHoursSinceEpoch)(pool._lastHourlySnapshotTimestamp.toI32());
    const previousSnapshot = schema_1.PoolHourlySnapshot.load(graph_ts_1.Bytes.fromI32(previousHour));
    if (previousSnapshot) {
        supplySideRevenueUSDDelta = snapshot.cumulativeSupplySideRevenueUSD.minus(previousSnapshot.cumulativeSupplySideRevenueUSD);
        protocolSideRevenueUSDDelta =
            snapshot.cumulativeProtocolSideRevenueUSD.minus(previousSnapshot.cumulativeProtocolSideRevenueUSD);
        totalRevenueUSDDelta = snapshot.cumulativeTotalRevenueUSD.minus(previousSnapshot.cumulativeTotalRevenueUSD);
    }
    snapshot.hourlySupplySideRevenueUSD = supplySideRevenueUSDDelta;
    snapshot.hourlyProtocolSideRevenueUSD = protocolSideRevenueUSDDelta;
    snapshot.hourlyTotalRevenueUSD = totalRevenueUSDDelta;
    snapshot.save();
}
exports.takePoolHourlySnapshot = takePoolHourlySnapshot;
function takePoolSnapshots(pool, event) {
    if (pool._lastDailySnapshotTimestamp
        .plus(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY))
        .lt(event.block.timestamp)) {
        takePoolDailySnapshot(pool, event);
        pool._lastDailySnapshotTimestamp = event.block.timestamp;
        pool.save();
    }
    if (pool._lastHourlySnapshotTimestamp
        .plus(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_HOUR))
        .lt(event.block.timestamp)) {
        takePoolHourlySnapshot(pool, event);
        pool._lastHourlySnapshotTimestamp = event.block.timestamp;
        pool.save();
    }
}
exports.takePoolSnapshots = takePoolSnapshots;
