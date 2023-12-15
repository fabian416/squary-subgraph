"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleActivePoolYUSDDebtUpdated = exports.handleActivePoolAssetBalanceUpdated = exports.handleActivePoolAssetsBalanceUpdated = void 0;
const market_1 = require("../entities/market");
/**
 * Total Assets collateral was updated
 *
 * @param event ActivePoolAssetsBalanceUpdated event
 */
function handleActivePoolAssetsBalanceUpdated(event) {
    for (let i = 0; i < event.params._amounts.length; i++) {
        (0, market_1.setMarketAssetBalance)(event, event.params._amounts[i], event.params._collaterals[i]);
    }
}
exports.handleActivePoolAssetsBalanceUpdated = handleActivePoolAssetsBalanceUpdated;
/**
 * Total Asset collateral was updated
 *
 * @param event ActivePoolAssetBalanceUpdated event
 */
function handleActivePoolAssetBalanceUpdated(event) {
    (0, market_1.setMarketAssetBalance)(event, event.params._amount, event.params._collateral);
}
exports.handleActivePoolAssetBalanceUpdated = handleActivePoolAssetBalanceUpdated;
/**
 * YUSD debt was updated
 *
 * @param event ActivePoolYUSDDebtUpdated event
 */
function handleActivePoolYUSDDebtUpdated(event) {
    (0, market_1.setMarketYUSDDebt)(event, event.params._YUSDDebt);
}
exports.handleActivePoolYUSDDebtUpdated = handleActivePoolYUSDDebtUpdated;
