"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGrantAccepted = void 0;
const schema_1 = require("../../generated/schema");
function handleGrantAccepted(event) {
    const communityRewardsToken = assert(schema_1.CommunityRewardsToken.load(event.params.tokenId.toString()));
    communityRewardsToken.user = event.params.account.toHexString();
    communityRewardsToken.source = "MERKLE_DISTRIBUTOR";
    communityRewardsToken.index = event.params.index.toI32();
    communityRewardsToken.totalGranted = event.params.amount;
    communityRewardsToken.grantedAt = event.block.timestamp;
    communityRewardsToken.cliffLength = event.params.cliffLength;
    communityRewardsToken.vestingLength = event.params.vestingLength;
    communityRewardsToken.vestingInterval = event.params.vestingInterval;
    communityRewardsToken.save();
}
exports.handleGrantAccepted = handleGrantAccepted;
