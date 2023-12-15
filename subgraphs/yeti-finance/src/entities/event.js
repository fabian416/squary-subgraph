"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiquidate = exports.createRepay = exports.createBorrow = exports.createWithdraw = exports.createDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const protocol_1 = require("./protocol");
const market_1 = require("./market");
const token_1 = require("./token");
const strings_1 = require("../utils/strings");
function createDeposit(event, amount, amountUSD, sender, asset) {
    if (amount.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.critical("Invalid deposit amount: {}", [amount.toString()]);
    }
    const deposit = new schema_1.Deposit((0, strings_1.prefixID)("deposit", `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}-${asset.toHexString()}`));
    deposit.hash = event.transaction.hash.toHexString();
    deposit.logIndex = event.logIndex.toI32();
    deposit.protocol = (0, protocol_1.getOrCreateYetiProtocol)().id;
    deposit.to = constants_1.ACTIVE_POOL;
    deposit.from = sender.toHexString();
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.market = (0, market_1.getOrCreateMarket)(asset).id;
    deposit.asset = (0, token_1.getOrCreateToken)(asset).id;
    deposit.amount = amount;
    deposit.amountUSD = amountUSD;
    deposit.save();
    (0, market_1.addMarketDepositVolume)(event, amountUSD, asset);
}
exports.createDeposit = createDeposit;
function createWithdraw(event, amount, amountUSD, recipient, asset) {
    if (amount.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.critical("Invalid withdraw amount: {}", [amount.toString()]);
    }
    const withdraw = new schema_1.Withdraw((0, strings_1.prefixID)("withdraw", `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}-${asset.toHexString()}`));
    withdraw.hash = event.transaction.hash.toHexString();
    withdraw.logIndex = event.logIndex.toI32();
    withdraw.protocol = (0, protocol_1.getOrCreateYetiProtocol)().id;
    withdraw.to = recipient.toHexString();
    withdraw.from = constants_1.ACTIVE_POOL;
    withdraw.blockNumber = event.block.number;
    withdraw.timestamp = event.block.timestamp;
    withdraw.market = (0, market_1.getOrCreateMarket)(asset).id;
    withdraw.asset = (0, token_1.getOrCreateToken)(asset).id;
    withdraw.amount = amount;
    withdraw.amountUSD = amountUSD;
    withdraw.save();
}
exports.createWithdraw = createWithdraw;
function createBorrow(event, amountYUSD, amountUSD, recipient) {
    if (amountYUSD.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.critical("Invalid borrow amount: {}", [amountYUSD.toString()]);
    }
    const borrow = new schema_1.Borrow((0, strings_1.prefixID)("borrow", `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`));
    borrow.hash = event.transaction.hash.toHexString();
    borrow.logIndex = event.logIndex.toI32();
    borrow.protocol = (0, protocol_1.getOrCreateYetiProtocol)().id;
    borrow.to = recipient.toHexString();
    borrow.from = constants_1.ZERO_ADDRESS; // YUSD is minted
    borrow.blockNumber = event.block.number;
    borrow.timestamp = event.block.timestamp;
    borrow.asset = (0, token_1.getYUSDToken)().id;
    borrow.amount = amountYUSD;
    borrow.amountUSD = amountUSD;
    borrow.save();
    (0, protocol_1.addProtocolBorrowVolume)(event, amountUSD);
}
exports.createBorrow = createBorrow;
function createRepay(event, amountYUSD, amountUSD, sender) {
    if (amountYUSD.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.critical("Invalid repay amount: {}", [amountYUSD.toString()]);
    }
    const repay = new schema_1.Repay((0, strings_1.prefixID)("repay", `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`));
    repay.hash = event.transaction.hash.toHexString();
    repay.logIndex = event.logIndex.toI32();
    repay.protocol = (0, protocol_1.getOrCreateYetiProtocol)().id;
    repay.to = constants_1.ZERO_ADDRESS; // YUSD is burned
    repay.from = sender.toHexString();
    repay.blockNumber = event.block.number;
    repay.timestamp = event.block.timestamp;
    repay.asset = (0, token_1.getYUSDToken)().id;
    repay.amount = amountYUSD;
    repay.amountUSD = amountUSD;
    repay.save();
    (0, protocol_1.incrementProtocolRepayCount)(event);
}
exports.createRepay = createRepay;
function createLiquidate(event, amountLiquidated, amountLiquidatedUSD, profitUSD, liquidator, asset) {
    const liquidate = new schema_1.Liquidate((0, strings_1.prefixID)("liquidate", `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}-${asset.toHexString()}`));
    liquidate.hash = event.transaction.hash.toHexString();
    liquidate.logIndex = event.logIndex.toI32();
    liquidate.protocol = (0, protocol_1.getOrCreateYetiProtocol)().id;
    liquidate.to = constants_1.STABILITY_POOL;
    liquidate.from = liquidator.toHexString();
    liquidate.blockNumber = event.block.number;
    liquidate.timestamp = event.block.timestamp;
    liquidate.market = (0, market_1.getOrCreateMarket)(asset).id;
    liquidate.asset = (0, token_1.getOrCreateToken)(asset).id;
    liquidate.amount = amountLiquidated;
    liquidate.amountUSD = amountLiquidatedUSD;
    liquidate.profitUSD = profitUSD;
    liquidate.save();
    (0, market_1.addMarketLiquidateVolume)(event, amountLiquidatedUSD, asset);
    (0, protocol_1.addProtocolLiquidateVolume)(event, amountLiquidatedUSD);
    (0, protocol_1.incrementProtocolLiquidateCount)(event);
}
exports.createLiquidate = createLiquidate;
