"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRewardDataUpdate =
  exports.handleWithdraw =
  exports.handleDeposit =
  exports.handleRemoveGauge =
  exports.handleAddGauge =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../../../generated/templates");
const LiquidityGaugeV4_1 = require("../../../generated/templates/LiquidityGauge/LiquidityGaugeV4");
const ArrakisVaultV1_1 = require("../../../generated/GaugeRegistry/ArrakisVaultV1");
const liquidityGauge_1 = require("../helpers/liquidityGauge");
const vaults_1 = require("../helpers/vaults");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
function handleAddGauge(event) {
  const vaultAddress = event.params.vault;
  const vaultContract = ArrakisVaultV1_1.ArrakisVaultV1.bind(vaultAddress);
  const poolCall = vaultContract.try_pool();
  if (poolCall.reverted) {
    graph_ts_1.log.warning(
      "[handleAddGauge] Probably not a V1 vault: {}; ignoring creating gauge. V2 is not supported yet.",
      [vaultAddress.toHexString()]
    );
    return;
  }
  const gaugeAddress = event.params.gauge;
  templates_1.LiquidityGauge.create(gaugeAddress);
  const gauge = (0, liquidityGauge_1.getOrCreateLiquidityGauge)(gaugeAddress);
  gauge.vault = vaultAddress.toHexString();
  gauge.save();
  const vault = schema_1.Vault.load(vaultAddress.toHexString());
  if (!vault) {
    graph_ts_1.log.error("[handleAddGauge]vault {} doesn't exist tx {}-{}", [
      vaultAddress.toHexString(),
      event.transaction.hash.toHexString(),
      event.transactionLogIndex.toString(),
    ]);
    return;
  }
  // Liquidity gauge sets the first reward token to SPICE in constructor
  const gaugeContract = LiquidityGaugeV4_1.LiquidityGaugeV4.bind(gaugeAddress);
  const spiceResult = gaugeContract.try_SPICE();
  if (spiceResult.reverted) {
    graph_ts_1.log.error(
      "[handleAddGauge]gauge.SPICE() call for gauge {} reverted tx {}-{}",
      [
        gaugeAddress.toHexString(),
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return;
  }
  const rewardToken = (0, getters_1.getOrCreateToken)(spiceResult.value);
  const FAKE = "FAKE";
  if (rewardToken.symbol.startsWith(FAKE)) {
    graph_ts_1.log.info(
      "[handleAddGauge]Fake reward token {} for gauge {} skipped",
      [rewardToken.symbol, gaugeAddress.toHexString()]
    );
    return;
  }
  (0, liquidityGauge_1.addRewardToken)(
    spiceResult.value,
    constants_1.RewardTokenType.DEPOSIT,
    vault
  );
  (0, vaults_1.updateVaultSnapshots)(vault, event.block);
}
exports.handleAddGauge = handleAddGauge;
function handleRemoveGauge(event) {
  const gaugeAddress = event.params.gauge;
  const vaultAddress = event.params.vault;
  const gauge = (0, liquidityGauge_1.getOrCreateLiquidityGauge)(gaugeAddress);
  const LIQUIDITY_GAUGE = "_LiquidityGauge";
  graph_ts_1.store.remove(LIQUIDITY_GAUGE, gauge.id);
  gauge.save();
  const vault = schema_1.Vault.load(vaultAddress.toHexString());
  if (!vault) {
    graph_ts_1.log.error("[handleRemoveGauge]vault {} doesn't exist tx {}-{}", [
      vaultAddress.toHexString(),
      event.transaction.hash.toHexString(),
      event.transactionLogIndex.toString(),
    ]);
    return;
  }
  // remove reward token from vault.rewardTokens
  const gaugeContract = LiquidityGaugeV4_1.LiquidityGaugeV4.bind(gaugeAddress);
  const rewardCountResult = gaugeContract.try_reward_count();
  if (rewardCountResult.reverted) {
    graph_ts_1.log.error(
      "[handleRemoveGauge]reward_count() call for gauge {} reverted tx {}-{}",
      [
        gaugeAddress.toHexString(),
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return;
  }
  for (let i = 0; i < rewardCountResult.value.toI32(); i++) {
    const rewardTokenResult = gaugeContract.try_reward_tokens(
      graph_ts_1.BigInt.fromI32(i)
    );
    if (rewardTokenResult.reverted) {
      graph_ts_1.log.error(
        "[handleRemoveGauge]reward_tokens(i) call for gauge {} reverted tx {}-{}",
        [
          i.toString(),
          gaugeAddress.toHexString(),
          event.transaction.hash.toHexString(),
          event.transactionLogIndex.toString(),
        ]
      );
      continue;
    }
    const token = (0, getters_1.getOrCreateToken)(rewardTokenResult.value);
    const FAKE = "FAKE";
    if (token.symbol.startsWith(FAKE)) {
      continue;
    }
    const rewardToken = (0, getters_1.getOrCreateRewardToken)(
      rewardTokenResult.value,
      constants_1.RewardTokenType.DEPOSIT
    );
    (0, liquidityGauge_1.removeRewardToken)(rewardToken.id, vault);
  }
  (0, vaults_1.updateVaultSnapshots)(vault, event.block);
}
exports.handleRemoveGauge = handleRemoveGauge;
function handleDeposit(event) {
  // update amount of tokens staked
  const gauge = (0, liquidityGauge_1.getOrCreateLiquidityGauge)(event.address);
  const vaultAddress = graph_ts_1.Address.fromString(gauge.vault);
  const vault = (0, vaults_1.getOrCreateVault)(vaultAddress, event.block);
  vault.stakedOutputTokenAmount = vault.stakedOutputTokenAmount.plus(
    event.params.value
  );
  vault.save();
  (0, liquidityGauge_1.updateRewardEmissions)(vault, event.address, event);
  (0, vaults_1.updateVaultSnapshots)(vault, event.block);
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
  // update amount of tokens staked
  const gauge = (0, liquidityGauge_1.getOrCreateLiquidityGauge)(event.address);
  const vaultAddress = graph_ts_1.Address.fromString(gauge.vault);
  const vault = (0, vaults_1.getOrCreateVault)(vaultAddress, event.block);
  vault.stakedOutputTokenAmount = vault.stakedOutputTokenAmount.minus(
    event.params.value
  );
  vault.save();
  (0, liquidityGauge_1.updateRewardEmissions)(vault, event.address, event);
  (0, vaults_1.updateVaultSnapshots)(vault, event.block);
}
exports.handleWithdraw = handleWithdraw;
function handleRewardDataUpdate(event) {
  // Track which tokens are being added to the vault
  const gaugeAddress = event.address;
  const rewardTokenAddress = event.params._token;
  const rewardToken = (0, getters_1.getOrCreateToken)(rewardTokenAddress);
  const FAKE = "FAKE";
  if (rewardToken.symbol.startsWith(FAKE)) {
    graph_ts_1.log.info(
      "[handleRewardDataUpdate]Fake reward token {} for gauge {} skipped",
      [rewardToken.symbol, gaugeAddress.toHexString()]
    );
    return;
  }
  const gauge = (0, liquidityGauge_1.getOrCreateLiquidityGauge)(gaugeAddress);
  const vaultAddress = graph_ts_1.Address.fromString(gauge.vault);
  const vault = schema_1.Vault.load(vaultAddress.toHexString());
  if (!vault) {
    graph_ts_1.log.error(
      "[handleRewardDataUpdate]vault {} doesn't exist tx {}-{}",
      [
        vaultAddress.toHexString(),
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return;
  }
  (0, liquidityGauge_1.addRewardToken)(
    rewardTokenAddress,
    constants_1.RewardTokenType.DEPOSIT,
    vault
  );
  (0, liquidityGauge_1.updateRewardData)(
    gaugeAddress,
    rewardTokenAddress,
    event
  );
  // Update vaults with new reward emissions
  (0, liquidityGauge_1.updateRewardEmissions)(vault, gaugeAddress, event);
  (0, vaults_1.updateVaultSnapshots)(vault, event.block);
}
exports.handleRewardDataUpdate = handleRewardDataUpdate;
