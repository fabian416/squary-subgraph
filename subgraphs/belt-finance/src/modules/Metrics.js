"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFinancials =
  exports.updateVaultSnapshots =
  exports.updateUsageMetrics =
    void 0;
const initializers_1 = require("../common/initializers");
const constants = __importStar(require("../common/constants"));
const schema_1 = require("../../generated/schema");
function updateUsageMetrics(block, from) {
  const account = (0, initializers_1.getOrCreateAccount)(from.toHexString());
  const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
  const usageMetricsDaily = (0,
  initializers_1.getOrCreateUsageMetricsDailySnapshot)(block);
  const usageMetricsHourly = (0,
  initializers_1.getOrCreateUsageMetricsHourlySnapshot)(block);
  usageMetricsDaily.blockNumber = block.number;
  usageMetricsHourly.blockNumber = block.number;
  usageMetricsDaily.timestamp = block.timestamp;
  usageMetricsHourly.timestamp = block.timestamp;
  usageMetricsDaily.dailyTransactionCount += 1;
  usageMetricsHourly.hourlyTransactionCount += 1;
  usageMetricsDaily.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  usageMetricsHourly.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  const dailyActiveAccountId = (
    block.timestamp.toI64() / constants.SECONDS_PER_DAY
  )
    .toString()
    .concat("-")
    .concat(account.id);
  let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAccountId);
  if (!dailyActiveAccount) {
    dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAccountId);
    dailyActiveAccount.save();
    usageMetricsDaily.dailyActiveUsers += 1;
    usageMetricsHourly.hourlyActiveUsers += 1;
  }
  usageMetricsDaily.save();
  usageMetricsHourly.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
function updateVaultSnapshots(vaultAddress, block) {
  const vault = schema_1.Vault.load(vaultAddress.toHexString());
  if (!vault) return;
  const vaultDailySnapshots = (0,
  initializers_1.getOrCreateVaultsDailySnapshots)(vault, block);
  const vaultHourlySnapshots = (0,
  initializers_1.getOrCreateVaultsHourlySnapshots)(vault, block);
  vaultDailySnapshots.totalValueLockedUSD = vault.totalValueLockedUSD;
  vaultHourlySnapshots.totalValueLockedUSD = vault.totalValueLockedUSD;
  vaultDailySnapshots.inputTokenBalance = vault.inputTokenBalance;
  vaultHourlySnapshots.inputTokenBalance = vault.inputTokenBalance;
  vaultDailySnapshots.outputTokenSupply = vault.outputTokenSupply;
  vaultHourlySnapshots.outputTokenSupply = vault.outputTokenSupply;
  vaultDailySnapshots.outputTokenPriceUSD = vault.outputTokenPriceUSD;
  vaultHourlySnapshots.outputTokenPriceUSD = vault.outputTokenPriceUSD;
  vaultDailySnapshots.pricePerShare = vault.pricePerShare;
  vaultHourlySnapshots.pricePerShare = vault.pricePerShare;
  vaultDailySnapshots.rewardTokenEmissionsAmount =
    vault.rewardTokenEmissionsAmount;
  vaultHourlySnapshots.rewardTokenEmissionsAmount =
    vault.rewardTokenEmissionsAmount;
  vaultDailySnapshots.rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
  vaultHourlySnapshots.rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
  vaultDailySnapshots.cumulativeProtocolSideRevenueUSD =
    vault.cumulativeProtocolSideRevenueUSD;
  vaultHourlySnapshots.cumulativeProtocolSideRevenueUSD =
    vault.cumulativeProtocolSideRevenueUSD;
  vaultDailySnapshots.cumulativeSupplySideRevenueUSD =
    vault.cumulativeSupplySideRevenueUSD;
  vaultHourlySnapshots.cumulativeSupplySideRevenueUSD =
    vault.cumulativeSupplySideRevenueUSD;
  vaultDailySnapshots.cumulativeTotalRevenueUSD =
    vault.cumulativeTotalRevenueUSD;
  vaultHourlySnapshots.cumulativeTotalRevenueUSD =
    vault.cumulativeTotalRevenueUSD;
  vaultDailySnapshots.blockNumber = block.number;
  vaultHourlySnapshots.blockNumber = block.number;
  vaultDailySnapshots.timestamp = block.timestamp;
  vaultHourlySnapshots.timestamp = block.timestamp;
  vaultDailySnapshots.save();
  vaultHourlySnapshots.save();
}
exports.updateVaultSnapshots = updateVaultSnapshots;
function updateFinancials(block) {
  const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
  const financialMetrics = (0,
  initializers_1.getOrCreateFinancialDailySnapshots)(block);
  financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
  financialMetrics.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD;
  financialMetrics.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD;
  financialMetrics.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD;
  financialMetrics.blockNumber = block.number;
  financialMetrics.timestamp = block.timestamp;
  financialMetrics.save();
}
exports.updateFinancials = updateFinancials;
