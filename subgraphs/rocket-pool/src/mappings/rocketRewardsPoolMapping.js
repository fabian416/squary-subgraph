"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRewardSnapshot = exports.handleRPLTokensClaimed = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const rocketRewardsPool_1 = require("../../generated/templates/rocketRewardsPool/rocketRewardsPool");
const rocketNetworkPrices_1 = require("../../generated/templates/rocketRewardsPool/rocketNetworkPrices");
const schema_1 = require("../../generated/schema");
const generalUtilities_1 = require("../checkpoints/generalUtilities");
const entityFactory_1 = require("../entityFactory");
const generalConstants_1 = require("../constants/generalConstants");
const contractConstants_1 = require("../constants/contractConstants");
const enumConstants_1 = require("../constants/enumConstants");
const usageMetrics_1 = require("../updaters/usageMetrics");
const financialMetrics_1 = require("../updaters/financialMetrics");
const rocketContracts_1 = require("../entities/rocketContracts");
/**
 * Occurs when an eligible stakeholder on the protocol claims an RPL reward.
 */
function handleRPLTokensClaimed(event) {
    if (event === null ||
        event.params === null ||
        event.params.claimingAddress === null ||
        event.params.claimingContract === null ||
        event.block === null)
        return;
    // Protocol entity should exist, if not, then we attempt to create it.
    let protocol = generalUtilities_1.generalUtilities.getRocketPoolProtocolEntity();
    if (protocol === null || protocol.id == null) {
        protocol = entityFactory_1.rocketPoolEntityFactory.createRocketPoolProtocol();
    }
    if (protocol === null)
        return;
    // We will need the rocketvault smart contract state to get specific addresses.
    // We will need the rocket rewards pool contract to get its smart contract state.
    const rocketRewardPoolContract = rocketRewardsPool_1.rocketRewardsPool.bind(event.address);
    // We need to retrieve the last RPL rewards interval so we can compare it to the current state in the smart contracts.
    let activeIndexedRewardInterval = null;
    const lastRPLRewardIntervalId = protocol.lastRPLRewardInterval;
    if (lastRPLRewardIntervalId != null) {
        activeIndexedRewardInterval = schema_1.RPLRewardInterval.load(lastRPLRewardIntervalId);
    }
    // Determine claimer type based on the claiming contract and/or claiming address.
    const rplRewardClaimerType = getRplRewardClaimerType(event.params.claimingContract, event.params.claimingAddress);
    // Something is wrong; the contract associated with this claim couldn't be processed.
    // Maybe this implementation needs to be updated as a result of a contract upgrade of RocketPool.
    if (rplRewardClaimerType == null)
        return;
    // If we don't have an indexed RPL Reward interval,
    // or if the last indexed RPL Reward interval isn't equal to the current one in the smart contracts:
    const claimIntervalTimeStartCall = rocketRewardPoolContract.try_getClaimIntervalTimeStart();
    if (claimIntervalTimeStartCall.reverted)
        return;
    const smartContractCurrentRewardIntervalStartTime = claimIntervalTimeStartCall.value;
    let previousActiveIndexedRewardInterval = null;
    let previousActiveIndexedRewardIntervalId = null;
    if (activeIndexedRewardInterval === null ||
        activeIndexedRewardInterval.intervalStartTime !=
            smartContractCurrentRewardIntervalStartTime) {
        // If there was an indexed RPL Reward interval which has a different start time then the interval in the smart contracts.
        if (activeIndexedRewardInterval !== null) {
            // We need to close our indexed RPL Rewards interval.
            activeIndexedRewardInterval.intervalClosedTime = event.block.timestamp;
            activeIndexedRewardInterval.isClosed = true;
            activeIndexedRewardInterval.intervalDurationActual =
                event.block.timestamp.minus(activeIndexedRewardInterval.intervalStartTime);
            if (activeIndexedRewardInterval.intervalDurationActual.lt(graph_ts_1.BigInt.fromI32(0))) {
                activeIndexedRewardInterval.intervalDurationActual =
                    activeIndexedRewardInterval.intervalDuration;
            }
            previousActiveIndexedRewardInterval = activeIndexedRewardInterval;
            previousActiveIndexedRewardIntervalId =
                previousActiveIndexedRewardInterval.id;
        }
        // Create a new RPL Reward interval so we can add this first claim to it.
        const claimIntervalRewardsTotalCall = rocketRewardPoolContract.try_getClaimIntervalRewardsTotal();
        if (claimIntervalRewardsTotalCall.reverted)
            return;
        const claimIntervalTimeCall = rocketRewardPoolContract.try_getClaimIntervalTime();
        if (claimIntervalTimeCall.reverted)
            return;
        activeIndexedRewardInterval =
            entityFactory_1.rocketPoolEntityFactory.createRPLRewardInterval(generalConstants_1.ROCKETPOOL_RPL_REWARD_INTERVAL_ID_PREFIX +
                generalUtilities_1.generalUtilities.extractIdForEntity(event), previousActiveIndexedRewardIntervalId, claimIntervalRewardsTotalCall.value, getClaimingContractAllowance(enumConstants_1.RPLREWARDCLAIMERTYPE_PDAO, event.address), getClaimingContractAllowance(enumConstants_1.RPLREWARDCLAIMERTYPE_ODAO, event.address), getClaimingContractAllowance(enumConstants_1.RPLREWARDCLAIMERTYPE_NODE, event.address), previousActiveIndexedRewardInterval !== null &&
                previousActiveIndexedRewardInterval.claimableRewards >
                    graph_ts_1.BigInt.fromI32(0)
                ? previousActiveIndexedRewardInterval.claimableRewards.minus(previousActiveIndexedRewardInterval.totalRPLClaimed)
                : graph_ts_1.BigInt.fromI32(0), smartContractCurrentRewardIntervalStartTime, claimIntervalTimeCall.value, event.block.number, event.block.timestamp);
        if (activeIndexedRewardInterval === null)
            return;
        protocol.lastRPLRewardInterval = activeIndexedRewardInterval.id;
        if (previousActiveIndexedRewardInterval !== null) {
            previousActiveIndexedRewardInterval.nextIntervalId =
                activeIndexedRewardInterval.id;
        }
    }
    if (activeIndexedRewardInterval === null)
        return;
    // We need this to determine the current RPL/ETH price based on the smart contracts.
    // If for some reason this fails, something is horribly wrong and we need to stop indexing.
    const networkPricesContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_NETWORK_PRICES);
    const networkPricesContract = rocketNetworkPrices_1.rocketNetworkPrices.bind(graph_ts_1.Address.fromBytes(networkPricesContractEntity.latestAddress));
    const rplPriceCall = networkPricesContract.try_getRPLPrice();
    if (rplPriceCall.reverted)
        return;
    const rplETHExchangeRate = rplPriceCall.value;
    let rplRewardETHAmount = graph_ts_1.BigInt.fromI32(0);
    if (rplETHExchangeRate > graph_ts_1.BigInt.fromI32(0)) {
        rplRewardETHAmount = event.params.amount
            .times(rplETHExchangeRate)
            .div(generalConstants_1.ONE_ETHER_IN_WEI);
    }
    // Create a new reward claim.
    const rplRewardClaim = entityFactory_1.rocketPoolEntityFactory.createRPLRewardClaim(generalUtilities_1.generalUtilities.extractIdForEntity(event), activeIndexedRewardInterval.id, event.params.claimingAddress.toHexString(), rplRewardClaimerType, event.params.amount, rplRewardETHAmount, event.transaction.hash.toHexString(), event.block.number, event.block.timestamp);
    if (rplRewardClaim === null)
        return;
    // If the claimer was a node..
    const associatedNode = schema_1.Node.load(event.params.claimingAddress.toHexString());
    if (associatedNode !== null &&
        (rplRewardClaimerType == enumConstants_1.RPLREWARDCLAIMERTYPE_ODAO ||
            rplRewardClaimerType == enumConstants_1.RPLREWARDCLAIMERTYPE_NODE)) {
        // Depending on if the node is an oracle node..
        if (rplRewardClaimerType == enumConstants_1.RPLREWARDCLAIMERTYPE_ODAO) {
            // Update state for node & this ODAO reward claim.
            associatedNode.totalODAORewardsClaimed =
                associatedNode.totalODAORewardsClaimed.plus(event.params.amount);
            associatedNode.odaoRewardClaimCount =
                associatedNode.odaoRewardClaimCount.plus(graph_ts_1.BigInt.fromI32(1));
            associatedNode.averageODAORewardClaim =
                associatedNode.totalODAORewardsClaimed.div(associatedNode.odaoRewardClaimCount);
            // Update state for active interval & this ODAO reward claim.
            activeIndexedRewardInterval.totalODAORewardsClaimed =
                activeIndexedRewardInterval.totalODAORewardsClaimed.plus(event.params.amount);
            activeIndexedRewardInterval.odaoRewardClaimCount =
                activeIndexedRewardInterval.odaoRewardClaimCount.plus(graph_ts_1.BigInt.fromI32(1));
        }
        else {
            // Update state for node & this regular reward claim.
            associatedNode.totalNodeRewardsClaimed =
                associatedNode.totalNodeRewardsClaimed.plus(event.params.amount);
            associatedNode.nodeRewardClaimCount =
                associatedNode.nodeRewardClaimCount.plus(graph_ts_1.BigInt.fromI32(1));
            associatedNode.averageNodeRewardClaim =
                associatedNode.totalNodeRewardsClaimed.div(associatedNode.nodeRewardClaimCount);
            // Update state for active interval & this regular reward claim.
            activeIndexedRewardInterval.totalNodeRewardsClaimed =
                activeIndexedRewardInterval.totalNodeRewardsClaimed.plus(event.params.amount);
            activeIndexedRewardInterval.nodeRewardClaimCount =
                activeIndexedRewardInterval.nodeRewardClaimCount.plus(graph_ts_1.BigInt.fromI32(1));
        }
    }
    else if (rplRewardClaimerType == enumConstants_1.RPLREWARDCLAIMERTYPE_PDAO) {
        // If the claim was made by the PDAO, increment the total on the active interval.
        activeIndexedRewardInterval.totalPDAORewardsClaimed =
            activeIndexedRewardInterval.totalPDAORewardsClaimed.plus(event.params.amount);
    }
    // Update the grand total claimed of the current interval.
    activeIndexedRewardInterval.totalRPLClaimed =
        activeIndexedRewardInterval.totalRPLClaimed.plus(rplRewardClaim.amount);
    // Update the averages claimed of the current interval per contract type.
    if (activeIndexedRewardInterval.totalODAORewardsClaimed > graph_ts_1.BigInt.fromI32(0) &&
        activeIndexedRewardInterval.odaoRewardClaimCount > graph_ts_1.BigInt.fromI32(0)) {
        activeIndexedRewardInterval.averageODAORewardClaim =
            activeIndexedRewardInterval.totalODAORewardsClaimed.div(activeIndexedRewardInterval.odaoRewardClaimCount);
    }
    if (activeIndexedRewardInterval.totalNodeRewardsClaimed > graph_ts_1.BigInt.fromI32(0) &&
        activeIndexedRewardInterval.nodeRewardClaimCount > graph_ts_1.BigInt.fromI32(0)) {
        activeIndexedRewardInterval.averageNodeRewardClaim =
            activeIndexedRewardInterval.totalNodeRewardsClaimed.div(activeIndexedRewardInterval.nodeRewardClaimCount);
    }
    // Add this reward claim to the current interval
    const currentRPLRewardClaims = activeIndexedRewardInterval.rplRewardClaims;
    currentRPLRewardClaims.push(rplRewardClaim.id);
    activeIndexedRewardInterval.rplRewardClaims = currentRPLRewardClaims;
    // Index changes to the (new/previous) interval and claim.
    rplRewardClaim.save();
    if (associatedNode !== null)
        associatedNode.save();
    if (previousActiveIndexedRewardInterval !== null)
        previousActiveIndexedRewardInterval.save();
    activeIndexedRewardInterval.save();
    // Index the protocol changes.
    protocol.save();
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.params.claimingAddress);
    (0, financialMetrics_1.updateTotalRewardsMetrics)(event.block, event.params.amount);
    (0, financialMetrics_1.updateSnapshotsTvl)(event.block);
}
exports.handleRPLTokensClaimed = handleRPLTokensClaimed;
function handleRewardSnapshot(event) {
    let _RPLRewardSubmitted = schema_1.RPLRewardSubmitted.load(event.params.submission.rewardIndex.toString());
    if (!_RPLRewardSubmitted) {
        _RPLRewardSubmitted = new schema_1.RPLRewardSubmitted(event.params.submission.rewardIndex.toString());
        _RPLRewardSubmitted.rewardIndex = event.params.submission.rewardIndex;
        _RPLRewardSubmitted.executionBlock = event.params.submission.executionBlock;
        _RPLRewardSubmitted.consensusBlock = event.params.submission.consensusBlock;
        _RPLRewardSubmitted.merkleRoot = event.params.submission.merkleRoot;
        _RPLRewardSubmitted.merkleTreeCID = event.params.submission.merkleTreeCID;
        _RPLRewardSubmitted.intervalsPassed =
            event.params.submission.intervalsPassed;
        _RPLRewardSubmitted.treasuryRPL = event.params.submission.treasuryRPL;
        _RPLRewardSubmitted.trustedNodeRPL = event.params.submission.trustedNodeRPL;
        _RPLRewardSubmitted.nodeRPL = event.params.submission.nodeRPL;
        _RPLRewardSubmitted.nodeETH = event.params.submission.nodeETH;
        _RPLRewardSubmitted.userETH = event.params.submission.userETH;
        _RPLRewardSubmitted.block = event.block.number;
        _RPLRewardSubmitted.blockTime = event.block.timestamp;
        _RPLRewardSubmitted.save();
    }
}
exports.handleRewardSnapshot = handleRewardSnapshot;
/**
 * Determine the claimer type for a specific RPL reward claim event.
 */
