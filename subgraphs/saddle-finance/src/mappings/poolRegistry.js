"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdatePool = exports.handleAddCommunityPool = exports.handleAddPool = void 0;
const pool_1 = require("../entities/pool");
function handleAddPool(event) {
    (0, pool_1.createPoolFromRegistryEvent)(event.params.poolAddress, event.block);
}
exports.handleAddPool = handleAddPool;
function handleAddCommunityPool(event) {
    (0, pool_1.createPoolFromRegistryEvent)(event.params.poolAddress, event.block);
}
exports.handleAddCommunityPool = handleAddCommunityPool;
function handleUpdatePool(event) {
    (0, pool_1.createPoolFromRegistryEvent)(event.params.poolAddress, event.block);
}
exports.handleUpdatePool = handleUpdatePool;
