"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePoolTokensRedeemable = exports.initCallableLoan = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const CallableLoan_1 = require("../../../generated/templates/CallableLoan/CallableLoan");
const INTEREST_DECIMALS = graph_ts_1.BigDecimal.fromString("1000000000000000000");
function initCallableLoan(address, block) {
    const id = address.toHexString();
    const callableLoan = new schema_1.CallableLoan(id);
    const callableLoanContract = CallableLoan_1.CallableLoan.bind(address);
    callableLoan.address = address;
    callableLoan.creditLineAddress = callableLoanContract.creditLine();
    callableLoan.fundingLimit = callableLoanContract.limit();
    callableLoan.principalAmount = graph_ts_1.BigInt.zero();
    callableLoan.initialInterestOwed = graph_ts_1.BigInt.zero(); // This gets set on drawdown
    callableLoan.rawGfiApy = graph_ts_1.BigDecimal.zero();
    callableLoan.totalDeposited = graph_ts_1.BigInt.zero();
    callableLoan.remainingCapacity = callableLoan.fundingLimit;
    callableLoan.createdAt = block.timestamp.toI32();
    callableLoan.fundableAt = callableLoanContract.getFundableAt().toI32();
    callableLoan.availableForDrawdown = callableLoanContract.totalPrincipalPaid();
    if (callableLoan.fundableAt == 0) {
        callableLoan.fundableAt = callableLoan.createdAt;
    }
    callableLoan.allowedUidTypes = [];
    const allowedUidTypes = callableLoanContract.getAllowedUIDTypes();
    for (let i = 0; i < allowedUidTypes.length; i++) {
        const uidType = allowedUidTypes[i];
        if (uidType.equals(graph_ts_1.BigInt.fromI32(0))) {
            callableLoan.allowedUidTypes = callableLoan.allowedUidTypes.concat([
                "NON_US_INDIVIDUAL",
            ]);
        }
        else if (uidType.equals(graph_ts_1.BigInt.fromI32(1))) {
            callableLoan.allowedUidTypes = callableLoan.allowedUidTypes.concat([
                "US_ACCREDITED_INDIVIDUAL",
            ]);
        }
        else if (uidType.equals(graph_ts_1.BigInt.fromI32(2))) {
            callableLoan.allowedUidTypes = callableLoan.allowedUidTypes.concat([
                "US_NON_ACCREDITED_INDIVIDUAL",
            ]);
        }
        else if (uidType.equals(graph_ts_1.BigInt.fromI32(3))) {
            callableLoan.allowedUidTypes = callableLoan.allowedUidTypes.concat([
                "US_ENTITY",
            ]);
        }
        else if (uidType.equals(graph_ts_1.BigInt.fromI32(4))) {
            callableLoan.allowedUidTypes = callableLoan.allowedUidTypes.concat([
                "NON_US_ENTITY",
            ]);
        }
    }
    callableLoan.backers = [];
    callableLoan.numBackers = 0;
    callableLoan.isPaused = callableLoanContract.paused();
    callableLoan.drawdownsPaused = callableLoanContract.drawdownsPaused();
    callableLoan.tokens = [];
    callableLoan.balance = callableLoanContract.balance();
    callableLoan.termEndTime = callableLoanContract.termEndTime();
    callableLoan.termStartTime = callableLoanContract.termStartTime();
    callableLoan.interestRateBigInt = callableLoanContract.interestApr();
    callableLoan.interestRate =
        callableLoan.interestRateBigInt.divDecimal(INTEREST_DECIMALS);
    callableLoan.usdcApy = callableLoan.interestRate.times(graph_ts_1.BigDecimal.fromString("0.9")); // TODO could fetch the protocol fee from GoldfinchConfig, but this is OK for now
    callableLoan.lateFeeRate = callableLoanContract
        .lateFeeApr()
        .divDecimal(INTEREST_DECIMALS);
    callableLoan.lastFullPaymentTime = callableLoanContract
        .lastFullPaymentTime()
        .toI32();
    //callableLoan.borrowerContract = callableLoanContract.borrower().toHexString();
    //const schedulingResult =
    //  generateRepaymentScheduleForCallableLoan(callableLoan);
    //callableLoan.repaymentSchedule = schedulingResult.repaymentIds
    //callableLoan.numRepayments = schedulingResult.repaymentIds.length;
    //callableLoan.termInSeconds = schedulingResult.termInSeconds;
    //callableLoan.repaymentFrequency = schedulingResult.repaymentFrequency;
    callableLoan.principalAmountRepaid = graph_ts_1.BigInt.zero();
    callableLoan.interestAmountRepaid = graph_ts_1.BigInt.zero();
    return callableLoan;
}
exports.initCallableLoan = initCallableLoan;
// TODO this function exists for tranched pools too. Try to consolidate them?
function updatePoolTokensRedeemable(callableLoan) {
    const callableLoanContract = CallableLoan_1.CallableLoan.bind(graph_ts_1.Address.fromBytes(callableLoan.address));
    const poolTokenIds = callableLoan.tokens;
    for (let i = 0; i < poolTokenIds.length; i++) {
        const poolToken = schema_1.PoolToken.load(poolTokenIds[i]);
        if (!poolToken) {
            continue;
        }
        const availableToWithdrawResult = callableLoanContract.try_availableToWithdraw(graph_ts_1.BigInt.fromString(poolToken.id));
        if (!availableToWithdrawResult.reverted) {
            poolToken.interestRedeemable = availableToWithdrawResult.value.value0;
        }
        else {
            graph_ts_1.log.warning("availableToWithdraw reverted for pool token {} on CallableLoan {}", [poolToken.id, callableLoan.id]);
        }
        poolToken.save();
    }
}
exports.updatePoolTokensRedeemable = updatePoolTokensRedeemable;
