"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogRewardPerSecond = exports.handlePoolSet = exports.handlePoolAdded = exports.handleEmergencyWithdraw = exports.handleWithdraw = exports.handleDeposit = void 0;
// import { log } from "@graphprotocol/graph-ts";
const MiniChefV2_1 = require("../../../../../generated/MiniChef/MiniChefV2");
const schema_1 = require("../../../../../generated/schema");
const helpers_1 = require("../../../../../src/common/masterchef/helpers");
const handleRewardMini_1 = require("../../common/handlers/handleRewardMini");
const constants_1 = require("../../../../../src/common/constants");
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
function handlePoolAdded(event) {
    const miniChefPool = (0, helpers_1.createMasterChefStakingPool)(event, constants_1.MasterChef.MINICHEF, event.params.pid, event.params.lpToken);
    const masterchef = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MINICHEF);
    if (masterchef.lastUpdatedRewardRate == constants_1.BIGINT_ZERO) {
        masterchef.lastUpdatedRewardRate = event.block.number;
        const miniChefV2Contract = MiniChefV2_1.MiniChefV2.bind(event.address);
        masterchef.adjustedRewardTokenRate = miniChefV2Contract.rewardPerSecond();
        masterchef.save();
    }
    (0, helpers_1.updateMasterChefTotalAllocation)(event, miniChefPool.poolAllocPoint, event.params.allocPoint, constants_1.MasterChef.MINICHEF);
    miniChefPool.poolAllocPoint = event.params.allocPoint;
    miniChefPool.save();
}
exports.handlePoolAdded = handlePoolAdded;
// Update the allocation points of the pool.
function handlePoolSet(event) {
    const miniChefPool = schema_1._MasterChefStakingPool.load(constants_1.MasterChef.MINICHEF + "-" + event.params.pid.toString());
    (0, helpers_1.updateMasterChefTotalAllocation)(event, miniChefPool.poolAllocPoint, event.params.allocPoint, constants_1.MasterChef.MINICHEF);
    miniChefPool.poolAllocPoint = event.params.allocPoint;
    miniChefPool.save();
}
exports.handlePoolSet = handlePoolSet;
// Update the total emissions rate of rewards for the masterchef contract.
function handleLogRewardPerSecond(event) {
    const miniChefPool = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MINICHEF);
    miniChefPool.rewardTokenRate = event.params.rewardPerSecond;
    miniChefPool.adjustedRewardTokenRate = event.params.rewardPerSecond;
    miniChefPool.save();
}
exports.handleLogRewardPerSecond = handleLogRewardPerSecond;
// export function handleHarvest(event: Harvest): void {
//  updateMasterChefHarvest(event, event.params.pid, event.params.amount)
// }
