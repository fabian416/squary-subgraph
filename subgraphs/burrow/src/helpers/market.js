"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateMarketHourlySnapshot =
  exports.getOrCreateMarketDailySnapshot =
  exports.getOrCreateMarket =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const const_1 = require("../utils/const");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const rates_1 = require("./rates");
function getOrCreateMarket(id) {
  let market = schema_1.Market.load(id);
  if (!market) {
    const token = (0, token_1.getOrCreateToken)(id);
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    market = new schema_1.Market(id);
    market.protocol = protocol.id;
    market.name = token.name;
    market.isActive = false;
    market.canUseAsCollateral = false;
    market.canBorrowFrom = false;
    market.maximumLTV = const_1.BD_ZERO;
    market.liquidationThreshold = const_1.BD_ZERO;
    market.liquidationPenalty = const_1.BD_ZERO;
    market.inputToken = token.id;
    market.outputToken = const_1.ADDRESS_ZERO;
    const supplyRate = new schema_1.InterestRate(
      const_1.InterestRateSide.LENDER.concat("-")
        .concat(const_1.InterestRateType.VARIABLE)
        .concat("-")
        .concat(market.id)
    );
    supplyRate.rate = const_1.BD_ZERO;
    supplyRate.side = const_1.InterestRateSide.LENDER;
    supplyRate.type = const_1.InterestRateType.VARIABLE;
    supplyRate.save();
    const borrowRate = new schema_1.InterestRate(
      const_1.InterestRateSide.BORROWER.concat("-")
        .concat(const_1.InterestRateType.VARIABLE)
        .concat("-")
        .concat(market.id)
    );
    borrowRate.rate = const_1.BD_ZERO;
    borrowRate.side = const_1.InterestRateSide.BORROWER;
    borrowRate.type = const_1.InterestRateType.VARIABLE;
    borrowRate.save();
    // quants
    market.rates = [supplyRate.id, borrowRate.id];
    market.totalValueLockedUSD = const_1.BD_ZERO;
    market.cumulativeSupplySideRevenueUSD = const_1.BD_ZERO;
    market.cumulativeProtocolSideRevenueUSD = const_1.BD_ZERO;
    market.cumulativeTotalRevenueUSD = const_1.BD_ZERO;
    market.totalDepositBalanceUSD = const_1.BD_ZERO;
    market.cumulativeDepositUSD = const_1.BD_ZERO;
    market.totalBorrowBalanceUSD = const_1.BD_ZERO;
    market.cumulativeBorrowUSD = const_1.BD_ZERO;
    market.cumulativeLiquidateUSD = const_1.BD_ZERO;
    // reward token
    market.rewardTokens = new Array();
    market.rewardTokenEmissionsAmount = new Array();
    market.rewardTokenEmissionsUSD = new Array();
    // token balances
    market.inputTokenBalance = const_1.BI_ZERO;
    market.inputTokenPriceUSD = const_1.BD_ZERO;
    market.outputTokenSupply = const_1.BI_ZERO;
    market.outputTokenPriceUSD = const_1.BD_ZERO;
    market.exchangeRate = const_1.BD_ZERO;
    market.createdTimestamp = const_1.BI_ZERO;
    market.createdBlockNumber = const_1.BI_ZERO;
    market.positionCount = 0;
    market.openPositionCount = 0;
    market.closedPositionCount = 0;
    market.lendingPositionCount = 0;
    market.borrowingPositionCount = 0;
    market._lastUpdateTimestamp = const_1.BI_ZERO;
    market._reserveRatio = const_1.BI_ZERO;
    market._targetUtilization = const_1.BI_ZERO;
    market._targetUtilizationRate = const_1.BI_ZERO;
    market._maxUtilizationRate = const_1.BI_ZERO;
    market._volatilityRatio = const_1.BI_ZERO;
    market._totalWithrawnHistory = const_1.BI_ZERO;
    market._totalDepositedHistory = const_1.BI_ZERO;
    market._totalBorrowed = const_1.BD_ZERO;
    market._totalDeposited = const_1.BD_ZERO;
    market._totalReserved = const_1.BD_ZERO;
    market._addedToReserve = const_1.BD_ZERO;
    market._totalBorrowedHistory = const_1.BI_ZERO;
    market._totalRepaidHistory = const_1.BI_ZERO;
    market._utilization = const_1.BD_ZERO;
    market.save();
  }
  return market;
}
exports.getOrCreateMarket = getOrCreateMarket;
function getOrCreateMarketDailySnapshot(market, receipt) {
  const dayId = (0, const_1.NANOS_TO_DAY)(
    receipt.block.header.timestampNanosec
  ).toString();
  const id = market.id.concat("-").concat(dayId);
  let snapshot = schema_1.MarketDailySnapshot.load(id);
  // --- if new day ---
  if (!snapshot) {
    snapshot = new schema_1.MarketDailySnapshot(id);
    snapshot.protocol = (0, protocol_1.getOrCreateProtocol)().id;
    snapshot.market = market.id;
    snapshot.dailySupplySideRevenueUSD = const_1.BD_ZERO;
    snapshot.dailyProtocolSideRevenueUSD = const_1.BD_ZERO;
    snapshot.dailyTotalRevenueUSD = const_1.BD_ZERO;
    snapshot.dailyDepositUSD = const_1.BD_ZERO;
    snapshot.dailyBorrowUSD = const_1.BD_ZERO;
    snapshot.dailyLiquidateUSD = const_1.BD_ZERO;
    snapshot.dailyWithdrawUSD = const_1.BD_ZERO;
    snapshot.dailyRepayUSD = const_1.BD_ZERO;
  }
  // supply rate
  const supplyRateMarket = (0, rates_1.getOrCreateRate)(
    market,
    const_1.InterestRateSide.LENDER
  );
  const supplyRateToday = (0, rates_1.getOrCreateRate)(
    market,
    const_1.InterestRateSide.LENDER,
    const_1.IntervalType.DAILY,
    receipt
  );
  supplyRateToday.rate = supplyRateMarket.rate;
  supplyRateToday.save();
  // borrow rate
  const borrowRateMarket = (0, rates_1.getOrCreateRate)(
    market,
    const_1.InterestRateSide.BORROWER
  );
  const borrowRateToday = (0, rates_1.getOrCreateRate)(
    market,
    const_1.InterestRateSide.BORROWER,
    const_1.IntervalType.DAILY,
    receipt
  );
  borrowRateToday.rate = borrowRateMarket.rate;
  borrowRateToday.save();
  snapshot.rates = [supplyRateToday.id, borrowRateToday.id];
  snapshot.blockNumber = graph_ts_1.BigInt.fromU64(receipt.block.header.height);
  snapshot.timestamp = graph_ts_1.BigInt.fromU64(
    (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
  );
  snapshot.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD;
  snapshot.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD;
  snapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
  snapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
  snapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
  snapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
  snapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
  snapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
  snapshot.inputTokenBalance = market.inputTokenBalance;
  snapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
  snapshot.outputTokenSupply = market.outputTokenSupply;
  snapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
  snapshot.exchangeRate = market.exchangeRate;
  snapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
  snapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
  snapshot.totalValueLockedUSD = market.totalValueLockedUSD;
  snapshot.save();
  return snapshot;
}
exports.getOrCreateMarketDailySnapshot = getOrCreateMarketDailySnapshot;
function getOrCreateMarketHourlySnapshot(market, receipt) {
  const hourId = (0, const_1.NANOS_TO_HOUR)(
    receipt.block.header.timestampNanosec
  ).toString();
  const id = market.id.concat("-").concat(hourId);
  let snapshot = schema_1.MarketHourlySnapshot.load(id);
  // --- if new hour ---
  if (!snapshot) {
    snapshot = new schema_1.MarketHourlySnapshot(id);
    snapshot.protocol = (0, protocol_1.getOrCreateProtocol)().id;
    snapshot.market = market.id;
    snapshot.hourlySupplySideRevenueUSD = const_1.BD_ZERO;
    snapshot.hourlyProtocolSideRevenueUSD = const_1.BD_ZERO;
    snapshot.hourlyTotalRevenueUSD = const_1.BD_ZERO;
    snapshot.hourlyDepositUSD = const_1.BD_ZERO;
    snapshot.hourlyBorrowUSD = const_1.BD_ZERO;
    snapshot.hourlyLiquidateUSD = const_1.BD_ZERO;
    snapshot.hourlyWithdrawUSD = const_1.BD_ZERO;
    snapshot.hourlyRepayUSD = const_1.BD_ZERO;
  }
  snapshot.blockNumber = graph_ts_1.BigInt.fromU64(receipt.block.header.height);
  snapshot.timestamp = graph_ts_1.BigInt.fromU64(
    (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
  );
  // supply rate
  const supplyRateMarket = (0, rates_1.getOrCreateRate)(
    market,
    const_1.InterestRateSide.LENDER
  );
  const supplyRateToday = (0, rates_1.getOrCreateRate)(
    market,
    const_1.InterestRateSide.LENDER,
    const_1.IntervalType.HOURLY,
    receipt
  );
  supplyRateToday.rate = supplyRateMarket.rate;
  supplyRateToday.save();
  // borrow rate
  const borrowRateMarket = (0, rates_1.getOrCreateRate)(
    market,
    const_1.InterestRateSide.BORROWER
  );
  const borrowRateToday = (0, rates_1.getOrCreateRate)(
    market,
    const_1.InterestRateSide.BORROWER,
    const_1.IntervalType.HOURLY,
    receipt
  );
  borrowRateToday.rate = borrowRateMarket.rate;
  borrowRateToday.save();
  snapshot.rates = [supplyRateToday.id, borrowRateToday.id];
  snapshot.totalValueLockedUSD = market.totalValueLockedUSD;
  snapshot.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD;
  snapshot.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD;
  snapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
  snapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
  snapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
  snapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
  snapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
  snapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
  snapshot.inputTokenBalance = market.inputTokenBalance;
  snapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
  snapshot.outputTokenSupply = market.outputTokenSupply;
  snapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
  snapshot.exchangeRate = market.exchangeRate;
  snapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
  snapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
  snapshot.save();
  return snapshot;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
