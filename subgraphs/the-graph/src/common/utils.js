"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readValue = exports.convertTokenToDecimal = exports.exponentToBigDecimal = void 0;
const constants_1 = require("./constants");
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
function readValue(callResult, defaultValue) {
    return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
