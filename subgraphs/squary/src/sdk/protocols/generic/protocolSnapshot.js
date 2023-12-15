"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolSnapshot = void 0;
const schema_1 = require("../../../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../util/constants");
const events_1 = require("../../util/events");
const ActivityHelperID = graph_ts_1.Bytes.fromUTF8("_ActivityHelper");
/**
 * This file contains the ProtocolSnapshot, which is used to
 * make all of the storage changes that occur in the protocol's
 * daily and hourly snapshots.
 *
 * Schema Version:  2.1.1
 * SDK Version:     1.0.1
 * Author(s):
 *  - @steegecs
 *  - @shashwatS22
 */
/**
 * Helper class to manage Financials and Usage snapshots.
 * It is not meant to be used directly, but rather by the Protocol and Account lib classes.
 * Whenever it is instantiated it will check if it is time to take any of the
 * dailyFinancials, dailyUsage or hourlyUsage snapshots.
 *
 * Snapshots are taken in a way that allows the snapshot entity to be immutable.
 */
class ProtocolSnapshot {
    constructor(protocol, event) {
        this.protocol = protocol;
        this.event = event;
        this.dayID = (0, events_1.getUnixDays)(event.block);
        this.hourID = (0, events_1.getUnixHours)(event.block);
        this.activityHelper = initActivityHelper();
        this.takeSnapshots();
    }
    addActiveUser(activity) {
        this.activityHelper.dailyActiveUsers += activity.daily ? 1 : 0;
        this.activityHelper.hourlyActiveUsers += activity.hourly ? 1 : 0;
        this.activityHelper.save();
    }
    takeSnapshots() {
        const snapshotDayID = this.protocol.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
        const snapshotHourID = this.protocol.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_HOUR;
        if (snapshotDayID != this.dayID) {
            this.takeFinancialsDailySnapshot(snapshotDayID);
            this.takeUsageDailySnapshot(snapshotDayID);
            this.protocol.lastSnapshotDayID = snapshotDayID;
            this.protocol.save();
        }
        if (snapshotHourID != this.hourID) {
            this.takeUsageHourlySnapshot(snapshotHourID);
            this.protocol.lastSnapshotHourID = snapshotHourID;
            this.protocol.save();
        }
    }
    takeFinancialsDailySnapshot(day) {
        const snapshot = new schema_1.FinancialsDailySnapshot(graph_ts_1.Bytes.fromI32(day));
        const previousSnapshot = schema_1.FinancialsDailySnapshot.load(graph_ts_1.Bytes.fromI32(this.protocol.lastSnapshotDayID));
        snapshot.day = day;
        snapshot.protocol = this.protocol.id;
        snapshot.blockNumber = this.event.block.number;
        snapshot.timestamp = this.event.block.timestamp;
        // tvl
        snapshot.totalValueLockedUSD = this.protocol.totalValueLockedUSD;
        snapshot.protocolControlledValueUSD =
            this.protocol.protocolControlledValueUSD;
        // revenues
        snapshot.cumulativeSupplySideRevenueUSD =
            this.protocol.cumulativeSupplySideRevenueUSD;
        snapshot.cumulativeProtocolSideRevenueUSD =
            this.protocol.cumulativeProtocolSideRevenueUSD;
        snapshot.cumulativeTotalRevenueUSD =
            this.protocol.cumulativeTotalRevenueUSD;
        // deltas
        let supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD;
        let protocolSideRevenueDelta = snapshot.cumulativeProtocolSideRevenueUSD;
        let totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD;
        if (previousSnapshot) {
            supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD.minus(previousSnapshot.cumulativeSupplySideRevenueUSD);
            protocolSideRevenueDelta =
                snapshot.cumulativeProtocolSideRevenueUSD.minus(previousSnapshot.cumulativeProtocolSideRevenueUSD);
            totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD.minus(previousSnapshot.cumulativeTotalRevenueUSD);
        }
        snapshot.dailySupplySideRevenueUSD = supplySideRevenueDelta;
        snapshot.dailyProtocolSideRevenueUSD = protocolSideRevenueDelta;
        snapshot.dailyTotalRevenueUSD = totalRevenueDelta;
        snapshot.save();
    }
    takeUsageDailySnapshot(day) {
        const activity = this.activityHelper;
        const snapshot = new schema_1.UsageMetricsDailySnapshot(graph_ts_1.Bytes.fromI32(day));
        const previousSnapshot = schema_1.UsageMetricsDailySnapshot.load(graph_ts_1.Bytes.fromI32(this.protocol.lastSnapshotDayID));
        snapshot.protocol = this.protocol.id;
        snapshot.day = day;
        snapshot.blockNumber = this.event.block.number;
        snapshot.timestamp = this.event.block.timestamp;
        // unique users
        snapshot.cumulativeUniqueUsers = this.protocol.cumulativeUniqueUsers;
        // daily activity
        snapshot.dailyActiveUsers = activity.dailyActiveUsers;
        // transaction counts
        snapshot.cumulativeTransactionCount =
            this.protocol.cumulativeTransactionCount;
        // misc
        snapshot.totalPoolCount = this.protocol.totalPoolCount;
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
    takeUsageHourlySnapshot(hour) {
        const activity = this.activityHelper;
        const snapshot = new schema_1.UsageMetricsHourlySnapshot(graph_ts_1.Bytes.fromI32(hour));
        const previousSnapshot = schema_1.UsageMetricsHourlySnapshot.load(graph_ts_1.Bytes.fromI32(this.protocol.lastSnapshotHourID));
        snapshot.protocol = this.protocol.id;
        snapshot.hour = hour;
        snapshot.blockNumber = this.event.block.number;
        snapshot.timestamp = this.event.block.timestamp;
        // unique users
        snapshot.cumulativeUniqueUsers = this.protocol.cumulativeUniqueUsers;
        // hourly activity
        snapshot.hourlyActiveUsers = activity.hourlyActiveUsers;
        // transaction counts
        snapshot.cumulativeTransactionCount =
            this.protocol.cumulativeTransactionCount;
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
}
exports.ProtocolSnapshot = ProtocolSnapshot;
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
