"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressFromId = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
function getAddressFromId(id) {
  return graph_ts_1.Address.fromHexString(id).subarray(-20);
}
exports.getAddressFromId = getAddressFromId;
