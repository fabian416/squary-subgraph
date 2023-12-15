"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLastGoodPriceUpdated = void 0;
const token_1 = require("../entities/token");
/**
 * Emitted whenever latest ETH price is fetched from oracle
 *
 * @param event LastGoodPriceUpdated event
 */
function handleLastGoodPriceUpdated(event) {
    (0, token_1.setCurrentETHPrice)(event.block.number, event.params._lastGoodPrice);
}
exports.handleLastGoodPriceUpdated = handleLastGoodPriceUpdated;
