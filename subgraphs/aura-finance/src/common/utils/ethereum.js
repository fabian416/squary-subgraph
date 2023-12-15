"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readValue = void 0;
function readValue(callResult, defaultValue) {
  return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
