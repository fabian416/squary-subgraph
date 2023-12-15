"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCollected = exports.handleBurned = exports.handleSignalled = void 0;
const constants_1 = require("../common/constants");
const updateMetrics_1 = require("../common/updateMetrics");
/*
 * Contracts
 * https://github.com/graphprotocol/contracts/blob/dev/contracts/curation/Curation.sol
 */
// Curator signalling events
/**
    * @dev Emitted when `curator` deposited `tokens` on `subgraphDeploymentID` as curation signal.
    * The `curator` receives `signal` amount according to the curation pool bonding curve.
    * An amount of `curationTax` will be collected and burned.
    
    event.params.curationTax
    event.params.curator
    event.params.signal
    event.params.subgraphDeploymentID
    event.params.tokens;
*/
function handleSignalled(event) {
    // There is currently a 1% Curation tax for each signal -- Can change but right now its all burned.
    // Automigration of signal due to a failed subgraph incurs a 0.5% tax - The other 0.5% is taken care of by the subgraph developer -- Will probably change, but it is a temporary solution.
    // https://thegraph.com/docs/en/network/curating/#:~:text=Curation%20Fee%20%2D%20when%20a%20curator%20signals%20GRT%20on%20a%20subgraph%2C%20they%20incur%20a%201%25%20curation%20tax.%20This%20fee%20is%20burned%20and%20the%20rest%20is%20deposited%20into%20the%20reserve%20supply%20of%20the%20bonding%20curve.
    (0, updateMetrics_1.updateTVL)(event, event.params.tokens);
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.curator);
}
exports.handleSignalled = handleSignalled;
/**
    * @dev Emitted when `curator` burned `signal` for a `subgraphDeploymentID`.
    * The curator will receive `tokens` according to the value of the bonding curve.
    
    event.params.curator
    event.params.signal
    event.params.subgraphDeploymentID
    event.params.tokens;
*/
function handleBurned(event) {
    (0, updateMetrics_1.updateTVL)(event, event.params.tokens.times(constants_1.BIGINT_NEG_ONE));
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.curator);
}
exports.handleBurned = handleBurned;
/**
    * @dev Emitted when `tokens` amount were collected for `subgraphDeploymentID` as part of fees
    * distributed by an indexer from query fees received from state channels.

    event.params.subgraphDeploymentID
    event.params.tokens;
*/
// Not necessary since the AllocationCollected event emits this as well.
// When the subgraph closes, the query fees are settled and 10% goes to curators - this amount can change.
// 1% is burned, the rest goes to indexers and delegators.
// The rewards here are not directly distributed, they are deposited into a bonding curve and the share price goes up.
// Should also go to TVL since it is still in the pool.
function handleCollected(event) {
    event.params.subgraphDeploymentID;
    event.params.tokens;
    (0, updateMetrics_1.updateTVL)(event, event.params.tokens);
    (0, updateMetrics_1.updateSupplySideRewards)(event, event.params.tokens);
}
exports.handleCollected = handleCollected;
