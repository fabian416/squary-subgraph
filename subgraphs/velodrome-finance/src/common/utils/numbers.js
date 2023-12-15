"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeDiv = exports.round = exports.wadToRay = exports.rayToWad = exports.calculateMedian = exports.calculateAverage = exports.bigDecimalExponential = exports.applyDecimals = exports.exponentToBigDecimal = exports.bigIntToBigDecimal = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../constants");
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
// convert emitted values to tokens count
function applyDecimals(tokenAmount, decimals) {
    if (decimals == constants_1.INT_ZERO) {
        return tokenAmount.toBigDecimal();
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(decimals));
}
exports.applyDecimals = applyDecimals;
// a fast approximation of (1 + rate)^exponent
function bigDecimalExponential(rate, exponent) {
    // binomial expansion to obtain (1 + x)^n : (1 + rate)^exponent
    // 1 + n *x + (n/2*(n-1))*x**2+(n/6*(n-1)*(n-2))*x**3+(n/12*(n-1)*(n-2)*(n-3))*x**4
    // this is less precise, but more efficient than `powerBigDecimal` when power is big
    let firstTerm = exponent.times(rate);
    let secondTerm = exponent
        .div(constants_1.BIGDECIMAL_TWO)
        .times(exponent.minus(constants_1.BIGDECIMAL_ONE))
        .times(rate.times(rate));
    let thirdTerm = exponent
        .div(BIGDECIMAL_SIX)
        .times(exponent.minus(constants_1.BIGDECIMAL_TWO))
        .times(rate.times(rate).times(rate));
    let fourthTerm = exponent
        .div(BIGDECIMAL_TWELVE)
        .times(exponent.minus(BIGDECIMAL_THREE))
        .times(rate
        .times(rate)
        .times(rate)
        .times(rate));
    return firstTerm
        .plus(secondTerm)
        .plus(thirdTerm)
        .plus(fourthTerm);
}
exports.bigDecimalExponential = bigDecimalExponential;
function calculateAverage(prices) {
    let sum = graph_ts_1.BigDecimal.fromString("0");
    for (let i = 0; i < prices.length; i++) {
        sum = sum.plus(prices[i]);
    }
    return sum.div(graph_ts_1.BigDecimal.fromString(graph_ts_1.BigInt.fromI32(prices.length).toString()));
}
exports.calculateAverage = calculateAverage;
function calculateMedian(prices) {
    let sorted = prices.sort((a, b) => {
        return a.equals(b) ? 0 : a.gt(b) ? 1 : -1;
    });
    let mid = Math.ceil(sorted.length / 2);
    if (sorted.length % 2 == 0) {
        return sorted[mid].plus(sorted[mid - 1]).div(graph_ts_1.BigDecimal.fromString("2"));
    }
    return sorted[mid - 1];
}
exports.calculateMedian = calculateMedian;
// Ray is 27 decimal Wad is 18 decimal
// These functions were made for the AAVE subgraph. Visit the following link to verify that AAVE's definition for RAY units match what are needed for your protocol
// https://docs.aave.com/developers/v/2.0/glossary
function rayToWad(a) {
    const halfRatio = graph_ts_1.BigInt.fromI32(10)
        .pow(9)
        .div(graph_ts_1.BigInt.fromI32(2));
    return halfRatio.plus(a).div(graph_ts_1.BigInt.fromI32(10).pow(9));
}
exports.rayToWad = rayToWad;
function wadToRay(a) {
    const result = a.times(graph_ts_1.BigInt.fromI32(10).pow(9));
    return result;
}
exports.wadToRay = wadToRay;
function round(numberToRound) {
    let parsedNumber = parseFloat(numberToRound.toString());
    let roundedNumber = Math.ceil((parsedNumber + Number.EPSILON) * 100) / 100;
    return graph_ts_1.BigDecimal.fromString(roundedNumber.toString());
}
exports.round = round;
function safeDiv(numerator, denominator) {
    let result = constants_1.BIGDECIMAL_ZERO;
    if (denominator != constants_1.BIGDECIMAL_ZERO) {
        result = numerator.div(denominator);
    }
    return result;
}
exports.safeDiv = safeDiv;
