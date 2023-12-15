"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVaultTotalUpdate = exports.handleAdjustedHoldings = exports.getOrInitMembershipRoster = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
function getOrInitMembershipRoster() {
    let membershipRoster = schema_1.MembershipRoster.load("1");
    if (!membershipRoster) {
        membershipRoster = new schema_1.MembershipRoster("1");
        membershipRoster.members = [];
        membershipRoster.eligibleScoreTotal = graph_ts_1.BigInt.zero();
        membershipRoster.nextEpochScoreTotal = graph_ts_1.BigInt.zero();
    }
    return membershipRoster;
}
exports.getOrInitMembershipRoster = getOrInitMembershipRoster;
function getOrInitMembership(memberAddress) {
    let membership = schema_1.Membership.load(memberAddress.toHexString());
    if (!membership) {
        membership = new schema_1.Membership(memberAddress.toHexString());
        membership.user = memberAddress.toHexString();
        membership.eligibleScore = graph_ts_1.BigInt.zero();
        membership.nextEpochScore = graph_ts_1.BigInt.zero();
        membership.save();
    }
    return membership;
}
function handleAdjustedHoldings(event) {
    const membership = getOrInitMembership(event.params.owner);
    membership.eligibleScore = event.params.eligibleAmount;
    membership.nextEpochScore = event.params.nextEpochAmount;
    membership.save();
    const membershipRoster = getOrInitMembershipRoster();
    if (!membershipRoster.members.includes(membership.id)) {
        membershipRoster.members = membershipRoster.members.concat([membership.id]);
        membershipRoster.save();
        // TODO maybe some logic here to remove someone from the member roster if their score becomes 0
    }
}
exports.handleAdjustedHoldings = handleAdjustedHoldings;
function handleVaultTotalUpdate(event) {
    const membershipRoster = getOrInitMembershipRoster();
    membershipRoster.eligibleScoreTotal = event.params.eligibleAmount;
    membershipRoster.nextEpochScoreTotal = event.params.nextEpochAmount;
    membershipRoster.save();
}
exports.handleVaultTotalUpdate = handleVaultTotalUpdate;
