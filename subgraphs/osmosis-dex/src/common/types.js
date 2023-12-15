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
exports.PoolFeesType = exports.RewardsInfoType = void 0;
const constants = __importStar(require("./constants"));
class RewardsInfoType {
    constructor(rewardTokens, rewardRates) {
        this._rewardTokens = rewardTokens;
        this._rewardRates = rewardRates;
    }
    get getRewardTokens() {
        return this._rewardTokens;
    }
    get getRewardRates() {
        return this._rewardRates;
    }
    isEmpty() {
        if (this.getRewardTokens.length === 0)
            return true;
        return false;
    }
}
exports.RewardsInfoType = RewardsInfoType;
class PoolFeesType {
    constructor(tradingFee, protocolFee, lpFee) {
        this._tradingFee = tradingFee;
        this._protocolFee = protocolFee;
        this._lpFee = lpFee;
    }
    get getTradingFeeId() {
        return this._tradingFee.id;
    }
    get getProtocolFeeId() {
        return this._protocolFee.id;
    }
    get getLpFeeId() {
        return this._lpFee.id;
    }
    get getTradingFees() {
        return this._tradingFee.feePercentage.div(constants.BIGDECIMAL_HUNDRED);
    }
    get getProtocolFees() {
        return this._protocolFee.feePercentage.div(constants.BIGDECIMAL_HUNDRED);
    }
    get getLpFees() {
        return this._lpFee.feePercentage.div(constants.BIGDECIMAL_HUNDRED);
    }
    stringIds() {
        return [this.getTradingFeeId, this.getProtocolFeeId, this.getLpFeeId];
    }
}
exports.PoolFeesType = PoolFeesType;
