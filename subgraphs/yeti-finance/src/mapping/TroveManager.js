"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTroveLiquidated = exports.handleTroveUpdated = exports.handleRedemption = void 0;
const event_1 = require("../entities/event");
const trove_1 = require("../entities/trove");
const numbers_1 = require("../utils/numbers");
const constants_1 = require("../utils/constants");
const schema_1 = require("../../generated/schema");
const protocol_1 = require("../entities/protocol");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const price_1 = require("../utils/price");
var TroveManagerOperation;
(function (TroveManagerOperation) {
    TroveManagerOperation[TroveManagerOperation["applyPendingRewards"] = 0] = "applyPendingRewards";
    TroveManagerOperation[TroveManagerOperation["liquidateInNormalMode"] = 1] = "liquidateInNormalMode";
    TroveManagerOperation[TroveManagerOperation["liquidateInRecoveryMode"] = 2] = "liquidateInRecoveryMode";
    TroveManagerOperation[TroveManagerOperation["redeemCollateral"] = 3] = "redeemCollateral";
})(TroveManagerOperation || (TroveManagerOperation = {}));
function handleRedemption(event) {
    const feeAmountUSD = (0, numbers_1.bigIntToBigDecimal)(event.params.YUSDfee);
    (0, protocol_1.addProtocolSideRevenue)(event, feeAmountUSD);
}
exports.handleRedemption = handleRedemption;
/**
 * Emitted when a trove was updated because of a TroveManagerOperation operation
 *
 * @param event TroveUpdated event
 */
