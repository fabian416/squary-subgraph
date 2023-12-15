"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTroveUpdated = exports.handleYUSDBorrowingFeePaid = void 0;
const event_1 = require("../entities/event");
const trove_1 = require("../entities/trove");
const protocol_1 = require("../entities/protocol");
const numbers_1 = require("../utils/numbers");
const price_1 = require("../utils/price");
/**
 * Emitted when YUSD is borrowed from trove and a dynamic fee (0.5-5%) is charged (added to debt)
 *
 * @param event YUSDBorrowingFeePaid event
 */
function handleYUSDBorrowingFeePaid(event) {
    const feeAmountYUSD = event.params._YUSDFee;
    const feeAmountUSD = (0, numbers_1.bigIntToBigDecimal)(feeAmountYUSD);
    (0, protocol_1.addProtocolSideRevenue)(event, feeAmountUSD);
}
exports.handleYUSDBorrowingFeePaid = handleYUSDBorrowingFeePaid;
/**
 * Emitted when a trove was updated because of a BorrowerOperation (open/close/adjust)
 *
 * @param event TroveUpdated event
 */
function handleTroveUpdated(event) {
    const borrower = event.params._borrower;
    const newDebt = event.params._debt;
    const trove = (0, trove_1.getOrCreateTrove)(borrower);
    for (let i = 0; i < event.params._tokens.length; i++) {
        const token = event.params._tokens[i];
        const amount = event.params._amounts[i];
        const troveToken = (0, trove_1.getOrCreateTroveToken)(trove, token);
        if (amount == troveToken.collateral && newDebt == trove.debt) {
            continue;
        }
        if (amount > troveToken.collateral) {
            const depositAmount = amount.minus(troveToken.collateral);
            const depositAmountUSD = (0, price_1.getUSDPriceWithoutDecimals)(token, depositAmount.toBigDecimal());
            (0, event_1.createDeposit)(event, depositAmount, depositAmountUSD, borrower, token);
        }
        else if (amount < troveToken.collateral) {
            const withdrawAmount = troveToken.collateral.minus(amount);
            const withdrawAmountUSD = (0, price_1.getUSDPriceWithoutDecimals)(token, withdrawAmount.toBigDecimal());
            (0, event_1.createWithdraw)(event, withdrawAmount, withdrawAmountUSD, borrower, token);
        }
        troveToken.collateral = amount;
        troveToken.save();
    }
    if (newDebt > trove.debt) {
        const borrowAmountYUSD = newDebt.minus(trove.debt);
        const borrowAmountUSD = (0, numbers_1.bigIntToBigDecimal)(borrowAmountYUSD);
        (0, event_1.createBorrow)(event, borrowAmountYUSD, borrowAmountUSD, borrower);
    }
    else if (newDebt < trove.debt) {
        const repayAmountYUSD = trove.debt.minus(newDebt);
        const repayAmountUSD = (0, numbers_1.bigIntToBigDecimal)(repayAmountYUSD);
        (0, event_1.createRepay)(event, repayAmountYUSD, repayAmountUSD, borrower);
    }
    trove.debt = newDebt;
    trove.save();
    (0, protocol_1.updateUsageMetrics)(event, borrower);
    (0, protocol_1.incrementProtocolWithdrawCount)(event);
}
exports.handleTroveUpdated = handleTroveUpdated;
