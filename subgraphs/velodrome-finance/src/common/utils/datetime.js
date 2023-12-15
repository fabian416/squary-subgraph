"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSameDay = exports.getOpenTime = exports.getDaysSinceEpoch = exports.getDayCloseTime = exports.getDayOpenTime = exports.getHourCloseTime = exports.getHourOpenTime = exports.getTenMinuteCloseTime = exports.getTenMinuteOpenTime = exports.getMinuteCloseTime = exports.getMinuteOpenTime = exports.one = exports.day = exports.hour = exports.minute = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../constants");
exports.minute = graph_ts_1.BigInt.fromI32(60);
exports.hour = graph_ts_1.BigInt.fromI32(3600);
exports.day = graph_ts_1.BigInt.fromI32(86400);
exports.one = graph_ts_1.BigInt.fromI32(1);
function getMinuteOpenTime(timestamp) {
    let interval = exports.minute;
    return getOpenTime(timestamp, interval);
}
exports.getMinuteOpenTime = getMinuteOpenTime;
function getMinuteCloseTime(timestamp) {
    return getMinuteOpenTime(timestamp).plus(exports.minute).minus(exports.one);
}
exports.getMinuteCloseTime = getMinuteCloseTime;
function getTenMinuteOpenTime(timestamp) {
    let interval = exports.minute.times(graph_ts_1.BigInt.fromI32(10));
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
    let interval = exports.hour;
    return getOpenTime(timestamp, interval);
}
exports.getHourOpenTime = getHourOpenTime;
function getHourCloseTime(timestamp) {
    return getHourOpenTime(timestamp).plus(exports.hour).minus(exports.one);
}
exports.getHourCloseTime = getHourCloseTime;
function getDayOpenTime(timestamp) {
    let interval = exports.day;
    return getOpenTime(timestamp, interval);
}
exports.getDayOpenTime = getDayOpenTime;
function getDayCloseTime(timestamp) {
    return getDayOpenTime(timestamp).plus(exports.day).minus(exports.one);
}
exports.getDayCloseTime = getDayCloseTime;
function getDaysSinceEpoch(secondsSinceEpoch) {
    return Math.floor(secondsSinceEpoch / constants_1.SECONDS_PER_DAY).toString();
}
exports.getDaysSinceEpoch = getDaysSinceEpoch;
// helpers
function getOpenTime(timestamp, interval) {
    let excess = timestamp.mod(interval);
    return timestamp.minus(excess);
}
exports.getOpenTime = getOpenTime;
function isSameDay(t1, t2) {
    let startOfDay1 = getDayOpenTime(t1);
    let startOfDay2 = getDayOpenTime(t2);
    return startOfDay1.equals(startOfDay2);
}
exports.isSameDay = isSameDay;
