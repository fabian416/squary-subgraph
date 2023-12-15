"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWithdraw = exports.createDeposit = exports.EventType = void 0;
const schema_1 = require("../../generated/schema");
const token_1 = require("./token");
const protocol_1 = require("./protocol");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
var EventType;
(function (EventType) {
  EventType[(EventType["Deposit"] = 0)] = "Deposit";
  EventType[(EventType["Withdraw"] = 1)] = "Withdraw";
  EventType[(EventType["Purchase"] = 2)] = "Purchase";
  EventType[(EventType["Settle"] = 3)] = "Settle";
})((EventType = exports.EventType || (exports.EventType = {})));
// Create a Deposit entity and update deposit count on a liquid providing event for the specific pool..
function createDeposit(
  event,
  pool,
  accountAddress,
  inputTokenAddress,
  inputTokenAmount
) {
  const protocol = (0, protocol_1.getOrCreateProtocol)();
  const transactionHash = event.transaction.hash;
  const logIndexI32 = event.logIndex.toI32();
  const deposit = new schema_1.Deposit(transactionHash.concatI32(logIndexI32));
  deposit.hash = transactionHash;
  deposit.logIndex = logIndexI32;
  deposit.protocol = protocol.id;
  deposit.to = pool.id;
  deposit.from = accountAddress;
  deposit.account = accountAddress;
  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.inputTokens = pool.inputTokens;
  const inputTokenAmounts = new Array(deposit.inputTokens.length).fill(
    constants_1.BIGINT_ZERO
  );
  const inputToken = (0, token_1.getOrCreateToken)(event, inputTokenAddress);
  const inputTokenIndex = deposit.inputTokens.indexOf(inputToken.id);
  if (inputTokenIndex >= 0) {
    inputTokenAmounts[inputTokenIndex] = inputTokenAmount;
  }
  deposit.inputTokenAmounts = inputTokenAmounts;
  deposit.outputToken = pool.outputToken;
  deposit.outputTokenAmount = constants_1.BIGINT_ONE;
  deposit.amountUSD = (0, numbers_1.convertTokenToDecimal)(
    inputTokenAmount,
    inputToken.decimals
  ).times(inputToken.lastPriceUSD);
  deposit.pool = pool.id;
  deposit.save();
}
exports.createDeposit = createDeposit;
function createWithdraw(
  event,
  pool,
  accountAddress,
  inputTokenAddress,
  inputTokenAmount
) {
  const protocol = (0, protocol_1.getOrCreateProtocol)();
  const transactionHash = event.transaction.hash;
  const logIndexI32 = event.logIndex.toI32();
  const withdrawal = new schema_1.Withdraw(
    transactionHash.concatI32(logIndexI32)
  );
  withdrawal.hash = transactionHash;
  withdrawal.logIndex = logIndexI32;
  withdrawal.protocol = protocol.id;
  withdrawal.to = accountAddress;
  withdrawal.from = pool.id;
  withdrawal.account = accountAddress;
  withdrawal.blockNumber = event.block.number;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.inputTokens = pool.inputTokens;
  const inputTokenAmounts = new Array(withdrawal.inputTokens.length).fill(
    constants_1.BIGINT_ZERO
  );
  const inputToken = (0, token_1.getOrCreateToken)(event, inputTokenAddress);
  const inputTokenIndex = withdrawal.inputTokens.indexOf(inputToken.id);
  if (inputTokenIndex >= 0) {
    inputTokenAmounts[inputTokenIndex] = inputTokenAmount;
  }
  withdrawal.inputTokenAmounts = inputTokenAmounts;
  withdrawal.outputToken = pool.outputToken;
  withdrawal.outputTokenAmount = constants_1.BIGINT_ONE;
  withdrawal.amountUSD = (0, numbers_1.convertTokenToDecimal)(
    inputTokenAmount,
    inputToken.decimals
  ).times(inputToken.lastPriceUSD);
  withdrawal.pool = pool.id;
  withdrawal.save();
}
exports.createWithdraw = createWithdraw;
