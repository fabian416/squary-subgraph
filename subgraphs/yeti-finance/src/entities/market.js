"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMarketBorrowVolume = exports.addMarketLiquidateVolume = exports.addMarketDepositVolume = exports.setMarketAssetBalance = exports.setMarketYUSDDebt = exports.getOrCreateMarketHourlySnapshot = exports.getOrCreateMarketSnapshot = exports.getOrCreateMarket = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const numbers_1 = require("../utils/numbers");
const rate_1 = require("./rate");
const price_1 = require("../utils/price");
function getOrCreateMarket(tokenAddr) {
    let market = schema_1.Market.load(constants_1.ACTIVE_POOL + "-" + tokenAddr.toHexString());
    if (!market) {
        market = new schema_1.Market(constants_1.ACTIVE_POOL + "-" + tokenAddr.toHexString());
        const token = (0, token_1.getOrCreateToken)(tokenAddr);
        market.protocol = (0, protocol_1.getOrCreateYetiProtocol)().id;
        market.name = token.name;
        market.isActive = true;
        market.canUseAsCollateral = true;
        market.canBorrowFrom = true;
        market.maximumLTV = constants_1.MAXIMUM_LTV;
        market.liquidationThreshold = constants_1.MAXIMUM_LTV;
        market.liquidationPenalty = constants_1.LIQUIDATION_FEE;
        market.inputToken = token.id;
        market.inputTokenBalance = constants_1.BIGINT_ZERO;
        market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.outputTokenSupply = constants_1.BIGINT_ZERO;
        market.rates = [(0, rate_1.getOrCreateStableBorrowerInterestRate)(constants_1.ACTIVE_POOL).id];
        market.createdTimestamp = constants_1.ACTIVE_POOL_CREATED_TIMESTAMP;
        market.createdBlockNumber = constants_1.ACTIVE_POOL_CREATED_BLOCK;
        market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.save();
    }
    return market;
}
exports.getOrCreateMarket = getOrCreateMarket;
function getOrCreateMarketSnapshot(event, market) {
    const day = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const id = `${market.id}-${day}`;
    let marketSnapshot = schema_1.MarketDailySnapshot.load(id);
    if (!marketSnapshot) {
        marketSnapshot = new schema_1.MarketDailySnapshot(id);
        marketSnapshot.protocol = market.protocol;
        marketSnapshot.market = market.id;
        marketSnapshot.rates = market.rates;
        marketSnapshot.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
    }
    marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketSnapshot.inputTokenBalance = market.inputTokenBalance;
    marketSnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketSnapshot.outputTokenSupply = market.outputTokenSupply;
    marketSnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
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
        marketSnapshot.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
    }
    marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketSnapshot.inputTokenBalance = market.inputTokenBalance;
    marketSnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketSnapshot.outputTokenSupply = market.outputTokenSupply;
    marketSnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketSnapshot.blockNumber = event.block.number;
    marketSnapshot.timestamp = event.block.timestamp;
    marketSnapshot.save();
    return marketSnapshot;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
function setMarketYUSDDebt(event, debtYUSD) {
    const debtUSD = (0, numbers_1.bigIntToBigDecimal)(debtYUSD);
    (0, protocol_1.updateProtocolBorrowBalance)(event, debtUSD, debtYUSD);
}
exports.setMarketYUSDDebt = setMarketYUSDDebt;
function setMarketAssetBalance(event, balance, tokenAddr) {
    const tokenPrice = (0, price_1.getUSDPrice)(tokenAddr);
    const token = (0, token_1.getOrCreateToken)(tokenAddr);
    const balanceUSD = tokenPrice
        .times(balance.toBigDecimal())
        .div(constants_1.BIGINT_TEN.pow(token.decimals).toBigDecimal());
    const market = getOrCreateMarket(tokenAddr);
    const netChangeUSD = balanceUSD.minus(market.totalValueLockedUSD);
    market.totalValueLockedUSD = balanceUSD;
    market.totalDepositBalanceUSD = balanceUSD;
    market.inputTokenBalance = balance;
    market.inputTokenPriceUSD = tokenPrice;
    market.save();
    getOrCreateMarketSnapshot(event, market);
    getOrCreateMarketHourlySnapshot(event, market);
    (0, protocol_1.updateProtocolUSDLocked)(event, netChangeUSD);
}
exports.setMarketAssetBalance = setMarketAssetBalance;
function addMarketDepositVolume(event, depositedUSD, token) {
    const market = getOrCreateMarket(token);
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
function addMarketLiquidateVolume(event, liquidatedUSD, token) {
    const market = getOrCreateMarket(token);
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
function addMarketBorrowVolume(event, borrowedUSD, token) {
    const market = getOrCreateMarket(token);
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
