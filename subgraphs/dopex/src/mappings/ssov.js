"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBootstrap =
  exports.handleUpdatePositionEvent =
  exports.handleSettle =
  exports.handlePurchase =
  exports.handleWithdraw =
  exports.handleDeposit =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Ssov_1 = require("../../generated/BasicWeeklyCalls/Ssov");
const stakingStrategy_1 = require("./stakingStrategy");
const pool_1 = require("../entities/pool");
const event_1 = require("../entities/event");
const account_1 = require("../entities/account");
const token_1 = require("../entities/token");
const position_1 = require("../entities/position");
const snapshots_1 = require("../entities/snapshots");
const numbers_1 = require("../utils/numbers");
const constants_1 = require("../utils/constants");
const option_1 = require("../entities/option");
function handleDeposit(event) {
  handleUpdateLiquidityEvent(
    event,
    event.params.sender,
    event.params.tokenId,
    event_1.EventType.Deposit,
    constants_1.BIGINT_ZERO
  );
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
  handleUpdateLiquidityEvent(
    event,
    event.params.sender,
    event.params.tokenId,
    event_1.EventType.Withdraw,
    event.params.collateralTokenWithdrawn
  );
}
exports.handleWithdraw = handleWithdraw;
function handleUpdateLiquidityEvent(
  event,
  sender,
  tokenId,
  eventType,
  collateralTokenWithdrawn
) {
  (0, snapshots_1.takeSnapshots)(event, event.address);
  const account = (0, account_1.getOrCreateAccount)(event, sender);
  const pool = (0, pool_1.getOrCreateLiquidityPool)(event, event.address);
  (0, account_1.incrementAccountEventCount)(
    event,
    account,
    eventType,
    pool._isPut
  );
  (0, pool_1.incrementPoolEventCount)(event, pool, eventType);
  const inputTokenAddress = graph_ts_1.Address.fromBytes(pool.inputTokens[0]);
  const ssoveContract = Ssov_1.Ssov.bind(event.address);
  let amountChange = constants_1.BIGINT_ZERO;
  if (eventType == event_1.EventType.Deposit) {
    const tryCurrentEpoch = ssoveContract.try_currentEpoch();
    const tryAddresses = ssoveContract.try_addresses();
    if (!tryCurrentEpoch.reverted && !tryAddresses.reverted) {
      if (tryCurrentEpoch.value != pool._currentEpoch) {
        (0, pool_1.updatePoolCurrentEpoch)(event, pool, tryCurrentEpoch.value);
        (0, stakingStrategy_1.updateRewards)(
          event,
          pool,
          tryCurrentEpoch.value,
          tryAddresses.value.getStakingStrategy()
        );
      }
    }
    const tryWritePosition = ssoveContract.try_writePosition(tokenId);
    if (!tryWritePosition.reverted) {
      amountChange = tryWritePosition.value.getCollateralAmount();
    }
    (0, event_1.createDeposit)(
      event,
      pool,
      sender,
      inputTokenAddress,
      amountChange
    );
  } else if (eventType == event_1.EventType.Withdraw) {
    amountChange = collateralTokenWithdrawn;
    (0, event_1.createWithdraw)(
      event,
      pool,
      sender,
      inputTokenAddress,
      amountChange
    );
  }
  const collateralToken = (0, token_1.getOrCreateToken)(
    event,
    inputTokenAddress
  );
  const tryGetCollateralPrice = ssoveContract.try_getCollateralPrice();
  if (!tryGetCollateralPrice.reverted) {
    const collateralPrice = tryGetCollateralPrice.value.divDecimal(
      constants_1.PRICE_PRECISION
    );
    (0, token_1.updateTokenPrice)(event, collateralToken, collateralPrice);
  }
  const amountChangeUSD = (0, numbers_1.convertTokenToDecimal)(
    amountChange,
    collateralToken.decimals
  ).times(collateralToken.lastPriceUSD);
  (0, pool_1.increasePoolVolume)(
    event,
    pool,
    constants_1.BIGINT_ZERO,
    amountChangeUSD,
    amountChange,
    amountChangeUSD,
    eventType
  );
  (0, pool_1.updatePoolTvl)(event, pool, amountChange, eventType);
  (0, snapshots_1.updateTempUsageMetrics)(event, sender, eventType);
}
function handlePurchase(event) {
  handleUpdatePositionEvent(
    event,
    event.params.sender,
    event.params.epoch,
    event.params.amount,
    event.params.strike,
    event.params.premium,
    constants_1.BIGINT_ZERO,
    event.params.fee,
    event_1.EventType.Purchase
  );
}
exports.handlePurchase = handlePurchase;
function handleSettle(event) {
  handleUpdatePositionEvent(
    event,
    event.params.sender,
    event.params.epoch,
    event.params.amount,
    event.params.strike,
    constants_1.BIGINT_ZERO,
    event.params.pnl,
    event.params.fee,
    event_1.EventType.Settle
  );
}
exports.handleSettle = handleSettle;
function handleUpdatePositionEvent(
  event,
  accountAddress,
  epoch,
  optionAmount,
  optionStikePrice,
  purchasePremiumAmount,
  settlePnLAmount,
  feeAmount,
  eventType
) {
  (0, snapshots_1.takeSnapshots)(event, event.address);
  const account = (0, account_1.getOrCreateAccount)(event, accountAddress);
  const pool = (0, pool_1.getOrCreateLiquidityPool)(event, event.address);
  (0, account_1.incrementAccountEventCount)(
    event,
    account,
    eventType,
    pool._isPut
  );
  (0, pool_1.incrementPoolEventCount)(event, pool, eventType);
  const sizeUSDDelta = (0, numbers_1.convertTokenToDecimal)(optionAmount).times(
    optionStikePrice.divDecimal(constants_1.PRICE_PRECISION)
  );
  const collateralToken = (0, token_1.getOrCreateToken)(
    event,
    graph_ts_1.Address.fromBytes(pool.inputTokens[0])
  );
  const ssoveContract = Ssov_1.Ssov.bind(event.address);
  const tryGetCollateralPrice = ssoveContract.try_getCollateralPrice();
  if (!tryGetCollateralPrice.reverted) {
    const collateralPrice = tryGetCollateralPrice.value.divDecimal(
      constants_1.PRICE_PRECISION
    );
    (0, token_1.updateTokenPrice)(event, collateralToken, collateralPrice);
  }
  const feeUSD = (0, numbers_1.convertTokenToDecimal)(
    feeAmount,
    collateralToken.decimals
  ).times(collateralToken.lastPriceUSD);
  (0, pool_1.increasePoolProtocolSideRevenue)(event, pool, feeUSD);
  (0, snapshots_1.updateTempUsageMetrics)(event, accountAddress, eventType);
  let optionType = constants_1.OptionType.CALL;
  if (pool._isPut) {
    optionType = constants_1.OptionType.PUT;
  }
  if (eventType == event_1.EventType.Purchase) {
    const purchasePremiumUSD = (0, numbers_1.convertTokenToDecimal)(
      purchasePremiumAmount,
      collateralToken.decimals
    ).times(collateralToken.lastPriceUSD);
    (0, position_1.createUserPosition)(
      event,
      account,
      pool,
      epoch,
      optionAmount,
      optionStikePrice,
      purchasePremiumUSD,
      optionType
    );
    (0, pool_1.increasePoolPremium)(event, pool, purchasePremiumUSD, eventType);
    (0, pool_1.increasePoolVolume)(
      event,
      pool,
      optionAmount,
      sizeUSDDelta,
      purchasePremiumAmount,
      purchasePremiumUSD,
      eventType
    );
    (0, pool_1.updatePoolTvl)(event, pool, purchasePremiumAmount, eventType);
    (0, pool_1.updatePoolOpenInterestUSD)(event, pool, sizeUSDDelta, true);
  } else if (eventType == event_1.EventType.Settle) {
    const settlePnLUSD = (0, numbers_1.convertTokenToDecimal)(
      settlePnLAmount,
      collateralToken.decimals
    ).times(collateralToken.lastPriceUSD);
    (0, position_1.closeUserPosition)(
      event,
      account,
      pool,
      epoch,
      optionStikePrice,
      optionType
    );
    (0, pool_1.increasePoolVolume)(
      event,
      pool,
      optionAmount,
      sizeUSDDelta,
      settlePnLAmount,
      settlePnLUSD,
      eventType
    );
    (0, pool_1.updatePoolTvl)(event, pool, settlePnLAmount, eventType);
    (0, pool_1.updatePoolOpenInterestUSD)(event, pool, sizeUSDDelta, false);
  }
}
exports.handleUpdatePositionEvent = handleUpdatePositionEvent;
function handleBootstrap(event) {
  (0, snapshots_1.takeSnapshots)(event, event.address);
  const pool = (0, pool_1.getOrCreateLiquidityPool)(event, event.address);
  for (let i = 0; i < event.params.strikes.length; i++) {
    const ssoveContract = Ssov_1.Ssov.bind(event.address);
    const tryGetEpochStrikeData = ssoveContract.try_getEpochStrikeData(
      event.params.epoch,
      event.params.strikes[i]
    );
    if (!tryGetEpochStrikeData.reverted) {
      const strikeTokenAddress = tryGetEpochStrikeData.value.strikeToken;
      (0, option_1.createOption)(
        event,
        pool,
        event.params.epoch,
        event.params.strikes[i],
        strikeTokenAddress
      );
    }
  }
}
exports.handleBootstrap = handleBootstrap;
