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
exports.getForexUsdRate = exports.getLpTokenVirtualPrice = void 0;
const utils = __importStar(require("../common/utils"));
const common_1 = require("./common");
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const CurvePool_1 = require("../../../generated/Booster/CurvePool");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const CurveRegistry_1 = require("../../../generated/Booster/CurveRegistry");
const ChainLinkAggregator_1 = require("../../../generated/Booster/ChainLinkAggregator");
function getLpTokenVirtualPrice(lpToken) {
  const curveRegistry = CurveRegistry_1.CurveRegistry.bind(
    graph_ts_1.Address.fromString("0x90e00ace148ca3b23ac1bc8c240c2a7dd9c2d7f5")
  );
  let virtualPrice = utils.readValue(
    curveRegistry.try_get_virtual_price_from_lp_token(lpToken),
    constants.BIGINT_ZERO
  );
  if (virtualPrice != constants.BIGINT_ZERO) {
    return virtualPrice.toBigDecimal().div(constants.BIGDECIMAL_1E18);
  }
  const lpTokenContract = CurvePool_1.CurvePool.bind(lpToken);
  virtualPrice = utils.readValue(
    lpTokenContract.try_get_virtual_price(),
    constants.BIGINT_ZERO
  );
  if (virtualPrice != constants.BIGINT_ZERO) {
    return virtualPrice.toBigDecimal().div(constants.BIGDECIMAL_1E18);
  }
  return constants.BIGDECIMAL_ZERO;
}
exports.getLpTokenVirtualPrice = getLpTokenVirtualPrice;
function getForexUsdRate(lpToken) {
  const ForexToken = common_1.FOREX_ORACLES.get(lpToken.toHexString());
  if (!ForexToken) return new types_1.CustomPriceType();
  const priceOracle =
    ChainLinkAggregator_1.ChainLinkAggregator.bind(ForexToken);
  const conversionRate = utils.readValue(
    priceOracle.try_latestAnswer(),
    constants.BIGINT_ZERO
  );
  const price = getLpTokenVirtualPrice(lpToken).times(
    conversionRate.toBigDecimal()
  );
  return types_1.CustomPriceType.initialize(price, constants.INT_EIGHT);
}
exports.getForexUsdRate = getForexUsdRate;
