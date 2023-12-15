"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = exports.handleDelegateVotesChanged = exports.handleDelegateChanged = void 0;
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../../src/constants");
const handlers_1 = require("../../../src/handlers");
const tokenHandlers_1 = require("../../../src/tokenHandlers");
// DelegateChanged(indexed address,indexed address,indexed address)
function handleDelegateChanged(event) {
    // NOTE: We are using a copy/paste of the common _handleDelegateChanged function here
    // because we want to override the delegateChangeId to include the block number.
    // This is due to Optimism having multiple blocks with the same block timestamp
    _handleDelegateChanged(event.params.delegator.toHexString(), event.params.fromDelegate.toHexString(), event.params.toDelegate.toHexString(), event);
}
exports.handleDelegateChanged = handleDelegateChanged;
// DelegateVotesChanged(indexed address,uint256,uint256)
// Called in succession to the above DelegateChanged event
function handleDelegateVotesChanged(event) {
    // NOTE: We are using a copy/paste of the common _handleDelegateVotesChanged function here
    // because we want to override the delegateVotingPwerChangeId to include the block number.
    // This is due to Optimism having multiple blocks with the same block timestamp
    _handleDelegateVotesChanged(event.params.delegate.toHexString(), event.params.previousBalance, event.params.newBalance, event);
}
exports.handleDelegateVotesChanged = handleDelegateVotesChanged;
// ================= Extracted from subgraphs/openzeppelin-governor/src/tokenHandlers.ts =================
function _handleDelegateChanged(delegator, fromDelegate, toDelegate, event) {
    const tokenHolder = (0, handlers_1.getOrCreateTokenHolder)(delegator);
    const previousDelegate = (0, handlers_1.getOrCreateDelegate)(fromDelegate);
    const newDelegate = (0, handlers_1.getOrCreateDelegate)(toDelegate);
    tokenHolder.delegate = newDelegate.id;
    tokenHolder.save();
    previousDelegate.tokenHoldersRepresentedAmount =
        previousDelegate.tokenHoldersRepresentedAmount - 1;
    previousDelegate.save();
    newDelegate.tokenHoldersRepresentedAmount =
        newDelegate.tokenHoldersRepresentedAmount + 1;
    newDelegate.save();
    const delegateChanged = createDelegateChange(event, toDelegate, fromDelegate, delegator);
    delegateChanged.save();
}
function _handleDelegateVotesChanged(delegateAddress, previousBalance, newBalance, event) {
    const votesDifference = newBalance.minus(previousBalance);
    const delegate = (0, handlers_1.getOrCreateDelegate)(delegateAddress);
    delegate.delegatedVotesRaw = newBalance;
    delegate.delegatedVotes = (0, handlers_1.toDecimal)(newBalance);
    delegate.save();
    // Create DelegateVotingPowerChange
    const delegateVPChange = createDelegateVotingPowerChange(event, previousBalance, newBalance, delegateAddress);
    delegateVPChange.save();
    // Update governance delegate count
    const governance = (0, handlers_1.getGovernance)();
    if (previousBalance == constants_1.BIGINT_ZERO && newBalance > constants_1.BIGINT_ZERO) {
        governance.currentDelegates = governance.currentDelegates.plus(constants_1.BIGINT_ONE);
    }
    if (newBalance == constants_1.BIGINT_ZERO) {
        governance.currentDelegates = governance.currentDelegates.minus(constants_1.BIGINT_ONE);
    }
    governance.delegatedVotesRaw =
        governance.delegatedVotesRaw.plus(votesDifference);
    governance.delegatedVotes = (0, handlers_1.toDecimal)(governance.delegatedVotesRaw);
    governance.save();
}
// ================= Extracted from subgraphs/openzeppelin-governor/src/handlers.ts =================
function createDelegateChange(event, toDelegate, fromDelegate, delegator) {
    // THIS SINGLE LINE IS THE ONLY DIFFERENCE FROM THE ORIGINAL FUNCTION
    // We are adding the block number to the id to avoid duplicate ids when there are multiple blocks
    // with the same timestamp
    const delegateChangeId = `${event.block.timestamp.toI64()}-${event.block.number}-${event.logIndex}`;
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
function createDelegateVotingPowerChange(event, previousBalance, newBalance, delegate) {
    // THIS SINGLE LINE IS THE ONLY DIFFERENCE FROM THE ORIGINAL FUNCTION
    // We are adding the block number to the id to avoid duplicate ids when there are multiple blocks
    // with the same timestamp
    const delegateVotingPwerChangeId = `${event.block.timestamp.toI64()}-${event.block.number}-${event.logIndex}`;
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
// Transfer(indexed address,indexed address,uint256)
function handleTransfer(event) {
    (0, tokenHandlers_1._handleTransfer)(event.params.from.toHexString(), event.params.to.toHexString(), event.params.value, event);
}
exports.handleTransfer = handleTransfer;
