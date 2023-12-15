"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigDecimalExponential = void 0;
const const_1 = require("./const");
// a fast approximation of (1 + rate)^exponent
function bigDecimalExponential(rate, exponent) {
  // binomial expansion to obtain (1 + x)^n : (1 + rate)^exponent
  // 1 + n *x + (n/2*(n-1))*x**2+(n/6*(n-1)*(n-2))*x**3+(n/12*(n-1)*(n-2)*(n-3))*x**4
  // this is less precise, but more efficient than `powerBigDecimal` when power is big
  const firstTerm = exponent.times(rate);
  const secondTerm = exponent
    .div(const_1.BIGDECIMAL_TWO)
    .times(exponent.minus(const_1.BIGDECIMAL_ONE))
    .times(rate.times(rate));
  const thirdTerm = exponent
    .div(const_1.BIGDECIMAL_SIX)
    .times(exponent.minus(const_1.BIGDECIMAL_TWO))
    .times(rate.times(rate).times(rate));
  const fourthTerm = exponent
    .div(const_1.BIGDECIMAL_TWELVE)
    .times(exponent.minus(const_1.BIGDECIMAL_THREE))
    .times(rate.times(rate).times(rate).times(rate));
  return const_1.BD_ONE.plus(firstTerm)
    .plus(secondTerm)
    .plus(thirdTerm)
    .plus(fourthTerm);
}
exports.bigDecimalExponential = bigDecimalExponential;
