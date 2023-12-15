"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateUsageHourlyMetric = exports.getOrCreateUsageDailyMetric = exports.getOrCreateFinancialsDailySnapshot = exports.getOrCreateMarketHourlySnapshot = exports.getOrCreateMarketDailySnapshot = void 0;
const schema_1 = require("../../../../generated/schema");
const constants_1 = require("../../constants");
const protocol_1 = require("./protocol");
function getOrCreateMarketDailySnapshot(event, market) {
    const dayNumber = event.block.timestamp.div(constants_1.SEC_PER_DAY);
    const snapshotId = market.id + "-" + dayNumber.toString();
    let marketSnapshot = schema_1.MarketDailySnapshot.load(snapshotId);
    if (!marketSnapshot) {
        marketSnapshot = new schema_1.MarketDailySnapshot(snapshotId);
        const timestamp = dayNumber.times(constants_1.SEC_PER_DAY); // Rounded to the start of the day
        marketSnapshot.protocol = constants_1.PROTOCOL_ID;
        marketSnapshot.market = market.id;
        marketSnapshot.blockNumber = event.block.number;
        marketSnapshot.timestamp = timestamp;
        marketSnapshot.rates = market.rates;
        marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
        marketSnapshot.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD;
        marketSnapshot.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD;
        marketSnapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
        marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
        marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
        marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
        marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
        marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
        marketSnapshot.inputTokenBalance = market.inputTokenBalance;
        marketSnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
        marketSnapshot.outputTokenSupply = market.outputTokenSupply;
        marketSnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
        marketSnapshot.exchangeRate = market.exchangeRate;
        marketSnapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
        marketSnapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
        marketSnapshot.dailyDepositUSD = constants_1.ZERO_BD;
        marketSnapshot.dailyBorrowUSD = constants_1.ZERO_BD;
        marketSnapshot.dailyLiquidateUSD = constants_1.ZERO_BD;
        marketSnapshot.dailySupplySideRevenueUSD = constants_1.ZERO_BD;
        marketSnapshot.dailyProtocolSideRevenueUSD = constants_1.ZERO_BD;
        marketSnapshot.dailyTotalRevenueUSD = constants_1.ZERO_BD;
        marketSnapshot.dailyWithdrawUSD = constants_1.ZERO_BD;
        marketSnapshot.dailyRepayUSD = constants_1.ZERO_BD;
        marketSnapshot.save();
    }
    return marketSnapshot;
}
exports.getOrCreateMarketDailySnapshot = getOrCreateMarketDailySnapshot;
function getOrCreateMarketHourlySnapshot(event, market) {
    const hourNumber = event.block.timestamp.div(constants_1.SEC_PER_HOUR);
    const snapshotId = market.id + "-" + hourNumber.toString();
    let marketSnapshot = schema_1.MarketHourlySnapshot.load(snapshotId);
    if (!marketSnapshot) {
        marketSnapshot = new schema_1.MarketHourlySnapshot(snapshotId);
        const timestamp = hourNumber.times(constants_1.SEC_PER_HOUR); // Rounded to the start of the hour
        marketSnapshot.protocol = constants_1.PROTOCOL_ID;
        marketSnapshot.market = market.id;
        marketSnapshot.blockNumber = event.block.number;
        marketSnapshot.timestamp = timestamp;
        marketSnapshot.rates = market.rates;
        marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
        marketSnapshot.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD;
        marketSnapshot.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD;
        marketSnapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
        marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
        marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
        marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
        marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
        marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
        marketSnapshot.inputTokenBalance = market.inputTokenBalance;
        marketSnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
        marketSnapshot.outputTokenSupply = market.outputTokenSupply;
        marketSnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
        marketSnapshot.exchangeRate = market.exchangeRate;
        marketSnapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
        marketSnapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
        marketSnapshot.hourlyDepositUSD = constants_1.ZERO_BD;
        marketSnapshot.hourlyBorrowUSD = constants_1.ZERO_BD;
        marketSnapshot.hourlyLiquidateUSD = constants_1.ZERO_BD;
        marketSnapshot.hourlySupplySideRevenueUSD = constants_1.ZERO_BD;
        marketSnapshot.hourlyProtocolSideRevenueUSD = constants_1.ZERO_BD;
        marketSnapshot.hourlyTotalRevenueUSD = constants_1.ZERO_BD;
        marketSnapshot.hourlyWithdrawUSD = constants_1.ZERO_BD;
        marketSnapshot.hourlyRepayUSD = constants_1.ZERO_BD;
        marketSnapshot.save();
    }
    return marketSnapshot;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
function getOrCreateFinancialsDailySnapshot(event) {
    const dayNumber = event.block.timestamp.div(constants_1.SEC_PER_DAY);
    let financialsSnapshot = schema_1.FinancialsDailySnapshot.load(dayNumber.toString());
    if (!financialsSnapshot) {
        financialsSnapshot = new schema_1.FinancialsDailySnapshot(dayNumber.toString());
        const protocol = (0, protocol_1.getOrCreateProtocol)();
        const timestamp = dayNumber.times(constants_1.SEC_PER_DAY); // Rounded to the start of the day
        financialsSnapshot.protocol = protocol.id;
        financialsSnapshot.blockNumber = event.block.number;
        financialsSnapshot.timestamp = timestamp;
        financialsSnapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
        financialsSnapshot.protocolControlledValueUSD = protocol.protocolControlledValueUSD;
        financialsSnapshot.mintedTokenSupplies = protocol.mintedTokenSupplies;
        financialsSnapshot.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD;
        financialsSnapshot.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD;
        financialsSnapshot.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
        financialsSnapshot.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
        financialsSnapshot.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
        financialsSnapshot.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
        financialsSnapshot.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
        financialsSnapshot.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
        financialsSnapshot._treasuryFee = protocol._treasuryFee;
        financialsSnapshot.dailySupplySideRevenueUSD = constants_1.ZERO_BD;
        financialsSnapshot.dailyProtocolSideRevenueUSD = constants_1.ZERO_BD;
        financialsSnapshot.dailyTotalRevenueUSD = constants_1.ZERO_BD;
        financialsSnapshot.dailyDepositUSD = constants_1.ZERO_BD;
        financialsSnapshot.dailyBorrowUSD = constants_1.ZERO_BD;
        financialsSnapshot.dailyLiquidateUSD = constants_1.ZERO_BD;
        financialsSnapshot.dailyWithdrawUSD = constants_1.ZERO_BD;
        financialsSnapshot.dailyRepayUSD = constants_1.ZERO_BD;
        financialsSnapshot.save();
    }
    return financialsSnapshot;
}
exports.getOrCreateFinancialsDailySnapshot = getOrCreateFinancialsDailySnapshot;
function getOrCreateUsageDailyMetric(event) {
    const dayNumber = event.block.timestamp.div(constants_1.SEC_PER_DAY);
    let usageMetric = schema_1.UsageMetricsDailySnapshot.load(dayNumber.toString());
    if (!usageMetric) {
        usageMetric = new schema_1.UsageMetricsDailySnapshot(dayNumber.toString());
        const protocol = (0, protocol_1.getOrCreateProtocol)();
        const timestamp = dayNumber.times(constants_1.SEC_PER_DAY); // Rounded to the start of the day
        usageMetric.timestamp = timestamp;
        usageMetric.blockNumber = event.block.number;
        usageMetric.protocol = protocol.id;
        usageMetric.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetric.totalPoolCount = protocol.totalPoolCount;
        usageMetric.dailyActiveUsers = constants_1.ZERO_I32;
        usageMetric.dailyTransactionCount = constants_1.ZERO_I32;
        usageMetric.dailyDepositCount = constants_1.ZERO_I32;
        usageMetric.dailyWithdrawCount = constants_1.ZERO_I32;
        usageMetric.dailyBorrowCount = constants_1.ZERO_I32;
        usageMetric.dailyRepayCount = constants_1.ZERO_I32;
        usageMetric.dailyLiquidateCount = constants_1.ZERO_I32;
        usageMetric._dailyStakeCount = constants_1.ZERO_I32;
        usageMetric._dailyUnstakeCount = constants_1.ZERO_I32;
        usageMetric._dailyClaimCount = constants_1.ZERO_I32;
        usageMetric.save();
    }
    return usageMetric;
}
exports.getOrCreateUsageDailyMetric = getOrCreateUsageDailyMetric;
function getOrCreateUsageHourlyMetric(event) {
    const hourNumber = event.block.timestamp.div(constants_1.SEC_PER_HOUR);
    let usageMetric = schema_1.UsageMetricsHourlySnapshot.load(hourNumber.toString());
    if (!usageMetric) {
        usageMetric = new schema_1.UsageMetricsHourlySnapshot(hourNumber.toString());
        const protocol = (0, protocol_1.getOrCreateProtocol)();
        const timestamp = hourNumber.times(constants_1.SEC_PER_HOUR); // Rounded to the start of the hour
        usageMetric.timestamp = timestamp;
        usageMetric.blockNumber = event.block.number;
        usageMetric.protocol = protocol.id;
        usageMetric.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetric.hourlyActiveUsers = constants_1.ZERO_I32;
        usageMetric.hourlyTransactionCount = constants_1.ZERO_I32;
        usageMetric.hourlyDepositCount = constants_1.ZERO_I32;
        usageMetric.hourlyWithdrawCount = constants_1.ZERO_I32;
        usageMetric.hourlyBorrowCount = constants_1.ZERO_I32;
        usageMetric.hourlyRepayCount = constants_1.ZERO_I32;
        usageMetric.hourlyLiquidateCount = constants_1.ZERO_I32;
        usageMetric.hourlyBorrowCount = constants_1.ZERO_I32;
        usageMetric._hourlyStakeCount = constants_1.ZERO_I32;
        usageMetric._hourlyUnstakeCount = constants_1.ZERO_I32;
        usageMetric._hourlyClaimCount = constants_1.ZERO_I32;
        usageMetric.save();
    }
    return usageMetric;
}
exports.getOrCreateUsageHourlyMetric = getOrCreateUsageHourlyMetric;
