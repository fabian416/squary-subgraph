"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePairCreated = void 0;
const creators_1 = require("../common/creators");
function handlePairCreated(event) {
    (0, creators_1.createLiquidityPool)(event, event.params.pair.toHexString(), event.params.token0.toHexString(), event.params.token1.toHexString());
}
exports.handlePairCreated = handlePairCreated;
