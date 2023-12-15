"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCollBalanceUpdated = void 0;
const event_1 = require("../entities/event");
const market_1 = require("../entities/market");
const token_1 = require("../entities/token");
const trove_1 = require("../entities/trove");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
/**
 * Whenever a borrower's trove is closed by a non-owner address because of either:
 *   1. Redemption
 *   2. Liquidation in recovery mode with collateral ratio > 110%
 * the remaining collateral is sent to CollSurplusPool to be claimed (withdrawn) by the owner.
 * Because ETH price is not updated during the actual withdrawal, the Withdraw event is instead created upon collateral deposit
 *
 * @param event CollBalanceUpdated event
 */
function handleCollBalanceUpdated(event) {
    const borrower = event.params._account;
    const collateralSurplusETH = event.params._newBalance;
    const trove = (0, trove_1.getOrCreateTrove)(borrower);
    if (collateralSurplusETH > trove.collateralSurplus) {
        trove.collateralSurplusChange = collateralSurplusETH.minus(trove.collateralSurplus);
        const collateralSurplusUSD = (0, numbers_1.bigIntToBigDecimal)(trove.collateralSurplusChange).times((0, token_1.getCurrentETHPrice)());
        (0, event_1.createWithdraw)(event, (0, market_1.getOrCreateMarket)(), trove.collateralSurplusChange, collateralSurplusUSD, borrower, borrower);
    }
    else {
        trove.collateralSurplusChange = constants_1.BIGINT_ZERO;
    }
    trove.collateralSurplus = collateralSurplusETH;
    trove.save();
}
exports.handleCollBalanceUpdated = handleCollBalanceUpdated;
