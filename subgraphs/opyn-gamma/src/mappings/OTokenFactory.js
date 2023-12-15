"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOtokenCreated = void 0;
const templates_1 = require("../../generated/templates");
const option_1 = require("../entities/option");
function handleOtokenCreated(event) {
    (0, option_1.createOption)(event);
    templates_1.OToken.create(event.params.tokenAddress);
}
exports.handleOtokenCreated = handleOtokenCreated;
