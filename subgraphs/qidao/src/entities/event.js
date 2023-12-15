"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiquidate = exports.createRepay = exports.createBorrow = exports.createWithdraw = exports.createDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const market_1 = require("./market");
const price_1 = require("./price");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const usage_1 = require("./usage");
function createDeposit(event, amount) {
    if (amount.lt(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.critical("Invalid deposit amount: {}", [amount.toString()]);
    }
    const market = (0, market_1.getMarket)(event.address);
    const asset = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const deposit = new schema_1.Deposit(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    deposit.hash = event.transaction.hash.toHexString();
    deposit.logIndex = event.logIndex.toI32();
    deposit.protocol = (0, protocol_1.getOrCreateLendingProtocol)().id;
    deposit.to = market.id;
    deposit.from = event.transaction.from.toHexString();
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.market = market.id;
    deposit.asset = asset.id;
    deposit.amount = amount;
    deposit.amountUSD = (0, numbers_1.bigIntToBigDecimal)(amount, asset.decimals).times((0, price_1.getCollateralPrice)(event, event.address, asset));
    deposit.save();
    (0, usage_1.updateUsageMetrics)(event, event.transaction.from);
    (0, market_1.handleMarketDeposit)(event, market, deposit, asset);
    (0, usage_1.incrementProtocolDepositCount)(event);
}
exports.createDeposit = createDeposit;
function createWithdraw(event, amount) {
    if (amount.lt(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.critical("Invalid withdraw amount: {}", [amount.toString()]);
    }
    const market = (0, market_1.getMarket)(event.address);
    const asset = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const withdraw = new schema_1.Withdraw(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    withdraw.hash = event.transaction.hash.toHexString();
    withdraw.logIndex = event.logIndex.toI32();
    withdraw.protocol = (0, protocol_1.getOrCreateLendingProtocol)().id;
    withdraw.to = event.transaction.from.toHexString();
    withdraw.from = market.id;
    withdraw.blockNumber = event.block.number;
    withdraw.timestamp = event.block.timestamp;
    withdraw.market = market.id;
    withdraw.asset = market.inputToken;
    withdraw.amount = amount;
    withdraw.amountUSD = (0, numbers_1.bigIntToBigDecimal)(amount, asset.decimals).times((0, price_1.getCollateralPrice)(event, event.address, asset));
    withdraw.save();
    (0, usage_1.updateUsageMetrics)(event, event.transaction.from);
    (0, market_1.handleMarketWithdraw)(event, market, withdraw, asset);
    (0, usage_1.incrementProtocolWithdrawCount)(event);
}
exports.createWithdraw = createWithdraw;
function createBorrow(event, amount) {
    if (amount.lt(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.critical("Invalid borrow amount: {}", [amount.toString()]);
    }
    const market = (0, market_1.getMarket)(event.address);
    const mai = (0, token_1.getMaiToken)();
    const borrow = new schema_1.Borrow(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    borrow.hash = event.transaction.hash.toHexString();
    borrow.logIndex = event.logIndex.toI32();
    borrow.protocol = (0, protocol_1.getOrCreateLendingProtocol)().id;
    borrow.to = event.transaction.from.toHexString();
    borrow.from = market.id;
    borrow.blockNumber = event.block.number;
    borrow.timestamp = event.block.timestamp;
    borrow.market = market.id;
    borrow.asset = mai.id;
    borrow.amount = amount;
    borrow.amountUSD = (0, numbers_1.bigIntToBigDecimal)(amount, mai.decimals);
    borrow.save();
    (0, usage_1.updateUsageMetrics)(event, event.transaction.from);
    (0, market_1.handleMarketBorrow)(event, market, borrow);
    (0, usage_1.incrementProtocolBorrowCount)(event);
}
exports.createBorrow = createBorrow;
function createRepay(event, amount, closingFee) {
    if (amount.lt(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.critical("Invalid repay amount: {}", [amount.toString()]);
    }
    const market = (0, market_1.getMarket)(event.address);
    const mai = (0, token_1.getMaiToken)();
    const collateral = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const repay = new schema_1.Repay(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    repay.hash = event.transaction.hash.toHexString();
    repay.logIndex = event.logIndex.toI32();
    repay.protocol = (0, protocol_1.getOrCreateLendingProtocol)().id;
    repay.to = market.id;
    repay.from = event.transaction.from.toHexString();
    repay.blockNumber = event.block.number;
    repay.timestamp = event.block.timestamp;
    repay.market = market.id;
    repay.asset = mai.id;
    repay.amount = amount;
    repay.amountUSD = (0, numbers_1.bigIntToBigDecimal)(amount, mai.decimals);
    repay.save();
    (0, usage_1.updateUsageMetrics)(event, event.transaction.from);
    (0, market_1.handleMarketClosingFee)(event, market, closingFee, collateral);
    (0, market_1.handleMarketRepay)(event, market, repay);
    (0, usage_1.incrementProtocolRepayCount)(event);
}
exports.createRepay = createRepay;
function createLiquidate(event, debtRepaid, amountLiquidated, closingFee, liquidator, liquidatee) {
    const market = (0, market_1.getMarket)(event.address);
    const mai = (0, token_1.getMaiToken)();
    const debtRepaidUSD = (0, numbers_1.bigIntToBigDecimal)(debtRepaid, mai.decimals);
    const collateral = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const liquidate = new schema_1.Liquidate(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    liquidate.hash = event.transaction.hash.toHexString();
    liquidate.logIndex = event.logIndex.toI32();
    liquidate.protocol = (0, protocol_1.getOrCreateLendingProtocol)().id;
    liquidate.to = market.id;
    liquidate.from = liquidator.toHexString();
    liquidate.blockNumber = event.block.number;
    liquidate.timestamp = event.block.timestamp;
    liquidate.market = market.id;
    liquidate.asset = mai.id;
    liquidate.amount = amountLiquidated;
    liquidate.liquidatee = liquidatee;
    liquidate.amountUSD = (0, numbers_1.bigIntToBigDecimal)(amountLiquidated, collateral.decimals).times((0, price_1.getCollateralPrice)(event, event.address, collateral));
    liquidate.profitUSD = liquidate.amountUSD.minus(debtRepaidUSD);
    liquidate.save();
    (0, usage_1.updateUsageMetrics)(event, liquidator);
    (0, market_1.handleMarketClosingFee)(event, market, closingFee, collateral);
    (0, market_1.handleMarketLiquidate)(event, market, liquidate, collateral);
    (0, market_1.updateMarketBorrowBalance)(event, market, constants_1.BIGDECIMAL_ZERO.minus(debtRepaidUSD));
    (0, usage_1.incrementProtocolLiquidateCount)(event);
    (0, protocol_1.addSupplySideRevenue)(event, market, liquidate.profitUSD);
}
exports.createLiquidate = createLiquidate;
