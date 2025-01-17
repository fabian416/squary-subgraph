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
exports.increasePoolVolume = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const enums_1 = require("../sdk/protocols/perpfutures/enums");
function increasePoolVolume(pool, sizeUSDDelta, collateralTokenAddress, collateralTokenAmountDelta, transactionType, realisedPnlUSD, isRealisedPnl, sdk) {
    const collateralToken = sdk.Tokens.getOrCreateToken(collateralTokenAddress);
    if (!collateralTokenAddress.equals(constants.NULL.TYPE_ADDRESS))
        utils.checkAndUpdateInputTokens(pool, collateralToken);
    if (transactionType == enums_1.TransactionType.COLLATERAL_IN) {
        pool.addInflowVolumeByToken(collateralToken, collateralTokenAmountDelta);
        pool.addVolume(sizeUSDDelta);
    }
    if (transactionType == enums_1.TransactionType.COLLATERAL_OUT) {
        pool.addOutflowVolumeByToken(collateralToken, collateralTokenAmountDelta);
        pool.addVolume(sizeUSDDelta);
    }
    if (transactionType == enums_1.TransactionType.LIQUIDATE) {
        if (isRealisedPnl) {
            pool.addClosedInflowVolumeUSD(realisedPnlUSD);
        }
        else {
            pool.addClosedInflowVolumeByToken(collateralToken, collateralTokenAmountDelta);
        }
    }
    pool.addCumulativeVolumeByTokenAmount(collateralToken, collateralTokenAmountDelta);
}
exports.increasePoolVolume = increasePoolVolume;
