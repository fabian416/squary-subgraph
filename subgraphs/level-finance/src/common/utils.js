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
exports.calculateFundingRate = exports.roundToWholeNumber = exports.getOutputTokenSupply = exports.getOutputTokenPrice = exports.getLpTokenSupply = exports.checkAndUpdateInputTokens = exports.bigIntToBigDecimal = exports.poolArraySort = exports.multiArraySort = exports.readValue = exports.equalsIgnoreCase = exports.enumToPrefix = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("./constants"));
const initializers_1 = require("./initializers");
const LpToken_1 = require("../../generated/Pool/LpToken");
function enumToPrefix(snake) {
    return snake.toLowerCase().replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
function equalsIgnoreCase(a, b) {
    return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
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
function checkAndUpdateInputTokens(pool, token, newTokenBalance = constants.BIGINT_ZERO) {
    if (pool.tokenExists(token))
        return;
    pool.addInputToken(token, newTokenBalance);
}
exports.checkAndUpdateInputTokens = checkAndUpdateInputTokens;
function getLpTokenSupply(trancheAddress) {
    const lpTokenContract = LpToken_1.LpToken.bind(trancheAddress);
    const totalSupply = readValue(lpTokenContract.try_totalSupply(), constants.BIGINT_ZERO);
    return totalSupply;
}
exports.getLpTokenSupply = getLpTokenSupply;
function getOutputTokenPrice(pool) {
    const tranchesAddresses = pool.pool._tranches;
    if (!tranchesAddresses)
        return constants.BIGDECIMAL_ZERO;
    let pricesSum = constants.BIGDECIMAL_ZERO;
    for (let i = 0; i < tranchesAddresses.length; i++) {
        const tranche = (0, initializers_1.getOrCreateTranche)(tranchesAddresses[i]);
        pricesSum = pricesSum.plus(tranche.tvl.div(bigIntToBigDecimal(tranche.totalSupply, constants.DEFAULT_DECIMALS)));
    }
    if (tranchesAddresses.length <= 0)
        return constants.BIGDECIMAL_ZERO;
    return pricesSum.div(graph_ts_1.BigDecimal.fromString(tranchesAddresses.length.toString()));
}
exports.getOutputTokenPrice = getOutputTokenPrice;
function getOutputTokenSupply(pool) {
    const tranchesAddresses = pool.pool._tranches;
    let totalSupply = constants.BIGINT_ZERO;
    for (let i = 0; i < tranchesAddresses.length; i++) {
        const tranche = (0, initializers_1.getOrCreateTranche)(tranchesAddresses[i]);
        totalSupply = totalSupply.plus(tranche.totalSupply);
    }
    if (tranchesAddresses.length <= 0)
        return constants.BIGINT_ZERO;
    return totalSupply;
}
exports.getOutputTokenSupply = getOutputTokenSupply;
function roundToWholeNumber(n) {
    return n.truncate(0);
}
exports.roundToWholeNumber = roundToWholeNumber;
function calculateFundingRate(borrowedAssetUSD, totalAssetUSD) {
    return borrowedAssetUSD
        .div(totalAssetUSD)
        .times(constants.FUNDING_RATE_PRECISION);
}
exports.calculateFundingRate = calculateFundingRate;
