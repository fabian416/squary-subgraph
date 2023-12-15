"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOrUpdateCreditLine = exports.getOrInitCreditLine = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const CreditLine_1 = require("../../generated/templates/TranchedPool/CreditLine");
const constants_1 = require("../common/constants");
const utils_1 = require("../common/utils");
const INTEREST_DECIMALS = graph_ts_1.BigDecimal.fromString("1000000000000000000");
function getOrInitCreditLine(address, timestamp) {
    let creditLine = schema_1.CreditLine.load(address.toHexString());
    if (!creditLine) {
        creditLine = initOrUpdateCreditLine(address, timestamp);
    }
    return creditLine;
}
exports.getOrInitCreditLine = getOrInitCreditLine;
function initOrUpdateCreditLine(address, timestamp) {
    let creditLine = schema_1.CreditLine.load(address.toHexString());
    if (!creditLine) {
        creditLine = new schema_1.CreditLine(address.toHexString());
    }
    const contract = CreditLine_1.CreditLine.bind(address);
    creditLine.borrower = contract.borrower();
    creditLine.balance = contract.balance();
    creditLine.interestApr = contract.interestApr();
    creditLine.interestAccruedAsOf = contract.interestAccruedAsOf();
    creditLine.paymentPeriodInDays = contract.paymentPeriodInDays();
    creditLine.termInDays = contract.termInDays();
    creditLine.nextDueTime = contract.nextDueTime();
    creditLine.limit = contract.limit();
    creditLine.interestOwed = contract.interestOwed();
    creditLine.termEndTime = contract.termEndTime();
    creditLine.termStartTime =
        creditLine.termEndTime == graph_ts_1.BigInt.zero()
            ? graph_ts_1.BigInt.zero()
            : contract.termStartTime();
    creditLine.lastFullPaymentTime = contract.lastFullPaymentTime();
    creditLine.interestAprDecimal = creditLine.interestApr
        .toBigDecimal()
        .div(INTEREST_DECIMALS);
    creditLine.version = utils_1.VERSION_BEFORE_V2_2;
    creditLine.isEligibleForRewards =
        creditLine.termStartTime == graph_ts_1.BigInt.zero() ||
            creditLine.termStartTime >= graph_ts_1.BigInt.fromString(constants_1.BACKER_REWARDS_EPOCH);
    creditLine.lateFeeApr = contract.lateFeeApr().divDecimal(constants_1.FIDU_DECIMALS);
    let maxLimit = creditLine.limit;
    if (timestamp && (0, utils_1.isAfterV2_2)(timestamp)) {
        const callMaxLimit = contract.try_maxLimit();
        if (callMaxLimit.reverted) {
            graph_ts_1.log.warning("maxLimit reverted for credit line {}", [
                address.toHexString(),
            ]);
        }
        else {
            maxLimit = callMaxLimit.value;
            // Assuming that the credit line is v2_2 if requests work
            creditLine.version = utils_1.VERSION_V2_2;
        }
    }
    creditLine.maxLimit = maxLimit;
    creditLine.save();
    return creditLine;
}
exports.initOrUpdateCreditLine = initOrUpdateCreditLine;
