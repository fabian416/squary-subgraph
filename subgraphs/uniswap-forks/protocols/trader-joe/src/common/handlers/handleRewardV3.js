"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMasterChef = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../../../configurations/configure");
const MasterChefV3TraderJoe_1 = require("../../../../../generated/MasterChefV3/MasterChefV3TraderJoe");
const schema_1 = require("../../../../../generated/schema");
const getters_1 = require("../../../../../src/common/getters");
const rewards_1 = require("../../../../../src/common/rewards");
const helpers_1 = require("../../../../../src/common/masterchef/helpers");
const constants_1 = require("../../../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
const handleRewarder_1 = require("./handleRewarder");
// Updated Liquidity pool staked amount and emmissions on a deposit to the masterchef contract.
function updateMasterChef(event, pid, amount, user // account depositing/withdrawing
) {
    const masterChefV3Pool = schema_1._MasterChefStakingPool.load(constants_1.MasterChef.MASTERCHEFV3 + "-" + pid.toString());
    const masterchefV3Contract = MasterChefV3TraderJoe_1.MasterChefV3TraderJoe.bind(event.address);
    const masterChefV3 = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MASTERCHEFV3);
    // Return if pool does not exist
    const pool = schema_1.LiquidityPool.load(masterChefV3Pool.poolAddress);
    if (!pool) {
        return;
    }
    const rewardToken = (0, getters_1.getOrCreateToken)(event, configure_1.NetworkConfigs.getRewardToken());
    pool.rewardTokens = [
        (0, getters_1.getOrCreateRewardToken)(event, configure_1.NetworkConfigs.getRewardToken()).id,
    ];
    // Get the amount of Joe tokens emitted for all pools per second.
    if (masterChefV3.lastUpdatedRewardRate != event.block.number) {
        const getJoePerSec = masterchefV3Contract.try_joePerSec();
        if (!getJoePerSec.reverted) {
            masterChefV3.adjustedRewardTokenRate = getJoePerSec.value;
        }
        masterChefV3.lastUpdatedRewardRate = event.block.number;
    }
    // Calculate Reward Emission per second to a specific pool
    // Pools are allocated based on their fraction of the total allocation times the rewards emitted per second
    const rewardAmountPerInterval = masterChefV3.adjustedRewardTokenRate
        .times(masterChefV3Pool.poolAllocPoint)
        .div(masterChefV3.totalAllocPoint);
    const rewardAmountPerIntervalBigDecimal = graph_ts_1.BigDecimal.fromString(rewardAmountPerInterval.toString());
    // Based on the emissions rate for the pool, calculate the rewards per day for the pool.
    const rewardTokenPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, rewardAmountPerIntervalBigDecimal, masterChefV3.rewardTokenInterval);
    // Update the amount of staked tokens after deposit
    pool.stakedOutputTokenAmount = !pool.stakedOutputTokenAmount
        ? amount
        : pool.stakedOutputTokenAmount.plus(amount);
    pool.rewardTokenEmissionsAmount = [
        graph_ts_1.BigInt.fromString((0, utils_1.roundToWholeNumber)(rewardTokenPerDay).toString()),
    ];
    pool.rewardTokenEmissionsUSD = [
        (0, utils_1.convertTokenToDecimal)(pool.rewardTokenEmissionsAmount[constants_1.INT_ZERO], rewardToken.decimals).times(rewardToken.lastPriceUSD),
    ];
    masterChefV3Pool.lastRewardBlock = event.block.number;
    const rewards = (0, handleRewarder_1.getPoolRewardsWithBonus)(event, masterChefV3, masterChefV3Pool, pool, user, amount.gt(constants_1.BIGINT_ZERO));
    if (rewards) {
        pool.rewardTokens = rewards.tokens;
        pool.rewardTokenEmissionsAmount = rewards.amounts;
        pool.rewardTokenEmissionsUSD = rewards.amountsUSD;
    }
    masterChefV3Pool.save();
    masterChefV3.save();
    rewardToken.save();
    pool.save();
}
exports.updateMasterChef = updateMasterChef;
