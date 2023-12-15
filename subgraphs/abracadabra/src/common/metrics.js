"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBorrowAmount =
  exports.updateMarketStats =
  exports.updateTotalBorrows =
  exports.updateTVL =
  exports.updateMarketMetrics =
  exports.updateUsageMetrics =
  exports.updateFinancials =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("./constants");
const getters_1 = require("./getters");
const numbers_1 = require("./utils/numbers");
const DegenBox_1 = require("../../generated/BentoBox/DegenBox");
const utils_1 = require("./utils/utils");
const positions_1 = require("../positions");
const Cauldron_1 = require("../../generated/templates/Cauldron/Cauldron");
// Update FinancialsDailySnapshots entity
function updateFinancials(event, feesUSD, marketId) {
  // feesUSD is handled in handleLogWithdrawFees
  // totalValueLockedUSD is handled in updateTVL()
  const financialsDailySnapshots = (0, getters_1.getOrCreateFinancials)(event);
  const marketHourlySnapshot = (0, getters_1.getOrCreateMarketHourlySnapshot)(
    event,
    marketId
  );
  if (!marketHourlySnapshot) {
    graph_ts_1.log.warning(
      "[updateFinancials] marketHourlySnapshot not found for market: {}",
      [marketId]
    );
    return;
  }
  const marketDailySnapshot = (0, getters_1.getOrCreateMarketDailySnapshot)(
    event,
    marketId
  );
  if (!marketDailySnapshot) {
    graph_ts_1.log.warning(
      "[updateFinancials] marketDailySnapshot not found for market: {}",
      [marketId]
    );
    return;
  }
  const market = (0, getters_1.getMarket)(marketId);
  if (!market) {
    graph_ts_1.log.warning("[updateFinancials] Market not found: {}", [
      marketId,
    ]);
    return;
  }
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  const totalRevenueUSD = feesUSD;
  const supplySideRevenueUSD = feesUSD.times(
    constants_1.ABRA_USER_REVENUE_SHARE
  );
  const protocolSideRevenueUSD = feesUSD.times(
    constants_1.ABRA_PROTOCOL_REVENUE_SHARE
  );
  // add cumulative revenues to market
  market.cumulativeTotalRevenueUSD =
    market.cumulativeTotalRevenueUSD.plus(totalRevenueUSD);
  market.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
  market.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  market.save();
  protocol.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD.plus(totalRevenueUSD);
  protocol.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
  protocol.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  financialsDailySnapshots.dailyTotalRevenueUSD =
    financialsDailySnapshots.dailyTotalRevenueUSD.plus(totalRevenueUSD); // feesUSD comes from logAccrue which is accounted in MIM
  financialsDailySnapshots.dailySupplySideRevenueUSD =
    financialsDailySnapshots.dailySupplySideRevenueUSD.plus(
      supplySideRevenueUSD
    );
  financialsDailySnapshots.dailyProtocolSideRevenueUSD =
    financialsDailySnapshots.dailyProtocolSideRevenueUSD.plus(
      protocolSideRevenueUSD
    );
  financialsDailySnapshots.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD;
  financialsDailySnapshots.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD;
  financialsDailySnapshots.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD;
  marketDailySnapshot.dailyTotalRevenueUSD =
    marketDailySnapshot.dailyTotalRevenueUSD.plus(totalRevenueUSD); // feesUSD comes from logAccrue which is accounted in MIM
  marketDailySnapshot.dailySupplySideRevenueUSD =
    marketDailySnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
  marketDailySnapshot.dailyProtocolSideRevenueUSD =
    marketDailySnapshot.dailyProtocolSideRevenueUSD.plus(
      protocolSideRevenueUSD
    );
  marketDailySnapshot.cumulativeTotalRevenueUSD =
    market.cumulativeTotalRevenueUSD;
  marketDailySnapshot.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD;
  marketDailySnapshot.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD;
  marketHourlySnapshot.hourlyTotalRevenueUSD =
    marketHourlySnapshot.hourlyTotalRevenueUSD.plus(totalRevenueUSD); // feesUSD comes from logAccrue which is accounted in MIM
  marketHourlySnapshot.hourlySupplySideRevenueUSD =
    marketHourlySnapshot.hourlySupplySideRevenueUSD.plus(supplySideRevenueUSD);
  marketHourlySnapshot.hourlyProtocolSideRevenueUSD =
    marketHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(
      protocolSideRevenueUSD
    );
  marketHourlySnapshot.cumulativeTotalRevenueUSD =
    market.cumulativeTotalRevenueUSD;
  marketHourlySnapshot.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD;
  marketHourlySnapshot.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD;
  financialsDailySnapshots.cumulativeLiquidateUSD =
    protocol.cumulativeLiquidateUSD;
  financialsDailySnapshots.save();
  marketDailySnapshot.save();
  marketHourlySnapshot.save();
  protocol.save();
}
exports.updateFinancials = updateFinancials;
function updateUsageMetrics(event, from, to) {
  // Number of days since Unix epoch
  const hourlyId = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
  const dailyId = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
  const usageHourlySnapshot = (0,
  getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
  const usageDailySnapshot = (0,
  getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  // Update the block number and timestamp to that of the last transaction of that day
  usageHourlySnapshot.blockNumber = event.block.number;
  usageHourlySnapshot.timestamp = event.block.timestamp;
  usageHourlySnapshot.hourlyTransactionCount += 1;
  usageDailySnapshot.blockNumber = event.block.number;
  usageDailySnapshot.timestamp = event.block.timestamp;
  usageDailySnapshot.dailyTransactionCount += 1;
  (0, positions_1.getOrCreateAccount)(from.toHexString(), protocol);
  (0, positions_1.getOrCreateAccount)(to.toHexString(), protocol);
  usageHourlySnapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  usageDailySnapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  // Combine the id and the user address to generate a unique user id for the hour/day
  const hourlyActiveAccountIdFrom =
    "hourly-" + from.toHexString() + "-" + hourlyId.toString();
  let hourlyActiveAccountFrom = schema_1.ActiveAccount.load(
    hourlyActiveAccountIdFrom
  );
  if (!hourlyActiveAccountFrom) {
    hourlyActiveAccountFrom = new schema_1.ActiveAccount(
      hourlyActiveAccountIdFrom
    );
    hourlyActiveAccountFrom.save();
    usageHourlySnapshot.hourlyActiveUsers += 1;
  }
  const hourlyActiveAccountIdTo =
    "hourly-" + to.toHexString() + "-" + hourlyId.toString();
  let hourlyActiveAccountTo = schema_1.ActiveAccount.load(
    hourlyActiveAccountIdTo
  );
  if (!hourlyActiveAccountTo) {
    hourlyActiveAccountTo = new schema_1.ActiveAccount(hourlyActiveAccountIdTo);
    hourlyActiveAccountTo.save();
    usageHourlySnapshot.hourlyActiveUsers += 1;
  }
  const dailyActiveAccountIdFrom =
    "daily-" + from.toHexString() + "-" + dailyId.toString();
  let dailyActiveAccountFrom = schema_1.ActiveAccount.load(
    dailyActiveAccountIdFrom
  );
  if (!dailyActiveAccountFrom) {
    dailyActiveAccountFrom = new schema_1.ActiveAccount(
      dailyActiveAccountIdFrom
    );
    dailyActiveAccountFrom.save();
    usageDailySnapshot.dailyActiveUsers += 1;
  }
  const dailyActiveAccountIdTo =
    "daily-" + to.toHexString() + "-" + dailyId.toString();
  let dailyActiveAccountTo = schema_1.ActiveAccount.load(
    dailyActiveAccountIdTo
  );
  if (!dailyActiveAccountTo) {
    dailyActiveAccountTo = new schema_1.ActiveAccount(dailyActiveAccountIdTo);
    dailyActiveAccountTo.save();
    usageDailySnapshot.dailyActiveUsers += 1;
  }
  usageDailySnapshot.totalPoolCount = protocol.totalPoolCount;
  usageHourlySnapshot.save();
  usageDailySnapshot.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
// Update MarketDailySnapshot entity
function updateMarketMetrics(event) {
  const market = (0, getters_1.getMarket)(event.address.toHexString());
  if (!market) {
    return;
  }
  const marketHourlySnapshot = (0, getters_1.getOrCreateMarketHourlySnapshot)(
    event,
    market.id
  );
  const marketDailySnapshot = (0, getters_1.getOrCreateMarketDailySnapshot)(
    event,
    market.id
  );
  if (!marketHourlySnapshot || !marketDailySnapshot) {
    return;
  }
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  marketHourlySnapshot.protocol = protocol.id;
  marketHourlySnapshot.market = market.id;
  marketHourlySnapshot.rates = (0, utils_1.getSnapshotRates)(
    market.rates,
    (event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR).toString()
  );
  marketHourlySnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
  marketHourlySnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
  marketHourlySnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
  marketHourlySnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
  marketHourlySnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
  marketHourlySnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
  marketHourlySnapshot.inputTokenBalance = market.inputTokenBalance;
  marketHourlySnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
  marketHourlySnapshot.outputTokenSupply = market.outputTokenSupply;
  marketHourlySnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
  marketHourlySnapshot.blockNumber = event.block.number;
  marketHourlySnapshot.timestamp = event.block.timestamp;
  marketDailySnapshot.protocol = protocol.id;
  marketDailySnapshot.market = market.id;
  marketHourlySnapshot.rates = (0, utils_1.getSnapshotRates)(
    market.rates,
    (event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString()
  );
  marketDailySnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
  marketDailySnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
  marketDailySnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
  marketDailySnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
  marketDailySnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
  marketDailySnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
  marketDailySnapshot.inputTokenBalance = market.inputTokenBalance;
  marketDailySnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
  marketDailySnapshot.outputTokenSupply = market.outputTokenSupply;
  marketDailySnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
  marketDailySnapshot.blockNumber = event.block.number;
  marketDailySnapshot.timestamp = event.block.timestamp;
  marketHourlySnapshot.save();
  marketDailySnapshot.save();
}
exports.updateMarketMetrics = updateMarketMetrics;
function updateTVL(event) {
  // new user count handled in updateUsageMetrics
  // totalBorrowUSD handled updateTotalBorrowUSD
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  const bentoBoxContract = DegenBox_1.DegenBox.bind(
    graph_ts_1.Address.fromString(protocol.id)
  );
  const degenBoxContract = DegenBox_1.DegenBox.bind(
    graph_ts_1.Address.fromString(
      (0, getters_1.getDegenBoxAddress)(graph_ts_1.dataSource.network())
    )
  );
  const financialsDailySnapshot = (0, getters_1.getOrCreateFinancials)(event);
  const marketIDList = protocol.marketIDList;
  let protocolTotalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  for (let i = 0; i < marketIDList.length; i++) {
    const marketAddress = marketIDList[i];
    const market = (0, getters_1.getMarket)(marketAddress);
    if (!market) {
      return;
    }
    const inputToken = (0, getters_1.getOrCreateToken)(
      graph_ts_1.Address.fromString(market.inputToken)
    );
    const bentoBoxCall = (0, utils_1.readValue)(
      bentoBoxContract.try_balanceOf(
        graph_ts_1.Address.fromString(inputToken.id),
        graph_ts_1.Address.fromString(marketAddress)
      ),
      constants_1.BIGINT_ZERO
    );
    const degenBoxCall = (0, utils_1.readValue)(
      degenBoxContract.try_balanceOf(
        graph_ts_1.Address.fromString(inputToken.id),
        graph_ts_1.Address.fromString(marketAddress)
      ),
      constants_1.BIGINT_ZERO
    );
    const marketTVL = (0, numbers_1.bigIntToBigDecimal)(
      bentoBoxCall.plus(degenBoxCall),
      inputToken.decimals
    ).times(market.inputTokenPriceUSD);
    protocolTotalValueLockedUSD = protocolTotalValueLockedUSD.plus(marketTVL);
  }
  financialsDailySnapshot.totalValueLockedUSD = protocolTotalValueLockedUSD;
  financialsDailySnapshot.totalDepositBalanceUSD = protocolTotalValueLockedUSD;
  financialsDailySnapshot.blockNumber = event.block.number;
  financialsDailySnapshot.timestamp = event.block.timestamp;
  protocol.totalValueLockedUSD = protocolTotalValueLockedUSD;
  protocol.totalDepositBalanceUSD = protocolTotalValueLockedUSD;
  financialsDailySnapshot.save();
  protocol.save();
}
exports.updateTVL = updateTVL;
function updateTotalBorrows(event) {
  // new user count handled in updateUsageMetrics
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  const financialsDailySnapshots = (0, getters_1.getOrCreateFinancials)(event);
  const marketIDList = protocol.marketIDList;
  let mimPriceUSD = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(
      (0, getters_1.getMIMAddress)(graph_ts_1.dataSource.network())
    )
  ).lastPriceUSD;
  mimPriceUSD = mimPriceUSD.gt(constants_1.BIGDECIMAL_ZERO)
    ? mimPriceUSD
    : constants_1.BIGDECIMAL_ONE;
  let protocolMintedTokenSupply = constants_1.BIGINT_ZERO;
  let totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  for (let i = 0; i < marketIDList.length; i++) {
    const marketAddress = marketIDList[i];
    const market = (0, getters_1.getMarket)(marketAddress);
    if (!market) {
      return;
    }
    protocolMintedTokenSupply = protocolMintedTokenSupply.plus(
      market.outputTokenSupply
    );
    totalBorrowBalanceUSD = totalBorrowBalanceUSD.plus(
      (0, numbers_1.bigIntToBigDecimal)(
        market.outputTokenSupply,
        constants_1.DEFAULT_DECIMALS
      ).times(mimPriceUSD)
    );
  }
  financialsDailySnapshots.mintedTokenSupplies = [protocolMintedTokenSupply];
  financialsDailySnapshots.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
  protocol.mintedTokenSupplies = [protocolMintedTokenSupply];
  protocol.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
  financialsDailySnapshots.save();
  protocol.save();
}
exports.updateTotalBorrows = updateTotalBorrows;
function updateMarketStats(marketId, eventType, asset, amount, event) {
  const market = (0, getters_1.getMarket)(marketId);
  if (!market) {
    return;
  }
  const token = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(asset)
  );
  const usageHourlySnapshot = (0,
  getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
  const usageDailySnapshot = (0,
  getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
  const marketHourlySnapshot = (0, getters_1.getOrCreateMarketHourlySnapshot)(
    event,
    market.id
  );
  const marketDailySnapshot = (0, getters_1.getOrCreateMarketDailySnapshot)(
    event,
    market.id
  );
  if (!marketHourlySnapshot || !marketDailySnapshot) {
    return;
  }
  const financialsDailySnapshot = (0, getters_1.getOrCreateFinancials)(event);
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  const priceUSD = token.lastPriceUSD;
  const amountUSD = (0, numbers_1.bigIntToBigDecimal)(
    amount,
    token.decimals
  ).times(priceUSD);
  usageHourlySnapshot.blockNumber = event.block.number;
  usageHourlySnapshot.timestamp = event.block.timestamp;
  usageDailySnapshot.blockNumber = event.block.number;
  usageDailySnapshot.timestamp = event.block.timestamp;
  marketHourlySnapshot.blockNumber = event.block.number;
  marketHourlySnapshot.timestamp = event.block.timestamp;
  marketDailySnapshot.blockNumber = event.block.number;
  marketDailySnapshot.timestamp = event.block.timestamp;
  financialsDailySnapshot.blockNumber = event.block.number;
  financialsDailySnapshot.timestamp = event.block.timestamp;
  if (eventType == constants_1.EventType.DEPOSIT) {
    const inputTokenBalance = market.inputTokenBalance.plus(amount);
    market.inputTokenBalance = inputTokenBalance;
    market.totalValueLockedUSD = (0, numbers_1.bigIntToBigDecimal)(
      inputTokenBalance,
      token.decimals
    ).times(priceUSD);
    market.totalDepositBalanceUSD = (0, numbers_1.bigIntToBigDecimal)(
      inputTokenBalance,
      token.decimals
    ).times(priceUSD);
    usageHourlySnapshot.hourlyDepositCount += 1;
    usageDailySnapshot.dailyDepositCount += 1;
    market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(amountUSD);
    market.save();
    marketHourlySnapshot.cumulativeDepositUSD =
      marketHourlySnapshot.cumulativeDepositUSD.plus(amountUSD);
    marketDailySnapshot.cumulativeDepositUSD =
      marketDailySnapshot.cumulativeDepositUSD.plus(amountUSD);
    financialsDailySnapshot.cumulativeDepositUSD =
      financialsDailySnapshot.cumulativeDepositUSD.plus(amountUSD);
    protocol.cumulativeDepositUSD =
      protocol.cumulativeDepositUSD.plus(amountUSD);
    marketHourlySnapshot.hourlyDepositUSD =
      marketHourlySnapshot.hourlyDepositUSD.plus(amountUSD);
    marketDailySnapshot.dailyDepositUSD =
      marketDailySnapshot.dailyDepositUSD.plus(amountUSD);
    financialsDailySnapshot.dailyDepositUSD =
      financialsDailySnapshot.dailyDepositUSD.plus(amountUSD);
  } else if (eventType == constants_1.EventType.WITHDRAW) {
    const inputTokenBalance = market.inputTokenBalance.minus(amount);
    market.inputTokenBalance = inputTokenBalance;
    market.totalValueLockedUSD = (0, numbers_1.bigIntToBigDecimal)(
      inputTokenBalance,
      token.decimals
    ).times(priceUSD);
    market.totalDepositBalanceUSD = (0, numbers_1.bigIntToBigDecimal)(
      inputTokenBalance,
      token.decimals
    ).times(priceUSD);
    market.save();
    marketDailySnapshot.dailyWithdrawUSD =
      marketDailySnapshot.dailyWithdrawUSD.plus(amountUSD);
    usageHourlySnapshot.hourlyWithdrawCount += 1;
    usageDailySnapshot.dailyWithdrawCount += 1;
    financialsDailySnapshot.dailyWithdrawUSD =
      financialsDailySnapshot.dailyWithdrawUSD.plus(amountUSD);
  } else if (eventType == constants_1.EventType.BORROW) {
    usageHourlySnapshot.hourlyBorrowCount += 1;
    usageDailySnapshot.dailyBorrowCount += 1;
    market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(amountUSD);
    market.save();
    marketHourlySnapshot.cumulativeBorrowUSD =
      marketHourlySnapshot.cumulativeBorrowUSD.plus(amountUSD);
    marketDailySnapshot.cumulativeBorrowUSD =
      marketDailySnapshot.cumulativeBorrowUSD.plus(amountUSD);
    financialsDailySnapshot.cumulativeBorrowUSD =
      financialsDailySnapshot.cumulativeBorrowUSD.plus(amountUSD);
    protocol.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD.plus(amountUSD);
    marketHourlySnapshot.hourlyBorrowUSD =
      marketHourlySnapshot.hourlyBorrowUSD.plus(amountUSD);
    marketDailySnapshot.dailyBorrowUSD =
      marketDailySnapshot.dailyBorrowUSD.plus(amountUSD);
    financialsDailySnapshot.dailyBorrowUSD =
      financialsDailySnapshot.dailyBorrowUSD.plus(amountUSD);
  } else if (eventType == constants_1.EventType.REPAY) {
    marketDailySnapshot.dailyRepayUSD =
      marketDailySnapshot.dailyRepayUSD.plus(amountUSD);
    usageHourlySnapshot.hourlyRepayCount += 1;
    usageDailySnapshot.dailyRepayCount += 1;
    financialsDailySnapshot.dailyRepayUSD =
      financialsDailySnapshot.dailyRepayUSD.plus(amountUSD);
  }
  market.inputTokenPriceUSD = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(market.inputToken)
  ).lastPriceUSD;
  market.save();
  usageHourlySnapshot.save();
  usageDailySnapshot.save();
  marketHourlySnapshot.save();
  marketDailySnapshot.save();
  financialsDailySnapshot.save();
  protocol.save();
}
exports.updateMarketStats = updateMarketStats;
// update borrow amount for the given market
function updateBorrowAmount(market) {
  const couldronContract = Cauldron_1.Cauldron.bind(
    graph_ts_1.Address.fromString(market.id)
  );
  // get total borrows
  const tryBorrowBalance = couldronContract.try_totalBorrow();
  if (tryBorrowBalance.reverted) {
    graph_ts_1.log.warning(
      "[updateBorrowAmount] Could not get borrow balance for market {}",
      [market.id]
    );
    return;
  }
  // get mim and price since that is the only borrowable asset
  const mimToken = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(
      (0, getters_1.getMIMAddress)(graph_ts_1.dataSource.network())
    )
  );
  const mimBorrowed = tryBorrowBalance.value.value0;
  market.outputTokenSupply = mimBorrowed;
  market.totalBorrowBalanceUSD = mimBorrowed
    .toBigDecimal()
    .div((0, numbers_1.exponentToBigDecimal)(mimToken.decimals))
    .times(mimToken.lastPriceUSD);
  market.save();
}
exports.updateBorrowAmount = updateBorrowAmount;
