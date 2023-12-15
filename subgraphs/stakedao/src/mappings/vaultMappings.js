"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSetGauge = exports.handleWithdraw = exports.handleDeposit = void 0;
const Deposit_1 = require("../modules/Deposit");
const Withdraw_1 = require("../modules/Withdraw");
const schema_1 = require("../../generated/schema");
const templates_1 = require("../../generated/templates");
const Metrics_1 = require("../modules/Metrics");
function handleDeposit(call) {
    const vaultAddress = call.to;
    const depositAmount = call.inputs._amount;
    const vault = schema_1.Vault.load(vaultAddress.toHexString());
    if (vault) {
        (0, Deposit_1._Deposit)(call.to, call.transaction, call.block, vault, depositAmount);
    }
    (0, Metrics_1.updateFinancials)(call.block);
    (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(call) {
    const vaultAddress = call.to;
    const vault = schema_1.Vault.load(vaultAddress.toHexString());
    if (vault) {
        let _sharesBurnt = call.inputs._shares;
        (0, Withdraw_1._Withdraw)(call.to, call.transaction, call.block, vault, _sharesBurnt);
    }
    (0, Metrics_1.updateFinancials)(call.block);
    (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleWithdraw = handleWithdraw;
function handleSetGauge(call) {
    const gaugeAddress = call.inputs._gauge;
    templates_1.Gauge.create(gaugeAddress);
}
exports.handleSetGauge = handleSetGauge;
