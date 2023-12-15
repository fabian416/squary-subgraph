"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEmergencyWithdraw = exports.handleWithdraw = exports.handleDeposit = void 0;
const constants_1 = require("../../../../../src/common/constants");
const handleReward_1 = require("../../common/handlers/handleReward");
// A deposit or stake for the pool specific MasterChef.
function handleDeposit(event) {
    (0, handleReward_1.handleReward)(event, event.params.pid, event.params.amount);
}
exports.handleDeposit = handleDeposit;
// A withdraw or unstaking for the pool specific MasterChef.
function handleWithdraw(event) {
    (0, handleReward_1.handleReward)(event, event.params.pid, event.params.amount.times(constants_1.BIGINT_NEG_ONE));
}
exports.handleWithdraw = handleWithdraw;
// A withdraw or unstaking for the pool specific MasterChef.
function handleEmergencyWithdraw(event) {
    (0, handleReward_1.handleReward)(event, event.params.pid, event.params.amount.times(constants_1.BIGINT_NEG_ONE));
}
exports.handleEmergencyWithdraw = handleEmergencyWithdraw;
