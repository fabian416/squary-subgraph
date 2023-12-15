"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWithdraw = exports.createDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../common/constants");
const pricing_1 = require("./pricing");
const vaults_1 = require("./vaults");
// Create deposit entity corresponding to vault Minted events
function createDeposit(event) {
  const vaultId = event.address.toHex();
  const vault = (0, vaults_1.getOrCreateVault)(event.address, event.block);
  // { Transaction hash }-{ Log index }
  const deposit = new schema_1.Deposit(
    event.transaction.hash.toHex().concat("-").concat(event.logIndex.toString())
  );
  deposit.hash = event.transaction.hash.toHex();
  deposit.logIndex = event.logIndex.toI32();
  deposit.protocol = constants_1.REGISTRY_ADDRESS_MAP.get(
    graph_ts_1.dataSource.network()
  ).toHex();
  deposit.to = vaultId;
  deposit.from = event.params.receiver.toHex();
  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.asset = vaultId;
  deposit.amount = constants_1.BIGINT_ZERO;
  deposit.vault = event.address.toHex();
  // Get underlying tokens to calculate USD value
  deposit.amountUSD = (0, pricing_1.getDualTokenUSD)(
    graph_ts_1.Address.fromString(vault._token0),
    graph_ts_1.Address.fromString(vault._token1),
    event.params.amount0In,
    event.params.amount1In,
    event.block
  );
  deposit.save();
}
exports.createDeposit = createDeposit;
// Create withdraw entity corresponding to hypervisor withdraw events
function createWithdraw(event) {
  const vaultId = event.address.toHex();
  const vault = (0, vaults_1.getOrCreateVault)(event.address, event.block);
  // { Transaction hash }-{ Log index }
  const withdrawal = new schema_1.Withdraw(
    event.transaction.hash.toHex().concat("-").concat(event.logIndex.toString())
  );
  withdrawal.hash = event.transaction.hash.toHex();
  withdrawal.logIndex = event.logIndex.toI32();
  withdrawal.protocol = constants_1.REGISTRY_ADDRESS_MAP.get(
    graph_ts_1.dataSource.network()
  ).toHex();
  withdrawal.to = event.transaction.from.toHex();
  withdrawal.from = vaultId;
  withdrawal.blockNumber = event.block.number;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.asset = vaultId;
  withdrawal.amount = constants_1.BIGINT_ZERO;
  withdrawal.vault = event.address.toHex();
  // Get underlying tokens to calculate USD value
  withdrawal.amountUSD = (0, pricing_1.getDualTokenUSD)(
    graph_ts_1.Address.fromString(vault._token0),
    graph_ts_1.Address.fromString(vault._token1),
    event.params.amount0Out,
    event.params.amount1Out,
    event.block
  );
  withdrawal.save();
}
exports.createWithdraw = createWithdraw;
