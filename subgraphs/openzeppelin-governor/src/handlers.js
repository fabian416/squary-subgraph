"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._handleVoteCast = exports._handleProposalQueued = exports._handleProposalExtended = exports._handleProposalExecuted = exports._handleProposalCanceled = exports._handleProposalCreated = exports.getOrCreateVoteDailySnapshot = exports.getOrCreateTokenDailySnapshot = exports.getOrCreateTokenHolder = exports.getOrCreateDelegate = exports.getProposal = exports.createDelegateVotingPowerChange = exports.createDelegateChange = exports.getGovernance = exports.getVoteChoiceByValue = exports.addressesToStrings = exports.toDecimal = exports.SECONDS_PER_DAY = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const schema_1 = require("../generated/schema");
exports.SECONDS_PER_DAY = 60 * 60 * 24;
function toDecimal(value, decimals = 18) {
    return value.divDecimal(graph_ts_1.BigInt.fromI32(10)
        .pow(decimals)
        .toBigDecimal());
}
exports.toDecimal = toDecimal;
function addressesToStrings(addresses) {
    const byteAddresses = new Array();
    for (let i = 0; i < addresses.length; i++) {
        byteAddresses.push(addresses[i].toHexString());
    }
    return byteAddresses;
}
exports.addressesToStrings = addressesToStrings;
function getVoteChoiceByValue(choiceValue) {
    if (choiceValue === constants_1.VoteChoice.AGAINST_VALUE) {
        return constants_1.VoteChoice.AGAINST;
    }
    else if (choiceValue === constants_1.VoteChoice.FOR_VALUE) {
        return constants_1.VoteChoice.FOR;
    }
    else if (choiceValue === constants_1.VoteChoice.ABSTAIN_VALUE) {
        return constants_1.VoteChoice.ABSTAIN;
    }
    else {
        // Case that shouldn't happen
        graph_ts_1.log.error("Voting choice of {} does not exist", [choiceValue.toString()]);
        return constants_1.VoteChoice.ABSTAIN;
    }
}
exports.getVoteChoiceByValue = getVoteChoiceByValue;
function getGovernance() {
    let governance = schema_1.Governance.load(constants_1.GOVERNANCE_NAME);
    if (!governance) {
        governance = new schema_1.Governance(constants_1.GOVERNANCE_NAME);
        governance.totalTokenSupply = constants_1.BIGINT_ZERO;
        governance.proposals = constants_1.BIGINT_ZERO;
        governance.currentTokenHolders = constants_1.BIGINT_ZERO;
        governance.totalTokenHolders = constants_1.BIGINT_ZERO;
        governance.currentDelegates = constants_1.BIGINT_ZERO;
        governance.totalDelegates = constants_1.BIGINT_ZERO;
        governance.delegatedVotesRaw = constants_1.BIGINT_ZERO;
        governance.delegatedVotes = constants_1.BIGDECIMAL_ZERO;
        governance.proposalsQueued = constants_1.BIGINT_ZERO;
        governance.proposalsExecuted = constants_1.BIGINT_ZERO;
        governance.proposalsCanceled = constants_1.BIGINT_ZERO;
    }
    return governance;
}
exports.getGovernance = getGovernance;
function createDelegateChange(event, toDelegate, fromDelegate, delegator) {
    const delegateChangeId = `${event.block.timestamp.toI64()}-${event.logIndex}`;
    const delegateChange = new schema_1.DelegateChange(delegateChangeId);
    delegateChange.delegate = toDelegate;
    delegateChange.delegator = delegator;
    delegateChange.previousDelegate = fromDelegate;
    delegateChange.tokenAddress = event.address.toHexString();
    delegateChange.txnHash = event.transaction.hash.toHexString();
    delegateChange.blockNumber = event.block.number;
    delegateChange.blockTimestamp = event.block.timestamp;
    delegateChange.logIndex = event.logIndex;
    return delegateChange;
}
exports.createDelegateChange = createDelegateChange;
function createDelegateVotingPowerChange(event, previousBalance, newBalance, delegate) {
    const delegateVotingPwerChangeId = `${event.block.timestamp.toI64()}-${event.logIndex}`;
    const delegateVPChange = new schema_1.DelegateVotingPowerChange(delegateVotingPwerChangeId);
    delegateVPChange.previousBalance = previousBalance;
    delegateVPChange.newBalance = newBalance;
    delegateVPChange.delegate = delegate;
    delegateVPChange.tokenAddress = event.address.toHexString();
    delegateVPChange.txnHash = event.transaction.hash.toHexString();
    delegateVPChange.blockTimestamp = event.block.timestamp;
    delegateVPChange.logIndex = event.logIndex;
    delegateVPChange.blockNumber = event.block.number;
    return delegateVPChange;
}
exports.createDelegateVotingPowerChange = createDelegateVotingPowerChange;
function getProposal(id) {
    let proposal = schema_1.Proposal.load(id);
    if (!proposal) {
        proposal = new schema_1.Proposal(id);
        proposal.tokenHoldersAtStart = constants_1.BIGINT_ZERO;
        proposal.delegatesAtStart = constants_1.BIGINT_ZERO;
    }
    return proposal;
}
exports.getProposal = getProposal;
function getOrCreateDelegate(address) {
    let delegate = schema_1.Delegate.load(address);
    if (!delegate) {
        delegate = new schema_1.Delegate(address);
        delegate.delegatedVotesRaw = constants_1.BIGINT_ZERO;
        delegate.delegatedVotes = constants_1.BIGDECIMAL_ZERO;
        delegate.tokenHoldersRepresentedAmount = 0;
        delegate.numberVotes = 0;
        delegate.save();
        if (address != constants_1.ZERO_ADDRESS) {
            const governance = getGovernance();
            governance.totalDelegates = governance.totalDelegates.plus(constants_1.BIGINT_ONE);
            governance.save();
        }
    }
    return delegate;
}
exports.getOrCreateDelegate = getOrCreateDelegate;
function getOrCreateTokenHolder(address) {
    let tokenHolder = schema_1.TokenHolder.load(address);
    if (!tokenHolder) {
        tokenHolder = new schema_1.TokenHolder(address);
        tokenHolder.tokenBalanceRaw = constants_1.BIGINT_ZERO;
        tokenHolder.tokenBalance = constants_1.BIGDECIMAL_ZERO;
        tokenHolder.totalTokensHeldRaw = constants_1.BIGINT_ZERO;
        tokenHolder.totalTokensHeld = constants_1.BIGDECIMAL_ZERO;
        tokenHolder.save();
        if (address != constants_1.ZERO_ADDRESS) {
            const governance = getGovernance();
            governance.totalTokenHolders =
                governance.totalTokenHolders.plus(constants_1.BIGINT_ONE);
            governance.save();
        }
    }
    return tokenHolder;
}
exports.getOrCreateTokenHolder = getOrCreateTokenHolder;
function getOrCreateTokenDailySnapshot(block) {
    const snapshotId = (block.timestamp.toI64() / exports.SECONDS_PER_DAY).toString();
    const previousSnapshot = schema_1.TokenDailySnapshot.load(snapshotId);
    if (previousSnapshot != null) {
        return previousSnapshot;
    }
    const snapshot = new schema_1.TokenDailySnapshot(snapshotId);
    return snapshot;
}
exports.getOrCreateTokenDailySnapshot = getOrCreateTokenDailySnapshot;
function getOrCreateVoteDailySnapshot(proposal, block) {
    const snapshotId = proposal.id + "-" + (block.timestamp.toI64() / exports.SECONDS_PER_DAY).toString();
    const previousSnapshot = schema_1.VoteDailySnapshot.load(snapshotId);
    if (previousSnapshot != null) {
        return previousSnapshot;
    }
    const snapshot = new schema_1.VoteDailySnapshot(snapshotId);
    return snapshot;
}
exports.getOrCreateVoteDailySnapshot = getOrCreateVoteDailySnapshot;
function _handleProposalCreated(proposalId, proposerAddr, targets, values, signatures, calldatas, startBlock, endBlock, description, quorum, event) {
    const proposal = getProposal(proposalId);
    let proposer = getOrCreateDelegate(proposerAddr);
    // Checking if the proposer was a delegate already accounted for, if not we should log an error
    // since it shouldn't be possible for a delegate to propose anything without first being "created"
    if (proposer == null) {
        graph_ts_1.log.error("Delegate participant {} not found on ProposalCreated. tx_hash: {}", [proposerAddr, event.transaction.hash.toHexString()]);
    }
    // Creating it anyway since we will want to account for this event data, even though it should've never happened
    proposer = getOrCreateDelegate(proposerAddr);
    proposal.proposer = proposer.id;
    proposal.txnHash = event.transaction.hash.toHexString();
    proposal.againstDelegateVotes = constants_1.BIGINT_ZERO;
    proposal.forDelegateVotes = constants_1.BIGINT_ZERO;
    proposal.abstainDelegateVotes = constants_1.BIGINT_ZERO;
    proposal.totalDelegateVotes = constants_1.BIGINT_ZERO;
    proposal.againstWeightedVotes = constants_1.BIGINT_ZERO;
    proposal.forWeightedVotes = constants_1.BIGINT_ZERO;
    proposal.abstainWeightedVotes = constants_1.BIGINT_ZERO;
    proposal.totalWeightedVotes = constants_1.BIGINT_ZERO;
    proposal.targets = addressesToStrings(targets);
    proposal.values = values;
    proposal.signatures = signatures;
    proposal.calldatas = calldatas;
    proposal.creationBlock = event.block.number;
    proposal.creationTime = event.block.timestamp;
    proposal.startBlock = startBlock;
    proposal.endBlock = endBlock;
    proposal.description = description;
    proposal.state =
        event.block.number >= proposal.startBlock
            ? constants_1.ProposalState.ACTIVE
            : constants_1.ProposalState.PENDING;
    proposal.governanceFramework = event.address.toHexString();
    proposal.quorumVotes = quorum;
    proposal.save();
    // Increment gov proposal count
    const governance = getGovernance();
    governance.proposals = governance.proposals.plus(constants_1.BIGINT_ONE);
    governance.save();
}
exports._handleProposalCreated = _handleProposalCreated;
function _handleProposalCanceled(proposalId, event) {
    const proposal = getProposal(proposalId);
    proposal.state = constants_1.ProposalState.CANCELED;
    proposal.cancellationTxnHash = event.transaction.hash.toHexString();
    proposal.cancellationBlock = event.block.number;
    proposal.cancellationTime = event.block.timestamp;
    proposal.save();
    // Update governance proposal state counts
    const governance = getGovernance();
    governance.proposalsCanceled = governance.proposalsCanceled.plus(constants_1.BIGINT_ONE);
    governance.save();
}
exports._handleProposalCanceled = _handleProposalCanceled;
function _handleProposalExecuted(proposalId, event) {
    // Update proposal status + execution metadata
    const proposal = getProposal(proposalId);
    proposal.state = constants_1.ProposalState.EXECUTED;
    proposal.executionTxnHash = event.transaction.hash.toHexString();
    proposal.executionBlock = event.block.number;
    proposal.executionTime = event.block.timestamp;
    proposal.save();
    // Update governance proposal state counts
    const governance = getGovernance();
    governance.proposalsQueued = governance.proposalsQueued.minus(constants_1.BIGINT_ONE);
    governance.proposalsExecuted = governance.proposalsExecuted.plus(constants_1.BIGINT_ONE);
    governance.save();
}
exports._handleProposalExecuted = _handleProposalExecuted;
function _handleProposalExtended(proposalId, extendedDeadline) {
    // Update proposal endBlock
    const proposal = getProposal(proposalId);
    proposal.endBlock = extendedDeadline;
    proposal.save();
}
exports._handleProposalExtended = _handleProposalExtended;
function _handleProposalQueued(proposalId, eta, event) {
    // Update proposal status + execution metadata
    const proposal = getProposal(proposalId.toString());
    proposal.state = constants_1.ProposalState.QUEUED;
    proposal.queueTxnHash = event.transaction.hash.toHexString();
    proposal.queueBlock = event.block.number;
    proposal.queueTime = event.block.timestamp;
    proposal.executionETA = eta;
    proposal.save();
    // Update governance proposal state counts
    const governance = getGovernance();
    governance.proposalsQueued = governance.proposalsQueued.plus(constants_1.BIGINT_ONE);
    governance.save();
}
exports._handleProposalQueued = _handleProposalQueued;
function _handleVoteCast(proposal, voterAddress, weight, reason, support, event) {
    const voteId = voterAddress.concat("-").concat(proposal.id);
    const vote = new schema_1.Vote(voteId);
    vote.proposal = proposal.id;
    vote.voter = voterAddress;
    vote.weight = weight;
    vote.reason = reason;
    vote.block = event.block.number;
    vote.blockTime = event.block.timestamp;
    vote.txnHash = event.transaction.hash.toHexString();
    vote.logIndex = event.logIndex;
    // Retrieve enum string key by value (0 = Against, 1 = For, 2 = Abstain)
    vote.choice = getVoteChoiceByValue(support);
    vote.blockTimeId = `${event.block.timestamp.toI64()}-${event.logIndex}`;
    vote.save();
    // Increment respective vote choice counts
    // NOTE: We are counting the weight instead of individual votes
    if (support === constants_1.VoteChoice.AGAINST_VALUE) {
        proposal.againstDelegateVotes =
            proposal.againstDelegateVotes.plus(constants_1.BIGINT_ONE);
        proposal.againstWeightedVotes = proposal.againstWeightedVotes.plus(weight);
    }
    else if (support === constants_1.VoteChoice.FOR_VALUE) {
        proposal.forDelegateVotes = proposal.forDelegateVotes.plus(constants_1.BIGINT_ONE);
        proposal.forWeightedVotes = proposal.forWeightedVotes.plus(weight);
    }
    else if (support === constants_1.VoteChoice.ABSTAIN_VALUE) {
        proposal.abstainDelegateVotes =
            proposal.abstainDelegateVotes.plus(constants_1.BIGINT_ONE);
        proposal.abstainWeightedVotes = proposal.abstainWeightedVotes.plus(weight);
    }
    // Increment total
    proposal.totalDelegateVotes = proposal.totalDelegateVotes.plus(constants_1.BIGINT_ONE);
    proposal.totalWeightedVotes = proposal.totalWeightedVotes.plus(weight);
    proposal.save();
    // Add 1 to participant's proposal voting count
    const voter = getOrCreateDelegate(voterAddress);
    voter.numberVotes = voter.numberVotes + 1;
    voter.save();
    // Take snapshot
    const dailySnapshot = getOrCreateVoteDailySnapshot(proposal, event.block);
    dailySnapshot.proposal = proposal.id;
    dailySnapshot.forWeightedVotes = proposal.forWeightedVotes;
    dailySnapshot.againstWeightedVotes = proposal.againstWeightedVotes;
    dailySnapshot.abstainWeightedVotes = proposal.abstainWeightedVotes;
    dailySnapshot.totalWeightedVotes = proposal.totalWeightedVotes;
    dailySnapshot.blockNumber = event.block.number;
    dailySnapshot.timestamp = event.block.timestamp;
    dailySnapshot.save();
}
exports._handleVoteCast = _handleVoteCast;
