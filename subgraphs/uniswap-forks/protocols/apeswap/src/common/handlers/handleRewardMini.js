"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMasterChef = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../../../configurations/configure");
const MiniChefV2Apeswap_1 = require("../../../../../generated/MiniChefV2/MiniChefV2Apeswap");
const schema_1 = require("../../../../../generated/schema");
const constants_1 = require("../../../../../src/common/constants");
const getters_1 = require("../../../../../src/common/getters");
const rewards_1 = require("../../../../../src/common/rewards");
const helpers_1 = require("../../../../../src/common/masterchef/helpers");
const utils_1 = require("../../../../../src/common/utils/utils");
// Updated Liquidity pool staked amount and emmissions on a deposit to the masterchef contract.
function updateMasterChef(event, pid, amount) {
    const masterChefV2Pool = schema_1._MasterChefStakingPool.load(constants_1.MasterChef.MINICHEF + "-" + pid.toString());
    const masterchefV2Contract = MiniChefV2Apeswap_1.MiniChefV2Apeswap.bind(event.address);
    const masterChefV2 = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MINICHEF);
    const pool = schema_1.LiquidityPool.load(masterChefV2Pool.poolAddress);
    if (!pool) {
        return;
    }
    const rewardToken = (0, getters_1.getOrCreateToken)(event, configure_1.NetworkConfigs.getRewardToken());
    pool.rewardTokens = [
        (0, getters_1.getOrCreateRewardToken)(event, configure_1.NetworkConfigs.getRewardToken()).id,
    ];
    // Get the amount of Banana tokens emitted for all pools per second.
    if (masterChefV2.lastUpdatedRewardRate != event.block.number) {
        const getBananaPerSecond = masterchefV2Contract.try_bananaPerSecond();
        if (!getBananaPerSecond.reverted) {
            masterChefV2.adjustedRewardTokenRate = getBananaPerSecond.value;
            masterChefV2.lastUpdatedRewardRate = event.block.number;
        }
    }
    // Calculate Reward Emission per second to a specific pool
    // Pools are allocated based on their fraction of the total allocation times the rewards emitted per second
    const rewardAmountPerInterval = masterChefV2.adjustedRewardTokenRate
        .times(masterChefV2Pool.poolAllocPoint)
        .div(masterChefV2.totalAllocPoint);
    const rewardAmountPerIntervalBigDecimal = graph_ts_1.BigDecimal.fromString(rewardAmountPerInterval.toString());
    // Based on the emissions rate for the pool, calculate the rewards per day for the pool.
    const rewardTokenPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, rewardAmountPerIntervalBigDecimal, masterChefV2.rewardTokenInterval);
    // Update the amount of staked tokens
    // Positive for deposits, negative for withdraws
    pool.stakedOutputTokenAmount = !pool.stakedOutputTokenAmount
        ? amount
        : pool.stakedOutputTokenAmount.plus(amount);
    pool.rewardTokenEmissionsAmount = [
        graph_ts_1.BigInt.fromString((0, utils_1.roundToWholeNumber)(rewardTokenPerDay).toString()),
    ];
    pool.rewardTokenEmissionsUSD = [
        (0, utils_1.convertTokenToDecimal)(pool.rewardTokenEmissionsAmount[constants_1.INT_ZERO], rewardToken.decimals).times(rewardToken.lastPriceUSD),
    ];
    masterChefV2Pool.lastRewardBlock = event.block.number;
    masterChefV2Pool.save();
    masterChefV2.save();
    rewardToken.save();
    pool.save();
}
exports.updateMasterChef = updateMasterChef;
