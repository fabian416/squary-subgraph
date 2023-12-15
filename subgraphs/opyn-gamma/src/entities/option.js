"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.burnOption = exports.mintOption = exports.updateOptionTotalSupply = exports.markOptionExpired = exports.isOptionITM = exports.createOption = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../configurations/configure");
const Controller_1 = require("../../generated/Controller/Controller");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const tokens_1 = require("../common/tokens");
const numbers_1 = require("../common/utils/numbers");
const price_1 = require("../price");
const pool_1 = require("./pool");
function createOption(event) {
    const token = (0, tokens_1.getOrCreateToken)(event.params.tokenAddress);
    const option = new schema_1.Option(event.params.tokenAddress);
    option.name = token.name;
    option.symbol = token.symbol;
    option.underlyingAsset = (0, tokens_1.getOrCreateToken)(event.params.underlying).id;
    const collateralToken = (0, tokens_1.getOrCreateToken)(event.params.collateral);
    option.collateralAsset = collateralToken.id;
    option.pool = (0, pool_1.getOrCreatePool)(collateralToken).id;
    option.strikeAsset = (0, tokens_1.getOrCreateToken)(event.params.strike).id;
    option.strikePrice = (0, numbers_1.bigIntToBigDecimal)(event.params.strikePrice, constants_1.INT_EIGHT);
    option.type = event.params.isPut ? constants_1.OptionType.PUT : constants_1.OptionType.CALL;
    option.expirationTimestamp = event.params.expiry;
    option.createdTimestamp = event.block.timestamp;
    option.lastPriceBlockNumber = constants_1.BIGINT_ZERO;
    option.totalSupply = constants_1.BIGINT_ZERO;
    option.openInterestUSD = constants_1.BIGDECIMAL_ZERO;
    option.save();
    return option;
}
exports.createOption = createOption;
function isOptionITM(option) {
    const controller = Controller_1.Controller.bind(configure_1.NetworkConfigs.getControllerAddress());
    const payout = controller.getPayout(graph_ts_1.Address.fromBytes(option.id), constants_1.BIGINT_TEN_TO_EIGHTH);
    return payout.gt(constants_1.BIGINT_ZERO);
}
exports.isOptionITM = isOptionITM;
function markOptionExpired(event, option) {
    if (!isOptionExpired(event, option)) {
        return;
    }
    if (option.expirationPriceUSD) {
        return;
    }
    option.expirationPriceUSD = (0, price_1.getOptionExpiryPrice)(event, option);
    option.save();
    const pool = (0, pool_1.getOrCreatePool)((0, tokens_1.getOrCreateToken)(option.pool));
    const totalValueUSD = (0, price_1.getOptionValue)(event, option, option.totalSupply);
    if (isOptionITM(option)) {
        (0, pool_1.addPoolExercisedVolume)(event, pool, totalValueUSD);
    }
    (0, pool_1.addPoolClosedVolume)(event, pool, totalValueUSD);
    updateOptionTotalSupply(event, option, constants_1.BIGINT_ZERO);
}
exports.markOptionExpired = markOptionExpired;
function updateOptionTotalSupply(event, option, netChange) {
    const previousOpenInterestUSD = option.openInterestUSD;
    option.totalSupply = option.totalSupply.plus(netChange);
    let totalValueUSD = constants_1.BIGDECIMAL_ZERO;
    if (!isOptionExpired(event, option)) {
        totalValueUSD = (0, price_1.getOptionValue)(event, option, option.totalSupply);
    }
    option.openInterestUSD = totalValueUSD;
    const pool = (0, pool_1.getOrCreatePool)((0, tokens_1.getOrCreateToken)(option.pool));
    (0, pool_1.updatePoolOpenInterest)(event, pool, option.openInterestUSD.minus(previousOpenInterestUSD));
    option.save();
}
exports.updateOptionTotalSupply = updateOptionTotalSupply;
function mintOption(event, option, amount) {
    updateOptionTotalSupply(event, option, amount);
    const pool = (0, pool_1.getOrCreatePool)((0, tokens_1.getOrCreateToken)(option.pool));
    const amountUSD = (0, price_1.getOptionValue)(event, option, amount);
    (0, pool_1.addPoolMintVolume)(event, pool, amountUSD);
}
exports.mintOption = mintOption;
function burnOption(event, option, amount) {
    updateOptionTotalSupply(event, option, constants_1.BIGINT_ZERO.minus(amount));
}
exports.burnOption = burnOption;
function isOptionExpired(event, option) {
    return event.block.timestamp.gt(option.expirationTimestamp);
}
