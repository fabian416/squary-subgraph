"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFundsWithdrawn = exports.handleDefaultSuffered = exports.handleClaim = exports.handleLoanFunded = exports.handlePoolStateChanged = exports.handleTransfer = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../../generated/templates");
const constants_1 = require("../common/constants");
const snapshots_1 = require("../common/mappingHelpers/getOrCreate/snapshots");
const snapshots_2 = require("../common/mappingHelpers/getOrCreate/snapshots");
const markets_1 = require("../common/mappingHelpers/getOrCreate/markets");
const transactions_1 = require("../common/mappingHelpers/getOrCreate/transactions");
const intervalUpdate_1 = require("../common/mappingHelpers/update/intervalUpdate");
const prices_1 = require("../common/prices/prices");
const supporting_1 = require("../common/mappingHelpers/getOrCreate/supporting");
const protocol_1 = require("../common/mappingHelpers/getOrCreate/protocol");
function handleTransfer(event) {
    if (graph_ts_1.Address.zero() == event.params.from) {
        // Deposit (mint)
        const marketAddress = event.address;
        const market = (0, markets_1.getOrCreateMarket)(event, marketAddress);
        ////
        // Create deposit
        ////
        const deposit = (0, transactions_1.createDeposit)(event, market, event.params.value);
        ////
        // Update market
        ////
        market._cumulativeDeposit = market._cumulativeDeposit.plus(deposit.amount);
        market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(deposit.amountUSD);
        market.save();
        ////
        // Update protocol
        ////
        const protocol = (0, protocol_1.getOrCreateProtocol)();
        protocol.cumulativeDepositUSD = protocol.cumulativeDepositUSD.plus(deposit.amountUSD);
        protocol.save();
        ////
        // Update market snapshot
        ////
        const marketDailySnapshot = (0, snapshots_2.getOrCreateMarketDailySnapshot)(event, market);
        marketDailySnapshot.dailyDepositUSD = marketDailySnapshot.dailyDepositUSD.plus(deposit.amountUSD);
        marketDailySnapshot.save();
        const MarketHourlySnapshot = (0, snapshots_1.getOrCreateMarketHourlySnapshot)(event, market);
        MarketHourlySnapshot.hourlyDepositUSD = MarketHourlySnapshot.hourlyDepositUSD.plus(deposit.amountUSD);
        MarketHourlySnapshot.save();
        ////
        // Update financial snapshot
        ////
        const financialsDailySnapshot = (0, snapshots_1.getOrCreateFinancialsDailySnapshot)(event);
        financialsDailySnapshot.dailyDepositUSD = financialsDailySnapshot.dailyDepositUSD.plus(deposit.amountUSD);
        financialsDailySnapshot.save();
        ////
        // Trigger interval update
        ////
        (0, intervalUpdate_1.intervalUpdate)(event, market);
    }
    else if (graph_ts_1.Address.zero() == event.params.to) {
        // Withdraw (burn)
        const marketAddress = event.address;
        const market = (0, markets_1.getOrCreateMarket)(event, marketAddress);
        const accountAddress = event.transaction.from;
        const accountMarket = (0, markets_1.getOrCreateAccountMarket)(event, accountAddress, market);
        ////
        // Create withdraw
        ////
        const withdraw = (0, transactions_1.createWithdraw)(event, market, event.params.value, accountMarket.recognizedLosses);
        ////
        // Update AccountMarket
        ////
        accountMarket.recognizedLosses = accountMarket.recognizedLosses.plus(withdraw._losses);
        accountMarket.save();
        ////
        // Update market
        ////
        market._cumulativeWithdraw = market._cumulativeWithdraw.plus(withdraw.amount);
        market._recognizedPoolLosses = market._recognizedPoolLosses.plus(withdraw._losses);
        market.save();
        ////
        // Update financial snapshot
        ////
        const financialsDailySnapshot = (0, snapshots_1.getOrCreateFinancialsDailySnapshot)(event);
        financialsDailySnapshot.dailyWithdrawUSD = financialsDailySnapshot.dailyWithdrawUSD.plus(withdraw.amountUSD);
        financialsDailySnapshot.save();
        ////
        // Update market snapshot
        ////
        const marketDailySnapshot = (0, snapshots_2.getOrCreateMarketDailySnapshot)(event, market);
        marketDailySnapshot.dailyWithdrawUSD = marketDailySnapshot.dailyWithdrawUSD.plus(withdraw.amountUSD);
        marketDailySnapshot.save();
        const MarketHourlySnapshot = (0, snapshots_1.getOrCreateMarketHourlySnapshot)(event, market);
        MarketHourlySnapshot.hourlyWithdrawUSD = MarketHourlySnapshot.hourlyWithdrawUSD.plus(withdraw.amountUSD);
        MarketHourlySnapshot.save();
        ////
        // Trigger interval update
        ////
        (0, intervalUpdate_1.intervalUpdate)(event, market);
    }
}
exports.handleTransfer = handleTransfer;
function handlePoolStateChanged(event) {
    const market = (0, markets_1.getOrCreateMarket)(event, event.address);
    ////
    // Update market
    ////
    const active = event.params.state == constants_1.PoolState.Finalized;
    market.isActive = active;
    market.canBorrowFrom = active;
    market.save();
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handlePoolStateChanged = handlePoolStateChanged;
function handleLoanFunded(event) {
    const loanAddress = event.params.loan;
    const loan = (0, markets_1.getOrCreateLoan)(event, loanAddress, event.address);
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(loan.market));
    const inputToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const amountFunded = event.params.amountFunded;
    ////
    // Create loan entity
    ////
    loan.amountFunded = loan.amountFunded.plus(amountFunded);
    loan.save();
    ////
    // Create loan template
    ////
    if (constants_1.LoanVersion.V1 == loan.version) {
        templates_1.LoanV1.create(loanAddress);
    }
    else if (constants_1.LoanVersion.V2 == loan.version) {
        templates_1.LoanV2.create(loanAddress);
    }
    else if (constants_1.LoanVersion.V3 == loan.version) {
        templates_1.LoanV3.create(loanAddress);
    }
    else {
        graph_ts_1.log.warning("Loan version not supported: ", [loan.version]);
    }
    ////
    // Update market
    ////
    market._cumulativeBorrow = market._cumulativeBorrow.plus(amountFunded);
    const fundedAmountUSD = (0, prices_1.getTokenAmountInUSD)(event, inputToken, amountFunded);
    market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(fundedAmountUSD);
    market.save();
    ////
    // Update protocol
    ////
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    protocol.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD.plus(fundedAmountUSD);
    protocol.save();
    ////
    // Update market snapshot
    ////
    const amountFundedUSD = (0, prices_1.getTokenAmountInUSD)(event, inputToken, amountFunded);
    const marketDailySnapshot = (0, snapshots_2.getOrCreateMarketDailySnapshot)(event, market);
    marketDailySnapshot.dailyBorrowUSD = marketDailySnapshot.dailyBorrowUSD.plus(amountFundedUSD);
    marketDailySnapshot.save();
    const MarketHourlySnapshot = (0, snapshots_1.getOrCreateMarketHourlySnapshot)(event, market);
    MarketHourlySnapshot.hourlyBorrowUSD = MarketHourlySnapshot.hourlyBorrowUSD.plus(amountFundedUSD);
    MarketHourlySnapshot.save();
    ////
    // Update financial snapshot
    ////
    const financialsDailySnapshot = (0, snapshots_1.getOrCreateFinancialsDailySnapshot)(event);
    financialsDailySnapshot.dailyBorrowUSD = financialsDailySnapshot.dailyBorrowUSD.plus(amountFundedUSD);
    financialsDailySnapshot.save();
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleLoanFunded = handleLoanFunded;
function handleClaim(event) {
    const market = (0, markets_1.getOrCreateMarket)(event, event.address);
    const inputToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const poolInterestAmount = event.params.interest;
    const poolDelegateInterestAmount = event.params.poolDelegatePortion;
    const stakeLockerInterestAmount = event.params.stakeLockerPortion;
    const principalRepayAmount = event.params.principal;
    const principalRepayAmountUSD = (0, prices_1.getTokenAmountInUSD)(event, inputToken, principalRepayAmount);
    const totalInterestAmountUSD = (0, prices_1.getTokenAmountInUSD)(event, inputToken, poolInterestAmount.plus(poolDelegateInterestAmount).plus(stakeLockerInterestAmount));
    ////
    // Update stake locker
    ////
    const stakeLocker = (0, markets_1.getOrCreateStakeLocker)(event, graph_ts_1.Address.fromString(market._stakeLocker));
    stakeLocker.cumulativeInterestInPoolInputTokens =
        stakeLocker.cumulativeInterestInPoolInputTokens.plus(poolDelegateInterestAmount);
    stakeLocker.save();
    ////
    // Update market
    ////
    market._cumulativePrincipalRepay = market._cumulativePrincipalRepay.plus(principalRepayAmount);
    market._cumulativeInterest = market._cumulativeInterest.plus(poolInterestAmount);
    market._cumulativePoolDelegateRevenue = market._cumulativePoolDelegateRevenue.plus(poolDelegateInterestAmount);
    market.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD.plus(totalInterestAmountUSD);
    market.save();
    ////
    // Update protocol
    ////
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    protocol.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD.plus(totalInterestAmountUSD);
    protocol.save();
    ////
    // Update financial snapshot
    ////
    const financialsDailySnapshot = (0, snapshots_1.getOrCreateFinancialsDailySnapshot)(event);
    financialsDailySnapshot.dailySupplySideRevenueUSD =
        financialsDailySnapshot.dailySupplySideRevenueUSD.plus(totalInterestAmountUSD);
    financialsDailySnapshot.save();
    ////
    // Update market snapshot
    ////
    const marketDailySnapshot = (0, snapshots_2.getOrCreateMarketDailySnapshot)(event, market);
    marketDailySnapshot.dailySupplySideRevenueUSD =
        marketDailySnapshot.dailySupplySideRevenueUSD.plus(totalInterestAmountUSD);
    marketDailySnapshot.dailyRepayUSD = marketDailySnapshot.dailyRepayUSD.plus(principalRepayAmountUSD.plus(totalInterestAmountUSD));
    marketDailySnapshot.save();
    const marketHourlySnapshot = (0, snapshots_1.getOrCreateMarketHourlySnapshot)(event, market);
    marketHourlySnapshot.hourlySupplySideRevenueUSD =
        marketHourlySnapshot.hourlySupplySideRevenueUSD.plus(totalInterestAmountUSD);
    marketHourlySnapshot.hourlyRepayUSD = marketHourlySnapshot.hourlyRepayUSD.plus(principalRepayAmountUSD.plus(totalInterestAmountUSD));
    marketHourlySnapshot.save();
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleClaim = handleClaim;
function handleDefaultSuffered(event) {
    const market = (0, markets_1.getOrCreateMarket)(event, event.address);
    const loan = (0, markets_1.getOrCreateLoan)(event, event.params.loan);
    ////
    // Create liquidate
    ////
    const defaultSufferedByStakeLocker = event.params.liquidityAssetRecoveredFromBurn;
    const defaultSufferedByPool = event.params.defaultSuffered.minus(defaultSufferedByStakeLocker);
    const liquidate = (0, transactions_1.createLiquidate)(event, loan, defaultSufferedByStakeLocker, defaultSufferedByPool);
    ////
    // Update loan
    ////
    loan.defaultSuffered = loan.defaultSuffered.plus(liquidate.amount);
    loan.save();
    ////
    // Update stake locker
    ////
    const stakeAssetBurnedAmount = event.params.bptsBurned;
    const stakeLocker = (0, markets_1.getOrCreateStakeLocker)(event, graph_ts_1.Address.fromString(market._stakeLocker));
    stakeLocker.cumulativeLosses = stakeLocker.cumulativeLosses.plus(stakeAssetBurnedAmount);
    stakeLocker.cumulativeLossesInPoolInputToken = stakeLocker.cumulativeLossesInPoolInputToken.plus(liquidate._defaultSufferedByStakeLocker);
    stakeLocker.save();
    ////
    // Update market
    ////
    market._cumulativePoolLosses = market._cumulativePoolLosses.plus(liquidate._defaultSufferedByPool);
    market.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD.plus(liquidate.amountUSD);
    market.save();
    ////
    // Update market snapshot
    ////
    const marketDailySnapshot = (0, snapshots_2.getOrCreateMarketDailySnapshot)(event, market);
    marketDailySnapshot.dailyLiquidateUSD = marketDailySnapshot.dailyLiquidateUSD.plus(liquidate.amountUSD);
    marketDailySnapshot.save();
    const MarketHourlySnapshot = (0, snapshots_1.getOrCreateMarketHourlySnapshot)(event, market);
    MarketHourlySnapshot.hourlyLiquidateUSD = MarketHourlySnapshot.hourlyLiquidateUSD.plus(liquidate.amountUSD);
    MarketHourlySnapshot.save();
    ////
    // Update protocol
    ////
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    protocol.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD.plus(liquidate.amountUSD);
    protocol.save();
    ////
    // Update protocol snapshot
    ////
    const financialsDailySnapshot = (0, snapshots_1.getOrCreateFinancialsDailySnapshot)(event);
    financialsDailySnapshot.dailyLiquidateUSD = financialsDailySnapshot.dailyBorrowUSD.plus(liquidate.amountUSD);
    financialsDailySnapshot.save();
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleDefaultSuffered = handleDefaultSuffered;
function handleFundsWithdrawn(event) {
    const marketAddress = event.address;
    const market = (0, markets_1.getOrCreateMarket)(event, marketAddress);
    ////
    // Create claim
    ////
    const claim = (0, transactions_1.createClaim)(event, market, event.params.fundsWithdrawn);
    ////
    // Update market
    ////
    market._cumulativeInterestClaimed = market._cumulativeInterestClaimed.plus(claim.amount);
    market.save();
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleFundsWithdrawn = handleFundsWithdrawn;
