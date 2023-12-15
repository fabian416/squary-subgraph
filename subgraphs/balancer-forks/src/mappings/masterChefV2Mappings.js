"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdateEmissionRate =
  exports.handleLogSetPool =
  exports.handleLogPoolAddition =
  exports.handleEmergencyWithdraw =
  exports.handleWithdraw =
  exports.handleDeposit =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const helpers_1 = require("../../src/common/masterchef/helpers");
const schema_1 = require("../../generated/schema");
const masterChefV2Rewards_1 = require("../modules/masterChefV2Rewards");
const constants_1 = require("../../src/common/constants");
// A deposit or stake for the pool specific MasterChef.
function handleDeposit(event) {
  (0, masterChefV2Rewards_1.updateMasterChef)(
    event,
    event.params.pid,
    event.params.amount
  );
}
exports.handleDeposit = handleDeposit;
// A withdraw or unstaking for the pool specific MasterChef.
function handleWithdraw(event) {
  (0, masterChefV2Rewards_1.updateMasterChef)(
    event,
    event.params.pid,
    event.params.amount.times(constants_1.BIGINT_NEG_ONE)
  );
}
exports.handleWithdraw = handleWithdraw;
// A withdraw or unstaking for the pool specific MasterChef.
function handleEmergencyWithdraw(event) {
  (0, masterChefV2Rewards_1.updateMasterChef)(
    event,
    event.params.pid,
    event.params.amount.times(constants_1.BIGINT_NEG_ONE)
  );
}
exports.handleEmergencyWithdraw = handleEmergencyWithdraw;
// Handle the addition of a new pool to the MasterChef. New staking pool.
function handleLogPoolAddition(event) {
  const masterChefV2Pool = (0, helpers_1.createMasterChefStakingPool)(
    event,
    constants_1.MasterChef.MASTERCHEFV2,
    event.params.pid,
    event.params.lpToken
  );
  (0, helpers_1.updateMasterChefTotalAllocation)(
    event,
    masterChefV2Pool.poolAllocPoint,
    event.params.allocPoint,
    constants_1.MasterChef.MASTERCHEFV2
  );
  masterChefV2Pool.poolAllocPoint = event.params.allocPoint;
  masterChefV2Pool.save();
}
exports.handleLogPoolAddition = handleLogPoolAddition;
// Update the allocation points of the pool.
function handleLogSetPool(event) {
  const masterChefV2Pool = schema_1._MasterChefStakingPool.load(
    constants_1.MasterChef.MASTERCHEFV2 + "-" + event.params.pid.toString()
  );
  (0, helpers_1.updateMasterChefTotalAllocation)(
    event,
    masterChefV2Pool.poolAllocPoint,
    event.params.allocPoint,
    constants_1.MasterChef.MASTERCHEFV2
  );
  masterChefV2Pool.poolAllocPoint = event.params.allocPoint;
  masterChefV2Pool.save();
}
exports.handleLogSetPool = handleLogSetPool;
// Update the total emissions rate of rewards for the masterchef contract.
function handleUpdateEmissionRate(event) {
  const masterChefV2Pool = (0, helpers_1.getOrCreateMasterChef)(
    event,
    constants_1.MasterChef.MASTERCHEFV2
  );
  graph_ts_1.log.warning(
    "NEW REWARD RATE: " + event.params._beetsPerSec.toString(),
    []
  );
  masterChefV2Pool.rewardTokenRate = event.params._beetsPerSec;
  masterChefV2Pool.adjustedRewardTokenRate = event.params._beetsPerSec;
  masterChefV2Pool.save();
}
exports.handleUpdateEmissionRate = handleUpdateEmissionRate;
