"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrementProtocolOpenPositionCount = exports.incrementProtocolPositionCount = exports.incrementProtocolUniqueLiquidatees = exports.incrementProtocolUniqueLiquidators = exports.incrementProtocolUniqueBorrowers = exports.incrementProtocolUniqueDepositors = exports.incrementProtocolUniqueUsers = exports.updateProtocolBorrowBalance = exports.updateProtocolUSDLockedStabilityPool = exports.updateProtocolUSDLocked = exports.addProtocolLiquidateVolume = exports.addProtocolDepositVolume = exports.addProtocolBorrowVolume = exports.addSupplySideRevenue = exports.addProtocolSideRevenue = exports.getOrCreateFinancialsSnapshot = exports.getOrCreateLiquityProtocol = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const versions_1 = require("../versions");
const market_1 = require("./market");
const token_1 = require("./token");
const numbers_1 = require("../utils/numbers");
function getOrCreateLiquityProtocol() {
    let protocol = schema_1.LendingProtocol.load(constants_1.TROVE_MANAGER);
    if (!protocol) {
        protocol = new schema_1.LendingProtocol(constants_1.TROVE_MANAGER);
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = constants_1.Network.MAINNET;
        protocol.type = constants_1.ProtocolType.LENDING;
        protocol.lendingType = constants_1.LendingType.CDP;
        protocol.riskType = constants_1.RiskType.ISOLATED;
        protocol.mintedTokens = [(0, token_1.getLUSDToken)().id];
        protocol.totalPoolCount = constants_1.INT_ONE; // Only one active pool
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
        protocol.openPositionCount = constants_1.INT_ZERO;
        protocol.cumulativePositionCount = constants_1.INT_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateLiquityProtocol = getOrCreateLiquityProtocol;
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
    }
    financialsSnapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialsSnapshot.mintedTokenSupplies = protocol.mintedTokenSupplies;
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
function addProtocolSideRevenue(event, revenueAmountUSD, market) {
    const protocol = getOrCreateLiquityProtocol();
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
    market.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD.plus(revenueAmountUSD);
    market.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD.plus(revenueAmountUSD);
    market.save();
    const marketDailySnapshot = (0, market_1.getOrCreateMarketSnapshot)(event, market);
    marketDailySnapshot.dailyProtocolSideRevenueUSD =
        marketDailySnapshot.dailyProtocolSideRevenueUSD.plus(revenueAmountUSD);
    marketDailySnapshot.dailyTotalRevenueUSD =
        marketDailySnapshot.dailyTotalRevenueUSD.plus(revenueAmountUSD);
    marketDailySnapshot.save();
    const marketHourlySnapshot = (0, market_1.getOrCreateMarketHourlySnapshot)(event, market);
    marketHourlySnapshot.hourlyProtocolSideRevenueUSD =
        marketHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(revenueAmountUSD);
    marketHourlySnapshot.hourlyTotalRevenueUSD =
        marketHourlySnapshot.hourlyTotalRevenueUSD.plus(revenueAmountUSD);
    marketHourlySnapshot.save();
}
exports.addProtocolSideRevenue = addProtocolSideRevenue;
function addSupplySideRevenue(event, revenueAmountUSD, market) {
    const protocol = getOrCreateLiquityProtocol();
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
    market.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD.plus(revenueAmountUSD);
    market.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD.plus(revenueAmountUSD);
    market.save();
    const marketDailySnapshot = (0, market_1.getOrCreateMarketSnapshot)(event, market);
    marketDailySnapshot.dailySupplySideRevenueUSD =
        marketDailySnapshot.dailySupplySideRevenueUSD.plus(revenueAmountUSD);
    marketDailySnapshot.dailyTotalRevenueUSD =
        marketDailySnapshot.dailyTotalRevenueUSD.plus(revenueAmountUSD);
    marketDailySnapshot.save();
    const marketHourlySnapshot = (0, market_1.getOrCreateMarketHourlySnapshot)(event, market);
    marketHourlySnapshot.hourlySupplySideRevenueUSD =
        marketHourlySnapshot.hourlySupplySideRevenueUSD.plus(revenueAmountUSD);
    marketHourlySnapshot.hourlyTotalRevenueUSD =
        marketHourlySnapshot.hourlyTotalRevenueUSD.plus(revenueAmountUSD);
    marketHourlySnapshot.save();
}
exports.addSupplySideRevenue = addSupplySideRevenue;
function addProtocolBorrowVolume(event, borrowedUSD) {
    const protocol = getOrCreateLiquityProtocol();
    protocol.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD.plus(borrowedUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyBorrowUSD =
        financialsSnapshot.dailyBorrowUSD.plus(borrowedUSD);
    financialsSnapshot.save();
}
exports.addProtocolBorrowVolume = addProtocolBorrowVolume;
function addProtocolDepositVolume(event, depositedUSD) {
    const protocol = getOrCreateLiquityProtocol();
    protocol.cumulativeDepositUSD =
        protocol.cumulativeDepositUSD.plus(depositedUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyDepositUSD =
        financialsSnapshot.dailyDepositUSD.plus(depositedUSD);
    financialsSnapshot.save();
}
exports.addProtocolDepositVolume = addProtocolDepositVolume;
function addProtocolLiquidateVolume(event, liquidatedUSD) {
    const protocol = getOrCreateLiquityProtocol();
    protocol.cumulativeLiquidateUSD =
        protocol.cumulativeLiquidateUSD.plus(liquidatedUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.dailyLiquidateUSD =
        financialsSnapshot.dailyLiquidateUSD.plus(liquidatedUSD);
    financialsSnapshot.save();
}
exports.addProtocolLiquidateVolume = addProtocolLiquidateVolume;
function updateProtocolUSDLocked(event, netChangeUSD) {
    const protocol = getOrCreateLiquityProtocol();
    const totalValueLocked = protocol.totalValueLockedUSD.plus(netChangeUSD);
    protocol.totalValueLockedUSD = totalValueLocked;
    protocol.totalDepositBalanceUSD = totalValueLocked;
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocolUSDLocked = updateProtocolUSDLocked;
function updateProtocolUSDLockedStabilityPool(event, lusdAmount, ethAmount) {
    const lusdPrice = (0, token_1.getCurrentLUSDPrice)();
    const LUSDValue = (0, numbers_1.bigIntToBigDecimal)(lusdAmount).times(lusdPrice);
    const totalETHValue = (0, numbers_1.bigIntToBigDecimal)(ethAmount).times((0, token_1.getCurrentETHPrice)());
    const stabilityPoolTVL = LUSDValue.plus(totalETHValue);
    const stabilityPool = (0, market_1.getOrCreateStabilityPool)(event);
    stabilityPool.inputTokenBalance = lusdAmount;
    stabilityPool.totalValueLockedUSD = stabilityPoolTVL;
    stabilityPool.totalDepositBalanceUSD = stabilityPoolTVL;
    stabilityPool.inputTokenPriceUSD = lusdPrice;
    stabilityPool.save();
    const protocol = getOrCreateLiquityProtocol();
    const market = (0, market_1.getOrCreateMarket)();
    const totalValueLocked = market.totalValueLockedUSD.plus(stabilityPoolTVL);
    protocol.totalValueLockedUSD = totalValueLocked;
    protocol.totalDepositBalanceUSD = totalValueLocked;
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocolUSDLockedStabilityPool = updateProtocolUSDLockedStabilityPool;
function updateProtocolBorrowBalance(event, borrowedUSD, totalLUSDSupply) {
    const protocol = getOrCreateLiquityProtocol();
    protocol.totalBorrowBalanceUSD = borrowedUSD;
    protocol.mintedTokenSupplies = [totalLUSDSupply];
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocolBorrowBalance = updateProtocolBorrowBalance;
function incrementProtocolUniqueUsers() {
    const protocol = getOrCreateLiquityProtocol();
    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
}
exports.incrementProtocolUniqueUsers = incrementProtocolUniqueUsers;
function incrementProtocolUniqueDepositors() {
    const protocol = getOrCreateLiquityProtocol();
    protocol.cumulativeUniqueDepositors += 1;
    protocol.save();
}
exports.incrementProtocolUniqueDepositors = incrementProtocolUniqueDepositors;
function incrementProtocolUniqueBorrowers() {
    const protocol = getOrCreateLiquityProtocol();
    protocol.cumulativeUniqueBorrowers += 1;
    protocol.save();
}
exports.incrementProtocolUniqueBorrowers = incrementProtocolUniqueBorrowers;
function incrementProtocolUniqueLiquidators() {
    const protocol = getOrCreateLiquityProtocol();
    protocol.cumulativeUniqueLiquidators += 1;
    protocol.save();
}
exports.incrementProtocolUniqueLiquidators = incrementProtocolUniqueLiquidators;
function incrementProtocolUniqueLiquidatees() {
    const protocol = getOrCreateLiquityProtocol();
    protocol.cumulativeUniqueLiquidatees += 1;
    protocol.save();
}
exports.incrementProtocolUniqueLiquidatees = incrementProtocolUniqueLiquidatees;
function incrementProtocolPositionCount() {
    const protocol = getOrCreateLiquityProtocol();
    protocol.cumulativePositionCount += 1;
    protocol.openPositionCount += 1;
    protocol.save();
}
exports.incrementProtocolPositionCount = incrementProtocolPositionCount;
function decrementProtocolOpenPositionCount() {
    const protocol = getOrCreateLiquityProtocol();
    protocol.openPositionCount -= 1;
    protocol.save();
}
exports.decrementProtocolOpenPositionCount = decrementProtocolOpenPositionCount;
