"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolRewardsWithBonus = exports.setPoolRewarder = exports.PoolRewardData = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Rewarder_1 = require("../../../../../generated/MasterChefV2/Rewarder");
const TokenABI_1 = require("../../../../../generated/templates/Pair/TokenABI");
const schema_1 = require("../../../../../generated/schema");
const constants_1 = require("../../../../../src/common/constants");
const rewards_1 = require("../../../../../src/common/rewards");
const configure_1 = require("../../../../../configurations/configure");
const utils_1 = require("../../../../../src/common/utils/utils");
const getters_1 = require("../../../../../src/common/getters");
const rewardRateCalculator_1 = require("./rewarderRate/rewardRateCalculator");
class BonusAmounts {
}
class RewardObj {
}
class PoolRewardData {
}
exports.PoolRewardData = PoolRewardData;
// setPoolRewarder will set, remove or replace a given rewarder
// when a masterchef staking pool is added or updated. It will not update
// pool reward tokens, since that will happen on every deposit/withdrawal from the pool.
function setPoolRewarder(event, addr, pool) {
    if (addr.toHexString() == constants_1.ZERO_ADDRESS) {
        removeRewarder(pool);
        return;
    }
    replaceRewarder(event, addr, pool);
}
exports.setPoolRewarder = setPoolRewarder;
// replaceRewarder will remove the current rewarder of a staking pool and add a new one.
// Token emissions will be updated on the next deposit/withdrawal after the replacement.
function replaceRewarder(event, addr, pool) {
    removeRewarder(pool);
    addRewarder(event, addr, pool);
}
// removeRewarder will remove the rewarder assigned to some staking pool (if any).
// Token emissions will be updated on the next deposit/withdrawal after the replacement.
function removeRewarder(sPool) {
    sPool.rewarder = null;
}
// addRewarder adds a rewarder to a given staking pool and updates the pool
// reward token and emission values.
function addRewarder(event, addr, sPool) {
    const rewarder = getOrCreateRewarder(event, addr, sPool);
    sPool.rewarder = rewarder.id;
}
// getPoolRewardsWithBonus will be called on every masterchef deposit or withdrawal
// to update bonus rewards if a rewarder exists for that pool.
function getPoolRewardsWithBonus(event, mc, sPool, liqPool, user, isDeposit = false) {
    if (!sPool.rewarder) {
        return null;
    }
    const rewarderAddr = graph_ts_1.Address.fromString(sPool.rewarder);
    const rewarder = getOrCreateRewarder(event, rewarderAddr, sPool);
    const calc = new rewardRateCalculator_1.RewarderCalculator(mc, rewarder);
    calc.calculateRewarderRate(event, user, isDeposit);
    return buildRewards(event, liqPool, rewarder, rewarderHasFunds(event, rewarder));
}
exports.getPoolRewardsWithBonus = getPoolRewardsWithBonus;
// rewarderHasFunds will return true if it finds the rewarder has a balance > 0 for the
// token given as reward. If the last check was too recent, it will return the stored value instead.
// If it is unable to fetch the balance, it will assume
// the rewarder DOES have balance.
function rewarderHasFunds(event, rewarder) {
    // only check rewarder balance once per day
    const ONE_DAY = graph_ts_1.BigInt.fromI32(24 * 3600);
    if (event.block.timestamp.minus(rewarder.hasFundsAt).lt(ONE_DAY)) {
        return rewarder.hasFunds;
    }
    const bal = fetchRewarderBalance(rewarder);
    if (!bal) {
        graph_ts_1.log.error("unable to fetch rewarder balance: {}", [rewarder.id]);
        return true;
    }
    rewarder.hasFunds = true;
    if (bal.equals(constants_1.BIGINT_ZERO)) {
        rewarder.hasFunds = false;
    }
    rewarder.hasFundsAt = event.block.timestamp;
    rewarder.save();
    return rewarder.hasFunds;
}
function buildRewards(event, pool, rewarder, rewarderHasFunds) {
    const rewardToken = (0, getters_1.getOrCreateRewardToken)(event, configure_1.NetworkConfigs.getRewardToken());
    const bonusToken = (0, getters_1.getOrCreateRewardToken)(event, rewarder.rewardToken);
    const bonus = calculateBonusRewardAmounts(event, rewarder, rewarderHasFunds);
    const rewards = [];
    rewards.push({
        tokenId: rewardToken.id,
        amount: pool.rewardTokenEmissionsAmount[0],
        amountUSD: pool.rewardTokenEmissionsUSD[0], // idem
    });
    rewards.push({
        tokenId: bonusToken.id,
        amount: bonus.amount,
        amountUSD: bonus.amountUSD,
    });
    rewards.sort((a, b) => {
        if (a.tokenId < b.tokenId) {
            return -1;
        }
        return 1;
    }); // need to sort for the order to match with rewardAmounts when querying. -> https://discord.com/channels/953684103012683796/953685205531631637/974188732154544178
    const pr = {
        tokens: [],
        amounts: [],
        amountsUSD: [],
    };
    for (let i = 0; i < rewards.length; i++) {
        pr.tokens.push(rewards[i].tokenId);
        pr.amounts.push(rewards[i].amount);
        pr.amountsUSD.push(rewards[i].amountUSD);
    }
    return pr;
}
// calculateBonusRewardAmounts will calculate the daily token and USD bonus emissions
// given by a rewarder.
function calculateBonusRewardAmounts(event, rewarder, rewarderHasFunds) {
    if (!rewarderHasFunds) {
        return {
            amount: constants_1.BIGINT_ZERO,
            amountUSD: constants_1.BIGDECIMAL_ZERO,
        };
    }
    const bonusRewards = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, graph_ts_1.BigDecimal.fromString(rewarder.tokenPerSec.toString()), rewards_1.RewardIntervalType.TIMESTAMP);
    const bonusToken = (0, getters_1.getOrCreateToken)(event, rewarder.rewardToken);
    const bonusAmount = graph_ts_1.BigInt.fromString((0, utils_1.roundToWholeNumber)(bonusRewards).toString());
    const bonusAmountUSD = (0, utils_1.convertTokenToDecimal)(bonusAmount, bonusToken.decimals).times(bonusToken.lastPriceUSD);
    return {
        amount: bonusAmount,
        amountUSD: bonusAmountUSD,
    };
}
function getOrCreateRewarder(event, addr, pool) {
    let rewarder = schema_1._MasterChefRewarder.load(addr.toHexString());
    if (!rewarder) {
        if (!pool) {
            graph_ts_1.log.critical("attempting to handle OnReward without registered rewarder: {}", [addr.toHexString()]);
        }
        const c = Rewarder_1.Rewarder.bind(addr);
        const token = (0, getters_1.getOrCreateRewardToken)(event, c.rewardToken().toHexString());
        rewarder = new schema_1._MasterChefRewarder(addr.toHexString());
        rewarder.pool = pool.id;
        rewarder.rewardToken = token.token;
        rewarder.canRetrieveRate = false;
        rewarder.hasFunds = true;
        rewarder.hasFundsAt = constants_1.BIGINT_ZERO;
        rewarder.tokenPerSec = constants_1.BIGINT_ZERO;
        rewarder.rateCalculatedAt = constants_1.BIGINT_ZERO;
        rewarder._rewardRateCalculationInProgress = false;
        const tokenPerSec = rewardRateCalculator_1.RewarderCalculator.attemptToRetrieveRewardRate(c);
        if (tokenPerSec) {
            rewarder.canRetrieveRate = true;
            rewarder.tokenPerSec = tokenPerSec;
        }
        const balance = fetchRewarderBalance(rewarder);
        if (balance && balance.equals(constants_1.BIGINT_ZERO)) {
            rewarder.hasFunds = false;
        }
        rewarder.save();
    }
    return rewarder;
}
function fetchRewarderBalance(rewarder) {
    const rewarderAddr = graph_ts_1.Address.fromString(rewarder.id);
    const c = Rewarder_1.Rewarder.bind(rewarderAddr);
    const tokenCall = c.try_rewardToken();
    if (tokenCall.reverted) {
        return null;
    }
    const token = TokenABI_1.TokenABI.bind(tokenCall.value);
    const call = token.try_balanceOf(rewarderAddr);
    if (call.reverted) {
        return null;
    }
    return call.value;
}
