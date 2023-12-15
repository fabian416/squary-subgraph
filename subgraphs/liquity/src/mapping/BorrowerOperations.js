"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTroveUpdated = exports.handleLUSDBorrowingFeePaid = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const event_1 = require("../entities/event");
const trove_1 = require("../entities/trove");
const token_1 = require("../entities/token");
const protocol_1 = require("../entities/protocol");
const numbers_1 = require("../utils/numbers");
const position_1 = require("../entities/position");
const market_1 = require("../entities/market");
const constants_1 = require("../utils/constants");
/**
 * Emitted when LUSD is borrowed from trove and a dynamic fee (0.5-5%) is charged (added to debt)
 *
 * @param event LUSDBorrowingFeePaid event
 */
function handleLUSDBorrowingFeePaid(event) {
    const feeAmountLUSD = event.params._LUSDFee;
    const feeAmountUSD = (0, numbers_1.bigIntToBigDecimal)(feeAmountLUSD);
    (0, protocol_1.addProtocolSideRevenue)(event, feeAmountUSD, (0, market_1.getOrCreateMarket)());
}
exports.handleLUSDBorrowingFeePaid = handleLUSDBorrowingFeePaid;
/**
 * Emitted when a trove was updated because of a BorrowerOperation (open/close/adjust)
 *
 * @param event TroveUpdated event
 */
function handleTroveUpdated(event) {
    const borrower = event.params._borrower;
    const newCollateral = event.params._coll;
    const newDebt = event.params._debt;
    const trove = (0, trove_1.getOrCreateTrove)(borrower);
    const market = (0, market_1.getOrCreateMarket)();
    const ethAddress = graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS);
    if (newCollateral == trove.collateral && newDebt == trove.debt) {
        return;
    }
    if (newCollateral > trove.collateral) {
        const depositAmountETH = newCollateral.minus(trove.collateral);
        const depositAmountUSD = (0, numbers_1.bigIntToBigDecimal)(depositAmountETH).times((0, token_1.getCurrentETHPrice)());
        (0, event_1.createDeposit)(event, (0, market_1.getOrCreateMarket)(), ethAddress, depositAmountETH, depositAmountUSD, borrower);
    }
    else if (newCollateral < trove.collateral) {
        const withdrawAmountETH = trove.collateral.minus(newCollateral);
        const withdrawAmountUSD = (0, numbers_1.bigIntToBigDecimal)(withdrawAmountETH).times((0, token_1.getCurrentETHPrice)());
        (0, event_1.createWithdraw)(event, market, withdrawAmountETH, withdrawAmountUSD, borrower, borrower);
    }
    if (newDebt > trove.debt) {
        const borrowAmountLUSD = newDebt.minus(trove.debt);
        const borrowAmountUSD = (0, numbers_1.bigIntToBigDecimal)(borrowAmountLUSD);
        (0, event_1.createBorrow)(event, borrowAmountLUSD, borrowAmountUSD, borrower);
    }
    else if (newDebt < trove.debt) {
        const repayAmountLUSD = trove.debt.minus(newDebt);
        const repayAmountUSD = (0, numbers_1.bigIntToBigDecimal)(repayAmountLUSD);
        (0, event_1.createRepay)(event, repayAmountLUSD, repayAmountUSD, borrower, borrower);
    }
    trove.collateral = newCollateral;
    trove.debt = newDebt;
    trove.save();
    (0, position_1.updateUserPositionBalances)(event, trove);
}
exports.handleTroveUpdated = handleTroveUpdated;
