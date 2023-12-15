"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNewSwapPool = void 0;
const pool_1 = require("../entities/pool");
function handleNewSwapPool(event) {
    (0, pool_1.createPoolFromFactoryEvent)(event);
}
exports.handleNewSwapPool = handleNewSwapPool;
