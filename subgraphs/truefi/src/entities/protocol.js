"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProtocolRewardToken = exports.decrementProtocolOpenPositionCount = exports.incrementProtocolPositionCount = exports.incrementProtocolUniqueLiquidatees = exports.incrementProtocolUniqueLiquidators = exports.incrementProtocolUniqueBorrowers = exports.incrementProtocolUniqueDepositors = exports.incrementProtocolUniqueUsers = exports.updateProtocolBorrowBalance = exports.updateProtocolTVL = exports.addProtocolRepayVolume = exports.addProtocolWithdrawVolume = exports.addProtocolLiquidateVolume = exports.addProtocolBorrowVolume = exports.addProtocolDepositVolume = exports.addSupplySideRevenue = exports.addProtocolSideRevenue = exports.getOrCreateFinancialsSnapshot = exports.getOrCreateLendingProtocol = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const versions_1 = require("../versions");
const price_1 = require("./price");
function getOrCreateLendingProtocol() {
    const id = constants_1.PROTOCOL_ID;
    let protocol = schema_1.LendingProtocol.load(id);
    if (!protocol) {
        protocol = new schema_1.LendingProtocol(id);
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = graph_ts_1.dataSource.network().toUpperCase().replace("-", "_");
        protocol.type = constants_1.ProtocolType.LENDING;
        protocol.lendingType = constants_1.LendingType.POOLED;
        protocol.riskType = constants_1.RiskType.ISOLATED;
        protocol.rewardToken = null;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.cumulativeUniqueDepositors = constants_1.INT_ZERO;
        protocol.cumulativeUniqueBorrowers = constants_1.INT_ZERO;
        protocol.cumulativeUniqueLiquidators = constants_1.INT_ZERO;
        protocol.cumulativeUniqueLiquidatees = constants_1.INT_ZERO;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalPoolCount = constants_1.INT_ZERO;
        protocol.openPositionCount = constants_1.INT_ZERO;
        protocol.cumulativePositionCount = constants_1.INT_ZERO;
        protocol.rewardTokenEmissionsAmount = constants_1.BIGINT_ZERO;
        protocol.rewardTokenEmissionsUSD = constants_1.BIGDECIMAL_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateLendingProtocol = getOrCreateLendingProtocol;
function getOrCreateFinancialsSnapshot(event, protocol) {
    // Number of days since Unix epoch
    const id = `${event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY}`;
    let financialsSnapshot = schema_1.FinancialsDailySnapshot.load(id);
    if (!financialsSnapshot) {
        financialsSnapshot = new schema_1.FinancialsDailySnapshot(id);
        financialsSnapshot.protocol = protocol.id;
        financialsSnapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        financialsSnapshot.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        // For TrueFi, the reward token isn't allocated to markets directly.
        // Lenders needs to stake their tfTokens to get the rewards.
        // So we calculate the rewards at protocol level.
        updateProtocolRewardTokenEmission(event.block.timestamp, protocol);
    }
    financialsSnapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialsSnapshot.mintedTokenSupplies = protocol.mintedTokenSupplies;
    financialsSnapshot.rewardTokenEmissionsAmount =
        protocol.rewardTokenEmissionsAmount;
    financialsSnapshot.rewardTokenEmissionsUSD = protocol.rewardTokenEmissionsUSD;
    financialsSnapshot.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialsSnapshot.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialsSnapshot.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    financialsSnapshot.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
    financialsSnapshot.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
    financialsSnapshot.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
    financialsSnapshot.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
    financialsSnapshot.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
    financialsSnapshot.blockNumber = event.block.number;
    financialsSnapshot.timestamp = event.block.timestamp;
    return financialsSnapshot;
}
exports.getOrCreateFinancialsSnapshot = getOrCreateFinancialsSnapshot;
function addProtocolSideRevenue(event, revenueAmountUSD) {
    const protocol = getOrCreateLendingProtocol();
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(revenueAmountUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(revenueAmountUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyProtocolSideRevenueUSD =
        financialsSnapshot.dailyProtocolSideRevenueUSD.plus(revenueAmountUSD);
    financialsSnapshot.dailyTotalRevenueUSD =
        financialsSnapshot.dailyTotalRevenueUSD.plus(revenueAmountUSD);
    financialsSnapshot.save();
}
exports.addProtocolSideRevenue = addProtocolSideRevenue;
function addSupplySideRevenue(event, revenueAmountUSD) {
    const protocol = getOrCreateLendingProtocol();
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(revenueAmountUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(revenueAmountUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailySupplySideRevenueUSD =
        financialsSnapshot.dailySupplySideRevenueUSD.plus(revenueAmountUSD);
    financialsSnapshot.dailyTotalRevenueUSD =
        financialsSnapshot.dailyTotalRevenueUSD.plus(revenueAmountUSD);
    financialsSnapshot.save();
}
exports.addSupplySideRevenue = addSupplySideRevenue;
function addProtocolDepositVolume(event, depositedUSD) {
    const protocol = getOrCreateLendingProtocol();
    protocol.cumulativeDepositUSD =
        protocol.cumulativeDepositUSD.plus(depositedUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyDepositUSD =
        financialsSnapshot.dailyDepositUSD.plus(depositedUSD);
    financialsSnapshot.save();
}
exports.addProtocolDepositVolume = addProtocolDepositVolume;
function addProtocolBorrowVolume(event, borrowedUSD) {
    const protocol = getOrCreateLendingProtocol();
    protocol.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD.plus(borrowedUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyBorrowUSD =
        financialsSnapshot.dailyBorrowUSD.plus(borrowedUSD);
    financialsSnapshot.save();
}
exports.addProtocolBorrowVolume = addProtocolBorrowVolume;
function addProtocolLiquidateVolume(event, liquidatedUSD) {
    const protocol = getOrCreateLendingProtocol();
    protocol.cumulativeLiquidateUSD =
        protocol.cumulativeLiquidateUSD.plus(liquidatedUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyLiquidateUSD =
        financialsSnapshot.dailyLiquidateUSD.plus(liquidatedUSD);
    financialsSnapshot.save();
}
exports.addProtocolLiquidateVolume = addProtocolLiquidateVolume;
function addProtocolWithdrawVolume(event, amountUSD) {
    const protocol = getOrCreateLendingProtocol();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyWithdrawUSD =
        financialsSnapshot.dailyWithdrawUSD.plus(amountUSD);
    financialsSnapshot.save();
}
exports.addProtocolWithdrawVolume = addProtocolWithdrawVolume;
function addProtocolRepayVolume(event, amountUSD) {
    const protocol = getOrCreateLendingProtocol();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyRepayUSD =
        financialsSnapshot.dailyRepayUSD.plus(amountUSD);
    financialsSnapshot.save();
}
exports.addProtocolRepayVolume = addProtocolRepayVolume;
function updateProtocolTVL(event, tvlChangeUSD, totalDepositBalanceUSDChange) {
    const protocol = getOrCreateLendingProtocol();
    protocol.totalValueLockedUSD =
        protocol.totalValueLockedUSD.plus(tvlChangeUSD);
    protocol.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD.plus(totalDepositBalanceUSDChange);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocolTVL = updateProtocolTVL;
function updateProtocolBorrowBalance(event, bbChangeUSD) {
    const protocol = getOrCreateLendingProtocol();
    protocol.totalBorrowBalanceUSD =
        protocol.totalBorrowBalanceUSD.plus(bbChangeUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocolBorrowBalance = updateProtocolBorrowBalance;
function incrementProtocolUniqueUsers() {
    const protocol = getOrCreateLendingProtocol();
    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
}
exports.incrementProtocolUniqueUsers = incrementProtocolUniqueUsers;
function incrementProtocolUniqueDepositors() {
    const protocol = getOrCreateLendingProtocol();
    protocol.cumulativeUniqueDepositors += 1;
    protocol.save();
}
exports.incrementProtocolUniqueDepositors = incrementProtocolUniqueDepositors;
function incrementProtocolUniqueBorrowers() {
    const protocol = getOrCreateLendingProtocol();
    protocol.cumulativeUniqueBorrowers += 1;
    protocol.save();
}
exports.incrementProtocolUniqueBorrowers = incrementProtocolUniqueBorrowers;
function incrementProtocolUniqueLiquidators() {
    const protocol = getOrCreateLendingProtocol();
    protocol.cumulativeUniqueLiquidators += 1;
    protocol.save();
}
exports.incrementProtocolUniqueLiquidators = incrementProtocolUniqueLiquidators;
function incrementProtocolUniqueLiquidatees() {
    const protocol = getOrCreateLendingProtocol();
    protocol.cumulativeUniqueLiquidatees += 1;
    protocol.save();
}
exports.incrementProtocolUniqueLiquidatees = incrementProtocolUniqueLiquidatees;
function incrementProtocolPositionCount() {
    const protocol = getOrCreateLendingProtocol();
    protocol.cumulativePositionCount += 1;
    protocol.openPositionCount += 1;
    protocol.save();
}
exports.incrementProtocolPositionCount = incrementProtocolPositionCount;
function decrementProtocolOpenPositionCount() {
    const protocol = getOrCreateLendingProtocol();
    protocol.openPositionCount -= 1;
    protocol.save();
}
exports.decrementProtocolOpenPositionCount = decrementProtocolOpenPositionCount;
function updateProtocolRewardToken(timestamp, rewardToken, emissionRate) {
    const protocol = getOrCreateLendingProtocol();
    protocol.rewardToken = rewardToken.id;
    protocol.rewardTokenEmissionsAmount = emissionRate.times(constants_1.BIGINT_SECONDS_PER_DAY);
    protocol.rewardTokenEmissionsUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.save();
    updateProtocolRewardTokenEmission(timestamp, protocol);
}
exports.updateProtocolRewardToken = updateProtocolRewardToken;
function updateProtocolRewardTokenEmission(timestamp, protocol) {
    if (protocol.rewardToken == null) {
        return;
    }
    const rewardToken = schema_1.RewardToken.load(protocol.rewardToken);
    if (rewardToken == null) {
        return;
    }
    let rewardTokenEmission = protocol.rewardTokenEmissionsAmount;
    if (timestamp.gt(rewardToken.distributionEnd)) {
        rewardTokenEmission = constants_1.BIGINT_ZERO;
    }
    protocol.rewardTokenEmissionsAmount = rewardTokenEmission;
    protocol.rewardTokenEmissionsUSD = (0, price_1.amountInUSDForTru)(rewardTokenEmission, schema_1.Token.load(rewardToken.token));
    protocol.save();
}
