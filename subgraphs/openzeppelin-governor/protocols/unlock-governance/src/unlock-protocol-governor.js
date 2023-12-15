"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVotingPeriodUpdated = exports.handleVotingDelayUpdated = exports.handleVoteCast = exports.handleTimelockChange = exports.handleQuorumUpdated = exports.handleProposalQueued = exports.handleProposalExecuted = exports.handleProposalCreated = exports.handleProposalCanceled = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const handlers_1 = require("../../../src/handlers");
const UnlockProtocolGovernor_1 = require("../../../generated/UnlockProtocolGovernor/UnlockProtocolGovernor");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../../src/constants");
// ProposalCanceled(proposalId)
function handleProposalCanceled(event) {
    (0, handlers_1._handleProposalCanceled)(event.params.proposalId.toString(), event);
}
exports.handleProposalCanceled = handleProposalCanceled;
// ProposalCreated(proposalId, proposer, targets, values, signatures, calldatas, startBlock, endBlock, description)
function handleProposalCreated(event) {
    const quorumVotes = getQuorumFromContract(event.address, event.block.number.minus(constants_1.BIGINT_ONE));
    // FIXME: Prefer to use a single object arg for params
    // e.g.  { proposalId: event.params.proposalId, proposer: event.params.proposer, ...}
    // but graph wasm compilation breaks for unknown reasons
    (0, handlers_1._handleProposalCreated)(event.params.proposalId.toString(), event.params.proposer.toHexString(), event.params.targets, event.params.values, event.params.signatures, event.params.calldatas, event.params.startBlock, event.params.endBlock, event.params.description, quorumVotes, event);
}
exports.handleProposalCreated = handleProposalCreated;
// ProposalExecuted(proposalId)
function handleProposalExecuted(event) {
    (0, handlers_1._handleProposalExecuted)(event.params.proposalId.toString(), event);
}
exports.handleProposalExecuted = handleProposalExecuted;
// ProposalQueued(proposalId, eta)
function handleProposalQueued(event) {
    (0, handlers_1._handleProposalQueued)(event.params.proposalId, event.params.eta, event);
}
exports.handleProposalQueued = handleProposalQueued;
// QuorumUpdated(oldQuorum, newQuorum)
function handleQuorumUpdated(event) {
    const governanceFramework = getGovernanceFramework(event.address.toHexString());
    governanceFramework.quorumVotes = event.params.newQuorum;
    governanceFramework.save();
}
exports.handleQuorumUpdated = handleQuorumUpdated;
// TimelockChange (address oldTimelock, address newTimelock)
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
// VoteCast(account, proposalId, support, weight, reason);
function handleVoteCast(event) {
    const proposal = getLatestProposalValues(event.params.proposalId.toString(), event.address);
    (0, handlers_1._handleVoteCast)(proposal, event.params.voter.toHexString(), event.params.weight, event.params.reason, event.params.support, event);
}
exports.handleVoteCast = handleVoteCast;
// VotingDelayUpdated(uint256 oldVotingDelay, uint256 newVotingDelay);
function handleVotingDelayUpdated(event) {
    const governanceFramework = getGovernanceFramework(event.address.toHexString());
    governanceFramework.votingDelay = event.params.newVotingDelay;
    governanceFramework.save();
}
exports.handleVotingDelayUpdated = handleVotingDelayUpdated;
// VotingPeriodUpdated(uint256 oldVotingPeriod, uint256 newVotingPeriod);
function handleVotingPeriodUpdated(event) {
    const governanceFramework = getGovernanceFramework(event.address.toHexString());
    governanceFramework.votingPeriod = event.params.newVotingPeriod;
    governanceFramework.save();
}
exports.handleVotingPeriodUpdated = handleVotingPeriodUpdated;
// Helper function that imports and binds the contract
function getGovernanceFramework(contractAddress) {
    let governanceFramework = schema_1.GovernanceFramework.load(contractAddress);
    if (!governanceFramework) {
        governanceFramework = new schema_1.GovernanceFramework(contractAddress);
        const contract = UnlockProtocolGovernor_1.UnlockProtocolGovernor.bind(graph_ts_1.Address.fromString(contractAddress));
        governanceFramework.name = "unlock-governance";
        governanceFramework.type = constants_1.GovernanceFrameworkType.OPENZEPPELIN_GOVERNOR;
        governanceFramework.version = contract.version();
        governanceFramework.contractAddress = contractAddress;
        governanceFramework.tokenAddress = contract.token().toHexString();
        governanceFramework.timelockAddress = contract.timelock().toHexString();
        governanceFramework.votingDelay = contract.votingDelay();
        governanceFramework.votingPeriod = contract.votingPeriod();
        // Missing from this old version of Governor, default it to Zero
        governanceFramework.proposalThreshold = constants_1.BIGINT_ZERO;
        const startBlock = new graph_ts_1.BigInt(13148447);
        governanceFramework.quorumVotes = contract.quorum(startBlock);
    }
    return governanceFramework;
}
function getQuorumFromContract(contractAddress, blockNumber) {
    const contract = UnlockProtocolGovernor_1.UnlockProtocolGovernor.bind(contractAddress);
    const quorumVotes = contract.quorum(blockNumber);
    const governanceFramework = getGovernanceFramework(contractAddress.toHexString());
    governanceFramework.quorumVotes = quorumVotes;
    governanceFramework.save();
    return quorumVotes;
}
