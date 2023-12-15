"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePricesUpdatedAtlas = exports.handlePricesUpdated = void 0;
const rocketNetworkFees_1 = require("../../generated/templates/rocketNetworkPrices/rocketNetworkFees");
const rocketDAOProtocolSettingsMinipool_1 = require("../../generated/templates/rocketNetworkPrices/rocketDAOProtocolSettingsMinipool");
const rocketDAOProtocolSettingsNode_1 = require("../../generated/templates/rocketNetworkPrices/rocketDAOProtocolSettingsNode");
const rocketNodeStaking_1 = require("../../generated/templates/rocketNetworkPrices/rocketNodeStaking");
const schema_1 = require("../../generated/schema");
const generalUtilities_1 = require("../checkpoints/generalUtilities");
const entityFactory_1 = require("../entityFactory");
const networkNodeBalanceMetadata_1 = require("../models/networkNodeBalanceMetadata");
const contractConstants_1 = require("../constants/contractConstants");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const nodeUtilities_1 = require("../checkpoints/nodeUtilities");
const effectiveMinipoolRPLBounds_1 = require("../models/effectiveMinipoolRPLBounds");
const generalConstants_1 = require("../constants/generalConstants");
const usageMetrics_1 = require("../updaters/usageMetrics");
const financialMetrics_1 = require("../updaters/financialMetrics");
const rocketContracts_1 = require("../entities/rocketContracts");
const constants_1 = require("../utils/constants");
/**
 * When enough ODAO members submitted their votes and a consensus threshold is reached, a new RPL price is comitted to the smart contracts.
 */
function handlePricesUpdated(event) {
    pricesUpdated(event.params.rplPrice, event);
}
exports.handlePricesUpdated = handlePricesUpdated;
function handlePricesUpdatedAtlas(event) {
    pricesUpdated(event.params.rplPrice, event);
}
exports.handlePricesUpdatedAtlas = handlePricesUpdatedAtlas;
function pricesUpdated(rplPrice, event) {
    // Protocol entity should exist, if not, then we attempt to create it.
    let protocol = generalUtilities_1.generalUtilities.getRocketPoolProtocolEntity();
    if (protocol === null || protocol.id == null) {
        protocol = entityFactory_1.rocketPoolEntityFactory.createRocketPoolProtocol();
    }
    if (protocol === null)
        return;
    // Preliminary check to ensure we haven't handled this before.
    if (nodeUtilities_1.nodeUtilities.hasNetworkNodeBalanceCheckpointHasBeenIndexed(protocol, event))
        return;
    // Determine the fee for a new minipool.
    const networkFeesContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_NETWORK_FEES);
    const networkFeesContract = rocketNetworkFees_1.rocketNetworkFees.bind(graph_ts_1.Address.fromBytes(networkFeesContractEntity.latestAddress));
    const nodeFeeCall = networkFeesContract.try_getNodeFee();
    if (nodeFeeCall.reverted)
        return;
    const nodeFeeForNewMinipool = nodeFeeCall.value;
    // Determine the RPL minimum and maximum for a new minipool.
    const effectiveRPLBoundsNewMinipool = getEffectiveMinipoolRPLBounds(event.block.number, rplPrice);
    // Create a new network node balance checkpoint.
    const checkpoint = entityFactory_1.rocketPoolEntityFactory.createNetworkNodeBalanceCheckpoint(generalUtilities_1.generalUtilities.extractIdForEntity(event), protocol.lastNetworkNodeBalanceCheckPoint, effectiveRPLBoundsNewMinipool.minimum, effectiveRPLBoundsNewMinipool.maximum, rplPrice, nodeFeeForNewMinipool, event.block.number, event.block.timestamp);
    if (checkpoint === null)
        return;
    // Retrieve the previous network node checkpoint & store some of the running totals it holds for later.
    let previousCheckpoint = null;
    const previousCheckpointId = protocol.lastNetworkNodeBalanceCheckPoint;
    if (previousCheckpointId != null) {
        previousCheckpoint = schema_1.NetworkNodeBalanceCheckpoint.load(previousCheckpointId);
        if (previousCheckpoint !== null) {
            previousCheckpoint.nextCheckpointId = checkpoint.id;
        }
    }
    // Handle the node impact.
    const metadata = generateNodeBalanceCheckpoints(protocol.nodes, checkpoint, event.block.number, event.block.timestamp);
    (0, financialMetrics_1.updateSnapshotsTvl)(event.block);
    // Some of the running totals should be set to the ones from the previous checkpoint if they are 0 after generating the individual node balance checkpoints.
    nodeUtilities_1.nodeUtilities.coerceRunningTotalsBasedOnPreviousCheckpoint(checkpoint, previousCheckpoint);
    // Update certain totals/averages based on minipool metadata.
    nodeUtilities_1.nodeUtilities.updateNetworkNodeBalanceCheckpointForMinipoolMetadata(checkpoint, metadata.minipoolMetadata);
    nodeUtilities_1.nodeUtilities.updateNetworkNodeBalanceCheckpointForRPLMetadata(checkpoint, metadata.rplMetadata);
    // Determine the average RPL/ETH ratio for the current network node balance checkpoint.
    setAverageRplEthRatio(protocol, checkpoint);
    // Update the link so the protocol points to the last network node balance checkpoint.
    protocol.lastNetworkNodeBalanceCheckPoint = checkpoint.id;
    // Add the new network node balance checkpoint to the protocol collection.
    const nodeBalanceCheckpoints = protocol.networkNodeBalanceCheckpoints;
    if (nodeBalanceCheckpoints.indexOf(checkpoint.id) == -1)
        nodeBalanceCheckpoints.push(checkpoint.id);
    protocol.networkNodeBalanceCheckpoints = nodeBalanceCheckpoints;
    // Index these changes.
    checkpoint.save();
    if (previousCheckpoint !== null)
        previousCheckpoint.save();
    protocol.save();
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.address);
}
/**
 * Loops through all nodes of the protocol.
 * Create a NodeBalanceCheckpoint
 */
