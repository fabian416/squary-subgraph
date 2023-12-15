"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._handleStakedTokenTransfer =
  exports._handleTransfer =
  exports._handleDelegatedPowerChanged =
  exports._handleDelegateChanged =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const handlers_1 = require("./handlers");
const constants_2 = require("./constants");
function _handleDelegateChanged(delegationType, delegator, toDelegate, event) {
  if (delegationType == constants_2.DelegationType.VOTING_POWER) {
    const tokenHolder = (0, handlers_1.getOrCreateTokenHolder)(delegator);
    const newDelegate = (0, handlers_1.getOrCreateDelegate)(toDelegate);
    // Get previous delegate from the tokenholder
    if (tokenHolder.delegate !== null) {
      const previousDelegate = (0, handlers_1.getOrCreateDelegate)(
        tokenHolder.delegate
      ); // ! needed for asm even though its typed as non-null
      previousDelegate.tokenHoldersRepresentedAmount =
        previousDelegate.tokenHoldersRepresentedAmount - 1;
      previousDelegate.save();
      const delegateChanged = (0, handlers_1.createDelegateChange)(
        event,
        toDelegate,
        tokenHolder.delegate,
        delegator
      );
      delegateChanged.save();
    }
    newDelegate.tokenHoldersRepresentedAmount =
      newDelegate.tokenHoldersRepresentedAmount + 1;
    newDelegate.save();
    // Update to new delegate
    tokenHolder.delegate = newDelegate.id;
    tokenHolder.save();
  }
}
exports._handleDelegateChanged = _handleDelegateChanged;
function _handleDelegatedPowerChanged(
  delegationType,
  delegateAddress,
  newBalance,
  event,
  isStakedToken
) {
  if (delegationType == constants_2.DelegationType.VOTING_POWER) {
    const governance = (0, handlers_1.getGovernance)();
    if ((0, handlers_1.isNewDelegate)(delegateAddress)) {
      if (!isStakedToken) {
        governance.totalDelegates = governance.totalDelegates.plus(
          constants_1.BIGINT_ONE
        );
      } else {
        governance.totalStakedTokenDelegates =
          governance.totalStakedTokenDelegates.plus(constants_1.BIGINT_ONE);
      }
    }
    const delegate = (0, handlers_1.getOrCreateDelegate)(delegateAddress);
    let previousBalance;
    // Update delegate and vote counts based on token / staked token
    if (!isStakedToken) {
      previousBalance = delegate.delegatedVotesRaw;
      const votesDifference = newBalance.minus(previousBalance);
      delegate.delegatedVotesRaw = newBalance;
      delegate.delegatedVotes = (0, handlers_1.toDecimal)(newBalance);
      if (
        previousBalance == constants_1.BIGINT_ZERO &&
        newBalance > constants_1.BIGINT_ZERO
      ) {
        governance.currentDelegates = governance.currentDelegates.plus(
          constants_1.BIGINT_ONE
        );
      }
      if (newBalance == constants_1.BIGINT_ZERO) {
        governance.currentDelegates = governance.currentDelegates.minus(
          constants_1.BIGINT_ONE
        );
      }
      governance.delegatedVotesRaw =
        governance.delegatedVotesRaw.plus(votesDifference);
      governance.delegatedVotes = (0, handlers_1.toDecimal)(
        governance.delegatedVotesRaw
      );
    } else {
      previousBalance = delegate.delegatedStakedTokenVotesRaw;
      const votesDifference = newBalance.minus(previousBalance);
      delegate.delegatedStakedTokenVotesRaw = newBalance;
      delegate.delegatedStakedTokenVotes = (0, handlers_1.toDecimal)(
        newBalance
      );
      if (
        previousBalance == constants_1.BIGINT_ZERO &&
        newBalance > constants_1.BIGINT_ZERO
      ) {
        governance.currentStakedTokenDelegates =
          governance.currentStakedTokenDelegates.plus(constants_1.BIGINT_ONE);
      }
      if (newBalance == constants_1.BIGINT_ZERO) {
        governance.currentStakedTokenDelegates =
          governance.currentStakedTokenDelegates.minus(constants_1.BIGINT_ONE);
      }
      governance.delegatedStakedTokenVotesRaw =
        governance.delegatedStakedTokenVotesRaw.plus(votesDifference);
      governance.delegatedStakedTokenVotes = (0, handlers_1.toDecimal)(
        governance.delegatedStakedTokenVotesRaw
      );
    }
    // Create DelegateVotingPowerChange
    const delegateVPChange = (0, handlers_1.createDelegateVotingPowerChange)(
      event,
      previousBalance,
      newBalance,
      delegateAddress
    );
    delegateVPChange.save();
    delegate.save();
    governance.save();
  }
}
exports._handleDelegatedPowerChanged = _handleDelegatedPowerChanged;
function _handleTransfer(from, to, value, event) {
  const fromHolder = (0, handlers_1.getOrCreateTokenHolder)(from);
  const toHolder = (0, handlers_1.getOrCreateTokenHolder)(to);
  const governance = (0, handlers_1.getGovernance)();
  const isBurn = to == constants_1.ZERO_ADDRESS;
  const isMint = from == constants_1.ZERO_ADDRESS;
  if (!isMint) {
    const fromHolderPreviousBalance = fromHolder.tokenBalanceRaw;
    fromHolder.tokenBalanceRaw = fromHolder.tokenBalanceRaw.minus(value);
    fromHolder.tokenBalance = (0, handlers_1.toDecimal)(
      fromHolder.tokenBalanceRaw
    );
    if (fromHolder.tokenBalanceRaw < constants_1.BIGINT_ZERO) {
      graph_ts_1.log.error("Negative balance on holder {} with balance {}", [
        fromHolder.id,
        fromHolder.tokenBalanceRaw.toString(),
      ]);
    }
    if (
      fromHolderPreviousBalance > constants_1.BIGINT_ZERO &&
      fromHolder.tokenBalanceRaw == constants_1.BIGINT_ZERO
    ) {
      governance.currentTokenHolders = governance.currentTokenHolders.minus(
        constants_1.BIGINT_ONE
      );
      governance.save();
    }
    fromHolder.save();
  }
  // Increment to holder balance and total tokens ever held
  const toHolderPreviousBalance = toHolder.tokenBalanceRaw;
  toHolder.tokenBalanceRaw = toHolder.tokenBalanceRaw.plus(value);
  toHolder.tokenBalance = (0, handlers_1.toDecimal)(toHolder.tokenBalanceRaw);
  toHolder.totalTokensHeldRaw = toHolder.totalTokensHeldRaw.plus(value);
  toHolder.totalTokensHeld = (0, handlers_1.toDecimal)(
    toHolder.totalTokensHeldRaw
  );
  if (
    toHolderPreviousBalance == constants_1.BIGINT_ZERO &&
    toHolder.tokenBalanceRaw > constants_1.BIGINT_ZERO
  ) {
    governance.currentTokenHolders = governance.currentTokenHolders.plus(
      constants_1.BIGINT_ONE
    );
    governance.save();
  }
  toHolder.save();
  // Adjust token total supply if it changes
  if (isMint) {
    governance.totalTokenSupply = governance.totalTokenSupply.plus(value);
    governance.save();
  } else if (isBurn) {
    governance.totalTokenSupply = governance.totalTokenSupply.minus(value);
    governance.save();
  }
  // Take snapshot
  const dailySnapshot = (0, handlers_1.getOrCreateTokenDailySnapshot)(
    event.block
  );
  dailySnapshot.totalSupply = governance.totalTokenSupply;
  dailySnapshot.tokenHolders = governance.currentTokenHolders;
  dailySnapshot.stakedTokenHolders = governance.currentStakedTokenHolders;
  dailySnapshot.delegates = governance.currentDelegates;
  dailySnapshot.stakedTokenDelegates = governance.currentStakedTokenDelegates;
  dailySnapshot.blockNumber = event.block.number;
  dailySnapshot.timestamp = event.block.timestamp;
  dailySnapshot.save();
}
exports._handleTransfer = _handleTransfer;
function _handleStakedTokenTransfer(from, to, value, event) {
  const fromHolder = (0, handlers_1.getOrCreateTokenHolder)(from);
  const toHolder = (0, handlers_1.getOrCreateTokenHolder)(to);
  const governance = (0, handlers_1.getGovernance)();
  const isBurn = to == constants_1.ZERO_ADDRESS;
  const isMint = from == constants_1.ZERO_ADDRESS;
  if (!isMint) {
    const fromHolderPreviousBalance = fromHolder.stakedTokenBalanceRaw;
    fromHolder.stakedTokenBalanceRaw =
      fromHolder.stakedTokenBalanceRaw.minus(value);
    fromHolder.stakedTokenBalance = (0, handlers_1.toDecimal)(
      fromHolder.stakedTokenBalanceRaw
    );
    if (fromHolder.stakedTokenBalanceRaw < constants_1.BIGINT_ZERO) {
      graph_ts_1.log.error("Negative balance on holder {} with balance {}", [
        fromHolder.id,
        fromHolder.stakedTokenBalanceRaw.toString(),
      ]);
    }
    if (
      fromHolderPreviousBalance > constants_1.BIGINT_ZERO &&
      fromHolder.stakedTokenBalanceRaw == constants_1.BIGINT_ZERO
    ) {
      governance.currentStakedTokenHolders =
        governance.currentStakedTokenHolders.minus(constants_1.BIGINT_ONE);
      governance.save();
    }
    fromHolder.save();
  }
  // Increment to holder balance and total tokens ever held
  const toHolderPreviousBalance = toHolder.stakedTokenBalanceRaw;
  toHolder.stakedTokenBalanceRaw = toHolder.stakedTokenBalanceRaw.plus(value);
  toHolder.stakedTokenBalance = (0, handlers_1.toDecimal)(
    toHolder.stakedTokenBalanceRaw
  );
  toHolder.totalStakedTokensHeldRaw =
    toHolder.totalStakedTokensHeldRaw.plus(value);
  toHolder.totalStakedTokensHeld = (0, handlers_1.toDecimal)(
    toHolder.totalStakedTokensHeldRaw
  );
  if (
    toHolderPreviousBalance == constants_1.BIGINT_ZERO &&
    toHolder.stakedTokenBalanceRaw > constants_1.BIGINT_ZERO
  ) {
    governance.currentStakedTokenHolders =
      governance.currentStakedTokenHolders.plus(constants_1.BIGINT_ONE);
    governance.save();
  }
  toHolder.save();
  // Adjust token total supply if it changes
  if (isMint) {
    governance.totalStakedTokenSupply =
      governance.totalStakedTokenSupply.plus(value);
    governance.save();
  } else if (isBurn) {
    governance.totalStakedTokenSupply =
      governance.totalStakedTokenSupply.minus(value);
    governance.save();
  }
  // Take snapshot
  const dailySnapshot = (0, handlers_1.getOrCreateTokenDailySnapshot)(
    event.block
  );
  dailySnapshot.totalSupply = governance.totalTokenSupply;
  dailySnapshot.tokenHolders = governance.currentTokenHolders;
  dailySnapshot.stakedTokenHolders = governance.currentStakedTokenHolders;
  dailySnapshot.delegates = governance.currentDelegates;
  dailySnapshot.stakedTokenDelegates = governance.currentStakedTokenDelegates;
  dailySnapshot.blockNumber = event.block.number;
  dailySnapshot.timestamp = event.block.timestamp;
  dailySnapshot.save();
}
exports._handleStakedTokenTransfer = _handleStakedTokenTransfer;
