"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.amount_to_shares = void 0;
const const_1 = require("./const");
// convert token amounts to output shares
function amount_to_shares(amount, total_shares, total_amount) {
  if (total_amount.equals(const_1.BD_ZERO)) {
    return (0, const_1.BD_BI)(amount.truncate(0));
  }
  return (0, const_1.BD_BI)(
    amount.times(total_shares.toBigDecimal()).div(total_amount)
  );
}
exports.amount_to_shares = amount_to_shares;
