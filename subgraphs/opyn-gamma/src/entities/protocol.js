"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementProtocolExercisedCount = exports.incrementProtocolMintedCount = exports.decrementProtocolPositionCount = exports.incrementProtocolPositionCount = exports.incrementProtocolTotalPoolCount = exports.incrementProtocolUniqueTakers = exports.incrementProtocolUniqueLPs = exports.incrementProtocolUniqueUsers = exports.addProtocolExercisedVolume = exports.addProtocolClosedVolume = exports.addProtocolCollateralVolume = exports.addProtocolMintVolume = exports.updateProtocolOpenInterest = exports.updateProtocolUSDLocked = exports.getOrCreateOpynProtocol = void 0;
const configure_1 = require("../../configurations/configure");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const versions_1 = require("../versions");
function getOrCreateOpynProtocol() {
    let protocol = schema_1.DerivOptProtocol.load(configure_1.NetworkConfigs.getControllerAddress());
    if (!protocol) {
        protocol = new schema_1.DerivOptProtocol(configure_1.NetworkConfigs.getControllerAddress());
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = configure_1.NetworkConfigs.getNetwork();
        protocol.type = constants_1.ProtocolType.OPTION;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
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
        protocol.putsMintedCount = constants_1.INT_ZERO;
        protocol.callsMintedCount = constants_1.INT_ZERO;
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
        protocol.openInterestUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalPoolCount = constants_1.INT_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateOpynProtocol = getOrCreateOpynProtocol;
function updateProtocolUSDLocked(netChangeUSD) {
    const protocol = getOrCreateOpynProtocol();
    const totalValueLocked = protocol.totalValueLockedUSD.plus(netChangeUSD);
    protocol.totalValueLockedUSD = totalValueLocked;
    protocol.save();
}
exports.updateProtocolUSDLocked = updateProtocolUSDLocked;
function updateProtocolOpenInterest(netChangeUSD) {
    const protocol = getOrCreateOpynProtocol();
    protocol.openInterestUSD = protocol.openInterestUSD.plus(netChangeUSD);
    protocol.save();
}
exports.updateProtocolOpenInterest = updateProtocolOpenInterest;
function addProtocolMintVolume(amountUSD) {
    const protocol = getOrCreateOpynProtocol();
    protocol.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD.plus(amountUSD);
    protocol.save();
}
exports.addProtocolMintVolume = addProtocolMintVolume;
function addProtocolCollateralVolume(amountUSD) {
    const protocol = getOrCreateOpynProtocol();
    protocol.cumulativeCollateralVolumeUSD =
        protocol.cumulativeCollateralVolumeUSD.plus(amountUSD);
    protocol.save();
}
exports.addProtocolCollateralVolume = addProtocolCollateralVolume;
function addProtocolClosedVolume(amountUSD) {
    const protocol = getOrCreateOpynProtocol();
    protocol.cumulativeClosedVolumeUSD =
        protocol.cumulativeClosedVolumeUSD.plus(amountUSD);
    protocol.save();
}
exports.addProtocolClosedVolume = addProtocolClosedVolume;
function addProtocolExercisedVolume(amountUSD) {
    const protocol = getOrCreateOpynProtocol();
    protocol.cumulativeExercisedVolumeUSD =
        protocol.cumulativeExercisedVolumeUSD.plus(amountUSD);
    protocol.save();
}
exports.addProtocolExercisedVolume = addProtocolExercisedVolume;
function incrementProtocolUniqueUsers() {
    const protocol = getOrCreateOpynProtocol();
    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
}
exports.incrementProtocolUniqueUsers = incrementProtocolUniqueUsers;
function incrementProtocolUniqueLPs() {
    const protocol = getOrCreateOpynProtocol();
    protocol.cumulativeUniqueLP += 1;
    protocol.save();
}
exports.incrementProtocolUniqueLPs = incrementProtocolUniqueLPs;
function incrementProtocolUniqueTakers() {
    const protocol = getOrCreateOpynProtocol();
    protocol.cumulativeUniqueTakers += 1;
    protocol.save();
}
exports.incrementProtocolUniqueTakers = incrementProtocolUniqueTakers;
function incrementProtocolTotalPoolCount() {
    const protocol = getOrCreateOpynProtocol();
    protocol.totalPoolCount += 1;
    protocol.save();
}
exports.incrementProtocolTotalPoolCount = incrementProtocolTotalPoolCount;
function incrementProtocolPositionCount() {
    const protocol = getOrCreateOpynProtocol();
    protocol.openPositionCount += 1;
    protocol.contractsTakenCount += 1;
    protocol.save();
}
exports.incrementProtocolPositionCount = incrementProtocolPositionCount;
function decrementProtocolPositionCount() {
    const protocol = getOrCreateOpynProtocol();
    protocol.openPositionCount -= 1;
    protocol.closedPositionCount += 1;
    protocol.contractsClosedCount += 1;
    protocol.save();
}
exports.decrementProtocolPositionCount = decrementProtocolPositionCount;
function incrementProtocolMintedCount(option) {
    const protocol = getOrCreateOpynProtocol();
    if (option.type == constants_1.OptionType.CALL) {
        protocol.callsMintedCount += 1;
    }
    else {
        protocol.putsMintedCount += 1;
    }
    protocol.contractsMintedCount += 1;
    protocol.save();
}
exports.incrementProtocolMintedCount = incrementProtocolMintedCount;
function incrementProtocolExercisedCount() {
    const protocol = getOrCreateOpynProtocol();
    protocol.contractsExercisedCount += 1;
    protocol.save();
}
exports.incrementProtocolExercisedCount = incrementProtocolExercisedCount;
