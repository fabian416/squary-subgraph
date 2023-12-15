"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleETHDistributed = exports.handleTransfer = exports.handleSubmit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const NodeOperatorsRegistry_1 = require("../../generated/Lido/NodeOperatorsRegistry");
const token_1 = require("../entities/token");
const usageMetrics_1 = require("../entityUpdates/usageMetrics");
const financialMetrics_1 = require("../entityUpdates/financialMetrics");
const constants_1 = require("../utils/constants");
const pool_1 = require("../entities/pool");
const Lido_1 = require("../../generated/Lido/Lido");
function handleSubmit(event) {
    // update Token lastPrice and lastBlock
    (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS), event.block.number);
    (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.PROTOCOL_ID), event.block.number);
    const lido = Lido_1.Lido.bind(event.address);
    const supply = lido.totalSupply();
    const pool = (0, pool_1.getOrCreatePool)(event.block.number, event.block.timestamp);
    pool.outputTokenSupply = supply;
    pool.save();
    // update metrics
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.params.sender);
    (0, financialMetrics_1.updateProtocolAndPoolTvl)(event.block, event.params.amount);
}
exports.handleSubmit = handleSubmit;
// handleTransfer is used to track minting of new shares.
// From here we calculate protocol side revenue.
function handleTransfer(event) {
    const sender = event.params.from;
    const recipient = event.params.to;
    const value = event.params.value;
    if (sender.toHexString() != constants_1.ZERO_ADDRESS) {
        return;
    }
    const receipt = event.receipt;
    if (!receipt)
        return;
    const logs = event.receipt.logs;
    if (!logs)
        return;
    const execute_signature = graph_ts_1.crypto.keccak256(graph_ts_1.ByteArray.fromUTF8("Execute(address,address,uint256,bytes)"));
    for (let i = 0; i < logs.length; i++) {
        const thisLog = logs.at(i);
        if (thisLog.topics.length < constants_1.INT_THREE)
            continue;
        const topic_signature = thisLog.topics.at(constants_1.INT_ZERO);
        const topic_target = graph_ts_1.ethereum
            .decode("address", thisLog.topics.at(constants_1.INT_TWO))
            .toAddress();
        if (topic_signature.equals(execute_signature) &&
            topic_target.equals(graph_ts_1.Address.fromString(constants_1.PROTOCOL_ID))) {
            graph_ts_1.log.info("[handleTransfer] Aragon voting. Skipping tx: {} for counting in protocol's revenue.", [event.transaction.hash.toHexString()]);
            return;
        }
    }
    // update Token lastPrice and lastBlock
    (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS), event.block.number);
    (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.PROTOCOL_ID), event.block.number);
    const fromZeros = sender == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS);
    const isMintToTreasury = fromZeros && recipient == graph_ts_1.Address.fromString(constants_1.PROTOCOL_TREASURY_ID);
    let isMintToNodeOperators = false;
    if (event.block.number < constants_1.LIDO_V2_UPGRADE_BLOCK) {
        // get node operators
        let nodeOperators = [];
        const nodeOperatorsRegistry = NodeOperatorsRegistry_1.NodeOperatorsRegistry.bind(graph_ts_1.Address.fromString(constants_1.PROTOCOL_NODE_OPERATORS_REGISTRY_ID));
        const getRewardsDistributionCallResult = nodeOperatorsRegistry.try_getRewardsDistribution(constants_1.BIGINT_ZERO);
        if (getRewardsDistributionCallResult.reverted) {
            graph_ts_1.log.info("NodeOperatorsRegistry call reverted", []);
        }
        else {
            nodeOperators = getRewardsDistributionCallResult.value.getRecipients();
        }
        isMintToNodeOperators =
            fromZeros && nodeOperators.includes(recipient);
    }
    else {
        isMintToNodeOperators =
            fromZeros &&
                recipient == graph_ts_1.Address.fromString(constants_1.PROTOCOL_NODE_OPERATORS_REGISTRY_ID);
    }
    // update metrics
    if (isMintToTreasury || isMintToNodeOperators) {
        (0, financialMetrics_1.updateProtocolSideRevenueMetrics)(event.block, value);
        (0, financialMetrics_1.updateSupplySideRevenueMetrics)(event.block);
        (0, financialMetrics_1.updateProtocolAndPoolTvl)(event.block, constants_1.BIGINT_ZERO);
    }
}
exports.handleTransfer = handleTransfer;
function handleETHDistributed(event) {
    if (event.block.number < constants_1.LIDO_V2_UPGRADE_BLOCK) {
        return;
    }
    // Don’t mint/distribute any protocol fee on the non-profitable Lido oracle report
    // (when beacon chain balance delta is zero or negative).
    // See ADR #3 for details: https://research.lido.fi/t/rewards-distribution-after-the-merge-architecture-decision-record/1535
    const postCLTotalBalance = event.params.postCLBalance.plus(event.params.withdrawalsWithdrawn);
    if (postCLTotalBalance <= event.params.preCLBalance) {
        return;
    }
    const totalRewards = postCLTotalBalance
        .minus(event.params.preCLBalance)
        .plus(event.params.executionLayerRewardsWithdrawn);
    const lido = Lido_1.Lido.bind(graph_ts_1.Address.fromString(constants_1.PROTOCOL_ID));
    const supply = lido.totalSupply();
    (0, financialMetrics_1.updateTotalRevenueMetrics)(event.block, totalRewards, supply);
    (0, financialMetrics_1.updateSupplySideRevenueMetrics)(event.block);
    (0, financialMetrics_1.updateProtocolAndPoolTvl)(event.block, constants_1.BIGINT_ZERO);
}
exports.handleETHDistributed = handleETHDistributed;
