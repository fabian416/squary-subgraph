"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackUsageMetrics = void 0;
const initializers_1 = require("../common/initializers");
function trackUsageMetrics(address, event) {
    const sdk = (0, initializers_1.initializeSDK)(event);
    sdk.Accounts.loadAccount(address).trackActivity();
}
exports.trackUsageMetrics = trackUsageMetrics;
