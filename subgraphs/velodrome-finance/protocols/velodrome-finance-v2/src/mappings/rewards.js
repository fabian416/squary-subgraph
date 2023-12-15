"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWithdraw = exports.handleDeposit = exports.handleDistributeReward = exports.handleGaugeRevived = exports.handleGaugeKilled = exports.handleGaugeCreated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const rewards_1 = require("../../../../src/mappings/helpers/rewards");
const metrics_1 = require("../../../../src/common/metrics");
const getters_1 = require("../../../../src/common/getters");
const constants_1 = require("../common/constants");
const templates_1 = require("../../../../generated/templates");
function handleGaugeCreated(event) {
    const pool = (0, getters_1.getLiquidityPool)(event.params.pool);
    if (!pool)
        return;
    templates_1.Gauge.create(event.params.gauge);
    (0, rewards_1.createGauge)(pool, event.params.gauge, constants_1.VELO_ADDRESS);
    (0, metrics_1.updatePoolMetrics)(pool, event.block);
}
exports.handleGaugeCreated = handleGaugeCreated;
function handleGaugeKilled(event) {
    const gauge = (0, getters_1.getLiquidityGauge)(event.params.gauge);
    if (!gauge)
        return;
    const pool = (0, getters_1.getLiquidityPool)(graph_ts_1.Address.fromString(gauge.pool));
    if (!pool)
        return;
    (0, rewards_1.killGauge)(pool, gauge);
    (0, metrics_1.updatePoolMetrics)(pool, event.block);
}
exports.handleGaugeKilled = handleGaugeKilled;
function handleGaugeRevived(event) {
    const gauge = (0, getters_1.getLiquidityGauge)(event.params.gauge);
    if (!gauge)
        return;
    gauge.active = true;
    gauge.save();
}
exports.handleGaugeRevived = handleGaugeRevived;
function handleDistributeReward(event) {
    const gauge = (0, getters_1.getLiquidityGauge)(event.params.gauge);
    if (!gauge)
        return;
    const pool = (0, getters_1.getLiquidityPool)(graph_ts_1.Address.fromString(gauge.pool));
    if (!pool)
        return;
    (0, rewards_1.updateRewards)(pool, event.params.amount);
    (0, metrics_1.updatePoolMetrics)(pool, event.block);
}
exports.handleDistributeReward = handleDistributeReward;
function handleDeposit(event) {
    const gauge = (0, getters_1.getLiquidityGauge)(event.address);
    if (!gauge)
        return;
    const pool = (0, getters_1.getLiquidityPool)(graph_ts_1.Address.fromString(gauge.pool));
    if (!pool)
        return;
    (0, rewards_1.updateStaked)(pool, event.params.amount, true);
    (0, metrics_1.updatePoolMetrics)(pool, event.block);
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
    const gauge = (0, getters_1.getLiquidityGauge)(event.address);
    if (!gauge)
        return;
    const pool = (0, getters_1.getLiquidityPool)(graph_ts_1.Address.fromString(gauge.pool));
    if (!pool)
        return;
    (0, rewards_1.updateStaked)(pool, event.params.amount, false);
    (0, metrics_1.updatePoolMetrics)(pool, event.block);
}
exports.handleWithdraw = handleWithdraw;
