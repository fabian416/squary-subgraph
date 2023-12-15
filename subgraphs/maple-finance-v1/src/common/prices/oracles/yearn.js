"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yearnOracleGetTokenPriceInUSD = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const YearnOracle_1 = require("../../../../generated/templates/Pool/YearnOracle");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
/**
 * Get a quote in USD from yearn oracle for token, this quote is only valid if valid is true.
 * If invalid, the value of the quote will be ZERO_BD
 * @param token token to get the quote for
 * @returns quote
 */
function yearnOracleGetTokenPriceInUSD(token) {
    const yearnOracleContract = YearnOracle_1.YearnOracle.bind(constants_1.YEARN_ORACLE_ADDRESS);
    const getLatestPriceCall = yearnOracleContract.try_getPriceUsdcRecommended(graph_ts_1.Address.fromString(token.id));
    let price = null;
    if (!getLatestPriceCall.reverted) {
        const rawQuote = getLatestPriceCall.value;
        price = (0, utils_1.parseUnits)(rawQuote, constants_1.YEARN_ORACLE_QUOTE_DECIMALS);
    }
    return price;
}
exports.yearnOracleGetTokenPriceInUSD = yearnOracleGetTokenPriceInUSD;
