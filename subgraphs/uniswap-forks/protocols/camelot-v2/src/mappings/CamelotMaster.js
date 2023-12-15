"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePoolUpdated = exports.handlePoolSet = exports.handlePoolAdded = void 0;
const handlers_1 = require("../common/handlers");
function handlePoolAdded(event) {
    (0, handlers_1.handleReward)(event, event.params.poolAddress);
}
exports.handlePoolAdded = handlePoolAdded;
function handlePoolSet(event) {
    (0, handlers_1.handleReward)(event, event.params.poolAddress);
}
exports.handlePoolSet = handlePoolSet;
function handlePoolUpdated(event) {
    (0, handlers_1.handleReward)(event, event.params.poolAddress);
}
exports.handlePoolUpdated = handlePoolUpdated;
