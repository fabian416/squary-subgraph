"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLiquidation = exports.handleTroveLiquidated = exports.handleTroveUpdated = exports.handleRedemption = void 0;
const event_1 = require("../entities/event");
const trove_1 = require("../entities/trove");
const token_1 = require("../entities/token");
const numbers_1 = require("../utils/numbers");
const constants_1 = require("../utils/constants");
const protocol_1 = require("../entities/protocol");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const position_1 = require("../entities/position");
const market_1 = require("../entities/market");
const log_1 = require("../utils/log");
var TroveManagerOperation;
(function (TroveManagerOperation) {
    TroveManagerOperation[TroveManagerOperation["applyPendingRewards"] = 0] = "applyPendingRewards";
    TroveManagerOperation[TroveManagerOperation["liquidateInNormalMode"] = 1] = "liquidateInNormalMode";
    TroveManagerOperation[TroveManagerOperation["liquidateInRecoveryMode"] = 2] = "liquidateInRecoveryMode";
    TroveManagerOperation[TroveManagerOperation["redeemCollateral"] = 3] = "redeemCollateral";
})(TroveManagerOperation || (TroveManagerOperation = {}));
function handleRedemption(event) {
    const feeAmountETH = event.params._ETHFee;
    const feeAmountUSD = (0, numbers_1.bigIntToBigDecimal)(feeAmountETH).times((0, token_1.getCurrentETHPrice)());
    (0, protocol_1.addProtocolSideRevenue)(event, feeAmountUSD, (0, market_1.getOrCreateMarket)());
}
exports.handleRedemption = handleRedemption;
/**
 * Emitted when a trove was updated because of a TroveManagerOperation operation
 *
 * @param event TroveUpdated event
 */
function handleTroveUpdated(event) {
    const trove = (0, trove_1.getOrCreateTrove)(event.params._borrower);
    const operation = event.params._operation;
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
    const trove = (0, trove_1.getOrCreateTrove)(event.params._borrower);
    const borrower = event.params._borrower;
    const newCollateral = event.params._coll;
    const newDebt = event.params._debt;
    if (trove.debt.gt(newDebt)) {
        graph_ts_1.log.critical("Tracked trove debt was less than actual debt in TroveLiquidated, actual: {}, tracked: {}", [trove.debt.toString(), newDebt.toString()]);
    }
    // Gas compensation already subtracted, only when (MCR <= ICR < TCR & SP.LUSD >= trove.debt)
    if (trove.collateral.gt(newCollateral)) {
        // Add gas compensation back to liquidated collateral amount
        trove.collateral = trove.collateral
            .divDecimal(constants_1.BIGDECIMAL_ONE.minus(constants_1.LIQUIDATION_FEE))
            .truncate(0).digits;
    }
    // Apply pending rewards if necessary
    let collateralRewardETH = newCollateral.minus(trove.collateral);
    if (trove.collateralSurplusChange.gt(constants_1.BIGINT_ZERO)) {
        collateralRewardETH = collateralRewardETH.plus(trove.collateralSurplusChange);
        trove.collateralSurplusChange = constants_1.BIGINT_ZERO;
    }
    if (collateralRewardETH.gt(constants_1.BIGINT_ZERO)) {
        const collateralRewardUSD = (0, numbers_1.bigIntToBigDecimal)(collateralRewardETH).times((0, token_1.getCurrentETHPrice)());
        const ethAddress = graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS);
        (0, event_1.createDeposit)(event, (0, market_1.getOrCreateMarket)(), ethAddress, collateralRewardETH, collateralRewardUSD, borrower);
    }
    const borrowAmountLUSD = newDebt.minus(trove.debt);
    if (borrowAmountLUSD.gt(constants_1.BIGINT_ZERO)) {
        const borrowAmountUSD = (0, numbers_1.bigIntToBigDecimal)(borrowAmountLUSD);
        (0, event_1.createBorrow)(event, borrowAmountLUSD, borrowAmountUSD, borrower);
    }
    trove.collateral = newCollateral;
    trove.debt = newDebt;
    trove.save();
    (0, position_1.updateUserPositionBalances)(event, trove);
}
exports.handleTroveLiquidated = handleTroveLiquidated;
// Treat applyPendingRewards as deposit + borrow
function applyPendingRewards(event, trove) {
    const borrower = event.params._borrower;
    const newCollateral = event.params._coll;
    const newDebt = event.params._debt;
    const ethAddress = graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS);
    const collateralRewardETH = newCollateral.minus(trove.collateral);
    const collateralRewardUSD = (0, numbers_1.bigIntToBigDecimal)(collateralRewardETH).times((0, token_1.getCurrentETHPrice)());
    (0, event_1.createDeposit)(event, (0, market_1.getOrCreateMarket)(), ethAddress, collateralRewardETH, collateralRewardUSD, borrower);
    const borrowAmountLUSD = newDebt.minus(trove.debt);
    const borrowAmountUSD = (0, numbers_1.bigIntToBigDecimal)(borrowAmountLUSD);
    (0, event_1.createBorrow)(event, borrowAmountLUSD, borrowAmountUSD, borrower);
}
// Treat redeemCollateral as repay + withdraw
function redeemCollateral(event, trove) {
    const newCollateral = event.params._coll;
    const newDebt = event.params._debt;
    const repayAmountLUSD = trove.debt.minus(newDebt);
    const repayAmountUSD = (0, numbers_1.bigIntToBigDecimal)(repayAmountLUSD);
    (0, event_1.createRepay)(event, repayAmountLUSD, repayAmountUSD, graph_ts_1.Address.fromString(trove.id), event.transaction.from);
    let withdrawAmountETH = trove.collateral.minus(newCollateral);
    // If trove was closed, then extra collateral is sent to CollSurplusPool to be withdrawn by trove owner
    if (trove.collateral.equals(constants_1.BIGINT_ZERO)) {
        withdrawAmountETH = withdrawAmountETH.minus(trove.collateralSurplusChange);
        trove.collateralSurplusChange = constants_1.BIGINT_ZERO;
    }
    const withdrawAmountUSD = (0, numbers_1.bigIntToBigDecimal)(withdrawAmountETH).times((0, token_1.getCurrentETHPrice)());
    (0, event_1.createWithdraw)(event, (0, market_1.getOrCreateMarket)(), withdrawAmountETH, withdrawAmountUSD, graph_ts_1.Address.fromString(trove.id), event.transaction.from);
}
function liquidateTrove(event, trove) {
    const amountLiquidatedETH = trove.collateral;
    const amountLiquidatedUSD = (0, numbers_1.bigIntToBigDecimal)(amountLiquidatedETH).times((0, token_1.getCurrentETHPrice)());
    const profitUSD = amountLiquidatedUSD
        .times(constants_1.LIQUIDATION_FEE)
        .plus(constants_1.LIQUIDATION_RESERVE_LUSD);
    (0, event_1.createLiquidate)(event, amountLiquidatedETH, amountLiquidatedUSD, profitUSD, graph_ts_1.Address.fromString(trove.id), event.transaction.from);
    (0, protocol_1.addProtocolSideRevenue)(event, profitUSD, (0, market_1.getOrCreateMarket)());
}
/**
 * Emitted once per transaction containing at least one liquidation.
 * The event contains the total amount liquidated from all liquidations in the transaction.
 * We use this event to calculate the amount of LUSD that was burned from the stability pool
 * in exchange of how much ETH collateral. From here we calulate StabilityPool revenue.
 *
 * @param event Liquidation event
 */
