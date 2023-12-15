"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRebateClaimed = exports.handleDelegationParametersUpdated = exports.handleStakeDelegatedWithdrawn = exports.handleStakeDelegatedLocked = exports.handleStakeDelegated = exports.handleStakeSlashed = exports.handleStakeWithdrawn = exports.handleStakeLocked = exports.handleStakeDeposited = void 0;
const constants_1 = require("../common/constants");
const getters_1 = require("../common/getters");
const updateMetrics_1 = require("../common/updateMetrics");
/*
 * Contracts
 * https://github.com/graphprotocol/contracts/blob/dev/contracts/staking/Staking.sol
 */
// Indexer staking events
/**
  * @dev Emitted when `indexer` stake `tokens` amount.
  
  event.params.indexer;
  event.params.tokens;
*/
function handleStakeDeposited(event) {
    (0, updateMetrics_1.updateTVL)(event, event.params.tokens);
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.indexer);
}
exports.handleStakeDeposited = handleStakeDeposited;
/**
  * @dev Emitted when `indexer` unstaked and locked `tokens` amount `until` block.
     
  event.params.indexer;
  event.params.tokens;
  event.params.until;
*/
// This is an intermediary process before the stake gets withdrawn.
// The stake is locked until the withdraw is able to be completed.
// Currently the locking period is 28 days.
function handleStakeLocked(event) {
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.indexer);
}
exports.handleStakeLocked = handleStakeLocked;
/**
  * @dev Emitted when `indexer` withdrew `tokens` staked.
  
  event.params.indexer;
  event.params.tokens;
*/
function handleStakeWithdrawn(event) {
    (0, updateMetrics_1.updateTVL)(event, event.params.tokens.times(constants_1.BIGINT_NEG_ONE));
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.indexer);
}
exports.handleStakeWithdrawn = handleStakeWithdrawn;
/**
  * @dev Emitted when `indexer` was slashed for a total of `tokens` amount.
  * Tracks `reward` amount of tokens given to `beneficiary`.
  
  event.params.beneficiary;
  event.params.indexer;
  event.params.reward;
  event.params.tokens;
*/
function handleStakeSlashed(event) {
    // These tokens get burned. Its a 50/50 split to benefirciary and burn.
    (0, updateMetrics_1.updateTVL)(event, event.params.tokens.times(constants_1.BIGINT_NEG_ONE));
    (0, updateMetrics_1.updateSupplySideRewards)(event, event.params.reward);
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.beneficiary);
}
exports.handleStakeSlashed = handleStakeSlashed;
// Delegator staking events
/**
  * @dev Emitted when `delegator` delegated `tokens` to the `indexer`, the delegator
  * gets `shares` for the delegation pool proportionally to the tokens staked.
     
  event.params.delegator;
  event.params.indexer;
  event.params.shares;
  event.params.tokens;
*/
function handleStakeDelegated(event) {
    const indexer = (0, getters_1.getOrCreateIndexer)(event, event.params.indexer);
    indexer.delegatedTokens = indexer.delegatedTokens.plus(event.params.tokens);
    indexer.save();
    (0, updateMetrics_1.updateTVL)(event, event.params.tokens);
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.delegator);
}
exports.handleStakeDelegated = handleStakeDelegated;
/**
  * @dev Emitted when `delegator` undelegated `tokens` from `indexer`.
  * Tokens get locked for withdrawal after a period of time.
  
  event.params.delegator;
  event.params.indexer;
  event.params.shares;
  event.params.tokens;
  event.params.until;
*/
// Process of undelegating.
function handleStakeDelegatedLocked(event) {
    const indexer = (0, getters_1.getOrCreateIndexer)(event, event.params.indexer);
    indexer.delegatedTokens = indexer.delegatedTokens.minus(event.params.tokens);
    indexer.save();
    // updateTVL(event, event.params.tokens)
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.delegator);
}
exports.handleStakeDelegatedLocked = handleStakeDelegatedLocked;
/**
  * @dev Emitted when `delegator` withdrew delegated `tokens` from `indexer`.
  
  event.params.delegator;
  event.params.indexer;
  event.params.tokens;
*/
function handleStakeDelegatedWithdrawn(event) {
    (0, updateMetrics_1.updateTVL)(event, event.params.tokens.times(constants_1.BIGINT_NEG_ONE));
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.delegator);
}
exports.handleStakeDelegatedWithdrawn = handleStakeDelegatedWithdrawn;
/**
  * @dev Emitted when `indexer` update the delegation parameters for its delegation pool.

  event.params.cooldownBlocks
  event.params.indexer
  event.params.indexingRewardCut
  event.params.queryFeeCut
*/
function handleDelegationParametersUpdated(event) {
    const indexer = (0, getters_1.getOrCreateIndexer)(event, event.params.indexer);
    indexer.indexingRewardCut = event.params.indexingRewardCut;
    indexer.queryFeeCut = event.params.queryFeeCut;
    indexer.cooldownBlocks = event.params.cooldownBlocks;
    indexer.save();
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.indexer);
}
exports.handleDelegationParametersUpdated = handleDelegationParametersUpdated;
/**
  * @dev Emitted when `indexer` claimed a rebate on `subgraphDeploymentID` during `epoch`
  * related to the `forEpoch` rebate pool.
  * The rebate is for `tokens` amount and `unclaimedAllocationsCount` are left for claim
  * in the rebate pool. `delegationFees` collected and sent to delegation pool.
  
  event.params.allocationID
  event.params.delegationFees
  event.params.epoch
  event.params.forEpoch
  event.params.indexer
  event.params.subgraphDeploymentID
  event.params.tokens
  event.params.unclaimedAllocationsCount
*/
function handleRebateClaimed(event) {
    (0, updateMetrics_1.updateTVL)(event, event.params.delegationFees);
    (0, updateMetrics_1.updateSupplySideRewards)(event, event.params.tokens.plus(event.params.delegationFees));
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.indexer);
}
exports.handleRebateClaimed = handleRebateClaimed;
