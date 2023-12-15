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
exports.handleRewardPaid = exports.handleRewardAdded = void 0;
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const Fees_1 = require("../modules/Fees");
const prices_1 = require("../prices");
const constants = __importStar(require("../common/constants"));
const Revenue_1 = require("../modules/Revenue");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Metric_1 = require("../modules/Metric");
const Rewards_1 = require("../modules/Rewards");
function handleRewardAdded(event) {
  const context = graph_ts_1.dataSource.context();
  const poolId = graph_ts_1.BigInt.fromString(context.getString("poolId"));
  const crvRewardPoolAddress = event.address;
  const crvRewardTokenAddress = constants.CRV_TOKEN_ADDRESS;
  const crvRewardTokenPrice = (0, prices_1.getUsdPricePerToken)(
    crvRewardTokenAddress,
    event.block
  );
  const crvRewardTokenDecimals = utils.getTokenDecimals(crvRewardTokenAddress);
  const vault = (0, initializers_1.getOrCreateVault)(poolId, event.block);
  if (!vault) return;
  const rewardPoolInfo = (0, initializers_1.getOrCreateRewardPoolInfo)(
    poolId,
    crvRewardPoolAddress,
    event.block
  );
  const beforeHistoricalRewards = rewardPoolInfo.historicalRewards;
  const afterHistoricalRewards = (0, Rewards_1.getHistoricalRewards)(
    crvRewardPoolAddress
  );
  const rewardsEarned = afterHistoricalRewards.minus(beforeHistoricalRewards);
  const cvxRewardTokenAddress = constants.CONVEX_TOKEN_ADDRESS;
  const cvxRewardTokenPrice = (0, prices_1.getUsdPricePerToken)(
    cvxRewardTokenAddress,
    event.block
  );
  const cvxRewardTokenDecimals = utils.getTokenDecimals(cvxRewardTokenAddress);
  const cvxRewardsEarned = utils.getConvexTokenMintAmount(rewardsEarned);
  const cvxRewardEarnedUsd = cvxRewardsEarned
    .div(cvxRewardTokenDecimals)
    .times(cvxRewardTokenPrice.usdPrice)
    .truncate(1);
  const totalFeesConvex = (0, Fees_1.getTotalFees)();
  const totalRewardsEarned = rewardsEarned
    .toBigDecimal()
    .div(constants.BIGDECIMAL_ONE.minus(totalFeesConvex.totalFees()))
    .truncate(0);
  const lockFee = totalRewardsEarned.times(totalFeesConvex.lockIncentive); // incentive to crv stakers
  const callFee = totalRewardsEarned.times(totalFeesConvex.callIncentive); // incentive to users who spend gas to make calls
  const stakerFee = totalRewardsEarned.times(totalFeesConvex.stakerIncentive); // incentive to native token stakers
  const platformFee = totalRewardsEarned.times(totalFeesConvex.platformFee); // possible fee to build treasury
  const supplySideRevenue = rewardsEarned
    .toBigDecimal()
    .plus(lockFee)
    .div(crvRewardTokenDecimals)
    .truncate(0);
  const supplySideRevenueUSD = supplySideRevenue
    .times(crvRewardTokenPrice.usdPrice)
    .plus(cvxRewardEarnedUsd)
    .truncate(1);
  const protocolSideRevenue = stakerFee
    .plus(callFee)
    .plus(platformFee)
    .div(crvRewardTokenDecimals)
    .truncate(0);
  const protocolSideRevenueUSD = protocolSideRevenue
    .times(crvRewardTokenPrice.usdPrice)
    .truncate(1);
  rewardPoolInfo.historicalRewards = afterHistoricalRewards;
  rewardPoolInfo.lastRewardTimestamp = event.block.timestamp;
  rewardPoolInfo.save();
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    supplySideRevenueUSD,
    protocolSideRevenueUSD,
    event.block
  );
  (0, Rewards_1.updateRewardToken)(poolId, crvRewardPoolAddress, event.block);
  graph_ts_1.log.warning(
    "[RewardAdded] Pool: {}, totalRewardsEarned: {}, crvRewardsEarned: {}, cvxRewardsEarned: {}, \
    cvxRewardsEarnedUSD: {}, supplySideRevenue: {}, supplySideRevenueUSD: {}, protocolSideRevenue: {}, \
    protocolSideRevenueUSD: {}, TxHash: {}",
    [
      crvRewardPoolAddress.toHexString(),
      totalRewardsEarned.toString(),
      rewardsEarned.toString(),
      cvxRewardsEarned.toString(),
      cvxRewardEarnedUsd.toString(),
      supplySideRevenue.toString(),
      supplySideRevenueUSD.toString(),
      protocolSideRevenue.toString(),
      protocolSideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleRewardAdded = handleRewardAdded;
function handleRewardPaid(event) {
  const context = graph_ts_1.dataSource.context();
  const poolId = graph_ts_1.BigInt.fromString(context.getString("poolId"));
  const poolRewardsAddress = event.address;
  (0, Metric_1.updateFinancials)(event.block);
  (0, Metric_1.updateUsageMetrics)(event.block, event.transaction.from);
  (0, Rewards_1.updateRewardToken)(poolId, poolRewardsAddress, event.block);
}
exports.handleRewardPaid = handleRewardPaid;
