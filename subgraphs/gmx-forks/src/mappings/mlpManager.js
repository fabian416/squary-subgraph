"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRemoveLiquidity = exports.handleAddLiquidity = void 0;
const transaction_1 = require("../modules/transaction");
const enums_1 = require("../sdk/protocols/perpfutures/enums");
function handleAddLiquidity(event) {
    (0, transaction_1.transaction)(event, event.params.account, event.params.token, event.params.aumInUsdg, event.params.glpSupply, event.params.mintAmount, enums_1.TransactionType.DEPOSIT, event.params.amount);
}
exports.handleAddLiquidity = handleAddLiquidity;
function handleRemoveLiquidity(event) {
    (0, transaction_1.transaction)(event, event.params.account, event.params.token, event.params.aumInUsdg, event.params.glpSupply, event.params.glpAmount, enums_1.TransactionType.WITHDRAW, event.params.amountOut);
}
exports.handleRemoveLiquidity = handleRemoveLiquidity;
