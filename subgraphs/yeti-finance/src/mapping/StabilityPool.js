"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStabilityPoolYUSDBalanceUpdated = exports.handleStabilityPoolBalancesUpdated = void 0;
const protocol_1 = require("../entities/protocol");
const price_1 = require("../utils/price");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
/**
 * Assets balance was updated
 *
 * @param event handleStabilityPoolBalancesUpdated event
 */
function handleStabilityPoolBalancesUpdated(event) {
    const protocol = (0, protocol_1.getOrCreateYetiProtocol)();
    const oldAssetUSDLocked = protocol.totalStablePoolAssetUSD;
    let totalAssetLocked = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < event.params.amounts.length; i++) {
        const asset = event.params.assets[i];
        const amount = event.params.amounts[i];
        totalAssetLocked = totalAssetLocked.plus((0, price_1.getUSDPriceWithoutDecimals)(asset, amount.toBigDecimal()));
    }
    const totalValueLocked = protocol.totalValueLockedUSD.plus(totalAssetLocked.minus(oldAssetUSDLocked));
    (0, protocol_1.updateProtocolLockedUSD)(event, totalValueLocked);
}
exports.handleStabilityPoolBalancesUpdated = handleStabilityPoolBalancesUpdated;
/**
 * YUSD balance was updated
 *
 * @param event StabilityPoolYUSDBalanceUpdated event
 */
function handleStabilityPoolYUSDBalanceUpdated(event) {
    const totalYUSDLocked = event.params._newBalance;
    const protocol = (0, protocol_1.getOrCreateYetiProtocol)();
    const oldYUSDLockded = protocol.totalYUSDLocked;
    const totalValueLockedUSD = protocol.totalValueLockedUSD.plus((0, numbers_1.bigIntToBigDecimal)(totalYUSDLocked.minus(oldYUSDLockded)));
    (0, protocol_1.updateProtocolLockedUSD)(event, totalValueLockedUSD);
    protocol.totalYUSDLocked = totalYUSDLocked;
    protocol.save();
}
exports.handleStabilityPoolYUSDBalanceUpdated = handleStabilityPoolYUSDBalanceUpdated;
