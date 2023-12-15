"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRebalance = exports.createWithdraw = exports.createDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../common/constants");
const pricing_1 = require("./pricing");
const vaults_1 = require("./vaults");
// Create deposit entity corresponding to hypervisor deposit events
function createDeposit(event) {
    const vaultId = event.address.toHex();
    // { Transaction hash }-{ Log index }
    let deposit = new schema_1.Deposit(event.transaction.hash
        .toHex()
        .concat("-")
        .concat(event.logIndex.toString()));
    deposit.hash = event.transaction.hash.toHex();
    deposit.logIndex = event.logIndex.toI32();
    deposit.protocol = constants_1.REGISTRY_ADDRESS_MAP.get(graph_ts_1.dataSource.network()).toHex();
    deposit.to = vaultId;
    deposit.from = event.params.sender.toHex();
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.asset = vaultId;
    deposit.amount = constants_1.BIGINT_ZERO;
    deposit.vault = event.address.toHex();
    // Get underlying tokens to calculate USD value
    let underlyingToken = (0, vaults_1.getOrCreateUnderlyingToken)(event.address);
    deposit.amountUSD = (0, pricing_1.getDualTokenUSD)(graph_ts_1.Address.fromString(underlyingToken.token0), graph_ts_1.Address.fromString(underlyingToken.token1), event.params.amount0, event.params.amount1, event.block.number);
    deposit.save();
}
exports.createDeposit = createDeposit;
// Create withdraw entity corresponding to hypervisor withdraw events
function createWithdraw(event) {
    const vaultId = event.address.toHex();
    // { Transaction hash }-{ Log index }
    let withdrawal = new schema_1.Withdraw(event.transaction.hash
        .toHex()
        .concat("-")
        .concat(event.logIndex.toString()));
    withdrawal.hash = event.transaction.hash.toHex();
    withdrawal.logIndex = event.logIndex.toI32();
    withdrawal.protocol = constants_1.REGISTRY_ADDRESS_MAP.get(graph_ts_1.dataSource.network()).toHex();
    withdrawal.to = event.params.to.toHex();
    withdrawal.from = vaultId;
    withdrawal.blockNumber = event.block.number;
    withdrawal.timestamp = event.block.timestamp;
    withdrawal.asset = vaultId;
    withdrawal.amount = constants_1.BIGINT_ZERO;
    withdrawal.vault = event.address.toHex();
    // Get underlying tokens to calculate USD value
    let underlyingToken = (0, vaults_1.getOrCreateUnderlyingToken)(event.address);
    withdrawal.amountUSD = (0, pricing_1.getDualTokenUSD)(graph_ts_1.Address.fromString(underlyingToken.token0), graph_ts_1.Address.fromString(underlyingToken.token1), event.params.amount0, event.params.amount1, event.block.number);
    withdrawal.save();
}
exports.createWithdraw = createWithdraw;
// Create rebalance entity corresponding to hypervisor rebalance events
function createRebalance(event) {
    const vaultId = event.address.toHex();
    // { Transaction hash }-{ Log index }
    let rebalance = new schema_1._Rebalance(event.transaction.hash
        .toHex()
        .concat("-")
        .concat(event.logIndex.toString()));
    rebalance.hash = event.transaction.hash.toHex();
    rebalance.logIndex = event.logIndex.toI32();
    rebalance.protocol = constants_1.REGISTRY_ADDRESS_MAP.get(graph_ts_1.dataSource.network()).toHex();
    rebalance.to = event.address.toHex();
    rebalance.from = event.transaction.from.toHex();
    rebalance.blockNumber = event.block.number;
    rebalance.timestamp = event.block.timestamp;
    rebalance.fees0 = event.params.feeAmount0;
    rebalance.fees1 = event.params.feeAmount1;
    rebalance.vault = event.address.toHex();
    // Get underlying tokens to calculate USD value
    let underlyingToken = (0, vaults_1.getOrCreateUnderlyingToken)(event.address);
    rebalance.feesUSD = (0, pricing_1.getDualTokenUSD)(graph_ts_1.Address.fromString(underlyingToken.token0), graph_ts_1.Address.fromString(underlyingToken.token1), event.params.feeAmount0, event.params.feeAmount1, event.block.number);
    rebalance.save();
}
exports.createRebalance = createRebalance;
