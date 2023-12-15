"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWithdrawCollateral = exports.handlePayBackToken = exports.handleOwnershipTransferred = exports.handleLiquidateVault = exports.handleDepositCollateral = exports.handleBorrowToken = void 0;
const event_1 = require("../entities/event");
const market_1 = require("../entities/market");
function handleBorrowToken(event) {
    (0, event_1.createBorrow)(event, event.params.amount);
}
exports.handleBorrowToken = handleBorrowToken;
function handleDepositCollateral(event) {
    (0, event_1.createDeposit)(event, event.params.amount);
}
exports.handleDepositCollateral = handleDepositCollateral;
function handleLiquidateVault(event) {
    (0, event_1.createLiquidate)(event, event.params.debtRepaid, event.params.collateralLiquidated, event.params.closingFee, event.params.buyer, event.params.owner.toHexString());
}
exports.handleLiquidateVault = handleLiquidateVault;
function handleOwnershipTransferred(event) {
    (0, market_1.createERC20Market)(event);
}
exports.handleOwnershipTransferred = handleOwnershipTransferred;
function handlePayBackToken(event) {
    (0, event_1.createRepay)(event, event.params.amount, event.params.closingFee);
}
exports.handlePayBackToken = handlePayBackToken;
function handleWithdrawCollateral(event) {
    (0, event_1.createWithdraw)(event, event.params.amount);
}
exports.handleWithdrawCollateral = handleWithdrawCollateral;
