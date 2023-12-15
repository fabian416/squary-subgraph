"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeMarketPosition = exports.openMarketLenderPosition = exports.openMarketBorrowerPosition = exports.addMarketBorrowVolume = exports.addMarketLiquidateVolume = exports.addMarketRepayVolume = exports.addMarketWithdrawVolume = exports.addMarketDepositVolume = exports.setMarketETHBalance = exports.setMarketLUSDDebt = exports.getOrCreateMarketHourlySnapshot = exports.getOrCreateMarketSnapshot = exports.getOrCreateStabilityPool = exports.getOrCreateMarket = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const numbers_1 = require("../utils/numbers");
const rate_1 = require("./rate");
function getOrCreateMarket() {
    let market = schema_1.Market.load(constants_1.ACTIVE_POOL);
    if (!market) {
        market = new schema_1.Market(constants_1.ACTIVE_POOL);
        market.protocol = (0, protocol_1.getOrCreateLiquityProtocol)().id;
        market.name = "Liquity";
        market.isActive = true;
        market.canUseAsCollateral = true;
        market.canBorrowFrom = true;
        market.maximumLTV = constants_1.MAXIMUM_LTV;
        market.liquidationThreshold = constants_1.MAXIMUM_LTV;
        market.liquidationPenalty = constants_1.LIQUIDATION_FEE_PERCENT;
        market.inputToken = (0, token_1.getETHToken)().id;
        market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.rates = [(0, rate_1.getOrCreateStableBorrowerInterestRate)(constants_1.ACTIVE_POOL).id];
        market.createdTimestamp = constants_1.ACTIVE_POOL_CREATED_TIMESTAMP;
        market.createdBlockNumber = constants_1.ACTIVE_POOL_CREATED_BLOCK;
        market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        market.inputTokenBalance = constants_1.BIGINT_ZERO;
        market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.outputTokenSupply = constants_1.BIGINT_ZERO;
        market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.positionCount = constants_1.INT_ZERO;
        market.openPositionCount = constants_1.INT_ZERO;
        market.closedPositionCount = constants_1.INT_ZERO;
        market.lendingPositionCount = constants_1.INT_ZERO;
        market.borrowingPositionCount = constants_1.INT_ZERO;
        market.save();
    }
    return market;
}
exports.getOrCreateMarket = getOrCreateMarket;
function getOrCreateStabilityPool(event) {
    let market = schema_1.Market.load(constants_1.STABILITY_POOL);
    if (market) {
        return market;
    }
    const protocol = (0, protocol_1.getOrCreateLiquityProtocol)();
    market = new schema_1.Market(constants_1.STABILITY_POOL);
    market.protocol = protocol.id;
    market.name = "Stability Pool";
    market.isActive = true;
    market.canUseAsCollateral = false;
    market.canBorrowFrom = false;
    market.maximumLTV = constants_1.BIGDECIMAL_ZERO;
    market.liquidationThreshold = constants_1.BIGDECIMAL_ZERO;
    market.liquidationPenalty = constants_1.BIGDECIMAL_ZERO;
    market.inputToken = (0, token_1.getLUSDToken)().id;
    market.rewardTokens = [(0, token_1.getRewardToken)().id];
    market.rates = [];
    market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
    market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
    market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
    market.inputTokenBalance = constants_1.BIGINT_ZERO;
    market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    market.outputTokenSupply = constants_1.BIGINT_ZERO;
    market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    market.exchangeRate = constants_1.BIGDECIMAL_ZERO;
    market.rewardTokenEmissionsAmount = [];
    market.rewardTokenEmissionsUSD = [];
    market.positionCount = 0;
    market.openPositionCount = 0;
    market.closedPositionCount = 0;
    market.lendingPositionCount = 0;
    market.borrowingPositionCount = 0;
    market.createdTimestamp = event.block.timestamp;
    market.createdBlockNumber = event.block.number;
    market.save();
    return market;
}
exports.getOrCreateStabilityPool = getOrCreateStabilityPool;
function getOrCreateMarketSnapshot(event, market) {
    const day = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const id = `${market.id}-${day}`;
    let marketSnapshot = schema_1.MarketDailySnapshot.load(id);
    if (!marketSnapshot) {
        marketSnapshot = new schema_1.MarketDailySnapshot(id);
        marketSnapshot.protocol = market.protocol;
        marketSnapshot.market = market.id;
        marketSnapshot.rates = market.rates;
        marketSnapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
    }
    marketSnapshot.rates = market.rates;
    marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    marketSnapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketSnapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketSnapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketSnapshot.inputTokenBalance = market.inputTokenBalance;
    marketSnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketSnapshot.outputTokenSupply = market.outputTokenSupply;
    marketSnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketSnapshot.exchangeRate = market.exchangeRate;
    marketSnapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    marketSnapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    marketSnapshot.blockNumber = event.block.number;
    marketSnapshot.timestamp = event.block.timestamp;
    marketSnapshot.save();
    return marketSnapshot;
}
exports.getOrCreateMarketSnapshot = getOrCreateMarketSnapshot;
function getOrCreateMarketHourlySnapshot(event, market) {
    const timestamp = event.block.timestamp.toI64();
    const hour = timestamp / constants_1.SECONDS_PER_HOUR;
    const id = `${market.id}-${hour}`;
    let marketSnapshot = schema_1.MarketHourlySnapshot.load(id);
    if (!marketSnapshot) {
        marketSnapshot = new schema_1.MarketHourlySnapshot(id);
        marketSnapshot.protocol = market.protocol;
        marketSnapshot.market = market.id;
        marketSnapshot.rates = market.rates;
        marketSnapshot.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
    }
    marketSnapshot.rates = market.rates;
    marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    marketSnapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketSnapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketSnapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketSnapshot.inputTokenBalance = market.inputTokenBalance;
    marketSnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketSnapshot.outputTokenSupply = market.outputTokenSupply;
    marketSnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketSnapshot.exchangeRate = market.exchangeRate;
    marketSnapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    marketSnapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    marketSnapshot.blockNumber = event.block.number;
    marketSnapshot.timestamp = event.block.timestamp;
    marketSnapshot.save();
    return marketSnapshot;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
function setMarketLUSDDebt(event, debtLUSD) {
    const debtUSD = (0, numbers_1.bigIntToBigDecimal)(debtLUSD);
    const market = getOrCreateMarket();
    market.totalBorrowBalanceUSD = debtUSD;
    market.save();
    getOrCreateMarketSnapshot(event, market);
    getOrCreateMarketHourlySnapshot(event, market);
    (0, protocol_1.updateProtocolBorrowBalance)(event, debtUSD, debtLUSD);
}
exports.setMarketLUSDDebt = setMarketLUSDDebt;
function setMarketETHBalance(event, balanceETH) {
    const balanceUSD = (0, numbers_1.bigIntToBigDecimal)(balanceETH).times((0, token_1.getCurrentETHPrice)());
    const market = getOrCreateMarket();
    const netChangeUSD = balanceUSD.minus(market.totalValueLockedUSD);
    market.totalValueLockedUSD = balanceUSD;
    market.totalDepositBalanceUSD = balanceUSD;
    market.inputTokenBalance = balanceETH;
    market.inputTokenPriceUSD = (0, token_1.getCurrentETHPrice)();
    market.save();
    getOrCreateMarketSnapshot(event, market);
    getOrCreateMarketHourlySnapshot(event, market);
    (0, protocol_1.updateProtocolUSDLocked)(event, netChangeUSD);
}
exports.setMarketETHBalance = setMarketETHBalance;
function addMarketDepositVolume(event, market, depositedUSD) {
    market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(depositedUSD);
    market.save();
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    dailySnapshot.dailyDepositUSD =
        dailySnapshot.dailyDepositUSD.plus(depositedUSD);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    hourlySnapshot.hourlyDepositUSD =
        hourlySnapshot.hourlyDepositUSD.plus(depositedUSD);
    hourlySnapshot.save();
    (0, protocol_1.addProtocolDepositVolume)(event, depositedUSD);
}
exports.addMarketDepositVolume = addMarketDepositVolume;
function addMarketWithdrawVolume(event, withdrawUSD) {
    const protocol = (0, protocol_1.getOrCreateLiquityProtocol)();
    const financialsSnapshot = (0, protocol_1.getOrCreateFinancialsSnapshot)(event, protocol);
    financialsSnapshot.dailyWithdrawUSD =
        financialsSnapshot.dailyWithdrawUSD.plus(withdrawUSD);
    financialsSnapshot.save();
    const market = getOrCreateMarket();
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    dailySnapshot.dailyWithdrawUSD =
        dailySnapshot.dailyWithdrawUSD.plus(withdrawUSD);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    hourlySnapshot.hourlyWithdrawUSD =
        hourlySnapshot.hourlyWithdrawUSD.plus(withdrawUSD);
    hourlySnapshot.save();
}
exports.addMarketWithdrawVolume = addMarketWithdrawVolume;
function addMarketRepayVolume(event, repayUSD) {
    const protocol = (0, protocol_1.getOrCreateLiquityProtocol)();
    const financialsSnapshot = (0, protocol_1.getOrCreateFinancialsSnapshot)(event, protocol);
    financialsSnapshot.dailyRepayUSD =
        financialsSnapshot.dailyRepayUSD.plus(repayUSD);
    financialsSnapshot.save();
    const market = getOrCreateMarket();
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    dailySnapshot.dailyRepayUSD = dailySnapshot.dailyRepayUSD.plus(repayUSD);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    hourlySnapshot.hourlyRepayUSD = hourlySnapshot.hourlyRepayUSD.plus(repayUSD);
    hourlySnapshot.save();
}
exports.addMarketRepayVolume = addMarketRepayVolume;
function addMarketLiquidateVolume(event, liquidatedUSD) {
    const market = getOrCreateMarket();
    market.cumulativeLiquidateUSD =
        market.cumulativeLiquidateUSD.plus(liquidatedUSD);
    market.save();
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    dailySnapshot.dailyLiquidateUSD =
        dailySnapshot.dailyLiquidateUSD.plus(liquidatedUSD);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    hourlySnapshot.hourlyLiquidateUSD =
        hourlySnapshot.hourlyLiquidateUSD.plus(liquidatedUSD);
    hourlySnapshot.save();
    (0, protocol_1.addProtocolLiquidateVolume)(event, liquidatedUSD);
}
exports.addMarketLiquidateVolume = addMarketLiquidateVolume;
function addMarketBorrowVolume(event, borrowedUSD) {
    const market = getOrCreateMarket();
    market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(borrowedUSD);
    market.save();
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    dailySnapshot.dailyBorrowUSD = dailySnapshot.dailyBorrowUSD.plus(borrowedUSD);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    hourlySnapshot.hourlyBorrowUSD =
        hourlySnapshot.hourlyBorrowUSD.plus(borrowedUSD);
    hourlySnapshot.save();
    (0, protocol_1.addProtocolBorrowVolume)(event, borrowedUSD);
}
exports.addMarketBorrowVolume = addMarketBorrowVolume;
function openMarketBorrowerPosition(market) {
    market.openPositionCount += 1;
    market.positionCount += 1;
    market.borrowingPositionCount += 1;
    market.save();
    (0, protocol_1.incrementProtocolPositionCount)();
}
exports.openMarketBorrowerPosition = openMarketBorrowerPosition;
function openMarketLenderPosition(market) {
    market.openPositionCount += 1;
    market.positionCount += 1;
    market.lendingPositionCount += 1;
    market.save();
    (0, protocol_1.incrementProtocolPositionCount)();
}
exports.openMarketLenderPosition = openMarketLenderPosition;
function closeMarketPosition(market) {
    market.openPositionCount -= 1;
    market.closedPositionCount += 1;
    market.save();
    (0, protocol_1.decrementProtocolOpenPositionCount)();
}
exports.closeMarketPosition = closeMarketPosition;
