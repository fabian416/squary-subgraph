"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeDivide = exports.calculateMedian = exports.calculateAverage = exports.exponentToBigDecimal = exports.bigDecimalToBigInt = exports.bigIntToBigDecimal = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
function bigIntToBigDecimal(quantity, decimals = constants_1.DEFAULT_DECIMALS) {
    return quantity.divDecimal(constants_1.BIGINT_TEN.pow(decimals).toBigDecimal());
}
exports.bigIntToBigDecimal = bigIntToBigDecimal;
function bigDecimalToBigInt(input) {
    const str = input.truncate(0).toString();
    return graph_ts_1.BigInt.fromString(str);
}
exports.bigDecimalToBigInt = bigDecimalToBigInt;
// returns 10^exp
function exponentToBigDecimal(exp = constants_1.DEFAULT_DECIMALS) {
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
        return sorted[mid]
            .plus(sorted[mid - 1])
            .div(graph_ts_1.BigDecimal.fromString(constants_1.INT_TWO.toString()));
    }
    return sorted[mid - 1];
}
exports.calculateMedian = calculateMedian;
function safeDivide(a, b) {
    if (b == constants_1.BIGDECIMAL_ZERO)
        return constants_1.BIGDECIMAL_ZERO;
    return a.div(b);
}
exports.safeDivide = safeDivide;
