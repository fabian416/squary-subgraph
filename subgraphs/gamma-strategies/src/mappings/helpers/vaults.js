"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVaultFee = exports.getOrCreateUnderlyingToken = exports.getOrCreateVault = exports.updateVaultSnapshots = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const Hypervisor_1 = require("../../../generated/templates/Hypervisor/Hypervisor");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const usageMetrics_1 = require("./usageMetrics");
// Update daily and hourly snapshots from vault entity
function updateVaultSnapshots(event) {
    let vault = getOrCreateVault(event.address, event);
    let dailySnapshot = (0, getters_1.getOrCreateVaultDailySnapshot)(event);
    let hourlySnapshot = (0, getters_1.getOrCreateVaultHourlySnapshot)(event);
    dailySnapshot.inputTokenBalance = vault.inputTokenBalance;
    dailySnapshot.outputTokenSupply = vault.outputTokenSupply;
    dailySnapshot.totalValueLockedUSD = vault.totalValueLockedUSD;
    dailySnapshot.cumulativeSupplySideRevenueUSD =
        vault.cumulativeSupplySideRevenueUSD;
    dailySnapshot.cumulativeProtocolSideRevenueUSD =
        vault.cumulativeProtocolSideRevenueUSD;
    dailySnapshot.cumulativeTotalRevenueUSD = vault.cumulativeTotalRevenueUSD;
    dailySnapshot.outputTokenPriceUSD = vault.outputTokenPriceUSD;
    dailySnapshot.blockNumber = event.block.number;
    dailySnapshot.timestamp = event.block.timestamp;
    hourlySnapshot.inputTokenBalance = vault.inputTokenBalance;
    hourlySnapshot.outputTokenSupply = vault.outputTokenSupply;
    hourlySnapshot.totalValueLockedUSD = vault.totalValueLockedUSD;
    hourlySnapshot.cumulativeSupplySideRevenueUSD =
        vault.cumulativeSupplySideRevenueUSD;
    hourlySnapshot.cumulativeProtocolSideRevenueUSD =
        vault.cumulativeProtocolSideRevenueUSD;
    hourlySnapshot.cumulativeTotalRevenueUSD = vault.cumulativeTotalRevenueUSD;
    hourlySnapshot.outputTokenPriceUSD = vault.outputTokenPriceUSD;
    hourlySnapshot.blockNumber = event.block.number;
    hourlySnapshot.timestamp = event.block.timestamp;
    dailySnapshot.save();
    hourlySnapshot.save();
}
exports.updateVaultSnapshots = updateVaultSnapshots;
function getOrCreateVault(vaultAddress, event) {
    let vaultId = vaultAddress.toHex();
    let vault = schema_1.Vault.load(vaultId);
    if (!vault) {
        let hypeContract = Hypervisor_1.Hypervisor.bind(vaultAddress);
        // Create relevant tokens
        getOrCreateUnderlyingToken(vaultAddress);
        (0, getters_1.getOrCreateToken)(vaultAddress);
        vault = new schema_1.Vault(vaultId);
        vault.protocol = constants_1.REGISTRY_ADDRESS_MAP.get(graph_ts_1.dataSource.network()).toHex();
        vault.name = hypeContract.name();
        vault.symbol = hypeContract.symbol();
        vault.inputToken = vaultId;
        vault.outputToken = vaultId;
        vault.rewardTokens = null;
        vault.depositLimit = constants_1.BIGINT_MAX.minus(constants_1.BIGINT_ONE);
        vault.createdTimestamp = event.block.timestamp;
        vault.createdBlockNumber = event.block.number;
        vault.totalValueLockedUSD = graph_ts_1.BigDecimal.zero();
        vault.cumulativeSupplySideRevenueUSD = graph_ts_1.BigDecimal.zero();
        vault.cumulativeProtocolSideRevenueUSD = graph_ts_1.BigDecimal.zero();
        vault.cumulativeTotalRevenueUSD = graph_ts_1.BigDecimal.zero();
        vault.inputTokenBalance = constants_1.BIGINT_ZERO;
        vault.outputTokenSupply = constants_1.BIGINT_ZERO;
        vault.outputTokenPriceUSD = graph_ts_1.BigDecimal.zero();
        vault.pricePerShare = null;
        vault.stakedOutputTokenAmount = null;
        vault.rewardTokenEmissionsAmount = null;
        vault.rewardTokenEmissionsUSD = null;
        let vaultPerformanceFee = createVaultFee(constants_1.VaultFeeType.PERFORMANCE_FEE, constants_1.PROTOCOL_PERFORMANCE_FEE, vaultId);
        vault.fees = [vaultPerformanceFee.id];
        (0, usageMetrics_1.incrementTotalPoolCount)(event);
        vault.save();
    }
    return vault;
}
exports.getOrCreateVault = getOrCreateVault;
function getOrCreateUnderlyingToken(vaultAddress) {
    const vaultId = vaultAddress.toHex();
    let underlyingToken = schema_1._UnderlyingToken.load(vaultId);
    if (!underlyingToken) {
        const hypeContract = Hypervisor_1.Hypervisor.bind(vaultAddress);
        const token0Address = hypeContract.token0();
        const token1Address = hypeContract.token1();
        const totalAmounts = hypeContract.getTotalAmounts();
        (0, getters_1.getOrCreateToken)(token0Address);
        (0, getters_1.getOrCreateToken)(token1Address);
        underlyingToken = new schema_1._UnderlyingToken(vaultId);
        underlyingToken.token0 = token0Address.toHex();
        underlyingToken.lastAmount0 = totalAmounts.value0;
        underlyingToken.token1 = token1Address.toHex();
        underlyingToken.lastAmount1 = totalAmounts.value1;
        underlyingToken.lastAmountBlockNumber = constants_1.BIGINT_ZERO;
        underlyingToken.save();
    }
    return underlyingToken;
}
exports.getOrCreateUnderlyingToken = getOrCreateUnderlyingToken;
function createVaultFee(feeType, feePercentage, vaultId) {
    let vaultFee = new schema_1.VaultFee(feeType.concat("-").concat(vaultId));
    vaultFee.feePercentage = feePercentage;
    vaultFee.feeType = feeType;
    vaultFee.save();
    return vaultFee;
}
exports.createVaultFee = createVaultFee;
