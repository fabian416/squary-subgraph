"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRepossessed = exports.handlePaymentMade = exports.handleFundsDrawnDown = exports.handleNewTermsAccepted = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const LoanV3_1 = require("../../generated/templates/LoanV3/LoanV3");
const constants_1 = require("../common/constants");
const markets_1 = require("../common/mappingHelpers/getOrCreate/markets");
const protocol_1 = require("../common/mappingHelpers/getOrCreate/protocol");
const snapshots_1 = require("../common/mappingHelpers/getOrCreate/snapshots");
const supporting_1 = require("../common/mappingHelpers/getOrCreate/supporting");
const transactions_1 = require("../common/mappingHelpers/getOrCreate/transactions");
const intervalUpdate_1 = require("../common/mappingHelpers/update/intervalUpdate");
const prices_1 = require("../common/prices/prices");
const utils_1 = require("../common/utils");
function handleNewTermsAccepted(event) {
    const loan = (0, markets_1.getOrCreateLoan)(event, event.address);
    ////
    // Update loan
    ////
    loan.refinanceCount = loan.refinanceCount.plus(constants_1.ONE_BI);
    loan.save();
    ////
    // Update interest rate
    ////
    const interestRate = (0, markets_1.getOrCreateInterestRate)(event, loan);
    const loanV3Contract = LoanV3_1.LoanV3.bind(graph_ts_1.Address.fromString(loan.id));
    const paymentIntervalSec = (0, utils_1.readCallResult)(loanV3Contract.try_paymentInterval(), constants_1.ZERO_BI, loanV3Contract.try_paymentInterval.name);
    const paymentsRemaining = (0, utils_1.readCallResult)(loanV3Contract.try_paymentsRemaining(), constants_1.ZERO_BI, loanV3Contract.try_paymentsRemaining.name);
    interestRate.duration = (0, utils_1.bigDecimalToBigInt)(paymentIntervalSec.times(paymentsRemaining).toBigDecimal().div(constants_1.SEC_PER_DAY.toBigDecimal())).toI32();
    // Interst rate for V2/V3 stored as apr in units of 1e18, (i.e. 1% is 0.01e18).
    const rateFromContract = (0, utils_1.readCallResult)(loanV3Contract.try_interestRate(), constants_1.ZERO_BI, loanV3Contract.try_interestRate.name);
    const rate = (0, utils_1.parseUnits)(rateFromContract, 18);
    interestRate.rate = rate;
    interestRate.save();
    ////
    // Trigger interval update
    ////
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(loan.market));
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleNewTermsAccepted = handleNewTermsAccepted;
function handleFundsDrawnDown(event) {
    const drawdownAmount = event.params.amount_;
    const loan = (0, markets_1.getOrCreateLoan)(event, event.address);
    ////
    // Create borrow
    ////
    const borrow = (0, transactions_1.createBorrow)(event, loan, drawdownAmount, constants_1.ZERO_BI);
    ////
    // Update loan
    ////
    loan.drawnDown = loan.drawnDown.plus(borrow.amount);
    loan.save();
    // No market update in this case,
    ////
    // Trigger interval update
    ////
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(loan.market));
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleFundsDrawnDown = handleFundsDrawnDown;
function handlePaymentMade(event) {
    const principalPaid = event.params.principalPaid_;
    const interestPaid = event.params.interestPaid_;
    const treasuryFee = event.params.treasuryFeePaid_;
    const loan = (0, markets_1.getOrCreateLoan)(event, event.address);
    const repay = (0, transactions_1.createRepay)(event, loan, principalPaid, interestPaid, treasuryFee);
    ////
    // Update loan
    ////
    loan.principalPaid = loan.principalPaid.plus(repay._principalPaid);
    loan.interestPaid = loan.interestPaid.plus(repay._interestPaid);
    loan.treasuryFeePaid = loan.treasuryFeePaid.plus(treasuryFee);
    loan.save();
    ////
    // Update market, V3 loan amortizes treasury fee (amortized delegate fee tracked in claim)
    ////
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(loan.market));
    const inputToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const treasuryFeeUSD = (0, prices_1.getTokenAmountInUSD)(event, inputToken, treasuryFee);
    market._cumulativeTreasuryRevenue = market._cumulativeTreasuryRevenue.plus(treasuryFee);
    market.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD.plus(treasuryFeeUSD);
    market.save();
    ////
    // Update protocol
    ////
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    protocol.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD.plus(treasuryFeeUSD);
    protocol.save();
    ////
    // Update financial snapshot
    ////
    const financialsDailySnapshot = (0, snapshots_1.getOrCreateFinancialsDailySnapshot)(event);
    financialsDailySnapshot.dailyProtocolSideRevenueUSD =
        financialsDailySnapshot.dailyProtocolSideRevenueUSD.plus(treasuryFeeUSD);
    financialsDailySnapshot.dailyRepayUSD = financialsDailySnapshot.dailyRepayUSD.plus(repay.amountUSD);
    financialsDailySnapshot.save();
    ////
    // Update market snapshot
    ////
    const marketDailySnapshot = (0, snapshots_1.getOrCreateMarketDailySnapshot)(event, market);
    marketDailySnapshot.dailyProtocolSideRevenueUSD =
        marketDailySnapshot.dailyProtocolSideRevenueUSD.plus(treasuryFeeUSD);
    marketDailySnapshot.save();
    const MarketHourlySnapshot = (0, snapshots_1.getOrCreateMarketHourlySnapshot)(event, market);
    MarketHourlySnapshot.hourlyProtocolSideRevenueUSD =
        MarketHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(treasuryFeeUSD);
    MarketHourlySnapshot.save();
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handlePaymentMade = handlePaymentMade;
function handleRepossessed(event) {
    ////
    // Update loan, reposession counted towards principal paid
    ////
    const loan = (0, markets_1.getOrCreateLoan)(event, event.address);
    loan.principalPaid = (0, utils_1.minBigInt)(loan.drawnDown, loan.principalPaid.plus(event.params.fundsRepossessed_));
    loan.save();
    ////
    // Trigger interval update
    ////
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(loan.market));
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleRepossessed = handleRepossessed;
