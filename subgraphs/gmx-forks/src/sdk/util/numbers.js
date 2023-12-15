"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolArraySort = exports.safeDivide = exports.calculateMedian = exports.calculateAverage = exports.exponentToBigDecimal = exports.bigDecimalToBigInt = exports.bigIntToBigDecimal = void 0;
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
function poolArraySort(ref, arr1, arr2, arr3, arr4, arr5, arr6, arr7, arr8, arr9, arr10) {
    if (ref.length != arr1.length ||
        ref.length != arr2.length ||
        ref.length != arr3.length ||
        ref.length != arr4.length ||
        ref.length != arr5.length ||
        ref.length != arr6.length ||
        ref.length != arr7.length ||
        ref.length != arr8.length ||
        ref.length != arr9.length ||
        ref.length != arr10.length) {
        // cannot sort
        return;
    }
    const sorter = [];
    for (let i = 0; i < ref.length; i++) {
        sorter[i] = [
            ref[i].toHexString(),
            arr1[i].toString(),
            arr2[i].toString(),
            arr3[i].toString(),
            arr4[i].toString(),
            arr5[i].toString(),
            arr6[i].toString(),
            arr7[i].toString(),
            arr8[i].toString(),
            arr9[i].toString(),
            arr10[i].toString(),
        ];
    }
    sorter.sort(function (a, b) {
        if (a[0] < b[0]) {
            return -1;
        }
        return 1;
    });
    for (let i = 0; i < sorter.length; i++) {
        ref[i] = graph_ts_1.Bytes.fromHexString(sorter[i][0]);
        arr1[i] = graph_ts_1.BigInt.fromString(sorter[i][1]);
        arr2[i] = graph_ts_1.BigDecimal.fromString(sorter[i][2]);
        arr3[i] = graph_ts_1.BigInt.fromString(sorter[i][3]);
        arr4[i] = graph_ts_1.BigDecimal.fromString(sorter[i][4]);
        arr5[i] = graph_ts_1.BigInt.fromString(sorter[i][5]);
        arr6[i] = graph_ts_1.BigDecimal.fromString(sorter[i][6]);
        arr7[i] = graph_ts_1.BigInt.fromString(sorter[i][7]);
        arr8[i] = graph_ts_1.BigDecimal.fromString(sorter[i][8]);
        arr9[i] = graph_ts_1.BigInt.fromString(sorter[i][9]);
        arr10[i] = graph_ts_1.BigDecimal.fromString(sorter[i][10]);
    }
}
exports.poolArraySort = poolArraySort;
