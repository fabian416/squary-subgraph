"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleETHGainWithdrawn = exports.handleUserDepositChanged = exports.handleStabilityPoolLUSDBalanceUpdated = exports.handleStabilityPoolETHBalanceUpdated = void 0;
const StabilityPool_1 = require("../../generated/StabilityPool/StabilityPool");
const token_1 = require("../entities/token");
const protocol_1 = require("../entities/protocol");
const position_1 = require("../entities/position");
const numbers_1 = require("../utils/numbers");
const event_1 = require("../entities/event");
const constants_1 = require("../utils/constants");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const market_1 = require("../entities/market");
const constants_2 = require("../utils/constants");
/**
 * ETH balance was updated
 *
 * @param event StabilityPoolETHBalanceUpdated event
 */
function handleStabilityPoolETHBalanceUpdated(event) {
    const stabilityPool = StabilityPool_1.StabilityPool.bind(event.address);
    const totalETHLocked = event.params._newBalance;
    const totalLUSDLocked = stabilityPool.getTotalLUSDDeposits();
    (0, protocol_1.updateProtocolUSDLockedStabilityPool)(event, totalLUSDLocked, totalETHLocked);
    calculateDailyLQTYRewards(event, (0, market_1.getOrCreateStabilityPool)(event));
}
exports.handleStabilityPoolETHBalanceUpdated = handleStabilityPoolETHBalanceUpdated;
/**
 * LUSD balance was updated
 *
 * @param event StabilityPoolLUSDBalanceUpdated event
 */
function handleStabilityPoolLUSDBalanceUpdated(event) {
    const stabilityPool = StabilityPool_1.StabilityPool.bind(event.address);
    const totalLUSDLocked = event.params._newBalance;
    const totalETHLocked = stabilityPool.getETH();
    (0, protocol_1.updateProtocolUSDLockedStabilityPool)(event, totalLUSDLocked, totalETHLocked);
    calculateDailyLQTYRewards(event, (0, market_1.getOrCreateStabilityPool)(event));
}
exports.handleStabilityPoolLUSDBalanceUpdated = handleStabilityPoolLUSDBalanceUpdated;
/**
 * Triggered when some deposit balance changes. We use this to track position
 * value and deposits. But cannot accurately tell when it was caused by a withdrawal
 * or just by the transformation of LUSD into ETH due to liquidations (see stability pool docs).
 *
 * @param event UserDepositChanged
 */
function handleUserDepositChanged(event) {
    const market = (0, market_1.getOrCreateStabilityPool)(event);
    (0, position_1.updateSPUserPositionBalances)(event, market, event.params._depositor, event.params._newDeposit);
    calculateDailyLQTYRewards(event, market);
}
exports.handleUserDepositChanged = handleUserDepositChanged;
/**
 * Triggered when ETH that has been converted from LUSD in the stability pool
 * is sent to its owner (the LUSD depositor).
 * These are the only StabilityPool withdrawals we are able to track.
 *
 * @param event ETHGainWithdrawn
 */
function handleETHGainWithdrawn(event) {
    if (event.params._ETH.equals(constants_1.BIGINT_ZERO)) {
        return;
    }
    const amountUSD = (0, token_1.getCurrentETHPrice)().times((0, numbers_1.bigIntToBigDecimal)(event.params._ETH));
    const market = (0, market_1.getOrCreateStabilityPool)(event);
    (0, event_1.createWithdraw)(event, market, event.params._ETH, amountUSD, event.params._depositor, event.params._depositor);
    calculateDailyLQTYRewards(event, market);
}
exports.handleETHGainWithdrawn = handleETHGainWithdrawn;
/**
 * Calculates and sets estimated LQTY rewards for the stability pool.
 * Rewards aren't issued linearly, they follow the formula:
 *
 * totalRewardsToDate = rewardBudget * (1 - issuanceFactor ^ minutesSinceDeployment)
 *
 * rewardBudget and issuanceFactor are constants, so we can calculate the rewards without the contracts themselves.
 * To calculate the rewards issued daily, we just need to calculate the difference of `totalRewardsToDate` between now and 24 in the future.
 *
 * @param event
 * @param market
 */
function calculateDailyLQTYRewards(event, market) {
    const minutesSinceDeployment = event.block.timestamp
        .minus(constants_2.STABILITY_POOL_REWARD_START)
        .div(graph_ts_1.BigInt.fromI32(60));
    const minutesInADay = graph_ts_1.BigInt.fromI32(60 * 24);
    const totalRewardsToDate = minutesToRewards(minutesSinceDeployment.toU32());
    const totalRewardsTomorrow = minutesToRewards(minutesSinceDeployment.plus(minutesInADay).toU32());
    const dailyLQTYRewards = totalRewardsTomorrow.minus(totalRewardsToDate);
    const rewardsUSD = (0, numbers_1.bigIntToBigDecimal)(dailyLQTYRewards).times((0, token_1.getCurrentLQTYPrice)());
    market.rewardTokens = [(0, token_1.getRewardToken)().id];
    market.rewardTokenEmissionsAmount = [dailyLQTYRewards];
    market.rewardTokenEmissionsUSD = [rewardsUSD];
    market.save();
    // update snapshots
    (0, market_1.getOrCreateMarketSnapshot)(event, market);
    (0, market_1.getOrCreateMarketHourlySnapshot)(event, market);
}
function minutesToRewards(minutes) {
    const pow = bigPow(constants_2.STABILITY_POOL_LQTY_ISSUANCE_FACTOR, minutes);
    const fraction = constants_1.BIGDECIMAL_ONE.minus(pow);
    const rewards = constants_2.STABILITY_POOL_LQTY_BUGDET.times(fraction);
    // to big int by multiplying by 10^18, truncate, then to string and from string.
    return graph_ts_1.BigInt.fromString(rewards
        .times(constants_1.BIGINT_TEN.pow(constants_1.DEFAULT_DECIMALS).toBigDecimal())
        .truncate(0)
        .toString());
}
// exponentiation by squaring
// we use this custom function because BigInt.pow is limited to u8 (max 255) exponents.
// https://github.com/liquity/dev/blob/main/packages/contracts/contracts/Dependencies/LiquityMath.sol#L63
function bigPow(base, exponent) {
    let x = base;
    let y = constants_1.BIGDECIMAL_ONE;
    let n = exponent;
    while (n > 1) {
        if (n % 2 == 0) {
            x = x.times(x);
            n = n / 2;
        }
        else {
            y = y.times(x);
            x = x.times(x);
            n = (n - 1) / 2;
        }
    }
    return x.times(y);
}
