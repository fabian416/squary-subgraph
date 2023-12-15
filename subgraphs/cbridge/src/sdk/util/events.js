"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnixHours = exports.getUnixDays = void 0;
const constants_1 = require("./constants");
function getUnixDays(block) {
  return block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
}
exports.getUnixDays = getUnixDays;
function getUnixHours(block) {
  return block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
}
exports.getUnixHours = getUnixHours;
