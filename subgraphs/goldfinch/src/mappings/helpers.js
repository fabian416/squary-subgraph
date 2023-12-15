"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._handleRepayMessari = exports._handleDrawdownMessari = exports._handleWithdrawMessari = exports._handleDepositMessari = void 0;
const GoldfinchConfig_1 = require("../../generated/templates/TranchedPool/GoldfinchConfig");
const CreditLine_1 = require("../../generated/templates/TranchedPool/CreditLine");
const PoolTokens_1 = require("../../generated/templates/TranchedPool/PoolTokens");
const constants_1 = require("../common/constants");
const getters_1 = require("../common/getters");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const helpers_1 = require("../common/helpers");
const market_1 = require("../entities/market");
function _handleDepositMessari(marketID, tokenID, amount, owner, configAddress, creditLineAddress, event) {
    const amountUSD = amount.divDecimal(constants_1.USDC_DECIMALS);
    const market = (0, getters_1.getOrCreateMarket)(marketID, event);
    if (!market._poolToken && configAddress) {
        const configContract = GoldfinchConfig_1.GoldfinchConfig.bind(configAddress);
        market._poolToken = configContract
            .getAddress(graph_ts_1.BigInt.fromI32(constants_1.CONFIG_KEYS_ADDRESSES.PoolTokens))
            .toHexString();
    }
    if (!market._interestTimestamp) {
        market._interestTimestamp = event.block.timestamp;
        graph_ts_1.log.debug("[handleDepositMade]market._interestTimestamp for market {} set to {}", [marketID, event.block.timestamp.toString()]);
    }
    if (creditLineAddress) {
        const creditLineContract = CreditLine_1.CreditLine.bind(creditLineAddress);
        if (!market._creditLine) {
            market._creditLine = creditLineAddress.toHexString();
        }
        const curretLimitResult = creditLineContract.try_currentLimit();
        if (!curretLimitResult.reverted &&
            curretLimitResult.value.gt(constants_1.BIGINT_ZERO)) {
            market.isActive = true;
            market.canBorrowFrom = true;
        }
    }
    market.inputTokenBalance = market.inputTokenBalance.plus(amount);
    market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(amountUSD);
    market.totalDepositBalanceUSD =
        market.inputTokenBalance.divDecimal(constants_1.USDC_DECIMALS);
    market.totalValueLockedUSD = market.totalDepositBalanceUSD;
    market.save();
    const protocol = (0, getters_1.getOrCreateProtocol)();
    let marketIDs = protocol._marketIDs;
    if (marketIDs.indexOf(market.id) < 0) {
        marketIDs = marketIDs.concat([market.id]);
    }
    let totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < protocol._marketIDs.length; i++) {
        const mktID = protocol._marketIDs[i];
        const mkt = (0, getters_1.getOrCreateMarket)(mktID, event);
        totalDepositBalanceUSD = totalDepositBalanceUSD.plus(mkt.totalDepositBalanceUSD);
    }
    protocol._marketIDs = marketIDs;
    protocol.totalDepositBalanceUSD = totalDepositBalanceUSD;
    protocol.totalValueLockedUSD = protocol.totalDepositBalanceUSD;
    protocol.cumulativeDepositUSD = protocol.cumulativeDepositUSD.plus(amountUSD);
    protocol.save();
    graph_ts_1.log.info("[handleDepositMade]market {}: amountUSD={},market.tvl={},protocl.tvl={},tx={}", [
        market.id,
        amountUSD.toString(),
        market.totalValueLockedUSD.toString(),
        protocol.totalValueLockedUSD.toString(),
        event.transaction.hash.toHexString(),
    ]);
    (0, helpers_1.snapshotMarket)(market, amountUSD, event, constants_1.TransactionType.DEPOSIT);
    (0, helpers_1.snapshotFinancials)(protocol, amountUSD, event, constants_1.TransactionType.DEPOSIT);
    (0, helpers_1.updateUsageMetrics)(protocol, owner, event, constants_1.TransactionType.DEPOSIT);
    const account = (0, getters_1.getOrCreateAccount)(owner);
    const poolTokensContract = PoolTokens_1.PoolTokens.bind(graph_ts_1.Address.fromString(market._poolToken));
    const accountBalance = poolTokensContract
        .tokens(tokenID)
        .getPrincipalAmount();
    const positionID = (0, helpers_1.updatePosition)(protocol, market, account, accountBalance, constants_1.PositionSide.LENDER, constants_1.TransactionType.DEPOSIT, event);
    (0, helpers_1.createTransaction)(constants_1.TransactionType.DEPOSIT, market, owner, positionID, amount, amountUSD, event);
}
exports._handleDepositMessari = _handleDepositMessari;
function _handleWithdrawMessari(marketID, principalWithdrawn, owner, event) {
    const principalAmountUSD = principalWithdrawn.divDecimal(constants_1.USDC_DECIMALS);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const market = (0, getters_1.getOrCreateMarket)(marketID, event);
    market.inputTokenBalance = market.inputTokenBalance.minus(principalWithdrawn);
    market.totalDepositBalanceUSD =
        market.inputTokenBalance.divDecimal(constants_1.USDC_DECIMALS);
    market.totalValueLockedUSD = market.totalDepositBalanceUSD;
    market.save();
    let marketIDs = protocol._marketIDs;
    if (marketIDs.indexOf(market.id) < 0) {
        marketIDs = marketIDs.concat([market.id]);
    }
    let totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < protocol._marketIDs.length; i++) {
        const mktID = protocol._marketIDs[i];
        const mkt = (0, getters_1.getOrCreateMarket)(mktID, event);
        totalDepositBalanceUSD = totalDepositBalanceUSD.plus(mkt.totalDepositBalanceUSD);
    }
    protocol._marketIDs = marketIDs;
    protocol.totalDepositBalanceUSD = totalDepositBalanceUSD;
    protocol.totalValueLockedUSD = protocol.totalDepositBalanceUSD;
    protocol.save();
    graph_ts_1.log.info("[handleWithdrawalMade]market {}: withdrawAmountUSD={},market.tvl={},protocl.tvl={},tx={}", [
        market.id,
        principalAmountUSD.toString(),
        market.totalValueLockedUSD.toString(),
        protocol.totalValueLockedUSD.toString(),
        event.transaction.hash.toHexString(),
    ]);
    (0, helpers_1.snapshotMarket)(market, principalAmountUSD, event, constants_1.TransactionType.WITHDRAW);
    (0, helpers_1.snapshotFinancials)(protocol, principalAmountUSD, event, constants_1.TransactionType.WITHDRAW);
    (0, helpers_1.updateUsageMetrics)(protocol, owner, event, constants_1.TransactionType.WITHDRAW);
    const account = (0, getters_1.getOrCreateAccount)(owner);
    const creditLineContract = CreditLine_1.CreditLine.bind(graph_ts_1.Address.fromString(market._creditLine));
    const accountBalance = creditLineContract.balance();
    const positionID = (0, helpers_1.updatePosition)(protocol, market, account, accountBalance, constants_1.PositionSide.LENDER, constants_1.TransactionType.WITHDRAW, event);
    (0, helpers_1.createTransaction)(constants_1.TransactionType.WITHDRAW, market, owner, positionID, principalWithdrawn, principalAmountUSD, event);
}
exports._handleWithdrawMessari = _handleWithdrawMessari;
function _handleDrawdownMessari(marketID, amount, borrower, event) {
    const amountUSD = amount.divDecimal(constants_1.USDC_DECIMALS);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const market = (0, getters_1.getOrCreateMarket)(marketID, event);
    if (!market._interestTimestamp) {
        market._interestTimestamp = event.block.timestamp;
        graph_ts_1.log.debug("[handleDrawdownMade]market._interestTimestamp for market {} set to {}", [marketID, event.block.timestamp.toString()]);
    }
    const creditLineContract = CreditLine_1.CreditLine.bind(graph_ts_1.Address.fromString(market._creditLine));
    market.totalBorrowBalanceUSD = creditLineContract
        .balance()
        .divDecimal(constants_1.USDC_DECIMALS);
    market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(amountUSD);
    if (!market._borrower) {
        market._borrower = borrower;
    }
    market.save();
    let totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < protocol._marketIDs.length; i++) {
        const mktID = protocol._marketIDs[i];
        const mkt = (0, getters_1.getOrCreateMarket)(mktID, event);
        totalBorrowBalanceUSD = totalBorrowBalanceUSD.plus(mkt.totalBorrowBalanceUSD);
    }
    protocol.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
    protocol.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD.plus(amountUSD);
    protocol.save();
    (0, helpers_1.snapshotMarket)(market, amountUSD, event, constants_1.TransactionType.BORROW);
    (0, helpers_1.snapshotFinancials)(protocol, amountUSD, event, constants_1.TransactionType.BORROW);
    (0, helpers_1.updateUsageMetrics)(protocol, borrower, event, constants_1.TransactionType.BORROW);
    const account = (0, getters_1.getOrCreateAccount)(borrower);
    const accountBalance = creditLineContract.balance();
    const positionID = (0, helpers_1.updatePosition)(protocol, market, account, accountBalance, constants_1.PositionSide.BORROWER, constants_1.TransactionType.BORROW, event);
    (0, helpers_1.createTransaction)(constants_1.TransactionType.BORROW, market, borrower, positionID, amount, amountUSD, event);
}
exports._handleDrawdownMessari = _handleDrawdownMessari;
function _handleRepayMessari(marketID, principalAmount, interestAmount, reserveAmount, payer, event) {
    const amount = interestAmount.plus(principalAmount);
    const interestAmountUSD = interestAmount.divDecimal(constants_1.USDC_DECIMALS);
    const principleAmountUSD = principalAmount.divDecimal(constants_1.USDC_DECIMALS);
    const reserveAmountUSD = reserveAmount.divDecimal(constants_1.USDC_DECIMALS);
    const tx = event.transaction.hash.toHexString();
    graph_ts_1.log.info("[handlePaymentApplied]market {} payment interestAmountUSD {} + principleAmountUSD {} received at tx {}", [marketID, interestAmountUSD.toString(), principleAmountUSD.toString(), tx]);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const market = (0, getters_1.getOrCreateMarket)(marketID, event);
    const creditLineContract = CreditLine_1.CreditLine.bind(graph_ts_1.Address.fromString(market._creditLine));
    market.totalBorrowBalanceUSD = creditLineContract
        .balance()
        .divDecimal(constants_1.USDC_DECIMALS);
    // lenders receive interestAmountUSD - reserveAmountUSD
    if (market._interestTimestamp) {
        if (!market._borrowerInterestAmountUSD) {
            market._borrowerInterestAmountUSD = constants_1.BIGDECIMAL_ZERO;
        }
        market._borrowerInterestAmountUSD = market
            ._borrowerInterestAmountUSD.plus(interestAmountUSD)
            .plus(reserveAmountUSD);
        if (!market._lenderInterestAmountUSD) {
            market._lenderInterestAmountUSD = constants_1.BIGDECIMAL_ZERO;
        }
        market._lenderInterestAmountUSD =
            market._lenderInterestAmountUSD.plus(interestAmountUSD);
        market.save();
        (0, market_1.updateInterestRates)(market, market._borrowerInterestAmountUSD, market._lenderInterestAmountUSD, event);
    }
    else {
        // for migrated tranched pools, there is no
        // TrancheLocked or DrawdownMade event, market._interestTimestamp
        // is not set, ignore the current interest payments and start
        // interest rates calcuation from now to the next payment
        market._interestTimestamp = event.block.timestamp;
        market.save();
    }
    let totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < protocol._marketIDs.length; i++) {
        const mktID = protocol._marketIDs[i];
        const mkt = (0, getters_1.getOrCreateMarket)(mktID, event);
        totalBorrowBalanceUSD = totalBorrowBalanceUSD.plus(mkt.totalBorrowBalanceUSD);
    }
    protocol.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
    protocol.save();
    (0, helpers_1.updateRevenues)(protocol, market, interestAmountUSD, constants_1.BIGDECIMAL_ZERO, event, true // update protocol level revenues
    );
    (0, helpers_1.snapshotMarket)(market, principleAmountUSD, event, constants_1.TransactionType.REPAY, true //snapshotRates
    );
    (0, helpers_1.snapshotFinancials)(protocol, principleAmountUSD, event, constants_1.TransactionType.REPAY);
    (0, helpers_1.updateUsageMetrics)(protocol, payer, event, constants_1.TransactionType.REPAY);
    const account = (0, getters_1.getOrCreateAccount)(payer);
    const accountBalance = creditLineContract.balance();
    const positionID = (0, helpers_1.updatePosition)(protocol, market, account, accountBalance, constants_1.PositionSide.BORROWER, constants_1.TransactionType.REPAY, event);
    (0, helpers_1.createTransaction)(constants_1.TransactionType.REPAY, market, market._borrower, positionID, amount, principleAmountUSD, event);
}
exports._handleRepayMessari = _handleRepayMessari;
