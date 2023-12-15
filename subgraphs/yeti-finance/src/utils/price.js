"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAsssetsUSD = exports.getUSDPrice = exports.getUSDPriceWithoutDecimals = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const YetiController_1 = require("../../generated/ActivePool/YetiController");
const token_1 = require("../entities/token");
const constants_1 = require("./constants");
function getUSDPriceWithoutDecimals(tokenAddr, amount) {
    const token = (0, token_1.getOrCreateToken)(tokenAddr);
    return getUSDPrice(tokenAddr).times(amount).div(constants_1.BIGINT_TEN.pow(token.decimals).toBigDecimal());
}
exports.getUSDPriceWithoutDecimals = getUSDPriceWithoutDecimals;
function getUSDPrice(tokenAddr) {
    const yetiControllerContract = YetiController_1.YetiController.bind(graph_ts_1.Address.fromString(constants_1.YETI_CONTROLLER));
    const result = yetiControllerContract.try_getPrice(tokenAddr);
    if (!result.reverted) {
        let decimals = yetiControllerContract.try_DECIMAL_PRECISION();
        if (decimals.reverted) {
            return constants_1.BIGDECIMAL_ZERO;
        }
        return result.value.div(decimals.value).toBigDecimal();
    }
    return constants_1.BIGDECIMAL_ZERO;
}
exports.getUSDPrice = getUSDPrice;
function getAsssetsUSD(tokens, amounts) {
    let totalAmount = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const amount = amounts[i];
        totalAmount = totalAmount.plus(getUSDPriceWithoutDecimals(token, amount.toBigDecimal()));
    }
    return totalAmount;
}
exports.getAsssetsUSD = getAsssetsUSD;
