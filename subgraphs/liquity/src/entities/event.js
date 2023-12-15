"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiquidate = exports.createRepay = exports.createBorrow = exports.createWithdraw = exports.createDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const market_1 = require("./market");
const token_1 = require("./token");
const strings_1 = require("../utils/strings");
const account_1 = require("./account");
const position_1 = require("./position");
const usage_1 = require("./usage");
function createDeposit(event, market, asset, amount, amountUSD, sender) {
    if (amount.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.critical("Invalid deposit amount: {}", [amount.toString()]);
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
    deposit.asset = asset.toHexString();
    deposit.amount = amount;
    deposit.amountUSD = amountUSD;
    deposit.save();
    (0, market_1.addMarketDepositVolume)(event, market, amountUSD);
    (0, account_1.incrementAccountDepositCount)(account);
    (0, position_1.incrementPositionDepositCount)(position);
    (0, usage_1.incrementProtocolDepositCount)(event, account);
}
exports.createDeposit = createDeposit;
function createWithdraw(event, market, amountETH, amountUSD, user, recipient) {
    if (amountETH.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.critical("Invalid withdraw amount: {}", [amountETH.toString()]);
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
    withdraw.asset = (0, token_1.getETHToken)().id;
    withdraw.amount = amountETH;
    withdraw.amountUSD = amountUSD;
    withdraw.save();
    (0, market_1.addMarketWithdrawVolume)(event, amountUSD);
    (0, account_1.incrementAccountWithdrawCount)(account);
    (0, position_1.incrementPositionWithdrawCount)(position);
    (0, usage_1.incrementProtocolWithdrawCount)(event, account);
}
exports.createWithdraw = createWithdraw;
function createBorrow(event, amountLUSD, amountUSD, recipient) {
    if (amountLUSD.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.critical("Invalid borrow amount: {}", [amountLUSD.toString()]);
    }
    const market = (0, market_1.getOrCreateMarket)();
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
    borrow.asset = (0, token_1.getLUSDToken)().id;
    borrow.amount = amountLUSD;
    borrow.amountUSD = amountUSD;
    borrow.save();
    (0, market_1.addMarketBorrowVolume)(event, amountUSD);
    (0, account_1.incrementAccountBorrowCount)(account);
    (0, position_1.incrementPositionBorrowCount)(position);
    (0, usage_1.incrementProtocolBorrowCount)(event, account);
}
exports.createBorrow = createBorrow;
function createRepay(event, amountLUSD, amountUSD, user, repayer) {
    if (amountLUSD.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.critical("Invalid repay amount: {}", [amountLUSD.toString()]);
    }
    const market = (0, market_1.getOrCreateMarket)();
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
    repay.asset = (0, token_1.getLUSDToken)().id;
    repay.amount = amountLUSD;
    repay.amountUSD = amountUSD;
    repay.save();
    (0, market_1.addMarketRepayVolume)(event, amountUSD);
    (0, account_1.incrementAccountRepayCount)(account);
    (0, position_1.incrementPositionRepayCount)(position);
    (0, usage_1.incrementProtocolRepayCount)(event, account);
}
exports.createRepay = createRepay;
function createLiquidate(event, amountLiquidated, amountLiquidatedUSD, profitUSD, user, liquidator) {
    const market = (0, market_1.getOrCreateMarket)();
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
    liquidate.asset = (0, token_1.getLUSDToken)().id;
    liquidate.amount = amountLiquidated;
    liquidate.amountUSD = amountLiquidatedUSD;
    liquidate.profitUSD = profitUSD;
    liquidate.save();
    (0, market_1.addMarketLiquidateVolume)(event, amountLiquidatedUSD);
    (0, account_1.incrementAccountLiquidationCount)(account);
    (0, position_1.incrementPositionLiquidationCount)(borrowerPosition);
    (0, position_1.incrementPositionLiquidationCount)(lenderPosition);
    (0, account_1.incrementAccountLiquidatorCount)(liquidatorAccount);
    (0, usage_1.incrementProtocolLiquidateCount)(event, account, liquidatorAccount);
}
exports.createLiquidate = createLiquidate;
