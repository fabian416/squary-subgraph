"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLiquidation = exports.handleTroveLiquidated = exports.handleTroveUpdated = exports.handleRedemption = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const event_1 = require("../entities/event");
const trove_1 = require("../entities/trove");
const token_1 = require("../entities/token");
const numbers_1 = require("../utils/numbers");
const constants_1 = require("../utils/constants");
const schema_1 = require("../../generated/schema");
const protocol_1 = require("../entities/protocol");
const position_1 = require("../entities/position");
const logs_1 = require("../utils/logs");
const market_1 = require("../entities/market");
var TroveManagerOperation;
(function (TroveManagerOperation) {
    TroveManagerOperation[TroveManagerOperation["applyPendingRewards"] = 0] = "applyPendingRewards";
    TroveManagerOperation[TroveManagerOperation["liquidateInNormalMode"] = 1] = "liquidateInNormalMode";
    TroveManagerOperation[TroveManagerOperation["liquidateInRecoveryMode"] = 2] = "liquidateInRecoveryMode";
    TroveManagerOperation[TroveManagerOperation["redeemCollateral"] = 3] = "redeemCollateral";
})(TroveManagerOperation || (TroveManagerOperation = {}));
function handleRedemption(event) {
    const asset = event.params._asset;
    const market = (0, market_1.getOrCreateMarket)(asset);
    const feeAmountAsset = event.params._AssetFee;
    const feeAmountUSD = (0, numbers_1.bigIntToBigDecimal)(feeAmountAsset).times((0, token_1.getCurrentAssetPrice)(event.params._asset));
    (0, protocol_1.addProtocolSideRevenue)(event, market, feeAmountUSD);
}
exports.handleRedemption = handleRedemption;
/**
 * Emitted when a trove was updated because of a TroveManagerOperation operation
 *
 * @param event TroveUpdated event
 */
function handleTroveUpdated(event) {
    const trove = (0, trove_1.getOrCreateTrove)(event.params._borrower, event.params._asset);
    const operation = event.params.operation;
    switch (operation) {
        case TroveManagerOperation.applyPendingRewards:
            applyPendingRewards(event, trove);
            break;
        case TroveManagerOperation.redeemCollateral:
            redeemCollateral(event, trove);
            break;
        case TroveManagerOperation.liquidateInNormalMode:
        case TroveManagerOperation.liquidateInRecoveryMode:
            liquidateTrove(event, trove);
            break;
    }
    trove.asset = event.params._asset.toHexString();
    trove.owner = event.params._borrower.toHexString();
    trove.collateral = event.params._coll;
    trove.debt = event.params._debt;
    trove.save();
    (0, position_1.updateUserPositionBalances)(event, trove);
}
exports.handleTroveUpdated = handleTroveUpdated;
/**
 * Emitted for each trove liquidated during batch liquidation flow, right before TroveUpdated event
 * Used to check for and apply pending rewards, since no event is emitted for this during liquidation
 *
 * @param event TroveLiquidated event
 */
