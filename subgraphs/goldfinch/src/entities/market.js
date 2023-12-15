"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInterestRates = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
function updateInterestRates(market, borrowerInterestAmountUSD, lenderInterestAmountUSD, event) {
    const marketID = market.id;
    const secondsLapsed = event.block.timestamp.minus(market._interestTimestamp);
    // only update rates in a day or longer
    if (secondsLapsed.lt(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY))) {
        return;
    }
    graph_ts_1.log.info("[updateInterestRates]market {}/{} borrowerInterestAmountUSD={},lenderInterestAmountUSD={} block {} tx {}", [
        market.id,
        market.name,
        borrowerInterestAmountUSD.toString(),
        lenderInterestAmountUSD.toString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
    ]);
    const rates = [];
    // scale interest rate to APR
    // since interest is not compounding, apply a linear scaler based on time
    const InterestRateScaler = graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_YEAR).divDecimal(secondsLapsed.toBigDecimal());
    // even though borrow rates are supposed to be "STABLE", but there may be late payment, writedown
    // the actual rate may not be stable
    const borrowerInterestRateID = `${marketID}-${constants_1.InterestRateSide.BORROWER}-${constants_1.InterestRateType.STABLE}`;
    const borrowerInterestRate = new schema_1.InterestRate(borrowerInterestRateID);
    if (market.totalBorrowBalanceUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        borrowerInterestRate.side = constants_1.InterestRateSide.BORROWER;
        borrowerInterestRate.type = constants_1.InterestRateType.STABLE;
        borrowerInterestRate.rate = borrowerInterestAmountUSD
            .div(market.totalBorrowBalanceUSD)
            .times(InterestRateScaler)
            .times(constants_1.BIGDECIMAL_HUNDRED);
        borrowerInterestRate.save();
        rates.push(borrowerInterestRate.id);
        market._borrowerInterestAmountUSD = constants_1.BIGDECIMAL_ZERO;
        market._interestTimestamp = event.block.timestamp;
    }
    else {
        graph_ts_1.log.warning("[updateInterestRates]market.totalBorrowBalanceUSD={} for market {} at tx {}, skip updating borrower rates", [
            market.totalBorrowBalanceUSD.toString(),
            marketID,
            event.transaction.hash.toHexString(),
        ]);
        for (let i = 0; i < market.rates.length; i++) {
            const interestRate = schema_1.InterestRate.load(market.rates[i]);
            if (interestRate && interestRate.side == constants_1.InterestRateSide.BORROWER) {
                rates.push(market.rates[i]);
            }
        }
    }
    // senior and junior rates are different, this is an average of them
    const lenderInterestRateID = `${marketID}-${constants_1.InterestRateSide.LENDER}-${constants_1.InterestRateType.STABLE}`;
    const lenderInterestRate = new schema_1.InterestRate(lenderInterestRateID);
    if (market.totalDepositBalanceUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        lenderInterestRate.side = constants_1.InterestRateSide.LENDER;
        lenderInterestRate.type = constants_1.InterestRateType.STABLE;
        lenderInterestRate.rate = lenderInterestAmountUSD
            .div(market.totalDepositBalanceUSD)
            .times(InterestRateScaler)
            .times(constants_1.BIGDECIMAL_HUNDRED);
        lenderInterestRate.save();
        rates.push(lenderInterestRate.id);
        market._lenderInterestAmountUSD = constants_1.BIGDECIMAL_ZERO;
    }
    else {
        graph_ts_1.log.warning("[updateInterestRates]market.totalDepositBalanceUSD={} for market {} at tx {}, skip updating lender rates", [
            market.totalDepositBalanceUSD.toString(),
            marketID,
            event.transaction.hash.toHexString(),
        ]);
        for (let i = 0; i < market.rates.length; i++) {
            const interestRate = schema_1.InterestRate.load(market.rates[i]);
            if (interestRate && interestRate.side == constants_1.InterestRateSide.LENDER) {
                rates.push(market.rates[i]);
            }
        }
    }
    market.rates = rates;
    market.save();
}
exports.updateInterestRates = updateInterestRates;
