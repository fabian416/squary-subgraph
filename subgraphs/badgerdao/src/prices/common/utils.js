"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig =
  exports.getTokenSupply =
  exports.getTokenDecimals =
  exports.getTokenName =
  exports.getContract =
  exports.exponentToBigDecimal =
  exports.safeDiv =
  exports.absBigDecimal =
  exports.readValue =
  exports.isNullAddress =
    void 0;
const constants = __importStar(require("./constants"));
const MAINNET = __importStar(require("../config/mainnet"));
const _ERC20_1 = require("../../../generated/templates/Strategy/_ERC20");
function isNullAddress(tokenAddr) {
  return tokenAddr.equals(constants.NULL.TYPE_ADDRESS) ? true : false;
}
exports.isNullAddress = isNullAddress;
function readValue(callResult, defaultValue) {
  return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function absBigDecimal(value) {
  if (value.lt(constants.BIGDECIMAL_ZERO))
    return value.times(constants.BIGDECIMAL_NEG_ONE);
  return value;
}
exports.absBigDecimal = absBigDecimal;
function safeDiv(amount0, amount1) {
  if (amount1.equals(constants.BIGDECIMAL_ZERO)) {
    return constants.BIGDECIMAL_ZERO;
  } else {
    return amount0.div(amount1);
  }
}
exports.safeDiv = safeDiv;
function exponentToBigDecimal(decimals) {
  return constants.BIGINT_TEN.pow(decimals).toBigDecimal();
}
exports.exponentToBigDecimal = exponentToBigDecimal;
function getContract(contractInfo, block = null) {
  if (!contractInfo || (block && contractInfo.startBlock.gt(block.number)))
    return null;
  return contractInfo.address;
}
exports.getContract = getContract;
function getTokenName(tokenAddr) {
  const tokenContract = _ERC20_1._ERC20.bind(tokenAddr);
  const name = readValue(tokenContract.try_name(), "");
  return name;
}
exports.getTokenName = getTokenName;
function getTokenDecimals(tokenAddr) {
  const tokenContract = _ERC20_1._ERC20.bind(tokenAddr);
  const decimals = readValue(
    tokenContract.try_decimals(),
    constants.DEFAULT_DECIMALS
  );
  return decimals;
}
exports.getTokenDecimals = getTokenDecimals;
function getTokenSupply(tokenAddr) {
  const tokenContract = _ERC20_1._ERC20.bind(tokenAddr);
  const totalSupply = readValue(
    tokenContract.try_totalSupply(),
    constants.BIGINT_ONE
  );
  return totalSupply;
}
exports.getTokenSupply = getTokenSupply;
function getConfig() {
  return new MAINNET.config();
}
exports.getConfig = getConfig;
