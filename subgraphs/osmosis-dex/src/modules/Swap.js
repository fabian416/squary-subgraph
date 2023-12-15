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
exports.msgSwapExactAmountHandler = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants = __importStar(require("../common/constants"));
const initializer_1 = require("../common/initializer");
const utils = __importStar(require("../common/utils"));
const Metrics_1 = require("./Metrics");
function createSwapTransaction(from, liquidityPool, transaction, block, inputToken, inputTokenAmount, amountInUSD, outputToken, outputTokenAmount, amountOutUSD) {
    if (!transaction) {
        return;
    }
    const transactionId = "swap-" + transaction.hash.toHexString();
    const swapTransaction = new schema_1.Swap(transactionId);
    swapTransaction.pool = liquidityPool.id;
    swapTransaction.protocol = (0, initializer_1.getOrCreateDexAmmProtocol)().id;
    swapTransaction.to = liquidityPool.id;
    swapTransaction.from = from;
    swapTransaction.hash = transaction.hash.toHexString();
    swapTransaction.logIndex = transaction.index;
    swapTransaction.tokenIn = inputToken;
    swapTransaction.amountIn = inputTokenAmount;
    swapTransaction.amountInUSD = amountInUSD;
    swapTransaction.tokenOut = outputToken;
    swapTransaction.amountOut = outputTokenAmount;
    swapTransaction.amountOutUSD = amountOutUSD;
    swapTransaction.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
    swapTransaction.timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
    swapTransaction.save();
}
function msgSwapExactAmountHandler(msgValue, data) {
    const events = data.tx.result.events;
    for (let idx = 0; idx < events.length; idx++) {
        if (events[idx].eventType == "token_swapped") {
            swapHandler(events[idx], data.tx, data.block);
        }
    }
}
exports.msgSwapExactAmountHandler = msgSwapExactAmountHandler;
function swapHandler(data, tx, block) {
    const attributes = data.attributes;
    let poolId = "";
    let tokenInAmount = constants.BIGINT_ZERO;
    let tokenInDenom = "";
    let tokenOutAmount = constants.BIGINT_ZERO;
    let tokenOutDenom = "";
    for (let i = 0; i < attributes.length; i++) {
        const key = attributes[i].key;
        const value = attributes[i].value;
        if (key == "pool_id") {
            poolId = value;
        }
        else if (key == "tokens_in" || key == "tokens_out") {
            const j = tokenDataParser(value);
            const tokenAmount = graph_ts_1.BigInt.fromString(value.substring(0, j));
            const tokenDenom = value.substring(j, value.length);
            if (key == "tokens_in") {
                tokenInAmount = tokenAmount;
                tokenInDenom = tokenDenom;
            }
            else {
                tokenOutAmount = tokenAmount;
                tokenOutDenom = tokenDenom;
            }
        }
    }
    const liquidityPoolId = constants.Protocol.NAME.concat("-").concat(poolId);
    const liquidityPool = schema_1.LiquidityPool.load(liquidityPoolId);
    if (!liquidityPool) {
        return;
    }
    swap(poolId, tokenInAmount, tokenInDenom, tokenOutAmount, tokenOutDenom, data, tx, block);
}
function tokenDataParser(tokenData) {
    let i = 0;
    while (i < tokenData.length) {
        const tokeChar = tokenData.charAt(i);
        if (tokeChar == "0" ||
            tokeChar == "1" ||
            tokeChar == "2" ||
            tokeChar == "3" ||
            tokeChar == "4" ||
            tokeChar == "5" ||
            tokeChar == "6" ||
            tokeChar == "7" ||
            tokeChar == "8" ||
            tokeChar == "9") {
            i++;
        }
        else {
            break;
        }
    }
    return i;
}
function swap(poolId, tokenInAmount, tokenInDenom, tokenOutAmount, tokenOutDenom, data, tx, block) {
    const liquidityPoolId = constants.Protocol.NAME.concat("-").concat(poolId);
    const liquidityPool = schema_1.LiquidityPool.load(liquidityPoolId);
    if (!liquidityPool) {
        return;
    }
    const inputTokenBalances = liquidityPool.inputTokenBalances;
    const inputTokenAmounts = new Array(inputTokenBalances.length).fill(constants.BIGINT_ZERO);
    const inputTokens = liquidityPool.inputTokens;
    const tokenInIndex = inputTokens.indexOf(tokenInDenom);
    if (tokenInIndex >= 0) {
        inputTokenBalances[tokenInIndex] = inputTokenBalances[tokenInIndex].plus(tokenInAmount);
        // The input token balance should always be positive, so put a defensive checking here in case something is wrong.
        if (inputTokenBalances[tokenInIndex] <= constants.BIGINT_ZERO) {
            graph_ts_1.log.error("[swap] token balance is not postive, this SHOULD NOT happen", []);
            return;
        }
        inputTokenAmounts[tokenInIndex] = tokenInAmount;
    }
    const tokenOutIndex = inputTokens.indexOf(tokenOutDenom);
    if (tokenOutIndex >= 0) {
        inputTokenBalances[tokenOutIndex] = inputTokenBalances[tokenOutIndex].minus(tokenOutAmount);
        // The input token balance should always be positive, so put a defensive checking here in case something is wrong.
        if (inputTokenBalances[tokenOutIndex] <= constants.BIGINT_ZERO) {
            graph_ts_1.log.error("[swap] token balance is not postive, this SHOULD NOT happen", []);
            return;
        }
        inputTokenAmounts[tokenOutIndex] = tokenOutAmount;
    }
    liquidityPool.inputTokenBalances = inputTokenBalances;
    liquidityPool._inputTokenAmounts = inputTokenAmounts;
    liquidityPool.save();
    let volumeUSD = constants.BIGDECIMAL_ZERO;
    const prevTVL = liquidityPool.totalValueLockedUSD;
    const hasPriceData = utils.updatePoolTVL(liquidityPool, block);
    if (hasPriceData) {
        volumeUSD = updatePriceForSwap(liquidityPoolId, tokenInDenom, tokenInAmount, tokenOutDenom, tokenOutAmount, block.header);
        liquidityPool.cumulativeVolumeUSD = liquidityPool.cumulativeVolumeUSD.plus(volumeUSD);
        liquidityPool.save();
    }
    const sender = data.getAttributeValue("sender");
    createSwapTransaction(sender, liquidityPool, tx, block, tokenInDenom, tokenInAmount, volumeUSD, tokenOutDenom, tokenOutAmount, volumeUSD);
    (0, Metrics_1.updateTokenVolumeAndBalance)(liquidityPoolId, tokenInDenom, tokenInAmount, volumeUSD, block);
    (0, Metrics_1.updateTokenVolumeAndBalance)(liquidityPoolId, tokenOutDenom, tokenOutAmount, volumeUSD, block);
    utils.updateProtocolTotalValueLockedUSD(liquidityPool.totalValueLockedUSD.minus(prevTVL));
    (0, Metrics_1.updateSupplySideRevenue)(liquidityPoolId, volumeUSD, block);
    (0, Metrics_1.updateSnapshotsVolume)(liquidityPoolId, volumeUSD, block);
    (0, Metrics_1.updateMetrics)(block, sender, constants.UsageType.SWAP);
}
function updatePriceForSwap(liquidityPoolId, tokenInDenom, tokenInAmount, tokenOutDenom, tokenOutAmount, header) {
    let volumeUSD = constants.BIGDECIMAL_ZERO;
    const tokenIn = (0, initializer_1.getOrCreateToken)(tokenInDenom);
    const tokenOut = (0, initializer_1.getOrCreateToken)(tokenOutDenom);
    if (tokenIn._isStableCoin && !tokenOut._isStableCoin) {
        volumeUSD = updateOtherTokenPrice(liquidityPoolId, tokenIn, tokenInAmount, tokenOut, tokenOutAmount, header);
    }
    else if (!tokenIn._isStableCoin && tokenOut._isStableCoin) {
        volumeUSD = updateOtherTokenPrice(liquidityPoolId, tokenOut, tokenOutAmount, tokenIn, tokenInAmount, header);
    }
    else if ((tokenIn.id == constants.ATOM_DENOM &&
        tokenOut.id != constants.OSMO_DENOM) ||
        (tokenIn.id == constants.OSMO_DENOM && tokenOut.id != constants.ATOM_DENOM)) {
        volumeUSD = updateOtherTokenPrice(liquidityPoolId, tokenIn, tokenInAmount, tokenOut, tokenOutAmount, header);
    }
    else if ((tokenIn.id != constants.ATOM_DENOM &&
        tokenOut.id == constants.OSMO_DENOM) ||
        (tokenIn.id != constants.OSMO_DENOM && tokenOut.id == constants.ATOM_DENOM)) {
        volumeUSD = updateOtherTokenPrice(liquidityPoolId, tokenOut, tokenOutAmount, tokenIn, tokenInAmount, header);
    }
    return volumeUSD;
}
function updateOtherTokenPrice(liquidityPoolId, baseToken, baseTokenAmount, otherToken, otherTokenAmount, header) {
    const id = (header.time.seconds / constants.SECONDS_PER_DAY).toString();
    if (!baseToken.lastPriceUSD ||
        baseToken.lastPriceUSD <= constants.BIGDECIMAL_ZERO
    // || (otherToken._lastPriceDate != null && otherToken._lastPriceDate == id)
    ) {
        return constants.BIGDECIMAL_ZERO;
    }
    const baseTokenAmountInUSD = utils
        .convertTokenToDecimal(baseTokenAmount, baseToken.decimals)
        .times(baseToken.lastPriceUSD);
    if (!otherToken.id.startsWith("gamm/pool/") &&
        (!otherToken._lastPriceDate || otherToken._lastPriceDate != id)) {
        otherToken.lastPriceUSD = baseTokenAmountInUSD.div(utils.convertTokenToDecimal(otherTokenAmount, otherToken.decimals));
        otherToken.lastPriceBlockNumber = graph_ts_1.BigInt.fromI32(header.height);
        otherToken._lastPriceDate = id;
        otherToken.save();
    }
    return baseTokenAmountInUSD;
}
