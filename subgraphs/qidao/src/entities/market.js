"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMarketBorrowBalance = exports.handleMarketClosingFee = exports.handleMarketRepay = exports.handleMarketBorrow = exports.handleMarketLiquidate = exports.handleMarketWithdraw = exports.handleMarketDeposit = exports.getOrCreateMarketHourlySnapshot = exports.getOrCreateMarketSnapshot = exports.createMaticMarket = exports.createERC20Market = exports.getMarket = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const erc20QiStablecoin_1 = require("../../generated/templates/Vault/erc20QiStablecoin");
const QiStablecoin_1 = require("../../generated/templates/Vault/QiStablecoin");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const price_1 = require("./price");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const rate_1 = require("./rate");
function getMarket(address) {
    const id = address.toHexString();
    return schema_1.Market.load(id);
}
exports.getMarket = getMarket;
function createERC20Market(event) {
    const id = event.address.toHexString();
    let market = schema_1.Market.load(id);
    if (!market) {
        const contract = erc20QiStablecoin_1.erc20QiStablecoin.bind(event.address);
        const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
        market = new schema_1.Market(id);
        market.protocol = protocol.id;
        market.name = contract.name();
        market.isActive = true;
        market.canUseAsCollateral = true;
        market.canBorrowFrom = true;
        market.inputToken = (0, token_1.getOrCreateToken)(contract.collateral()).id;
        market.rates = [(0, rate_1.getOrCreateStableBorrowerInterestRate)(id).id];
        market.createdTimestamp = event.block.timestamp;
        market.createdBlockNumber = event.block.number;
        // Set liquidationPenalty to 10 by default, in case it can't be read from contract
        market.liquidationPenalty = constants_1.BIGDECIMAL_TEN;
        // Read LTV and liquidationPenalty from contract
        updateMetadata(market, contract);
        market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        market.inputTokenBalance = constants_1.BIGINT_ZERO;
        market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.outputTokenSupply = constants_1.BIGINT_ZERO;
        market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalPoolCount += 1;
        protocol.save();
        market.save();
    }
}
exports.createERC20Market = createERC20Market;
function createMaticMarket(event) {
    const id = event.address.toHexString();
    let market = schema_1.Market.load(id);
    if (!market) {
        const contract = QiStablecoin_1.QiStablecoin.bind(event.address);
        const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
        market = new schema_1.Market(id);
        market.protocol = protocol.id;
        market.name = contract.name();
        market.isActive = true;
        market.canUseAsCollateral = true;
        market.canBorrowFrom = true;
        market.liquidationThreshold = constants_1.MATIC_MAXIMUM_LTV;
        market.maximumLTV = constants_1.MATIC_MAXIMUM_LTV;
        market.liquidationPenalty = constants_1.BIGDECIMAL_TEN;
        market.inputToken = (0, token_1.getOrCreateToken)(constants_1.MATIC_ADDRESS).id;
        market.rates = [(0, rate_1.getOrCreateStableBorrowerInterestRate)(id).id];
        market.createdTimestamp = event.block.timestamp;
        market.createdBlockNumber = event.block.number;
        market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        market.inputTokenBalance = constants_1.BIGINT_ZERO;
        market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.outputTokenSupply = constants_1.BIGINT_ZERO;
        market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalPoolCount += 1;
        protocol.save();
        market.save();
    }
}
exports.createMaticMarket = createMaticMarket;
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
        marketSnapshot.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    }
    marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketSnapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketSnapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketSnapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
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
        marketSnapshot.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    }
    marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketSnapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketSnapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketSnapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
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
function handleMarketDeposit(event, market, deposit, token) {
    const amount = deposit.amount;
    const amountUSD = deposit.amountUSD;
    market.inputTokenBalance = market.inputTokenBalance.plus(amount);
    updateTVL(event, market, token);
    market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(amountUSD);
    market.save();
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    dailySnapshot.dailyDepositUSD = dailySnapshot.dailyDepositUSD.plus(amountUSD);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    hourlySnapshot.hourlyDepositUSD =
        hourlySnapshot.hourlyDepositUSD.plus(amountUSD);
    hourlySnapshot.save();
    (0, protocol_1.addProtocolDepositVolume)(event, amountUSD);
}
exports.handleMarketDeposit = handleMarketDeposit;
function handleMarketWithdraw(event, market, withdraw, token) {
    const amount = withdraw.amount;
    const amountUSD = withdraw.amountUSD;
    market.inputTokenBalance = market.inputTokenBalance.minus(amount);
    updateTVL(event, market, token);
    market.save();
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    const financialSnapshot = (0, protocol_1.getOrCreateFinancialsSnapshot)(event, protocol);
    financialSnapshot.dailyWithdrawUSD =
        financialSnapshot.dailyWithdrawUSD.plus(amountUSD);
    financialSnapshot.save();
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    dailySnapshot.dailyWithdrawUSD =
        dailySnapshot.dailyWithdrawUSD.plus(amountUSD);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    hourlySnapshot.hourlyWithdrawUSD =
        hourlySnapshot.hourlyWithdrawUSD.plus(amountUSD);
    hourlySnapshot.save();
}
exports.handleMarketWithdraw = handleMarketWithdraw;
function handleMarketLiquidate(event, market, liquidate, token) {
    const amount = liquidate.amount;
    const amountUSD = liquidate.amountUSD;
    market.inputTokenBalance = market.inputTokenBalance.minus(amount);
    updateTVL(event, market, token);
    market.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD.plus(amountUSD);
    updateMetadata(market);
    market.save();
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    dailySnapshot.dailyLiquidateUSD =
        dailySnapshot.dailyLiquidateUSD.plus(amountUSD);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    hourlySnapshot.hourlyLiquidateUSD =
        hourlySnapshot.hourlyLiquidateUSD.plus(amountUSD);
    hourlySnapshot.save();
    (0, protocol_1.addProtocolLiquidateVolume)(event, amountUSD);
}
exports.handleMarketLiquidate = handleMarketLiquidate;
function handleMarketBorrow(event, market, borrow) {
    const amountUSD = borrow.amountUSD;
    market.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD.plus(amountUSD);
    market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(amountUSD);
    market.save();
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    dailySnapshot.dailyBorrowUSD = dailySnapshot.dailyBorrowUSD.plus(amountUSD);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    hourlySnapshot.hourlyBorrowUSD =
        hourlySnapshot.hourlyBorrowUSD.plus(amountUSD);
    hourlySnapshot.save();
    (0, protocol_1.addProtocolBorrowVolume)(event, amountUSD);
    (0, protocol_1.updateProtocolBorrowBalance)(event, amountUSD);
}
exports.handleMarketBorrow = handleMarketBorrow;
function handleMarketRepay(event, market, repay) {
    const amountUSD = repay.amountUSD;
    updateMarketBorrowBalance(event, market, constants_1.BIGDECIMAL_ZERO.minus(repay.amountUSD));
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    const financialSnapshot = (0, protocol_1.getOrCreateFinancialsSnapshot)(event, protocol);
    financialSnapshot.dailyRepayUSD =
        financialSnapshot.dailyRepayUSD.plus(amountUSD);
    financialSnapshot.save();
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    dailySnapshot.dailyRepayUSD = dailySnapshot.dailyRepayUSD.plus(amountUSD);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    hourlySnapshot.hourlyRepayUSD = hourlySnapshot.hourlyRepayUSD.plus(amountUSD);
    hourlySnapshot.save();
}
exports.handleMarketRepay = handleMarketRepay;
function handleMarketClosingFee(event, market, feeAmount, token) {
    const feeAmountUSD = (0, numbers_1.bigIntToBigDecimal)(feeAmount, token.decimals).times((0, price_1.getCollateralPrice)(event, event.address, token));
    market.inputTokenBalance = market.inputTokenBalance.minus(feeAmount);
    updateTVL(event, market, token);
    (0, protocol_1.addProtocolSideRevenue)(event, market, feeAmountUSD);
}
exports.handleMarketClosingFee = handleMarketClosingFee;
function updateMarketBorrowBalance(event, market, changeUSD) {
    market.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD.plus(changeUSD);
    market.save();
    getOrCreateMarketSnapshot(event, market);
    getOrCreateMarketHourlySnapshot(event, market);
    (0, protocol_1.updateProtocolBorrowBalance)(event, changeUSD);
}
exports.updateMarketBorrowBalance = updateMarketBorrowBalance;
function updateTVL(event, market, token) {
    if (!token.lastPriceUSD) {
        return;
    }
    market.inputTokenPriceUSD = token.lastPriceUSD;
    const totalValueLocked = (0, numbers_1.bigIntToBigDecimal)(market.inputTokenBalance, token.decimals).times(market.inputTokenPriceUSD);
    (0, protocol_1.updateProtocolTVL)(event, totalValueLocked.minus(market.totalValueLockedUSD));
    market.totalValueLockedUSD = totalValueLocked;
    market.totalDepositBalanceUSD = totalValueLocked;
}
function updateMetadata(market, contract = null) {
    if (market.inputToken == constants_1.MATIC_ADDRESS.toHexString()) {
        // No set/get functions in contract
        return;
    }
    if (contract == null) {
        contract = erc20QiStablecoin_1.erc20QiStablecoin.bind(graph_ts_1.Address.fromString(market.id));
    }
    const minCollateralPercent = contract.try__minimumCollateralPercentage();
    if (!minCollateralPercent.reverted) {
        const maximumLTV = constants_1.BIGDECIMAL_HUNDRED.div(minCollateralPercent.value.toBigDecimal()).times(constants_1.BIGDECIMAL_HUNDRED);
        market.maximumLTV = maximumLTV;
        market.liquidationThreshold = maximumLTV;
    }
    const gainRatio = contract.try_gainRatio();
    if (!gainRatio.reverted) {
        const decimals = gainRatio.value.toString().length - 1;
        const liquidationPenalty = (0, numbers_1.bigIntToBigDecimal)(gainRatio.value, decimals)
            .times(constants_1.BIGDECIMAL_HUNDRED)
            .minus(constants_1.BIGDECIMAL_HUNDRED);
        market.liquidationPenalty = liquidationPenalty;
    }
}
