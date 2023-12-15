"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTokenSymbol =
  exports.fetchTokenName =
  exports.fetchTokenDecimals =
    void 0;
const ERC20_1 = require("../../generated/Standard/ERC20");
function fetchTokenDecimals(tokenAddress) {
  const tokenContract = ERC20_1.ERC20.bind(tokenAddress);
  const call = tokenContract.try_decimals();
  if (call.reverted) {
    return 0;
  } else {
    return call.value;
  }
}
exports.fetchTokenDecimals = fetchTokenDecimals;
function fetchTokenName(tokenAddress) {
  const tokenContract = ERC20_1.ERC20.bind(tokenAddress);
  const call = tokenContract.try_name();
  if (call.reverted) {
    return tokenAddress.toHexString();
  } else {
    return call.value;
  }
}
exports.fetchTokenName = fetchTokenName;
function fetchTokenSymbol(tokenAddress) {
  const tokenContract = ERC20_1.ERC20.bind(tokenAddress);
  const call = tokenContract.try_symbol();
  if (call.reverted) {
    return " ";
  } else {
    return call.value;
  }
}
exports.fetchTokenSymbol = fetchTokenSymbol;
