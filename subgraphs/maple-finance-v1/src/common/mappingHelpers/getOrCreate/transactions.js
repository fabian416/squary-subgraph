"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnstake = exports.createStake = exports.createLiquidate = exports.createRepay = exports.createBorrow = exports.createClaim = exports.createWithdraw = exports.createDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../generated/schema");
const Pool_1 = require("../../../../generated/templates/Pool/Pool");
const constants_1 = require("../../constants");
const prices_1 = require("../../prices/prices");
const utils_1 = require("../../utils");
const usage_1 = require("../update/usage");
const markets_1 = require("./markets");
const supporting_1 = require("./supporting");
/**
 * Create deposit entity for deposit into the market
 * @param market market depositing into
 * @param amountMPTMinted amount of LP tokens that were minted on the deposit
 * @returns deposit entity
 */
function createDeposit(event, market, amountMPTMinted) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const deposit = new schema_1.Deposit(id);
    const asset = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const accountAddress = event.transaction.from;
    deposit.hash = event.transaction.hash.toHexString();
    deposit.logIndex = event.logIndex.toI32();
    deposit.protocol = constants_1.PROTOCOL_ID;
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.market = market.id;
    deposit.asset = asset.id;
    deposit.from = accountAddress.toHexString();
    deposit.to = market._liquidityLockerAddress;
    deposit._amountMPT = amountMPTMinted;
    deposit.amount = (0, utils_1.bigDecimalToBigInt)(deposit._amountMPT.toBigDecimal().times(market._initialExchangeRate));
    deposit.amountUSD = (0, prices_1.getTokenAmountInUSD)(event, asset, deposit.amount);
    deposit.save();
    (0, usage_1.updateUsageMetrics)(event, accountAddress, constants_1.TransactionType.DEPOSIT);
    return deposit;
}
exports.createDeposit = createDeposit;
/**
 * Create withdraw entity for withdrawing principal out of the market, this also includes recognizing unrecognized pool losses
 * @param market market withdrawing out of into
 * @param amountMPTMinted amount of LP tokens that were burned on the withdraw
 * @param oldRecognizedLosses amount of recognized losses for the account before this withdraw
 * @returns withdraw entity
 */
function createWithdraw(event, market, amountMPTBurned, oldRecognizedLosses) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const withdraw = new schema_1.Withdraw(id);
    const asset = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const accountAddress = event.transaction.from;
    const poolContract = Pool_1.Pool.bind(graph_ts_1.Address.fromString(market.id));
    const newRecognizedLosses = (0, utils_1.readCallResult)(poolContract.try_recognizedLossesOf(accountAddress), constants_1.ZERO_BI, poolContract.recognizedLossesOf.name);
    const losses = newRecognizedLosses.minus(oldRecognizedLosses);
    const losslessAmount = (0, utils_1.bigDecimalToBigInt)(amountMPTBurned.toBigDecimal().times(market._initialExchangeRate));
    withdraw.hash = event.transaction.hash.toHexString();
    withdraw.logIndex = event.logIndex.toI32();
    withdraw.protocol = constants_1.PROTOCOL_ID;
    withdraw.blockNumber = event.block.number;
    withdraw.timestamp = event.block.timestamp;
    withdraw.market = market.id;
    withdraw.asset = asset.id;
    withdraw.from = market._liquidityLockerAddress;
    withdraw.to = accountAddress.toHexString(); // from since its a burn
    withdraw._amountMPT = amountMPTBurned;
    withdraw._losses = losses;
    withdraw.amount = losslessAmount.minus(withdraw._losses);
    withdraw.amountUSD = (0, prices_1.getTokenAmountInUSD)(event, asset, withdraw.amount);
    withdraw.save();
    (0, usage_1.updateUsageMetrics)(event, accountAddress, constants_1.TransactionType.WITHDRAW);
    return withdraw;
}
exports.createWithdraw = createWithdraw;
/**
 * Create claim entity for claiming interest from a market
 * @param market market claiming interest from
 * @param amount amount of interest in market input tokens being claimed
 * @returns claim entity
 */
