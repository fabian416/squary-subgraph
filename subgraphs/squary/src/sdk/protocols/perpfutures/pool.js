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
exports.Pool = exports.PoolManager = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const arrays_1 = require("../../util/arrays");
const enums_1 = require("./enums");
const poolSnapshot_1 = require("./poolSnapshot");
const constants = __importStar(require("../../util/constants"));
const schema_1 = require("../../../../generated/schema");
/**
 * This file contains the PoolManager, which is used to
 * initialize new pools in the protocol.
 *
 * Schema Version:  1.3.3
 * SDK Version:     1.1.8
 * Author(s):
 *  - @harsh9200
 *  - @dhruv-chauhan
 *  - @melotik
 */
class PoolManager {
    constructor(protocol, tokens) {
        this.protocol = protocol;
        this.tokens = tokens;
    }
    loadPool(id) {
        let entity = schema_1.LiquidityPool.load(id);
        if (entity)
            return new Pool(this.protocol, entity, this.tokens);
        entity = new schema_1.LiquidityPool(id);
        entity.protocol = this.protocol.getBytesID();
        const pool = new Pool(this.protocol, entity, this.tokens);
        pool.isInitialized = false;
        return pool;
    }
}
exports.PoolManager = PoolManager;
class Pool {
    constructor(protocol, pool, tokens) {
        this.isInitialized = true;
        this.pool = pool;
        this.protocol = protocol;
        this.tokens = tokens;
        this.snapshoter = new poolSnapshot_1.PoolSnapshot(pool, protocol.event);
    }
    initialize(name, symbol, inputTokens, outputToken, oracle = null) {
        if (this.isInitialized)
            return;
        const event = this.protocol.getCurrentEvent();
        this.pool.protocol = this.protocol.getBytesID();
        this.pool.name = name;
        this.pool.symbol = symbol;
        this.pool.oracle = oracle;
        this.pool.inputTokens = inputTokens.map((token) => token.id);
        this.pool.outputToken = outputToken ? outputToken.id : null;
        this.pool.fees = [];
        this.pool.rewardTokens = [];
        this.pool.createdTimestamp = event.block.timestamp;
        this.pool.createdBlockNumber = event.block.number;
        this.pool.fundingrate = new Array(inputTokens.length).fill(constants.BIGDECIMAL_ZERO);
        this.pool.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeStakeSideRevenueUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeEntryPremiumUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeExitPremiumUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeTotalPremiumUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeDepositPremiumUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeWithdrawPremiumUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeTotalLiquidityPremiumUSD = constants.BIGDECIMAL_ZERO;
        this.pool.longOpenInterestUSD = constants.BIGDECIMAL_ZERO;
        this.pool.shortOpenInterestUSD = constants.BIGDECIMAL_ZERO;
        this.pool.totalOpenInterestUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeUniqueUsers = 0;
        this.pool.cumulativeUniqueDepositors = 0;
        this.pool.cumulativeUniqueBorrowers = 0;
        this.pool.cumulativeUniqueLiquidators = 0;
        this.pool.cumulativeUniqueLiquidatees = 0;
        this.pool.longPositionCount = 0;
        this.pool.shortPositionCount = 0;
        this.pool.openPositionCount = 0;
        this.pool.closedPositionCount = 0;
        this.pool.cumulativePositionCount = 0;
        this.pool.cumulativeVolumeUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeVolumeByTokenAmount = new Array(inputTokens.length).fill(constants.BIGINT_ZERO);
        this.pool.cumulativeVolumeByTokenUSD = new Array(inputTokens.length).fill(constants.BIGDECIMAL_ZERO);
        this.pool.cumulativeInflowVolumeUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeInflowVolumeByTokenAmount = new Array(inputTokens.length).fill(constants.BIGINT_ZERO);
        this.pool.cumulativeInflowVolumeByTokenUSD = new Array(inputTokens.length).fill(constants.BIGDECIMAL_ZERO);
        this.pool.cumulativeClosedInflowVolumeUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeClosedInflowVolumeByTokenAmount = new Array(inputTokens.length).fill(constants.BIGINT_ZERO);
        this.pool.cumulativeClosedInflowVolumeByTokenUSD = new Array(inputTokens.length).fill(constants.BIGDECIMAL_ZERO);
        this.pool.cumulativeOutflowVolumeUSD = constants.BIGDECIMAL_ZERO;
        this.pool.cumulativeOutflowVolumeByTokenAmount = new Array(inputTokens.length).fill(constants.BIGINT_ZERO);
        this.pool.cumulativeOutflowVolumeByTokenUSD = new Array(inputTokens.length).fill(constants.BIGDECIMAL_ZERO);
        this.pool.inputTokenBalances = new Array(inputTokens.length).fill(constants.BIGINT_ZERO);
        this.pool.inputTokenWeights = new Array(inputTokens.length).fill(constants.BIGDECIMAL_ZERO);
        this.pool.outputTokenSupply = constants.BIGINT_ZERO;
        this.pool.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
        this.pool.stakedOutputTokenAmount = constants.BIGINT_ZERO;
        this.pool.rewardTokenEmissionsAmount = [];
        this.pool.rewardTokenEmissionsUSD = [];
        this.pool._lastSnapshotDayID = constants.BIGINT_ZERO;
        this.pool._lastSnapshotHourID = constants.BIGINT_ZERO;
        this.pool._lastUpdateTimestamp = event.block.timestamp;
        this.save();
        this.protocol.addPool();
    }
    save() {
        this.pool._lastUpdateTimestamp = this.protocol.event.block.timestamp;
        this.pool.save();
    }
    getBytesID() {
        return this.pool.id;
    }
    getInputTokens() {
        return this.pool.inputTokens;
    }
    getOutputToken() {
        if (!this.pool.outputToken)
            return graph_ts_1.Bytes.empty();
        return this.pool.outputToken;
    }
    setPoolFee(feeType, feePercentage = null) {
        const feeId = graph_ts_1.Bytes.fromUTF8(feeType)
            .concat(graph_ts_1.Bytes.fromUTF8("-"))
            .concat(this.getBytesID());
        let fees = schema_1.LiquidityPoolFee.load(feeId);
        if (!fees) {
            fees = new schema_1.LiquidityPoolFee(feeId);
            fees.feeType = feeType;
            if (!this.pool.fees.includes(feeId)) {
                const poolFees = this.pool.fees;
                poolFees.push(feeId);
                this.pool.fees = poolFees;
                this.save();
            }
        }
        fees.feePercentage = feePercentage;
        fees.save();
    }
    /**
     * Updates the total value locked for this pool to the given value.
     * Will also update the protocol's total value locked based on the change in this pool's.
     */
    setTotalValueLocked(newTVL) {
        const delta = newTVL.minus(this.pool.totalValueLockedUSD);
        this.addTotalValueLocked(delta);
    }
    /**
     * Adds the given delta to the total value locked for this pool.
     * Will also update the protocol's total value locked based on the change in this pool's.
     *
     * @param delta The change in total value locked for this pool.
     */
    addTotalValueLocked(delta) {
        this.pool.totalValueLockedUSD = this.pool.totalValueLockedUSD.plus(delta);
        this.save();
        this.protocol.addTotalValueLocked(delta);
    }
    /**
     * Recalculates the total value locked for this pool based on its current input token balance.
     * This function will also update the protocol's total value locked based on the change in this pool's.
     */
    refreshTotalValueLocked() {
        let totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
        for (let idx = 0; idx < this.pool.inputTokens.length; idx++) {
            const inputTokenBalance = this.pool.inputTokenBalances[idx];
            const inputToken = this.tokens.getOrCreateTokenFromBytes(this.pool.inputTokens[idx]);
            const amountUSD = this.getInputTokenAmountPrice(inputToken, inputTokenBalance);
            totalValueLockedUSD = totalValueLockedUSD.plus(amountUSD);
        }
        this.setTotalValueLocked(totalValueLockedUSD);
        this.refreshInputTokenWeights();
    }
    /**
     * Adds the given delta to the cumulative volume for this pool.
     * Will also update the protocol's total volume on the change in this pool's.
     * @param delta The change in total value locked for this pool.
     */
    addVolume(delta) {
        this.pool.cumulativeVolumeUSD = this.pool.cumulativeVolumeUSD.plus(delta);
        this.save();
        this.protocol.addVolume(delta);
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
     * Adds a given USD value to the pool and protocol stakeSideRevenue. It can be a positive or negative amount.
     * Same as for the rest of setters, this is mostly to be called internally by the library.
     * But you can use it if you need to. It will also update the protocol's snapshots.
     * @param rev {BigDecimal} The value to add to the protocol's protocolSideRevenue.
     */
    addStakeSideRevenueUSD(rev) {
        this.pool.cumulativeTotalRevenueUSD =
            this.pool.cumulativeTotalRevenueUSD.plus(rev);
        this.pool.cumulativeStakeSideRevenueUSD =
            this.pool.cumulativeStakeSideRevenueUSD.plus(rev);
        this.save();
        this.protocol.addStakeSideRevenueUSD(rev);
    }
    /**
     * Adds a given USD value to the pool and protocol's supplySideRevenue, protocolSideRevenue, and stakeSideRevenue.
     * It can be a positive or negative amount.
     * Same as for the rest of setters, this is mostly to be called internally by the library.
     * But you can use it if you need to. It will also update the protocol's snapshots.
     * @param protocolSide {BigDecimal} The value to add to the protocol's protocolSideRevenue.
     * @param supplySide {BigDecimal} The value to add to the protocol's supplySideRevenue.
     * @param stakeSide {BigDecimal} The value to add to the protocol's stakeSideRevenue.
     */
    addRevenueUSD(protocolSide, supplySide, stakeSide) {
        this.addSupplySideRevenueUSD(supplySide);
        this.addProtocolSideRevenueUSD(protocolSide);
        this.addStakeSideRevenueUSD(stakeSide);
    }
    addRevenueByToken(token, protocolSide, supplySide, stakeSide) {
        const protocolAmountUSD = this.protocol.pricer.getAmountValueUSD(token, protocolSide);
        const supplyAmountUSD = this.protocol.pricer.getAmountValueUSD(token, supplySide);
        const stakeAmountUSD = this.protocol.pricer.getAmountValueUSD(token, stakeSide);
        this.addRevenueUSD(protocolAmountUSD, supplyAmountUSD, stakeAmountUSD);
    }
    /**
     * Adds a given USD value to the pool and protocol entryPremium. It can be a positive or negative amount.
     * Same as for the rest of setters, this is mostly to be called internally by the library.
     * But you can use it if you need to. It will also update the protocol's snapshots.
     * @param premium {BigDecimal} The value to add to the pool and protocol's entryPremium.
     */
    addEntryPremiumUSD(premium) {
        this.pool.cumulativeTotalPremiumUSD =
            this.pool.cumulativeTotalPremiumUSD.plus(premium);
        this.pool.cumulativeEntryPremiumUSD =
            this.pool.cumulativeEntryPremiumUSD.plus(premium);
        this.save();
        this.protocol.addEntryPremiumUSD(premium);
    }
    /**
     * Adds a given USD value to the pool and protocol exitPremium. It can be a positive or negative amount.
     * Same as for the rest of setters, this is mostly to be called internally by the library.
     * But you can use it if you need to. It will also update the protocol's snapshots.
     * @param premium {BigDecimal} The value to add to the pool and protocol's entryPremium.
     */
    addExitPremiumUSD(premium) {
        this.pool.cumulativeTotalPremiumUSD =
            this.pool.cumulativeTotalPremiumUSD.plus(premium);
        this.pool.cumulativeExitPremiumUSD =
            this.pool.cumulativeExitPremiumUSD.plus(premium);
        this.save();
        this.protocol.addExitPremiumUSD(premium);
    }
    /**
     * Adds a given USD value to the pool and protocol depositPremium. It can be a positive or negative amount.
     * Same as for the rest of setters, this is mostly to be called internally by the library.
     * But you can use it if you need to. It will also update the protocol's snapshots.
     * @param premium {BigDecimal} The value to add to the pool and protocol's depositPremium.
     */
    addDepositPremiumUSD(premium) {
        this.pool.cumulativeTotalLiquidityPremiumUSD =
            this.pool.cumulativeTotalLiquidityPremiumUSD.plus(premium);
        this.pool.cumulativeDepositPremiumUSD =
            this.pool.cumulativeDepositPremiumUSD.plus(premium);
        this.save();
        this.protocol.addDepositPremiumUSD(premium);
    }
    /**
     * Adds a given USD value to the pool and protocol withdrawPremium. It can be a positive or negative amount.
     * Same as for the rest of setters, this is mostly to be called internally by the library.
     * But you can use it if you need to. It will also update the protocol's snapshots.
     * @param premium {BigDecimal} The value to add to the pool and protocol's withdrawPremium.
     */
    addWithdrawPremiumUSD(premium) {
        this.pool.cumulativeTotalLiquidityPremiumUSD =
            this.pool.cumulativeTotalLiquidityPremiumUSD.plus(premium);
        this.pool.cumulativeWithdrawPremiumUSD =
            this.pool.cumulativeWithdrawPremiumUSD.plus(premium);
        this.save();
        this.protocol.addWithdrawPremiumUSD(premium);
    }
    addPremiumByToken(token, amount, transactionType) {
        const premiumUSD = this.protocol.pricer.getAmountValueUSD(token, amount);
        if (transactionType == enums_1.TransactionType.DEPOSIT) {
            this.addDepositPremiumUSD(premiumUSD);
        }
        if (transactionType == enums_1.TransactionType.WITHDRAW) {
            this.addWithdrawPremiumUSD(premiumUSD);
        }
        if (transactionType == enums_1.TransactionType.COLLATERAL_IN) {
            this.addEntryPremiumUSD(premiumUSD);
        }
        if (transactionType == enums_1.TransactionType.COLLATERAL_OUT) {
            this.addExitPremiumUSD(premiumUSD);
        }
    }
    /**
     * Adds a given USD value to the pool's long and total openInterestUSD.
     *
     * @param amountChangeUSD {BigDecimal} The value to add to the pool's openInterest in USD.
     */
    updateLongOpenInterestUSD(amountChangeUSD) {
        this.pool.totalOpenInterestUSD =
            this.pool.totalOpenInterestUSD.plus(amountChangeUSD);
        this.pool.longOpenInterestUSD =
            this.pool.longOpenInterestUSD.plus(amountChangeUSD);
        this.save();
        this.protocol.updateLongOpenInterestUSD(amountChangeUSD);
    }
    /**
     * Adds a given USD value to the pool's short and total openInterestUSD.
     *
     * @param amountChangeUSD {BigDecimal} The value to add to the pool's openInterest in USD.
     */
    updateShortOpenInterestUSD(amountChangeUSD) {
        this.pool.totalOpenInterestUSD =
            this.pool.totalOpenInterestUSD.plus(amountChangeUSD);
        this.pool.shortOpenInterestUSD =
            this.pool.shortOpenInterestUSD.plus(amountChangeUSD);
        this.save();
        this.protocol.updateShortOpenInterestUSD(amountChangeUSD);
    }
    /**
     * Adds a given USD value to the pool InflowVolumeUSD. It can be a positive or negative amount.
     * @param volume {BigDecimal} The value to add to the pool's InflowVolumeUSD.
     */
    addInflowVolumeUSD(volume) {
        this.pool.cumulativeInflowVolumeUSD =
            this.pool.cumulativeInflowVolumeUSD.plus(volume);
        this.save();
        this.protocol.addInflowVolumeUSD(volume);
    }
    /**
     * Adds a given USD value to the pool ClosedInflowVolumeUSD. It can be a positive or negative amount.
     * @param volume {BigDecimal} The value to add to the pool's ClosedInflowVolumeUSD.
     */
    addClosedInflowVolumeUSD(volume) {
        this.pool.cumulativeClosedInflowVolumeUSD =
            this.pool.cumulativeClosedInflowVolumeUSD.plus(volume);
        this.save();
        this.protocol.addClosedInflowVolumeUSD(volume);
    }
    /**
     * Adds a given USD value to the pool OutflowVolumeUSD. It can be a positive or negative amount.
     * @param volume {BigDecimal} The value to add to the pool's OutflowVolumeUSD.
     */
    addOutflowVolumeUSD(volume) {
        this.pool.cumulativeOutflowVolumeUSD =
            this.pool.cumulativeOutflowVolumeUSD.plus(volume);
        this.save();
        this.protocol.addOutflowVolumeUSD(volume);
    }
    /**
     * Adds a given amount to the pool's outputTokenSupply. It should only be used for pools
     * of type LIQUIDITY. Or pools that emit some kind of LP token on deposit.
     * @param amount
     */
    addOutputTokenSupply(amount) {
        this.setOutputTokenSupply(this.pool.outputTokenSupply
            ? this.pool.outputTokenSupply.plus(amount)
            : amount);
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
     * Updates the price of the pool's output token in USD.
     * This is automatically called when changing the output token supply via setOutputTokenSupply
     * but can be called manually if necessary.
     */
    refreshOutputTokenPriceUSD() {
        if (!this.pool.outputToken)
            return;
        const token = this.tokens.getOrCreateTokenFromBytes(this.pool.outputToken);
        const price = this.protocol.pricer.getTokenPrice(token);
        this.pool.outputTokenPriceUSD = price;
        this.save();
    }
    /**
     * Adds a given amount to the pool's stakedOutputTokenAmount.
     * @param amount
     * @returns
     */
    addStakedOutputTokenAmount(amount) {
        this.setStakedOutputTokenAmount(this.pool.stakedOutputTokenAmount
            ? this.pool.stakedOutputTokenAmount.plus(amount)
            : amount);
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
     * Utility function to update token price.
     *
     * @param token
     * @returns
     */
    setTokenPrice(token) {
        if (!token.lastPriceBlockNumber ||
            (token.lastPriceBlockNumber &&
                token.lastPriceBlockNumber < this.protocol.event.block.number)) {
            const pricePerToken = this.protocol.getTokenPricer().getTokenPrice(token);
            token.lastPriceUSD = pricePerToken;
            token.lastPriceBlockNumber = this.protocol.event.block.number;
            token.save();
        }
    }
    /**
     * Utility function to convert some amount of input token to USD.
     *
     * @param token
     * @param amount the amount of inputToken to convert to USD
     * @returns The converted amount.
     */
    getInputTokenAmountPrice(token, amount) {
        this.setTokenPrice(token);
        return this.protocol.getTokenPricer().getAmountValueUSD(token, amount);
    }
    /**
     * Recalculates the input token weights for this pool based on its current input token tvl.
     */
    refreshInputTokenWeights() {
        const inputTokenWeights = [];
        for (let idx = 0; idx < this.pool.inputTokens.length; idx++) {
            const inputTokenBalance = this.pool.inputTokenBalances[idx];
            const inputToken = this.tokens.getOrCreateTokenFromBytes(this.pool.inputTokens[idx]);
            const inputTokenTVL = this.getInputTokenAmountPrice(inputToken, inputTokenBalance);
            inputTokenWeights.push(inputTokenTVL
                .div(this.pool.totalValueLockedUSD)
                .times(constants.BIGDECIMAL_HUNDRED));
        }
        this.pool.inputTokenWeights = inputTokenWeights;
        this.pool.save();
    }
    /**
     * Sets the pool's input token balances to the given amount. It will optionally
     * update the pool's and protocol's total value locked. If not stated, will default to true.
     *
     * @param newBalances amount to be set as the pool's input token balance.
     * @param updateMetrics optional parameter to indicate whether to update the pool's and protocol's total value locked.
     */
    setInputTokenBalances(newBalances, updateMetrics = true) {
        this.pool.inputTokenBalances = newBalances;
        this.save();
        if (updateMetrics)
            this.refreshTotalValueLocked();
    }
    /**
     * Sets the pool fundingRate.
     * @param fundingrate pool funding rate.
     */
    setFundingRate(fundingrate) {
        this.pool.fundingrate = fundingrate;
        this.pool.save();
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
        const rToken = this.tokens.getOrCreateRewardToken(token, type);
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
    /**
     * Adds some value to the cumulativeUniqueUsers counter. If the value is omitted it will default to 1.
     * If you are loading accounts with the AccountManager you won't need to use this method.
     * @param count {u8} The value to add to the counter.
     */
    addUser(count = 1) {
        this.pool.cumulativeUniqueUsers += count;
        this.save();
    }
    /**
     * Adds some value to the cumulativeUniqueDepositors counter. If the value is omitted it will default to 1.
     * If you are loading accounts with the AccountManager you won't need to use this method.
     * @param count {u8} The value to add to the counter.
     */
    addDepositor(count = 1) {
        this.pool.cumulativeUniqueDepositors += count;
        this.save();
    }
    /**
     * Adds some value to the cumulativeUniqueBorrowers counter. If the value is omitted it will default to 1.
     * If you are loading accounts with the AccountManager you won't need to use this method.
     * @param count {u8} The value to add to the counter.
     */
    addBorrower(count = 1) {
        this.pool.cumulativeUniqueBorrowers += count;
        this.save();
    }
    /**
     * Adds some value to the cumulativeUniqueLiquidators counter. If the value is omitted it will default to 1.
     * @param count {u8} The value to add to the counter.
     */
    addLiquidator(count = 1) {
        this.pool.cumulativeUniqueLiquidators += count;
        this.save();
    }
    /**
     * Adds some value to the cumulativeUniqueLiquidatees counter. If the value is omitted it will default to 1.
     * @param count {u8} The value to add to the counter.
     */
    addLiquidatee(count = 1) {
        this.pool.cumulativeUniqueLiquidatees += count;
        this.save();
    }
    /**
     * Adds 1 to the cumulativePositionCount counter and adds 1 to the counter corresponding the given position type.
     * @param positionSide {PositionType} The type of transaction to add.
     * @see PositionType
     * @see Account
     */
    openPosition(positionSide) {
        if (positionSide == enums_1.PositionType.LONG) {
            this.pool.longPositionCount += 1;
        }
        else if (positionSide == enums_1.PositionType.SHORT) {
            this.pool.shortPositionCount += 1;
        }
        this.pool.openPositionCount += 1;
        this.pool.cumulativePositionCount += 1;
        this.save();
    }
    /**
     * Subtracts 1 to the cumulativePositionCount counter and adds 1 to the counter corresponding the given position type.
     * @param positionSide {PositionType} The type of transaction to add.
     * @see PositionType
     * @see Account
     */
    closePosition(positionSide) {
        if (positionSide == enums_1.PositionType.LONG) {
            this.pool.longPositionCount -= 1;
        }
        else if (positionSide == enums_1.PositionType.SHORT) {
            this.pool.shortPositionCount -= 1;
        }
        this.pool.openPositionCount -= 1;
        this.pool.closedPositionCount += 1;
        this.save();
    }
    /**
     * Adds the volume of a given input token by its amount and its USD value.
     * It will also add the amount to the total volume of the pool and the protocol
     * @param token The input token
     * @param amount The amount of the token
     */
    addVolumeByToken(token, amount) {
        const amountUSD = this.protocol.pricer.getAmountValueUSD(token, amount);
        const tokenIndex = this.pool.inputTokens.indexOf(token.id);
        if (tokenIndex == -1)
            return;
        const cumulativeVolumeByTokenAmount = this.pool.cumulativeVolumeByTokenAmount;
        const cumulativeVolumeByTokenUSD = this.pool.cumulativeVolumeByTokenUSD;
        cumulativeVolumeByTokenAmount[tokenIndex] =
            cumulativeVolumeByTokenAmount[tokenIndex].plus(amount);
        cumulativeVolumeByTokenUSD[tokenIndex] =
            cumulativeVolumeByTokenUSD[tokenIndex].plus(amountUSD);
        this.pool.cumulativeVolumeByTokenUSD = cumulativeVolumeByTokenUSD;
        this.pool.cumulativeVolumeByTokenAmount = cumulativeVolumeByTokenAmount;
        this.save();
        this.addVolume(amountUSD);
    }
    /**
     * Adds the inflow volume of a given input token by its amount and its USD value.
     * It will also add the amount to the total inflow volume of the pool and the protocol
     * @param token The input token
     * @param amount The amount of the token
     */
    addInflowVolumeByToken(token, amount) {
        const amountUSD = this.protocol.pricer.getAmountValueUSD(token, amount);
        const tokenIndex = this.pool.inputTokens.indexOf(token.id);
        if (tokenIndex == -1)
            return;
        const cumulativeInflowVolumeByTokenAmount = this.pool.cumulativeInflowVolumeByTokenAmount;
        const cumulativeInflowVolumeByTokenUSD = this.pool.cumulativeInflowVolumeByTokenUSD;
        cumulativeInflowVolumeByTokenAmount[tokenIndex] =
            cumulativeInflowVolumeByTokenAmount[tokenIndex].plus(amount);
        cumulativeInflowVolumeByTokenUSD[tokenIndex] =
            cumulativeInflowVolumeByTokenUSD[tokenIndex].plus(amountUSD);
        this.pool.cumulativeInflowVolumeByTokenAmount =
            cumulativeInflowVolumeByTokenAmount;
        this.pool.cumulativeInflowVolumeByTokenUSD =
            cumulativeInflowVolumeByTokenUSD;
        this.save();
        this.addInflowVolumeUSD(amountUSD);
    }
    /**
     * Adds the outflow volume of a given input token by its amount and its USD value.
     * It will also add the amount to the total outflow volume of the pool and the protocol
     * @param token The input token
     * @param amount The amount of the token
     */
    addOutflowVolumeByToken(token, amount) {
        const amountUSD = this.protocol.pricer.getAmountValueUSD(token, amount);
        const tokenIndex = this.pool.inputTokens.indexOf(token.id);
        if (tokenIndex == -1)
            return;
        const cumulativeOutflowVolumeByTokenAmount = this.pool.cumulativeOutflowVolumeByTokenAmount;
        const cumulativeOutflowVolumeByTokenUSD = this.pool.cumulativeOutflowVolumeByTokenUSD;
        cumulativeOutflowVolumeByTokenAmount[tokenIndex] =
            cumulativeOutflowVolumeByTokenAmount[tokenIndex].plus(amount);
        cumulativeOutflowVolumeByTokenUSD[tokenIndex] =
            cumulativeOutflowVolumeByTokenUSD[tokenIndex].plus(amountUSD);
        this.pool.cumulativeOutflowVolumeByTokenAmount =
            cumulativeOutflowVolumeByTokenAmount;
        this.pool.cumulativeOutflowVolumeByTokenUSD =
            cumulativeOutflowVolumeByTokenUSD;
        this.save();
        this.addOutflowVolumeUSD(amountUSD);
    }
    /**
     * Adds the closed inflow volume of a given input token by its amount and its USD value.
     * It will also add the amount to the total closed inflow volume of the pool and the protocol
     * @param token The input token
     * @param amount The amount of the token
     */
    addClosedInflowVolumeByToken(token, amount) {
        const amountUSD = this.protocol.pricer.getAmountValueUSD(token, amount);
        const tokenIndex = this.pool.inputTokens.indexOf(token.id);
        if (tokenIndex == -1)
            return;
        const cumulativeClosedInflowVolumeByTokenAmount = this.pool.cumulativeClosedInflowVolumeByTokenAmount;
        const cumulativeClosedInflowVolumeByTokenUSD = this.pool.cumulativeClosedInflowVolumeByTokenUSD;
        cumulativeClosedInflowVolumeByTokenAmount[tokenIndex] =
            cumulativeClosedInflowVolumeByTokenAmount[tokenIndex].plus(amount);
        cumulativeClosedInflowVolumeByTokenUSD[tokenIndex] =
            cumulativeClosedInflowVolumeByTokenUSD[tokenIndex].plus(amountUSD);
        this.pool.cumulativeClosedInflowVolumeByTokenAmount =
            cumulativeClosedInflowVolumeByTokenAmount;
        this.pool.cumulativeClosedInflowVolumeByTokenUSD =
            cumulativeClosedInflowVolumeByTokenUSD;
        this.save();
        this.addClosedInflowVolumeUSD(amountUSD);
    }
}
exports.Pool = Pool;
