"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLoanRepaid = exports.handleLoanCreated = void 0;
const BulletLoans_1 = require("../../generated/BulletLoans/BulletLoans");
const event_1 = require("../entities/event");
const market_1 = require("../entities/market");
const position_1 = require("../entities/position");
const token_1 = require("../entities/token");
const price_1 = require("../entities/price");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
function handleLoanCreated(event) {
    const instrumentId = event.params.instrumentId;
    const contract = BulletLoans_1.BulletLoans.bind(event.address);
    const loansResult = contract.try_loans(instrumentId);
    if (!loansResult.reverted) {
        const loans = loansResult.value;
        const ownerOfResult = contract.try_ownerOf(instrumentId);
        if (!ownerOfResult.reverted) {
            const market = (0, market_1.getMarket)(ownerOfResult.value);
            (0, event_1.createBorrow)(event, market, loans.getUnderlyingToken(), loans.getRecipient(), loans.getPrincipal());
            const rate = loans
                .getTotalDebt()
                .toBigDecimal()
                .div(loans.getPrincipal().toBigDecimal());
            const apy = (0, numbers_1.exponent)(rate, constants_1.SECONDS_PER_YEAR.div(loans.getDuration()).toI32())
                .minus(constants_1.BIGDECIMAL_ONE)
                .times(constants_1.BIGDECIMAL_HUNDRED)
                .truncate(constants_1.TRUNCATE_LENGTH);
            (0, market_1.updateMarketRates)(event, market, apy);
            (0, market_1.changeMarketBorrowBalance)(event, market, loans.getPrincipal(), false);
            (0, position_1.changeUserStableBorrowerPosition)(event, loans.getRecipient(), market, loans.getPrincipal());
        }
    }
}
exports.handleLoanCreated = handleLoanCreated;
function handleLoanRepaid(event) {
    const instrumentId = event.params.instrumentId;
    const contract = BulletLoans_1.BulletLoans.bind(event.address);
    const loansResult = contract.try_loans(instrumentId);
    if (loansResult.reverted) {
        return;
    }
    const loans = loansResult.value;
    const ownerOfResult = contract.try_ownerOf(instrumentId);
    if (ownerOfResult.reverted) {
        return;
    }
    const market = (0, market_1.getMarket)(ownerOfResult.value);
    (0, event_1.createRepay)(event, market, loans.getUnderlyingToken(), loans.getRecipient(), event.params.amount);
    const balanceChange = event.params.amount
        .times(loans.getPrincipal())
        .div(loans.getTotalDebt())
        .times(constants_1.BIGINT_NEGATIVE_ONE);
    (0, market_1.changeMarketBorrowBalance)(event, market, balanceChange, false);
    (0, position_1.changeUserStableBorrowerPosition)(event, loans.getRecipient(), market, balanceChange);
    const amountRepaid = loans.getAmountRepaid();
    if (amountRepaid >= loans.getTotalDebt()) {
        const principal = loans.getPrincipal();
        const fee = amountRepaid.minus(principal).div(constants_1.BIGINT_TEN);
        const underlyingToken = (0, token_1.getOrCreateToken)(loans.getUnderlyingToken());
        (0, market_1.addMarketProtocolSideRevenue)(event, market, (0, price_1.amountInUSD)(fee, underlyingToken));
        (0, market_1.addMarketSupplySideRevenue)(event, market, (0, price_1.amountInUSD)(amountRepaid.minus(principal).minus(fee), underlyingToken));
    }
}
exports.handleLoanRepaid = handleLoanRepaid;
