"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRewardPrice = exports.updateMarketRewards = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const constants_2 = require("../../../src/constants");
const RToken_1 = require("../../../generated/LendingPool/RToken");
const ChefIncentivesController_1 = require("../../../generated/LendingPool/ChefIncentivesController");
const UniswapV2Pair_1 = require("../../../generated/LendingPool/UniswapV2Pair");
const manager_1 = require("../../../src/sdk/manager");
const token_1 = require("../../../src/sdk/token");
const helpers_1 = require("../../../src/helpers");
const constants_3 = require("../../../src/sdk/constants");
function updateMarketRewards(manager, event, rTokenContract) {
  const market = manager.getMarket();
  const TWELVE_HOURS = graph_ts_1.BigInt.fromI32(
    constants_2.SECONDS_PER_DAY / 2
  );
  if (
    market._lastRewardsUpdated &&
    !event.block.timestamp.minus(market._lastRewardsUpdated).gt(TWELVE_HOURS)
  ) {
    return;
  }
  const tryIncentiveController = rTokenContract.try_getIncentivesController();
  if (tryIncentiveController.reverted) {
    return;
  }
  const incentiveController =
    ChefIncentivesController_1.ChefIncentivesController.bind(
      tryIncentiveController.value
    );
  const tryDepPoolInfo = incentiveController.try_poolInfo(
    graph_ts_1.Address.fromBytes(market.outputToken)
  );
  const tryBorPoolInfo = incentiveController.try_poolInfo(
    graph_ts_1.Address.fromBytes(market._vToken)
  );
  const tryTotalAllocPoint = incentiveController.try_totalAllocPoint();
  const tryTotalRewardsPerSecond = incentiveController.try_rewardsPerSecond();
  if (
    tryDepPoolInfo.reverted ||
    tryBorPoolInfo.reverted ||
    tryTotalAllocPoint.reverted ||
    tryTotalRewardsPerSecond.reverted
  ) {
    return;
  }
  // create reward tokens
  const rewardTokenManager = new token_1.TokenManager(
    graph_ts_1.Address.fromString(constants_1.REWARD_TOKEN_ADDRESS),
    event
  );
  const rewardTokenVariableBorrow = rewardTokenManager.getOrCreateRewardToken(
    constants_3.RewardTokenType.VARIABLE_BORROW
  );
  const rewardTokenStableBorrow = rewardTokenManager.getOrCreateRewardToken(
    constants_3.RewardTokenType.STABLE_BORROW
  );
  const rewardTokenDeposit = rewardTokenManager.getOrCreateRewardToken(
    constants_3.RewardTokenType.DEPOSIT
  );
  // deposit rewards
  const depositRewardsPerSecond = tryTotalRewardsPerSecond.value
    .times(tryDepPoolInfo.value.value1)
    .div(tryTotalAllocPoint.value);
  const depositRewardsPerDay = depositRewardsPerSecond.times(
    graph_ts_1.BigInt.fromI32(constants_2.SECONDS_PER_DAY)
  );
  // borrow rewards
  const borrowRewardsPerSecond = tryTotalRewardsPerSecond.value
    .times(tryBorPoolInfo.value.value1)
    .div(tryTotalAllocPoint.value);
  const borrowRewardsPerDay = borrowRewardsPerSecond.times(
    graph_ts_1.BigInt.fromI32(constants_2.SECONDS_PER_DAY)
  );
  const rewardTokenPriceUSD = getRewardPrice();
  const depRewardsPerDayUSD = depositRewardsPerDay
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS))
    .times(rewardTokenPriceUSD);
  const borRewardsPerDayUSD = borrowRewardsPerDay
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS))
    .times(rewardTokenPriceUSD);
  const rewardDataVariableBorrow = new manager_1.RewardData(
    rewardTokenVariableBorrow,
    borrowRewardsPerDay,
    borRewardsPerDayUSD
  );
  const rewardDataStableBorrow = new manager_1.RewardData(
    rewardTokenStableBorrow,
    borrowRewardsPerDay,
    borRewardsPerDayUSD
  );
  const rewardDataDeposit = new manager_1.RewardData(
    rewardTokenDeposit,
    depositRewardsPerDay,
    depRewardsPerDayUSD
  );
  manager.updateRewards(rewardDataVariableBorrow);
  manager.updateRewards(rewardDataStableBorrow);
  manager.updateRewards(rewardDataDeposit);
  market._lastRewardsUpdated = event.block.timestamp;
  market.save();
}
exports.updateMarketRewards = updateMarketRewards;
// Radiant price is generated from WETH-RDNT reserve on Sushiswap.
function getRewardPrice() {
  const pair = UniswapV2Pair_1.UniswapV2Pair.bind(
    graph_ts_1.Address.fromString(constants_1.RDNT_WETH_Uniswap_Pair)
  );
  const reserves = pair.try_getReserves();
  if (reserves.reverted) {
    graph_ts_1.log.error("[getRewardPrice] Unable to get price for asset {}", [
      constants_1.REWARD_TOKEN_ADDRESS,
    ]);
    return constants_2.BIGDECIMAL_ZERO;
  }
  const reserveRDNT = reserves.value.value0;
  const reserveWETH = reserves.value.value1;
  const priceInWETH = reserveWETH
    .toBigDecimal()
    .div(reserveRDNT.toBigDecimal());
  // get WETH price in USD from aToken contract.
  const rToken = RToken_1.RToken.bind(
    graph_ts_1.Address.fromString(constants_1.RWETH_ADDRESS)
  );
  const call = rToken.try_getAssetPrice();
  return call.reverted
    ? constants_2.BIGDECIMAL_ZERO
    : call.value
        .toBigDecimal()
        .div((0, helpers_1.exponentToBigDecimal)(constants_1.rTOKEN_DECIMALS))
        .times(priceInWETH);
}
exports.getRewardPrice = getRewardPrice;
