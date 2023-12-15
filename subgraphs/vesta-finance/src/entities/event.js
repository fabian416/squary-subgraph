"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiquidate = exports.createRepay = exports.createBorrow = exports.createWithdraw = exports.createDeposit = exports.EventType = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const market_1 = require("./market");
const token_1 = require("./token");
const strings_1 = require("../utils/strings");
const account_1 = require("./account");
const position_1 = require("./position");
const usage_1 = require("./usage");
var EventType;
(function (EventType) {
    EventType[EventType["Deposit"] = 0] = "Deposit";
    EventType[EventType["Withdraw"] = 1] = "Withdraw";
    EventType[EventType["Borrow"] = 2] = "Borrow";
    EventType[EventType["Repay"] = 3] = "Repay";
    EventType[EventType["Liquidate"] = 4] = "Liquidate";
    EventType[EventType["Liquidated"] = 5] = "Liquidated";
})(EventType = exports.EventType || (exports.EventType = {}));
function createDeposit(event, market, amountAsset, amountUSD, sender) {
    if (amountAsset.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.warning("Invalid deposit amount: {}", [amountAsset.toString()]);
        return;
    }
    const account = (0, account_1.getOrCreateAccount)(sender);
    const position = (0, position_1.getOrCreateUserPosition)(event, account, market, constants_1.PositionSide.LENDER);
    const deposit = new schema_1.Deposit((0, strings_1.prefixID)("deposit", `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`));
    deposit.hash = event.transaction.hash.toHexString();
    deposit.nonce = event.transaction.nonce;
    deposit.logIndex = event.logIndex.toI32();
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.account = account.id;
    deposit.market = market.id;
    deposit.position = position.id;
    deposit.asset = market.inputToken;
    deposit.amount = amountAsset;
    deposit.amountUSD = amountUSD;
    deposit.save();
    (0, market_1.addMarketVolume)(event, market, amountUSD, EventType.Deposit);
    (0, account_1.incrementAccountDepositCount)(account);
    (0, position_1.incrementPositionDepositCount)(position);
    (0, usage_1.incrementProtocolDepositCount)(event, account);
}
exports.createDeposit = createDeposit;
function createWithdraw(event, market, amountAsset, amountUSD, user, recipient) {
    if (amountAsset.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.warning("Invalid withdraw amount: {}", [amountAsset.toString()]);
        return;
    }
    const account = (0, account_1.getOrCreateAccount)(recipient);
    const position = (0, position_1.getOrCreateUserPosition)(event, (0, account_1.getOrCreateAccount)(user), market, constants_1.PositionSide.LENDER);
    const withdraw = new schema_1.Withdraw((0, strings_1.prefixID)("withdraw", `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`));
    withdraw.hash = event.transaction.hash.toHexString();
    withdraw.nonce = event.transaction.nonce;
    withdraw.logIndex = event.logIndex.toI32();
    withdraw.blockNumber = event.block.number;
    withdraw.timestamp = event.block.timestamp;
    withdraw.account = account.id;
    withdraw.market = market.id;
    withdraw.position = position.id;
    withdraw.asset = market.inputToken;
    withdraw.amount = amountAsset;
    withdraw.amountUSD = amountUSD;
    withdraw.save();
    (0, market_1.addMarketVolume)(event, market, amountUSD, EventType.Withdraw);
    (0, account_1.incrementAccountWithdrawCount)(account);
    (0, position_1.incrementPositionWithdrawCount)(position);
    (0, usage_1.incrementProtocolWithdrawCount)(event, account);
}
exports.createWithdraw = createWithdraw;
function createBorrow(event, market, amountVST, amountUSD, recipient) {
    if (amountVST.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.warning("Invalid borrow amount: {}", [amountVST.toString()]);
        return;
    }
    const account = (0, account_1.getOrCreateAccount)(recipient);
    const position = (0, position_1.getOrCreateUserPosition)(event, account, market, constants_1.PositionSide.BORROWER);
    const borrow = new schema_1.Borrow((0, strings_1.prefixID)("borrow", `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`));
    borrow.hash = event.transaction.hash.toHexString();
    borrow.nonce = event.transaction.nonce;
    borrow.logIndex = event.logIndex.toI32();
    borrow.blockNumber = event.block.number;
    borrow.timestamp = event.block.timestamp;
    borrow.account = account.id;
    borrow.market = market.id;
    borrow.position = position.id;
    borrow.asset = (0, token_1.getVSTToken)().id;
    borrow.amount = amountVST;
    borrow.amountUSD = amountUSD;
    borrow.save();
    (0, market_1.addMarketVolume)(event, market, amountUSD, EventType.Borrow);
    (0, account_1.incrementAccountBorrowCount)(account);
    (0, position_1.incrementPositionBorrowCount)(position);
    (0, usage_1.incrementProtocolBorrowCount)(event, account);
}
exports.createBorrow = createBorrow;
function createRepay(event, market, amountVST, amountUSD, user, repayer) {
    if (amountVST.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.warning("Invalid repay amount: {}", [amountVST.toString()]);
        return;
    }
    const account = (0, account_1.getOrCreateAccount)(repayer);
    const position = (0, position_1.getOrCreateUserPosition)(event, (0, account_1.getOrCreateAccount)(user), market, constants_1.PositionSide.BORROWER);
    const repay = new schema_1.Repay((0, strings_1.prefixID)("repay", `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`));
    repay.hash = event.transaction.hash.toHexString();
    repay.nonce = event.transaction.nonce;
    repay.logIndex = event.logIndex.toI32();
    repay.blockNumber = event.block.number;
    repay.timestamp = event.block.timestamp;
    repay.account = account.id;
    repay.market = market.id;
    repay.position = position.id;
    repay.asset = (0, token_1.getVSTToken)().id;
    repay.amount = amountVST;
    repay.amountUSD = amountUSD;
    repay.save();
    (0, market_1.addMarketVolume)(event, market, amountUSD, EventType.Repay);
    (0, account_1.incrementAccountRepayCount)(account);
    (0, position_1.incrementPositionRepayCount)(position);
    (0, usage_1.incrementProtocolRepayCount)(event, account);
}
exports.createRepay = createRepay;
function createLiquidate(event, market, amountLiquidated, amountLiquidatedUSD, profitUSD, user, liquidator) {
    const account = (0, account_1.getOrCreateAccount)(user);
    const liquidatorAccount = (0, account_1.getOrCreateAccount)(liquidator);
    const lenderPosition = (0, position_1.getOrCreateUserPosition)(event, account, market, constants_1.PositionSide.LENDER);
    const borrowerPosition = (0, position_1.getOrCreateUserPosition)(event, account, market, constants_1.PositionSide.BORROWER);
    const liquidate = new schema_1.Liquidate((0, strings_1.prefixID)("liquidate", `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`));
    liquidate.hash = event.transaction.hash.toHexString();
    liquidate.nonce = event.transaction.nonce;
    liquidate.logIndex = event.logIndex.toI32();
    liquidate.liquidatee = liquidator.toHexString();
    liquidate.blockNumber = event.block.number;
    liquidate.timestamp = event.block.timestamp;
    liquidate.liquidator = liquidatorAccount.id;
    liquidate.liquidatee = account.id;
    liquidate.market = market.id;
    liquidate.position = borrowerPosition.id;
    liquidate.lenderPosition = lenderPosition.id;
    liquidate.asset = (0, token_1.getVSTToken)().id;
    liquidate.amount = amountLiquidated;
    liquidate.amountUSD = amountLiquidatedUSD;
    liquidate.profitUSD = profitUSD;
    liquidate.save();
    (0, market_1.addMarketVolume)(event, market, amountLiquidatedUSD, EventType.Liquidate);
    (0, account_1.incrementAccountLiquidationCount)(account);
    (0, position_1.incrementPositionLiquidationCount)(borrowerPosition);
    (0, position_1.incrementPositionLiquidationCount)(lenderPosition);
    (0, account_1.incrementAccountLiquidatorCount)(liquidatorAccount);
    (0, usage_1.incrementProtocolLiquidateCount)(event, account, liquidatorAccount);
}
exports.createLiquidate = createLiquidate;