function generateNodeBalanceCheckpoints(nodeIds, networkCheckpoint, blockNumber, blockTime) {
    const networkMetadata = new networkNodeBalanceMetadata_1.NetworkNodeBalanceMetadata();
    // If we don't have any registered nodes at this time, stop.
    if (nodeIds.length === 0)
        return networkMetadata;
    // We will need the rocket node staking contract to get some latest state for the associated node.
    const rocketNodeStakingContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_NODE_STAKING);
    const rocketNodeStakingContract = rocketNodeStaking_1.rocketNodeStaking.bind(graph_ts_1.Address.fromBytes(rocketNodeStakingContractEntity.latestAddress));
    // Loop through all the node id's in the protocol.
    for (let index = 0; index < nodeIds.length; index++) {
        // Determine current node ID.
        const nodeId = nodeIds[index];
        if (nodeId == null)
            continue;
        // Load the indexed node.
        const node = schema_1.Node.load(nodeId);
        if (node === null)
            continue;
        // We'll need this to pass to the rocketnodestaking contract.
        const nodeAddress = graph_ts_1.Address.fromString(node.id);
        // Update the node state that is affected by the update in RPL/ETH price.
        node.effectiveRPLStaked =
            rocketNodeStakingContract.getNodeEffectiveRPLStake(nodeAddress);
        node.minimumEffectiveRPL =
            rocketNodeStakingContract.getNodeMinimumRPLStake(nodeAddress);
        node.maximumEffectiveRPL =
            rocketNodeStakingContract.getNodeMaximumRPLStake(nodeAddress);
        // Update network balance(s) based on this node.
        nodeUtilities_1.nodeUtilities.updateNetworkNodeBalanceCheckpointForNode(networkCheckpoint, node);
        // We need this to calculate the min/max effective RPL needed for the network.
        nodeUtilities_1.nodeUtilities.updateMinipoolMetadataWithNode(networkMetadata.minipoolMetadata, node);
        // We need this to calculate the average RPL claimed rewards on the network level.
        nodeUtilities_1.nodeUtilities.updateRPLMetadataWithNode(networkMetadata.rplMetadata, node);
        // Create a new node balance checkpoint
        const nodeBalanceCheckpoint = entityFactory_1.rocketPoolEntityFactory.createNodeBalanceCheckpoint(networkCheckpoint.id + " - " + node.id, networkCheckpoint.id, node, blockNumber, blockTime);
        if (nodeBalanceCheckpoint == null)
            continue;
        node.lastNodeBalanceCheckpoint = nodeBalanceCheckpoint.id;
        // Index both the updated node & the new node balance checkpoint.
        nodeBalanceCheckpoint.save();
        node.save();
    }
    return networkMetadata;
}
/**
 * Loops through all network node balance checkpoints and determines the new average RPL price.
 */
