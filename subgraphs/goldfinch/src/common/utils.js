"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigIntToBDUseDecimals = exports.prefixID = exports.enumToPrefix = exports.removeFromList = exports.getAddressFromConfig = exports.ceil = exports.bigDecimalToBigInt = exports.bigDecimalMax = exports.bigDecimalMin = exports.bigIntMax = exports.bigIntMin = exports.isAfterV2_2 = exports.buildId = exports.VERSION_V2_2 = exports.VERSION_BEFORE_V2_2 = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const GoldfinchConfig_1 = require("../../generated/GoldfinchConfig/GoldfinchConfig");
const constants_1 = require("./constants");
exports.VERSION_BEFORE_V2_2 = "BEFORE_V2_2";
exports.VERSION_V2_2 = "V2_2";
function buildId(event) {
    return event.transaction.hash.toHexString() + event.logIndex.toString();
}
exports.buildId = buildId;
function isAfterV2_2(timestamp) {
    return timestamp.ge(graph_ts_1.BigInt.fromString(constants_1.V2_2_MIGRATION_TIME));
}
exports.isAfterV2_2 = isAfterV2_2;
function bigIntMin(a, b) {
    if (a < b) {
        return a;
    }
    return b;
}
exports.bigIntMin = bigIntMin;
function bigIntMax(a, b) {
    if (a > b) {
        return a;
    }
    return b;
}
exports.bigIntMax = bigIntMax;
function bigDecimalMin(a, b) {
    if (a < b) {
        return a;
    }
    return b;
}
exports.bigDecimalMin = bigDecimalMin;
function bigDecimalMax(a, b) {
    if (a > b) {
        return a;
    }
    return b;
}
exports.bigDecimalMax = bigDecimalMax;
function bigDecimalToBigInt(n) {
    return graph_ts_1.BigInt.fromString(n.toString().split(".")[0]);
}
exports.bigDecimalToBigInt = bigDecimalToBigInt;
// Very silly and roundabout way to round up a BigDecimal into a BigInt. But hey, it works. This will be obsolete when/if The Graph ever implements a BigDecimal.round()
function ceil(n) {
    const float = parseFloat(n.toString());
    const cieling = Math.ceil(float);
    return graph_ts_1.BigInt.fromString(cieling.toString().split(".")[0]);
}
exports.ceil = ceil;
class ConfigBearer extends graph_ts_1.ethereum.SmartContract {
}
function getAddressFromConfig(contract, target) {
    const goldfinchConfigContract = GoldfinchConfig_1.GoldfinchConfig.bind(contract.config());
    return goldfinchConfigContract.getAddress(graph_ts_1.BigInt.fromI32(target));
}
exports.getAddressFromConfig = getAddressFromConfig;
/**
 * Takes an array and an item to be removed from the array. Returns a copy of the array with the desired item removed. If the desired item is not present in the original array, then this returns a copy of that array.
 * @param list
 * @param itemToRemove
 */
function removeFromList(list, itemToRemove) {
    const listCopy = list.slice(0);
    const index = list.indexOf(itemToRemove);
    if (index >= 0) {
        listCopy.splice(index, 1);
    }
    return listCopy;
}
exports.removeFromList = removeFromList;
// Converts snake case to kebab case and appends a hyphen.
// (e.g. "TRADING_FEE" to "trading-fee-"), mainly used to create entity IDs
function enumToPrefix(snake) {
    return `${snake.replace("_", "-")}-`;
}
exports.enumToPrefix = enumToPrefix;
// Prefix an ID with a enum string in order to differentiate IDs
// e.g. prefixID("0x1234", "XPOOL", "TRADING_FEE") = "xpool-trading-fee-0x1234"
function prefixID(ID, enumString1, enumString2 = null) {
    let prefix = enumToPrefix(enumString1);
    if (enumString2 != null) {
        prefix = `${prefix}-${enumToPrefix(enumString2)}`;
    }
    return `${prefix}-${ID}`;
}
exports.prefixID = prefixID;
function bigIntToBDUseDecimals(quantity, decimals = 18) {
    return quantity.divDecimal(graph_ts_1.BigInt.fromI32(10)
        .pow(decimals)
        .toBigDecimal());
}
exports.bigIntToBDUseDecimals = bigIntToBDUseDecimals;
