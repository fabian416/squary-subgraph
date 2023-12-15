"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeMarketPosition =
  exports.openMarketLenderPosition =
  exports.openMarketBorrowerPosition =
  exports.updateMarketRewardTokens =
  exports.addMarketProtocolSideRevenue =
  exports.addMarketSupplySideRevenue =
  exports.updateTokenSupply =
  exports.updateMarketRates =
  exports.changeMarketBorrowBalance =
  exports.addMarketVolume =
  exports.getOrCreateMarketHourlySnapshot =
  exports.getOrCreateMarketSnapshot =
  exports.closeMarket =
  exports.createMarket =
  exports.getOrCreateMarket =
  exports.getMarket =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const Vault_1 = require("../../generated/ibALPACA/Vault");
const vault_1 = require("../mappings/vault");
const price_1 = require("./price");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const usage_1 = require("./usage");
const event_1 = require("./event");
const rate_1 = require("./rate");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
function getMarket(address) {
  const id = address.toHexString();
  return schema_1.Market.load(id);
}
exports.getMarket = getMarket;
function getOrCreateMarket(event, reserve, ibToken) {
  const id = ibToken.toHexString();
  let market = schema_1.Market.load(id);
  if (!market) {
    market = createMarket(event, reserve, ibToken);
  }
  return market;
}
exports.getOrCreateMarket = getOrCreateMarket;
function createMarket(event, reserve, ibToken) {
  const id = ibToken.toHexString();
  const interestBearingToken = (0, token_1.getOrCreateToken)(
    ibToken,
    reserve.toHexString()
  );
  const market = new schema_1.Market(id);
  market.protocol = (0, protocol_1.getOrCreateLendingProtocol)().id;
  market.name = interestBearingToken.name;
  market.isActive = true;
  market.canUseAsCollateral = true;
  market.canBorrowFrom = true;
  market.maximumLTV = constants_1.BIGDECIMAL_ONE;
  market.liquidationThreshold = constants_1.KILL_FACTOR;
  market.liquidationPenalty = constants_1.LIQUIDATION_BONUS;
  market.inputToken = (0, token_1.getOrCreateToken)(reserve).id;
  market.outputToken = interestBearingToken.id;
  market.rates = [];
  market.createdTimestamp = event.block.timestamp;
  market.createdBlockNumber = event.block.number;
  market.exchangeRate = constants_1.BIGDECIMAL_ONE;
  market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
  market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
  market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
  market.inputTokenBalance = constants_1.BIGINT_ZERO;
  market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
  market.outputTokenSupply = constants_1.BIGINT_ZERO;
  market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
  market.positionCount = constants_1.INT_ZERO;
  market.openPositionCount = constants_1.INT_ZERO;
  market.closedPositionCount = constants_1.INT_ZERO;
  market.lendingPositionCount = constants_1.INT_ZERO;
  market.borrowingPositionCount = constants_1.INT_ZERO;
  market.save();
  (0, usage_1.incrementProtocolTotalPoolCount)(event);
  return market;
}
exports.createMarket = createMarket;
function closeMarket(market) {
  market.isActive = false;
  market.canUseAsCollateral = false;
  market.canBorrowFrom = false;
  market.save();
}
exports.closeMarket = closeMarket;
function getOrCreateMarketSnapshot(event, market) {
  const day = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
  const id = `${market.id}-${day}`;
  let marketSnapshot = schema_1.MarketDailySnapshot.load(id);
  if (!marketSnapshot) {
    // Update reward tokens once per day as the reward ending date has not been set yet.
    (0, vault_1.updateRewardTokens)(event, market);
    marketSnapshot = new schema_1.MarketDailySnapshot(id);
    marketSnapshot.protocol = market.protocol;
    marketSnapshot.market = market.id;
    marketSnapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
  }
  marketSnapshot.rates = getSnapshotRates(
    market.rates,
    (event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString()
  );
  marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
  marketSnapshot.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD;
  marketSnapshot.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD;
  marketSnapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
  marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
  marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
  marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
  marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
  marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
  marketSnapshot.inputTokenBalance = market.inputTokenBalance;
  marketSnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
  marketSnapshot.outputTokenSupply = market.outputTokenSupply;
  marketSnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
  marketSnapshot.exchangeRate = market.exchangeRate;
  marketSnapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
  marketSnapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
  marketSnapshot.blockNumber = event.block.number;
  marketSnapshot.timestamp = event.block.timestamp;
  marketSnapshot.save();
  return marketSnapshot;
}
exports.getOrCreateMarketSnapshot = getOrCreateMarketSnapshot;
function getOrCreateMarketHourlySnapshot(event, market) {
  const timestamp = event.block.timestamp.toI64();
  const hour = timestamp / constants_1.SECONDS_PER_HOUR;
  const id = `${market.id}-${hour}`;
  let marketSnapshot = schema_1.MarketHourlySnapshot.load(id);
  if (!marketSnapshot) {
    marketSnapshot = new schema_1.MarketHourlySnapshot(id);
    marketSnapshot.protocol = market.protocol;
    marketSnapshot.market = market.id;
    marketSnapshot.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
    marketSnapshot.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
  }
  marketSnapshot.rates = getSnapshotRates(
    market.rates,
    (event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString()
  );
  marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
  marketSnapshot.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD;
  marketSnapshot.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD;
  marketSnapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
  marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
  marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
  marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
  marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
  marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
  marketSnapshot.inputTokenBalance = market.inputTokenBalance;
  marketSnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
  marketSnapshot.outputTokenSupply = market.outputTokenSupply;
  marketSnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
  marketSnapshot.exchangeRate = market.exchangeRate;
  marketSnapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
  marketSnapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
  marketSnapshot.blockNumber = event.block.number;
  marketSnapshot.timestamp = event.block.timestamp;
  marketSnapshot.save();
  return marketSnapshot;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
// create seperate InterestRate Entities for each market snapshot
// this is needed to prevent snapshot rates from being pointers to the current rate
function getSnapshotRates(rates, timeSuffix) {
  const snapshotRates = [];
  for (let i = 0; i < rates.length; i++) {
    const rate = schema_1.InterestRate.load(rates[i]);
    if (!rate) {
      graph_ts_1.log.warning(
        "[getSnapshotRates] rate {} not found, should not happen",
        [rates[i]]
      );
      continue;
    }
    // create new snapshot rate
    const snapshotRateId = rates[i].concat("-").concat(timeSuffix);
    const snapshotRate = new schema_1.InterestRate(snapshotRateId);
    snapshotRate.side = rate.side;
    snapshotRate.type = rate.type;
    snapshotRate.rate = rate.rate;
    snapshotRate.save();
    snapshotRates.push(snapshotRateId);
  }
  return snapshotRates;
}
function addMarketVolume(event, market, amountUSD, eventType) {
  const dailySnapshot = getOrCreateMarketSnapshot(event, market);
  const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
  switch (eventType) {
    case event_1.EventType.Deposit:
      market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(amountUSD);
      dailySnapshot.dailyDepositUSD =
        dailySnapshot.dailyDepositUSD.plus(amountUSD);
      hourlySnapshot.hourlyDepositUSD =
        hourlySnapshot.hourlyDepositUSD.plus(amountUSD);
      (0, protocol_1.addProtocolDepositVolume)(event, amountUSD);
      break;
    case event_1.EventType.Borrow:
      market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(amountUSD);
      dailySnapshot.dailyBorrowUSD =
        dailySnapshot.dailyBorrowUSD.plus(amountUSD);
      hourlySnapshot.hourlyBorrowUSD =
        hourlySnapshot.hourlyBorrowUSD.plus(amountUSD);
      (0, protocol_1.addProtocolVolume)(
        event,
        amountUSD,
        event_1.EventType.Borrow
      );
      break;
    case event_1.EventType.Liquidate:
      market.cumulativeLiquidateUSD =
        market.cumulativeLiquidateUSD.plus(amountUSD);
      dailySnapshot.dailyLiquidateUSD =
        dailySnapshot.dailyLiquidateUSD.plus(amountUSD);
      hourlySnapshot.hourlyLiquidateUSD =
        hourlySnapshot.hourlyLiquidateUSD.plus(amountUSD);
      (0, protocol_1.addProtocolVolume)(
        event,
        amountUSD,
        event_1.EventType.Liquidate
      );
      break;
    case event_1.EventType.Withdraw:
      dailySnapshot.dailyWithdrawUSD =
        dailySnapshot.dailyWithdrawUSD.plus(amountUSD);
      hourlySnapshot.hourlyWithdrawUSD =
        hourlySnapshot.hourlyWithdrawUSD.plus(amountUSD);
      (0, protocol_1.addProtocolVolume)(
        event,
        amountUSD,
        event_1.EventType.Withdraw
      );
      break;
    case event_1.EventType.Repay:
      dailySnapshot.dailyRepayUSD = dailySnapshot.dailyRepayUSD.plus(amountUSD);
      hourlySnapshot.hourlyRepayUSD =
        hourlySnapshot.hourlyRepayUSD.plus(amountUSD);
      (0, protocol_1.addProtocolVolume)(
        event,
        amountUSD,
        event_1.EventType.Repay
      );
      break;
    default:
      break;
  }
  market.save();
  dailySnapshot.save();
  hourlySnapshot.save();
}
exports.addMarketVolume = addMarketVolume;
function changeMarketBorrowBalance(event, market, borrowBalance) {
  const token = (0, token_1.getTokenById)(market.inputToken);
  const totalBBUSD = (0, price_1.amountInUSD)(
    borrowBalance,
    token,
    event.block.number
  );
  // this can change because of balance and price
  const deltaTotalBBUSD = totalBBUSD.minus(market.totalBorrowBalanceUSD);
  market.totalBorrowBalanceUSD = totalBBUSD;
  if (market.totalBorrowBalanceUSD.lt(constants_1.BIGDECIMAL_ZERO)) {
    graph_ts_1.log.warning(
      "[changeMarketBorrowBalance] totalBorrowBalanceUSD {} is negative, should not happen",
      [market.totalBorrowBalanceUSD.toString()]
    );
    market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  }
  market.save();
  getOrCreateMarketSnapshot(event, market);
  getOrCreateMarketHourlySnapshot(event, market);
  (0, protocol_1.updateProtocolBorrowBalance)(event, deltaTotalBBUSD);
}
exports.changeMarketBorrowBalance = changeMarketBorrowBalance;
function updateMarketRates(
  event,
  market,
  borrowerInterestRate,
  lenderInterestRate
) {
  const newRates = (0, rate_1.getOrCreateInterestRateIds)(
    market.id,
    borrowerInterestRate,
    lenderInterestRate
  );
  market.rates = newRates;
  market.save();
  getOrCreateMarketSnapshot(event, market);
  getOrCreateMarketHourlySnapshot(event, market);
}
exports.updateMarketRates = updateMarketRates;
function updateTokenSupply(event, market, outputTokenChangeAmount) {
  const inputToken = (0, token_1.getTokenById)(market.inputToken);
  market.inputTokenPriceUSD = (0, price_1.getTokenPrice)(
    inputToken,
    event.block.number
  );
  market.outputTokenSupply = market.outputTokenSupply.plus(
    outputTokenChangeAmount
  );
  market.save();
  updateMarketTVL(event, market);
  getOrCreateMarketSnapshot(event, market);
  getOrCreateMarketHourlySnapshot(event, market);
}
exports.updateTokenSupply = updateTokenSupply;
function addMarketSupplySideRevenue(event, market, revenueAmountUSD) {
  if (revenueAmountUSD.le(constants_1.BIGDECIMAL_ZERO)) {
    return;
  }
  market.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD.plus(revenueAmountUSD);
  market.cumulativeTotalRevenueUSD =
    market.cumulativeTotalRevenueUSD.plus(revenueAmountUSD);
  market.save();
  const dailySnapshot = getOrCreateMarketSnapshot(event, market);
  dailySnapshot.dailySupplySideRevenueUSD =
    dailySnapshot.dailySupplySideRevenueUSD.plus(revenueAmountUSD);
  dailySnapshot.dailyTotalRevenueUSD =
    dailySnapshot.dailyTotalRevenueUSD.plus(revenueAmountUSD);
  dailySnapshot.save();
  const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
  hourlySnapshot.hourlySupplySideRevenueUSD =
    hourlySnapshot.hourlySupplySideRevenueUSD.plus(revenueAmountUSD);
  hourlySnapshot.hourlyTotalRevenueUSD =
    hourlySnapshot.hourlyTotalRevenueUSD.plus(revenueAmountUSD);
  hourlySnapshot.save();
  (0, protocol_1.addSupplySideRevenue)(event, revenueAmountUSD);
}
exports.addMarketSupplySideRevenue = addMarketSupplySideRevenue;
function addMarketProtocolSideRevenue(event, market, revenueAmountUSD) {
  if (revenueAmountUSD.le(constants_1.BIGDECIMAL_ZERO)) {
    return;
  }
  market.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD.plus(revenueAmountUSD);
  market.cumulativeTotalRevenueUSD =
    market.cumulativeTotalRevenueUSD.plus(revenueAmountUSD);
  market.save();
  const dailySnapshot = getOrCreateMarketSnapshot(event, market);
  dailySnapshot.dailyProtocolSideRevenueUSD =
    dailySnapshot.dailyProtocolSideRevenueUSD.plus(revenueAmountUSD);
  dailySnapshot.dailyTotalRevenueUSD =
    dailySnapshot.dailyTotalRevenueUSD.plus(revenueAmountUSD);
  dailySnapshot.save();
  const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
  hourlySnapshot.hourlyProtocolSideRevenueUSD =
    hourlySnapshot.hourlyProtocolSideRevenueUSD.plus(revenueAmountUSD);
  hourlySnapshot.hourlyTotalRevenueUSD =
    hourlySnapshot.hourlyTotalRevenueUSD.plus(revenueAmountUSD);
  hourlySnapshot.save();
  (0, protocol_1.addProtocolSideRevenue)(event, revenueAmountUSD);
}
exports.addMarketProtocolSideRevenue = addMarketProtocolSideRevenue;
function updateMarketRewardTokens(event, market, rewardToken, emissionRate) {
  let rewardTokens = market.rewardTokens;
  let rewardTokenEmissions = market.rewardTokenEmissionsAmount;
  let rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
  if (rewardTokens == null) {
    rewardTokens = [];
    rewardTokenEmissions = [];
    rewardTokenEmissionsUSD = [];
  }
  let rewardTokenIndex = rewardTokens.indexOf(rewardToken.id);
  if (rewardTokenIndex == -1) {
    rewardTokenIndex = rewardTokens.push(rewardToken.id) - 1;
    rewardTokenEmissions.push(constants_1.BIGINT_ZERO);
    rewardTokenEmissionsUSD.push(constants_1.BIGDECIMAL_ZERO);
  }
  rewardTokenEmissions[rewardTokenIndex] = emissionRate.times(
    constants_1.BIGINT_SECONDS_PER_DAY
  );
  market.rewardTokens = rewardTokens;
  market.rewardTokenEmissionsAmount = rewardTokenEmissions;
  market.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
  sortRewardTokens(market);
  updateMarketRewardTokenEmissions(event, market);
}
exports.updateMarketRewardTokens = updateMarketRewardTokens;
function sortRewardTokens(market) {
  if (market.rewardTokens.length <= 1) {
    return;
  }
  const tokens = market.rewardTokens;
  const emissions = market.rewardTokenEmissionsAmount;
  const emissionsUSD = market.rewardTokenEmissionsUSD;
  multiArraySort(tokens, emissions, emissionsUSD);
  market.rewardTokens = tokens;
  market.rewardTokenEmissionsAmount = emissions;
  market.rewardTokenEmissionsUSD = emissionsUSD;
}
function multiArraySort(ref, arr1, arr2) {
  if (ref.length != arr1.length || ref.length != arr2.length) {
    // cannot sort
    return;
  }
  const sorter = [];
  for (let i = 0; i < ref.length; i++) {
    sorter[i] = [ref[i], arr1[i].toString(), arr2[i].toString()];
  }
  sorter.sort(function (a, b) {
    if (a[0] < b[0]) {
      return -1;
    }
    return 1;
  });
  for (let i = 0; i < sorter.length; i++) {
    ref[i] = sorter[i][0];
    arr1[i] = graph_ts_1.BigInt.fromString(sorter[i][1]);
    arr2[i] = graph_ts_1.BigDecimal.fromString(sorter[i][2]);
  }
}
function updateMarketRewardTokenEmissions(event, market) {
  if (market.rewardTokens == null) {
    return;
  }
  const rewardTokens = market.rewardTokens;
  const rewardTokenEmissions = market.rewardTokenEmissionsAmount;
  const rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
  for (let i = 0; i < rewardTokens.length; i++) {
    const rewardToken = getRewardTokenById(rewardTokens[i]);
    if (
      rewardToken.distributionEnd !== null &&
      event.block.timestamp.gt(rewardToken.distributionEnd)
    ) {
      rewardTokenEmissions[i] = constants_1.BIGINT_ZERO;
    }
    rewardTokenEmissionsUSD[i] = (0, price_1.amountInUSD)(
      rewardTokenEmissions[i],
      (0, token_1.getTokenById)(rewardToken.token),
      event.block.number
    );
  }
  market.rewardTokenEmissionsAmount = rewardTokenEmissions;
  market.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
  market.save();
}
function getRewardTokenById(id) {
  return schema_1.RewardToken.load(id);
}
function openMarketBorrowerPosition(market) {
  market.openPositionCount += 1;
  market.positionCount += 1;
  market.borrowingPositionCount += 1;
  market.save();
  (0, protocol_1.incrementProtocolPositionCount)();
}
exports.openMarketBorrowerPosition = openMarketBorrowerPosition;
function openMarketLenderPosition(market) {
  market.openPositionCount += 1;
  market.positionCount += 1;
  market.lendingPositionCount += 1;
  market.save();
  (0, protocol_1.incrementProtocolPositionCount)();
}
exports.openMarketLenderPosition = openMarketLenderPosition;
function closeMarketPosition(market) {
  market.openPositionCount -= 1;
  market.closedPositionCount += 1;
  market.save();
  (0, protocol_1.decrementProtocolOpenPositionCount)();
}
exports.closeMarketPosition = closeMarketPosition;
function updateMarketTVL(event, market) {
  const inputTokenPriceUSD = market.inputTokenPriceUSD;
  let totalValueLockedUSD = constants_1.BIGDECIMAL_NEGATIVE_ONE;
  const inputToken = (0, token_1.getTokenById)(market.inputToken);
  const outputToken = (0, token_1.getTokenById)(market.outputToken);
  let marketValue = constants_1.BIGINT_ZERO;
  const contract = Vault_1.Vault.bind(event.address);
  const tryTotalToken = contract.try_totalToken();
  if (!tryTotalToken.reverted) {
    totalValueLockedUSD = (0, numbers_1.bigIntToBigDecimal)(
      tryTotalToken.value,
      inputToken.decimals
    ).times(inputTokenPriceUSD);
    marketValue = tryTotalToken.value;
  }
  if (totalValueLockedUSD.ge(constants_1.BIGDECIMAL_ZERO)) {
    if (market.outputTokenSupply.gt(constants_1.BIGINT_ZERO)) {
      market.outputTokenPriceUSD = totalValueLockedUSD.div(
        (0, numbers_1.bigIntToBigDecimal)(
          market.outputTokenSupply,
          (0, token_1.getTokenById)(market.outputToken).decimals
        )
      );
      market.inputTokenBalance = marketValue;
      market.exchangeRate = market.inputTokenBalance
        .divDecimal(market.outputTokenSupply.toBigDecimal())
        .times(
          (0, numbers_1.exponentToBigDecimal)(
            outputToken.decimals - inputToken.decimals
          )
        );
    }
    const totalValueLockedUSDChange = totalValueLockedUSD.minus(
      market.totalValueLockedUSD
    );
    (0, protocol_1.updateProtocolTVL)(
      event,
      totalValueLockedUSDChange,
      totalValueLockedUSDChange
    );
    market.totalValueLockedUSD = totalValueLockedUSD;
    market.totalDepositBalanceUSD = totalValueLockedUSD;
  }
  market.save();
}
