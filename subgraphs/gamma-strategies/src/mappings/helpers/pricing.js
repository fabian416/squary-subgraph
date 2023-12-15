"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTokenPrice = exports.getDualTokenUSD = void 0;
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const numbers_1 = require("../../common/utils/numbers");
const prices_1 = require("../../prices");
// Return combined USD token value of two tokens
function getDualTokenUSD(token0Address, token1Address, amount0, amount1, blockNumber) {
    // Update token prices
    let token0 = updateTokenPrice(token0Address, blockNumber);
    let token1 = updateTokenPrice(token1Address, blockNumber);
    let amount0Usd = token0.lastPriceUSD.times((0, numbers_1.bigIntToBigDecimal)(amount0, token0.decimals));
    let amount1Usd = token1.lastPriceUSD.times((0, numbers_1.bigIntToBigDecimal)(amount1, token1.decimals));
    return amount0Usd.plus(amount1Usd);
}
exports.getDualTokenUSD = getDualTokenUSD;
// Update token price and return token entity
function updateTokenPrice(tokenAddress, blockNumber) {
    let token = (0, getters_1.getOrCreateToken)(tokenAddress);
    if (blockNumber > token.lastPriceBlockNumber) {
        let priceSourceSkips = constants_1.TOKEN_PRICE_SOURCE_SKIPS.get(tokenAddress);
        if (priceSourceSkips === null) {
            priceSourceSkips = [];
        }
        let fetchPrice = (0, prices_1.getUsdPricePerToken)(tokenAddress, priceSourceSkips);
        token.lastPriceUSD = fetchPrice.usdPrice.div(fetchPrice.decimalsBaseTen);
        token.lastPriceBlockNumber = blockNumber;
        token.save();
    }
    return token;
}
exports.updateTokenPrice = updateTokenPrice;
