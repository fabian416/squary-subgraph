"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexEventHandler = exports.RawDeltas = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../configurations/configure");
const schema_1 = require("../../generated/schema");
const constants_1 = require("./constants");
const account_1 = require("./entities/account");
const pool_1 = require("./entities/pool");
const protocol_1 = require("./entities/protocol");
const token_1 = require("./entities/token");
const usage_1 = require("./entities/usage");
const price_1 = require("./price/price");
const utils_1 = require("./utils/utils");
class RawDeltas {
    constructor(inputTokenBalancesDeltas, totalLiquidityDelta, activeLiquidityDelta, uncollectedSupplySideTokenAmountsDeltas, uncollectedProtocolSideTokenAmountsDeltas) {
        this.inputTokenBalancesDeltas = inputTokenBalancesDeltas;
        this.totalLiquidityDelta = totalLiquidityDelta;
        this.activeLiquidityDelta = activeLiquidityDelta;
        this.uncollectedSupplySideTokenAmountsDeltas =
            uncollectedSupplySideTokenAmountsDeltas;
        this.uncollectedProtocolSideTokenAmountsDeltas =
            uncollectedProtocolSideTokenAmountsDeltas;
    }
}
exports.RawDeltas = RawDeltas;
class DexEventHandler {
    constructor(event, pool, trackVolume, deltas) {
        this.event = event;
        this.eventType = constants_1.EventType.UNKNOWN;
        this.account = (0, account_1.getOrCreateAccount)(event.transaction.from);
        this.protocol = (0, protocol_1.getOrCreateProtocol)();
        this.pool = pool;
        this.poolTokens = getTokens(event, pool);
        this._poolAmounts = (0, pool_1.getLiquidityPoolAmounts)(pool.id);
        this.dayID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
        this.hourID = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
        const supplyFee = (0, pool_1.getLiquidityPoolFee)(pool.fees[constants_1.INT_ZERO]);
        const protocolFee = (0, pool_1.getLiquidityPoolFee)(pool.fees[constants_1.INT_ONE]);
        // Raw Deltas
        this.inputTokenBalanceDeltas = deltas.inputTokenBalancesDeltas;
        this.uncollectedSupplySideTokenAmountsDeltas =
            deltas.uncollectedSupplySideTokenAmountsDeltas;
        this.uncollectedProtocolSideTokenAmountsDeltas =
            deltas.uncollectedProtocolSideTokenAmountsDeltas;
        this.totalLiquidityDelta = deltas.totalLiquidityDelta;
        this.activeLiquidityDelta = deltas.activeLiquidityDelta;
        // Pool Token Deltas and Balances
        this.inputTokenBalanceDeltasUSD = getAbsUSDValues(this.poolTokens, this.inputTokenBalanceDeltas);
        this.inputTokenBalances = (0, utils_1.sumBigIntListByIndex)([
            pool.inputTokenBalances,
            this.inputTokenBalanceDeltas,
        ]);
        this.inputTokenBalancesUSD = getAbsUSDValues(this.poolTokens, this.inputTokenBalances);
        this.inputTokenBalancesPoolAmounts = (0, utils_1.convertBigIntListToBigDecimalList)(this.poolTokens, this.inputTokenBalances);
        // Liquidity Deltas and Balances
        this.totalLiquidity = pool.totalLiquidity.plus(this.totalLiquidityDelta);
        this.totalLiquidityUSD = constants_1.BIGDECIMAL_ZERO;
        this.totalLiquidityDeltaUSD = constants_1.BIGDECIMAL_ZERO;
        // Get the new liquidity price per unit
        this.newLiquidityPricePerUnit = (0, utils_1.safeDivBigDecimal)(this.totalLiquidityUSD, this.totalLiquidity.toBigDecimal());
        // Get the deltas and values of the liquidity that is wihtin tick range.
        this.activeLiquidity = pool.activeLiquidity.plus(this.activeLiquidityDelta);
        this.activeLiquidityUSD = constants_1.BIGDECIMAL_ZERO;
        this.activeLiquidityDeltaUSD = constants_1.BIGDECIMAL_ZERO;
        // TEMPORARILY DISABLED AS WE ARE NOT TRACKING UNCOLLECTED TOKENS ON THIS BRANCH
        this.uncollectedSupplySideTokenAmounts = (0, utils_1.sumBigIntListByIndex)([
            pool.uncollectedSupplySideTokenAmounts,
            this.uncollectedSupplySideTokenAmountsDeltas,
        ]);
        this.uncollectedSupplySideValuesUSD = getAbsUSDValues(this.poolTokens, this.uncollectedSupplySideTokenAmounts);
        this.uncollectedSupplySideValuesDeltasUSD = (0, utils_1.subtractBigDecimalLists)(this.uncollectedSupplySideValuesUSD, this.pool.uncollectedSupplySideValuesUSD);
        this.uncollectedProtocolSideTokenAmounts = (0, utils_1.sumBigIntListByIndex)([
            pool.uncollectedProtocolSideTokenAmounts,
            this.uncollectedProtocolSideTokenAmountsDeltas,
        ]);
        this.uncollectedProtocolSideValuesUSD = getAbsUSDValues(this.poolTokens, this.uncollectedProtocolSideTokenAmounts);
        this.uncollectedProtocolSideValuesDeltasUSD = (0, utils_1.subtractBigDecimalLists)(this.uncollectedProtocolSideValuesUSD, this.pool.uncollectedProtocolSideValuesUSD);
        // Total Value Locked
        this.totalValueLockedUSD = (0, utils_1.sumBigDecimalList)(this.inputTokenBalancesUSD);
        this.totalValueLockedUSDDelta = this.totalValueLockedUSD.minus(this.pool.totalValueLockedUSD);
        // Handle volumes
        if (trackVolume) {
            // Get the tracked volume and revenue - they are not tracked for non-whitelist token
            this.trackedInputTokenBalanceDeltasUSD = (0, price_1.getTrackedVolumeUSD)(pool, this.poolTokens, this.inputTokenBalanceDeltasUSD);
            this.trackedVolumeUSD = (0, utils_1.BigDecimalAverage)(this.trackedInputTokenBalanceDeltasUSD);
            this.trackedSupplySideRevenueDeltaUSD = this.trackedVolumeUSD.times((0, utils_1.percToDec)(supplyFee.feePercentage));
            this.trackedProtocolSideRevenueDeltaUSD = this.trackedVolumeUSD.times((0, utils_1.percToDec)(protocolFee.feePercentage));
            this.trackedSupplySideRevenueUSD =
                pool.cumulativeSupplySideRevenueUSD.plus(this.trackedSupplySideRevenueDeltaUSD);
            this.trackedProtocolSideRevenueUSD =
                pool.cumulativeProtocolSideRevenueUSD.plus(this.trackedProtocolSideRevenueDeltaUSD);
        }
        else {
            // Array with zeros
            this.trackedInputTokenBalanceDeltasUSD = new Array(this.poolTokens.length).fill(constants_1.BIGDECIMAL_ZERO);
            this.trackedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
            this.trackedSupplySideRevenueDeltaUSD = constants_1.BIGDECIMAL_ZERO;
            this.trackedProtocolSideRevenueDeltaUSD = constants_1.BIGDECIMAL_ZERO;
            this.trackedSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
            this.trackedProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        }
    }
    createWithdraw(from, tickLower, tickUpper, position) {
        this.eventType = constants_1.EventType.WITHDRAW;
        this.tickUpper = tickUpper;
        this.tickLower = tickLower;
        const withdraw = new schema_1.Withdraw(this.event.transaction.hash.concatI32(this.event.logIndex.toI32()));
        withdraw.hash = this.event.transaction.hash;
        withdraw.nonce = this.event.transaction.nonce;
        withdraw.logIndex = this.event.logIndex.toI32();
        withdraw.gasLimit = this.event.transaction.gasLimit;
        withdraw.gasPrice = this.event.transaction.gasPrice;
        withdraw.protocol = this.protocol.id;
        withdraw.pool = this.pool.id;
        withdraw.position = position ? position.id : null;
        withdraw.account = from;
        withdraw.blockNumber = this.event.block.number;
        withdraw.timestamp = this.event.block.timestamp;
        withdraw.liquidity = this.totalLiquidityDelta.abs();
        withdraw.inputTokens = this.pool.inputTokens;
        withdraw.inputTokenAmounts = (0, utils_1.absBigIntList)(this.inputTokenBalanceDeltas);
        withdraw.amountUSD = (0, utils_1.sumBigDecimalList)(this.inputTokenBalanceDeltasUSD);
        withdraw.tickLower = this.tickLower ? this.tickLower.index : null;
        withdraw.tickUpper = this.tickUpper ? this.tickUpper.index : null;
        const pool = (0, pool_1.getLiquidityPool)(this.event.address);
        if (pool) {
            const reserve0Amount = pool.inputTokenBalances[0];
            const reserve1Amount = pool.inputTokenBalances[1];
            withdraw.reserveAmounts = [reserve0Amount, reserve1Amount];
        }
        withdraw.save();
    }
    createDeposit(from, tickLower, tickUpper, position) {
        this.eventType = constants_1.EventType.DEPOSIT;
        this.tickUpper = tickUpper;
        this.tickLower = tickLower;
        const deposit = new schema_1.Deposit(this.event.transaction.hash.concatI32(this.event.logIndex.toI32()));
        deposit.hash = this.event.transaction.hash;
        deposit.nonce = this.event.transaction.nonce;
        deposit.logIndex = this.event.logIndex.toI32();
        deposit.gasLimit = this.event.transaction.gasLimit;
        deposit.gasPrice = this.event.transaction.gasPrice;
        deposit.protocol = this.protocol.id;
        deposit.pool = this.pool.id;
        deposit.position = position ? position.id : null;
        deposit.account = from;
        deposit.blockNumber = this.event.block.number;
        deposit.timestamp = this.event.block.timestamp;
        deposit.liquidity = this.totalLiquidityDelta.abs();
        deposit.inputTokens = this.pool.inputTokens;
        deposit.inputTokenAmounts = (0, utils_1.absBigIntList)(this.inputTokenBalanceDeltas);
        deposit.amountUSD = (0, utils_1.sumBigDecimalList)(this.inputTokenBalanceDeltasUSD);
        deposit.tickLower = this.tickLower ? this.tickLower.index : null;
        deposit.tickUpper = this.tickUpper ? this.tickUpper.index : null;
        const pool = (0, pool_1.getLiquidityPool)(this.event.address);
        if (pool) {
            const reserve0Amount = pool.inputTokenBalances[0];
            const reserve1Amount = pool.inputTokenBalances[1];
            deposit.reserveAmounts = [reserve0Amount, reserve1Amount];
        }
        deposit.save();
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
    // Positions are only snapped once per interval to save space
    processLPBalanceChanges() {
        const protocolSnapshotDayID = this.protocol.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
        if (protocolSnapshotDayID != this.dayID) {
            this.updateAndSaveFinancialMetrics(protocolSnapshotDayID);
            this.protocol.lastSnapshotDayID = protocolSnapshotDayID;
            this.protocol.save();
        }
        const poolSnapshotDayID = this.pool.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
        const poolSnapshotHourID = this.pool.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_HOUR;
        if (poolSnapshotDayID != this.dayID) {
            this.updateAndSaveLiquidityPoolDailyMetrics(poolSnapshotDayID);
            this.pool.lastSnapshotDayID = poolSnapshotDayID;
            this.pool.save();
        }
        if (poolSnapshotHourID != this.hourID) {
            this.updateAndSaveLiquidityPoolHourlyMetrics(poolSnapshotHourID);
            this.pool.lastSnapshotHourID = poolSnapshotHourID;
            this.pool.save();
        }
        if (this.tickLower || this.tickUpper) {
            const tickLowerSnapshotDayID = this.tickLower.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
            const tickLowerSnapshotHourID = this.tickLower.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_HOUR;
            const tickUpperSnapshotDayID = this.tickUpper.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_DAY;
            const tickUpperSnapshotHourID = this.tickUpper.lastUpdateTimestamp.toI32() / constants_1.SECONDS_PER_HOUR;
            if (tickLowerSnapshotDayID != this.dayID) {
                this.updateAndSaveTickDailySnapshotEntity(this.tickLower, tickLowerSnapshotDayID);
                this.tickLower.lastSnapshotDayID = tickLowerSnapshotDayID;
                this.tickLower.save();
            }
            // if the tick is the same, we don't need to update the upper tick
            if (tickUpperSnapshotDayID != this.dayID &&
                this.tickUpper.index != this.tickLower.index) {
                this.updateAndSaveTickDailySnapshotEntity(this.tickUpper, tickUpperSnapshotDayID);
                this.tickUpper.lastSnapshotDayID = tickUpperSnapshotDayID;
                this.tickUpper.save();
            }
            if (tickLowerSnapshotHourID != this.hourID) {
                this.updateAndSaveTickHourlySnapshotEntity(this.tickLower, tickLowerSnapshotHourID);
                this.tickLower.lastSnapshotHourID = tickLowerSnapshotHourID;
                this.tickLower.save();
            }
            // if the tick is the same, we don't need to update the upper tick
            if (tickUpperSnapshotHourID != this.hourID &&
                this.tickUpper.index != this.tickLower.index) {
                this.updateAndSaveTickHourlySnapshotEntity(this.tickUpper, tickUpperSnapshotHourID);
                this.tickUpper.lastSnapshotHourID = tickUpperSnapshotHourID;
                this.tickUpper.save();
            }
            this.updateAndSaveTickEntity();
        }
        this.updateAndSaveProtocolEntity();
        this.updateAndSaveLiquidityPoolEntity();
        this.updateAndSaveAccountEntity();
        this.updateAndSaveUsageMetrics();
        this.updateAndSavePoolTokenEntities();
    }
    updateAndSaveProtocolEntity() {
        this.protocol.totalValueLockedUSD = this.protocol.totalValueLockedUSD.plus(this.totalValueLockedUSDDelta);
        this.protocol.totalLiquidityUSD = this.protocol.totalLiquidityUSD.plus(this.totalLiquidityDeltaUSD);
        this.protocol.activeLiquidityUSD = this.protocol.activeLiquidityUSD.plus(this.activeLiquidityDeltaUSD);
        if (this.account.depositCount +
            this.account.withdrawCount +
            this.account.swapCount ==
            0) {
            this.protocol.cumulativeUniqueUsers += 1;
        }
        if (this.account.depositCount + this.account.withdrawCount == 0 &&
            (this.eventType == constants_1.EventType.DEPOSIT ||
                this.eventType == constants_1.EventType.WITHDRAW)) {
            this.protocol.cumulativeUniqueLPs += 1;
        }
        if (this.account.swapCount == 0 && this.eventType == constants_1.EventType.SWAP) {
            this.protocol.cumulativeUniqueTraders += 1;
        }
        this.protocol.cumulativeVolumeUSD = this.protocol.cumulativeVolumeUSD.plus(this.trackedVolumeUSD);
        this.protocol.cumulativeSupplySideRevenueUSD =
            this.protocol.cumulativeSupplySideRevenueUSD.plus(this.trackedSupplySideRevenueDeltaUSD);
        this.protocol.cumulativeProtocolSideRevenueUSD =
            this.protocol.cumulativeProtocolSideRevenueUSD.plus(this.trackedProtocolSideRevenueDeltaUSD);
        this.protocol.cumulativeTotalRevenueUSD =
            this.protocol.cumulativeSupplySideRevenueUSD.plus(this.protocol.cumulativeProtocolSideRevenueUSD);
        this.protocol.uncollectedSupplySideValueUSD =
            this.protocol.uncollectedSupplySideValueUSD.plus((0, utils_1.sumBigDecimalList)(this.uncollectedSupplySideValuesDeltasUSD));
        this.protocol.uncollectedProtocolSideValueUSD =
            this.protocol.uncollectedProtocolSideValueUSD.plus((0, utils_1.sumBigDecimalList)(this.uncollectedProtocolSideValuesDeltasUSD));
        this.protocol.lastUpdateBlockNumber = this.event.block.number;
        this.protocol.lastUpdateTimestamp = this.event.block.timestamp;
        this.protocol.save();
    }
    updateAndSaveLiquidityPoolEntity() {
        this.pool.totalValueLockedUSD = this.totalValueLockedUSD;
        this.pool.totalLiquidity = this.totalLiquidity;
        this.pool.totalLiquidityUSD = this.totalLiquidityUSD;
        this.pool.activeLiquidity = this.activeLiquidity;
        this.pool.activeLiquidityUSD = this.activeLiquidityUSD;
        this.pool.inputTokenBalances = this.inputTokenBalances;
        this.pool.inputTokenBalancesUSD = this.inputTokenBalancesUSD;
        this.pool.cumulativeVolumeUSD = this.pool.cumulativeVolumeUSD.plus(this.trackedVolumeUSD);
        this.pool.cumulativeVolumeByTokenUSD = (0, utils_1.sumBigDecimalListByIndex)([
            this.pool.cumulativeVolumeByTokenUSD,
            this.trackedInputTokenBalanceDeltasUSD,
        ]);
        this.pool.cumulativeVolumeByTokenAmount = (0, utils_1.sumBigIntListByIndex)([
            this.pool.cumulativeVolumeByTokenAmount,
            (0, utils_1.absBigIntList)(this.inputTokenBalanceDeltas),
        ]);
        this.pool.cumulativeSupplySideRevenueUSD =
            this.pool.cumulativeSupplySideRevenueUSD.plus(this.trackedSupplySideRevenueDeltaUSD);
        this.pool.cumulativeProtocolSideRevenueUSD =
            this.pool.cumulativeProtocolSideRevenueUSD.plus(this.trackedProtocolSideRevenueDeltaUSD);
        this.pool.cumulativeTotalRevenueUSD =
            this.pool.cumulativeProtocolSideRevenueUSD.plus(this.pool.cumulativeSupplySideRevenueUSD);
        this.pool.uncollectedProtocolSideTokenAmounts =
            this.uncollectedProtocolSideTokenAmounts;
        this.pool.uncollectedSupplySideTokenAmounts =
            this.uncollectedSupplySideTokenAmounts;
        this.pool.uncollectedProtocolSideValuesUSD =
            this.uncollectedProtocolSideValuesUSD;
        this.pool.uncollectedSupplySideValuesUSD =
            this.uncollectedSupplySideValuesUSD;
        if (this.eventType == constants_1.EventType.DEPOSIT) {
            this.pool.cumulativeDepositCount += constants_1.INT_ONE;
        }
        else if (this.eventType == constants_1.EventType.WITHDRAW) {
            this.pool.cumulativeWithdrawCount += constants_1.INT_ONE;
        }
        else if (this.eventType == constants_1.EventType.SWAP) {
            this.pool.cumulativeSwapCount += constants_1.INT_ONE;
        }
        this.pool.lastUpdateBlockNumber = this.event.block.number;
        this.pool.lastUpdateTimestamp = this.event.block.timestamp;
        this._poolAmounts.inputTokenBalances = this.inputTokenBalancesPoolAmounts;
        this._poolAmounts.save();
        this.pool.save();
    }
    updateAndSavePoolTokenEntities() {
        for (let i = 0; i < this.poolTokens.length; i++) {
            const poolToken = this.poolTokens[i];
            poolToken._totalSupply = poolToken._totalSupply.plus(this.inputTokenBalanceDeltas[i]);
            poolToken._totalValueLockedUSD = (0, utils_1.convertTokenToDecimal)(poolToken._totalSupply, poolToken.decimals).times(poolToken.lastPriceUSD);
            poolToken.save();
        }
    }
    updateAndSaveFinancialMetrics(day) {
        const id = graph_ts_1.Bytes.fromI32(day);
        const financialMetrics = new schema_1.FinancialsDailySnapshot(id);
        const prevFinancialMetrics = schema_1.FinancialsDailySnapshot.load(graph_ts_1.Bytes.fromI32(this.protocol.lastSnapshotDayID));
        let prevCumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        let prevCumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        let prevCumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        let prevCumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        if (prevFinancialMetrics != null) {
            prevCumulativeVolumeUSD = prevFinancialMetrics.cumulativeVolumeUSD;
            prevCumulativeSupplySideRevenueUSD =
                prevFinancialMetrics.cumulativeSupplySideRevenueUSD;
            prevCumulativeProtocolSideRevenueUSD =
                prevFinancialMetrics.cumulativeProtocolSideRevenueUSD;
            prevCumulativeTotalRevenueUSD =
                prevFinancialMetrics.cumulativeTotalRevenueUSD;
        }
        else if (this.pool.lastSnapshotDayID > constants_1.INT_ZERO) {
            graph_ts_1.log.critical("Missing pool snapshot at ID that has been snapped: Pool {}, ID {} ", [this.pool.id.toHexString(), this.pool.lastSnapshotDayID.toString()]);
        }
        financialMetrics.day = day;
        financialMetrics.timestamp = this.event.block.timestamp;
        financialMetrics.blockNumber = this.event.block.number;
        financialMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        financialMetrics.totalValueLockedUSD = this.protocol.totalValueLockedUSD;
        financialMetrics.totalLiquidityUSD = this.protocol.totalLiquidityUSD;
        financialMetrics.activeLiquidityUSD = this.protocol.activeLiquidityUSD;
        financialMetrics.uncollectedProtocolSideValueUSD =
            this.protocol.uncollectedProtocolSideValueUSD;
        financialMetrics.uncollectedSupplySideValueUSD =
            this.protocol.uncollectedSupplySideValueUSD;
        financialMetrics.cumulativeVolumeUSD = this.protocol.cumulativeVolumeUSD;
        financialMetrics.dailyVolumeUSD = this.protocol.cumulativeVolumeUSD.minus(prevCumulativeVolumeUSD);
        financialMetrics.cumulativeSupplySideRevenueUSD =
            this.protocol.cumulativeSupplySideRevenueUSD;
        financialMetrics.dailySupplySideRevenueUSD =
            this.protocol.cumulativeSupplySideRevenueUSD.minus(prevCumulativeSupplySideRevenueUSD);
        financialMetrics.cumulativeProtocolSideRevenueUSD =
            this.protocol.cumulativeProtocolSideRevenueUSD;
        financialMetrics.dailyProtocolSideRevenueUSD =
            this.protocol.cumulativeProtocolSideRevenueUSD.minus(prevCumulativeProtocolSideRevenueUSD);
        financialMetrics.cumulativeTotalRevenueUSD =
            this.protocol.cumulativeTotalRevenueUSD;
        financialMetrics.dailyTotalRevenueUSD =
            this.protocol.cumulativeTotalRevenueUSD.minus(prevCumulativeTotalRevenueUSD);
        financialMetrics.save();
    }
    updateAndSaveLiquidityPoolDailyMetrics(day) {
        const id = this.event.address.concatI32(day);
        const poolMetrics = new schema_1.LiquidityPoolDailySnapshot(id);
        const prevPoolMetrics = schema_1.LiquidityPoolDailySnapshot.load(this.event.address.concatI32(this.pool.lastSnapshotDayID));
        let prevCumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        let prevCumulativeVolumeByTokenUSD = new Array(this.pool.inputTokens.length).fill(constants_1.BIGDECIMAL_ZERO);
        let prevCumulativeVolumeByTokenAmount = new Array(this.pool.inputTokens.length).fill(constants_1.BIGINT_ZERO);
        let prevCumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        let prevCumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        let prevCumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        let prevCumulativeDepositCount = constants_1.INT_ZERO;
        let prevCumulativeWithdrawCount = constants_1.INT_ZERO;
        let prevCumulativeSwapCount = constants_1.INT_ZERO;
        if (prevPoolMetrics != null) {
            prevCumulativeVolumeUSD = prevPoolMetrics.cumulativeVolumeUSD;
            prevCumulativeVolumeByTokenUSD =
                prevPoolMetrics.cumulativeVolumeByTokenUSD;
            prevCumulativeVolumeByTokenAmount =
                prevPoolMetrics.cumulativeVolumeByTokenAmount;
            prevCumulativeSupplySideRevenueUSD =
                prevPoolMetrics.cumulativeSupplySideRevenueUSD;
            prevCumulativeProtocolSideRevenueUSD =
                prevPoolMetrics.cumulativeProtocolSideRevenueUSD;
            prevCumulativeTotalRevenueUSD = prevPoolMetrics.cumulativeTotalRevenueUSD;
            prevCumulativeDepositCount = prevPoolMetrics.cumulativeDepositCount;
            prevCumulativeWithdrawCount = prevPoolMetrics.cumulativeWithdrawCount;
            prevCumulativeSwapCount = prevPoolMetrics.cumulativeSwapCount;
        }
        else if (this.pool.lastSnapshotDayID > constants_1.INT_ZERO) {
            graph_ts_1.log.critical("Missing pool snapshot at ID that has been snapped: Pool {}, ID {} ", [this.pool.id.toHexString(), this.pool.lastSnapshotDayID.toString()]);
        }
        poolMetrics.day = day;
        poolMetrics.timestamp = this.event.block.timestamp;
        poolMetrics.blockNumber = this.event.block.number;
        poolMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        poolMetrics.pool = this.event.address;
        poolMetrics.tick = this.pool.tick;
        poolMetrics.totalValueLockedUSD = this.pool.totalValueLockedUSD;
        poolMetrics.totalLiquidity = this.pool.totalLiquidity;
        poolMetrics.totalLiquidityUSD = this.pool.totalLiquidityUSD;
        poolMetrics.activeLiquidity = this.pool.activeLiquidity;
        poolMetrics.activeLiquidityUSD = this.pool.activeLiquidityUSD;
        poolMetrics.uncollectedProtocolSideTokenAmounts =
            this.pool.uncollectedProtocolSideTokenAmounts;
        poolMetrics.uncollectedProtocolSideValuesUSD =
            this.pool.uncollectedProtocolSideValuesUSD;
        poolMetrics.uncollectedSupplySideTokenAmounts =
            this.pool.uncollectedSupplySideTokenAmounts;
        poolMetrics.uncollectedSupplySideValuesUSD =
            this.pool.uncollectedSupplySideValuesUSD;
        poolMetrics.cumulativeVolumeUSD = this.pool.cumulativeVolumeUSD;
        poolMetrics.dailyVolumeUSD = this.pool.cumulativeVolumeUSD.minus(prevCumulativeVolumeUSD);
        poolMetrics.cumulativeVolumeByTokenUSD =
            this.pool.cumulativeVolumeByTokenUSD;
        poolMetrics.dailyVolumeByTokenUSD = (0, utils_1.subtractBigDecimalLists)(this.pool.cumulativeVolumeByTokenUSD, prevCumulativeVolumeByTokenUSD);
        poolMetrics.cumulativeVolumeByTokenAmount =
            this.pool.cumulativeVolumeByTokenAmount;
        poolMetrics.dailyVolumeByTokenAmount = (0, utils_1.subtractBigIntLists)(this.pool.cumulativeVolumeByTokenAmount, prevCumulativeVolumeByTokenAmount);
        poolMetrics.inputTokenBalances = this.pool.inputTokenBalances;
        poolMetrics.inputTokenBalancesUSD = this.pool.inputTokenBalancesUSD;
        poolMetrics.inputTokenWeights = this.pool.inputTokenWeights;
        poolMetrics.cumulativeSupplySideRevenueUSD =
            this.pool.cumulativeSupplySideRevenueUSD;
        poolMetrics.dailySupplySideRevenueUSD =
            this.pool.cumulativeSupplySideRevenueUSD.minus(prevCumulativeSupplySideRevenueUSD);
        poolMetrics.cumulativeProtocolSideRevenueUSD =
            this.pool.cumulativeProtocolSideRevenueUSD;
        poolMetrics.dailyProtocolSideRevenueUSD =
            this.pool.cumulativeProtocolSideRevenueUSD.minus(prevCumulativeProtocolSideRevenueUSD);
        poolMetrics.cumulativeTotalRevenueUSD = this.pool.cumulativeTotalRevenueUSD;
        poolMetrics.dailyTotalRevenueUSD =
            this.pool.cumulativeTotalRevenueUSD.minus(prevCumulativeTotalRevenueUSD);
        poolMetrics.cumulativeDepositCount = this.pool.cumulativeDepositCount;
        poolMetrics.dailyDepositCount =
            this.pool.cumulativeDepositCount - prevCumulativeDepositCount;
        poolMetrics.cumulativeWithdrawCount = this.pool.cumulativeWithdrawCount;
        poolMetrics.dailyWithdrawCount =
            this.pool.cumulativeWithdrawCount - prevCumulativeWithdrawCount;
        poolMetrics.cumulativeSwapCount = this.pool.cumulativeSwapCount;
        poolMetrics.dailySwapCount =
            this.pool.cumulativeSwapCount - prevCumulativeSwapCount;
        poolMetrics.positionCount = this.pool.positionCount;
        poolMetrics.openPositionCount = this.pool.openPositionCount;
        poolMetrics.closedPositionCount = this.pool.closedPositionCount;
        poolMetrics.blockNumber = this.pool.lastUpdateBlockNumber;
        poolMetrics.timestamp = this.pool.lastUpdateTimestamp;
        poolMetrics.save();
    }
    updateAndSaveLiquidityPoolHourlyMetrics(hour) {
        const id = this.event.address.concatI32(hour);
        const poolMetrics = new schema_1.LiquidityPoolHourlySnapshot(id);
        const prevPoolMetrics = schema_1.LiquidityPoolHourlySnapshot.load(this.event.address.concatI32(this.pool.lastSnapshotHourID));
        let prevCumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        let prevCumulativeVolumeByTokenUSD = new Array(this.pool.inputTokens.length).fill(constants_1.BIGDECIMAL_ZERO);
        let prevCumulativeVolumeByTokenAmount = new Array(this.pool.inputTokens.length).fill(constants_1.BIGINT_ZERO);
        let prevCumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        let prevCumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        let prevCumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        let prevCumulativeDepositCount = constants_1.INT_ZERO;
        let prevCumulativeWithdrawCount = constants_1.INT_ZERO;
        let prevCumulativeSwapCount = constants_1.INT_ZERO;
        if (prevPoolMetrics != null) {
            prevCumulativeVolumeUSD = prevPoolMetrics.cumulativeVolumeUSD;
            prevCumulativeVolumeByTokenUSD =
                prevPoolMetrics.cumulativeVolumeByTokenUSD;
            prevCumulativeVolumeByTokenAmount =
                prevPoolMetrics.cumulativeVolumeByTokenAmount;
            prevCumulativeSupplySideRevenueUSD =
                prevPoolMetrics.cumulativeSupplySideRevenueUSD;
            prevCumulativeProtocolSideRevenueUSD =
                prevPoolMetrics.cumulativeProtocolSideRevenueUSD;
            prevCumulativeTotalRevenueUSD = prevPoolMetrics.cumulativeTotalRevenueUSD;
            prevCumulativeDepositCount = prevPoolMetrics.cumulativeDepositCount;
            prevCumulativeWithdrawCount = prevPoolMetrics.cumulativeWithdrawCount;
            prevCumulativeSwapCount = prevPoolMetrics.cumulativeSwapCount;
        }
        else if (this.pool.lastSnapshotHourID > constants_1.INT_ZERO) {
            graph_ts_1.log.critical("Missing pool snapshot at ID that has been snapped: Pool {}, ID {} ", [this.pool.id.toHexString(), this.pool.lastSnapshotHourID.toString()]);
        }
        poolMetrics.hour = hour;
        poolMetrics.timestamp = this.event.block.timestamp;
        poolMetrics.blockNumber = this.event.block.number;
        poolMetrics.protocol = configure_1.NetworkConfigs.getFactoryAddress();
        poolMetrics.pool = this.event.address;
        poolMetrics.tick = this.pool.tick;
        poolMetrics.totalValueLockedUSD = this.pool.totalValueLockedUSD;
        poolMetrics.totalLiquidity = this.pool.totalLiquidity;
        poolMetrics.totalLiquidityUSD = this.pool.totalLiquidityUSD;
        poolMetrics.activeLiquidity = this.pool.activeLiquidity;
        poolMetrics.activeLiquidityUSD = this.pool.activeLiquidityUSD;
        poolMetrics.uncollectedProtocolSideTokenAmounts =
            this.pool.uncollectedProtocolSideTokenAmounts;
        poolMetrics.uncollectedProtocolSideValuesUSD =
            this.pool.uncollectedProtocolSideValuesUSD;
        poolMetrics.uncollectedSupplySideTokenAmounts =
            this.pool.uncollectedSupplySideTokenAmounts;
        poolMetrics.uncollectedSupplySideValuesUSD =
            this.pool.uncollectedSupplySideValuesUSD;
        poolMetrics.cumulativeVolumeUSD = this.pool.cumulativeVolumeUSD;
        poolMetrics.hourlyVolumeUSD = this.pool.cumulativeVolumeUSD.minus(prevCumulativeVolumeUSD);
        poolMetrics.cumulativeVolumeByTokenUSD =
            this.pool.cumulativeVolumeByTokenUSD;
        poolMetrics.hourlyVolumeByTokenUSD = (0, utils_1.subtractBigDecimalLists)(this.pool.cumulativeVolumeByTokenUSD, prevCumulativeVolumeByTokenUSD);
        poolMetrics.cumulativeVolumeByTokenAmount =
            this.pool.cumulativeVolumeByTokenAmount;
        poolMetrics.hourlyVolumeByTokenAmount = (0, utils_1.subtractBigIntLists)(this.pool.cumulativeVolumeByTokenAmount, prevCumulativeVolumeByTokenAmount);
        poolMetrics.inputTokenBalances = this.pool.inputTokenBalances;
        poolMetrics.inputTokenBalancesUSD = this.pool.inputTokenBalancesUSD;
        poolMetrics.inputTokenWeights = this.pool.inputTokenWeights;
        poolMetrics.cumulativeSupplySideRevenueUSD =
            this.pool.cumulativeSupplySideRevenueUSD;
        poolMetrics.hourlySupplySideRevenueUSD =
            this.pool.cumulativeSupplySideRevenueUSD.minus(prevCumulativeSupplySideRevenueUSD);
        poolMetrics.cumulativeProtocolSideRevenueUSD =
            this.pool.cumulativeProtocolSideRevenueUSD;
        poolMetrics.hourlyProtocolSideRevenueUSD =
            this.pool.cumulativeProtocolSideRevenueUSD.minus(prevCumulativeProtocolSideRevenueUSD);
        poolMetrics.cumulativeTotalRevenueUSD = this.pool.cumulativeTotalRevenueUSD;
        poolMetrics.hourlyTotalRevenueUSD =
            this.pool.cumulativeTotalRevenueUSD.minus(prevCumulativeTotalRevenueUSD);
        poolMetrics.cumulativeDepositCount = this.pool.cumulativeDepositCount;
        poolMetrics.hourlyDepositCount =
            this.pool.cumulativeDepositCount - prevCumulativeDepositCount;
        poolMetrics.cumulativeWithdrawCount = this.pool.cumulativeWithdrawCount;
        poolMetrics.hourlyWithdrawCount =
            this.pool.cumulativeWithdrawCount - prevCumulativeWithdrawCount;
        poolMetrics.cumulativeSwapCount = this.pool.cumulativeSwapCount;
        poolMetrics.hourlySwapCount =
            this.pool.cumulativeSwapCount - prevCumulativeSwapCount;
        poolMetrics.positionCount = this.pool.positionCount;
        poolMetrics.openPositionCount = this.pool.openPositionCount;
        poolMetrics.closedPositionCount = this.pool.closedPositionCount;
        poolMetrics.blockNumber = this.pool.lastUpdateBlockNumber;
        poolMetrics.timestamp = this.pool.lastUpdateTimestamp;
        poolMetrics.save();
    }
    updateAndSaveTickEntity() {
        this.tickLower.liquidityGross = this.tickLower.liquidityGross.plus(this.totalLiquidityDelta);
        this.tickLower.liquidityGrossUSD =
            this.tickLower.liquidityGross.toBigDecimal().times(this.newLiquidityPricePerUnit);
        this.tickLower.liquidityNet = this.tickLower.liquidityNet.plus(this.totalLiquidityDelta);
        this.tickLower.liquidityNetUSD =
            this.tickLower.liquidityNet.toBigDecimal().times(this.newLiquidityPricePerUnit);
        this.tickUpper.liquidityGross = this.tickUpper.liquidityGross.plus(this.totalLiquidityDelta);
        this.tickUpper.liquidityGrossUSD =
            this.tickUpper.liquidityGross.toBigDecimal().times(this.newLiquidityPricePerUnit);
        this.tickUpper.liquidityNet = this.tickUpper.liquidityNet.minus(this.totalLiquidityDelta);
        this.tickUpper.liquidityNetUSD =
            this.tickUpper.liquidityNet.toBigDecimal().times(this.newLiquidityPricePerUnit);
        this.tickUpper.lastUpdateBlockNumber = this.event.block.number;
        this.tickUpper.lastUpdateTimestamp = this.event.block.timestamp;
        this.tickLower.lastUpdateBlockNumber = this.event.block.number;
        this.tickLower.lastUpdateTimestamp = this.event.block.timestamp;
        this.tickLower.save();
        this.tickUpper.save();
    }
    updateAndSaveTickDailySnapshotEntity(tick, day) {
        const tickID = this.pool.id.concatI32(tick.index.toI32()).concatI32(day);
        const tickSnapshot = new schema_1.TickDailySnapshot(tickID);
        tickSnapshot.day = day;
        tickSnapshot.timestamp = this.event.block.timestamp;
        tickSnapshot.blockNumber = this.event.block.number;
        tickSnapshot.tick = this.tickLower.id;
        tickSnapshot.pool = this.pool.id;
        tickSnapshot.timestamp = tick.lastUpdateTimestamp;
        tickSnapshot.blockNumber = tick.lastUpdateBlockNumber;
        tickSnapshot.liquidityGross = tick.liquidityGross;
        tickSnapshot.liquidityGrossUSD = tick.liquidityGrossUSD;
        tickSnapshot.liquidityNet = tick.liquidityNet;
        tickSnapshot.liquidityNetUSD = tick.liquidityNetUSD;
        tickSnapshot.save();
    }
    updateAndSaveTickHourlySnapshotEntity(tick, hour) {
        const tickID = this.pool.id.concatI32(tick.index.toI32()).concatI32(hour);
        const tickSnapshot = new schema_1.TickHourlySnapshot(tickID);
        tickSnapshot.hour = hour;
        tickSnapshot.timestamp = this.event.block.timestamp;
        tickSnapshot.blockNumber = this.event.block.number;
        tickSnapshot.tick = tick.id;
        tickSnapshot.pool = this.pool.id;
        tickSnapshot.timestamp = tick.lastUpdateTimestamp;
        tickSnapshot.blockNumber = tick.lastUpdateBlockNumber;
        tickSnapshot.liquidityGross = tick.liquidityGross;
        tickSnapshot.liquidityGrossUSD = tick.liquidityGrossUSD;
        tickSnapshot.liquidityNet = tick.liquidityNet;
        tickSnapshot.liquidityNetUSD = tick.liquidityNetUSD;
        tickSnapshot.save();
    }
    updateAndSaveAccountEntity() {
        switch (this.eventType) {
            case constants_1.EventType.SWAP:
                this.account.swapCount += constants_1.INT_ONE;
            case constants_1.EventType.DEPOSIT:
                this.account.depositCount += constants_1.INT_ONE;
            case constants_1.EventType.WITHDRAW:
                this.account.withdrawCount += constants_1.INT_ONE;
        }
        this.account.save();
    }
    updateAndSaveUsageMetrics() {
        const from = this.event.transaction.from;
        const usageMetricsDaily = (0, usage_1.getOrCreateUsageMetricDailySnapshot)(this.event);
        const usageMetricsHourly = (0, usage_1.getOrCreateUsageMetricHourlySnapshot)(this.event);
        // Update the block number and timestamp to that of the last transaction of that day
        usageMetricsDaily.day = this.dayID;
        usageMetricsDaily.timestamp = this.event.block.timestamp;
        usageMetricsDaily.blockNumber = this.event.block.number;
        usageMetricsDaily.dailyTransactionCount += constants_1.INT_ONE;
        usageMetricsDaily.totalPoolCount = this.protocol.totalPoolCount;
        usageMetricsHourly.hour = this.hourID;
        usageMetricsHourly.timestamp = this.event.block.timestamp;
        usageMetricsHourly.blockNumber = this.event.block.number;
        usageMetricsHourly.hourlyTransactionCount += constants_1.INT_ONE;
        if (this.eventType == constants_1.EventType.DEPOSIT) {
            usageMetricsDaily.dailyDepositCount += constants_1.INT_ONE;
            usageMetricsHourly.hourlyDepositCount += constants_1.INT_ONE;
        }
        else if (this.eventType == constants_1.EventType.WITHDRAW) {
            usageMetricsDaily.dailyWithdrawCount += constants_1.INT_ONE;
            usageMetricsHourly.hourlyWithdrawCount += constants_1.INT_ONE;
        }
        else if (this.eventType == constants_1.EventType.SWAP) {
            usageMetricsDaily.dailySwapCount += constants_1.INT_ONE;
            usageMetricsHourly.hourlySwapCount += constants_1.INT_ONE;
        }
        // Number of days since Unix epoch
        const day = this.event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
        const hour = this.event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
        // Combine the id and the user address to generate a unique user id for the day
        const dailyActiveAccountId = from.concatI32(day);
        let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
        if (!dailyActiveAccount) {
            dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
            usageMetricsDaily.dailyActiveUsers += constants_1.INT_ONE;
            dailyActiveAccount.save();
        }
        const hourlyActiveAccountId = from.concatI32(hour);
        let hourlyActiveAccount = schema_1.ActiveAccount.load(hourlyActiveAccountId);
        if (!hourlyActiveAccount) {
            hourlyActiveAccount = new schema_1.ActiveAccount(hourlyActiveAccountId);
            usageMetricsHourly.hourlyActiveUsers += constants_1.INT_ONE;
            hourlyActiveAccount.save();
        }
        usageMetricsDaily.cumulativeUniqueUsers =
            this.protocol.cumulativeUniqueUsers;
        usageMetricsHourly.cumulativeUniqueUsers =
            this.protocol.cumulativeUniqueUsers;
        usageMetricsDaily.save();
        usageMetricsHourly.save();
    }
}
exports.DexEventHandler = DexEventHandler;
// Return all tokens given a pool
function getTokens(event, pool) {
    const tokens = [];
    for (let i = 0; i < pool.inputTokens.length; i++) {
        tokens.push((0, token_1.getOrCreateToken)(event, pool.inputTokens[i]));
    }
    return tokens;
}
// Get USD Value given raw token amounts and a token
function getAbsUSDValues(tokens, tokenAmounts) {
    const usdValues = [];
    // Check for fake versions of whitelisted tokens. Do not price these tokens.
    for (let i = 0; i < tokens.length; i++) {
        if ((0, token_1.isFakeWhitelistToken)(tokens[i])) {
            for (let i = 0; i < tokens.length; i++) {
                usdValues.push(constants_1.BIGDECIMAL_ZERO);
            }
            return usdValues;
        }
    }
    for (let i = 0; i < tokens.length; i++) {
        usdValues.push((0, utils_1.bigDecimalAbs)((0, utils_1.convertTokenToDecimal)(tokenAmounts[i], tokens[i].decimals).times(tokens[i].lastPriceUSD)));
    }
    return usdValues;
}
