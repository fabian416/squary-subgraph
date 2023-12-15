"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReward = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../../../configurations/configure");
const MasterChefTrisolaris_1 = require("../../../../../generated/MasterChef/MasterChefTrisolaris");
const schema_1 = require("../../../../../generated/schema");
const constants_1 = require("../../../../../src/common/constants");
const getters_1 = require("../../../../../src/common/getters");
const rewards_1 = require("../../../../../src/common/rewards");
const helpers_1 = require("../../../../../src/common/masterchef/helpers");
const utils_1 = require("../../../../../src/common/utils/utils");
// Called on both deposits and withdraws into the MasterChef pool.
// Tracks staked LP tokens, and estimates the emissions of LP tokens for the liquidity pool associated with the staked LP.
// Emissions are estimated using rewards.ts and are projected for a 24 hour period.
function handleReward(event, pid, amount) {
    const poolContract = MasterChefTrisolaris_1.MasterChefTrisolaris.bind(event.address);
    const masterChefPool = (0, helpers_1.getOrCreateMasterChefStakingPool)(event, constants_1.MasterChef.MASTERCHEF, pid);
    const masterChef = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MASTERCHEF);
    const masterChefV2 = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MASTERCHEFV2);
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
    // If comes back null then it is probably a uniswap v2 pool.
    // MasterChef was used for UniV2 LP tokens before SushiSwap liquidity pools were created.
    const pool = schema_1.LiquidityPool.load(masterChefPool.poolAddress);
    if (!pool) {
        return;
    }
    const rewardToken = (0, getters_1.getOrCreateToken)(event, configure_1.NetworkConfigs.getRewardToken());
    pool.rewardTokens = [
        (0, getters_1.getOrCreateRewardToken)(event, configure_1.NetworkConfigs.getRewardToken()).id,
    ];
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
    // Get the pool allocation point to get the fractional awards given to this pool.
    const getPoolInfo = poolContract.try_poolInfo(pid);
    if (!getPoolInfo.reverted) {
        const poolInfo = getPoolInfo.value;
        masterChefPool.poolAllocPoint = poolInfo.value1;
    }
    // Get the bonus multiplier if it is applicable
    const getMuliplier = poolContract.try_getMultiplier(event.block.number.minus(constants_1.BIGINT_ONE), event.block.number);
    if (!getMuliplier.reverted) {
        masterChefPool.multiplier = getMuliplier.value;
    }
    // Get the total allocation for all pools
    const getTotalAlloc = poolContract.try_totalAllocPoint();
    if (!getTotalAlloc.reverted) {
        masterChef.totalAllocPoint = getTotalAlloc.value;
    }
    // Allocation from the MasterChefV2 Contract.
    // This portion of the allocation is fed into the MasterChevV2 contract.
    // This means the proportion of rewards at this allocation will be all rewards emitted by MasterChefV2.
    const getPoolInfo250 = poolContract.try_poolInfo(graph_ts_1.BigInt.fromI32(250));
    let masterChefV2Alloc;
    if (!getPoolInfo250.reverted) {
        masterChefV2Alloc = getPoolInfo250.value.value1;
    }
    else {
        masterChefV2Alloc = constants_1.BIGINT_ZERO;
    }
    // Adjusted Reward Emission are just the static reward rate
    masterChef.adjustedRewardTokenRate = masterChef.rewardTokenRate;
    masterChef.lastUpdatedRewardRate = event.block.number;
    // Calculate Adjusted Reward Emission per Block to the MasterChefV2 Contract
    masterChefV2.adjustedRewardTokenRate = masterChefV2Alloc
        .div(masterChef.totalAllocPoint)
        .times(masterChef.rewardTokenRate);
    masterChefV2.lastUpdatedRewardRate = event.block.number;
    // Calculate Reward Emission per Block
    const poolRewardTokenRate = masterChefPool.multiplier
        .times(masterChef.adjustedRewardTokenRate)
        .times(masterChefPool.poolAllocPoint)
        .div(masterChef.totalAllocPoint);
    // Based on the emissions rate for the pool, calculate the rewards per day for the pool.
    const rewardTokenRateBigDecimal = new graph_ts_1.BigDecimal(poolRewardTokenRate);
    const rewardTokenPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, rewardTokenRateBigDecimal, masterChef.rewardTokenInterval);
    pool.rewardTokenEmissionsAmount = [
        graph_ts_1.BigInt.fromString((0, utils_1.roundToWholeNumber)(rewardTokenPerDay).toString()),
    ];
    pool.rewardTokenEmissionsUSD = [
        (0, utils_1.convertTokenToDecimal)(pool.rewardTokenEmissionsAmount[constants_1.INT_ZERO], rewardToken.decimals).times(rewardToken.lastPriceUSD),
    ];
    masterChefPool.lastRewardBlock = event.block.number;
    masterChefPool.save();
    masterChef.save();
    masterChefV2.save();
    rewardToken.save();
    pool.save();
}
exports.handleReward = handleReward;