function handleTroveUpdated(event) {
    const trove = (0, trove_1.getOrCreateTrove)(event.params._borrower);
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
    for (let i = 0; i < event.params._tokens.length; i++) {
        const token = event.params._tokens[i];
        const amount = event.params._amounts[i];
        const troveToken = (0, trove_1.getOrCreateTroveToken)(trove, token);
        troveToken.collateral = amount;
        troveToken.save();
    }
    trove.debt = event.params._debt;
    trove.save();
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
    const newDebt = event.params._debt;
    if (trove.debt.gt(newDebt)) {
        graph_ts_1.log.critical("Tracked trove debt was less than actual debt in TroveLiquidated, actual: {}, tracked: {}", [trove.debt.toString(), newDebt.toString()]);
    }
    if (trove.tokens) {
        for (let i = 0; i < trove.tokens.length; i++) {
            const troveToken = schema_1._TroveToken.load(trove.tokens.at(i));
            const tokenAddr = graph_ts_1.Address.fromString(troveToken.token);
            const amount = troveToken.collateral;
            // Gas compensation already subtracted, only when (MCR <= ICR < TCR & SP.LUSD >= trove.debt)
            if (troveToken.collateral.gt(amount)) {
                // Add gas compensation back to liquidated collateral amount
                troveToken.collateral = troveToken.collateral
                    .divDecimal(constants_1.BIGDECIMAL_ONE.minus(constants_1.LIQUIDATION_FEE))
                    .truncate(0).digits;
            }
            // Apply pending rewards if necessary
            let collateralReward = amount.minus(troveToken.collateral);
            if (troveToken.collateralSurplusChange.gt(constants_1.BIGINT_ZERO)) {
                collateralReward = collateralReward.plus(troveToken.collateralSurplusChange);
                troveToken.collateralSurplusChange = constants_1.BIGINT_ZERO;
            }
            if (collateralReward.gt(constants_1.BIGINT_ZERO)) {
                const collateralRewardUSD = (0, price_1.getUSDPriceWithoutDecimals)(tokenAddr, amount.toBigDecimal());
                (0, event_1.createDeposit)(event, collateralReward, collateralRewardUSD, borrower, tokenAddr);
            }
            const borrowAmountLUSD = newDebt.minus(trove.debt);
            if (borrowAmountLUSD.gt(constants_1.BIGINT_ZERO)) {
                const borrowAmountUSD = (0, numbers_1.bigIntToBigDecimal)(borrowAmountLUSD);
                (0, event_1.createBorrow)(event, borrowAmountLUSD, borrowAmountUSD, borrower);
            }
            troveToken.collateral = amount;
            troveToken.save();
        }
    }
    trove.debt = newDebt;
    trove.save();
    (0, protocol_1.updateUsageMetrics)(event, borrower);
}
exports.handleTroveLiquidated = handleTroveLiquidated;
// Treat applyPendingRewards as deposit + borrow
function applyPendingRewards(event, trove) {
    const borrower = event.params._borrower;
    const newDebt = event.params._debt;
    for (let i = 0; i < event.params._tokens.length; i++) {
        const token = event.params._tokens[i];
        const amount = event.params._amounts[i];
        const troveToken = (0, trove_1.getOrCreateTroveToken)(trove, token);
        const collateralReward = amount.minus(troveToken.collateral);
        const collateralRewardUSD = (0, price_1.getUSDPriceWithoutDecimals)(token, amount.toBigDecimal());
        (0, event_1.createDeposit)(event, collateralReward, collateralRewardUSD, borrower, token);
        troveToken.save();
    }
    const borrowAmountYUSD = newDebt.minus(trove.debt);
    const borrowAmountUSD = (0, numbers_1.bigIntToBigDecimal)(borrowAmountYUSD);
    (0, event_1.createBorrow)(event, borrowAmountYUSD, borrowAmountUSD, borrower);
    (0, protocol_1.updateUsageMetrics)(event, borrower);
}
// Treat redeemCollateral as repay + withdraw
function redeemCollateral(event, trove) {
    const newDebt = event.params._debt;
    const repayAmountYUSD = trove.debt.minus(newDebt);
    const repayAmountUSD = (0, numbers_1.bigIntToBigDecimal)(repayAmountYUSD);
    (0, event_1.createRepay)(event, repayAmountYUSD, repayAmountUSD, event.transaction.from);
    for (let i = 0; i < event.params._tokens.length; i++) {
        const token = event.params._tokens[i];
        const amount = event.params._amounts[i];
        const troveToken = (0, trove_1.getOrCreateTroveToken)(trove, token);
        let withdrawAmount = troveToken.collateral.minus(amount);
        // If trove was closed, then extra collateral is sent to CollSurplusPool to be withdrawn by trove owner
        if (troveToken.collateral.equals(constants_1.BIGINT_ZERO)) {
            withdrawAmount = withdrawAmount.minus(troveToken.collateralSurplusChange);
            troveToken.collateralSurplusChange = constants_1.BIGINT_ZERO;
        }
        if (withdrawAmount.gt(constants_1.BIGINT_ZERO)) {
            const withdrawAmountUSD = (0, price_1.getUSDPriceWithoutDecimals)(token, amount.toBigDecimal());
            (0, event_1.createWithdraw)(event, withdrawAmount, withdrawAmountUSD, event.transaction.from, token);
        }
        troveToken.save();
    }
    (0, protocol_1.updateUsageMetrics)(event, event.transaction.from);
    (0, protocol_1.incrementProtocolWithdrawCount)(event);
}
function liquidateTrove(event, trove) {
    let supplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    let profit = constants_1.BIGDECIMAL_ZERO;
    if (trove.tokens) {
        for (let i = 0; i < trove.tokens.length; i++) {
            const troveToken = schema_1._TroveToken.load(trove.tokens.at(i));
            const tokenAddr = graph_ts_1.Address.fromString(troveToken.token);
            const amount = troveToken.collateral;
            const amountUSD = (0, price_1.getUSDPriceWithoutDecimals)(tokenAddr, amount.toBigDecimal());
            const profitUSD = amountUSD
                .times(constants_1.LIQUIDATION_FEE)
                .plus(constants_1.LIQUIDATION_RESERVE_YUSD);
            (0, event_1.createLiquidate)(event, amount, amountUSD, profitUSD, event.transaction.from, tokenAddr);
            profit = profit.plus(profitUSD);
            supplySideRevenueUSD = supplySideRevenueUSD.plus(amountUSD);
        }
        const liquidatedDebtUSD = (0, numbers_1.bigIntToBigDecimal)(trove.debt);
        supplySideRevenueUSD = supplySideRevenueUSD.times(constants_1.BIGDECIMAL_ONE.minus(constants_1.LIQUIDATION_FEE)).minus(liquidatedDebtUSD);
        (0, protocol_1.addSupplySideRevenue)(event, supplySideRevenueUSD);
        (0, protocol_1.addProtocolSideRevenue)(event, profit);
    }
    (0, protocol_1.updateUsageMetrics)(event, event.transaction.from);
}
