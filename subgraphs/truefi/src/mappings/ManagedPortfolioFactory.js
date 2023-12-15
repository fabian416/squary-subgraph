"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePortfolioCreated = void 0;
const templates_1 = require("../../generated/templates");
function handlePortfolioCreated(event) {
    templates_1.ManagedPortfolio.create(event.params.newPortfolio);
}
exports.handlePortfolioCreated = handlePortfolioCreated;
