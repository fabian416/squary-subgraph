"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prefixID = exports.enumToPrefix = void 0;
// Converts upper snake case to lower kebab case and appends a hyphen.
// (e.g. "TRADING_FEE" to "trading-fee-"), mainly used to create entity IDs
function enumToPrefix(snake) {
  return snake.toLowerCase().replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
// Prefix an ID with a enum string in order to differentiate IDs
// e.g. combine TRADING_FEE and 0x1234 into trading-fee-0x1234
function prefixID(enumString, ID) {
  return enumToPrefix(enumString) + ID;
}
exports.prefixID = prefixID;
