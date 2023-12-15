"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBuy = exports.handleSell = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./common/constants");
const getters_1 = require("./common/getters");
const helpers_1 = require("./common/helpers");
const utils_1 = require("./common/utils");
// update revenue from Stablizer for
//    - protocol.cumulativeProtocolSideRevenueUSD
//    - protocol.cumulativeTotalRevenueUSD
//    - FinancialsDailySnapshot.dailyProtocolSideRevenueUSD
//    - FinancialsDailySnapshot.cumulativeProtocolSideRevenueUSD
//    - FinancialsDailySnapshot.dailyTotalRevenueUSD
//    - FinancialsDailySnapshot.cumulativeTotalRevenueUSD
function handleSell(event) {
    // assume price of DOLA/DAI equal $1
    let token = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.DOLA_ADDRESS));
    let fees = event.params.sold
        .minus(event.params.received)
        .toBigDecimal()
        .div((0, utils_1.decimalsToBigDecimal)(token.decimals));
    (0, helpers_1.updateStablizerFees)(fees, event);
}
exports.handleSell = handleSell;
function handleBuy(event) {
    // assume price of DOLA/DAI equal $1
    let token = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.DOLA_ADDRESS));
    let fees = event.params.spent
        .minus(event.params.purchased)
        .toBigDecimal()
        .div((0, utils_1.decimalsToBigDecimal)(token.decimals));
    (0, helpers_1.updateStablizerFees)(fees, event);
}
exports.handleBuy = handleBuy;
