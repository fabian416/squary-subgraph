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
exports.checkAndUpdateInputTokens = exports.getInputTokenBalancesFromContract = exports.bigIntToBigDecimal = exports.poolArraySort = exports.multiArraySort = exports.readValue = exports.enumToPrefix = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("./constants"));
const Vault_1 = require("../../generated/Vault/Vault");
function enumToPrefix(snake) {
    return snake.toLowerCase().replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
function readValue(callResult, defaultValue) {
    if (callResult.reverted)
        graph_ts_1.log.warning("[readValue] Contract call reverted", []);
    return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
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
function bigIntToBigDecimal(bigInt, decimals) {
    return bigInt.divDecimal(constants.BIGINT_TEN.pow(decimals).toBigDecimal());
}
exports.bigIntToBigDecimal = bigIntToBigDecimal;
function getInputTokenBalancesFromContract(inputTokens) {
    const vaultContract = Vault_1.Vault.bind(constants.VAULT_ADDRESS);
    const inputTokenBalances = [];
    for (let i = 0; i < inputTokens.length; i++) {
        const inputTokenBalance = readValue(vaultContract.try_tokenBalances(graph_ts_1.Address.fromBytes(inputTokens[i].id)), constants.BIGINT_ZERO);
        inputTokenBalances.push(inputTokenBalance);
    }
    return inputTokenBalances;
}
exports.getInputTokenBalancesFromContract = getInputTokenBalancesFromContract;
function checkAndUpdateInputTokens(pool, token, newTokenBalance = constants.BIGINT_ZERO) {
    if (pool.tokenExists(token))
        return;
    pool.addInputToken(token, newTokenBalance);
}
exports.checkAndUpdateInputTokens = checkAndUpdateInputTokens;
