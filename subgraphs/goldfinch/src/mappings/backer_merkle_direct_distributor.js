"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGrantAccepted = void 0;
const helpers_1 = require("../entities/helpers");
function handleGrantAccepted(event) {
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "COMMUNITY_REWARDS_CLAIMED", event.params.account);
    transaction.receivedAmount = event.params.amount;
    transaction.receivedToken = "GFI";
    transaction.save();
}
exports.handleGrantAccepted = handleGrantAccepted;
