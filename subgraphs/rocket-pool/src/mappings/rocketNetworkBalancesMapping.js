"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBalancesUpdated = void 0;
const rocketTokenRETH_1 = require("../../generated/templates/rocketNetworkBalances/rocketTokenRETH");
const rocketDepositPool_1 = require("../../generated/templates/rocketNetworkBalances/rocketDepositPool");
const rocketVault_1 = require("../../generated/templates/rocketNetworkBalances/rocketVault");
const rocketNodeStaking_1 = require("../../generated/templates/rocketNetworkBalances/rocketNodeStaking");
const schema_1 = require("../../generated/schema");
const generalUtilities_1 = require("../checkpoints/generalUtilities");
const stakerUtilities_1 = require("../checkpoints/stakerUtilities");
const entityFactory_1 = require("../entityFactory");
const contractConstants_1 = require("../constants/contractConstants");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const protocol_1 = require("../entities/protocol");
const pool_1 = require("../entities/pool");
const usageMetrics_1 = require("../updaters/usageMetrics");
const financialMetrics_1 = require("../updaters/financialMetrics");
const numbers_1 = require("../utils/numbers");
const constants_1 = require("../utils/constants");
const rocketContracts_1 = require("../entities/rocketContracts");
/**
 * When enough ODAO members votes on a balance and a consensus threshold is reached, the staker beacon chain state is persisted to the smart contracts.
 */
