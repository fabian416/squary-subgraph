"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateRewardToken =
  exports.updateTokenPrice =
  exports.getOrCreateToken =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC20_1 = require("../../generated/BasicWeeklyCalls/ERC20");
const schema_1 = require("../../generated/schema");
const prices_1 = require("../prices");
const constants_1 = require("../utils/constants");
function getOrCreateToken(event, tokenAddress, getPrice = true) {
  let token = schema_1.Token.load(tokenAddress);
  if (!token) {
    token = new schema_1.Token(tokenAddress);
    token.name = fetchTokenName(tokenAddress);
    token.symbol = fetchTokenSymbol(tokenAddress);
    token.decimals = fetchTokenDecimals(tokenAddress);
    token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
    token.lastPriceBlockNumber = event.block.number;
    token.save();
  }
  if (!getPrice) {
    return token;
  }
  if (
    token.lastPriceUSD &&
    token.lastPriceBlockNumber &&
    event.block.number
      .minus(token.lastPriceBlockNumber)
      .lt(constants_1.PRICE_CACHING_BLOCKS)
  ) {
    return token;
  }
  // Optional lastPriceUSD and lastPriceBlockNumber, but used in financialMetrics
  const price = (0, prices_1.getUsdPricePerToken)(tokenAddress, event.block);
  if (!price.reverted) {
    token.lastPriceUSD = price.usdPrice;
  }
  token.lastPriceBlockNumber = event.block.number;
  token.save();
  return token;
}
exports.getOrCreateToken = getOrCreateToken;
function updateTokenPrice(event, token, tokenPriceUSD) {
  token.lastPriceUSD = tokenPriceUSD;
  token.lastPriceBlockNumber = event.block.number;
  token.save();
}
exports.updateTokenPrice = updateTokenPrice;
function getOrCreateRewardToken(event, address) {
  const id = graph_ts_1.Bytes.fromI32(constants_1.INT_ZERO).concat(address);
  let rewardToken = schema_1.RewardToken.load(id);
  if (!rewardToken) {
    const token = getOrCreateToken(event, address);
    rewardToken = new schema_1.RewardToken(id);
    rewardToken.token = token.id;
    rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
    rewardToken.save();
  }
  return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function fetchTokenName(tokenAddress) {
  const tokenContract = ERC20_1.ERC20.bind(tokenAddress);
  const call = tokenContract.try_name();
  if (call.reverted) {
    return tokenAddress.toHexString();
  } else {
    return call.value;
  }
}
function fetchTokenSymbol(tokenAddress) {
  const tokenContract = ERC20_1.ERC20.bind(tokenAddress);
  const call = tokenContract.try_symbol();
  if (call.reverted) {
    return " ";
  } else {
    return call.value;
  }
}
function fetchTokenDecimals(tokenAddress) {
  const tokenContract = ERC20_1.ERC20.bind(tokenAddress);
  const call = tokenContract.try_decimals();
  if (call.reverted) {
    return 0;
  } else {
    return call.value;
  }
}
