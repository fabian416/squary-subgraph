"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRewardAdd =
  exports.createFeesUpdate =
  exports.createWithdraw =
  exports.createDeposit =
  exports.createPoolShutdown =
  exports.createPoolAdd =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const getters_1 = require("../common/getters");
const constants_1 = require("../common/constants");
const numbers_1 = require("../common/utils/numbers");
const ethereum_1 = require("../common/utils/ethereum");
const strings_1 = require("../common/utils/strings");
const arrays_1 = require("../common/utils/arrays");
const metrics_1 = require("../common/metrics");
const transactions_1 = require("../common/transactions");
const types_1 = require("../common/types");
const ERC20_1 = require("../../generated/Booster-v1/ERC20");
const BaseRewardPool_1 = require("../../generated/Booster-v1/BaseRewardPool");
function createPoolAdd(boosterAddr, event) {
  const protocol = (0, getters_1.getOrCreateYieldAggregator)();
  const poolId = event.params.pid;
  const vault = (0, getters_1.getOrCreateVault)(boosterAddr, poolId, event);
  if (!vault) return;
  protocol.totalPoolCount += 1;
  protocol._vaultIds = (0, arrays_1.addToArrayAtIndex)(
    protocol._vaultIds,
    vault.id
  );
  protocol._activePoolCount = protocol._activePoolCount.plus(
    constants_1.BIGINT_ONE
  );
  protocol.save();
}
exports.createPoolAdd = createPoolAdd;
function createPoolShutdown(boosterAddr, event) {
  const protocol = (0, getters_1.getOrCreateYieldAggregator)();
  const poolId = event.params.poolId;
  const vault = (0, getters_1.getOrCreateVault)(boosterAddr, poolId, event);
  if (!vault) return;
  vault._active = false;
  vault.save();
  protocol._activePoolCount = protocol._activePoolCount.minus(
    constants_1.BIGINT_ONE
  );
  protocol.save();
}
exports.createPoolShutdown = createPoolShutdown;
function createDeposit(boosterAddr, poolId, event) {
  const vault = (0, getters_1.getOrCreateVault)(boosterAddr, poolId, event);
  if (!vault) return;
  const inputToken = (0, getters_1.getOrCreateBalancerPoolToken)(
    graph_ts_1.Address.fromString(vault.inputToken),
    event.block.number
  );
  const depositAmount = event.params.amount;
  const depositAmountUSD = (0, numbers_1.bigIntToBigDecimal)(
    depositAmount,
    inputToken.decimals
  ).times(inputToken.lastPriceUSD);
  vault.inputTokenBalance = vault.inputTokenBalance.plus(depositAmount);
  vault.totalValueLockedUSD = (0, numbers_1.bigIntToBigDecimal)(
    vault.inputTokenBalance,
    inputToken.decimals
  ).times(inputToken.lastPriceUSD);
  const outputToken = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(vault.outputToken),
    event.block.number
  );
  const outputTokenContract = ERC20_1.ERC20.bind(
    graph_ts_1.Address.fromString(vault.outputToken)
  );
  vault.outputTokenSupply = (0, ethereum_1.readValue)(
    outputTokenContract.try_totalSupply(),
    constants_1.BIGINT_ZERO
  );
  vault.outputTokenPriceUSD =
    vault.outputTokenSupply != constants_1.BIGINT_ZERO
      ? vault.totalValueLockedUSD.div(
          (0, numbers_1.bigIntToBigDecimal)(
            vault.outputTokenSupply,
            outputToken.decimals
          )
        )
      : constants_1.BIGDECIMAL_ZERO;
  const rewardPoolContract = BaseRewardPool_1.BaseRewardPool.bind(
    graph_ts_1.Address.fromString(vault._balRewards)
  );
  vault.pricePerShare = (0, ethereum_1.readValue)(
    rewardPoolContract.try_convertToAssets(constants_1.BIGINT_ONE),
    constants_1.BIGINT_ZERO
  )
    .toBigDecimal()
    .times(constants_1.BIGDECIMAL_1E18);
  vault.save();
  (0, transactions_1.createDepositTransaction)(
    vault,
    depositAmount,
    depositAmountUSD,
    event
  );
  (0, metrics_1.updateProtocolTotalValueLockedUSD)();
  (0, metrics_1.updateUsageMetricsAfterDeposit)(event);
}
exports.createDeposit = createDeposit;
function createWithdraw(boosterAddr, poolId, event) {
  const vault = (0, getters_1.getOrCreateVault)(boosterAddr, poolId, event);
  if (!vault) return;
  const inputToken = (0, getters_1.getOrCreateBalancerPoolToken)(
    graph_ts_1.Address.fromString(vault.inputToken),
    event.block.number
  );
  const withdrawAmount = event.params.amount;
  const withdrawAmountUSD = (0, numbers_1.bigIntToBigDecimal)(
    withdrawAmount,
    inputToken.decimals
  ).times(inputToken.lastPriceUSD);
  vault.inputTokenBalance = vault.inputTokenBalance.minus(withdrawAmount);
  vault.totalValueLockedUSD = (0, numbers_1.bigIntToBigDecimal)(
    vault.inputTokenBalance,
    inputToken.decimals
  ).times(inputToken.lastPriceUSD);
  const outputToken = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(vault.outputToken),
    event.block.number
  );
  const outputTokenContract = ERC20_1.ERC20.bind(
    graph_ts_1.Address.fromString(vault.outputToken)
  );
  vault.outputTokenSupply = (0, ethereum_1.readValue)(
    outputTokenContract.try_totalSupply(),
    constants_1.BIGINT_ZERO
  );
  vault.outputTokenPriceUSD =
    vault.outputTokenSupply != constants_1.BIGINT_ZERO
      ? vault.totalValueLockedUSD.div(
          (0, numbers_1.bigIntToBigDecimal)(
            vault.outputTokenSupply,
            outputToken.decimals
          )
        )
      : constants_1.BIGDECIMAL_ZERO;
  const rewardPoolContract = BaseRewardPool_1.BaseRewardPool.bind(
    graph_ts_1.Address.fromString(vault._balRewards)
  );
  vault.pricePerShare = (0, ethereum_1.readValue)(
    rewardPoolContract.try_convertToAssets(constants_1.BIGINT_ONE),
    constants_1.BIGINT_ZERO
  )
    .toBigDecimal()
    .times(constants_1.BIGDECIMAL_1E18);
  vault.save();
  (0, transactions_1.createWithdrawTransaction)(
    vault,
    withdrawAmount,
    withdrawAmountUSD,
    event
  );
  (0, metrics_1.updateProtocolTotalValueLockedUSD)();
  (0, metrics_1.updateUsageMetricsAfterWithdraw)(event);
}
exports.createWithdraw = createWithdraw;
function createFeesUpdate(boosterAddr, event) {
  const newFees = new types_1.CustomFeesType(
    event.params.lockIncentive,
    event.params.earmarkIncentive,
    event.params.stakerIncentive,
    event.params.platformFee
  );
  const performanceFeeId = (0, strings_1.prefixID)(
    constants_1.VaultFeeType.PERFORMANCE_FEE,
    boosterAddr.toHexString()
  );
  (0, getters_1.getOrCreateFeeType)(
    performanceFeeId,
    constants_1.VaultFeeType.PERFORMANCE_FEE,
    newFees.totalFees()
  );
}
exports.createFeesUpdate = createFeesUpdate;
function createRewardAdd(boosterAddr, poolId, event) {
  const rewardPoolAddr = event.address;
  const rewardPool = (0, getters_1.getOrCreateRewardPool)(
    poolId,
    rewardPoolAddr,
    event.block
  );
  const rewardsEarned = rewardPool.lastAddedRewards;
  const fees = (0, getters_1.getFees)(boosterAddr);
  const totalFees = fees.totalFees();
  const totalRewardsEarned = rewardsEarned
    .toBigDecimal()
    .div(constants_1.BIGDECIMAL_ONE.minus(totalFees));
  const balToken = (0, getters_1.getOrCreateToken)(
    constants_1.BAL_TOKEN_ADDR,
    event.block.number
  );
  const totalRevenueUSD = totalRewardsEarned
    .times(balToken.lastPriceUSD)
    .div(graph_ts_1.BigInt.fromI32(10).pow(balToken.decimals).toBigDecimal());
  (0, metrics_1.updateRevenue)(
    boosterAddr,
    poolId,
    totalRevenueUSD,
    totalFees,
    event
  );
  (0, metrics_1.updateRewards)(boosterAddr, poolId, rewardPoolAddr, event);
}
exports.createRewardAdd = createRewardAdd;
