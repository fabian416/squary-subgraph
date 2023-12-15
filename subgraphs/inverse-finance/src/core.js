"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAccrueInterest = exports.handleLiquidateBorrow = exports.handleRepayBorrow = exports.handleBorrow = exports.handleRedeem = exports.handleMint = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./common/constants");
const helpers_1 = require("./common/helpers");
const getters_1 = require("./common/getters");
const CErc20_1 = require("../generated/Factory/CErc20");
const utils_1 = require("./common/utils");
function handleMint(event) {
    let user = event.params.minter;
    (0, helpers_1.updateDeposit)(event);
    (0, helpers_1.updateMarket)(event);
    (0, helpers_1.updateInterestRates)(event);
    (0, helpers_1.updateUsageMetrics)(event, user);
    (0, helpers_1.updateMarketMetrics)(event);
    (0, helpers_1.aggregateAllMarkets)(event);
}
exports.handleMint = handleMint;
function handleRedeem(event) {
    let user = event.params.redeemer;
    (0, helpers_1.updateWithdraw)(event);
    (0, helpers_1.updateMarket)(event);
    (0, helpers_1.updateInterestRates)(event);
    (0, helpers_1.updateUsageMetrics)(event, user);
    (0, helpers_1.updateMarketMetrics)(event);
    (0, helpers_1.aggregateAllMarkets)(event);
}
exports.handleRedeem = handleRedeem;
function handleBorrow(event) {
    let user = event.params.borrower;
    (0, helpers_1.updateBorrow)(event);
    (0, helpers_1.updateMarket)(event);
    (0, helpers_1.updateInterestRates)(event);
    (0, helpers_1.updateUsageMetrics)(event, user);
    (0, helpers_1.updateMarketMetrics)(event);
    (0, helpers_1.aggregateAllMarkets)(event);
}
exports.handleBorrow = handleBorrow;
function handleRepayBorrow(event) {
    let user = event.params.payer;
    (0, helpers_1.updateRepay)(event);
    (0, helpers_1.updateMarket)(event);
    (0, helpers_1.updateInterestRates)(event);
    (0, helpers_1.updateUsageMetrics)(event, user);
    (0, helpers_1.updateMarketMetrics)(event);
    (0, helpers_1.aggregateAllMarkets)(event);
}
exports.handleRepayBorrow = handleRepayBorrow;
function handleLiquidateBorrow(event) {
    let user = event.params.liquidator;
    (0, helpers_1.updateLiquidate)(event);
    (0, helpers_1.updateMarket)(event);
    (0, helpers_1.updateInterestRates)(event);
    (0, helpers_1.updateUsageMetrics)(event, user);
    (0, helpers_1.updateMarketMetrics)(event);
    (0, helpers_1.aggregateAllMarkets)(event);
}
exports.handleLiquidateBorrow = handleLiquidateBorrow;
function handleAccrueInterest(event) {
    let interestAccumulated = event.params.interestAccumulated;
    let tokenContract = CErc20_1.CErc20.bind(event.address);
    let reserveFactorRes = tokenContract.try_reserveFactorMantissa();
    // reserveFactor = Fraction of interest currently set aside for reserves
    let reserveFactor = constants_1.BIGDECIMAL_ZERO;
    if (reserveFactorRes.reverted) {
        graph_ts_1.log.warning("Failed to call reserveFactorMantissa for Market {} at tx hash {}", [
            event.address.toHexString(),
            event.transaction.hash.toHexString(),
        ]);
    }
    else {
        reserveFactor = reserveFactorRes.value.toBigDecimal().div((0, utils_1.decimalsToBigDecimal)(constants_1.MANTISSA_DECIMALS));
    }
    // interest is accounted in underlying token
    let pricePerToken = (0, getters_1.getUnderlyingTokenPricePerAmount)(event.address);
    let interestAccumulatedUSD = interestAccumulated.toBigDecimal().times(pricePerToken);
    let protocalRevenueUSD = interestAccumulatedUSD.times(reserveFactor);
    (0, helpers_1.updateRevenue)(event, protocalRevenueUSD, interestAccumulatedUSD);
}
exports.handleAccrueInterest = handleAccrueInterest;
