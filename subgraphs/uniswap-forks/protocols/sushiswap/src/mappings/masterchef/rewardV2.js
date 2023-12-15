"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogSetPool = exports.handleLogPoolAddition = exports.handleEmergencyWithdraw = exports.handleWithdraw = exports.handleDeposit = void 0;
const schema_1 = require("../../../../../generated/schema");
const helpers_1 = require("../../../../../src/common/masterchef/helpers");
const handleRewardV2_1 = require("../../common/handlers/handleRewardV2");
const constants_1 = require("../../../../../src/common/constants");
// A deposit or stake for the pool specific MasterChef.
function handleDeposit(event) {
    (0, handleRewardV2_1.updateMasterChef)(event, event.params.pid, event.params.amount);
}
exports.handleDeposit = handleDeposit;
// A withdraw or unstaking for the pool specific MasterChef.
function handleWithdraw(event) {
    (0, handleRewardV2_1.updateMasterChef)(event, event.params.pid, event.params.amount.times(constants_1.BIGINT_NEG_ONE));
}
exports.handleWithdraw = handleWithdraw;
// A withdraw or unstaking for the pool specific MasterChef.
function handleEmergencyWithdraw(event) {
    (0, handleRewardV2_1.updateMasterChef)(event, event.params.pid, event.params.amount.times(constants_1.BIGINT_NEG_ONE));
}
exports.handleEmergencyWithdraw = handleEmergencyWithdraw;
// Handle the addition of a new pool to the MasterChef. New staking pool.
function handleLogPoolAddition(event) {
    const masterChefPool = (0, helpers_1.createMasterChefStakingPool)(event, constants_1.MasterChef.MASTERCHEFV2, event.params.pid, event.params.lpToken);
    (0, helpers_1.updateMasterChefTotalAllocation)(event, masterChefPool.poolAllocPoint, event.params.allocPoint, constants_1.MasterChef.MASTERCHEFV2);
    masterChefPool.poolAllocPoint = event.params.allocPoint;
    masterChefPool.save();
}
exports.handleLogPoolAddition = handleLogPoolAddition;
// Update the allocation points of the pool.
function handleLogSetPool(event) {
    const masterChefPool = schema_1._MasterChefStakingPool.load(constants_1.MasterChef.MASTERCHEFV2 + "-" + event.params.pid.toString());
    (0, helpers_1.updateMasterChefTotalAllocation)(event, masterChefPool.poolAllocPoint, event.params.allocPoint, constants_1.MasterChef.MASTERCHEFV2);
    masterChefPool.poolAllocPoint = event.params.allocPoint;
    masterChefPool.save();
}
exports.handleLogSetPool = handleLogSetPool;
