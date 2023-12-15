"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePoolSnapshotHourID =
  exports.updatePoolSnapshotDayID =
  exports.updatePoolCurrentEpoch =
  exports.increasePoolSupplySideRevenue =
  exports.increasePoolProtocolSideRevenue =
  exports.updatePoolRewardToken =
  exports.increasePoolInputTokenBalance =
  exports.incrementPoolEventCount =
  exports.updatePoolOpenPositionCount =
  exports.updatePoolOpenInterestUSD =
  exports.updatePoolTvl =
  exports.updatePoolOutputToken =
  exports.increasePoolPremium =
  exports.increasePoolVolume =
  exports.getOrCreateLiquidityPool =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const event_1 = require("./event");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const strings_1 = require("../utils/strings");
const Ssov_1 = require("../../generated/BasicWeeklyCalls/Ssov");
function getOrCreateLiquidityPool(event, poolAddress) {
  let pool = schema_1.LiquidityPool.load(poolAddress);
  if (!pool) {
    pool = new schema_1.LiquidityPool(poolAddress);
    // Metadata
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    pool.protocol = protocol.id;
    const ssovContract = Ssov_1.Ssov.bind(event.address);
    const tryName = ssovContract.try_name();
    if (!tryName.reverted) {
      pool.name = tryName.value;
    }
    const trySymbol = ssovContract.try_symbol();
    if (!trySymbol.reverted) {
      pool.symbol = trySymbol.value;
    }
    const tryCollateralToken = ssovContract.try_collateralToken();
    if (!tryCollateralToken.reverted) {
      const collateralToken = (0, token_1.getOrCreateToken)(
        event,
        tryCollateralToken.value
      );
      pool.inputTokens = [collateralToken.id];
    }
    const tryUnderlyingSymbol = ssovContract.try_underlyingSymbol();
    if (!tryUnderlyingSymbol.reverted) {
      const UnderlyingAssetAddressString = constants_1.addressLookupTable.get(
        tryUnderlyingSymbol.value
      );
      if (UnderlyingAssetAddressString) {
        pool._underlyingAsset = (0, token_1.getOrCreateToken)(
          event,
          graph_ts_1.Address.fromString(UnderlyingAssetAddressString)
        ).id;
      }
    }
    pool.oracle = constants_1.CHAIN_LINK;
    const tryIsPut = ssovContract.try_isPut();
    if (!tryIsPut.reverted) {
      pool._isPut = tryIsPut.value;
    }
    pool.inputTokenBalances = [constants_1.BIGINT_ZERO];
    pool.inputTokenWeights = [constants_1.BIGDECIMAL_HUNDRED];
    pool.createdTimestamp = event.block.timestamp;
    pool.createdBlockNumber = event.block.number;
    // Tokens
    pool.outputToken = null;
    pool.rewardTokens = [];
    pool.fees = createPoolFees(poolAddress);
    pool.createdTimestamp = event.block.timestamp;
    pool.createdBlockNumber = event.block.number;
    // Quantitative Revenue Data
    pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeCollateralVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeExercisedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeClosedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    pool.openInterestUSD = constants_1.BIGDECIMAL_ZERO;
    pool.putsMintedCount = constants_1.INT_ZERO;
    pool.callsMintedCount = constants_1.INT_ZERO;
    pool.contractsMintedCount = constants_1.INT_ZERO;
    pool.contractsTakenCount = constants_1.INT_ZERO;
    pool.contractsExpiredCount = constants_1.INT_ZERO;
    pool.contractsExercisedCount = constants_1.INT_ZERO;
    pool.contractsClosedCount = constants_1.INT_ZERO;
    pool.openPositionCount = constants_1.INT_ZERO;
    pool.closedPositionCount = constants_1.INT_ZERO;
    // Quantitative Token Data
    pool.outputTokenSupply = constants_1.BIGINT_ZERO;
    pool.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    pool.stakedOutputTokenAmount = constants_1.BIGINT_ZERO;
    pool.rewardTokenEmissionsAmount = [];
    pool.rewardTokenEmissionsUSD = [];
    pool.cumulativeDepositedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeWithdrawVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeVolumeByTokenAmount = [constants_1.BIGINT_ZERO];
    pool.cumulativeVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO];
    pool.cumulativeDepositedVolumeByTokenAmount = [constants_1.BIGINT_ZERO];
    pool.cumulativeDepositedVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO];
    pool.cumulativeWithdrawVolumeByTokenAmount = [constants_1.BIGINT_ZERO];
    pool.cumulativeWithdrawVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO];
    pool._currentEpoch = constants_1.BIGINT_ZERO;
    pool._lastSnapshotDayID = constants_1.INT_ZERO;
    pool._lastSnapshotHourID = constants_1.INT_ZERO;
    pool._lastUpdateTimestamp = constants_1.BIGINT_ZERO;
    // update number of pools
    protocol.totalPoolCount += constants_1.INT_ONE;
    protocol.save();
    pool.save();
  }
  return pool;
}
exports.getOrCreateLiquidityPool = getOrCreateLiquidityPool;
function increasePoolVolume(
  event,
  pool,
  sizeAmountDelta,
  sizeUSDDelta,
  collateralAmountDelta,
  collateralUSDDelta,
  eventType
) {
  // sizeUSD and collateralUSD are unique concepts for derivative options trading.
  // For example, a user want to sell a call to be able to buy 1 BTC at the current 25K
  // price one month later. In this scenario, the sizeUSD is 1BTC * BTCPrice = 25K. But
  // in order to do so, he just needs to deposit right now 1 ETH as collateral, whose
  // value is 1 ETH * ETHPrice = 1.5K (Assuming ETH is 1.5K now)
  // So for derivative, there are normal two kind of values. One is the intended trading
  // size, which is called sizeUSD in the codes, while the other is the collateral size,
  // which is called collateralUSD in the codes.
  switch (eventType) {
    case event_1.EventType.Deposit:
      pool.cumulativeDepositedVolumeUSD =
        pool.cumulativeDepositedVolumeUSD.plus(collateralUSDDelta);
      const cumulativeDepositedVolumeByTokenAmount =
        pool.cumulativeDepositedVolumeByTokenAmount;
      const cumulativeDepositedVolumeByTokenUSD =
        pool.cumulativeDepositedVolumeByTokenUSD;
      cumulativeDepositedVolumeByTokenAmount[0] =
        cumulativeDepositedVolumeByTokenAmount[0].plus(collateralAmountDelta);
      cumulativeDepositedVolumeByTokenUSD[0] =
        cumulativeDepositedVolumeByTokenUSD[0].plus(collateralUSDDelta);
      pool.cumulativeDepositedVolumeByTokenAmount =
        cumulativeDepositedVolumeByTokenAmount;
      pool.cumulativeDepositedVolumeByTokenUSD =
        cumulativeDepositedVolumeByTokenUSD;
      break;
    case event_1.EventType.Withdraw:
      pool.cumulativeWithdrawVolumeUSD =
        pool.cumulativeWithdrawVolumeUSD.plus(collateralUSDDelta);
      const cumulativeWithdrawVolumeByTokenAmount =
        pool.cumulativeWithdrawVolumeByTokenAmount;
      const cumulativeWithdrawVolumeByTokenUSD =
        pool.cumulativeWithdrawVolumeByTokenUSD;
      cumulativeWithdrawVolumeByTokenAmount[0] =
        cumulativeWithdrawVolumeByTokenAmount[0].plus(collateralAmountDelta);
      cumulativeWithdrawVolumeByTokenUSD[0] =
        cumulativeWithdrawVolumeByTokenUSD[0].plus(collateralUSDDelta);
      pool.cumulativeWithdrawVolumeByTokenAmount =
        cumulativeWithdrawVolumeByTokenAmount;
      pool.cumulativeWithdrawVolumeByTokenUSD =
        cumulativeWithdrawVolumeByTokenUSD;
      break;
    case event_1.EventType.Settle:
      pool.cumulativeExercisedVolumeUSD =
        pool.cumulativeExercisedVolumeUSD.plus(sizeUSDDelta);
      pool.cumulativeClosedVolumeUSD =
        pool.cumulativeClosedVolumeUSD.plus(sizeUSDDelta);
    default:
      break;
  }
  pool.cumulativeVolumeUSD = pool.cumulativeVolumeUSD.plus(sizeUSDDelta);
  pool.cumulativeCollateralVolumeUSD =
    pool.cumulativeCollateralVolumeUSD.plus(collateralUSDDelta);
  const cumulativeVolumeByTokenAmount = pool.cumulativeVolumeByTokenAmount;
  const cumulativeVolumeByTokenUSD = pool.cumulativeVolumeByTokenUSD;
  cumulativeVolumeByTokenAmount[0] =
    cumulativeVolumeByTokenAmount[0].plus(sizeAmountDelta);
  cumulativeVolumeByTokenUSD[0] =
    cumulativeVolumeByTokenUSD[0].plus(sizeUSDDelta);
  pool.cumulativeVolumeByTokenAmount = cumulativeVolumeByTokenAmount;
  pool.cumulativeVolumeByTokenUSD = cumulativeVolumeByTokenUSD;
  pool._lastUpdateTimestamp = event.block.timestamp;
  pool.save();
  (0, protocol_1.increaseProtocolVolume)(
    event,
    sizeUSDDelta,
    collateralUSDDelta,
    eventType
  );
}
exports.increasePoolVolume = increasePoolVolume;
function increasePoolPremium(event, pool, amountUSD, eventType) {
  switch (eventType) {
    case event_1.EventType.Deposit:
      pool.cumulativeDepositPremiumUSD =
        pool.cumulativeDepositPremiumUSD.plus(amountUSD);
      pool.cumulativeTotalLiquidityPremiumUSD =
        pool.cumulativeTotalLiquidityPremiumUSD.plus(amountUSD);
      break;
    case event_1.EventType.Withdraw:
      pool.cumulativeWithdrawPremiumUSD =
        pool.cumulativeWithdrawPremiumUSD.plus(amountUSD);
      pool.cumulativeTotalLiquidityPremiumUSD =
        pool.cumulativeTotalLiquidityPremiumUSD.plus(amountUSD);
      break;
    case event_1.EventType.Purchase:
      pool.cumulativeEntryPremiumUSD =
        pool.cumulativeEntryPremiumUSD.plus(amountUSD);
      pool.cumulativeTotalPremiumUSD =
        pool.cumulativeTotalPremiumUSD.plus(amountUSD);
      break;
    case event_1.EventType.Settle:
      pool.cumulativeExitPremiumUSD =
        pool.cumulativeExitPremiumUSD.plus(amountUSD);
      pool.cumulativeTotalPremiumUSD =
        pool.cumulativeTotalPremiumUSD.plus(amountUSD);
      break;
    default:
      break;
  }
  pool._lastUpdateTimestamp = event.block.timestamp;
  pool.save();
  (0, protocol_1.increaseProtocolPremium)(event, amountUSD, eventType);
}
exports.increasePoolPremium = increasePoolPremium;
function updatePoolOutputToken(event, pool, outputTokenAddress) {
  pool.outputToken = (0, token_1.getOrCreateToken)(
    event,
    outputTokenAddress
  ).id;
  pool._lastUpdateTimestamp = event.block.timestamp;
  pool.save();
}
exports.updatePoolOutputToken = updatePoolOutputToken;
function updatePoolTvl(event, pool, amountChange, eventType) {
  const collateralToken = (0, token_1.getOrCreateToken)(
    event,
    graph_ts_1.Address.fromBytes(pool.inputTokens[0])
  );
  const inputTokenBalances = pool.inputTokenBalances;
  switch (eventType) {
    case event_1.EventType.Deposit:
    case event_1.EventType.Purchase:
      inputTokenBalances[0] = inputTokenBalances[0].plus(amountChange);
      break;
    case event_1.EventType.Withdraw:
    case event_1.EventType.Settle:
      inputTokenBalances[0] = inputTokenBalances[0].minus(amountChange);
      break;
    default:
      break;
  }
  pool.inputTokenBalances = inputTokenBalances;
  const prevPoolTVL = pool.totalValueLockedUSD;
  pool.totalValueLockedUSD = (0, numbers_1.convertTokenToDecimal)(
    pool.inputTokenBalances[0],
    collateralToken.decimals
  ).times(collateralToken.lastPriceUSD);
  const tvlChangeUSD = pool.totalValueLockedUSD.minus(prevPoolTVL);
  pool._lastUpdateTimestamp = event.block.timestamp;
  pool.save();
  // Protocol
  (0, protocol_1.updateProtocolTVL)(event, tvlChangeUSD);
}
exports.updatePoolTvl = updatePoolTvl;
function updatePoolOpenInterestUSD(event, pool, amountChangeUSD, isIncrease) {
  if (isIncrease) {
    pool.openInterestUSD = pool.openInterestUSD.plus(amountChangeUSD);
  } else {
    pool.openInterestUSD = pool.openInterestUSD.minus(amountChangeUSD);
  }
  pool._lastUpdateTimestamp = event.block.timestamp;
  pool.save();
  // Protocol
  (0, protocol_1.updateProtocolOpenInterestUSD)(
    event,
    amountChangeUSD,
    isIncrease
  );
}
exports.updatePoolOpenInterestUSD = updatePoolOpenInterestUSD;
function updatePoolOpenPositionCount(event, pool, isIncrease) {
  if (isIncrease) {
    pool.openPositionCount += constants_1.INT_ONE;
  } else {
    pool.openPositionCount -= constants_1.INT_ONE;
    pool.closedPositionCount += constants_1.INT_ONE;
  }
  pool._lastUpdateTimestamp = event.block.timestamp;
  pool.save();
  (0, protocol_1.updateProtocolOpenPositionCount)(event, isIncrease);
}
exports.updatePoolOpenPositionCount = updatePoolOpenPositionCount;
function incrementPoolEventCount(event, pool, eventType) {
  const isPut = pool._isPut;
  switch (eventType) {
    case event_1.EventType.Deposit:
      if (isPut) {
        pool.putsMintedCount += constants_1.INT_ONE;
      } else {
        pool.callsMintedCount += constants_1.INT_ONE;
      }
      pool.contractsMintedCount += constants_1.INT_ONE;
      break;
    case event_1.EventType.Withdraw:
      pool.contractsExpiredCount += constants_1.INT_ONE;
      pool.contractsClosedCount += constants_1.INT_ONE;
      break;
    case event_1.EventType.Purchase:
      pool.contractsTakenCount += constants_1.INT_ONE;
      break;
    case event_1.EventType.Settle:
      pool.contractsExercisedCount += constants_1.INT_ONE;
      break;
    default:
      break;
  }
  pool._lastUpdateTimestamp = event.block.timestamp;
  pool.save();
  (0, protocol_1.incrementProtocolEventCount)(event, eventType, isPut);
}
exports.incrementPoolEventCount = incrementPoolEventCount;
function increasePoolInputTokenBalance(
  event,
  pool,
  inputToken,
  inputTokenAmount,
  isIncrease
) {
  const inputTokens = pool.inputTokens;
  const inputTokenBalances = pool.inputTokenBalances;
  const inputTokenIndex = inputTokens.indexOf(inputToken.id);
  if (inputTokenIndex >= 0) {
    if (isIncrease) {
      inputTokenBalances[inputTokenIndex] =
        inputTokenBalances[inputTokenIndex].plus(inputTokenAmount);
    } else {
      inputTokenBalances[inputTokenIndex] =
        inputTokenBalances[inputTokenIndex].minus(inputTokenAmount);
    }
  }
  pool.inputTokens = inputTokens;
  pool.inputTokenBalances = inputTokenBalances;
  pool._lastUpdateTimestamp = event.block.timestamp;
  pool.save();
}
exports.increasePoolInputTokenBalance = increasePoolInputTokenBalance;
function updatePoolRewardToken(
  event,
  pool,
  rewardToken,
  newTokensPerDay,
  newTokensPerDayUSD
) {
  const rewardTokens = pool.rewardTokens;
  const rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
  const rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
  const rewardTokenIndex = rewardTokens.indexOf(rewardToken.id);
  if (rewardTokenIndex >= 0) {
    rewardTokenEmissionsAmount[rewardTokenIndex] = newTokensPerDay;
    rewardTokenEmissionsUSD[rewardTokenIndex] = newTokensPerDayUSD;
  } else {
    rewardTokens.push(rewardToken.id);
    rewardTokenEmissionsAmount.push(newTokensPerDay);
    rewardTokenEmissionsUSD.push(newTokensPerDayUSD);
    (0, numbers_1.multiArraySort)(
      rewardTokens,
      rewardTokenEmissionsAmount,
      rewardTokenEmissionsUSD
    );
  }
  pool.rewardTokens = rewardTokens;
  pool.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
  pool.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
  pool._lastUpdateTimestamp = event.block.timestamp;
  pool.save();
}
exports.updatePoolRewardToken = updatePoolRewardToken;
function increasePoolProtocolSideRevenue(event, pool, amountChangeUSD) {
  pool.cumulativeProtocolSideRevenueUSD =
    pool.cumulativeProtocolSideRevenueUSD.plus(amountChangeUSD);
  // Pool total revenue
  pool.cumulativeTotalRevenueUSD =
    pool.cumulativeTotalRevenueUSD.plus(amountChangeUSD);
  pool._lastUpdateTimestamp = event.block.timestamp;
  pool.save();
  // Protocol
  (0, protocol_1.increaseProtocolSideRevenue)(event, amountChangeUSD);
}
exports.increasePoolProtocolSideRevenue = increasePoolProtocolSideRevenue;
function increasePoolSupplySideRevenue(event, pool, amountChangeUSD) {
  pool.cumulativeSupplySideRevenueUSD =
    pool.cumulativeSupplySideRevenueUSD.plus(amountChangeUSD);
  // Pool total revenue
  pool.cumulativeTotalRevenueUSD =
    pool.cumulativeTotalRevenueUSD.plus(amountChangeUSD);
  pool._lastUpdateTimestamp = event.block.timestamp;
  pool.save();
  // Protocol
  (0, protocol_1.increaseProtocolSupplySideRevenue)(event, amountChangeUSD);
}
exports.increasePoolSupplySideRevenue = increasePoolSupplySideRevenue;
function updatePoolCurrentEpoch(event, pool, epoch) {
  pool._currentEpoch = epoch;
  pool._lastUpdateTimestamp = event.block.timestamp;
  pool.save();
}
exports.updatePoolCurrentEpoch = updatePoolCurrentEpoch;
function updatePoolSnapshotDayID(pool, snapshotDayID) {
  pool._lastSnapshotDayID = snapshotDayID;
  pool.save();
}
exports.updatePoolSnapshotDayID = updatePoolSnapshotDayID;
function updatePoolSnapshotHourID(pool, snapshotHourID) {
  pool._lastSnapshotHourID = snapshotHourID;
  pool.save();
}
exports.updatePoolSnapshotHourID = updatePoolSnapshotHourID;
function createPoolFees(poolAddress) {
  // get or create fee entities, set fee types
  const tradingFeeId = graph_ts_1.Bytes.fromUTF8(
    (0, strings_1.enumToPrefix)(
      constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE
    )
  ).concat(poolAddress);
  const tradingFee = getOrCreateLiquidityPoolFee(
    tradingFeeId,
    constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE
  );
  const protocolFeeId = graph_ts_1.Bytes.fromUTF8(
    (0, strings_1.enumToPrefix)(
      constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE
    )
  ).concat(poolAddress);
  const protocolFee = getOrCreateLiquidityPoolFee(
    protocolFeeId,
    constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE
  );
  return [tradingFee.id, protocolFee.id];
}
function getOrCreateLiquidityPoolFee(
  feeId,
  feeType,
  feePercentage = constants_1.BIGDECIMAL_ZERO
) {
  let fees = schema_1.LiquidityPoolFee.load(feeId);
  if (!fees) {
    fees = new schema_1.LiquidityPoolFee(feeId);
    fees.feeType = feeType;
    fees.feePercentage = feePercentage;
    fees.save();
  }
  if (feePercentage.notEqual(constants_1.BIGDECIMAL_ZERO)) {
    fees.feePercentage = feePercentage;
    fees.save();
  }
  return fees;
}
