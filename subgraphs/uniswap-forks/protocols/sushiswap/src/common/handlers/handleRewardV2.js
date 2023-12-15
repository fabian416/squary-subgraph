"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMasterChef = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../../../configurations/configure");
const schema_1 = require("../../../../../generated/schema");
const constants_1 = require("../../../../../src/common/constants");
const getters_1 = require("../../../../../src/common/getters");
const rewards_1 = require("../../../../../src/common/rewards");
const utils_1 = require("../../../../../src/common/utils/utils");
const helpers_1 = require("../../../../../src/common/masterchef/helpers");
// Updated Liquidity pool staked amount and emmissions on a deposit to the masterchef contract.
function updateMasterChef(event, pid, amount) {
    const masterChefV2Pool = schema_1._MasterChefStakingPool.load(constants_1.MasterChef.MASTERCHEFV2 + "-" + pid.toString());
    const masterChefV2 = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MASTERCHEFV2);
    // Return if pool does not exist
    const pool = schema_1.LiquidityPool.load(masterChefV2Pool.poolAddress);
    if (!pool) {
        return;
    }
    const rewardToken = (0, getters_1.getOrCreateToken)(event, configure_1.NetworkConfigs.getRewardToken());
    pool.rewardTokens = [
        (0, getters_1.getOrCreateRewardToken)(event, configure_1.NetworkConfigs.getRewardToken()).id,
    ];
    // Calculate Reward Emission per second to a specific pool
    // Pools are allocated based on their fraction of the total allocation times the rewards emitted per block.
    // Adjusted reward token rate is calculated in the MasterChefV1 handler since rewards feed in from MasterChefV1.
    let rewardAmountPerInterval;
    if (masterChefV2.totalAllocPoint != constants_1.BIGINT_ZERO) {
        rewardAmountPerInterval = masterChefV2.adjustedRewardTokenRate
            .times(masterChefV2Pool.poolAllocPoint)
            .div(masterChefV2.totalAllocPoint);
    }
    else {
        rewardAmountPerInterval = constants_1.BIGINT_ZERO;
        graph_ts_1.log.warning("TOTAL ALLOC POINT IS ZERO. POOL ALLOC POINT IS: " +
            masterChefV2Pool.poolAllocPoint.toString(), []);
    }
    const rewardAmountPerIntervalBigDecimal = graph_ts_1.BigDecimal.fromString(rewardAmountPerInterval.toString());
    // Based on the emissions rate for the pool, calculate the rewards per day for the pool.
    const rewardTokenPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, rewardAmountPerIntervalBigDecimal, masterChefV2.rewardTokenInterval);
    // Update the amount of staked LP tokens
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
