"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rocketPoolEntityFactory = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../generated/schema");
const generalConstants_1 = require("./constants/generalConstants");
class RocketPoolEntityFactory {
    /**
     * Should only every be created once.
     */
    createRocketPoolProtocol() {
        const protocol = new schema_1.RocketPoolProtocol(generalConstants_1.ROCKETPOOL_PROTOCOL_ROOT_ID);
        protocol.activeStakers = new Array(0);
        protocol.stakersWithETHRewards = new Array(0);
        protocol.stakers = new Array(0);
        protocol.lastNetworkStakerBalanceCheckPoint = null;
        protocol.nodes = new Array(0);
        protocol.nodeTimezones = new Array(0);
        protocol.lastRPLRewardInterval = null;
        protocol.lastNetworkNodeBalanceCheckPoint = null;
        protocol.networkNodeBalanceCheckpoints = new Array(0);
        return protocol;
    }
    /**
     * Attempts to create a new RocketETHTransaction.
     */
    createRocketETHTransaction(id, from, to, amount, event) {
        if (id == null ||
            from === null ||
            from.id == null ||
            to === null ||
            to.id == null ||
            event === null ||
            event.block === null ||
            event.transaction === null)
            return null;
        const rocketETHTransaction = new schema_1.RocketETHTransaction(id);
        rocketETHTransaction.from = from.id;
        rocketETHTransaction.amount = amount;
        rocketETHTransaction.to = to.id;
        rocketETHTransaction.block = event.block.number;
        rocketETHTransaction.blockTime = event.block.timestamp;
        rocketETHTransaction.transactionHash = event.transaction.hash;
        return rocketETHTransaction;
    }
    /**
     * Attempts to create a new NetworkStakerBalanceCheckpoint.
     */
    createNetworkStakerBalanceCheckpoint(id, previousCheckpointId, event, stakerETHWaitingInDepositPool, stakerETHInRocketEthContract, rEthExchangeRate) {
        if (id == null ||
            event === null ||
            event.block === null ||
            event.params === null) {
            return null;
        }
        const networkBalance = new schema_1.NetworkStakerBalanceCheckpoint(id);
        networkBalance.previousCheckpointId = previousCheckpointId;
        networkBalance.nextCheckpointId = null;
        networkBalance.stakerETHActivelyStaking = event.params.stakingEth;
        networkBalance.stakerETHWaitingInDepositPool =
            stakerETHWaitingInDepositPool;
        networkBalance.stakerETHInRocketETHContract = stakerETHInRocketEthContract;
        networkBalance.stakerETHInProtocol = event.params.totalEth;
        networkBalance.totalRETHSupply = event.params.rethSupply;
        networkBalance.averageStakerETHRewards = graph_ts_1.BigInt.fromI32(0);
        networkBalance.rETHExchangeRate = rEthExchangeRate;
        networkBalance.block = event.block.number;
        networkBalance.blockTime = event.block.timestamp;
        networkBalance.totalStakersWithETHRewards = graph_ts_1.BigInt.fromI32(0);
        networkBalance.stakersWithAnRETHBalance = graph_ts_1.BigInt.fromI32(0);
        networkBalance.totalStakerETHRewards = graph_ts_1.BigInt.fromI32(0);
        return networkBalance;
    }
    /**
     * Attempts to create a new Staker.
     */
    createStaker(id, blockNumber, blockTime) {
        if (id == null)
            return null;
        const staker = new schema_1.Staker(id);
        staker.rETHBalance = graph_ts_1.BigInt.fromI32(0);
        staker.ethBalance = graph_ts_1.BigInt.fromI32(0);
        staker.totalETHRewards = graph_ts_1.BigInt.fromI32(0);
        staker.lastBalanceCheckpoint = null;
        staker.hasAccruedETHRewardsDuringLifecycle = false;
        staker.block = blockNumber;
        staker.blockTime = blockTime;
        return staker;
    }
    /**
     * Attempts to create a new staker balance checkpoint for the given values.
     */
    createStakerBalanceCheckpoint(id, staker, networkStakerBalanceCheckpoint, ethBalance, rEthBalance, totalETHRewards, blockNumber, blockTime) {
        if (id == null ||
            staker === null ||
            staker.id == null ||
            networkStakerBalanceCheckpoint === null ||
            networkStakerBalanceCheckpoint.id == null)
            return null;
        const stakerBalanceCheckpoint = new schema_1.StakerBalanceCheckpoint(id);
        stakerBalanceCheckpoint.stakerId = staker.id;
        stakerBalanceCheckpoint.networkStakerBalanceCheckpointId =
            networkStakerBalanceCheckpoint.id;
        stakerBalanceCheckpoint.ethBalance = ethBalance;
        stakerBalanceCheckpoint.rETHBalance = rEthBalance;
        stakerBalanceCheckpoint.totalETHRewards = totalETHRewards;
        stakerBalanceCheckpoint.block = blockNumber;
        stakerBalanceCheckpoint.blockTime = blockTime;
        return stakerBalanceCheckpoint;
    }
    /**
     * Attempts to create a node timezone.
     */
    createNodeTimezone(timezoneId) {
        const timezone = new schema_1.NetworkNodeTimezone(timezoneId);
        timezone.totalRegisteredNodes = graph_ts_1.BigInt.fromI32(0);
        return timezone;
    }
    /**
     * Attempts to create a new Node.
     */
    createNode(id, timezoneId, blockNumber, blockTime) {
        if (id == null)
            return null;
        const node = new schema_1.Node(id);
        node.timezone = timezoneId;
        node.isOracleNode = false;
        node.oracleNodeBlockTime = graph_ts_1.BigInt.fromI32(0);
        node.oracleNodeRPLBond = graph_ts_1.BigInt.fromI32(0);
        node.rplStaked = graph_ts_1.BigInt.fromI32(0);
        node.effectiveRPLStaked = graph_ts_1.BigInt.fromI32(0);
        node.minimumEffectiveRPL = graph_ts_1.BigInt.fromI32(0);
        node.maximumEffectiveRPL = graph_ts_1.BigInt.fromI32(0);
        node.totalRPLSlashed = graph_ts_1.BigInt.fromI32(0);
        node.totalODAORewardsClaimed = graph_ts_1.BigInt.fromI32(0);
        node.totalNodeRewardsClaimed = graph_ts_1.BigInt.fromI32(0);
        node.averageODAORewardClaim = graph_ts_1.BigInt.fromI32(0);
        node.averageNodeRewardClaim = graph_ts_1.BigInt.fromI32(0);
        node.odaoRewardClaimCount = graph_ts_1.BigInt.fromI32(0);
        node.nodeRewardClaimCount = graph_ts_1.BigInt.fromI32(0);
        node.queuedMinipools = graph_ts_1.BigInt.fromI32(0);
        node.stakingMinipools = graph_ts_1.BigInt.fromI32(0);
        node.stakingUnbondedMinipools = graph_ts_1.BigInt.fromI32(0);
        node.withdrawableMinipools = graph_ts_1.BigInt.fromI32(0);
        node.totalFinalizedMinipools = graph_ts_1.BigInt.fromI32(0);
        node.averageFeeForActiveMinipools = graph_ts_1.BigInt.fromI32(0);
        node.lastNodeBalanceCheckpoint = null;
        node.minipools = new Array(0);
        node.block = blockNumber;
        node.blockTime = blockTime;
        return node;
    }
    /**
     * Attempts to create a new Node RPL Transaction.
     */
    createNodeRPLStakeTransaction(id, nodeId, amount, ethAmount, type, blockNumber, blockTime) {
        if (id == null)
            return null;
        const transaction = new schema_1.NodeRPLStakeTransaction(id);
        transaction.node = nodeId;
        transaction.amount = amount;
        transaction.ethAmount = ethAmount;
        transaction.type = type;
        transaction.block = blockNumber;
        transaction.blockTime = blockTime;
        return transaction;
    }
    /**
     * Attempts to create a new RPL Reward Interval.
     */
    createRPLRewardInterval(id, previousIntervalId, claimableRewards, claimablePDAORewards, claimableODAORewards, claimableNodeRewards, claimableRewardsFromPreviousInterval, intervalStartTime, intervalDuration, blockNumber, blockTime) {
        if (id == null)
            return null;
        const rewardInterval = new schema_1.RPLRewardInterval(id);
        rewardInterval.previousIntervalId = previousIntervalId;
        rewardInterval.nextIntervalId = null;
        rewardInterval.claimableRewards = claimableRewards;
        rewardInterval.claimablePDAORewards = claimablePDAORewards;
        rewardInterval.claimableODAORewards = claimableODAORewards;
        rewardInterval.claimableNodeRewards = claimableNodeRewards;
        rewardInterval.claimableRewardsFromPreviousInterval =
            claimableRewardsFromPreviousInterval < graph_ts_1.BigInt.fromI32(0)
                ? graph_ts_1.BigInt.fromI32(0)
                : claimableRewardsFromPreviousInterval;
        rewardInterval.totalRPLClaimed = graph_ts_1.BigInt.fromI32(0);
        rewardInterval.totalPDAORewardsClaimed = graph_ts_1.BigInt.fromI32(0);
        rewardInterval.totalODAORewardsClaimed = graph_ts_1.BigInt.fromI32(0);
        rewardInterval.totalNodeRewardsClaimed = graph_ts_1.BigInt.fromI32(0);
        rewardInterval.averageODAORewardClaim = graph_ts_1.BigInt.fromI32(0);
        rewardInterval.averageNodeRewardClaim = graph_ts_1.BigInt.fromI32(0);
        rewardInterval.odaoRewardClaimCount = graph_ts_1.BigInt.fromI32(0);
        rewardInterval.nodeRewardClaimCount = graph_ts_1.BigInt.fromI32(0);
        rewardInterval.rplRewardClaims = new Array(0);
        rewardInterval.isClosed = false;
        rewardInterval.intervalStartTime = intervalStartTime;
        rewardInterval.intervalClosedTime = null;
        rewardInterval.intervalDuration = intervalDuration;
        rewardInterval.intervalDurationActual = null;
        rewardInterval.block = blockNumber;
        rewardInterval.blockTime = blockTime;
        return rewardInterval;
    }
    /**
     * Attempts to create a new RPL Reward Claim.
     */
    createRPLRewardClaim(id, rplRewardIntervalId, claimer, claimerType, amount, ethAmount, transactionHash, blockNumber, blockTime) {
        if (id == null ||
            rplRewardIntervalId == null ||
            claimer == null ||
            claimerType == null ||
            transactionHash == null ||
            amount == graph_ts_1.BigInt.fromI32(0) ||
            ethAmount == graph_ts_1.BigInt.fromI32(0))
            return null;
        const rewardInterval = new schema_1.RPLRewardClaim(id);
        rewardInterval.rplRewardIntervalId = rplRewardIntervalId;
        rewardInterval.claimer = claimer;
        rewardInterval.claimerType = claimerType;
        rewardInterval.amount = amount;
        rewardInterval.ethAmount = ethAmount;
        rewardInterval.transactionHash = transactionHash;
        rewardInterval.block = blockNumber;
        rewardInterval.blockTime = blockTime;
        return rewardInterval;
    }
    /**
     * Attempts to create a new Network Node Balance Checkpoint.
     */
    createNetworkNodeBalanceCheckpoint(id, previousCheckpointId, minimumEffectiveRPLNewMinipool, maximumEffectiveRPLNewMinipool, newRplPriceInETH, newMinipoolFee, blockNumber, blockTime) {
        if (id == null || newRplPriceInETH == graph_ts_1.BigInt.fromI32(0))
            return null;
        const checkpoint = new schema_1.NetworkNodeBalanceCheckpoint(id);
        checkpoint.previousCheckpointId = previousCheckpointId;
        checkpoint.nextCheckpointId = null;
        checkpoint.nodesRegistered = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.oracleNodesRegistered = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.rplStaked = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.effectiveRPLStaked = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.minimumEffectiveRPLNewMinipool = minimumEffectiveRPLNewMinipool;
        checkpoint.maximumEffectiveRPLNewMinipool = maximumEffectiveRPLNewMinipool;
        checkpoint.minimumEffectiveRPL = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.maximumEffectiveRPL = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.totalRPLSlashed = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.totalODAORewardsClaimed = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.totalNodeRewardsClaimed = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.averageTotalODAORewardsClaimed = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.averageODAORewardClaim = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.averageNodeTotalRewardsClaimed = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.averageNodeRewardClaim = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.rplPriceInETH = newRplPriceInETH; // From the associated price update.
        checkpoint.averageRplPriceInETH = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.queuedMinipools = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.stakingMinipools = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.stakingUnbondedMinipools = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.withdrawableMinipools = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.totalFinalizedMinipools = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.averageFeeForActiveMinipools = graph_ts_1.BigInt.fromI32(0); // Will be calculated.
        checkpoint.newMinipoolFee = newMinipoolFee;
        checkpoint.block = blockNumber;
        checkpoint.blockTime = blockTime;
        return checkpoint;
    }
    /**
     * Attempts to create a new Node Balance Checkpoint.
     */
    createNodeBalanceCheckpoint(id, networkCheckpointId, node, blockNumber, blockTime) {
        if (id == null)
            return null;
        const checkpoint = new schema_1.NodeBalanceCheckpoint(id);
        checkpoint.NetworkNodeBalanceCheckpoint = networkCheckpointId;
        checkpoint.Node = node.id;
        checkpoint.isOracleNode = node.isOracleNode;
        checkpoint.oracleNodeRPLBond = node.oracleNodeRPLBond;
        checkpoint.oracleNodeBlockTime = node.oracleNodeBlockTime;
        checkpoint.rplStaked = node.rplStaked;
        checkpoint.effectiveRPLStaked = node.effectiveRPLStaked;
        checkpoint.minimumEffectiveRPL = node.minimumEffectiveRPL;
        checkpoint.maximumEffectiveRPL = node.maximumEffectiveRPL;
        checkpoint.totalRPLSlashed = node.totalRPLSlashed;
        checkpoint.totalODAORewardsClaimed = node.totalODAORewardsClaimed;
        checkpoint.totalNodeRewardsClaimed = node.totalNodeRewardsClaimed;
        checkpoint.averageODAORewardClaim = node.averageODAORewardClaim;
        checkpoint.averageNodeRewardClaim = node.averageNodeRewardClaim;
        checkpoint.odaoRewardClaimCount = node.odaoRewardClaimCount;
        checkpoint.nodeRewardClaimCount = node.nodeRewardClaimCount;
        checkpoint.queuedMinipools = node.queuedMinipools;
        checkpoint.stakingMinipools = node.stakingMinipools;
        checkpoint.stakingUnbondedMinipools = node.stakingUnbondedMinipools;
        checkpoint.withdrawableMinipools = node.withdrawableMinipools;
        checkpoint.totalFinalizedMinipools = node.totalFinalizedMinipools;
        checkpoint.averageFeeForActiveMinipools = node.averageFeeForActiveMinipools;
        checkpoint.block = blockNumber;
        checkpoint.blockTime = blockTime;
        return checkpoint;
    }
    /**
     * Attempts to create a new minipool.
     */
    createMinipool(id, node, fee) {
        const minipool = new schema_1.Minipool(id);
        minipool.node = node.id;
        minipool.fee = fee;
        minipool.nodeDepositETHAmount = graph_ts_1.BigInt.fromI32(0);
        minipool.nodeDepositBlockTime = graph_ts_1.BigInt.fromI32(0);
        minipool.userDepositETHAmount = graph_ts_1.BigInt.fromI32(0);
        minipool.userDepositBlockTime = graph_ts_1.BigInt.fromI32(0);
        minipool.queuedBlockTime = graph_ts_1.BigInt.fromI32(0);
        minipool.dequeuedBlockTime = graph_ts_1.BigInt.fromI32(0);
        minipool.destroyedBlockTime = graph_ts_1.BigInt.fromI32(0);
        minipool.stakingBlockTime = graph_ts_1.BigInt.fromI32(0);
        minipool.withdrawableBlockTime = graph_ts_1.BigInt.fromI32(0);
        minipool.finalizedBlockTime = graph_ts_1.BigInt.fromI32(0);
        return minipool;
    }
}
exports.rocketPoolEntityFactory = new RocketPoolEntityFactory();
