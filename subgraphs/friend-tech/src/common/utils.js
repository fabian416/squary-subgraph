"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigIntToBigDecimal = exports.getHoursSinceEpoch = exports.getDaysSinceEpoch = exports.addToArrayAtIndex = void 0;
const constants_1 = require("./constants");
function addToArrayAtIndex(x, item, index = -1) {
    if (x.length == 0) {
        return [item];
    }
    if (index == -1 || index > x.length) {
        index = x.length;
    }
    const retval = new Array();
    let i = 0;
    while (i < index) {
        retval.push(x[i]);
        i += 1;
    }
    retval.push(item);
    while (i < x.length) {
        retval.push(x[i]);
        i += 1;
    }
    return retval;
}
exports.addToArrayAtIndex = addToArrayAtIndex;
function getDaysSinceEpoch(secondsSinceEpoch) {
    return Math.floor(secondsSinceEpoch / constants_1.SECONDS_PER_DAY);
}
exports.getDaysSinceEpoch = getDaysSinceEpoch;
function getHoursSinceEpoch(secondsSinceEpoch) {
    return Math.floor(secondsSinceEpoch / constants_1.SECONDS_PER_HOUR);
}
exports.getHoursSinceEpoch = getHoursSinceEpoch;
function bigIntToBigDecimal(quantity, decimals = constants_1.ETH_DECIMALS) {
    return quantity.divDecimal(constants_1.BIGINT_TEN.pow(decimals).toBigDecimal());
}
exports.bigIntToBigDecimal = bigIntToBigDecimal;
