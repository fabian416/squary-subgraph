"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGrantRevoked = exports.handleRewardPaid = exports.handleGranted = void 0;
const schema_1 = require("../../generated/schema");
const CommunityRewards_1 = require("../../generated/CommunityRewards/CommunityRewards");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const helpers_1 = require("../entities/helpers");
// Seems redundant, but this handler gets used to add the startTime/endTime info on tokens
// Remember that this actually runs _before_ GrantAccepted. We can let GrantAccepted fill out the other details.
function handleGranted(event) {
    const communityRewardsToken = new schema_1.CommunityRewardsToken(event.params.tokenId.toString());
    const communityRewardsContract = CommunityRewards_1.CommunityRewards.bind(event.address);
    const tokenLaunchTime = communityRewardsContract.tokenLaunchTimeInSeconds();
    communityRewardsToken.startTime = tokenLaunchTime;
    communityRewardsToken.endTime = communityRewardsToken.startTime.plus(event.params.vestingLength);
    // have to set these required fields to avoid an error when saving, even though they get written by a subsequent handler
    communityRewardsToken.source = "MERKLE_DISTRIBUTOR"; // Has to be set to something that satisfies the enum
    communityRewardsToken.index = 0;
    communityRewardsToken.user = event.params.user.toHexString();
    communityRewardsToken.totalGranted = event.params.amount;
    communityRewardsToken.totalClaimed = graph_ts_1.BigInt.zero();
    communityRewardsToken.cliffLength = event.params.cliffLength;
    communityRewardsToken.vestingLength = event.params.vestingLength;
    communityRewardsToken.vestingInterval = event.params.vestingInterval;
    communityRewardsToken.grantedAt = event.block.timestamp;
    communityRewardsToken.revokedAt = graph_ts_1.BigInt.zero();
    communityRewardsToken.save();
}
exports.handleGranted = handleGranted;
function handleRewardPaid(event) {
    const communityRewardsToken = assert(schema_1.CommunityRewardsToken.load(event.params.tokenId.toString()));
    communityRewardsToken.totalClaimed = communityRewardsToken.totalClaimed.plus(event.params.reward);
    communityRewardsToken.save();
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "COMMUNITY_REWARDS_CLAIMED", event.params.user);
    transaction.receivedAmount = event.params.reward;
    transaction.receivedToken = "GFI";
    transaction.save();
}
exports.handleRewardPaid = handleRewardPaid;
function handleGrantRevoked(event) {
    const communityRewardsToken = assert(schema_1.CommunityRewardsToken.load(event.params.tokenId.toString()));
    communityRewardsToken.revokedAt = event.block.timestamp;
    communityRewardsToken.save();
}
exports.handleGrantRevoked = handleGrantRevoked;
