"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReward = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const SolarDistributorV2_1 = require("../../../../../generated/MasterChef/SolarDistributorV2");
const schema_1 = require("../../../../../generated/schema");
const constants_1 = require("../../../../../src/common/constants");
const getters_1 = require("../../../../../src/common/getters");
const rewards_1 = require("../../../../../src/common/rewards");
const utils_1 = require("../../../../../src/common/utils/utils");
const helpers_1 = require("../../../../../src/common/masterchef/helpers");
// Called on both deposits and withdraws into the MasterApe/MasterChef pool.
// Tracks staked LP tokens, and estimates the emissions of LP tokens for the liquidity pool associated with the staked LP.
// Emissions are estimated using rewards.ts and are projected for a 24 hour period.
function handleReward(event, pid, amount) {
    const poolContract = SolarDistributorV2_1.SolarDistributorV2.bind(event.address);
    const masterChefPool = (0, helpers_1.getOrCreateMasterChefStakingPool)(event, constants_1.MasterChef.MASTERCHEF, pid);
    const masterChef = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MASTERCHEF);
    // Check if the liquidity pool address is available. Try to get it if not or return if the contract call was reverted
    if (!masterChefPool.poolAddress) {
        const getPoolInfo = poolContract.try_poolInfo(pid);
        if (!getPoolInfo.reverted) {
            masterChefPool.poolAddress = getPoolInfo.value.value0.toHexString();
        }
        masterChefPool.save();
        if (!masterChefPool.poolAddress) {
            graph_ts_1.log.warning("poolInfo reverted: Could not find pool address for masterchef pool", []);
            return;
        }
    }
    // If the pool comes back null just return
    const pool = schema_1.LiquidityPool.load(masterChefPool.poolAddress);
    if (!pool) {
        return;
    }
    // Update staked amounts
    // Positive for deposits, negative for withdraws
    pool.stakedOutputTokenAmount = !pool.stakedOutputTokenAmount
        ? amount
        : pool.stakedOutputTokenAmount.plus(amount);
    // Return if you have calculated rewards recently - Performance Boost
    if (event.block.number
        .minus(masterChefPool.lastRewardBlock)
        .lt(constants_1.RECENT_BLOCK_THRESHOLD)) {
        pool.save();
        return;
    }
    // Get the reward tokens emitted per second for the pool. There can be multiple reward tokens per pool.
    const getPoolRewardsPerSecond = poolContract.try_poolRewardsPerSec(pid);
    const rewardTokenEmissionsAmountArray = [];
    const rewardTokenEmissionsUSDArray = [];
    const rewardTokenIds = [];
    if (!getPoolRewardsPerSecond.reverted) {
        // Value 0: Reward Token Address
        // Value 3: Reward Token Emissions Per Second
        for (let index = 0; index < getPoolRewardsPerSecond.value.value0.length; index++) {
            const rewardTokenAddresses = getPoolRewardsPerSecond.value.value0;
            const rewardTokenEmissionsPerSecond = getPoolRewardsPerSecond.value.value3;
            rewardTokenIds.push((0, getters_1.getOrCreateRewardToken)(event, rewardTokenAddresses[index].toHexString())
                .id);
            const rewardToken = (0, getters_1.getOrCreateToken)(event, rewardTokenAddresses[index].toHexString());
            const rewardTokenRateBigDecimal = rewardTokenEmissionsPerSecond[index].toBigDecimal();
            // Based on the emissions rate for the pool, calculate the rewards per day for the pool.
            const rewardTokenPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, rewardTokenRateBigDecimal, masterChef.rewardTokenInterval);
            const rewardTokenPerDayRounded = graph_ts_1.BigInt.fromString((0, utils_1.roundToWholeNumber)(rewardTokenPerDay).toString());
            const rewardTokenEmissionsUSD = (0, utils_1.convertTokenToDecimal)(rewardTokenPerDayRounded, rewardToken.decimals).times(rewardToken.lastPriceUSD);
            rewardTokenEmissionsAmountArray.push(rewardTokenPerDayRounded);
            rewardTokenEmissionsUSDArray.push(rewardTokenEmissionsUSD);
        }
    }
    pool.rewardTokens = rewardTokenIds;
    pool.rewardTokenEmissionsAmount = rewardTokenEmissionsAmountArray;
    pool.rewardTokenEmissionsUSD = rewardTokenEmissionsUSDArray;
    masterChefPool.lastRewardBlock = event.block.number;
    masterChefPool.save();
    masterChef.save();
    pool.save();
}
exports.handleReward = handleReward;
