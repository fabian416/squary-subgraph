"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCollBalanceUpdated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const CollSurplusPool_1 = require("../../generated/CollSurplusPool/CollSurplusPool");
const event_1 = require("../entities/event");
const token_1 = require("../entities/token");
const trove_1 = require("../entities/trove");
const protocol_1 = require("../entities/protocol");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const market_1 = require("../entities/market");
/**
 * Whenever a borrower's trove is closed by a non-owner address because of either:
 *   1. Redemption
 *   2. Liquidation in recovery mode with collateral ratio > 110%
 * the remaining collateral is sent to CollSurplusPool to be claimed (withdrawn) by the owner.
 * Because Asset price is not updated during the actual withdrawal, the Withdraw event is instead created upon collateral deposit
 *
 * @param event CollBalanceUpdated event
 */
function handleCollBalanceUpdated(event) {
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    const assets = protocol._marketAssets;
    const account = event.params._account;
    const contract = CollSurplusPool_1.CollSurplusPool.bind(event.address);
    let assetStr = null;
    // As the asset address is not included in the event's paramters, comparing every address's previous
    // balance with current balance to determine which asset the event is related with.
    for (let i = 0; i < assets.length; i++) {
        const tryAssetBalanceResult = contract.try_getCollateral(graph_ts_1.Address.fromString(assets[i]), account);
        const tmpTrove = (0, trove_1.getTrove)(account, graph_ts_1.Address.fromString(assets[i]));
        if (tmpTrove != null && !tryAssetBalanceResult.reverted) {
            if (tryAssetBalanceResult.value != tmpTrove.collateralSurplus) {
                assetStr = assets[i];
                break;
            }
        }
    }
    if (assetStr == null) {
        return;
    }
    const asset = graph_ts_1.Address.fromString(assetStr);
    const market = (0, market_1.getOrCreateMarket)(asset);
    const collateralSurplusAsset = event.params._newBalance;
    const trove = (0, trove_1.getTrove)(account, asset);
    if (trove != null) {
        if (collateralSurplusAsset > trove.collateralSurplus) {
            trove.collateralSurplusChange = collateralSurplusAsset.minus(trove.collateralSurplus);
            const collateralSurplusUSD = (0, numbers_1.bigIntToBigDecimal)(trove.collateralSurplusChange).times((0, token_1.getCurrentAssetPrice)(asset));
            (0, event_1.createWithdraw)(event, market, trove.collateralSurplusChange, collateralSurplusUSD, account, account);
        }
        else {
            trove.collateralSurplusChange = constants_1.BIGINT_ZERO;
        }
        trove.collateralSurplus = collateralSurplusAsset;
        trove.save();
    }
}
exports.handleCollBalanceUpdated = handleCollBalanceUpdated;
