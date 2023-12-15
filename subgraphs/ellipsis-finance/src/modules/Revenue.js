"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRevenueSnapshots = void 0;
const initializers_1 = require("../common/initializers");
function updateRevenueSnapshots(
  pool,
  supplySideRevenueUSD,
  protocolSideRevenueUSD,
  block
) {
  const protocol = (0, initializers_1.getOrCreateDexAmmProtocol)();
  const financialMetrics = (0,
  initializers_1.getOrCreateFinancialDailySnapshots)(block);
  const poolDailySnapshot = (0,
  initializers_1.getOrCreateLiquidityPoolDailySnapshots)(pool.id, block);
  const pooltHourlySnapshot = (0,
  initializers_1.getOrCreateLiquidityPoolHourlySnapshots)(pool.id, block);
  const totalRevenueUSD = supplySideRevenueUSD.plus(protocolSideRevenueUSD);
  // SupplySideRevenueUSD Metrics
  protocol.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
  financialMetrics.dailySupplySideRevenueUSD =
    financialMetrics.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
  financialMetrics.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD;
  pool.cumulativeSupplySideRevenueUSD =
    pool.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
  poolDailySnapshot.cumulativeSupplySideRevenueUSD =
    pool.cumulativeSupplySideRevenueUSD;
  poolDailySnapshot.dailySupplySideRevenueUSD =
    poolDailySnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
  pooltHourlySnapshot.cumulativeSupplySideRevenueUSD =
    pool.cumulativeSupplySideRevenueUSD;
  pooltHourlySnapshot.hourlySupplySideRevenueUSD =
    pooltHourlySnapshot.hourlySupplySideRevenueUSD.plus(supplySideRevenueUSD);
  // ProtocolSideRevenueUSD Metrics
  protocol.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  financialMetrics.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD;
  financialMetrics.dailyProtocolSideRevenueUSD =
    financialMetrics.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  pool.cumulativeProtocolSideRevenueUSD =
    pool.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  poolDailySnapshot.cumulativeProtocolSideRevenueUSD =
    pool.cumulativeProtocolSideRevenueUSD;
  poolDailySnapshot.dailyProtocolSideRevenueUSD =
    poolDailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  pooltHourlySnapshot.cumulativeProtocolSideRevenueUSD =
    pool.cumulativeProtocolSideRevenueUSD;
  pooltHourlySnapshot.hourlyProtocolSideRevenueUSD =
    pooltHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(
      protocolSideRevenueUSD
    );
  // TotalRevenueUSD Metrics
  protocol.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD.plus(totalRevenueUSD);
  financialMetrics.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD;
  financialMetrics.dailyTotalRevenueUSD =
    financialMetrics.dailyTotalRevenueUSD.plus(totalRevenueUSD);
  pool.cumulativeTotalRevenueUSD =
    pool.cumulativeTotalRevenueUSD.plus(totalRevenueUSD);
  poolDailySnapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
  poolDailySnapshot.dailyTotalRevenueUSD =
    poolDailySnapshot.dailyTotalRevenueUSD.plus(totalRevenueUSD);
  pooltHourlySnapshot.cumulativeTotalRevenueUSD =
    pool.cumulativeTotalRevenueUSD;
  pooltHourlySnapshot.hourlyTotalRevenueUSD =
    pooltHourlySnapshot.hourlyTotalRevenueUSD.plus(totalRevenueUSD);
  pooltHourlySnapshot.save();
  poolDailySnapshot.save();
  financialMetrics.save();
  protocol.save();
  pool.save();
}
exports.updateRevenueSnapshots = updateRevenueSnapshots;
