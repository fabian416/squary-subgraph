"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSwap = void 0;
const creators_1 = require("../common/creators");
function handleSwap(event) {
    (0, creators_1.createSwap)(event, event.params.to.toHexString(), event.params.sender.toHexString(), event.params.amount0In, event.params.amount1In, event.params.amount0Out, event.params.amount1Out);
}
exports.handleSwap = handleSwap;
