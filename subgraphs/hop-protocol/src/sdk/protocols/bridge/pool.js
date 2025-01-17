"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = exports.PoolManager = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../generated/schema");
const enums_1 = require("./enums");
const constants_1 = require("../../util/constants");
const numbers_1 = require("../../util/numbers");
const arrays_1 = require("../../util/arrays");
const poolSnapshot_1 = require("./poolSnapshot");
class PoolManager {
    constructor(protocol, tokens) {
        this.protocol = protocol;
        this.tokens = tokens;
    }
    loadPool(id, onCreate = null, aux = null) {
        let entity = schema_1.Pool.load(id);
        if (entity) {
            return new Pool(this.protocol, entity, this.tokens);
        }
        entity = new schema_1.Pool(id);
        entity.protocol = this.protocol.getBytesID();
        const pool = new Pool(this.protocol, entity, this.tokens);
        pool.isInitialized = false;
        if (onCreate) {
            onCreate(this.protocol.getCurrentEvent(), pool, this.protocol.sdk, aux);
        }
        return pool;
    }
}
exports.PoolManager = PoolManager;
class Pool {
    constructor(protocol, pool, tokens) {
        this.snapshoter = null;
        this.isInitialized = true;
        this.pool = pool;
        this.protocol = protocol;
        this.tokens = tokens;
        this.snapshoter = new poolSnapshot_1.PoolSnapshot(pool, protocol.event);
    }
    save() {
        this.pool.save();
    }
    getInputToken() {
        return this.tokens.getOrCreateToken(graph_ts_1.Address.fromBytes(this.pool.inputToken));
    }
    initialize(name, symbol, type, inputToken) {
        if (this.isInitialized) {
            return;
        }
        const event = this.protocol.getCurrentEvent();
        this.pool.name = name;
        this.pool.symbol = symbol;
        this.pool.type = type;
        this.pool.inputToken = inputToken.id;
        this.pool.destinationTokens = [];
        this.pool.routes = [];
        this.pool.createdTimestamp = event.block.timestamp;
        this.pool.createdBlockNumber = event.block.number;
        if (type == enums_1.BridgePoolType.BURN_MINT) {
            this.pool.mintSupply = constants_1.BIGINT_ZERO;
        }
        this.pool.inputTokenBalance = constants_1.BIGINT_ZERO;
        this.pool._inputTokenLiquidityBalance = constants_1.BIGINT_ZERO;
        this.pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        this.pool.netValueExportedUSD = constants_1.BIGDECIMAL_ZERO;
        this.pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        this.pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        this.pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        this.pool.cumulativeVolumeIn = constants_1.BIGINT_ZERO;
        this.pool.cumulativeVolumeOut = constants_1.BIGINT_ZERO;
        this.pool.netVolume = constants_1.BIGINT_ZERO;
        this.pool.cumulativeVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        this.pool.cumulativeVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        this.pool.netVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        this.pool._lastDailySnapshotTimestamp = constants_1.BIGINT_ZERO;
        this.pool._lastHourlySnapshotTimestamp = constants_1.BIGINT_ZERO;
        this.save();
        this.protocol.addPool();
        this.tokens.registerSupportedToken(graph_ts_1.Address.fromBytes(inputToken.id));
    }
    addRouteAndCrossToken(route, token) {
        const routes = this.pool.routes;
        const tokens = this.pool.destinationTokens;
        routes.push(route.id);
        tokens.push(route.crossToken);
        this.pool.routes = routes;
        this.pool.destinationTokens = tokens;
        this.save();
        if (token.type == enums_1.CrosschainTokenType.CANONICAL) {
            this.protocol.addCanonicalPoolRoute();
        }
        else {
            this.protocol.addWrappedPoolRoute();
        }
        this.protocol.addSupportedNetwork(token.chainID);
    }
    routeIDFromCrosschainToken(token) {
        const chainIDs = [this.protocol.getCurrentChainID(), token.chainID].sort();
        return graph_ts_1.Bytes.fromUTF8(`${this.pool.id.toHexString()}-${token.id.toHexString()}-${chainIDs[0]}-${chainIDs[1]}`);
    }
    _addInputTokenLiquidityBalance(delta) {
        this.pool._inputTokenLiquidityBalance =
            this.pool._inputTokenLiquidityBalance.plus(delta);
        this.save();
    }
    /**
     * Retrieves the PoolRoute associated with the given token on this pool.
     *
     * @param token The token in the other chain
     * @returns The route which connects this pool to that token.
     */
    getDestinationTokenRoute(token) {
        const id = this.routeIDFromCrosschainToken(token);
        return schema_1.PoolRoute.load(id);
    }
    /**
     * Registers the given token as one to which we can bridge from this pool.
     * If it is already registered, this function does nothing.
     * Otherwise, it will create a new PoolRoute and add it to the pool. It will also
     * update the route counters on the Protocol entity and add the network to the
     * list of supported networks.
     *
     * @param token
     */
    addDestinationToken(token) {
        let route = this.getDestinationTokenRoute(token);
        if (route) {
            return;
        }
        const event = this.protocol.getCurrentEvent();
        const id = this.routeIDFromCrosschainToken(token);
        route = new schema_1.PoolRoute(id);
        route.pool = this.pool.id;
        route.counterType = inferCounterType(this.pool.type, token);
        route.inputToken = this.pool.inputToken;
        route.crossToken = token.id;
        route.isSwap = this.isSwap(token);
        route.cumulativeVolumeIn = constants_1.BIGINT_ZERO;
        route.cumulativeVolumeOut = constants_1.BIGINT_ZERO;
        route.cumulativeVolumeInUSD = constants_1.BIGDECIMAL_ZERO;
        route.cumulativeVolumeOutUSD = constants_1.BIGDECIMAL_ZERO;
        route.createdTimestamp = event.block.timestamp;
        route.createdBlockNumber = event.block.number;
        route.save();
        this.addRouteAndCrossToken(route, token);
    }
    isSwap(token) {
        if (!token.token) {
            return true;
        }
        return this.pool.inputToken != token.token;
    }
    /**
     * Recalculates the total value locked for this pool based on its current input token balance.
     * This function will also update the protocol's total value locked based on the change in this pool's.
     */
    refreshTotalValueLocked() {
        const tvl = this.getInputTokenAmountPrice(this.pool.inputTokenBalance);
        this.setTotalValueLocked(tvl);
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
     * Updates the net value exported for this pool to the given value.
     * Will also update the protocol's net value exported based on the change in this pool's.
     *
     * @param newNetValueExported The new net value exported for this pool.
     */
    setNetValueExportedUSD(newNetValueExported) {
        const delta = newNetValueExported.minus(this.pool.netValueExportedUSD);
        this.addNetValueExportedUSD(delta);
    }
    /**
     * Adds the given delta to the net value exported for this pool.
     * Will also update the protocol's net value exported based on the change in this pool's.
     * Since at the protocol level valueExported is broken down into totalValueExported and totalValueImported,
     * it is a bit tricky to update those. In order to do so, we deduct the current netValueExported from
     * the protocols, recalculate the pool's netValueExported, and then add it back again to the protocol.
     *
     * @param delta The change in net value exported for this pool.
     */
    addNetValueExportedUSD(delta) {
        this.resetProtocolValueExportedUSD();
        this.pool.netValueExportedUSD = this.pool.netValueExportedUSD.plus(delta);
        if (this.pool.netValueExportedUSD.lt(constants_1.BIGDECIMAL_ZERO)) {
            this.protocol.addTotalValueImportedUSD(this.pool.netValueExportedUSD.times(constants_1.BIGDECIMAL_MINUS_ONE));
        }
        else {
            this.protocol.addTotalValueExportedUSD(this.pool.netValueExportedUSD);
        }
        this.save();
    }
    /**
     * Removes this pool totalValueExported from the protocol's total value exported. To be added later
     * in a cleaner way.
     */
    resetProtocolValueExportedUSD() {
        if (this.pool.netValueExportedUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
            this.protocol.addTotalValueExportedUSD(this.pool.netValueExportedUSD.times(constants_1.BIGDECIMAL_MINUS_ONE));
        }
        else {
            this.protocol.addTotalValueImportedUSD(this.pool.netValueExportedUSD);
        }
    }
    /**
     * Recalculates the net value exported for this pool based on its current input token balance and minted supplies,
     * adjusting for liquidity. Value exported is the USD value of all assets currently in this chain that have been bridged
     * from another one, or the other way around: all assets currently in the other chain that have been bridged from this one.
     * Lock/Release pools will have a positive net value exported, while Burn/Mint pools will have a negative net value exported.
     * Liquidity based pools' value exported will be the difference between its balance and total liquidity provisioned to it. If
     * balance is lower than total liquidity provided then it means we bridged funds into this chain.
     * @returns
     */
    refreshNetValueExportedUSD() {
        let amount = constants_1.BIGINT_ZERO;
        const type = this.pool.type;
        if (type == enums_1.BridgePoolType.LOCK_RELEASE) {
            amount = this.pool.inputTokenBalance;
        }
        else if (type == enums_1.BridgePoolType.BURN_MINT) {
            amount = this.pool.mintSupply.times(constants_1.BIGINT_MINUS_ONE);
        }
        else if (type == enums_1.BridgePoolType.LIQUIDITY) {
            amount = this.pool.inputTokenBalance.minus(this.pool._inputTokenLiquidityBalance);
        }
        const val = this.getInputTokenAmountPrice(amount);
        this.setNetValueExportedUSD(val);
    }
    /**
     * Utility function to convert some amount of input token to USD.
     *
     * @param amount the amount of inputToken to convert to USD
     * @returns The converted amount.
     */
    getInputTokenAmountPrice(amount) {
        const token = this.getInputToken();
        const price = this.protocol.getTokenPricer().getTokenPrice(token);
        token.lastPriceUSD = price;
        token.save();
        return (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals).times(price);
    }
    /**
     * Adds the given amount to the pool's input token balance. It will optionally
     * update the pool's and protocol's total value locked. If not stated, will default to true.
     *
     * @param amount amount to be added to the pool's input token balance.
     * @param updateMetrics optional parameter to indicate whether to update the pool's and protocol's total value locked.
     */
    addInputTokenBalance(amount, updateMetrics = false) {
        const newBalance = this.pool.inputTokenBalance.plus(amount);
        this.setInputTokenBalance(newBalance, updateMetrics);
    }
    /**
     * Sets the pool's input token balance to the given amount. It will optionally
     * update the pool's and protocol's total value locked. If not stated, will default to true.
     *
     * @param amount amount to be set as the pool's input token balance.
     * @param updateMetrics optional parameter to indicate whether to update the pool's and protocol's total value locked.
     */
    setInputTokenBalance(newBalance, updateMetrics = true) {
        this.pool.inputTokenBalance = newBalance;
        if (updateMetrics) {
            this.refreshTotalValueLocked();
            this.refreshNetValueExportedUSD();
        }
    }
    getBytesID() {
        return this.pool.id;
    }
    /**
     * Adds the given volume to the Pool, Protocol and Route.
     *
     * @param isOutgoing true for volumeOut, false for volumeIn
     * @param route the route for which to add volume
     * @param amount amount of input token to add as volume
     * @param amountUSD optional amount of USD to add as volume. If not set it will be calculated with the Pricer.
     */
    addVolume(isOutgoing, route, amount, amountUSD) {
        if (!amountUSD) {
            amountUSD = this.getInputTokenAmountPrice(amount);
        }
        if (isOutgoing) {
            route.cumulativeVolumeOut = route.cumulativeVolumeOut.plus(amount);
            route.cumulativeVolumeOutUSD =
                route.cumulativeVolumeOutUSD.plus(amountUSD);
            this.pool.cumulativeVolumeOut =
                this.pool.cumulativeVolumeOut.plus(amount);
            this.pool.cumulativeVolumeOutUSD =
                this.pool.cumulativeVolumeOutUSD.plus(amountUSD);
            this.pool.netVolume = this.pool.netVolume.minus(amount);
            this.pool.netVolumeUSD = this.pool.netVolumeUSD.minus(amountUSD);
            this.protocol.addVolumeOutUSD(amountUSD);
        }
        else {
            route.cumulativeVolumeIn = route.cumulativeVolumeIn.plus(amount);
            route.cumulativeVolumeInUSD = route.cumulativeVolumeInUSD.plus(amountUSD);
            this.pool.cumulativeVolumeIn = this.pool.cumulativeVolumeIn.plus(amount);
            this.pool.cumulativeVolumeInUSD =
                this.pool.cumulativeVolumeInUSD.plus(amountUSD);
            this.pool.netVolume = this.pool.netVolume.plus(amount);
            this.pool.netVolumeUSD = this.pool.netVolumeUSD.plus(amountUSD);
            this.protocol.addVolumeInUSD(amountUSD);
        }
        route.save();
        this.save();
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
    addRevenueNative(protocolSide, supplySide) {
        const pricer = this.protocol.pricer;
        const inputToken = this.getInputToken();
        const pAmountUSD = pricer.getAmountValueUSD(inputToken, protocolSide);
        const sAmountUSD = pricer.getAmountValueUSD(inputToken, supplySide);
        this.addRevenueUSD(pAmountUSD, sAmountUSD);
    }
    /**
     * Adds a given amount to the pool's mintSupply. It should only be used for pools of type BURN_MINT.
     * @param amount {BigInt} The amount to add to the pool's mintSupply. It can be positive or negative.
     */
    addMintSupply(amount) {
        this.pool.mintSupply = this.pool.mintSupply.plus(amount);
        this.refreshNetValueExportedUSD();
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
    /**
     * Will update all volumes, mintSupply, TVL, and transaction counts based on the information of some transfer.
     * If the transfer is created via an `Account`, this will be called automatically.
     *
     * @param transfer
     * @param route the route this transfer is travelling through.
     * @param eventType the type of transfer: transfer_out, transfer_in, deposit, withdraw, etc
     * @see Account
     */
    trackTransfer(transfer, route, eventType) {
        this.addVolume(transfer.isOutgoing, route, transfer.amount, transfer.amountUSD);
        this.protocol.addTransaction(eventType);
        if (this.pool.type == enums_1.BridgePoolType.BURN_MINT) {
            let amount = transfer.amount;
            if (transfer.isOutgoing) {
                amount = amount.times(constants_1.BIGINT_MINUS_ONE);
            }
            this.addMintSupply(amount);
        }
        else if (this.pool.type == enums_1.BridgePoolType.LIQUIDITY ||
            this.pool.type == enums_1.BridgePoolType.LOCK_RELEASE) {
            let amount = transfer.amount;
            if (!transfer.isOutgoing) {
                amount = amount.times(constants_1.BIGINT_MINUS_ONE);
            }
            this.addInputTokenBalance(amount);
        }
    }
    /**
     * Will update the pool inputTokenBalance and TVL (also protocol TVL), based on the amount deposited.
     * This will be called automatically if the LiquidityDeposit is created via an `Account`.
     * It WON'T update the outputTokenSupply, so you should do that manually.
     * @param deposit
     * @see Account
     */
    trackDeposit(deposit) {
        this.protocol.addTransaction(enums_1.TransactionType.LIQUIDITY_DEPOSIT);
        this.addInputTokenBalance(deposit.amount);
        this._addInputTokenLiquidityBalance(deposit.amount);
    }
    /**
     * Will update the pool inputTokenBalance and TVL (also protocol TVL), based on the amount withdrawn.
     * This will be called automatically if the LiquidityWithdraw is created via an `Account`.
     * It WON'T update the outputTokenSupply, so you should do that manually.
     * @param deposit
     * @see Account
     */
    trackWithdraw(withdraw) {
        this.protocol.addTransaction(enums_1.TransactionType.LIQUIDITY_WITHDRAW);
        const amount = withdraw.amount.times(constants_1.BIGINT_MINUS_ONE);
        this.addInputTokenBalance(amount);
        this._addInputTokenLiquidityBalance(amount);
    }
}
exports.Pool = Pool;
/**
 * Will determine what's the type of the pool on the other side of the route.
 * Possible combinations are:
 * - BURN_MINT <> LOCK_RELEASE
 * - BURN_MINT <> BURN_MINT
 * - LIQUIDITY <> LIQUIDITY
 *
 * @param poolType the type of the pool on the current side of the route
 * @param token the token sent through this route
 * @returns {BridgePoolType}
 */
function inferCounterType(poolType, token) {
    if (poolType == enums_1.BridgePoolType.LIQUIDITY) {
        return enums_1.BridgePoolType.LIQUIDITY;
    }
    if (poolType == enums_1.BridgePoolType.LOCK_RELEASE) {
        return enums_1.BridgePoolType.BURN_MINT;
    }
    if (poolType == enums_1.BridgePoolType.BURN_MINT) {
        return token.type == enums_1.CrosschainTokenType.WRAPPED
            ? enums_1.BridgePoolType.BURN_MINT
            : enums_1.BridgePoolType.LOCK_RELEASE;
    }
    graph_ts_1.log.error("Unknown pool type at inferCounterType {}", [poolType]);
    graph_ts_1.log.critical("", []);
    return poolType;
}
