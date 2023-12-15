"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCollBalanceUpdated = void 0;
const CollSurplusPool_1 = require("../../generated/CollSurplusPool/CollSurplusPool");
const event_1 = require("../entities/event");
const trove_1 = require("../entities/trove");
const price_1 = require("../utils/price");
const constants_1 = require("../utils/constants");
const protocol_1 = require("../entities/protocol");
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
    const borrower = event.params._account;
    const trove = (0, trove_1.getOrCreateTrove)(borrower);
    const collSurplusPool = CollSurplusPool_1.CollSurplusPool.bind(event.address);
    const collateralsSurplus = collSurplusPool.getAmountsClaimable(borrower);
    for (let i = 0; i < collateralsSurplus.value0.length; i++) {
        const token = collateralsSurplus.value0[i];
        const amount = collateralsSurplus.value1[i];
        const troveToken = (0, trove_1.getOrCreateTroveToken)(trove, token);
        if (amount > troveToken.collateralSurplus) {
            troveToken.collateralSurplusChange = amount.minus(troveToken.collateralSurplus);
            const collateralSurplusUSD = (0, price_1.getUSDPriceWithoutDecimals)(token, amount.toBigDecimal());
            (0, event_1.createWithdraw)(event, troveToken.collateralSurplusChange, collateralSurplusUSD, borrower, token);
        }
        else {
            troveToken.collateralSurplusChange = constants_1.BIGINT_ZERO;
        }
        troveToken.collateralSurplus = amount;
        troveToken.save();
    }
    trove.save();
    (0, protocol_1.updateUsageMetrics)(event, borrower);
    (0, protocol_1.incrementProtocolWithdrawCount)(event);
}
exports.handleCollBalanceUpdated = handleCollBalanceUpdated;
