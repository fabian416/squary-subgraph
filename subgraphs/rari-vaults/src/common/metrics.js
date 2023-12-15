"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVaultHourlyMetrics = exports.updateVaultDailyMetrics = exports.updateUsageMetrics = exports.updateFinancials = void 0;
// // update snapshots and metrics
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const getters_1 = require("./getters");
const constants_1 = require("./utils/constants");
///////////////////////////
//// Snapshot Entities ////
///////////////////////////
// updates a given FinancialDailySnapshot Entity
function updateFinancials(event) {
    // number of days since unix epoch
    let financialMetrics = (0, getters_1.getOrCreateFinancials)(event);
    let protocol = (0, getters_1.getOrCreateYieldAggregator)();
    financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialMetrics.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialMetrics.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialMetrics.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    // update the block number and timestamp
    financialMetrics.blockNumber = event.block.number;
    financialMetrics.timestamp = event.block.timestamp;
    financialMetrics.save();
}
exports.updateFinancials = updateFinancials;
// update a given UsageMetricDailySnapshot
function updateUsageMetrics(event, from, transaction) {
    // Number of days since Unix epoch
    let day = (event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    let hour = (event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR).toString();
    let dailyMetrics = (0, getters_1.getOrCreateUsageDailySnapshot)(event);
    let hourlyMetrics = (0, getters_1.getOrCreateUsageHourlySnapshot)(event);
    let protocol = (0, getters_1.getOrCreateYieldAggregator)();
    // Update the block number and timestamp to that of the last transaction of that day
    dailyMetrics.blockNumber = event.block.number;
    dailyMetrics.timestamp = event.block.timestamp;
    dailyMetrics.dailyTransactionCount += 1;
    dailyMetrics.totalPoolCount = protocol.totalPoolCount;
    // update hourlyMetrics
    hourlyMetrics.blockNumber = event.block.number;
    hourlyMetrics.timestamp = event.block.timestamp;
    hourlyMetrics.hourlyTransactionCount += 1;
    let accountId = from.toHexString();
    let account = schema_1.Account.load(accountId);
    if (!account) {
        account = new schema_1.Account(accountId);
        account.save();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    hourlyMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    dailyMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    // Combine the id and the user address to generate a unique user id for the day
    let dailyActiveAccountId = constants_1.ActivityType.DAILY.concat("-")
        .concat(from.toHexString())
        .concat("-")
        .concat(day);
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        dailyActiveAccount.save();
        dailyMetrics.dailyActiveUsers += 1;
    }
    // create active account for hourlyMetrics
    let hourlyActiveAccountId = constants_1.ActivityType.HOURLY.concat("-")
        .concat(from.toHexString())
        .concat("-")
        .concat(hour);
    let hourlyActiveAccount = schema_1.ActiveAccount.load(hourlyActiveAccountId);
    if (!hourlyActiveAccount) {
        hourlyActiveAccount = new schema_1.ActiveAccount(hourlyActiveAccountId);
        hourlyActiveAccount.save();
        hourlyMetrics.hourlyActiveUsers += 1;
    }
    // update transaction for daily/hourly metrics
    updateTransactionCount(dailyMetrics, hourlyMetrics, transaction);
    hourlyMetrics.save();
    dailyMetrics.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
// update vault daily metrics
function updateVaultDailyMetrics(event, vaultId) {
    let vaultMetrics = (0, getters_1.getOrCreateVaultDailySnapshot)(event, vaultId);
    let vault = schema_1.Vault.load(vaultId);
    if (!vault) {
        graph_ts_1.log.warning("[updateVaultDailyMetrics] Vault not found: {}", [vaultId]);
        return;
    }
    vaultMetrics.totalValueLockedUSD = vault.totalValueLockedUSD;
    vaultMetrics.inputTokenBalance = vault.inputTokenBalance;
    vaultMetrics.outputTokenSupply = vault.outputTokenSupply;
    vaultMetrics.outputTokenPriceUSD = vault.outputTokenPriceUSD;
    vaultMetrics.pricePerShare = vault.pricePerShare;
    vaultMetrics.cumulativeSupplySideRevenueUSD =
        vault.cumulativeSupplySideRevenueUSD;
    vaultMetrics.cumulativeProtocolSideRevenueUSD =
        vault.cumulativeProtocolSideRevenueUSD;
    vaultMetrics.cumulativeTotalRevenueUSD = vault.cumulativeTotalRevenueUSD;
    // update block and timestamp
    vaultMetrics.blockNumber = event.block.number;
    vaultMetrics.timestamp = event.block.timestamp;
    vaultMetrics.save();
}
exports.updateVaultDailyMetrics = updateVaultDailyMetrics;
// update vault hourly metrics
function updateVaultHourlyMetrics(event, vaultId) {
    let vaultMetrics = (0, getters_1.getOrCreateVaultHourlySnapshot)(event, vaultId);
    let vault = schema_1.Vault.load(vaultId);
    if (!vault) {
        graph_ts_1.log.warning("[updateVaultHourlyMetrics] Vault not found: {}", [vaultId]);
        return;
    }
    vaultMetrics.totalValueLockedUSD = vault.totalValueLockedUSD;
    vaultMetrics.inputTokenBalance = vault.inputTokenBalance;
    vaultMetrics.outputTokenSupply = vault.outputTokenSupply;
    vaultMetrics.outputTokenPriceUSD = vault.outputTokenPriceUSD;
    vaultMetrics.pricePerShare = vault.pricePerShare;
    vaultMetrics.cumulativeProtocolSideRevenueUSD =
        vault.cumulativeProtocolSideRevenueUSD;
    vaultMetrics.cumulativeSupplySideRevenueUSD =
        vault.cumulativeSupplySideRevenueUSD;
    vaultMetrics.cumulativeTotalRevenueUSD = vault.cumulativeTotalRevenueUSD;
    // update block and timestamp
    vaultMetrics.blockNumber = event.block.number;
    vaultMetrics.timestamp = event.block.timestamp;
    vaultMetrics.save();
}
exports.updateVaultHourlyMetrics = updateVaultHourlyMetrics;
/////////////////
//// Helpers ////
/////////////////
function updateTransactionCount(dailyUsage, hourlyUsage, transaction) {
    if (transaction == constants_1.TransactionType.DEPOSIT) {
        hourlyUsage.hourlyDepositCount += 1;
        dailyUsage.dailyDepositCount += 1;
    }
    else if (transaction == constants_1.TransactionType.WITHDRAW) {
        hourlyUsage.hourlyWithdrawCount += 1;
        dailyUsage.dailyWithdrawCount += 1;
    }
    hourlyUsage.save();
    dailyUsage.save();
}
