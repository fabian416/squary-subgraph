"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSeniorPoolRewardTokenEmissions = exports.updateCurrentEarnRate = exports.getStakingRewards = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const StakingRewards_1 = require("../../generated/StakingRewards/StakingRewards");
const constants_1 = require("../common/constants");
const getters_1 = require("../common/getters");
const utils_1 = require("../common/utils");
const senior_pool_1 = require("./senior_pool");
const STAKING_REWARDS_ID = "1";
function getStakingRewards() {
    let stakingRewards = schema_1.StakingRewardsData.load(STAKING_REWARDS_ID);
    if (!stakingRewards) {
        stakingRewards = new schema_1.StakingRewardsData(STAKING_REWARDS_ID);
        stakingRewards.currentEarnRatePerToken = graph_ts_1.BigInt.zero();
    }
    return stakingRewards;
}
exports.getStakingRewards = getStakingRewards;
function updateCurrentEarnRate(contractAddress) {
    const contract = StakingRewards_1.StakingRewards.bind(contractAddress);
    const callResult = contract.try_currentEarnRatePerToken();
    if (!callResult.reverted) {
        const stakingRewards = getStakingRewards();
        stakingRewards.currentEarnRatePerToken = callResult.value;
        stakingRewards.save();
        (0, senior_pool_1.updateEstimatedApyFromGfiRaw)();
    }
}
exports.updateCurrentEarnRate = updateCurrentEarnRate;
function updateSeniorPoolRewardTokenEmissions(event) {
    const stakingReward = getStakingRewards();
    const seniorPool = (0, getters_1.getOrCreateMarket)(constants_1.SENIOR_POOL_ADDRESS, event);
    const rewardTokens = seniorPool.rewardTokens;
    if (!rewardTokens || rewardTokens.length == 0) {
        // GFI reward token only for staker of FIDU (output) token
        const rewardTokenAddress = graph_ts_1.Address.fromString(constants_1.GFI_ADDRESS);
        const rewardToken = (0, getters_1.getOrCreateRewardToken)(rewardTokenAddress, constants_1.RewardTokenType.DEPOSIT);
        seniorPool.rewardTokens = [rewardToken.id];
    }
    // since FIDU and GFI both have 18 decimals
    const rewardTokenEmissionsAmount = (0, utils_1.bigDecimalToBigInt)(seniorPool.outputTokenSupply
        .times(stakingReward.currentEarnRatePerToken)
        .times(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY))
        .divDecimal(constants_1.GFI_DECIMALS));
    const GFIpriceUSD = (0, getters_1.getGFIPrice)(event);
    const rewardTokenEmissionsUSD = !GFIpriceUSD
        ? constants_1.BIGDECIMAL_ZERO
        : rewardTokenEmissionsAmount.divDecimal(constants_1.GFI_DECIMALS).times(GFIpriceUSD);
    seniorPool.rewardTokenEmissionsAmount = [rewardTokenEmissionsAmount];
    seniorPool.rewardTokenEmissionsUSD = [rewardTokenEmissionsUSD];
    graph_ts_1.log.info("[updateSeniorPoolRewardTokenEmissions]daily emission amout={}, USD={} at tx {}", [
        rewardTokenEmissionsAmount.toString(),
        rewardTokenEmissionsUSD.toString(),
        event.transaction.hash.toHexString(),
    ]);
    seniorPool.save();
}
exports.updateSeniorPoolRewardTokenEmissions = updateSeniorPoolRewardTokenEmissions;
