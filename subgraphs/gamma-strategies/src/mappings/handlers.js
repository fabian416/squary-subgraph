"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRebalance = exports.handleWithdraw = exports.handleDeposit = exports.handleHypeAdded = void 0;
/* eslint-disable prefer-const */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Hypervisor_1 = require("../../generated/templates/Hypervisor/Hypervisor");
const templates_1 = require("../../generated/templates");
const getters_1 = require("../common/getters");
const events_1 = require("./helpers/events");
const usageMetrics_1 = require("./helpers/usageMetrics");
const vaults_1 = require("./helpers/vaults");
const constants_1 = require("../common/constants");
const financials_1 = require("./helpers/financials");
const schema_1 = require("../../generated/schema");
function handleHypeAdded(event) {
    // Do not add vault if it has already been added
    let vault = schema_1.Vault.load(event.params.hype.toHex());
    if (vault) {
        return;
    }
    let hypervisorContract = Hypervisor_1.Hypervisor.bind(event.params.hype);
    let test_amount = hypervisorContract.try_getTotalAmounts();
    // Prevents subgraph crashing from bad address added to registry
    if (test_amount.reverted) {
        graph_ts_1.log.warning("Could not add {}, does not appear to be a hypervisor", [
            event.params.hype.toHex(),
        ]);
        return;
    }
    (0, getters_1.getOrCreateYieldAggregator)(event.address);
    (0, vaults_1.getOrCreateVault)(event.params.hype, event);
    templates_1.Hypervisor.create(event.params.hype);
}
exports.handleHypeAdded = handleHypeAdded;
function handleDeposit(event) {
    // Create deposit event
    (0, events_1.createDeposit)(event);
    // Update vault token supply
    let vault = (0, vaults_1.getOrCreateVault)(event.address, event);
    vault.inputTokenBalance = vault.inputTokenBalance.plus(event.params.shares);
    vault.outputTokenSupply = vault.outputTokenSupply.plus(event.params.shares);
    vault.save();
    (0, usageMetrics_1.updateUsageMetrics)(event.params.to, constants_1.UsageType.DEPOSIT, event);
    (0, financials_1.updateTvl)(event);
    (0, vaults_1.updateVaultSnapshots)(event);
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
    // Create withdraw event
    (0, events_1.createWithdraw)(event);
    // Update vault token supply
    let vault = (0, vaults_1.getOrCreateVault)(event.address, event);
    vault.inputTokenBalance = vault.inputTokenBalance.minus(event.params.shares);
    vault.outputTokenSupply = vault.outputTokenSupply.minus(event.params.shares);
    vault.save();
    (0, usageMetrics_1.updateUsageMetrics)(event.params.to, constants_1.UsageType.WITHDRAW, event);
    (0, financials_1.updateTvl)(event);
    (0, vaults_1.updateVaultSnapshots)(event);
}
exports.handleWithdraw = handleWithdraw;
function handleRebalance(event) {
    (0, events_1.createRebalance)(event);
    (0, financials_1.updateRevenue)(event);
    (0, financials_1.updateTvl)(event);
    (0, vaults_1.updateVaultSnapshots)(event);
}
exports.handleRebalance = handleRebalance;
