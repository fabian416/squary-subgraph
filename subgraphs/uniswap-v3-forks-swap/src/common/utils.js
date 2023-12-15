"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sumBigIntListByIndex = exports.stringToBytesList = exports.convertFeeToPercent = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
function convertFeeToPercent(fee) {
    return graph_ts_1.BigDecimal.fromString(fee.toString()).div(constants_1.BIGDECIMAL_TEN_THOUSAND);
}
exports.convertFeeToPercent = convertFeeToPercent;
// Convert string list to Bytes list
function stringToBytesList(list) {
    const result = new Array(list.length);
    for (let i = 0; i < list.length; i++) {
        result[i] = graph_ts_1.Bytes.fromHexString(list[i]);
    }
    return result;
}
exports.stringToBytesList = stringToBytesList;
// Sum BigInt Lists of same length by index
function sumBigIntListByIndex(lists) {
    const sum = new Array(lists[0].length).fill(constants_1.BIGINT_ZERO);
    for (let i = 0; i < lists.length; i++) {
        for (let j = 0; j < lists[i].length; j++) {
            sum[j] = sum[j].plus(lists[i][j]);
        }
    }
    return sum;
}
exports.sumBigIntListByIndex = sumBigIntListByIndex;
