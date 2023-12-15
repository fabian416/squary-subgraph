"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._handleBorrowerPositionUpdated = exports._handleSupplierPositionUpdated = exports._handleReserveUpdate = exports._handleRepaid = exports._handleP2PIndexesUpdated = exports._handleBorrowed = exports._handleLiquidated = exports._handleWithdrawn = exports._handleSupplied = exports.MorphoPositions = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../constants");
const helpers_1 = require("../helpers");
const initializers_1 = require("../utils/initializers");
class MorphoPositions {
    constructor(morphoSupplyOnPool, morphoBorrowOnPool, morphoSupplyP2P, morphoBorrowP2P, morphoSupplyOnPool_BI, morphoBorrowOnPool_BI, morphoSupplyP2P_BI, morphoBorrowP2P_BI) {
        this.morphoSupplyOnPool = morphoSupplyOnPool;
        this.morphoBorrowOnPool = morphoBorrowOnPool;
        this.morphoSupplyP2P = morphoSupplyP2P;
        this.morphoBorrowP2P = morphoBorrowP2P;
        this.morphoSupplyOnPool_BI = morphoSupplyOnPool_BI;
        this.morphoBorrowOnPool_BI = morphoBorrowOnPool_BI;
        this.morphoSupplyP2P_BI = morphoSupplyP2P_BI;
        this.morphoBorrowP2P_BI = morphoBorrowP2P_BI;
    }
}
exports.MorphoPositions = MorphoPositions;
function _handleSupplied(event, protocol, market, accountID, amount, balanceOnPool, balanceInP2P) {
    const inputToken = (0, initializers_1.getOrInitToken)(market.inputToken);
    const deposit = new schema_1.Deposit((0, helpers_1.getEventId)(event.transaction.hash, event.logIndex));
    // create account
    let account = schema_1.Account.load(accountID);
    if (!account) {
        account = (0, helpers_1.createAccount)(accountID);
        account.save();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    account.depositCount += 1;
    account.save();
    // update position
    const position = (0, helpers_1.addPosition)(protocol, market, account, constants_1.PositionSide.COLLATERAL, constants_1.EventType.DEPOSIT, event);
    const virtualP2P = balanceInP2P
        .times(market._p2pSupplyIndex)
        .div(market._lastPoolSupplyIndex);
    market._virtualScaledSupply = market
        ._virtualScaledSupply.minus(position._virtualP2P)
        .plus(virtualP2P);
    market._scaledSupplyOnPool = market
        ._scaledSupplyOnPool.minus(position._balanceOnPool)
        .plus(balanceOnPool);
    market._scaledSupplyInP2P = market
        ._scaledSupplyInP2P.minus(position._balanceInP2P)
        .plus(balanceInP2P);
    position._balanceOnPool = balanceOnPool;
    position._balanceInP2P = balanceInP2P;
    position._virtualP2P = virtualP2P;
    const totalSupplyOnPool = balanceOnPool
        .times(market._lastPoolSupplyIndex)
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const totalSupplyInP2P = balanceInP2P
        .times(market._p2pSupplyIndex)
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    position.balance = totalSupplyOnPool.plus(totalSupplyInP2P);
    position.save();
    deposit.position = position.id;
    deposit.nonce = event.transaction.nonce;
    deposit.account = account.id;
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.market = market.id;
    deposit.hash = event.transaction.hash;
    deposit.logIndex = event.logIndex.toI32();
    deposit.asset = inputToken.id;
    deposit.amount = amount;
    deposit.amountUSD = amount
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals))
        .times(market.inputTokenPriceUSD);
    deposit.gasPrice = event.transaction.gasPrice;
    deposit.gasLimit = event.transaction.gasLimit;
    deposit.save();
    // update metrics
    protocol.cumulativeDepositUSD = protocol.cumulativeDepositUSD.plus(deposit.amountUSD);
    protocol.depositCount += 1;
    protocol.save();
    market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(deposit.amountUSD);
    market.depositCount += 1;
    market.save();
    // update usage metrics
    (0, helpers_1.snapshotUsage)(protocol, event.block.number, event.block.timestamp, accountID.toHexString(), constants_1.EventType.DEPOSIT, true);
    (0, helpers_1.updateProtocolPosition)(protocol, market);
    // update market daily / hourly snapshots / financialSnapshots
    (0, helpers_1.updateSnapshots)(protocol, market, deposit.amountUSD, deposit.amount, constants_1.EventType.DEPOSIT, event.block);
    (0, helpers_1.updateProtocolValues)(protocol.id);
}
exports._handleSupplied = _handleSupplied;
function _handleWithdrawn(event, protocol, market, accountID, amount, balanceOnPool, balanceInP2P) {
    const inputToken = (0, initializers_1.getOrInitToken)(market.inputToken);
    // create withdraw entity
    const withdraw = new schema_1.Withdraw((0, helpers_1.getEventId)(event.transaction.hash, event.logIndex));
    // get account
    let account = schema_1.Account.load(accountID);
    if (!account) {
        account = (0, helpers_1.createAccount)(accountID);
        account.save();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    account.withdrawCount += 1;
    account.save();
    const totalSupplyOnPool = balanceOnPool
        .times(market._lastPoolSupplyIndex)
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const totalSupplyInP2P = balanceInP2P
        .times(market._p2pSupplyIndex)
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const balance = totalSupplyOnPool.plus(totalSupplyInP2P);
    const position = (0, helpers_1.subtractPosition)(protocol, market, account, balance, constants_1.PositionSide.COLLATERAL, constants_1.EventType.WITHDRAW, event);
    if (position === null) {
        graph_ts_1.log.critical("[handleWithdraw] Position not found for account: {} in transaction: {}", [accountID.toHexString(), event.transaction.hash.toHexString()]);
        return;
    }
    const virtualP2P = balanceInP2P
        .times(market._p2pSupplyIndex)
        .div(market._lastPoolSupplyIndex);
    market._scaledSupplyOnPool = market
        ._scaledSupplyOnPool.minus(position._balanceOnPool)
        .plus(balanceOnPool);
    market._scaledSupplyInP2P = market
        ._scaledSupplyInP2P.minus(position._balanceInP2P)
        .plus(balanceInP2P);
    market._virtualScaledSupply = market
        ._virtualScaledSupply.minus(position._virtualP2P)
        .plus(virtualP2P);
    position._balanceOnPool = balanceOnPool;
    position._balanceInP2P = balanceInP2P;
    position._virtualP2P = virtualP2P;
    position.save();
    withdraw.position = position.id;
    withdraw.blockNumber = event.block.number;
    withdraw.timestamp = event.block.timestamp;
    withdraw.account = account.id;
    withdraw.market = market.id;
    withdraw.hash = event.transaction.hash;
    withdraw.nonce = event.transaction.nonce;
    withdraw.logIndex = event.logIndex.toI32();
    withdraw.asset = inputToken.id;
    withdraw.amount = amount;
    withdraw.amountUSD = amount
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals))
        .times(market.inputTokenPriceUSD);
    withdraw.gasPrice = event.transaction.gasPrice;
    withdraw.gasLimit = event.transaction.gasLimit;
    withdraw.save();
    protocol.withdrawCount += 1;
    protocol.save();
    market.withdrawCount += 1;
    market.save();
    // update usage metrics
    (0, helpers_1.snapshotUsage)(protocol, event.block.number, event.block.timestamp, withdraw.account.toHexString(), constants_1.EventType.WITHDRAW, true);
    (0, helpers_1.updateProtocolPosition)(protocol, market);
    // update market daily / hourly snapshots / financialSnapshots
    (0, helpers_1.updateSnapshots)(protocol, market, withdraw.amountUSD, withdraw.amount, constants_1.EventType.WITHDRAW, event.block);
    (0, helpers_1.updateProtocolValues)(protocol.id);
}
exports._handleWithdrawn = _handleWithdrawn;
function _handleLiquidated(event, protocol, collateralAddress, debtAddress, liquidator, liquidated, amountSeized, amountRepaid) {
    // collateral market
    const market = (0, initializers_1.getMarket)(collateralAddress);
    const inputToken = (0, initializers_1.getOrInitToken)(market.inputToken);
    // create liquidate entity
    const liquidate = new schema_1.Liquidate((0, helpers_1.getEventId)(event.transaction.hash, event.logIndex));
    // update liquidators account
    let liquidatorAccount = schema_1.Account.load(liquidator);
    if (!liquidatorAccount) {
        liquidatorAccount = (0, helpers_1.createAccount)(liquidator);
        liquidatorAccount.save();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    liquidatorAccount.liquidateCount += 1;
    liquidatorAccount.save();
    const liquidatorActorID = "liquidator"
        .concat("-")
        .concat(liquidatorAccount.id.toHexString());
    let liquidatorActor = schema_1._ActiveAccount.load(liquidatorActorID);
    if (!liquidatorActor) {
        liquidatorActor = new schema_1._ActiveAccount(liquidatorActorID);
        liquidatorActor.save();
        protocol.cumulativeUniqueLiquidators += 1;
        protocol.save();
    }
    // get borrower account
    let account = schema_1.Account.load(liquidated);
    if (!account) {
        account = (0, helpers_1.createAccount)(liquidated);
        account.save();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    account.liquidationCount += 1;
    account.save();
    const liquidateeActorID = "liquidatee"
        .concat("-")
        .concat(account.id.toHexString());
    let liquidateeActor = schema_1._ActiveAccount.load(liquidateeActorID);
    if (!liquidateeActor) {
        liquidateeActor = new schema_1._ActiveAccount(liquidateeActorID);
        liquidateeActor.save();
        protocol.cumulativeUniqueLiquidatees += 1;
        protocol.save();
    }
    const repayTokenMarket = (0, initializers_1.getMarket)(debtAddress);
    const debtAsset = (0, initializers_1.getOrInitToken)(repayTokenMarket.inputToken);
    // repaid position was updated in the repay event earlier
    liquidate.blockNumber = event.block.number;
    liquidate.timestamp = event.block.timestamp;
    liquidate.positions = [];
    liquidate.liquidator = liquidator;
    liquidate.liquidatee = liquidated;
    liquidate.market = market.id;
    liquidate.hash = event.transaction.hash;
    liquidate.nonce = event.transaction.nonce;
    liquidate.logIndex = event.logIndex.toI32();
    liquidate.asset = repayTokenMarket.inputToken;
    liquidate.amount = amountSeized;
    liquidate.amountUSD = amountSeized
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals))
        .times(market.inputTokenPriceUSD);
    liquidate.profitUSD = liquidate.amountUSD.minus(amountRepaid
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(debtAsset.decimals))
        .times(repayTokenMarket.inputTokenPriceUSD));
    liquidate.save();
    protocol.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD.plus(liquidate.amountUSD);
    protocol.liquidationCount += 1;
    protocol.save();
    market.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD.plus(liquidate.amountUSD);
    market.liquidationCount += 1;
    market.save();
    // update usage metrics
    (0, helpers_1.snapshotUsage)(protocol, event.block.number, event.block.timestamp, liquidate.liquidatee.toHexString(), constants_1.EventType.LIQUIDATEE, true // only count this liquidate as new tx
    );
    (0, helpers_1.snapshotUsage)(protocol, event.block.number, event.block.timestamp, liquidate.liquidator.toHexString(), constants_1.EventType.LIQUIDATOR, // updates dailyActiveLiquidators
    false);
    // update market daily / hourly snapshots / financialSnapshots
    (0, helpers_1.updateSnapshots)(protocol, market, liquidate.amountUSD, liquidate.amount, constants_1.EventType.LIQUIDATOR, event.block);
}
exports._handleLiquidated = _handleLiquidated;
function _handleBorrowed(event, protocol, market, accountID, amount, onPool, inP2P) {
    const inputToken = (0, initializers_1.getOrInitToken)(market.inputToken);
    // create borrow entity
    const borrow = new schema_1.Borrow((0, helpers_1.getEventId)(event.transaction.hash, event.logIndex));
    // create account
    let account = schema_1.Account.load(accountID);
    if (!account) {
        account = (0, helpers_1.createAccount)(accountID);
        account.save();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    if (account.borrowCount === 0) {
        protocol.cumulativeUniqueBorrowers += 1;
    }
    account.borrowCount += 1;
    account.save();
    // update position
    const position = (0, helpers_1.addPosition)(protocol, market, account, constants_1.PositionSide.BORROWER, constants_1.EventType.BORROW, event);
    const virtualP2P = inP2P
        .times(market._p2pBorrowIndex)
        .div(market._lastPoolBorrowIndex);
    market._scaledBorrowOnPool = market
        ._scaledBorrowOnPool.minus(position._balanceOnPool)
        .plus(onPool);
    market._scaledBorrowInP2P = market
        ._scaledBorrowInP2P.minus(position._balanceInP2P)
        .plus(inP2P);
    market._virtualScaledBorrow = market
        ._virtualScaledBorrow.minus(position._virtualP2P)
        .plus(virtualP2P);
    position._balanceOnPool = onPool;
    position._balanceInP2P = inP2P;
    position._virtualP2P = virtualP2P;
    const borrowOnPool = onPool
        .times(market._lastPoolBorrowIndex)
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const borrowInP2P = inP2P
        .times(market._p2pBorrowIndex)
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    position.balance = borrowOnPool.plus(borrowInP2P);
    position.save();
    borrow.position = position.id;
    borrow.blockNumber = event.block.number;
    borrow.timestamp = event.block.timestamp;
    borrow.account = account.id;
    borrow.nonce = event.transaction.nonce;
    borrow.market = market.id;
    borrow.hash = event.transaction.hash;
    borrow.logIndex = event.logIndex.toI32();
    borrow.asset = inputToken.id;
    borrow.amount = amount;
    borrow.amountUSD = amount
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals))
        .times(market.inputTokenPriceUSD);
    borrow.gasPrice = event.transaction.gasPrice;
    borrow.gasLimit = event.transaction.gasLimit;
    borrow.save();
    // update metrics
    protocol.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD.plus(borrow.amountUSD);
    protocol.borrowCount += 1;
    protocol.save();
    market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(borrow.amountUSD);
    market.borrowCount += 1;
    market.save();
    // update usage metrics
    (0, helpers_1.snapshotUsage)(protocol, event.block.number, event.block.timestamp, borrow.account.toHexString(), constants_1.EventType.BORROW, true);
    (0, helpers_1.updateProtocolPosition)(protocol, market);
    // update market daily / hourly snapshots / financialSnapshots
    (0, helpers_1.updateSnapshots)(protocol, market, borrow.amountUSD, borrow.amount, constants_1.EventType.BORROW, event.block);
    (0, helpers_1.updateProtocolValues)(protocol.id);
}
exports._handleBorrowed = _handleBorrowed;
function _handleP2PIndexesUpdated(event, protocol, market, poolSupplyIndex, p2pSupplyIndex, poolBorrowIndex, p2pBorrowIndex) {
    const inputToken = (0, initializers_1.getOrInitToken)(market.inputToken);
    // The token price is updated in reserveUpdated event
    // calculate new revenue
    // New Interest = totalScaledSupply * (difference in liquidity index)
    let totalSupplyOnPool = market._scaledSupplyOnPool;
    if (market._scaledPoolCollateral)
        totalSupplyOnPool = totalSupplyOnPool.plus(market._scaledPoolCollateral);
    const supplyDeltaIndexes = poolSupplyIndex
        .minus(market._lastPoolSupplyIndex)
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(market._indexesOffset));
    const poolSupplyInterest = supplyDeltaIndexes
        .times(totalSupplyOnPool.toBigDecimal())
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const virtualSupplyInterest = supplyDeltaIndexes
        .times(market._virtualScaledSupply.toBigDecimal())
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    market._lastPoolSupplyIndex = poolSupplyIndex;
    const p2pSupplyInterest = p2pSupplyIndex
        .minus(market._p2pSupplyIndex)
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(market._indexesOffset))
        .times(market._scaledSupplyInP2P.toBigDecimal())
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    market._p2pSupplyIndex = p2pSupplyIndex;
    const borrowDeltaIndexes = poolBorrowIndex
        .minus(market._lastPoolBorrowIndex)
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(market._indexesOffset));
    const poolBorrowInterest = borrowDeltaIndexes
        .times(market._scaledBorrowOnPool.toBigDecimal())
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const virtualBorrowInterest = borrowDeltaIndexes
        .times(market._virtualScaledBorrow.toBigDecimal())
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    market._lastPoolBorrowIndex = poolBorrowIndex;
    const p2pBorrowInterest = p2pBorrowIndex
        .minus(market._p2pBorrowIndex)
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(market._indexesOffset))
        .times(market._scaledBorrowInP2P.toBigDecimal())
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    market._p2pBorrowIndex = p2pBorrowIndex;
    const totalRevenueDelta = poolSupplyInterest.plus(p2pSupplyInterest);
    const totalRevenueDeltaUSD = totalRevenueDelta.times(market.inputTokenPriceUSD);
    if (!market.reserveFactor)
        market.reserveFactor = graph_ts_1.BigDecimal.zero();
    const protocolSideRevenueDeltaUSD = totalRevenueDeltaUSD.times(market.reserveFactor);
    const supplySideRevenueDeltaUSD = totalRevenueDeltaUSD.minus(protocolSideRevenueDeltaUSD);
    // Morpho specific: update the interests generated on Morpho by both suppliers and borrowers, matched or not
    market._poolSupplyInterests =
        market._poolSupplyInterests.plus(poolSupplyInterest);
    market._poolSupplyInterestsUSD = market._poolSupplyInterestsUSD.plus(poolSupplyInterest.times(market.inputTokenPriceUSD));
    market._p2pSupplyInterests =
        market._p2pSupplyInterests.plus(p2pSupplyInterest);
    market._p2pSupplyInterestsUSD = market._p2pSupplyInterestsUSD.plus(p2pSupplyInterest.times(market.inputTokenPriceUSD));
    market._poolBorrowInterests =
        market._poolBorrowInterests.plus(poolBorrowInterest);
    market._poolBorrowInterestsUSD = market._poolBorrowInterestsUSD.plus(poolBorrowInterest.times(market.inputTokenPriceUSD));
    market._p2pBorrowInterests =
        market._p2pBorrowInterests.plus(p2pBorrowInterest);
    market._p2pBorrowInterestsUSD = market._p2pBorrowInterestsUSD.plus(p2pBorrowInterest.times(market.inputTokenPriceUSD));
    market._p2pSupplyInterestsImprovement =
        market._p2pSupplyInterestsImprovement.plus(p2pSupplyInterest.minus(virtualSupplyInterest));
    market._p2pSupplyInterestsImprovementUSD =
        market._p2pSupplyInterestsImprovementUSD.plus(p2pSupplyInterest
            .minus(virtualSupplyInterest)
            .times(market.inputTokenPriceUSD));
    market._p2pBorrowInterestsImprovement =
        market._p2pBorrowInterestsImprovement.plus(virtualBorrowInterest.minus(p2pBorrowInterest));
    market._p2pBorrowInterestsImprovementUSD =
        market._p2pBorrowInterestsImprovementUSD.plus(virtualBorrowInterest
            .minus(p2pBorrowInterest)
            .times(market.inputTokenPriceUSD));
    market.save();
    protocol.save();
    // update revenue in market snapshots
    (0, helpers_1.updateRevenueSnapshots)(market, protocol, supplySideRevenueDeltaUSD, protocolSideRevenueDeltaUSD, event.block);
    (0, helpers_1.updateProtocolPosition)(protocol, market);
    (0, helpers_1.updateProtocolValues)(protocol.id);
}
exports._handleP2PIndexesUpdated = _handleP2PIndexesUpdated;
function _handleRepaid(event, protocol, market, accountID, amount, balanceOnPool, balanceInP2P) {
    const inputToken = (0, initializers_1.getOrInitToken)(market.inputToken);
    // create repay entity
    const repay = new schema_1.Repay((0, helpers_1.getEventId)(event.transaction.hash, event.logIndex));
    // get account
    let account = schema_1.Account.load(accountID);
    if (!account) {
        account = (0, helpers_1.createAccount)(accountID);
        account.save();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    account.repayCount += 1;
    account.save();
    const borrowOnPool = balanceOnPool
        .times(market._lastPoolBorrowIndex)
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const borrowInP2P = balanceInP2P
        .times(market._p2pBorrowIndex)
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const balance = borrowOnPool.plus(borrowInP2P);
    const position = (0, helpers_1.subtractPosition)(protocol, market, account, balance, // try getting balance of account in debt market
    constants_1.PositionSide.BORROWER, constants_1.EventType.REPAY, event);
    if (position === null) {
        graph_ts_1.log.warning("[handleRepay] Position not found for account: {} in transaction; {}", [accountID.toHexString(), event.transaction.hash.toHexString()]);
        return;
    }
    const virtualP2P = balanceInP2P
        .times(market._p2pBorrowIndex)
        .div(market._lastPoolBorrowIndex);
    market._virtualScaledBorrow = market
        ._virtualScaledBorrow.minus(position._virtualP2P)
        .plus(virtualP2P);
    market._scaledBorrowOnPool = market
        ._scaledBorrowOnPool.minus(position._balanceOnPool)
        .plus(balanceOnPool);
    market._scaledBorrowInP2P = market
        ._scaledBorrowInP2P.minus(position._balanceInP2P)
        .plus(balanceInP2P);
    position._balanceOnPool = balanceOnPool;
    position._balanceInP2P = balanceInP2P;
    position._virtualP2P = virtualP2P;
    position.save();
    repay.position = position.id;
    repay.blockNumber = event.block.number;
    repay.timestamp = event.block.timestamp;
    repay.account = account.id;
    repay.market = market.id;
    repay.hash = event.transaction.hash;
    repay.nonce = event.transaction.nonce;
    repay.logIndex = event.logIndex.toI32();
    repay.asset = inputToken.id;
    repay.amount = amount;
    repay.amountUSD = amount
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals))
        .times(market.inputTokenPriceUSD);
    repay.gasPrice = event.transaction.gasPrice;
    repay.gasLimit = event.transaction.gasLimit;
    repay.save();
    protocol.repayCount += 1;
    protocol.save();
    market.repayCount += 1;
    market.save();
    // update usage metrics
    (0, helpers_1.snapshotUsage)(protocol, event.block.number, event.block.timestamp, repay.account.toHexString(), constants_1.EventType.REPAY, true);
    (0, helpers_1.updateProtocolPosition)(protocol, market);
    // update market daily / hourly snapshots / financialSnapshots
    (0, helpers_1.updateSnapshots)(protocol, market, repay.amountUSD, repay.amount, constants_1.EventType.REPAY, event.block);
    (0, helpers_1.updateProtocolValues)(protocol.id);
}
exports._handleRepaid = _handleRepaid;
function _handleReserveUpdate(params, market, __MATHS__) {
    // Update the total supply and borrow frequently by using pool updates
    const totalDepositBalanceUSD = market
        ._totalSupplyOnPool.plus(market._totalSupplyInP2P)
        .times(market.inputTokenPriceUSD);
    market.totalDepositBalanceUSD = totalDepositBalanceUSD;
    const totalBorrowBalanceUSD = market
        ._totalBorrowOnPool.plus(market._totalBorrowInP2P)
        .times(market.inputTokenPriceUSD);
    market.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
    market.totalValueLockedUSD = market.totalDepositBalanceUSD;
    // Update pool indexes
    market._reserveSupplyIndex = params.reserveSupplyIndex;
    market._reserveBorrowIndex = params.reserveBorrowIndex;
    market._poolSupplyRate = params.poolSupplyRate;
    market._poolBorrowRate = params.poolBorrowRate;
    market._lastReserveUpdate = params.event.block.timestamp;
    // update rates as APR as it is done for aave subgraphs
    const supplyRate = params.poolSupplyRate
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(market._indexesOffset));
    const borrowRate = params.poolBorrowRate
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(market._indexesOffset));
    const poolSupplyRate = (0, helpers_1.createInterestRate)(market.id, constants_1.InterestRateSide.LENDER, constants_1.InterestRateType.VARIABLE, supplyRate.times(constants_1.BIGDECIMAL_HUNDRED));
    const poolBorrowRate = (0, helpers_1.createInterestRate)(market.id, constants_1.InterestRateSide.BORROWER, constants_1.InterestRateType.VARIABLE, borrowRate.times(constants_1.BIGDECIMAL_HUNDRED));
    market.rates = [
        poolSupplyRate.id,
        poolSupplyRate.id,
        poolBorrowRate.id,
        poolBorrowRate.id,
    ];
    market.save();
    (0, helpers_1.updateP2PRates)(market, __MATHS__);
    (0, helpers_1.updateProtocolPosition)(params.protocol, market);
    (0, helpers_1.updateProtocolValues)(params.protocol.id);
    return;
}
exports._handleReserveUpdate = _handleReserveUpdate;
function _handleSupplierPositionUpdated(event, protocol, marketAddress, accountID, onPool, inP2P) {
    const market = (0, initializers_1.getMarket)(marketAddress);
    const account = schema_1.Account.load(accountID);
    if (!account) {
        graph_ts_1.log.critical("Account not found for accountID: {}", [
            accountID.toHexString(),
        ]);
        return;
    }
    const position = (0, helpers_1.addPosition)(protocol, market, account, constants_1.PositionSide.COLLATERAL, constants_1.EventType.SUPPLIER_POSITION_UPDATE, event);
    const virtualP2P = inP2P
        .times(market._p2pSupplyIndex)
        .div(market._lastPoolSupplyIndex);
    market._virtualScaledSupply = market
        ._virtualScaledSupply.minus(position._virtualP2P)
        .plus(virtualP2P);
    market._scaledSupplyOnPool = market
        ._scaledSupplyOnPool.minus(position._balanceOnPool)
        .plus(onPool);
    market._scaledSupplyInP2P = market
        ._scaledSupplyInP2P.minus(position._balanceInP2P)
        .plus(inP2P);
    position._balanceOnPool = onPool;
    position._balanceInP2P = inP2P;
    position._virtualP2P = virtualP2P;
    position.save();
    market.save();
}
exports._handleSupplierPositionUpdated = _handleSupplierPositionUpdated;
function _handleBorrowerPositionUpdated(event, protocol, marketAddress, accountID, onPool, inP2P) {
    const market = (0, initializers_1.getMarket)(marketAddress);
    const account = schema_1.Account.load(accountID);
    if (!account) {
        graph_ts_1.log.critical("Account not found for accountID: {}", [
            accountID.toHexString(),
        ]);
        return;
    }
    const position = (0, helpers_1.addPosition)(protocol, market, account, constants_1.PositionSide.BORROWER, constants_1.EventType.BORROWER_POSITION_UPDATE, event);
    const virtualP2P = inP2P
        .times(market._p2pBorrowIndex)
        .div(market._lastPoolBorrowIndex);
    market._virtualScaledBorrow = market
        ._virtualScaledBorrow.minus(position._virtualP2P)
        .plus(virtualP2P);
    market._scaledBorrowOnPool = market
        ._scaledBorrowOnPool.minus(position._balanceOnPool)
        .plus(onPool);
    market._scaledBorrowInP2P = market
        ._scaledBorrowInP2P.minus(position._balanceInP2P)
        .plus(inP2P);
    position._balanceOnPool = onPool;
    position._balanceInP2P = inP2P;
    position._virtualP2P = virtualP2P;
    position.save();
    market.save();
}
exports._handleBorrowerPositionUpdated = _handleBorrowerPositionUpdated;
