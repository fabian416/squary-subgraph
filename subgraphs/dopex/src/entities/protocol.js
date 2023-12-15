"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProtocolSnapshotDayID =
  exports.increaseProtocolSupplySideRevenue =
  exports.increaseProtocolSideRevenue =
  exports.incrementProtocolTotalPoolCount =
  exports.updateProtocolOpenPositionCount =
  exports.incrementProtocolUniqueTakers =
  exports.incrementProtocolUniqueLP =
  exports.incrementProtocolUniqueUsers =
  exports.incrementProtocolEventCount =
  exports.updateProtocolOpenInterestUSD =
  exports.updateProtocolTVL =
  exports.increaseProtocolPremium =
  exports.increaseProtocolVolume =
  exports.increaseSupplySideRevenue =
  exports.getOrCreateProtocol =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const versions_1 = require("../versions");
const event_1 = require("./event");
const constants_1 = require("../utils/constants");
function getOrCreateProtocol() {
  const network = graph_ts_1.dataSource
    .network()
    .toUpperCase()
    .replace("-", "_");
  let address = graph_ts_1.Bytes.fromHexString(
    constants_1.PROTOCOL_ADDRESS_ARBITRUM
  );
  if (network == constants_1.Network.MATIC) {
    address = graph_ts_1.Bytes.fromHexString(
      constants_1.PROTOCOL_ADDRESS_POLYGON
    );
  }
  let protocol = schema_1.DerivOptProtocol.load(address);
  if (!protocol) {
    protocol = new schema_1.DerivOptProtocol(address);
    protocol.name = constants_1.PROTOCOL_NAME;
    protocol.slug = constants_1.PROTOCOL_SLUG;
    protocol.network = network;
    protocol.type = constants_1.ProtocolType.OPTION;
    protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.openInterestUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeCollateralVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeExercisedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeClosedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.callsMintedCount = constants_1.INT_ZERO;
    protocol.putsMintedCount = constants_1.INT_ZERO;
    protocol.contractsMintedCount = constants_1.INT_ZERO;
    protocol.contractsTakenCount = constants_1.INT_ZERO;
    protocol.contractsExpiredCount = constants_1.INT_ZERO;
    protocol.contractsExercisedCount = constants_1.INT_ZERO;
    protocol.contractsClosedCount = constants_1.INT_ZERO;
    protocol.openPositionCount = constants_1.INT_ZERO;
    protocol.closedPositionCount = constants_1.INT_ZERO;
    protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
    protocol.cumulativeUniqueLP = constants_1.INT_ZERO;
    protocol.cumulativeUniqueTakers = constants_1.INT_ZERO;
    protocol.totalPoolCount = constants_1.INT_ZERO;
    protocol._lastSnapshotDayID = constants_1.INT_ZERO;
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
function increaseProtocolVolume(
  event,
  sizeUSDDelta,
  collateralUSDDelta,
  eventType
) {
  const protocol = getOrCreateProtocol();
  if (eventType == event_1.EventType.Settle) {
    protocol.cumulativeExercisedVolumeUSD =
      protocol.cumulativeExercisedVolumeUSD.plus(sizeUSDDelta);
    protocol.cumulativeClosedVolumeUSD =
      protocol.cumulativeClosedVolumeUSD.plus(sizeUSDDelta);
  }
  protocol.cumulativeVolumeUSD =
    protocol.cumulativeVolumeUSD.plus(sizeUSDDelta);
  protocol.cumulativeCollateralVolumeUSD =
    protocol.cumulativeCollateralVolumeUSD.plus(collateralUSDDelta);
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
    case event_1.EventType.Purchase:
      protocol.cumulativeEntryPremiumUSD =
        protocol.cumulativeEntryPremiumUSD.plus(amountUSD);
      protocol.cumulativeTotalPremiumUSD =
        protocol.cumulativeTotalPremiumUSD.plus(amountUSD);
      break;
    case event_1.EventType.Settle:
      protocol.cumulativeExitPremiumUSD =
        protocol.cumulativeExitPremiumUSD.plus(amountUSD);
      protocol.cumulativeTotalPremiumUSD =
        protocol.cumulativeTotalPremiumUSD.plus(amountUSD);
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
function updateProtocolOpenInterestUSD(event, changeUSD, isIncrease) {
  const protocol = getOrCreateProtocol();
  if (isIncrease) {
    protocol.openInterestUSD = protocol.openInterestUSD.plus(changeUSD);
  } else {
    protocol.openInterestUSD = protocol.openInterestUSD.minus(changeUSD);
  }
  protocol._lastUpdateTimestamp = event.block.timestamp;
  protocol.save();
}
exports.updateProtocolOpenInterestUSD = updateProtocolOpenInterestUSD;
function incrementProtocolEventCount(event, eventType, _isPut) {
  const protocol = getOrCreateProtocol();
  switch (eventType) {
    case event_1.EventType.Deposit:
      if (_isPut) {
        protocol.putsMintedCount += constants_1.INT_ONE;
      } else {
        protocol.callsMintedCount += constants_1.INT_ONE;
      }
      protocol.contractsMintedCount += constants_1.INT_ONE;
      break;
    case event_1.EventType.Withdraw:
      protocol.contractsExpiredCount += constants_1.INT_ONE;
      protocol.contractsClosedCount += constants_1.INT_ONE;
      break;
    case event_1.EventType.Purchase:
      protocol.contractsTakenCount += constants_1.INT_ONE;
      break;
    case event_1.EventType.Settle:
      protocol.contractsExercisedCount += constants_1.INT_ONE;
      break;
    default:
      break;
  }
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
function incrementProtocolUniqueLP(event) {
  const protocol = getOrCreateProtocol();
  protocol.cumulativeUniqueLP += constants_1.INT_ONE;
  protocol._lastUpdateTimestamp = event.block.timestamp;
  protocol.save();
}
exports.incrementProtocolUniqueLP = incrementProtocolUniqueLP;
function incrementProtocolUniqueTakers(event) {
  const protocol = getOrCreateProtocol();
  protocol.cumulativeUniqueTakers += constants_1.INT_ONE;
  protocol._lastUpdateTimestamp = event.block.timestamp;
  protocol.save();
}
exports.incrementProtocolUniqueTakers = incrementProtocolUniqueTakers;
function updateProtocolOpenPositionCount(event, isIncrease) {
  const protocol = getOrCreateProtocol();
  if (isIncrease) {
    protocol.openPositionCount += constants_1.INT_ONE;
  } else {
    protocol.openPositionCount -= constants_1.INT_ONE;
    protocol.closedPositionCount += constants_1.INT_ONE;
  }
  protocol._lastUpdateTimestamp = event.block.timestamp;
  protocol.save();
}
exports.updateProtocolOpenPositionCount = updateProtocolOpenPositionCount;
function incrementProtocolTotalPoolCount(event) {
  const protocol = getOrCreateProtocol();
  protocol.totalPoolCount += constants_1.INT_ONE;
  protocol._lastUpdateTimestamp = event.block.timestamp;
  protocol.save();
}
exports.incrementProtocolTotalPoolCount = incrementProtocolTotalPoolCount;
function increaseProtocolSideRevenue(event, amountChangeUSD) {
  const protocol = getOrCreateProtocol();
  protocol.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD.plus(amountChangeUSD);
  // Protocol total revenue
  protocol.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD.plus(amountChangeUSD);
  protocol._lastUpdateTimestamp = event.block.timestamp;
  protocol.save();
}
exports.increaseProtocolSideRevenue = increaseProtocolSideRevenue;
function increaseProtocolSupplySideRevenue(event, amountChangeUSD) {
  const protocol = getOrCreateProtocol();
  protocol.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD.plus(amountChangeUSD);
  // Protocol total revenue
  protocol.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD.plus(amountChangeUSD);
  protocol._lastUpdateTimestamp = event.block.timestamp;
  protocol.save();
}
exports.increaseProtocolSupplySideRevenue = increaseProtocolSupplySideRevenue;
function updateProtocolSnapshotDayID(snapshotDayID) {
  const protocol = getOrCreateProtocol();
  protocol._lastSnapshotDayID = snapshotDayID;
  protocol.save();
}
exports.updateProtocolSnapshotDayID = updateProtocolSnapshotDayID;
