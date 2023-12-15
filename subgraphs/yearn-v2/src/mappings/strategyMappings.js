"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCloned = void 0;
const templates_1 = require("../../generated/templates");
function handleCloned(event) {
    const clonedStrategyAddress = event.params.clone;
    templates_1.Strategy.create(clonedStrategyAddress);
}
exports.handleCloned = handleCloned;
