"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdatePeriodFinish = exports.handleRewardsDurationUpdated = exports.handleRewardAdded = exports.handleWidthdrawn = exports.handleStaked = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../common/constants");
const markets_1 = require("../common/mappingHelpers/getOrCreate/markets");
const supporting_1 = require("../common/mappingHelpers/getOrCreate/supporting");
const transactions_1 = require("../common/mappingHelpers/getOrCreate/transactions");
const intervalUpdate_1 = require("../common/mappingHelpers/update/intervalUpdate");
const utils_1 = require("../common/utils");
function handleStaked(event) {
    const mplRewardsAddress = event.address;
    const mplRewards = (0, markets_1.getOrCreateMplReward)(event, mplRewardsAddress);
    const stakeToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(mplRewards.stakeToken));
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(mplRewards.market));
    const stakeType = market.id == stakeToken.id ? constants_1.StakeType.MPL_LP_REWARDS : constants_1.StakeType.MPL_STAKE_REWARDS;
    ////
    // Create stake
    ////
    (0, transactions_1.createStake)(event, market, stakeToken, event.params.amount, stakeType);
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleStaked = handleStaked;
function handleWidthdrawn(event) {
    const mplRewardsAddress = event.address;
    const mplRewards = (0, markets_1.getOrCreateMplReward)(event, mplRewardsAddress);
    const stakeToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(mplRewards.stakeToken));
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(mplRewards.market));
    const stakeType = market.id == stakeToken.id ? constants_1.StakeType.MPL_LP_REWARDS : constants_1.StakeType.MPL_STAKE_REWARDS;
    ////
    // Create unstake
    ////
    (0, transactions_1.createUnstake)(event, market, stakeToken, event.params.amount, stakeType);
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleWidthdrawn = handleWidthdrawn;
function handleRewardAdded(event) {
    ////
    // Update mpl reward
    ////
    const mplReward = (0, markets_1.getOrCreateMplReward)(event, event.address);
    const currentTimestamp = event.block.timestamp;
    const rewardAdded = event.params.reward;
    // Update rate
    if (mplReward.rewardDurationSec.gt(constants_1.ZERO_BI)) {
        mplReward.rewardRatePerSecond =
            currentTimestamp >= mplReward.periodFinishedTimestamp
                ? rewardAdded.div(mplReward.rewardDurationSec) // No overlap, total reward devided by time
                : rewardAdded
                    .plus(mplReward.periodFinishedTimestamp.minus(currentTimestamp).times(mplReward.rewardRatePerSecond))
                    .div(mplReward.rewardDurationSec); // Overlap with last reward, so account for last reward remainder
    }
    else {
        mplReward.rewardRatePerSecond = constants_1.ZERO_BI;
    }
    // Update period finished
    mplReward.periodFinishedTimestamp = currentTimestamp.plus(mplReward.rewardDurationSec);
    mplReward.save();
    ////
    // Trigger interval update
    ////
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(mplReward.market));
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleRewardAdded = handleRewardAdded;
function handleRewardsDurationUpdated(event) {
    ////
    // Update mpl reward
    ////
    const mplReward = (0, markets_1.getOrCreateMplReward)(event, event.address);
    mplReward.rewardDurationSec = event.params.newDuration;
    mplReward.save();
    ////
    // Trigger interval update
    ////
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(mplReward.market));
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleRewardsDurationUpdated = handleRewardsDurationUpdated;
function handleUpdatePeriodFinish(call) {
    ////
    // Update mpl reward
    ////
    const eventFromCall = (0, utils_1.createEventFromCall)(call);
    const mplReward = (0, markets_1.getOrCreateMplReward)(eventFromCall, call.to);
    mplReward.periodFinishedTimestamp = call.inputs.timestamp;
    mplReward.save();
    ////
    // Trigger interval update
    ////
    const market = (0, markets_1.getOrCreateMarket)(eventFromCall, graph_ts_1.Address.fromString(mplReward.market));
    (0, intervalUpdate_1.intervalUpdate)(eventFromCall, market);
}
exports.handleUpdatePeriodFinish = handleUpdatePeriodFinish;
