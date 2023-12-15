"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApr = exports.getRate = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const const_1 = require("./const");
const math_1 = require("./math");
const rates_1 = require("../helpers/rates");
const BD = (n) => graph_ts_1.BigDecimal.fromString(n);
function getRate(market) {
  if (
    market._totalReserved.plus(market._totalDeposited).equals(const_1.BD_ZERO)
  ) {
    return const_1.BD_ONE;
  }
  const pos = market._totalBorrowed.div(
    market._totalReserved.plus(market._totalDeposited)
  );
  market._utilization = pos;
  const target = market._targetUtilization.toBigDecimal().div(BD("10000"));
  let rate = const_1.BD_ZERO;
  if (pos.le(target)) {
    // BigDecimal::one() + pos * (BigDecimal::from(self._targetUtilizationRate) - BigDecimal::one())/ target_utilization
    const highPos = market._targetUtilizationRate
      .toBigDecimal()
      .div(BD("1000000000000000000000000000"))
      .minus(const_1.BD_ONE)
      .div(target);
    rate = const_1.BD_ONE.plus(pos.times(highPos));
  } else {
    // BigDecimal::from(self._targetUtilizationRate) +
    // (pos - target_utilization) * (BigDecimal::from(self.max_utilization_rate) - BigDecimal::from(self._targetUtilizationRate)) / BigDecimal::from_ratio(MAX_POS - self.target_utilization)
    rate = market._targetUtilizationRate
      .toBigDecimal()
      .div(BD("1000000000000000000000000000"))
      .plus(
        pos
          .minus(target)
          .times(
            market._maxUtilizationRate
              .minus(market._targetUtilizationRate)
              .toBigDecimal()
              .div(BD("1000000000000000000000000000"))
          )
          .div(const_1.BD_ONE.minus(target))
      );
  }
  return rate;
}
exports.getRate = getRate;
function updateApr(market, receipt) {
  const rate = getRate(market);
  if (rate.equals(const_1.BD_ONE)) return;
  const borrow_apr = (0, math_1.bigDecimalExponential)(
    rate.minus(const_1.BD_ONE),
    BD("31536000000")
  ).minus(const_1.BD_ONE);
  const annualBorrowInterest = market._totalBorrowed.times(borrow_apr);
  const annualSupplyInterest = annualBorrowInterest.times(
    const_1.BD_ONE.minus(market._reserveRatio.toBigDecimal().div(BD("10000")))
  );
  let supply_apr;
  if (market._totalDeposited.gt(const_1.BD_ZERO)) {
    supply_apr = annualSupplyInterest.div(market._totalDeposited);
  } else {
    supply_apr = const_1.BD_ZERO;
  }
  /* -------------------------------------------------------------------------- */
  /*                                 Supply Rate                                */
  /* -------------------------------------------------------------------------- */
  const supply_rate = (0, rates_1.getOrCreateRate)(
    market,
    const_1.InterestRateSide.LENDER
  );
  supply_rate.rate = supply_apr.times(BD("100"));
  supply_rate.save();
  /* -------------------------------------------------------------------------- */
  /*                                 Borrow Rate                                */
  /* -------------------------------------------------------------------------- */
  const borrow_rate = (0, rates_1.getOrCreateRate)(
    market,
    const_1.InterestRateSide.LENDER
  );
  borrow_rate.rate = borrow_apr.times(BD("100"));
  borrow_rate.save();
  /* -------------------------------------------------------------------------- */
  /*                               Daily Snapshot                               */
  /* -------------------------------------------------------------------------- */
  const supplyRateToday = (0, rates_1.getOrCreateRate)(
    market,
    const_1.InterestRateSide.LENDER,
    const_1.IntervalType.DAILY,
    receipt
  );
  supplyRateToday.rate = supply_apr.times(BD("100"));
  supplyRateToday.save();
  const borrowRateToday = (0, rates_1.getOrCreateRate)(
    market,
    const_1.InterestRateSide.BORROWER,
    const_1.IntervalType.DAILY,
    receipt
  );
  borrowRateToday.rate = borrow_rate.rate;
  borrowRateToday.save();
}
exports.updateApr = updateApr;