function handleTroveLiquidated(event) {
    const trove = (0, trove_1.getOrCreateTrove)(event.params._borrower, event.params._asset);
    const asset = event.params._asset;
    const market = (0, market_1.getOrCreateMarket)(asset);
    const borrower = event.params._borrower;
    const newCollateral = event.params._coll;
    const newDebt = event.params._debt;
    // Gas compensation already subtracted, only when (MCR <= ICR < TCR & SP.VST >= trove.debt)
    if (trove.collateral.gt(newCollateral)) {
        // Add gas compensation back to liquidated collateral amount
        trove.collateral = trove.collateral
            .divDecimal(constants_1.BIGDECIMAL_ONE.minus(constants_1.LIQUIDATION_FEE))
            .truncate(0).digits;
    }
    // Apply pending rewards if necessary
    let collateralRewardAsset = newCollateral.minus(trove.collateral);
    if (trove.collateralSurplusChange.gt(constants_1.BIGINT_ZERO)) {
        collateralRewardAsset = collateralRewardAsset.plus(trove.collateralSurplusChange);
        trove.collateralSurplusChange = constants_1.BIGINT_ZERO;
    }
    if (collateralRewardAsset.gt(constants_1.BIGINT_ZERO)) {
        const collateralRewardUSD = (0, numbers_1.bigIntToBigDecimal)(collateralRewardAsset).times((0, token_1.getCurrentAssetPrice)(asset));
        (0, event_1.createDeposit)(event, market, collateralRewardAsset, collateralRewardUSD, borrower);
    }
    const borrowAmountVST = newDebt.minus(trove.debt);
    if (borrowAmountVST.gt(constants_1.BIGINT_ZERO)) {
        const borrowAmountUSD = (0, numbers_1.bigIntToBigDecimal)(borrowAmountVST);
        (0, event_1.createBorrow)(event, market, borrowAmountVST, borrowAmountUSD, borrower);
    }
    trove.asset = event.params._asset.toHexString();
    trove.owner = event.params._borrower.toHexString();
    trove.collateral = newCollateral;
    trove.debt = newDebt;
    trove.save();
    (0, position_1.updateUserPositionBalances)(event, trove);
}
exports.handleTroveLiquidated = handleTroveLiquidated;
// Treat applyPendingRewards as deposit + borrow
function applyPendingRewards(event, trove) {
    const asset = event.params._asset;
    const market = (0, market_1.getOrCreateMarket)(asset);
    const borrower = event.params._borrower;
    const newCollateral = event.params._coll;
    const newDebt = event.params._debt;
    const collateralRewardAsset = newCollateral.minus(trove.collateral);
    const collateralRewardUSD = (0, numbers_1.bigIntToBigDecimal)(collateralRewardAsset).times((0, token_1.getCurrentAssetPrice)(asset));
    (0, event_1.createDeposit)(event, market, collateralRewardAsset, collateralRewardUSD, borrower);
    const borrowAmountVST = newDebt.minus(trove.debt);
    const borrowAmountUSD = (0, numbers_1.bigIntToBigDecimal)(borrowAmountVST);
    (0, event_1.createBorrow)(event, market, borrowAmountVST, borrowAmountUSD, borrower);
}
// Treat redeemCollateral as repay + withdraw
function redeemCollateral(event, trove) {
    const asset = event.params._asset;
    const market = (0, market_1.getOrCreateMarket)(asset);
    const newCollateral = event.params._coll;
    const newDebt = event.params._debt;
    const repayAmountVST = trove.debt.minus(newDebt);
    const repayAmountUSD = (0, numbers_1.bigIntToBigDecimal)(repayAmountVST);
    (0, event_1.createRepay)(event, market, repayAmountVST, repayAmountUSD, graph_ts_1.Address.fromString(trove.owner), event.transaction.from);
    let withdrawAmountAsset = trove.collateral.minus(newCollateral);
    // If trove was closed, then extra collateral is sent to CollSurplusPool to be withdrawn by trove owner
    if (trove.collateral.equals(constants_1.BIGINT_ZERO)) {
        withdrawAmountAsset = withdrawAmountAsset.minus(trove.collateralSurplusChange);
        trove.collateralSurplusChange = constants_1.BIGINT_ZERO;
    }
    const withdrawAmountUSD = (0, numbers_1.bigIntToBigDecimal)(withdrawAmountAsset).times((0, token_1.getCurrentAssetPrice)(asset));
    (0, event_1.createWithdraw)(event, market, withdrawAmountAsset, withdrawAmountUSD, graph_ts_1.Address.fromString(trove.owner), event.transaction.from);
}
function liquidateTrove(event, trove) {
    const asset = event.params._asset;
    const market = (0, market_1.getOrCreateMarket)(asset);
    const amountLiquidatedAsset = trove.collateral;
    const amountLiquidatedUSD = (0, numbers_1.bigIntToBigDecimal)(amountLiquidatedAsset).times((0, token_1.getCurrentAssetPrice)(asset));
    const profitUSD = amountLiquidatedUSD
        .times(constants_1.LIQUIDATION_FEE)
        .plus(constants_1.LIQUIDATION_RESERVE_VST);
    (0, event_1.createLiquidate)(event, market, amountLiquidatedAsset, amountLiquidatedUSD, profitUSD, graph_ts_1.Address.fromString(trove.owner), event.transaction.from);
    const liquidatedDebtUSD = (0, numbers_1.bigIntToBigDecimal)(trove.debt);
    const supplySideRevenueUSD = amountLiquidatedUSD
        .times(constants_1.BIGDECIMAL_ONE.minus(constants_1.LIQUIDATION_FEE))
        .minus(liquidatedDebtUSD);
    if (supplySideRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        (0, protocol_1.addSupplySideRevenue)(event, market, supplySideRevenueUSD);
    }
    (0, protocol_1.addProtocolSideRevenue)(event, market, profitUSD);
}
/**
 * Emitted once per transaction containing at least one liquidation.
 * The event contains the total amount liquidated from all liquidations in the transaction.
 * We use this event to calculate the amount of VST that was burned from the stability pool
 * in exchange of how much Asset collateral. From here we calulate StabilityPool revenue.
 *
 * @param event Liquidation event
 */
