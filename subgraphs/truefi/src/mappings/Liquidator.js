"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLiquidated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const event_1 = require("../entities/event");
const LoanToken_1 = require("../../generated/templates/LoanToken/LoanToken");
const constants_1 = require("../utils/constants");
function handleLiquidated(event) {
    const contract = LoanToken_1.LoanToken.bind(event.address);
    const tokenResult = contract.try_token();
    if (tokenResult.reverted) {
        return;
    }
    const token = tokenResult.value;
    const borrowerResult = contract.try_borrower();
    if (borrowerResult.reverted) {
        return;
    }
    const borrower = borrowerResult.value;
    (0, event_1.createLiquidate)(event, graph_ts_1.Address.fromString(constants_1.TRU_ADDRESS), event.params.withdrawnTru, token, event.params.defaultedValue, event.address, borrower);
}
exports.handleLiquidated = handleLiquidated;
