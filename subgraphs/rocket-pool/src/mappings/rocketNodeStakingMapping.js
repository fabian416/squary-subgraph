"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRPLWithdrawn = exports.handleRPLSlashed = exports.handleRPLStaked = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const rocketNetworkPrices_1 = require("../../generated/templates/rocketNodeStaking/rocketNetworkPrices");
const rocketNodeStaking_1 = require("../../generated/templates/rocketNodeStaking/rocketNodeStaking");
const generalConstants_1 = require("../constants/generalConstants");
const contractConstants_1 = require("../constants/contractConstants");
const enumConstants_1 = require("../constants/enumConstants");
const schema_1 = require("../../generated/schema");
const generalUtilities_1 = require("../checkpoints/generalUtilities");
const entityFactory_1 = require("../entityFactory");
const usageMetrics_1 = require("../updaters/usageMetrics");
const rocketContracts_1 = require("../entities/rocketContracts");
/**
 * Occurs when a node operator stakes RPL on his node to collaterize his minipools.
 */
function handleRPLStaked(event) {
    if (event === null || event.params === null || event.params.from === null)
        return;
    saveNodeRPLStakeTransaction(event, event.params.from.toHexString(), enumConstants_1.NODERPLSTAKETRANSACTIONTYPE_STAKED, event.params.amount);
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.params.from);
}
exports.handleRPLStaked = handleRPLStaked;
/**
 * Occurs when RPL is slashed to cover staker losses.
 */
function handleRPLSlashed(event) {
    if (event === null || event.params === null || event.params.node === null)
        return;
    saveNodeRPLStakeTransaction(event, event.params.node.toHexString(), enumConstants_1.NODERPLSTAKETRANSACTIONTYPE_SLASHED, event.params.amount);
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.params.node);
}
exports.handleRPLSlashed = handleRPLSlashed;
/**
 * Occurs when a node operator withdraws RPL from his node.
 */
function handleRPLWithdrawn(event) {
    if (event === null || event.params === null || event.params.to === null)
        return;
    saveNodeRPLStakeTransaction(event, event.params.to.toHexString(), enumConstants_1.NODERPLSTAKETRANSACTIONTYPE_WITHDRAWAL, event.params.amount);
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.params.to);
}
exports.handleRPLWithdrawn = handleRPLWithdrawn;
/**
 * Save a new RPL stake transaction.
 */
function saveNodeRPLStakeTransaction(event, nodeId, transactionType, amount) {
    // This state has to be valid before we can actually do anything.
    if (event === null ||
        event.block === null ||
        nodeId == null ||
        transactionType == null ||
        amount === graph_ts_1.BigInt.fromI32(0))
        return;
    // We can only handle an Node RPL transaction if the node exists.
    const node = schema_1.Node.load(nodeId);
    if (node === null)
        return;
    // Load the storage contract because we need to get the rETH contract address. (and some of its state)
    const rocketNetworkPricesContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_NETWORK_PRICES);
    const rocketNetworkPricesContract = rocketNetworkPrices_1.rocketNetworkPrices.bind(graph_ts_1.Address.fromBytes(rocketNetworkPricesContractEntity.latestAddress));
    // Calculate the ETH amount at the time of the transaction.
    const rplPriceCall = rocketNetworkPricesContract.try_getRPLPrice();
    if (rplPriceCall.reverted)
        return;
    const rplETHExchangeRate = rplPriceCall.value;
    const ethAmount = amount.times(rplETHExchangeRate).div(generalConstants_1.ONE_ETHER_IN_WEI);
    // Create a new transaction for the given values.
    const nodeRPLStakeTransaction = entityFactory_1.rocketPoolEntityFactory.createNodeRPLStakeTransaction(generalUtilities_1.generalUtilities.extractIdForEntity(event), nodeId, amount, ethAmount, transactionType, event.block.number, event.block.timestamp);
    if (nodeRPLStakeTransaction === null)
        return;
    // Update node RPL balances & index those changes.
    updateNodeRPLBalances(node, amount, transactionType);
    // Index
    nodeRPLStakeTransaction.save();
    node.save();
}
/**
 * After a transaction, the node RPL staking state must be brought up to date.
 */
function updateNodeRPLBalances(node, amount, transactionType) {
    // We will need the rocket node staking contract to get some latest state for the associated node.
    const rocketNodeStakingContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_NODE_STAKING);
    const rocketNodeStakingContract = rocketNodeStaking_1.rocketNodeStaking.bind(graph_ts_1.Address.fromBytes(rocketNodeStakingContractEntity.latestAddress));
    const nodeAddress = graph_ts_1.Address.fromString(node.id);
    const nodeRPLStakeCall = rocketNodeStakingContract.try_getNodeRPLStake(nodeAddress);
    if (nodeRPLStakeCall.reverted)
        return;
    node.rplStaked = nodeRPLStakeCall.value;
    const nodeEffectiveRPLStakeCall = rocketNodeStakingContract.try_getNodeEffectiveRPLStake(nodeAddress);
    if (nodeEffectiveRPLStakeCall.reverted)
        return;
    node.effectiveRPLStaked = nodeEffectiveRPLStakeCall.value;
    // This isn't accessible via smart contracts, so we have to keep track manually.
    if (transactionType == enumConstants_1.NODERPLSTAKETRANSACTIONTYPE_SLASHED &&
        amount > graph_ts_1.BigInt.fromI32(0)) {
        node.totalRPLSlashed = node.totalRPLSlashed.plus(amount);
    }
}
