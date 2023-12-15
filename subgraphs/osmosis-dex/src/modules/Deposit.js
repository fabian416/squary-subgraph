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
exports.msgJoinSwapShareAmountOutHandler = exports.msgJoinSwapExternAmountInHandler = exports.msgJoinPoolHandler = void 0;
const as_proto_1 = require("as-proto");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const Decoder_1 = require("./Decoder");
const constants = __importStar(require("../common/constants"));
const initializer_1 = require("../common/initializer");
const utils = __importStar(require("../common/utils"));
const Metrics_1 = require("./Metrics");
function createDepositTransaction(from, liquidityPool, transaction, block, inputTokenAmounts, sharesMinted, amountUSD) {
    if (!transaction) {
        return;
    }
    const transactionId = "deposit-" + transaction.hash.toHexString();
    const depositTransaction = new schema_1.Deposit(transactionId);
    depositTransaction.pool = liquidityPool.id;
    depositTransaction.protocol = (0, initializer_1.getOrCreateDexAmmProtocol)().id;
    depositTransaction.to = liquidityPool.id;
    depositTransaction.from = from;
    depositTransaction.hash = transaction.hash.toHexString();
    depositTransaction.logIndex = transaction.index;
    depositTransaction.inputTokens = liquidityPool.inputTokens;
    depositTransaction.inputTokenAmounts = inputTokenAmounts;
    depositTransaction.outputToken = liquidityPool.outputToken;
    depositTransaction.outputTokenAmount = sharesMinted;
    depositTransaction.amountUSD = amountUSD;
    depositTransaction.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
    depositTransaction.timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
    depositTransaction.save();
}
function msgJoinPoolHandler(msgValue, data) {
    const message = as_proto_1.Protobuf.decode(msgValue, Decoder_1.MsgJoinPool.decode);
    const liquidityPoolId = constants.Protocol.NAME.concat("-").concat(message.poolId.toString());
    const liquidityPool = schema_1.LiquidityPool.load(liquidityPoolId);
    if (!liquidityPool) {
        return;
    }
    const inputTokenBalances = liquidityPool.inputTokenBalances;
    const inputTokenAmounts = new Array(inputTokenBalances.length).fill(constants.BIGINT_ZERO);
    for (let idx = 0; idx < message.tokenInMaxs.length; idx++) {
        const tokenInMax = message.tokenInMaxs[idx];
        const inputTokenIndex = liquidityPool.inputTokens.indexOf(tokenInMax.denom);
        if (inputTokenIndex >= 0) {
            const amount = tokenInMax.amount;
            inputTokenAmounts[inputTokenIndex] = amount;
            inputTokenBalances[inputTokenIndex] = inputTokenBalances[inputTokenIndex].plus(amount);
        }
    }
    graph_ts_1.log.warning("msgJoinPoolHandler() at height {} index {}", [
        data.block.header.height.toString(),
        data.tx.index.toString(),
    ]);
    joinPoolHandler(message.sender, liquidityPool, inputTokenBalances, inputTokenAmounts, message.shareOutAmount, data);
}
exports.msgJoinPoolHandler = msgJoinPoolHandler;
function msgJoinSwapExternAmountInHandler(msgValue, data) {
    const message = as_proto_1.Protobuf.decode(msgValue, Decoder_1.MsgJoinSwapExternAmountIn.decode);
    if (!message.tokenIn) {
        return;
    }
    const tokenIn = message.tokenIn;
    joinSwapHandler(message.sender, message.poolId, tokenIn.denom, tokenIn.amount, message.shareOutMinAmount, data);
}
exports.msgJoinSwapExternAmountInHandler = msgJoinSwapExternAmountInHandler;
function msgJoinSwapShareAmountOutHandler(msgValue, data) {
    const message = as_proto_1.Protobuf.decode(msgValue, Decoder_1.MsgJoinSwapShareAmountOut.decode);
    joinSwapHandler(message.sender, message.poolId, message.tokenInDenom, message.tokenInMaxAmount, message.shareOutAmount, data);
}
exports.msgJoinSwapShareAmountOutHandler = msgJoinSwapShareAmountOutHandler;
function joinSwapHandler(sender, poolId, tokenInDenom, tokenInAmount, shareOutAmount, data) {
    const liquidityPoolId = constants.Protocol.NAME.concat("-").concat(poolId.toString());
    const liquidityPool = schema_1.LiquidityPool.load(liquidityPoolId);
    if (!liquidityPool) {
        return;
    }
    const tokenInIndex = liquidityPool.inputTokens.indexOf(tokenInDenom);
    if (tokenInIndex < 0) {
        return;
    }
    const inputTokenBalances = liquidityPool.inputTokenBalances;
    const inputTokenWeights = liquidityPool.inputTokenWeights;
    const inputTokenAmounts = new Array(inputTokenBalances.length).fill(constants.BIGINT_ZERO);
    const tokenInAmountChange = tokenInAmount
        .times(utils.bigDecimalToBigInt(inputTokenWeights[tokenInIndex]))
        .div(constants.BIGINT_HUNDRED);
    for (let i = 0; i < inputTokenAmounts.length; i++) {
        inputTokenAmounts[i] = tokenInAmountChange
            .times(inputTokenBalances[i])
            .div(inputTokenBalances[tokenInIndex]);
    }
    for (let i = 0; i < inputTokenBalances.length; i++) {
        inputTokenBalances[i] = inputTokenBalances[i].plus(inputTokenAmounts[i]);
    }
    joinPoolHandler(sender, liquidityPool, inputTokenBalances, inputTokenAmounts, shareOutAmount, data);
}
function joinPoolHandler(sender, liquidityPool, inputTokenBalances, inputTokenAmounts, shareOutAmount, data) {
    liquidityPool.inputTokenBalances = inputTokenBalances;
    liquidityPool.outputTokenSupply = liquidityPool.outputTokenSupply.plus(shareOutAmount);
    liquidityPool.save();
    const prevTVL = liquidityPool.totalValueLockedUSD;
    utils.updatePoolTVL(liquidityPool, data.block);
    const tvlChange = liquidityPool.totalValueLockedUSD.minus(prevTVL);
    createDepositTransaction(sender, liquidityPool, data.tx, data.block, inputTokenAmounts, shareOutAmount, tvlChange);
    utils.updateProtocolTotalValueLockedUSD(tvlChange);
    (0, Metrics_1.updateMetrics)(data.block, sender, constants.UsageType.DEPOSIT);
}
