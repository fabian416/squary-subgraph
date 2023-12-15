"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRewardsAssigned = void 0;
const helpers_1 = require("../common/helpers");
const updateMetrics_1 = require("../common/updateMetrics");
/*
 * Contracts
 * https://github.com/graphprotocol/contracts/blob/dev/contracts/rewards/RewardsManager.sol
 */
/**
    * @dev Emitted when rewards are assigned to an indexer.
    
    event.params.allocationID;
    event.params.amount;
    event.params.epoch;
    event.params.indexer;
*/
function handleRewardsAssigned(event) {
    // Indexer rewards that are restaked will be caught by the handleStakeDeposited event.
    const delegatorCut = (0, helpers_1.getDelegatorCut)(event, event.params.indexer, event.params.amount);
    (0, updateMetrics_1.updateTVL)(event, delegatorCut);
    (0, updateMetrics_1.updateSupplySideRewards)(event, event.params.amount);
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.indexer);
}
exports.handleRewardsAssigned = handleRewardsAssigned;