function getRplRewardClaimerType(claimingContract, claimingAddress) {
    let rplRewardClaimerType = null;
    if (claimingContract === null || claimingAddress === null)
        return rplRewardClaimerType;
    // #1: Could be the PDAO.
    const claimDaoContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_CLAIM_DAO);
    if (claimingContract.toHexString() ==
        graph_ts_1.Address.fromBytes(claimDaoContractEntity.latestAddress).toHexString()) {
        rplRewardClaimerType = enumConstants_1.RPLREWARDCLAIMERTYPE_PDAO;
    }
    // #2: Could be an oracle node.
    const claimTrustedNodeContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_CLAIM_TRUSTED_NODE);
    if (claimingContract.toHexString() ==
        graph_ts_1.Address.fromBytes(claimTrustedNodeContractEntity.latestAddress).toHexString()) {
        rplRewardClaimerType = enumConstants_1.RPLREWARDCLAIMERTYPE_ODAO;
    }
    // #3: if the claimer type is still null, it **should** be a regular node.
    if (rplRewardClaimerType == null) {
        // Load the associated regular node.
        const associatedNode = schema_1.Node.load(claimingAddress.toHexString());
        if (associatedNode !== null) {
            rplRewardClaimerType = enumConstants_1.RPLREWARDCLAIMERTYPE_NODE;
        }
    }
    return rplRewardClaimerType;
}
/**
 * Gets the current claiming contract allowance for the given RPL reward claim type from the smart contracts.
 */
