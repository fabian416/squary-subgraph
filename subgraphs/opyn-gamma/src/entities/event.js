"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWithdraw = exports.createDeposit = void 0;
const configure_1 = require("../../configurations/configure");
const schema_1 = require("../../generated/schema");
const tokens_1 = require("../common/tokens");
const price_1 = require("../price");
const account_1 = require("./account");
const pool_1 = require("./pool");
const protocol_1 = require("./protocol");
const snapshot_1 = require("./snapshot");
const usage_1 = require("./usage");
function createDeposit(event, asset, amount, from) {
    const account = (0, account_1.getOrCreateAccount)(from);
    const token = (0, tokens_1.getOrCreateToken)(asset);
    const pool = (0, pool_1.getOrCreatePool)(token);
    (0, snapshot_1.takeSnapshots)(event, pool);
    const deposit = new schema_1.Deposit(event.transaction.hash.concatI32(event.logIndex.toI32()));
    deposit.hash = event.transaction.hash;
    deposit.logIndex = event.logIndex.toI32();
    deposit.protocol = (0, protocol_1.getOrCreateOpynProtocol)().id;
    deposit.to = configure_1.NetworkConfigs.getMarginPoolAddress();
    deposit.from = from;
    deposit.account = account.id;
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.inputTokens = [token.id];
    deposit.outputToken = null;
    deposit.inputTokenAmounts = [amount];
    deposit.outputTokenAmount = null;
    deposit.amountUSD = (0, price_1.getUSDAmount)(event, token, amount);
    deposit.pool = pool.id;
    deposit.save();
    (0, pool_1.handlePoolDeposit)(event, pool, deposit);
    (0, usage_1.incrementProtocolDepositCount)(event, account);
}
exports.createDeposit = createDeposit;
function createWithdraw(event, asset, amount, to) {
    const account = (0, account_1.getOrCreateAccount)(to);
    const token = (0, tokens_1.getOrCreateToken)(asset);
    const pool = (0, pool_1.getOrCreatePool)(token);
    (0, snapshot_1.takeSnapshots)(event, pool);
    const withdraw = new schema_1.Withdraw(event.transaction.hash.concatI32(event.logIndex.toI32()));
    withdraw.hash = event.transaction.hash;
    withdraw.logIndex = event.logIndex.toI32();
    withdraw.protocol = (0, protocol_1.getOrCreateOpynProtocol)().id;
    withdraw.to = to;
    withdraw.from = configure_1.NetworkConfigs.getMarginPoolAddress();
    withdraw.account = account.id;
    withdraw.blockNumber = event.block.number;
    withdraw.timestamp = event.block.timestamp;
    withdraw.inputTokens = [token.id];
    withdraw.outputToken = null;
    withdraw.inputTokenAmounts = [amount];
    withdraw.outputTokenAmount = null;
    withdraw.amountUSD = (0, price_1.getUSDAmount)(event, token, amount);
    withdraw.pool = pool.id;
    withdraw.save();
    (0, pool_1.handlePoolWithdraw)(event, pool, withdraw);
    (0, usage_1.incrementProtocolWithdrawCount)(event, account);
}
exports.createWithdraw = createWithdraw;
