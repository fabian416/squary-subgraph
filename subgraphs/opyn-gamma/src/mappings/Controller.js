"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVaultSettled = exports.handleRedeem = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const account_1 = require("../entities/account");
const option_1 = require("../entities/option");
const position_1 = require("../entities/position");
function handleRedeem(event) {
    const option = schema_1.Option.load(event.params.otoken);
    if (event.params.payout.gt(constants_1.BIGINT_ZERO)) {
        const account = (0, account_1.getOrCreateAccount)(event.params.redeemer);
        (0, position_1.exercisePosition)(event, account, option);
    }
}
exports.handleRedeem = handleRedeem;
function handleVaultSettled(event) {
    const option = schema_1.Option.load(event.params.oTokenAddress);
    (0, option_1.markOptionExpired)(event, option);
}
exports.handleVaultSettled = handleVaultSettled;
