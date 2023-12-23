"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._handleVoteEmitted =
  exports._handleProposalQueued =
  exports._handleProposalExecuted =
  exports._handleProposalCanceled =
  exports._handleProposalCreated =
  exports.getOrCreateVoteDailySnapshot =
  exports.getOrCreateTokenDailySnapshot =
  exports.getOrCreateTokenHolder =
  exports.getOrCreateDelegate =
  exports.isNewDelegate =
  exports.getProposal =
  exports.createDelegateVotingPowerChange =
  exports.createDelegateChange =
  exports.getGovernance =
  exports.getVoteChoiceByValue =
  exports.addressesToStrings =
  exports.toDecimal =
  exports.SECONDS_PER_DAY =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const schema_1 = require("../generated/schema");
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
exports.SECONDS_PER_DAY = 60 * 60 * 24;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
function toDecimal(value, decimals = 18) {
  return value.divDecimal(
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    graph_ts_1.BigInt.fromI32(10).pow(decimals).toBigDecimal()
  );
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
  if (choiceValue === true) {
    return constants_1.VoteChoice.FOR;
  } else {
    return constants_1.VoteChoice.AGAINST;
  }
}
exports.getVoteChoiceByValue = getVoteChoiceByValue;
function getGovernance() {
  let governance = schema_1.Governance.load(constants_1.GOVERNANCE_TYPE);
  if (!governance) {
    governance = new schema_1.Governance(constants_1.GOVERNANCE_TYPE);
    governance.totalTokenSupply = constants_1.BIGINT_ZERO;
    governance.proposals = constants_1.BIGINT_ZERO;
    governance.currentTokenHolders = constants_1.BIGINT_ZERO;
    governance.totalTokenHolders = constants_1.BIGINT_ZERO;
    governance.currentDelegates = constants_1.BIGINT_ZERO;
    governance.totalDelegates = constants_1.BIGINT_ZERO;
    governance.delegatedVotesRaw = constants_1.BIGINT_ZERO;
    governance.delegatedVotes = constants_1.BIGDECIMAL_ZERO;
    governance.totalStakedTokenSupply = constants_1.BIGINT_ZERO;
    governance.currentStakedTokenHolders = constants_1.BIGINT_ZERO;
    governance.totalStakedTokenHolders = constants_1.BIGINT_ZERO;
    governance.currentStakedTokenDelegates = constants_1.BIGINT_ZERO;
    governance.totalStakedTokenDelegates = constants_1.BIGINT_ZERO;
    governance.delegatedStakedTokenVotesRaw = constants_1.BIGINT_ZERO;
    governance.delegatedStakedTokenVotes = constants_1.BIGDECIMAL_ZERO;
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
function createDelegateVotingPowerChange(
  event,
  previousBalance,
  newBalance,
  delegate
) {
  const delegateVotingPwerChangeId = `${event.block.timestamp.toI64()}-${
    event.logIndex
  }`;
  const delegateVPChange = new schema_1.DelegateVotingPowerChange(
    delegateVotingPwerChangeId
  );
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
function isNewDelegate(address) {
  return (
    address != constants_1.ZERO_ADDRESS &&
    schema_1.Delegate.load(address) == null
  );
}
exports.isNewDelegate = isNewDelegate;
function getOrCreateDelegate(address) {
  let delegate = schema_1.Delegate.load(address);
  if (!delegate) {
    delegate = new schema_1.Delegate(address);
    delegate.delegatedVotesRaw = constants_1.BIGINT_ZERO;
    delegate.delegatedVotes = constants_1.BIGDECIMAL_ZERO;
    delegate.delegatedStakedTokenVotesRaw = constants_1.BIGINT_ZERO;
    delegate.delegatedStakedTokenVotes = constants_1.BIGDECIMAL_ZERO;
    delegate.tokenHoldersRepresentedAmount = 0;
    delegate.numberVotes = 0;
    delegate.save();
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
    tokenHolder.stakedTokenBalanceRaw = constants_1.BIGINT_ZERO;
    tokenHolder.stakedTokenBalance = constants_1.BIGDECIMAL_ZERO;
    tokenHolder.totalStakedTokensHeldRaw = constants_1.BIGINT_ZERO;
    tokenHolder.totalStakedTokensHeld = constants_1.BIGDECIMAL_ZERO;
    tokenHolder.save();
    if (address != constants_1.ZERO_ADDRESS) {
      const governance = getGovernance();
      governance.totalTokenHolders = governance.totalTokenHolders.plus(
        constants_1.BIGINT_ONE
      );
      governance.save();
    }
  }
  return tokenHolder;
}
exports.getOrCreateTokenHolder = getOrCreateTokenHolder;
function getOrCreateTokenDailySnapshot(block) {
  const snapshotId = (
    block.timestamp.toI64() / exports.SECONDS_PER_DAY
  ).toString();
  const previousSnapshot = schema_1.TokenDailySnapshot.load(snapshotId);
  if (previousSnapshot != null) {
    return previousSnapshot;
  }
  const snapshot = new schema_1.TokenDailySnapshot(snapshotId);
  return snapshot;
}
exports.getOrCreateTokenDailySnapshot = getOrCreateTokenDailySnapshot;
function getOrCreateVoteDailySnapshot(proposal, block) {
  const snapshotId =
    proposal.id +
    "-" +
    (block.timestamp.toI64() / exports.SECONDS_PER_DAY).toString();
  const previousSnapshot = schema_1.VoteDailySnapshot.load(snapshotId);
  if (previousSnapshot != null) {
    return previousSnapshot;
  }
  const snapshot = new schema_1.VoteDailySnapshot(snapshotId);
  return snapshot;
}
exports.getOrCreateVoteDailySnapshot = getOrCreateVoteDailySnapshot;
function _handleProposalCreated(
  proposalId,
  proposerAddr,
  executorAddr,
  targets,
  values,
  signatures,
  calldatas,
  startBlock,
  endBlock,
  ipfsHash,
  quorum,
  event
) {
  const proposal = getProposal(proposalId);
  let proposer = getOrCreateDelegate(proposerAddr);
  // Checking if the proposer was a delegate already accounted for, if not we should log an error
  // since it shouldn't be possible for a delegate to propose anything without first being "created"
  if (proposer == null) {
    graph_ts_1.log.error(
      "Delegate participant {} not found on ProposalCreated. tx_hash: {}",
      [proposerAddr, event.transaction.hash.toHexString()]
    );
  }
  // Creating it anyway since we will want to account for this event data, even though it should've never happened
  proposer = getOrCreateDelegate(proposerAddr);
  proposal.txnHash = event.transaction.hash.toHexString();
  proposal.executor = executorAddr;
  proposal.proposer = proposer.id;
  proposal.txnHash = event.transaction.hash.toHexString();
  proposal.quorumVotes = constants_1.BIGINT_ZERO;
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
  // Get description from ipfs hash (from official Aave Governance Subgraph)
  // https://github.com/aave/governance-delegation-subgraph/blob/master/src/mapping/governance.ts#L33
  let description = "";
  const hash = graph_ts_1.Bytes.fromHexString(
    "1220" + ipfsHash.toHexString().slice(2)
  ).toBase58();
  const data = graph_ts_1.ipfs.cat(hash);
  if (data) {
    const proposalData = graph_ts_1.json.try_fromBytes(data);
    let descriptionJSON = null;
    if (proposalData.isOk) {
      // proposalData is either a JSON object or a raw string
      if (proposalData.value.kind == graph_ts_1.JSONValueKind.OBJECT) {
        const jsonData = proposalData.value.toObject();
        descriptionJSON = jsonData.get("description");
        if (descriptionJSON) {
          description = descriptionJSON.toString();
        }
      }
    } else {
      description = data.toString();
    }
  }
  proposal.description = description;
  proposal.governanceFramework = event.address.toHexString();
  // If start block reached, proposal starts as active
  if (event.block.number >= proposal.startBlock) {
    proposal.state = constants_1.ProposalState.ACTIVE;
    // Set snapshot for quorum, tokenholders and delegates
    proposal.quorumVotes = quorum;
    const governance = getGovernance();
    proposal.tokenHoldersAtStart = governance.currentTokenHolders;
    proposal.delegatesAtStart = governance.currentDelegates;
  } else {
    proposal.state = constants_1.ProposalState.PENDING;
  }
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
  governance.proposalsCanceled = governance.proposalsCanceled.plus(
    constants_1.BIGINT_ONE
  );
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
  governance.proposalsQueued = governance.proposalsQueued.minus(
    constants_1.BIGINT_ONE
  );
  governance.proposalsExecuted = governance.proposalsExecuted.plus(
    constants_1.BIGINT_ONE
  );
  governance.save();
}
exports._handleProposalExecuted = _handleProposalExecuted;
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
  governance.proposalsQueued = governance.proposalsQueued.plus(
    constants_1.BIGINT_ONE
  );
  governance.save();
}
exports._handleProposalQueued = _handleProposalQueued;
function _handleVoteEmitted(proposal, voterAddress, weight, support, event) {
  const choice = getVoteChoiceByValue(support);
  const voteId = voterAddress.concat("-").concat(proposal.id);
  let vote = schema_1.Vote.load(voteId);
  if (vote) {
    // Avoid edge case for duplicate votes with zero weights
    return;
  }
  vote = new schema_1.Vote(voteId);
  vote.proposal = proposal.id;
  vote.voter = voterAddress;
  vote.weight = weight;
  vote.reason = null;
  vote.block = event.block.number;
  vote.blockTime = event.block.timestamp;
  vote.txnHash = event.transaction.hash.toHexString();
  vote.choice = choice;
  vote.logIndex = event.logIndex;
  vote.blockTimeId = `${event.block.timestamp.toI64()}-${event.logIndex}`;
  vote.save();
  // Increment respective vote choice counts
  if (choice === constants_1.VoteChoice.AGAINST) {
    proposal.againstDelegateVotes = proposal.againstDelegateVotes.plus(
      constants_1.BIGINT_ONE
    );
    proposal.againstWeightedVotes = proposal.againstWeightedVotes.plus(weight);
  } else {
    proposal.forDelegateVotes = proposal.forDelegateVotes.plus(
      constants_1.BIGINT_ONE
    );
    proposal.forWeightedVotes = proposal.forWeightedVotes.plus(weight);
  }
  // Increment total
  proposal.totalDelegateVotes = proposal.totalDelegateVotes.plus(
    constants_1.BIGINT_ONE
  );
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
exports._handleVoteEmitted = _handleVoteEmitted;