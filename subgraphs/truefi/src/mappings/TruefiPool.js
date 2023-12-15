"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = exports.handleTransferForLegacyPool = exports.handleExit = exports.handleJoin = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const TruefiPool2_1 = require("../../generated/templates/TruefiPool2/TruefiPool2");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const event_1 = require("../entities/event");
const market_1 = require("../entities/market");
const position_1 = require("../entities/position");
const constants_2 = require("../utils/constants");
function handleJoin(event) {
    let market = schema_1.Market.load(event.address.toHexString());
    if (market != null) {
        (0, event_1.createDeposit)(event, graph_ts_1.Address.fromString(market.inputToken), event.params.staker, event.params.deposited);
        (0, market_1.updateTokenSupply)(event, event.address, true);
    }
}
exports.handleJoin = handleJoin;
function handleExit(event) {
    let market = schema_1.Market.load(event.address.toHexString());
    if (market != null) {
        (0, event_1.createWithdraw)(event, graph_ts_1.Address.fromString(market.inputToken), event.params.staker, event.params.amount);
        (0, market_1.updateTokenSupply)(event, event.address, true);
    }
}
exports.handleExit = handleExit;
function handleTransferForLegacyPool(event) {
    // This is for legacy tfTUSD pool
    let market = schema_1.Market.load(event.address.toHexString());
    if (market == null) {
        (0, market_1.createMarket)(event, graph_ts_1.Address.fromString(constants_2.LEGACY_POOL_TOKEN_ADDRESS), event.address);
    }
    handleTransfer(event);
}
exports.handleTransferForLegacyPool = handleTransferForLegacyPool;
function handleTransfer(event) {
    if (event.params.value.equals(constants_1.BIGINT_ZERO)) {
        return;
    }
    if (event.params.from != graph_ts_1.Address.fromString(constants_2.ZERO_ADDRESS) &&
        event.params.to != graph_ts_1.Address.fromString(constants_2.ZERO_ADDRESS)) {
        let market = schema_1.Market.load(event.address.toHexString());
        if (market == null) {
            return;
        }
        const poolAddress = graph_ts_1.Address.fromString(event.address.toHexString());
        const contract = TruefiPool2_1.TruefiPool2.bind(event.address);
        // Handle transfer as withdraw + deposit
        (0, event_1.createWithdraw)(event, graph_ts_1.Address.fromString(market.inputToken), event.params.from, event.params.value, true);
        (0, position_1.updateUserLenderPosition)(event, event.params.from, (0, market_1.getMarket)(poolAddress), contract.balanceOf(event.params.from));
        (0, event_1.createDeposit)(event, graph_ts_1.Address.fromString(market.inputToken), event.params.to, event.params.value, true);
        (0, position_1.updateUserLenderPosition)(event, event.params.to, (0, market_1.getMarket)(poolAddress), contract.balanceOf(event.params.to));
    }
}
exports.handleTransfer = handleTransfer;
