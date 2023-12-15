"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOption = exports.getOption = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const SsovV3OptionsToken_1 = require("../../generated/BasicWeeklyCalls/SsovV3OptionsToken");
const token_1 = require("./token");
function getOption(event, pool, epoch, strike, optionType) {
  const optionId = getOptionID(pool, epoch, strike, optionType);
  return schema_1.Option.load(optionId);
}
exports.getOption = getOption;
function createOption(event, pool, epoch, strike, strikeTokenAddress) {
  let optionType = constants_1.OptionType.CALL;
  if (pool._isPut) {
    optionType = constants_1.OptionType.PUT;
  }
  const optionId = getOptionID(pool, epoch, strike, optionType);
  const option = new schema_1.Option(optionId);
  option.type = optionType;
  option.pool = pool.id;
  option.underlyingAsset = pool._underlyingAsset;
  option.collateralAsset = pool.inputTokens[0];
  option.strikePrice = strike.divDecimal(constants_1.PRICE_PRECISION);
  option.createdTimestamp = event.block.timestamp;
  const strikeTokenContract =
    SsovV3OptionsToken_1.SsovV3OptionsToken.bind(strikeTokenAddress);
  const strikeToken = (0, token_1.getOrCreateToken)(
    event,
    strikeTokenAddress,
    false
  );
  option.name = strikeToken.name;
  option.symbol = strikeToken.symbol;
  const tryUnderlyingSymbol = strikeTokenContract.try_underlyingSymbol();
  if (!tryUnderlyingSymbol.reverted) {
    option.underlyingAsset = graph_ts_1.Bytes.fromUTF8(
      tryUnderlyingSymbol.value
    );
  }
  const tryExpiry = strikeTokenContract.try_expiry();
  if (!tryExpiry.reverted) {
    option.expirationTimestamp = tryExpiry.value;
  }
  option.save();
  return option;
}
exports.createOption = createOption;
function getOptionID(pool, epoch, strike, optionType) {
  return pool.id
    .concat(graph_ts_1.Bytes.fromUTF8(optionType))
    .concat(graph_ts_1.Bytes.fromUTF8(epoch.toString()))
    .concat(graph_ts_1.Bytes.fromUTF8(strike.toString()));
}
