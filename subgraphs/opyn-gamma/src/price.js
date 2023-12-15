"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptionExpiryPrice = exports.getOptionValue = exports.getUnderlyingPrice = exports.getUSDAmount = exports.getTokenPrice = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../configurations/configure");
const Oracle_1 = require("../generated/Controller/Oracle");
const constants_1 = require("./common/constants");
const tokens_1 = require("./common/tokens");
const numbers_1 = require("./common/utils/numbers");
const prices_1 = require("./prices");
function getTokenPrice(event, token) {
    if (event.block.number == token.lastPriceBlockNumber) {
        return token.lastPriceUSD;
    }
    const oracle = Oracle_1.Oracle.bind(configure_1.NetworkConfigs.getOracleAddress(event.block.number.toI32()));
    const priceResult = oracle.try_getPrice(graph_ts_1.Address.fromBytes(token.id));
    if (!priceResult.reverted) {
        const price = (0, numbers_1.bigIntToBigDecimal)(priceResult.value, constants_1.INT_EIGHT);
        token.lastPriceBlockNumber = event.block.number;
        token.lastPriceUSD = price;
        token.save();
        return price;
    }
    graph_ts_1.log.warning("Failed to get price for asset: {}, trying with price oracle", [
        token.id.toHex(),
    ]);
    return (0, prices_1.getUsdPricePerToken)(graph_ts_1.Address.fromBytes(token.id)).usdPrice;
}
exports.getTokenPrice = getTokenPrice;
function getUSDAmount(event, token, amount) {
    const price = getTokenPrice(event, token);
    return (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals).times(price);
}
exports.getUSDAmount = getUSDAmount;
function getUnderlyingPrice(event, option) {
    if (event.block.number == option.lastPriceBlockNumber) {
        return option.lastPriceUSD;
    }
    const underlyingPrice = getTokenPrice(event, (0, tokens_1.getOrCreateToken)(graph_ts_1.Address.fromBytes(option.underlyingAsset)));
    const strikeAssetPrice = getTokenPrice(event, (0, tokens_1.getOrCreateToken)(graph_ts_1.Address.fromBytes(option.strikeAsset)));
    const price = underlyingPrice.times(strikeAssetPrice);
    option.lastPriceBlockNumber = event.block.number;
    option.lastPriceUSD = price;
    option.save();
    return price;
}
exports.getUnderlyingPrice = getUnderlyingPrice;
function getOptionValue(event, option, amount) {
    return getUnderlyingPrice(event, option).times((0, numbers_1.bigIntToBigDecimal)(amount, constants_1.INT_EIGHT));
}
exports.getOptionValue = getOptionValue;
function getOptionExpiryPrice(event, option) {
    const oracle = Oracle_1.Oracle.bind(configure_1.NetworkConfigs.getOracleAddress(event.block.number.toI32()));
    const underlyingPrice = getExpiryPrice(oracle, option.underlyingAsset, option.expirationTimestamp);
    const strikePrice = getExpiryPrice(oracle, option.strikeAsset, option.expirationTimestamp);
    return underlyingPrice.times(strikePrice);
}
exports.getOptionExpiryPrice = getOptionExpiryPrice;
function getExpiryPrice(oracle, asset, expirationTimestamp) {
    const callResult = oracle.try_getExpiryPrice(graph_ts_1.Address.fromBytes(asset), expirationTimestamp);
    if (callResult.reverted) {
        graph_ts_1.log.warning("Failed to get expiry price for asset {} and expiry {}, setting to 0", [asset.toHex(), expirationTimestamp.toString()]);
        return constants_1.BIGDECIMAL_ZERO;
    }
    return (0, numbers_1.bigIntToBigDecimal)(callResult.value.value0, constants_1.INT_EIGHT);
}
