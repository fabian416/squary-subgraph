"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementAccountEventCount =
  exports.updateAccountOpenPositionCount =
  exports.getOrCreateAccount =
    void 0;
const schema_1 = require("../../generated/schema");
const event_1 = require("./event");
const constants_1 = require("../utils/constants");
const protocol_1 = require("./protocol");
function getOrCreateAccount(event, address) {
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
    account.callsMintedCount = constants_1.INT_ZERO;
    account.putsMintedCount = constants_1.INT_ZERO;
    account.contractsMintedCount = constants_1.INT_ZERO;
    account.contractsTakenCount = constants_1.INT_ZERO;
    account.contractsExpiredCount = constants_1.INT_ZERO;
    account.contractsExercisedCount = constants_1.INT_ZERO;
    account.contractsClosedCount = constants_1.INT_ZERO;
    account.save();
    (0, protocol_1.incrementProtocolUniqueUsers)(event);
  }
  return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
function updateAccountOpenPositionCount(account, isIncrease) {
  if (isIncrease) {
    account.openPositionCount += constants_1.INT_ONE;
  } else {
    account.openPositionCount -= constants_1.INT_ONE;
    account.closedPositionCount += constants_1.INT_ONE;
  }
  account.save();
}
exports.updateAccountOpenPositionCount = updateAccountOpenPositionCount;
function incrementAccountEventCount(event, account, eventType, _isPut) {
  switch (eventType) {
    case event_1.EventType.Deposit:
      if (account.contractsMintedCount == constants_1.INT_ZERO) {
        (0, protocol_1.incrementProtocolUniqueLP)(event);
      }
      if (_isPut) {
        account.putsMintedCount += constants_1.INT_ONE;
      } else {
        account.callsMintedCount += constants_1.INT_ONE;
      }
      account.contractsMintedCount += constants_1.INT_ONE;
      break;
    case event_1.EventType.Withdraw:
      account.contractsExpiredCount += constants_1.INT_ONE;
      account.contractsClosedCount += constants_1.INT_ONE;
      break;
    case event_1.EventType.Purchase:
      if (account.contractsTakenCount == constants_1.INT_ZERO) {
        (0, protocol_1.incrementProtocolUniqueTakers)(event);
      }
      account.contractsTakenCount += constants_1.INT_ONE;
      break;
    case event_1.EventType.Settle:
      account.contractsExercisedCount += constants_1.INT_ONE;
      break;
    default:
      break;
  }
  account.save();
}
exports.incrementAccountEventCount = incrementAccountEventCount;
