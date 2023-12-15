"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTokenDecimals =
  exports.fetchTokenName =
  exports.fetchTokenSymbol =
  exports.INVALID_TOKEN_DECIMALS =
  exports.UNKNOWN_TOKEN_NAME =
  exports.UNKNOWN_TOKEN_SYMBOL =
    void 0;
const ERC20_1 = require("../../generated/StrategyManager/ERC20");
exports.UNKNOWN_TOKEN_SYMBOL = "unknown";
exports.UNKNOWN_TOKEN_NAME = "UNKNOWN";
exports.INVALID_TOKEN_DECIMALS = 0;
function fetchTokenSymbol(tokenAddress) {
  let contract = ERC20_1.ERC20.bind(tokenAddress);
  let symbolResult = contract.try_symbol();
  if (!symbolResult.reverted) {
    return symbolResult.value;
  }
  return exports.UNKNOWN_TOKEN_SYMBOL;
}
exports.fetchTokenSymbol = fetchTokenSymbol;
function fetchTokenName(tokenAddress) {
  let contract = ERC20_1.ERC20.bind(tokenAddress);
  let nameCall = contract.try_name();
  if (!nameCall.reverted) {
    return nameCall.value;
  }
  return exports.UNKNOWN_TOKEN_NAME;
}
exports.fetchTokenName = fetchTokenName;
function fetchTokenDecimals(tokenAddress) {
  let contract = ERC20_1.ERC20.bind(tokenAddress);
  let decimalCall = contract.try_decimals();
  if (!decimalCall.reverted) {
    return decimalCall.value;
  }
  return exports.INVALID_TOKEN_DECIMALS;
}
exports.fetchTokenDecimals = fetchTokenDecimals;
