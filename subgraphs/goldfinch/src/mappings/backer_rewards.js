"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBackerRewardsClaimed1 = exports.handleBackerRewardsClaimed = exports.handleSetMaxInterestDollarsEligible = exports.handleSetTotalRewards = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const backer_rewards_1 = require("../entities/backer_rewards");
const tranched_pool_1 = require("../entities/tranched_pool");
const helpers_1 = require("../entities/helpers");
function handleSetTotalRewards(event) {
    (0, backer_rewards_1.updateBackerRewardsData)(event.address);
    // It's a little odd to see this calculation initiated here, but it's in order to ensure that rewards are calculated if the backer contract is deployed after some pools
    (0, tranched_pool_1.calculateApyFromGfiForAllPools)();
    // messari schema
    (0, backer_rewards_1.updateMarketRewardTokenEmissions)(event);
}
exports.handleSetTotalRewards = handleSetTotalRewards;
function handleSetMaxInterestDollarsEligible(event) {
    (0, backer_rewards_1.updateBackerRewardsData)(event.address);
    // It's a little odd to see this calculation initiated here, but it's in order to ensure that rewards are calculated if the backer contract is deployed after some pools
    (0, tranched_pool_1.calculateApyFromGfiForAllPools)();
    // messari schema
    (0, backer_rewards_1.updateMarketRewardTokenEmissions)(event);
}
exports.handleSetMaxInterestDollarsEligible = handleSetMaxInterestDollarsEligible;
function handleBackerRewardsClaimed(event) {
    const poolToken = assert(schema_1.PoolToken.load(event.params.tokenId.toString()));
    poolToken.rewardsClaimed = event.params.amount;
    poolToken.rewardsClaimable = graph_ts_1.BigInt.zero();
    poolToken.save();
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "BACKER_REWARDS_CLAIMED", event.params.owner);
    transaction.receivedAmount = event.params.amount;
    transaction.receivedToken = "GFI";
    transaction.loan = poolToken.loan;
    transaction.save();
}
exports.handleBackerRewardsClaimed = handleBackerRewardsClaimed;
function handleBackerRewardsClaimed1(event) {
    const poolToken = assert(schema_1.PoolToken.load(event.params.tokenId.toString()));
    poolToken.rewardsClaimed = event.params.amountOfTranchedPoolRewards;
    poolToken.stakingRewardsClaimed = event.params.amountOfSeniorPoolRewards;
    poolToken.rewardsClaimable = graph_ts_1.BigInt.zero();
    poolToken.stakingRewardsClaimable = graph_ts_1.BigInt.zero();
    poolToken.save();
}
exports.handleBackerRewardsClaimed1 = handleBackerRewardsClaimed1;
