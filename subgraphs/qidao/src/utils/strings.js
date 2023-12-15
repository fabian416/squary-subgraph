"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uppercaseNetwork = exports.prefixID = exports.enumToPrefix = exports.hexToAscii = exports.hexToNumberString = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
function hexToNumberString(hex) {
    let hexNumber = graph_ts_1.BigInt.fromI32(0);
    if (hex.startsWith("0x")) {
        hex = hex.slice(2);
    }
    for (let i = 0; i < hex.length; i += 1) {
        const character = hex.substr(hex.length - 1 - i, 1);
        const digit = parseInt(character, 16);
        if (digit) {
            hexNumber = hexNumber.plus(graph_ts_1.BigInt.fromI32(digit).times(graph_ts_1.BigInt.fromI32(16).pow(i)));
        }
    }
    return hexNumber.toString();
}
exports.hexToNumberString = hexToNumberString;
function hexToAscii(hex) {
    let output = "";
    for (let i = 0; i < hex.length; i += 2) {
        const charCode = parseInt(hex.substr(i, 2), 16);
        if (charCode) {
            output += String.fromCharCode(charCode);
        }
        // catch cases with charCode outside 32...126,
        // in which case it's probably a number...
        if (charCode && (charCode < 32 || charCode > 126)) {
            return hexToNumberString(hex);
        }
    }
    return output;
}
exports.hexToAscii = hexToAscii;
// Converts upper snake case to lower kebab case and appends a hyphen.
// (e.g. "TRADING_FEE" to "trading-fee-"), mainly used to create entity IDs
function enumToPrefix(snake) {
    return snake.toLowerCase().replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
// Prefix an ID with a enum string in order to differentiate IDs
// e.g. combine TRADING_FEE and 0x1234 into trading-fee-0x1234
function prefixID(enumString, ID) {
    return enumToPrefix(enumString) + ID;
}
exports.prefixID = prefixID;
function uppercaseNetwork(network) {
    return network.toUpperCase().replace("-", "_");
}
exports.uppercaseNetwork = uppercaseNetwork;
