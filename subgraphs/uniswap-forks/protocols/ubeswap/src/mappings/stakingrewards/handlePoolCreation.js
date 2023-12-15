"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdatePoolWeight = void 0;
const constants_1 = require("../../../../../src/common/constants");
const helpers_1 = require("../../common/helpers");
// This handler is used to update pool allocation weights as well as indicate the creation of a new staking pool.
function handleUpdatePoolWeight(event) {
    (0, helpers_1.getOrCreateMasterChefStakingPool)(event, constants_1.MasterChef.MASTERCHEF, event.params.index, event.params.stakingToken);
}
exports.handleUpdatePoolWeight = handleUpdatePoolWeight;
