"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBeginOfTheHourTimestamp =
  exports.getBeginOfTheDayTimestamp =
  exports.getHoursSinceEpoch =
  exports.getDaysSinceEpoch =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const SECONDS_PER_DAY = 24 * 60 * 60;
const SECONDS_PER_HOUR = 60 * 60;
function getDaysSinceEpoch(secondsSinceEpoch) {
  return Math.floor(secondsSinceEpoch / SECONDS_PER_DAY);
}
exports.getDaysSinceEpoch = getDaysSinceEpoch;
function getHoursSinceEpoch(secondsSinceEpoch) {
  return Math.floor(secondsSinceEpoch / SECONDS_PER_HOUR);
}
exports.getHoursSinceEpoch = getHoursSinceEpoch;
function getBeginOfTheDayTimestamp(secondsSinceEpoch) {
  return secondsSinceEpoch.minus(
    secondsSinceEpoch.mod(graph_ts_1.BigInt.fromI32(SECONDS_PER_DAY))
  );
}
exports.getBeginOfTheDayTimestamp = getBeginOfTheDayTimestamp;
function getBeginOfTheHourTimestamp(secondsSinceEpoch) {
  return secondsSinceEpoch.minus(
    secondsSinceEpoch.mod(graph_ts_1.BigInt.fromI32(SECONDS_PER_HOUR))
  );
}
exports.getBeginOfTheHourTimestamp = getBeginOfTheHourTimestamp;