function handleLiquidation(event) {
    // To accurately calculate the revenue generated by the Stability pool we
    // compare the amount of LUSD that was burned to the amount of ETH that was
    // sent to the StabilityPool. The USD difference of both amounts will be the
    // StabilityPool revenue.
    if (!event.receipt) {
        graph_ts_1.log.error("Unable to calculate liquidation revenue, no receipt found. Tx Hash: {}", [event.transaction.hash.toHexString()]);
        return;
    }
    let lusdBurned = constants_1.BIGINT_ZERO;
    let ethSent = constants_1.BIGINT_ZERO;
    for (let i = 0; i < event.receipt.logs.length; i++) {
        const log = event.receipt.logs[i];
        const burned = stabilityPoolLUSDBurn(log);
        if (burned) {
            lusdBurned = lusdBurned.plus(burned);
            continue;
        }
        const ether = etherSentToStabilityPool(log);
        if (ether) {
            ethSent = ethSent.plus(ether);
            continue;
        }
    }
    if (lusdBurned.equals(constants_1.BIGINT_ZERO) || ethSent.equals(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.error("no LUSD was burned on this liquidation", []);
        return;
    }
    const lusdValue = (0, token_1.getCurrentLUSDPrice)().times((0, numbers_1.bigIntToBigDecimal)(lusdBurned));
    const ethValue = (0, numbers_1.bigIntToBigDecimal)(ethSent).times((0, token_1.getCurrentETHPrice)());
    const revenue = ethValue.minus(lusdValue);
    const market = (0, market_1.getOrCreateStabilityPool)(event);
    (0, protocol_1.addSupplySideRevenue)(event, revenue, market);
}
exports.handleLiquidation = handleLiquidation;
// stabilityPoolLUSDBurn will return the amount of LUSD burned as indicated by this log.
// If the log is not a LUSD burn log, it will return null.
function stabilityPoolLUSDBurn(log) {
    const transfer = log_1.ERC20TransferLog.parse(log);
    if (!transfer) {
        return null;
    }
    if (transfer.tokenAddr.notEqual(graph_ts_1.Address.fromString(constants_1.LUSD_ADDRESS))) {
        return null;
    }
    if (transfer.from.notEqual(graph_ts_1.Address.fromString(constants_1.STABILITY_POOL))) {
        return null;
    }
    if (transfer.to.notEqual(graph_ts_1.Address.zero())) {
        return null;
    }
    return transfer.amount;
}
// etherSentToStabilityPool will return the amount of ETH sent to the StabilityPool.
// If this log is not EtherSent, or the destination is not the StabilityPool it will
// return null.
function etherSentToStabilityPool(log) {
    const decoded = log_1.LiquityEtherSentLog.parse(log);
    if (!decoded) {
        return null;
    }
    if (decoded.contractAddr.notEqual(graph_ts_1.Address.fromString(constants_1.ACTIVE_POOL))) {
        return null;
    }
    if (decoded.to.notEqual(graph_ts_1.Address.fromString(constants_1.STABILITY_POOL))) {
        return null;
    }
    return decoded.amount;
}
