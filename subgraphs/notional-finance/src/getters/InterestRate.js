"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateInterestRate = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
function getOrCreateInterestRate(marketId) {
    let interestRate = schema_1.InterestRate.load("BORROWER-" + "FIXED-" + marketId);
    if (!interestRate) {
        interestRate = new schema_1.InterestRate("BORROWER-" + "FIXED-" + marketId);
        interestRate.side = constants_1.InterestRateSide.BORROWER;
        interestRate.type = constants_1.InterestRateType.FIXED;
        interestRate.rate = constants_1.BIGDECIMAL_ONE;
        interestRate.save();
    }
    return interestRate;
}
exports.getOrCreateInterestRate = getOrCreateInterestRate;
