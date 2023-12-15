"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChallengeDecided = exports.handleOracleNodeKicked = exports.handleOracleNodeLeft = exports.handleOracleNodeJoined = void 0;
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const usageMetrics_1 = require("../updaters/usageMetrics");
/**
 * Occurs when a node operator has put up an RPL bond, a consensus is reached and he gets voted in as an ODAO member.
 */
function handleOracleNodeJoined(event) {
    if (event === null ||
        event.params === null ||
        event.params.nodeAddress === null)
        return;
    updateOracleNodeState(event.params.nodeAddress, event.params.rplBondAmount, true, event.params.time);
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.address);
}
exports.handleOracleNodeJoined = handleOracleNodeJoined;
/**
 * Occurs when a node operator voluntarily leaves the ODAO.
 */
function handleOracleNodeLeft(event) {
    if (event === null ||
        event.params === null ||
        event.params.nodeAddress === null)
        return;
    updateOracleNodeState(event.params.nodeAddress, graph_ts_1.BigInt.fromI32(0), false, event.params.time);
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.address);
}
exports.handleOracleNodeLeft = handleOracleNodeLeft;
/**
 * Occurs when a node operator is forced out of the ODAO.
 */
function handleOracleNodeKicked(event) {
    if (event === null ||
        event.params === null ||
        event.params.nodeAddress === null)
        return;
    updateOracleNodeState(event.params.nodeAddress, graph_ts_1.BigInt.fromI32(0), false, event.params.time);
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.address);
}
exports.handleOracleNodeKicked = handleOracleNodeKicked;
/**
 * Occurs when an ODAO is inactive for a large amount of time and an ODAO is challenged by other ODAO members.
 */
function handleChallengeDecided(event) {
    if (event === null ||
        event.params === null ||
        event.params.nodeChallengedAddress === null)
        return;
    if (event.params.success) {
        updateOracleNodeState(event.params.nodeChallengedAddress, graph_ts_1.BigInt.fromI32(0), false, event.params.time);
    }
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.address);
}
exports.handleChallengeDecided = handleChallengeDecided;
/**
 * Helper method that encapsulates the loading of a node, setting its ODAO state and indexing.
 */
function updateOracleNodeState(nodeAddress, rplBondAmount, isOracleNode, blockTime) {
    // Load the associated node. It has to exist.
    const node = schema_1.Node.load(nodeAddress.toHexString());
    if (node === null)
        return;
    // Update the node state and index it.
    node.isOracleNode = isOracleNode;
    if (isOracleNode) {
        node.oracleNodeRPLBond = rplBondAmount;
    }
    else {
        node.oracleNodeRPLBond = graph_ts_1.BigInt.fromI32(0);
    }
    node.oracleNodeBlockTime = blockTime;
    node.save();
}
