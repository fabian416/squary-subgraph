"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotManager = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("./constants");
/**
 * This file contains the SnapshotManager, which is used to
 * make all of the storage changes that occur in lending snapshots.
 *
 * You can think of this as an abstraction so the developer doesn't
 * need to think about all of the detailed storage changes that occur.
 *
 * Schema Version:  3.1.1
 * SDK Version:     1.0.8
 * Author(s):
 *  - @melotik
 *  - @dhruv-chauhan
 */
class SnapshotManager {
  constructor(event, protocol, market) {
    this.event = event;
    this.protocol = protocol;
    this.market = market;
    this.createOrUpdateMarketHourlySnapshot();
    this.createOrUpdateMarketDailySnapshot();
    this.createOrUpdateFinancials();
    this.createOrUpdateUsageDailySnapshot();
    this.createOrUpdateUsageHourlySnapshot();
  }
  ///////////////////
  ///// Getters /////
  ///////////////////
  createOrUpdateMarketHourlySnapshot() {
    const hours =
      this.event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const id = this.market.id.concat(graph_ts_1.Bytes.fromI32(hours));
    let snapshot = schema_1.MarketHourlySnapshot.load(id);
    if (!snapshot) {
      snapshot = new schema_1.MarketHourlySnapshot(id);
      snapshot.hours = hours;
      snapshot.protocol = this.protocol.id;
      snapshot.market = this.market.id;
      snapshot.relation = this.market.relation;
      snapshot.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.hourlyTransferUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.hourlyFlashloanUSD = constants_1.BIGDECIMAL_ZERO;
    }
    snapshot.blockNumber = this.event.block.number;
    snapshot.timestamp = this.event.block.timestamp;
    snapshot.inputTokenBalance = this.market.inputTokenBalance;
    snapshot.inputTokenPriceUSD = this.market.inputTokenPriceUSD;
    snapshot.outputTokenSupply = this.market.outputTokenSupply;
    snapshot.outputTokenPriceUSD = this.market.outputTokenPriceUSD;
    snapshot.exchangeRate = this.market.exchangeRate;
    snapshot.rates = this.market.rates
      ? this.getSnapshotRates(this.market.rates, hours.toString())
      : null;
    snapshot.reserves = this.market.reserves;
    snapshot.variableBorrowedTokenBalance =
      this.market.variableBorrowedTokenBalance;
    snapshot.stableBorrowedTokenBalance =
      this.market.stableBorrowedTokenBalance;
    snapshot.totalValueLockedUSD = this.market.totalValueLockedUSD;
    snapshot.cumulativeSupplySideRevenueUSD =
      this.market.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
      this.market.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = this.market.cumulativeTotalRevenueUSD;
    snapshot.totalDepositBalanceUSD = this.market.totalDepositBalanceUSD;
    snapshot.cumulativeDepositUSD = this.market.cumulativeDepositUSD;
    snapshot.totalBorrowBalanceUSD = this.market.totalBorrowBalanceUSD;
    snapshot.cumulativeBorrowUSD = this.market.cumulativeBorrowUSD;
    snapshot.cumulativeLiquidateUSD = this.market.cumulativeLiquidateUSD;
    snapshot.rewardTokenEmissionsAmount =
      this.market.rewardTokenEmissionsAmount;
    snapshot.rewardTokenEmissionsUSD = this.market.rewardTokenEmissionsUSD;
    snapshot.stakedOutputTokenAmount = this.market.stakedOutputTokenAmount;
    snapshot.save();
    this.marketHourlySnapshot = snapshot;
  }
  createOrUpdateMarketDailySnapshot() {
    const days =
      this.event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const id = this.market.id.concat(graph_ts_1.Bytes.fromI32(days));
    let snapshot = schema_1.MarketDailySnapshot.load(id);
    if (!snapshot) {
      snapshot = new schema_1.MarketDailySnapshot(id);
      snapshot.days = days;
      snapshot.protocol = this.protocol.id;
      snapshot.market = this.market.id;
      snapshot.relation = this.market.relation;
      snapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyNativeDeposit = constants_1.BIGINT_ZERO;
      snapshot.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyNativeBorrow = constants_1.BIGINT_ZERO;
      snapshot.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyNativeLiquidate = constants_1.BIGINT_ZERO;
      snapshot.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyNativeWithdraw = constants_1.BIGINT_ZERO;
      snapshot.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyNativeRepay = constants_1.BIGINT_ZERO;
      snapshot.dailyTransferUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyNativeTransfer = constants_1.BIGINT_ZERO;
      snapshot.dailyFlashloanUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyNativeFlashloan = constants_1.BIGINT_ZERO;
      snapshot.dailyActiveUsers = constants_1.INT_ZERO;
      snapshot.dailyActiveDepositors = constants_1.INT_ZERO;
      snapshot.dailyActiveBorrowers = constants_1.INT_ZERO;
      snapshot.dailyActiveLiquidators = constants_1.INT_ZERO;
      snapshot.dailyActiveLiquidatees = constants_1.INT_ZERO;
      snapshot.dailyActiveTransferrers = constants_1.INT_ZERO;
      snapshot.dailyActiveFlashloaners = constants_1.INT_ZERO;
      snapshot.dailyDepositCount = constants_1.INT_ZERO;
      snapshot.dailyWithdrawCount = constants_1.INT_ZERO;
      snapshot.dailyBorrowCount = constants_1.INT_ZERO;
      snapshot.dailyRepayCount = constants_1.INT_ZERO;
      snapshot.dailyLiquidateCount = constants_1.INT_ZERO;
      snapshot.dailyTransferCount = constants_1.INT_ZERO;
      snapshot.dailyFlashloanCount = constants_1.INT_ZERO;
      snapshot.dailyActiveLendingPositionCount = constants_1.INT_ZERO;
      snapshot.dailyActiveBorrowingPositionCount = constants_1.INT_ZERO;
    }
    snapshot.blockNumber = this.event.block.number;
    snapshot.timestamp = this.event.block.timestamp;
    snapshot.inputTokenBalance = this.market.inputTokenBalance;
    snapshot.inputTokenPriceUSD = this.market.inputTokenPriceUSD;
    snapshot.outputTokenSupply = this.market.outputTokenSupply;
    snapshot.outputTokenPriceUSD = this.market.outputTokenPriceUSD;
    snapshot.exchangeRate = this.market.exchangeRate;
    snapshot.rates = this.market.rates
      ? this.getSnapshotRates(this.market.rates, days.toString())
      : null;
    snapshot.reserves = this.market.reserves;
    snapshot.variableBorrowedTokenBalance =
      this.market.variableBorrowedTokenBalance;
    snapshot.stableBorrowedTokenBalance =
      this.market.stableBorrowedTokenBalance;
    snapshot.supplyCap = this.market.supplyCap;
    snapshot.borrowCap = this.market.borrowCap;
    snapshot.totalValueLockedUSD = this.market.totalValueLockedUSD;
    snapshot.cumulativeSupplySideRevenueUSD =
      this.market.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
      this.market.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD = this.market.cumulativeTotalRevenueUSD;
    snapshot.revenueDetail = this.market.revenueDetail
      ? this.getSnapshotRevenueDetail(this.market.revenueDetail, days)
      : null;
    snapshot.totalDepositBalanceUSD = this.market.totalDepositBalanceUSD;
    snapshot.cumulativeDepositUSD = this.market.cumulativeDepositUSD;
    snapshot.totalBorrowBalanceUSD = this.market.totalBorrowBalanceUSD;
    snapshot.cumulativeBorrowUSD = this.market.cumulativeBorrowUSD;
    snapshot.cumulativeLiquidateUSD = this.market.cumulativeLiquidateUSD;
    snapshot.cumulativeTransferUSD = this.market.cumulativeTransferUSD;
    snapshot.cumulativeFlashloanUSD = this.market.cumulativeFlashloanUSD;
    snapshot.positionCount = this.market.positionCount;
    snapshot.openPositionCount = this.market.openPositionCount;
    snapshot.closedPositionCount = this.market.closedPositionCount;
    snapshot.lendingPositionCount = this.market.lendingPositionCount;
    snapshot.borrowingPositionCount = this.market.borrowingPositionCount;
    snapshot.rewardTokenEmissionsAmount =
      this.market.rewardTokenEmissionsAmount;
    snapshot.rewardTokenEmissionsUSD = this.market.rewardTokenEmissionsUSD;
    snapshot.stakedOutputTokenAmount = this.market.stakedOutputTokenAmount;
    snapshot.save();
    this.marketDailySnapshot = snapshot;
  }
  createOrUpdateFinancials() {
    const days =
      this.event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const id = graph_ts_1.Bytes.fromI32(days);
    let snapshot = schema_1.FinancialsDailySnapshot.load(id);
    if (!snapshot) {
      snapshot = new schema_1.FinancialsDailySnapshot(id);
      snapshot.days = days;
      snapshot.protocol = this.protocol.id;
      snapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyTransferUSD = constants_1.BIGDECIMAL_ZERO;
      snapshot.dailyFlashloanUSD = constants_1.BIGDECIMAL_ZERO;
    }
    snapshot.blockNumber = this.event.block.number;
    snapshot.timestamp = this.event.block.timestamp;
    snapshot.totalValueLockedUSD = this.protocol.totalValueLockedUSD;
    snapshot.protocolControlledValueUSD =
      this.protocol.protocolControlledValueUSD;
    snapshot.mintedTokenSupplies = this.protocol.mintedTokenSupplies;
    snapshot.cumulativeSupplySideRevenueUSD =
      this.protocol.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
      this.protocol.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeTotalRevenueUSD =
      this.protocol.cumulativeTotalRevenueUSD;
    snapshot.revenueDetail = this.protocol.revenueDetail
      ? this.getSnapshotRevenueDetail(this.protocol.revenueDetail, days)
      : null;
    snapshot.totalDepositBalanceUSD = this.protocol.totalDepositBalanceUSD;
    snapshot.cumulativeDepositUSD = this.protocol.cumulativeDepositUSD;
    snapshot.totalBorrowBalanceUSD = this.protocol.totalBorrowBalanceUSD;
    snapshot.cumulativeBorrowUSD = this.protocol.cumulativeBorrowUSD;
    snapshot.cumulativeLiquidateUSD = this.protocol.cumulativeLiquidateUSD;
    snapshot.save();
    this.financialSnapshot = snapshot;
  }
  createOrUpdateUsageDailySnapshot() {
    const days =
      this.event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const id = graph_ts_1.Bytes.fromI32(days);
    let snapshot = schema_1.UsageMetricsDailySnapshot.load(id);
    if (!snapshot) {
      snapshot = new schema_1.UsageMetricsDailySnapshot(id);
      snapshot.days = days;
      snapshot.protocol = this.protocol.id;
      snapshot.dailyActiveUsers = constants_1.INT_ZERO;
      snapshot.dailyActiveDepositors = constants_1.INT_ZERO;
      snapshot.dailyActiveBorrowers = constants_1.INT_ZERO;
      snapshot.dailyActiveLiquidators = constants_1.INT_ZERO;
      snapshot.dailyActiveLiquidatees = constants_1.INT_ZERO;
      snapshot.dailyTransactionCount = constants_1.INT_ZERO;
      snapshot.dailyDepositCount = constants_1.INT_ZERO;
      snapshot.dailyWithdrawCount = constants_1.INT_ZERO;
      snapshot.dailyBorrowCount = constants_1.INT_ZERO;
      snapshot.dailyRepayCount = constants_1.INT_ZERO;
      snapshot.dailyLiquidateCount = constants_1.INT_ZERO;
      snapshot.dailyTransferCount = constants_1.INT_ZERO;
      snapshot.dailyFlashloanCount = constants_1.INT_ZERO;
      snapshot.dailyActivePositions = constants_1.INT_ZERO;
    }
    snapshot.cumulativeUniqueUsers = this.protocol.cumulativeUniqueUsers;
    snapshot.cumulativeUniqueDepositors =
      this.protocol.cumulativeUniqueDepositors;
    snapshot.cumulativeUniqueBorrowers =
      this.protocol.cumulativeUniqueBorrowers;
    snapshot.cumulativeUniqueLiquidators =
      this.protocol.cumulativeUniqueLiquidators;
    snapshot.cumulativeUniqueLiquidatees =
      this.protocol.cumulativeUniqueLiquidatees;
    snapshot.cumulativePositionCount = this.protocol.cumulativePositionCount;
    snapshot.openPositionCount = this.protocol.openPositionCount;
    snapshot.totalPoolCount = this.protocol.totalPoolCount;
    snapshot.blockNumber = this.event.block.number;
    snapshot.timestamp = this.event.block.timestamp;
    snapshot.save();
    this.usageDailySnapshot = snapshot;
  }
  createOrUpdateUsageHourlySnapshot() {
    const hours =
      this.event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const id = graph_ts_1.Bytes.fromI32(hours);
    let snapshot = schema_1.UsageMetricsHourlySnapshot.load(id);
    if (!snapshot) {
      snapshot = new schema_1.UsageMetricsHourlySnapshot(id);
      snapshot.hours = hours;
      snapshot.protocol = this.protocol.id;
      snapshot.hourlyActiveUsers = constants_1.INT_ZERO;
      snapshot.hourlyTransactionCount = constants_1.INT_ZERO;
      snapshot.hourlyDepositCount = constants_1.INT_ZERO;
      snapshot.hourlyWithdrawCount = constants_1.INT_ZERO;
      snapshot.hourlyBorrowCount = constants_1.INT_ZERO;
      snapshot.hourlyRepayCount = constants_1.INT_ZERO;
      snapshot.hourlyLiquidateCount = constants_1.INT_ZERO;
    }
    snapshot.cumulativeUniqueUsers = this.protocol.cumulativeUniqueUsers;
    snapshot.blockNumber = this.event.block.number;
    snapshot.timestamp = this.event.block.timestamp;
    snapshot.save();
    this.usageHourlySnapshot = snapshot;
  }
  ////////////////////
  ///// Updaters /////
  ////////////////////
  updateUsageData(transactionType, account) {
    this.usageDailySnapshot.dailyActiveUsers += (0,
    constants_1.activityCounter)(
      account,
      transactionType,
      false,
      this.marketDailySnapshot.days
    );
    this.marketDailySnapshot.dailyActiveUsers += (0,
    constants_1.activityCounter)(
      account,
      transactionType,
      false,
      this.marketDailySnapshot.days,
      this.market.id
    );
    this.usageHourlySnapshot.hourlyActiveUsers += (0,
    constants_1.activityCounter)(
      account,
      transactionType,
      false,
      this.marketHourlySnapshot.hours
    );
    if (transactionType == constants_1.TransactionType.DEPOSIT) {
      this.usageDailySnapshot.dailyActiveDepositors += (0,
      constants_1.activityCounter)(
        account,
        transactionType,
        true,
        this.marketDailySnapshot.days
      );
      this.marketDailySnapshot.dailyActiveDepositors += (0,
      constants_1.activityCounter)(
        account,
        transactionType,
        true,
        this.marketDailySnapshot.days,
        this.market.id
      );
    }
    if (transactionType == constants_1.TransactionType.BORROW) {
      this.usageDailySnapshot.dailyActiveBorrowers += (0,
      constants_1.activityCounter)(
        account,
        transactionType,
        true,
        this.marketDailySnapshot.days
      );
      this.marketDailySnapshot.dailyActiveBorrowers += (0,
      constants_1.activityCounter)(
        account,
        transactionType,
        true,
        this.marketDailySnapshot.days
      );
    }
    if (transactionType == constants_1.TransactionType.LIQUIDATOR) {
      this.usageDailySnapshot.dailyActiveLiquidators += (0,
      constants_1.activityCounter)(
        account,
        transactionType,
        true,
        this.marketDailySnapshot.days
      );
      this.marketDailySnapshot.dailyActiveLiquidators += (0,
      constants_1.activityCounter)(
        account,
        transactionType,
        true,
        this.marketDailySnapshot.days,
        this.market.id
      );
    }
    if (transactionType == constants_1.TransactionType.LIQUIDATEE) {
      this.usageDailySnapshot.dailyActiveLiquidatees += (0,
      constants_1.activityCounter)(
        account,
        transactionType,
        true,
        this.marketDailySnapshot.days
      );
      this.marketDailySnapshot.dailyActiveLiquidatees += (0,
      constants_1.activityCounter)(
        account,
        transactionType,
        true,
        this.marketDailySnapshot.days,
        this.market.id
      );
    }
    if (transactionType == constants_1.TransactionType.TRANSFER)
      this.marketDailySnapshot.dailyActiveTransferrers += (0,
      constants_1.activityCounter)(
        account,
        transactionType,
        true,
        this.marketDailySnapshot.days,
        this.market.id
      );
    if (transactionType == constants_1.TransactionType.FLASHLOAN)
      this.marketDailySnapshot.dailyActiveFlashloaners += (0,
      constants_1.activityCounter)(
        account,
        transactionType,
        true,
        this.marketDailySnapshot.days,
        this.market.id
      );
    this.marketDailySnapshot.save();
    this.usageDailySnapshot.save();
    this.usageHourlySnapshot.save();
  }
  updateTransactionData(transactionType, amount, amountUSD) {
    if (transactionType == constants_1.TransactionType.DEPOSIT) {
      this.marketDailySnapshot.dailyDepositUSD =
        this.marketDailySnapshot.dailyDepositUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyNativeDeposit =
        this.marketDailySnapshot.dailyNativeDeposit.plus(amount);
      this.marketHourlySnapshot.hourlyDepositUSD =
        this.marketHourlySnapshot.hourlyDepositUSD.plus(amountUSD);
      this.financialSnapshot.dailyDepositUSD =
        this.financialSnapshot.dailyDepositUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyDepositCount += constants_1.INT_ONE;
      this.usageDailySnapshot.dailyDepositCount += constants_1.INT_ONE;
      this.usageHourlySnapshot.hourlyDepositCount += constants_1.INT_ONE;
    } else if (transactionType == constants_1.TransactionType.WITHDRAW) {
      this.marketDailySnapshot.dailyWithdrawUSD =
        this.marketDailySnapshot.dailyWithdrawUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyNativeWithdraw =
        this.marketDailySnapshot.dailyNativeWithdraw.plus(amount);
      this.marketHourlySnapshot.hourlyWithdrawUSD =
        this.marketHourlySnapshot.hourlyWithdrawUSD.plus(amountUSD);
      this.financialSnapshot.dailyWithdrawUSD =
        this.financialSnapshot.dailyWithdrawUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyWithdrawCount += constants_1.INT_ONE;
      this.usageDailySnapshot.dailyWithdrawCount += constants_1.INT_ONE;
      this.usageHourlySnapshot.hourlyWithdrawCount += constants_1.INT_ONE;
    } else if (transactionType == constants_1.TransactionType.BORROW) {
      this.marketDailySnapshot.dailyBorrowUSD =
        this.marketDailySnapshot.dailyBorrowUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyNativeBorrow =
        this.marketDailySnapshot.dailyNativeBorrow.plus(amount);
      this.marketHourlySnapshot.hourlyBorrowUSD =
        this.marketHourlySnapshot.hourlyBorrowUSD.plus(amountUSD);
      this.financialSnapshot.dailyBorrowUSD =
        this.financialSnapshot.dailyBorrowUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyBorrowCount += constants_1.INT_ONE;
      this.usageDailySnapshot.dailyBorrowCount += constants_1.INT_ONE;
      this.usageHourlySnapshot.hourlyBorrowCount += constants_1.INT_ONE;
    } else if (transactionType == constants_1.TransactionType.REPAY) {
      this.marketDailySnapshot.dailyRepayUSD =
        this.marketDailySnapshot.dailyRepayUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyNativeRepay =
        this.marketDailySnapshot.dailyNativeRepay.plus(amount);
      this.marketHourlySnapshot.hourlyRepayUSD =
        this.marketHourlySnapshot.hourlyRepayUSD.plus(amountUSD);
      this.financialSnapshot.dailyRepayUSD =
        this.financialSnapshot.dailyRepayUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyRepayCount += constants_1.INT_ONE;
      this.usageDailySnapshot.dailyRepayCount += constants_1.INT_ONE;
      this.usageHourlySnapshot.hourlyRepayCount += constants_1.INT_ONE;
    } else if (transactionType == constants_1.TransactionType.LIQUIDATE) {
      this.marketDailySnapshot.dailyLiquidateUSD =
        this.marketDailySnapshot.dailyLiquidateUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyNativeLiquidate =
        this.marketDailySnapshot.dailyNativeLiquidate.plus(amount);
      this.marketHourlySnapshot.hourlyLiquidateUSD =
        this.marketHourlySnapshot.hourlyLiquidateUSD.plus(amountUSD);
      this.financialSnapshot.dailyLiquidateUSD =
        this.financialSnapshot.dailyLiquidateUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyLiquidateCount += constants_1.INT_ONE;
      this.usageDailySnapshot.dailyLiquidateCount += constants_1.INT_ONE;
      this.usageHourlySnapshot.hourlyLiquidateCount += constants_1.INT_ONE;
    } else if (transactionType == constants_1.TransactionType.TRANSFER) {
      this.marketDailySnapshot.dailyTransferUSD =
        this.marketDailySnapshot.dailyTransferUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyNativeTransfer =
        this.marketDailySnapshot.dailyNativeTransfer.plus(amount);
      this.marketHourlySnapshot.hourlyTransferUSD =
        this.marketHourlySnapshot.hourlyTransferUSD.plus(amountUSD);
      this.financialSnapshot.dailyTransferUSD =
        this.financialSnapshot.dailyTransferUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyTransferCount += constants_1.INT_ONE;
      this.usageDailySnapshot.dailyTransferCount += constants_1.INT_ONE;
    } else if (transactionType == constants_1.TransactionType.FLASHLOAN) {
      this.marketDailySnapshot.dailyFlashloanUSD =
        this.marketDailySnapshot.dailyFlashloanUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyNativeFlashloan =
        this.marketDailySnapshot.dailyNativeFlashloan.plus(amount);
      this.marketHourlySnapshot.hourlyFlashloanUSD =
        this.marketHourlySnapshot.hourlyFlashloanUSD.plus(amountUSD);
      this.financialSnapshot.dailyFlashloanUSD =
        this.financialSnapshot.dailyFlashloanUSD.plus(amountUSD);
      this.marketDailySnapshot.dailyFlashloanCount += constants_1.INT_ONE;
      this.usageDailySnapshot.dailyFlashloanCount += constants_1.INT_ONE;
    } else {
      graph_ts_1.log.error(
        "[updateTransactionData] Invalid transaction type: {}",
        [transactionType]
      );
      return;
    }
    this.usageDailySnapshot.dailyTransactionCount += constants_1.INT_ONE;
    this.usageHourlySnapshot.hourlyTransactionCount += constants_1.INT_ONE;
    this.usageDailySnapshot.save();
    this.usageHourlySnapshot.save();
    this.marketDailySnapshot.save();
    this.marketHourlySnapshot.save();
    this.financialSnapshot.save();
  }
  updateRevenue(protocolRevenueDelta, supplyRevenueDelta) {
    const totalRevenueDelta = protocolRevenueDelta.plus(supplyRevenueDelta);
    // update market hourly snapshot
    this.marketHourlySnapshot.hourlyTotalRevenueUSD =
      this.marketHourlySnapshot.hourlyTotalRevenueUSD.plus(totalRevenueDelta);
    this.marketHourlySnapshot.hourlyProtocolSideRevenueUSD =
      this.marketHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(
        protocolRevenueDelta
      );
    this.marketHourlySnapshot.hourlySupplySideRevenueUSD =
      this.marketHourlySnapshot.hourlySupplySideRevenueUSD.plus(
        supplyRevenueDelta
      );
    this.marketHourlySnapshot.save();
    // update market daily snapshot
    this.marketDailySnapshot.dailyTotalRevenueUSD =
      this.marketDailySnapshot.dailyTotalRevenueUSD.plus(totalRevenueDelta);
    this.marketDailySnapshot.dailyProtocolSideRevenueUSD =
      this.marketDailySnapshot.dailyProtocolSideRevenueUSD.plus(
        protocolRevenueDelta
      );
    this.marketDailySnapshot.dailySupplySideRevenueUSD =
      this.marketDailySnapshot.dailySupplySideRevenueUSD.plus(
        supplyRevenueDelta
      );
    this.marketDailySnapshot.save();
    // update financials snapshot
    this.financialSnapshot.dailyTotalRevenueUSD =
      this.financialSnapshot.dailyTotalRevenueUSD.plus(totalRevenueDelta);
    this.financialSnapshot.dailyProtocolSideRevenueUSD =
      this.financialSnapshot.dailyProtocolSideRevenueUSD.plus(
        protocolRevenueDelta
      );
    this.financialSnapshot.dailySupplySideRevenueUSD =
      this.financialSnapshot.dailySupplySideRevenueUSD.plus(supplyRevenueDelta);
    this.financialSnapshot.save();
  }
  addDailyActivePosition(side) {
    if (side == constants_1.PositionSide.BORROWER) {
      this.marketDailySnapshot.dailyActiveBorrowingPositionCount +=
        constants_1.INT_ONE;
    }
    if (side == constants_1.PositionSide.COLLATERAL) {
      this.marketDailySnapshot.dailyActiveLendingPositionCount +=
        constants_1.INT_ONE;
    }
    this.marketDailySnapshot.save();
  }
  ///////////////////
  ///// Helpers /////
  ///////////////////
  getSnapshotRates(rates, timeSuffix) {
    const snapshotRates = [];
    for (let i = 0; i < rates.length; i++) {
      const rate = schema_1.InterestRate.load(rates[i]);
      if (!rate) {
        graph_ts_1.log.warning(
          "[getSnapshotRates] rate {} not found, should not happen",
          [rates[i]]
        );
        continue;
      }
      // create new snapshot rate
      const snapshotRateId = rates[i].concat("-").concat(timeSuffix);
      const snapshotRate = new schema_1.InterestRate(snapshotRateId);
      snapshotRate.rate = rate.rate;
      if (rate.maturityBlock) snapshotRate.maturityBlock = rate.maturityBlock;
      snapshotRate.side = rate.side;
      snapshotRate.type = rate.type;
      if (rate.tranche) snapshotRate.tranche = rate.tranche;
      snapshotRate.save();
      snapshotRates.push(snapshotRateId);
    }
    return snapshotRates;
  }
  getSnapshotRevenueDetail(currID, timeSuffix) {
    const currDetails = schema_1.RevenueDetail.load(currID);
    if (!currDetails) {
      graph_ts_1.log.error(
        "[getRevenueDetailSnapshot] Cannot find revenue details id: {}",
        [currID.toHexString()]
      );
      return null;
    }
    const newDetails = new schema_1.RevenueDetail(
      currDetails.id.concat(graph_ts_1.Bytes.fromI32(timeSuffix))
    );
    newDetails.sources = currDetails.sources;
    newDetails.amountsUSD = currDetails.amountsUSD;
    newDetails.save();
    return newDetails.id;
  }
}
exports.SnapshotManager = SnapshotManager;
