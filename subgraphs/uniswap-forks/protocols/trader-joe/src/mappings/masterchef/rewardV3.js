"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSet = exports.handleAdd = exports.handleEmergencyWithdraw = exports.handleWithdraw = exports.handleDeposit = void 0;
const schema_1 = require("../../../../../generated/schema");
const constants_1 = require("../../../../../src/common/constants");
const handleRewardV3_1 = require("../../common/handlers/handleRewardV3");
const handleRewarder_1 = require("../../common/handlers/handleRewarder");
const helpers_1 = require("../../../../../src/common/masterchef/helpers");
// A deposit or stake for the pool specific MasterChef.
function handleDeposit(event) {
    (0, handleRewardV3_1.updateMasterChef)(event, event.params.pid, event.params.amount, event.params.user);
}
exports.handleDeposit = handleDeposit;
// A withdraw or unstaking for the pool specific MasterChef.
function handleWithdraw(event) {
    (0, handleRewardV3_1.updateMasterChef)(event, event.params.pid, event.params.amount.times(constants_1.BIGINT_NEG_ONE), event.params.user);
}
exports.handleWithdraw = handleWithdraw;
// A withdraw or unstaking for the pool specific MasterChef.
function handleEmergencyWithdraw(event) {
    (0, handleRewardV3_1.updateMasterChef)(event, event.params.pid, event.params.amount.times(constants_1.BIGINT_NEG_ONE), event.params.user);
}
exports.handleEmergencyWithdraw = handleEmergencyWithdraw;
// Handle the addition of a new pool to the MasterChef. New staking pool.
function handleAdd(event) {
    const masterChefV3Pool = (0, helpers_1.createMasterChefStakingPool)(event, constants_1.MasterChef.MASTERCHEFV3, event.params.pid, event.params.lpToken);
    (0, helpers_1.updateMasterChefTotalAllocation)(event, masterChefV3Pool.poolAllocPoint, event.params.allocPoint, constants_1.MasterChef.MASTERCHEFV3);
    masterChefV3Pool.poolAllocPoint = event.params.allocPoint;
    if (event.params.rewarder.toHexString() != constants_1.ZERO_ADDRESS) {
        (0, handleRewarder_1.setPoolRewarder)(event, event.params.rewarder, masterChefV3Pool);
    }
    masterChefV3Pool.save();
}
exports.handleAdd = handleAdd;
// Update the allocation points of the pool.
function handleSet(event) {
    const masterChefV3Pool = schema_1._MasterChefStakingPool.load(constants_1.MasterChef.MASTERCHEFV3 + "-" + event.params.pid.toString());
    (0, helpers_1.updateMasterChefTotalAllocation)(event, masterChefV3Pool.poolAllocPoint, event.params.allocPoint, constants_1.MasterChef.MASTERCHEFV3);
    masterChefV3Pool.poolAllocPoint = event.params.allocPoint;
    if (event.params.overwrite) {
        (0, handleRewarder_1.setPoolRewarder)(event, event.params.rewarder, masterChefV3Pool);
    }
    masterChefV3Pool.save();
}
exports.handleSet = handleSet;
