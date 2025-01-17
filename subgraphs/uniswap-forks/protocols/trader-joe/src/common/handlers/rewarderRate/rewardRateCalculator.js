"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewarderCalculator = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../../../generated/schema");
const Rewarder_1 = require("../../../../../../generated/MasterChefV2/Rewarder");
const constants_1 = require("../../../../../../src/common/constants");
const MasterChefV2TraderJoe_1 = require("../../../../../../generated/MasterChefV2/MasterChefV2TraderJoe");
// RewarderCalculator can be used to estimate the rewardRate of masterchef rewarders.
// It defaults to getting the rate from the contract if available, and if not it will estimate it from
// the increase in accrued rewards for some randomly chose accounts.
class RewarderCalculator {
    constructor(mc, rewarder) {
        this.mc = mc;
        this.rewarder = rewarder;
        this.contract = Rewarder_1.Rewarder.bind(graph_ts_1.Address.fromString(rewarder.id));
    }
    static attemptToRetrieveRewardRate(contract) {
        const tokenPerSecCall = contract.try_tokenPerSec();
        if (tokenPerSecCall.reverted) {
            return null;
        }
        return tokenPerSecCall.value;
    }
    // calculateRewarderRate will happen once every 6 hours.
    // There are 2 ways of calculating the reward rate:
    //   1. If the rewarder contract exposes `tokenPerSec`, we'll use that.
    //   2. If it doesn't, then the crazy math explained below:
    //
    // As deposits accumulate on the masterchef contract we'll be probing 5 different accounts which have deposited recently
    // and calculate the delta of calling pendingRewards. That delta, together with the total LP supply staked, the amount
    // of LP from the user, and the time elapsed gives us a good estimation on what the reward rate is. It is more precise if
    // the total LP staked doesn't vary much in that interval. So if it changes by more than 10 percent in a given interval
    // we'll discard the calculation. The interval we'll use for the calculation will be of 100 blocks.
    calculateRewarderRate(event, user, isDeposit) {
        if (!this.shouldRecalculate(event)) {
            return;
        }
        if (this.rewarder.canRetrieveRate) {
            this.updateRewarderRateFromContract();
            return;
        }
        this.rewarder._rewardRateCalculationInProgress = true;
        this.rewarder.save();
        this.probeUser(event, user, isDeposit);
        if (!this.readyToCalculate(event)) {
            return;
        }
        this.computeRate(event);
    }
    shouldRecalculate(event) {
        if (this.rewarder._rewardRateCalculationInProgress) {
            return true;
        }
        const recalcInterval = graph_ts_1.BigInt.fromI32(3600 * 4); // 4 hours
        return event.block.timestamp
            .minus(this.rewarder.rateCalculatedAt)
            .gt(recalcInterval);
    }
    updateRewarderRateFromContract() {
        const rate = RewarderCalculator.attemptToRetrieveRewardRate(this.contract);
        if (!rate) {
            graph_ts_1.log.error("rewarder rate is retrievable but failed to retrieve: {}", [
                this.rewarder.id,
            ]);
            return;
        }
        this.rewarder.tokenPerSec = rate;
        this.rewarder.save();
    }
    // readyToCalculate will return true if there are probes available and at least one of them
    // was taken more than 100 blocks ago.
    readyToCalculate(event) {
        const calculationInterval = constants_1.BIGINT_HUNDRED; // 100 blocks
        if (!this.rewarder._probes) {
            return false;
        }
        for (let i = 0; i < this.rewarder._probes.length; i++) {
            const probe = schema_1._RewarderProbe.load(this.rewarder._probes[i]);
            if (event.block.number.minus(probe.blockNum).gt(calculationInterval)) {
                return true;
            }
        }
        return false;
    }
    // probeUser user will call rewarder.pendingTokens to see how much the rewards increase
    // in the measuring interval. If the user is already in the list of probing users we'll reset
    // its value to the current one, since a new deposit will claim all accrued rewards for the user.
    // On withdrawals we remove the user from the probe list, as it might have withdrawn everything, not accruing
    // any more rewards.
    // Probe entities are reused once a rewarder hits the maximum number of probes (5).
    probeUser(event, user, isDeposit) {
        const MAX_PROBES = 5;
        let probes = this.rewarder._probes;
        if (!probes) {
            probes = [];
        }
        if (!isDeposit) {
            this.removeUserProbes(user);
            return;
        }
        let probe = null;
        for (let i = 0; i < probes.length; i++) {
            probe = schema_1._RewarderProbe.load(probes[i]);
            if (probe.user == user.toHexString()) {
                this.resetProbe(probe);
                break;
            }
            if (probe.user == constants_1.ZERO_ADDRESS) {
                break;
            }
        }
        if (!probe) {
            if (probes.length >= MAX_PROBES) {
                return; // no more probes to take
            }
            probe = new schema_1._RewarderProbe(`${this.rewarder.id}-${probes.length}`);
            probes.push(probe.id);
        }
        const pending = this.contract.pendingTokens(user);
        const totalLPStaked = this.currentStakedLPForRewarderPool();
        probe.user = user.toHexString();
        probe.pending = pending;
        probe.blockNum = event.block.number;
        probe.timestamp = event.block.timestamp;
        probe.lpStaked = totalLPStaked;
        probe.save();
        this.rewarder._probes = probes;
        this.rewarder.save();
    }
    currentStakedLPForRewarderPool() {
        const sPool = schema_1._MasterChefStakingPool.load(this.rewarder.pool);
        const pool = schema_1.LiquidityPool.load(sPool.poolAddress);
        return pool.stakedOutputTokenAmount;
    }
    // computeRate will go over all probes from a fiven rewarder and attempt to calculate the
    // reward rate.
    computeRate(event) {
        const sPool = schema_1._MasterChefStakingPool.load(this.rewarder.pool);
        const currentStakedLP = this.currentStakedLPForRewarderPool();
        let sum = constants_1.BIGINT_ZERO;
        let validProbes = constants_1.BIGINT_ZERO;
        for (let i = 0; i < this.rewarder._probes.length; i++) {
            const probe = schema_1._RewarderProbe.load(this.rewarder._probes[i]);
            if (event.block.number == probe.blockNum) {
                continue; // was added right now, so won't have accrued rewards
            }
            const changePercentage = currentStakedLP
                .minus(probe.lpStaked)
                .toBigDecimal()
                .div(graph_ts_1.BigDecimal.fromString(currentStakedLP.toString()))
                .times(constants_1.BIGDECIMAL_HUNDRED);
            if (changePercentage.gt(constants_1.BIGDECIMAL_TEN)) {
                graph_ts_1.log.error("omitting rewarder probe due to high LP change: {}", [
                    probe.id,
                ]);
                // Total staked LP changed too much to be accurate. Omit this probe.
                continue;
            }
            const newPending = this.contract.pendingTokens(graph_ts_1.Address.fromString(probe.user));
            const pendingDelta = newPending.minus(probe.pending);
            const userLP = this.getUserStakedLP(sPool, graph_ts_1.Address.fromString(probe.user));
            const elapsed = event.block.timestamp.minus(probe.timestamp);
            const denom = userLP.times(elapsed);
            if (denom.equals(constants_1.BIGINT_ZERO)) {
                continue;
            }
            const rate = pendingDelta.times(currentStakedLP).div(denom);
            sum = sum.plus(rate);
            validProbes = validProbes.plus(constants_1.BIGINT_ONE);
        }
        if (validProbes.equals(constants_1.BIGINT_ZERO)) {
            graph_ts_1.log.warning("unable to compute rewarder rate this time: {}", [
                this.rewarder.id,
            ]);
            this.rewarder._probes = [];
            this.rewarder.save();
            return;
        }
        const averageRate = sum.div(validProbes);
        this.rewarder.tokenPerSec = averageRate;
        this.rewarder._rewardRateCalculationInProgress = false;
        this.rewarder._probes = [];
        this.rewarder.rateCalculatedAt = event.block.timestamp;
        this.rewarder.save();
    }
    removeUserProbes(user) {
        const probes = this.rewarder._probes;
        if (!probes) {
            return;
        }
        for (let i = 0; i < probes.length; i++) {
            const probe = schema_1._RewarderProbe.load(probes[i]);
            if (probe.user == user.toHexString()) {
                this.resetProbe(probe);
                return;
            }
        }
    }
    resetProbe(probe) {
        probe.user = constants_1.ZERO_ADDRESS;
        probe.save();
    }
    getUserStakedLP(sPool, user) {
        const pid = sPool.id.split("-")[1];
        if (!pid) {
            return constants_1.BIGINT_ZERO;
        }
        const c = MasterChefV2TraderJoe_1.MasterChefV2TraderJoe.bind(graph_ts_1.Address.fromString(this.mc.address)); // v2 and v3 have the same definition for this method.
        const call = c.try_userInfo(graph_ts_1.BigInt.fromString(pid), user);
        if (call.reverted) {
            graph_ts_1.log.error("unable to get user staked lp: {}", [user.toHexString()]);
            return constants_1.BIGINT_ZERO;
        }
        return call.value.value0;
    }
}
exports.RewarderCalculator = RewarderCalculator;
