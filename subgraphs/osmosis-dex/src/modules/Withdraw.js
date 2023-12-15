"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.msgExitSwapShareAmountInHandler = exports.msgExitSwapExternAmountOutHandler = exports.msgExitPoolHandler = void 0;
const as_proto_1 = require("as-proto");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const Decoder_1 = require("./Decoder");
const constants = __importStar(require("../common/constants"));
const initializer_1 = require("../common/initializer");
const utils = __importStar(require("../common/utils"));
const Metrics_1 = require("./Metrics");
function createWithdrawTransaction(from, liquidityPool, transaction, block, inputTokenAmounts, sharesBurnt, amountUSD) {
    if (!transaction) {
        return;
    }
    const withdrawTransactionId = "withdraw-" + transaction.hash.toHexString();
    const withdrawTransaction = new schema_1.Withdraw(withdrawTransactionId);
    withdrawTransaction.pool = liquidityPool.id;
    withdrawTransaction.protocol = (0, initializer_1.getOrCreateDexAmmProtocol)().id;
    withdrawTransaction.to = liquidityPool.id;
    withdrawTransaction.from = from;
    withdrawTransaction.hash = transaction.hash.toHexString();
    withdrawTransaction.logIndex = transaction.index;
    withdrawTransaction.inputTokens = liquidityPool.inputTokens;
    withdrawTransaction.outputToken = liquidityPool.outputToken;
    withdrawTransaction.inputTokenAmounts = inputTokenAmounts;
    withdrawTransaction.outputTokenAmount = sharesBurnt;
    withdrawTransaction.amountUSD = amountUSD;
    withdrawTransaction.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
    withdrawTransaction.timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
    withdrawTransaction.save();
}
function msgExitPoolHandler(msgValue, data) {
    const message = as_proto_1.Protobuf.decode(msgValue, Decoder_1.MsgExitPool.decode);
    const liquidityPoolId = constants.Protocol.NAME.concat("-").concat(message.poolId.toString());
    const liquidityPool = schema_1.LiquidityPool.load(liquidityPoolId);
    if (!liquidityPool) {
        return;
    }
    const inputTokenBalances = liquidityPool.inputTokenBalances;
    const inputTokenAmounts = new Array(inputTokenBalances.length).fill(constants.BIGINT_ZERO);
    let nonPositiveBalance = false;
    for (let idx = 0; idx < message.tokenOutMins.length; idx++) {
        const tokenOutMin = message.tokenOutMins[idx];
        const inputTokenIndex = liquidityPool.inputTokens.indexOf(tokenOutMin.denom);
        if (inputTokenIndex >= 0) {
            const amount = tokenOutMin.amount;
            inputTokenAmounts[inputTokenIndex] = amount;
            inputTokenBalances[inputTokenIndex] = inputTokenBalances[inputTokenIndex].minus(amount);
            if (inputTokenBalances[inputTokenIndex] <= constants.BIGINT_ZERO) {
                nonPositiveBalance = true;
                graph_ts_1.log.error("[msgExitPoolHandler] token balance is not postive, this SHOULD NOT happen", []);
            }
        }
    }
    if (!nonPositiveBalance) {
        exitPoolHandler(message.sender, liquidityPool, inputTokenBalances, inputTokenAmounts, message.shareInAmount, data);
    }
}
exports.msgExitPoolHandler = msgExitPoolHandler;
function msgExitSwapExternAmountOutHandler(msgValue, data) {
    const message = as_proto_1.Protobuf.decode(msgValue, Decoder_1.MsgExitSwapExternAmountOut.decode);
    if (!message.tokenOut) {
        return;
    }
    const tokenOut = message.tokenOut;
    exitSwapHandler(message.sender, message.poolId, tokenOut.denom, tokenOut.amount, message.shareInMaxAmount, data);
}
exports.msgExitSwapExternAmountOutHandler = msgExitSwapExternAmountOutHandler;
function msgExitSwapShareAmountInHandler(msgValue, data) {
    const message = as_proto_1.Protobuf.decode(msgValue, Decoder_1.MsgExitSwapShareAmountIn.decode);
    exitSwapHandler(message.sender, message.poolId, message.tokenOutDenom, message.tokenOutMinAmount, message.shareInAmount, data);
}
exports.msgExitSwapShareAmountInHandler = msgExitSwapShareAmountInHandler;
function exitSwapHandler(sender, poolId, tokenOutDenom, tokenOutAmount, shareInAmount, data) {
    const liquidityPoolId = constants.Protocol.NAME.concat("-").concat(poolId.toString());
    const liquidityPool = schema_1.LiquidityPool.load(liquidityPoolId);
    if (!liquidityPool) {
        return;
    }
    const tokenOutIndex = liquidityPool.inputTokens.indexOf(tokenOutDenom);
    if (tokenOutIndex < 0) {
        return;
    }
    const inputTokenBalances = liquidityPool.inputTokenBalances;
    const inputTokenWeights = liquidityPool.inputTokenWeights;
    const inputTokenAmounts = new Array(inputTokenBalances.length).fill(constants.BIGINT_ZERO);
    const tokenOutAmountChange = tokenOutAmount
        .times(utils.bigDecimalToBigInt(inputTokenWeights[tokenOutIndex]))
        .div(constants.BIGINT_HUNDRED);
    let nonPositiveBalance = false;
    for (let i = 0; i < inputTokenAmounts.length; i++) {
        inputTokenAmounts[i] = tokenOutAmountChange
            .times(inputTokenBalances[i])
            .div(inputTokenBalances[tokenOutIndex]);
    }
    for (let i = 0; i < inputTokenBalances.length; i++) {
        inputTokenBalances[i] = inputTokenBalances[i].minus(inputTokenAmounts[i]);
        if (inputTokenBalances[i] <= constants.BIGINT_ZERO) {
            nonPositiveBalance = true;
            graph_ts_1.log.error("[exitSwapHandler] token balance is not postive, this SHOULD NOT happen", []);
        }
    }
    if (!nonPositiveBalance) {
        exitPoolHandler(sender, liquidityPool, inputTokenBalances, inputTokenAmounts, shareInAmount, data);
    }
}
function exitPoolHandler(sender, liquidityPool, inputTokenBalances, inputTokenAmounts, shareInAmount, data) {
    liquidityPool.inputTokenBalances = inputTokenBalances;
    liquidityPool.outputTokenSupply = liquidityPool.outputTokenSupply.minus(shareInAmount);
    liquidityPool.save();
    const prevTVL = liquidityPool.totalValueLockedUSD;
    utils.updatePoolTVL(liquidityPool, data.block);
    createWithdrawTransaction(sender, liquidityPool, data.tx, data.block, inputTokenAmounts, shareInAmount, prevTVL.minus(liquidityPool.totalValueLockedUSD));
    utils.updateProtocolTotalValueLockedUSD(liquidityPool.totalValueLockedUSD.minus(prevTVL));
    (0, Metrics_1.updateMetrics)(data.block, sender, constants.UsageType.WITHDRAW);
}
