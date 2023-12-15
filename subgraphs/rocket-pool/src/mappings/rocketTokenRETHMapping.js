"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const rocketTokenRETH_1 = require("../../generated/templates/rocketTokenRETH/rocketTokenRETH");
const generalUtilities_1 = require("../checkpoints/generalUtilities");
const stakerUtilities_1 = require("../checkpoints/stakerUtilities");
const entityFactory_1 = require("../entityFactory");
const usageMetrics_1 = require("../updaters/usageMetrics");
/**
 * Occurs when a staker transfer an rETH amount to another staker.
 */
function handleTransfer(event) {
    handleRocketETHTransaction(event, event.params.from, event.params.to, event.params.value);
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.params.from);
}
exports.handleTransfer = handleTransfer;
/**
 * General flow of what should happen for a RocketETH transaction.
 */
function handleRocketETHTransaction(event, from, to, rETHAmount) {
    // Preliminary check to ensure we haven't handled this before.
    if (stakerUtilities_1.stakerUtilities.hasTransactionHasBeenIndexed(event))
        return;
    // Who are the stakers for this transaction?
    const stakers = stakerUtilities_1.stakerUtilities.getTransactionStakers(from, to, event.block.number, event.block.timestamp);
    if (stakers === null ||
        stakers.fromStaker === null ||
        stakers.toStaker === null)
        return;
    // Attempt to index this transaction.
    saveTransaction(event, stakers.fromStaker, stakers.toStaker, rETHAmount);
}
/**
 * Save a new Transaction that occured between the FROM and TO staker for a specific rETH amount.
 */
function saveTransaction(event, from, to, rETHAmount) {
    // This state has to be valid before we can actually do anything.
    if (event === null ||
        from === null ||
        from.id == null ||
        to === null ||
        to.id == null)
        return;
    // Create a new transaction for the given values.
    const rEthTransaction = entityFactory_1.rocketPoolEntityFactory.createRocketETHTransaction(generalUtilities_1.generalUtilities.extractIdForEntity(event), from, to, rETHAmount, event);
    if (rEthTransaction === null || rEthTransaction.id == null)
        return;
    // Protocol entity should exist, if not, then we attempt to create it.
    let protocol = generalUtilities_1.generalUtilities.getRocketPoolProtocolEntity();
    if (protocol === null || protocol.id == null) {
        protocol = entityFactory_1.rocketPoolEntityFactory.createRocketPoolProtocol();
    }
    // Load the RocketTokenRETH contract.
    const rETHContract = rocketTokenRETH_1.rocketTokenRETH.bind(event.address);
    if (rETHContract === null)
        return;
    // Update active balances for stakesr.
    const exchangeRate = rETHContract.getExchangeRate();
    stakerUtilities_1.stakerUtilities.changeStakerBalances(from, rETHAmount, exchangeRate, false);
    stakerUtilities_1.stakerUtilities.changeStakerBalances(to, rETHAmount, exchangeRate, true);
    // Save all indirectly affected entities of the protocol - All stakers
    const protocolStakers = protocol.stakers;
    if (protocolStakers.indexOf(from.id) == -1)
        protocolStakers.push(from.id);
    if (protocolStakers.indexOf(to.id) == -1)
        protocolStakers.push(to.id);
    protocol.stakers = protocolStakers;
    // Save all indirectly affected entities of the protocol - Active stakers.
    const protocolActiveStakers = protocol.activeStakers;
    if (from.rETHBalance > graph_ts_1.BigInt.fromI32(0) &&
        protocolActiveStakers.indexOf(from.id) == -1)
        protocolActiveStakers.push(from.id);
    else if (from.rETHBalance == graph_ts_1.BigInt.fromI32(0) &&
        protocolActiveStakers.indexOf(from.id) != -1)
        protocolActiveStakers.splice(protocolActiveStakers.indexOf(from.id), 1);
    if (to.rETHBalance > graph_ts_1.BigInt.fromI32(0) &&
        protocolActiveStakers.indexOf(to.id) == -1)
        protocolActiveStakers.push(to.id);
    else if (to.rETHBalance == graph_ts_1.BigInt.fromI32(0) &&
        protocolActiveStakers.indexOf(to.id) != -1)
        protocolActiveStakers.splice(protocolActiveStakers.indexOf(to.id), 1);
    protocol.activeStakers = protocolActiveStakers;
    // Index all state.
    from.save();
    to.save();
    rEthTransaction.save();
    protocol.save();
}
