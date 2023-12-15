"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWithdraw =
  exports.getWithdraw =
  exports.createWithdraw =
  exports.createDeposit =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const getters_1 = require("./getters");
const utils_1 = require("./utils");
const configure_1 = require("../../configurations/configure");
const schema_1 = require("../../generated/schema");
function createDeposit(
  poolAddress,
  tokenAddress,
  accountAddress,
  shares,
  amount,
  event
) {
  const token = (0, getters_1.getOrCreateToken)(tokenAddress, event);
  const id = graph_ts_1.Bytes.empty()
    .concat(event.transaction.hash)
    .concatI32(event.logIndex.toI32());
  const depositEvent = new schema_1.Deposit(id);
  depositEvent.hash = event.transaction.hash;
  depositEvent.logIndex = event.logIndex.toI32();
  depositEvent.protocol = configure_1.NetworkConfigs.getFactoryAddress();
  depositEvent.to = event.transaction.to
    ? event.transaction.to
    : graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS);
  depositEvent.from = event.transaction.from;
  depositEvent.depositor = accountAddress;
  depositEvent.pool = poolAddress;
  depositEvent.token = tokenAddress;
  depositEvent.shares = shares;
  depositEvent.amount = amount;
  depositEvent.amountUSD = (0, utils_1.bigIntToBigDecimal)(
    amount,
    token.decimals
  ).times(token.lastPriceUSD);
  depositEvent.blockNumber = event.block.number;
  depositEvent.timestamp = event.block.timestamp;
  depositEvent.save();
  return depositEvent.id;
}
exports.createDeposit = createDeposit;
function createWithdraw(
  poolAddress,
  tokenAddress,
  accountAddress,
  withdrawerAddress,
  delegatedAddress,
  withdrawalRoot,
  nonce,
  shares,
  event
) {
  const id = graph_ts_1.Bytes.empty()
    .concat(event.transaction.hash)
    .concatI32(event.logIndex.toI32());
  const withdrawEvent = new schema_1.Withdraw(id);
  withdrawEvent.hash = event.transaction.hash;
  withdrawEvent.logIndex = event.logIndex.toI32();
  withdrawEvent.protocol = configure_1.NetworkConfigs.getFactoryAddress();
  withdrawEvent.to = event.transaction.to
    ? event.transaction.to
    : graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS);
  withdrawEvent.from = event.transaction.from;
  withdrawEvent.depositor = accountAddress;
  withdrawEvent.withdrawer = withdrawerAddress;
  withdrawEvent.delegatedTo = delegatedAddress;
  withdrawEvent.withdrawalRoot = withdrawalRoot;
  withdrawEvent.nonce = nonce;
  withdrawEvent.pool = poolAddress;
  withdrawEvent.token = tokenAddress;
  withdrawEvent.shares = shares;
  withdrawEvent.blockNumber = event.block.number;
  withdrawEvent.timestamp = event.block.timestamp;
  // Populated on WithdrawalCompleted event
  withdrawEvent.completed = false;
  withdrawEvent.hashCompleted = graph_ts_1.Bytes.empty();
  withdrawEvent.amount = constants_1.BIGINT_ZERO;
  withdrawEvent.amountUSD = constants_1.BIGDECIMAL_ZERO;
  withdrawEvent.save();
  const account = (0, getters_1.getOrCreateAccount)(accountAddress);
  account.withdrawsQueued = (0, utils_1.addToArrayAtIndex)(
    account.withdrawsQueued,
    withdrawEvent.id
  );
  account.save();
  return withdrawEvent.id;
}
exports.createWithdraw = createWithdraw;
function getWithdraw(accountAddress, withdrawalRoot) {
  const account = (0, getters_1.getOrCreateAccount)(accountAddress);
  for (let i = 0; i < account.withdrawsQueued.length; i++) {
    const id = account.withdrawsQueued[i];
    const withdrawEvent = schema_1.Withdraw.load(id);
    if (withdrawEvent.withdrawalRoot == withdrawalRoot) {
      return withdrawEvent;
    }
  }
  graph_ts_1.log.warning(
    "[getWithdraw] queued withdraw transaction not found for depositor: {} and withdrawalRoot: {}",
    [accountAddress.toHexString(), withdrawalRoot.toHexString()]
  );
  return null;
}
exports.getWithdraw = getWithdraw;
function updateWithdraw(
  accountAddress,
  tokenAddress,
  withdrawID,
  amount,
  event
) {
  const token = (0, getters_1.getOrCreateToken)(tokenAddress, event);
  const withdrawEvent = schema_1.Withdraw.load(withdrawID);
  withdrawEvent.amount = amount;
  withdrawEvent.amountUSD = (0, utils_1.bigIntToBigDecimal)(amount).times(
    token.lastPriceUSD
  );
  withdrawEvent.hashCompleted = event.transaction.hash;
  withdrawEvent.completed = true;
  withdrawEvent.blockNumberCompleted = event.block.number;
  withdrawEvent.save();
  const account = (0, getters_1.getOrCreateAccount)(accountAddress);
  const i = account.withdrawsQueued.indexOf(withdrawID);
  account.withdrawsQueued = (0, utils_1.removeFromArrayAtIndex)(
    account.withdrawsQueued,
    i
  );
  account.withdrawsCompleted = (0, utils_1.addToArrayAtIndex)(
    account.withdrawsCompleted,
    withdrawEvent.id
  );
  account.save();
}
exports.updateWithdraw = updateWithdraw;
