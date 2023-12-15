"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConnection = exports.updateUsage = exports.updateShares = exports.updateVolume = exports.updateRevenue = exports.updateTVL = void 0;
const constants_1 = require("./constants");
const utils_1 = require("./utils");
function updateTVL(token, protocol, pool, amount, isBuy) {
    if (isBuy) {
        pool.inputTokenBalances = [pool.inputTokenBalances[0].plus(amount)];
    }
    else {
        pool.inputTokenBalances = [pool.inputTokenBalances[0].minus(amount)];
    }
    pool.inputTokenBalancesUSD = [
        (0, utils_1.bigIntToBigDecimal)(pool.inputTokenBalances[0]).times(token.lastPriceUSD),
    ];
    const oldPoolTVL = pool.totalValueLockedUSD;
    pool.totalValueLockedUSD = pool.inputTokenBalancesUSD[0];
    protocol.totalValueLockedUSD = protocol.totalValueLockedUSD.plus(pool.totalValueLockedUSD.minus(oldPoolTVL));
}
exports.updateTVL = updateTVL;
function updateRevenue(token, protocol, pool, subjectFeeAmount, protocolFeeAmount) {
    const subjectFeeUSD = (0, utils_1.bigIntToBigDecimal)(subjectFeeAmount).times(token.lastPriceUSD);
    const protocolFeeUSD = (0, utils_1.bigIntToBigDecimal)(protocolFeeAmount).times(token.lastPriceUSD);
    const totalFeeUSD = subjectFeeUSD.plus(protocolFeeUSD);
    pool.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD.plus(subjectFeeUSD);
    pool.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD.plus(protocolFeeUSD);
    pool.cumulativeTotalRevenueUSD =
        pool.cumulativeTotalRevenueUSD.plus(totalFeeUSD);
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(subjectFeeUSD);
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(protocolFeeUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(totalFeeUSD);
}
exports.updateRevenue = updateRevenue;
function updateVolume(token, protocol, pool, account, amount, isBuy) {
    const amountUSD = (0, utils_1.bigIntToBigDecimal)(amount).times(token.lastPriceUSD);
    if (isBuy) {
        account.cumulativeBuyVolumeUSD =
            account.cumulativeBuyVolumeUSD.plus(amountUSD);
        pool.cumulativeBuyVolumeAmount =
            pool.cumulativeBuyVolumeAmount.plus(amount);
        pool.cumulativeBuyVolumeUSD = pool.cumulativeBuyVolumeUSD.plus(amountUSD);
        protocol.cumulativeBuyVolumeUSD =
            protocol.cumulativeBuyVolumeUSD.plus(amountUSD);
    }
    else {
        account.cumulativeSellVolumeUSD =
            account.cumulativeSellVolumeUSD.plus(amountUSD);
        pool.cumulativeSellVolumeAmount =
            pool.cumulativeSellVolumeAmount.plus(amount);
        pool.cumulativeSellVolumeUSD = pool.cumulativeSellVolumeUSD.plus(amountUSD);
        protocol.cumulativeSellVolumeUSD =
            protocol.cumulativeSellVolumeUSD.plus(amountUSD);
    }
    account.cumulativeTotalVolumeUSD = account.cumulativeBuyVolumeUSD.plus(account.cumulativeSellVolumeUSD);
    account.netVolumeUSD = account.cumulativeBuyVolumeUSD.minus(account.cumulativeSellVolumeUSD);
    pool.cumulativeTotalVolumeAmount = pool.cumulativeBuyVolumeAmount.plus(pool.cumulativeSellVolumeAmount);
    pool.cumulativeTotalVolumeUSD = pool.cumulativeBuyVolumeUSD.plus(pool.cumulativeSellVolumeUSD);
    pool.netVolumeAmount = pool.cumulativeBuyVolumeAmount.minus(pool.cumulativeSellVolumeAmount);
    pool.netVolumeUSD = pool.cumulativeBuyVolumeUSD.minus(pool.cumulativeSellVolumeUSD);
    protocol.cumulativeTotalVolumeUSD = protocol.cumulativeBuyVolumeUSD.plus(protocol.cumulativeSellVolumeUSD);
    protocol.netVolumeUSD = protocol.cumulativeBuyVolumeUSD.minus(protocol.cumulativeSellVolumeUSD);
}
exports.updateVolume = updateVolume;
function updateShares(token, pool, amount, supply) {
    const amountUSD = (0, utils_1.bigIntToBigDecimal)(amount).times(token.lastPriceUSD);
    pool.supply = supply;
    pool.sharePriceAmount = amount;
    pool.sharePriceUSD = amountUSD;
}
exports.updateShares = updateShares;
function updateUsage(protocol, pool, account, isBuy, tradeID) {
    if (!account.buys.length && !account.sells.length) {
        protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
    }
    if (isBuy) {
        if (!account.buys.length) {
            protocol.cumulativeUniqueBuyers += constants_1.INT_ONE;
        }
        account.buys = (0, utils_1.addToArrayAtIndex)(account.buys, tradeID);
        account.cumulativeBuyCount += constants_1.INT_ONE;
        pool.cumulativeBuyCount += constants_1.INT_ONE;
        protocol.cumulativeBuyCount += constants_1.INT_ONE;
    }
    else {
        if (!account.sells.length) {
            protocol.cumulativeUniqueSellers += constants_1.INT_ONE;
        }
        account.sells = (0, utils_1.addToArrayAtIndex)(account.sells, tradeID);
        account.cumulativeSellCount += constants_1.INT_ONE;
        pool.cumulativeSellCount += constants_1.INT_ONE;
        protocol.cumulativeSellCount += constants_1.INT_ONE;
    }
    account.cumulativeTransactionCount += constants_1.INT_ONE;
    pool.cumulativeTransactionCount += constants_1.INT_ONE;
    protocol.cumulativeTransactionCount += constants_1.INT_ONE;
    if (!pool.traders.includes(account.id)) {
        pool.cumulativeUniqueUsers += constants_1.INT_ONE;
        pool.traders = (0, utils_1.addToArrayAtIndex)(pool.traders, account.id);
    }
    if (!account.subjects.includes(pool.id)) {
        account.subjects = (0, utils_1.addToArrayAtIndex)(account.subjects, account.id);
    }
}
exports.updateUsage = updateUsage;
function updateConnection(token, connection, shares, amount, isBuy) {
    const amountUSD = (0, utils_1.bigIntToBigDecimal)(amount).times(token.lastPriceUSD);
    if (isBuy) {
        connection.shares = connection.shares.plus(shares);
        connection.cumulativeBuyVolumeUSD =
            connection.cumulativeBuyVolumeUSD.plus(amountUSD);
        connection.cumulativeBuyCount += constants_1.INT_ONE;
    }
    else {
        connection.shares = connection.shares.minus(shares);
        connection.cumulativeSellVolumeUSD =
            connection.cumulativeSellVolumeUSD.plus(amountUSD);
        connection.cumulativeSellCount += constants_1.INT_ONE;
    }
    connection.cumulativeTotalVolumeUSD = connection.cumulativeBuyVolumeUSD.plus(connection.cumulativeSellVolumeUSD);
    connection.netVolumeUSD = connection.cumulativeBuyVolumeUSD.minus(connection.cumulativeSellVolumeUSD);
    connection.cumulativeTransactionCount += constants_1.INT_ONE;
}
exports.updateConnection = updateConnection;
