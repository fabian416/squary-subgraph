"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSetFeeProtocol = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const pool_1 = require("../../../src/common/entities/pool");
// Update the fees colected by the protocol.
function handleSetFeeProtocol(event) {
    // Check if event.params.feeProtocol0New is different an i32
    (0, pool_1.updateProtocolFees)(event.address, graph_ts_1.BigInt.fromI32(event.params.feeProtocol0New));
}
exports.handleSetFeeProtocol = handleSetFeeProtocol;
