"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVotingDelayChanged =
  exports.handleVoteEmitted =
  exports.handleProposalQueued =
  exports.handleProposalExecuted =
  exports.handleProposalCreated =
  exports.handleProposalCanceled =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
const handlers_1 = require("../../../src/handlers");
const AaveGovernanceV2_1 = require("../../../generated/AaveGovernanceV2/AaveGovernanceV2");
const Executor_1 = require("../../../generated/AaveGovernanceV2/Executor");
const GovernanceStrategy_1 = require("../../../generated/AaveGovernanceV2/GovernanceStrategy");
const schema_1 = require("../../../generated/schema");
function handleProposalCanceled(event) {
  (0, handlers_1._handleProposalCanceled)(event.params.id.toString(), event);
}
exports.handleProposalCanceled = handleProposalCanceled;
function handleProposalCreated(event) {
  const executor = event.params.executor;
  const quorumVotes = getQuorumFromContract(
    event.address,
    executor,
    event.block.number.minus(constants_1.BIGINT_ONE)
  );
  (0, handlers_1._handleProposalCreated)(
    event.params.id.toString(),
    event.params.creator.toHexString(),
    executor.toHexString(),
    event.params.targets,
    event.params.values,
    event.params.signatures,
    event.params.calldatas,
    event.params.startBlock,
    event.params.endBlock,
    event.params.ipfsHash,
    quorumVotes,
    event
  );
}
exports.handleProposalCreated = handleProposalCreated;
function handleProposalExecuted(event) {
  (0, handlers_1._handleProposalExecuted)(event.params.id.toString(), event);
}
exports.handleProposalExecuted = handleProposalExecuted;
function handleProposalQueued(event) {
  (0, handlers_1._handleProposalQueued)(
    event.params.id.toString(),
    event.params.executionTime,
    event
  );
}
exports.handleProposalQueued = handleProposalQueued;
function handleVoteEmitted(event) {
  const proposal = (0, handlers_1.getProposal)(event.params.id.toString());
  // if state is pending (i.e. the first vote), set state, quorum, delegates and tokenholders
  if (proposal.state == constants_1.ProposalState.PENDING) {
    proposal.state = constants_1.ProposalState.ACTIVE;
    // Set snapshot for quorum, tokenholders and delegates
    proposal.quorumVotes = getQuorumFromContract(
      event.address,
      graph_ts_1.Address.fromString(proposal.executor),
      event.block.number.minus(constants_1.BIGINT_ONE)
    );
    const governance = (0, handlers_1.getGovernance)();
    proposal.tokenHoldersAtStart = governance.currentTokenHolders;
    proposal.delegatesAtStart = governance.currentDelegates;
  }
  // Proposal will be updated as part of handler
  (0, handlers_1._handleVoteEmitted)(
    proposal,
    event.params.voter.toHexString(),
    event.params.votingPower,
    event.params.support,
    event
  );
}
exports.handleVoteEmitted = handleVoteEmitted;
// VotingDelayChanged (newVotingDelay, initiatorChange)
function handleVotingDelayChanged(event) {
  const governanceFramework = getGovernanceFramework(
    event.address.toHexString()
  );
  governanceFramework.votingDelay = event.params.newVotingDelay;
  governanceFramework.save();
}
exports.handleVotingDelayChanged = handleVotingDelayChanged;
// Helper function that imports and binds the contract
function getGovernanceFramework(contractAddress) {
  let governanceFramework = schema_1.GovernanceFramework.load(contractAddress);
  if (!governanceFramework) {
    governanceFramework = new schema_1.GovernanceFramework(contractAddress);
    const contract = AaveGovernanceV2_1.AaveGovernanceV2.bind(
      graph_ts_1.Address.fromString(contractAddress)
    );
    governanceFramework.name = "aave-governance";
    governanceFramework.type = constants_1.GOVERNANCE_TYPE;
    governanceFramework.version = constants_1.NA;
    governanceFramework.contractAddress = contractAddress;
    governanceFramework.tokenAddress =
      "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9";
    governanceFramework.timelockAddress =
      "0xee56e2b3d491590b5b31738cc34d5232f378a8d5";
    // Init as zero, as govStrat / executor contracts are not deployed yet
    // values will be updated when proposal voting starts
    governanceFramework.votingPeriod = constants_1.BIGINT_ZERO;
    governanceFramework.proposalThreshold = constants_1.BIGINT_ZERO;
    governanceFramework.votingDelay = contract.getVotingDelay();
  }
  return governanceFramework;
}
function getQuorumFromContract(contractAddress, executorAddress, blockNumber) {
  // Get govStrat contract address
  const contract = AaveGovernanceV2_1.AaveGovernanceV2.bind(contractAddress);
  const govStratAddress = contract.getGovernanceStrategy();
  // Get totalVotingSuppy from GovStrat contract
  const governanceStrategyContract =
    GovernanceStrategy_1.GovernanceStrategy.bind(govStratAddress);
  const totalVotingSupply = governanceStrategyContract.getTotalVotingSupplyAt(
    blockNumber.minus(constants_1.BIGINT_ONE)
  );
  // Get minimum voting power from Executor contract
  const executorContract = Executor_1.Executor.bind(executorAddress);
  const quorumVotes =
    executorContract.getMinimumVotingPowerNeeded(totalVotingSupply);
  // Update quorum at the contract level as well
  const governanceFramework = getGovernanceFramework(
    contractAddress.toHexString()
  );
  governanceFramework.quorumVotes = quorumVotes;
  governanceFramework.save();
  return quorumVotes;
}
