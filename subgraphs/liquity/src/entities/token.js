"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentLQTYPrice = exports.getCurrentLUSDPrice = exports.getCurrentETHPrice = exports.setCurrentETHPrice = exports.getRewardToken = exports.getLQTYToken = exports.getLUSDToken = exports.getETHToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const prices_1 = require("../prices");
function getETHToken() {
    const token = new schema_1.Token(constants_1.ETH_ADDRESS);
    token.name = constants_1.ETH_NAME;
    token.symbol = constants_1.ETH_SYMBOL;
    token.decimals = 18;
    token.save();
    return token;
}
exports.getETHToken = getETHToken;
function getLUSDToken() {
    const token = new schema_1.Token(constants_1.LUSD_ADDRESS);
    token.name = "Liquity USD";
    token.symbol = "LUSD";
    token.decimals = 18;
    token.save();
    return token;
}
exports.getLUSDToken = getLUSDToken;
function getLQTYToken() {
    const token = new schema_1.Token(constants_1.LQTY_ADDRESS);
    token.name = "Liquity LQTY";
    token.symbol = "LQTY";
    token.decimals = 18;
    token.save();
    return token;
}
exports.getLQTYToken = getLQTYToken;
function getRewardToken() {
    const token = getLQTYToken();
    const id = `${constants_1.RewardTokenType.DEPOSIT}-${token.id}`;
    const rToken = new schema_1.RewardToken(id);
    rToken.type = constants_1.RewardTokenType.DEPOSIT;
    rToken.token = token.id;
    rToken.save();
    return rToken;
}
exports.getRewardToken = getRewardToken;
function setCurrentETHPrice(blockNumber, price) {
    const token = getETHToken();
    token.lastPriceUSD = (0, numbers_1.bigIntToBigDecimal)(price);
    token.lastPriceBlockNumber = blockNumber;
    token.save();
}
exports.setCurrentETHPrice = setCurrentETHPrice;
function getCurrentETHPrice() {
    const ethToken = schema_1.Token.load(constants_1.ETH_ADDRESS);
    return ethToken.lastPriceUSD;
}
exports.getCurrentETHPrice = getCurrentETHPrice;
function getCurrentLUSDPrice() {
    let price = (0, prices_1.getUsdPrice)(graph_ts_1.Address.fromString(constants_1.LUSD_ADDRESS), constants_1.BIGDECIMAL_ONE);
    const half = graph_ts_1.BigDecimal.fromString("0.5");
    if (price.lt(half)) {
        // default to 1USD if price lib doesn't get a price or it is too low
        // In the early times of LUSD (around may 2021) the price lib returns 0.04.
        // The lowest it's been is ~0.95, so this should be safe for now.
        price = constants_1.BIGDECIMAL_ONE;
    }
    const token = schema_1.Token.load(constants_1.LUSD_ADDRESS);
    token.lastPriceUSD = price;
    token.save();
    return token.lastPriceUSD;
}
exports.getCurrentLUSDPrice = getCurrentLUSDPrice;
function getCurrentLQTYPrice() {
    const price = (0, prices_1.getUsdPrice)(graph_ts_1.Address.fromString(constants_1.LQTY_ADDRESS), constants_1.BIGDECIMAL_ONE);
    const token = schema_1.Token.load(constants_1.LQTY_ADDRESS);
    token.lastPriceUSD = price;
    token.save();
    return token.lastPriceUSD;
}
exports.getCurrentLQTYPrice = getCurrentLQTYPrice;
