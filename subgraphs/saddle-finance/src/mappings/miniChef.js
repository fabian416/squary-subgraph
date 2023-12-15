"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWithdraw = exports.handleLogSetPool = exports.handleLogSaddlePerSecond = exports.handleLogPoolAddition = exports.handleEmergencyWithdraw = exports.handleDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const MiniChefV2_1 = require("../../generated/templates/Swap/MiniChefV2");
const pool_1 = require("../entities/pool");
const constants_1 = require("../utils/constants");
function handleDeposit(event) {
    const contract = MiniChefV2_1.MiniChefV2.bind(event.address);
    (0, pool_1.handlePoolRewardsUpdated)(event, contract, event.params.pid, event.params.amount);
}
exports.handleDeposit = handleDeposit;
function handleEmergencyWithdraw(event) {
    const contract = MiniChefV2_1.MiniChefV2.bind(event.address);
    (0, pool_1.handlePoolRewardsUpdated)(event, contract, event.params.pid, constants_1.BIGINT_ZERO.minus(event.params.amount));
}
exports.handleEmergencyWithdraw = handleEmergencyWithdraw;
function handleLogPoolAddition(event) {
    const contract = MiniChefV2_1.MiniChefV2.bind(event.address);
    (0, pool_1.handlePoolRewardsUpdated)(event, contract, event.params.pid);
}
exports.handleLogPoolAddition = handleLogPoolAddition;
function handleLogSaddlePerSecond(event) {
    const contract = MiniChefV2_1.MiniChefV2.bind(event.address);
    const length = contract.poolLength().toI32();
    for (let pid = 0; pid < length; pid++) {
        (0, pool_1.handlePoolRewardsUpdated)(event, contract, graph_ts_1.BigInt.fromI32(pid));
    }
}
exports.handleLogSaddlePerSecond = handleLogSaddlePerSecond;
function handleLogSetPool(event) {
    const contract = MiniChefV2_1.MiniChefV2.bind(event.address);
    (0, pool_1.handlePoolRewardsUpdated)(event, contract, event.params.pid);
}
exports.handleLogSetPool = handleLogSetPool;
function handleWithdraw(event) {
    const contract = MiniChefV2_1.MiniChefV2.bind(event.address);
    (0, pool_1.handlePoolRewardsUpdated)(event, contract, event.params.pid, constants_1.BIGINT_ZERO.minus(event.params.amount));
}
exports.handleWithdraw = handleWithdraw;
