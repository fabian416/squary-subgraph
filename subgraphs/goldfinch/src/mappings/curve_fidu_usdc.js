"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTokenExchange = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const helpers_1 = require("../entities/helpers");
const user_1 = require("../entities/user");
function handleTokenExchange(event) {
    const buyer = event.params.buyer;
    const boughtId = event.params.bought_id;
    const soldId = event.params.sold_id;
    const tokensSold = event.params.tokens_sold;
    const tokensBought = event.params.tokens_bought;
    (0, user_1.getOrInitUser)(buyer);
    // FIDU=0 USDC=1
    const curveFiduId = graph_ts_1.BigInt.fromI32(0);
    const boughtFidu = boughtId.equals(curveFiduId);
    const eventName = boughtFidu ? "CURVE_FIDU_BUY" : "CURVE_FIDU_SELL";
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, eventName, buyer);
    transaction.category = eventName;
    transaction.sentAmount = tokensSold;
    transaction.sentToken = soldId.equals(curveFiduId) ? "FIDU" : "USDC";
    transaction.receivedAmount = tokensBought;
    transaction.receivedToken = boughtFidu ? "FIDU" : "USDC";
    // sell fidu buy usdc
    if (soldId.equals(curveFiduId)) {
        // usdc / fidu
        transaction.fiduPrice = (0, helpers_1.usdcWithFiduPrecision)(tokensBought).div(tokensSold);
    }
    else {
        transaction.fiduPrice = (0, helpers_1.usdcWithFiduPrecision)(tokensSold).div(tokensBought);
    }
    transaction.save();
}
exports.handleTokenExchange = handleTokenExchange;
