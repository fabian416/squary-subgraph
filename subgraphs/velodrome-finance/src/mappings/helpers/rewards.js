"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRewards = exports.updateStaked = exports.killGauge = exports.createGauge = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const numbers_1 = require("../../common/utils/numbers");
const entities_1 = require("./entities");
const schema_1 = require("../../../generated/schema");
function createGauge(pool, gaugeAddress, veloAddress) {
    (0, entities_1.createLiquidityGauge)(gaugeAddress, graph_ts_1.Address.fromString(pool.id));
    (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(veloAddress));
    const rewardToken = (0, getters_1.getOrCreateRewardToken)(graph_ts_1.Address.fromString(veloAddress));
    pool.rewardTokens = [rewardToken.id];
    pool.save();
}
exports.createGauge = createGauge;
function killGauge(pool, gauge) {
    gauge.active = false;
    gauge.save();
    pool.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
    pool.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
    pool.save();
}
exports.killGauge = killGauge;
function updateStaked(pool, amount, staking) {
    if (staking) {
        pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount.plus(amount);
    }
    else {
        pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount.minus(amount);
    }
    pool.save();
}
exports.updateStaked = updateStaked;
function updateRewards(pool, amount) {
    const rewardTokenEmissionsAmount = amount.div(constants_1.BIGINT_SEVEN);
    // Emissions are weekly
    pool.rewardTokenEmissionsAmount = [rewardTokenEmissionsAmount];
    const rewardTokens = pool.rewardTokens;
    if (rewardTokens) {
        const rewardToken = schema_1.RewardToken.load(rewardTokens[0]);
        const token = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(rewardToken.token));
        pool.rewardTokenEmissionsUSD = [
            (0, numbers_1.applyDecimals)(rewardTokenEmissionsAmount, token.decimals).times(token.lastPriceUSD),
        ];
    }
    pool.save();
}
exports.updateRewards = updateRewards;
