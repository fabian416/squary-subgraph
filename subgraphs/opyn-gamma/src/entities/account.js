"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementAccountExercisedCount = exports.incrementAccountMintedCount = exports.decrementAccountPositionCount = exports.incrementAccountPositionCount = exports.getOrCreateAccount = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const pool_1 = require("./pool");
const protocol_1 = require("./protocol");
const usage_1 = require("./usage");
function getOrCreateAccount(address) {
    let account = schema_1.Account.load(address);
    if (!account) {
        account = new schema_1.Account(address);
        account.cumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        account.cumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        account.cumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        account.cumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        account.cumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        account.cumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        account.openPositionCount = constants_1.INT_ZERO;
        account.closedPositionCount = constants_1.INT_ZERO;
        account.putsMintedCount = constants_1.INT_ZERO;
        account.callsMintedCount = constants_1.INT_ZERO;
        account.contractsMintedCount = constants_1.INT_ZERO;
        account.contractsTakenCount = constants_1.INT_ZERO;
        account.contractsExpiredCount = constants_1.INT_ZERO;
        account.contractsExercisedCount = constants_1.INT_ZERO;
        account.contractsClosedCount = constants_1.INT_ZERO;
        account.save();
        (0, protocol_1.incrementProtocolUniqueUsers)();
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
function incrementAccountPositionCount(event, account, option) {
    account.openPositionCount += 1;
    account.contractsTakenCount += 1;
    account.save();
    (0, pool_1.incrementPoolPositionCount)(event, option);
    (0, usage_1.incrementProtocolTakerCount)(event, account);
}
exports.incrementAccountPositionCount = incrementAccountPositionCount;
function decrementAccountPositionCount(event, account, option) {
    account.openPositionCount -= 1;
    account.closedPositionCount += 1;
    account.contractsClosedCount += 1;
    account.save();
    (0, pool_1.decrementPoolPositionCount)(event, option);
}
exports.decrementAccountPositionCount = decrementAccountPositionCount;
function incrementAccountMintedCount(event, account, option) {
    if (option.type == constants_1.OptionType.CALL) {
        account.callsMintedCount += 1;
    }
    else {
        account.putsMintedCount += 1;
    }
    account.contractsMintedCount += 1;
    account.save();
    (0, pool_1.incrementPoolMintedCount)(event, option);
}
exports.incrementAccountMintedCount = incrementAccountMintedCount;
function incrementAccountExercisedCount(event, account, option) {
    account.contractsExercisedCount += 1;
    account.save();
    (0, pool_1.incrementPoolExercisedCount)(event, option);
}
exports.incrementAccountExercisedCount = incrementAccountExercisedCount;