function setAverageRplEthRatio(protocol, currentCheckpoint) {
    // Preliminary null checks.
    if (protocol === null ||
        currentCheckpoint === null ||
        currentCheckpoint.rplPriceInETH == graph_ts_1.BigInt.fromI32(0))
        return;
    // We will use this to calculate the average RPL/ETH price accross all the network node balance checkpoints.
    let totalRplPriceInEth = graph_ts_1.BigDecimal.fromString("0");
    let totalCheckpointsWithAnRplPriceInETH = graph_ts_1.BigDecimal.fromString("0");
    // Loop through all of the node balance checkpoints up until this time.
    for (let index = 0; index < protocol.networkNodeBalanceCheckpoints.length; index++) {
        // Determine current network node balance checkpoint ID.
        const networkNodeBalanceCheckpointId = (protocol.networkNodeBalanceCheckpoints[index]);
        if (networkNodeBalanceCheckpointId == null)
            continue;
        // Load the indexed network node balance checkpoint.
        const activeIterationCheckpoint = schema_1.NetworkNodeBalanceCheckpoint.load(networkNodeBalanceCheckpointId);
        if (activeIterationCheckpoint === null ||
            activeIterationCheckpoint.rplPriceInETH == graph_ts_1.BigInt.fromI32(0))
            continue;
        // Increment running totals.
        totalCheckpointsWithAnRplPriceInETH =
            totalCheckpointsWithAnRplPriceInETH.plus(graph_ts_1.BigDecimal.fromString("1"));
        totalRplPriceInEth = totalRplPriceInEth.plus(activeIterationCheckpoint.rplPriceInETH.divDecimal(graph_ts_1.BigDecimal.fromString(generalConstants_1.ONE_ETHER_IN_WEI.toString())));
    }
    // Calculate the average rpl/eth price for the current node network balance checkpoint.
    if (totalRplPriceInEth > graph_ts_1.BigDecimal.fromString("0") &&
        totalCheckpointsWithAnRplPriceInETH > graph_ts_1.BigDecimal.fromString("0")) {
        currentCheckpoint.averageRplPriceInETH = graph_ts_1.BigInt.fromString(totalRplPriceInEth
            .div(totalCheckpointsWithAnRplPriceInETH)
            .times(graph_ts_1.BigDecimal.fromString(generalConstants_1.ONE_ETHER_IN_WEI.toString()))
            .truncate(0)
            .toString());
    }
    else {
        /*
         If we didn't succeed in determining the average rpl/eth price from the history,
         then our average price is the current one.
        */
        currentCheckpoint.averageRplPriceInETH = currentCheckpoint.rplPriceInETH;
    }
}
/**
 * Returns the minimum and maximum RPL needed to collateralize a new minipool based on the current smart contract state.
 */
function getEffectiveMinipoolRPLBounds(blockNumber, rplPrice) {
    const effectiveRPLBounds = new effectiveMinipoolRPLBounds_1.EffectiveMinipoolRPLBounds();
    let halfDepositAmount = graph_ts_1.BigInt.fromI32(0);
    let minimumPerMinipoolStake = graph_ts_1.BigInt.fromI32(0);
    let maximumPerMinipoolStake = graph_ts_1.BigInt.fromI32(0);
    // Get the half deposit amount from the DAO Protocol settings minipool contract instance.
    const rocketDAOProtocolSettingsMinipoolContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_DAO_SETTINGS_MINIPOOL);
    const rocketDAOProtocolSettingsMinipoolContract = rocketDAOProtocolSettingsMinipool_1.rocketDAOProtocolSettingsMinipool.bind(graph_ts_1.Address.fromBytes(rocketDAOProtocolSettingsMinipoolContractEntity.latestAddress));
    const launchBalanceCall = rocketDAOProtocolSettingsMinipoolContract.try_getLaunchBalance();
    if (!launchBalanceCall.reverted) {
        halfDepositAmount = launchBalanceCall.value.div(constants_1.BIGINT_TWO);
    }
    // Get the DAO Protocol settings node contract instance.
    const rocketDAOProtocolSettingsNodeContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_DAO_SETTINGS_NODE);
    const rocketDAOProtocolSettingsNodeContract = rocketDAOProtocolSettingsNode_1.rocketDAOProtocolSettingsNode.bind(graph_ts_1.Address.fromBytes(rocketDAOProtocolSettingsNodeContractEntity.latestAddress));
    const minimumPerMinipoolStakeCall = rocketDAOProtocolSettingsNodeContract.try_getMinimumPerMinipoolStake();
    if (!minimumPerMinipoolStakeCall.reverted) {
        minimumPerMinipoolStake = minimumPerMinipoolStakeCall.value;
    }
    const maximumPerMinipoolStakeCall = rocketDAOProtocolSettingsNodeContract.try_getMaximumPerMinipoolStake();
    if (!minimumPerMinipoolStakeCall.reverted) {
        maximumPerMinipoolStake = maximumPerMinipoolStakeCall.value;
    }
    // Determine the minimum and maximum RPL a minipool needs to be collateralized.
    effectiveRPLBounds.minimum = nodeUtilities_1.nodeUtilities.getMinimumRPLForNewMinipool(halfDepositAmount, minimumPerMinipoolStake, rplPrice);
    effectiveRPLBounds.maximum = nodeUtilities_1.nodeUtilities.getMaximumRPLForNewMinipool(halfDepositAmount, maximumPerMinipoolStake, rplPrice);
    return effectiveRPLBounds;
}
