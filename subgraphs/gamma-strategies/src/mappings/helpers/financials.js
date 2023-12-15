"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRevenue = exports.updateTvl = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Hypervisor_1 = require("../../../generated/templates/Hypervisor/Hypervisor");
const vaults_1 = require("./vaults");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const pricing_1 = require("./pricing");
const numbers_1 = require("../../common/utils/numbers");
// Update TVL related fields in all entities
function updateTvl(event) {
    let underlyingToken = (0, vaults_1.getOrCreateUnderlyingToken)(event.address);
    // Update underlying amounts
    if (event.block.number > underlyingToken.lastAmountBlockNumber) {
        let hypeContract = Hypervisor_1.Hypervisor.bind(event.address);
        let totalAmounts = hypeContract.getTotalAmounts();
        underlyingToken.lastAmount0 = totalAmounts.value0;
        underlyingToken.lastAmount1 = totalAmounts.value1;
        underlyingToken.save();
    }
    // Track existing TVL for cumulative calculations
    let vault = (0, vaults_1.getOrCreateVault)(event.address, event);
    let oldTvl = vault.totalValueLockedUSD;
    let newTvl = (0, pricing_1.getDualTokenUSD)(graph_ts_1.Address.fromString(underlyingToken.token0), graph_ts_1.Address.fromString(underlyingToken.token1), underlyingToken.lastAmount0, underlyingToken.lastAmount1, event.block.number);
    // Calculate price per share
    let outputToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(vault.outputToken));
    let vaultTokenSupply = vault.outputTokenSupply;
    let outputTokenPriceUSD = vault.outputTokenPriceUSD;
    if (vaultTokenSupply > constants_1.BIGINT_ZERO) {
        let outputTokenSupplyDecimals = (0, numbers_1.bigIntToBigDecimal)(vaultTokenSupply, outputToken.decimals);
        outputTokenPriceUSD = newTvl.div(outputTokenSupplyDecimals);
    }
    // Update entities
    let protocol = (0, getters_1.getOrCreateYieldAggregator)(constants_1.REGISTRY_ADDRESS_MAP.get(graph_ts_1.dataSource.network()));
    let financialsDailySnapshot = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    vault.totalValueLockedUSD = newTvl;
    vault.outputTokenPriceUSD = outputTokenPriceUSD;
    protocol.totalValueLockedUSD = protocol.totalValueLockedUSD.plus(newTvl.minus(oldTvl));
    financialsDailySnapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialsDailySnapshot.blockNumber = event.block.number;
    financialsDailySnapshot.timestamp = event.block.timestamp;
    vault.save();
    protocol.save();
    financialsDailySnapshot.save();
}
exports.updateTvl = updateTvl;
// Update revenue related fields, Only changes when rebalance is called.
function updateRevenue(event) {
    let underlyingToken = (0, vaults_1.getOrCreateUnderlyingToken)(event.address);
    // Calculate revenue in USD
    let eventTotalRevenueUSD = (0, pricing_1.getDualTokenUSD)(graph_ts_1.Address.fromString(underlyingToken.token0), graph_ts_1.Address.fromString(underlyingToken.token1), event.params.feeAmount0, event.params.feeAmount1, event.block.number);
    const SupplySideShare = constants_1.BIGDECIMAL_HUNDRED.minus(constants_1.PROTOCOL_PERFORMANCE_FEE);
    let eventSupplySideRevenueUSD = eventTotalRevenueUSD
        .times(SupplySideShare)
        .div(constants_1.BIGDECIMAL_HUNDRED);
    let eventProtocolSideRevenueUSD = eventTotalRevenueUSD
        .times(constants_1.PROTOCOL_PERFORMANCE_FEE)
        .div(constants_1.BIGDECIMAL_HUNDRED);
    // Update entities
    let protocol = (0, getters_1.getOrCreateYieldAggregator)(constants_1.REGISTRY_ADDRESS_MAP.get(graph_ts_1.dataSource.network()));
    let financialsDailySnapshot = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    let VaultDailySnapshot = (0, getters_1.getOrCreateVaultDailySnapshot)(event);
    let VaultHourlySnapshot = (0, getters_1.getOrCreateVaultHourlySnapshot)(event);
    let vault = (0, vaults_1.getOrCreateVault)(event.address, event);
    // Update cumulative revenue
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(eventSupplySideRevenueUSD);
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(eventProtocolSideRevenueUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(eventTotalRevenueUSD);
    vault.cumulativeSupplySideRevenueUSD =
        vault.cumulativeSupplySideRevenueUSD.plus(eventSupplySideRevenueUSD);
    vault.cumulativeProtocolSideRevenueUSD =
        vault.cumulativeProtocolSideRevenueUSD.plus(eventProtocolSideRevenueUSD);
    vault.cumulativeTotalRevenueUSD =
        vault.cumulativeTotalRevenueUSD.plus(eventTotalRevenueUSD);
    // Increment daily revenues
    financialsDailySnapshot.dailySupplySideRevenueUSD =
        financialsDailySnapshot.dailySupplySideRevenueUSD.plus(eventSupplySideRevenueUSD);
    financialsDailySnapshot.dailyProtocolSideRevenueUSD =
        financialsDailySnapshot.dailyProtocolSideRevenueUSD.plus(eventProtocolSideRevenueUSD);
    financialsDailySnapshot.dailyTotalRevenueUSD =
        financialsDailySnapshot.dailyTotalRevenueUSD.plus(eventTotalRevenueUSD);
    VaultDailySnapshot.dailySupplySideRevenueUSD =
        VaultDailySnapshot.dailySupplySideRevenueUSD.plus(eventSupplySideRevenueUSD);
    VaultDailySnapshot.dailyProtocolSideRevenueUSD =
        VaultDailySnapshot.dailyProtocolSideRevenueUSD.plus(eventProtocolSideRevenueUSD);
    VaultDailySnapshot.dailyTotalRevenueUSD =
        VaultDailySnapshot.dailyTotalRevenueUSD.plus(eventTotalRevenueUSD);
    // Increment hourly revenues
    VaultHourlySnapshot.hourlySupplySideRevenueUSD =
        VaultHourlySnapshot.hourlySupplySideRevenueUSD.plus(eventSupplySideRevenueUSD);
    VaultHourlySnapshot.hourlyProtocolSideRevenueUSD =
        VaultHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(eventProtocolSideRevenueUSD);
    VaultHourlySnapshot.hourlyTotalRevenueUSD =
        VaultHourlySnapshot.hourlyTotalRevenueUSD.plus(eventTotalRevenueUSD);
    // Update cumulative revenue from protocol
    financialsDailySnapshot.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialsDailySnapshot.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialsDailySnapshot.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    financialsDailySnapshot.blockNumber = event.block.number;
    financialsDailySnapshot.timestamp = event.block.timestamp;
    protocol.save();
    vault.save();
    financialsDailySnapshot.save();
    VaultDailySnapshot.save();
    VaultHourlySnapshot.save();
}
exports.updateRevenue = updateRevenue;
