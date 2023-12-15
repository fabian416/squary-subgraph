"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeMarketPosition = exports.openMarketLenderPosition = exports.openMarketBorrowerPosition = exports.addMarketProtocolSideRevenue = exports.addMarketSupplySideRevenue = exports.updateTokenSupply = exports.updateMarketRates = exports.changeMarketBorrowBalance = exports.addMarketRepayVolume = exports.addMarketBorrowVolume = exports.addMarketLiquidateVolume = exports.addMarketWithdrawVolume = exports.addMarketDepositVolume = exports.getOrCreateMarketHourlySnapshot = exports.getOrCreateMarketSnapshot = exports.closeMarket = exports.createMarket = exports.getMarket = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const TruefiPool2_1 = require("../../generated/templates/TruefiPool2/TruefiPool2");
const ManagedPortfolio_1 = require("../../generated/templates/ManagedPortfolio/ManagedPortfolio");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const price_1 = require("./price");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const usage_1 = require("./usage");
const event_1 = require("./event");
const rate_1 = require("./rate");
function getMarket(address) {
    const id = address.toHexString();
    return schema_1.Market.load(id);
}
exports.getMarket = getMarket;
function createMarket(event, reserve, tfToken) {
    const id = tfToken.toHexString();
    let market = schema_1.Market.load(id);
    if (!market) {
        const truefiToken = (0, token_1.getOrCreateToken)(tfToken, reserve.toHexString());
        market = new schema_1.Market(id);
        market.protocol = (0, protocol_1.getOrCreateLendingProtocol)().id;
        market.name = truefiToken.name;
        market.isActive = true;
        market.canUseAsCollateral = false;
        market.canBorrowFrom = true;
        market.maximumLTV = constants_1.BIGDECIMAL_ZERO;
        market.liquidationThreshold = constants_1.BIGDECIMAL_ZERO;
        market.liquidationPenalty = constants_1.BIGDECIMAL_ZERO;
        market.inputToken = (0, token_1.getOrCreateToken)(reserve).id;
        market.outputToken = truefiToken.id;
        market.rates = [];
        market.createdTimestamp = event.block.timestamp;
        market.createdBlockNumber = event.block.number;
        market.exchangeRate = constants_1.BIGDECIMAL_ONE;
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
        (0, usage_1.incrementProtocolTotalPoolCount)(event);
    }
}
exports.createMarket = createMarket;
function closeMarket(market) {
    market.isActive = false;
    market.canUseAsCollateral = false;
    market.canBorrowFrom = false;
    market.save();
}
exports.closeMarket = closeMarket;
function getOrCreateMarketSnapshot(event, market) {
    const day = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const id = `${market.id}-${day}`;
    let marketSnapshot = schema_1.MarketDailySnapshot.load(id);
    if (!marketSnapshot) {
        marketSnapshot = new schema_1.MarketDailySnapshot(id);
        marketSnapshot.protocol = market.protocol;
        marketSnapshot.market = market.id;
        marketSnapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
    }
    marketSnapshot.rates = getSnapshotRates(market.rates, (event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString());
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
        marketSnapshot.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
    }
    marketSnapshot.rates = getSnapshotRates(market.rates, (event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString());
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
// create seperate InterestRate Entities for each market snapshot
// this is needed to prevent snapshot rates from being pointers to the current rate
function getSnapshotRates(rates, timeSuffix) {
    let snapshotRates = [];
    for (let i = 0; i < rates.length; i++) {
        let rate = schema_1.InterestRate.load(rates[i]);
        if (!rate) {
            graph_ts_1.log.warning("[getSnapshotRates] rate {} not found, should not happen", [
                rates[i],
            ]);
            continue;
        }
        // create new snapshot rate
        let snapshotRateId = rates[i].concat("-").concat(timeSuffix);
        let snapshotRate = new schema_1.InterestRate(snapshotRateId);
        snapshotRate.side = rate.side;
        snapshotRate.type = rate.type;
        snapshotRate.rate = rate.rate;
        snapshotRate.save();
        snapshotRates.push(snapshotRateId);
    }
    return snapshotRates;
}
function addMarketDepositVolume(event, market, amountUSD) {
    addMarketVolume(event, market, amountUSD, event_1.EventType.Deposit);
}
exports.addMarketDepositVolume = addMarketDepositVolume;
function addMarketWithdrawVolume(event, market, amountUSD) {
    addMarketVolume(event, market, amountUSD, event_1.EventType.Withdraw);
}
exports.addMarketWithdrawVolume = addMarketWithdrawVolume;
function addMarketLiquidateVolume(event, market, amountUSD) {
    addMarketVolume(event, market, amountUSD, event_1.EventType.Liquidate);
}
exports.addMarketLiquidateVolume = addMarketLiquidateVolume;
function addMarketBorrowVolume(event, market, amountUSD) {
    addMarketVolume(event, market, amountUSD, event_1.EventType.Borrow);
}
exports.addMarketBorrowVolume = addMarketBorrowVolume;
function addMarketRepayVolume(event, market, amountUSD) {
    addMarketVolume(event, market, amountUSD, event_1.EventType.Repay);
}
exports.addMarketRepayVolume = addMarketRepayVolume;
function addMarketVolume(event, market, amountUSD, eventType) {
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    switch (eventType) {
        case event_1.EventType.Deposit:
            market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(amountUSD);
            dailySnapshot.dailyDepositUSD =
                dailySnapshot.dailyDepositUSD.plus(amountUSD);
            hourlySnapshot.hourlyDepositUSD.plus(amountUSD);
            (0, protocol_1.addProtocolDepositVolume)(event, amountUSD);
            break;
        case event_1.EventType.Borrow:
            market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(amountUSD);
            dailySnapshot.dailyBorrowUSD =
                dailySnapshot.dailyBorrowUSD.plus(amountUSD);
            hourlySnapshot.hourlyBorrowUSD =
                hourlySnapshot.hourlyBorrowUSD.plus(amountUSD);
            (0, protocol_1.addProtocolBorrowVolume)(event, amountUSD);
            break;
        case event_1.EventType.Liquidate:
            market.cumulativeLiquidateUSD =
                market.cumulativeLiquidateUSD.plus(amountUSD);
            dailySnapshot.dailyLiquidateUSD =
                dailySnapshot.dailyLiquidateUSD.plus(amountUSD);
            hourlySnapshot.hourlyLiquidateUSD =
                hourlySnapshot.hourlyLiquidateUSD.plus(amountUSD);
            (0, protocol_1.addProtocolLiquidateVolume)(event, amountUSD);
            break;
        case event_1.EventType.Withdraw:
            dailySnapshot.dailyWithdrawUSD =
                dailySnapshot.dailyWithdrawUSD.plus(amountUSD);
            hourlySnapshot.hourlyWithdrawUSD =
                hourlySnapshot.hourlyWithdrawUSD.plus(amountUSD);
            (0, protocol_1.addProtocolWithdrawVolume)(event, amountUSD);
            break;
        case event_1.EventType.Repay:
            dailySnapshot.dailyRepayUSD = dailySnapshot.dailyRepayUSD.plus(amountUSD);
            hourlySnapshot.hourlyRepayUSD =
                hourlySnapshot.hourlyRepayUSD.plus(amountUSD);
            (0, protocol_1.addProtocolRepayVolume)(event, amountUSD);
            break;
        default:
            break;
    }
    market.save();
    dailySnapshot.save();
    hourlySnapshot.save();
}
function changeMarketBorrowBalance(event, market, balanceChange, isPool) {
    let changeUSD = (0, price_1.amountInUSD)(balanceChange, (0, token_1.getTokenById)(market.inputToken));
    if (isPool) {
        const poolContract = TruefiPool2_1.TruefiPool2.bind(graph_ts_1.Address.fromString(market.id));
        const tryLoansValue = poolContract.try_loansValue();
        if (!tryLoansValue.reverted) {
            const loansValueUSD = (0, price_1.amountInUSD)(tryLoansValue.value, (0, token_1.getTokenById)(market.inputToken));
            changeUSD = loansValueUSD.minus(market.totalBorrowBalanceUSD);
        }
    }
    else {
        const portfoliContract = ManagedPortfolio_1.ManagedPortfolio.bind(graph_ts_1.Address.fromString(market.id));
        const tryIlliquidValue = portfoliContract.try_illiquidValue();
        if (!tryIlliquidValue.reverted) {
            const illiquidValueUSD = (0, price_1.amountInUSD)(tryIlliquidValue.value, (0, token_1.getTokenById)(market.inputToken));
            changeUSD = illiquidValueUSD.minus(market.totalBorrowBalanceUSD);
        }
    }
    market.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD.plus(changeUSD);
    if (market.totalBorrowBalanceUSD.lt(constants_1.BIGDECIMAL_ZERO)) {
        market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    }
    market.save();
    getOrCreateMarketSnapshot(event, market);
    getOrCreateMarketHourlySnapshot(event, market);
    (0, protocol_1.updateProtocolBorrowBalance)(event, changeUSD);
}
exports.changeMarketBorrowBalance = changeMarketBorrowBalance;
function updateMarketRates(event, market, borrowerInterestRate) {
    const newRates = (0, rate_1.createInterestRates)(market.id, borrowerInterestRate, event.block.timestamp.toString());
    market.rates = newRates;
    market.save();
    getOrCreateMarketSnapshot(event, market);
    getOrCreateMarketHourlySnapshot(event, market);
}
exports.updateMarketRates = updateMarketRates;
function updateTokenSupply(event, marketAddress, isPool) {
    const market = getMarket(marketAddress);
    const inputToken = (0, token_1.getTokenById)(market.inputToken);
    market.inputTokenPriceUSD = (0, price_1.getTokenPrice)(inputToken);
    updateMarketTVL(event, market, isPool);
    getOrCreateMarketSnapshot(event, market);
    getOrCreateMarketHourlySnapshot(event, market);
}
exports.updateTokenSupply = updateTokenSupply;
function addMarketSupplySideRevenue(event, market, revenueAmountUSD) {
    market.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD.plus(revenueAmountUSD);
    market.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD.plus(revenueAmountUSD);
    market.save();
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    dailySnapshot.dailySupplySideRevenueUSD =
        dailySnapshot.dailySupplySideRevenueUSD.plus(revenueAmountUSD);
    dailySnapshot.dailyTotalRevenueUSD =
        dailySnapshot.dailyTotalRevenueUSD.plus(revenueAmountUSD);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    hourlySnapshot.hourlySupplySideRevenueUSD =
        hourlySnapshot.hourlySupplySideRevenueUSD.plus(revenueAmountUSD);
    hourlySnapshot.hourlyTotalRevenueUSD =
        hourlySnapshot.hourlyTotalRevenueUSD.plus(revenueAmountUSD);
    hourlySnapshot.save();
    (0, protocol_1.addSupplySideRevenue)(event, revenueAmountUSD);
}
exports.addMarketSupplySideRevenue = addMarketSupplySideRevenue;
function addMarketProtocolSideRevenue(event, market, revenueAmountUSD) {
    market.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD.plus(revenueAmountUSD);
    market.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD.plus(revenueAmountUSD);
    market.save();
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    dailySnapshot.dailyProtocolSideRevenueUSD =
        dailySnapshot.dailyProtocolSideRevenueUSD.plus(revenueAmountUSD);
    dailySnapshot.dailyTotalRevenueUSD =
        dailySnapshot.dailyTotalRevenueUSD.plus(revenueAmountUSD);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    hourlySnapshot.hourlyProtocolSideRevenueUSD =
        hourlySnapshot.hourlyProtocolSideRevenueUSD.plus(revenueAmountUSD);
    hourlySnapshot.hourlyTotalRevenueUSD =
        hourlySnapshot.hourlyTotalRevenueUSD.plus(revenueAmountUSD);
    hourlySnapshot.save();
    (0, protocol_1.addProtocolSideRevenue)(event, revenueAmountUSD);
}
exports.addMarketProtocolSideRevenue = addMarketProtocolSideRevenue;
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
function updateMarketTVL(event, market, isPool) {
    let inputTokenPriceUSD = market.inputTokenPriceUSD;
    let totalValueLockedUSD = constants_1.BIGDECIMAL_NEGATIVE_ONE;
    const inputToken = (0, token_1.getTokenById)(market.inputToken);
    const outputToken = (0, token_1.getTokenById)(market.outputToken);
    let marketValue = constants_1.BIGINT_ZERO; // amount of input tokens in native units
    if (isPool) {
        const poolContract = TruefiPool2_1.TruefiPool2.bind(graph_ts_1.Address.fromString(market.id));
        const tryTotalSupply = poolContract.try_totalSupply();
        if (!tryTotalSupply.reverted) {
            market.outputTokenSupply = tryTotalSupply.value;
        }
        const tryPoolValue = poolContract.try_poolValue();
        if (!tryPoolValue.reverted) {
            totalValueLockedUSD = (0, numbers_1.bigIntToBigDecimal)(tryPoolValue.value, inputToken.decimals).times(inputTokenPriceUSD);
            marketValue = tryPoolValue.value;
        }
    }
    else {
        const portfolioContract = ManagedPortfolio_1.ManagedPortfolio.bind(graph_ts_1.Address.fromString(market.id));
        const tryTotalSupply = portfolioContract.try_totalSupply();
        if (!tryTotalSupply.reverted) {
            market.outputTokenSupply = tryTotalSupply.value;
        }
        const tryPortfolioValue = portfolioContract.try_value();
        if (!tryPortfolioValue.reverted) {
            totalValueLockedUSD = (0, numbers_1.bigIntToBigDecimal)(tryPortfolioValue.value, inputToken.decimals).times(inputTokenPriceUSD);
            marketValue = tryPortfolioValue.value;
        }
    }
    if (totalValueLockedUSD.ge(constants_1.BIGDECIMAL_ZERO)) {
        const changeUSD = totalValueLockedUSD.minus(market.totalValueLockedUSD);
        (0, protocol_1.updateProtocolTVL)(event, changeUSD, changeUSD);
        if (market.outputTokenSupply.gt(constants_1.BIGINT_ZERO)) {
            market.outputTokenPriceUSD = totalValueLockedUSD.div((0, numbers_1.bigIntToBigDecimal)(market.outputTokenSupply, (0, token_1.getTokenById)(market.outputToken).decimals));
            market.inputTokenBalance = marketValue;
            // exchange rate = inputTokenBalance / outputTokenSupply
            // ie, normalize to how much inputToken for each outputToken
            market.exchangeRate = market.inputTokenBalance
                .toBigDecimal()
                .div((0, numbers_1.exponentToBigDecimal)(inputToken.decimals))
                .div(market.outputTokenSupply
                .toBigDecimal()
                .div((0, numbers_1.exponentToBigDecimal)(outputToken.decimals)));
        }
        market.totalValueLockedUSD = totalValueLockedUSD;
        market.totalDepositBalanceUSD = totalValueLockedUSD;
    }
    market.save();
}