function handleBalancesUpdated(event) {
    // Protocol entity should exist, if not, then we attempt to create it.
    let protocol = generalUtilities_1.generalUtilities.getRocketPoolProtocolEntity();
    if (protocol === null || protocol.id == null) {
        protocol = entityFactory_1.rocketPoolEntityFactory.createRocketPoolProtocol();
    }
    if (protocol === null)
        return;
    (0, protocol_1.getOrCreateProtocol)();
    (0, pool_1.getOrCreatePool)(event.block.number, event.block.timestamp);
    // Preliminary check to ensure we haven't handled this before.
    if (stakerUtilities_1.stakerUtilities.hasNetworkStakerBalanceCheckpointHasBeenIndexed(protocol, event))
        return;
    // Load the RocketTokenRETH contract
    // We will need the rocketvault smart contract state to get specific addresses.
    const rETHContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_TOKEN_RETH);
    const rETHContract = rocketTokenRETH_1.rocketTokenRETH.bind(graph_ts_1.Address.fromBytes(rETHContractEntity.latestAddress));
    if (rETHContract === null)
        return;
    // Load the rocketDepositPool contract
    const rocketDepositPoolContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_DEPOSIT_POOL);
    const rocketDepositPoolContract = rocketDepositPool_1.rocketDepositPool.bind(graph_ts_1.Address.fromBytes(rocketDepositPoolContractEntity.latestAddress));
    if (rocketDepositPoolContract === null)
        return;
    // How much is the total staker ETH balance in the deposit pool?
    const balanceCall = rocketDepositPoolContract.try_getBalance();
    if (balanceCall.reverted)
        return;
    const depositPoolBalance = balanceCall.value;
    const excessBalanceCall = rocketDepositPoolContract.try_getExcessBalance();
    if (excessBalanceCall.reverted)
        return;
    const depositPoolExcessBalance = excessBalanceCall.value;
    // The RocketEth contract balance is equal to the total collateral - the excess deposit pool balance.
    const totalCollateralCall = rETHContract.try_getTotalCollateral();
    if (totalCollateralCall.reverted)
        return;
    const stakerETHInRocketETHContract = getRocketETHBalance(depositPoolExcessBalance, totalCollateralCall.value);
    // Attempt to create a new network balance checkpoint.
    const exchangeRateCall = rETHContract.try_getExchangeRate();
    if (exchangeRateCall.reverted)
        return;
    const rETHExchangeRate = exchangeRateCall.value;
    const checkpoint = entityFactory_1.rocketPoolEntityFactory.createNetworkStakerBalanceCheckpoint(generalUtilities_1.generalUtilities.extractIdForEntity(event), protocol.lastNetworkStakerBalanceCheckPoint, event, depositPoolBalance, stakerETHInRocketETHContract, rETHExchangeRate);
    if (checkpoint === null)
        return;
    // Retrieve previous checkpoint.
    const previousCheckpointId = protocol.lastNetworkStakerBalanceCheckPoint;
    let previousTotalStakerETHRewards = graph_ts_1.BigInt.fromI32(0);
    let previousTotalStakersWithETHRewards = graph_ts_1.BigInt.fromI32(0);
    let previousRETHExchangeRate = graph_ts_1.BigInt.fromI32(1);
    let previousCheckpoint = null;
    if (previousCheckpointId) {
        previousCheckpoint =
            schema_1.NetworkStakerBalanceCheckpoint.load(previousCheckpointId);
        if (previousCheckpoint) {
            previousTotalStakerETHRewards = previousCheckpoint.totalStakerETHRewards;
            previousTotalStakersWithETHRewards =
                previousCheckpoint.totalStakersWithETHRewards;
            previousRETHExchangeRate = previousCheckpoint.rETHExchangeRate;
            previousCheckpoint.nextCheckpointId = checkpoint.id;
        }
    }
    const balanceCheckpoint = schema_1.NetworkNodeBalanceCheckpoint.load(protocol.lastNetworkNodeBalanceCheckPoint);
    const averageFeeForActiveMinipools = balanceCheckpoint.averageFeeForActiveMinipools;
    // Handle the staker impact.
    generateStakerBalanceCheckpoints(event.block, protocol.activeStakers, checkpoint, previousCheckpoint !== null ? previousCheckpoint : null, previousRETHExchangeRate, event.block.number, event.block.timestamp, protocol, averageFeeForActiveMinipools);
    // If for some reason the running summary totals up to this checkpoint was 0, then we try to set it based on the previous checkpoint.
    if (checkpoint.totalStakerETHRewards == graph_ts_1.BigInt.fromI32(0)) {
        checkpoint.totalStakerETHRewards = previousTotalStakerETHRewards;
    }
    if (checkpoint.totalStakersWithETHRewards == graph_ts_1.BigInt.fromI32(0)) {
        checkpoint.totalStakersWithETHRewards = previousTotalStakersWithETHRewards;
    }
    // Calculate average staker reward up to this checkpoint.
    if (checkpoint.totalStakerETHRewards != graph_ts_1.BigInt.fromI32(0) &&
        checkpoint.totalStakersWithETHRewards
        ? 0
        : checkpoint.totalStakersWithETHRewards >= graph_ts_1.BigInt.fromI32(1)) {
        checkpoint.averageStakerETHRewards = checkpoint.totalStakerETHRewards.div(checkpoint.totalStakersWithETHRewards);
    }
    // Update the link so the protocol points to the last network staker balance checkpoint.
    protocol.lastNetworkStakerBalanceCheckPoint = checkpoint.id;
    // Index these changes.
    checkpoint.save();
    if (previousCheckpoint !== null)
        previousCheckpoint.save();
    protocol.save();
    (0, usageMetrics_1.updateUsageMetrics)(event.block, event.address);
    const queuedMinipools = balanceCheckpoint.queuedMinipools.times(constants_1.BIGINT_SIXTEEN);
    const stakingMinipools = balanceCheckpoint.stakingMinipools.times(constants_1.BIGINT_THIRTYTWO);
    const withdrawableMinipools = balanceCheckpoint.withdrawableMinipools.times(constants_1.BIGINT_THIRTYTWO);
    // TVL Methodology: https://github.com/DefiLlama/DefiLlama-Adapters/blob/main/projects/rocketpool/index.js#L90
    const rocketVaultContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_VAULT);
    const rocketVaultContract = rocketVault_1.rocketVault.bind(graph_ts_1.Address.fromBytes(rocketVaultContractEntity.latestAddress));
    const depositPoolBalanceCall = rocketVaultContract.try_balanceOf(contractConstants_1.RocketContractNames.ROCKET_DEPOSIT_POOL);
    if (depositPoolBalanceCall.reverted)
        return;
    const rocketDepositPoolBalance = depositPoolBalanceCall.value;
    const rETHBalanceCall = rocketVaultContract.try_balanceOf(contractConstants_1.RocketContractNames.ROCKET_TOKEN_RETH);
    if (rETHBalanceCall.reverted)
        return;
    const rocketTokenRETHBalance = rETHBalanceCall.value;
    const ethTVL = queuedMinipools
        .plus(stakingMinipools)
        .plus(withdrawableMinipools)
        .plus(rocketDepositPoolBalance)
        .plus(rocketTokenRETHBalance);
    const rocketNodeStakingContractEntity = (0, rocketContracts_1.getRocketContract)(contractConstants_1.RocketContractNames.ROCKET_NODE_STAKING);
    const rocketNodeStakingContract = rocketNodeStaking_1.rocketNodeStaking.bind(graph_ts_1.Address.fromBytes(rocketNodeStakingContractEntity.latestAddress));
    const totalRPLStakeCall = rocketNodeStakingContract.try_getTotalRPLStake();
    let totalRPLStake = constants_1.BIGINT_ZERO;
    if (!totalRPLStakeCall.reverted) {
        totalRPLStake = totalRPLStakeCall.value;
    }
    const balanceOfDaoNodeTrustedActionsCall = rocketVaultContract.try_balanceOfToken(contractConstants_1.RocketContractNames.ROCKET_DAO_NODE_TRUSTED_ACTIONS, graph_ts_1.Address.fromString(constants_1.RPL_ADDRESS));
    if (balanceOfDaoNodeTrustedActionsCall.reverted)
        return;
    const rocketDAONodeTrustedActions_rplBalance = balanceOfDaoNodeTrustedActionsCall.value;
    const balanceOfAuctionManagerActionsCall = rocketVaultContract.try_balanceOfToken(contractConstants_1.RocketContractNames.ROCKET_AUCTION_MANAGER, graph_ts_1.Address.fromString(constants_1.RPL_ADDRESS));
    if (balanceOfAuctionManagerActionsCall.reverted)
        return;
    const rocketAuctionManager_rplBalance = balanceOfAuctionManagerActionsCall.value;
    const rplTVL = totalRPLStake
        .plus(rocketDAONodeTrustedActions_rplBalance)
        .plus(rocketAuctionManager_rplBalance);
    (0, financialMetrics_1.updateProtocolAndPoolTvl)(event.block.number, event.block.timestamp, rplTVL, ethTVL);
}
exports.handleBalancesUpdated = handleBalancesUpdated;
/**
 * Loops through all stakers of the protocol.
 * If an active rETH balance is found..
 * Create a StakerBalanceCheckpoint
 */
