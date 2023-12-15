"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePoolCreated = void 0;
const templates_1 = require("../../generated/templates");
const market_1 = require("../entities/market");
function handlePoolCreated(event) {
    (0, market_1.createMarket)(event, event.params.token, event.params.pool);
    templates_1.TruefiPool2.create(event.params.pool);
}
exports.handlePoolCreated = handlePoolCreated;
