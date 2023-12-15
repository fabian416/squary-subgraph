"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolAddressAndAllocation = exports.updateMasterChef = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../../../configurations/configure");
const MasterChefV2Spookyswap_1 = require("../../../../../generated/MasterChefV2/MasterChefV2Spookyswap");
const schema_1 = require("../../../../../generated/schema");
const constants_1 = require("../../../../../src/common/constants");
const getters_1 = require("../../../../../src/common/getters");
const rewards_1 = require("../../../../../src/common/rewards");
const utils_1 = require("../../../../../src/common/utils/utils");
const helpers_1 = require("../../../../../src/common/masterchef/helpers");
// Updated Liquidity pool staked amount and emmissions on a deposit to the masterchef contract.
function updateMasterChef(event, pid, amount) {
    let masterChefV2Pool = (0, helpers_1.getOrCreateMasterChefStakingPool)(event, constants_1.MasterChef.MASTERCHEFV2, pid);
    const masterchefV2Contract = MasterChefV2Spookyswap_1.MasterChefV2Spookyswap.bind(event.address);
    const masterChefV2 = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MASTERCHEFV2);
    // Sometimes the pool addition event is not emitted before the deposit/withdraw event. In this case, we need to add the pool and allocation to the masterchef entity.
    if (!masterChefV2Pool.poolAddress) {
        masterChefV2Pool = getPoolAddressAndAllocation(event, pid, masterChefV2Pool);
        masterChefV2.totalAllocPoint = masterChefV2.totalAllocPoint.plus(masterChefV2Pool.poolAllocPoint);
        masterChefV2Pool.save();
        masterChefV2.save();
    }
    // Return if pool does not exist
    const pool = schema_1.LiquidityPool.load(masterChefV2Pool.poolAddress);
    if (!pool) {
        return;
    }
    const rewardToken = (0, getters_1.getOrCreateToken)(event, configure_1.NetworkConfigs.getRewardToken());
    pool.rewardTokens = [rewardToken.id];
    // Get the amount of reward tokens emitted per block at this point in time.
    if (masterChefV2.lastUpdatedRewardRate != event.block.number) {
        const getSpookyPerBlock = masterchefV2Contract.try_booPerSecond();
        if (!getSpookyPerBlock.reverted) {
            masterChefV2.adjustedRewardTokenRate = getSpookyPerBlock.value;
        }
        masterChefV2.lastUpdatedRewardRate = event.block.number;
    }
    // Calculate Reward Emission per second to a specific pool
    // Pools are allocated based on their fraction of the total allocation times the rewards emitted per block.
    const rewardAmountPerInterval = masterChefV2.adjustedRewardTokenRate
        .times(masterChefV2Pool.poolAllocPoint)
        .div(masterChefV2.totalAllocPoint);
    const rewardAmountPerIntervalBigDecimal = graph_ts_1.BigDecimal.fromString(rewardAmountPerInterval.toString());
    // Based on the emissions rate for the pool, calculate the rewards per day for the pool.
    const rewardTokenPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, rewardAmountPerIntervalBigDecimal, masterChefV2.rewardTokenInterval);
    // Update the amount of staked tokens after withdraw
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
function getPoolAddressAndAllocation(event, pid, masterChefV2Pool) {
    const poolContract = MasterChefV2Spookyswap_1.MasterChefV2Spookyswap.bind(event.address);
    const poolAddress = poolContract.try_lpToken(pid);
    const poolInfo = poolContract.try_poolInfo(pid);
    if (!poolAddress.reverted) {
        masterChefV2Pool.poolAddress = poolAddress.value.toHexString();
    }
    if (!poolInfo.reverted) {
        masterChefV2Pool.poolAllocPoint = poolInfo.value.getAllocPoint();
    }
    if (!masterChefV2Pool.poolAddress) {
        graph_ts_1.log.critical("poolInfo reverted: Could not find pool address for masterchef pool", []);
    }
    return masterChefV2Pool;
}
exports.getPoolAddressAndAllocation = getPoolAddressAndAllocation;
