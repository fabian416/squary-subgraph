"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiArraySort =
  exports.wadToRay =
  exports.rayToWad =
  exports.insert =
  exports.calculateMedian =
  exports.calculateAverage =
  exports.exponentToBigDecimal =
  exports.convertTokenToDecimal =
  exports.bigDecimalToBigInt =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
function bigDecimalToBigInt(input) {
  const str = input.truncate(0).toString();
  return graph_ts_1.BigInt.fromString(str);
}
exports.bigDecimalToBigInt = bigDecimalToBigInt;
// convert emitted values to tokens count
function convertTokenToDecimal(tokenAmount, exchangeDecimals = 18) {
  if (exchangeDecimals == constants_1.INT_ZERO) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}
exports.convertTokenToDecimal = convertTokenToDecimal;
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
  return sum.div(
    graph_ts_1.BigDecimal.fromString(
      graph_ts_1.BigInt.fromI32(prices.length).toString()
    )
  );
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
      .div(graph_ts_1.BigDecimal.fromString("2"));
  }
  return sorted[mid - 1];
}
exports.calculateMedian = calculateMedian;
// insert value into arr at index
function insert(arr, index, value) {
  const result = [];
  for (let i = 0; i < index; i++) {
    result.push(arr[i]);
  }
  result.push(value);
  for (let i = index; i < arr.length; i++) {
    result.push(arr[i]);
  }
  return result;
}
exports.insert = insert;
// Ray is 27 decimal Wad is 18 decimal
// These functions were made for the AAVE subgraph. Visit the following link to verify that AAVE's definition for RAY units match what are needed for your protocol
// https://docs.aave.com/developers/v/2.0/glossary
function rayToWad(a) {
  const halfRatio = graph_ts_1.BigInt.fromI32(10)
    .pow(9)
    .div(graph_ts_1.BigInt.fromI32(2));
  return halfRatio.plus(a).div(graph_ts_1.BigInt.fromI32(10).pow(9));
}
exports.rayToWad = rayToWad;
function wadToRay(a) {
  const result = a.times(graph_ts_1.BigInt.fromI32(10).pow(9));
  return result;
}
exports.wadToRay = wadToRay;
function multiArraySort(ref, arr1, arr2) {
  if (ref.length != arr1.length || ref.length != arr2.length) {
    // cannot sort
    return;
  }
  const sorter = [];
  for (let i = 0; i < ref.length; i++) {
    sorter[i] = [ref[i].toHexString(), arr1[i].toString(), arr2[i].toString()];
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
  }
}
exports.multiArraySort = multiArraySort;
