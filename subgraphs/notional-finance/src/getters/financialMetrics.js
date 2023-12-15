"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateFinancialsDailySnapshot = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const protocol_1 = require("./protocol");
function getOrCreateFinancialsDailySnapshot(event) {
    const dailyId = (event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(dailyId);
    if (financialMetrics == null) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(dailyId);
        financialMetrics.protocol = protocol.id;
        financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
        financialMetrics.mintedTokenSupplies = protocol.mintedTokenSupplies;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD =
            protocol.cumulativeSupplySideRevenueUSD;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD =
            protocol.cumulativeProtocolSideRevenueUSD;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD =
            protocol.cumulativeTotalRevenueUSD;
        financialMetrics.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
        financialMetrics.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
        financialMetrics.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
        financialMetrics.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
        financialMetrics.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
        financialMetrics.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.blockNumber = event.block.number;
        financialMetrics.timestamp = event.block.timestamp;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancialsDailySnapshot = getOrCreateFinancialsDailySnapshot;
