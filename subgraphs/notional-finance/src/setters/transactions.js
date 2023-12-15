"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiquidate = exports.createRepay = exports.createBorrow = exports.createWithdraw = exports.createDeposit = exports.updatePosition = exports.createPositionSnapshot = exports.closePosition = exports.getOrCreatePosition = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const numbers_1 = require("../common/numbers");
const usageMetrics_1 = require("./usageMetrics");
const protocol_1 = require("../getters/protocol");
const account_1 = require("../getters/account");
const market_1 = require("../getters/market");
const arrays_1 = require("../common/arrays");
const financialMetrics_1 = require("./financialMetrics");
const util_1 = require("../common/util");
const Notional_1 = require("../../generated/Notional/Notional");
function getOrCreatePosition(event, account, market, side) {
    const accountId = account.id;
    const marketId = market.id;
    const positionIdPrefix = `${accountId}-${marketId}-${side}`;
    // return open position if found
    for (let curr = 0; curr < account.openPositionCount; curr += 1) {
        const op = account.openPositions.at(curr);
        if (op.startsWith(positionIdPrefix)) {
            return schema_1.Position.load(op);
        }
    }
    // close position and update position counts
    let count = 0;
    for (let curr = 0; curr < account.closedPositionCount; curr += 1) {
        const cp = account.closedPositions.at(curr);
        if (cp.startsWith(positionIdPrefix)) {
            count += 1;
        }
    }
    // create open position and update position counts
    const positionId = `${accountId}-${market.id}-${side}-${count}`;
    const position = new schema_1.Position(positionId);
    account.openPositionCount += 1;
    account.openPositions = (0, arrays_1.addToArrayAtIndex)(account.openPositions, positionId, 0);
    account.save();
    market.positionCount += 1;
    market.openPositionCount += 1;
    if (side == constants_1.InterestRateSide.LENDER) {
        market.lendingPositionCount += 1;
    }
    else if (side == constants_1.InterestRateSide.BORROWER) {
        market.borrowingPositionCount += 1;
    }
    market.save();
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    protocol.openPositionCount += 1;
    protocol.cumulativePositionCount += 1;
    protocol.save();
    // open position metadata
    position.account = accountId;
    position.market = market.id;
    position.balance = constants_1.BIGINT_ZERO;
    position.side = side;
    position.hashOpened = event.transaction.hash.toHexString();
    position.blockNumberOpened = event.block.number;
    position.timestampOpened = event.block.timestamp;
    position.isCollateral = market.canUseAsCollateral;
    // counts
    position.depositCount = constants_1.INT_ZERO;
    position.borrowCount = constants_1.INT_ZERO;
    position.repayCount = constants_1.INT_ZERO;
    position.withdrawCount = constants_1.INT_ZERO;
    position.liquidationCount = constants_1.INT_ZERO;
    // derived
    // position.deposits = DERIVED;
    // position.borrows = DERIVED;
    // position.withdraws = DERIVED;
    // position.repays = DERIVED;
    // position.liquidations = DERIVED;
    // position.snapshots = DERIVED;
    position.save();
    return position;
}
exports.getOrCreatePosition = getOrCreatePosition;
function closePosition(position, account, market, event) {
    const account_index = account.openPositions.indexOf(position.id);
    account.openPositionCount -= 1;
    account.openPositions = (0, arrays_1.removeFromArrayAtIndex)(account.openPositions, account_index);
    account.closedPositionCount += 1;
    account.closedPositions = (0, arrays_1.addToArrayAtIndex)(account.closedPositions, position.id, 0);
    account.save();
    market.openPositionCount -= 1;
    market.closedPositionCount += 1;
    market.save();
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    protocol.openPositionCount -= 1;
    protocol.save();
    position.hashClosed = event.transaction.hash.toHexString();
    position.blockNumberClosed = event.block.number;
    position.timestampClosed = event.block.timestamp;
    position.save();
}
exports.closePosition = closePosition;
function createPositionSnapshot(position, event) {
    const hash = event.transaction.hash.toHexString();
    const txlogIndex = event.transactionLogIndex.toI32();
    const snapshot = new schema_1.PositionSnapshot(`${position.id}-${hash}-${txlogIndex}`);
    snapshot.position = position.id;
    snapshot.hash = hash;
    snapshot.logIndex = txlogIndex;
    snapshot.nonce = event.transaction.nonce;
    snapshot.balance = position.balance;
    snapshot.blockNumber = event.block.number;
    snapshot.timestamp = event.block.timestamp;
    snapshot.save();
}
exports.createPositionSnapshot = createPositionSnapshot;
function updatePosition(marketId, transactionType, amount, accountId, event, eventId) {
    let closePositionToggle = false;
    const market = (0, market_1.getOrCreateMarket)(event, marketId);
    const account = (0, account_1.getOrCreateAccount)(accountId);
    // interest rate side
    let side = null;
    if ([constants_1.TransactionType.DEPOSIT, constants_1.TransactionType.WITHDRAW].includes(transactionType)) {
        side = constants_1.InterestRateSide.LENDER;
    }
    else if ([constants_1.TransactionType.BORROW, constants_1.TransactionType.REPAY].includes(transactionType)) {
        side = constants_1.InterestRateSide.BORROWER;
    }
    if (!side) {
        graph_ts_1.log.error("[updatePosition] No side available event: {}", [
            event.transaction.hash.toHexString(),
        ]);
        return;
    }
    const position = getOrCreatePosition(event, account, market, side);
    // deposit
    if (transactionType == constants_1.TransactionType.DEPOSIT) {
        account.depositCount = account.depositCount + 1;
        position.depositCount = position.depositCount + 1;
        position.balance = position.balance.plus(amount);
        const deposit = new schema_1.Deposit(eventId);
        deposit.position = position.id;
        deposit.save();
        (0, usageMetrics_1.addAccountToProtocol)(transactionType, account, event);
        // withdraw
    }
    else if (transactionType == constants_1.TransactionType.WITHDRAW) {
        account.withdrawCount = account.withdrawCount + 1;
        position.withdrawCount = position.withdrawCount + 1;
        position.balance = position.balance.minus(amount);
        const withdraw = new schema_1.Withdraw(eventId);
        withdraw.position = position.id;
        withdraw.save();
        if (position.balance.equals(constants_1.BIGINT_ZERO)) {
            closePositionToggle = true;
        }
    }
    else if (transactionType == constants_1.TransactionType.BORROW) {
        account.borrowCount = account.borrowCount + 1;
        position.borrowCount = position.borrowCount + 1;
        position.balance = position.balance.plus(amount);
        const borrow = new schema_1.Borrow(eventId);
        borrow.position = position.id;
        borrow.save();
        (0, usageMetrics_1.addAccountToProtocol)(transactionType, account, event);
        // repay
    }
    else if (transactionType == constants_1.TransactionType.REPAY) {
        account.repayCount = account.repayCount + 1;
        position.repayCount = position.repayCount + 1;
        position.balance = position.balance.minus(amount);
        const repay = new schema_1.Repay(eventId);
        repay.position = position.id;
        repay.save();
    }
    account.save();
    position.save();
    if (position.balance.equals(constants_1.BIGINT_ZERO)) {
        closePositionToggle = true;
    }
    createPositionSnapshot(position, event);
    if (closePositionToggle) {
        closePosition(position, account, market, event);
    }
}
exports.updatePosition = updatePosition;
function createDeposit(event, market, fCashAmount, cTokenAmount, amountUSD) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const deposit = new schema_1.Deposit(id);
    const account = (0, account_1.getOrCreateAccount)(event.transaction.from.toHexString());
    const transactionType = constants_1.TransactionType.DEPOSIT;
    deposit.hash = event.transaction.hash.toHexString();
    deposit.nonce = event.transaction.nonce;
    deposit.logIndex = event.logIndex.toI32();
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.account = account.id;
    deposit.market = market.id;
    // deposit.position updated in updatePosition
    deposit.asset = market.inputToken;
    deposit.amount = fCashAmount;
    deposit.amountUSD = amountUSD;
    deposit.save();
    updatePosition(market.id, transactionType, fCashAmount, account.id, event, deposit.id);
    (0, usageMetrics_1.updateUsageMetrics)(event, event.transaction.from, event.transaction.to, transactionType);
    (0, financialMetrics_1.updateMarket)(market.id, transactionType, cTokenAmount, amountUSD, event);
    (0, financialMetrics_1.updateTVLAndBalances)(event);
    return deposit;
}
exports.createDeposit = createDeposit;
function createWithdraw(event, market, fCashAmount, cTokenAmount, amountUSD) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const withdraw = new schema_1.Withdraw(id);
    const account = (0, account_1.getOrCreateAccount)(event.transaction.from.toHexString());
    const transactionType = constants_1.TransactionType.WITHDRAW;
    withdraw.hash = event.transaction.hash.toHexString();
    withdraw.nonce = event.transaction.nonce;
    withdraw.logIndex = event.logIndex.toI32();
    withdraw.blockNumber = event.block.number;
    withdraw.timestamp = event.block.timestamp;
    withdraw.account = account.id;
    withdraw.market = market.id;
    // withdraw.position updated in updatePosition
    withdraw.asset = market.inputToken;
    withdraw.amount = fCashAmount;
    withdraw.amountUSD = amountUSD;
    withdraw.save();
    updatePosition(market.id, transactionType, fCashAmount, account.id, event, withdraw.id);
    (0, usageMetrics_1.updateUsageMetrics)(event, event.transaction.from, event.transaction.to, transactionType);
    (0, financialMetrics_1.updateMarket)(market.id, transactionType, cTokenAmount, amountUSD, event);
    (0, financialMetrics_1.updateTVLAndBalances)(event);
    return withdraw;
}
exports.createWithdraw = createWithdraw;
function createBorrow(event, market, fCashAmount, cTokenAmount, amountUSD) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const borrow = new schema_1.Borrow(id);
    const account = (0, account_1.getOrCreateAccount)(event.transaction.from.toHexString());
    const transactionType = constants_1.TransactionType.BORROW;
    borrow.hash = event.transaction.hash.toHexString();
    borrow.nonce = event.transaction.nonce;
    borrow.logIndex = event.logIndex.toI32();
    borrow.blockNumber = event.block.number;
    borrow.timestamp = event.block.timestamp;
    borrow.account = account.id;
    borrow.market = market.id;
    // borrow.position updated in updatePosition
    borrow.asset = market.inputToken;
    borrow.amount = fCashAmount;
    borrow.amountUSD = amountUSD;
    borrow.save();
    updatePosition(market.id, transactionType, fCashAmount, account.id, event, borrow.id);
    (0, usageMetrics_1.updateUsageMetrics)(event, event.transaction.from, event.transaction.to, transactionType);
    (0, financialMetrics_1.updateMarket)(market.id, transactionType, cTokenAmount, amountUSD, event);
    (0, financialMetrics_1.updateTVLAndBalances)(event);
    return borrow;
}
exports.createBorrow = createBorrow;
function createRepay(event, market, fCashAmount, cTokenAmount, amountUSD) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const repay = new schema_1.Repay(id);
    const account = (0, account_1.getOrCreateAccount)(event.transaction.from.toHexString());
    const transactionType = constants_1.TransactionType.REPAY;
    repay.hash = event.transaction.hash.toHexString();
    repay.nonce = event.transaction.nonce;
    repay.logIndex = event.logIndex.toI32();
    repay.blockNumber = event.block.number;
    repay.timestamp = event.block.timestamp;
    repay.account = account.id;
    repay.market = market.id;
    // repay.position updated in updatePosition
    repay.asset = market.inputToken;
    repay.amount = fCashAmount;
    repay.amountUSD = amountUSD;
    repay.save();
    updatePosition(market.id, transactionType, fCashAmount, account.id, event, repay.id);
    (0, usageMetrics_1.updateUsageMetrics)(event, event.transaction.from, event.transaction.to, transactionType);
    (0, financialMetrics_1.updateMarket)(market.id, transactionType, cTokenAmount, amountUSD, event);
    (0, financialMetrics_1.updateTVLAndBalances)(event);
    return repay;
}
exports.createRepay = createRepay;
function createLiquidate(event, 
// market: Market,            // market isn't available in liquidation events
currencyId, liquidator, liquidatee, cTokenAmount) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const token = (0, util_1.getTokenFromCurrency)(event, currencyId.toString());
    const liquidate = new schema_1.Liquidate(id);
    const liquidatorAccount = (0, account_1.getOrCreateAccount)(liquidator.toHexString());
    const liquidateeAccount = (0, account_1.getOrCreateAccount)(liquidatee.toHexString());
    liquidate.hash = event.transaction.hash.toHexString();
    liquidate.nonce = event.transaction.nonce;
    liquidate.logIndex = event.logIndex.toI32();
    liquidate.blockNumber = event.block.number;
    liquidate.timestamp = event.block.timestamp;
    liquidate.liquidator = liquidatorAccount.id;
    liquidate.liquidatee = liquidateeAccount.id;
    liquidate.asset = token.id;
    liquidate.amount = (0, numbers_1.bigIntToBigDecimal)(cTokenAmount, token.decimals);
    liquidate.amountUSD = liquidate.amount.times(token.lastPriceUSD);
    // get liquidation discount and set profit
    const notional = Notional_1.Notional.bind(graph_ts_1.Address.fromString(constants_1.PROTOCOL_ID));
    const rateStorageCall = notional.try_getRateStorage(currencyId);
    if (rateStorageCall.reverted) {
        graph_ts_1.log.error("[handleLendBorrowTrade] getRateStorage for currencyId {} reverted", [currencyId.toString()]);
    }
    else {
        const liquidationDiscount = graph_ts_1.BigDecimal.fromString((rateStorageCall.value.getEthRate().liquidationDiscount - constants_1.INT_HUNDRED).toString()).div(constants_1.BIGDECIMAL_HUNDRED);
        liquidate.profitUSD = liquidate.amountUSD.times(liquidationDiscount);
    }
    liquidate.save();
    (0, usageMetrics_1.updateUsageMetrics)(event, event.transaction.from, event.transaction.to, constants_1.TransactionType.LIQUIDATEE);
    // separate calls for readability
    (0, usageMetrics_1.addAccountToProtocol)(constants_1.TransactionType.LIQUIDATEE, liquidateeAccount, event);
    (0, usageMetrics_1.addAccountToProtocol)(constants_1.TransactionType.LIQUIDATOR, liquidatorAccount, event);
    // BLOCKER: cannot update these metrics without market id
    // updateMarket(market.id, transactionType, cTokenAmount, amountUSD, event);
    return liquidate;
}
exports.createLiquidate = createLiquidate;
