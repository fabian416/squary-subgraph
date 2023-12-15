"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readValue = exports.convertTokenDecimals = exports.bigIntToPercentage = exports.getTimestampInMillis = exports.getTimeInMillis = void 0;
const constants_1 = require("./constants");
function getTimeInMillis(time) {
    return time.times(constants_1.BIGINT_THOUSAND);
}
exports.getTimeInMillis = getTimeInMillis;
function getTimestampInMillis(block) {
    return block.timestamp.times(constants_1.BIGINT_THOUSAND);
}
exports.getTimestampInMillis = getTimestampInMillis;
function bigIntToPercentage(n) {
    return n.toBigDecimal().div(constants_1.BIGDECIMAL_HUNDRED);
}
exports.bigIntToPercentage = bigIntToPercentage;
function convertTokenDecimals(amount, inputDecimals, outputDecimals) {
    return amount.times(constants_1.BIGINT_TEN.pow(u8(outputDecimals))).div(constants_1.BIGINT_TEN.pow(u8(inputDecimals)));
}
exports.convertTokenDecimals = convertTokenDecimals;
function readValue(callResult, defaultValue) {
    return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
