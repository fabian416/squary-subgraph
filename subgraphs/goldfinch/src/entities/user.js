"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDeposit = exports.getOrInitUser = void 0;
const schema_1 = require("../../generated/schema");
function getOrInitUser(address) {
    let user = schema_1.User.load(address.toHexString());
    if (!user) {
        user = new schema_1.User(address.toHexString());
        user.isNonUsIndividual = false;
        user.isUsAccreditedIndividual = false;
        user.isUsNonAccreditedIndividual = false;
        user.isUsEntity = false;
        user.isNonUsEntity = false;
        user.isGoListed = false;
        user.poolTokens = [];
        user.save();
    }
    return user;
}
exports.getOrInitUser = getOrInitUser;
function handleDeposit(event) {
    const userAddress = event.params.capitalProvider;
    // Just adds a corresponding user entity to the database
    getOrInitUser(userAddress);
}
exports.handleDeposit = handleDeposit;
