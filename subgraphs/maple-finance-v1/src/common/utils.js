"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minBigInt = exports.maxBigInt = exports.minBigDecimal = exports.maxBigDecimal = exports.createEventFromCall = exports.readCallResult = exports.computeNewAverage = exports.formatUnits = exports.parseUnits = exports.powBigDecimal = exports.bigDecimalToBigInt = exports.getAssetDecimals = exports.getAssetSymbol = exports.getAssetName = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC20_1 = require("../../generated/templates/PoolFactory/ERC20");
const ERC20NameBytes_1 = require("../../generated/templates/PoolFactory/ERC20NameBytes");
const ERC20SymbolBytes_1 = require("../../generated/templates/PoolFactory/ERC20SymbolBytes");
const constants_1 = require("./constants");
// Functions designed to try...catch erc20 name/symbol/decimals to prevent errors
function getAssetName(address) {
    const contract = ERC20_1.ERC20.bind(address);
    const nameCall = contract.try_name();
    if (!nameCall.reverted) {
        return nameCall.value;
    }
    const bytesContract = ERC20NameBytes_1.ERC20NameBytes.bind(address);
    const nameBytesCall = bytesContract.try_name();
    if (!nameBytesCall.reverted) {
        return nameBytesCall.value.toString();
    }
    graph_ts_1.log.error("name() call (string or bytes) reverted for {}", [address.toHex()]);
    return "UNKNOWN";
}
exports.getAssetName = getAssetName;
function getAssetSymbol(address) {
    const contract = ERC20_1.ERC20.bind(address);
    const symbolCall = contract.try_symbol();
    if (!symbolCall.reverted) {
        return symbolCall.value;
    }
    const bytesContract = ERC20SymbolBytes_1.ERC20SymbolBytes.bind(address);
    const symbolBytesCall = bytesContract.try_symbol();
    if (!symbolBytesCall.reverted) {
        return symbolBytesCall.value.toString();
    }
    graph_ts_1.log.error("symbol() call (string or bytes) reverted for {}", [address.toHex()]);
    return "UNKNOWN";
}
exports.getAssetSymbol = getAssetSymbol;
function getAssetDecimals(address) {
    const contract = ERC20_1.ERC20.bind(address);
    const decimalsCall = contract.try_decimals();
    if (!decimalsCall.reverted) {
        return decimalsCall.value;
    }
    graph_ts_1.log.error("decimals() call reverted for {}", [address.toHex()]);
    return -1;
}
exports.getAssetDecimals = getAssetDecimals;
/**
 * Convert a big decimal to a big int represenation
 * @param input big decimal to convert
 * @returns big int representation
 */
function bigDecimalToBigInt(input) {
    const str = input.truncate(0).toString();
    return graph_ts_1.BigInt.fromString(str);
}
exports.bigDecimalToBigInt = bigDecimalToBigInt;
/**
 * Compute base^exponent
 * @param base base of the computation
 * @param exponent exponent raising base to
 * @return base^exponent
 */
function powBigDecimal(base, exponent) {
    let output = constants_1.ONE_BD;
    for (let i = 0; i < exponent; i++) {
        output = output.times(base);
    }
    return output;
}
exports.powBigDecimal = powBigDecimal;
/**
 * Parse value to BigDecimal representation with decimals (i.e compute actual value from mantissa)
 *      Ex. value = 123456789, decimal = 8 => 1.23456789
 * @param value value to parse
 * @param decimals number of decimals to parse this value with
 * @return parsed value
 */
function parseUnits(value, decimals) {
    const powerTerm = powBigDecimal(graph_ts_1.BigDecimal.fromString("10"), decimals);
    return value.toBigDecimal().div(powerTerm);
}
exports.parseUnits = parseUnits;
/**
 * Format value to BigInt representation with decimals (i.e compute mantissa)
 *      Ex. value = 1.23456789, decimal = 8 => 123456789
 * @param value
 * @param decimals
 * @return formatted value
 */
function formatUnits(value, decimals) {
    const powerTerm = powBigDecimal(constants_1.TEN_BD, decimals);
    return bigDecimalToBigInt(value.times(powerTerm));
}
exports.formatUnits = formatUnits;
/**
 * Compute the new average given an old average and count, and new value
 * @param oldAvg old average
 * @param oldCount count of entries making up the old average
 * @param newVal new value to add to the average
 * @returns new average including newVal
 */
function computeNewAverage(oldAvg, oldCount, newVal) {
    // new_avg = (old_avg * old_count + new_val) / (oldCount + 1)
    return oldAvg.times(oldCount.toBigDecimal()).plus(newVal).div(oldCount.plus(constants_1.ONE_BI).toBigDecimal());
}
exports.computeNewAverage = computeNewAverage;
/**
 * Read a contract call result, logging a warning and returing defaultValue if the call is reverted
 * @param callResult call result from contract call
 * @param defaultValue default value to use if the call reverts
 * @param functionName function name for debugging if the call fails
 * @returns call value or default if reverted
 */
function readCallResult(callResult, defaultValue, functionName = "NOT_PROVIDED") {
    if (callResult.reverted) {
        graph_ts_1.log.warning("Contact call reverted: {}", [functionName]);
    }
    return callResult.reverted ? defaultValue : callResult.value;
}
exports.readCallResult = readCallResult;
/**
 * Create an event from a call that has the same transaction and block info
 * This is used to track everything internally in terms of events
 * @param call call to create the event from
 */
function createEventFromCall(call) {
    return new graph_ts_1.ethereum.Event(call.from, constants_1.ZERO_BI, constants_1.ZERO_BI, null, call.block, call.transaction, [], null);
}
exports.createEventFromCall = createEventFromCall;
/**
 * Compute the max between a and b
 * Will return a if they are equal
 */
function maxBigDecimal(a, b) {
    return b.gt(a) ? b : a;
}
exports.maxBigDecimal = maxBigDecimal;
/**
 * Compute the max between a and b
 * Will return a if they are equal
 */
function minBigDecimal(a, b) {
    return b.lt(a) ? b : a;
}
exports.minBigDecimal = minBigDecimal;
/**
 * Compute the max between a and b
 * Will return a if they are equal
 */
function maxBigInt(a, b) {
    return b.gt(a) ? b : a;
}
exports.maxBigInt = maxBigInt;
/**
 * Compute the max between a and b
 * Will return a if they are equal
 */
function minBigInt(a, b) {
    return b.lt(a) ? b : a;
}
exports.minBigInt = minBigInt;
