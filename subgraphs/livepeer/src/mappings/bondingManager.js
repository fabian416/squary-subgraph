"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEarningsClaimed = exports.handleTranscoderDeactivated = exports.handleTranscoderActivated = exports.handleTranscoderUpdate = exports.handleReward = exports.handleWithdrawFees = exports.handleWithdrawStake = exports.handleRebond = exports.handleUnbond = exports.handleTransferBond = exports.handleBond = void 0;
const metrics_1 = require("../modules/metrics");
const initializers_1 = require("../common/initializers");
function handleBond(event) {
    (0, initializers_1.createOrUpdatePool)(event.params.newDelegate, event);
    (0, metrics_1.trackUsageMetrics)(event.params.delegator, event);
    (0, metrics_1.trackUsageMetrics)(event.params.newDelegate, event);
}
exports.handleBond = handleBond;
function handleTransferBond(event) {
    (0, metrics_1.trackUsageMetrics)(event.params.newDelegator, event);
    (0, metrics_1.trackUsageMetrics)(event.params.oldDelegator, event);
}
exports.handleTransferBond = handleTransferBond;
function handleUnbond(event) {
    (0, metrics_1.trackUsageMetrics)(event.params.delegator, event);
    (0, metrics_1.trackUsageMetrics)(event.params.delegate, event);
    (0, initializers_1.createOrUpdatePool)(event.params.delegate, event);
}
exports.handleUnbond = handleUnbond;
function handleRebond(event) {
    (0, metrics_1.trackUsageMetrics)(event.params.delegator, event);
    (0, metrics_1.trackUsageMetrics)(event.params.delegate, event);
}
exports.handleRebond = handleRebond;
function handleWithdrawStake(event) {
    (0, metrics_1.trackUsageMetrics)(event.params.delegator, event);
}
exports.handleWithdrawStake = handleWithdrawStake;
function handleWithdrawFees(event) {
    (0, metrics_1.trackUsageMetrics)(event.params.delegator, event);
}
exports.handleWithdrawFees = handleWithdrawFees;
function handleReward(event) {
    (0, metrics_1.trackUsageMetrics)(event.params.transcoder, event);
}
exports.handleReward = handleReward;
function handleTranscoderUpdate(event) {
    (0, metrics_1.trackUsageMetrics)(event.params.transcoder, event);
    (0, initializers_1.createOrUpdatePool)(event.params.transcoder, event);
}
exports.handleTranscoderUpdate = handleTranscoderUpdate;
function handleTranscoderActivated(event) {
    (0, initializers_1.createOrUpdatePool)(event.params.transcoder, event);
    (0, metrics_1.trackUsageMetrics)(event.params.transcoder, event);
}
exports.handleTranscoderActivated = handleTranscoderActivated;
function handleTranscoderDeactivated(event) {
    (0, initializers_1.createOrUpdatePool)(event.params.transcoder, event);
    (0, metrics_1.trackUsageMetrics)(event.params.transcoder, event);
}
exports.handleTranscoderDeactivated = handleTranscoderDeactivated;
function handleEarningsClaimed(event) {
    (0, initializers_1.createOrUpdatePool)(event.params.delegate, event);
    (0, metrics_1.trackUsageMetrics)(event.params.delegator, event);
    (0, metrics_1.trackUsageMetrics)(event.params.delegate, event);
}
exports.handleEarningsClaimed = handleEarningsClaimed;
