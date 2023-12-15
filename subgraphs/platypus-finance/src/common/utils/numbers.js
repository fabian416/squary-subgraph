"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMedian = exports.calculateAverage = exports.exponentToBigDecimal = exports.bigIntToBigDecimal = exports.tokenAmountToUSDAmount = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
function tokenAmountToUSDAmount(token, amount) {
    return token.lastPriceUSD.times(amount.divDecimal(graph_ts_1.BigInt.fromI32(10)
        .pow(token.decimals)
        .toBigDecimal()));
}
exports.tokenAmountToUSDAmount = tokenAmountToUSDAmount;
function bigIntToBigDecimal(quantity, decimals = 18) {
    return quantity.divDecimal(graph_ts_1.BigInt.fromI32(10)
        .pow(decimals)
        .toBigDecimal());
}
exports.bigIntToBigDecimal = bigIntToBigDecimal;
// returns 10^exp
function exponentToBigDecimal(exp) {
    let bd = graph_ts_1.BigDecimal.fromString("1");
    const ten = graph_ts_1.BigDecimal.fromString("10");
    for (let i = 0; i < exp; i++) {
        bd = bd.times(ten);
    }
    return bd;
}
exports.exponentToBigDecimal = exponentToBigDecimal;
function calculateAverage(prices) {
    let sum = graph_ts_1.BigDecimal.fromString("0");
    for (let i = 0; i < prices.length; i++) {
        sum = sum.plus(prices[i]);
    }
    return sum.div(graph_ts_1.BigDecimal.fromString(graph_ts_1.BigInt.fromI32(prices.length).toString()));
}
exports.calculateAverage = calculateAverage;
function calculateMedian(prices) {
    const sorted = prices.sort((a, b) => {
        return a.equals(b) ? 0 : a.gt(b) ? 1 : -1;
    });
    const mid = Math.ceil(sorted.length / 2);
    if (sorted.length % 2 == 0) {
        return sorted[mid].plus(sorted[mid - 1]).div(graph_ts_1.BigDecimal.fromString("2"));
    }
    return sorted[mid - 1];
}
exports.calculateMedian = calculateMedian;
