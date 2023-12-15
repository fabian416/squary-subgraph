"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVaultHourlySnapshot =
  exports.updateVaultDailySnapshot =
  exports.getVaultHourlyId =
  exports.getVaultDailyId =
    void 0;
const time_1 = require("./time");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../prices/common/constants");
function getVaultDailyId(block, vaultId) {
  const daysSinceEpoch = (0, time_1.getDaysSinceEpoch)(
    block.timestamp.toI32()
  ).toString();
  const id = vaultId.concat("-").concat(daysSinceEpoch);
  return id;
}
exports.getVaultDailyId = getVaultDailyId;
function getVaultHourlyId(block, vaultId) {
  const hoursSinceEpoch = (0, time_1.getHoursSinceEpoch)(
    block.timestamp.toI32()
  ).toString();
  const id = vaultId.concat("-").concat(hoursSinceEpoch);
  return id;
}
exports.getVaultHourlyId = getVaultHourlyId;
function updateVaultDailySnapshot(block, vault) {
  const id = getVaultDailyId(block, vault.id);
  let vaultDailySnapshot = schema_1.VaultDailySnapshot.load(id);
  if (vaultDailySnapshot == null) {
    vaultDailySnapshot = new schema_1.VaultDailySnapshot(id);
    vaultDailySnapshot.protocol = vault.protocol;
    vaultDailySnapshot.vault = vault.id;
    vaultDailySnapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  }
  vaultDailySnapshot.inputTokenBalance = vault.inputTokenBalance;
  if (vault.outputTokenSupply) {
    vaultDailySnapshot.outputTokenSupply = vault.outputTokenSupply;
  }
  if (vault.pricePerShare) {
    vaultDailySnapshot.pricePerShare = vault.pricePerShare;
  }
  vaultDailySnapshot.totalValueLockedUSD = vault.totalValueLockedUSD;
  vaultDailySnapshot.outputTokenPriceUSD = vault.outputTokenPriceUSD;
  vaultDailySnapshot.blockNumber = block.number;
  vaultDailySnapshot.timestamp = block.timestamp;
  vaultDailySnapshot.save();
  return vaultDailySnapshot;
}
exports.updateVaultDailySnapshot = updateVaultDailySnapshot;
function updateVaultHourlySnapshot(block, vault) {
  const id = getVaultHourlyId(block, vault.id);
  let vaultHourlySnapshot = schema_1.VaultHourlySnapshot.load(id);
  if (vaultHourlySnapshot == null) {
    vaultHourlySnapshot = new schema_1.VaultHourlySnapshot(id);
    vaultHourlySnapshot.protocol = vault.protocol;
    vaultHourlySnapshot.vault = vault.id;
  }
  vaultHourlySnapshot.totalValueLockedUSD = vault.totalValueLockedUSD;
  vaultHourlySnapshot.inputTokenBalance = vault.inputTokenBalance;
  if (vault.outputTokenSupply) {
    vaultHourlySnapshot.outputTokenSupply = vault.outputTokenSupply;
  }
  if (vault.pricePerShare) {
    vaultHourlySnapshot.pricePerShare = vault.pricePerShare;
  }
  vaultHourlySnapshot.blockNumber = block.number;
  vaultHourlySnapshot.timestamp = block.timestamp;
  vaultHourlySnapshot.save();
  return vaultHourlySnapshot;
}
exports.updateVaultHourlySnapshot = updateVaultHourlySnapshot;
