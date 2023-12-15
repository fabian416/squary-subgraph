"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketTotalBorrow = exports.getMarketTotalSupply = void 0;
const constants_1 = require("../constants");
const initializers_1 = require("./initializers");
const getMarketTotalSupply = (marketAddress) => {
    const market = (0, initializers_1.getMarket)(marketAddress);
    return market
        ._totalSupplyOnPool.times(market._reserveSupplyIndex.toBigDecimal().div(constants_1.RAY))
        .plus(market._totalSupplyInP2P.times(market._p2pSupplyIndex.toBigDecimal().div(constants_1.RAY)));
};
exports.getMarketTotalSupply = getMarketTotalSupply;
const getMarketTotalBorrow = (marketAddress) => {
    const market = (0, initializers_1.getMarket)(marketAddress);
    return market
        ._totalBorrowOnPool.times(market._reserveBorrowIndex.toBigDecimal().div(constants_1.RAY))
        .plus(market._totalBorrowInP2P.times(market._p2pBorrowIndex.toBigDecimal().div(constants_1.RAY)));
};
exports.getMarketTotalBorrow = getMarketTotalBorrow;
