"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIncrementNodeFinalisedMinipoolCount = exports.handleMinipoolDestroyed = exports.handleMinipoolCreated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const rocketNetworkFees_1 = require("../../generated/templates/rocketMinipoolManager/rocketNetworkFees");
const rocketNodeStaking_1 = require("../../generated/templates/rocketMinipoolManager/rocketNodeStaking");
const contractConstants_1 = require("../constants/contractConstants");
const schema_1 = require("../../generated/schema");
const entityFactory_1 = require("../entityFactory");
const templates_1 = require("../../generated/templates");
const usageMetrics_1 = require("../updaters/usageMetrics");
const rocketContracts_1 = require("../entities/rocketContracts");
/**
 * Occurs when a node operator makes an ETH deposit on his node to create a minipool.
 */
function handleMinipoolCreated(event) {
    // Preliminary null checks.
    if (event === null ||
        event.params === null ||
        event.params.node === null ||
        event.params.minipool === null)
        return;
    // There can't be an existing minipool with the same address.
    let minipool = schema_1.Minipool.load(event.params.minipool.toHexString());
    if (minipool !== null)
        return;
    // Retrieve the parent node. It has to exist.
    const node = schema_1.Node.load(event.params.node.toHexString());
    if (node === null)
        return;
    // Create a new minipool.
    minipool = entityFactory_1.rocketPoolEntityFactory.createMinipool(event.params.minipool.toHexString(), node, 
    /**
     * This will be called immediately after this event was emitted and before this minipool is queued.
     * Therefor it is safe to call the minipool fee smart contract and assume it will give the same fee
     *  that the minipool just received in its constructor.
     */
    getNewMinipoolFee());
    if (minipool === null)
        return;
    // Add this minipool to the collection of the node
    const nodeMinipools = node.minipools;
    if (nodeMinipools.indexOf(minipool.id) == -1)
        nodeMinipools.push(minipool.id);
    node.minipools = nodeMinipools;
    // Index the minipool.
    minipool.save();
    // Creating a minipool requires the node operator to put up a certain amount of RPL in order to receive rewards.
    setEffectiveRPLStaked(node);
    // A destroyed minipool changes the average minipool fee for a node.
    node.averageFeeForActiveMinipools =
        getAverageFeeForActiveMinipools(nodeMinipools);
    // Index the changes to the associated node.
    node.save();
    // Get the appropriate delegate template for this block and use it to create another instance of the entity.
    templates_1.rocketMinipoolDelegate.create(graph_ts_1.Address.fromString(minipool.id));
    (0, rocketContracts_1.createOrUpdateRocketContract)(contractConstants_1.RocketContractNames.ROCKET_MINIPOOL_DELEGATE, graph_ts_1.Bytes.fromByteArray(graph_ts_1.crypto.keccak256(graph_ts_1.ByteArray.fromUTF8("contract.address".concat(contractConstants_1.RocketContractNames.ROCKET_MINIPOOL_DELEGATE)))), graph_ts_1.Address.fromString(minipool.id));
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.address);
}
exports.handleMinipoolCreated = handleMinipoolCreated;
/**
 * Occurs when a minipool is dissolved and the node operator calls destroy on his minipool.
 */
function handleMinipoolDestroyed(event) {
    // Preliminary null checks.
    if (event === null ||
        event.params === null ||
        event.params.node === null ||
        event.params.minipool === null ||
        event.block === null)
        return;
    // There must be an indexed minipool.
    const minipool = schema_1.Minipool.load(event.params.minipool.toHexString());
    if (minipool === null)
        return;
    // Retrieve the parent node. It has to exist.
    const node = schema_1.Node.load(event.params.node.toHexString());
    if (node === null)
        return;
    // Update the minipool so it will contain its destroyed state.
    minipool.destroyedBlockTime = event.block.timestamp;
    // Index minipool changes.
    minipool.save();
    // Destroying a minipool lowers the requirements for the node operator to put up collateral in order to receive RPL rewards.
    setEffectiveRPLStaked(node);
    // A destroyed minipool changes the average minipool fee for a node.
    node.averageFeeForActiveMinipools = getAverageFeeForActiveMinipools(node.minipools);
    // Index change to the associated node.
    node.save();
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.address);
}
exports.handleMinipoolDestroyed = handleMinipoolDestroyed;
/**
 * TODO: Use on mainnet; call handlers don't work on goerli
 * Occurs after a node operator finalizes his minipool to unlock his RPL stake.
 */
