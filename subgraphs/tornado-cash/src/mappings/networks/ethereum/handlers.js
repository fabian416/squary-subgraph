"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStakingRewardsClaimed = exports.handleStakeBurned = exports.handleStakeAddedToRelayer = exports.handleRewardSwap = exports.handleRateChanged = exports.handleFeeUpdated = exports.handleWithdrawal = exports.handleDeposit = void 0;
const helpers_1 = require("./helpers");
const metrics_1 = require("../../../common/metrics");
function handleDeposit(event) {
    (0, helpers_1.createDeposit)(event.address.toHexString(), event);
    (0, metrics_1.updatePoolMetrics)(event.address.toHexString(), event);
    (0, metrics_1.updateUsageMetrics)(event);
    (0, metrics_1.updateFinancials)(event);
}
exports.handleDeposit = handleDeposit;
function handleWithdrawal(event) {
    (0, helpers_1.createWithdrawal)(event.address.toHexString(), event);
    (0, metrics_1.updatePoolMetrics)(event.address.toHexString(), event);
    (0, metrics_1.updateUsageMetrics)(event);
    (0, metrics_1.updateFinancials)(event);
}
exports.handleWithdrawal = handleWithdrawal;
function handleFeeUpdated(event) {
    (0, helpers_1.createFeeUpdated)(event.params.instance.toHexString(), event);
}
exports.handleFeeUpdated = handleFeeUpdated;
function handleRateChanged(event) {
    (0, helpers_1.createRateChanged)(event.params.instance.toHexString(), event);
    (0, metrics_1.updatePoolMetrics)(event.params.instance.toHexString(), event);
}
exports.handleRateChanged = handleRateChanged;
function handleRewardSwap(event) {
    (0, helpers_1.createRewardSwap)(event);
    (0, metrics_1.updateUsageMetrics)(event);
}
exports.handleRewardSwap = handleRewardSwap;
function handleStakeAddedToRelayer(event) {
    (0, metrics_1.updateUsageMetrics)(event);
}
exports.handleStakeAddedToRelayer = handleStakeAddedToRelayer;
function handleStakeBurned(event) {
    (0, metrics_1.updateUsageMetrics)(event);
}
exports.handleStakeBurned = handleStakeBurned;
function handleStakingRewardsClaimed(event) {
    (0, metrics_1.updateUsageMetrics)(event);
}
exports.handleStakingRewardsClaimed = handleStakingRewardsClaimed;
