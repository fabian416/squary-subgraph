"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRevenueSnapshots = void 0;
const initializers_1 = require("../common/initializers");
function updateRevenueSnapshots(
  vault,
  supplySideRevenueUSD,
  protocolSideRevenueUSD,
  block
) {
  const totalRevenueUSD = supplySideRevenueUSD.plus(protocolSideRevenueUSD);
  const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
  protocol.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
  protocol.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  protocol.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD.plus(totalRevenueUSD);
  protocol.save();
  const financialMetrics = (0,
  initializers_1.getOrCreateFinancialDailySnapshots)(block);
  financialMetrics.dailySupplySideRevenueUSD =
    financialMetrics.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
  financialMetrics.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD;
  financialMetrics.dailyProtocolSideRevenueUSD =
    financialMetrics.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  financialMetrics.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD;
  financialMetrics.dailyTotalRevenueUSD =
    financialMetrics.dailyTotalRevenueUSD.plus(totalRevenueUSD);
  financialMetrics.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD;
  financialMetrics.save();
  vault.cumulativeSupplySideRevenueUSD =
    vault.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
  vault.cumulativeProtocolSideRevenueUSD =
    vault.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  vault.cumulativeTotalRevenueUSD =
    vault.cumulativeTotalRevenueUSD.plus(supplySideRevenueUSD);
  vault.save();
  const vaultDailySnapshot = (0,
  initializers_1.getOrCreateVaultsDailySnapshots)(vault, block);
  vaultDailySnapshot.dailySupplySideRevenueUSD =
    vaultDailySnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
  vaultDailySnapshot.cumulativeSupplySideRevenueUSD =
    vault.cumulativeSupplySideRevenueUSD;
  vaultDailySnapshot.dailyProtocolSideRevenueUSD =
    vaultDailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
  vaultDailySnapshot.cumulativeProtocolSideRevenueUSD =
    vault.cumulativeProtocolSideRevenueUSD;
  vaultDailySnapshot.dailyTotalRevenueUSD =
    vaultDailySnapshot.dailyTotalRevenueUSD.plus(totalRevenueUSD);
  vaultDailySnapshot.cumulativeTotalRevenueUSD =
    vault.cumulativeTotalRevenueUSD;
  vaultDailySnapshot.save();
  const vaultHourlySnapshot = (0,
  initializers_1.getOrCreateVaultsHourlySnapshots)(vault, block);
  vaultHourlySnapshot.hourlySupplySideRevenueUSD =
    vaultHourlySnapshot.hourlySupplySideRevenueUSD.plus(supplySideRevenueUSD);
  vaultHourlySnapshot.cumulativeSupplySideRevenueUSD =
    vault.cumulativeSupplySideRevenueUSD;
  vaultHourlySnapshot.hourlyProtocolSideRevenueUSD =
    vaultHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(
      protocolSideRevenueUSD
    );
  vaultHourlySnapshot.cumulativeProtocolSideRevenueUSD =
    vault.cumulativeProtocolSideRevenueUSD;
  vaultHourlySnapshot.hourlyTotalRevenueUSD =
    vaultHourlySnapshot.hourlyTotalRevenueUSD.plus(totalRevenueUSD);
  vaultHourlySnapshot.cumulativeTotalRevenueUSD =
    vault.cumulativeTotalRevenueUSD;
  vaultHourlySnapshot.save();
}
exports.updateRevenueSnapshots = updateRevenueSnapshots;
