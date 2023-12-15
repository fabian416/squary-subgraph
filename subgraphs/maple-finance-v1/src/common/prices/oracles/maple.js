"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapleOracleGetTokenPriceInUSD = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const MapleGlobals_1 = require("../../../../generated/templates/Pool/MapleGlobals");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
/**
 * Get token price in USD from maples oracle
 * @param token token to get the quote for
 * @returns token price or null if no price is available
 */
function mapleOracleGetTokenPriceInUSD(token) {
    const mapleGlobalsContract = MapleGlobals_1.MapleGlobals.bind(constants_1.MAPLE_GLOBALS_ADDRESS);
    const getLatestPriceCall = mapleGlobalsContract.try_getLatestPrice(graph_ts_1.Address.fromString(token.id));
    let value = null;
    if (!getLatestPriceCall.reverted) {
        const rawQuote = getLatestPriceCall.value;
        value = (0, utils_1.parseUnits)(rawQuote, constants_1.MAPLE_GLOBALS_ORACLE_QUOTE_DECIMALS.toI32());
    }
    return value;
}
exports.mapleOracleGetTokenPriceInUSD = mapleOracleGetTokenPriceInUSD;
