"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.amountInUSDForTru = exports.getTokenPrice = exports.amountInUSD = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ChainlinkTruUsdcOracle_1 = require("../../generated/templates/TruefiPool2/ChainlinkTruUsdcOracle");
const ChainlinkTruUsdtOracle_1 = require("../../generated/templates/TruefiPool2/ChainlinkTruUsdtOracle");
const ChainlinkTruBusdOracle_1 = require("../../generated/templates/TruefiPool2/ChainlinkTruBusdOracle");
const ChainlinkTruTusdOracle_1 = require("../../generated/templates/TruefiPool2/ChainlinkTruTusdOracle");
const token_1 = require("./token");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const index_1 = require("../prices/index");
const constants_2 = require("../prices/common/constants");
function amountInUSD(amount, token) {
    if (amount == constants_1.BIGINT_ZERO) {
        return constants_1.BIGDECIMAL_ZERO;
    }
    if (token.underlyingAsset) {
        return amountInUSD(amount, (0, token_1.getTokenById)(token.underlyingAsset));
    }
    return (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals).times(getTokenPrice(token));
}
exports.amountInUSD = amountInUSD;
function getTokenPrice(token) {
    if (token.id == constants_1.STABLECOIN_USDC_ADDRESS) {
        return getUsdcPrice(token.decimals);
    }
    else if (token.id == constants_1.STABLECOIN_USDT_ADDRESS) {
        return getUsdtPrice(token.decimals);
    }
    else if (token.id == constants_1.STABLECOIN_BUSD_ADDRESS) {
        return getBusdPrice(token.decimals);
    }
    else if (token.id == constants_1.STABLECOIN_TUSD_ADDRESS) {
        return getTusdPrice(token.decimals);
    }
    // Use external oracle to get non-stablecoin price as TrueFi doesn't provide oracle for them yet.
    let customPrice = (0, index_1.getUsdPricePerToken)(graph_ts_1.Address.fromString(token.id));
    let priceUSD = customPrice.usdPrice.div(customPrice.decimalsBaseTen);
    return priceUSD;
}
exports.getTokenPrice = getTokenPrice;
function amountInUSDForTru(amount, token) {
    if (amount == constants_1.BIGINT_ZERO) {
        return constants_1.BIGDECIMAL_ZERO;
    }
    return (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals).times(getTruPrice(token.decimals));
}
exports.amountInUSDForTru = amountInUSDForTru;
function getTruPrice(decimals) {
    const priceOracleAddress = graph_ts_1.Address.fromString(constants_1.TRU_USDC_ORACLE_ADDRESS);
    const priceOracle = ChainlinkTruUsdcOracle_1.ChainlinkTruUsdcOracle.bind(priceOracleAddress);
    const tryGetLatestTruPrice = priceOracle.try_getLatestTruPrice();
    if (tryGetLatestTruPrice.reverted) {
        graph_ts_1.log.warning("Failed to fetch latest Tru price, contract call reverted. Price oracle: {}", [priceOracleAddress.toHexString()]);
        return constants_1.BIGDECIMAL_ZERO;
    }
    return (0, numbers_1.bigIntToBigDecimal)(tryGetLatestTruPrice.value, decimals);
}
function getUsdcPrice(decimals) {
    const priceOracleAddress = graph_ts_1.Address.fromString(constants_1.TRU_USDC_ORACLE_ADDRESS);
    const priceOracle = ChainlinkTruUsdcOracle_1.ChainlinkTruUsdcOracle.bind(priceOracleAddress);
    const tryTokenToUsd = priceOracle.try_tokenToUsd(constants_1.BIGINT_ONE);
    if (tryTokenToUsd.reverted) {
        return constants_1.BIGDECIMAL_ONE;
    }
    return (0, numbers_1.bigIntToBigDecimal)(tryTokenToUsd.value, constants_2.DEFAULT_DECIMALS.toI32() - decimals);
}
function getUsdtPrice(decimals) {
    const priceOracleAddress = graph_ts_1.Address.fromString(constants_1.TRU_USDT_ORACLE_ADDRESS);
    const priceOracle = ChainlinkTruUsdtOracle_1.ChainlinkTruUsdtOracle.bind(priceOracleAddress);
    const tryTokenToUsd = priceOracle.try_tokenToUsd(constants_1.BIGINT_ONE);
    if (tryTokenToUsd.reverted) {
        return constants_1.BIGDECIMAL_ONE;
    }
    return (0, numbers_1.bigIntToBigDecimal)(tryTokenToUsd.value, constants_2.DEFAULT_DECIMALS.toI32() - decimals);
}
function getBusdPrice(decimals) {
    const priceOracleAddress = graph_ts_1.Address.fromString(constants_1.TRU_BUSD_ORACLE_ADDRESS);
    const priceOracle = ChainlinkTruBusdOracle_1.ChainlinkTruBusdOracle.bind(priceOracleAddress);
    const tryTokenToUsd = priceOracle.try_tokenToUsd(constants_1.BIGINT_ONE);
    if (tryTokenToUsd.reverted) {
        return constants_1.BIGDECIMAL_ONE;
    }
    return (0, numbers_1.bigIntToBigDecimal)(tryTokenToUsd.value, constants_2.DEFAULT_DECIMALS.toI32() - decimals);
}
function getTusdPrice(decimals) {
    const priceOracleAddress = graph_ts_1.Address.fromString(constants_1.TRU_TUSD_ORACLE_ADDRESS);
    const priceOracle = ChainlinkTruTusdOracle_1.ChainlinkTruTusdOracle.bind(priceOracleAddress);
    const tryTokenToUsd = priceOracle.try_tokenToUsd(constants_1.BIGINT_ONE);
    if (tryTokenToUsd.reverted) {
        return constants_1.BIGDECIMAL_ONE;
    }
    return (0, numbers_1.bigIntToBigDecimal)(tryTokenToUsd.value, constants_2.DEFAULT_DECIMALS.toI32() - decimals);
}
