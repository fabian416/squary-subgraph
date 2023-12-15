"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePoolMetrics = exports.updateUsageMetrics = exports.updateFinancials = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("./constants");
const getters_1 = require("./getters");
// These are meant more as boilerplates that'll be filled out depending on the
// subgraph, and will be different from subgraph to subgraph, hence left
// partially implemented and commented out.
// They are common within a subgraph but not common across different subgraphs.
// Update FinancialsDailySnapshots entity
function updateFinancials(event) {
    const financialMetricsDaily = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    const protocol = (0, getters_1.getOrCreateDex)();
    // Update the block number and timestamp to that of the last transaction of that day
    financialMetricsDaily.blockNumber = event.block.number;
    financialMetricsDaily.timestamp = event.block.timestamp;
    financialMetricsDaily.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialMetricsDaily.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD;
    financialMetricsDaily.save();
}
exports.updateFinancials = updateFinancials;
// Update usage metrics entities
function updateUsageMetrics(event, fromAddress, usageType) {
    const from = fromAddress.toHexString();
    const usageMetricsDaily = (0, getters_1.getOrCreateUsageMetricDailySnapshot)(event);
    const usageMetricsHourly = (0, getters_1.getOrCreateUsageMetricHourlySnapshot)(event);
    const protocol = (0, getters_1.getOrCreateDex)();
    // Update the block number and timestamp to that of the last transaction of that day
    usageMetricsDaily.blockNumber = event.block.number;
    usageMetricsDaily.timestamp = event.block.timestamp;
    usageMetricsDaily.dailyTransactionCount += constants_1.INT_ONE;
    usageMetricsHourly.blockNumber = event.block.number;
    usageMetricsHourly.timestamp = event.block.timestamp;
    usageMetricsHourly.hourlyTransactionCount += constants_1.INT_ONE;
    if (usageType == constants_1.UsageType.DEPOSIT) {
        usageMetricsDaily.dailyDepositCount += constants_1.INT_ONE;
        usageMetricsHourly.hourlyDepositCount += constants_1.INT_ONE;
    }
    else if (usageType == constants_1.UsageType.WITHDRAW) {
        usageMetricsDaily.dailyWithdrawCount += constants_1.INT_ONE;
        usageMetricsHourly.hourlyWithdrawCount += constants_1.INT_ONE;
    }
    else if (usageType == constants_1.UsageType.SWAP) {
        usageMetricsDaily.dailySwapCount += constants_1.INT_ONE;
        usageMetricsHourly.hourlySwapCount += constants_1.INT_ONE;
    }
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
// Update Pool Snapshots entities
function updatePoolMetrics(event) {
    // get or create pool metrics
    const poolMetricsDaily = (0, getters_1.getOrCreateLiquidityPoolDailySnapshot)(event);
    const poolMetricsHourly = (0, getters_1.getOrCreateLiquidityPoolHourlySnapshot)(event);
    const pool = (0, getters_1.getLiquidityPool)(event.address.toHexString());
    // Update the block number and timestamp to that of the last transaction of that day
    poolMetricsDaily.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetricsDaily.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
    poolMetricsDaily.inputTokenBalances = pool.inputTokenBalances;
    poolMetricsDaily.inputTokenWeights = pool.inputTokenWeights;
    poolMetricsDaily.outputTokenSupply = pool.outputTokenSupply;
    poolMetricsDaily.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetricsDaily.blockNumber = event.block.number;
    poolMetricsDaily.timestamp = event.block.timestamp;
    poolMetricsHourly.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolMetricsHourly.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
    poolMetricsHourly.inputTokenBalances = pool.inputTokenBalances;
    poolMetricsHourly.inputTokenWeights = pool.inputTokenWeights;
    poolMetricsHourly.outputTokenSupply = pool.outputTokenSupply;
    poolMetricsHourly.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolMetricsHourly.blockNumber = event.block.number;
    poolMetricsHourly.timestamp = event.block.timestamp;
    poolMetricsDaily.save();
    poolMetricsHourly.save();
}
exports.updatePoolMetrics = updatePoolMetrics;
