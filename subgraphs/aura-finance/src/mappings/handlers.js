"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRewardPaid =
  exports.handleRewardAdded =
  exports.handleFeesUpdated =
  exports.handleWithdrawn =
  exports.handleDeposited =
  exports.handlePoolShutdown =
  exports.handlePoolAdded =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const helpers_1 = require("./helpers");
const metrics_1 = require("../common/metrics");
const constants_1 = require("../common/constants");
const BaseRewardPool_1 = require("../../generated/Booster-v1/BaseRewardPool");
function handlePoolAdded(event) {
  const boosterAddr = graph_ts_1.dataSource.address();
  (0, helpers_1.createPoolAdd)(boosterAddr, event);
}
exports.handlePoolAdded = handlePoolAdded;
function handlePoolShutdown(event) {
  const boosterAddr = graph_ts_1.dataSource.address();
  (0, helpers_1.createPoolShutdown)(boosterAddr, event);
}
exports.handlePoolShutdown = handlePoolShutdown;
function handleDeposited(event) {
  const boosterAddr = graph_ts_1.dataSource.address();
  const poolId = event.params.poolid;
  (0, helpers_1.createDeposit)(boosterAddr, poolId, event);
  (0, metrics_1.updateUsageMetrics)(event);
  (0, metrics_1.updateFinancials)(event);
  (0, metrics_1.updateVaultSnapshots)(boosterAddr, poolId, event);
}
exports.handleDeposited = handleDeposited;
function handleWithdrawn(event) {
  const boosterAddr = graph_ts_1.dataSource.address();
  const poolId = event.params.poolid;
  (0, helpers_1.createWithdraw)(boosterAddr, poolId, event);
  (0, metrics_1.updateFinancials)(event);
  (0, metrics_1.updateUsageMetrics)(event);
  (0, metrics_1.updateVaultSnapshots)(boosterAddr, poolId, event);
}
exports.handleWithdrawn = handleWithdrawn;
function handleFeesUpdated(event) {
  const boosterAddr = graph_ts_1.dataSource.address();
  (0, helpers_1.createFeesUpdate)(boosterAddr, event);
}
exports.handleFeesUpdated = handleFeesUpdated;
function handleRewardAdded(event) {
  const context = graph_ts_1.dataSource.context();
  const poolId = graph_ts_1.BigInt.fromString(context.getString("poolId"));
  const rewardPoolAddr = event.address;
  const rewardPoolContract =
    BaseRewardPool_1.BaseRewardPool.bind(rewardPoolAddr);
  const operatorCall = rewardPoolContract.try_operator();
  let boosterAddr = graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS);
  if (!operatorCall.reverted) {
    boosterAddr = operatorCall.value;
  }
  (0, helpers_1.createRewardAdd)(boosterAddr, poolId, event);
  (0, metrics_1.updateFinancials)(event);
  (0, metrics_1.updateVaultSnapshots)(boosterAddr, poolId, event);
}
exports.handleRewardAdded = handleRewardAdded;
function handleRewardPaid(event) {
  const context = graph_ts_1.dataSource.context();
  const poolId = graph_ts_1.BigInt.fromString(context.getString("poolId"));
  const rewardPoolAddr = event.address;
  const rewardPoolContract =
    BaseRewardPool_1.BaseRewardPool.bind(rewardPoolAddr);
  const operatorCall = rewardPoolContract.try_operator();
  let boosterAddr = graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS);
  if (!operatorCall.reverted) {
    boosterAddr = operatorCall.value;
  }
  (0, metrics_1.updateRewards)(boosterAddr, poolId, rewardPoolAddr, event);
  (0, metrics_1.updateUsageMetrics)(event);
  (0, metrics_1.updateVaultSnapshots)(boosterAddr, poolId, event);
}
exports.handleRewardPaid = handleRewardPaid;
