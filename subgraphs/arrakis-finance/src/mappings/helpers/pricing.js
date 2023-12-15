"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTokenPrice =
  exports.getTokenValueUSD =
  exports.getDualTokenUSD =
    void 0;
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const numbers_1 = require("../../common/utils/numbers");
const prices_1 = require("../../prices");
// Return combined USD token value of two tokens
function getDualTokenUSD(
  token0Address,
  token1Address,
  amount0,
  amount1,
  block
) {
  // Update token prices
  const amount0USD = getTokenValueUSD(token0Address, amount0, block);
  const amount1USD = getTokenValueUSD(token1Address, amount1, block);
  return amount0USD.plus(amount1USD);
}
exports.getDualTokenUSD = getDualTokenUSD;
function getTokenValueUSD(tokenAddress, amount, block) {
  const token = updateTokenPrice(tokenAddress, block);
  const amountUSD = token.lastPriceUSD.times(
    (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals)
  );
  return amountUSD;
}
exports.getTokenValueUSD = getTokenValueUSD;
// Update token price and return token entity
function updateTokenPrice(tokenAddress, block) {
  const token = (0, getters_1.getOrCreateToken)(tokenAddress);
  if (
    block.timestamp >
    token._lastPriceTimestamp.plus(constants_1.THIRTY_MINUTES_IN_SECONDS)
  ) {
    let priceSourceSkips =
      constants_1.TOKEN_PRICE_SOURCE_SKIPS.get(tokenAddress);
    if (priceSourceSkips === null) {
      priceSourceSkips = [];
    }
    const fetchPrice = (0, prices_1.getUsdPricePerToken)(
      tokenAddress,
      priceSourceSkips
    );
    token.lastPriceUSD = fetchPrice.usdPrice.div(fetchPrice.decimalsBaseTen);
    token.lastPriceBlockNumber = block.number;
    token._lastPriceTimestamp = block.timestamp;
    token.save();
  }
  return token;
}
exports.updateTokenPrice = updateTokenPrice;
