"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRewardPaid = exports.handleWithdrawn = exports.handleStaked = void 0;
const constants_1 = require("../../../../../src/common/constants");
const helpers_1 = require("../../common/helpers");
// Load in the liquidity pool entity associated with this staking pool and increase staked amount
function handleStaked(event) {
    (0, helpers_1.updateStakedAmount)(event, event.params.amount);
    (0, helpers_1.updateRewardEmissions)(event);
}
exports.handleStaked = handleStaked;
// Load in the liquidity pool entity associated with this staking pool and decrease staked amount
function handleWithdrawn(event) {
    (0, helpers_1.updateStakedAmount)(event, event.params.amount.times(constants_1.BIGINT_NEG_ONE));
    (0, helpers_1.updateRewardEmissions)(event);
}
exports.handleWithdrawn = handleWithdrawn;
// Handle reward emmissions calculations within this handler.
function handleRewardPaid(event) {
    (0, helpers_1.updateRewardEmissions)(event);
}
exports.handleRewardPaid = handleRewardPaid;
