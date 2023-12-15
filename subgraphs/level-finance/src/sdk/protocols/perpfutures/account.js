"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = exports.AccountWasActive = exports.AccountManager = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("../../util/constants"));
const enums_1 = require("./enums");
const events_1 = require("../../util/events");
const schema_1 = require("../../../../generated/schema");
/**
 * This file contains the AccountClass, which does
 * the operations on the Account entity. This includes:
 *  - Creating a new Account
 *  - Updating an existing Account
 *  - Making a position
 *  - Making position snapshots
 *
 * Schema Version:  1.3.3
 * SDK Version:     1.1.6
 * Author(s):
 *  - @harsh9200
 *  - @dhruv-chauhan
 *  - @melotik
 */
class LoadAccountResponse {
    constructor(account, isNewUser) {
        this.account = account;
        this.isNewUser = isNewUser;
    }
}
class AccountManager {
    constructor(protocol, tokens) {
        this.protocol = protocol;
        this.tokens = tokens;
    }
    loadAccount(address) {
        let isNewUser = false;
        let entity = schema_1.Account.load(address);
        if (!entity) {
            isNewUser = true;
            entity = new schema_1.Account(address);
            entity.cumulativeEntryPremiumUSD = constants.BIGDECIMAL_ZERO;
            entity.cumulativeExitPremiumUSD = constants.BIGDECIMAL_ZERO;
            entity.cumulativeTotalPremiumUSD = constants.BIGDECIMAL_ZERO;
            entity.cumulativeDepositPremiumUSD = constants.BIGDECIMAL_ZERO;
            entity.cumulativeWithdrawPremiumUSD = constants.BIGDECIMAL_ZERO;
            entity.cumulativeTotalLiquidityPremiumUSD = constants.BIGDECIMAL_ZERO;
            entity.longPositionCount = 0;
            entity.shortPositionCount = 0;
            entity.openPositionCount = 0;
            entity.closedPositionCount = 0;
            entity.cumulativeUniqueLiquidatees = 0;
            entity.depositCount = 0;
            entity.withdrawCount = 0;
            entity.borrowCount = 0;
            entity.swapCount = 0;
            entity.collateralInCount = 0;
            entity.collateralOutCount = 0;
            entity.liquidateCount = 0;
            entity.liquidationCount = 0;
            entity.save();
        }
        const account = new Account(this.protocol, entity, this.tokens);
        return new LoadAccountResponse(account, isNewUser);
    }
}
exports.AccountManager = AccountManager;
class AccountWasActive {
}
exports.AccountWasActive = AccountWasActive;
class Account {
    constructor(protocol, account, tokens) {
        this.pool = null;
        this.account = account;
        this.protocol = protocol;
        this.tokens = tokens;
        this.event = protocol.getCurrentEvent();
    }
    getIdFromEvent(type) {
        return graph_ts_1.Bytes.fromUTF8(type.toLowerCase())
            .concat(graph_ts_1.Bytes.fromUTF8("-"))
            .concat(this.event.transaction.hash)
            .concat(graph_ts_1.Bytes.fromUTF8("-"))
            .concatI32(this.event.logIndex.toI32());
    }
    getAmountUSD(tokens, amounts) {
        let amountUSD = constants.BIGDECIMAL_ZERO;
        if (tokens.length != amounts.length)
            return amountUSD;
        for (let idx = 0; idx < tokens.length; idx++) {
            const token = this.tokens.getOrCreateToken(graph_ts_1.Address.fromBytes(tokens[idx]));
            amountUSD = amountUSD.plus(this.protocol
                .getTokenPricer()
                .getAmountValueUSD(token, amounts[idx], this.protocol.event.block));
        }
        return amountUSD;
    }
    isActiveByActivityID(id) {
        let dAct = schema_1.ActiveAccount.load(id);
        if (dAct)
            return false;
        dAct = new schema_1.ActiveAccount(id);
        dAct.save();
        return true;
    }
    trackActivity(activityType) {
        const days = (0, events_1.getUnixDays)(this.event.block);
        const hours = (0, events_1.getUnixHours)(this.event.block);
        const generalHourlyID = `${this.account.id.toHexString()}-hourly-${hours}`;
        const generalDailyID = `${this.account.id.toHexString()}-daily-${days}`;
        const generalActivity = {
            daily: this.isActiveByActivityID(graph_ts_1.Bytes.fromUTF8(generalDailyID)),
            hourly: this.isActiveByActivityID(graph_ts_1.Bytes.fromUTF8(generalHourlyID)),
        };
        const typeHourlyID = `${this.account.id.toHexString()}-hourly-${hours}-${activityType}`;
        const typeDailyID = `${this.account.id.toHexString()}-daily-${days}-${activityType}`;
        const typeActivity = {
            daily: this.isActiveByActivityID(graph_ts_1.Bytes.fromUTF8(typeDailyID)),
            hourly: this.isActiveByActivityID(graph_ts_1.Bytes.fromUTF8(typeHourlyID)),
        };
        if (activityType == enums_1.ActivityType.DEPOSIT) {
            this.protocol.addActiveDepositor(typeActivity);
        }
        else if (activityType == enums_1.ActivityType.BORROW) {
            this.protocol.addActiveBorrower(typeActivity);
        }
        else if (activityType == enums_1.ActivityType.LIQUIDATOR) {
            this.protocol.addActiveLiquidator(typeActivity);
        }
        else if (activityType == enums_1.ActivityType.LIQUIDATEE) {
            this.protocol.addActiveLiquidatee(typeActivity);
        }
        this.protocol.addActiveUser(generalActivity);
    }
    getBytesId() {
        return this.account.id;
    }
    /**
     *
     * @param pool The pool where the liquidity was deposited.
     * @param amounts The amount deposited of inputTokens.
     * @param sharesMinted The amount of shares minted of outputToken.
     * @param updateMetrics Optional, defaults to true. If true it will update the protocol and pool's deposit and transaction count.
     * @returns Deposit
     */
    deposit(pool, amounts, sharesMinted, updateMetrics = true) {
        const depositId = this.getIdFromEvent(enums_1.EventType.DEPOSIT);
        const deposit = new schema_1.Deposit(depositId);
        if (amounts.length != pool.getInputTokens().length) {
            graph_ts_1.log.critical("[Account][Deposit] Pool:{} inputTokens length does not match deposit amount array length", [pool.getBytesID().toHexString()]);
        }
        deposit.hash = this.event.transaction.hash;
        deposit.logIndex = this.event.logIndex.toI32();
        deposit.protocol = this.protocol.getBytesID();
        deposit.to = pool.getBytesID();
        deposit.from = this.account.id;
        deposit.account = this.account.id;
        deposit.blockNumber = this.event.block.number;
        deposit.timestamp = this.event.block.timestamp;
        deposit.inputTokens = pool.getInputTokens();
        deposit.outputToken = pool.getOutputToken();
        deposit.inputTokenAmounts = amounts;
        deposit.outputTokenAmount = sharesMinted;
        deposit.amountUSD = this.getAmountUSD(pool.getInputTokens(), amounts);
        deposit.pool = pool.getBytesID();
        deposit.save();
        if (updateMetrics) {
            this.pool = pool;
            this.countDeposit();
            this.protocol.addTransaction(enums_1.TransactionType.DEPOSIT);
        }
        return deposit;
    }
    /**
     *
     * @param pool The pool where the liquidity was withdrawn.
     * @param amounts The amount withdrawn of inputTokens.
     * @param sharesBurnt The amount of shares burnt of outputToken.
     * @param updateMetrics Optional, defaults to true. If true it will update the protocol withdraw and transaction count.
     * @returns Withdraw
     */
    withdraw(pool, amounts, sharesBurnt, updateMetrics = true) {
        const withdrawId = this.getIdFromEvent(enums_1.EventType.WITHDRAW);
        const withdraw = new schema_1.Withdraw(withdrawId);
        if (amounts.length != pool.getInputTokens().length) {
            graph_ts_1.log.critical("[Account][Withdraw] Pool:{} inputTokens length does not match Withdraw amount array length", [pool.getBytesID().toHexString()]);
        }
        withdraw.hash = this.event.transaction.hash;
        withdraw.logIndex = this.event.logIndex.toI32();
        withdraw.protocol = this.protocol.getBytesID();
        withdraw.to = this.account.id;
        withdraw.from = pool.getBytesID();
        withdraw.account = this.account.id;
        withdraw.blockNumber = this.event.block.number;
        withdraw.timestamp = this.event.block.timestamp;
        withdraw.inputTokens = pool.getInputTokens();
        withdraw.outputToken = pool.getOutputToken();
        withdraw.inputTokenAmounts = amounts;
        withdraw.outputTokenAmount = sharesBurnt;
        withdraw.amountUSD = this.getAmountUSD(pool.getInputTokens(), amounts);
        withdraw.pool = pool.getBytesID();
        withdraw.save();
        if (updateMetrics) {
            this.pool = pool;
            this.countWithdraw();
            this.protocol.addTransaction(enums_1.TransactionType.WITHDRAW);
        }
        return withdraw;
    }
    /**
     *
     * @param pool The pool where the liquidity was swapped.
     * @param tokenIn The token deposited into the pool.
     * @param amountIn The token amount deposited into the pool.
     * @param tokenIn The token withdrawn from the pool.
     * @param amountIn The token amount withdrawn from the pool.
     * @param tradingPair  The contract address for the trading pair or pool.
     * @param updateMetrics Optional, defaults to true. If true it will update the protocol swap and transaction count.
     * @returns Swap
     */
    swap(pool, tokenIn, amountIn, tokenOut, amountOut, tradingPair, updateMetrics = true) {
        const swapId = this.getIdFromEvent(enums_1.EventType.SWAP);
        const swap = new schema_1.Swap(swapId);
        swap.hash = this.event.transaction.hash;
        swap.logIndex = this.event.logIndex.toI32();
        swap.protocol = this.protocol.getBytesID();
        swap.to = pool.getBytesID();
        swap.from = this.account.id;
        swap.account = this.account.id;
        swap.blockNumber = this.event.block.number;
        swap.timestamp = this.event.block.timestamp;
        swap.tokenIn = tokenIn;
        swap.amountIn = amountIn;
        swap.amountInUSD = this.protocol
            .getTokenPricer()
            .getAmountValueUSD(this.tokens.getOrCreateToken(tokenIn), amountIn, this.protocol.event.block);
        swap.tokenOut = tokenOut;
        swap.amountOut = amountOut;
        swap.amountOutUSD = this.protocol
            .getTokenPricer()
            .getAmountValueUSD(this.tokens.getOrCreateToken(tokenOut), amountOut, this.protocol.event.block);
        swap.tradingPair = tradingPair;
        swap.pool = pool.getBytesID();
        swap.save();
        if (updateMetrics) {
            this.pool = pool;
            this.countSwap();
            this.protocol.addTransaction(enums_1.TransactionType.SWAP);
        }
        return swap;
    }
    /**
     *
     * @param pool The pool where the liquidity was swapped.
     * @param tokenIn The token deposited into the pool.
     * @param amountIn The token amount deposited into the pool.
     * @param tokenIn The token withdrawn from the pool.
     * @param amountIn The token amount withdrawn from the pool.
     * @param tradingPair  The contract address for the trading pair or pool.
     * @param updateMetrics Optional, defaults to true. If true it will update the pool and protocol TVL and inputTokenBalance.
     * @returns Borrow
     */
    borrow(pool, position, asset, amount, updateMetrics = true) {
        const borrowId = this.getIdFromEvent(enums_1.EventType.SWAP);
        const borrow = new schema_1.Borrow(borrowId);
        borrow.hash = this.event.transaction.hash;
        borrow.logIndex = this.event.logIndex.toI32();
        borrow.protocol = this.protocol.getBytesID();
        borrow.position = position;
        borrow.to = pool.getBytesID();
        borrow.from = this.account.id;
        borrow.blockNumber = this.event.block.number;
        borrow.timestamp = this.event.block.timestamp;
        borrow.account = this.account.id;
        borrow.asset = asset;
        borrow.amount = amount;
        borrow.amountUSD = this.protocol
            .getTokenPricer()
            .getAmountValueUSD(this.tokens.getOrCreateToken(asset), amount, this.protocol.event.block);
        borrow.pool = pool.getBytesID();
        borrow.save();
        if (updateMetrics) {
            this.pool = pool;
            this.countBorrow();
            this.protocol.addTransaction(enums_1.TransactionType.BORROW);
        }
        return borrow;
    }
    /**
     *
     * @param pool The pool where the collateral was deposited.
     * @param position
     * @param amounts The amount deposited of inputTokens.
     * @param sharesMinted The amount of shares minted of outputToken.
     * @param updateMetrics Optional, defaults to true. If true it will update the pool and protocol TVL and inputTokenBalance.
     * @returns CollateralIn
     */
    collateralIn(pool, position, amounts, sharesMinted, updateMetrics = true) {
        const collateralId = this.getIdFromEvent(enums_1.EventType.DEPOSIT);
        const collateralIn = new schema_1.CollateralIn(collateralId);
        if (amounts.length != pool.getInputTokens().length) {
            graph_ts_1.log.critical("[Account][collateralIn] Pool:{} inputTokens length does not match collateralIn amount array length", [pool.getBytesID().toHexString()]);
        }
        collateralIn.hash = this.event.transaction.hash;
        collateralIn.logIndex = this.event.logIndex.toI32();
        collateralIn.protocol = this.protocol.getBytesID();
        collateralIn.position = position;
        collateralIn.to = pool.getBytesID();
        collateralIn.from = this.account.id;
        collateralIn.account = this.account.id;
        collateralIn.blockNumber = this.event.block.number;
        collateralIn.timestamp = this.event.block.timestamp;
        collateralIn.inputTokens = pool.getInputTokens();
        collateralIn.outputToken = pool.getOutputToken();
        collateralIn.inputTokenAmounts = amounts;
        collateralIn.outputTokenAmount = sharesMinted;
        collateralIn.amountUSD = this.getAmountUSD(pool.getInputTokens(), amounts);
        collateralIn.pool = pool.getBytesID();
        collateralIn.save();
        if (updateMetrics) {
            this.pool = pool;
            this.countCollateralIn();
            this.protocol.addTransaction(enums_1.TransactionType.COLLATERAL_IN);
        }
        return collateralIn;
    }
    /**
     *
     * @param pool The pool where the collateral was withdrawn.
     * @param position The position this transaction belongs to as relates to Long or Short but not LP.
     * @param amounts The amount withdrawn of inputTokens.
     * @param sharesMinted The amount of shares burnt of outputToken.
     * @param updateMetrics Optional, defaults to true. If true it will update the pool and protocol TVL and inputTokenBalance.
     * @returns CollateralOut
     */
    collateralOut(pool, position, amounts, sharesBurnt, updateMetrics = true) {
        const collateralId = this.getIdFromEvent(enums_1.EventType.WITHDRAW);
        const collateralOut = new schema_1.CollateralOut(collateralId);
        if (amounts.length != pool.getInputTokens().length) {
            graph_ts_1.log.critical("[Account][collateralOut] Pool:{} inputTokens length does not match collateralOut amount array length", [pool.getBytesID().toHexString()]);
        }
        collateralOut.hash = this.event.transaction.hash;
        collateralOut.logIndex = this.event.logIndex.toI32();
        collateralOut.protocol = this.protocol.getBytesID();
        collateralOut.position = position;
        collateralOut.to = this.account.id;
        collateralOut.from = pool.getBytesID();
        collateralOut.account = this.account.id;
        collateralOut.blockNumber = this.event.block.number;
        collateralOut.timestamp = this.event.block.timestamp;
        collateralOut.inputTokens = pool.getInputTokens();
        collateralOut.outputToken = pool.getOutputToken();
        collateralOut.inputTokenAmounts = amounts;
        collateralOut.outputTokenAmount = sharesBurnt;
        collateralOut.amountUSD = this.getAmountUSD(pool.getInputTokens(), amounts);
        collateralOut.pool = pool.getBytesID();
        collateralOut.save();
        if (updateMetrics) {
            this.pool = pool;
            this.countCollateralOut();
            this.protocol.addTransaction(enums_1.TransactionType.COLLATERAL_OUT);
        }
        return collateralOut;
    }
    /**
     *
     * @param pool The pool where the liquidation happened.
     * @param asset Asset repaid (borrowed)
     * @param collateralToken Token which was the collateral
     * @param amountLiquidated Amount of collateral liquidated in native units
     * @param liquidator Account that carried out the liquidation
     * @param liquidatee Account that got liquidated
     * @param position The position this Liquidate belongs to
     * @param profitUSD Amount of profit from liquidation in USD
     * @param updateMetrics Optional, defaults to true. If true it will update the pool and protocol TVL and inputTokenBalance.
     * @returns Liquidate
     */
    liquidate(pool, asset, collateralToken, amountLiquidated, liquidator, liquidatee, position, profitUSD, updateMetrics = true) {
        const liquidateId = this.getIdFromEvent(enums_1.EventType.LIQUIDATE);
        const liquidate = new schema_1.Liquidate(liquidateId);
        liquidate.hash = this.event.transaction.hash;
        liquidate.logIndex = this.event.logIndex.toI32();
        liquidate.protocol = this.protocol.getBytesID();
        liquidate.position = position;
        liquidate.to = liquidator;
        liquidate.from = liquidatee;
        liquidate.blockNumber = this.event.block.number;
        liquidate.timestamp = this.event.block.timestamp;
        liquidate.account = liquidator;
        liquidate.liquidatee = liquidatee;
        liquidate.asset = asset;
        liquidate.amount = amountLiquidated;
        liquidate.amountUSD = this.protocol
            .getTokenPricer()
            .getAmountValueUSD(this.tokens.getOrCreateToken(collateralToken), amountLiquidated, this.protocol.event.block);
        liquidate.profitUSD = profitUSD;
        liquidate.pool = pool.getBytesID();
        liquidate.save();
        if (updateMetrics) {
            this.pool = pool;
            this.countLiquidatee();
            this.countLiquidator(liquidator);
            this.protocol.addTransaction(enums_1.TransactionType.LIQUIDATE);
        }
        return liquidate;
    }
    /**
     * Adds 1 to the account total deposit count. If it is the first deposit ever
     * and the account has not withdrawn before it will also increase
     * the number of unique depositors in the protocol and pool.
     */
    countDeposit() {
        if (this.account.depositCount == 0) {
            this.protocol.addDepositor();
            if (this.pool)
                this.pool.addDepositor();
        }
        this.account.depositCount += 1;
        this.account.save();
        this.trackActivity(enums_1.ActivityType.DEPOSIT);
    }
    /**
     * Adds 1 to the account total withdraw count.
     */
    countWithdraw() {
        this.account.withdrawCount += 1;
        this.account.save();
    }
    /**
     * Adds 1 to the account total borrow count. If it is the first borrow ever
     * and the account has not borrowed before it will also increase
     * the number of unique borrowers in the protocol and pool.
     */
    countBorrow() {
        if (this.account.borrowCount == 0) {
            this.protocol.addBorrower();
            if (this.pool)
                this.pool.addBorrower();
        }
        this.account.borrowCount += 1;
        this.account.save();
        this.trackActivity(enums_1.ActivityType.BORROW);
    }
    /**
     * Adds 1 to the account total swap count.
     */
    countSwap() {
        this.account.swapCount += 1;
        this.account.save();
    }
    /**
     * Adds 1 to the account total collateralIn count.
     */
    countCollateralIn() {
        this.account.collateralInCount += 1;
        this.account.save();
    }
    /**
     * Adds 1 to the account total collateralOut count.
     */
    countCollateralOut() {
        this.account.collateralOutCount += 1;
        this.account.save();
    }
    /**
     * Adds 1 to the account total liquidation count. If it is the first liquidation ever
     * it will also increase the number of unique liquidation in the protocol and the associated pool.
     */
    countLiquidator(liquidator) {
        let entity = schema_1.Account.load(liquidator);
        if (!entity) {
            const accountManager = new AccountManager(this.protocol, this.tokens);
            accountManager.loadAccount(liquidator);
            entity = schema_1.Account.load(liquidator);
        }
        if (entity.liquidateCount == 0) {
            this.protocol.addLiquidator();
            if (this.pool)
                this.pool.addLiquidator();
        }
        entity.liquidateCount += 1;
        entity.save();
        this.trackActivity(enums_1.ActivityType.LIQUIDATOR);
    }
    /**
     * Adds 1 to the account total liquidatee count. If it is the first liquidatee ever
     * it will also increase the number of unique liquidatee in the protocol and the associated pool.
     */
    countLiquidatee() {
        if (this.account.liquidationCount == 0) {
            this.protocol.addLiquidatee();
            if (this.pool)
                this.pool.addLiquidatee();
        }
        this.account.liquidationCount += 1;
        this.account.save();
        this.trackActivity(enums_1.ActivityType.LIQUIDATEE);
    }
    openPosition(positionSide) {
        if (positionSide == constants.PositionSide.LONG) {
            this.account.longPositionCount += 1;
        }
        else {
            this.account.shortPositionCount += 1;
        }
        this.account.openPositionCount += 1;
        this.account.save();
    }
    closePosition(positionSide) {
        if (positionSide == constants.PositionSide.LONG) {
            this.account.longPositionCount -= 1;
        }
        else {
            this.account.shortPositionCount -= 1;
        }
        this.account.openPositionCount -= 1;
        this.account.closedPositionCount += 1;
        this.account.save();
    }
}
exports.Account = Account;
