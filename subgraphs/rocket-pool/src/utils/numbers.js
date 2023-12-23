"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMean = exports.wadToRay = exports.rayToWad = exports.calculateMedian = exports.calculateAverage = exports.exponentToBigDecimal = exports.bigIntToBigDecimal = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
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
// Ray is 27 decimal Wad is 18 decimal
// These functions were made for the AAVE subgraph. Visit the following link to verify that AAVE's definition for RAY units match what are needed for your protocol
// https://docs.aave.com/developers/v/2.0/glossary
function rayToWad(a) {
    const halfRatio = graph_ts_1.BigInt.fromI32(10).pow(9).div(graph_ts_1.BigInt.fromI32(2));
    return halfRatio.plus(a).div(graph_ts_1.BigInt.fromI32(10).pow(9));
}
exports.rayToWad = rayToWad;
function wadToRay(a) {
    const result = a.times(graph_ts_1.BigInt.fromI32(10).pow(9));
    return result;
}
exports.wadToRay = wadToRay;
function getMean(arr) {
    let sum = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < arr.length; i++) {
        sum = sum.plus(arr[i]);
    }
    return sum.div(graph_ts_1.BigDecimal.fromString(arr.length.toString()));
}
exports.getMean = getMean;