"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenPrice = exports.amountInUSD = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const SimplePriceOracle_1 = require("../../generated/ibALPACA/SimplePriceOracle");
const token_1 = require("./token");
const index_1 = require("../prices/index");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const constants_2 = require("../prices/common/constants");
function amountInUSD(amount, token, blockNumber) {
  if (amount == constants_1.BIGINT_ZERO) {
    return constants_1.BIGDECIMAL_ZERO;
  }
  if (token.underlyingAsset) {
    return amountInUSD(
      amount,
      (0, token_1.getTokenById)(token.underlyingAsset),
      blockNumber
    );
  }
  return (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals).times(
    getTokenPrice(token, blockNumber)
  );
}
exports.amountInUSD = amountInUSD;
function getTokenPrice(token, blockNumber) {
  //In order to improve the performance, only call smart contract to get latest price once per hour.
  if (
    token.lastPriceBlockNumber !== null &&
    token.lastPriceBlockNumber != constants_1.BIGINT_ZERO &&
    token.lastPriceBlockNumber
      .plus(constants_1.BLOCKS_PER_HOUR_BSC)
      .gt(blockNumber)
  ) {
    return token.lastPriceUSD;
  }
  //As alpaca finance's oracle only provide limited token price support, only get some tokens' price from them when price lib does not support it yet.
  let priceUSD = constants_1.BIGDECIMAL_ZERO;
  if (constants_1.PRICE_LIB_START_BLOCK_BSC.gt(blockNumber)) {
    if (token.id == constants_1.BUSD_ADDRESS_BSC) {
      priceUSD = constants_1.BIGDECIMAL_ONE;
    } else if (token.id == constants_1.WBNB_ADDRESS_BSC) {
      const contract = SimplePriceOracle_1.SimplePriceOracle.bind(
        graph_ts_1.Address.fromString(constants_1.SIMPLE_PRICE_ORACLE_BSC)
      );
      const tryGetPrice = contract.try_getPrice(
        graph_ts_1.Address.fromString(token.id),
        graph_ts_1.Address.fromString(constants_1.BUSD_ADDRESS_BSC)
      );
      if (!tryGetPrice.reverted) {
        priceUSD = (0, numbers_1.bigIntToBigDecimal)(
          tryGetPrice.value.getPrice(),
          constants_2.DEFAULT_DECIMALS.toI32()
        );
      }
    }
  } else {
    // Use external oracle to get price.
    const customPrice = (0, index_1.getUsdPricePerToken)(
      graph_ts_1.Address.fromString(token.id)
    );
    priceUSD = customPrice.usdPrice;
  }
  token.lastPriceUSD = priceUSD;
  token.lastPriceBlockNumber = blockNumber;
  token.save();
  return priceUSD;
}
exports.getTokenPrice = getTokenPrice;
