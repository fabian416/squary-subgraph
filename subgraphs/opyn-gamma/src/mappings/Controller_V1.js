"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVaultSettled = void 0;
const schema_1 = require("../../generated/schema");
const option_1 = require("../entities/option");
function handleVaultSettled(event) {
    const option = schema_1.Option.load(event.params.oTokenAddress);
    (0, option_1.markOptionExpired)(event, option);
}
exports.handleVaultSettled = handleVaultSettled;
