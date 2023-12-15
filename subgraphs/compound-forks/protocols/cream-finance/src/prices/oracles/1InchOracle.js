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
exports.getTokenPriceFromOneInch = exports.getOneInchOracleContract = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const OneInchOracleContract_1 = require("../../../../../generated/templates/CToken/OneInchOracleContract");
function getOneInchOracleContract(network) {
  return OneInchOracleContract_1.OneInchOracleContract.bind(
    constants.ONE_INCH_ORACLE_CONTRACT_ADDRESS.get(network)
  );
}
exports.getOneInchOracleContract = getOneInchOracleContract;
function getTokenPriceFromOneInch(tokenAddr, network) {
  const oneInchOracleContract = getOneInchOracleContract(network);
  if (
    constants.ONE_INCH_ORACLE_CONTRACT_ADDRESS.get(network).equals(
      constants.ZERO_ADDRESS
    )
  ) {
    return new types_1.CustomPriceType();
  }
  if (!oneInchOracleContract) {
    return new types_1.CustomPriceType();
  }
  const tokenPrice = utils
    .readValue(
      oneInchOracleContract.try_getRate(
        tokenAddr,
        constants.WHITELIST_TOKENS_MAP.get(network).get("USDC"),
        true
      ),
      constants.BIGINT_ZERO
    )
    .toBigDecimal();
  const tokenDecimals = utils.getTokenDecimals(tokenAddr);
  return types_1.CustomPriceType.initialize(
    tokenPrice.times(
      constants.BIGINT_TEN.pow(tokenDecimals.toI32()).toBigDecimal()
    ),
    constants.DEFAULT_USDC_DECIMALS + constants.DEFAULT_DECIMALS.toI32()
  );
}
exports.getTokenPriceFromOneInch = getTokenPriceFromOneInch;
