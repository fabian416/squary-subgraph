"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateInterestRate =
  exports.getNetwork =
  exports.getStakedSpellAddress =
  exports.getMIMAddress =
  exports.getDegenBoxAddress =
  exports.getBentoBoxAddress =
  exports.getLiquidateEvent =
  exports.getMarket =
  exports.getOrCreateLendingProtocol =
  exports.getOrCreateFinancials =
  exports.getOrCreateMarketDailySnapshot =
  exports.getOrCreateMarketHourlySnapshot =
  exports.getOrCreateUsageMetricsDailySnapshot =
  exports.getOrCreateUsageMetricsHourlySnapshot =
  exports.getOrCreateToken =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const tokens_1 = require("./tokens");
const constants_1 = require("./constants");
const versions_1 = require("../versions");
const utils_1 = require("./utils/utils");
function getOrCreateToken(tokenAddress) {
  let token = schema_1.Token.load(tokenAddress.toHexString());
  // fetch info if null
  if (!token) {
    token = new schema_1.Token(tokenAddress.toHexString());
    token.symbol = (0, tokens_1.fetchTokenSymbol)(tokenAddress);
    token.name = (0, tokens_1.fetchTokenName)(tokenAddress);
    if (
      tokenAddress ==
      graph_ts_1.Address.fromString(constants_1.USD_BTC_ETH_ABRA_ADDRESS)
    ) {
      token.decimals = constants_1.DEFAULT_DECIMALS;
    } else {
      token.decimals = (0, tokens_1.fetchTokenDecimals)(tokenAddress);
    }
    token.lastPriceUSD =
      tokenAddress ==
      graph_ts_1.Address.fromString(
        getMIMAddress(graph_ts_1.dataSource.network())
      )
        ? constants_1.BIGDECIMAL_ONE
        : constants_1.BIGDECIMAL_ZERO;
    token.lastPriceBlockNumber = constants_1.BIGINT_ZERO;
    token.save();
  }
  return token;
}
exports.getOrCreateToken = getOrCreateToken;
///////////////////////////
///////// Metrics /////////
///////////////////////////
function getOrCreateUsageMetricsHourlySnapshot(event) {
  // Number of hours since Unix epoch
  const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
  // Create unique id for the hour
  let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(id.toString());
  if (!usageMetrics) {
    const protocol = getOrCreateLendingProtocol();
    usageMetrics = new schema_1.UsageMetricsHourlySnapshot(id.toString());
    usageMetrics.protocol = getOrCreateLendingProtocol().id;
    usageMetrics.hourlyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetrics.hourlyTransactionCount = 0;
    usageMetrics.hourlyDepositCount = 0;
    usageMetrics.hourlyBorrowCount = 0;
    usageMetrics.hourlyWithdrawCount = 0;
    usageMetrics.hourlyRepayCount = 0;
    usageMetrics.hourlyLiquidateCount = 0;
    usageMetrics.blockNumber = event.block.number;
    usageMetrics.timestamp = event.block.timestamp;
    usageMetrics.save();
  }
  return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot =
  getOrCreateUsageMetricsHourlySnapshot;
function getOrCreateUsageMetricsDailySnapshot(event) {
  // Number of days since Unix epoch
  const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
  // Create unique id for the day
  let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id.toString());
  if (!usageMetrics) {
    const protocol = getOrCreateLendingProtocol();
    usageMetrics = new schema_1.UsageMetricsDailySnapshot(id.toString());
    usageMetrics.protocol = getOrCreateLendingProtocol().id;
    usageMetrics.dailyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetrics.dailyTransactionCount = 0;
    usageMetrics.dailyDepositCount = 0;
    usageMetrics.dailyBorrowCount = 0;
    usageMetrics.dailyWithdrawCount = 0;
    usageMetrics.dailyRepayCount = 0;
    usageMetrics.dailyLiquidateCount = 0;
    usageMetrics.totalPoolCount = 0;
    usageMetrics.blockNumber = event.block.number;
    usageMetrics.timestamp = event.block.timestamp;
    usageMetrics.dailyActiveDepositors = 0;
    usageMetrics.dailyActiveBorrowers = 0;
    usageMetrics.dailyActiveLiquidators = 0;
    usageMetrics.dailyActiveLiquidatees = 0;
    usageMetrics.cumulativeUniqueDepositors =
      protocol.cumulativeUniqueDepositors;
    usageMetrics.cumulativeUniqueBorrowers = protocol.cumulativeUniqueBorrowers;
    usageMetrics.cumulativeUniqueLiquidators =
      protocol.cumulativeUniqueLiquidators;
    usageMetrics.cumulativeUniqueLiquidatees =
      protocol.cumulativeUniqueLiquidatees;
    usageMetrics.save();
  }
  return usageMetrics;
}
exports.getOrCreateUsageMetricsDailySnapshot =
  getOrCreateUsageMetricsDailySnapshot;
