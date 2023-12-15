"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTroveUpdated = exports.handleVSTBorrowingFeePaid = void 0;
const event_1 = require("../entities/event");
const trove_1 = require("../entities/trove");
const token_1 = require("../entities/token");
const protocol_1 = require("../entities/protocol");
const numbers_1 = require("../utils/numbers");
const position_1 = require("../entities/position");
const market_1 = require("../entities/market");
/**
 * Emitted when VST is borrowed from trove and a dynamic fee (0.5-5%) is charged (added to debt)
 *
 * @param event VSTBorrowingFeePaid event
 */
function handleVSTBorrowingFeePaid(event) {
    const asset = event.params._asset;
    const market = (0, market_1.getOrCreateMarket)(asset);
    const feeAmountVST = event.params._VSTFee;
    const feeAmountUSD = (0, numbers_1.bigIntToBigDecimal)(feeAmountVST);
    (0, protocol_1.addProtocolSideRevenue)(event, market, feeAmountUSD);
}
exports.handleVSTBorrowingFeePaid = handleVSTBorrowingFeePaid;
/**
 * Emitted when a trove was updated because of a BorrowerOperation (open/close/adjust)
 *
 * @param event TroveUpdated event
 */
function handleTroveUpdated(event) {
    const asset = event.params._asset;
    const market = (0, market_1.getOrCreateMarket)(asset);
    const borrower = event.params._borrower;
    const newCollateral = event.params._coll;
    const newDebt = event.params._debt;
    const trove = (0, trove_1.getOrCreateTrove)(borrower, asset);
    if (newCollateral == trove.collateral && newDebt == trove.debt) {
        return;
    }
    const assetPrice = (0, token_1.getCurrentAssetPrice)(asset);
    if (newCollateral > trove.collateral) {
        const depositAmountAsset = newCollateral.minus(trove.collateral);
        const depositAmountUSD = (0, numbers_1.bigIntToBigDecimal)(depositAmountAsset).times(assetPrice);
        (0, event_1.createDeposit)(event, market, depositAmountAsset, depositAmountUSD, borrower);
    }
    else if (newCollateral < trove.collateral) {
        const withdrawAmountAsset = trove.collateral.minus(newCollateral);
        const withdrawAmountUSD = (0, numbers_1.bigIntToBigDecimal)(withdrawAmountAsset).times(assetPrice);
        (0, event_1.createWithdraw)(event, market, withdrawAmountAsset, withdrawAmountUSD, borrower, borrower);
    }
    if (newDebt > trove.debt) {
        const borrowAmountVST = newDebt.minus(trove.debt);
        const borrowAmountUSD = (0, numbers_1.bigIntToBigDecimal)(borrowAmountVST);
        (0, event_1.createBorrow)(event, market, borrowAmountVST, borrowAmountUSD, borrower);
    }
    else if (newDebt < trove.debt) {
        const repayAmountVST = trove.debt.minus(newDebt);
        const repayAmountUSD = (0, numbers_1.bigIntToBigDecimal)(repayAmountVST);
        (0, event_1.createRepay)(event, market, repayAmountVST, repayAmountUSD, borrower, borrower);
    }
    trove.collateral = newCollateral;
    trove.debt = newDebt;
    trove.save();
    (0, position_1.updateUserPositionBalances)(event, trove);
}
exports.handleTroveUpdated = handleTroveUpdated;
