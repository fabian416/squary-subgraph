"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRevenue = exports.updateTvl = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const vaults_1 = require("./vaults");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const pricing_1 = require("./pricing");
const numbers_1 = require("../../common/utils/numbers");
// Update TVL related fields in all entities
function updateTvl(event) {
  // Update entities
  const protocol = (0, getters_1.getOrCreateYieldAggregator)(
    constants_1.REGISTRY_ADDRESS_MAP.get(graph_ts_1.dataSource.network())
  );
  let protocolTvlUSD = constants_1.BIGDECIMAL_ZERO;
  const vaultIDs = protocol._vaultIDs ? protocol._vaultIDs : [];
  for (let i = 0; i < vaultIDs.length; i++) {
    const _vault = updateVaultTokenValue(
      graph_ts_1.Address.fromString(vaultIDs[i]),
      event
    );
    protocolTvlUSD = protocolTvlUSD.plus(_vault.totalValueLockedUSD);
  }
  protocol.totalValueLockedUSD = protocolTvlUSD;
  const financialsDailySnapshot = (0,
  getters_1.getOrCreateFinancialsDailySnapshot)(event);
  financialsDailySnapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
  financialsDailySnapshot.blockNumber = event.block.number;
  financialsDailySnapshot.timestamp = event.block.timestamp;
  protocol.save();
  financialsDailySnapshot.save();
}
exports.updateTvl = updateTvl;
function updateVaultTokenValue(
  vaultAddress,
  event,
  updateUnderlyingBalances = true
) {
  const block = event.block;
  const vault = (0, vaults_1.getOrCreateVault)(vaultAddress, block);
  if (updateUnderlyingBalances) {
    const tokenBalances = (0, vaults_1.getUnderlyingTokenBalances)(
      vaultAddress,
      event
    );
    if (tokenBalances && tokenBalances.length == 2) {
      vault._token0Amount = tokenBalances[0];
      vault._token1Amount = tokenBalances[1];
    }
  }
  const token0AmountUSD = (0, pricing_1.getTokenValueUSD)(
    graph_ts_1.Address.fromString(vault._token0),
    vault._token0Amount,
    block
  );
  const token1AmountUSD = (0, pricing_1.getTokenValueUSD)(
    graph_ts_1.Address.fromString(vault._token1),
    vault._token1Amount,
    block
  );
  const newTvl = token0AmountUSD.plus(token1AmountUSD);
  // Calculate price per share
  const outputToken = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(vault.outputToken)
  );
  const vaultTokenSupply = vault.outputTokenSupply;
  let outputTokenPriceUSD = vault.outputTokenPriceUSD;
  if (vaultTokenSupply > constants_1.BIGINT_ZERO) {
    const outputTokenSupplyDecimals = (0, numbers_1.bigIntToBigDecimal)(
      vaultTokenSupply,
      outputToken.decimals
    );
    outputTokenPriceUSD = newTvl.div(outputTokenSupplyDecimals);
  }
  vault.totalValueLockedUSD = newTvl;
  vault.outputTokenPriceUSD = outputTokenPriceUSD;
  vault._token0AmountUSD = token0AmountUSD;
  vault._token1AmountUSD = token1AmountUSD;
  vault.save();
  (0, vaults_1.updateVaultSnapshots)(vault, block);
  return vault;
}
// Update revenue related fields, Only changes when rebalance is called.
function updateRevenue(event) {
  const vault = (0, vaults_1.getOrCreateVault)(event.address, event.block);
  // Calculate revenue in USD
  const eventTotalRevenueUSD = (0, pricing_1.getDualTokenUSD)(
    graph_ts_1.Address.fromString(vault._token0),
    graph_ts_1.Address.fromString(vault._token1),
    event.params.feesEarned0,
    event.params.feesEarned1,
    event.block
  );
  const SupplySideShare = constants_1.BIGDECIMAL_HUNDRED.minus(
    constants_1.PROTOCOL_PERFORMANCE_FEE
  );
  const eventSupplySideRevenueUSD = eventTotalRevenueUSD
    .times(SupplySideShare)
    .div(constants_1.BIGDECIMAL_HUNDRED);
  const eventProtocolSideRevenueUSD = eventTotalRevenueUSD
    .times(constants_1.PROTOCOL_PERFORMANCE_FEE)
    .div(constants_1.BIGDECIMAL_HUNDRED);
  // Update entities
  const protocol = (0, getters_1.getOrCreateYieldAggregator)(
    constants_1.REGISTRY_ADDRESS_MAP.get(graph_ts_1.dataSource.network())
  );
  const vaultDailySnapshot = (0, getters_1.getOrCreateVaultDailySnapshot)(
    event.address,
    event.block
  );
  const vaultHourlySnapshot = (0, getters_1.getOrCreateVaultHourlySnapshot)(
    event.address,
    event.block
  );
  const financialsDailySnapshot = (0,
  getters_1.getOrCreateFinancialsDailySnapshot)(event);
  // Update protocol cumulative revenue
  protocol.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD.plus(eventSupplySideRevenueUSD);
  protocol.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD.plus(eventProtocolSideRevenueUSD);
  protocol.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD.plus(eventTotalRevenueUSD);
  // Update vault cumulative revenue
  vault.cumulativeSupplySideRevenueUSD =
    vault.cumulativeSupplySideRevenueUSD.plus(eventSupplySideRevenueUSD);
  vault.cumulativeProtocolSideRevenueUSD =
    vault.cumulativeProtocolSideRevenueUSD.plus(eventProtocolSideRevenueUSD);
  vault.cumulativeTotalRevenueUSD =
    vault.cumulativeTotalRevenueUSD.plus(eventTotalRevenueUSD);
  // Increment snapshot revenues
  vaultDailySnapshot.dailySupplySideRevenueUSD =
    vaultDailySnapshot.dailySupplySideRevenueUSD.plus(
      eventSupplySideRevenueUSD
    );
  vaultDailySnapshot.dailyProtocolSideRevenueUSD =
    vaultDailySnapshot.dailyProtocolSideRevenueUSD.plus(
      eventProtocolSideRevenueUSD
    );
  vaultDailySnapshot.dailyTotalRevenueUSD =
    vaultDailySnapshot.dailyTotalRevenueUSD.plus(eventTotalRevenueUSD);
  vaultHourlySnapshot.hourlySupplySideRevenueUSD =
    vaultHourlySnapshot.hourlySupplySideRevenueUSD.plus(
      eventSupplySideRevenueUSD
    );
  vaultHourlySnapshot.hourlyProtocolSideRevenueUSD =
    vaultHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(
      eventProtocolSideRevenueUSD
    );
  vaultHourlySnapshot.hourlyTotalRevenueUSD =
    vaultHourlySnapshot.hourlyTotalRevenueUSD.plus(eventTotalRevenueUSD);
  financialsDailySnapshot.dailySupplySideRevenueUSD =
    financialsDailySnapshot.dailySupplySideRevenueUSD.plus(
      eventSupplySideRevenueUSD
    );
  financialsDailySnapshot.dailyProtocolSideRevenueUSD =
    financialsDailySnapshot.dailyProtocolSideRevenueUSD.plus(
      eventProtocolSideRevenueUSD
    );
  financialsDailySnapshot.dailyTotalRevenueUSD =
    financialsDailySnapshot.dailyTotalRevenueUSD.plus(eventTotalRevenueUSD);
  // Update cumulative revenue from protocol
  financialsDailySnapshot.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD;
  financialsDailySnapshot.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD;
  financialsDailySnapshot.cumulativeTotalRevenueUSD =
    protocol.cumulativeTotalRevenueUSD;
  financialsDailySnapshot.blockNumber = event.block.number;
  financialsDailySnapshot.timestamp = event.block.timestamp;
  protocol.save();
  vault.save();
  vaultDailySnapshot.save();
  vaultHourlySnapshot.save();
  financialsDailySnapshot.save();
}
exports.updateRevenue = updateRevenue;
