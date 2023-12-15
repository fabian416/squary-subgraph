"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCallRequestSubmitted = exports.handleDrawdownsUnpaused = exports.handleDrawdownsPaused = exports.handlePaymentApplied = exports.handleDrawdownMade = exports.handleWithdrawalMade = exports.handleDepositMade = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const CallableLoan_1 = require("../../../generated/templates/CallableLoan/CallableLoan");
const helpers_1 = require("../../entities/helpers");
const user_1 = require("../../entities/user");
const getters_1 = require("../../common/getters");
const helpers_2 = require("../helpers");
const helpers_3 = require("./helpers");
function getCallableLoan(address) {
    return assert(schema_1.CallableLoan.load(address.toHexString()));
}
function handleDepositMade(event) {
    const poolContract = CallableLoan_1.CallableLoan.bind(event.address);
    const configAddress = poolContract.config();
    const creditLineAddress = poolContract.creditLine();
    (0, helpers_2._handleDepositMessari)(event.address.toHexString(), event.params.tokenId, event.params.amount, event.params.owner.toHexString(), configAddress, creditLineAddress, event);
    //
    const callableLoan = getCallableLoan(event.address);
    const callableLoanContract = CallableLoan_1.CallableLoan.bind(event.address);
    callableLoan.availableForDrawdown = callableLoanContract.totalPrincipalPaid();
    callableLoan.totalDeposited = callableLoan.totalDeposited.plus(event.params.amount);
    const user = (0, user_1.getOrInitUser)(event.params.owner);
    callableLoan.backers = callableLoan.backers.concat([user.id]);
    callableLoan.numBackers = callableLoan.backers.length;
    callableLoan.save();
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "TRANCHED_POOL_DEPOSIT", event.params.owner);
    transaction.loan = event.address.toHexString();
    transaction.sentToken = "USDC";
    transaction.sentAmount = event.params.amount;
    transaction.save();
}
exports.handleDepositMade = handleDepositMade;
function handleWithdrawalMade(event) {
    (0, helpers_2._handleWithdrawMessari)(event.address.toHexString(), event.params.principalWithdrawn, event.params.owner.toHexString(), event);
    //
    const callableLoan = getCallableLoan(event.address);
    const callableLoanContract = CallableLoan_1.CallableLoan.bind(event.address);
    callableLoan.availableForDrawdown = callableLoanContract.totalPrincipalPaid();
    callableLoan.totalDeposited = callableLoan.totalDeposited.minus(event.params.principalWithdrawn);
    callableLoan.save();
    const poolToken = assert(schema_1.PoolToken.load(event.params.tokenId.toString()));
    poolToken.interestRedeemable = poolToken.interestRedeemable.minus(event.params.interestWithdrawn);
    poolToken.save();
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "TRANCHED_POOL_WITHDRAWAL", event.params.owner);
    transaction.loan = event.address.toHexString();
    transaction.receivedToken = "USDC";
    transaction.receivedAmount = event.params.interestWithdrawn.plus(event.params.principalWithdrawn);
    transaction.save();
}
exports.handleWithdrawalMade = handleWithdrawalMade;
function handleDrawdownMade(event) {
    (0, helpers_2._handleDrawdownMessari)(event.address.toHexString(), event.params.amount, event.params.borrower.toHexString(), event);
    //
    const callableLoan = getCallableLoan(event.address);
    (0, helpers_3.updatePoolTokensRedeemable)(callableLoan); // Results of availableToWithdraw change after the pool is drawn down (they become 0)
    const callableLoanContract = CallableLoan_1.CallableLoan.bind(event.address);
    callableLoan.availableForDrawdown = callableLoanContract.totalPrincipalPaid();
    callableLoan.principalAmount = callableLoan.principalAmount.plus(event.params.amount);
    callableLoan.balance = callableLoanContract.balance();
    callableLoan.termStartTime = callableLoanContract.termStartTime();
    callableLoan.termEndTime = callableLoanContract.termEndTime();
    callableLoan.initialInterestOwed = callableLoanContract.interestOwedAt(callableLoan.termEndTime);
    callableLoan.isPaused = callableLoanContract.paused();
    callableLoan.drawdownsPaused = callableLoanContract.drawdownsPaused();
    //deleteCallableLoanRepaymentSchedule(callableLoan);
    //const schedulingResult =
    //  generateRepaymentScheduleForCallableLoan(callableLoan);
    //callableLoan.repaymentSchedule = schedulingResult.repaymentIds;
    //callableLoan.numRepayments = schedulingResult.repaymentIds.length;
    //callableLoan.termInSeconds = schedulingResult.termInSeconds;
    //callableLoan.repaymentFrequency = schedulingResult.repaymentFrequency;
    callableLoan.save();
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "TRANCHED_POOL_DRAWDOWN", event.params.borrower);
    transaction.loan = event.address.toHexString();
    transaction.receivedToken = "USDC";
    transaction.receivedAmount = event.params.amount;
    transaction.save();
}
exports.handleDrawdownMade = handleDrawdownMade;
function handlePaymentApplied(event) {
    (0, helpers_2._handleRepayMessari)(event.address.toHexString(), event.params.principal, event.params.interest, event.params.reserve, event.params.payer.toHexString(), event);
    //
    const callableLoanContract = CallableLoan_1.CallableLoan.bind(event.address);
    const callableLoan = getCallableLoan(event.address);
    callableLoan.availableForDrawdown = callableLoanContract.totalPrincipalPaid();
    (0, helpers_3.updatePoolTokensRedeemable)(callableLoan); // Results of availableToWithdraw change after a repayment is made (principal or interest can increase)
    callableLoan.balance = callableLoan.balance.minus(event.params.principal);
    callableLoan.lastFullPaymentTime = callableLoanContract
        .lastFullPaymentTime()
        .toI32();
    callableLoan.principalAmountRepaid = callableLoan.principalAmountRepaid.plus(event.params.principal);
    callableLoan.interestAmountRepaid = callableLoan.interestAmountRepaid.plus(event.params.interest);
    /*
    if (!event.params.principal.isZero()) {
      // Regenerate the repayment schedule when a principal payment is made
      deleteCallableLoanRepaymentSchedule(callableLoan);
      const schedulingResult =
        generateRepaymentScheduleForCallableLoan(callableLoan);
      callableLoan.repaymentSchedule = schedulingResult.repaymentIds;
    }
    */
    callableLoan.save();
    /*
    updateTotalPrincipalCollected(event.params.principal);
    updateTotalInterestCollected(event.params.interest);
    updateTotalReserveCollected(event.params.reserve);
    */
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "TRANCHED_POOL_REPAYMENT", event.params.payer);
    transaction.loan = event.address.toHexString();
    transaction.sentToken = "USDC";
    transaction.sentAmount = event.params.principal.plus(event.params.interest);
    transaction.save();
}
exports.handlePaymentApplied = handlePaymentApplied;
function handleDrawdownsPaused(event) {
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    market.canBorrowFrom = false;
    market.save();
    //
    const callableLoan = getCallableLoan(event.address);
    const callableLoanContract = CallableLoan_1.CallableLoan.bind(event.address);
    callableLoan.drawdownsPaused = callableLoanContract.drawdownsPaused();
    callableLoan.save();
}
exports.handleDrawdownsPaused = handleDrawdownsPaused;
function handleDrawdownsUnpaused(event) {
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    market.canBorrowFrom = true;
    market.save();
    //
    const callableLoan = getCallableLoan(event.address);
    const callableLoanContract = CallableLoan_1.CallableLoan.bind(event.address);
    callableLoan.drawdownsPaused = callableLoanContract.drawdownsPaused();
    callableLoan.save();
}
exports.handleDrawdownsUnpaused = handleDrawdownsUnpaused;
function handleCallRequestSubmitted(event) {
    const callableLoanContract = CallableLoan_1.CallableLoan.bind(event.address);
    const poolToken = assert(schema_1.PoolToken.load(event.params.callRequestedTokenId.toString()));
    poolToken.isCapitalCalled = true;
    poolToken.calledAt = event.block.timestamp.toI32();
    poolToken.callDueAt = callableLoanContract.nextPrincipalDueTime().toI32();
    poolToken.save();
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "CALL_REQUEST_SUBMITTED", graph_ts_1.Address.fromString(poolToken.user));
    transaction.loan = event.address.toHexString();
    transaction.receivedToken = "USDC";
    transaction.receivedAmount = event.params.callAmount;
    transaction.save();
}
exports.handleCallRequestSubmitted = handleCallRequestSubmitted;
