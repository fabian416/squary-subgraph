"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInterestRates = exports.createLenderStableRate = exports.createBorrowerStableRate = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
function createBorrowerStableRate(marketId, interestRate, timestamp) {
    const rate = new schema_1.InterestRate(`${constants_1.InterestRateSide.BORROWER}-${constants_1.InterestRateType.STABLE}-${marketId}-${timestamp}`);
    rate.rate = interestRate;
    rate.side = constants_1.InterestRateSide.BORROWER;
    rate.type = constants_1.InterestRateType.STABLE;
    rate.save();
    return rate;
}
exports.createBorrowerStableRate = createBorrowerStableRate;
function createLenderStableRate(marketId, interestRate, timestamp) {
    const rate = new schema_1.InterestRate(`${constants_1.InterestRateSide.LENDER}-${constants_1.InterestRateType.STABLE}-${marketId}-${timestamp}`);
    rate.rate = interestRate;
    rate.side = constants_1.InterestRateSide.LENDER;
    rate.type = constants_1.InterestRateType.STABLE;
    rate.save();
    return rate;
}
exports.createLenderStableRate = createLenderStableRate;
function createInterestRates(marketId, borrowerInterestRate, timestamp) {
    return [
        createBorrowerStableRate(marketId, borrowerInterestRate, timestamp).id,
        createLenderStableRate(marketId, borrowerInterestRate.times(constants_1.BIGDECIMAL_ONE.minus(constants_1.PROTOCOL_FEE_PERCENT)), timestamp).id,
    ];
}
exports.createInterestRates = createInterestRates;
