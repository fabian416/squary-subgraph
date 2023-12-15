"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReward = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../../configurations/configure");
const HoneyFarm_1 = require("../../../../generated/HoneyFarm/HoneyFarm");
const schema_1 = require("../../../../generated/schema");
const constants_1 = require("../../../../src/common/constants");
const rewards_1 = require("../../../../src/common/rewards");
// WIP: HoneyFarm reward handlers currently not used in Honeyswap subgraph deployment
// TODO: Fix reward emissions calculations (rewardTokenRate) and add token pricing
function handleReward(event, tokenId, usageType) {
    const poolContract = HoneyFarm_1.HoneyFarm.bind(event.address);
    const getDepositInfo = poolContract.try_depositInfo(tokenId);
    let lpTokenAddress = graph_ts_1.Address.zero();
    let amount = constants_1.BIGINT_ZERO;
    if (!getDepositInfo.reverted) {
        const depositInfo = getDepositInfo.value;
        lpTokenAddress = depositInfo.value5;
        amount = depositInfo.value0;
    }
    graph_ts_1.log.debug("DEPOSIT INFO: lpTokenAddress: {}, amount: {}", [
        lpTokenAddress.toHexString(),
        amount.toString(),
    ]);
    // Return if pool does not exist
    const pool = schema_1.LiquidityPool.load(lpTokenAddress.toHexString());
    if (!pool) {
        return;
    }
    let honeyFarmPool = schema_1._HelperStore.load(lpTokenAddress.toHexString());
    // Create entity to track last HoneyFarm pool updates
    if (!honeyFarmPool) {
        honeyFarmPool = new schema_1._HelperStore(lpTokenAddress.toHexString());
        honeyFarmPool.valueBigInt = event.block.timestamp;
        honeyFarmPool.save();
    }
    // Update staked amounts
    if (usageType == constants_1.UsageType.DEPOSIT) {
        pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount.plus(amount);
    }
    else {
        pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount.minus(amount);
    }
    // Get necessary values from the HoneyFarm contract to calculate rewards
    const getPoolInfo = poolContract.try_poolInfo(lpTokenAddress);
    let poolAllocPoint = constants_1.BIGINT_ZERO;
    let lastRewardTime = constants_1.BIGINT_ZERO;
    if (!getPoolInfo.reverted) {
        const poolInfo = getPoolInfo.value;
        poolAllocPoint = poolInfo.value0;
        lastRewardTime = poolInfo.value1;
    }
    const getTotalAllocPoint = poolContract.try_totalAllocationPoints();
    let totalAllocPoint = constants_1.BIGINT_ZERO;
    if (!getTotalAllocPoint.reverted) {
        totalAllocPoint = getTotalAllocPoint.value;
    }
    graph_ts_1.log.debug("DIST INFO: prevRewardTime: {}, event.block.timestamp: {}, lastRwardTime: {}", [
        honeyFarmPool.valueBigInt.toString(),
        event.block.timestamp.toString(),
        lastRewardTime.toString(),
    ]);
    const getDistribution = poolContract.try_getDistribution(honeyFarmPool.valueBigInt, event.block.timestamp);
    let distribution = constants_1.BIGINT_ZERO;
    if (!getDistribution.reverted) {
        distribution = getDistribution.value;
    }
    graph_ts_1.log.debug("POOL INFO: poolAllocPoint: {}, totalAllocPoint: {}, lastRewardTime: {}, timestamp: {}, distribution: {}", [
        poolAllocPoint.toString(),
        totalAllocPoint.toString(),
        lastRewardTime.toString(),
        event.block.timestamp.toString(),
        distribution.toString(),
    ]);
    // Calculate Reward Emission
    const rewardTokenRate = distribution
        .times(poolAllocPoint)
        .div(totalAllocPoint);
    // Get the estimated rewards emitted for the upcoming day for this pool
    const rewardTokenRateBigDecimal = new graph_ts_1.BigDecimal(rewardTokenRate);
    const rewardTokenPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, rewardTokenRateBigDecimal, configure_1.NetworkConfigs.getRewardIntervalType());
    graph_ts_1.log.debug("REWARD CALC: rewardTokenRate: {}, rewardTokenPerDay: {}", [
        rewardTokenRate.toString(),
        rewardTokenPerDay.toString(),
    ]);
    pool.rewardTokenEmissionsAmount = [
        graph_ts_1.BigInt.fromString(rewardTokenPerDay.truncate(0).toString()),
    ];
    honeyFarmPool.valueBigInt = event.block.timestamp;
    pool.save();
}
exports.handleReward = handleReward;
