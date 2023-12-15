"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProtocoVSTLocked = exports.updateProtocolPriceOracle = exports.addProtocolMarketAssets = exports.decrementProtocolOpenPositionCount = exports.incrementProtocolPositionCount = exports.incrementProtocolUniqueLiquidatees = exports.incrementProtocolUniqueLiquidators = exports.incrementProtocolUniqueBorrowers = exports.incrementProtocolUniqueDepositors = exports.incrementProtocolUniqueUsers = exports.updateProtocolBorrowBalance = exports.updateProtocolUSDLocked = exports.addProtocolVolume = exports.addSupplySideRevenue = exports.addProtocolSideRevenue = exports.getOrCreateFinancialsSnapshot = exports.getOrCreateLendingProtocol = exports.getLendingProtocol = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const VSTToken_1 = require("../../generated/ActivePool/VSTToken");
const constants_1 = require("../utils/constants");
const versions_1 = require("../versions");
const event_1 = require("./event");
const market_1 = require("./market");
const token_1 = require("./token");
function getLendingProtocol() {
    return schema_1.LendingProtocol.load(constants_1.TROVE_MANAGER);
}
exports.getLendingProtocol = getLendingProtocol;
function getOrCreateLendingProtocol() {
    let protocol = schema_1.LendingProtocol.load(constants_1.TROVE_MANAGER);
    if (!protocol) {
        protocol = new schema_1.LendingProtocol(constants_1.TROVE_MANAGER);
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = constants_1.Network.ARBITRUM_ONE;
        protocol.type = constants_1.ProtocolType.LENDING;
        protocol.lendingType = constants_1.LendingType.CDP;
        protocol.riskType = constants_1.RiskType.ISOLATED;
        protocol.mintedTokens = [(0, token_1.getVSTToken)().id];
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
        protocol._priceOracle = constants_1.EMPTY_STRING;
        protocol._marketAssets = [];
        protocol._stabilityPools = [];
        protocol._bonusToSPCallEnabled = false;
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
function addProtocolSideRevenue(event, market, revenueAmountUSD) {
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
function addSupplySideRevenue(event, market, revenueAmountUSD) {
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
function addProtocolVolume(event, amountUSD, eventType) {
    const protocol = getOrCreateLendingProtocol();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    switch (eventType) {
        case event_1.EventType.Deposit:
            protocol.cumulativeDepositUSD =
                protocol.cumulativeDepositUSD.plus(amountUSD);
            financialsSnapshot.dailyDepositUSD =
                financialsSnapshot.dailyDepositUSD.plus(amountUSD);
            break;
        case event_1.EventType.Borrow:
            protocol.cumulativeBorrowUSD =
                protocol.cumulativeBorrowUSD.plus(amountUSD);
            financialsSnapshot.dailyBorrowUSD =
                financialsSnapshot.dailyBorrowUSD.plus(amountUSD);
            break;
        case event_1.EventType.Liquidate:
            protocol.cumulativeLiquidateUSD =
                protocol.cumulativeLiquidateUSD.plus(amountUSD);
            financialsSnapshot.dailyLiquidateUSD =
                financialsSnapshot.dailyLiquidateUSD.plus(amountUSD);
            break;
        case event_1.EventType.Withdraw:
            financialsSnapshot.dailyWithdrawUSD =
                financialsSnapshot.dailyWithdrawUSD.plus(amountUSD);
            break;
        case event_1.EventType.Repay:
            financialsSnapshot.dailyRepayUSD =
                financialsSnapshot.dailyRepayUSD.plus(amountUSD);
            break;
        default:
            break;
    }
    protocol.save();
    financialsSnapshot.save();
}
exports.addProtocolVolume = addProtocolVolume;
function updateProtocolUSDLocked(event, netChangeUSD) {
    const protocol = getOrCreateLendingProtocol();
    const totalValueLocked = protocol.totalValueLockedUSD.plus(netChangeUSD);
    protocol.totalValueLockedUSD = totalValueLocked;
    protocol.totalDepositBalanceUSD = totalValueLocked;
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocolUSDLocked = updateProtocolUSDLocked;
function updateProtocolBorrowBalance(event, borrowedUSDChange) {
    const protocol = getOrCreateLendingProtocol();
    protocol.totalBorrowBalanceUSD =
        protocol.totalBorrowBalanceUSD.plus(borrowedUSDChange);
    const vstTokenContract = VSTToken_1.VSTToken.bind(graph_ts_1.Address.fromString(constants_1.VST_ADDRESS));
    const tryVSTTotalSupply = vstTokenContract.try_totalSupply();
    if (!tryVSTTotalSupply.reverted) {
        protocol.mintedTokenSupplies = [tryVSTTotalSupply.value];
    }
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
function addProtocolMarketAssets(market) {
    const protocol = getOrCreateLendingProtocol();
    const marketAssets = protocol._marketAssets;
    marketAssets.push(market.inputToken);
    protocol._marketAssets = marketAssets;
    protocol.save();
}
exports.addProtocolMarketAssets = addProtocolMarketAssets;
function updateProtocolPriceOracle(priceOracle) {
    const protocol = getOrCreateLendingProtocol();
    protocol._priceOracle = priceOracle;
    protocol.save();
}
exports.updateProtocolPriceOracle = updateProtocolPriceOracle;
function updateProtocoVSTLocked(event) {
    const protocol = getOrCreateLendingProtocol();
    let totalValueLocked = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < protocol._marketAssets.length; i++) {
        const mkt = (0, market_1.getOrCreateMarket)(graph_ts_1.Address.fromString(protocol._marketAssets[i]));
        totalValueLocked = totalValueLocked.plus(mkt.totalValueLockedUSD);
    }
    const stabilityPools = protocol._stabilityPools;
    for (let i = 0; i < stabilityPools.length; i++) {
        const pool = graph_ts_1.Address.fromString(stabilityPools[i]);
        const mkt = (0, market_1.getOrCreateStabilityPool)(pool, null, event);
        totalValueLocked = totalValueLocked.plus(mkt.totalValueLockedUSD);
    }
    protocol.totalValueLockedUSD = totalValueLocked;
    protocol.totalDepositBalanceUSD = totalValueLocked;
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocoVSTLocked = updateProtocoVSTLocked;
