"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMarket = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const compound_1 = require("../utils/compound");
const rates_1 = require("../utils/rates");
const token_1 = require("../helpers/token");
const const_1 = require("../utils/const");
function updateMarket(
  market,
  dailySnapshot,
  hourlySnapshot,
  protocolDailySnapshot,
  receipt
) {
  const token = (0, token_1.getOrCreateToken)(market.inputToken);
  /*** update apr and compound values ***/
  (0, rates_1.updateApr)(market, receipt);
  const revenues = (0, compound_1.compound)(market, receipt);
  const protocolRevenue = revenues[0].times(market.inputTokenPriceUSD).div(
    graph_ts_1.BigInt.fromI32(10)
      .pow(token.decimals + token.extraDecimals)
      .toBigDecimal()
  );
  const supplyRevenue = revenues[1].times(market.inputTokenPriceUSD).div(
    graph_ts_1.BigInt.fromI32(10)
      .pow(token.decimals + token.extraDecimals)
      .toBigDecimal()
  );
  // inputTokenPriceUSD
  market.inputTokenPriceUSD = token.lastPriceUSD;
  // totalDepositBalanceUSD
  market.inputTokenBalance = (0, const_1.BD_BI)(market._totalDeposited);
  market.totalDepositBalanceUSD = market.inputTokenBalance
    .toBigDecimal()
    .div(
      graph_ts_1.BigInt.fromI32(10)
        .pow(token.decimals + token.extraDecimals)
        .toBigDecimal()
    )
    .times(market.inputTokenPriceUSD);
  // totalValueLockedUSD
  market.totalValueLockedUSD = market.totalDepositBalanceUSD;
  // cumulativeSupplySideRevenueUSD, cumulativeTotalRevenueUSD
  market.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD.plus(protocolRevenue);
  market.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD.plus(supplyRevenue);
  market.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD
    .plus(protocolRevenue)
    .plus(supplyRevenue);
  dailySnapshot.dailySupplySideRevenueUSD =
    dailySnapshot.dailySupplySideRevenueUSD.plus(supplyRevenue);
  dailySnapshot.dailyProtocolSideRevenueUSD =
    dailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolRevenue);
  dailySnapshot.dailyTotalRevenueUSD = dailySnapshot.dailyTotalRevenueUSD.plus(
    supplyRevenue.plus(protocolRevenue)
  );
  hourlySnapshot.hourlySupplySideRevenueUSD =
    hourlySnapshot.hourlySupplySideRevenueUSD.plus(supplyRevenue);
  hourlySnapshot.hourlyProtocolSideRevenueUSD =
    hourlySnapshot.hourlyProtocolSideRevenueUSD.plus(protocolRevenue);
  hourlySnapshot.hourlyTotalRevenueUSD =
    hourlySnapshot.hourlyTotalRevenueUSD.plus(
      supplyRevenue.plus(protocolRevenue)
    );
  protocolDailySnapshot.dailySupplySideRevenueUSD =
    protocolDailySnapshot.dailySupplySideRevenueUSD.plus(supplyRevenue);
  protocolDailySnapshot.dailyProtocolSideRevenueUSD =
    protocolDailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolRevenue);
  protocolDailySnapshot.dailyTotalRevenueUSD =
    protocolDailySnapshot.dailyTotalRevenueUSD.plus(
      supplyRevenue.plus(protocolRevenue)
    );
  // totalBorrowBalanceUSD
  market.totalBorrowBalanceUSD = market._totalBorrowed
    .div(
      graph_ts_1.BigInt.fromI32(10)
        .pow(token.decimals + token.extraDecimals)
        .toBigDecimal()
    )
    .times(market.inputTokenPriceUSD);
  // exchangeRate
  market.inputTokenPriceUSD = token.lastPriceUSD;
  if (market.outputTokenSupply.gt(const_1.BI_ZERO)) {
    market.exchangeRate = market.inputTokenBalance
      .toBigDecimal()
      .div(market.outputTokenSupply.toBigDecimal());
  } else {
    market.exchangeRate = const_1.BD_ZERO;
  }
  // outputTokenPriceUSD
  market.outputTokenPriceUSD = market.exchangeRate.times(
    market.inputTokenPriceUSD
  );
}
exports.updateMarket = updateMarket;
