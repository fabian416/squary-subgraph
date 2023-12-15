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
  exports.updateExtraRewardTokens =
  exports.updateRewardToken =
  exports.updateConvexRewardToken =
  exports.getHistoricalRewards =
    void 0;
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const prices_1 = require("../prices");
const constants = __importStar(require("../common/constants"));
const rewards_1 = require("../common/rewards");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const BaseRewardPool_1 = require("../../generated/Booster/BaseRewardPool");
function getHistoricalRewards(rewardTokenPool) {
  const rewardsContract = BaseRewardPool_1.BaseRewardPool.bind(rewardTokenPool);
  const historicalRewards = utils.readValue(
    rewardsContract.try_historicalRewards(),
    constants.BIGINT_ZERO
  );
  return historicalRewards;
}
exports.getHistoricalRewards = getHistoricalRewards;
function updateConvexRewardToken(poolId, crvRewardPerDay, block) {
  const cvxRewardRate = utils.getConvexTokenMintAmount(crvRewardPerDay);
  const cvxRewardRatePerDay = (0, rewards_1.getRewardsPerDay)(
    block.timestamp,
    block.number,
    cvxRewardRate,
    constants.RewardIntervalType.TIMESTAMP
  );
  const cvxRewardPerDay = graph_ts_1.BigInt.fromString(
    cvxRewardRatePerDay.truncate(0).toString()
  );
  updateRewardTokenEmissions(
    poolId,
    constants.CONVEX_TOKEN_ADDRESS,
    cvxRewardPerDay,
    block
  );
  graph_ts_1.log.warning(
    "[cvxRewards] poolId: {}, cvxRewardRate: {}, cvxRewardPerDay: {}",
    [poolId.toString(), cvxRewardRate.toString(), cvxRewardPerDay.toString()]
  );
}
exports.updateConvexRewardToken = updateConvexRewardToken;
function updateRewardToken(poolId, poolRewardsAddress, block) {
  const rewardsContract =
    BaseRewardPool_1.BaseRewardPool.bind(poolRewardsAddress);
  const rewardToken = utils.readValue(
    rewardsContract.try_rewardToken(),
    constants.NULL.TYPE_ADDRESS
  );
  const rewardRate = utils.readValue(
    rewardsContract.try_rewardRate(),
    constants.BIGINT_ZERO
  );
  if (rewardToken.equals(constants.CRV_TOKEN_ADDRESS)) {
    updateConvexRewardToken(poolId, rewardRate, block);
  }
  const rewardRatePerDay = (0, rewards_1.getRewardsPerDay)(
    block.timestamp,
    block.number,
    rewardRate.toBigDecimal(),
    constants.RewardIntervalType.TIMESTAMP
  );
  const rewardPerDay = graph_ts_1.BigInt.fromString(
    rewardRatePerDay.toString()
  );
  updateRewardTokenEmissions(poolId, rewardToken, rewardPerDay, block);
  graph_ts_1.log.warning(
    "[Rewards] poolId: {}, RewardToken: {}, RewardRate: {}",
    [poolId.toString(), rewardToken.toHexString(), rewardRatePerDay.toString()]
  );
  updateExtraRewardTokens(poolId, poolRewardsAddress, block);
}
exports.updateRewardToken = updateRewardToken;
function updateExtraRewardTokens(poolId, poolRewardsAddress, block) {
  const rewardsContract =
    BaseRewardPool_1.BaseRewardPool.bind(poolRewardsAddress);
  const extraRewardTokensLength = utils.readValue(
    rewardsContract.try_extraRewardsLength(),
    constants.BIGINT_ZERO
  );
  for (let i = 0; i < extraRewardTokensLength.toI32(); i += 1) {
    const extraRewardPoolAddress = utils.readValue(
      rewardsContract.try_extraRewards(graph_ts_1.BigInt.fromI32(i)),
      constants.NULL.TYPE_ADDRESS
    );
    const extraRewardContract = BaseRewardPool_1.BaseRewardPool.bind(
      extraRewardPoolAddress
    );
    const extraRewardTokenAddress = utils.readValue(
      extraRewardContract.try_rewardToken(),
      constants.NULL.TYPE_ADDRESS
    );
    const extraTokenRewardRate = utils.readValue(
      extraRewardContract.try_rewardRate(),
      constants.BIGINT_ZERO
    );
    const rewardRatePerDay = (0, rewards_1.getRewardsPerDay)(
      block.timestamp,
      block.number,
      extraTokenRewardRate.toBigDecimal(),
      constants.RewardIntervalType.TIMESTAMP
    );
    const rewardPerDay = graph_ts_1.BigInt.fromString(
      rewardRatePerDay.toString()
    );
    updateRewardTokenEmissions(
      poolId,
      extraRewardTokenAddress,
      rewardPerDay,
      block
    );
    graph_ts_1.log.warning(
      "[ExtraRewards] poolId: {}, ExtraRewardToken: {}, RewardRate: {}",
      [
        poolId.toString(),
        extraRewardTokenAddress.toHexString(),
        rewardRatePerDay.toString(),
      ]
    );
  }
}
exports.updateExtraRewardTokens = updateExtraRewardTokens;
function updateRewardTokenEmissions(
  poolId,
  rewardTokenAddress,
  rewardTokenPerDay,
  block
) {
  const vault = (0, initializers_1.getOrCreateVault)(poolId, block);
  if (!vault) return;
  const rewardToken = (0, initializers_1.getOrCreateRewardToken)(
    rewardTokenAddress
  );
  if (!vault.rewardTokens) {
    vault.rewardTokens = [];
  }
  const rewardTokens = vault.rewardTokens;
  if (!rewardTokens.includes(rewardToken.id)) {
    rewardTokens.push(rewardToken.id);
    vault.rewardTokens = rewardTokens;
  }
  const rewardTokenIndex = rewardTokens.indexOf(rewardToken.id);
  if (!vault.rewardTokenEmissionsAmount) {
    vault.rewardTokenEmissionsAmount = [];
  }
  const rewardTokenEmissionsAmount = vault.rewardTokenEmissionsAmount;
  if (!vault.rewardTokenEmissionsUSD) {
    vault.rewardTokenEmissionsUSD = [];
  }
  const rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
  const rewardTokenPrice = (0, prices_1.getUsdPricePerToken)(
    rewardTokenAddress,
    block
  );
  const rewardTokenDecimals = utils.getTokenDecimals(rewardTokenAddress);
  rewardTokenEmissionsAmount[rewardTokenIndex] = rewardTokenPerDay;
  rewardTokenEmissionsUSD[rewardTokenIndex] = rewardTokenPerDay
    .toBigDecimal()
    .div(rewardTokenDecimals)
    .times(rewardTokenPrice.usdPrice);
  vault.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
  vault.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
  vault.save();
}
exports.updateRewardTokenEmissions = updateRewardTokenEmissions;
