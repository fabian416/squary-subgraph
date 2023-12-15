"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVotingPeriodSet = exports.handleVotingDelaySet = exports.handleVoteCastWithParams = exports.handleVoteCast = exports.handleTimelockChange = exports.handleQuorumNumeratorUpdated = exports.handleProposalThresholdSet = exports.handleProposalQueued = exports.handleProposalExecuted = exports.handleProposalCreated = exports.handleProposalCanceled = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const handlers_1 = require("../../../src/handlers");
const Governance_1 = require("../../../generated/Governance/Governance");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../../src/constants");
function handleProposalCanceled(event) {
    (0, handlers_1._handleProposalCanceled)(event.params.proposalId.toString(), event);
}
exports.handleProposalCanceled = handleProposalCanceled;
function handleProposalCreated(event) {
    const quorumVotes = getQuorumFromContract(event.address, event.block.number.minus(constants_1.BIGINT_ONE));
    // FIXME: Prefer to use a single object arg for params
    // e.g.  { proposalId: event.params.proposalId, proposer: event.params.proposer, ...}
    // but graph wasm compilation breaks for unknown reasons
    (0, handlers_1._handleProposalCreated)(event.params.proposalId.toString(), event.params.proposer.toHexString(), event.params.targets, event.params.values, event.params.signatures, event.params.calldatas, event.params.startBlock, event.params.endBlock, event.params.description, quorumVotes, event);
}
exports.handleProposalCreated = handleProposalCreated;
function handleProposalExecuted(event) {
    (0, handlers_1._handleProposalExecuted)(event.params.proposalId.toString(), event);
}
exports.handleProposalExecuted = handleProposalExecuted;
function handleProposalQueued(event) {
    (0, handlers_1._handleProposalQueued)(event.params.proposalId, event.params.eta, event);
}
exports.handleProposalQueued = handleProposalQueued;
function handleProposalThresholdSet(event) {
    const governanceFramework = getGovernanceFramework(event.address.toHexString());
    governanceFramework.proposalThreshold = event.params.newProposalThreshold;
    governanceFramework.save();
}
exports.handleProposalThresholdSet = handleProposalThresholdSet;
function handleQuorumNumeratorUpdated(event) {
    const governanceFramework = getGovernanceFramework(event.address.toHexString());
    governanceFramework.quorumNumerator = event.params.newQuorumNumerator;
    governanceFramework.save();
}
exports.handleQuorumNumeratorUpdated = handleQuorumNumeratorUpdated;
function handleTimelockChange(event) {
    const governanceFramework = getGovernanceFramework(event.address.toHexString());
    governanceFramework.timelockAddress = event.params.newTimelock.toHexString();
    governanceFramework.save();
}
exports.handleTimelockChange = handleTimelockChange;
function getLatestProposalValues(proposalId, contractAddress) {
    const proposal = (0, handlers_1.getProposal)(proposalId);
    // On first vote, set state and quorum values
    if (proposal.state == constants_1.ProposalState.PENDING) {
        proposal.state = constants_1.ProposalState.ACTIVE;
        proposal.quorumVotes = getQuorumFromContract(contractAddress, proposal.startBlock);
        const governance = (0, handlers_1.getGovernance)();
        proposal.tokenHoldersAtStart = governance.currentTokenHolders;
        proposal.delegatesAtStart = governance.currentDelegates;
    }
    return proposal;
}
function handleVoteCast(event) {
    const proposal = getLatestProposalValues(event.params.proposalId.toString(), event.address);
    // Proposal will be updated as part of handler
    (0, handlers_1._handleVoteCast)(proposal, event.params.voter.toHexString(), event.params.weight, event.params.reason, event.params.support, event);
}
exports.handleVoteCast = handleVoteCast;
// Treat VoteCastWithParams same as VoteCast
function handleVoteCastWithParams(event) {
    const proposal = getLatestProposalValues(event.params.proposalId.toString(), event.address);
    (0, handlers_1._handleVoteCast)(proposal, event.params.voter.toHexString(), event.params.weight, event.params.reason, event.params.support, event);
}
exports.handleVoteCastWithParams = handleVoteCastWithParams;
function handleVotingDelaySet(event) {
    const governanceFramework = getGovernanceFramework(event.address.toHexString());
    governanceFramework.votingDelay = event.params.newVotingDelay;
    governanceFramework.save();
}
exports.handleVotingDelaySet = handleVotingDelaySet;
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
        const contract = Governance_1.Governance.bind(graph_ts_1.Address.fromString(contractAddress));
        governanceFramework.name = "ousd-governance";
        governanceFramework.type = constants_1.GovernanceFrameworkType.OPENZEPPELIN_GOVERNOR;
        governanceFramework.version = contract.version();
        governanceFramework.contractAddress = contractAddress;
        governanceFramework.tokenAddress = contract.token().toHexString();
        governanceFramework.timelockAddress = contract.timelock().toHexString();
        governanceFramework.votingDelay = contract.votingDelay();
        governanceFramework.votingPeriod = contract.votingPeriod();
        governanceFramework.proposalThreshold = contract.proposalThreshold();
        governanceFramework.quorumNumerator = contract.quorumNumerator();
        governanceFramework.quorumDenominator = contract.quorumDenominator();
    }
    return governanceFramework;
}
function getQuorumFromContract(contractAddress, blockNumber) {
    const contract = Governance_1.Governance.bind(contractAddress);
    const quorumVotes = contract.quorum(blockNumber);
    const governanceFramework = getGovernanceFramework(contractAddress.toHexString());
    governanceFramework.quorumVotes = quorumVotes;
    governanceFramework.save();
    return quorumVotes;
}
