"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stakerUtilities = void 0;
const schema_1 = require("../../generated/schema");
const transactionStakers_1 = require("../models/transactionStakers");
const stakerBalance_1 = require("../models/stakerBalance");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const entityFactory_1 = require("../entityFactory");
const generalConstants_1 = require("../constants/generalConstants");
const contractConstants_1 = require("../constants/contractConstants");
const generalUtilities_1 = require("./generalUtilities");
class StakerUtilities {
    /**
     * Returns the hexadecimal address representation.
     */
    extractStakerId(address) {
        return address.toHexString();
    }
    /**
     * Checks if there is already an indexed network staker balance checkpoint for the given event.
     */
    hasNetworkStakerBalanceCheckpointHasBeenIndexed(protocol, event) {
        // If this specific event has been handled, then return true.
        if (schema_1.NetworkStakerBalanceCheckpoint.load(generalUtilities_1.generalUtilities.extractIdForEntity(event)) !== null)
            return true;
        // No indexed protocol means there is no latest network staker balance checkpoint.
        if (protocol === null)
            return false;
        /*
          Retrieve the latest network balance checkpoint.
          If there is none at the moment, return false because this hasnt been handled yet.
        */
        const latestNetworkStakerBalanceCheckpointId = protocol.lastNetworkStakerBalanceCheckPoint;
        if (latestNetworkStakerBalanceCheckpointId === null)
            return false;
        const latestNetworkStakerBalanceCheckpoint = schema_1.NetworkStakerBalanceCheckpoint.load(latestNetworkStakerBalanceCheckpointId);
        if (latestNetworkStakerBalanceCheckpoint === null ||
            latestNetworkStakerBalanceCheckpoint.blockTime == graph_ts_1.BigInt.fromI32(0))
            return false;
        // Get the date of the network staker balance event candidate and the latest network staker balance checkpoint.
        const dateOfNewNetworkStakerBalanceCheckpoint = new Date(event.block.timestamp.toI32() * 1000);
        const dateOfLatestNetworkStakerBalanceCheckpoint = new Date(latestNetworkStakerBalanceCheckpoint.blockTime.toI32() * 1000);
        // If the latest network staker balance checkpoint and the candidate match in terms of day/month/year, then return false.
        return (dateOfNewNetworkStakerBalanceCheckpoint.getUTCFullYear() ==
            dateOfLatestNetworkStakerBalanceCheckpoint.getUTCFullYear() &&
            dateOfNewNetworkStakerBalanceCheckpoint.getUTCMonth() ==
                dateOfLatestNetworkStakerBalanceCheckpoint.getUTCMonth() &&
            dateOfNewNetworkStakerBalanceCheckpoint.getUTCDate() ==
                dateOfLatestNetworkStakerBalanceCheckpoint.getUTCDate());
    }
    /**
     * Gets the relevant stakers based on some transaction parameters.
     */
    getTransactionStakers(from, to, blockNumber, blockTimeStamp) {
        /*
         * Load or attempt to create the (new) staker from whom the rETH is being transferred.
         */
        const fromId = this.extractStakerId(from);
        let fromStaker = schema_1.Staker.load(fromId);
        if (fromStaker === null) {
            fromStaker = (entityFactory_1.rocketPoolEntityFactory.createStaker(fromId, blockNumber, blockTimeStamp));
        }
        /**
         * Load or attempt to create the (new) staker to whom the rETH is being transferred.
         */
        const toId = this.extractStakerId(to);
        let toStaker = schema_1.Staker.load(toId);
        if (toStaker === null) {
            toStaker = (entityFactory_1.rocketPoolEntityFactory.createStaker(toId, blockNumber, blockTimeStamp));
        }
        return new transactionStakers_1.TransactionStakers(fromStaker, toStaker);
    }
    /**
     * Changes the balance for a staker, with the amount and either a minus or a plus operation.
     */
    changeStakerBalances(staker, rEthAmount, rEthExchangeRate, increase) {
        // Don't store balance for the zero address.
        if (staker === null || staker.id == contractConstants_1.ZERO_ADDRESS_STRING)
            return;
        // Set current rETH balance.
        if (increase)
            staker.rETHBalance = staker.rETHBalance.plus(rEthAmount);
        else {
            if (staker.rETHBalance >= rEthAmount)
                staker.rETHBalance = staker.rETHBalance.minus(rEthAmount);
            else
                staker.rETHBalance = graph_ts_1.BigInt.fromI32(0); // Could be zero address.
        }
        // Set current ETH balance.
        if (rEthExchangeRate > graph_ts_1.BigInt.fromI32(0) && rEthAmount > graph_ts_1.BigInt.fromI32(0))
            staker.ethBalance = staker.rETHBalance
                .times(rEthExchangeRate)
                .div(generalConstants_1.ONE_ETHER_IN_WEI);
        else
            staker.ethBalance = graph_ts_1.BigInt.fromI32(0);
    }
    /**
     * Returns an object that contains the current and previous rETH/ETH balances.
     */
    getStakerBalance(staker, currentRETHExchangeRate) {
        const result = new stakerBalance_1.StakerBalance();
        // Determine current rETH & ETH value balance.
        result.currentRETHBalance = staker.rETHBalance;
        if (result.currentRETHBalance < graph_ts_1.BigInt.fromI32(0))
            result.currentRETHBalance = graph_ts_1.BigInt.fromI32(0);
        result.currentETHBalance = result.currentRETHBalance
            .times(currentRETHExchangeRate)
            .div(generalConstants_1.ONE_ETHER_IN_WEI);
        if (result.currentETHBalance < graph_ts_1.BigInt.fromI32(0))
            result.currentETHBalance = graph_ts_1.BigInt.fromI32(0);
        // By default, assume the previous (r)ETH balances are the same as the current ones.
        result.previousRETHBalance = result.currentRETHBalance;
        result.previousETHBalance = result.currentETHBalance;
        // If we had a previous staker balance checkpoint, then use the balances from that link.
        if (staker.lastBalanceCheckpoint !== null) {
            const previousStakerBalanceCheckpoint = schema_1.StakerBalanceCheckpoint.load(staker.lastBalanceCheckpoint);
            // Set the previous balances based on the previous staker balance checkpoint.
            if (previousStakerBalanceCheckpoint !== null) {
                result.previousRETHBalance =
                    previousStakerBalanceCheckpoint.rETHBalance;
                result.previousETHBalance = previousStakerBalanceCheckpoint.ethBalance;
                // To be safe..
                if (result.previousRETHBalance < graph_ts_1.BigInt.fromI32(0)) {
                    result.previousRETHBalance = graph_ts_1.BigInt.fromI32(0);
                }
                if (result.previousETHBalance < graph_ts_1.BigInt.fromI32(0)) {
                    result.previousETHBalance = graph_ts_1.BigInt.fromI32(0);
                }
            }
        }
        return result;
    }
    /**
     * Returns the total ETH rewards for a staker since the previous staker balance checkpoint.
     */
    getETHRewardsSincePreviousStakerBalanceCheckpoint(activeRETHBalance, activeETHBalance, previousRETHBalance, previousETHBalance, previousCheckPointExchangeRate) {
        // This will indicate how many ETH rewards we have since the previous checkpoint.
        let ethRewardsSincePreviousCheckpoint = graph_ts_1.BigInt.fromI32(0);
        /**
         * The staker can only have (+/-)rewards when he had an (r)ETH balance last checkpoint
         * and if his ETH balance from last time isn't the same as the current ETH balance.
         */
        if (previousRETHBalance > graph_ts_1.BigInt.fromI32(0) &&
            (activeETHBalance > previousETHBalance ||
                activeETHBalance < previousETHBalance)) {
            // CASE #1: The staker his rETH balance stayed the same since last checkpoint.
            if (activeRETHBalance == previousRETHBalance) {
                ethRewardsSincePreviousCheckpoint =
                    activeETHBalance.minus(previousETHBalance);
            }
            // CASE #2: The staker has burned or transferred some of his/her rETH holdings since last checkpoint.
            else if (activeRETHBalance < previousRETHBalance) {
                // How much was the ETH value that was transferred away during this checkpoint.
                const ethTransferredSinceThePreviousCheckpoint = previousRETHBalance
                    .minus(activeRETHBalance)
                    .times(previousCheckPointExchangeRate)
                    .div(generalConstants_1.ONE_ETHER_IN_WEI);
                ethRewardsSincePreviousCheckpoint = activeETHBalance.minus(previousETHBalance.minus(ethTransferredSinceThePreviousCheckpoint));
            }
            // CASE #3: The staker increased his/her rETH holdings since last checkpoint.
            else if (activeRETHBalance > previousRETHBalance) {
                // How much was the ETH value that was received during this checkpoint.
                const ethReceivedSinceThePreviousCheckpointAtPreviousExchangeRate = activeRETHBalance
                    .minus(previousRETHBalance)
                    .times(previousCheckPointExchangeRate)
                    .div(generalConstants_1.ONE_ETHER_IN_WEI);
                // This accounts for everything excluding any rewards we earned OR value we lost on the minted rETH since last checkpoint.
                ethRewardsSincePreviousCheckpoint = activeETHBalance
                    .minus(ethReceivedSinceThePreviousCheckpointAtPreviousExchangeRate)
                    .minus(previousETHBalance);
            }
        }
        return ethRewardsSincePreviousCheckpoint;
    }
    /**
     * Checks if there is already an indexed transaction for the given event.
     */
    hasTransactionHasBeenIndexed(event) {
        // Is this transaction already logged?
        return (schema_1.RocketETHTransaction.load(generalUtilities_1.generalUtilities.extractIdForEntity(event)) !==
            null);
    }
    /**
     * Updates the total ETH rewards of the staker.
     * Keeps track if the staker has ever accrued ETH rewards during its lifecycle.
     * Updates the network checkpoint so the totals are correct.
     */
    handleEthRewardsSincePreviousCheckpoint(ethRewardsSincePreviousCheckpoint, staker, networkCheckpoint, protocol) {
        // Update total rewards based on how much the staker has earned/lost since previous checkpoint.
        staker.totalETHRewards = staker.totalETHRewards.plus(ethRewardsSincePreviousCheckpoint);
        // If we have rewards (+/-) and we hadn't yet stored that this staker had ever received rewards, then store it.
        if (ethRewardsSincePreviousCheckpoint != graph_ts_1.BigInt.fromI32(0) &&
            staker.hasAccruedETHRewardsDuringLifecycle == false) {
            staker.hasAccruedETHRewardsDuringLifecycle = true;
            // Update the collection that keeps track of how many stakers there are/have been with ETH rewards.
            const stakersWithETHRewards = protocol.stakersWithETHRewards;
            if (stakersWithETHRewards.indexOf(staker.id) == -1)
                stakersWithETHRewards.push(staker.id);
            protocol.stakersWithETHRewards = stakersWithETHRewards;
            // Increment the total counter on the network checkpoint level.
            networkCheckpoint.totalStakersWithETHRewards =
                networkCheckpoint.totalStakersWithETHRewards.plus(graph_ts_1.BigInt.fromI32(1));
        }
        // Update the total ETH rewards since previous checkpoint and until the current checkpoint.
        this.updateNetworkStakerBalanceCheckpoint(networkCheckpoint, staker, ethRewardsSincePreviousCheckpoint);
    }
    /**
     * Updates the given summary based on the rewards since previous checkpoint and the total rewards for a staker.
     */
    updateNetworkStakerBalanceCheckpoint(networkCheckpoint, staker, rewardsSincePreviousCheckpoint) {
        if (networkCheckpoint === null)
            return;
        // If the staker has new rewards since the previous checkpoint..
        if (rewardsSincePreviousCheckpoint > graph_ts_1.BigInt.fromI32(0)) {
            // Update the total ETH rewards (+/-) up to this checkpoint based on the total rewards.
            networkCheckpoint.totalStakerETHRewards =
                networkCheckpoint.totalStakerETHRewards.plus(rewardsSincePreviousCheckpoint);
        }
        // Keep track of all stakers that have an RETH balance this network balance checkpoint.
        if (staker.rETHBalance > graph_ts_1.BigInt.fromI32(0)) {
            networkCheckpoint.stakersWithAnRETHBalance =
                networkCheckpoint.stakersWithAnRETHBalance.plus(graph_ts_1.BigInt.fromI32(1));
        }
    }
    /**
     * Updates the given summary based on the rewards since previous checkpoint and the total rewards for the previous network staker balance checkpoint.
     */
    updateNetworkStakerBalanceCheckpointForPreviousCheckpointAndProtocol(networkCheckpoint, previousCheckpoint, protocol) {
        if (networkCheckpoint === null)
            return;
        if (previousCheckpoint !== null) {
            // Update the total ETH rewards (+/-) up to this checkpoint based on the total rewards.
            networkCheckpoint.totalStakerETHRewards =
                networkCheckpoint.totalStakerETHRewards.plus(previousCheckpoint.totalStakerETHRewards);
        }
        if (protocol !== null) {
            // Increment the total number of stakers with ETH rewards based on what the running total is up to now.
            networkCheckpoint.totalStakersWithETHRewards =
                networkCheckpoint.totalStakersWithETHRewards.plus(graph_ts_1.BigInt.fromI32(protocol.stakersWithETHRewards.length));
        }
    }
}
exports.stakerUtilities = new StakerUtilities();
