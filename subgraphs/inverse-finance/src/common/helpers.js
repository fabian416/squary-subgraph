"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInterestRates = exports.updateMarketEmission = exports.aggregateAllMarkets = exports.updateMarket = exports.updateMarketMetrics = exports.updateStablizerFees = exports.updateRevenue = exports.updateUsageMetrics = exports.updateLiquidate = exports.updateRepay = exports.updateBorrow = exports.updateWithdraw = exports.updateDeposit = exports.createAndIncrementActiveAccount = exports.createAndIncrementAccount = void 0;
const constants_1 = require("./constants");
const CErc20_1 = require("../../generated/templates/CToken/CErc20");
const schema_1 = require("../../generated/schema");
const Factory_1 = require("../../generated/Factory/Factory");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const getters_1 = require("./getters");
const utils_1 = require("./utils");
// Create Account entity for participating account
// return 1 if account is new, 0 if account already exists
function createAndIncrementAccount(accountId) {
    // id: string = address.toHexString()
    let account = schema_1.Account.load(accountId);
    if (account == null) {
        account = new schema_1.Account(accountId);
        account.save();
        return constants_1.INT_ONE;
    }
    return constants_1.INT_ZERO;
}
exports.createAndIncrementAccount = createAndIncrementAccount;
// Create ActiveAccount entity for participating account
// return 1 if account is new on the day, 0 if account already exists
function createAndIncrementActiveAccount(activeAccountId) {
    // id: string = `{Number of days since Unix epoch}-{address}`
    let account = schema_1.ActiveAccount.load(activeAccountId);
    if (account == null) {
        account = new schema_1.ActiveAccount(activeAccountId);
        account.save();
        return constants_1.INT_ONE;
    }
    return constants_1.INT_ZERO;
}
exports.createAndIncrementActiveAccount = createAndIncrementActiveAccount;
// populate deposit entity;
// update
//    - market.cumulativeDepositUSD
//    - protocol.cumulativeDepositUSD
function updateDeposit(event) {
    let depositId = event.transaction.hash.toHexString() + "-" + event.transactionLogIndex.toString();
    let deposit = schema_1.Deposit.load(depositId);
    let pricePerUnderlyingToken = (0, getters_1.getUnderlyingTokenPricePerAmount)(event.address);
    let depositAmount = event.params.mintAmount;
    let depositAmountUSD = depositAmount.toBigDecimal().times(pricePerUnderlyingToken);
    if (deposit == null) {
        deposit = new schema_1.Deposit(depositId);
        deposit.hash = event.transaction.hash.toHexString();
        deposit.logIndex = event.transactionLogIndex.toI32();
        deposit.protocol = constants_1.FACTORY_ADDRESS;
        deposit.to = event.address.toHexString(); //dataSource.address().toHexString()
        deposit.from = event.params.minter.toHexString();
        deposit.blockNumber = event.block.number;
        deposit.timestamp = event.block.timestamp;
        deposit.market = event.address.toHexString();
        deposit.asset = (0, getters_1.getOrCreateUnderlyingToken)(event.address).id;
        deposit.amount = depositAmount;
        deposit.amountUSD = depositAmountUSD;
        deposit.save();
    }
    else {
        graph_ts_1.log.warning("Deposit {} already exists", [depositId]);
    }
    // update Market.cumulativeDepositUSD
    let marketId = event.address.toHexString();
    let market = (0, getters_1.getOrCreateMarket)(marketId, event);
    market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(depositAmountUSD);
    market.save();
    // update protocol.cumulativeDepositUSD
    let protocol = (0, getters_1.getOrCreateProtocol)();
    protocol.cumulativeDepositUSD = protocol.cumulativeDepositUSD.plus(depositAmountUSD);
    protocol.save();
    // update MarketDailySnapshot
    //      - dailyDepositUSD
    //      - cumulativeDepositUSD
    let marketDaily = (0, getters_1.getOrCreateMarketDailySnapshot)(event);
    marketDaily.dailyDepositUSD = marketDaily.dailyDepositUSD.plus(depositAmountUSD);
    marketDaily.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketDaily.blockNumber = event.block.number;
    marketDaily.timestamp = event.block.timestamp;
    marketDaily.save();
    // update MarketHourlySnapshot
    //      - hourlyDepositUSD
    //      - cumulativeDepositUSD
    let marketHourly = (0, getters_1.getOrCreateMarketHourlySnapshot)(event);
    marketHourly.hourlyDepositUSD = marketHourly.hourlyDepositUSD.plus(depositAmountUSD);
    marketHourly.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketHourly.blockNumber = event.block.number;
    marketHourly.timestamp = event.block.timestamp;
    marketHourly.save();
    // update FinancialsDailySnapshot
    //      - dailyDepositUSD
    //      - cumulativeDepositUSD
    let financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    financialMetrics.dailyDepositUSD = financialMetrics.dailyDepositUSD.plus(depositAmountUSD);
    financialMetrics.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
    financialMetrics.blockNumber = event.block.number;
    financialMetrics.timestamp = event.block.timestamp;
    financialMetrics.save();
    // update usage metric
    let usageDailyMetrics = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
    usageDailyMetrics.dailyDepositCount += 1;
    usageDailyMetrics.dailyTransactionCount += 1;
    usageDailyMetrics.save();
    let usageHourlyMetrics = (0, getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
    usageHourlyMetrics.hourlyDepositCount += 1;
    usageHourlyMetrics.hourlyTransactionCount += 1;
    usageHourlyMetrics.save();
}
exports.updateDeposit = updateDeposit;
function updateWithdraw(event) {
    let withdrawId = event.transaction.hash.toHexString() + "-" + event.transactionLogIndex.toString();
    let withdraw = schema_1.Withdraw.load(withdrawId);
    if (withdraw == null) {
        let pricePerToken = (0, getters_1.getUnderlyingTokenPricePerAmount)(event.address);
        withdraw = new schema_1.Withdraw(withdrawId);
        withdraw.hash = event.transaction.hash.toHexString();
        withdraw.logIndex = event.transactionLogIndex.toI32();
        withdraw.protocol = constants_1.FACTORY_ADDRESS;
        withdraw.to = event.params.redeemer.toHexString();
        withdraw.from = event.address.toHexString(); //dataSource.address().toHexString()
        withdraw.blockNumber = event.block.number;
        withdraw.timestamp = event.block.timestamp;
        withdraw.market = event.address.toHexString();
        withdraw.asset = (0, getters_1.getOrCreateUnderlyingToken)(event.address).id;
        withdraw.amount = event.params.redeemAmount;
        withdraw.amountUSD = withdraw.amount.toBigDecimal().times(pricePerToken);
        withdraw.save();
    }
    else {
        graph_ts_1.log.warning("Withdraw {} already exists", [withdrawId]);
    }
    let marketDaily = (0, getters_1.getOrCreateMarketDailySnapshot)(event);
    marketDaily.dailyWithdrawUSD = marketDaily.dailyWithdrawUSD.plus(withdraw.amountUSD);
    marketDaily.blockNumber = event.block.number;
    marketDaily.timestamp = event.block.timestamp;
    marketDaily.save();
    let marketHourly = (0, getters_1.getOrCreateMarketHourlySnapshot)(event);
    marketHourly.hourlyWithdrawUSD = marketHourly.hourlyWithdrawUSD.plus(withdraw.amountUSD);
    marketHourly.blockNumber = event.block.number;
    marketHourly.timestamp = event.block.timestamp;
    marketHourly.save();
    let financialSnapshot = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    financialSnapshot.dailyWithdrawUSD = financialSnapshot.dailyWithdrawUSD.plus(withdraw.amountUSD);
    financialSnapshot.save();
    // update usage metric
    let usageDailyMetrics = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
    usageDailyMetrics.dailyWithdrawCount += 1;
    usageDailyMetrics.dailyTransactionCount += 1;
    usageDailyMetrics.save();
    let usageHourlyMetrics = (0, getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
    usageHourlyMetrics.hourlyWithdrawCount += 1;
    usageHourlyMetrics.hourlyTransactionCount += 1;
    usageHourlyMetrics.save();
}
exports.updateWithdraw = updateWithdraw;
function updateBorrow(event) {
    let borrowId = event.transaction.hash.toHexString() + "-" + event.transactionLogIndex.toString();
    let borrow = schema_1.Borrow.load(borrowId);
    let pricePerUnderlyingToken = (0, getters_1.getUnderlyingTokenPricePerAmount)(event.address);
    let borrowAmount = event.params.borrowAmount;
    let borrowAmountUSD = borrowAmount.toBigDecimal().times(pricePerUnderlyingToken);
    if (borrow == null) {
        borrow = new schema_1.Borrow(borrowId);
        borrow.hash = event.transaction.hash.toHexString();
        borrow.logIndex = event.transactionLogIndex.toI32();
        borrow.protocol = constants_1.FACTORY_ADDRESS;
        borrow.to = event.params.borrower.toHexString();
        borrow.from = event.address.toHexString(); //dataSource.address().toHexString()
        borrow.blockNumber = event.block.number;
        borrow.timestamp = event.block.timestamp;
        borrow.market = event.address.toHexString();
        borrow.asset = (0, getters_1.getOrCreateUnderlyingToken)(event.address).id;
        borrow.amount = borrowAmount;
        borrow.amountUSD = borrowAmountUSD;
        borrow.save();
    }
    else {
        graph_ts_1.log.warning("Borrow {} already exists", [borrowId]);
    }
    // update Market.cumulativeBorrowUSD
    let marketId = event.address.toHexString();
    let market = (0, getters_1.getOrCreateMarket)(marketId, event);
    market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(borrowAmountUSD);
    market.save();
    // update protocol.cumulativeBorrowUSD
    let protocol = (0, getters_1.getOrCreateProtocol)();
    // protocol.totalBorrowBalanceUSD updated in aggregateAllMarkets()
    protocol.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD.plus(borrowAmountUSD);
    protocol.save();
    // update MarketDailySnapshot
    //      - dailyBorrowUSD
    //      - cumulativeBorrowUSD
    let marketDaily = (0, getters_1.getOrCreateMarketDailySnapshot)(event);
    marketDaily.dailyBorrowUSD = marketDaily.dailyBorrowUSD.plus(borrowAmountUSD);
    marketDaily.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketDaily.blockNumber = event.block.number;
    marketDaily.timestamp = event.block.timestamp;
    marketDaily.save();
    // update MarketHourlySnapshot
    //      - hourlyBorrowUSD
    //      - cumulativeBorrowUSD
    let marketHourly = (0, getters_1.getOrCreateMarketHourlySnapshot)(event);
    marketHourly.hourlyBorrowUSD = marketHourly.hourlyBorrowUSD.plus(borrowAmountUSD);
    marketHourly.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketHourly.blockNumber = event.block.number;
    marketHourly.timestamp = event.block.timestamp;
    marketHourly.save();
    // update FinancialsDailySnapshot
    //      - dailyBorrowUSD
    //      - cumulativeBorrowUSD
    let financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    financialMetrics.dailyBorrowUSD = financialMetrics.dailyBorrowUSD.plus(borrowAmountUSD);
    financialMetrics.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
    financialMetrics.save();
    // update usage metric
    let usageDailyMetrics = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
    usageDailyMetrics.dailyBorrowCount += 1;
    usageDailyMetrics.dailyTransactionCount += 1;
    usageDailyMetrics.save();
    let usageHourlyMetrics = (0, getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
    usageHourlyMetrics.hourlyBorrowCount += 1;
    usageHourlyMetrics.hourlyTransactionCount += 1;
    usageHourlyMetrics.save();
}
exports.updateBorrow = updateBorrow;
function updateRepay(event) {
    let repayId = event.transaction.hash.toHexString() + "-" + event.transactionLogIndex.toString();
    let repay = schema_1.Repay.load(repayId);
    if (repay == null) {
        let pricePerToken = (0, getters_1.getUnderlyingTokenPricePerAmount)(event.address);
        repay = new schema_1.Repay(repayId);
        repay.hash = event.transaction.hash.toHexString();
        repay.logIndex = event.transactionLogIndex.toI32();
        repay.protocol = constants_1.FACTORY_ADDRESS;
        repay.to = event.address.toHexString();
        repay.from = event.params.payer.toHexString(); //dataSource.address().toHexString()
        repay.blockNumber = event.block.number;
        repay.timestamp = event.block.timestamp;
        repay.market = event.address.toHexString();
        repay.asset = (0, getters_1.getOrCreateUnderlyingToken)(event.address).id;
        repay.amount = event.params.repayAmount;
        repay.amountUSD = repay.amount.toBigDecimal().times(pricePerToken);
        repay.save();
    }
    else {
        graph_ts_1.log.warning("Repay {} already exists", [repayId]);
    }
    let marketDaily = (0, getters_1.getOrCreateMarketDailySnapshot)(event);
    marketDaily.dailyRepayUSD = marketDaily.dailyRepayUSD.plus(repay.amountUSD);
    marketDaily.blockNumber = event.block.number;
    marketDaily.timestamp = event.block.timestamp;
    marketDaily.save();
    let marketHourly = (0, getters_1.getOrCreateMarketHourlySnapshot)(event);
    marketHourly.hourlyRepayUSD = marketHourly.hourlyRepayUSD.plus(repay.amountUSD);
    marketHourly.blockNumber = event.block.number;
    marketHourly.timestamp = event.block.timestamp;
    marketHourly.save();
    let financialSnapshot = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    financialSnapshot.dailyRepayUSD = financialSnapshot.dailyRepayUSD.plus(repay.amountUSD);
    financialSnapshot.save();
    // update usage metric
    let usageDailyMetrics = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
    usageDailyMetrics.dailyRepayCount += 1;
    usageDailyMetrics.dailyTransactionCount += 1;
    usageDailyMetrics.save();
    let usageHourlyMetrics = (0, getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
    usageHourlyMetrics.hourlyRepayCount += 1;
    usageHourlyMetrics.hourlyTransactionCount += 1;
    usageHourlyMetrics.save();
}
exports.updateRepay = updateRepay;
function updateLiquidate(event) {
    let liquidateId = event.transaction.hash.toHexString() + "-" + event.transactionLogIndex.toString();
    let liquidate = schema_1.Liquidate.load(liquidateId);
    let pricePerUnderlyingToken = (0, getters_1.getUnderlyingTokenPricePerAmount)(event.address);
    let pricePerCollateralToken = (0, getters_1.getUnderlyingTokenPrice)(event.params.cTokenCollateral);
    let cTokenCollateral = (0, getters_1.getOrCreateToken)(event.params.cTokenCollateral);
    // get exchangeRate for collateral token
    let collateralMarketId = event.params.cTokenCollateral.toHexString();
    let collateralMarket = (0, getters_1.getOrCreateMarket)(collateralMarketId, event);
    let exchangeRate = collateralMarket.exchangeRate;
    let liquidateAmount = event.params.seizeTokens;
    let liquidateAmountUSD = (0, utils_1.bigIntToBDUseDecimals)(liquidateAmount, cTokenCollateral.decimals)
        .times(exchangeRate)
        .times(pricePerCollateralToken);
    if (liquidate == null) {
        liquidate = new schema_1.Liquidate(liquidateId);
        liquidate.hash = event.transaction.hash.toHexString();
        liquidate.logIndex = event.transactionLogIndex.toI32();
        liquidate.protocol = constants_1.FACTORY_ADDRESS;
        liquidate.to = event.address.toHexString();
        liquidate.from = event.params.liquidator.toHexString();
        liquidate.liquidatee = event.params.borrower.toHexString();
        liquidate.blockNumber = event.block.number;
        liquidate.timestamp = event.block.timestamp;
        liquidate.market = event.address.toHexString();
        liquidate.asset = event.params.cTokenCollateral.toHexString();
        liquidate.amount = liquidateAmount;
        liquidate.amountUSD = liquidateAmountUSD;
        let repayAmountUSD = event.params.repayAmount.toBigDecimal().times(pricePerUnderlyingToken);
        liquidate.profitUSD = liquidate.amountUSD.minus(repayAmountUSD);
        liquidate.save();
    }
    else {
        graph_ts_1.log.warning("Liquidate {} already exists", [liquidateId]);
    }
    // update market.cumulativeLiquidateUSD
    let marketId = event.address.toHexString();
    let market = (0, getters_1.getOrCreateMarket)(marketId, event);
    market.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD.plus(liquidateAmountUSD);
    market.save();
    // update protocol.cumulativeLiquidateUSD
    let protocol = (0, getters_1.getOrCreateProtocol)();
    protocol.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD.plus(liquidateAmountUSD);
    protocol.save();
    // update MarketDailySnapshot
    //      - dailyLiquidateUSD
    //      - cumulativeLiquidateUSD
    let marketDaily = (0, getters_1.getOrCreateMarketDailySnapshot)(event);
    marketDaily.dailyLiquidateUSD = marketDaily.dailyLiquidateUSD.plus(liquidateAmountUSD);
    marketDaily.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketDaily.blockNumber = event.block.number;
    marketDaily.timestamp = event.block.timestamp;
    marketDaily.save();
    // update MarketHourlySnapshot
    //      - hourlyLiquidateUSD
    //      - cumulativeLiquidateUSD
    let marketHourly = (0, getters_1.getOrCreateMarketHourlySnapshot)(event);
    marketHourly.hourlyLiquidateUSD = marketHourly.hourlyLiquidateUSD.plus(liquidateAmountUSD);
    marketHourly.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketHourly.blockNumber = event.block.number;
    marketHourly.timestamp = event.block.timestamp;
    marketHourly.save();
    // update FinancialsDailySnapshot
    //      - dailyLiquidateUSD
    //      - cumulativeLiquidateUSD
    let financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    financialMetrics.dailyLiquidateUSD = financialMetrics.dailyLiquidateUSD.plus(liquidateAmountUSD);
    financialMetrics.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
    financialMetrics.blockNumber = event.block.number;
    financialMetrics.timestamp = event.block.timestamp;
    financialMetrics.save();
    // update usage metric
    let usageDailyMetrics = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
    usageDailyMetrics.dailyLiquidateCount += 1;
    usageDailyMetrics.dailyTransactionCount += 1;
    usageDailyMetrics.blockNumber = event.block.number;
    usageDailyMetrics.timestamp = event.block.timestamp;
    usageDailyMetrics.save();
    let usageHourlyMetrics = (0, getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
    usageHourlyMetrics.hourlyLiquidateCount += 1;
    usageHourlyMetrics.hourlyTransactionCount += 1;
    usageHourlyMetrics.blockNumber = event.block.number;
    usageHourlyMetrics.timestamp = event.block.timestamp;
    usageHourlyMetrics.save();
}
exports.updateLiquidate = updateLiquidate;
// Update
//    - UsageMetricsDailySnapshots
//    - UsageMetricsHourlySnapshot
//    - LendingProtocol.cumulativeUniqueUsers
function updateUsageMetrics(event, user) {
    // Days since Unix epoch time
    let days = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    // Hours since Unix epoch time
    let hours = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    let accountId = user.toHexString();
    let dailyActiveAccountId = "daily-" + accountId + "-" + days.toString();
    let hourlyActiveAccountId = "hourly-" + accountId + "-" + "-" + hours.toString();
    // Account entity keeps user addresses
    let isNewUniqueUser = createAndIncrementAccount(accountId);
    let isNewDailyActiveUser = createAndIncrementActiveAccount(dailyActiveAccountId);
    let isNewHourlyActiveUser = createAndIncrementActiveAccount(hourlyActiveAccountId);
    // update LendingProtocol.cumulativeUniqueUsers
    let protocol = (0, getters_1.getOrCreateProtocol)();
    if (protocol == null) {
        graph_ts_1.log.error("LendingProtocol entity is null{}; something went wrong", [""]);
    }
    protocol.cumulativeUniqueUsers += isNewUniqueUser;
    protocol.save();
    let usageDailyMetrics = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
    usageDailyMetrics.dailyActiveUsers += isNewDailyActiveUser;
    usageDailyMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    //usageDailyMetrics.dailyTransactionCount += 1; //increment whenever updateUsageMetrics is called
    // Update the block number and timestamp to that of the last transaction of that day
    usageDailyMetrics.blockNumber = event.block.number;
    usageDailyMetrics.timestamp = event.block.timestamp;
    usageDailyMetrics.save();
    let usageHourlyMetrics = (0, getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
    usageHourlyMetrics.hourlyActiveUsers += isNewHourlyActiveUser;
    usageHourlyMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageHourlyMetrics.hourlyTransactionCount += 1; //increment whenever updateUsageMetrics is called
    // Update the block number and timestamp to that of the last transaction of that day
    usageHourlyMetrics.blockNumber = event.block.number;
    usageHourlyMetrics.timestamp = event.block.timestamp;
    usageHourlyMetrics.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
function updateRevenue(event, newProtocolRevenueUSD = constants_1.BIGDECIMAL_ZERO, newTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO) {
    let protocol = (0, getters_1.getOrCreateProtocol)();
    protocol.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD.plus(newTotalRevenueUSD);
    protocol.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD.plus(newProtocolRevenueUSD);
    protocol.cumulativeSupplySideRevenueUSD = protocol.cumulativeTotalRevenueUSD.minus(protocol.cumulativeProtocolSideRevenueUSD);
    protocol.save();
    let marketID = event.address.toHexString();
    let market = (0, getters_1.getOrCreateMarket)(marketID, event);
    let newSupplySideRevenueUSD = newTotalRevenueUSD.minus(newProtocolRevenueUSD);
    market.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD.plus(newTotalRevenueUSD);
    market.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
    market.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD.plus(newProtocolRevenueUSD);
    market.save();
    let marketDaily = (0, getters_1.getOrCreateMarketDailySnapshot)(event);
    marketDaily.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    marketDaily.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD;
    marketDaily.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD;
    marketDaily.dailyTotalRevenueUSD = marketDaily.dailyTotalRevenueUSD.plus(newTotalRevenueUSD);
    marketDaily.dailyProtocolSideRevenueUSD = marketDaily.dailyProtocolSideRevenueUSD.plus(newProtocolRevenueUSD);
    marketDaily.dailySupplySideRevenueUSD = marketDaily.dailySupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
    marketDaily.save();
    let marketHourly = (0, getters_1.getOrCreateMarketHourlySnapshot)(event);
    marketHourly.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    marketHourly.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD;
    marketHourly.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD;
    marketHourly.hourlyTotalRevenueUSD = marketHourly.hourlyTotalRevenueUSD.plus(newTotalRevenueUSD);
    marketHourly.hourlyProtocolSideRevenueUSD = marketHourly.hourlyProtocolSideRevenueUSD.plus(newProtocolRevenueUSD);
    marketHourly.hourlySupplySideRevenueUSD = marketHourly.hourlySupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
    marketHourly.save();
    let financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    financialMetrics.dailyTotalRevenueUSD = financialMetrics.dailyTotalRevenueUSD.plus(newTotalRevenueUSD);
    financialMetrics.dailyProtocolSideRevenueUSD = financialMetrics.dailyProtocolSideRevenueUSD.plus(newProtocolRevenueUSD);
    financialMetrics.dailySupplySideRevenueUSD = financialMetrics.dailyTotalRevenueUSD.minus(financialMetrics.dailyProtocolSideRevenueUSD);
    financialMetrics.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
    financialMetrics.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD;
    financialMetrics.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD;
    financialMetrics.blockNumber = event.block.number;
    financialMetrics.timestamp = event.block.timestamp;
    financialMetrics.save();
}
exports.updateRevenue = updateRevenue;
// Add fees from Stablizer to protocolSideRevenue and totalRevenue
//    - protocol.cumulativeProtocolSideRevenueUSD
//    - protocol.cumulativeTotalRevenueUSD
//    - FinancialsDailySnapshot.dailyProtocolSideRevenueUSD
//    - FinancialsDailySnapshot.cumulativeProtocolSideRevenueUSD
//    - FinancialsDailySnapshot.dailyTotalRevenueUSD
//    - FinancialsDailySnapshot.cumulativeTotalRevenueUSD
function updateStablizerFees(feesUSD, event) {
    let protocol = (0, getters_1.getOrCreateProtocol)();
    let cumulativePRev = protocol.cumulativeProtocolSideRevenueUSD;
    let cumulativeTRev = protocol.cumulativeTotalRevenueUSD;
    cumulativePRev = cumulativePRev.plus(feesUSD);
    cumulativeTRev = cumulativeTRev.plus(feesUSD);
    protocol.cumulativeProtocolSideRevenueUSD = cumulativePRev;
    protocol.cumulativeTotalRevenueUSD = cumulativeTRev;
    protocol.save();
    let financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    financialMetrics.cumulativeProtocolSideRevenueUSD = cumulativePRev;
    financialMetrics.cumulativeTotalRevenueUSD = cumulativeTRev;
    financialMetrics.dailyProtocolSideRevenueUSD = financialMetrics.dailyProtocolSideRevenueUSD.plus(feesUSD);
    financialMetrics.dailyTotalRevenueUSD = financialMetrics.dailyTotalRevenueUSD.plus(feesUSD);
    financialMetrics.save();
}
exports.updateStablizerFees = updateStablizerFees;
// Update MarketDailySnapshot and MarketHourlySnapshot
function updateMarketMetrics(event) {
    let marketId = event.address.toHexString();
    let market = (0, getters_1.getOrCreateMarket)(marketId, event);
    let marketDaily = (0, getters_1.getOrCreateMarketDailySnapshot)(event);
    let days = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    let dailySnapshotRates = (0, getters_1.getSnapshotRates)(market.rates, days.toString());
    // use market entity to update MarketMetrics
    marketDaily.rates = dailySnapshotRates;
    marketDaily.totalValueLockedUSD = market.totalValueLockedUSD;
    marketDaily.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketDaily.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketDaily.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketDaily.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketDaily.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketDaily.inputTokenBalance = market.inputTokenBalance;
    marketDaily.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketDaily.outputTokenSupply = market.outputTokenSupply;
    marketDaily.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketDaily.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    marketDaily.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    marketDaily.exchangeRate = market.exchangeRate;
    // Update the block number and timestamp to that of the last transaction of that day
    marketDaily.blockNumber = event.block.number;
    marketDaily.timestamp = event.block.timestamp;
    marketDaily.save();
    let marketHourly = (0, getters_1.getOrCreateMarketHourlySnapshot)(event);
    let hours = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    let hourlySnapshotRates = (0, getters_1.getSnapshotRates)(market.rates, hours.toString());
    // use market entity to update MarketMetrics
    marketHourly.rates = hourlySnapshotRates;
    marketHourly.totalValueLockedUSD = market.totalValueLockedUSD;
    marketHourly.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketHourly.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketHourly.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketHourly.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketHourly.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketHourly.inputTokenBalance = market.inputTokenBalance;
    marketHourly.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketHourly.outputTokenSupply = market.outputTokenSupply;
    marketHourly.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketHourly.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    marketHourly.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    marketHourly.exchangeRate = market.exchangeRate;
    // Update the block number and timestamp to that of the last transaction of that day
    marketHourly.blockNumber = event.block.number;
    marketHourly.timestamp = event.block.timestamp;
    marketHourly.save();
}
exports.updateMarketMetrics = updateMarketMetrics;
// Update Market entity
function updateMarket(event, borrowAmount = constants_1.BIGINT_ZERO) {
    // event must be emitted by a CToken/Market contract
    let marketId = event.address.toHexString();
    // alternatively, get marketId from dataSource.address
    let markets = Factory_1.Factory.bind(graph_ts_1.Address.fromString(constants_1.FACTORY_ADDRESS)).getAllMarkets();
    assert(markets.includes(event.address), "Event not emitted by a CToken contract");
    let market = (0, getters_1.getOrCreateMarket)(marketId, event);
    if (market != null) {
        let tokenContract = CErc20_1.CErc20.bind(event.address);
        let inputToken = (0, getters_1.getOrCreateUnderlyingToken)(event.address);
        let outputToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.outputToken));
        // To get the price of the underlying (input) token
        let inputTokenPriceUSD = (0, getters_1.getUnderlyingTokenPrice)(event.address);
        let decimals = (0, getters_1.getOrCreateUnderlyingToken)(event.address).decimals;
        let inputTokenPriceUSDperAmount = inputTokenPriceUSD.div((0, utils_1.decimalsToBigDecimal)(decimals));
        let inputTokenBalance = tokenContract.getCash();
        market.inputTokenBalance = inputTokenBalance;
        market.inputTokenPriceUSD = inputTokenPriceUSD;
        market.outputTokenSupply = tokenContract.totalSupply();
        market.totalDepositBalanceUSD = inputTokenBalance.toBigDecimal().times(inputTokenPriceUSDperAmount);
        market.totalValueLockedUSD = market.totalDepositBalanceUSD;
        // Needs to use try_totalBorrows() as some market doesn't have totalBorows & default to BIGDECIMAL_ZERO
        let tryTotalBorrows = tokenContract.try_totalBorrows();
        if (tryTotalBorrows.reverted) {
            graph_ts_1.log.warning("Failed to get totalBorrows for market {} at tx hash {}; Not updating Market.totalBorrowBalanceUSD", [
                marketId,
                event.transaction.hash.toHexString(),
            ]);
        }
        else {
            market.totalBorrowBalanceUSD = tryTotalBorrows.value.toBigDecimal().times(inputTokenPriceUSDperAmount);
        }
        let tryExchangeRate = tokenContract.try_exchangeRateCurrent();
        let exchangeRate = null;
        if (!tryExchangeRate.reverted) {
            exchangeRate = tryExchangeRate.value;
        }
        else {
            graph_ts_1.log.warning("Failed to get current exchangeRate for market {} at tx hash {}, use exhangeRateStored instead", [
                marketId,
                event.transaction.hash.toHexString(),
            ]);
            exchangeRate = tokenContract.exchangeRateCurrent();
        }
        market.exchangeRate = (0, utils_1.bigIntToBDUseDecimals)(exchangeRate, constants_1.MANTISSA_DECIMALS + inputToken.decimals - outputToken.decimals);
        // derive outputToken (cToken) price from exchange rate and inputTokenPriceUSD
        if (market.exchangeRate) {
            market.outputTokenPriceUSD = inputTokenPriceUSD.times(market.exchangeRate);
        }
        //
        //RewardEmission are updated in updateMarketEmission() &
        // triggered by comptroller.DistributedBorrowerComp and
        // DistributedSupplierComp
        //market.rewardTokenEmissionsAmount
        //market.rewardTokenEmissionsUSD
        market.save();
    }
    else {
        graph_ts_1.log.error("Market {} does not exist", [marketId]);
    }
}
exports.updateMarket = updateMarket;
// Iterate all markets & update aggregated quantities
//    - LendindProtocol
//    - FinancialsDailySnapshot
function aggregateAllMarkets(event) {
    let factoryContract = Factory_1.Factory.bind(graph_ts_1.Address.fromString(constants_1.FACTORY_ADDRESS));
    let marketAddrs = factoryContract.getAllMarkets();
    // iterate over AllMarkets
    let totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    let totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < marketAddrs.length; i++) {
        let marketId = marketAddrs[i].toHexString();
        let market = schema_1.Market.load(marketId);
        if (market != null) {
            totalDepositBalanceUSD = totalDepositBalanceUSD.plus(market.totalDepositBalanceUSD);
            totalBorrowBalanceUSD = totalBorrowBalanceUSD.plus(market.totalBorrowBalanceUSD);
        }
    }
    let protocol = (0, getters_1.getOrCreateProtocol)();
    if (protocol == null) {
        graph_ts_1.log.error("LendingProtocol entity is empty {}; something went wrong", [""]);
    }
    protocol.totalDepositBalanceUSD = totalDepositBalanceUSD;
    protocol.totalValueLockedUSD = totalDepositBalanceUSD;
    protocol.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
    protocol.save();
    let financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    financialMetrics.totalDepositBalanceUSD = totalDepositBalanceUSD;
    financialMetrics.totalValueLockedUSD = totalDepositBalanceUSD;
    financialMetrics.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
    financialMetrics.blockNumber = event.block.number;
    financialMetrics.timestamp = event.block.timestamp;
    financialMetrics.save();
}
exports.aggregateAllMarkets = aggregateAllMarkets;
function updateMarketEmission(marketId, newEmissionAmount, event) {
    let market = (0, getters_1.getOrCreateMarket)(marketId, event);
    if (market == null) {
        graph_ts_1.log.error("Market {} does not exist.", [marketId]);
        return;
    }
    let pricePerToken = (0, getters_1.getUnderlyingTokenPricePerAmount)(graph_ts_1.Address.fromString(constants_1.XINV_ADDRESS));
    // Retrieve & store last block number to calculate deltaBlocks & approximate normalized daily emissions
    // This is not exactly how inverse-finance actually calculate emissions (COMP), but a reasonable approximation
    // The contract uses deltaIndex & multiplies it with the borrow/deposit amount (comptroller.sol Line 1107-1150)
    // The deltaIndex is tied to deltaBlocks (comptroller.sol Line 1084-1105) & compSpeed
    let lastBlockNumbers = [constants_1.EMISSION_START_BLOCK, constants_1.EMISSION_START_BLOCK]; // Creation of factory
    let lastBlockStore = schema_1._HelperStore.load("lastBlockNumber");
    if (lastBlockStore != null && lastBlockStore.valueBigIntArray.length > 0) {
        lastBlockNumbers = lastBlockStore.valueBigIntArray;
    }
    else {
        lastBlockStore = new schema_1._HelperStore("lastBlockNumber");
        lastBlockStore.valueBigIntArray = lastBlockNumbers;
        lastBlockStore.save();
    }
    let rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    let rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    let deltaBlocks;
    for (let i = 0; i < newEmissionAmount.length; i++) {
        if (newEmissionAmount[i] != constants_1.BIGINT_ZERO) {
            let lastBlockNumber = lastBlockNumbers[i];
            assert(lastBlockNumber >= constants_1.EMISSION_START_BLOCK, "last block number should be larger than " + constants_1.EMISSION_START_BLOCK.toString());
            deltaBlocks = event.block.number.minus(lastBlockNumber).plus(constants_1.BIGINT_ONE);
            let dailyEmissionsAmount = newEmissionAmount[i]
                .toBigDecimal()
                .div(deltaBlocks.toBigDecimal())
                .times(constants_1.BLOCKS_PER_DAY);
            let dailyEmissionsUSD = dailyEmissionsAmount.times(pricePerToken);
            rewardTokenEmissionsAmount[i] = (0, utils_1.BigDecimalTruncateToBigInt)(dailyEmissionsAmount);
            graph_ts_1.log.info("Market {} emissions {} ({}) at tx hash {}", [
                marketId,
                dailyEmissionsAmount.toString(),
                (0, utils_1.BigDecimalTruncateToBigInt)(dailyEmissionsAmount).toString(),
                event.transaction.hash.toHexString(),
            ]);
            rewardTokenEmissionsUSD[i] = dailyEmissionsUSD;
            lastBlockNumbers[i] = event.block.number;
        }
    }
    market.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
    market.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
    market.save();
    lastBlockStore.valueBigIntArray = lastBlockNumbers;
    lastBlockStore.save();
}
exports.updateMarketEmission = updateMarketEmission;
// Update InterestRate entity
function updateInterestRates(event) {
    let marketId = event.address.toHexString();
    graph_ts_1.log.info("Updating rates for Market {} at tx hash {} ...", [marketId, event.transaction.hash.toHexString()]);
    let borrowerInterestRate = (0, getters_1.getOrCreateInterestRate)(null, constants_1.InterestRateSide.BORROWER, constants_1.InterestRateType.VARIABLE, marketId);
    let lenderInterestRate = (0, getters_1.getOrCreateInterestRate)(null, constants_1.InterestRateSide.LENDER, constants_1.InterestRateType.VARIABLE, marketId);
    if (borrowerInterestRate == null) {
        graph_ts_1.log.error("Borrower InterestRate for market {} does not exist.", [marketId]);
    }
    if (lenderInterestRate == null) {
        graph_ts_1.log.error("Lender InterestRate for market {} does not exist.", [marketId]);
    }
    let tokenContract = CErc20_1.CErc20.bind(event.address);
    let tryBorrowRate = tokenContract.try_borrowRatePerBlock();
    let tryDepositRate = tokenContract.try_supplyRatePerBlock();
    if (tryBorrowRate.reverted) {
        graph_ts_1.log.warning("Failed to get borrowRatePerBlock() for Market {} at tx hash {}", [
            marketId,
            event.transaction.hash.toHexString(),
        ]);
    }
    else {
        borrowerInterestRate.rate = tryBorrowRate.value
            .toBigDecimal()
            .times(constants_1.BLOCKS_PER_YEAR)
            .div((0, utils_1.decimalsToBigDecimal)(constants_1.MANTISSA_DECIMALS))
            .times(constants_1.BIGDECIMAL_HUNDRED);
    }
    if (tryDepositRate.reverted) {
        graph_ts_1.log.warning("Failed to get supplyRatePerBlock() for Market {} at tx hash {}", [
            marketId,
            event.transaction.hash.toHexString(),
        ]);
    }
    else {
        lenderInterestRate.rate = tryDepositRate.value
            .toBigDecimal()
            .times(constants_1.BLOCKS_PER_YEAR)
            .div((0, utils_1.decimalsToBigDecimal)(constants_1.MANTISSA_DECIMALS))
            .times(constants_1.BIGDECIMAL_HUNDRED);
    }
    borrowerInterestRate.save();
    lenderInterestRate.save();
    let rates = [borrowerInterestRate.id, lenderInterestRate.id];
    let market = (0, getters_1.getOrCreateMarket)(marketId, event);
    market.rates = rates;
    market.save();
    let dailySnapshot = (0, getters_1.getOrCreateMarketDailySnapshot)(event);
    let days = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    let dailySnapshotRates = (0, getters_1.getSnapshotRates)(rates, days.toString());
    dailySnapshot.rates = dailySnapshotRates;
    dailySnapshot.save();
    let hourlySnapshot = (0, getters_1.getOrCreateMarketHourlySnapshot)(event);
    let hours = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    let hourlySnapshotRates = (0, getters_1.getSnapshotRates)(rates, hours.toString());
    hourlySnapshot.rates = hourlySnapshotRates;
    hourlySnapshot.save();
}
exports.updateInterestRates = updateInterestRates;
