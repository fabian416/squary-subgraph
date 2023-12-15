"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chainlinkOracleGetTokenPriceInUSD = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ChainLinkOracle_1 = require("../../../../generated/templates/Pool/ChainLinkOracle");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
/**
 * Get token price in USD from chain link oracle
 * @param token token to get the quote for
 * @returns token price or null if no price is available
 */
function chainlinkOracleGetTokenPriceInUSD(token) {
    const chainLinkContract = ChainLinkOracle_1.ChainLinkOracle.bind(constants_1.CHAIN_LINK_ORACLE_ADDRESS);
    const latestRoundDataCall = chainLinkContract.try_latestRoundData(graph_ts_1.Address.fromString(token.id), constants_1.CHAIN_LINK_USD_ADDRESS);
    let price = null;
    if (!latestRoundDataCall.reverted) {
        const rawQuote = latestRoundDataCall.value.value1;
        price = (0, utils_1.parseUnits)(rawQuote, constants_1.CHAIN_LINK_ORACLE_QUOTE_DECIMALS);
    }
    return price;
}
exports.chainlinkOracleGetTokenPriceInUSD = chainlinkOracleGetTokenPriceInUSD;