function getClaimingContractAllowance(rplRewardClaimType, rewardsPoolAddress) {
    const rocketRewardsContract = rocketRewardsPool_1.rocketRewardsPool.bind(rewardsPoolAddress);
    if (rplRewardClaimType == enumConstants_1.RPLREWARDCLAIMERTYPE_PDAO) {
        const claimingContractAllowanceCall = rocketRewardsContract.try_getClaimingContractAllowance(contractConstants_1.RocketContractNames.ROCKET_CLAIM_DAO);
        if (claimingContractAllowanceCall.reverted)
            return graph_ts_1.BigInt.fromI32(0);
        return claimingContractAllowanceCall.value;
    }
    else if (rplRewardClaimType == enumConstants_1.RPLREWARDCLAIMERTYPE_ODAO) {
        const claimingContractAllowanceCall = rocketRewardsContract.try_getClaimingContractAllowance(contractConstants_1.RocketContractNames.ROCKET_CLAIM_TRUSTED_NODE);
        if (claimingContractAllowanceCall.reverted)
            return graph_ts_1.BigInt.fromI32(0);
        return claimingContractAllowanceCall.value;
    }
    else if (rplRewardClaimType == enumConstants_1.RPLREWARDCLAIMERTYPE_NODE) {
        const claimingContractAllowanceCall = rocketRewardsContract.try_getClaimingContractAllowance(contractConstants_1.RocketContractNames.ROCKET_CLAIM_NODE);
        if (claimingContractAllowanceCall.reverted)
            return graph_ts_1.BigInt.fromI32(0);
        return claimingContractAllowanceCall.value;
    }
    else {
        return graph_ts_1.BigInt.fromI32(0);
    }
}
