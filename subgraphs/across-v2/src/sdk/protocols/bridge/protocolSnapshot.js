"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolSnapshot = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../generated/schema");
const constants_1 = require("../../util/constants");
const SnapshotHelperID = graph_ts_1.Bytes.fromUTF8("_ProtocolSnapshotHelper");
const ActivityHelperID = graph_ts_1.Bytes.fromUTF8("_ActivityHelper");
/**
 * Helper class to manage Financials and Usage snapshots.
 * It is not meant to be used directly, but rather by the Bridge and Account lib classes.
 * Whenever it is instantiated it will check if it is time to take any of the
 * dailyFinancials, dailyUsage or hourlyUsage snapshots.
 *
 * Snapshots are taken in a way that allows the snapshot entity to be immutable.
 */
class ProtocolSnapshot {
  constructor(protocol, event) {
    this.protocol = protocol;
    this.event = event;
    this.helper = initProtocolHelper();
    this.activityHelper = initActivityHelper();
    this.takeSnapshots();
  }
  addActiveUser(activity) {
    this.activityHelper.dailyActiveUsers += activity.daily ? 1 : 0;
    this.activityHelper.hourlyActiveUsers += activity.hourly ? 1 : 0;
    this.activityHelper.save();
  }
  addActiveTransferSender(activity) {
    this.activityHelper.dailyActiveTransferSenders += activity.daily ? 1 : 0;
    this.activityHelper.hourlyActiveTransferSenders += activity.hourly ? 1 : 0;
    this.activityHelper.save();
  }
  addActiveTransferReceiver(activity) {
    this.activityHelper.dailyActiveTransferReceivers += activity.daily ? 1 : 0;
    this.activityHelper.hourlyActiveTransferReceivers += activity.hourly
      ? 1
      : 0;
    this.activityHelper.save();
  }
  addActiveLiquidityProvider(activity) {
    this.activityHelper.dailyActiveLiquidityProviders += activity.daily ? 1 : 0;
    this.activityHelper.hourlyActiveLiquidityProviders += activity.hourly
      ? 1
      : 0;
    this.activityHelper.save();
  }
  addActiveMessageSender(activity) {
    this.activityHelper.dailyActiveMessageSenders += activity.daily ? 1 : 0;
    this.activityHelper.hourlyActiveMessageSenders += activity.hourly ? 1 : 0;
    this.activityHelper.save();
  }
  takeSnapshots() {
    const helper = this.helper;
    if (
      helper.lastDailyFinancialsTimestamp
        .plus(constants_1.SECONDS_PER_DAY_BI)
        .lt(this.event.block.timestamp)
    ) {
      this.takeFinancialsDailySnapshot();
    }
    if (
      helper.lastDailyUsageTimestamp
        .plus(constants_1.SECONDS_PER_DAY_BI)
        .lt(this.event.block.timestamp)
    ) {
      this.takeUsageDailySnapshot();
    }
    if (
      helper.lastHourlyUsageTimestamp
        .plus(constants_1.SECONDS_PER_HOUR_BI)
        .lt(this.event.block.timestamp)
    ) {
      this.takeUsageHourlySnapshot();
    }
  }
  takeFinancialsDailySnapshot() {
    const helper = this.helper;
    const event = this.event;
    const protocol = this.protocol;
    const day = event.block.timestamp
      .div(constants_1.SECONDS_PER_DAY_BI)
      .toI32();
    const snapshot = new schema_1.FinancialsDailySnapshot(
      graph_ts_1.Bytes.fromI32(day)
    );
    snapshot.protocol = protocol.id;
    snapshot.day = day;
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    // tvl
    snapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
    snapshot.totalValueExportedUSD = protocol.totalValueExportedUSD;
    snapshot.totalValueImportedUSD = protocol.totalValueImportedUSD;
    snapshot.protocolControlledValueUSD = protocol.protocolControlledValueUSD;
    // revenues
    snapshot.cumulativeSupplySideRevenueUSD =
      protocol.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
      protocol.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
    // volumes
    snapshot.cumulativeVolumeInUSD = protocol.cumulativeVolumeInUSD;
    snapshot.cumulativeVolumeOutUSD = protocol.cumulativeVolumeOutUSD;
    snapshot.cumulativeNetVolumeUSD = protocol.netVolumeUSD;
    // deltas
    let supplySideRevenueDelta = snapshot.cumulativeSupplySideRevenueUSD;
    let protocolSideRevenueDelta = snapshot.cumulativeProtocolSideRevenueUSD;
    let totalRevenueDelta = snapshot.cumulativeTotalRevenueUSD;
    let volumeInDelta = snapshot.cumulativeVolumeInUSD;
    let volumeOutDelta = snapshot.cumulativeVolumeOutUSD;
    let netVolumeDelta = snapshot.cumulativeNetVolumeUSD;
    const previous = schema_1.FinancialsDailySnapshot.load(
      helper.lastDailyFinancialsSnapshot
    );
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
      volumeInDelta = snapshot.cumulativeVolumeInUSD.minus(
        previous.cumulativeVolumeInUSD
      );
      volumeOutDelta = snapshot.cumulativeVolumeOutUSD.minus(
        previous.cumulativeVolumeOutUSD
      );
      netVolumeDelta = snapshot.cumulativeNetVolumeUSD.minus(
        previous.cumulativeNetVolumeUSD
      );
    }
    snapshot.dailySupplySideRevenueUSD = supplySideRevenueDelta;
    snapshot.dailyProtocolSideRevenueUSD = protocolSideRevenueDelta;
    snapshot.dailyTotalRevenueUSD = totalRevenueDelta;
    snapshot.dailyVolumeInUSD = volumeInDelta;
    snapshot.dailyVolumeOutUSD = volumeOutDelta;
    snapshot.dailyNetVolumeUSD = netVolumeDelta;
    snapshot.save();
    helper.lastDailyFinancialsTimestamp = event.block.timestamp;
    helper.lastDailyFinancialsSnapshot = snapshot.id;
    helper.save();
  }
  takeUsageDailySnapshot() {
    const helper = this.helper;
    const activity = this.activityHelper;
    const event = this.event;
    const protocol = this.protocol;
    const day = event.block.timestamp
      .div(constants_1.SECONDS_PER_DAY_BI)
      .toI32();
    const snapshot = new schema_1.UsageMetricsDailySnapshot(
      graph_ts_1.Bytes.fromI32(day)
    );
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
    snapshot.dailyActiveTransferSenders = activity.dailyActiveTransferSenders;
    snapshot.dailyActiveTransferReceivers =
      activity.dailyActiveTransferReceivers;
    snapshot.dailyActiveLiquidityProviders =
      activity.dailyActiveLiquidityProviders;
    snapshot.dailyActiveMessageSenders = activity.dailyActiveMessageSenders;
    // transaction counts
    snapshot.cumulativeTransactionCount = protocol.cumulativeTransactionCount;
    snapshot.cumulativeTransferOutCount = protocol.cumulativeTransferOutCount;
    snapshot.cumulativeTransferInCount = protocol.cumulativeTransferInCount;
    snapshot.cumulativeLiquidityDepositCount =
      protocol.cumulativeLiquidityDepositCount;
    snapshot.cumulativeLiquidityWithdrawCount =
      protocol.cumulativeLiquidityWithdrawCount;
    snapshot.cumulativeMessageSentCount = protocol.cumulativeMessageSentCount;
    snapshot.cumulativeMessageReceivedCount =
      protocol.cumulativeMessageReceivedCount;
    // misc
    snapshot.totalPoolCount = protocol.totalPoolCount;
    snapshot.totalPoolRouteCount = protocol.totalPoolRouteCount;
    snapshot.totalCanonicalRouteCount = protocol.totalCanonicalRouteCount;
    snapshot.totalWrappedRouteCount = protocol.totalWrappedRouteCount;
    snapshot.totalSupportedTokenCount = protocol.totalSupportedTokenCount;
    // deltas
    let transactionDelta = snapshot.cumulativeTransactionCount;
    let transferOutDelta = snapshot.cumulativeTransferOutCount;
    let transferInDelta = snapshot.cumulativeTransferInCount;
    let liquidityDepositDelta = snapshot.cumulativeLiquidityDepositCount;
    let liquidityWithdrawDelta = snapshot.cumulativeLiquidityWithdrawCount;
    let messageSentDelta = snapshot.cumulativeMessageSentCount;
    let messageReceivedDelta = snapshot.cumulativeMessageReceivedCount;
    const previous = schema_1.UsageMetricsDailySnapshot.load(
      helper.lastDailyUsageSnapshot
    );
    if (previous) {
      transactionDelta =
        snapshot.cumulativeTransactionCount -
        previous.cumulativeTransactionCount;
      transferOutDelta =
        snapshot.cumulativeTransferOutCount -
        previous.cumulativeTransferOutCount;
      transferInDelta =
        snapshot.cumulativeTransferInCount - previous.cumulativeTransferInCount;
      liquidityDepositDelta =
        snapshot.cumulativeLiquidityDepositCount -
        previous.cumulativeLiquidityDepositCount;
      liquidityWithdrawDelta =
        snapshot.cumulativeLiquidityWithdrawCount -
        previous.cumulativeLiquidityWithdrawCount;
      messageSentDelta =
        snapshot.cumulativeMessageSentCount -
        previous.cumulativeMessageSentCount;
      messageReceivedDelta =
        snapshot.cumulativeMessageReceivedCount -
        previous.cumulativeMessageReceivedCount;
    }
    snapshot.dailyTransactionCount = transactionDelta;
    snapshot.dailyTransferOutCount = transferOutDelta;
    snapshot.dailyTransferInCount = transferInDelta;
    snapshot.dailyLiquidityDepositCount = liquidityDepositDelta;
    snapshot.dailyLiquidityWithdrawCount = liquidityWithdrawDelta;
    snapshot.dailyMessageSentCount = messageSentDelta;
    snapshot.dailyMessageReceivedCount = messageReceivedDelta;
    snapshot.save();
    helper.lastDailyUsageTimestamp = event.block.timestamp;
    helper.lastDailyUsageSnapshot = snapshot.id;
    helper.save();
    activity.dailyActiveUsers = 0;
    activity.dailyActiveTransferSenders = 0;
    activity.dailyActiveTransferReceivers = 0;
    activity.dailyActiveLiquidityProviders = 0;
    activity.dailyActiveMessageSenders = 0;
    activity.save();
  }
  takeUsageHourlySnapshot() {
    const helper = this.helper;
    const activity = this.activityHelper;
    const event = this.event;
    const protocol = this.protocol;
    const hour = event.block.timestamp
      .div(constants_1.SECONDS_PER_HOUR_BI)
      .toI32();
    const snapshot = new schema_1.UsageMetricsHourlySnapshot(
      graph_ts_1.Bytes.fromI32(hour)
    );
    snapshot.protocol = protocol.id;
    snapshot.hour = hour;
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
    // hourly activity
    snapshot.hourlyActiveUsers = activity.hourlyActiveUsers;
    snapshot.hourlyActiveTransferSenders = activity.hourlyActiveTransferSenders;
    snapshot.hourlyActiveTransferReceivers =
      activity.hourlyActiveTransferReceivers;
    snapshot.hourlyActiveLiquidityProviders =
      activity.hourlyActiveLiquidityProviders;
    snapshot.hourlyActiveMessageSenders = activity.hourlyActiveMessageSenders;
    // transaction counts
    snapshot.cumulativeTransactionCount = protocol.cumulativeTransactionCount;
    snapshot.cumulativeTransferOutCount = protocol.cumulativeTransferOutCount;
    snapshot.cumulativeTransferInCount = protocol.cumulativeTransferInCount;
    snapshot.cumulativeLiquidityDepositCount =
      protocol.cumulativeLiquidityDepositCount;
    snapshot.cumulativeLiquidityWithdrawCount =
      protocol.cumulativeLiquidityWithdrawCount;
    snapshot.cumulativeMessageSentCount = protocol.cumulativeMessageSentCount;
    snapshot.cumulativeMessageReceivedCount =
      protocol.cumulativeMessageReceivedCount;
    // deltas
    let transactionDelta = snapshot.cumulativeTransactionCount;
    let transferOutDelta = snapshot.cumulativeTransferOutCount;
    let transferInDelta = snapshot.cumulativeTransferInCount;
    let liquidityDepositDelta = snapshot.cumulativeLiquidityDepositCount;
    let liquidityWithdrawDelta = snapshot.cumulativeLiquidityWithdrawCount;
    let messageSentDelta = snapshot.cumulativeMessageSentCount;
    let messageReceivedDelta = snapshot.cumulativeMessageReceivedCount;
    const previous = schema_1.UsageMetricsHourlySnapshot.load(
      helper.lastHourlyUsageSnapshot
    );
    if (previous) {
      transactionDelta =
        snapshot.cumulativeTransactionCount -
        previous.cumulativeTransactionCount;
      transferOutDelta =
        snapshot.cumulativeTransferOutCount -
        previous.cumulativeTransferOutCount;
      transferInDelta =
        snapshot.cumulativeTransferInCount - previous.cumulativeTransferInCount;
      liquidityDepositDelta =
        snapshot.cumulativeLiquidityDepositCount -
        previous.cumulativeLiquidityDepositCount;
      liquidityWithdrawDelta =
        snapshot.cumulativeLiquidityWithdrawCount -
        previous.cumulativeLiquidityWithdrawCount;
      messageSentDelta =
        snapshot.cumulativeMessageSentCount -
        previous.cumulativeMessageSentCount;
      messageReceivedDelta =
        snapshot.cumulativeMessageReceivedCount -
        previous.cumulativeMessageReceivedCount;
    }
    snapshot.hourlyTransactionCount = transactionDelta;
    snapshot.hourlyTransferOutCount = transferOutDelta;
    snapshot.hourlyTransferInCount = transferInDelta;
    snapshot.hourlyLiquidityDepositCount = liquidityDepositDelta;
    snapshot.hourlyLiquidityWithdrawCount = liquidityWithdrawDelta;
    snapshot.hourlyMessageSentCount = messageSentDelta;
    snapshot.hourlyMessageReceivedCount = messageReceivedDelta;
    snapshot.save();
    helper.lastHourlyUsageTimestamp = event.block.timestamp;
    helper.lastHourlyUsageSnapshot = snapshot.id;
    helper.save();
    activity.hourlyActiveUsers = 0;
    activity.hourlyActiveTransferSenders = 0;
    activity.hourlyActiveTransferReceivers = 0;
    activity.hourlyActiveLiquidityProviders = 0;
    activity.hourlyActiveMessageSenders = 0;
    activity.save();
  }
}
exports.ProtocolSnapshot = ProtocolSnapshot;
function initProtocolHelper() {
  let helper = schema_1._ProtocolSnapshotHelper.load(SnapshotHelperID);
  if (helper) {
    return helper;
  }
  helper = new schema_1._ProtocolSnapshotHelper(SnapshotHelperID);
  helper.lastActivityTimestamp = constants_1.BIGINT_ZERO;
  helper.lastDailyFinancialsTimestamp = constants_1.BIGINT_ZERO;
  helper.lastDailyFinancialsSnapshot = graph_ts_1.Bytes.fromI32(0);
  helper.lastDailyUsageTimestamp = constants_1.BIGINT_ZERO;
  helper.lastDailyUsageSnapshot = graph_ts_1.Bytes.fromI32(0);
  helper.lastHourlyUsageTimestamp = constants_1.BIGINT_ZERO;
  helper.lastHourlyUsageSnapshot = graph_ts_1.Bytes.fromI32(0);
  helper.save();
  return helper;
}
function initActivityHelper() {
  let helper = schema_1._ActivityHelper.load(ActivityHelperID);
  if (helper) {
    return helper;
  }
  helper = new schema_1._ActivityHelper(ActivityHelperID);
  helper.hourlyActiveUsers = 0;
  helper.dailyActiveUsers = 0;
  helper.hourlyActiveTransferSenders = 0;
  helper.dailyActiveTransferSenders = 0;
  helper.hourlyActiveTransferReceivers = 0;
  helper.dailyActiveTransferReceivers = 0;
  helper.hourlyActiveLiquidityProviders = 0;
  helper.dailyActiveLiquidityProviders = 0;
  helper.hourlyActiveMessageSenders = 0;
  helper.dailyActiveMessageSenders = 0;
  helper.save();
  return helper;
}
