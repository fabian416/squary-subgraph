"use strict";
// Update usage metrics entities
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProtocolSideRewards = exports.updateSupplySideRewards = exports.updateTVL = exports.updateUsageMetrics = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("./constants");
const getters_1 = require("./getters");
const utils_1 = require("./utils");
const configure_1 = require("../../configurations/configure");
// Updated on Swap, Burn, and Mint events.
function updateUsageMetrics(event, usageAddress) {
    const from = usageAddress.toHexString();
    const usageMetricsDaily = (0, getters_1.getOrCreateUsageMetricDailySnapshot)(event);
    const usageMetricsHourly = (0, getters_1.getOrCreateUsageMetricHourlySnapshot)(event);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    // Update the block number and timestamp to that of the last transaction of that day
    usageMetricsDaily.blockNumber = event.block.number;
    usageMetricsDaily.timestamp = event.block.timestamp;
    usageMetricsDaily.dailyTransactionCount += constants_1.INT_ONE;
    usageMetricsHourly.blockNumber = event.block.number;
    usageMetricsHourly.timestamp = event.block.timestamp;
    usageMetricsHourly.hourlyTransactionCount += constants_1.INT_ONE;
    // Number of days since Unix epoch
    const day = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    const hour = event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR;
    const dayId = day.toString();
    const hourId = hour.toString();
    // Combine the id and the user address to generate a unique user id for the day
    const dailyActiveAccountId = from.concat("-").concat(dayId);
    let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
        usageMetricsDaily.dailyActiveUsers += constants_1.INT_ONE;
        dailyActiveAccount.save();
    }
    const hourlyActiveAccountId = from.concat("-").concat(hourId);
    let hourlyActiveAccount = schema_1.ActiveAccount.load(hourlyActiveAccountId);
    if (!hourlyActiveAccount) {
        hourlyActiveAccount = new schema_1.ActiveAccount(hourlyActiveAccountId);
        usageMetricsHourly.hourlyActiveUsers += constants_1.INT_ONE;
        hourlyActiveAccount.save();
    }
    let account = schema_1.Account.load(from);
    if (!account) {
        account = new schema_1.Account(from);
        protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
        account.save();
    }
    usageMetricsDaily.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsHourly.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsDaily.save();
    usageMetricsHourly.save();
    protocol.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
function updateTVL(event, tokens) {
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    const grt = (0, getters_1.getOrCreateToken)(event, configure_1.NetworkConfigs.getGraphTokenAddress());
    protocol._totalGRTLocked = protocol._totalGRTLocked.plus(tokens);
    protocol.totalValueLockedUSD = (0, utils_1.convertTokenToDecimal)(protocol._totalGRTLocked, grt.decimals).times(grt.lastPriceUSD);
    financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialMetrics.save();
    protocol.save();
}
exports.updateTVL = updateTVL;
function updateSupplySideRewards(event, amount) {
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    const grt = (0, getters_1.getOrCreateToken)(event, configure_1.NetworkConfigs.getGraphTokenAddress());
    const rewardsAmountUSD = (0, utils_1.convertTokenToDecimal)(amount, grt.decimals).times(grt.lastPriceUSD);
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(rewardsAmountUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(rewardsAmountUSD);
    financialMetrics.dailySupplySideRevenueUSD =
        financialMetrics.dailySupplySideRevenueUSD.plus(rewardsAmountUSD);
    financialMetrics.dailyTotalRevenueUSD =
        financialMetrics.dailyTotalRevenueUSD.plus(rewardsAmountUSD);
    financialMetrics.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialMetrics.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    financialMetrics.save();
    protocol.save();
}
exports.updateSupplySideRewards = updateSupplySideRewards;
function updateProtocolSideRewards(event, amount) {
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    const grt = (0, getters_1.getOrCreateToken)(event, configure_1.NetworkConfigs.getGraphTokenAddress());
    const rewardsAmountUSD = (0, utils_1.convertTokenToDecimal)(amount, grt.decimals).times(grt.lastPriceUSD);
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(rewardsAmountUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(rewardsAmountUSD);
    financialMetrics.dailyProtocolSideRevenueUSD =
        financialMetrics.dailyProtocolSideRevenueUSD.plus(rewardsAmountUSD);
    financialMetrics.dailyTotalRevenueUSD =
        financialMetrics.dailyTotalRevenueUSD.plus(rewardsAmountUSD);
    financialMetrics.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialMetrics.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
    financialMetrics.save();
    protocol.save();
}
exports.updateProtocolSideRewards = updateProtocolSideRewards;
