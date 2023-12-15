"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compound = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const const_1 = require("./const");
const rates_1 = require("./rates");
const math_1 = require("./math");
const BD = (n) => graph_ts_1.BigDecimal.fromString(n);
/**
 * Compounds market interest and reserve values
 * @param market Market
 * @param receipt near.ReceiptWithOutcome
 * @returns
 */
function compound(market, receipt) {
  const time_diff_ms = graph_ts_1.BigInt.fromU64(
    (0, const_1.NANOS_TO_MS)(receipt.block.header.timestampNanosec)
  ).minus(market._lastUpdateTimestamp);
  if (time_diff_ms.equals(const_1.BI_ZERO)) {
    return [const_1.BD_ZERO, const_1.BD_ZERO];
  }
  const rate = (0, rates_1.getRate)(market);
  const interestScaled = (0, math_1.bigDecimalExponential)(
    rate.minus(const_1.BD_ONE),
    time_diff_ms.toBigDecimal()
  );
  const interest = interestScaled
    .times(market._totalBorrowed)
    .minus(market._totalBorrowed)
    .truncate(0);
  if (interestScaled.equals(const_1.BD_ONE)) {
    return [const_1.BD_ZERO, const_1.BD_ZERO];
  }
  const reserved = interest
    .times(market._reserveRatio.toBigDecimal())
    .div(BD("10000"));
  market._totalReserved = market._totalReserved.plus(reserved);
  market._totalDeposited = market._totalDeposited.plus(
    interest.minus(reserved)
  );
  market._totalBorrowed = market._totalBorrowed.plus(interest);
  // update timestamp
  market._lastUpdateTimestamp = market._lastUpdateTimestamp.plus(time_diff_ms);
  // protocol revenue, supply revenue
  return [reserved, interest.minus(reserved)];
}
exports.compound = compound;