function handleIncrementNodeFinalisedMinipoolCount(call) {
    // Preliminary null checks.
    if (call === null || call.block === null || call.from === null)
        return;
    // Calling address should be a minipool with a valid link to a node.
    const minipool = schema_1.Minipool.load(call.from.toHexString());
    if (minipool === null || minipool.node == null)
        return;
    // Retrieve the parent node. It has to exist.
    const node = schema_1.Node.load(minipool.node);
    if (node === null)
        return;
    // Update the finalized block time for this minipool and the number of total finalized minipools for the node.
    minipool.finalizedBlockTime = call.block.timestamp;
    // Index the minipool changes.
    minipool.save();
    // Update node state.
    node.totalFinalizedMinipools = node.totalFinalizedMinipools.plus(graph_ts_1.BigInt.fromI32(1));
    // Decrement the number of withdrawable minipools for the node.
    node.withdrawableMinipools = node.totalFinalizedMinipools.minus(graph_ts_1.BigInt.fromI32(1));
    if (node.withdrawableMinipools < graph_ts_1.BigInt.fromI32(0))
        node.withdrawableMinipools = graph_ts_1.BigInt.fromI32(0);
    // A finalized minipool lowers the requirements for a node to put up collateral to receive rewards.
    setEffectiveRPLStaked(node);
    // A finalized minipool changes the average minipool fee for a node.
    node.averageFeeForActiveMinipools = getAverageFeeForActiveMinipools(node.minipools);
    // Index the associated node.
    node.save();
}
exports.handleIncrementNodeFinalisedMinipoolCount = handleIncrementNodeFinalisedMinipoolCount;
/**
 * Gets the new minipool fee form the smart contract state.
 */
function getNewMinipoolFee() {
    // Get the network fees contract instance.
    const networkFeesContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_NETWORK_FEES);
    const networkFeesContract = rocketNetworkFees_1.rocketNetworkFees.bind(graph_ts_1.Address.fromBytes(networkFeesContractEntity.latestAddress));
    if (networkFeesContract === null)
        return graph_ts_1.BigInt.fromI32(0);
    const nodeFeeCall = networkFeesContract.try_getNodeFee();
    if (nodeFeeCall.reverted)
        return graph_ts_1.BigInt.fromI32(0);
    return nodeFeeCall.value;
}
/**
 * Sets the effective RPl staked states for a node based on the smart contract state.
 */
function setEffectiveRPLStaked(node) {
    // We need this to get the new (minimum/maximum) effective RPL staked for the node.
    const rocketNodeStakingContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_NODE_STAKING);
    const rocketNodeStakingContract = rocketNodeStaking_1.rocketNodeStaking.bind(graph_ts_1.Address.fromBytes(rocketNodeStakingContractEntity.latestAddress));
    if (rocketNodeStakingContract === null)
        return;
    // Load the effective RPL staked state from the smart contracts and update the node.
    const nodeAddress = graph_ts_1.Address.fromString(node.id);
    const nodeEffectiveRPLStakeCall = rocketNodeStakingContract.try_getNodeEffectiveRPLStake(nodeAddress);
    if (!nodeEffectiveRPLStakeCall.reverted)
        node.effectiveRPLStaked = nodeEffectiveRPLStakeCall.value;
    const nodeMinimumRPLStakeCall = rocketNodeStakingContract.try_getNodeMinimumRPLStake(nodeAddress);
    if (!nodeMinimumRPLStakeCall.reverted)
        node.minimumEffectiveRPL = nodeMinimumRPLStakeCall.value;
    const nodeMaximumRPLStakeCall = rocketNodeStakingContract.try_getNodeMaximumRPLStake(nodeAddress);
    if (!nodeMaximumRPLStakeCall.reverted)
        node.maximumEffectiveRPL = nodeMaximumRPLStakeCall.value;
}
/**
 * Loops through all minipools of a node and sets the average fee for the active minipools.
 */
function getAverageFeeForActiveMinipools(minipoolIds) {
    // If there were no minipools, then the average fee is currently 0.
    if (minipoolIds === null || minipoolIds.length == 0)
        return graph_ts_1.BigInt.fromI32(0);
    // We'll need these to calculate the average fee accross all minipools for the given node.
    let totalMinipoolFeeForActiveMinipools = graph_ts_1.BigInt.fromI32(0);
    let totalActiveMinipools = graph_ts_1.BigInt.fromI32(0);
    // Loop through all the minipool ids of the node.
    for (let index = 0; index < minipoolIds.length; index++) {
        // Get the current minipool ID for this iteration.
        const minipoolId = minipoolIds[index];
        if (minipoolId == null)
            continue;
        // Load the indexed minipool.
        const minipool = schema_1.Minipool.load(minipoolId);
        /*
         If the minipool:
         - Wasn't indexed.
         - Is in a finalized state.
         - Is in a destroyed state.
         Then we can't use its fee to calculate the average for the node.
        */
        if (minipool === null ||
            minipool.finalizedBlockTime != graph_ts_1.BigInt.fromI32(0) ||
            minipool.destroyedBlockTime != graph_ts_1.BigInt.fromI32(0))
            continue;
        // Increment total active minipools.
        totalActiveMinipools = totalActiveMinipools.plus(graph_ts_1.BigInt.fromI32(1));
        // Increment total fee accross all minipools.
        totalMinipoolFeeForActiveMinipools =
            totalMinipoolFeeForActiveMinipools.plus(minipool.fee);
    }
    /*
     If the total active minipools for this node is greater than 0.
     And the total fee for the active minipools is greater than 0.
     We can calculate the average fee for active minipools for this node.
    */
    if (totalActiveMinipools > graph_ts_1.BigInt.fromI32(0) &&
        totalMinipoolFeeForActiveMinipools > graph_ts_1.BigInt.fromI32(0)) {
        return totalMinipoolFeeForActiveMinipools.div(totalActiveMinipools);
    }
    else
        return graph_ts_1.BigInt.fromI32(0);
}
