"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardType = void 0;
class RewardType {
    constructor(strategistReward, totalSharesMinted, totalFee) {
        this._strategistReward = strategistReward;
        this._totalSharesMinted = totalSharesMinted;
        this._totalFee = totalFee;
    }
    get strategistReward() {
        return this._strategistReward;
    }
    get totalSharesMinted() {
        return this._totalSharesMinted;
    }
    get totalFee() {
        return this._totalFee;
    }
}
exports.RewardType = RewardType;
