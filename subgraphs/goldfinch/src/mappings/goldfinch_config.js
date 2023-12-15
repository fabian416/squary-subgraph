"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAddressUpdated = exports.handleNoListed = exports.handleGoListed = void 0;
const constants_1 = require("../common/constants");
const user_1 = require("../entities/user");
function handleGoListed(event) {
    const user = (0, user_1.getOrInitUser)(event.params.member);
    user.isGoListed = true;
    user.save();
}
exports.handleGoListed = handleGoListed;
function handleNoListed(event) {
    const user = (0, user_1.getOrInitUser)(event.params.member);
    user.isGoListed = false;
    user.save();
}
exports.handleNoListed = handleNoListed;
function handleAddressUpdated(event) {
    // TODO update CreditLine related fields when  address is updated
    // Need a reverse mapping of config to market/pool
    // see ConfigOptions.sol for index
    if (event.params.index.equals(constants_1.BIGINT_ONE)) {
    }
}
exports.handleAddressUpdated = handleAddressUpdated;
