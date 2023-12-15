"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiquidityPoolSnapshots = exports.createProtocolSnapshots = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const schema_1 = require("../../generated/schema");
const ActivityHelperID = graph_ts_1.Bytes.fromUTF8("_ActivityHelper");
function createProtocolSnapshots(event, protocol) {
    const dayID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const hourID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const snapshotDayID = protocol.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const snapshotHourID = protocol.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    if (snapshotDayID != dayID) {
        takeFinancialsDailySnapshot(event, protocol, snapshotDayID);
        takeUsageDailySnapshot(event, protocol, snapshotDayID);
        protocol.lastSnapshotDayID = snapshotDayID;
        protocol.save();
    }
    if (snapshotHourID != hourID) {
        takeUsageHourlySnapshot(event, protocol, snapshotHourID);
        protocol.lastSnapshotHourID = snapshotHourID;
        protocol.save();
    }
}
exports.createProtocolSnapshots = createProtocolSnapshots;
function createLiquidityPoolSnapshots(event, pool) {
    const dayID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const hourID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const snapshotDayID = pool.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const snapshotHourID = pool.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    if (snapshotDayID != dayID) {
        takeLiquidityPoolDailySnapshot(event, pool, snapshotDayID);
        pool.lastSnapshotDayID = snapshotDayID;
        pool.save();
    }
    if (snapshotHourID != hourID) {
        takeLiquidityPoolHourlySnapshot(event, pool, snapshotHourID);
        pool.lastSnapshotHourID = snapshotHourID;
        pool.save();
    }
}
exports.createLiquidityPoolSnapshots = createLiquidityPoolSnapshots;
function takeFinancialsDailySnapshot(event, protocol, day) {
    const snapshot = new schema_1.FinancialsDailySnapshot(graph_ts_1.Bytes.fromI32(day));
    const previousSnapshot = schema_1.FinancialsDailySnapshot.load(protocol.lastSnapshotDayID);
    snapshot.day = day;
    snapshot.protocol = protocol.id;
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    // tvl
    snapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
    snapshot.protocolControlledValueUSD = protocol.protocolControlledValueUSD;
    // revenues
    snapshot.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
    // deltas
    let supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD;
    let protocolSideRevenueDelta = snapshot.cumulativeProtocolSideRevenueUSD;
    let totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD;
    if (previousSnapshot) {
        supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD.minus(previousSnapshot.cumulativeSupplySideRevenueUSD);
        protocolSideRevenueDelta = snapshot.cumulativeProtocolSideRevenueUSD.minus(previousSnapshot.cumulativeProtocolSideRevenueUSD);
        totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD.minus(previousSnapshot.cumulativeTotalRevenueUSD);
    }
    snapshot.dailySupplySideRevenueUSD = supplySideRevenueDelta;
    snapshot.dailyProtocolSideRevenueUSD = protocolSideRevenueDelta;
    snapshot.dailyTotalRevenueUSD = totalRevenueDelta;
    snapshot.save();
}
function takeUsageDailySnapshot(event, protocol, day) {
    const activity = initActivityHelper();
    const snapshot = new schema_1.UsageMetricsDailySnapshot(graph_ts_1.Bytes.fromI32(day));
    const previousSnapshot = schema_1.UsageMetricsDailySnapshot.load(protocol.lastSnapshotDayID);
    snapshot.protocol = protocol.id;
    snapshot.day = day;
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    // unique users
    snapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    snapshot.cumulativeUniqueTransferSenders =
        protocol.cumulativeUniqueTransferSenders;
    snapshot.cumulativeUniqueTransferReceivers =
        protocol.cumulativeUniqueTransferReceivers;
    snapshot.cumulativeUniqueLiquidityProviders =
        protocol.cumulativeUniqueLiquidityProviders;
    snapshot.cumulativeUniqueMessageSenders =
        protocol.cumulativeUniqueMessageSenders;
    // daily activity
    snapshot.dailyActiveUsers = activity.dailyActiveUsers;
    // transaction counts
    snapshot.cumulativeTransactionCount = protocol.cumulativeTransactionCount;
    // misc
    snapshot.totalPoolCount = protocol.totalPoolCount;
    // deltas
    let transactionDelta = snapshot.cumulativeTransactionCount;
    if (previousSnapshot) {
        transactionDelta =
            snapshot.cumulativeTransactionCount -
                previousSnapshot.cumulativeTransactionCount;
    }
    snapshot.dailyTransactionCount = transactionDelta;
    snapshot.save();
    activity.dailyActiveUsers = 0;
    activity.save();
}
function takeUsageHourlySnapshot(event, protocol, hour) {
    const activity = initActivityHelper();
    const snapshot = new schema_1.UsageMetricsHourlySnapshot(graph_ts_1.Bytes.fromI32(hour));
    const previousSnapshot = schema_1.UsageMetricsHourlySnapshot.load(protocol.lastSnapshotHourID);
    snapshot.protocol = protocol.id;
    snapshot.hour = hour;
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    // unique users
    snapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    // hourly activity
    snapshot.hourlyActiveUsers = activity.hourlyActiveUsers;
    // transaction counts
    snapshot.cumulativeTransactionCount = protocol.cumulativeTransactionCount;
    // deltas
    let transactionDelta = snapshot.cumulativeTransactionCount;
    if (previousSnapshot) {
        transactionDelta =
            snapshot.cumulativeTransactionCount -
                previousSnapshot.cumulativeTransactionCount;
    }
    snapshot.hourlyTransactionCount = transactionDelta;
    snapshot.save();
    activity.hourlyActiveUsers = 0;
    activity.save();
}
function takeLiquidityPoolHourlySnapshot(event, pool, hour) {
    const snapshot = new schema_1.LiquidityPoolHourlySnapshot(pool.id.concatI32(hour));
    const previousSnapshot = schema_1.LiquidityPoolHourlySnapshot.load(pool.id.concatI32(pool.lastSnapshotHourID));
    snapshot.hour = hour;
    snapshot.protocol = pool.protocol;
    snapshot.pool = pool.id;
    snapshot.timestamp = event.block.timestamp;
    snapshot.blockNumber = event.block.number;
    // tvl and balances
    snapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    snapshot.inputTokenBalance = pool.inputTokenBalance;
    snapshot.totalLiquidity = pool.totalLiquidity;
    snapshot.totalLiquidityUSD = pool.totalLiquidityUSD;
    snapshot.stakedLiquidity = pool.stakedLiquidity;
    snapshot.rewardTokenEmissions = pool.rewardTokenEmissions;
    snapshot.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    // revenues
    snapshot.cumulativeSupplySideRevenueUSD = pool.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    // deltas
    let supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD;
    let protocolSideRevenueDelta = snapshot.cumulativeProtocolSideRevenueUSD;
    let totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD;
    if (previousSnapshot) {
        supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD.minus(previousSnapshot.cumulativeSupplySideRevenueUSD);
        protocolSideRevenueDelta = snapshot.cumulativeProtocolSideRevenueUSD.minus(previousSnapshot.cumulativeProtocolSideRevenueUSD);
        totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD.minus(previousSnapshot.cumulativeTotalRevenueUSD);
    }
    snapshot.hourlySupplySideRevenueUSD = supplySideRevenueDelta;
    snapshot.hourlyProtocolSideRevenueUSD = protocolSideRevenueDelta;
    snapshot.hourlyTotalRevenueUSD = totalRevenueDelta;
    snapshot.save();
}
function takeLiquidityPoolDailySnapshot(event, pool, day) {
    const snapshot = new schema_1.LiquidityPoolDailySnapshot(pool.id.concatI32(day));
    const previousSnapshot = schema_1.LiquidityPoolDailySnapshot.load(pool.id.concatI32(pool.lastSnapshotDayID));
    snapshot.day = day;
    snapshot.protocol = pool.protocol;
    snapshot.pool = pool.id;
    snapshot.timestamp = event.block.timestamp;
    snapshot.blockNumber = event.block.number;
    // tvl and balances
    snapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    snapshot.inputTokenBalance = pool.inputTokenBalance;
    snapshot.totalLiquidity = pool.totalLiquidity;
    snapshot.totalLiquidityUSD = pool.totalLiquidityUSD;
    snapshot.stakedLiquidity = pool.stakedLiquidity;
    snapshot.rewardTokenEmissions = pool.rewardTokenEmissions;
    snapshot.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    // revenues
    snapshot.cumulativeSupplySideRevenueUSD = pool.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    // deltas
    let supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD;
    let protocolSideRevenueDelta = snapshot.cumulativeProtocolSideRevenueUSD;
    let totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD;
    if (previousSnapshot) {
        supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD.minus(previousSnapshot.cumulativeSupplySideRevenueUSD);
        protocolSideRevenueDelta = snapshot.cumulativeProtocolSideRevenueUSD.minus(previousSnapshot.cumulativeProtocolSideRevenueUSD);
        totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD.minus(previousSnapshot.cumulativeTotalRevenueUSD);
    }
    snapshot.dailySupplySideRevenueUSD = supplySideRevenueDelta;
    snapshot.dailyProtocolSideRevenueUSD = protocolSideRevenueDelta;
    snapshot.dailyTotalRevenueUSD = totalRevenueDelta;
    snapshot.save();
}
function initActivityHelper() {
    let helper = schema_1._ActivityHelper.load(ActivityHelperID);
    if (helper) {
        return helper;
    }
    helper = new schema_1._ActivityHelper(ActivityHelperID);
    helper.hourlyActiveUsers = 0;
    helper.dailyActiveUsers = 0;
    helper.save();
    return helper;
}
