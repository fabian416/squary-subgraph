"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolFromGauge =
  exports.updateRewardTokenEmissions =
  exports.updateFactoryRewards =
  exports.updateStakedOutputTokenAmount =
  exports.updateControllerRewards =
  exports.getRewardsData =
    void 0;
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const utils_1 = require("../common/utils");
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const rewards_1 = require("../common/rewards");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Gauge_1 = require("../../generated/templates/gauge/Gauge");
const GaugeController_1 = require("../../generated/GaugeController/GaugeController");
function getRewardsData(gaugeAddress) {
  const rewardRates = [];
  const rewardTokens = [];
  const gaugeContract = Gauge_1.Gauge.bind(gaugeAddress);
  const rewardCount = utils.readValue(
    gaugeContract.try_reward_count(),
    constants.BIGINT_TEN
  );
  for (let idx = 0; idx < rewardCount.toI32(); idx++) {
    const rewardToken = utils.readValue(
      gaugeContract.try_reward_tokens(graph_ts_1.BigInt.fromI32(idx)),
      constants.NULL.TYPE_ADDRESS
    );
    if (rewardToken.equals(constants.NULL.TYPE_ADDRESS)) continue;
    rewardTokens.push(rewardToken);
    const rewardRateCall = gaugeContract.try_reward_data(rewardToken);
    if (!rewardRateCall.reverted) {
      const rewardRate = rewardRateCall.value.rate;
      rewardRates.push(rewardRate);
    } else {
      rewardRates.push(constants.BIGINT_ZERO);
    }
  }
  return new types_1.RewardsInfoType(rewardTokens, rewardRates);
}
exports.getRewardsData = getRewardsData;
function updateControllerRewards(poolAddress, gaugeAddress, block) {
  const gaugeControllerContract = GaugeController_1.GaugeController.bind(
    constants.GAUGE_CONTROLLER_ADDRESS
  );
  // Returns BIGINT_ZERO if the weight is zero or the GaugeControllerContract is the childChainLiquidityGaugeFactory version.
  const gaugeRelativeWeight = utils
    .readValue(
      gaugeControllerContract.try_gauge_relative_weight(gaugeAddress),
      constants.BIGINT_ZERO
    )
    .divDecimal(
      constants.BIGINT_TEN.pow(
        constants.DEFAULT_DECIMALS.toI32()
      ).toBigDecimal()
    );
  // This essentially checks if the gauge is a GaugeController gauge instead of a childChainLiquidityGaugeFactory contract.
  if (gaugeRelativeWeight.equals(constants.BIGDECIMAL_ZERO)) {
    return;
  }
  const protocolToken = (0, initializers_1.getOrCreateRewardToken)(
    constants.PROTOCOL_TOKEN_ADDRESS,
    constants.RewardTokenType.DEPOSIT,
    block
  );
  // Get the rewards per day for this gauge
  const protocolTokenRewardEmissionsPerDay =
    protocolToken._inflationPerDay.times(gaugeRelativeWeight);
  updateRewardTokenEmissions(
    constants.PROTOCOL_TOKEN_ADDRESS,
    poolAddress,
    graph_ts_1.BigInt.fromString(
      protocolTokenRewardEmissionsPerDay.truncate(0).toString()
    ),
    block
  );
}
exports.updateControllerRewards = updateControllerRewards;
function updateStakedOutputTokenAmount(poolAddress, gaugeAddress, block) {
  // Update the staked output token amount for the pool ///////////
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(poolAddress, block);
  const gaugeContract = Gauge_1.Gauge.bind(gaugeAddress);
  const gaugeWorkingSupply = utils.readValue(
    gaugeContract.try_working_supply(),
    constants.BIGINT_ZERO
  );
  pool.stakedOutputTokenAmount = gaugeWorkingSupply;
  pool.save();
}
exports.updateStakedOutputTokenAmount = updateStakedOutputTokenAmount;
function updateFactoryRewards(poolAddress, gaugeAddress, block) {
  // Get data for all reward tokens for this gauge
  const rewardsInfo = getRewardsData(gaugeAddress);
  const rewardTokens = rewardsInfo.getRewardTokens;
  const rewardRates = rewardsInfo.getRewardRates;
  for (let i = 0; i < rewardTokens.length; i += 1) {
    const rewardToken = rewardTokens[i];
    const rewardRate = rewardRates[i];
    const rewardRatePerDay = (0, rewards_1.getRewardsPerDay)(
      block.timestamp,
      block.number,
      rewardRate.toBigDecimal(),
      constants.RewardIntervalType.TIMESTAMP
    );
    const rewardPerDay = graph_ts_1.BigInt.fromString(
      rewardRatePerDay.toString()
    );
    updateRewardTokenEmissions(rewardToken, poolAddress, rewardPerDay, block);
    graph_ts_1.log.warning(
      "[Rewards] Pool: {}, RewardToken: {}, RewardRate: {}",
      [
        poolAddress.toHexString(),
        rewardToken.toHexString(),
        rewardRatePerDay.toString(),
      ]
    );
  }
}
exports.updateFactoryRewards = updateFactoryRewards;
function updateRewardTokenEmissions(
  rewardTokenAddress,
  poolAddress,
  rewardTokenPerDay,
  block
) {
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(poolAddress, block);
  const rewardToken = (0, initializers_1.getOrCreateRewardToken)(
    rewardTokenAddress,
    constants.RewardTokenType.DEPOSIT,
    block
  );
  if (!pool.rewardTokens) {
    pool.rewardTokens = [];
  }
  const rewardTokens = pool.rewardTokens;
  if (!rewardTokens.includes(rewardToken.id)) {
    rewardTokens.push(rewardToken.id);
    pool.rewardTokens = rewardTokens;
  }
  const rewardTokenIndex = rewardTokens.indexOf(rewardToken.id);
  if (!pool.rewardTokenEmissionsAmount) {
    pool.rewardTokenEmissionsAmount = [];
  }
  const rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
  if (!pool.rewardTokenEmissionsUSD) {
    pool.rewardTokenEmissionsUSD = [];
  }
  const rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
  const rewardTokenPrice = (0, initializers_1.getOrCreateToken)(
    rewardTokenAddress,
    block.number
  );
  rewardTokenEmissionsAmount[rewardTokenIndex] = rewardTokenPerDay;
  rewardTokenEmissionsUSD[rewardTokenIndex] = rewardTokenPerDay
    .divDecimal(
      constants.BIGINT_TEN.pow(rewardTokenPrice.decimals).toBigDecimal()
    )
    .times(rewardTokenPrice.lastPriceUSD);
  pool.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
  pool.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
  pool.save();
}
exports.updateRewardTokenEmissions = updateRewardTokenEmissions;
function getPoolFromGauge(gaugeAddress) {
  const gaugeContract = Gauge_1.Gauge.bind(gaugeAddress);
  const poolAddress = (0, utils_1.readValue)(
    gaugeContract.try_lp_token(),
    constants.NULL.TYPE_ADDRESS
  );
  if (poolAddress.equals(constants.NULL.TYPE_ADDRESS)) return null;
  return poolAddress;
}
exports.getPoolFromGauge = getPoolFromGauge;
