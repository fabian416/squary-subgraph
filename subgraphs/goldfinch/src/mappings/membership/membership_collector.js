"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEpochFinalized = void 0;
const schema_1 = require("../../../generated/schema");
const membership_vault_1 = require("./membership_vault");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const getters_1 = require("../../common/getters");
const constants_1 = require("../../common/constants");
const MembershipVault_1 = require("../../../generated/MembershipVault/MembershipVault");
const utils_1 = require("../../common/utils");
function handleEpochFinalized(event) {
    const epoch = new schema_1.MembershipEpoch(event.params.epoch.toString());
    epoch.epoch = event.params.epoch;
    epoch.totalRewards = event.params.totalRewards;
    epoch.finalizedAt = event.block.timestamp.toI32();
    epoch.save();
    // Create a MembershipRewardDisbursement entity for each member (this is used for the line graph at the top of /membership)
    const membershipRoster = (0, membership_vault_1.getOrInitMembershipRoster)();
    for (let i = 0; i < membershipRoster.members.length; i++) {
        const membership = schema_1.Membership.load(membershipRoster.members[i]);
        if (!membership) {
            continue;
        }
        // create the disbursement
        const disbursement = new schema_1.MembershipRewardDisbursement(`${event.params.epoch.toString()}-${membership.id}`);
        disbursement.user = membership.user;
        disbursement.epoch = event.params.epoch;
        disbursement.rewards = membershipRoster.eligibleScoreTotal.isZero()
            ? graph_ts_1.BigInt.zero()
            : membership.eligibleScore
                .times(event.params.totalRewards)
                .div(membershipRoster.eligibleScoreTotal);
        disbursement.allocatedAt = event.block.timestamp.toI32();
        disbursement.save();
        // update eligibleScore for each member
        membership.eligibleScore = membership.nextEpochScore;
        membership.save();
    }
    membershipRoster.eligibleScoreTotal = membershipRoster.nextEpochScoreTotal;
    membershipRoster.save();
    //Original official goldfinch subgraph code above
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const marketIDs = protocol._marketIDs;
    const membershipVaultContract = MembershipVault_1.MembershipVault.bind(graph_ts_1.Address.fromString(constants_1.MEMBERSHIP_VAULT_ADDRESS));
    const toalEligibleAmountResult = membershipVaultContract.try_totalAtEpoch(event.params.epoch);
    if (toalEligibleAmountResult.reverted) {
        graph_ts_1.log.error("[handleEpochFinalized]MembershipVaultContract.totalAtEpochcall({}) call reverted tx {}; skip reward emission calculation", [event.params.epoch.toString(), event.transaction.hash.toHexString()]);
        return;
    }
    const toalEligibleAmount = toalEligibleAmountResult.value;
    for (let i = 0; i < marketIDs.length; i++) {
        const mktID = marketIDs[i];
        const mkt = schema_1.Market.load(mktID);
        if (!mkt) {
            graph_ts_1.log.error("[]markt {} does not exist tx {}", [
                mktID,
                event.transaction.hash.toHexString(),
            ]);
            return;
        }
        if (!mkt._membershipRewardEligibleAmount ||
            mkt._membershipRewardEligibleAmount.le(constants_1.BIGINT_ZERO)) {
            continue;
        }
        const BD_DAYS_PER_EPOCH = graph_ts_1.BigDecimal.fromString(constants_1.DAYS_PER_EPOCH.toString());
        let mktGFIRewardAmount = (0, utils_1.bigDecimalToBigInt)(event.params.totalRewards
            .times(mkt._membershipRewardEligibleAmount)
            .div(toalEligibleAmount)
            .divDecimal(BD_DAYS_PER_EPOCH) // normalize to daily emission amount
        );
        const GFIpriceUSD = (0, getters_1.getGFIPrice)(event);
        let mktGFIRewardUSD = GFIpriceUSD
            ? mktGFIRewardAmount.divDecimal(constants_1.GFI_DECIMALS).times(GFIpriceUSD)
            : constants_1.BIGDECIMAL_ZERO;
        if (!mkt.rewardTokens || mkt.rewardTokens.length == 0) {
            const rewardTokenAddress = graph_ts_1.Address.fromString(constants_1.GFI_ADDRESS);
            const rewardToken = (0, getters_1.getOrCreateRewardToken)(rewardTokenAddress, constants_1.RewardTokenType.DEPOSIT);
            mkt.rewardTokens = [rewardToken.id];
        }
        // the reward is on top of backer rewards and staking rewards
        // so we add to them if they already exist
        if (mkt.rewardTokenEmissionsAmount &&
            mkt.rewardTokenEmissionsAmount.length > 0) {
            mktGFIRewardAmount = mktGFIRewardAmount.plus(mkt.rewardTokenEmissionsAmount[0]);
            mktGFIRewardUSD = mktGFIRewardUSD.plus(mkt.rewardTokenEmissionsUSD[0]);
        }
        mkt.rewardTokenEmissionsAmount = [mktGFIRewardAmount];
        mkt.rewardTokenEmissionsUSD = [mktGFIRewardUSD];
        // init _membershipRewardEligibleAmount for next epoch
        mkt._membershipRewardEligibleAmount = mkt._membershipRewardNextEpochAmount;
        mkt.save();
    }
}
exports.handleEpochFinalized = handleEpochFinalized;
