"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFinancials = exports.getOrCreateFinancialMetrics = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("./constants");
const protocol_1 = require("./protocol");
function getOrCreateFinancialMetrics(timestamp, blockNumber) {
    // Number of days since Unix epoch
    let id = timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(id.toString());
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(id.toString());
        financialMetrics.protocol = constants_1.PROTOCOL_ID;
        financialMetrics.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.protocolControlledValueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.blockNumber = blockNumber;
        financialMetrics.timestamp = timestamp;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancialMetrics = getOrCreateFinancialMetrics;
function updateFinancials(blockNumber, timestamp) {
    let financialMetrics = getOrCreateFinancialMetrics(timestamp, blockNumber);
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialMetrics.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD;
    financialMetrics.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD;
    financialMetrics.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
    financialMetrics.blockNumber = blockNumber;
    financialMetrics.timestamp = timestamp;
    financialMetrics.save();
}
exports.updateFinancials = updateFinancials;
