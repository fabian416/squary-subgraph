"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMplRewardsCreated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../../generated/templates");
const markets_1 = require("../common/mappingHelpers/getOrCreate/markets");
const supporting_1 = require("../common/mappingHelpers/getOrCreate/supporting");
const intervalUpdate_1 = require("../common/mappingHelpers/update/intervalUpdate");
function handleMplRewardsCreated(event) {
    const mplRewardAddress = event.params.mplRewards;
    ////
    // Create mpl rewards templates
    ////
    templates_1.MplReward.create(mplRewardAddress);
    ////
    // Create mpl rewards entity
    ////
    const mplReward = (0, markets_1.getOrCreateMplReward)(event, mplRewardAddress);
    ////
    // Update market
    ////
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(mplReward.market));
    const rewardToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(mplReward.rewardToken));
    // Add the mplReward
    if (market.id == mplReward.stakeToken) {
        // MPL-LP
        if (market._mplRewardMplLp) {
            graph_ts_1.log.warning("Overwritting _mplRewardMplLp for market {}", [market.id]);
        }
        market._mplRewardMplLp = mplReward.id;
    }
    else {
        // MPL-STAKE
        if (market._mplRewardMplStake) {
            graph_ts_1.log.warning("Overwritting _mplRewardMplStake for market {}", [market.id]);
        }
        market._mplRewardMplStake = mplReward.id;
    }
    // Add reward token to market if it doesn't exist
    let newRewardTokenForMarket = true;
    for (let i = 0; i < market.rewardTokens.length; i++) {
        if (market.rewardTokens[i] == rewardToken.id) {
            newRewardTokenForMarket = false;
        }
    }
    if (newRewardTokenForMarket) {
        const newRewardTokens = market.rewardTokens;
        newRewardTokens.push(rewardToken.id);
        market.rewardTokens = newRewardTokens;
    }
    market.save();
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleMplRewardsCreated = handleMplRewardsCreated;
