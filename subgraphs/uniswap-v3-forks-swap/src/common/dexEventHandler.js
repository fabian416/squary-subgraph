"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexEventHandler = exports.RawDeltas = void 0;
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const pool_1 = require("./entities/pool");
const protocol_1 = require("./entities/protocol");
const token_1 = require("./entities/token");
const account_1 = require("./entities/account");
const schema_1 = require("../../generated/schema");
class RawDeltas {
    constructor(inputTokenBalancesDeltas) {
        this.inputTokenBalancesDeltas = inputTokenBalancesDeltas;
    }
}
exports.RawDeltas = RawDeltas;
class DexEventHandler {
    constructor(event, pool, deltas) {
        this.event = event;
        this.eventType = constants_1.EventType.UNKNOWN;
        this.account = (0, account_1.getOrCreateAccount)(event.transaction.from);
        this.protocol = (0, protocol_1.getOrCreateProtocol)();
        this.pool = pool;
        this.poolTokens = getTokens(pool);
        // Raw Deltas
        this.inputTokenBalanceDeltas = deltas.inputTokenBalancesDeltas;
        // Pool Token Deltas and Balances
        this.inputTokenBalances = (0, utils_1.sumBigIntListByIndex)([
            pool.inputTokenBalances,
            this.inputTokenBalanceDeltas,
        ]);
        this.inputTokenBalancesUSD = new Array(this.poolTokens.length).fill(constants_1.BIGDECIMAL_ZERO);
        this.inputTokenBalanceDeltasUSD = new Array(this.poolTokens.length).fill(constants_1.BIGDECIMAL_ZERO);
    }
    createSwap(tokensInIdx, tokensOutIdx, from, tick) {
        this.eventType = constants_1.EventType.SWAP;
        this.pool.tick = tick;
        // create Swap event
        const swap = new schema_1.Swap(this.event.transaction.hash.concatI32(this.event.logIndex.toI32()));
        swap.hash = this.event.transaction.hash;
        swap.nonce = this.event.transaction.nonce;
        swap.logIndex = this.event.logIndex.toI32();
        swap.gasLimit = this.event.transaction.gasLimit;
        swap.gasPrice = this.event.transaction.gasPrice;
        swap.protocol = this.protocol.id;
        swap.account = from;
        swap.pool = this.pool.id;
        swap.blockNumber = this.event.block.number;
        swap.timestamp = this.event.block.timestamp;
        swap.tick = tick;
        swap.tokenIn = this.pool.inputTokens[tokensInIdx];
        swap.amountIn = this.inputTokenBalanceDeltas[tokensInIdx];
        swap.amountInUSD = this.inputTokenBalanceDeltasUSD[tokensInIdx];
        swap.tokenOut = this.pool.inputTokens[tokensOutIdx];
        swap.amountOut =
            this.inputTokenBalanceDeltas[tokensOutIdx].times(constants_1.BIGINT_NEG_ONE);
        swap.amountOutUSD = this.inputTokenBalanceDeltasUSD[tokensOutIdx];
        const pool = (0, pool_1.getLiquidityPool)(this.event.address);
        if (pool) {
            const reserve0Amount = pool.inputTokenBalances[0];
            const reserve1Amount = pool.inputTokenBalances[1];
            swap.reserveAmounts = [reserve0Amount, reserve1Amount];
        }
        swap.save();
        this.pool.save();
    }
    updateAndSaveLiquidityPoolEntity() {
        this.pool.inputTokenBalances = this.inputTokenBalances;
        this.pool.inputTokenBalancesUSD = this.inputTokenBalancesUSD;
        if (this.eventType == constants_1.EventType.SWAP) {
            this.pool.cumulativeSwapCount += constants_1.INT_ONE;
        }
        this.pool.lastUpdateBlockNumber = this.event.block.number;
        this.pool.lastUpdateTimestamp = this.event.block.timestamp;
        this.pool.save();
    }
    updateAndSaveAccountEntity() {
        this.account.swapCount += constants_1.INT_ONE;
        this.account.save();
    }
}
exports.DexEventHandler = DexEventHandler;
// Return all tokens given a pool
function getTokens(pool) {
    const tokens = [];
    for (let i = 0; i < pool.inputTokens.length; i++) {
        tokens.push((0, token_1.getOrCreateToken)(pool.inputTokens[i]));
    }
    return tokens;
}