function handleLiquidation(event) {
    // To accurately calculate the revenue generated by the Stability pool we
    // compare the amount of VST that was burned to the amount of Asset that was
    // sent to the StabilityPool. The USD difference of the amounts will be the
    // StabilityPool revenue.
    if (!event.receipt) {
        graph_ts_1.log.error("[handleLiquidation]Unable to calculate liquidation revenue, no receipt found. Tx Hash: {}", [event.transaction.hash.toHexString()]);
        return;
    }
    const asset = event.params._asset;
    const stabilityPoolID = schema_1._AssetToStabilityPool.load(asset.toHexString())
        .stabilityPool;
    const stabilityPoolAddress = graph_ts_1.Address.fromString(stabilityPoolID);
    let vstBurned = constants_1.BIGINT_ZERO;
    let assetSent = constants_1.BIGINT_ZERO;
    for (let i = 0; i < event.receipt.logs.length; i++) {
        const txLog = event.receipt.logs[i];
        const burned = stabilityPoolVSTBurn(txLog, stabilityPoolAddress);
        if (burned) {
            vstBurned = vstBurned.plus(burned);
            continue;
        }
        const assetAmount = assetSentToStabilityPool(txLog, stabilityPoolAddress);
        if (assetAmount) {
            assetSent = assetSent.plus(assetAmount);
            continue;
        }
    }
    if (vstBurned.equals(constants_1.BIGINT_ZERO) || assetSent.equals(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.error("[handleLiquidation]no VST burned {} or asset sent {} on this liquidationtx {}", [
            vstBurned.toString(),
            assetSent.toString(),
            event.transaction.hash.toHexString(),
        ]);
        return;
    }
    const market = (0, market_1.getOrCreateStabilityPool)(stabilityPoolAddress, null, event);
    const vstPriceUSD = (0, token_1.getVSTTokenPrice)(event);
    const vstValueUSD = vstPriceUSD.times((0, numbers_1.bigIntToBigDecimal)(vstBurned));
    const assetPrice = (0, token_1.getCurrentAssetPrice)(asset);
    const token = (0, token_1.getOrCreateAssetToken)(asset);
    const assetValueUSD = (0, numbers_1.bigIntToBigDecimal)(assetSent, token.decimals).times(assetPrice);
    const revenue = assetValueUSD.minus(vstValueUSD);
    graph_ts_1.log.info("[handleLiquidation]tx {} market {} asset={} revenue={}: vstBurned={},vstPrice={},assetSent={},assetPrice={}", [
        event.transaction.hash.toHexString(),
        market.id,
        asset.toHexString(),
        revenue.toString(),
        vstBurned.toString(),
        vstPriceUSD.toString(),
        assetSent.toString(),
        assetPrice.toString(),
    ]);
    (0, protocol_1.addSupplySideRevenue)(event, market, revenue);
}
exports.handleLiquidation = handleLiquidation;
// stabilityPoolVSTBurn will return the amount of VST burned as indicated by this log.
// If the log is not a VST burn log, it will return null.
function stabilityPoolVSTBurn(txLog, spAddress) {
    const transfer = logs_1.ERC20TransferLog.parse(txLog);
    if (!transfer) {
        return null;
    }
    if (transfer.tokenAddr.equals(graph_ts_1.Address.fromString(constants_1.VST_ADDRESS)) &&
        transfer.from.equals(spAddress) &&
        transfer.to.equals(graph_ts_1.Address.zero())) {
        return transfer.amount;
    }
    return null;
}
// assetSentToStabilityPool will return the amount of asset sent to the StabilityPool.
// If this log is not AssetSent, or the destination is not the StabilityPool it will
// return null.
function assetSentToStabilityPool(log, spAddress) {
    const decoded = logs_1.AssetSentLog.parse(log);
    if (!decoded) {
        return null;
    }
    if (decoded.contractAddr.equals(graph_ts_1.Address.fromString(constants_1.ACTIVE_POOL_ADDRESS)) &&
        decoded.to.equals(spAddress)) {
        return decoded.amount;
    }
    return null;
}
