"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigIntToBDUseDecimals = exports.BigDecimalTruncateToBigInt = exports.decimalsToBigDecimal = exports.prefixID = exports.enumToPrefix = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
// Converts snake case to kebab case and appends a hyphen.
// (e.g. "TRADING_FEE" to "trading-fee-"), mainly used to create entity IDs
function enumToPrefix(snake) {
    return snake.replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
// Prefix an ID with a enum string in order to differentiate IDs
// e.g. combine XPOOL, TRADING_FEE and 0x1234 into xpool-trading-fee-0x1234
function prefixID(ID, enumString1, enumString2 = null) {
    let prefix = enumToPrefix(enumString1);
    if (enumString2 != null) {
        prefix += enumToPrefix(enumString2);
    }
    return prefix + ID;
}
exports.prefixID = prefixID;
// returns 10^decimals
function decimalsToBigDecimal(decimals) {
    let bd = graph_ts_1.BigDecimal.fromString("1");
    for (let i = 0; i < decimals; i++) {
        bd = bd.times(graph_ts_1.BigDecimal.fromString("10"));
    }
    return bd;
}
exports.decimalsToBigDecimal = decimalsToBigDecimal;
//convert BigDecimal to BigInt by truncating the decimal places
function BigDecimalTruncateToBigInt(x) {
    let intStr = x.toString().split(".")[0];
    return graph_ts_1.BigInt.fromString(intStr);
}
exports.BigDecimalTruncateToBigInt = BigDecimalTruncateToBigInt;
function bigIntToBDUseDecimals(quantity, decimals = 18) {
    return quantity.divDecimal(graph_ts_1.BigInt.fromI32(10)
        .pow(decimals)
        .toBigDecimal());
}
exports.bigIntToBDUseDecimals = bigIntToBDUseDecimals;
