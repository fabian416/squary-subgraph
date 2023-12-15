"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exponentToBigDecimal = exports.exponent = exports.bigIntToBigDecimal = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
function bigIntToBigDecimal(quantity, decimals = 18) {
    return quantity.divDecimal(graph_ts_1.BigInt.fromI32(10)
        .pow(decimals)
        .toBigDecimal());
}
exports.bigIntToBigDecimal = bigIntToBigDecimal;
// returns a^exp
function exponent(a, exp) {
    let bd = graph_ts_1.BigDecimal.fromString("1");
    const ten = graph_ts_1.BigDecimal.fromString("10");
    for (let i = 0; i < exp; i++) {
        bd = bd.times(a);
    }
    return bd;
}
exports.exponent = exponent;
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
