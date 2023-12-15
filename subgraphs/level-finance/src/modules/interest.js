"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePoolOpenInterestUSD = void 0;
function updatePoolOpenInterestUSD(pool, amountChangeUSD, isIncrease, isLong) {
    if (isLong) {
        pool.updateLongOpenInterestUSD(amountChangeUSD, isIncrease);
    }
    else {
        pool.updateShortOpenInterestUSD(amountChangeUSD, isIncrease);
    }
}
exports.updatePoolOpenInterestUSD = updatePoolOpenInterestUSD;
