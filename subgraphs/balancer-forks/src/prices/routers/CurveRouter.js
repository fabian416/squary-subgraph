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
exports.getPriceUsdcRecommended =
  exports.getVirtualPrice =
  exports.getUnderlyingCoinFromPool =
  exports.getBasePrice =
  exports.getPoolFromLpToken =
  exports.getCurvePriceUsdc =
    void 0;
const utils = __importStar(require("../common/utils"));
const __1 = require("..");
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const CurveRegistry_1 = require("../../../generated/Vault/CurveRegistry");
function getCurvePriceUsdc(curveLpTokenAddress) {
  const config = utils.getConfig();
  if (!config) return new types_1.CustomPriceType();
  let price = constants.BIGDECIMAL_ZERO;
  const curveRegistryAdresses = config.curveRegistry();
  for (let idx = 0; idx < curveRegistryAdresses.length; idx++) {
    const curveRegistry = curveRegistryAdresses[idx];
    const curveRegistryContract =
      CurveRegistry_1.CurveRegistry.bind(curveRegistry);
    const virtualPrice = getVirtualPrice(
      curveLpTokenAddress,
      curveRegistryContract
    );
    if (virtualPrice.equals(constants.BIGDECIMAL_ZERO)) continue;
    price = virtualPrice.div(
      constants.BIGINT_TEN.pow(
        constants.DEFAULT_DECIMALS.toI32()
      ).toBigDecimal()
    );
    const basePrice = getBasePrice(curveLpTokenAddress, curveRegistryContract);
    if (basePrice.reverted) continue;
    return types_1.CustomPriceType.initialize(
      price.times(basePrice.usdPrice),
      basePrice.decimals
    );
  }
  return new types_1.CustomPriceType();
}
exports.getCurvePriceUsdc = getCurvePriceUsdc;
function getPoolFromLpToken(lpAddress, curveRegistry) {
  const poolAddress = utils.readValue(
    curveRegistry.try_get_pool_from_lp_token(lpAddress),
    constants.NULL.TYPE_ADDRESS
  );
  return poolAddress;
}
exports.getPoolFromLpToken = getPoolFromLpToken;
function getBasePrice(curveLpTokenAddress, curveRegistry) {
  const poolAddress = getPoolFromLpToken(curveLpTokenAddress, curveRegistry);
  if (poolAddress.equals(constants.NULL.TYPE_ADDRESS)) {
    return new types_1.CustomPriceType();
  }
  const underlyingCoinAddress = getUnderlyingCoinFromPool(
    poolAddress,
    curveRegistry
  );
  const basePrice = getPriceUsdcRecommended(underlyingCoinAddress);
  return basePrice;
}
exports.getBasePrice = getBasePrice;
function getUnderlyingCoinFromPool(poolAddress, curveRegistry) {
  const coinsArray = curveRegistry.try_get_underlying_coins(poolAddress);
  let coins;
  if (coinsArray.reverted) {
    return constants.NULL.TYPE_ADDRESS;
  } else {
    coins = coinsArray.value;
  }
  //? Use first coin from pool and if that is empty (due to error) fall back to second coin
  let preferredCoinAddress = coins[0];
  if (preferredCoinAddress.equals(constants.NULL.TYPE_ADDRESS)) {
    preferredCoinAddress = coins[1];
  }
  return preferredCoinAddress;
}
exports.getUnderlyingCoinFromPool = getUnderlyingCoinFromPool;
function getVirtualPrice(curveLpTokenAddress, curveRegistry) {
  const virtualPrice = utils
    .readValue(
      curveRegistry.try_get_virtual_price_from_lp_token(curveLpTokenAddress),
      constants.BIGINT_ZERO
    )
    .toBigDecimal();
  return virtualPrice;
}
exports.getVirtualPrice = getVirtualPrice;
function getPriceUsdcRecommended(tokenAddress) {
  return (0, __1.getUsdPricePerToken)(tokenAddress);
}
exports.getPriceUsdcRecommended = getPriceUsdcRecommended;
