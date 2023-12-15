"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNameFromCurrency = exports.getTokenFromCurrency = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const token_1 = require("../getters/token");
const constants_1 = require("./constants");
function getTokenFromCurrency(event, currencyId) {
    // default if no currencyID is recognized
    let tokenAddress = constants_1.ZERO_ADDRESS.toHexString();
    if (currencyId == "1") {
        tokenAddress = constants_1.cETH_ADDRESS;
    }
    else if (currencyId == "2") {
        tokenAddress = constants_1.cDAI_ADDRESS;
    }
    else if (currencyId == "3") {
        tokenAddress = constants_1.cUSDC_ADDRESS;
    }
    else if (currencyId == "4") {
        tokenAddress = constants_1.cWBTC_ADDRESS;
    }
    else {
        graph_ts_1.log.warning(" -- New currency found: {}", [currencyId.toString()]);
    }
    const token = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(tokenAddress), event.block.number);
    return token;
}
exports.getTokenFromCurrency = getTokenFromCurrency;
function getNameFromCurrency(currencyId) {
    // default if no currencyID is recognized
    let currencyName = "UNKNOWN";
    if (currencyId == "1") {
        currencyName = "ETH";
    }
    else if (currencyId == "2") {
        currencyName = "DAI";
    }
    else if (currencyId == "3") {
        currencyName = "USDC";
    }
    else if (currencyId == "4") {
        currencyName = "WBTC";
    }
    else {
        graph_ts_1.log.warning(" -- New currency found: {}", [currencyId.toString()]);
    }
    return currencyName;
}
exports.getNameFromCurrency = getNameFromCurrency;
