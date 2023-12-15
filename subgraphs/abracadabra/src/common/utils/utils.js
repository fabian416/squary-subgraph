"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnapshotRates = exports.readValue = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
function readValue(callResult, defaultValue) {
  return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
// create separate InterestRate Entities for each market snapshot
// this is needed to prevent snapshot rates from being pointers to the current rate
function getSnapshotRates(rates, timeSuffix) {
  const snapshotRates = [];
  for (let i = 0; i < rates.length; i++) {
    const rate = schema_1.InterestRate.load(rates[i]);
    if (!rate) {
      graph_ts_1.log.warning(
        "[getSnapshotRates] rate {} not found, should not happen",
        [rates[i]]
      );
      continue;
    }
    // create new snapshot rate
    const snapshotRateId = rates[i].concat("-").concat(timeSuffix);
    const snapshotRate = new schema_1.InterestRate(snapshotRateId);
    snapshotRate.side = rate.side;
    snapshotRate.type = rate.type;
    snapshotRate.rate = rate.rate;
    snapshotRate.save();
    snapshotRates.push(snapshotRateId);
  }
  return snapshotRates;
}
exports.getSnapshotRates = getSnapshotRates;
