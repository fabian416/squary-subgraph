"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeUserPosition =
  exports.createUserPosition =
  exports.getUserPosition =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const account_1 = require("./account");
const pool_1 = require("./pool");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const option_1 = require("./option");
const Ssov_1 = require("../../generated/BasicWeeklyCalls/Ssov");
function getUserPosition(event, account, pool, epoch, strike, optionType) {
  const positionId = getPositionID(account, pool, epoch, strike, optionType);
  return schema_1.Position.load(positionId);
}
exports.getUserPosition = getUserPosition;
function createUserPosition(
  event,
  account,
  pool,
  epoch,
  optionAmount,
  strike,
  purchasePremiumUSD,
  optionType
) {
  const positionId = getPositionID(account, pool, epoch, strike, optionType);
  const position = new schema_1.Position(positionId);
  position.pool = pool.id;
  position.account = account.id;
  position.asset = pool._underlyingAsset;
  position.option = (0, option_1.getOption)(
    event,
    pool,
    epoch,
    strike,
    optionType
  ).id;
  position.takenHash = event.transaction.hash;
  position.takenBlockNumber = event.block.number;
  position.takenTimestamp = event.block.timestamp;
  let takenPrice = constants_1.BIGDECIMAL_ZERO;
  const ssoveContract = Ssov_1.Ssov.bind(event.address);
  const tryGetUnderlyingPrice = ssoveContract.try_getUnderlyingPrice();
  if (!tryGetUnderlyingPrice.reverted) {
    takenPrice = tryGetUnderlyingPrice.value.divDecimal(
      constants_1.PRICE_PRECISION
    );
  }
  position.takenPrice = takenPrice;
  position.premiumUSD = purchasePremiumUSD;
  if (takenPrice > constants_1.BIGDECIMAL_ZERO) {
    position.premium = (0, numbers_1.bigDecimalToBigInt)(
      purchasePremiumUSD
        .times(
          (0, numbers_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS)
        )
        .div(takenPrice)
    );
  }
  position.amount = optionAmount;
  position.amountUSD = (0, numbers_1.convertTokenToDecimal)(optionAmount).times(
    position.takenPrice
  );
  position.save();
  (0, account_1.updateAccountOpenPositionCount)(account, true);
  (0, pool_1.updatePoolOpenPositionCount)(event, pool, true);
  return position;
}
exports.createUserPosition = createUserPosition;
function closeUserPosition(event, account, pool, epoch, strike, optionType) {
  const positionId = getPositionID(account, pool, epoch, strike, optionType);
  const position = schema_1.Position.load(positionId);
  if (!position) {
    return;
  }
  position.exercisedBlockNumber = event.block.number;
  position.exercisedTimestamp = event.block.timestamp;
  position.closedBlockNumber = event.block.number;
  position.closedTimestamp = event.block.timestamp;
  position.closePremiumUSD = constants_1.BIGDECIMAL_ZERO;
  position.save();
  (0, account_1.updateAccountOpenPositionCount)(account, false);
  (0, pool_1.updatePoolOpenPositionCount)(event, pool, false);
}
exports.closeUserPosition = closeUserPosition;
function getPositionID(account, pool, epoch, strike, optionType) {
  return account.id
    .concat(pool.id)
    .concat(graph_ts_1.Bytes.fromUTF8(optionType))
    .concat(graph_ts_1.Bytes.fromUTF8(epoch.toString()))
    .concat(graph_ts_1.Bytes.fromUTF8(strike.toString()));
}
