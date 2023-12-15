"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWithdrawal = exports.handleDeposit = void 0;
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
