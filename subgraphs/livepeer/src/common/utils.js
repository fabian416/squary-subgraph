"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exponentToBigDecimal = exports.sqrtPriceX96ToTokenPrices = exports.bigIntToBigDecimal = exports.readValue = exports.safeDiv = exports.equalsIgnoreCase = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("./constants"));
function equalsIgnoreCase(a, b) {
    return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
function safeDiv(amount0, amount1) {
    if (amount1.equals(constants.BIGDECIMAL_ZERO)) {
        return constants.BIGDECIMAL_ZERO;
    }
    else {
        return amount0.div(amount1);
    }
}
exports.safeDiv = safeDiv;
function readValue(callResult, defaultValue) {
    if (callResult.reverted)
        graph_ts_1.log.warning("[readValue] Contract call reverted", []);
    return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function bigIntToBigDecimal(bigInt, decimals) {
    return bigInt.divDecimal(constants.BIGINT_TEN.pow(decimals).toBigDecimal());
}
exports.bigIntToBigDecimal = bigIntToBigDecimal;
function sqrtPriceX96ToTokenPrices(sqrtPriceX96, token0Decimals, token1Decimals) {
    const num = sqrtPriceX96.times(sqrtPriceX96).toBigDecimal();
    const denom = constants.QI92;
    const price1 = num
        .div(denom)
        .times(exponentToBigDecimal(token0Decimals))
        .div(exponentToBigDecimal(token1Decimals));
    const price0 = safeDiv(constants.BIGDECIMAL_ONE, price1);
    return [price0, price1];
}
exports.sqrtPriceX96ToTokenPrices = sqrtPriceX96ToTokenPrices;
function exponentToBigDecimal(decimals) {
    let bd = constants.BIGDECIMAL_ONE;
    for (let i = constants.BIGINT_ZERO; i.lt(decimals); i = i.plus(constants.BIGINT_ONE)) {
        bd = bd.times(constants.BIGDECIMAL_TEN);
    }
    return bd;
}
exports.exponentToBigDecimal = exponentToBigDecimal;
