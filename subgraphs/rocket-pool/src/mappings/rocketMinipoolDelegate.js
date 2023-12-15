"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMinipoolWithdrawableStatus = exports.handleMinipoolStakingStatus = exports.handleEtherDeposited = exports.handleStatusUpdated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const enumConstants_1 = require("../constants/enumConstants");
const contractConstants_1 = require("../constants/contractConstants");
const usageMetrics_1 = require("../updaters/usageMetrics");
const rocketContracts_1 = require("../entities/rocketContracts");
/**
 * Occurs when a node operator makes an ETH deposit on his node to create a minipool.
 */
function handleStatusUpdated(event) {
    // Preliminary null checks.
    if (event === null || event.address === null || event.block === null)
        return;
    // There must be an existing minipool with the same address.
    const minipool = schema_1.Minipool.load(event.address.toHexString());
    if (minipool === null || minipool.node == null)
        return;
    // Retrieve the parent node. It has to exist.
    const node = schema_1.Node.load(minipool.node);
    if (node === null)
        return;
    // Handle the status.
    if (event.params.status == enumConstants_1.MINIPOOLSTATUS_STAKING)
        handleMinipoolStakingStatus(node, minipool, event.block.timestamp);
    else if (event.params.status == enumConstants_1.MINIPOOLSTATUS_WITHDRAWABLE)
        handleMinipoolWithdrawableStatus(node, minipool, event.block.timestamp);
    // Index the minipool and the associated node.
    minipool.save();
    node.save();
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.address);
}
exports.handleStatusUpdated = handleStatusUpdated;
/**
 * Occurs when a minipool receives an ETH deposit either from a node operator or the deposit pool.
 */
function handleEtherDeposited(event) {
    // Preliminary null checks.
    if (event === null ||
        event.params === null ||
        event.address === null ||
        event.block === null)
        return;
    // There must be an existing minipool with the same address.
    const minipool = schema_1.Minipool.load(event.address.toHexString());
    if (minipool === null)
        return;
    // Get the address of the rocket node deposit contract.
    // Check if the deposit came from a node.
    const nodeDepositContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_NODE_DEPOSIT);
    if (nodeDepositContractEntity.allAddresses.includes(event.params.from)) {
        // The deposit came from a node and is a 'node' deposit.
        minipool.nodeDepositBlockTime = event.block.timestamp;
        minipool.nodeDepositETHAmount = event.params.amount;
    }
    else {
        // The deposit came from the deposit pool and is a 'user' deposit.
        minipool.userDepositBlockTime = event.block.timestamp;
        minipool.userDepositETHAmount = event.params.amount;
    }
    // Index the minipool changes.
    minipool.save();
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.address);
}
exports.handleEtherDeposited = handleEtherDeposited;
/**
 * Handle the change of state to 'Staking' for a minipool.
 */
function handleMinipoolStakingStatus(node, minipool, blockTimeStamp) {
    if (minipool.stakingBlockTime == graph_ts_1.BigInt.fromI32(0)) {
        // Update the staking start time of this minipool.
        minipool.stakingBlockTime = blockTimeStamp;
        node.stakingMinipools = node.stakingMinipools.plus(graph_ts_1.BigInt.fromI32(1));
        // If we transition to staking and have a 0 node deposit amount, then
        // we can be sure that this is an unbonded minipool.
        if (minipool.nodeDepositETHAmount == graph_ts_1.BigInt.fromI32(0) &&
            minipool.userDepositETHAmount > graph_ts_1.BigInt.fromI32(0)) {
            node.stakingUnbondedMinipools = node.stakingUnbondedMinipools.plus(graph_ts_1.BigInt.fromI32(1));
        }
    }
}
exports.handleMinipoolStakingStatus = handleMinipoolStakingStatus;
/**
 * Handle the change of state to 'Withdrawable' for a minipool.
 */
function handleMinipoolWithdrawableStatus(node, minipool, blockTimeStamp) {
    if (minipool.withdrawableBlockTime == graph_ts_1.BigInt.fromI32(0)) {
        // Update the withdrawal block time and the total withdrawable minipool counter of this minipool.
        minipool.withdrawableBlockTime = blockTimeStamp;
        node.withdrawableMinipools = node.withdrawableMinipools.plus(graph_ts_1.BigInt.fromI32(1));
        // Decrement the number of staking minipools for the node.
        node.stakingMinipools = node.stakingMinipools.minus(graph_ts_1.BigInt.fromI32(1));
        if (node.stakingMinipools < graph_ts_1.BigInt.fromI32(0))
            node.stakingMinipools = graph_ts_1.BigInt.fromI32(0);
        // If we transition to withdrawable and have a 0 node deposit amount, then
        // we can be sure that this is an unbonded minipool.
        if (minipool.nodeDepositETHAmount == graph_ts_1.BigInt.fromI32(0) &&
            minipool.userDepositETHAmount > graph_ts_1.BigInt.fromI32(0) &&
            node.stakingUnbondedMinipools > graph_ts_1.BigInt.fromI32(0)) {
            node.stakingUnbondedMinipools = node.stakingUnbondedMinipools.minus(graph_ts_1.BigInt.fromI32(1));
        }
    }
}
exports.handleMinipoolWithdrawableStatus = handleMinipoolWithdrawableStatus;
