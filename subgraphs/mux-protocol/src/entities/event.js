"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwap = exports.createLiquidate = exports.createCollateralOut = exports.createCollateralIn = exports.createBorrow = exports.createWithdraw = exports.createDeposit = exports.EventType = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const token_1 = require("./token");
const protocol_1 = require("./protocol");
const constants_1 = require("../utils/constants");
var EventType;
(function (EventType) {
    EventType[EventType["Deposit"] = 0] = "Deposit";
    EventType[EventType["Withdraw"] = 1] = "Withdraw";
    EventType[EventType["CollateralIn"] = 2] = "CollateralIn";
    EventType[EventType["CollateralOut"] = 3] = "CollateralOut";
    EventType[EventType["ClosePosition"] = 4] = "ClosePosition";
    EventType[EventType["Swap"] = 5] = "Swap";
    EventType[EventType["Liquidate"] = 6] = "Liquidate";
    EventType[EventType["Liquidated"] = 7] = "Liquidated";
})(EventType = exports.EventType || (exports.EventType = {}));
// Create a Deposit entity and update deposit count on a liquid providing event for the specific pool..
function createDeposit(event, pool, accountAddress, inputTokenAddress, inputTokenAmount, inputTokenAmountUSD, outputTokenAmount) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const transactionHash = event.transaction.hash;
    const logIndexI32 = event.logIndex.toI32();
    const deposit = new schema_1.Deposit(transactionHash.concatI32(logIndexI32));
    deposit.hash = transactionHash;
    deposit.logIndex = logIndexI32;
    deposit.protocol = protocol.id;
    deposit.to = pool.id;
    deposit.from = accountAddress;
    deposit.account = accountAddress;
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.inputTokens = pool.inputTokens;
    const inputTokenAmounts = new Array(deposit.inputTokens.length).fill(constants_1.BIGINT_ZERO);
    const inputToken = (0, token_1.getOrCreateToken)(event, inputTokenAddress);
    const inputTokenIndex = deposit.inputTokens.indexOf(inputToken.id);
    if (inputTokenIndex >= 0) {
        inputTokenAmounts[inputTokenIndex] = inputTokenAmount;
    }
    deposit.inputTokenAmounts = inputTokenAmounts;
    deposit.outputToken = pool.outputToken;
    deposit.outputTokenAmount = outputTokenAmount;
    deposit.amountUSD = inputTokenAmountUSD;
    deposit.pool = pool.id;
    deposit.save();
}
exports.createDeposit = createDeposit;
function createWithdraw(event, pool, accountAddress, inputTokenAddress, inputTokenAmount, inputTokenAmountUSD, outputTokenAmount) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const transactionHash = event.transaction.hash;
    const logIndexI32 = event.logIndex.toI32();
    const withdrawal = new schema_1.Withdraw(transactionHash.concatI32(logIndexI32));
    withdrawal.hash = transactionHash;
    withdrawal.logIndex = logIndexI32;
    withdrawal.protocol = protocol.id;
    withdrawal.to = accountAddress;
    withdrawal.from = pool.id;
    withdrawal.account = accountAddress;
    withdrawal.blockNumber = event.block.number;
    withdrawal.timestamp = event.block.timestamp;
    withdrawal.inputTokens = pool.inputTokens;
    const inputTokenAmounts = new Array(withdrawal.inputTokens.length).fill(constants_1.BIGINT_ZERO);
    const inputToken = (0, token_1.getOrCreateToken)(event, inputTokenAddress);
    const inputTokenIndex = withdrawal.inputTokens.indexOf(inputToken.id);
    if (inputTokenIndex >= 0) {
        inputTokenAmounts[inputTokenIndex] = inputTokenAmount;
    }
    withdrawal.inputTokenAmounts = inputTokenAmounts;
    withdrawal.outputToken = pool.outputToken;
    withdrawal.outputTokenAmount = outputTokenAmount;
    withdrawal.amountUSD = inputTokenAmountUSD;
    withdrawal.pool = pool.id;
    withdrawal.save();
}
exports.createWithdraw = createWithdraw;
function createBorrow(event, pool, accountAddress, inputTokenAddress, inputTokenAmount, inputTokenAmountUSD, position) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const transactionHash = event.transaction.hash;
    const logIndexI32 = event.logIndex.toI32();
    const borrow = new schema_1.Borrow(graph_ts_1.Bytes.fromUTF8("borrow").concat(transactionHash.concatI32(logIndexI32)));
    borrow.hash = transactionHash;
    borrow.logIndex = logIndexI32;
    borrow.protocol = protocol.id;
    borrow.to = pool.id;
    borrow.from = accountAddress;
    borrow.account = accountAddress;
    borrow.position = position.id;
    borrow.blockNumber = event.block.number;
    borrow.timestamp = event.block.timestamp;
    borrow.asset = inputTokenAddress;
    borrow.amount = inputTokenAmount;
    borrow.amountUSD = inputTokenAmountUSD;
    borrow.pool = pool.id;
    borrow.save();
}
exports.createBorrow = createBorrow;
function createCollateralIn(event, pool, accountAddress, inputTokenAddress, inputTokenAmount, inputTokenAmountUSD, outputTokenAmount, position) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const transactionHash = event.transaction.hash;
    const logIndexI32 = event.logIndex.toI32();
    const collateralIn = new schema_1.CollateralIn(transactionHash.concatI32(logIndexI32));
    collateralIn.hash = transactionHash;
    collateralIn.logIndex = logIndexI32;
    collateralIn.protocol = protocol.id;
    collateralIn.to = pool.id;
    collateralIn.from = accountAddress;
    collateralIn.account = accountAddress;
    collateralIn.position = position.id;
    collateralIn.blockNumber = event.block.number;
    collateralIn.timestamp = event.block.timestamp;
    collateralIn.inputTokens = pool.inputTokens;
    const inputTokenAmounts = new Array(collateralIn.inputTokens.length).fill(constants_1.BIGINT_ZERO);
    const inputToken = (0, token_1.getOrCreateToken)(event, inputTokenAddress);
    const inputTokenIndex = collateralIn.inputTokens.indexOf(inputToken.id);
    if (inputTokenIndex >= 0) {
        inputTokenAmounts[inputTokenIndex] = inputTokenAmount;
    }
    collateralIn.inputTokenAmounts = inputTokenAmounts;
    collateralIn.outputToken = pool.outputToken;
    collateralIn.outputTokenAmount = outputTokenAmount;
    collateralIn.amountUSD = inputTokenAmountUSD;
    collateralIn.pool = pool.id;
    collateralIn.save();
}
exports.createCollateralIn = createCollateralIn;
function createCollateralOut(event, pool, accountAddress, inputTokenAddress, inputTokenAmount, inputTokenAmountUSD, outputTokenAmount, position) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const transactionHash = event.transaction.hash;
    const logIndexI32 = event.logIndex.toI32();
    const collateralOut = new schema_1.CollateralOut(transactionHash.concatI32(logIndexI32));
    collateralOut.hash = transactionHash;
    collateralOut.logIndex = logIndexI32;
    collateralOut.protocol = protocol.id;
    collateralOut.to = accountAddress;
    collateralOut.from = pool.id;
    collateralOut.account = accountAddress;
    collateralOut.position = position.id;
    collateralOut.blockNumber = event.block.number;
    collateralOut.timestamp = event.block.timestamp;
    collateralOut.inputTokens = pool.inputTokens;
    const inputTokenAmounts = new Array(collateralOut.inputTokens.length).fill(constants_1.BIGINT_ZERO);
    const inputToken = (0, token_1.getOrCreateToken)(event, inputTokenAddress);
    const inputTokenIndex = collateralOut.inputTokens.indexOf(inputToken.id);
    if (inputTokenIndex >= 0) {
        inputTokenAmounts[inputTokenIndex] = inputTokenAmount;
    }
    collateralOut.inputTokenAmounts = inputTokenAmounts;
    collateralOut.outputToken = pool.outputToken;
    collateralOut.outputTokenAmount = outputTokenAmount;
    collateralOut.amountUSD = inputTokenAmountUSD;
    collateralOut.pool = pool.id;
    collateralOut.save();
}
exports.createCollateralOut = createCollateralOut;
function createLiquidate(event, pool, asset, amountLiquidated, amountLiquidatedUSD, profitUSD, liquidator, liquidatee, position) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const transactionHash = event.transaction.hash;
    const logIndexI32 = event.logIndex.toI32();
    const liquidate = new schema_1.Liquidate(transactionHash.concatI32(logIndexI32));
    liquidate.hash = transactionHash;
    liquidate.logIndex = logIndexI32;
    liquidate.protocol = protocol.id;
    liquidate.position = position.id;
    liquidate.to = liquidator;
    liquidate.from = liquidatee;
    liquidate.blockNumber = event.block.number;
    liquidate.timestamp = event.block.timestamp;
    liquidate.account = liquidator;
    liquidate.liquidatee = liquidatee;
    liquidate.asset = asset;
    liquidate.amount = amountLiquidated;
    liquidate.amountUSD = amountLiquidatedUSD;
    liquidate.profitUSD = profitUSD;
    liquidate.pool = pool.id;
    liquidate.save();
}
exports.createLiquidate = createLiquidate;
function createSwap(event, pool, accountAddress, inputTokenAddress, inputTokenAmount, inputTokenAmountUSD, outputTokenAddress, outputTokenAmount, outputTokenAmountUSD) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const transactionHash = event.transaction.hash;
    const logIndexI32 = event.logIndex.toI32();
    const swap = new schema_1.Swap(transactionHash.concatI32(logIndexI32));
    swap.hash = transactionHash;
    swap.logIndex = logIndexI32;
    swap.protocol = protocol.id;
    swap.to = pool.id;
    swap.from = accountAddress;
    swap.account = accountAddress;
    swap.blockNumber = event.block.number;
    swap.timestamp = event.block.timestamp;
    swap.tokenIn = inputTokenAddress;
    swap.amountIn = inputTokenAmount;
    swap.amountInUSD = inputTokenAmountUSD;
    swap.tokenOut = outputTokenAddress;
    swap.amountOut = outputTokenAmount;
    swap.amountOutUSD = outputTokenAmountUSD;
    swap.tradingPair = pool.id;
    swap.pool = pool.id;
    swap.save();
}
exports.createSwap = createSwap;
