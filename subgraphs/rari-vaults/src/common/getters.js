"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateVaultInterest = exports.getOrCreateVaultFee = exports.getOrCreateToken = exports.getOrCreateVault = exports.getOrCreateYieldAggregator = exports.getOrCreateFinancials = exports.getOrCreateVaultHourlySnapshot = exports.getOrCreateVaultDailySnapshot = exports.getOrCreateUsageHourlySnapshot = exports.getOrCreateUsageDailySnapshot = void 0;
// get or create snapshots and metrics
const schema_1 = require("../../generated/schema");
const constants_1 = require("./utils/constants");
const tokens_1 = require("./utils/tokens");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const versions_1 = require("../versions");
///////////////////
//// Snapshots ////
///////////////////
function getOrCreateUsageDailySnapshot(event) {
    // Number of days since Unix epoch
    let id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id.toString());
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id.toString());
        usageMetrics.protocol = constants_1.RARI_DEPLOYER;
        usageMetrics.dailyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.dailyTransactionCount = 0;
        usageMetrics.dailyDepositCount = 0;
        usageMetrics.dailyWithdrawCount = 0;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.totalPoolCount = 0;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageDailySnapshot = getOrCreateUsageDailySnapshot;
function getOrCreateUsageHourlySnapshot(event) {
    // Number of days since Unix epoch
    let hour = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(hour.toString());
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(hour.toString());
        usageMetrics.protocol = constants_1.RARI_DEPLOYER;
        usageMetrics.hourlyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.hourlyTransactionCount = 0;
        usageMetrics.hourlyDepositCount = 0;
        usageMetrics.hourlyWithdrawCount = 0;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageHourlySnapshot = getOrCreateUsageHourlySnapshot;
// get vault daily snapshot with default values
function getOrCreateVaultDailySnapshot(event, vaultAddress) {
    let days = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    let id = vaultAddress + "-" + days.toString();
    let vaultMetrics = schema_1.VaultDailySnapshot.load(id);
    if (!vaultMetrics) {
        vaultMetrics = new schema_1.VaultDailySnapshot(id);
        vaultMetrics.protocol = constants_1.RARI_DEPLOYER;
        vaultMetrics.vault = vaultAddress;
        vaultMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.inputTokenBalance = constants_1.BIGINT_ZERO;
        vaultMetrics.outputTokenSupply = constants_1.BIGINT_ZERO;
        vaultMetrics.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.blockNumber = event.block.number;
        vaultMetrics.timestamp = event.block.timestamp;
        vaultMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.save();
    }
    return vaultMetrics;
}
exports.getOrCreateVaultDailySnapshot = getOrCreateVaultDailySnapshot;
function getOrCreateVaultHourlySnapshot(event, vaultAddress) {
    let hours = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    let id = vaultAddress + "-" + hours.toString();
    let vaultMetrics = schema_1.VaultHourlySnapshot.load(id);
    if (!vaultMetrics) {
        vaultMetrics = new schema_1.VaultHourlySnapshot(id);
        vaultMetrics.protocol = constants_1.RARI_DEPLOYER;
        vaultMetrics.vault = vaultAddress;
        vaultMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.inputTokenBalance = constants_1.BIGINT_ZERO;
        vaultMetrics.outputTokenSupply = constants_1.BIGINT_ZERO;
        vaultMetrics.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.blockNumber = event.block.number;
        vaultMetrics.timestamp = event.block.timestamp;
        vaultMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vaultMetrics.save();
    }
    return vaultMetrics;
}
exports.getOrCreateVaultHourlySnapshot = getOrCreateVaultHourlySnapshot;
function getOrCreateFinancials(event) {
    // Number of days since Unix epoch
    let id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(id.toString());
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(id.toString());
        financialMetrics.protocol = constants_1.RARI_DEPLOYER;
        financialMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.blockNumber = event.block.number;
        financialMetrics.timestamp = event.block.timestamp;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancials = getOrCreateFinancials;
////////////////////////////////////
//// Yield Aggregator Specific /////
////////////////////////////////////
function getOrCreateYieldAggregator() {
    let protocol = schema_1.YieldAggregator.load(constants_1.RARI_DEPLOYER);
    if (!protocol) {
        protocol = new schema_1.YieldAggregator(constants_1.RARI_DEPLOYER);
        protocol._vaultList = [];
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = constants_1.PROTOCOL_NETWORK;
        protocol.type = constants_1.PROTOCOL_TYPE;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.totalPoolCount = constants_1.INT_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateYieldAggregator = getOrCreateYieldAggregator;
function getOrCreateVault(event, vaultAddress, inputToken) {
    let id = vaultAddress + "-" + inputToken;
    let vault = schema_1.Vault.load(id);
    if (!vault) {
        vault = new schema_1.Vault(id);
        vault._vaultInterest = getOrCreateVaultInterest(vaultAddress, event.block.number).id;
        // set protocol fields
        let protocol = getOrCreateYieldAggregator();
        vault.protocol = protocol.id;
        let vaults = protocol._vaultList;
        vaults.push(id);
        protocol._vaultList = vaults;
        protocol.totalPoolCount += 1;
        protocol.save();
        // get input token
        let token = getOrCreateToken(inputToken);
        // add pool-specific items
        let poolToken;
        if (vaultAddress == constants_1.YIELD_VAULT_ADDRESS) {
            vault.name = constants_1.YIELD_VAULT_NAME + "-" + token.name;
            vault.symbol = constants_1.YIELD_VAULT_SYMBOL + "-" + token.name;
            poolToken = getOrCreateToken(constants_1.RARI_YIELD_POOL_TOKEN);
        }
        else if (vaultAddress == constants_1.USDC_VAULT_ADDRESS) {
            vault.name = constants_1.USDC_VAULT_NAME + "-" + token.name;
            vault.symbol = constants_1.USDC_VAULT_SYMBOL + "-" + token.name;
            poolToken = getOrCreateToken(constants_1.RARI_STABLE_POOL_TOKEN);
        }
        else if (vaultAddress == constants_1.DAI_VAULT_ADDRESS) {
            vault.name = constants_1.DAI_VAULT_NAME + "-" + token.name;
            vault.symbol = constants_1.DAI_VAULT_SYMBOL + "-" + token.name;
            poolToken = getOrCreateToken(constants_1.RARI_DAI_POOL_TOKEN);
        }
        else {
            vault.name = constants_1.ETHER_VAULT_NAME + "-" + token.name;
            vault.symbol = constants_1.ETHER_VAULT_SYMBOL + "-" + token.name;
            poolToken = getOrCreateToken(constants_1.RARI_ETHER_POOL_TOKEN);
        }
        // populate input tokens
        vault.inputToken = inputToken;
        vault.inputTokenBalance = constants_1.BIGINT_ZERO;
        vault.outputToken = poolToken.id;
        vault.depositLimit = constants_1.BIGINT_ZERO;
        // create fees for pool
        if (vaultAddress == constants_1.YIELD_VAULT_ADDRESS) {
            vault.fees = [
                getOrCreateVaultFee(constants_1.VaultFeeType.WITHDRAWAL_FEE, vaultAddress).id,
                getOrCreateVaultFee(constants_1.VaultFeeType.PERFORMANCE_FEE, vaultAddress).id,
            ];
        }
        else {
            vault.fees = [
                getOrCreateVaultFee(constants_1.VaultFeeType.PERFORMANCE_FEE, vaultAddress).id,
            ];
        }
        vault.createdTimestamp = event.block.timestamp;
        vault.createdBlockNumber = event.block.number;
        vault.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        vault.outputTokenSupply = constants_1.BIGINT_ZERO;
        vault.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO; // can find by dividing TVL by outputTokenSupply
        vault.pricePerShare = constants_1.BIGDECIMAL_ZERO;
        vault.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vault.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vault.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        vault.save();
    }
    return vault;
}
exports.getOrCreateVault = getOrCreateVault;
function getOrCreateToken(tokenAddress) {
    let token = schema_1.Token.load(tokenAddress);
    if (token == null) {
        token = new schema_1.Token(tokenAddress);
        // check for ETH token - unique
        if (tokenAddress == constants_1.ETH_ADDRESS) {
            token.name = constants_1.ETH_NAME;
            token.symbol = constants_1.ETH_SYMBOL;
            token.decimals = constants_1.DEFAULT_DECIMALS;
        }
        else {
            token.name = (0, tokens_1.getAssetName)(graph_ts_1.Address.fromString(tokenAddress));
            token.symbol = (0, tokens_1.getAssetSymbol)(graph_ts_1.Address.fromString(tokenAddress));
            token.decimals = (0, tokens_1.getAssetDecimals)(graph_ts_1.Address.fromString(tokenAddress));
        }
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateVaultFee(type, vault) {
    let id = type + "-" + vault;
    let vaultFee = schema_1.VaultFee.load(id);
    if (vaultFee == null) {
        vaultFee = new schema_1.VaultFee(id);
        vaultFee.feePercentage = constants_1.BIGDECIMAL_ZERO;
        vaultFee.feeType = type;
        vaultFee.save();
    }
    return vaultFee;
}
exports.getOrCreateVaultFee = getOrCreateVaultFee;
function getOrCreateVaultInterest(vaultAddress, blockNumber) {
    let vaultHelper = schema_1._VaultInterest.load(vaultAddress);
    if (vaultHelper == null) {
        vaultHelper = new schema_1._VaultInterest(vaultAddress);
        vaultHelper.interestAccruedUSD = constants_1.BIGDECIMAL_ZERO;
        vaultHelper.lastBlockNumber = blockNumber;
        vaultHelper.save();
    }
    return vaultHelper;
}
exports.getOrCreateVaultInterest = getOrCreateVaultInterest;