function generateStakerBalanceCheckpoints(block, activeStakerIds, networkCheckpoint, previousCheckpoint, previousRETHExchangeRate, blockNumber, blockTime, protocol, averageFeeForActiveMinipools) {
    // Update grand totals based on previous checkpoint before we do anything.
    stakerUtilities_1.stakerUtilities.updateNetworkStakerBalanceCheckpointForPreviousCheckpointAndProtocol(networkCheckpoint, previousCheckpoint, protocol);
    let protocolRevenue = constants_1.BIGDECIMAL_ZERO;
    let ethRewards = constants_1.BIGINT_ZERO;
    // Loop through all the staker id's in the protocol.
    for (let index = 0; index < activeStakerIds.length; index++) {
        // Determine current staker ID.
        const stakerId = activeStakerIds[index];
        if (stakerId == null || stakerId == contractConstants_1.ZERO_ADDRESS_STRING)
            continue;
        // Load the indexed staker.
        const staker = schema_1.Staker.load(stakerId);
        // Shouldn't occur since we're only passing in staker ID's that have an active rETH balance.
        if (staker === null || staker.rETHBalance == graph_ts_1.BigInt.fromI32(0))
            continue;
        // Get the current & previous balances for this staker and update the staker balance for the current exchange rate.
        const stakerBalance = stakerUtilities_1.stakerUtilities.getStakerBalance(staker, networkCheckpoint.rETHExchangeRate);
        staker.ethBalance = stakerBalance.currentETHBalance;
        // Calculate rewards (+/-) for this staker since the previous checkpoint.
        const ethRewardsSincePreviousCheckpoint = stakerUtilities_1.stakerUtilities.getETHRewardsSincePreviousStakerBalanceCheckpoint(stakerBalance.currentRETHBalance, stakerBalance.currentETHBalance, stakerBalance.previousRETHBalance, stakerBalance.previousETHBalance, previousRETHExchangeRate);
        stakerUtilities_1.stakerUtilities.handleEthRewardsSincePreviousCheckpoint(ethRewardsSincePreviousCheckpoint, staker, networkCheckpoint, protocol);
        protocolRevenue = protocolRevenue.plus((0, numbers_1.bigIntToBigDecimal)(ethRewardsSincePreviousCheckpoint).times((0, numbers_1.bigIntToBigDecimal)(averageFeeForActiveMinipools)));
        ethRewards = ethRewards.plus(ethRewardsSincePreviousCheckpoint);
        // Create a new staker balance checkpoint
        const stakerBalanceCheckpoint = entityFactory_1.rocketPoolEntityFactory.createStakerBalanceCheckpoint(networkCheckpoint.id + " - " + stakerId, staker, networkCheckpoint, stakerBalance.currentETHBalance, stakerBalance.currentRETHBalance, staker.totalETHRewards, blockNumber, blockTime);
        if (stakerBalanceCheckpoint == null)
            continue;
        staker.lastBalanceCheckpoint = stakerBalanceCheckpoint.id;
        // Index both the updated staker & the new staker balance checkpoint.
        stakerBalanceCheckpoint.save();
        staker.save();
    }
    // update all rev/snapshots at once
    // this was moved outside of the loop to reduce the memory usage
    // we were getting a "oneshot called" error
    (0, financialMetrics_1.updateTotalRevenueMetrics)(block, ethRewards, networkCheckpoint.totalRETHSupply);
    (0, financialMetrics_1.updateProtocolSideRevenueMetrics)(block, protocolRevenue);
    (0, financialMetrics_1.updateSupplySideRevenueMetrics)(block);
    (0, financialMetrics_1.updateSnapshotsTvl)(block);
}
/**
 * The RocketETH contract balance is equal to the total collateral - the excess deposit pool balance.
 */
function getRocketETHBalance(depositPoolExcess, rocketETHTotalCollateral) {
    let totalStakerETHInRocketEthContract = rocketETHTotalCollateral.minus(depositPoolExcess);
    if (totalStakerETHInRocketEthContract < graph_ts_1.BigInt.fromI32(0))
        totalStakerETHInRocketEthContract = graph_ts_1.BigInt.fromI32(0);
    return totalStakerETHInRocketEthContract;
}
