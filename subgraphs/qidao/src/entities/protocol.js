"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProtocolMintedTokens = exports.updateProtocolBorrowBalance = exports.updateProtocolTVL = exports.addProtocolLiquidateVolume = exports.addProtocolBorrowVolume = exports.addProtocolDepositVolume = exports.addSupplySideRevenue = exports.addProtocolSideRevenue = exports.getOrCreateFinancialsSnapshot = exports.getOrCreateLendingProtocol = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const ERC20_1 = require("../../generated/templates/Vault/ERC20");
const constants_1 = require("../utils/constants");
const strings_1 = require("../utils/strings");
const versions_1 = require("../versions");
const market_1 = require("./market");
const token_1 = require("./token");
function getOrCreateLendingProtocol() {
    const id = constants_1.MAI_TOKEN_ADDRESS.get((0, strings_1.uppercaseNetwork)(graph_ts_1.dataSource.network()));
    let protocol = schema_1.LendingProtocol.load(id);
    if (!protocol) {
        protocol = new schema_1.LendingProtocol(id);
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = graph_ts_1.dataSource.network().toUpperCase().replace("-", "_");
        protocol.type = constants_1.ProtocolType.LENDING;
        protocol.lendingType = constants_1.LendingType.CDP;
        protocol.riskType = constants_1.RiskType.ISOLATED;
        protocol.mintedTokens = [(0, token_1.getMaiToken)().id];
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.totalPoolCount = constants_1.INT_ZERO;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.mintedTokenSupplies = [constants_1.BIGINT_ZERO];
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
function updateProtocolTVL(event, tvlChangeUSD) {
    const protocol = getOrCreateLendingProtocol();
    const totalValueLocked = protocol.totalValueLockedUSD.plus(tvlChangeUSD);
    protocol.totalValueLockedUSD = totalValueLocked;
    protocol.totalDepositBalanceUSD = totalValueLocked;
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocolTVL = updateProtocolTVL;
function updateProtocolBorrowBalance(event, bbChangeUSD) {
    const protocol = getOrCreateLendingProtocol();
    updateProtocolMintedTokens(protocol);
    protocol.totalBorrowBalanceUSD =
        protocol.totalBorrowBalanceUSD.plus(bbChangeUSD);
    protocol.save();
    const financialsSnapshot = getOrCreateFinancialsSnapshot(event, protocol);
    financialsSnapshot.save();
}
exports.updateProtocolBorrowBalance = updateProtocolBorrowBalance;
function updateProtocolMintedTokens(protocol) {
    const maiToken = (0, token_1.getMaiToken)();
    const maiContract = ERC20_1.ERC20.bind(graph_ts_1.Address.fromString(maiToken.id));
    protocol.mintedTokenSupplies = [maiContract.totalSupply()];
}
exports.updateProtocolMintedTokens = updateProtocolMintedTokens;
