"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnderlyingTokenBalances =
  exports.getOrCreateVaultFee =
  exports.getOrCreateVault =
  exports.updateVaultSnapshots =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const ArrakisVaultV1_1 = require("../../../generated/templates/ArrakisVault/ArrakisVaultV1");
const UniswapV3Pool_1 = require("../../../generated/templates/ArrakisVault/UniswapV3Pool");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
// Update daily and hourly snapshots from vault entity
function updateVaultSnapshots(vault, block) {
  const dailySnapshot = (0, getters_1.getOrCreateVaultDailySnapshot)(
    graph_ts_1.Address.fromString(vault.id),
    block
  );
  const hourlySnapshot = (0, getters_1.getOrCreateVaultHourlySnapshot)(
    graph_ts_1.Address.fromString(vault.id),
    block
  );
  dailySnapshot.inputTokenBalance = vault.inputTokenBalance;
  dailySnapshot.outputTokenSupply = vault.outputTokenSupply;
  dailySnapshot.totalValueLockedUSD = vault.totalValueLockedUSD;
  dailySnapshot.outputTokenPriceUSD = vault.outputTokenPriceUSD;
  dailySnapshot.cumulativeSupplySideRevenueUSD =
    vault.cumulativeSupplySideRevenueUSD;
  dailySnapshot.cumulativeProtocolSideRevenueUSD =
    vault.cumulativeProtocolSideRevenueUSD;
  dailySnapshot.cumulativeTotalRevenueUSD = vault.cumulativeTotalRevenueUSD;
  dailySnapshot.stakedOutputTokenAmount = vault.stakedOutputTokenAmount;
  dailySnapshot.rewardTokenEmissionsAmount = vault.rewardTokenEmissionsAmount;
  dailySnapshot.rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
  dailySnapshot._token0 = vault._token0;
  dailySnapshot._token1 = vault._token1;
  dailySnapshot._token0Amount = vault._token0Amount;
  dailySnapshot._token1Amount = vault._token1Amount;
  dailySnapshot._token0AmountUSD = vault._token0AmountUSD;
  dailySnapshot._token1AmountUSD = vault._token1AmountUSD;
  dailySnapshot.blockNumber = block.number;
  dailySnapshot.timestamp = block.timestamp;
  hourlySnapshot.inputTokenBalance = vault.inputTokenBalance;
  hourlySnapshot.outputTokenSupply = vault.outputTokenSupply;
  hourlySnapshot.totalValueLockedUSD = vault.totalValueLockedUSD;
  hourlySnapshot.outputTokenPriceUSD = vault.outputTokenPriceUSD;
  hourlySnapshot.cumulativeSupplySideRevenueUSD =
    vault.cumulativeSupplySideRevenueUSD;
  hourlySnapshot.cumulativeProtocolSideRevenueUSD =
    vault.cumulativeProtocolSideRevenueUSD;
  hourlySnapshot.cumulativeTotalRevenueUSD = vault.cumulativeTotalRevenueUSD;
  hourlySnapshot.stakedOutputTokenAmount = vault.stakedOutputTokenAmount;
  hourlySnapshot.rewardTokenEmissionsAmount = vault.rewardTokenEmissionsAmount;
  hourlySnapshot.rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
  hourlySnapshot.blockNumber = block.number;
  hourlySnapshot.timestamp = block.timestamp;
  dailySnapshot.save();
  hourlySnapshot.save();
}
exports.updateVaultSnapshots = updateVaultSnapshots;
function getOrCreateVault(vaultAddress, block) {
  const vaultId = vaultAddress.toHex();
  let vault = schema_1.Vault.load(vaultId);
  if (!vault) {
    const vaultContract = ArrakisVaultV1_1.ArrakisVaultV1.bind(vaultAddress);
    const poolAddress = vaultContract.pool();
    const poolContract = UniswapV3Pool_1.UniswapV3Pool.bind(poolAddress);
    const poolFeePercentage = poolContract.fee() / 10000.0;
    // Create relevant tokens
    (0, getters_1.getOrCreateToken)(vaultAddress);
    vault = new schema_1.Vault(vaultId);
    vault.protocol = "";
    vault.name = vaultContract
      .name()
      .concat("-")
      .concat(poolFeePercentage.toString())
      .concat("%");
    vault.symbol = vaultContract.symbol();
    vault.inputToken = vaultId;
    vault.outputToken = vaultId;
    vault.rewardTokens = [];
    vault.depositLimit = constants_1.BIGINT_MAX;
    vault.createdTimestamp = block.timestamp;
    vault.createdBlockNumber = block.number;
    vault.totalValueLockedUSD = graph_ts_1.BigDecimal.zero();
    vault.cumulativeSupplySideRevenueUSD = graph_ts_1.BigDecimal.zero();
    vault.cumulativeProtocolSideRevenueUSD = graph_ts_1.BigDecimal.zero();
    vault.cumulativeTotalRevenueUSD = graph_ts_1.BigDecimal.zero();
    vault.inputTokenBalance = constants_1.BIGINT_ZERO;
    vault.outputTokenSupply = constants_1.BIGINT_ZERO;
    vault.outputTokenPriceUSD = graph_ts_1.BigDecimal.zero();
    vault.pricePerShare = null;
    vault.stakedOutputTokenAmount = constants_1.BIGINT_ZERO;
    vault.rewardTokenEmissionsAmount = [];
    vault.rewardTokenEmissionsUSD = [];
    vault._token0 = "";
    vault._token1 = "";
    vault._token0Amount = constants_1.BIGINT_ZERO;
    vault._token1Amount = constants_1.BIGINT_ZERO;
    vault._token0AmountUSD = constants_1.BIGDECIMAL_ZERO;
    vault._token1AmountUSD = constants_1.BIGDECIMAL_ZERO;
    const managerFee = graph_ts_1.BigInt.fromI32(
      vaultContract.managerFeeBPS() / 100
    ).toBigDecimal();
    const vaultPerformanceFee = getOrCreateVaultFee(
      constants_1.VaultFeeType.PERFORMANCE_FEE,
      vaultId
    );
    vaultPerformanceFee.feePercentage =
      constants_1.PROTOCOL_PERFORMANCE_FEE.plus(managerFee);
    vaultPerformanceFee.save();
    vault.fees = [vaultPerformanceFee.id];
    vault.save();
  }
  return vault;
}
exports.getOrCreateVault = getOrCreateVault;
function getOrCreateVaultFee(feeType, vaultId) {
  const vaultFeeId = feeType.concat("-").concat(vaultId);
  let vaultFee = schema_1.VaultFee.load(vaultFeeId);
  if (!vaultFee) {
    vaultFee = new schema_1.VaultFee(vaultFeeId);
    vaultFee.feePercentage = graph_ts_1.BigDecimal.zero();
    vaultFee.feeType = feeType;
    vaultFee.save();
  }
  return vaultFee;
}
exports.getOrCreateVaultFee = getOrCreateVaultFee;
function getUnderlyingTokenBalances(vaultAddress, event) {
  const vaultContract = ArrakisVaultV1_1.ArrakisVaultV1.bind(vaultAddress);
  const underlyingBalancesResult = vaultContract.try_getUnderlyingBalances();
  if (underlyingBalancesResult.reverted) {
    graph_ts_1.log.error(
      "[getUnderlyingTokenBalances]vault {} getUnderlyingBalances() call reverted tx {}-{}",
      [
        vaultAddress.toHexString(),
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return null;
  }
  const result = [
    underlyingBalancesResult.value.getAmount0Current(),
    underlyingBalancesResult.value.getAmount1Current(),
  ];
  return result;
}
exports.getUnderlyingTokenBalances = getUnderlyingTokenBalances;
