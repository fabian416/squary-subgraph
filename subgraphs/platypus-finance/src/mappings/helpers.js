"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwap = exports.createWithdraw = exports.createDeposit = exports.createAsset = void 0;
const schema_1 = require("../../generated/schema");
const templates_1 = require("../../generated/templates");
const getters_1 = require("../common/getters");
const numbers_1 = require("../common/utils/numbers");
function createAsset(event, poolAddress, tokenAddress, assetAddress) {
    (0, getters_1.getOrCreateAsset)(event, tokenAddress, assetAddress);
    (0, getters_1.getOrCreateAssetPool)(event, assetAddress, poolAddress, tokenAddress);
    templates_1.Asset.create(assetAddress);
}
exports.createAsset = createAsset;
// Generate the deposit entity and update deposit account for the according pool.
function createDeposit(event, amount, inputTokenAddress, assetAddress, liquidity, to, sender) {
    const protocol = (0, getters_1.getOrCreateDexAmm)();
    const deposit = new schema_1.Deposit(event.transaction.hash.toHexString().concat("-").concat(event.logIndex.toString()));
    const pool = (0, getters_1.getOrCreateAssetPool)(event, assetAddress, event.address, inputTokenAddress);
    const inputToken = (0, getters_1.getOrCreateToken)(event, inputTokenAddress);
    deposit.hash = event.transaction.hash.toHexString();
    deposit.logIndex = event.logIndex.toI32();
    deposit.protocol = protocol.id;
    deposit.to = to.toHexString();
    deposit.pool = pool.id;
    deposit.from = sender.toHexString();
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.inputTokens = [inputToken.id];
    deposit.inputTokenAmounts = [amount];
    deposit.outputToken = inputToken._asset;
    deposit.outputTokenAmount = liquidity;
    deposit.amountUSD = (0, numbers_1.tokenAmountToUSDAmount)(inputToken, amount);
    deposit.save();
    return deposit;
}
exports.createDeposit = createDeposit;
// Generate the withdraw entity
function createWithdraw(event, amount, inputTokenAddress, assetAddress, liquidity, to, sender) {
    const withdraw = new schema_1.Withdraw(event.transaction.hash.toHexString().concat("-").concat(event.logIndex.toString()));
    const protocol = (0, getters_1.getOrCreateDexAmm)();
    const pool = (0, getters_1.getOrCreateAssetPool)(event, assetAddress, event.address, inputTokenAddress);
    const inputToken = (0, getters_1.getOrCreateToken)(event, inputTokenAddress);
    withdraw.hash = event.transaction.hash.toHexString();
    withdraw.logIndex = event.logIndex.toI32();
    withdraw.protocol = protocol.id;
    withdraw.to = to.toHexString();
    withdraw.pool = pool.id;
    withdraw.from = sender.toHexString();
    withdraw.blockNumber = event.block.number;
    withdraw.timestamp = event.block.timestamp;
    withdraw.inputTokens = [inputToken.id];
    withdraw.inputTokenAmounts = [amount];
    withdraw.outputToken = inputToken._asset;
    withdraw.outputTokenAmount = liquidity;
    withdraw.amountUSD = (0, numbers_1.tokenAmountToUSDAmount)(inputToken, amount);
    withdraw.save();
    return withdraw;
}
exports.createWithdraw = createWithdraw;
// Handle swaps data and update entities volumes and fees
function createSwap(event, sender, inputTokenAddress, outputTokenAddress, inputAssetAddress, outputAssetAddress, inputTokenAmount, actualOutputTokenAmount, to) {
    const swap = new schema_1.Swap(event.transaction.hash.toHexString().concat("-").concat(event.logIndex.toString()));
    const protocol = (0, getters_1.getOrCreateDexAmm)();
    const inputToken = (0, getters_1.getOrCreateToken)(event, inputTokenAddress);
    const outputToken = (0, getters_1.getOrCreateToken)(event, outputTokenAddress);
    const amountInUsd = (0, numbers_1.tokenAmountToUSDAmount)(inputToken, inputTokenAmount);
    const amountOutUsd = (0, numbers_1.tokenAmountToUSDAmount)(outputToken, actualOutputTokenAmount);
    swap.hash = event.transaction.hash.toHexString();
    swap.logIndex = event.logIndex.toI32();
    swap.protocol = protocol.id;
    swap.to = to.toHexString();
    swap.pool = (0, getters_1.getOrCreateAssetPool)(event, inputAssetAddress, event.address, inputTokenAddress).id;
    swap.fromPool = (0, getters_1.getOrCreateAssetPool)(event, inputAssetAddress, event.address, inputTokenAddress).id;
    swap.toPool = (0, getters_1.getOrCreateAssetPool)(event, outputAssetAddress, event.address, outputTokenAddress).id;
    swap.from = sender.toHexString();
    swap.blockNumber = event.block.number;
    swap.timestamp = event.block.timestamp;
    swap.tokenIn = inputToken.id;
    swap.amountIn = inputTokenAmount;
    swap.amountInUSD = amountInUsd;
    swap.tokenOut = outputToken.id;
    swap.amountOut = actualOutputTokenAmount;
    swap.amountOutUSD = amountOutUsd;
    swap.save();
    return swap;
}
exports.createSwap = createSwap;
