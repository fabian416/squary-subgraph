"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsdPriceForEthAmount = exports.getUsdPricePerEth = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const getters_1 = require("./getters");
const ChainLinkAggregator_1 = require("../../generated/Shares/ChainLinkAggregator");
function getUsdPricePerEth() {
    const chainLinkAggregator = ChainLinkAggregator_1.ChainLinkAggregator.bind(graph_ts_1.Address.fromString(constants_1.CHAINLINK_AGGREGATOR_ETH_USD));
    const latestAnswerCall = chainLinkAggregator.try_latestAnswer();
    if (latestAnswerCall.reverted) {
        return constants_1.BIGDECIMAL_ZERO;
    }
    const decimalsCall = chainLinkAggregator.try_decimals();
    if (decimalsCall.reverted) {
        return constants_1.BIGDECIMAL_ZERO;
    }
    return latestAnswerCall.value
        .toBigDecimal()
        .div(constants_1.BIGINT_TEN.pow(decimalsCall.value).toBigDecimal());
}
exports.getUsdPricePerEth = getUsdPricePerEth;
function getUsdPriceForEthAmount(amount, event) {
    const eth = (0, getters_1.getOrCreateToken)(event);
    return amount
        .toBigDecimal()
        .div(constants_1.BIGINT_TEN.pow(constants_1.ETH_DECIMALS).toBigDecimal())
        .times(eth.lastPriceUSD);
}
exports.getUsdPriceForEthAmount = getUsdPriceForEthAmount;
