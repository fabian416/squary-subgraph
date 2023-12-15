"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aboutEqual = exports.bigIntToBDUseDecimals = exports.bigIntChangeDecimals = exports.BigDecimalTruncateToBigInt = exports.bigDecimalExponential = exports.isNullEthValue = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
function isNullEthValue(value) {
    return value == "0x0000000000000000000000000000000000000000000000000000000000000001";
}
exports.isNullEthValue = isNullEthValue;
function bigDecimalExponential(rate, exponent) {
    // binomial expansion to obtain (1 + x)^n where x = rate, n = exponent
    // 1 + n*x + (n/2*(n-1))*x**2+(n/6*(n-1)*(n-2))*x**3+(n/24*(n-1)*(n-2)*(n-3))*x**4
    // + (n/120)*(n-1)*(n-2)*(n-3)*(n-4)*x**5
    // this is less precise, but more efficient than `powerBigDecimal` when power is big
    const firstTerm = exponent.times(rate);
    const secondTerm = exponent.div(constants_1.BIGDECIMAL_TWO).times(exponent.minus(constants_1.BIGDECIMAL_ONE)).times(rate.times(rate));
    const thirdTerm = exponent
        .div(constants_1.BIGDECIMAL_SIX)
        .times(exponent.minus(constants_1.BIGDECIMAL_TWO))
        .times(exponent.minus(constants_1.BIGDECIMAL_ONE))
        .times(rate.times(rate).times(rate));
    const fourthTerm = exponent
        .div(constants_1.BIGDECIMAL_TWENTY_FOUR)
        .times(exponent.minus(constants_1.BIGDECIMAL_THREE))
        .times(exponent.minus(constants_1.BIGDECIMAL_TWO))
        .times(exponent.minus(constants_1.BIGDECIMAL_ONE))
        .times(rate.times(rate).times(rate).times(rate));
    const fifthTerm = exponent
        .div(constants_1.BIGDECIMAL_TWELVE)
        .times(exponent.minus(constants_1.BIGDECIMAL_FOUR))
        .times(exponent.minus(constants_1.BIGDECIMAL_THREE))
        .times(exponent.minus(constants_1.BIGDECIMAL_TWO))
        .times(exponent.minus(constants_1.BIGDECIMAL_ONE))
        .times(rate.times(rate).times(rate).times(rate).times(rate));
    return constants_1.BIGDECIMAL_ONE.plus(firstTerm).plus(secondTerm).plus(thirdTerm).plus(fourthTerm).plus(fifthTerm);
}
exports.bigDecimalExponential = bigDecimalExponential;
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
function bigIntToBDUseDecimals(quantity, decimals = 18) {
    return quantity.divDecimal(graph_ts_1.BigInt.fromI32(10)
        .pow(decimals)
        .toBigDecimal());
}
exports.bigIntToBDUseDecimals = bigIntToBDUseDecimals;
// return true if |x1 - x2| < precision
function aboutEqual(x1, x2, preicision) {
    if (x1.ge(x2)) {
        return x1.minus(x2).le(preicision);
    }
    else {
        return x2.minus(x1).le(preicision);
    }
    return false;
}
exports.aboutEqual = aboutEqual;
