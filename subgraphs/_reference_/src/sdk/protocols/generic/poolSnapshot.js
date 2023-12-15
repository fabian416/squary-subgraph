"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolSnapshot = void 0;
const schema_1 = require("../../../../generated/schema");
const constants_1 = require("../../util/constants");
const events_1 = require("../../util/events");
/**
 * This file contains the PoolSnapshot, which is used to
 * make all of the storage changes that occur in the pool daily and hourly snapshots.
 *
 * Schema Version:  2.1.1
 * SDK Version:     1.0.1
 * Author(s):
 *  - @steegecs
 *  - @shashwatS22
 */
class PoolSnapshot {
  constructor(pool, event) {
    this.pool = pool;
    this.event = event;
    this.dayID = (0, events_1.getUnixDays)(event.block);
    this.hourID = (0, events_1.getUnixHours)(event.block);
    this.takeSnapshots();
  }
  takeSnapshots() {
    if (!this.pool.lastUpdateTimestamp) return;
    const snapshotDayID =
      this.pool.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const snapshotHourID =
      this.pool.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    if (snapshotDayID != this.dayID) {
      this.takeDailySnapshot(snapshotDayID);
      this.pool.lastSnapshotDayID = snapshotDayID;
      this.pool.save();
    }
    if (snapshotHourID != this.hourID) {
      this.takeHourlySnapshot(snapshotHourID);
      this.pool.lastSnapshotHourID = snapshotHourID;
      this.pool.save();
    }
  }
  takeHourlySnapshot(hour) {
    const snapshot = new schema_1.PoolHourlySnapshot(
      this.pool.id.concatI32(hour)
    );
    const previousSnapshot = schema_1.PoolHourlySnapshot.load(
      this.pool.id.concatI32(this.pool.lastSnapshotHourID)
    );
    snapshot.hours = hour;
    snapshot.protocol = this.pool.protocol;
    snapshot.pool = this.pool.id;
    snapshot.timestamp = this.event.block.timestamp;
    snapshot.blockNumber = this.event.block.number;
    // tvl and balances
    snapshot.totalValueLockedUSD = this.pool.totalValueLockedUSD;
    snapshot.inputTokenBalances = this.pool.inputTokenBalances;
    snapshot.inputTokenBalancesUSD = this.pool.inputTokenBalancesUSD;
    snapshot.rewardTokenEmissionsAmount = this.pool.rewardTokenEmissionsAmount;
    snapshot.rewardTokenEmissionsUSD = this.pool.rewardTokenEmissionsUSD;
    // revenues
    snapshot.cumulativeSupplySideRevenueUSD =
      this.pool.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
      this.pool.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = this.pool.cumulativeTotalRevenueUSD;
    // deltas
    let supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD;
    let protocolSideRevenueDelta = snapshot.cumulativeProtocolSideRevenueUSD;
    let totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD;
    if (previousSnapshot) {
      supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD.minus(
        previousSnapshot.cumulativeSupplySideRevenueUSD
      );
      protocolSideRevenueDelta =
        snapshot.cumulativeProtocolSideRevenueUSD.minus(
          previousSnapshot.cumulativeProtocolSideRevenueUSD
        );
      totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD.minus(
        previousSnapshot.cumulativeTotalRevenueUSD
      );
    }
    snapshot.hourlySupplySideRevenueUSD = supplySideRevenueDelta;
    snapshot.hourlyProtocolSideRevenueUSD = protocolSideRevenueDelta;
    snapshot.hourlyTotalRevenueUSD = totalRevenueDelta;
    snapshot.save();
  }
  takeDailySnapshot(day) {
    const snapshot = new schema_1.PoolDailySnapshot(
      this.pool.id.concatI32(day)
    );
    const previousSnapshot = schema_1.PoolDailySnapshot.load(
      this.pool.id.concatI32(this.pool.lastSnapshotDayID)
    );
    snapshot.day = day;
    snapshot.protocol = this.pool.protocol;
    snapshot.pool = this.pool.id;
    snapshot.timestamp = this.event.block.timestamp;
    snapshot.blockNumber = this.event.block.number;
    // tvl and balances
    snapshot.totalValueLockedUSD = this.pool.totalValueLockedUSD;
    snapshot.inputTokenBalances = this.pool.inputTokenBalances;
    snapshot.inputTokenBalancesUSD = this.pool.inputTokenBalancesUSD;
    snapshot.rewardTokenEmissionsAmount = this.pool.rewardTokenEmissionsAmount;
    snapshot.rewardTokenEmissionsUSD = this.pool.rewardTokenEmissionsUSD;
    // revenues
    snapshot.cumulativeSupplySideRevenueUSD =
      this.pool.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
      this.pool.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = this.pool.cumulativeTotalRevenueUSD;
    // deltas
    let supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD;
    let protocolSideRevenueDelta = snapshot.cumulativeProtocolSideRevenueUSD;
    let totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD;
    if (previousSnapshot) {
      supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD.minus(
        previousSnapshot.cumulativeSupplySideRevenueUSD
      );
      protocolSideRevenueDelta =
        snapshot.cumulativeProtocolSideRevenueUSD.minus(
          previousSnapshot.cumulativeProtocolSideRevenueUSD
        );
      totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD.minus(
        previousSnapshot.cumulativeTotalRevenueUSD
      );
    }
    snapshot.dailySupplySideRevenueUSD = supplySideRevenueDelta;
    snapshot.dailyProtocolSideRevenueUSD = protocolSideRevenueDelta;
    snapshot.dailyTotalRevenueUSD = totalRevenueDelta;
    snapshot.save();
  }
}
exports.PoolSnapshot = PoolSnapshot;
