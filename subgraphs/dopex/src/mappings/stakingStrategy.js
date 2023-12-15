"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRewards = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Ssov_1 = require("../../generated/BasicWeeklyCalls/Ssov");
const StakingStrategyV1_1 = require("../../generated/BasicWeeklyCalls/StakingStrategyV1");
const StakingStrategyV2_1 = require("../../generated/BasicWeeklyCalls/StakingStrategyV2");
const token_1 = require("../entities/token");
const pool_1 = require("../entities/pool");
const numbers_1 = require("../utils/numbers");
const constants_1 = require("../utils/constants");
function updateRewards(event, pool, epoch, stakingStrategyAddress) {
  const ssovContract = Ssov_1.Ssov.bind(graph_ts_1.Address.fromBytes(pool.id));
  const tryCurrentEpoch = ssovContract.try_currentEpoch();
  if (tryCurrentEpoch.reverted) {
    return;
  }
  const tryGetEpochTimes = ssovContract.try_getEpochTimes(
    tryCurrentEpoch.value
  );
  if (tryGetEpochTimes.reverted) {
    return;
  }
  const daysInEpoch = tryGetEpochTimes.value
    .getEnd()
    .minus(tryGetEpochTimes.value.getStart())
    .divDecimal(
      new graph_ts_1.BigDecimal(
        graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY)
      )
    );
  const stakingStrategyV1Contract = StakingStrategyV1_1.StakingStrategyV1.bind(
    stakingStrategyAddress
  );
  const tryGetRewardTokens = stakingStrategyV1Contract.try_getRewardTokens();
  if (tryGetRewardTokens.reverted) {
    return;
  }
  const rewardTokens = tryGetRewardTokens.value;
  const rewardsPerEpoch = [];
  let tryRewardsPerEpoch = stakingStrategyV1Contract.try_rewardsPerEpoch(epoch);
  if (!tryRewardsPerEpoch.reverted) {
    rewardsPerEpoch.push(tryRewardsPerEpoch.value);
  } else {
    const stakingStrategyV2Contract =
      StakingStrategyV2_1.StakingStrategyV2.bind(stakingStrategyAddress);
    for (let i = 0; i < rewardTokens.length; i++) {
      tryRewardsPerEpoch = stakingStrategyV2Contract.try_rewardsPerEpoch(
        epoch,
        graph_ts_1.BigInt.fromI32(i)
      );
      if (!tryRewardsPerEpoch.reverted) {
        rewardsPerEpoch.push(tryRewardsPerEpoch.value);
      }
    }
  }
  if (rewardTokens.length != rewardsPerEpoch.length) {
    return;
  }
  // Based on the emissions rate for the pool, calculate the rewards per day for the pool.
  let tokensPerDay = constants_1.BIGINT_ZERO;
  for (let i = 0; i < rewardTokens.length; i++) {
    const rewardToken = (0, token_1.getOrCreateRewardToken)(
      event,
      rewardTokens[i]
    );
    const token = (0, token_1.getOrCreateToken)(event, rewardTokens[i]);
    if (daysInEpoch != constants_1.BIGDECIMAL_ZERO) {
      tokensPerDay = (0, numbers_1.bigDecimalToBigInt)(
        rewardsPerEpoch[i].divDecimal(daysInEpoch)
      );
    }
    const tokensPerDayUSD = (0, numbers_1.convertTokenToDecimal)(
      tokensPerDay,
      token.decimals
    ).times(token.lastPriceUSD);
    (0, pool_1.updatePoolRewardToken)(
      event,
      pool,
      rewardToken,
      tokensPerDay,
      tokensPerDayUSD
    );
  }
}
exports.updateRewards = updateRewards;
