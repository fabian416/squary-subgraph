"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateRate = void 0;
const schema_1 = require("../../generated/schema");
const const_1 = require("../utils/const");
function getOrCreateRate(market, side, interval = null, receipt = null) {
  let id = side
    .concat("-")
    .concat(const_1.InterestRateType.VARIABLE)
    .concat("-")
    .concat(market.id);
  if (receipt && interval) {
    let timeInterval;
    if (interval == const_1.IntervalType.DAILY) {
      timeInterval = (0, const_1.NANOS_TO_DAY)(
        receipt.block.header.timestampNanosec
      ).toString();
    } else {
      timeInterval = (0, const_1.NANOS_TO_HOUR)(
        receipt.block.header.timestampNanosec
      ).toString();
    }
    id = id.concat("-").concat(timeInterval);
  }
  let rate = schema_1.InterestRate.load(id);
  if (!rate) {
    rate = new schema_1.InterestRate(id);
    rate.side = side;
    rate.type = const_1.InterestRateType.VARIABLE;
  }
  return rate;
}
exports.getOrCreateRate = getOrCreateRate;
