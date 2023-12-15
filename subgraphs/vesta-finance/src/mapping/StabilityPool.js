"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAssetGainWithdrawn = exports.handleUserDepositChanged = exports.handleStabilityPoolVSTBalanceUpdated = exports.handleStabilityPoolAssetBalanceUpdated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const StabilityPool_1 = require("../../generated/templates/StabilityPool/StabilityPool");
const event_1 = require("../entities/event");
const market_1 = require("../entities/market");
const position_1 = require("../entities/position");
const protocol_1 = require("../entities/protocol");
const stabilitypool_1 = require("../entities/stabilitypool");
const token_1 = require("../entities/token");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
/**
 * Asset balance was updated
 *
 * @param event StabilityPoolAssetBalanceUpdated event
 */
function handleStabilityPoolAssetBalanceUpdated(event) {
    const stabilityPoolContract = StabilityPool_1.StabilityPool.bind(event.address);
    const asset = stabilityPoolContract.getAssetType();
    const totalVSTAmount = stabilityPoolContract.getTotalVSTDeposits();
    const totalAssetAmount = event.params._newBalance;
    (0, stabilitypool_1.updateStabilityPoolTVL)(event, totalVSTAmount, totalAssetAmount, asset);
    (0, protocol_1.updateProtocoVSTLocked)(event);
}
exports.handleStabilityPoolAssetBalanceUpdated = handleStabilityPoolAssetBalanceUpdated;
/**
 * VST balance was updated
 *
 * @param event StabilityPoolVSTBalanceUpdated event
 */
function handleStabilityPoolVSTBalanceUpdated(event) {
    const stabilityPoolContract = StabilityPool_1.StabilityPool.bind(event.address);
    const asset = stabilityPoolContract.getAssetType();
    const totalVSTAmount = event.params._newBalance;
    const totalAssetAmount = stabilityPoolContract.getAssetBalance();
    (0, stabilitypool_1.updateStabilityPoolTVL)(event, totalVSTAmount, totalAssetAmount, asset);
    (0, protocol_1.updateProtocoVSTLocked)(event);
}
exports.handleStabilityPoolVSTBalanceUpdated = handleStabilityPoolVSTBalanceUpdated;
/**
 * Triggered when some deposit balance changes. We use this to track position
 * value and deposits. But cannot accurately tell when it was caused by a withdrawal
 * or just by the transformation of VST into Asset due to liquidations (see stability pool docs).
 *
 * @param event UserDepositChanged
 */
function handleUserDepositChanged(event) {
    const stabilityPoolContract = StabilityPool_1.StabilityPool.bind(event.address);
    const assetAddressResult = stabilityPoolContract.try_getAssetType();
    if (assetAddressResult.reverted) {
        graph_ts_1.log.error("[handleAssetGainWithdrawn]StabilityPool.getAssetType() revert for tx {}", [event.transaction.hash.toHexString()]);
        return;
    }
    const asset = assetAddressResult.value;
    const market = (0, market_1.getOrCreateStabilityPool)(event.address, asset, event);
    (0, position_1.updateSPUserPositionBalances)(event, market, event.params._depositor, event.params._newDeposit);
}
exports.handleUserDepositChanged = handleUserDepositChanged;
/**
 * Triggered when Asset that has been converted from VST in the stability pool
 * is sent to its owner (the VST depositor).
 * These are the only StabilityPool withdrawals we are able to track.
 *
 * @param event AssetGainWithdrawn
 */
function handleAssetGainWithdrawn(event) {
    if (event.params._Asset.equals(constants_1.BIGINT_ZERO)) {
        return;
    }
    const stabilityPoolContract = StabilityPool_1.StabilityPool.bind(event.address);
    const assetAddressResult = stabilityPoolContract.try_getAssetType();
    if (assetAddressResult.reverted) {
        graph_ts_1.log.error("[handleAssetGainWithdrawn]StabilityPool.getAssetType() revert for tx {}", [event.transaction.hash.toHexString()]);
        return;
    }
    const asset = assetAddressResult.value;
    const token = (0, token_1.getOrCreateAssetToken)(asset);
    const amountUSD = (0, token_1.getCurrentAssetPrice)(asset).times((0, numbers_1.bigIntToBigDecimal)(event.params._Asset, token.decimals));
    const market = (0, market_1.getOrCreateStabilityPool)(event.address, asset, event);
    (0, event_1.createWithdraw)(event, market, event.params._Asset, amountUSD, event.params._depositor, event.params._depositor);
}
exports.handleAssetGainWithdrawn = handleAssetGainWithdrawn;
