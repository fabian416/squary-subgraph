"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountAssetOnEmptyPortfolio = exports.updateAccountAssets = exports.getOrCreateAsset = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
function getOrCreateAsset(accountId, currencyId, maturity) {
    const id = accountId + "-" + currencyId + "-" + maturity.toString();
    let asset = schema_1.Asset.load(id);
    if (asset == null) {
        asset = new schema_1.Asset(id);
        asset.currency = currencyId;
        asset.maturity = maturity;
        asset.notional = constants_1.BIGINT_ZERO;
        asset.settlementDate = maturity;
    }
    return asset;
}
exports.getOrCreateAsset = getOrCreateAsset;
function updateAccountAssets(account, portfolio, event) {
    for (let i = 0; i < portfolio.length; i++) {
        const genericAsset = portfolio[i];
        // This casting is required to get around type errors in AssemblyScript
        const currencyId = genericAsset[0].toBigInt().toI32();
        const maturity = genericAsset[1].toBigInt();
        const notional = genericAsset[3].toBigInt();
        const asset = getOrCreateAsset(account.id, currencyId.toString(), maturity);
        if (asset.notional.notEqual(notional)) {
            asset.notional = notional;
            asset.lastUpdateBlockNumber = event.block.number;
            asset.lastUpdateTimestamp = event.block.timestamp;
            asset.lastUpdateTransactionHash = event.transaction.hash;
            graph_ts_1.log.debug("Updated asset entity {}", [asset.id]);
            asset.save();
        }
    }
}
exports.updateAccountAssets = updateAccountAssets;
function updateAccountAssetOnEmptyPortfolio(accountId, currencyId, maturity, event) {
    const asset = getOrCreateAsset(accountId, currencyId, maturity);
    asset.notional = constants_1.BIGINT_ZERO;
    asset.lastUpdateBlockNumber = event.block.number;
    asset.lastUpdateTimestamp = event.block.timestamp;
    asset.lastUpdateTransactionHash = event.transaction.hash;
    graph_ts_1.log.debug("Updated asset entity when empty portfolio was returned {}", [
        asset.id,
    ]);
    asset.save();
}
exports.updateAccountAssetOnEmptyPortfolio = updateAccountAssetOnEmptyPortfolio;
