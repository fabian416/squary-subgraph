"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.absBigDecimal = exports.isSameSign = exports.percToDec = exports.roundToWholeNumber = exports.toLowerCase = exports.toLowerCaseList = exports.toPercentage = exports.readValue = exports.toBytesArray = exports.safeDiv = exports.convertTokenToDecimal = exports.exponentToBigDecimal = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../constants");
// convert decimals
function exponentToBigDecimal(decimals) {
    let bd = constants_1.BIGDECIMAL_ONE;
    for (let i = constants_1.INT_ZERO; i < decimals; i = i + constants_1.INT_ONE) {
        bd = bd.times(constants_1.BIGDECIMAL_TEN);
    }
    return bd;
}
exports.exponentToBigDecimal = exponentToBigDecimal;
// convert emitted values to tokens count
function convertTokenToDecimal(tokenAmount, exchangeDecimals) {
    if (exchangeDecimals == constants_1.INT_ZERO) {
        return tokenAmount.toBigDecimal();
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}
exports.convertTokenToDecimal = convertTokenToDecimal;
// return 0 if denominator is 0 in division
function safeDiv(amount0, amount1) {
    if (amount1.equals(constants_1.BIGDECIMAL_ZERO)) {
        return constants_1.BIGDECIMAL_ZERO;
    }
    else {
        return amount0.div(amount1);
    }
}
exports.safeDiv = safeDiv;
// convert string array to byte array
function toBytesArray(arr) {
    const byteArr = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        byteArr[i] = graph_ts_1.Bytes.fromHexString(arr[i]);
    }
    return byteArr;
}
exports.toBytesArray = toBytesArray;
function readValue(callResult, defaultValue) {
    return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function toPercentage(n) {
    return n.div(constants_1.BIGDECIMAL_HUNDRED);
}
exports.toPercentage = toPercentage;
// Convert a list of strings to lower case
function toLowerCaseList(list) {
    const lowerCaseList = new Array(list.length);
    for (let i = 0; i < list.length; i++) {
        lowerCaseList[i] = list[i].toLowerCase();
    }
    return lowerCaseList;
}
exports.toLowerCaseList = toLowerCaseList;
function toLowerCase(string) {
    return string.toLowerCase();
}
exports.toLowerCase = toLowerCase;
// Round BigDecimal to whole number
function roundToWholeNumber(n) {
    return n.truncate(0);
}
exports.roundToWholeNumber = roundToWholeNumber;
function percToDec(percentage) {
    return percentage.div(constants_1.BIGDECIMAL_HUNDRED);
}
exports.percToDec = percToDec;
// Check if tokens are of the same sign
function isSameSign(a, b) {
    if ((a.gt(constants_1.BIGINT_ZERO) && b.gt(constants_1.BIGINT_ZERO)) ||
        (a.lt(constants_1.BIGINT_ZERO) && b.lt(constants_1.BIGINT_ZERO))) {
        return true;
    }
    return false;
}
exports.isSameSign = isSameSign;
function absBigDecimal(value) {
    if (value.lt(constants_1.BIGDECIMAL_ZERO)) {
        return value.times(constants_1.BIGDECIMAL_NEG_ONE);
    }
    return value;
}
exports.absBigDecimal = absBigDecimal;
