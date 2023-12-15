"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round = exports.bigIntChangeDecimals = exports.BigDecimalTruncateToBigInt = exports.powerBigDecimal = exports.bigDecimalExponential = exports.bigIntToBDUseDecimals = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../common/constants");
function bigIntToBDUseDecimals(quantity, decimals = 18) {
    return quantity.divDecimal(graph_ts_1.BigInt.fromI32(10)
        .pow(decimals)
        .toBigDecimal());
}
exports.bigIntToBDUseDecimals = bigIntToBDUseDecimals;
function bigDecimalExponential(rate, exponent) {
    // binomial expansion to obtain (1 + x)^n : (1 + rate)^exponent
    // 1 + n *x + (n/2*(n-1))*x**2+(n/6*(n-1)*(n-2))*x**3+(n/12*(n-1)*(n-2)*(n-3))*x**4
    // this is less precise, but more efficient than `powerBigDecimal` when power is big
    const firstTerm = exponent.times(rate);
    const secondTerm = exponent
        .div(constants_1.BIGDECIMAL_TWO)
        .times(exponent.minus(constants_1.BIGDECIMAL_ONE))
        .times(rate.times(rate));
    const thirdTerm = exponent
        .div(constants_1.BIGDECIMAL_SIX)
        .times(exponent.minus(constants_1.BIGDECIMAL_TWO))
        .times(rate.times(rate).times(rate));
    const fourthTerm = exponent
        .div(constants_1.BIGDECIMAL_TWELVE)
        .times(exponent.minus(constants_1.BIGDECIMAL_THREE))
        .times(rate.times(rate).times(rate).times(rate));
    return firstTerm.plus(secondTerm).plus(thirdTerm).plus(fourthTerm);
}
exports.bigDecimalExponential = bigDecimalExponential;
// calculate the power of a BigDecimal (.pow() is not native to BigDecimal)
function powerBigDecimal(base, power) {
    let product = base;
    for (let i = 0; i < power; i++) {
        product = product.times(base);
    }
    return product;
}
exports.powerBigDecimal = powerBigDecimal;
//convert BigDecimal to BigInt by truncating the decimal places
function BigDecimalTruncateToBigInt(x) {
    return graph_ts_1.BigInt.fromString(x.truncate(0).toString());
}
exports.BigDecimalTruncateToBigInt = BigDecimalTruncateToBigInt;
//change number of decimals for BigInt
function bigIntChangeDecimals(x, from, to) {
    let result = x;
    if (to == from) {
        return result;
    }
    else if (to > from) {
        // increase number of decimals
        const diffMagnitude = graph_ts_1.BigInt.fromI32(10).pow((to - from));
        result = x.times(diffMagnitude);
    }
    else if (to < from) {
        // decrease number of decimals
        const diffMagnitude = graph_ts_1.BigInt.fromI32(10)
            .pow((from - to))
            .toBigDecimal();
        const xBD = x.divDecimal(diffMagnitude);
        result = BigDecimalTruncateToBigInt(xBD);
    }
    return result;
}
exports.bigIntChangeDecimals = bigIntChangeDecimals;
function round(numberToRound) {
    const parsedNumber = parseFloat(numberToRound.toString());
    const roundedNumber = Math.ceil((parsedNumber + Number.EPSILON) * 100) / 100;
    return graph_ts_1.BigDecimal.fromString(roundedNumber.toString());
}
exports.round = round;
