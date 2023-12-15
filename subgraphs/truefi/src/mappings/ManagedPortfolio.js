"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = exports.handleWithdraw = exports.handleDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ManagedPortfolio_1 = require("../../generated/templates/ManagedPortfolio/ManagedPortfolio");
const schema_1 = require("../../generated/schema");
const event_1 = require("../entities/event");
const market_1 = require("../entities/market");
const position_1 = require("../entities/position");
const constants_1 = require("../utils/constants");
function handleDeposit(event) {
    let market = getOrCreateMarketForPortfolio(event);
    if (market != null) {
        (0, event_1.createDeposit)(event, graph_ts_1.Address.fromString(market.inputToken), event.params.lender, event.params.amount);
        (0, market_1.updateTokenSupply)(event, event.address, false);
    }
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
    let market = schema_1.Market.load(event.address.toHexString());
    if (market != null) {
        (0, market_1.closeMarket)(market);
        (0, event_1.createWithdraw)(event, graph_ts_1.Address.fromString(market.inputToken), event.params.lender, event.params.receivedAmount);
        (0, market_1.updateTokenSupply)(event, event.address, false);
    }
}
exports.handleWithdraw = handleWithdraw;
function handleTransfer(event) {
    if (event.params.value.equals(constants_1.BIGINT_ZERO)) {
        return;
    }
    getOrCreateMarketForPortfolio(event);
    const poolAddress = event.address;
    const contract = ManagedPortfolio_1.ManagedPortfolio.bind(event.address);
    // ManagedPortfolio: transfer of LP tokens from Non-Zero address to another Non-Zero address is prohibited.
    if (event.params.from == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
        (0, position_1.updateUserLenderPosition)(event, event.params.to, (0, market_1.getMarket)(poolAddress), contract.balanceOf(event.params.to));
        return;
    }
    (0, position_1.updateUserLenderPosition)(event, event.params.from, (0, market_1.getMarket)(poolAddress), contract.balanceOf(event.params.from));
}
exports.handleTransfer = handleTransfer;
function getOrCreateMarketForPortfolio(event) {
    let market = schema_1.Market.load(event.address.toHexString());
    if (market == null) {
        const contract = ManagedPortfolio_1.ManagedPortfolio.bind(event.address);
        const tokenResult = contract.try_underlyingToken();
        if (!tokenResult.reverted) {
            const token = tokenResult.value;
            (0, market_1.createMarket)(event, token, event.address);
        }
    }
    return schema_1.Market.load(event.address.toHexString());
}
