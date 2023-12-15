"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUnstake = exports.handleStake = void 0;
const AcceleratingDistributor_1 = require("../../generated/AcceleratingDistributor/AcceleratingDistributor");
const bridge_1 = require("../sdk/protocols/bridge");
const util_1 = require("../util");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../sdk/util/constants");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function handleStake(event) {
  const sdk = bridge_1.SDK.initializeFromEvent(
    util_1.MAINNET_BRIDGE_CONFIG,
    new util_1.Pricer(event.block),
    new util_1.TokenInit(),
    event
  );
  const stakedToken = event.params.token;
  const outputTokenToPool = schema_1._OutputTokenToPool.load(stakedToken);
  if (outputTokenToPool) {
    const pool = sdk.Pools.loadPool(outputTokenToPool.pool);
    // Add Staked Amount
    const stakedAmount = event.params.amount;
    pool.addStakedOutputTokenAmount(stakedAmount);
    // Rewards
    // RewardToken can also be fetched from AcceleratingDistributor contract ("rewardToken" method)
    const rewardTokenAddress = graph_ts_1.Address.fromString(
      util_1.ACROSS_REWARD_TOKEN
    );
    const rewardToken = sdk.Tokens.getOrCreateToken(rewardTokenAddress);
    const acceleratingDistributorContract =
      AcceleratingDistributor_1.AcceleratingDistributor.bind(
        graph_ts_1.Address.fromString(
          util_1.ACROSS_ACCELERATING_DISTRIBUTOR_CONTRACT
        )
      );
    const contractCall =
      acceleratingDistributorContract.try_stakingTokens(stakedToken);
    let baseEmissionRate;
    if (contractCall.reverted) {
      graph_ts_1.log.info(
        "[AcceleratingDistributor:stakingToken()] retrieve baseEmissionRate for pools call reverted",
        []
      );
    } else {
      baseEmissionRate = contractCall.value.getBaseEmissionRate();
      const amount = baseEmissionRate.times(constants_1.SECONDS_PER_DAY_BI);
      pool.setRewardEmissions(
        constants_1.RewardTokenType.DEPOSIT,
        rewardToken,
        amount
      );
    }
  }
}
exports.handleStake = handleStake;
function handleUnstake(event) {
  const sdk = bridge_1.SDK.initializeFromEvent(
    util_1.MAINNET_BRIDGE_CONFIG,
    new util_1.Pricer(event.block),
    new util_1.TokenInit(),
    event
  );
  const unstakedToken = event.params.token;
  const outputTokenToPool = schema_1._OutputTokenToPool.load(unstakedToken);
  if (outputTokenToPool) {
    const pool = sdk.Pools.loadPool(outputTokenToPool.pool);
    // Subtract Unstaked Amount
    const unstakedAmount = event.params.amount.times(
      constants_1.BIGINT_MINUS_ONE
    );
    pool.addStakedOutputTokenAmount(unstakedAmount);
  }
}
exports.handleUnstake = handleUnstake;
