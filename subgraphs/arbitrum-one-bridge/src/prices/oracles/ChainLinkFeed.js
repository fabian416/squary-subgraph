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
exports.getTokenPriceUSDC = exports.getChainLinkContract = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const ChainLinkContract_1 = require("../../../generated/ERC20Gateway/ChainLinkContract");
function getChainLinkContract(contract, block = null) {
  if (
    (block && contract.startBlock.gt(block.number)) ||
    utils.isNullAddress(contract.address)
  )
    return null;
  return ChainLinkContract_1.ChainLinkContract.bind(contract.address);
}
exports.getChainLinkContract = getChainLinkContract;
function getTokenPriceUSDC(tokenAddr, block = null) {
  const config = utils.getConfig();
  if (!config) return new types_1.CustomPriceType();
  const chainLinkContract = getChainLinkContract(config.chainLink(), block);
  if (!chainLinkContract) return new types_1.CustomPriceType();
  const result = chainLinkContract.try_latestRoundData(
    tokenAddr,
    constants.CHAIN_LINK_USD_ADDRESS
  );
  if (!result.reverted) {
    const decimals = chainLinkContract.try_decimals(
      tokenAddr,
      constants.CHAIN_LINK_USD_ADDRESS
    );
    if (decimals.reverted) {
      return new types_1.CustomPriceType();
    }
    return types_1.CustomPriceType.initialize(
      result.value.value1.toBigDecimal(),
      decimals.value,
      constants.OracleType.CHAINLINK_FEED
    );
  }
  return new types_1.CustomPriceType();
}
exports.getTokenPriceUSDC = getTokenPriceUSDC;