function createClaim(event, market, amount) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const claim = new schema_1._Claim(id);
    const asset = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const account = event.transaction.from;
    claim.hash = event.transaction.hash.toHexString();
    claim.logIndex = event.logIndex.toI32();
    claim.protocol = constants_1.PROTOCOL_ID;
    claim.blockNumber = event.block.number;
    claim.timestamp = event.block.timestamp;
    claim.market = market.id;
    claim.asset = market.inputToken;
    claim.from = market._liquidityLockerAddress;
    claim.to = account.toHexString();
    claim.amount = amount;
    claim.amountUSD = (0, prices_1.getTokenAmountInUSD)(event, asset, claim.amount);
    claim.save();
    (0, usage_1.updateUsageMetrics)(event, account, constants_1.TransactionType.CLAIM);
    return claim;
}
exports.createClaim = createClaim;
/**
 * Create borrow entity for borrowing from a loan
 * @param loan loan that is being borrowed from
 * @param amount amount being borrowed in pool input tokens
 * @param treasuryFeePaid amount being sent to treasury for establishment fee
 * @returns borrow entity
 */
function createBorrow(event, loan, amount, treasuryFeePaid) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const borrow = new schema_1.Borrow(id);
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(loan.market));
    const asset = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const accountAddress = event.transaction.from;
    borrow.hash = event.transaction.hash.toHexString();
    borrow.logIndex = event.logIndex.toI32();
    borrow.protocol = constants_1.PROTOCOL_ID;
    borrow.blockNumber = event.block.number;
    borrow.timestamp = event.block.timestamp;
    borrow._loan = loan.id;
    borrow.market = market.id;
    borrow.asset = market.inputToken;
    borrow.from = loan.id;
    borrow.to = accountAddress.toHexString(); // They were the ones that triggered the drawdown
    borrow.amount = amount;
    borrow.amountUSD = (0, prices_1.getTokenAmountInUSD)(event, asset, borrow.amount);
    borrow._treasuryFeePaid = treasuryFeePaid;
    borrow._treasuryFeePaidUSD = (0, prices_1.getTokenAmountInUSD)(event, asset, treasuryFeePaid);
    borrow.save();
    (0, usage_1.updateUsageMetrics)(event, accountAddress, constants_1.TransactionType.BORROW);
    return borrow;
}
exports.createBorrow = createBorrow;
/**
 * Create repay entity for making a payment on a loan
 * @param loan loan to repayment is to
 * @param principalPaid princiapal repaid
 * @param interestPaid interest repaid, this includes both pool delegate and pool interest
 * @param treasuryFeePaid treasury fee paid (V3 only)
 * @returns repay entity
 */
function createRepay(event, loan, principalPaid, interestPaid, treasuryFeePaid) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const repay = new schema_1.Repay(id);
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(loan.market));
    const asset = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const accountAddress = event.transaction.from;
    repay.hash = event.transaction.hash.toHexString();
    repay.logIndex = event.logIndex.toI32();
    repay.protocol = constants_1.PROTOCOL_ID;
    repay.blockNumber = event.block.number;
    repay.timestamp = event.block.timestamp;
    repay._loan = loan.id;
    repay.market = market.id;
    repay.asset = asset.id;
    repay.from = accountAddress.toHexString();
    repay.to = loan.id;
    repay._principalPaid = principalPaid;
    repay._interestPaid = interestPaid;
    repay._treasuryFeePaid = treasuryFeePaid;
    repay._treasuryFeePaidUSD = (0, prices_1.getTokenAmountInUSD)(event, asset, treasuryFeePaid);
    repay.amount = principalPaid.plus(interestPaid).plus(treasuryFeePaid);
    repay.amountUSD = (0, prices_1.getTokenAmountInUSD)(event, asset, repay.amount);
    repay.save();
    (0, usage_1.updateUsageMetrics)(event, accountAddress, constants_1.TransactionType.REPAY);
    return repay;
}
exports.createRepay = createRepay;
/**
 * Create liquidated entity for liquidation of a loan hitting.
 * Liquidation is considered portion hitting the stake locker and pool
 * @param loan loan that defaulted
 * @param defaultSufferedByStakeLocker default suffered by the stake locker
 * @param defaultsufferedByPool default suffered by the pool
 * @returns liquidation entity
 */
