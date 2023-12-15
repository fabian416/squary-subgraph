"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWithdraw = exports.handleDeposit = void 0;
const Rewards_1 = require("../modules/Rewards");
const utils_1 = require("../common/utils");
function handleDeposit(event) {
  const gaugeAddress = event.address;
  const poolAddress = (0, utils_1.getPoolFromGauge)(gaugeAddress);
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
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
  const gaugeAddress = event.address;
  const poolAddress = (0, utils_1.getPoolFromGauge)(gaugeAddress);
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
exports.handleWithdraw = handleWithdraw;
