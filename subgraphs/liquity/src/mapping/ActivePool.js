"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleActivePoolLUSDDebtUpdated = exports.handleActivePoolETHBalanceUpdated = void 0;
const market_1 = require("../entities/market");
/**
 * Total ETH collateral was updated
 *
 * @param event ActivePoolETHBalanceUpdated event
 */
function handleActivePoolETHBalanceUpdated(event) {
    (0, market_1.setMarketETHBalance)(event, event.params._ETH);
}
exports.handleActivePoolETHBalanceUpdated = handleActivePoolETHBalanceUpdated;
/**
 * LUSD debt was updated
 *
 * @param event ActivePoolLUSDDebtUpdated event
 */
function handleActivePoolLUSDDebtUpdated(event) {
    (0, market_1.setMarketLUSDDebt)(event, event.params._LUSDDebt);
}
exports.handleActivePoolLUSDDebtUpdated = handleActivePoolLUSDDebtUpdated;
