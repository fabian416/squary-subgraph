"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUserVote = void 0;
const usage_1 = require("../common/usage");
function handleUserVote(call) {
    (0, usage_1.updateUsageMetrics)(call.block, call.from);
}
exports.handleUserVote = handleUserVote;
