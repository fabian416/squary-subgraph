"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateStableBorrowerInterestRate = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
function getOrCreateStableBorrowerInterestRate(marketID) {
    const rate = new schema_1.InterestRate(`${constants_1.InterestRateSide.BORROWER}-${constants_1.InterestRateType.STABLE}-${marketID}`);
    rate.rate = constants_1.BIGDECIMAL_ZERO;
    rate.side = constants_1.InterestRateSide.BORROWER;
    rate.type = constants_1.InterestRateType.STABLE;
    rate.save();
    return rate;
}
exports.getOrCreateStableBorrowerInterestRate = getOrCreateStableBorrowerInterestRate;
