"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSwap =
  exports.handleBurn =
  exports.handleMint =
  exports.handleNewPair =
    void 0;
const helpers_1 = require("./helpers");
const metrics_1 = require("../common/metrics");
const rewards_1 = require("../common/rewards");
const constants_1 = require("../common/constants");
// To improve readability and consistency, it is recommended that you put all
// handlers in this file, and create helper functions to handle specific events
function handleNewPair(event) {
  (0, helpers_1.createLiquidityPool)(
    event,
    event.params.pair,
    event.params.token0,
    event.params.token1
  );
}
exports.handleNewPair = handleNewPair;
function handleMint(event) {
  (0, helpers_1.createDeposit)(
    event,
    event.params.amount0,
    event.params.amount1,
    event.params.sender
  );
  (0, metrics_1.updateUsageMetrics)(
    event,
    event.params.sender,
    constants_1.UsageType.DEPOSIT
  );
  (0, metrics_1.updateFinancials)(event);
  (0, metrics_1.updatePoolMetrics)(event);
}
exports.handleMint = handleMint;
function handleBurn(event) {
  (0, helpers_1.createWithdraw)(
    event,
    event.params.amount0,
    event.params.amount1,
    event.params.sender,
    event.params.to
  );
  (0, metrics_1.updateUsageMetrics)(
    event,
    event.transaction.from,
    constants_1.UsageType.WITHDRAW
  );
  (0, metrics_1.updateFinancials)(event);
  (0, metrics_1.updatePoolMetrics)(event);
  // INT_ONE and BLOCK for reward amount and interval type are arbitrary since uniswap does not have reward emissions
  (0, rewards_1.getRewardsPerDay)(
    event.block.timestamp,
    event.block.number,
    constants_1.BIGDECIMAL_ONE,
    rewards_1.RewardIntervalType.BLOCK
  );
}
exports.handleBurn = handleBurn;
function handleSwap(event) {
  (0, helpers_1.createSwapHandleVolumeAndFees)(
    event,
    event.params.to,
    event.params.sender,
    event.params.amount0In,
    event.params.amount1In,
    event.params.amount0Out,
    event.params.amount1Out
  );
  (0, metrics_1.updateFinancials)(event);
  (0, metrics_1.updatePoolMetrics)(event);
  (0, metrics_1.updateUsageMetrics)(
    event,
    event.params.sender,
    constants_1.UsageType.SWAP
  );
}
exports.handleSwap = handleSwap;
