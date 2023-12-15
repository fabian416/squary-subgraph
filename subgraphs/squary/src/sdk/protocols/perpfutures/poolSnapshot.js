"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolSnapshot = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const arrays_1 = require("../../util/arrays");
const constants = __importStar(require("../../util/constants"));
const events_1 = require("../../util/events");
const protocolSnapshot_1 = require("./protocolSnapshot");
const schema_1 = require("../../../../generated/schema");
/**
 * This file contains the PoolSnapshot, which is used to
 * make all of the storage changes that occur in the pool daily and hourly snapshots.
 *
 * Schema Version:  1.3.3
 * SDK Version:     1.1.8
 * Author(s):
 *  - @harsh9200
 *  - @dhruv-chauhan
 *  - @melotik
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
        if (!this.isInitialized()) {
            graph_ts_1.log.error("[isInitialized] cannot create snapshots, pool: {} not initialized", [this.pool.id.toHexString()]);
            return;
        }
        const snapshotDayID = this.pool._lastUpdateTimestamp.toI32() / constants.SECONDS_PER_DAY;
        const snapshotHourID = this.pool._lastUpdateTimestamp.toI32() / constants.SECONDS_PER_HOUR;
        if (snapshotDayID != this.dayID) {
            this.takeDailySnapshot(snapshotDayID);
            this.pool._lastSnapshotDayID = graph_ts_1.BigInt.fromI32(snapshotDayID);
            this.pool.save();
        }
        if (snapshotHourID != this.hourID) {
            this.takeHourlySnapshot(snapshotHourID);
            this.pool._lastSnapshotHourID = graph_ts_1.BigInt.fromI32(snapshotHourID);
            this.pool.save();
        }
    }
    isInitialized() {
        return this.pool._lastSnapshotDayID &&
            this.pool._lastSnapshotHourID &&
            this.pool._lastUpdateTimestamp
            ? true
            : false;
    }
    takeHourlySnapshot(hour) {
        const snapshot = new schema_1.LiquidityPoolHourlySnapshot(this.pool.id.concatI32(hour));
        const previousSnapshot = schema_1.LiquidityPoolHourlySnapshot.load(this.pool.id.concatI32(this.pool._lastSnapshotHourID.toI32()));
        snapshot.hours = hour;
        snapshot.pool = this.pool.id;
        snapshot.protocol = this.pool.protocol;
        snapshot.timestamp = this.event.block.timestamp;
        snapshot.totalValueLockedUSD = this.pool.totalValueLockedUSD;
        snapshot.cumulativeSupplySideRevenueUSD =
            this.pool.cumulativeSupplySideRevenueUSD;
        snapshot.hourlySupplySideRevenueUSD = previousSnapshot
            ? snapshot.cumulativeSupplySideRevenueUSD.minus(previousSnapshot.cumulativeSupplySideRevenueUSD)
            : snapshot.cumulativeSupplySideRevenueUSD;
        snapshot.cumulativeProtocolSideRevenueUSD =
            this.pool.cumulativeProtocolSideRevenueUSD;
        snapshot.hourlyProtocolSideRevenueUSD = previousSnapshot
            ? snapshot.cumulativeProtocolSideRevenueUSD.minus(previousSnapshot.cumulativeProtocolSideRevenueUSD)
            : snapshot.cumulativeProtocolSideRevenueUSD;
        snapshot.cumulativeStakeSideRevenueUSD =
            this.pool.cumulativeStakeSideRevenueUSD;
        snapshot.hourlyStakeSideRevenueUSD = previousSnapshot
            ? snapshot.cumulativeStakeSideRevenueUSD.minus(previousSnapshot.cumulativeStakeSideRevenueUSD)
            : snapshot.cumulativeStakeSideRevenueUSD;
        snapshot.cumulativeTotalRevenueUSD = this.pool.cumulativeTotalRevenueUSD;
        snapshot.hourlyTotalRevenueUSD = previousSnapshot
            ? snapshot.cumulativeTotalRevenueUSD.minus(previousSnapshot.cumulativeTotalRevenueUSD)
            : snapshot.cumulativeTotalRevenueUSD;
        snapshot.hourlyFundingrate = this.pool.fundingrate;
        snapshot.hourlyLongOpenInterestUSD = this.pool.longOpenInterestUSD;
        snapshot.hourlyShortOpenInterestUSD = this.pool.shortOpenInterestUSD;
        snapshot.hourlyTotalOpenInterestUSD = this.pool.totalOpenInterestUSD;
        snapshot.cumulativeEntryPremiumUSD = this.pool.cumulativeEntryPremiumUSD;
        snapshot.hourlyEntryPremiumUSD = previousSnapshot
            ? snapshot.cumulativeEntryPremiumUSD.minus(previousSnapshot.cumulativeEntryPremiumUSD)
            : snapshot.cumulativeEntryPremiumUSD;
        snapshot.cumulativeExitPremiumUSD = this.pool.cumulativeExitPremiumUSD;
        snapshot.hourlyExitPremiumUSD = previousSnapshot
            ? snapshot.cumulativeExitPremiumUSD.minus(previousSnapshot.cumulativeExitPremiumUSD)
            : snapshot.cumulativeExitPremiumUSD;
        snapshot.cumulativeTotalPremiumUSD = this.pool.cumulativeTotalPremiumUSD;
        snapshot.hourlyTotalPremiumUSD = previousSnapshot
            ? snapshot.cumulativeTotalPremiumUSD.minus(previousSnapshot.cumulativeTotalPremiumUSD)
            : snapshot.cumulativeTotalPremiumUSD;
        snapshot.cumulativeDepositPremiumUSD =
            this.pool.cumulativeDepositPremiumUSD;
        snapshot.hourlyDepositPremiumUSD = previousSnapshot
            ? snapshot.cumulativeDepositPremiumUSD.minus(previousSnapshot.cumulativeDepositPremiumUSD)
            : snapshot.cumulativeDepositPremiumUSD;
        snapshot.cumulativeWithdrawPremiumUSD =
            this.pool.cumulativeWithdrawPremiumUSD;
        snapshot.hourlyWithdrawPremiumUSD = previousSnapshot
            ? snapshot.cumulativeWithdrawPremiumUSD.minus(previousSnapshot.cumulativeWithdrawPremiumUSD)
            : snapshot.cumulativeWithdrawPremiumUSD;
        snapshot.cumulativeTotalLiquidityPremiumUSD =
            this.pool.cumulativeTotalLiquidityPremiumUSD;
        snapshot.hourlyTotalLiquidityPremiumUSD = previousSnapshot
            ? snapshot.cumulativeTotalLiquidityPremiumUSD.minus(previousSnapshot.cumulativeTotalLiquidityPremiumUSD)
            : snapshot.cumulativeTotalLiquidityPremiumUSD;
        snapshot.cumulativeVolumeByTokenUSD = this.pool.cumulativeVolumeByTokenUSD;
        snapshot.hourlyVolumeByTokenUSD = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeVolumeByTokenUSD, previousSnapshot.cumulativeVolumeByTokenUSD)
            : snapshot.cumulativeVolumeByTokenUSD;
        snapshot.cumulativeVolumeByTokenAmount =
            this.pool.cumulativeVolumeByTokenAmount;
        snapshot.hourlyVolumeByTokenAmount = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeVolumeByTokenAmount, previousSnapshot.cumulativeVolumeByTokenAmount)
            : snapshot.cumulativeVolumeByTokenAmount;
        snapshot.cumulativeVolumeUSD = this.pool.cumulativeVolumeUSD;
        snapshot.hourlyVolumeUSD = previousSnapshot
            ? snapshot.cumulativeVolumeUSD.minus(previousSnapshot.cumulativeVolumeUSD)
            : snapshot.cumulativeVolumeUSD;
        snapshot.cumulativeInflowVolumeByTokenUSD =
            this.pool.cumulativeInflowVolumeByTokenUSD;
        snapshot.hourlyInflowVolumeByTokenUSD = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeInflowVolumeByTokenUSD, previousSnapshot.cumulativeInflowVolumeByTokenUSD)
            : snapshot.cumulativeInflowVolumeByTokenUSD;
        snapshot.cumulativeInflowVolumeByTokenAmount =
            this.pool.cumulativeInflowVolumeByTokenAmount;
        snapshot.hourlyInflowVolumeByTokenAmount = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeInflowVolumeByTokenAmount, previousSnapshot.cumulativeInflowVolumeByTokenAmount)
            : snapshot.cumulativeInflowVolumeByTokenAmount;
        snapshot.cumulativeInflowVolumeUSD = this.pool.cumulativeInflowVolumeUSD;
        snapshot.hourlyInflowVolumeUSD = previousSnapshot
            ? snapshot.cumulativeInflowVolumeUSD.minus(previousSnapshot.cumulativeInflowVolumeUSD)
            : snapshot.cumulativeInflowVolumeUSD;
        snapshot.cumulativeClosedInflowVolumeByTokenUSD =
            this.pool.cumulativeClosedInflowVolumeByTokenUSD;
        snapshot.hourlyClosedInflowVolumeByTokenUSD = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeClosedInflowVolumeByTokenUSD, previousSnapshot.cumulativeClosedInflowVolumeByTokenUSD)
            : snapshot.cumulativeClosedInflowVolumeByTokenUSD;
        snapshot.cumulativeClosedInflowVolumeByTokenAmount =
            this.pool.cumulativeInflowVolumeByTokenAmount;
        snapshot.hourlyClosedInflowVolumeByTokenAmount = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeClosedInflowVolumeByTokenAmount, previousSnapshot.cumulativeClosedInflowVolumeByTokenAmount)
            : snapshot.cumulativeClosedInflowVolumeByTokenAmount;
        snapshot.cumulativeClosedInflowVolumeUSD =
            this.pool.cumulativeClosedInflowVolumeUSD;
        snapshot.hourlyClosedInflowVolumeUSD = previousSnapshot
            ? snapshot.cumulativeClosedInflowVolumeUSD.minus(previousSnapshot.cumulativeClosedInflowVolumeUSD)
            : snapshot.cumulativeClosedInflowVolumeUSD;
        snapshot.cumulativeOutflowVolumeByTokenUSD =
            this.pool.cumulativeOutflowVolumeByTokenUSD;
        snapshot.hourlyOutflowVolumeByTokenUSD = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeOutflowVolumeByTokenUSD, previousSnapshot.cumulativeOutflowVolumeByTokenUSD)
            : snapshot.cumulativeOutflowVolumeByTokenUSD;
        snapshot.cumulativeOutflowVolumeByTokenAmount =
            this.pool.cumulativeOutflowVolumeByTokenAmount;
        snapshot.hourlyOutflowVolumeByTokenAmount = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeOutflowVolumeByTokenAmount, previousSnapshot.cumulativeOutflowVolumeByTokenAmount)
            : snapshot.cumulativeOutflowVolumeByTokenAmount;
        snapshot.cumulativeOutflowVolumeUSD = this.pool.cumulativeOutflowVolumeUSD;
        snapshot.hourlyOutflowVolumeUSD = previousSnapshot
            ? snapshot.cumulativeOutflowVolumeUSD.minus(previousSnapshot.cumulativeOutflowVolumeUSD)
            : snapshot.cumulativeOutflowVolumeUSD;
        snapshot.inputTokens = this.pool.inputTokens;
        snapshot.inputTokenBalances = this.pool.inputTokenBalances;
        snapshot.inputTokenWeights = this.pool.inputTokenWeights;
        snapshot.outputTokenSupply = this.pool.outputTokenSupply;
        snapshot.outputTokenPriceUSD = this.pool.outputTokenPriceUSD;
        snapshot.stakedOutputTokenAmount = this.pool.stakedOutputTokenAmount;
        snapshot.rewardTokenEmissionsAmount = this.pool.rewardTokenEmissionsAmount;
        snapshot.rewardTokenEmissionsUSD = this.pool.rewardTokenEmissionsUSD;
        snapshot.save();
    }
    takeDailySnapshot(day) {
        const snapshot = new schema_1.LiquidityPoolDailySnapshot(this.pool.id.concatI32(day));
        const previousSnapshot = schema_1.LiquidityPoolDailySnapshot.load(this.pool.id.concatI32(this.pool._lastSnapshotDayID.toI32()));
        snapshot.days = day;
        snapshot.pool = this.pool.id;
        snapshot.protocol = this.pool.protocol;
        snapshot.timestamp = this.event.block.timestamp;
        snapshot.totalValueLockedUSD = this.pool.totalValueLockedUSD;
        snapshot.cumulativeSupplySideRevenueUSD =
            this.pool.cumulativeSupplySideRevenueUSD;
        snapshot.dailySupplySideRevenueUSD = previousSnapshot
            ? snapshot.cumulativeSupplySideRevenueUSD.minus(previousSnapshot.cumulativeSupplySideRevenueUSD)
            : snapshot.cumulativeSupplySideRevenueUSD;
        snapshot.cumulativeProtocolSideRevenueUSD =
            this.pool.cumulativeProtocolSideRevenueUSD;
        snapshot.dailyProtocolSideRevenueUSD = previousSnapshot
            ? snapshot.cumulativeProtocolSideRevenueUSD.minus(previousSnapshot.cumulativeProtocolSideRevenueUSD)
            : snapshot.cumulativeProtocolSideRevenueUSD;
        snapshot.cumulativeStakeSideRevenueUSD =
            this.pool.cumulativeStakeSideRevenueUSD;
        snapshot.dailyStakeSideRevenueUSD = previousSnapshot
            ? snapshot.cumulativeStakeSideRevenueUSD.minus(previousSnapshot.cumulativeStakeSideRevenueUSD)
            : snapshot.cumulativeStakeSideRevenueUSD;
        snapshot.cumulativeTotalRevenueUSD = this.pool.cumulativeTotalRevenueUSD;
        snapshot.dailyTotalRevenueUSD = previousSnapshot
            ? snapshot.cumulativeTotalRevenueUSD.minus(previousSnapshot.cumulativeTotalRevenueUSD)
            : snapshot.cumulativeTotalRevenueUSD;
        snapshot.dailyFundingrate = this.pool.fundingrate;
        snapshot.dailyLongOpenInterestUSD = this.pool.longOpenInterestUSD;
        snapshot.dailyShortOpenInterestUSD = this.pool.shortOpenInterestUSD;
        snapshot.dailyTotalOpenInterestUSD = this.pool.totalOpenInterestUSD;
        snapshot.cumulativeEntryPremiumUSD = this.pool.cumulativeEntryPremiumUSD;
        snapshot.dailyEntryPremiumUSD = previousSnapshot
            ? snapshot.cumulativeEntryPremiumUSD.minus(previousSnapshot.cumulativeEntryPremiumUSD)
            : snapshot.cumulativeEntryPremiumUSD;
        snapshot.cumulativeExitPremiumUSD = this.pool.cumulativeExitPremiumUSD;
        snapshot.dailyExitPremiumUSD = previousSnapshot
            ? snapshot.cumulativeExitPremiumUSD.minus(previousSnapshot.cumulativeExitPremiumUSD)
            : snapshot.cumulativeExitPremiumUSD;
        snapshot.cumulativeTotalPremiumUSD = this.pool.cumulativeTotalPremiumUSD;
        snapshot.dailyTotalPremiumUSD = previousSnapshot
            ? snapshot.cumulativeTotalPremiumUSD.minus(previousSnapshot.cumulativeTotalPremiumUSD)
            : snapshot.cumulativeTotalPremiumUSD;
        snapshot.cumulativeDepositPremiumUSD =
            this.pool.cumulativeDepositPremiumUSD;
        snapshot.dailyDepositPremiumUSD = previousSnapshot
            ? snapshot.cumulativeDepositPremiumUSD.minus(previousSnapshot.cumulativeDepositPremiumUSD)
            : snapshot.cumulativeDepositPremiumUSD;
        snapshot.cumulativeWithdrawPremiumUSD =
            this.pool.cumulativeWithdrawPremiumUSD;
        snapshot.dailyWithdrawPremiumUSD = previousSnapshot
            ? snapshot.cumulativeWithdrawPremiumUSD.minus(previousSnapshot.cumulativeWithdrawPremiumUSD)
            : snapshot.cumulativeWithdrawPremiumUSD;
        snapshot.cumulativeTotalLiquidityPremiumUSD =
            this.pool.cumulativeTotalLiquidityPremiumUSD;
        snapshot.dailyTotalLiquidityPremiumUSD = previousSnapshot
            ? snapshot.cumulativeTotalLiquidityPremiumUSD.minus(previousSnapshot.cumulativeTotalLiquidityPremiumUSD)
            : snapshot.cumulativeTotalLiquidityPremiumUSD;
        snapshot.cumulativeVolumeByTokenUSD = this.pool.cumulativeVolumeByTokenUSD;
        snapshot.dailyVolumeByTokenUSD = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeVolumeByTokenUSD, previousSnapshot.cumulativeVolumeByTokenUSD)
            : snapshot.cumulativeVolumeByTokenUSD;
        snapshot.cumulativeVolumeByTokenAmount =
            this.pool.cumulativeVolumeByTokenAmount;
        snapshot.dailyVolumeByTokenAmount = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeVolumeByTokenAmount, previousSnapshot.cumulativeVolumeByTokenAmount)
            : snapshot.cumulativeVolumeByTokenAmount;
        snapshot.cumulativeVolumeUSD = this.pool.cumulativeVolumeUSD;
        snapshot.dailyVolumeUSD = previousSnapshot
            ? snapshot.cumulativeVolumeUSD.minus(previousSnapshot.cumulativeVolumeUSD)
            : snapshot.cumulativeVolumeUSD;
        snapshot.cumulativeInflowVolumeByTokenUSD =
            this.pool.cumulativeInflowVolumeByTokenUSD;
        snapshot.dailyInflowVolumeByTokenUSD = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeInflowVolumeByTokenUSD, previousSnapshot.cumulativeInflowVolumeByTokenUSD)
            : snapshot.cumulativeInflowVolumeByTokenUSD;
        snapshot.cumulativeInflowVolumeByTokenAmount =
            this.pool.cumulativeInflowVolumeByTokenAmount;
        snapshot.dailyInflowVolumeByTokenAmount = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeInflowVolumeByTokenAmount, previousSnapshot.cumulativeInflowVolumeByTokenAmount)
            : snapshot.cumulativeInflowVolumeByTokenAmount;
        snapshot.cumulativeInflowVolumeUSD = this.pool.cumulativeInflowVolumeUSD;
        snapshot.dailyInflowVolumeUSD = previousSnapshot
            ? snapshot.cumulativeInflowVolumeUSD.minus(previousSnapshot.cumulativeInflowVolumeUSD)
            : snapshot.cumulativeInflowVolumeUSD;
        snapshot.cumulativeClosedInflowVolumeByTokenUSD =
            this.pool.cumulativeClosedInflowVolumeByTokenUSD;
        snapshot.dailyClosedInflowVolumeByTokenUSD = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeClosedInflowVolumeByTokenUSD, previousSnapshot.cumulativeClosedInflowVolumeByTokenUSD)
            : snapshot.cumulativeClosedInflowVolumeByTokenUSD;
        snapshot.cumulativeClosedInflowVolumeByTokenAmount =
            this.pool.cumulativeInflowVolumeByTokenAmount;
        snapshot.dailyClosedInflowVolumeByTokenAmount = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeClosedInflowVolumeByTokenAmount, previousSnapshot.cumulativeClosedInflowVolumeByTokenAmount)
            : snapshot.cumulativeClosedInflowVolumeByTokenAmount;
        snapshot.cumulativeClosedInflowVolumeUSD =
            this.pool.cumulativeClosedInflowVolumeUSD;
        snapshot.dailyClosedInflowVolumeUSD = previousSnapshot
            ? snapshot.cumulativeClosedInflowVolumeUSD.minus(previousSnapshot.cumulativeClosedInflowVolumeUSD)
            : snapshot.cumulativeClosedInflowVolumeUSD;
        snapshot.cumulativeOutflowVolumeByTokenUSD =
            this.pool.cumulativeOutflowVolumeByTokenUSD;
        snapshot.dailyOutflowVolumeByTokenUSD = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeOutflowVolumeByTokenUSD, previousSnapshot.cumulativeOutflowVolumeByTokenUSD)
            : snapshot.cumulativeOutflowVolumeByTokenUSD;
        snapshot.cumulativeOutflowVolumeByTokenAmount =
            this.pool.cumulativeOutflowVolumeByTokenAmount;
        snapshot.dailyOutflowVolumeByTokenAmount = previousSnapshot
            ? (0, arrays_1.subtractArrays)(snapshot.cumulativeOutflowVolumeByTokenAmount, previousSnapshot.cumulativeOutflowVolumeByTokenAmount)
            : snapshot.cumulativeOutflowVolumeByTokenAmount;
        snapshot.cumulativeOutflowVolumeUSD = this.pool.cumulativeOutflowVolumeUSD;
        snapshot.dailyOutflowVolumeUSD = previousSnapshot
            ? snapshot.cumulativeOutflowVolumeUSD.minus(previousSnapshot.cumulativeOutflowVolumeUSD)
            : snapshot.cumulativeOutflowVolumeUSD;
        snapshot.cumulativeUniqueUsers = this.pool.cumulativeUniqueUsers;
        const dailyActivityHelper = (0, protocolSnapshot_1.initActivityHelper)(graph_ts_1.Bytes.fromUTF8(constants.ActivityInterval.DAILY.concat("-").concat(day.toString())));
        snapshot.dailyActiveUsers = dailyActivityHelper.activeUsers;
        snapshot.dailyActiveDepositors = dailyActivityHelper.activeDepositors;
        snapshot.dailyActiveBorrowers = dailyActivityHelper.activeBorrowers;
        snapshot.dailyActiveLiquidators = dailyActivityHelper.activeLiquidators;
        snapshot.dailyActiveLiquidatees = dailyActivityHelper.activeLiquidatees;
        snapshot.cumulativeUniqueDepositors = this.pool.cumulativeUniqueDepositors;
        snapshot.cumulativeUniqueBorrowers = this.pool.cumulativeUniqueBorrowers;
        snapshot.cumulativeUniqueLiquidators =
            this.pool.cumulativeUniqueLiquidators;
        snapshot.cumulativeUniqueLiquidatees =
            this.pool.cumulativeUniqueLiquidatees;
        snapshot.longPositionCount = this.pool.longPositionCount;
        snapshot.dailyLongPositionCount = previousSnapshot
            ? max(snapshot.longPositionCount - previousSnapshot.longPositionCount, 0)
            : snapshot.longPositionCount;
        snapshot.shortPositionCount = this.pool.shortPositionCount;
        snapshot.dailyShortPositionCount = previousSnapshot
            ? max(snapshot.shortPositionCount - previousSnapshot.shortPositionCount, 0)
            : snapshot.shortPositionCount;
        snapshot.openPositionCount = this.pool.openPositionCount;
        snapshot.dailyOpenPositionCount = previousSnapshot
            ? max(snapshot.openPositionCount - previousSnapshot.openPositionCount, 0)
            : snapshot.openPositionCount;
        snapshot.closedPositionCount = this.pool.closedPositionCount;
        snapshot.dailyClosedPositionCount = previousSnapshot
            ? snapshot.closedPositionCount - previousSnapshot.closedPositionCount
            : snapshot.closedPositionCount;
        snapshot.cumulativePositionCount = this.pool.cumulativePositionCount;
        snapshot.dailyCumulativePositionCount = previousSnapshot
            ? snapshot.cumulativePositionCount -
                previousSnapshot.cumulativePositionCount
            : snapshot.cumulativePositionCount;
        snapshot.inputTokens = this.pool.inputTokens;
        snapshot.inputTokenBalances = this.pool.inputTokenBalances;
        snapshot.inputTokenWeights = this.pool.inputTokenWeights;
        snapshot.outputTokenSupply = this.pool.outputTokenSupply;
        snapshot.outputTokenPriceUSD = this.pool.outputTokenPriceUSD;
        snapshot.stakedOutputTokenAmount = this.pool.stakedOutputTokenAmount;
        snapshot.rewardTokenEmissionsAmount = this.pool.rewardTokenEmissionsAmount;
        snapshot.rewardTokenEmissionsUSD = this.pool.rewardTokenEmissionsUSD;
        snapshot.save();
    }
}
exports.PoolSnapshot = PoolSnapshot;
