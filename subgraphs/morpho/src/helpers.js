"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProtocolAfterNewMarket = exports.updateProtocolValues = exports.getEventId = exports.updateP2PRates = exports.updateProtocolPosition = exports.getOrCreateMarketHourlySnapshot = exports.createAccount = exports.subtractPosition = exports.addPosition = exports.updateSnapshots = exports.snapshotUsage = exports.updateFinancials = exports.getOrCreateFinancialDailySnapshots = exports.updateRevenueSnapshots = exports.createInterestRate = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../generated/schema");
const constants_1 = require("./constants");
const initializers_1 = require("./utils/initializers");
const interestRatesModels_1 = require("./utils/interestRatesModels");
function getDay(timestamp) {
    return timestamp.div(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY));
}
function getDayId(timestamp) {
    return graph_ts_1.Bytes.fromI32(getDay(timestamp).toI32());
}
function getHour(timestamp) {
    return timestamp.div(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_HOUR));
}
function getHourId(timestamp) {
    return graph_ts_1.Bytes.fromI32(getHour(timestamp).toI32());
}
////////////////////////////
///// Helper Functions /////
////////////////////////////
function createInterestRate(marketAddress, rateSide, rateType, rate) {
    const id = `${rateSide}-${rateType}-${marketAddress.toHexString()}`;
    const interestRate = new schema_1.InterestRate(id);
    interestRate.rate = rate;
    interestRate.side = rateSide;
    interestRate.type = rateType;
    interestRate.save();
    return interestRate;
}
exports.createInterestRate = createInterestRate;
function updateRevenueSnapshots(market, protocol, supplySideRevenue, protocolSideRevenue, block) {
    const financialSnapshot = getOrCreateFinancialDailySnapshots(protocol, block);
    const marketDailySnapshot = getOrCreateMarketDailySnapshot(market, block);
    const marketHourlySnapshot = getOrCreateMarketHourlySnapshot(market, block);
    const totalRevenue = supplySideRevenue.plus(protocolSideRevenue);
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(supplySideRevenue);
    financialSnapshot.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialSnapshot.dailySupplySideRevenueUSD =
        financialSnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenue);
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenue);
    financialSnapshot.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialSnapshot.dailyProtocolSideRevenueUSD =
        financialSnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenue);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(totalRevenue);
    financialSnapshot.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    financialSnapshot.dailyTotalRevenueUSD =
        financialSnapshot.dailyTotalRevenueUSD.plus(totalRevenue);
    market.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD.plus(supplySideRevenue);
    marketDailySnapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketDailySnapshot.dailySupplySideRevenueUSD =
        marketDailySnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenue);
    marketHourlySnapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketHourlySnapshot.hourlySupplySideRevenueUSD =
        marketHourlySnapshot.hourlySupplySideRevenueUSD.plus(supplySideRevenue);
    market.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenue);
    marketDailySnapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketDailySnapshot.dailyProtocolSideRevenueUSD =
        marketDailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenue);
    marketHourlySnapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketHourlySnapshot.hourlyProtocolSideRevenueUSD =
        marketHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(protocolSideRevenue);
    market.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD.plus(totalRevenue);
    marketDailySnapshot.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD;
    marketDailySnapshot.dailyTotalRevenueUSD =
        marketDailySnapshot.dailyTotalRevenueUSD.plus(totalRevenue);
    marketHourlySnapshot.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD;
    marketHourlySnapshot.hourlyTotalRevenueUSD =
        marketHourlySnapshot.hourlyTotalRevenueUSD.plus(totalRevenue);
    marketDailySnapshot.rates = getSnapshotRates(market.rates, (block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString());
    marketHourlySnapshot.save();
    marketDailySnapshot.save();
    financialSnapshot.save();
    protocol.save();
    market.save();
}
exports.updateRevenueSnapshots = updateRevenueSnapshots;
function getOrCreateFinancialDailySnapshots(protocol, block) {
    const snapshotId = getDayId(block.timestamp);
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(snapshotId);
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(snapshotId);
        financialMetrics.protocol = protocol.id;
        financialMetrics.days = getDay(block.timestamp).toI32();
        financialMetrics.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyTransferUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyFlashloanUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD =
            protocol.cumulativeSupplySideRevenueUSD;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD =
            protocol.cumulativeProtocolSideRevenueUSD;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD =
            protocol.cumulativeTotalRevenueUSD;
        financialMetrics.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
        financialMetrics.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
        financialMetrics.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
        financialMetrics.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
        financialMetrics.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
        financialMetrics.blockNumber = block.number;
        financialMetrics.timestamp = block.timestamp;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancialDailySnapshots = getOrCreateFinancialDailySnapshots;
function updateFinancials(protocol, block) {
    const financialMetrics = getOrCreateFinancialDailySnapshots(protocol, block);
    financialMetrics.blockNumber = block.number;
    financialMetrics.timestamp = block.timestamp;
    financialMetrics.save();
}
exports.updateFinancials = updateFinancials;
function snapshotUsage(protocol, blockNumber, blockTimestamp, accountID, eventType, isNewTx // used for liquidations to track daily liquidat-ors/-ees
) {
    //
    // daily snapshot
    //
    const dailySnapshotID = getDayId(blockTimestamp);
    let dailySnapshot = schema_1.UsageMetricsDailySnapshot.load(dailySnapshotID);
    if (!dailySnapshot) {
        dailySnapshot = new schema_1.UsageMetricsDailySnapshot(dailySnapshotID);
        dailySnapshot.protocol = protocol.id;
        dailySnapshot.days = getDay(blockTimestamp).toI32();
        dailySnapshot.dailyActiveUsers = constants_1.INT_ZERO;
        dailySnapshot.dailyTransactionCount = constants_1.INT_ZERO;
        dailySnapshot.dailyDepositCount = constants_1.INT_ZERO;
        dailySnapshot.dailyWithdrawCount = constants_1.INT_ZERO;
        dailySnapshot.dailyBorrowCount = constants_1.INT_ZERO;
        dailySnapshot.dailyRepayCount = constants_1.INT_ZERO;
        dailySnapshot.dailyLiquidateCount = constants_1.INT_ZERO;
        dailySnapshot.dailyActiveDepositors = constants_1.INT_ZERO;
        dailySnapshot.dailyActiveBorrowers = constants_1.INT_ZERO;
        dailySnapshot.dailyActiveLiquidators = constants_1.INT_ZERO;
        dailySnapshot.dailyActiveLiquidatees = constants_1.INT_ZERO;
        dailySnapshot.dailyActivePositions = constants_1.INT_ZERO;
        dailySnapshot.openPositionCount = constants_1.INT_ZERO;
        dailySnapshot.dailyTransferCount = constants_1.INT_ZERO;
        dailySnapshot.dailyFlashloanCount = constants_1.INT_ZERO;
    }
    //
    // Active users
    //
    const dailyAccountID = constants_1.ActivityType.DAILY.concat("-")
        .concat(accountID)
        .concat("-")
        .concat(dailySnapshotID.toHexString());
    let dailyActiveAccount = schema_1._ActiveAccount.load(dailyAccountID);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1._ActiveAccount(dailyAccountID);
        dailyActiveAccount.save();
        dailySnapshot.dailyActiveUsers += 1;
    }
    // update daily active positions
    let positionSide = null;
    if (eventType === constants_1.EventType.DEPOSIT || eventType === constants_1.EventType.WITHDRAW)
        positionSide = constants_1.PositionSide.COLLATERAL;
    else if (eventType === constants_1.EventType.BORROW ||
        eventType === constants_1.EventType.REPAY ||
        eventType === constants_1.EventType.LIQUIDATEE)
        positionSide = constants_1.PositionSide.BORROWER;
    if (positionSide) {
        const dailyPositionID = constants_1.ActivityType.DAILY.concat("-")
            .concat(accountID)
            .concat("-")
            .concat(positionSide)
            .concat("-")
            .concat(dailySnapshotID.toHexString());
        let dailyActivePosition = schema_1._ActiveAccount.load(dailyPositionID);
        if (!dailyActivePosition) {
            dailyActivePosition = new schema_1._ActiveAccount(dailyPositionID);
            dailyActivePosition.save();
            dailySnapshot.dailyActivePositions += 1;
        }
    }
    //
    // Track users per event
    //
    const dailyActorAccountID = constants_1.ActivityType.DAILY.concat("-")
        .concat(eventType.toString())
        .concat("-")
        .concat(accountID)
        .concat("-")
        .concat(dailySnapshotID.toHexString());
    let dailyActiveActorAccount = schema_1._ActiveAccount.load(dailyActorAccountID);
    const isNewActor = dailyActiveActorAccount == null;
    if (isNewActor) {
        dailyActiveActorAccount = new schema_1._ActiveAccount(dailyActorAccountID);
        dailyActiveActorAccount.save();
    }
    dailySnapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    dailySnapshot.totalPoolCount = protocol.totalPoolCount;
    dailySnapshot.openPositionCount = protocol.openPositionCount;
    dailySnapshot.cumulativeUniqueDepositors =
        protocol.cumulativeUniqueDepositors;
    dailySnapshot.cumulativeUniqueBorrowers = protocol.cumulativeUniqueBorrowers;
    dailySnapshot.cumulativeUniqueLiquidators =
        protocol.cumulativeUniqueLiquidators;
    dailySnapshot.cumulativePositionCount = protocol.cumulativePositionCount;
    dailySnapshot.cumulativeUniqueLiquidatees =
        protocol.cumulativeUniqueLiquidatees;
    if (isNewTx) {
        dailySnapshot.dailyTransactionCount += 1;
    }
    switch (eventType) {
        case constants_1.EventType.DEPOSIT:
            dailySnapshot.dailyDepositCount += 1;
            if (isNewActor) {
                dailySnapshot.dailyActiveDepositors += 1;
            }
            break;
        case constants_1.EventType.WITHDRAW:
            dailySnapshot.dailyWithdrawCount += 1;
            break;
        case constants_1.EventType.BORROW:
            dailySnapshot.dailyBorrowCount += 1;
            if (isNewActor) {
                dailySnapshot.dailyActiveBorrowers += 1;
            }
            break;
        case constants_1.EventType.REPAY:
            dailySnapshot.dailyRepayCount += 1;
            break;
        case constants_1.EventType.LIQUIDATOR:
            dailySnapshot.dailyLiquidateCount += 1;
            if (isNewActor) {
                dailySnapshot.dailyActiveLiquidators += 1;
            }
            break;
        case constants_1.EventType.LIQUIDATEE:
            if (isNewActor) {
                dailySnapshot.dailyActiveLiquidatees += 1;
            }
        default:
            break;
    }
    dailySnapshot.totalPoolCount = protocol.totalPoolCount;
    dailySnapshot.blockNumber = blockNumber;
    dailySnapshot.timestamp = blockTimestamp;
    dailySnapshot.save();
    //
    // hourly snapshot
    //
    const hourlySnapshotID = getHourId(blockTimestamp);
    let hourlySnapshot = schema_1.UsageMetricsHourlySnapshot.load(hourlySnapshotID);
    if (!hourlySnapshot) {
        hourlySnapshot = new schema_1.UsageMetricsHourlySnapshot(hourlySnapshotID);
        hourlySnapshot.protocol = protocol.id;
        hourlySnapshot.hours = getHour(blockTimestamp).toI32();
        hourlySnapshot.hourlyActiveUsers = constants_1.INT_ZERO;
        hourlySnapshot.cumulativeUniqueUsers = constants_1.INT_ZERO;
        hourlySnapshot.hourlyTransactionCount = constants_1.INT_ZERO;
        hourlySnapshot.hourlyDepositCount = constants_1.INT_ZERO;
        hourlySnapshot.hourlyWithdrawCount = constants_1.INT_ZERO;
        hourlySnapshot.hourlyBorrowCount = constants_1.INT_ZERO;
        hourlySnapshot.hourlyRepayCount = constants_1.INT_ZERO;
        hourlySnapshot.hourlyLiquidateCount = constants_1.INT_ZERO;
        hourlySnapshot.blockNumber = blockNumber;
        hourlySnapshot.timestamp = blockTimestamp;
    }
    const hourlyAccountID = constants_1.ActivityType.HOURLY.concat("-")
        .concat(accountID)
        .concat("-")
        .concat(hourlySnapshotID.toHexString());
    let hourlyActiveAccount = schema_1._ActiveAccount.load(hourlyAccountID);
    if (!hourlyActiveAccount) {
        hourlyActiveAccount = new schema_1._ActiveAccount(hourlyAccountID);
        hourlyActiveAccount.save();
        hourlySnapshot.hourlyActiveUsers += 1;
    }
    hourlySnapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    if (isNewTx) {
        hourlySnapshot.hourlyTransactionCount += 1;
    }
    switch (eventType) {
        case constants_1.EventType.DEPOSIT:
            hourlySnapshot.hourlyDepositCount += 1;
            break;
        case constants_1.EventType.WITHDRAW:
            hourlySnapshot.hourlyWithdrawCount += 1;
            break;
        case constants_1.EventType.BORROW:
            hourlySnapshot.hourlyBorrowCount += 1;
            break;
        case constants_1.EventType.REPAY:
            hourlySnapshot.hourlyRepayCount += 1;
            break;
        case constants_1.EventType.LIQUIDATOR:
            hourlySnapshot.hourlyLiquidateCount += 1;
            break;
        default:
            break;
    }
    hourlySnapshot.blockNumber = blockNumber;
    hourlySnapshot.timestamp = blockTimestamp;
    hourlySnapshot.save();
}
exports.snapshotUsage = snapshotUsage;
function updateSnapshots(protocol, market, amountUSD, amountNative, eventType, block) {
    const marketHourlySnapshot = getOrCreateMarketHourlySnapshot(market, block);
    const marketDailySnapshot = getOrCreateMarketDailySnapshot(market, block);
    const financialSnapshot = schema_1.FinancialsDailySnapshot.load(getDayId(block.timestamp));
    if (!financialSnapshot) {
        // should NOT happen
        graph_ts_1.log.warning("[updateSnapshots] financialSnapshot not found", []);
        return;
    }
    switch (eventType) {
        case constants_1.EventType.DEPOSIT:
            marketHourlySnapshot.hourlyDepositUSD =
                marketHourlySnapshot.hourlyDepositUSD.plus(amountUSD);
            marketDailySnapshot.dailyDepositUSD =
                marketDailySnapshot.dailyDepositUSD.plus(amountUSD);
            financialSnapshot.dailyDepositUSD =
                financialSnapshot.dailyDepositUSD.plus(amountUSD);
            financialSnapshot.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
            marketDailySnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
            marketHourlySnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
            marketDailySnapshot.dailyNativeDeposit =
                marketDailySnapshot.dailyNativeDeposit.plus(amountNative);
            break;
        case constants_1.EventType.BORROW:
            marketHourlySnapshot.hourlyBorrowUSD =
                marketHourlySnapshot.hourlyBorrowUSD.plus(amountUSD);
            marketDailySnapshot.dailyBorrowUSD =
                marketDailySnapshot.dailyBorrowUSD.plus(amountUSD);
            financialSnapshot.dailyBorrowUSD =
                financialSnapshot.dailyBorrowUSD.plus(amountUSD);
            financialSnapshot.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
            marketDailySnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
            marketHourlySnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
            marketDailySnapshot.dailyNativeBorrow =
                marketDailySnapshot.dailyNativeBorrow.plus(amountNative);
            break;
        case constants_1.EventType.LIQUIDATOR:
            marketHourlySnapshot.hourlyLiquidateUSD =
                marketHourlySnapshot.hourlyLiquidateUSD.plus(amountUSD);
            marketDailySnapshot.dailyLiquidateUSD =
                marketDailySnapshot.dailyLiquidateUSD.plus(amountUSD);
            financialSnapshot.dailyLiquidateUSD =
                financialSnapshot.dailyLiquidateUSD.plus(amountUSD);
            financialSnapshot.cumulativeLiquidateUSD =
                protocol.cumulativeLiquidateUSD;
            marketDailySnapshot.cumulativeLiquidateUSD =
                market.cumulativeLiquidateUSD;
            marketHourlySnapshot.cumulativeLiquidateUSD =
                market.cumulativeLiquidateUSD;
            marketDailySnapshot.dailyNativeLiquidate =
                marketDailySnapshot.dailyNativeLiquidate.plus(amountNative);
            break;
        case constants_1.EventType.WITHDRAW:
            marketHourlySnapshot.hourlyWithdrawUSD =
                marketHourlySnapshot.hourlyWithdrawUSD.plus(amountUSD);
            marketDailySnapshot.dailyWithdrawUSD =
                marketDailySnapshot.dailyWithdrawUSD.plus(amountUSD);
            financialSnapshot.dailyWithdrawUSD =
                financialSnapshot.dailyWithdrawUSD.plus(amountUSD);
            marketDailySnapshot.dailyNativeWithdraw =
                marketDailySnapshot.dailyNativeWithdraw.plus(amountNative);
            break;
        case constants_1.EventType.REPAY:
            marketHourlySnapshot.hourlyRepayUSD =
                marketHourlySnapshot.hourlyRepayUSD.plus(amountUSD);
            marketDailySnapshot.dailyRepayUSD =
                marketDailySnapshot.dailyRepayUSD.plus(amountUSD);
            financialSnapshot.dailyRepayUSD =
                financialSnapshot.dailyRepayUSD.plus(amountUSD);
            marketDailySnapshot.dailyNativeRepay =
                marketDailySnapshot.dailyNativeRepay.plus(amountNative);
            break;
        default:
            break;
    }
    marketDailySnapshot.save();
    marketHourlySnapshot.save();
    financialSnapshot.save();
}
exports.updateSnapshots = updateSnapshots;
// This function does the following in this order:
// 1- create a position if needed
// 2- update the positions data
// 3- create a snapshot of the position
function addPosition(protocol, market, account, side, eventType, event) {
    const counterID = account.id
        .toHexString()
        .concat("-")
        .concat(market.id.toHexString())
        .concat("-")
        .concat(side);
    let positionCounter = schema_1._PositionCounter.load(counterID);
    if (!positionCounter) {
        positionCounter = new schema_1._PositionCounter(counterID);
        positionCounter.lastTimestamp = event.block.timestamp;
        positionCounter.nextCount = 0;
        positionCounter.save();
    }
    const positionID = positionCounter.id
        .concat("-")
        .concat(positionCounter.nextCount.toString());
    let position = schema_1.Position.load(positionID);
    const openPosition = position == null;
    if (openPosition) {
        position = new schema_1.Position(positionID);
        position.account = account.id;
        position.market = market.id;
        position.asset = market.inputToken;
        position.hashOpened = event.transaction.hash;
        position.blockNumberOpened = event.block.number;
        position.timestampOpened = event.block.timestamp;
        position.side = side;
        if (side == constants_1.PositionSide.COLLATERAL) {
            position.isCollateral = true;
        }
        position._balanceOnPool = graph_ts_1.BigInt.zero();
        position._balanceInP2P = graph_ts_1.BigInt.zero();
        position._virtualP2P = graph_ts_1.BigInt.zero();
        position.balance = graph_ts_1.BigInt.zero();
        position.depositCount = 0;
        position.withdrawCount = 0;
        position.borrowCount = 0;
        position.repayCount = 0;
        position.liquidationCount = 0;
        position.transferredCount = 0;
        position.receivedCount = 0;
        position.save();
    }
    position = position;
    if (eventType == constants_1.EventType.DEPOSIT) {
        position.depositCount += 1;
    }
    else if (eventType == constants_1.EventType.BORROW) {
        position.borrowCount += 1;
    }
    position.save();
    if (openPosition) {
        //
        // update account position
        //
        account.positionCount += 1;
        account.openPositionCount += 1;
        account.save();
        //
        // update market position
        //
        market.positionCount += 1;
        market.openPositionCount += 1;
        if (eventType == constants_1.EventType.DEPOSIT) {
            market.lendingPositionCount += 1;
        }
        else if (eventType == constants_1.EventType.BORROW) {
            market.borrowingPositionCount += 1;
        }
        market.save();
        //
        // update protocol position
        //
        protocol.cumulativePositionCount += 1;
        protocol.openPositionCount += 1;
        if (eventType == constants_1.EventType.DEPOSIT) {
            const depositorActorID = "depositor"
                .concat("-")
                .concat(account.id.toHexString());
            let depositorActor = schema_1._ActiveAccount.load(depositorActorID);
            if (!depositorActor) {
                depositorActor = new schema_1._ActiveAccount(depositorActorID);
                depositorActor.save();
                protocol.cumulativeUniqueDepositors += 1;
            }
        }
        else if (eventType == constants_1.EventType.BORROW) {
            const borrowerActorID = "borrower"
                .concat("-")
                .concat(account.id.toHexString());
            let borrowerActor = schema_1._ActiveAccount.load(borrowerActorID);
            if (!borrowerActor) {
                borrowerActor = new schema_1._ActiveAccount(borrowerActorID);
                borrowerActor.save();
                protocol.cumulativeUniqueBorrowers += 1;
            }
        }
        protocol.save();
    }
    //
    // take position snapshot
    //
    snapshotPosition(position, event);
    return position;
}
exports.addPosition = addPosition;
function subtractPosition(protocol, market, account, balance, side, eventType, event) {
    const counterID = account.id
        .toHexString()
        .concat("-")
        .concat(market.id.toHexString())
        .concat("-")
        .concat(side);
    const positionCounter = schema_1._PositionCounter.load(counterID);
    if (!positionCounter) {
        graph_ts_1.log.warning("[subtractPosition] position counter {} not found", [
            counterID,
        ]);
        return null;
    }
    const positionID = positionCounter.id
        .concat("-")
        .concat(positionCounter.nextCount.toString());
    const position = schema_1.Position.load(positionID);
    if (!position) {
        graph_ts_1.log.warning("[subtractPosition] position {} not found", [positionID]);
        return null;
    }
    position.balance = balance;
    if (eventType == constants_1.EventType.WITHDRAW) {
        position.withdrawCount += 1;
        account.withdrawCount += 1;
    }
    else if (eventType == constants_1.EventType.REPAY) {
        position.repayCount += 1;
        account.repayCount += 1;
    }
    else if (eventType == constants_1.EventType.LIQUIDATEE) {
        position.liquidationCount += 1;
        account.liquidationCount += 1;
    }
    account.save();
    position.save();
    const closePosition = position.balance == graph_ts_1.BigInt.zero();
    if (closePosition) {
        //
        // update position counter
        //
        positionCounter.nextCount += 1;
        positionCounter.save();
        //
        // close position
        //
        position.hashClosed = event.transaction.hash;
        position.blockNumberClosed = event.block.number;
        position.timestampClosed = event.block.timestamp;
        position.save();
        //
        // update account position
        //
        account.openPositionCount -= 1;
        account.closedPositionCount += 1;
        account.save();
        //
        // update market position
        //
        market.openPositionCount -= 1;
        market.closedPositionCount += 1;
        market.save();
        //
        // update protocol position
        //
        protocol.openPositionCount -= 1;
        protocol.save();
    }
    //
    // update position snapshot
    //
    snapshotPosition(position, event);
    return position;
}
exports.subtractPosition = subtractPosition;
function createAccount(accountID) {
    const account = new schema_1.Account(accountID);
    account.positionCount = 0;
    account.openPositionCount = 0;
    account.closedPositionCount = 0;
    account.depositCount = 0;
    account.withdrawCount = 0;
    account.borrowCount = 0;
    account.repayCount = 0;
    account.liquidateCount = 0;
    account.liquidationCount = 0;
    account.transferredCount = 0;
    account.receivedCount = 0;
    account.flashloanCount = 0;
    account.save();
    return account;
}
exports.createAccount = createAccount;
////////////////////////////
///// Internal Helpers /////
////////////////////////////
function getOrCreateMarketDailySnapshot(market, block) {
    const snapshotID = market.id.concat(getDayId(block.timestamp));
    let snapshot = schema_1.MarketDailySnapshot.load(snapshotID);
    if (!snapshot) {
        snapshot = new schema_1.MarketDailySnapshot(snapshotID);
        // initialize zero values to ensure no null runtime errors
        snapshot.days = getDay(block.timestamp).toI32();
        snapshot.dailyActiveTransferrers = constants_1.INT_ZERO;
        snapshot.dailyActiveFlashloaners = constants_1.INT_ZERO;
        snapshot.dailyActiveTransferrers = constants_1.INT_ZERO;
        snapshot.dailyActiveUsers = constants_1.INT_ZERO;
        snapshot.dailyActiveLiquidators = constants_1.INT_ZERO;
        snapshot.dailyActiveBorrowers = constants_1.INT_ZERO;
        snapshot.dailyActiveDepositors = constants_1.INT_ZERO;
        snapshot.dailyActiveLiquidatees = constants_1.INT_ZERO;
        snapshot.dailyActiveBorrowingPositionCount = constants_1.INT_ZERO;
        snapshot.dailyActiveLendingPositionCount = constants_1.INT_ZERO;
        snapshot.dailyTransferUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.dailyFlashloanUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.dailyTransferCount = constants_1.INT_ZERO;
        snapshot.dailyFlashloanCount = constants_1.INT_ZERO;
        snapshot.dailyActiveLendingPositionCount = constants_1.INT_ZERO;
        snapshot.dailyActiveBorrowingPositionCount = constants_1.INT_ZERO;
        snapshot.dailyTransferCount = constants_1.INT_ZERO;
        snapshot.dailyFlashloanCount = constants_1.INT_ZERO;
        snapshot.dailyLiquidateCount = constants_1.INT_ZERO;
        snapshot.dailyRepayCount = constants_1.INT_ZERO;
        snapshot.dailyWithdrawCount = constants_1.INT_ZERO;
        snapshot.dailyBorrowCount = constants_1.INT_ZERO;
        snapshot.dailyDepositCount = constants_1.INT_ZERO;
        snapshot.positionCount = constants_1.INT_ZERO;
        snapshot.openPositionCount = constants_1.INT_ZERO;
        snapshot.closedPositionCount = constants_1.INT_ZERO;
        snapshot.lendingPositionCount = constants_1.INT_ZERO;
        snapshot.borrowingPositionCount = constants_1.INT_ZERO;
        snapshot.dailyNativeDeposit = graph_ts_1.BigInt.zero();
        snapshot.dailyNativeBorrow = graph_ts_1.BigInt.zero();
        snapshot.dailyNativeLiquidate = graph_ts_1.BigInt.zero();
        snapshot.dailyNativeWithdraw = graph_ts_1.BigInt.zero();
        snapshot.dailyNativeRepay = graph_ts_1.BigInt.zero();
        snapshot.dailyNativeFlashloan = graph_ts_1.BigInt.zero();
        snapshot.dailyNativeTransfer = graph_ts_1.BigInt.zero();
        snapshot.protocol = market.protocol;
        snapshot.market = market.id;
    }
    snapshot.rates = getSnapshotRates(market.rates, (block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString());
    snapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    snapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    snapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    snapshot.cumulativeFlashloanUSD = market.cumulativeFlashloanUSD;
    snapshot.cumulativeTransferUSD = market.cumulativeTransferUSD;
    snapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    snapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    snapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    snapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    snapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    snapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    snapshot.inputTokenBalance = market.inputTokenBalance;
    snapshot.outputTokenSupply = market.outputTokenSupply;
    snapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
    snapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
    snapshot.exchangeRate = market.exchangeRate;
    snapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    snapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    snapshot.blockNumber = block.number;
    snapshot.timestamp = block.timestamp;
    snapshot.save();
    return snapshot;
}
function getOrCreateMarketHourlySnapshot(market, block) {
    const snapshotID = market.id.concat(getHourId(block.timestamp));
    let snapshot = schema_1.MarketHourlySnapshot.load(snapshotID);
    if (!snapshot) {
        snapshot = new schema_1.MarketHourlySnapshot(snapshotID);
        // initialize zero values to ensure no null runtime errors
        snapshot.hours = getHour(block.timestamp).toI32();
        snapshot.hourlyFlashloanUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.hourlyTransferUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        snapshot.protocol = market.protocol;
        snapshot.market = market.id;
    }
    snapshot.blockNumber = block.number;
    snapshot.timestamp = block.timestamp;
    snapshot.rates = getSnapshotRates(market.rates, (block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR).toString());
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
    snapshot.outputTokenSupply = market.outputTokenSupply;
    snapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
    snapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
    snapshot.exchangeRate = market.exchangeRate;
    snapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    snapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    snapshot.save();
    return snapshot;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
function getSnapshotRates(rates, timeSuffix) {
    if (!rates)
        return [];
    const snapshotRates = [];
    for (let i = 0; i < rates.length; i++) {
        const rate = schema_1.InterestRate.load(rates[i]);
        if (!rate) {
            graph_ts_1.log.warning("[getSnapshotRates] rate {} not found, should not happen", [
                rates[i],
            ]);
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
function snapshotPosition(position, event) {
    const snapshot = new schema_1.PositionSnapshot(position.id
        .concat("-")
        .concat(event.transaction.hash.toHexString())
        .concat("-")
        .concat(event.logIndex.toString()));
    const market = (0, initializers_1.getMarket)(position.market);
    const inputToken = (0, initializers_1.getOrInitToken)(market.inputToken);
    const poolIndex = position.side === constants_1.PositionSide.COLLATERAL
        ? market._lastPoolSupplyIndex
        : market._lastPoolBorrowIndex;
    const p2pIndex = position.side === constants_1.PositionSide.COLLATERAL
        ? market._p2pSupplyIndex
        : market._p2pBorrowIndex;
    const balanceOnPool = position
        ._balanceOnPool.times(poolIndex ? poolIndex : constants_1.BIGINT_ZERO)
        .div(constants_1.RAY_BI);
    const balanceInP2P = position
        ._balanceInP2P.times(p2pIndex ? p2pIndex : constants_1.BIGINT_ZERO)
        .div(constants_1.RAY_BI);
    const totalBalance = balanceOnPool.plus(balanceInP2P);
    snapshot.hash = event.transaction.hash;
    snapshot.logIndex = event.logIndex.toI32();
    snapshot.nonce = event.transaction.nonce;
    snapshot.position = position.id;
    snapshot.account = position.account;
    snapshot.balance = position.balance;
    snapshot.balanceUSD = totalBalance
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals))
        .times(market.inputTokenPriceUSD);
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    snapshot._balanceOnPool = balanceOnPool;
    snapshot._balanceInP2P = balanceInP2P;
    snapshot._balanceOnPoolUSD = balanceOnPool
        .toBigDecimal()
        .times((0, constants_1.exponentToBigDecimal)(inputToken.decimals))
        .times(market.inputTokenPriceUSD);
    snapshot._balanceInP2PUSD = balanceInP2P
        .toBigDecimal()
        .times((0, constants_1.exponentToBigDecimal)(inputToken.decimals))
        .times(market.inputTokenPriceUSD);
    snapshot.save();
}
/**
 * Updates the protocol position on the underlying pool for the given market
 * @param protocol The Morpho protocol to update
 * @param market The market to update
 */
function updateProtocolPosition(protocol, market) {
    const inputToken = (0, initializers_1.getOrInitToken)(market.inputToken);
    const newMarketSupplyOnPool_BI = market
        ._scaledSupplyOnPool.times(market._reserveSupplyIndex)
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const newMarketSupplyOnPool = newMarketSupplyOnPool_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const newMarketSupplyInP2P_BI = market
        ._scaledSupplyInP2P.times(market._p2pSupplyIndex)
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const newMarketSupplyInP2P = newMarketSupplyInP2P_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const newMarketSupplyCollateral_BI = market._scaledPoolCollateral
        ? market
            ._scaledPoolCollateral.times(market._reserveSupplyIndex)
            .div((0, constants_1.exponentToBigInt)(market._indexesOffset))
        : graph_ts_1.BigInt.zero();
    const newMarketSupplyCollateral = newMarketSupplyCollateral_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const newMarketSupplyUSD = newMarketSupplyOnPool
        .plus(newMarketSupplyInP2P)
        .plus(newMarketSupplyCollateral)
        .times(market.inputTokenPriceUSD);
    const newMarketBorrowOnPool_BI = market
        ._scaledBorrowOnPool.times(market._reserveBorrowIndex)
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const newMarketBorrowOnPool = newMarketBorrowOnPool_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const newMarketBorrowInP2P_BI = market
        ._scaledBorrowInP2P.times(market._p2pBorrowIndex)
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const newMarketBorrowInP2P = newMarketBorrowInP2P_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const newMarketBorrowUSD = newMarketBorrowOnPool
        .plus(newMarketBorrowInP2P)
        .times(market.inputTokenPriceUSD);
    market.variableBorrowedTokenBalance = newMarketBorrowInP2P_BI.plus(newMarketBorrowOnPool_BI);
    market.inputTokenBalance = newMarketSupplyOnPool_BI
        .plus(newMarketSupplyInP2P_BI)
        .plus(newMarketSupplyCollateral_BI);
    market.totalDepositBalanceUSD = newMarketSupplyUSD;
    market.totalBorrowBalanceUSD = newMarketBorrowUSD;
    market.totalValueLockedUSD = newMarketSupplyUSD;
    market._totalSupplyOnPool = newMarketSupplyOnPool;
    market._totalSupplyInP2P = newMarketSupplyInP2P;
    market._totalBorrowOnPool = newMarketBorrowOnPool;
    market._totalCollateralOnPool = newMarketSupplyCollateral;
    market._totalBorrowInP2P = newMarketBorrowInP2P;
    market.save();
}
exports.updateProtocolPosition = updateProtocolPosition;
function computeProportionIdle(market) {
    const offset = (0, constants_1.exponentToBigInt)(market._indexesOffset);
    if (market._idleSupply && market._idleSupply.gt(graph_ts_1.BigInt.zero())) {
        const totalP2PSupplied = market
            ._p2pSupplyAmount.times(market._p2pSupplyIndex)
            .div(offset);
        const proportionIdle = market
            ._idleSupply.times(offset)
            .div(totalP2PSupplied);
        if (proportionIdle.gt(offset))
            return offset;
        return proportionIdle;
    }
    return graph_ts_1.BigInt.zero();
}
function updateP2PRates(market, __MATHS__) {
    const proportionIdle = computeProportionIdle(market);
    const growthFactors = (0, interestRatesModels_1.computeGrowthFactors)(market._reserveSupplyIndex, market._reserveBorrowIndex, market._lastPoolSupplyIndex, market._lastPoolBorrowIndex, market._p2pIndexCursor_BI, market._reserveFactor_BI, __MATHS__);
    market._p2pSupplyIndexFromRates = (0, interestRatesModels_1.computeP2PIndex)(market._lastPoolSupplyIndex, market._p2pSupplyIndex, growthFactors.p2pSupplyGrowthFactor, growthFactors.poolSupplyGrowthFactor, market._p2pSupplyDelta, market._p2pSupplyAmount, proportionIdle, __MATHS__);
    market._p2pBorrowIndexFromRates = (0, interestRatesModels_1.computeP2PIndex)(market._lastPoolBorrowIndex, market._p2pBorrowIndex, growthFactors.p2pBorrowGrowthFactor, growthFactors.poolBorrowGrowthFactor, market._p2pBorrowDelta, market._p2pBorrowAmount, proportionIdle, __MATHS__);
    market._p2pBorrowRate = (0, interestRatesModels_1.computeP2PBorrowRate)(market._poolBorrowRate, market._poolSupplyRate, market._lastPoolBorrowIndex, market._p2pBorrowIndexFromRates, market._p2pIndexCursor_BI, market._p2pBorrowDelta, market._p2pBorrowAmount, market._reserveFactor_BI, proportionIdle, __MATHS__);
    market._p2pSupplyRate = (0, interestRatesModels_1.computeP2PSupplyRate)(market._poolBorrowRate, market._poolSupplyRate, market._lastPoolSupplyIndex, market._p2pSupplyIndexFromRates, market._p2pIndexCursor_BI, market._p2pSupplyDelta, market._p2pSupplyAmount, market._reserveFactor_BI, proportionIdle, __MATHS__);
    const p2pSupplyRate = createInterestRate(market.id, constants_1.InterestRateSide.LENDER, constants_1.InterestRateType.P2P, market
        ._p2pSupplyRate.toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(market._indexesOffset))
        .times(constants_1.BIGDECIMAL_HUNDRED));
    const p2pBorrowRate = createInterestRate(market.id, constants_1.InterestRateSide.BORROWER, constants_1.InterestRateType.P2P, market
        ._p2pBorrowRate.toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(market._indexesOffset))
        .times(constants_1.BIGDECIMAL_HUNDRED));
    market.save();
    if (!market.rates)
        return;
    const rates = market.rates;
    const supplyRateId = rates[0];
    const borrowRateId = rates[3];
    if (!supplyRateId || !borrowRateId)
        return;
    market.rates = [
        supplyRateId,
        p2pSupplyRate.id,
        p2pBorrowRate.id,
        borrowRateId,
    ];
    market.save();
}
exports.updateP2PRates = updateP2PRates;
const getEventId = (hash, logIndex) => hash.concat(graph_ts_1.Bytes.fromI32(logIndex.toI32()));
exports.getEventId = getEventId;
function updateProtocolValues(protocolAddress) {
    const protocol = (0, initializers_1.getOrInitLendingProtocol)(graph_ts_1.Address.fromBytes(protocolAddress)).protocol;
    const marketIds = protocol._marketIds;
    let totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    let totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    let totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    for (let marketIdx = 0; marketIdx < marketIds.length; marketIdx++) {
        const pool = (0, initializers_1.getMarket)(graph_ts_1.Bytes.fromHexString(marketIds[marketIdx]));
        if (!pool)
            continue;
        totalValueLockedUSD = totalValueLockedUSD.plus(pool.totalValueLockedUSD);
        totalDepositBalanceUSD = totalDepositBalanceUSD.plus(pool.totalDepositBalanceUSD);
        totalBorrowBalanceUSD = totalBorrowBalanceUSD.plus(pool.totalBorrowBalanceUSD);
    }
    protocol.totalValueLockedUSD = totalValueLockedUSD;
    protocol.totalDepositBalanceUSD = totalDepositBalanceUSD;
    protocol.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
    protocol.save();
}
exports.updateProtocolValues = updateProtocolValues;
function updateProtocolAfterNewMarket(poolAddress, protocolAddress) {
    const protocol = (0, initializers_1.getOrInitLendingProtocol)(graph_ts_1.Address.fromBytes(protocolAddress)).protocol;
    const marketIds = protocol._marketIds;
    marketIds.push(poolAddress.toHexString());
    protocol._marketIds = marketIds;
    protocol.totalPoolCount += 1;
    protocol.save();
}
exports.updateProtocolAfterNewMarket = updateProtocolAfterNewMarket;
