"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReward = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../../configurations/configure");
const GrailTokenV2_1 = require("../../../../generated/CamelotMaster/GrailTokenV2");
const NFTPool_1 = require("../../../../generated/CamelotMaster/NFTPool");
const schema_1 = require("../../../../generated/schema");
const constants_1 = require("../../../../src/common/constants");
const getters_1 = require("../../../../src/common/getters");
const rewards_1 = require("../../../../src/common/rewards");
const logger_1 = require("../../../../src/common/utils/logger");
const utils_1 = require("../../../../src/common/utils/utils");
const helpers_1 = require("../common/masterchef/helpers");
const constants_2 = require("./constants");
function handleReward(event, address) {
    const logger = new logger_1.Logger(event, "handleReward");
    const nftPool = NFTPool_1.NFTPool.bind(address);
    const poolInfo = nftPool.try_getPoolInfo();
    if (poolInfo.reverted) {
        logger.error("getPoolInfo failed", []);
        return;
    }
    const poolAddress = poolInfo.value.value0; // lpToken
    const stakedAmount = poolInfo.value.value5; // lpSupply
    const stakedAmountWithMultiplier = poolInfo.value.value6; // lpSupplyWithMultiplier
    const allocPoint = poolInfo.value.value7; // allocPoint
    const xGrailRewardsShare = (0, utils_1.convertTokenToDecimal)(nftPool.xGrailRewardsShare(), constants_1.INT_FOUR);
    const chefPool = (0, helpers_1.getOrCreateMasterChefStakingPool)(event, constants_1.MasterChef.MINICHEF, poolAddress);
    (0, helpers_1.updateMasterChefTotalAllocation)(event, chefPool.poolAllocPoint, allocPoint, constants_1.MasterChef.MINICHEF);
    chefPool.poolAllocPoint = allocPoint;
    chefPool.save();
    const chef = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MINICHEF);
    const pool = schema_1.LiquidityPool.load(poolAddress.toHexString());
    if (!pool) {
        logger.error("Failed to load pool {}", [poolAddress.toHexString()]);
        return;
    }
    pool.stakedOutputTokenAmount = stakedAmount;
    const grailToken = (0, getters_1.getOrCreateToken)(event, configure_1.NetworkConfigs.getRewardToken());
    const xGrailToken = (0, getters_1.getOrCreateToken)(event, constants_2.XGRAIL_ADDRESS);
    pool.rewardTokens = [
        (0, getters_1.getOrCreateRewardToken)(event, configure_1.NetworkConfigs.getRewardToken()).id,
        (0, getters_1.getOrCreateRewardToken)(event, constants_2.XGRAIL_ADDRESS).id,
    ];
    const rewardTokenContract = GrailTokenV2_1.GrailTokenV2.bind(graph_ts_1.Address.fromString(grailToken.id));
    const emissionRate = rewardTokenContract.masterEmissionRate();
    chef.rewardTokenRate = emissionRate;
    chef.lastUpdatedRewardRate = event.block.number;
    if (chef.totalAllocPoint.gt(constants_1.BIGINT_ZERO)) {
        // Calculate Reward Emission
        let poolRewardTokenRate = chef.rewardTokenRate.times(chefPool.poolAllocPoint);
        if (stakedAmount.gt(constants_1.BIGINT_ZERO)) {
            poolRewardTokenRate = poolRewardTokenRate.times(stakedAmountWithMultiplier);
            poolRewardTokenRate = poolRewardTokenRate.div(stakedAmount);
        }
        poolRewardTokenRate = poolRewardTokenRate.div(chef.totalAllocPoint);
        // Based on the emissions rate for the pool, calculate the rewards per day for the pool.
        const rewardTokenRateBigDecimal = new graph_ts_1.BigDecimal(poolRewardTokenRate);
        const rewardTokenPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, rewardTokenRateBigDecimal, chef.rewardTokenInterval);
        const xGrailPerDay = xGrailRewardsShare.times(rewardTokenPerDay);
        const grailPerDay = rewardTokenPerDay.minus(xGrailPerDay);
        pool.rewardTokenEmissionsAmount = [
            graph_ts_1.BigInt.fromString((0, utils_1.roundToWholeNumber)(grailPerDay).toString()),
            graph_ts_1.BigInt.fromString((0, utils_1.roundToWholeNumber)(xGrailPerDay).toString()),
        ];
        pool.rewardTokenEmissionsUSD = [
            (0, utils_1.convertTokenToDecimal)(pool.rewardTokenEmissionsAmount[constants_1.INT_ZERO], grailToken.decimals).times(grailToken.lastPriceUSD),
            (0, utils_1.convertTokenToDecimal)(pool.rewardTokenEmissionsAmount[constants_1.INT_ONE], xGrailToken.decimals).times(grailToken.lastPriceUSD), // use grail token for xGrail price data
        ];
        chefPool.lastRewardBlock = event.block.number;
    }
    chefPool.save();
    chef.save();
    grailToken.save();
    pool.save();
}
exports.handleReward = handleReward;
