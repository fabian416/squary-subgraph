"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMinipoolDequeued = exports.handleMinipoolEnqueued = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const usageMetrics_1 = require("../updaters/usageMetrics");
/**
 * Occurs when a node operator makes an ETH deposit on his node to create a minipool.
 */
function handleMinipoolEnqueued(event) {
    // Preliminary null checks.
    if (event === null ||
        event.params === null ||
        event.params.minipool === null ||
        event.block === null)
        return;
    // There must be a minipool that was created, otherwise stop.
    const minipool = schema_1.Minipool.load(event.params.minipool.toHexString());
    if (minipool === null || minipool.node == null)
        return;
    // Retrieve the parent node. It has to exist.
    const node = schema_1.Node.load(minipool.node);
    if (node === null)
        return;
    // Update the time this minipool was queued.
    minipool.queuedBlockTime = event.block.timestamp;
    // Update the metadata on the node level.
    node.queuedMinipools = node.queuedMinipools.plus(graph_ts_1.BigInt.fromI32(1));
    // Index the minipool and the associated node.
    minipool.save();
    node.save();
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.address);
}
exports.handleMinipoolEnqueued = handleMinipoolEnqueued;
/**
 * Occurs when a minipool is assigned a user deposit or when a node operator dissolves a minipool before it receives a user deposit.
 */
function handleMinipoolDequeued(event) {
    // Preliminary null checks.
    if (event === null ||
        event.params === null ||
        event.params.minipool === null ||
        event.block === null)
        return;
    // There must be a minipool that was created, otherwise stop.
    const minipool = schema_1.Minipool.load(event.params.minipool.toHexString());
    if (minipool === null || minipool.node == null)
        return;
    // Retrieve the parent node. It has to exist.
    const node = schema_1.Node.load(minipool.node);
    if (node === null)
        return;
    // Update the time this minipool was dequeued.
    minipool.dequeuedBlockTime = event.block.timestamp;
    // Update the metadata on the node level.
    node.queuedMinipools = node.queuedMinipools.minus(graph_ts_1.BigInt.fromI32(1));
    if (node.queuedMinipools < graph_ts_1.BigInt.fromI32(0))
        node.queuedMinipools = graph_ts_1.BigInt.fromI32(0);
    // Index the minipool and the associated node.
    minipool.save();
    node.save();
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.address);
}
exports.handleMinipoolDequeued = handleMinipoolDequeued;
