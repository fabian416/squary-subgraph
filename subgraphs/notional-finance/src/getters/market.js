"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketsWithStatus = exports.getOrCreateMarketHourlySnapshot = exports.getOrCreateMarketDailySnapshot = exports.getOrCreateMarket = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const util_1 = require("../common/util");
const protocol_1 = require("./protocol");
const interestRate_1 = require("./interestRate");
function getOrCreateMarket(event, marketId) {
    let market = schema_1.Market.load(marketId);
    if (market == null) {
        const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
        protocol.totalPoolCount += 1;
        protocol.save();
        const currencyId = marketId.split("-")[0];
        const maturity = marketId.split("-")[1];
        // market metadata
        market = new schema_1.Market(marketId);
        market.protocol = protocol.id;
        market.name = (0, util_1.getNameFromCurrency)(currencyId) + "-" + maturity;
        // market properties
        market.isActive = true;
        market.canUseAsCollateral = true; // positive fCash balances can be used collateral
        market.canBorrowFrom = true;
        market.maximumLTV = constants_1.BIGDECIMAL_ZERO;
        market.liquidationThreshold = constants_1.BIGDECIMAL_ZERO;
        market.liquidationPenalty = constants_1.BIGDECIMAL_ZERO;
        // market tokens
        market.inputToken = (0, util_1.getTokenFromCurrency)(event, currencyId).id;
        market.outputToken = "";
        market.rewardTokens = [];
        market.inputTokenBalance = constants_1.BIGINT_ZERO;
        market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.outputTokenSupply = constants_1.BIGINT_ZERO; // Not fixed supply.
        market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO; // There is no price.
        // market rates
        const interestRate = (0, interestRate_1.getOrCreateInterestRate)(market.id);
        market.rates = [interestRate.id];
        market.exchangeRate = constants_1.BIGDECIMAL_ZERO;
        // revenue
        market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
        market.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
        // metadata
        market.createdTimestamp = event.block.timestamp;
        market.createdBlockNumber = event.block.number;
        // positions
        market.positionCount = constants_1.INT_ZERO;
        market.openPositionCount = constants_1.INT_ZERO;
        market.closedPositionCount = constants_1.INT_ZERO;
        market.lendingPositionCount = constants_1.INT_ZERO;
        market.borrowingPositionCount = constants_1.INT_ZERO;
        // helper for rev calc
        market._prevDailyId = "";
        market.save();
    }
    return market;
}
exports.getOrCreateMarket = getOrCreateMarket;
function getOrCreateMarketDailySnapshot(event, dailyId, marketId) {
    const id = "daily-" + marketId + "-" + dailyId.toString();
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    const market = getOrCreateMarket(event, marketId);
    let marketMetrics = schema_1.MarketDailySnapshot.load(id);
    if (marketMetrics == null) {
        marketMetrics = new schema_1.MarketDailySnapshot(id);
        marketMetrics.protocol = protocol.id;
        marketMetrics.market = marketId;
        marketMetrics.blockNumber = event.block.number;
        marketMetrics.timestamp = event.block.timestamp;
        marketMetrics.rates = market.rates;
        marketMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
        marketMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
        marketMetrics.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
        marketMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
        marketMetrics.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
        marketMetrics.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
        marketMetrics.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.inputTokenBalance = market.inputTokenBalance;
        marketMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
        marketMetrics.outputTokenSupply = market.outputTokenSupply;
        marketMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
        marketMetrics.exchangeRate = market.exchangeRate;
        marketMetrics.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
        marketMetrics.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
        marketMetrics.cumulativeSupplySideRevenueUSD =
            market.cumulativeSupplySideRevenueUSD;
        marketMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeProtocolSideRevenueUSD =
            market.cumulativeProtocolSideRevenueUSD;
        marketMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
        marketMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.save();
    }
    return marketMetrics;
}
exports.getOrCreateMarketDailySnapshot = getOrCreateMarketDailySnapshot;
function getOrCreateMarketHourlySnapshot(event, marketId) {
    // Hours since Unix epoch time
    const hourlyId = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    const id = "hourly-" + marketId + "-" + hourlyId.toString();
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    const market = getOrCreateMarket(event, marketId);
    let marketMetrics = schema_1.MarketHourlySnapshot.load(id);
    if (marketMetrics == null) {
        marketMetrics = new schema_1.MarketHourlySnapshot(id);
        marketMetrics.protocol = protocol.id;
        marketMetrics.market = marketId;
        marketMetrics.blockNumber = event.block.number;
        marketMetrics.timestamp = event.block.timestamp;
        marketMetrics.rates = market.rates;
        marketMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
        marketMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
        marketMetrics.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
        marketMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
        marketMetrics.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
        marketMetrics.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
        marketMetrics.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.inputTokenBalance = market.inputTokenBalance;
        marketMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
        marketMetrics.outputTokenSupply = market.outputTokenSupply;
        marketMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
        marketMetrics.exchangeRate = market.exchangeRate;
        marketMetrics.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
        marketMetrics.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
        marketMetrics.cumulativeSupplySideRevenueUSD =
            market.cumulativeSupplySideRevenueUSD;
        marketMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeProtocolSideRevenueUSD =
            market.cumulativeProtocolSideRevenueUSD;
        marketMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
        marketMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.save();
    }
    return marketMetrics;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
function getMarketsWithStatus(event) {
    const id = "0";
    let marketsStatus = schema_1.MarketsStatus.load(id);
    if (marketsStatus == null) {
        marketsStatus = new schema_1.MarketsStatus(id);
        marketsStatus.lastUpdateBlockNumber = event.block.number;
        marketsStatus.lastUpdateTimestamp = event.block.timestamp;
        marketsStatus.lastUpdateTransactionHash = event.transaction.hash;
        marketsStatus.activeMarkets = [];
        marketsStatus.maturedMarkets = [];
        marketsStatus.save();
    }
    return marketsStatus;
}
exports.getMarketsWithStatus = getMarketsWithStatus;
