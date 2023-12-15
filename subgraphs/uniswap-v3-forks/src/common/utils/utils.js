"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.absBigDecimal = exports.stringToBytesList = exports.safeDivBigDecimal = exports.convertBigIntListToBigDecimalList = exports.sumBigIntList = exports.removeFromArrayNotInIndex = exports.BigDecimalAverage = exports.subtractBigIntListByIndex = exports.sumBigIntListByIndex = exports.sumBigDecimalListByIndex = exports.sumBigDecimalList = exports.bigDecimalAbs = exports.absBigIntList = exports.bigDecimalExponentiated = exports.toLowerCase = exports.subtractBigDecimalLists = exports.subtractBigIntLists = exports.safeDivBigIntToBigDecimal = exports.safeDivBigInt = exports.safeDiv = exports.convertFeeToPercent = exports.convertTokenToDecimal = exports.exponentToBigDecimalBi = exports.exponentToBigInt = exports.exponentToBigDecimal = exports.calculateFee = exports.percToDecBI = exports.percToDec = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../constants");
const pool_1 = require("../entities/pool");
function percToDec(percentage) {
    return percentage.div(constants_1.BIGDECIMAL_HUNDRED);
}
exports.percToDec = percToDec;
function percToDecBI(percentage) {
    return percentage.div(constants_1.BIGINT_HUNDRED);
}
exports.percToDecBI = percToDecBI;
function calculateFee(pool, trackedAmountUSD) {
    const tradingFee = (0, pool_1.getLiquidityPoolFee)(pool.fees[0]);
    const protocolFee = (0, pool_1.getLiquidityPoolFee)(pool.fees[1]);
    const tradingFeeAmount = trackedAmountUSD.times(percToDec(tradingFee.feePercentage));
    const protocolFeeAmount = trackedAmountUSD.times(percToDec(protocolFee.feePercentage));
    return [tradingFeeAmount, protocolFeeAmount];
}
exports.calculateFee = calculateFee;
function exponentToBigDecimal(decimals) {
    let bd = constants_1.BIGDECIMAL_ONE;
    for (let i = constants_1.INT_ZERO; i < decimals; i = i + constants_1.INT_ONE) {
        bd = bd.times(constants_1.BIGDECIMAL_TEN);
    }
    return bd;
}
exports.exponentToBigDecimal = exponentToBigDecimal;
function exponentToBigInt(decimals) {
    let bd = constants_1.BIGINT_ONE;
    for (let i = constants_1.INT_ZERO; i < decimals; i = i + constants_1.INT_ONE) {
        bd = bd.times(constants_1.BIGINT_TEN);
    }
    return bd;
}
exports.exponentToBigInt = exponentToBigInt;
function exponentToBigDecimalBi(decimals) {
    let bd = constants_1.BIGDECIMAL_ONE;
    for (let i = constants_1.BIGINT_ZERO; i.lt(decimals); i = i.plus(constants_1.BIGINT_ONE)) {
        bd = bd.times(constants_1.BIGDECIMAL_TEN);
    }
    return bd;
}
exports.exponentToBigDecimalBi = exponentToBigDecimalBi;
function convertTokenToDecimal(tokenAmount, exchangeDecimals) {
    if (exchangeDecimals == constants_1.INT_ZERO) {
        return tokenAmount.toBigDecimal();
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}
exports.convertTokenToDecimal = convertTokenToDecimal;
function convertFeeToPercent(fee) {
    return graph_ts_1.BigDecimal.fromString(fee.toString()).div(constants_1.BIGDECIMAL_TEN_THOUSAND);
}
exports.convertFeeToPercent = convertFeeToPercent;
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
// return 0 if denominator is 0 in division
function safeDivBigInt(amount0, amount1) {
    if (amount1.equals(constants_1.BIGINT_ZERO)) {
        return constants_1.BIGINT_ZERO;
    }
    else {
        return amount0.div(amount1);
    }
}
exports.safeDivBigInt = safeDivBigInt;
// Convert 2 BigInt to 2 BigDecimal and do a safe division on them
function safeDivBigIntToBigDecimal(amount0, amount1) {
    if (amount1.equals(constants_1.BIGINT_ZERO)) {
        return constants_1.BIGDECIMAL_ZERO;
    }
    else {
        return amount0.toBigDecimal().div(amount1.toBigDecimal());
    }
}
exports.safeDivBigIntToBigDecimal = safeDivBigIntToBigDecimal;
// Subtract multiple BigInt Lists from each other without using map.
function subtractBigIntLists(list1, list2) {
    const result = [];
    for (let i = 0; i < list1.length; i++) {
        result.push(list1[i].minus(list2[i]));
    }
    return result;
}
exports.subtractBigIntLists = subtractBigIntLists;
// Subtract multiple BigDecimal Lists from each other without using map.
function subtractBigDecimalLists(list1, list2) {
    const result = [];
    for (let i = 0; i < list1.length; i++) {
        result.push(list1[i].minus(list2[i]));
    }
    return result;
}
exports.subtractBigDecimalLists = subtractBigDecimalLists;
// convert list array to lowercase
function toLowerCase(list) {
    const lowerCaseList = [];
    for (let i = 0; i < list.length; i++) {
        lowerCaseList.push(list[i].toLowerCase());
    }
    return list;
}
exports.toLowerCase = toLowerCase;
function bigDecimalExponentiated(base, exponent) {
    let x = base;
    let y = constants_1.BIGDECIMAL_ONE;
    let n = exponent;
    while (n > constants_1.BIGINT_ONE) {
        if (n.mod(constants_1.BIGINT_TWO) == constants_1.BIGINT_ZERO) {
            x = x.times(x);
            n = n.div(constants_1.BIGINT_TWO);
        }
        else {
            y = y.times(x);
            x = x.times(x);
            n = n.minus(constants_1.BIGINT_ONE).div(constants_1.BIGINT_TWO);
        }
    }
    return x.times(y);
}
exports.bigDecimalExponentiated = bigDecimalExponentiated;
// Turn a list of BigInts into a list of absolute value BigInts
function absBigIntList(list) {
    const absList = [];
    for (let i = 0; i < list.length; i++) {
        absList.push(list[i].abs());
    }
    return absList;
}
exports.absBigIntList = absBigIntList;
// Get the absolute value of a BigDecimal
function bigDecimalAbs(value) {
    if (value.lt(constants_1.BIGDECIMAL_ZERO)) {
        return value.times(constants_1.BIGDECIMAL_NEG_ONE);
    }
    return value;
}
exports.bigDecimalAbs = bigDecimalAbs;
// Sum BigDecimal List
function sumBigDecimalList(list) {
    let sum = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < list.length; i++) {
        sum = sum.plus(list[i]);
    }
    return sum;
}
exports.sumBigDecimalList = sumBigDecimalList;
// Sum BigDecimal Lists of the same length by index
function sumBigDecimalListByIndex(lists) {
    const sum = new Array(lists[0].length).fill(constants_1.BIGDECIMAL_ZERO);
    for (let i = 0; i < lists.length; i++) {
        for (let j = 0; j < lists[i].length; j++) {
            sum[j] = sum[j].plus(lists[i][j]);
        }
    }
    return sum;
}
exports.sumBigDecimalListByIndex = sumBigDecimalListByIndex;
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
// Subtract BigInt Lists of same length by index
function subtractBigIntListByIndex(lists) {
    const sum = new Array(lists[0].length).fill(constants_1.BIGINT_ZERO);
    for (let i = 0; i < lists.length; i++) {
        for (let j = 0; j < lists[i].length; j++) {
            sum[j] = sum[j].minus(lists[i][j]);
        }
    }
    return sum;
}
exports.subtractBigIntListByIndex = subtractBigIntListByIndex;
// Get the average of a BigDecimal List
function BigDecimalAverage(list) {
    let sum = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < list.length; i++) {
        sum = sum.plus(list[i]);
    }
    return sum.div(graph_ts_1.BigDecimal.fromString(list.length.toString()));
}
exports.BigDecimalAverage = BigDecimalAverage;
// Get values from a list of indices and a list
function removeFromArrayNotInIndex(x, index) {
    const result = new Array(x.length - index.length);
    let j = 0;
    for (let i = 0; i < x.length; i++) {
        if (!index.includes(i)) {
            continue;
        }
        result[j] = x[i];
        j++;
    }
    return result;
}
exports.removeFromArrayNotInIndex = removeFromArrayNotInIndex;
// Sum BigInt List
function sumBigIntList(list) {
    let sum = constants_1.BIGINT_ZERO;
    for (let i = 0; i < list.length; i++) {
        sum = sum.plus(list[i]);
    }
    return sum;
}
exports.sumBigIntList = sumBigIntList;
// Convert BigIntList to BigDecimalList with token conversion
function convertBigIntListToBigDecimalList(tokens, list) {
    const result = new Array(list.length);
    for (let i = 0; i < list.length; i++) {
        result[i] = convertTokenToDecimal(list[i], tokens[i].decimals);
    }
    return result;
}
exports.convertBigIntListToBigDecimalList = convertBigIntListToBigDecimalList;
// Save div BigDecimal
function safeDivBigDecimal(numerator, denominator) {
    if (denominator.equals(constants_1.BIGDECIMAL_ZERO)) {
        return constants_1.BIGDECIMAL_ZERO;
    }
    else {
        return numerator.div(denominator);
    }
}
exports.safeDivBigDecimal = safeDivBigDecimal;
// Convert string list to Bytes list
function stringToBytesList(list) {
    const result = new Array(list.length);
    for (let i = 0; i < list.length; i++) {
        result[i] = graph_ts_1.Bytes.fromHexString(list[i]);
    }
    return result;
}
exports.stringToBytesList = stringToBytesList;
function absBigDecimal(value) {
    if (value.lt(constants_1.BIGDECIMAL_ZERO)) {
        return value.times(constants_1.BIGDECIMAL_NEG_ONE);
    }
    return value;
}
exports.absBigDecimal = absBigDecimal;
