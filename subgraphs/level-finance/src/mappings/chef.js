"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdateEmissionRate = exports.handleLogSetPool = exports.handleLogPoolAddition = exports.handleEmergencyWithdraw = exports.handleWithdraw = exports.handleDeposit = void 0;
const initializers_1 = require("../../src/common/initializers");
const constants = __importStar(require("../common/constants"));
const chef_1 = require("../modules/chef");
const schema_1 = require("../../generated/schema");
// A deposit or stake for the pool specific MasterChef.
function handleDeposit(event) {
    (0, chef_1.updateMasterChef)(event, event.params.pid, event.params.amount);
}
exports.handleDeposit = handleDeposit;
// A withdraw or unstaking for the pool specific MasterChef.
function handleWithdraw(event) {
    (0, chef_1.updateMasterChef)(event, event.params.pid, event.params.amount.times(constants.BIGINT_NEGONE));
}
exports.handleWithdraw = handleWithdraw;
// A withdraw or unstaking for the pool specific MasterChef.
function handleEmergencyWithdraw(event) {
    (0, chef_1.updateMasterChef)(event, event.params.pid, event.params.amount.times(constants.BIGINT_NEGONE));
}
exports.handleEmergencyWithdraw = handleEmergencyWithdraw;
// Handle the addition of a new pool to the MasterChef. New staking pool.
function handleLogPoolAddition(event) {
    const masterChefV2Pool = (0, initializers_1.createMasterChefStakingPool)(event, constants.MasterChef.MASTERCHEFV2, event.params.pid, event.params.lpToken);
    (0, initializers_1.updateMasterChefTotalAllocation)(event, masterChefV2Pool.poolAllocPoint, event.params.allocPoint, constants.MasterChef.MASTERCHEFV2);
    masterChefV2Pool.poolAllocPoint = event.params.allocPoint;
    masterChefV2Pool.save();
}
exports.handleLogPoolAddition = handleLogPoolAddition;
// Update the allocation points of the pool.
function handleLogSetPool(event) {
    const masterChefV2Pool = schema_1._MasterChefStakingPool.load(constants.MasterChef.MASTERCHEFV2 + "-" + event.params.pid.toString());
    (0, initializers_1.updateMasterChefTotalAllocation)(event, masterChefV2Pool.poolAllocPoint, event.params.allocPoint, constants.MasterChef.MASTERCHEFV2);
    masterChefV2Pool.poolAllocPoint = event.params.allocPoint;
    masterChefV2Pool.save();
}
exports.handleLogSetPool = handleLogSetPool;
// Update the total emissions rate of rewards for the masterchef contract.
function handleUpdateEmissionRate(event) {
    const masterChefV2Pool = (0, initializers_1.getOrCreateMasterChef)(event, constants.MasterChef.MASTERCHEFV2);
    masterChefV2Pool.rewardTokenRate = event.params.rewardPerSecond;
    masterChefV2Pool.adjustedRewardTokenRate = event.params.rewardPerSecond;
    masterChefV2Pool.save();
}
exports.handleUpdateEmissionRate = handleUpdateEmissionRate;
