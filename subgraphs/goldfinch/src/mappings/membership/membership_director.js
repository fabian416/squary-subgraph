"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRewardsClaimed = void 0;
const helpers_1 = require("../../entities/helpers");
function handleRewardsClaimed(event) {
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "MEMBERSHIP_REWARDS_CLAIMED", event.params.owner);
    transaction.receivedAmount = event.params.rewards;
    transaction.receivedToken = "FIDU";
    transaction.save();
}
exports.handleRewardsClaimed = handleRewardsClaimed;
