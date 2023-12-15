"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSameDay =
  exports.getOpenTime =
  exports.getDayCloseTime =
  exports.getDayOpenTime =
  exports.getHourCloseTime =
  exports.getHourOpenTime =
  exports.getTenMinuteCloseTime =
  exports.getTenMinuteOpenTime =
  exports.getMinuteCloseTime =
  exports.getMinuteOpenTime =
  exports.one =
  exports.day =
  exports.hour =
  exports.minute =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.minute = graph_ts_1.BigInt.fromI32(60);
exports.hour = graph_ts_1.BigInt.fromI32(3600);
exports.day = graph_ts_1.BigInt.fromI32(86400);
exports.one = graph_ts_1.BigInt.fromI32(1);
function getMinuteOpenTime(timestamp) {
  const interval = exports.minute;
  return getOpenTime(timestamp, interval);
}
exports.getMinuteOpenTime = getMinuteOpenTime;
function getMinuteCloseTime(timestamp) {
  return getMinuteOpenTime(timestamp).plus(exports.minute).minus(exports.one);
}
exports.getMinuteCloseTime = getMinuteCloseTime;
function getTenMinuteOpenTime(timestamp) {
  const interval = exports.minute.times(graph_ts_1.BigInt.fromI32(10));
  return getOpenTime(timestamp, interval);
}
exports.getTenMinuteOpenTime = getTenMinuteOpenTime;
function getTenMinuteCloseTime(timestamp) {
  return getTenMinuteOpenTime(timestamp)
    .plus(exports.minute.times(graph_ts_1.BigInt.fromI32(10)))
    .minus(exports.one);
}
exports.getTenMinuteCloseTime = getTenMinuteCloseTime;
function getHourOpenTime(timestamp) {
  const interval = exports.hour;
  return getOpenTime(timestamp, interval);
}
exports.getHourOpenTime = getHourOpenTime;
function getHourCloseTime(timestamp) {
  return getHourOpenTime(timestamp).plus(exports.hour).minus(exports.one);
}
exports.getHourCloseTime = getHourCloseTime;
function getDayOpenTime(timestamp) {
  const interval = exports.day;
  return getOpenTime(timestamp, interval);
}
exports.getDayOpenTime = getDayOpenTime;
function getDayCloseTime(timestamp) {
  return getDayOpenTime(timestamp).plus(exports.day).minus(exports.one);
}
exports.getDayCloseTime = getDayCloseTime;
// helpers
function getOpenTime(timestamp, interval) {
  const excess = timestamp.mod(interval);
  return timestamp.minus(excess);
}
exports.getOpenTime = getOpenTime;
function isSameDay(t1, t2) {
  const startOfDay1 = getDayOpenTime(t1);
  const startOfDay2 = getDayOpenTime(t2);
  return startOfDay1.equals(startOfDay2);
}
exports.isSameDay = isSameDay;
