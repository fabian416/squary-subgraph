"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._handleTransfer = exports._handleDelegateVotesChanged = exports._handleDelegateChanged = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const handlers_1 = require("./handlers");
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
    const delegateChanged = (0, handlers_1.createDelegateChange)(event, toDelegate, fromDelegate, delegator);
    delegateChanged.save();
}
exports._handleDelegateChanged = _handleDelegateChanged;
function _handleDelegateVotesChanged(delegateAddress, previousBalance, newBalance, event) {
    const votesDifference = newBalance.minus(previousBalance);
    const delegate = (0, handlers_1.getOrCreateDelegate)(delegateAddress);
    delegate.delegatedVotesRaw = newBalance;
    delegate.delegatedVotes = (0, handlers_1.toDecimal)(newBalance);
    delegate.save();
    // Create DelegateVotingPowerChange
    const delegateVPChange = (0, handlers_1.createDelegateVotingPowerChange)(event, previousBalance, newBalance, delegateAddress);
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
exports._handleDelegateVotesChanged = _handleDelegateVotesChanged;
function _handleTransfer(from, to, value, event) {
    const fromHolder = (0, handlers_1.getOrCreateTokenHolder)(from);
    const toHolder = (0, handlers_1.getOrCreateTokenHolder)(to);
    const governance = (0, handlers_1.getGovernance)();
    const isBurn = to == constants_1.ZERO_ADDRESS;
    const isMint = from == constants_1.ZERO_ADDRESS;
    if (!isMint) {
        const fromHolderPreviousBalance = fromHolder.tokenBalanceRaw;
        fromHolder.tokenBalanceRaw = fromHolder.tokenBalanceRaw.minus(value);
        fromHolder.tokenBalance = (0, handlers_1.toDecimal)(fromHolder.tokenBalanceRaw);
        if (fromHolder.tokenBalanceRaw < constants_1.BIGINT_ZERO) {
            graph_ts_1.log.error("Negative balance on holder {} with balance {}", [
                fromHolder.id,
                fromHolder.tokenBalanceRaw.toString(),
            ]);
        }
        if (fromHolderPreviousBalance > constants_1.BIGINT_ZERO &&
            fromHolder.tokenBalanceRaw == constants_1.BIGINT_ZERO) {
            governance.currentTokenHolders =
                governance.currentTokenHolders.minus(constants_1.BIGINT_ONE);
            governance.save();
        }
        fromHolder.save();
    }
    // Increment to holder balance and total tokens ever held
    const toHolderPreviousBalance = toHolder.tokenBalanceRaw;
    toHolder.tokenBalanceRaw = toHolder.tokenBalanceRaw.plus(value);
    toHolder.tokenBalance = (0, handlers_1.toDecimal)(toHolder.tokenBalanceRaw);
    toHolder.totalTokensHeldRaw = toHolder.totalTokensHeldRaw.plus(value);
    toHolder.totalTokensHeld = (0, handlers_1.toDecimal)(toHolder.totalTokensHeldRaw);
    if (toHolderPreviousBalance == constants_1.BIGINT_ZERO &&
        toHolder.tokenBalanceRaw > constants_1.BIGINT_ZERO) {
        governance.currentTokenHolders =
            governance.currentTokenHolders.plus(constants_1.BIGINT_ONE);
        governance.save();
    }
    toHolder.save();
    // Adjust token total supply if it changes
    if (isMint) {
        governance.totalTokenSupply = governance.totalTokenSupply.plus(value);
        governance.save();
    }
    else if (isBurn) {
        governance.totalTokenSupply = governance.totalTokenSupply.minus(value);
        governance.save();
    }
    // Take snapshot
    const dailySnapshot = (0, handlers_1.getOrCreateTokenDailySnapshot)(event.block);
    dailySnapshot.totalSupply = governance.totalTokenSupply;
    dailySnapshot.tokenHolders = governance.currentTokenHolders;
    dailySnapshot.delegates = governance.currentDelegates;
    dailySnapshot.blockNumber = event.block.number;
    dailySnapshot.timestamp = event.block.timestamp;
    dailySnapshot.save();
}
exports._handleTransfer = _handleTransfer;
