"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = exports.PoolManager = void 0;
const arrays_1 = require("../../util/arrays");
const constants_1 = require("../../util/constants");
const poolSnapshot_1 = require("./poolSnapshot");
const numbers_1 = require("../../util/numbers");
const schema_1 = require("../../../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
/**
 * This file contains the PoolManager, which is used to
 * initialize new pools in the protocol.
 *
 * Schema Version:  2.1.1
 * SDK Version:     1.0.0
 * Author(s):
 *  - @steegecs
 *  - @shashwatS22
 */
class PoolManager {
    constructor(protocol, tokens) {
        this.protocol = protocol;
        this.tokens = tokens;
    }
    loadPool(id) {
        let entity = schema_1.Pool.load(id);
        if (entity) {
            return new Pool(this.protocol, entity, this.tokens, true);
        }
        entity = new schema_1.Pool(id);
        entity.protocol = this.protocol.getBytesID();
        const pool = new Pool(this.protocol, entity, this.tokens, false);
        pool.isInitialized = false;
        return pool;
    }
}
exports.PoolManager = PoolManager;
class Pool {
    constructor(protocol, pool, tokens, isInitialized) {
        this.snapshoter = null;
        this.isInitialized = true;
        this.pool = pool;
        this.protocol = protocol;
        this.tokens = tokens;
        if (isInitialized) {
            this.snapshoter = new poolSnapshot_1.PoolSnapshot(pool, protocol.event);
            this.pool.lastUpdateTimestamp = protocol.event.block.timestamp;
            this.save();
        }
    }
    save() {
        this.pool.save();
    }
    initialize(name, symbol, inputTokens, outputToken, isLiquidity) {
        if (this.isInitialized) {
            return;
        }
        const event = this.protocol.getCurrentEvent();
        this.pool.protocol = this.protocol.getBytesID();
        this.pool.name = name;
        this.pool.symbol = symbol;
        this.pool.inputTokens = inputTokens;
        this.pool.outputToken = outputToken ? outputToken.id : null;
        this.pool.isLiquidityToken = isLiquidity ? true : false;
        this.pool.createdTimestamp = event.block.timestamp;
        this.pool.createdBlockNumber = event.block.number;
        this.pool.inputTokenBalances = [];
        this.pool.inputTokenBalancesUSD = [];
        this.pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        this.pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        this.pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        this.pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        this.pool.lastSnapshotDayID = 0;
        this.pool.lastSnapshotHourID = 0;
        this.pool.lastUpdateTimestamp = constants_1.BIGINT_ZERO;
        this.save();
        this.protocol.addPool();
    }
    /**
     * Recalculates the total value locked for this pool based on its current input token balance.
     * This function will also update the protocol's total value locked based on the change in this pool's.
     */
    refreshTotalValueLocked() {
        let totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        for (let idx = 0; idx < this.pool.inputTokens.length; idx++) {
            const inputTokenBalanceUSD = this.pool.inputTokenBalancesUSD[idx];
            totalValueLockedUSD = totalValueLockedUSD.plus(inputTokenBalanceUSD);
        }
        this.setTotalValueLocked(totalValueLockedUSD);
    }
    /**
     * Updates the total value locked for this pool to the given value.
     * Will also update the protocol's total value locked based on the change in this pool's.
     */
    setTotalValueLocked(newTVL) {
        const delta = newTVL.minus(this.pool.totalValueLockedUSD);
        this.addTotalValueLocked(delta);
        this.save();
    }
    /**
     * Adds the given delta to the total value locked for this pool.
     * Will also update the protocol's total value locked based on the change in this pool's.
     *
     * @param delta The change in total value locked for this pool.
     */
    addTotalValueLocked(delta) {
        this.pool.totalValueLockedUSD = this.pool.totalValueLockedUSD.plus(delta);
        this.protocol.addTotalValueLocked(delta);
        this.save();
    }
    /**
     * Utility function to convert some amount of input token to USD.
     *
     * @param amount the amount of inputToken to convert to USD
     * @returns The converted amount.
     */
    getInputTokenAmountPrice(token, amount) {
        const price = this.protocol.getTokenPricer().getTokenPrice(token);
        token.lastPriceUSD = price;
        token.save();
        return amount.divDecimal((0, numbers_1.exponentToBigDecimal)(token.decimals)).times(price);
    }
    /**
     * Sets the pool's input token balance to the given amount. It will optionally
     * update the pool's and protocol's total value locked. If not stated, will default to true.
     *
     * @param amount amount to be set as the pool's input token balance.
     * @param updateMetrics optional parameter to indicate whether to update the pool's and protocol's total value locked.
     */
    setInputTokenBalances(newBalances, updateMetrics = true) {
        this.pool.inputTokenBalances = newBalances;
        this.setInputTokenBalancesUSD();
        if (updateMetrics) {
            this.refreshTotalValueLocked();
        }
    }
    /**
     * Sets the pool's input token balance USD by calculating it for each token.
     */
    setInputTokenBalancesUSD() {
        const inputTokenBalancesUSD = [];
        for (let idx = 0; idx < this.pool.inputTokens.length; idx++) {
            const inputTokenBalance = this.pool.inputTokenBalances[idx];
            const inputToken = this.tokens.getOrCreateToken(graph_ts_1.Address.fromBytes(this.pool.inputTokens[idx]));
            const amountUSD = this.getInputTokenAmountPrice(inputToken, inputTokenBalance);
            inputTokenBalancesUSD.push(amountUSD);
        }
        this.pool.inputTokenBalancesUSD = inputTokenBalancesUSD;
    }
    getBytesID() {
        return this.pool.id;
    }
    /**
     * Adds a given USD value to the pool and protocol supplySideRevenue. It can be a positive or negative amount.
     * Same as for the rest of setters, this is mostly to be called internally by the library.
     * But you can use it if you need to. It will also update the protocol's snapshots.
     * @param rev {BigDecimal} The value to add to the protocol's supplySideRevenue.
     */
    addSupplySideRevenueUSD(rev) {
        this.pool.cumulativeTotalRevenueUSD =
            this.pool.cumulativeTotalRevenueUSD.plus(rev);
        this.pool.cumulativeSupplySideRevenueUSD =
            this.pool.cumulativeSupplySideRevenueUSD.plus(rev);
        this.save();
        this.protocol.addSupplySideRevenueUSD(rev);
    }
    /**
     * Adds a given USD value to the pool and protocol protocolSideRevenue. It can be a positive or negative amount.
     * Same as for the rest of setters, this is mostly to be called internally by the library.
     * But you can use it if you need to. It will also update the protocol's snapshots.
     * @param rev {BigDecimal} The value to add to the protocol's protocolSideRevenue.
     */
    addProtocolSideRevenueUSD(rev) {
        this.pool.cumulativeTotalRevenueUSD =
            this.pool.cumulativeTotalRevenueUSD.plus(rev);
        this.pool.cumulativeProtocolSideRevenueUSD =
            this.pool.cumulativeProtocolSideRevenueUSD.plus(rev);
        this.save();
        this.protocol.addProtocolSideRevenueUSD(rev);
    }
    /**
     * Adds a given USD value to the pool and protocol's supplySideRevenue and protocolSideRevenue. It can be a positive or negative amount.
     * Same as for the rest of setters, this is mostly to be called internally by the library.
     * But you can use it if you need to. It will also update the protocol's snapshots.
     * @param protocolSide {BigDecimal} The value to add to the protocol's protocolSideRevenue.
     * @param supplySide {BigDecimal} The value to add to the protocol's supplySideRevenue.
     */
    addRevenueUSD(protocolSide, supplySide) {
        this.addSupplySideRevenueUSD(supplySide);
        this.addProtocolSideRevenueUSD(protocolSide);
    }
    /**
     * Convenience method to add revenue denominated in the pool's input token. It converts it to USD
     * under the hood and calls addRevenueUSD.
     */
    addRevenueNative(inputToken, protocolSide, supplySide) {
        const pricer = this.protocol.pricer;
        const pAmountUSD = pricer.getAmountValueUSD(inputToken, protocolSide);
        const sAmountUSD = pricer.getAmountValueUSD(inputToken, supplySide);
        this.addRevenueUSD(pAmountUSD, sAmountUSD);
    }
    /**
     * Adds a given amount to the pool's outputTokenSupply. It should only be used for pools
     * of type LIQUIDITY. Or pools that emit some kind of LP token on deposit.
     * @param amount
     */
    addOutputTokenSupply(amount) {
        if (!this.pool.outputTokenSupply) {
            this.pool.outputTokenSupply = constants_1.BIGINT_ZERO;
        }
        this.pool.outputTokenSupply = this.pool.outputTokenSupply.plus(amount);
        this.save();
    }
    /**
     * Sets the pool's outputTokenSupply value. It should only be used for pools
     * of type LIQUIDITY. Or pools that emit some kind of LP token on deposit.
     * It will also update the outputTokenPriceUSD value.
     * @param amount
     */
    setOutputTokenSupply(amount) {
        this.pool.outputTokenSupply = amount;
        this.refreshOutputTokenPriceUSD();
        this.save();
    }
    /**
     * Adds a given amount to the pool's stakedOutputTokenAmount.
     * @param amount
     * @returns
     */
    addStakedOutputTokenAmount(amount) {
        if (!this.pool.stakedOutputTokenAmount) {
            this.pool.stakedOutputTokenAmount = constants_1.BIGINT_ZERO;
            this.save();
            return;
        }
        this.pool.stakedOutputTokenAmount =
            this.pool.stakedOutputTokenAmount.plus(amount);
        this.save();
    }
    /**
     * Sets the pool's stakedOutputTokenAmount value.
     * @param amount
     */
    setStakedOutputTokenAmount(amount) {
        this.pool.stakedOutputTokenAmount = amount;
        this.save();
    }
    /**
     * Updates the price of the pool's output token in USD.
     * This is automatically called when changing the output token supply via setOutputTokenSupply
     * but can be called manually if necessary.
     */
    refreshOutputTokenPriceUSD() {
        if (!this.pool.outputToken) {
            return;
        }
        const token = this.tokens.getOrCreateToken(graph_ts_1.Address.fromBytes(this.pool.outputToken));
        const price = this.protocol.pricer.getTokenPrice(token);
        this.pool.outputTokenPriceUSD = price;
        this.save();
    }
    /**
     * Sets the rewardTokenEmissions and its USD value for a given reward token.
     * It will also create the RewardToken entity and add it to the pool rewardTokens array
     * if not already present.
     * @param type The type of reward token
     * @param token The actual token being rewarded
     * @param amount The daily amount of reward tokens emitted to this pool
     */
    setRewardEmissions(type, token, amount) {
        const rToken = this.tokens.getOrCreateRewardToken(type, token);
        const amountUSD = this.protocol.pricer.getAmountValueUSD(token, amount);
        if (!this.pool.rewardTokens) {
            this.pool.rewardTokens = [rToken.id];
            this.pool.rewardTokenEmissionsAmount = [amount];
            this.pool.rewardTokenEmissionsUSD = [amountUSD];
            this.save();
            return;
        }
        if (this.pool.rewardTokens.includes(rToken.id)) {
            const index = this.pool.rewardTokens.indexOf(rToken.id);
            this.pool.rewardTokenEmissionsAmount = (0, arrays_1.updateArrayAtIndex)(this.pool.rewardTokenEmissionsAmount, amount, index);
            this.pool.rewardTokenEmissionsUSD = (0, arrays_1.updateArrayAtIndex)(this.pool.rewardTokenEmissionsUSD, amountUSD, index);
            this.save();
            return;
        }
        const tokens = this.pool.rewardTokens.concat([rToken.id]);
        const newOrder = (0, arrays_1.sortBytesArray)(tokens);
        let amounts = this.pool.rewardTokenEmissionsAmount.concat([amount]);
        let amountsUSD = this.pool.rewardTokenEmissionsUSD.concat([amountUSD]);
        amounts = (0, arrays_1.sortArrayByReference)(newOrder, tokens, amounts);
        amountsUSD = (0, arrays_1.sortArrayByReference)(newOrder, tokens, amountsUSD);
        this.pool.rewardTokens = tokens;
        this.pool.rewardTokenEmissionsAmount = amounts;
        this.pool.rewardTokenEmissionsUSD = amountsUSD;
        this.save();
    }
}
exports.Pool = Pool;
