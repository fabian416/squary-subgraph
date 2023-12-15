"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exponentToBigDecimal = exports.hexToDecimal = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
///////////////////
//// Utilities ////
///////////////////
function hexToDecimal(hex) {
    return graph_ts_1.BigInt.fromI64(parseInt(hex, 16));
}
exports.hexToDecimal = hexToDecimal;
// turn exponent into a BigDecimal number
function exponentToBigDecimal(decimals) {
    let bigDecimal = graph_ts_1.BigDecimal.fromString("1");
    for (let i = 0; i < decimals; i++) {
        bigDecimal = bigDecimal.times(graph_ts_1.BigDecimal.fromString("10"));
    }
    return bigDecimal;
}
exports.exponentToBigDecimal = exponentToBigDecimal;
