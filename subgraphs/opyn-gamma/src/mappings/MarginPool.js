"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransferToUser = exports.handleTransferToPool = void 0;
const schema_1 = require("../../generated/schema");
const event_1 = require("../entities/event");
function handleTransferToPool(event) {
    const option = schema_1.Option.load(event.params.asset);
    if (option) {
        // Ignore using oTokens as collateral
        return;
    }
    (0, event_1.createDeposit)(event, event.params.asset, event.params.amount, event.params.user);
}
exports.handleTransferToPool = handleTransferToPool;
function handleTransferToUser(event) {
    const option = schema_1.Option.load(event.params.asset);
    if (option) {
        // Ignore using oTokens as collateral
        return;
    }
    (0, event_1.createWithdraw)(event, event.params.asset, event.params.amount, event.params.user);
}
exports.handleTransferToUser = handleTransferToUser;
