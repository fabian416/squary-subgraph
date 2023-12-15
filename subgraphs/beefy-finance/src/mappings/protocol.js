"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTvlUsd =
  exports.updateProtocolRevenueFromWithdraw =
  exports.updateProtocolRevenueFromChargedFees =
  exports.updateProtocolRevenueFromHarvest =
  exports.updateProtocolUsage =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const BeefyStrategy_1 = require("../../generated/Standard/BeefyStrategy");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../prices/common/constants");
const getters_1 = require("../utils/getters");
const metrics_1 = require("../utils/metrics");
const vault_1 = require("./vault");
function updateProtocolUsage(event, vault, deposit, withdraw) {
  const protocol = (0, getters_1.getBeefyFinanceOrCreate)(vault.id);
  protocol.totalValueLockedUSD = getTvlUsd(protocol);
  protocol.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers.plus(
    isNewUser(event.transaction.from)
  );
  protocol.save();
  (0, metrics_1.updateUsageMetricsDailySnapshot)(
    event,
    protocol,
    deposit,
    withdraw
  );
  (0, metrics_1.updateUsageMetricsHourlySnapshot)(
    event,
    protocol,
    deposit,
    withdraw
  );
}
exports.updateProtocolUsage = updateProtocolUsage;
function updateProtocolRevenueFromHarvest(event, amountHarvested, vault) {
  updateProtocolUsage(event, vault, false, false);
  const protocol = (0, getters_1.getBeefyFinanceOrCreate)(vault.id);
  const token = (0, getters_1.getTokenOrCreate)(
    graph_ts_1.Address.fromString(vault.inputToken.split("x")[1]),
    event.block
  );
  const transactionRevenue = amountHarvested
    .toBigDecimal()
    .times(token.lastPriceUSD)
    .div(constants_1.BIGINT_TEN.pow(token.decimals).toBigDecimal());
  protocol.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD.plus(transactionRevenue);
  protocol.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD.plus(transactionRevenue);
  protocol.save();
  vault.fees = (0, vault_1.getFees)(
    vault.id,
    BeefyStrategy_1.BeefyStrategy.bind(
      graph_ts_1.Address.fromString(vault.strategy.split("x")[1])
    )
  );
  vault.save();
  (0, metrics_1.updateDailyFinancialSnapshot)(event.block, protocol);
}
exports.updateProtocolRevenueFromHarvest = updateProtocolRevenueFromHarvest;
function updateProtocolRevenueFromChargedFees(event, vault) {
  updateProtocolUsage(event, vault, false, false);
  const protocol = (0, getters_1.getBeefyFinanceOrCreate)(vault.id);
  const tokensMap = constants_1.WHITELIST_TOKENS_MAP.get(
    graph_ts_1.dataSource.network()
  );
  const native = tokensMap.get("WETH");
  const token = (0, getters_1.getTokenOrCreate)(native, event.block);
  vault.fees = (0, vault_1.getFees)(
    vault.id,
    BeefyStrategy_1.BeefyStrategy.bind(
      graph_ts_1.Address.fromString(vault.strategy.split("x")[1])
    )
  );
  vault.save();
  const transactionRevenue = event.params.beefyFees
    .plus(event.params.strategistFees)
    .plus(event.params.callFees)
    .toBigDecimal()
    .times(token.lastPriceUSD)
    .div(constants_1.BIGINT_TEN.pow(token.decimals).toBigDecimal());
  protocol.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD.plus(transactionRevenue);
  protocol.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD.plus(transactionRevenue);
  protocol.save();
  (0, metrics_1.updateDailyFinancialSnapshot)(event.block, protocol);
}
exports.updateProtocolRevenueFromChargedFees =
  updateProtocolRevenueFromChargedFees;
function updateProtocolRevenueFromWithdraw(event, vault, withdrawnAmount) {
  updateProtocolUsage(event, vault, false, true);
  const protocol = (0, getters_1.getBeefyFinanceOrCreate)(vault.id);
  const token = (0, getters_1.getTokenOrCreate)(
    graph_ts_1.Address.fromString(vault.inputToken.split("x")[1]),
    event.block
  );
  const fees = (0, vault_1.getFees)(
    vault.id,
    BeefyStrategy_1.BeefyStrategy.bind(
      graph_ts_1.Address.fromString(vault.strategy.split("x")[1])
    )
  );
  vault.fees = fees;
  vault.save();
  let fee;
  for (let i = 0; i < fees.length; i++) {
    fee = schema_1.VaultFee.load(fees[i]);
    if (fee && fee.feeType == "WITHDRAWAL_FEE") {
      const revenue = withdrawnAmount
        .toBigDecimal()
        .times(fee.feePercentage)
        .div(constants_1.BIGDECIMAL_HUNDRED)
        .times(token.lastPriceUSD)
        .div(constants_1.BIGINT_TEN.pow(token.decimals).toBigDecimal());
      protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(revenue);
      protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(revenue);
      protocol.save();
      break;
    }
  }
  (0, metrics_1.updateDailyFinancialSnapshot)(event.block, protocol);
}
exports.updateProtocolRevenueFromWithdraw = updateProtocolRevenueFromWithdraw;
function getTvlUsd(protocol) {
  let tvlUsd = constants_1.BIGDECIMAL_ZERO;
  if (protocol.vaults) {
    for (let i = 0; i < protocol.vaults.length; i++) {
      const vault = schema_1.Vault.load(protocol.vaults[i]);
      if (vault) {
        tvlUsd = tvlUsd.plus(vault.totalValueLockedUSD);
      }
    }
  }
  return tvlUsd;
}
exports.getTvlUsd = getTvlUsd;
function isNewUser(user) {
  let userEntity = schema_1.User.load(user.toHexString());
  if (userEntity) {
    return constants_1.BIGINT_ZERO;
  } else userEntity = new schema_1.User(user.toHexString());
  userEntity.save();
  return constants_1.BIGINT_ONE;
}