function getOrCreateMarketHourlySnapshot(event, marketAddress) {
  const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
  let marketMetrics = schema_1.MarketHourlySnapshot.load(
    marketAddress.concat("-").concat(id.toString())
  );
  if (!marketMetrics) {
    const market = getMarket(marketAddress);
    if (!market) {
      return null;
    }
    marketMetrics = new schema_1.MarketHourlySnapshot(
      marketAddress.concat("-").concat(id.toString())
    );
    marketMetrics.protocol = getOrCreateLendingProtocol().id;
    marketMetrics.market = marketAddress;
    marketMetrics.inputTokenBalance = market.inputTokenBalance;
    marketMetrics.outputTokenSupply = market.outputTokenSupply;
    marketMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
    marketMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketMetrics.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketMetrics.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketMetrics.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    marketMetrics.cumulativeSupplySideRevenueUSD =
      market.cumulativeSupplySideRevenueUSD;
    marketMetrics.cumulativeProtocolSideRevenueUSD =
      market.cumulativeProtocolSideRevenueUSD;
    marketMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketMetrics.exchangeRate = market.exchangeRate;
    marketMetrics.rewardTokenEmissionsAmount =
      market.rewardTokenEmissionsAmount;
    marketMetrics.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    marketMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.rates = (0, utils_1.getSnapshotRates)(
      market.rates,
      (event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR).toString()
    );
    marketMetrics.blockNumber = event.block.number;
    marketMetrics.timestamp = event.block.timestamp;
    marketMetrics.save();
  }
  return marketMetrics;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
function getOrCreateMarketDailySnapshot(event, marketAddress) {
  const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
  let marketMetrics = schema_1.MarketDailySnapshot.load(
    marketAddress.concat("-").concat(id.toString())
  );
  if (!marketMetrics) {
    const market = getMarket(marketAddress);
    if (!market) {
      return null;
    }
    marketMetrics = new schema_1.MarketDailySnapshot(
      marketAddress.concat("-").concat(id.toString())
    );
    marketMetrics.protocol = getOrCreateLendingProtocol().id;
    marketMetrics.market = marketAddress;
    marketMetrics.inputTokenBalance = market.inputTokenBalance;
    marketMetrics.outputTokenSupply = market.outputTokenSupply;
    marketMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
    marketMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketMetrics.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketMetrics.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketMetrics.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    marketMetrics.cumulativeSupplySideRevenueUSD =
      market.cumulativeSupplySideRevenueUSD;
    marketMetrics.cumulativeProtocolSideRevenueUSD =
      market.cumulativeProtocolSideRevenueUSD;
    marketMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketMetrics.exchangeRate = market.exchangeRate;
    marketMetrics.rewardTokenEmissionsAmount =
      market.rewardTokenEmissionsAmount;
    marketMetrics.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    marketMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
    marketMetrics.rates = (0, utils_1.getSnapshotRates)(
      market.rates,
      (event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString()
    );
    marketMetrics.blockNumber = event.block.number;
    marketMetrics.timestamp = event.block.timestamp;
    marketMetrics.save();
  }
  return marketMetrics;
}
exports.getOrCreateMarketDailySnapshot = getOrCreateMarketDailySnapshot;
function getOrCreateFinancials(event) {
  // Number of days since Unix epoch
  const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
  let financialMetrics = schema_1.FinancialsDailySnapshot.load(id.toString());
  if (!financialMetrics) {
    const protocol = getOrCreateLendingProtocol();
    financialMetrics = new schema_1.FinancialsDailySnapshot(id.toString());
    financialMetrics.protocol = getOrCreateLendingProtocol().id;
    financialMetrics.blockNumber = event.block.number;
    financialMetrics.timestamp = event.block.timestamp;
    financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialMetrics.mintedTokenSupplies = protocol.mintedTokenSupplies;
    // Revenue //
    financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeSupplySideRevenueUSD =
      protocol.cumulativeSupplySideRevenueUSD;
    financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeProtocolSideRevenueUSD =
      protocol.cumulativeProtocolSideRevenueUSD;
    financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeTotalRevenueUSD =
      protocol.cumulativeTotalRevenueUSD;
    // Lending Activities //
    financialMetrics.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
    financialMetrics.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
    financialMetrics.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
    financialMetrics.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
    financialMetrics.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.protocolControlledValueUSD =
      protocol.protocolControlledValueUSD;
    financialMetrics.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
    financialMetrics.save();
  }
  return financialMetrics;
}
exports.getOrCreateFinancials = getOrCreateFinancials;
////////////////////////////
///// Lending Specific /////
///////////////////////////
function getOrCreateLendingProtocol() {
  let protocol = schema_1.LendingProtocol.load(
    getBentoBoxAddress(graph_ts_1.dataSource.network())
  );
  if (protocol) {
    return protocol;
  }
  protocol = new schema_1.LendingProtocol(
    getBentoBoxAddress(graph_ts_1.dataSource.network())
  );
  protocol.name = "Abracadabra Money";
  protocol.slug = "abracadabra";
  protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
  protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
  protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
  if (graph_ts_1.dataSource.network() == constants_1.ARB_NETWORK) {
    protocol.network = constants_1.Network.ARBITRUM_ONE;
  } else {
    protocol.network = getNetwork(graph_ts_1.dataSource.network());
  }
  protocol.type = constants_1.ProtocolType.LENDING;
  protocol.riskType = constants_1.RiskType.ISOLATED;
  protocol.cumulativeUniqueUsers = 0;
  protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.lendingType = constants_1.LendingType.CDP;
  protocol.mintedTokens = [getMIMAddress(graph_ts_1.dataSource.network())];
  protocol.totalPoolCount = 0;
  protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.protocolControlledValueUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.marketIDList = [];
  protocol.cumulativeUniqueDepositors = 0;
  protocol.cumulativeUniqueBorrowers = 0;
  protocol.cumulativeUniqueLiquidators = 0;
  protocol.cumulativeUniqueLiquidatees = 0;
  protocol.openPositionCount = 0;
  protocol.cumulativePositionCount = 0;
  protocol.save();
  return protocol;
}
exports.getOrCreateLendingProtocol = getOrCreateLendingProtocol;
function getMarket(marketId) {
  const market = schema_1.Market.load(marketId);
  if (market) {
    return market;
  }
  graph_ts_1.log.error("Cannot find market: {}", [marketId]);
  return null;
}
exports.getMarket = getMarket;
///////////////////////////
///////// Helpers /////////
///////////////////////////
function getLiquidateEvent(event) {
  const liquidateEvent = schema_1.LiquidateProxy.load(
    "liquidate-" +
      event.transaction.hash.toHexString() +
      "-" +
      event.transactionLogIndex.minus(constants_1.BIGINT_ONE).toString()
  );
  if (liquidateEvent) {
    return liquidateEvent;
  }
  return null;
}
exports.getLiquidateEvent = getLiquidateEvent;
function getBentoBoxAddress(network) {
  if (network == constants_1.ETH_NETWORK) {
    return constants_1.BENTOBOX_ADDRESS_MAINNET;
  } else if (network == constants_1.AVALANCHE_NETWORK) {
    return constants_1.BENTOBOX_ADDRESS_AVALANCHE;
  } else if (network == constants_1.ARB_NETWORK) {
    return constants_1.BENTOBOX_ADDRESS_ARBITRUM;
  } else if (network == constants_1.FTM_NETWORK) {
    return constants_1.BENTOBOX_ADDRESS_FANTOM;
  } else if (network == constants_1.BSC_NETWORK) {
    return constants_1.BENTOBOX_ADDRESS_BSC;
  }
  return "";
}
exports.getBentoBoxAddress = getBentoBoxAddress;
function getDegenBoxAddress(network) {
  if (network == constants_1.ETH_NETWORK) {
    return constants_1.DEGENBOX_ADDRESS_MAINNET;
  } else if (network == constants_1.AVALANCHE_NETWORK) {
    return constants_1.DEGENBOX_ADDRESS_AVALANCHE;
  } else if (network == constants_1.ARB_NETWORK) {
    return constants_1.DEGENBOX_ADDRESS_ARBITRUM;
  } else if (network == constants_1.FTM_NETWORK) {
    return constants_1.DEGENBOX_ADDRESS_FANTOM;
  } else if (network == constants_1.BSC_NETWORK) {
    return constants_1.DEGENBOX_ADDRESS_BSC;
  }
  return "";
}
exports.getDegenBoxAddress = getDegenBoxAddress;
function getMIMAddress(network) {
  if (network == constants_1.ETH_NETWORK) {
    return constants_1.MIM_MAINNET;
  } else if (network == constants_1.AVALANCHE_NETWORK) {
    return constants_1.MIM_AVALANCHE;
  } else if (network == constants_1.ARB_NETWORK) {
    return constants_1.MIM_ARBITRUM;
  } else if (network == constants_1.FTM_NETWORK) {
    return constants_1.MIM_FANTOM;
  } else if (network == constants_1.BSC_NETWORK) {
    return constants_1.MIM_BSC;
  }
  return "";
}
exports.getMIMAddress = getMIMAddress;
function getStakedSpellAddress(network) {
  if (network == constants_1.ETH_NETWORK) {
    return constants_1.STAKED_SPELL_MAINNET;
  } else if (network == constants_1.AVALANCHE_NETWORK) {
    return constants_1.STAKED_SPELL_AVALANCHE;
  } else if (network == constants_1.ARB_NETWORK) {
    return constants_1.STAKED_SPELL_ARBITRUM;
  } else if (network == constants_1.FTM_NETWORK) {
    return constants_1.STAKED_SPELL_FANTOM;
  }
  return "";
}
exports.getStakedSpellAddress = getStakedSpellAddress;
function getNetwork(network) {
  if (network == constants_1.ETH_NETWORK) {
    return constants_1.Network.MAINNET;
  } else if (network == constants_1.AVALANCHE_NETWORK) {
    return constants_1.Network.AVALANCHE;
  } else if (network == constants_1.ARB_NETWORK) {
    return constants_1.Network.ARBITRUM_ONE;
  } else if (network == constants_1.FTM_NETWORK) {
    return constants_1.Network.FANTOM;
  } else if (network == constants_1.BSC_NETWORK) {
    return constants_1.Network.BSC;
  }
  return "";
}
exports.getNetwork = getNetwork;
function getOrCreateInterestRate(marketAddress) {
  let interestRate = schema_1.InterestRate.load(
    "BORROWER-" + "STABLE-" + marketAddress
  );
  if (interestRate) {
    return interestRate;
  }
  interestRate = new schema_1.InterestRate(
    "BORROWER-" + "STABLE-" + marketAddress
  );
  interestRate.side = constants_1.InterestRateSide.BORROW;
  interestRate.type = constants_1.InterestRateType.STABLE;
  interestRate.rate = constants_1.BIGDECIMAL_ONE;
  interestRate.save();
  return interestRate;
}
exports.getOrCreateInterestRate = getOrCreateInterestRate;
