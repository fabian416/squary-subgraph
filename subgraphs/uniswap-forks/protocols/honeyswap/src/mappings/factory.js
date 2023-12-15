"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePairCreated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const creators_1 = require("../common/creators");
function handlePairCreated(event) {
    graph_ts_1.log.info("create farm {}    {}     {}", [
        event.params.pair.toHexString(),
        event.params.token0.toHexString(),
        event.params.token1.toHexString(),
    ]);
    (0, creators_1.createLiquidityPool)(event, event.params.pair.toHexString(), event.params.token0.toHexString(), event.params.token1.toHexString());
}
exports.handlePairCreated = handlePairCreated;
