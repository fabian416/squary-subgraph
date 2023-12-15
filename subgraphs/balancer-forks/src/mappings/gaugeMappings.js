"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdateLiquidityLimit =
  exports.handleWithdraw =
  exports.handleDeposit =
    void 0;
const Metrics_1 = require("../modules/Metrics");
const Rewards_1 = require("../modules/Rewards");
function handleDeposit(event) {
  const gaugeAddress = event.address;
  const provider = event.params.provider;
  const poolAddress = (0, Rewards_1.getPoolFromGauge)(gaugeAddress);
  if (!poolAddress) return;
  (0, Rewards_1.updateStakedOutputTokenAmount)(
    poolAddress,
    gaugeAddress,
    event.block
  );
  (0, Rewards_1.updateControllerRewards)(
    poolAddress,
    gaugeAddress,
    event.block
  );
  (0, Rewards_1.updateFactoryRewards)(poolAddress, gaugeAddress, event.block);
  (0, Metrics_1.updateUsageMetrics)(event.block, provider);
  (0, Metrics_1.updatePoolSnapshots)(poolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
  const gaugeAddress = event.address;
  const provider = event.params.provider;
  const poolAddress = (0, Rewards_1.getPoolFromGauge)(gaugeAddress);
  if (!poolAddress) return;
  (0, Rewards_1.updateStakedOutputTokenAmount)(
    poolAddress,
    gaugeAddress,
    event.block
  );
  (0, Rewards_1.updateControllerRewards)(
    poolAddress,
    gaugeAddress,
    event.block
  );
  (0, Rewards_1.updateFactoryRewards)(poolAddress, gaugeAddress, event.block);
  (0, Metrics_1.updateUsageMetrics)(event.block, provider);
  (0, Metrics_1.updatePoolSnapshots)(poolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleWithdraw = handleWithdraw;
function handleUpdateLiquidityLimit(event) {
  const gaugeAddress = event.address;
  const poolAddress = (0, Rewards_1.getPoolFromGauge)(gaugeAddress);
  if (!poolAddress) return;
  (0, Rewards_1.updateStakedOutputTokenAmount)(
    poolAddress,
    gaugeAddress,
    event.block
  );
  (0, Rewards_1.updateControllerRewards)(
    poolAddress,
    gaugeAddress,
    event.block
  );
  (0, Rewards_1.updateFactoryRewards)(poolAddress, gaugeAddress, event.block);
}
exports.handleUpdateLiquidityLimit = handleUpdateLiquidityLimit;
