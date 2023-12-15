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
  exports.handleStakingV2 =
  exports.handleStakingV1 =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const rewards_1 = require("../common/rewards");
const Staking_1 = require("../../generated/Staking/Staking");
const StakingV2_1 = require("../../generated/StakingV2/StakingV2");
function handleStakingV1(poolId, block) {
  const stakingContract = Staking_1.Staking.bind(
    graph_ts_1.Address.fromString(constants.STAKING_V1)
  );
  const poolInfoCall = stakingContract.try_poolInfo(poolId);
  if (poolInfoCall.reverted) {
    return;
  }
  const allocPoint = poolInfoCall.value.getAllocPoint();
  const lpTokenAddress = poolInfoCall.value.getLpToken();
  const poolAddress = utils.getMinterFromLpToken(lpTokenAddress);
  if (poolAddress == constants.ADDRESS_ZERO) {
    graph_ts_1.log.error("pool address not found for lpToken: {}", [
      lpTokenAddress.toHexString(),
    ]);
    return;
  }
  const totalAllocPoint = utils
    .readValue(stakingContract.try_totalAllocPoint(), constants.BIGINT_ZERO)
    .toBigDecimal();
  if (totalAllocPoint.equals(constants.BIGDECIMAL_ZERO)) return;
  const contractRewardsPerSecond = utils.readValue(
    stakingContract.try_rewardsPerSecond(),
    constants.BIGINT_ZERO
  );
  const rewardsPerSecond = allocPoint
    .times(contractRewardsPerSecond)
    .divDecimal(totalAllocPoint);
  const rewardTokensPerDay = (0, rewards_1.getRewardsPerDay)(
    block.timestamp,
    block.number,
    rewardsPerSecond,
    constants.RewardIntervalType.TIMESTAMP
  );
  updateRewardTokenEmissions(
    constants.EPS_ADDRESS,
    poolAddress,
    graph_ts_1.BigInt.fromString(rewardTokensPerDay.truncate(0).toString()),
    block
  );
}
exports.handleStakingV1 = handleStakingV1;
function handleStakingV2(lpTokenAddress, block) {
  const poolAddress = utils.getMinterFromLpToken(lpTokenAddress);
  if (poolAddress == constants.ADDRESS_ZERO) {
    return;
  }
  const stakingContractV2 = StakingV2_1.StakingV2.bind(
    graph_ts_1.Address.fromString(constants.STAKING_V2)
  );
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(poolAddress, block);
  graph_ts_1.log.warning("[handleStakingV2] Pool Id{}", [pool.id]);
  const poolInfoCall = stakingContractV2.try_poolInfo(lpTokenAddress);
  if (poolInfoCall.reverted) return;
  const rewardsPerSecond = graph_ts_1.BigDecimal.fromString(
    poolInfoCall.value.getRewardsPerSecond().toString()
  );
  const adjustedSupply = poolInfoCall.value.getAdjustedSupply();
  if (adjustedSupply) {
    pool.stakedOutputTokenAmount = adjustedSupply;
    pool.save();
  }
  const rewardTokensPerDay = (0, rewards_1.getRewardsPerDay)(
    block.timestamp,
    block.number,
    rewardsPerSecond,
    constants.RewardIntervalType.TIMESTAMP
  );
  updateRewardTokenEmissions(
    constants.EPX_ADDRESS,
    poolAddress,
    graph_ts_1.BigInt.fromString(rewardTokensPerDay.truncate(0).toString()),
    block
  );
}
exports.handleStakingV2 = handleStakingV2;
function updateRewardTokenEmissions(
  rewardTokenAddress,
  poolAddress,
  rewardTokenPerDay,
  block
) {
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(poolAddress, block);
  (0, initializers_1.getOrCreateRewardToken)(rewardTokenAddress, block);
  const rewardToken = (0, initializers_1.getOrCreateToken)(
    rewardTokenAddress,
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
  const token = (0, initializers_1.getOrCreateToken)(rewardTokenAddress, block);
  rewardTokenEmissionsAmount[rewardTokenIndex] = rewardTokenPerDay;
  rewardTokenEmissionsUSD[rewardTokenIndex] = rewardTokenPerDay
    .toBigDecimal()
    .div(constants.BIGINT_TEN.pow(token.decimals).toBigDecimal())
    .times(token.lastPriceUSD);
  pool.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
  pool.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
  pool.save();
}
exports.updateRewardTokenEmissions = updateRewardTokenEmissions;
