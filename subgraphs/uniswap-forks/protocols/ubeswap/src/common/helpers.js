"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStakedAmount = exports.updateRewardEmissions = exports.getOrCreateMasterChef = exports.getOrCreateMasterChefStakingPool = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../../configurations/configure");
const PoolManager_1 = require("../../../../generated/PoolManager/PoolManager");
const templates_1 = require("../../../../generated/templates");
const schema_1 = require("../../../../generated/schema");
const constants_1 = require("../../../../src/common/constants");
const getters_1 = require("../../../../src/common/getters");
const constants_2 = require("./constants");
const utils_1 = require("../../../../src/common/utils/utils");
// Create a MasterChefStaking pool using the MasterChef pid for id.
function getOrCreateMasterChefStakingPool(event, masterChefType, pid, poolAddress) {
    let masterChefPool = schema_1._MasterChefStakingPool.load(masterChefType + "-" + pid.toString());
    // Create entity to track masterchef pool mappings
    if (!masterChefPool) {
        const poolManager = PoolManager_1.PoolManager.bind(event.address);
        const poolInfo = poolManager.try_pools(poolAddress);
        // If the staking pool is found, create a map between the staking pool address and the pid.
        // This is used to find the staking pool pid given its address.
        // Also, generate a template here to track the staking pool events.
        if (!poolInfo.reverted) {
            const pidAddressMap = new schema_1._MasterChefAddressToPid(poolInfo.value.value2.toHexString());
            pidAddressMap.pid = pid;
            pidAddressMap.save();
            templates_1.StakingRewards.create(poolInfo.value.value2);
        }
        else {
            graph_ts_1.log.warning("Pool not found in pool manager. ID: " +
                pid.toString() +
                " Pool Address: " +
                poolAddress.toHexString(), []);
        }
        masterChefPool = new schema_1._MasterChefStakingPool(masterChefType + "-" + pid.toString());
        masterChefPool.multiplier = constants_1.BIGINT_ONE;
        masterChefPool.poolAllocPoint = constants_1.BIGINT_ZERO;
        masterChefPool.lastRewardBlock = event.block.number;
        masterChefPool.poolAddress = poolAddress.toHexString();
        graph_ts_1.log.warning("MASTERCHEF POOL CREATED: " + pid.toString(), []);
        // Add a reward token to the liquidity pool since it now has an associated staking pool.
        const pool = schema_1.LiquidityPool.load(masterChefPool.poolAddress);
        if (pool) {
            pool.rewardTokens = [
                (0, getters_1.getOrCreateRewardToken)(event, configure_1.NetworkConfigs.getRewardToken()).id,
            ];
            pool.save();
        }
    }
    masterChefPool.save();
    return masterChefPool;
}
exports.getOrCreateMasterChefStakingPool = getOrCreateMasterChefStakingPool;
// Create the masterchef contract that contains data used to calculate rewards for all pools.
function getOrCreateMasterChef(event, masterChefType) {
    let masterChef = schema_1._MasterChef.load(masterChefType);
    if (!masterChef) {
        masterChef = new schema_1._MasterChef(masterChefType);
        masterChef.totalAllocPoint = constants_1.BIGINT_ZERO;
        masterChef.rewardTokenInterval = configure_1.NetworkConfigs.getRewardIntervalType();
        masterChef.rewardTokenRate = configure_1.NetworkConfigs.getRewardTokenRate();
        masterChef.adjustedRewardTokenRate = constants_1.BIGINT_ZERO;
        masterChef.lastUpdatedRewardRate = constants_1.BIGINT_ZERO;
        masterChef.save();
    }
    return masterChef;
}
exports.getOrCreateMasterChef = getOrCreateMasterChef;
// Update the masterchef contract with the latest reward token rate.
function updateRewardEmissions(event) {
    // Process to load in liquidity pool data.
    const masterChefAddressPidMap = schema_1._MasterChefAddressToPid.load(event.address.toHexString());
    const masterChefPool = schema_1._MasterChefStakingPool.load(constants_1.MasterChef.MASTERCHEF + "-" + masterChefAddressPidMap.pid.toString());
    const pool = (0, getters_1.getLiquidityPool)(masterChefPool.poolAddress);
    // Return if you have calculated rewards recently - Performance Boost
    if (event.block.number
        .minus(masterChefPool.lastRewardBlock)
        .lt(constants_1.RECENT_BLOCK_THRESHOLD)) {
        pool.save();
        return;
    }
    const poolManager = PoolManager_1.PoolManager.bind(graph_ts_1.Address.fromString(constants_2.POOL_MANAGER));
    // Get the reward period and the expected rewards for this particular pool for this period.
    const period = poolManager.currentPeriod();
    const poolRewardForPeriod = poolManager.computeAmountForPool(graph_ts_1.Address.fromString(pool.id), period.value0);
    // Divide the rewards for this period by 7 because each period lasts one week.
    const poolRewardDailyAverage = poolRewardForPeriod.div(constants_1.ONE_WEEK_IN_DAYS);
    const rewardToken = (0, getters_1.getOrCreateToken)(event, configure_1.NetworkConfigs.getRewardToken());
    // Update the emissions amount in quantity and USD value.
    pool.rewardTokenEmissionsAmount = [poolRewardDailyAverage];
    pool.rewardTokenEmissionsUSD = [
        (0, utils_1.convertTokenToDecimal)(pool.rewardTokenEmissionsAmount[constants_1.INT_ZERO], rewardToken.decimals).times(rewardToken.lastPriceUSD),
    ];
    masterChefPool.lastRewardBlock = event.block.number;
    masterChefPool.save();
    pool.save();
}
exports.updateRewardEmissions = updateRewardEmissions;
function updateStakedAmount(event, amount) {
    const masterChefAddressPidMap = schema_1._MasterChefAddressToPid.load(event.address.toHexString());
    const masterChefPool = schema_1._MasterChefStakingPool.load(constants_1.MasterChef.MASTERCHEF + "-" + masterChefAddressPidMap.pid.toString());
    const pool = (0, getters_1.getLiquidityPool)(masterChefPool.poolAddress);
    pool.stakedOutputTokenAmount = !pool.stakedOutputTokenAmount
        ? amount
        : pool.stakedOutputTokenAmount.plus(amount);
    pool.save();
}
exports.updateStakedAmount = updateStakedAmount;
