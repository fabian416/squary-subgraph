"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVotingPeriodSet = exports.handleVotingDelaySet = exports.handleVoteCast = exports.handleProposalThresholdSet = exports.handleProposalQueued = exports.handleProposalExecuted = exports.handleProposalCreated = exports.handleProposalCanceled = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const handlers_1 = require("../../../src/handlers");
const GovernorBravoDelegate_1 = require("../../../generated/GovernorBravoDelegate/GovernorBravoDelegate");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../../src/constants");
// ProposalCanceled(proposalId)
function handleProposalCanceled(event) {
    (0, handlers_1._handleProposalCanceled)(event.params.id.toString(), event);
}
exports.handleProposalCanceled = handleProposalCanceled;
// ProposalCreated(proposalId, proposer, targets, values, signatures, calldatas, startBlock, endBlock, description)
function handleProposalCreated(event) {
    const quorumVotes = getQuorumFromContract(event.address);
    // FIXME: Prefer to use a single object arg for params
    // e.g.  { proposalId: event.params.proposalId, proposer: event.params.proposer, ...}
    // but graph wasm compilation breaks for unknown reasons
    (0, handlers_1._handleProposalCreated)(event.params.id.toString(), event.params.proposer.toHexString(), event.params.targets, event.params.values, event.params.signatures, event.params.calldatas, event.params.startBlock, event.params.endBlock, event.params.description, quorumVotes, event);
}
exports.handleProposalCreated = handleProposalCreated;
// ProposalExecuted(proposalId)
function handleProposalExecuted(event) {
    (0, handlers_1._handleProposalExecuted)(event.params.id.toString(), event);
}
exports.handleProposalExecuted = handleProposalExecuted;
// ProposalQueued(proposalId, eta)
function handleProposalQueued(event) {
    (0, handlers_1._handleProposalQueued)(event.params.id, event.params.eta, event);
}
exports.handleProposalQueued = handleProposalQueued;
// ProposalThresholdSet(oldProposalThreshold,newProposalThreshold)
function handleProposalThresholdSet(event) {
    const governanceFramework = getGovernanceFramework(event.address.toHexString());
    governanceFramework.proposalThreshold = event.params.newProposalThreshold;
    governanceFramework.save();
}
exports.handleProposalThresholdSet = handleProposalThresholdSet;
function getLatestProposalValues(proposalId, contractAddress) {
    const proposal = (0, handlers_1.getProposal)(proposalId);
    // On first vote, set state and quorum values
    if (proposal.state == constants_1.ProposalState.PENDING) {
        const contract = GovernorBravoDelegate_1.GovernorBravoDelegate.bind(contractAddress);
        proposal.state = constants_1.ProposalState.ACTIVE;
        const res = contract.try_quorumVotes();
        if (!res.reverted) {
            proposal.quorumVotes = res.value;
        }
        else {
            proposal.quorumVotes = constants_1.BIGINT_ONE;
        }
        const governance = (0, handlers_1.getGovernance)();
        proposal.tokenHoldersAtStart = governance.currentTokenHolders;
        proposal.delegatesAtStart = governance.currentDelegates;
    }
    return proposal;
}
// VoteCast(account, proposalId, support, weight, reason);
function handleVoteCast(event) {
    const proposal = getLatestProposalValues(event.params.proposalId.toString(), event.address);
    const support = event.params.support ? 1 : 0;
    // Proposal will be updated as part of handler
    (0, handlers_1._handleVoteCast)(proposal, event.params.voter.toHexString(), event.params.votes, "", support, event);
}
exports.handleVoteCast = handleVoteCast;
// VotingDelaySet(oldVotingDelay,newVotingDelay)
function handleVotingDelaySet(event) {
    const governanceFramework = getGovernanceFramework(event.address.toHexString());
    governanceFramework.votingDelay = event.params.newVotingDelay;
    governanceFramework.save();
}
exports.handleVotingDelaySet = handleVotingDelaySet;
// VotingDelaySet(oldVotingPeriod,newVotingPeriod)
function handleVotingPeriodSet(event) {
    const governanceFramework = getGovernanceFramework(event.address.toHexString());
    governanceFramework.votingPeriod = event.params.newVotingPeriod;
    governanceFramework.save();
}
exports.handleVotingPeriodSet = handleVotingPeriodSet;
// Helper function that imports and binds the contract
function getGovernanceFramework(contractAddress) {
    let governanceFramework = schema_1.GovernanceFramework.load(contractAddress);
    if (!governanceFramework) {
        governanceFramework = new schema_1.GovernanceFramework(contractAddress);
        const contract = GovernorBravoDelegate_1.GovernorBravoDelegate.bind(graph_ts_1.Address.fromString(contractAddress));
        governanceFramework.name = "ampleforth-governance";
        governanceFramework.type = constants_1.GovernanceFrameworkType.GOVERNOR_BRAVO;
        governanceFramework.version = constants_1.NA;
        governanceFramework.contractAddress = contractAddress;
        governanceFramework.tokenAddress = contract.forth().toHexString();
        governanceFramework.timelockAddress = contract.timelock().toHexString();
        governanceFramework.votingDelay = contract.votingDelay();
        governanceFramework.votingPeriod = contract.votingPeriod();
        governanceFramework.proposalThreshold = contract.proposalThreshold();
        governanceFramework.quorumVotes = contract.quorumVotes();
    }
    return governanceFramework;
}
function getQuorumFromContract(contractAddress) {
    const contract = GovernorBravoDelegate_1.GovernorBravoDelegate.bind(contractAddress);
    const quorumVotes = contract.quorumVotes();
    // Update quorum at the contract level as well
    const governanceFramework = getGovernanceFramework(contractAddress.toHexString());
    governanceFramework.quorumVotes = quorumVotes;
    governanceFramework.save();
    return quorumVotes;
}
