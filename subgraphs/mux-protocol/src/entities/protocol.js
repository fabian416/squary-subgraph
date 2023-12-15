"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProtocolSnapshotHourID = exports.updateProtocolSnapshotDayID = exports.increaseProtocolStakeSideRevenue = exports.increaseProtocolSupplySideRevenue = exports.increaseProtocolSideRevenue = exports.increaseProtocolTotalRevenue = exports.incrementProtocolTotalPoolCount = exports.decrementProtocolOpenPositionCount = exports.incrementProtocolOpenPositionCount = exports.incrementProtocolUniqueLiquidatees = exports.incrementProtocolUniqueLiquidators = exports.incrementProtocolUniqueBorrowers = exports.incrementProtocolUniqueDepositors = exports.incrementProtocolUniqueUsers = exports.incrementProtocolEventCount = exports.updateProtocolOpenInterestUSD = exports.updateProtocolTVL = exports.increaseProtocolPremium = exports.increaseProtocolVolume = exports.increaseSupplySideRevenue = exports.getOrCreateProtocol = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const versions_1 = require("../versions");
const configure_1 = require("../../configurations/configure");
const event_1 = require("./event");
const constants_1 = require("../utils/constants");
function getOrCreateProtocol() {
    const poolAddress = configure_1.NetworkConfigs.getPoolAddress();
    let protocol = schema_1.DerivPerpProtocol.load(poolAddress);
    if (!protocol) {
        protocol = new schema_1.DerivPerpProtocol(poolAddress);
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = configure_1.NetworkConfigs.getNetwork();
        protocol.type = constants_1.ProtocolType.PERPETUAL;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeStakeSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.cumulativeUniqueDepositors = constants_1.INT_ZERO;
        protocol.cumulativeUniqueBorrowers = constants_1.INT_ZERO;
        protocol.cumulativeUniqueLiquidators = constants_1.INT_ZERO;
        protocol.cumulativeUniqueLiquidatees = constants_1.INT_ZERO;
        protocol.longOpenInterestUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.shortOpenInterestUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalOpenInterestUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.longPositionCount = constants_1.INT_ZERO;
        protocol.shortPositionCount = constants_1.INT_ZERO;
        protocol.openPositionCount = constants_1.INT_ZERO;
        protocol.closedPositionCount = constants_1.INT_ZERO;
        protocol.cumulativePositionCount = constants_1.INT_ZERO;
        protocol.transactionCount = constants_1.INT_ZERO;
        protocol.depositCount = constants_1.INT_ZERO;
        protocol.withdrawCount = constants_1.INT_ZERO;
        protocol.collateralInCount = constants_1.INT_ZERO;
        protocol.collateralOutCount = constants_1.INT_ZERO;
        protocol.borrowCount = constants_1.INT_ZERO;
        protocol.swapCount = constants_1.INT_ZERO;
        protocol.totalPoolCount = constants_1.INT_ZERO;
        protocol.cumulativeInflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeClosedInflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeOutflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol._lastSnapshotDayID = constants_1.BIGINT_ZERO;
        protocol._lastSnapshotHourID = constants_1.BIGINT_ZERO;
        protocol._lastUpdateTimestamp = constants_1.BIGINT_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
function increaseSupplySideRevenue(event, revenueAmountUSD) {
    const protocol = getOrCreateProtocol();
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(revenueAmountUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(revenueAmountUSD);
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.increaseSupplySideRevenue = increaseSupplySideRevenue;
function increaseProtocolVolume(event, sizeUSDDelta, collateralUSDDelta, eventType) {
    const protocol = getOrCreateProtocol();
    switch (eventType) {
        case event_1.EventType.CollateralIn:
            protocol.cumulativeInflowVolumeUSD =
                protocol.cumulativeInflowVolumeUSD.plus(collateralUSDDelta);
            protocol.cumulativeVolumeUSD =
                protocol.cumulativeVolumeUSD.plus(sizeUSDDelta);
            break;
        case event_1.EventType.CollateralOut:
            protocol.cumulativeOutflowVolumeUSD =
                protocol.cumulativeOutflowVolumeUSD.plus(collateralUSDDelta);
            protocol.cumulativeVolumeUSD =
                protocol.cumulativeVolumeUSD.plus(sizeUSDDelta);
            break;
        case event_1.EventType.ClosePosition:
        case event_1.EventType.Liquidated:
            protocol.cumulativeClosedInflowVolumeUSD =
                protocol.cumulativeClosedInflowVolumeUSD.plus(collateralUSDDelta);
            break;
        default:
            break;
    }
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.increaseProtocolVolume = increaseProtocolVolume;
function increaseProtocolPremium(event, amountUSD, eventType) {
    const protocol = getOrCreateProtocol();
    switch (eventType) {
        case event_1.EventType.Deposit:
            protocol.cumulativeDepositPremiumUSD =
                protocol.cumulativeDepositPremiumUSD.plus(amountUSD);
            protocol.cumulativeTotalLiquidityPremiumUSD =
                protocol.cumulativeTotalLiquidityPremiumUSD.plus(amountUSD);
            break;
        case event_1.EventType.Withdraw:
            protocol.cumulativeWithdrawPremiumUSD =
                protocol.cumulativeWithdrawPremiumUSD.plus(amountUSD);
            protocol.cumulativeTotalLiquidityPremiumUSD =
                protocol.cumulativeTotalLiquidityPremiumUSD.plus(amountUSD);
            break;
        case event_1.EventType.CollateralIn:
            protocol.cumulativeEntryPremiumUSD =
                protocol.cumulativeEntryPremiumUSD.plus(amountUSD);
            protocol.cumulativeTotalPremiumUSD =
                protocol.cumulativeTotalPremiumUSD.plus(amountUSD);
            break;
        case event_1.EventType.CollateralOut:
            protocol.cumulativeExitPremiumUSD =
                protocol.cumulativeExitPremiumUSD.plus(amountUSD);
            protocol.cumulativeTotalPremiumUSD =
                protocol.cumulativeTotalPremiumUSD.plus(amountUSD);
            break;
        default:
            break;
    }
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.increaseProtocolPremium = increaseProtocolPremium;
function updateProtocolTVL(event, tvlChangeUSD) {
    const protocol = getOrCreateProtocol();
    protocol.totalValueLockedUSD =
        protocol.totalValueLockedUSD.plus(tvlChangeUSD);
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.updateProtocolTVL = updateProtocolTVL;
function updateProtocolOpenInterestUSD(event, openInterestChangeUSD, isLong) {
    const protocol = getOrCreateProtocol();
    if (isLong) {
        protocol.longOpenInterestUSD =
            protocol.longOpenInterestUSD.plus(openInterestChangeUSD) >=
                constants_1.BIGDECIMAL_ZERO
                ? protocol.longOpenInterestUSD.plus(openInterestChangeUSD)
                : constants_1.BIGDECIMAL_ZERO;
    }
    else {
        protocol.shortOpenInterestUSD =
            protocol.shortOpenInterestUSD.plus(openInterestChangeUSD) >=
                constants_1.BIGDECIMAL_ZERO
                ? protocol.shortOpenInterestUSD.plus(openInterestChangeUSD)
                : constants_1.BIGDECIMAL_ZERO;
    }
    protocol.totalOpenInterestUSD = protocol.longOpenInterestUSD.plus(protocol.shortOpenInterestUSD);
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.updateProtocolOpenInterestUSD = updateProtocolOpenInterestUSD;
function incrementProtocolEventCount(event, eventType, sizeDelta) {
    const protocol = getOrCreateProtocol();
    switch (eventType) {
        case event_1.EventType.Deposit:
            protocol.depositCount += constants_1.INT_ONE;
            break;
        case event_1.EventType.Withdraw:
            protocol.withdrawCount += constants_1.INT_ONE;
            break;
        case event_1.EventType.CollateralIn:
            protocol.collateralInCount += constants_1.INT_ONE;
            if (sizeDelta > constants_1.BIGINT_ZERO) {
                protocol.borrowCount += constants_1.INT_ONE;
            }
            break;
        case event_1.EventType.CollateralOut:
            protocol.collateralOutCount += constants_1.INT_ONE;
            break;
        case event_1.EventType.Swap:
            protocol.swapCount += constants_1.INT_ONE;
            break;
        default:
            break;
    }
    protocol.transactionCount += constants_1.INT_ONE;
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.incrementProtocolEventCount = incrementProtocolEventCount;
function incrementProtocolUniqueUsers(event) {
    const protocol = getOrCreateProtocol();
    protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.incrementProtocolUniqueUsers = incrementProtocolUniqueUsers;
function incrementProtocolUniqueDepositors(event) {
    const protocol = getOrCreateProtocol();
    protocol.cumulativeUniqueDepositors += constants_1.INT_ONE;
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.incrementProtocolUniqueDepositors = incrementProtocolUniqueDepositors;
function incrementProtocolUniqueBorrowers(event) {
    const protocol = getOrCreateProtocol();
    protocol.cumulativeUniqueBorrowers += constants_1.INT_ONE;
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.incrementProtocolUniqueBorrowers = incrementProtocolUniqueBorrowers;
function incrementProtocolUniqueLiquidators(event) {
    const protocol = getOrCreateProtocol();
    protocol.cumulativeUniqueLiquidators += constants_1.INT_ONE;
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.incrementProtocolUniqueLiquidators = incrementProtocolUniqueLiquidators;
function incrementProtocolUniqueLiquidatees(event) {
    const protocol = getOrCreateProtocol();
    protocol.cumulativeUniqueLiquidatees += constants_1.INT_ONE;
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.incrementProtocolUniqueLiquidatees = incrementProtocolUniqueLiquidatees;
function incrementProtocolOpenPositionCount(event, positionSide) {
    const protocol = getOrCreateProtocol();
    if (constants_1.PositionSide.LONG == positionSide) {
        protocol.longPositionCount += constants_1.INT_ONE;
    }
    else {
        protocol.shortPositionCount += constants_1.INT_ONE;
    }
    protocol.openPositionCount += constants_1.INT_ONE;
    protocol.cumulativePositionCount += constants_1.INT_ONE;
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.incrementProtocolOpenPositionCount = incrementProtocolOpenPositionCount;
function decrementProtocolOpenPositionCount(event, positionSide) {
    const protocol = getOrCreateProtocol();
    if (constants_1.PositionSide.LONG == positionSide) {
        protocol.longPositionCount =
            protocol.longPositionCount - constants_1.INT_ONE >= 0
                ? protocol.longPositionCount - constants_1.INT_ONE
                : constants_1.INT_ZERO;
    }
    else {
        protocol.shortPositionCount =
            protocol.shortPositionCount - constants_1.INT_ONE >= 0
                ? protocol.shortPositionCount - constants_1.INT_ONE
                : constants_1.INT_ZERO;
    }
    protocol.openPositionCount =
        protocol.openPositionCount - constants_1.INT_ONE >= 0
            ? protocol.openPositionCount - constants_1.INT_ONE
            : constants_1.INT_ZERO;
    protocol.closedPositionCount += constants_1.INT_ONE;
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.decrementProtocolOpenPositionCount = decrementProtocolOpenPositionCount;
function incrementProtocolTotalPoolCount(event) {
    const protocol = getOrCreateProtocol();
    protocol.totalPoolCount += constants_1.INT_ONE;
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.incrementProtocolTotalPoolCount = incrementProtocolTotalPoolCount;
function increaseProtocolTotalRevenue(event, amountChangeUSD) {
    const protocol = getOrCreateProtocol();
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(amountChangeUSD);
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.increaseProtocolTotalRevenue = increaseProtocolTotalRevenue;
function increaseProtocolSideRevenue(event, amountChangeUSD) {
    const protocol = getOrCreateProtocol();
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(amountChangeUSD);
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.increaseProtocolSideRevenue = increaseProtocolSideRevenue;
function increaseProtocolSupplySideRevenue(event, amountChangeUSD) {
    const protocol = getOrCreateProtocol();
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(amountChangeUSD);
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.increaseProtocolSupplySideRevenue = increaseProtocolSupplySideRevenue;
function increaseProtocolStakeSideRevenue(event, amountChangeUSD) {
    const protocol = getOrCreateProtocol();
    protocol.cumulativeStakeSideRevenueUSD =
        protocol.cumulativeStakeSideRevenueUSD.plus(amountChangeUSD);
    protocol._lastUpdateTimestamp = event.block.timestamp;
    protocol.save();
}
exports.increaseProtocolStakeSideRevenue = increaseProtocolStakeSideRevenue;
function updateProtocolSnapshotDayID(snapshotDayID) {
    const protocol = getOrCreateProtocol();
    protocol._lastSnapshotDayID = graph_ts_1.BigInt.fromI32(snapshotDayID);
    protocol.save();
}
exports.updateProtocolSnapshotDayID = updateProtocolSnapshotDayID;
function updateProtocolSnapshotHourID(snapshotHourID) {
    const protocol = getOrCreateProtocol();
    protocol._lastSnapshotDayID = graph_ts_1.BigInt.fromI32(snapshotHourID);
    protocol.save();
}
exports.updateProtocolSnapshotHourID = updateProtocolSnapshotHourID;
