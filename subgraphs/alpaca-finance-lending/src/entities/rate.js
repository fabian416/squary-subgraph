"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateInterestRateIds = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
function createBorrowerVariableRate(marketId, interestRate) {
  const id = `${constants_1.InterestRateSide.BORROWER}-${constants_1.InterestRateType.VARIABLE}-${marketId}`;
  let rate = schema_1.InterestRate.load(id);
  if (!rate) {
    rate = new schema_1.InterestRate(id);
  }
  rate.rate = interestRate;
  rate.side = constants_1.InterestRateSide.BORROWER;
  rate.type = constants_1.InterestRateType.VARIABLE;
  rate.save();
  return rate;
}
function createLenderVariableRate(marketId, interestRate) {
  const id = `${constants_1.InterestRateSide.LENDER}-${constants_1.InterestRateType.VARIABLE}-${marketId}`;
  let rate = schema_1.InterestRate.load(id);
  if (!rate) {
    rate = new schema_1.InterestRate(id);
  }
  rate.rate = interestRate;
  rate.side = constants_1.InterestRateSide.LENDER;
  rate.type = constants_1.InterestRateType.VARIABLE;
  rate.save();
  return rate;
}
function getOrCreateInterestRateIds(
  marketId,
  borrowerInterestRate,
  lenderInterestRate
) {
  return [
    createBorrowerVariableRate(marketId, borrowerInterestRate).id,
    createLenderVariableRate(marketId, lenderInterestRate).id,
  ];
}
exports.getOrCreateInterestRateIds = getOrCreateInterestRateIds;
