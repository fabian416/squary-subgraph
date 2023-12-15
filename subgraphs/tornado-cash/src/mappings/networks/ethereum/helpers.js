"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRewardSwap = exports.createRateChanged = exports.createFeeUpdated = exports.createWithdrawal = exports.createDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const getters_1 = require("../../../common/getters");
const numbers_1 = require("../../../common/utils/numbers");
const rewards_1 = require("../../../common/rewards");
const constants_1 = require("../../../common/constants");
const metrics_1 = require("../../../common/metrics");
const configure_1 = require("../../../../configurations/configure");
function createDeposit(poolAddress, event) {
    const pool = (0, getters_1.getOrCreatePool)(poolAddress, event);
    const inputToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[0]), event.block.number);
    pool.inputTokenBalances = [
        pool.inputTokenBalances[0].plus(pool._denomination),
    ];
    const inputTokenbalanceUSD = (0, numbers_1.bigIntToBigDecimal)(pool.inputTokenBalances[0], inputToken.decimals).times(inputToken.lastPriceUSD);
    pool.inputTokenBalancesUSD = [inputTokenbalanceUSD];
    pool.totalValueLockedUSD = inputTokenbalanceUSD;
    pool.save();
}
exports.createDeposit = createDeposit;
function createWithdrawal(poolAddress, event) {
    const pool = (0, getters_1.getOrCreatePool)(poolAddress, event);
    const inputToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[0]), event.block.number);
    pool.inputTokenBalances = [
        pool.inputTokenBalances[0].minus(pool._denomination),
    ];
    const inputTokenBalanceUSD = (0, numbers_1.bigIntToBigDecimal)(pool.inputTokenBalances[0], inputToken.decimals).times(inputToken.lastPriceUSD);
    pool.inputTokenBalancesUSD = [inputTokenBalanceUSD];
    pool.totalValueLockedUSD = inputTokenBalanceUSD;
    pool.save();
    const relayerFeeUsd = (0, numbers_1.bigIntToBigDecimal)(event.params.fee, inputToken.decimals).times(inputToken.lastPriceUSD);
    if (relayerFeeUsd != constants_1.BIGDECIMAL_ZERO) {
        const protocolFeeToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(configure_1.NetworkConfigs.getRewardToken().get("address")), event.block.number);
        const protocolFeeUsd = (0, numbers_1.bigIntToBigDecimal)(pool._fee, protocolFeeToken.decimals).times(protocolFeeToken.lastPriceUSD);
        (0, metrics_1.updateRevenue)(event, poolAddress, relayerFeeUsd, protocolFeeUsd);
    }
}
exports.createWithdrawal = createWithdrawal;
function createFeeUpdated(poolAddress, event) {
    const pool = (0, getters_1.getOrCreatePool)(poolAddress, event);
    pool._fee = event.params.newFee;
    pool.save();
}
exports.createFeeUpdated = createFeeUpdated;
function createRateChanged(poolAddress, event) {
    const pool = (0, getters_1.getOrCreatePool)(poolAddress, event);
    pool._apEmissionsAmount = [event.params.value];
    pool.save();
}
exports.createRateChanged = createRateChanged;
function createRewardSwap(event) {
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const rewardToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(configure_1.NetworkConfigs.getRewardToken().get("address")), event.block.number);
    const pools = protocol.pools;
    for (let i = 0; i < pools.length; i++) {
        const pool = (0, getters_1.getOrCreatePool)(pools[i], event);
        const rewardsPerBlock = event.params.TORN.div(event.params.pTORN).times(pool._apEmissionsAmount[0]);
        const rewardsPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, new graph_ts_1.BigDecimal(rewardsPerBlock), rewards_1.RewardIntervalType.BLOCK);
        pool.rewardTokenEmissionsAmount = [(0, numbers_1.bigDecimalToBigInt)(rewardsPerDay)];
        pool.rewardTokenEmissionsUSD = [
            (0, numbers_1.bigIntToBigDecimal)(pool.rewardTokenEmissionsAmount[0], rewardToken.decimals).times(rewardToken.lastPriceUSD),
        ];
        pool.save();
        (0, metrics_1.updatePoolMetrics)(pools[i], event);
    }
}
exports.createRewardSwap = createRewardSwap;
