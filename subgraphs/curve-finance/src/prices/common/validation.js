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
exports.protocolLevelPriceValidation = void 0;
const utils = __importStar(require("./utils"));
const constants = __importStar(require("./constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../../common/initializers");
function protocolLevelPriceValidation(token, latestPrice) {
  const protocol = (0, initializers_1.getOrCreateDexAmmProtocol)();
  if (
    constants.BLACKLISTED_TOKENS.includes(
      graph_ts_1.Address.fromString(token.id)
    )
  )
    return constants.BIGDECIMAL_ZERO;
  const tokenTVLDelta = utils.absBigDecimal(
    latestPrice
      .times(
        utils
          .getTokenSupply(graph_ts_1.Address.fromString(token.id))
          .toBigDecimal()
          .div(utils.exponentToBigDecimal(token.decimals))
      )
      .minus(token._totalValueLockedUSD)
  );
  const protocolTVLPercentageDelta = utils.absBigDecimal(
    utils.safeDiv(tokenTVLDelta, protocol.totalValueLockedUSD)
  );
  if (protocolTVLPercentageDelta.gt(constants.BIGDECIMAL_FIVE_PERCENT)) {
    if (token._largeTVLImpactBuffer < constants.PRICE_CHANGE_BUFFER_LIMIT) {
      token._largeTVLImpactBuffer += 1;
      token.save();
      return token.lastPriceUSD;
    }
  }
  if (
    !token.lastPriceUSD ||
    token.lastPriceUSD.equals(constants.BIGDECIMAL_ZERO)
  ) {
    token.save();
    return latestPrice;
  }
  // If priceSoFar 10x greater or less than token.lastPriceUSD, use token.lastPriceUSD
  // Increment buffer so that it allows large price jumps if seen repeatedly
  if (
    latestPrice.gt(token.lastPriceUSD.times(constants.BIGDECIMAL_TWO)) ||
    latestPrice.lt(token.lastPriceUSD.div(constants.BIGDECIMAL_TWO))
  ) {
    if (token._largePriceChangeBuffer < constants.PRICE_CHANGE_BUFFER_LIMIT) {
      token._largePriceChangeBuffer += 1;
      token.save();
      return token.lastPriceUSD;
    }
  }
  token._largePriceChangeBuffer = 0;
  token._largeTVLImpactBuffer = 0;
  token.save();
  return latestPrice;
}
exports.protocolLevelPriceValidation = protocolLevelPriceValidation;
