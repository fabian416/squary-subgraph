"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEmergencyWithdrawV2 =
  exports.handleWithdrawV2 =
  exports.handleDepositV2 =
  exports.handleEmergencyWithdraw =
  exports.handleWithdraw =
  exports.handleDeposit =
    void 0;
const Rewards_1 = require("../modules/Rewards");
function handleDeposit(event) {
  const poolId = event.params.pid;
  (0, Rewards_1.handleStakingV1)(poolId, event.block);
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
  const poolId = event.params.pid;
  (0, Rewards_1.handleStakingV1)(poolId, event.block);
}
exports.handleWithdraw = handleWithdraw;
function handleEmergencyWithdraw(event) {
  const poolId = event.params.pid;
  (0, Rewards_1.handleStakingV1)(poolId, event.block);
}
exports.handleEmergencyWithdraw = handleEmergencyWithdraw;
function handleDepositV2(event) {
  const token = event.params.token;
  (0, Rewards_1.handleStakingV2)(token, event.block);
}
exports.handleDepositV2 = handleDepositV2;
function handleWithdrawV2(event) {
  const token = event.params.token;
  (0, Rewards_1.handleStakingV2)(token, event.block);
}
exports.handleWithdrawV2 = handleWithdrawV2;
function handleEmergencyWithdrawV2(event) {
  const token = event.params.token;
  (0, Rewards_1.handleStakingV2)(token, event.block);
}
exports.handleEmergencyWithdrawV2 = handleEmergencyWithdrawV2;
