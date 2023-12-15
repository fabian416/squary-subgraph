"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdateEmissionRate = exports.handleSet = exports.handleAdd = exports.handleEmergencyWithdraw = exports.handleWithdraw = exports.handleDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../../generated/schema");
const constants_1 = require("../../../../../src/common/constants");
const handleRewarder_1 = require("../../common/handlers/handleRewarder");
const handleRewardV2_1 = require("../../common/handlers/handleRewardV2");
const helpers_1 = require("../../../../../src/common/masterchef/helpers");
// A deposit or stake for the pool specific MasterChef.
function handleDeposit(event) {
    (0, handleRewardV2_1.updateMasterChef)(event, event.params.pid, event.params.amount, event.params.user);
}
exports.handleDeposit = handleDeposit;
// A withdraw or unstaking for the pool specific MasterChef.
function handleWithdraw(event) {
    (0, handleRewardV2_1.updateMasterChef)(event, event.params.pid, event.params.amount.times(constants_1.BIGINT_NEG_ONE), event.params.user);
}
exports.handleWithdraw = handleWithdraw;
// A withdraw or unstaking for the pool specific MasterChef.
function handleEmergencyWithdraw(event) {
    (0, handleRewardV2_1.updateMasterChef)(event, event.params.pid, event.params.amount.times(constants_1.BIGINT_NEG_ONE), event.params.user);
}
exports.handleEmergencyWithdraw = handleEmergencyWithdraw;
// Handle the addition of a new pool to the MasterChef. New staking pool.
function handleAdd(event) {
    const masterChefV2Pool = (0, helpers_1.createMasterChefStakingPool)(event, constants_1.MasterChef.MASTERCHEFV2, event.params.pid, event.params.lpToken);
    (0, helpers_1.updateMasterChefTotalAllocation)(event, masterChefV2Pool.poolAllocPoint, event.params.allocPoint, constants_1.MasterChef.MASTERCHEFV2);
    masterChefV2Pool.poolAllocPoint = event.params.allocPoint;
    if (event.params.rewarder.toHexString() != constants_1.ZERO_ADDRESS) {
        (0, handleRewarder_1.setPoolRewarder)(event, event.params.rewarder, masterChefV2Pool);
    }
    masterChefV2Pool.save();
}
exports.handleAdd = handleAdd;
// Update the allocation points of the pool.
function handleSet(event) {
    const masterChefV2Pool = schema_1._MasterChefStakingPool.load(constants_1.MasterChef.MASTERCHEFV2 + "-" + event.params.pid.toString());
    (0, helpers_1.updateMasterChefTotalAllocation)(event, masterChefV2Pool.poolAllocPoint, event.params.allocPoint, constants_1.MasterChef.MASTERCHEFV2);
    masterChefV2Pool.poolAllocPoint = event.params.allocPoint;
    if (event.params.overwrite) {
        (0, handleRewarder_1.setPoolRewarder)(event, event.params.rewarder, masterChefV2Pool);
    }
    masterChefV2Pool.save();
}
exports.handleSet = handleSet;
// Update the total emissions rate of rewards for the masterchef contract.
function handleUpdateEmissionRate(event) {
    const masterChefV2Pool = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MASTERCHEFV2);
    const masterChefV3Pool = (0, helpers_1.getOrCreateMasterChef)(event, constants_1.MasterChef.MASTERCHEFV3);
    graph_ts_1.log.warning("NEW REWARD RATE: " + event.params._joePerSec.toString(), []);
    masterChefV2Pool.rewardTokenRate = event.params._joePerSec;
    masterChefV2Pool.adjustedRewardTokenRate = event.params._joePerSec;
    masterChefV3Pool.rewardTokenRate = event.params._joePerSec;
    masterChefV2Pool.save();
    masterChefV3Pool.save();
}
exports.handleUpdateEmissionRate = handleUpdateEmissionRate;
