"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNodeTimezoneChanged = exports.handleNodeRegister = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const generalUtilities_1 = require("../checkpoints/generalUtilities");
const entityFactory_1 = require("../entityFactory");
const schema_1 = require("../../generated/schema");
const rocketNodeManager_1 = require("../../generated/templates/rocketNodeManager/rocketNodeManager");
const usageMetrics_1 = require("../updaters/usageMetrics");
/**
 * Occurs when a node operator registers his address with the RocketPool protocol.
 */
function handleNodeRegister(event) {
    // Preliminary null checks.
    if (event === null || event.params === null || event.params.node === null)
        return;
    // We can only register an address as a node if it hasn't been registered yet.
    let node = schema_1.Node.load(event.params.node.toHex());
    if (node !== null)
        return;
    // Retrieve the associated timezone, if the timezone doesn't exist yet, we need to create it.
    const nodeTimezoneStringId = getNodeTimezoneId(event.params.node.toHex(), event.address);
    let nodeTimezone = schema_1.NetworkNodeTimezone.load(nodeTimezoneStringId);
    if (nodeTimezone === null || nodeTimezone.id == null) {
        nodeTimezone =
            entityFactory_1.rocketPoolEntityFactory.createNodeTimezone(nodeTimezoneStringId);
        nodeTimezone.block = event.block.number;
        nodeTimezone.blockTime = event.block.timestamp;
    }
    // Increment the total registered nodes for this timezone.
    nodeTimezone.totalRegisteredNodes = nodeTimezone.totalRegisteredNodes.plus(graph_ts_1.BigInt.fromI32(1));
    // Create the node for this timezone and index it.
    node = entityFactory_1.rocketPoolEntityFactory.createNode(event.params.node.toHexString(), nodeTimezone.id, event.block.number, event.block.timestamp);
    if (node === null)
        return;
    // Protocol entity should exist, if not, then we attempt to create it.
    let protocol = generalUtilities_1.generalUtilities.getRocketPoolProtocolEntity();
    if (protocol === null || protocol.id == null) {
        protocol = entityFactory_1.rocketPoolEntityFactory.createRocketPoolProtocol();
    }
    // Add this node to the collection of the protocol if necessary and index.
    const protocolNodes = protocol.nodes;
    if (protocol.nodes.indexOf(node.id) == -1)
        protocolNodes.push(node.id);
    protocol.nodes = protocolNodes;
    // Index changes.
    node.save();
    nodeTimezone.save();
    protocol.save();
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.params.node);
}
exports.handleNodeRegister = handleNodeRegister;
/**
 * Occurs when a node operator changes his timzone in the RocketPool protocol.
 */
function handleNodeTimezoneChanged(event) {
    if (event === null || event.params === null || event.params.node === null)
        return;
    // The node in question has to exist before we can change its timezone.
    const node = schema_1.Node.load(event.params.node.toHexString());
    if (node === null)
        return;
    let oldNodeTimezone = null;
    // Decrement the total registered nodes for the old timezone.
    if (node.timezone != null) {
        oldNodeTimezone = schema_1.NetworkNodeTimezone.load(node.timezone);
        if (oldNodeTimezone !== null) {
            oldNodeTimezone.totalRegisteredNodes =
                oldNodeTimezone.totalRegisteredNodes.minus(graph_ts_1.BigInt.fromI32(1));
            if (oldNodeTimezone.totalRegisteredNodes < graph_ts_1.BigInt.fromI32(0)) {
                oldNodeTimezone.totalRegisteredNodes = graph_ts_1.BigInt.fromI32(0);
            }
        }
    }
    // If the newly set timezone doesn't exist yet, we need to create it.
    const newNodeTimezoneId = getNodeTimezoneId(event.params.node.toHex(), event.address);
    let newNodeTimezone = null;
    if (newNodeTimezoneId != null) {
        newNodeTimezone = schema_1.NetworkNodeTimezone.load(newNodeTimezoneId);
        if (newNodeTimezone === null || newNodeTimezone.id == null) {
            newNodeTimezone =
                entityFactory_1.rocketPoolEntityFactory.createNodeTimezone(newNodeTimezoneId);
            newNodeTimezone.block = event.block.number;
            newNodeTimezone.blockTime = event.block.timestamp;
        }
        // Increment the total registered nodes for the new timezone and index.
        newNodeTimezone.totalRegisteredNodes =
            newNodeTimezone.totalRegisteredNodes.plus(graph_ts_1.BigInt.fromI32(1));
    }
    if (oldNodeTimezone !== null)
        oldNodeTimezone.save();
    if (newNodeTimezone !== null)
        newNodeTimezone.save();
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.params.node);
}
exports.handleNodeTimezoneChanged = handleNodeTimezoneChanged;
/**
 * Returns the node timezone identifier based on what was in the smart contracts.
 */
function getNodeTimezoneId(nodeAddress, nodeManagerContractAddress) {
    let nodeTimezoneStringId = "UNKNOWN";
    const rocketNodeManagerContract = rocketNodeManager_1.rocketNodeManager.bind(nodeManagerContractAddress);
    const nodeTimezoneLocationCall = rocketNodeManagerContract.try_getNodeTimezoneLocation(graph_ts_1.Address.fromString(nodeAddress));
    if (!nodeTimezoneLocationCall.reverted)
        nodeTimezoneStringId = nodeTimezoneLocationCall.value;
    return nodeTimezoneStringId;
}
