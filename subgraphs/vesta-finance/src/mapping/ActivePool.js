"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleActivePoolVSTDebtUpdated = exports.handleActivePoolAssetBalanceUpdated = void 0;
const market_1 = require("../entities/market");
/**
 * Total Asset collateral was updated
 *
 * @param event ActivePoolAssetBalanceUpdated event
 */
function handleActivePoolAssetBalanceUpdated(event) {
    const asset = event.params._asset;
    (0, market_1.setMarketAssetBalance)(event, asset, event.params._balance);
}
exports.handleActivePoolAssetBalanceUpdated = handleActivePoolAssetBalanceUpdated;
/**
 * VST debt was updated
 *
 * @param event ActivePoolVSTDebtUpdated event
 */
function handleActivePoolVSTDebtUpdated(event) {
    (0, market_1.setMarketVSTDebt)(event, event.params._asset, event.params._VSTDebt);
}
exports.handleActivePoolVSTDebtUpdated = handleActivePoolVSTDebtUpdated;
