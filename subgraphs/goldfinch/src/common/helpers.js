"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMigratedTranchedPool = exports.snapshotPosition = exports.updatePosition = exports.snapshotMarket = exports.updateUsageMetrics = exports.snapshotFinancials = exports.updateRevenues = exports.createTransaction = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const getters_1 = require("./getters");
const constants_1 = require("./constants");
const schema_1 = require("../../generated/schema");
const schema_2 = require("../../generated/schema");
const constants_2 = require("./constants");
const MigratedTranchedPool_1 = require("../../generated/GoldfinchFactory/MigratedTranchedPool");
function createTransaction(transactionType, market, accountID, positionID, amount, amountUSD, event) {
    const hash = event.transaction.hash.toHexString();
    const logIndex = event.logIndex;
    const id = `${hash}-${logIndex}`;
    //NOT allowed: let entity: Borrow | Deposit | Repay | Withdraw;
    if (transactionType == constants_2.TransactionType.BORROW) {
        const entity = new schema_2.Borrow(id);
        entity.hash = hash;
        entity.logIndex = logIndex.toI32();
        entity.nonce = event.transaction.nonce;
        entity.market = market.id;
        entity.asset = market.inputToken;
        entity.account = accountID;
        entity.position = positionID;
        entity.amount = amount;
        entity.amountUSD = amountUSD;
        entity.timestamp = event.block.timestamp;
        entity.blockNumber = event.block.timestamp;
        entity.save();
    }
    else if (transactionType == constants_2.TransactionType.DEPOSIT) {
        const entity = new schema_2.Deposit(id);
        entity.hash = hash;
        entity.logIndex = logIndex.toI32();
        entity.nonce = event.transaction.nonce;
        entity.market = market.id;
        entity.asset = market.inputToken;
        entity.account = accountID;
        entity.position = positionID;
        entity.amount = amount;
        entity.amountUSD = amountUSD;
        entity.timestamp = event.block.timestamp;
        entity.blockNumber = event.block.timestamp;
        entity.save();
    }
    else if (transactionType == constants_2.TransactionType.REPAY) {
        const entity = new schema_2.Repay(id);
        entity.hash = hash;
        entity.logIndex = logIndex.toI32();
        entity.nonce = event.transaction.nonce;
        entity.market = market.id;
        entity.asset = market.inputToken;
        entity.account = accountID;
        entity.position = positionID;
        entity.amount = amount;
        entity.amountUSD = amountUSD;
        entity.timestamp = event.block.timestamp;
        entity.blockNumber = event.block.timestamp;
        entity.save();
    }
    else if (transactionType == constants_2.TransactionType.WITHDRAW) {
        const entity = new schema_2.Withdraw(id);
        entity.hash = hash;
        entity.logIndex = logIndex.toI32();
        entity.nonce = event.transaction.nonce;
        entity.market = market.id;
        entity.asset = market.inputToken;
        entity.account = accountID;
        entity.position = positionID;
        entity.amount = amount;
        entity.amountUSD = amountUSD;
        entity.timestamp = event.block.timestamp;
        entity.blockNumber = event.block.timestamp;
        entity.save();
    }
    else {
        graph_ts_1.log.error("[createTransaction]Unknown transaction type {}", [
            transactionType,
        ]);
        return;
    }
}
exports.createTransaction = createTransaction;
function updateRevenues(protocol, market, newSupplySideRevenueUSD, newProtocolSideRevenueUSD, event, updateProtocol = true
// whether to update protocol level revenues;
// false for interest paid to senior pool to avoid double counting revenues
) {
    const newTotalRevenueUSD = newSupplySideRevenueUSD.plus(newProtocolSideRevenueUSD);
    graph_ts_1.log.info("[updateRevenues]market={}: newSupplySideRevenueUSD={},newProtocolSideRevenueUSD={},newTotalRevenueUSD={} tx={}", [
        market.id,
        newSupplySideRevenueUSD.toString(),
        newProtocolSideRevenueUSD.toString(),
        newTotalRevenueUSD.toString(),
        event.transaction.hash.toHexString(),
    ]);
    // update market's revenue
    market.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
    market.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD.plus(newProtocolSideRevenueUSD);
    market.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD.plus(newTotalRevenueUSD);
    market.save();
    const marketDailySnapshot = (0, getters_1.getOrCreateMarketDailySnapshot)(market.id, event);
    const marketHourlySnapshot = (0, getters_1.getOrCreateMarketHourlySnapshot)(market.id, event);
    // update daily snapshot
    marketDailySnapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketDailySnapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketDailySnapshot.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD;
    marketDailySnapshot.dailySupplySideRevenueUSD =
        marketDailySnapshot.dailySupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
    marketDailySnapshot.dailyProtocolSideRevenueUSD =
        marketDailySnapshot.dailyProtocolSideRevenueUSD.plus(newProtocolSideRevenueUSD);
    marketDailySnapshot.dailyTotalRevenueUSD =
        marketDailySnapshot.dailyTotalRevenueUSD.plus(newTotalRevenueUSD);
    marketDailySnapshot.save();
    // update hourly snapshot
    marketHourlySnapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketHourlySnapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketHourlySnapshot.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD;
    marketHourlySnapshot.hourlySupplySideRevenueUSD =
        marketHourlySnapshot.hourlySupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
    marketHourlySnapshot.hourlyProtocolSideRevenueUSD =
        marketHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(newProtocolSideRevenueUSD);
    marketHourlySnapshot.hourlyTotalRevenueUSD =
        marketHourlySnapshot.hourlyTotalRevenueUSD.plus(newTotalRevenueUSD);
    marketHourlySnapshot.save();
    // update protocol revenue
    if (updateProtocol) {
        protocol.cumulativeSupplySideRevenueUSD =
            protocol.cumulativeSupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
        protocol.cumulativeProtocolSideRevenueUSD =
            protocol.cumulativeProtocolSideRevenueUSD.plus(newProtocolSideRevenueUSD);
        protocol.cumulativeTotalRevenueUSD =
            protocol.cumulativeTotalRevenueUSD.plus(newTotalRevenueUSD);
        protocol.save();
        const financialSnapshot = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
        // update financials
        financialSnapshot.cumulativeSupplySideRevenueUSD =
            protocol.cumulativeSupplySideRevenueUSD;
        financialSnapshot.cumulativeProtocolSideRevenueUSD =
            protocol.cumulativeProtocolSideRevenueUSD;
        financialSnapshot.cumulativeTotalRevenueUSD =
            protocol.cumulativeTotalRevenueUSD;
        financialSnapshot.dailySupplySideRevenueUSD =
            financialSnapshot.dailySupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
        financialSnapshot.dailyProtocolSideRevenueUSD =
            financialSnapshot.dailyProtocolSideRevenueUSD.plus(newProtocolSideRevenueUSD);
        financialSnapshot.dailyTotalRevenueUSD =
            financialSnapshot.dailyTotalRevenueUSD.plus(newTotalRevenueUSD);
        financialSnapshot.save();
    }
}
exports.updateRevenues = updateRevenues;
// updates the FinancialDailySnapshot Entity
function snapshotFinancials(protocol, amountUSD, event, transactionType = null) {
    const block = event.block;
    const financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    if (block.number.ge(financialMetrics.blockNumber)) {
        // financials snapshot already exists and is stale, refresh
        if (!protocol)
            protocol = (0, getters_1.getOrCreateProtocol)();
        financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
        financialMetrics.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
        financialMetrics.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
        financialMetrics.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
        financialMetrics.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
        financialMetrics.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
        // update cumul revenues
        financialMetrics.cumulativeSupplySideRevenueUSD =
            protocol.cumulativeSupplySideRevenueUSD;
        financialMetrics.cumulativeProtocolSideRevenueUSD =
            protocol.cumulativeProtocolSideRevenueUSD;
        financialMetrics.cumulativeTotalRevenueUSD =
            protocol.cumulativeTotalRevenueUSD;
    }
    // update the block number and timestamp
    financialMetrics.blockNumber = block.number;
    financialMetrics.timestamp = block.timestamp;
    if (transactionType != null) {
        // add to daily amounts
        if (transactionType == constants_2.TransactionType.DEPOSIT) {
            financialMetrics.dailyDepositUSD =
                financialMetrics.dailyDepositUSD.plus(amountUSD);
        }
        else if (transactionType == constants_2.TransactionType.BORROW) {
            financialMetrics.dailyBorrowUSD =
                financialMetrics.dailyBorrowUSD.plus(amountUSD);
        }
        else if (transactionType == constants_2.TransactionType.REPAY) {
            financialMetrics.dailyRepayUSD =
                financialMetrics.dailyRepayUSD.plus(amountUSD);
        }
        else if (transactionType == constants_2.TransactionType.WITHDRAW) {
            financialMetrics.dailyWithdrawUSD =
                financialMetrics.dailyWithdrawUSD.plus(amountUSD);
        }
        else if (transactionType == constants_2.TransactionType.LIQUIDATE) {
            financialMetrics.dailyLiquidateUSD =
                financialMetrics.dailyLiquidateUSD.plus(amountUSD);
        }
    }
    financialMetrics.save();
}
exports.snapshotFinancials = snapshotFinancials;
// update daily/hourly Usage Metric Snapshot
function updateUsageMetrics(protocol, user, event, transactionType) {
    // Number of days since Unix epoch
    const days = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const hours = event.block.timestamp.toI64() / constants_2.SECONDS_PER_HOUR;
    const dailyMetrics = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
    const hourlyMetrics = (0, getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
    // Update the block number and timestamp to that of the last transaction of that day
    dailyMetrics.blockNumber = event.block.number;
    dailyMetrics.timestamp = event.block.timestamp;
    dailyMetrics.dailyTransactionCount += constants_1.INT_ONE;
    // update hourlyMetrics
    hourlyMetrics.blockNumber = event.block.number;
    hourlyMetrics.timestamp = event.block.timestamp;
    hourlyMetrics.hourlyTransactionCount += constants_1.INT_ONE;
    let account = schema_2.Account.load(user);
    if (!account) {
        account = (0, getters_1.getOrCreateAccount)(user);
        protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
    }
    if (transactionType == constants_2.TransactionType.DEPOSIT) {
        if (account.depositCount == constants_1.INT_ZERO) {
            protocol.cumulativeUniqueDepositors += constants_1.INT_ONE;
        }
        account.depositCount += constants_1.INT_ONE;
    }
    else if (transactionType == constants_2.TransactionType.WITHDRAW) {
        account.withdrawCount += constants_1.INT_ONE;
    }
    else if (transactionType == constants_2.TransactionType.BORROW) {
        if (account.borrowCount == constants_1.INT_ZERO) {
            protocol.cumulativeUniqueBorrowers += constants_1.INT_ONE;
        }
        account.borrowCount += constants_1.INT_ONE;
    }
    else if (transactionType == constants_2.TransactionType.REPAY) {
        account.repayCount += constants_1.INT_ONE;
    }
    account.save();
    // Combine the id and the user address to generate a unique user id for the day
    const dailyActiveAccountId = constants_2.ActivityType.DAILY + "-" + user + "-" + days.toString();
    let dailyActiveAccount = schema_2.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_2.ActiveAccount(dailyActiveAccountId);
        dailyActiveAccount.save();
        dailyMetrics.dailyActiveUsers += constants_1.INT_ONE;
        if (transactionType == constants_2.TransactionType.DEPOSIT) {
            dailyMetrics.dailyActiveDepositors += constants_1.INT_ONE;
        }
        else if (transactionType == constants_2.TransactionType.BORROW) {
            dailyMetrics.dailyActiveBorrowers += constants_1.INT_ONE;
        }
    }
    // create active account for hourlyMetrics
    const hourlyActiveAccountId = constants_2.ActivityType.HOURLY + "-" + user + "-" + hours.toString();
    let hourlyActiveAccount = schema_2.ActiveAccount.load(hourlyActiveAccountId);
    if (!hourlyActiveAccount) {
        hourlyActiveAccount = new schema_2.ActiveAccount(hourlyActiveAccountId);
        hourlyActiveAccount.save();
        hourlyMetrics.hourlyActiveUsers += constants_1.INT_ONE;
    }
    // update transaction for daily/hourly metrics
    updateTransactionCount(dailyMetrics, hourlyMetrics, transactionType);
    dailyMetrics.totalPoolCount = protocol.totalPoolCount;
    dailyMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    dailyMetrics.cumulativeUniqueDepositors = protocol.cumulativeUniqueDepositors;
    dailyMetrics.cumulativeUniqueBorrowers = protocol.cumulativeUniqueBorrowers;
    hourlyMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    hourlyMetrics.save();
    dailyMetrics.save();
    protocol.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
// update MarketDailySnapshot & MarketHourlySnapshot
function snapshotMarket(market, amountUSD, event, transactionType = null, snapshotRates = false) {
    const marketDailyMetrics = (0, getters_1.getOrCreateMarketDailySnapshot)(market.id, event);
    const marketHourlyMetrics = (0, getters_1.getOrCreateMarketHourlySnapshot)(market.id, event);
    marketDailyMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
    marketDailyMetrics.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketDailyMetrics.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketDailyMetrics.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD;
    marketDailyMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketDailyMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketDailyMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketDailyMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketDailyMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketDailyMetrics.inputTokenBalance = market.inputTokenBalance;
    marketDailyMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketDailyMetrics.outputTokenSupply = market.outputTokenSupply;
    marketDailyMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketDailyMetrics.exchangeRate = market.exchangeRate;
    marketDailyMetrics.rewardTokenEmissionsAmount =
        market.rewardTokenEmissionsAmount;
    marketDailyMetrics.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    marketHourlyMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
    marketHourlyMetrics.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketHourlyMetrics.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketHourlyMetrics.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD;
    marketHourlyMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketHourlyMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketHourlyMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketHourlyMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketHourlyMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketHourlyMetrics.inputTokenBalance = market.inputTokenBalance;
    marketHourlyMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketHourlyMetrics.outputTokenSupply = market.outputTokenSupply;
    marketHourlyMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketHourlyMetrics.exchangeRate = market.exchangeRate;
    marketHourlyMetrics.rewardTokenEmissionsAmount =
        market.rewardTokenEmissionsAmount;
    marketHourlyMetrics.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    // update to latest block/timestamp
    marketDailyMetrics.blockNumber = event.block.number;
    marketDailyMetrics.timestamp = event.block.timestamp;
    marketHourlyMetrics.blockNumber = event.block.number;
    marketHourlyMetrics.timestamp = event.block.timestamp;
    // add to daily amounts
    if (transactionType != null) {
        if (transactionType == constants_2.TransactionType.DEPOSIT) {
            marketDailyMetrics.dailyDepositUSD =
                marketDailyMetrics.dailyDepositUSD.plus(amountUSD);
            marketHourlyMetrics.hourlyDepositUSD =
                marketHourlyMetrics.hourlyDepositUSD.plus(amountUSD);
        }
        else if (transactionType == constants_2.TransactionType.BORROW) {
            marketDailyMetrics.dailyBorrowUSD =
                marketDailyMetrics.dailyBorrowUSD.plus(amountUSD);
            marketHourlyMetrics.hourlyBorrowUSD =
                marketHourlyMetrics.hourlyBorrowUSD.plus(amountUSD);
        }
        else if (transactionType == constants_2.TransactionType.REPAY) {
            marketDailyMetrics.dailyRepayUSD =
                marketDailyMetrics.dailyRepayUSD.plus(amountUSD);
            marketHourlyMetrics.hourlyRepayUSD =
                marketHourlyMetrics.hourlyRepayUSD.plus(amountUSD);
        }
        else if (transactionType == constants_2.TransactionType.WITHDRAW) {
            marketDailyMetrics.dailyWithdrawUSD =
                marketDailyMetrics.dailyWithdrawUSD.plus(amountUSD);
            marketHourlyMetrics.hourlyWithdrawUSD =
                marketHourlyMetrics.hourlyWithdrawUSD.plus(amountUSD);
        }
        else if (transactionType == constants_2.TransactionType.LIQUIDATE) {
            marketDailyMetrics.dailyLiquidateUSD =
                marketDailyMetrics.dailyLiquidateUSD.plus(amountUSD);
            marketHourlyMetrics.hourlyLiquidateUSD =
                marketHourlyMetrics.hourlyLiquidateUSD.plus(amountUSD);
        }
    }
    if (snapshotRates) {
        const days = (event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
        const hours = (event.block.timestamp.toI64() / constants_2.SECONDS_PER_HOUR).toString();
        marketDailyMetrics.rates = (0, getters_1.getSnapshotRates)(market.rates, days);
        marketHourlyMetrics.rates = (0, getters_1.getSnapshotRates)(market.rates, hours);
    }
    marketDailyMetrics.save();
    marketHourlyMetrics.save();
}
exports.snapshotMarket = snapshotMarket;
/////////////////
//// Helpers ////
/////////////////
function updateTransactionCount(dailyUsage, hourlyUsage, transactionType) {
    if (transactionType == constants_2.TransactionType.DEPOSIT) {
        hourlyUsage.hourlyDepositCount += 1;
        dailyUsage.dailyDepositCount += 1;
    }
    else if (transactionType == constants_2.TransactionType.WITHDRAW) {
        hourlyUsage.hourlyWithdrawCount += 1;
        dailyUsage.dailyWithdrawCount += 1;
    }
    else if (transactionType == constants_2.TransactionType.BORROW) {
        hourlyUsage.hourlyBorrowCount += 1;
        dailyUsage.dailyBorrowCount += 1;
    }
    else if (transactionType == constants_2.TransactionType.REPAY) {
        hourlyUsage.hourlyRepayCount += 1;
        dailyUsage.dailyRepayCount += 1;
    }
    else if (transactionType == constants_2.TransactionType.LIQUIDATE) {
        hourlyUsage.hourlyLiquidateCount += 1;
        dailyUsage.dailyLiquidateCount += 1;
    }
    hourlyUsage.save();
    dailyUsage.save();
}
// A series of side effects on position added
// They include:
// * Create a new position when needed or reuse the exisitng position
// * Update position related data in protocol, market, account
// * Take position snapshot
function updatePosition(protocol, market, account, balance, //new position balance
side, transactionType, event) {
    let openPosition = (0, getters_1.getOpenPosition)(account.id, market.id, side);
    if (!openPosition) {
        openPosition = (0, getters_1.getNewPosition)(account.id, market.id, side, event);
        account.positionCount += constants_1.INT_ONE;
        account.openPositionCount += constants_1.INT_ONE;
        market.positionCount += constants_1.INT_ONE;
        market.openPositionCount += constants_1.INT_ONE;
        protocol.cumulativePositionCount += constants_1.INT_ONE;
        protocol.openPositionCount += constants_1.INT_ONE;
        if (transactionType == constants_2.TransactionType.DEPOSIT) {
            market.lendingPositionCount += constants_1.INT_ONE;
        }
        else if (transactionType == constants_2.TransactionType.BORROW) {
            market.borrowingPositionCount += constants_1.INT_ONE;
        }
    }
    openPosition.balance = balance;
    if (openPosition.balance.equals(constants_1.BIGINT_ZERO)) {
        openPosition.hashClosed = event.transaction.hash.toHexString();
        openPosition.timestampClosed = event.block.timestamp;
        openPosition.blockNumberClosed = event.block.number;
        account.closedPositionCount += constants_1.INT_ONE;
        account.openPositionCount -= constants_1.INT_ONE;
        market.closedPositionCount += constants_1.INT_ONE;
        market.openPositionCount -= constants_1.INT_ONE;
        protocol.openPositionCount -= constants_1.INT_ONE;
    }
    if (transactionType == constants_2.TransactionType.DEPOSIT) {
        openPosition.depositCount += constants_1.INT_ONE;
    }
    else if (transactionType == constants_2.TransactionType.WITHDRAW) {
        openPosition.withdrawCount += constants_1.INT_ONE;
    }
    else if (transactionType == constants_2.TransactionType.BORROW) {
        openPosition.borrowCount += constants_1.INT_ONE;
    }
    else if (transactionType == constants_2.TransactionType.REPAY) {
        openPosition.repayCount += constants_1.INT_ONE;
    }
    openPosition.save();
    account.save();
    market.save();
    protocol.save();
    // take position snapshot
    snapshotPosition(openPosition, event);
    return openPosition.id;
}
exports.updatePosition = updatePosition;
function snapshotPosition(position, event) {
    const txHash = event.transaction.hash.toHexString();
    const snapshotID = `${position.id}-${txHash}-${event.logIndex.toString()}`;
    let snapshot = schema_1.PositionSnapshot.load(snapshotID);
    if (snapshot == null) {
        snapshot = new schema_1.PositionSnapshot(snapshotID);
        snapshot.hash = txHash;
        snapshot.logIndex = event.logIndex.toI32();
        snapshot.nonce = event.transaction.nonce;
        snapshot.position = position.id;
        snapshot.balance = position.balance;
        snapshot.blockNumber = event.block.number;
        snapshot.timestamp = event.block.timestamp;
        snapshot.save();
    }
    else {
        graph_ts_1.log.error("[snapshotPosition]Position snapshot {} already exists for position {} at tx hash {}", [snapshotID, position.id, txHash]);
    }
}
exports.snapshotPosition = snapshotPosition;
function isMigratedTranchedPool(event) {
    const contract = MigratedTranchedPool_1.MigratedTranchedPool.bind(event.address);
    const migratedResult = contract.try_migrated();
    if (!migratedResult.reverted && migratedResult.value) {
        return true;
    }
    return false;
}
exports.isMigratedTranchedPool = isMigratedTranchedPool;
