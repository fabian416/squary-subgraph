"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolSnapshot = void 0;
const schema_1 = require("../../../../generated/schema");
const constants_1 = require("../../util/constants");
/**
 * This file contains the PoolSnapshot, which is used to
 * make all of the storage changes that occur in the pool daily and hourly snapshots.
 *
 * Schema Version:  1.2.0
 * SDK Version:     1.0.1
 * Author(s):
 *  - @jaimehgb
 *  - @dhruv-chauhan
 */
class PoolSnapshot {
  constructor(pool, event) {
    this.pool = pool;
    this.event = event;
    this.takeSnapshots();
  }
  takeSnapshots() {
    if (!this.isInitialized()) {
      return;
    }
    if (
      this.pool._lastDailySnapshotTimestamp
        .plus(constants_1.SECONDS_PER_DAY_BI)
        .lt(this.event.block.timestamp)
    ) {
      this.takeDailySnapshot();
    }
    if (
      this.pool._lastHourlySnapshotTimestamp
        .plus(constants_1.SECONDS_PER_HOUR_BI)
        .lt(this.event.block.timestamp)
    ) {
      this.takeHourlySnapshot();
    }
  }
  isInitialized() {
    return !!(
      this.pool._lastDailySnapshotTimestamp &&
      this.pool._lastHourlySnapshotTimestamp
    );
  }
  takeHourlySnapshot() {
    const event = this.event;
    const pool = this.pool;
    const hour = event.block.timestamp
      .div(constants_1.SECONDS_PER_HOUR_BI)
      .toI32();
    const previousHour = pool._lastHourlySnapshotTimestamp
      .div(constants_1.SECONDS_PER_HOUR_BI)
      .toI32();
    const id = pool.id.concatI32(hour);
    const previousID = pool.id.concatI32(previousHour);
    const snapshot = new schema_1.PoolHourlySnapshot(id);
    snapshot.hour = hour;
    snapshot.protocol = pool.protocol;
    snapshot.pool = pool.id;
    snapshot.timestamp = event.block.timestamp;
    snapshot.blockNumber = event.block.number;
    // tvl and balances
    snapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    snapshot.netValueExportedUSD = pool.netValueExportedUSD;
    snapshot.mintSupply = pool.mintSupply;
    snapshot.inputTokenBalance = pool.inputTokenBalance;
    snapshot.outputTokenSupply = pool.outputTokenSupply;
    snapshot.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    snapshot.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    snapshot.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
    snapshot.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    // routes
    const routeSnapshots = new Array();
    for (let i = 0; i < pool.routes.length; i++) {
      routeSnapshots.push(
        this.takeRouteSnapshot(event, snapshot.id, pool.routes[i], previousID)
      );
    }
    snapshot.routes = routeSnapshots;
    // revenues
    snapshot.cumulativeSupplySideRevenueUSD =
      pool.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
      pool.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    // volumes
    snapshot.cumulativeVolumeIn = pool.cumulativeVolumeIn;
    snapshot.cumulativeVolumeInUSD = pool.cumulativeVolumeInUSD;
    snapshot.cumulativeVolumeOut = pool.cumulativeVolumeOut;
    snapshot.cumulativeVolumeOutUSD = pool.cumulativeVolumeOutUSD;
    snapshot.netCumulativeVolume = pool.cumulativeVolumeIn.minus(
      pool.cumulativeVolumeOut
    );
    snapshot.netCumulativeVolumeUSD = pool.cumulativeVolumeInUSD.minus(
      pool.cumulativeVolumeOutUSD
    );
    // deltas
    let supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD;
    let protocolSideRevenueDelta = snapshot.cumulativeProtocolSideRevenueUSD;
    let totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD;
    let volumeInDelta = snapshot.cumulativeVolumeIn;
    let volumeInUSDDelta = snapshot.cumulativeVolumeInUSD;
    let volumeOutDelta = snapshot.cumulativeVolumeOut;
    let volumeOutUSDDelta = snapshot.cumulativeVolumeOutUSD;
    let netVolumeDelta = snapshot.netCumulativeVolume;
    let netVolumeUSDDelta = snapshot.netCumulativeVolumeUSD;
    const previous = schema_1.PoolHourlySnapshot.load(previousID);
    if (previous) {
      supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD.minus(
        previous.cumulativeSupplySideRevenueUSD
      );
      protocolSideRevenueDelta =
        snapshot.cumulativeProtocolSideRevenueUSD.minus(
          previous.cumulativeProtocolSideRevenueUSD
        );
      totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD.minus(
        previous.cumulativeTotalRevenueUSD
      );
      volumeInDelta = snapshot.cumulativeVolumeIn.minus(
        previous.cumulativeVolumeIn
      );
      volumeInUSDDelta = snapshot.cumulativeVolumeInUSD.minus(
        previous.cumulativeVolumeInUSD
      );
      volumeOutDelta = snapshot.cumulativeVolumeOut.minus(
        previous.cumulativeVolumeOut
      );
      volumeOutUSDDelta = snapshot.cumulativeVolumeOutUSD.minus(
        previous.cumulativeVolumeOutUSD
      );
      netVolumeDelta = snapshot.netCumulativeVolume.minus(
        previous.netCumulativeVolume
      );
      netVolumeUSDDelta = snapshot.netCumulativeVolumeUSD.minus(
        previous.netCumulativeVolumeUSD
      );
    }
    snapshot.hourlySupplySideRevenueUSD = supplySideRevenueDelta;
    snapshot.hourlyProtocolSideRevenueUSD = protocolSideRevenueDelta;
    snapshot.hourlyTotalRevenueUSD = totalRevenueDelta;
    snapshot.hourlyVolumeIn = volumeInDelta;
    snapshot.hourlyVolumeInUSD = volumeInUSDDelta;
    snapshot.hourlyVolumeOut = volumeOutDelta;
    snapshot.hourlyVolumeOutUSD = volumeOutUSDDelta;
    snapshot.netHourlyVolume = netVolumeDelta;
    snapshot.netHourlyVolumeUSD = netVolumeUSDDelta;
    snapshot.save();
    pool._lastHourlySnapshotTimestamp = event.block.timestamp;
    pool.save();
  }
  takeDailySnapshot() {
    const event = this.event;
    const pool = this.pool;
    const day = event.block.timestamp
      .div(constants_1.SECONDS_PER_DAY_BI)
      .toI32();
    const previousDay = pool._lastDailySnapshotTimestamp
      .div(constants_1.SECONDS_PER_DAY_BI)
      .toI32();
    const id = pool.id.concatI32(day);
    const previousID = pool.id.concatI32(previousDay);
    const snapshot = new schema_1.PoolDailySnapshot(id);
    snapshot.day = day;
    snapshot.protocol = pool.protocol;
    snapshot.pool = pool.id;
    snapshot.timestamp = event.block.timestamp;
    snapshot.blockNumber = event.block.number;
    // tvl and balances
    snapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    snapshot.netValueExportedUSD = pool.netValueExportedUSD;
    snapshot.mintSupply = pool.mintSupply;
    snapshot.inputTokenBalance = pool.inputTokenBalance;
    snapshot.outputTokenSupply = pool.outputTokenSupply;
    snapshot.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    snapshot.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    snapshot.rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
    snapshot.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    // routes
    const routeSnapshots = new Array();
    for (let i = 0; i < pool.routes.length; i++) {
      routeSnapshots.push(
        this.takeRouteSnapshot(event, snapshot.id, pool.routes[i], previousID)
      );
    }
    snapshot.routes = routeSnapshots;
    // revenues
    snapshot.cumulativeSupplySideRevenueUSD =
      pool.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
      pool.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    // volumes
    snapshot.cumulativeVolumeIn = pool.cumulativeVolumeIn;
    snapshot.cumulativeVolumeInUSD = pool.cumulativeVolumeInUSD;
    snapshot.cumulativeVolumeOut = pool.cumulativeVolumeOut;
    snapshot.cumulativeVolumeOutUSD = pool.cumulativeVolumeOutUSD;
    snapshot.netCumulativeVolume = pool.cumulativeVolumeIn.minus(
      pool.cumulativeVolumeOut
    );
    snapshot.netCumulativeVolumeUSD = pool.cumulativeVolumeInUSD.minus(
      pool.cumulativeVolumeOutUSD
    );
    // deltas
    let supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD;
    let protocolSideRevenueDelta = snapshot.cumulativeProtocolSideRevenueUSD;
    let totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD;
    let volumeInDelta = snapshot.cumulativeVolumeIn;
    let volumeInUSDDelta = snapshot.cumulativeVolumeInUSD;
    let volumeOutDelta = snapshot.cumulativeVolumeOut;
    let volumeOutUSDDelta = snapshot.cumulativeVolumeOutUSD;
    let netVolumeDelta = snapshot.netCumulativeVolume;
    let netVolumeUSDDelta = snapshot.netCumulativeVolumeUSD;
    const previous = schema_1.PoolDailySnapshot.load(previousID);
    if (previous) {
      supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD.minus(
        previous.cumulativeSupplySideRevenueUSD
      );
      protocolSideRevenueDelta =
        snapshot.cumulativeProtocolSideRevenueUSD.minus(
          previous.cumulativeProtocolSideRevenueUSD
        );
      totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD.minus(
        previous.cumulativeTotalRevenueUSD
      );
      volumeInDelta = snapshot.cumulativeVolumeIn.minus(
        previous.cumulativeVolumeIn
      );
      volumeInUSDDelta = snapshot.cumulativeVolumeInUSD.minus(
        previous.cumulativeVolumeInUSD
      );
      volumeOutDelta = snapshot.cumulativeVolumeOut.minus(
        previous.cumulativeVolumeOut
      );
      volumeOutUSDDelta = snapshot.cumulativeVolumeOutUSD.minus(
        previous.cumulativeVolumeOutUSD
      );
      netVolumeDelta = snapshot.netCumulativeVolume.minus(
        previous.netCumulativeVolume
      );
      netVolumeUSDDelta = snapshot.netCumulativeVolumeUSD.minus(
        previous.netCumulativeVolumeUSD
      );
    }
    snapshot.dailySupplySideRevenueUSD = supplySideRevenueDelta;
    snapshot.dailyProtocolSideRevenueUSD = protocolSideRevenueDelta;
    snapshot.dailyTotalRevenueUSD = totalRevenueDelta;
    snapshot.dailyVolumeIn = volumeInDelta;
    snapshot.dailyVolumeInUSD = volumeInUSDDelta;
    snapshot.dailyVolumeOut = volumeOutDelta;
    snapshot.dailyVolumeOutUSD = volumeOutUSDDelta;
    snapshot.netDailyVolume = netVolumeDelta;
    snapshot.netDailyVolumeUSD = netVolumeUSDDelta;
    snapshot.save();
    pool._lastDailySnapshotTimestamp = event.block.timestamp;
    pool.save();
  }
  takeRouteSnapshot(event, snapshotID, routeId, previousSnapshotID) {
    const route = schema_1.PoolRoute.load(routeId);
    const id = poolRouteSnapshotID(routeId, snapshotID);
    const snapshot = new schema_1.PoolRouteSnapshot(id);
    snapshot.poolRoute = routeId;
    snapshot.timestamp = event.block.timestamp;
    snapshot.blockNumber = event.block.number;
    snapshot.cumulativeVolumeIn = route.cumulativeVolumeIn;
    snapshot.cumulativeVolumeInUSD = route.cumulativeVolumeInUSD;
    snapshot.cumulativeVolumeOut = route.cumulativeVolumeOut;
    snapshot.cumulativeVolumeOutUSD = route.cumulativeVolumeOutUSD;
    // deltas
    let intervalVolumeIn = snapshot.cumulativeVolumeIn;
    let intervalVolumeInUSD = snapshot.cumulativeVolumeInUSD;
    let intervalVolumeOut = snapshot.cumulativeVolumeOut;
    let intervalVolumeOutUSD = snapshot.cumulativeVolumeOutUSD;
    const previous = schema_1.PoolRouteSnapshot.load(
      poolRouteSnapshotID(routeId, previousSnapshotID)
    );
    if (previous) {
      intervalVolumeIn = snapshot.cumulativeVolumeIn.minus(
        previous.cumulativeVolumeIn
      );
      intervalVolumeInUSD = snapshot.cumulativeVolumeInUSD.minus(
        previous.cumulativeVolumeInUSD
      );
      intervalVolumeOut = snapshot.cumulativeVolumeOut.minus(
        previous.cumulativeVolumeOut
      );
      intervalVolumeOutUSD = snapshot.cumulativeVolumeOutUSD.minus(
        previous.cumulativeVolumeOutUSD
      );
    }
    snapshot.snapshotVolumeIn = intervalVolumeIn;
    snapshot.snapshotVolumeInUSD = intervalVolumeInUSD;
    snapshot.snapshotVolumeOut = intervalVolumeOut;
    snapshot.snapshotVolumeOutUSD = intervalVolumeOutUSD;
    snapshot.save();
    return snapshot.id;
  }
}
exports.PoolSnapshot = PoolSnapshot;
function poolRouteSnapshotID(routeId, snapshotId) {
  return routeId.concat(snapshotId);
}
