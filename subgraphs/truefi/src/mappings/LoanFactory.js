"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLoanTokenCreated = void 0;
const templates_1 = require("../../generated/templates");
function handleLoanTokenCreated(event) {
    templates_1.LoanToken.create(event.params.contractAddress);
}
exports.handleLoanTokenCreated = handleLoanTokenCreated;
