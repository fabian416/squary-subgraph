"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePoolCreated = void 0;
const configure_1 = require("../../configurations/configure");
const pool_1 = require("../common/entities/pool");
function handlePoolCreated(event) {
    if (configure_1.NetworkConfigs.getUntrackedPairs().includes(event.params.pool)) {
        return;
    }
    (0, pool_1.createLiquidityPool)(event, event.params.pool, event.params.token0, event.params.token1, event.params.fee);
}
exports.handlePoolCreated = handlePoolCreated;
