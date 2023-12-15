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
exports.updateRewardTokenEmissions =
  exports.updateFactoryRewards =
  exports.updateControllerRewards =
  exports.updateStakedOutputTokenAmount =
  exports.getRewardsData_v3 =
  exports.getRewardsData_v2 =
  exports.getRewardsData_v1 =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const rewards_1 = require("../common/rewards");
const types_1 = require("../common/types");
const Rewards_1 = require("../../generated/templates/PoolTemplate/Rewards");
const Gauge_1 = require("../../generated/templates/LiquidityGauge/Gauge");
const GaugeController_1 = require("../../generated/GaugeController/GaugeController");
function getRewardsData_v1(gaugeAddress, block) {
  const rewardRates = [];
  const rewardTokens = [];
  const gaugeContract = Gauge_1.Gauge.bind(gaugeAddress);
  const rewardCount = utils.readValue(
    gaugeContract.try_reward_count(),
    constants.BIGINT_ZERO
  );
  for (let idx = 0; idx < rewardCount.toI32(); idx++) {
    const rewardToken = utils.readValue(
      gaugeContract.try_reward_tokens(graph_ts_1.BigInt.fromI32(idx)),
      constants.NULL.TYPE_ADDRESS
    );
    if (rewardToken.equals(constants.NULL.TYPE_ADDRESS)) continue;
    rewardTokens.push(rewardToken);
    const rewardData = new types_1.RewardData(gaugeAddress, rewardToken);
    if (rewardData.getPeriodFinish.lt(block.timestamp)) {
      rewardRates.push(constants.BIGINT_ZERO);
    } else {
      rewardRates.push(rewardData.getRewardRate);
    }
  }
  return new types_1.RewardsInfoType(rewardTokens, rewardRates);
}
exports.getRewardsData_v1 = getRewardsData_v1;
function getRewardsData_v2(gaugeAddress) {
  const gaugeContract = Gauge_1.Gauge.bind(gaugeAddress);
  let rewardToken = utils.readValue(
    gaugeContract.try_rewarded_token(),
    constants.NULL.TYPE_ADDRESS
  );
  if (rewardToken.equals(constants.NULL.TYPE_ADDRESS)) {
    rewardToken = utils.readValue(
      gaugeContract.try_reward_tokens(constants.BIGINT_ZERO),
      constants.NULL.TYPE_ADDRESS
    );
    if (rewardToken.equals(constants.NULL.TYPE_ADDRESS))
      return new types_1.RewardsInfoType([], []);
  }
  const rewardContractAddress = utils.readValue(
    gaugeContract.try_reward_contract(),
    constants.NULL.TYPE_ADDRESS
  );
  if (rewardContractAddress.equals(constants.NULL.TYPE_ADDRESS))
    return new types_1.RewardsInfoType([], []);
  const rewardsContract = Rewards_1.Rewards.bind(rewardContractAddress);
  const rewardRate = utils.readValue(
    rewardsContract.try_rewardRate(),
    constants.BIGINT_ZERO
  );
  return new types_1.RewardsInfoType([rewardToken], [rewardRate]);
}
exports.getRewardsData_v2 = getRewardsData_v2;
function getRewardsData_v3(gaugeAddress, block) {
  const rewardRates = [];
  const rewardTokens = [];
  const gaugeContract = Gauge_1.Gauge.bind(gaugeAddress);
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  for (let idx = 0; idx < 5; idx++) {
    const rewardToken = utils.readValue(
      gaugeContract.try_reward_tokens(graph_ts_1.BigInt.fromI32(idx)),
      constants.NULL.TYPE_ADDRESS
    );
    if (rewardToken.equals(constants.NULL.TYPE_ADDRESS)) {
      return new types_1.RewardsInfoType(rewardTokens, rewardRates);
    }
    rewardTokens.push(rewardToken);
    const rewardData = new types_1.RewardData(gaugeAddress, rewardToken);
    if (rewardData.getPeriodFinish.lt(block.timestamp)) {
      rewardRates.push(constants.BIGINT_ZERO);
    } else {
      rewardRates.push(rewardData.getRewardRate);
    }
  }
  return new types_1.RewardsInfoType(rewardTokens, rewardRates);
}
exports.getRewardsData_v3 = getRewardsData_v3;
function updateStakedOutputTokenAmount(poolAddress, gaugeAddress, block) {
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
function updateControllerRewards(poolAddress, gaugeAddress, block) {
  const gaugeContract = Gauge_1.Gauge.bind(gaugeAddress);
  const gaugeControllerContract = GaugeController_1.GaugeController.bind(
    constants.GAUGE_CONTROLLER_ADDRESS
  );
  let inflationRate = utils
    .readValue(gaugeContract.try_inflation_rate(), constants.BIGINT_ZERO)
    .toBigDecimal();
  let gaugeRelativeWeight = utils
    .readValue(
      gaugeControllerContract.try_gauge_relative_weight(gaugeAddress),
      constants.BIGINT_ZERO
    )
    .divDecimal(utils.exponentToBigDecimal(constants.DEFAULT_DECIMALS.toI32()));
  if (
    !utils.equalsIgnoreCase(
      graph_ts_1.dataSource.network(),
      constants.Network.MAINNET
    )
  ) {
    const lastRequest = utils.readValue(
      gaugeControllerContract.try_last_request(gaugeAddress),
      constants.BIGINT_ZERO
    );
    const weekNumber = lastRequest.div(constants.NUMBER_OF_WEEKS_DENOMINATOR);
    inflationRate = utils
      .readValue(
        gaugeContract.try_inflation_rate1(weekNumber),
        constants.BIGINT_ZERO
      )
      .toBigDecimal();
    gaugeRelativeWeight = constants.BIGDECIMAL_POINT_FOUR;
  }
  // Get the rewards per day for this gauge
  const protocolTokenRewardEmissionsPerDay = inflationRate
    .times(gaugeRelativeWeight)
    .times(constants.BIG_DECIMAL_SECONDS_PER_DAY);
  updateRewardTokenEmissions(
    constants.CRV_TOKEN_ADDRESS,
    poolAddress,
    graph_ts_1.BigInt.fromString(
      protocolTokenRewardEmissionsPerDay.truncate(0).toString()
    ),
    block
  );
}
exports.updateControllerRewards = updateControllerRewards;
function updateFactoryRewards(poolAddress, gaugeAddress, block) {
  let rewardsInfo = getRewardsData_v1(gaugeAddress, block);
  if (rewardsInfo.isEmpty()) {
    rewardsInfo = getRewardsData_v2(gaugeAddress);
  }
  if (rewardsInfo.isEmpty()) {
    rewardsInfo = getRewardsData_v3(gaugeAddress, block);
  }
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
    block
  );
  if (!pool.rewardTokens) {
    pool.rewardTokens = [];
  }
  const rewardTokens = pool.rewardTokens;
  if (!rewardTokens.includes(rewardToken.id)) {
    rewardTokens.push(rewardToken.id);
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
  const token = (0, initializers_1.getOrCreateToken)(
    rewardTokenAddress,
    block,
    true
  );
  rewardTokenEmissionsAmount[rewardTokenIndex] = rewardTokenPerDay;
  rewardTokenEmissionsUSD[rewardTokenIndex] = rewardTokenPerDay
    .divDecimal(utils.exponentToBigDecimal(token.decimals))
    .times(token.lastPriceUSD);
  pool.rewardTokens = rewardTokens;
  pool.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
  pool.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
  utils.sortRewardTokens(pool);
  pool.save();
}
exports.updateRewardTokenEmissions = updateRewardTokenEmissions;
