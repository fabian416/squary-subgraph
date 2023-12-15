"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBuyRiskyVault = exports.handlePayBackToken = exports.handleBorrowToken = exports.handleWithdrawCollateral = exports.handleDepositCollateral = exports.handleOwnershipTransferred = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const QiStablecoin_1 = require("../../generated/templates/Vault/QiStablecoin");
const event_1 = require("../entities/event");
const market_1 = require("../entities/market");
const constants_1 = require("../utils/constants");
const schema_1 = require("../../generated/schema");
function handleOwnershipTransferred(event) {
    (0, market_1.createMaticMarket)(event);
}
exports.handleOwnershipTransferred = handleOwnershipTransferred;
function handleDepositCollateral(event) {
    (0, event_1.createDeposit)(event, event.params.amount);
}
exports.handleDepositCollateral = handleDepositCollateral;
function handleWithdrawCollateral(event) {
    const liquidate = schema_1._InProgressLiquidate.load(event.transaction.hash.toHexString());
    if (!liquidate) {
        (0, event_1.createWithdraw)(event, event.params.amount);
        return;
    }
    (0, event_1.createLiquidate)(event, liquidate.debtRepaid, event.params.amount, liquidate.closingFee, event.transaction.from, liquidate.owner);
    graph_ts_1.store.remove("_InProgressLiquidate", liquidate.id);
}
exports.handleWithdrawCollateral = handleWithdrawCollateral;
function handleBorrowToken(event) {
    (0, event_1.createBorrow)(event, event.params.amount);
}
exports.handleBorrowToken = handleBorrowToken;
function handlePayBackToken(event) {
    const liquidate = schema_1._InProgressLiquidate.load(event.transaction.hash.toHexString());
    if (!liquidate) {
        (0, event_1.createRepay)(event, event.params.amount, event.params.closingFee);
        return;
    }
    liquidate.debtRepaid = liquidate.debtRepaid.plus(event.params.amount);
    liquidate.closingFee = liquidate.closingFee.plus(event.params.closingFee);
    liquidate.save();
}
exports.handlePayBackToken = handlePayBackToken;
function handleBuyRiskyVault(event) {
    const contract = QiStablecoin_1.QiStablecoin.bind(event.address);
    const closingFee = event.params.amountPaid
        .times(contract.closingFee())
        .times(contract.getTokenPriceSource())
        .div(contract.getEthPriceSource().times(constants_1.BIGINT_TEN_THOUSAND));
    const liquidate = new schema_1._InProgressLiquidate(event.transaction.hash.toHexString());
    liquidate.debtRepaid = event.params.amountPaid;
    liquidate.closingFee = closingFee;
    liquidate.owner = event.params.owner.toHexString();
    liquidate.save();
}
exports.handleBuyRiskyVault = handleBuyRiskyVault;
