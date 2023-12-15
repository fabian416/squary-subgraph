"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogBananaPerSecond = exports.handleLogSetPool = exports.handleLogPoolAddition = exports.handleEmergencyWithdraw = exports.handleWithdraw = exports.handleDeposit = void 0;
const schema_1 = require("../../../../../generated/schema");
const constants_1 = require("../../../../../src/common/constants");
const handleRewardMini_1 = require("../../common/handlers/handleRewardMini");
const helpers_1 = require("../../../../../src/common/masterchef/helpers");
// A deposit or stake for the pool specific MasterChef.
function handleDeposit(event) {
    (0, handleRewardMini_1.updateMasterChef)(event, event.params.pid, event.params.amount);
}
exports.handleDeposit = handleDeposit;
// A withdraw or unstaking for the pool specific MasterChef.
function handleWithdraw(event) {
    (0, handleRewardMini_1.updateMasterChef)(event, event.params.pid, event.params.amount.times(constants_1.BIGINT_NEG_ONE));
}
exports.handleWithdraw = handleWithdraw;
// A withdraw or unstaking for the pool specific MasterChef.
function handleEmergencyWithdraw(event) {
    (0, handleRewardMini_1.updateMasterChef)(event, event.params.pid, event.params.amount.times(constants_1.BIGINT_NEG_ONE));
}
exports.handleEmergencyWithdraw = handleEmergencyWithdraw;
// Handle the addition of a new pool to the MasterChef. New staking pool.
function handleLogPoolAddition(event) {
    const miniChefPool = (0, helpers_1.createMasterChefStakingPool)(event, constants_1.MasterChef.MINICHEF, event.params.pid, event.params.lpToken);
    (0, helpers_1.updateMasterChefTotalAllocation)(event, miniChefPool.poolAllocPoint, event.params.allocPoint, constants_1.MasterChef.MINICHEF);
    miniChefPool.poolAllocPoint = event.params.allocPoint;
    miniChefPool.save();
}
exports.handleLogPoolAddition = handleLogPoolAddition;
// Update the allocation points of the pool.
function handleLogSetPool(event) {
    const miniChefPool = schema_1._MasterChefStakingPool.load(constants_1.MasterChef.MINICHEF + "-" + event.params.pid.toString());
    (0, helpers_1.updateMasterChefTotalAllocation)(event, miniChefPool.poolAllocPoint, event.params.allocPoint, constants_1.MasterChef.MINICHEF);
    miniChefPool.poolAllocPoint = event.params.allocPoint;
    miniChefPool.save();
}
exports.handleLogSetPool = handleLogSetPool;
// Update the total emissions rate of rewards for the masterchef contract.
function handleLogBananaPerSecond(event) {
    const miniChefPool = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MINICHEF);
    miniChefPool.rewardTokenRate = event.params.bananaPerSecond;
    miniChefPool.adjustedRewardTokenRate = event.params.bananaPerSecond;
    miniChefPool.save();
}
exports.handleLogBananaPerSecond = handleLogBananaPerSecond;