function createLiquidate(event, loan, defaultSufferedByStakeLocker, defaultsufferedByPool) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const liquidate = new schema_1.Liquidate(id);
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(loan.market));
    const asset = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const accountAddress = event.transaction.from;
    liquidate.hash = event.transaction.hash.toHexString();
    liquidate.logIndex = event.logIndex.toI32();
    liquidate.protocol = constants_1.PROTOCOL_ID;
    liquidate.blockNumber = event.block.number;
    liquidate.timestamp = event.block.timestamp;
    liquidate.market = market.id;
    liquidate.asset = market.inputToken;
    liquidate.from = market._stakeLocker;
    liquidate.to = market._liquidityLockerAddress;
    liquidate.liquidatee = loan.borrower;
    liquidate._defaultSufferedByStakeLocker = defaultSufferedByStakeLocker;
    liquidate._defaultSufferedByPool = defaultsufferedByPool;
    liquidate.amount = liquidate._defaultSufferedByStakeLocker.plus(liquidate._defaultSufferedByPool);
    liquidate.amountUSD = (0, prices_1.getTokenAmountInUSD)(event, asset, liquidate.amount);
    liquidate.profitUSD = constants_1.ZERO_BD;
    liquidate.save();
    (0, usage_1.updateUsageMetrics)(event, accountAddress, constants_1.TransactionType.LIQUIDATE);
    return liquidate;
}
exports.createLiquidate = createLiquidate;
/**
 * Create stake entity for staking to stake locker, or mpl rewards
 * @param market market the stake belongs to
 * @param stakeToken token being staked
 * @param amount amount being staked
 * @param type type of stake
 * @returns stake entity
 */
function createStake(event, market, stakeToken, amount, type) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const stake = new schema_1._Stake(id);
    const accountAddress = event.transaction.from;
    stake.hash = event.transaction.hash.toHexString();
    stake.logIndex = event.logIndex.toI32();
    stake.protocol = constants_1.PROTOCOL_ID;
    stake.blockNumber = event.block.number;
    stake.timestamp = event.block.timestamp;
    stake.market = market.id;
    stake.asset = stakeToken.id;
    stake.from = accountAddress.toHexString();
    stake.to = event.address.toHexString(); // to whatever emitted this event (stakeLocker or mplReward)
    stake.amount = amount;
    stake.stakeType = type;
    stake.save();
    (0, usage_1.updateUsageMetrics)(event, accountAddress, constants_1.TransactionType.STAKE);
    return stake;
}
exports.createStake = createStake;
/**
 * Create unstake entity for unstaking to stake locker, or mpl rewards
 * @param market market the stake belongs to
 * @param stakeToken token being unstaked
 * @param amount amount being unstaked
 * @param type type of unstake
 * @returns unstake entity
 */
function createUnstake(event, market, stakeToken, amount, type) {
    const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
    const unstake = new schema_1._Unstake(id);
    const accountAddress = event.transaction.from;
    unstake.hash = event.transaction.hash.toHexString();
    unstake.logIndex = event.logIndex.toI32();
    unstake.protocol = constants_1.PROTOCOL_ID;
    unstake.blockNumber = event.block.number;
    unstake.timestamp = event.block.timestamp;
    unstake.market = market.id;
    unstake.asset = stakeToken.id;
    unstake.from = event.address.toHexString(); // from whatever emitted this event (stakeLocker or mplReward)
    unstake.to = accountAddress.toHexString();
    unstake.amount = amount;
    unstake.stakeType = type;
    unstake.save();
    (0, usage_1.updateUsageMetrics)(event, accountAddress, constants_1.TransactionType.UNSTAKE);
    return unstake;
}
exports.createUnstake = createUnstake;
