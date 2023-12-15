"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInitialize = void 0;
const protocol_1 = require("../entities/protocol");
const token_1 = require("../entities/token");
const constants_1 = require("../utils/constants");
function handleInitialize(call) {
    const rewardToken = (0, token_1.getOrCreateRewardToken)(call.inputs._trustToken, constants_1.RewardTokenType.DEPOSIT, constants_1.InterestRateType.STABLE, call.inputs._distributionStart.plus(call.inputs._duration));
    (0, protocol_1.updateProtocolRewardToken)(call.block.timestamp, rewardToken, call.inputs._amount.div(call.inputs._duration));
}
exports.handleInitialize = handleInitialize;
