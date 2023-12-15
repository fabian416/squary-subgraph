"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdateManagerParams =
  exports.handleFeesEarned =
  exports.handleRebalance =
  exports.handleBurned =
  exports.handleMinted =
  exports.handlePoolCreated =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../../../generated/templates");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const events_1 = require("../helpers/events");
const financials_1 = require("../helpers/financials");
const usageMetrics_1 = require("../helpers/usageMetrics");
const vaults_1 = require("../helpers/vaults");
const ArrakisVaultV1_1 = require("../../../generated/templates/ArrakisVault/ArrakisVaultV1");
function handlePoolCreated(event) {
  const protocol = (0, getters_1.getOrCreateYieldAggregator)(event.address);
  protocol.totalPoolCount += 1;
  const vaultIDs = protocol._vaultIDs ? protocol._vaultIDs : [];
  vaultIDs.push(event.params.pool.toHexString());
  protocol._vaultIDs = vaultIDs;
  protocol.save();
  // Create Vault
  const vault = (0, vaults_1.getOrCreateVault)(event.params.pool, event.block);
  vault.protocol = event.address.toHex();
  const vaultContract = ArrakisVaultV1_1.ArrakisVaultV1.bind(event.params.pool);
  const token0Address = vaultContract.token0();
  const token1Address = vaultContract.token1();
  const token0 = (0, getters_1.getOrCreateToken)(token0Address);
  const token1 = (0, getters_1.getOrCreateToken)(token1Address);
  vault._token0 = token0.id;
  vault._token1 = token1.id;
  vault.save();
  templates_1.ArrakisVault.create(event.params.pool);
}
exports.handlePoolCreated = handlePoolCreated;
function handleMinted(event) {
  // Create deposit event
  (0, events_1.createDeposit)(event);
  // Update vault token supply
  const vault = (0, vaults_1.getOrCreateVault)(event.address, event.block);
  // update underlying token balances is done by updateVaultTokenValue inside updateTvl
  // we update all vaults for each vault event, so the underlying token balances are updated
  // more frequently at some cost of the indexing speed
  vault.inputTokenBalance = vault.inputTokenBalance.plus(
    event.params.mintAmount
  );
  vault.outputTokenSupply = vault.outputTokenSupply.plus(
    event.params.mintAmount
  );
  vault.save();
  (0, usageMetrics_1.updateUsageMetrics)(
    event.params.receiver,
    constants_1.UsageType.DEPOSIT,
    event
  ); // minted shares are attributed to receiver
  (0, financials_1.updateTvl)(event);
  (0, vaults_1.updateVaultSnapshots)(vault, event.block);
}
exports.handleMinted = handleMinted;
function handleBurned(event) {
  // Create withdraw event
  (0, events_1.createWithdraw)(event);
  // Update vault token supply
  const vault = (0, vaults_1.getOrCreateVault)(event.address, event.block);
  // update underlying token balances is done by updateVaultTokenValue inside updateTvl
  // we update all vaults for each vault event, so the underlying token balances are updated
  // more frequently at some cost of the indexing speed
  vault.inputTokenBalance = vault.inputTokenBalance.minus(
    event.params.burnAmount
  );
  vault.outputTokenSupply = vault.outputTokenSupply.minus(
    event.params.burnAmount
  );
  vault.save();
  (0, usageMetrics_1.updateUsageMetrics)(
    event.transaction.from,
    constants_1.UsageType.WITHDRAW,
    event
  ); // Burned shares are attributed to msg.sender
  (0, financials_1.updateTvl)(event);
  (0, vaults_1.updateVaultSnapshots)(vault, event.block);
}
exports.handleBurned = handleBurned;
function handleRebalance(event) {
  const vault = (0, vaults_1.getOrCreateVault)(event.address, event.block);
  // update underlying token balances is done by updateVaultTokenValue inside updateTvl
  // we update all vaults for each vault event, so the underlying token balances are updated
  // more frequently at some cost of the indexing speed
  (0, financials_1.updateTvl)(event);
  (0, vaults_1.updateVaultSnapshots)(vault, event.block);
}
exports.handleRebalance = handleRebalance;
function handleFeesEarned(event) {
  const vault = (0, vaults_1.getOrCreateVault)(event.address, event.block);
  (0, financials_1.updateRevenue)(event);
  (0, financials_1.updateTvl)(event);
  (0, vaults_1.updateVaultSnapshots)(vault, event.block);
}
exports.handleFeesEarned = handleFeesEarned;
function handleUpdateManagerParams(event) {
  const vaultPerformanceFee = (0, vaults_1.getOrCreateVaultFee)(
    constants_1.VaultFeeType.PERFORMANCE_FEE,
    event.address.toHex()
  );
  const managerFee = graph_ts_1.BigInt.fromI32(
    event.params.managerFeeBPS / 100
  ).toBigDecimal();
  vaultPerformanceFee.feePercentage =
    constants_1.PROTOCOL_PERFORMANCE_FEE.plus(managerFee);
  vaultPerformanceFee.save();
}
exports.handleUpdateManagerParams = handleUpdateManagerParams;
