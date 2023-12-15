"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRewardsOnlyGaugeCreated = exports.handleNewGauge = void 0;
const templates_1 = require("../../generated/templates");
function handleNewGauge(event) {
  const gaugeAddress = event.params.addr;
  templates_1.Gauge.create(gaugeAddress);
}
exports.handleNewGauge = handleNewGauge;
function handleRewardsOnlyGaugeCreated(event) {
  const gaugeAddress = event.params.gauge;
  templates_1.Gauge.create(gaugeAddress);
}
exports.handleRewardsOnlyGaugeCreated = handleRewardsOnlyGaugeCreated;
