"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = exports.handleSwapIn = exports.handleSwapOut = exports.handlerSwapInV2 = exports.handlerSwapOutV2 = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const helpers_1 = require("./helpers");
const getters_1 = require("../common/getters");
const constants_1 = require("../common/constants");
const configure_1 = require("../../configurations/configure");
function handlerSwapOutV2(event) {
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(protocol, event.block);
    const usageMetricsDaily = (0, getters_1.getOrCreateUsageMetricDailySnapshot)(protocol, event.block);
    const usageMetricsHourly = (0, getters_1.getOrCreateUsageMetricHourlySnapshot)(protocol, event.block);
    const chainID = configure_1.NetworkConfigs.getChainID();
    const tokenAddress = graph_ts_1.dataSource.address();
    const token = (0, getters_1.getOrCreateToken)(protocol, tokenAddress, chainID, event.block);
    const crosschainID = configure_1.NetworkConfigs.getCrosschainID(token.id.toHexString());
    const crosschainTokenAddress = configure_1.NetworkConfigs.getCrosschainTokenAddress(constants_1.BridgeType.BRIDGE, token.id.toHexString(), crosschainID.toString());
    const crosschainToken = (0, getters_1.getOrCreateCrosschainToken)(token, crosschainID, crosschainTokenAddress, constants_1.CrosschainTokenType.CANONICAL);
    const poolID = token.id;
    const pool = (0, getters_1.getOrCreatePool)(protocol, token, poolID, constants_1.BridgePoolType.BURN_MINT, crosschainID, event.block);
    const poolDailySnapshot = (0, getters_1.getOrCreatePoolDailySnapshot)(protocol, pool, event.block);
    const poolHourlySnapshot = (0, getters_1.getOrCreatePoolHourlySnapshot)(protocol, pool, event.block);
    const poolRoute = (0, getters_1.getOrCreatePoolRoute)(protocol, token, crosschainToken, pool, chainID, crosschainID);
    const poolRouteDailySnapshot = (0, getters_1.getOrCreatePoolRouteSnapshot)(poolRoute, poolDailySnapshot.id, event.block);
    const poolRouteHourlySnapshot = (0, getters_1.getOrCreatePoolRouteSnapshot)(poolRoute, poolHourlySnapshot.id, event.block);
    const oldPoolTVL = pool.totalValueLockedUSD;
    (0, helpers_1.updatePoolMetrics)(token, crosschainToken, pool, poolDailySnapshot, poolHourlySnapshot, poolRoute, poolRouteDailySnapshot.id, poolRouteHourlySnapshot.id, event.block);
    const deltaPoolTVL = pool.totalValueLockedUSD.minus(oldPoolTVL);
    (0, helpers_1.updateVolume)(protocol, financialMetrics, token, pool, poolDailySnapshot, poolHourlySnapshot, poolRoute, poolRouteDailySnapshot, poolRouteHourlySnapshot, true, event.params.amount);
    const feeUSD = configure_1.NetworkConfigs.getBridgeFeeUSD(constants_1.BridgeType.BRIDGE, token, crosschainID.toString(), event.params.amount);
    (0, helpers_1.updateRevenue)(protocol, financialMetrics, pool, poolDailySnapshot, poolHourlySnapshot, feeUSD);
    (0, helpers_1.updateUsageMetrics)(protocol, usageMetricsDaily, usageMetricsHourly, constants_1.EventType.TRANSFER_OUT, crosschainID, event.block, event.params.account);
    (0, helpers_1.createBridgeTransferEvent)(protocol, token, crosschainToken, pool, poolRoute, chainID, crosschainID, true, event.params.account, event.params.bindaddr, event.params.amount, graph_ts_1.Bytes.fromHexString(constants_1.ZERO_ADDRESS), event);
    poolRouteHourlySnapshot.save();
    poolRouteDailySnapshot.save();
    poolRoute.save();
    poolHourlySnapshot.save();
    poolDailySnapshot.save();
    pool.save();
    crosschainToken.save();
    token.save();
    usageMetricsHourly.save();
    usageMetricsDaily.save();
    (0, helpers_1.updateProtocolTVL)(protocol, financialMetrics, deltaPoolTVL, event.block);
    financialMetrics.save();
    protocol.save();
}
exports.handlerSwapOutV2 = handlerSwapOutV2;
function handlerSwapInV2(event) {
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(protocol, event.block);
    const usageMetricsDaily = (0, getters_1.getOrCreateUsageMetricDailySnapshot)(protocol, event.block);
    const usageMetricsHourly = (0, getters_1.getOrCreateUsageMetricHourlySnapshot)(protocol, event.block);
    const chainID = configure_1.NetworkConfigs.getChainID();
    const tokenAddress = graph_ts_1.dataSource.address();
    const token = (0, getters_1.getOrCreateToken)(protocol, tokenAddress, chainID, event.block);
    const crosschainID = configure_1.NetworkConfigs.getCrosschainID(token.id.toHexString());
    const crosschainTokenAddress = configure_1.NetworkConfigs.getCrosschainTokenAddress(constants_1.BridgeType.BRIDGE, token.id.toHexString(), crosschainID.toString());
    const crosschainToken = (0, getters_1.getOrCreateCrosschainToken)(token, crosschainID, crosschainTokenAddress, constants_1.CrosschainTokenType.CANONICAL);
    const poolID = token.id;
    const pool = (0, getters_1.getOrCreatePool)(protocol, token, poolID, constants_1.BridgePoolType.BURN_MINT, crosschainID, event.block);
    const poolDailySnapshot = (0, getters_1.getOrCreatePoolDailySnapshot)(protocol, pool, event.block);
    const poolHourlySnapshot = (0, getters_1.getOrCreatePoolHourlySnapshot)(protocol, pool, event.block);
    const poolRoute = (0, getters_1.getOrCreatePoolRoute)(protocol, token, crosschainToken, pool, chainID, crosschainID);
    const poolRouteDailySnapshot = (0, getters_1.getOrCreatePoolRouteSnapshot)(poolRoute, poolDailySnapshot.id, event.block);
    const poolRouteHourlySnapshot = (0, getters_1.getOrCreatePoolRouteSnapshot)(poolRoute, poolHourlySnapshot.id, event.block);
    const oldPoolTVL = pool.totalValueLockedUSD;
    (0, helpers_1.updatePoolMetrics)(token, crosschainToken, pool, poolDailySnapshot, poolHourlySnapshot, poolRoute, poolRouteDailySnapshot.id, poolRouteHourlySnapshot.id, event.block);
    const deltaPoolTVL = pool.totalValueLockedUSD.minus(oldPoolTVL);
    (0, helpers_1.updateVolume)(protocol, financialMetrics, token, pool, poolDailySnapshot, poolHourlySnapshot, poolRoute, poolRouteDailySnapshot, poolRouteHourlySnapshot, false, event.params.amount);
    (0, helpers_1.updateRevenue)(protocol, financialMetrics, pool, poolDailySnapshot, poolHourlySnapshot, constants_1.BIGDECIMAL_ZERO);
    (0, helpers_1.updateUsageMetrics)(protocol, usageMetricsDaily, usageMetricsHourly, constants_1.EventType.TRANSFER_IN, crosschainID, event.block, event.params.account);
    (0, helpers_1.createBridgeTransferEvent)(protocol, token, crosschainToken, pool, poolRoute, chainID, crosschainID, false, graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS), event.params.account, event.params.amount, event.params.txhash, event);
    poolRouteHourlySnapshot.save();
    poolRouteDailySnapshot.save();
    poolRoute.save();
    poolHourlySnapshot.save();
    poolDailySnapshot.save();
    pool.save();
    crosschainToken.save();
    token.save();
    usageMetricsHourly.save();
    usageMetricsDaily.save();
    (0, helpers_1.updateProtocolTVL)(protocol, financialMetrics, deltaPoolTVL, event.block);
    financialMetrics.save();
    protocol.save();
}
exports.handlerSwapInV2 = handlerSwapInV2;
function handleSwapOut(event) {
    const chainID = event.params.fromChainID;
    const crosschainID = event.params.toChainID;
    const tokenAddress = event.params.token;
    if (!configure_1.NetworkConfigs.isWhitelistToken(tokenAddress, crosschainID.toString())) {
        return;
    }
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(protocol, event.block);
    const usageMetricsDaily = (0, getters_1.getOrCreateUsageMetricDailySnapshot)(protocol, event.block);
    const usageMetricsHourly = (0, getters_1.getOrCreateUsageMetricHourlySnapshot)(protocol, event.block);
    const token = (0, getters_1.getOrCreateToken)(protocol, tokenAddress, chainID, event.block);
    const crosschainTokenAddress = configure_1.NetworkConfigs.getCrosschainTokenAddress(constants_1.BridgeType.ROUTER, token.id.toHexString(), crosschainID.toString());
    const crosschainToken = (0, getters_1.getOrCreateCrosschainToken)(token, crosschainID, crosschainTokenAddress, constants_1.CrosschainTokenType.WRAPPED);
    const poolID = token.id;
    const pool = (0, getters_1.getOrCreatePool)(protocol, token, poolID, constants_1.BridgePoolType.LIQUIDITY, crosschainID, event.block);
    const poolDailySnapshot = (0, getters_1.getOrCreatePoolDailySnapshot)(protocol, pool, event.block);
    const poolHourlySnapshot = (0, getters_1.getOrCreatePoolHourlySnapshot)(protocol, pool, event.block);
    const poolRoute = (0, getters_1.getOrCreatePoolRoute)(protocol, token, crosschainToken, pool, chainID, crosschainID);
    const poolRouteDailySnapshot = (0, getters_1.getOrCreatePoolRouteSnapshot)(poolRoute, poolDailySnapshot.id, event.block);
    const poolRouteHourlySnapshot = (0, getters_1.getOrCreatePoolRouteSnapshot)(poolRoute, poolHourlySnapshot.id, event.block);
    const oldPoolTVL = pool.totalValueLockedUSD;
    (0, helpers_1.updatePoolMetrics)(token, crosschainToken, pool, poolDailySnapshot, poolHourlySnapshot, poolRoute, poolRouteDailySnapshot.id, poolRouteHourlySnapshot.id, event.block);
    const deltaPoolTVL = pool.totalValueLockedUSD.minus(oldPoolTVL);
    (0, helpers_1.updateVolume)(protocol, financialMetrics, token, pool, poolDailySnapshot, poolHourlySnapshot, poolRoute, poolRouteDailySnapshot, poolRouteHourlySnapshot, true, event.params.amount);
    const feeUSD = configure_1.NetworkConfigs.getBridgeFeeUSD(constants_1.BridgeType.ROUTER, token, crosschainID.toString(), event.params.amount);
    (0, helpers_1.updateRevenue)(protocol, financialMetrics, pool, poolDailySnapshot, poolHourlySnapshot, feeUSD);
    (0, helpers_1.updateUsageMetrics)(protocol, usageMetricsDaily, usageMetricsHourly, constants_1.EventType.TRANSFER_OUT, crosschainID, event.block, event.params.from);
    (0, helpers_1.createBridgeTransferEvent)(protocol, token, crosschainToken, pool, poolRoute, chainID, crosschainID, true, event.params.from, event.params.to, event.params.amount, graph_ts_1.Bytes.fromHexString(constants_1.ZERO_ADDRESS), event);
    poolRouteHourlySnapshot.save();
    poolRouteDailySnapshot.save();
    poolRoute.save();
    poolHourlySnapshot.save();
    poolDailySnapshot.save();
    pool.save();
    crosschainToken.save();
    token.save();
    usageMetricsHourly.save();
    usageMetricsDaily.save();
    (0, helpers_1.updateProtocolTVL)(protocol, financialMetrics, deltaPoolTVL, event.block);
    financialMetrics.save();
    protocol.save();
}
exports.handleSwapOut = handleSwapOut;
function handleSwapIn(event) {
    const chainID = event.params.toChainID;
    const crosschainID = event.params.fromChainID;
    const tokenAddress = event.params.token;
    if (!configure_1.NetworkConfigs.isWhitelistToken(tokenAddress, crosschainID.toString())) {
        return;
    }
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(protocol, event.block);
    const usageMetricsDaily = (0, getters_1.getOrCreateUsageMetricDailySnapshot)(protocol, event.block);
    const usageMetricsHourly = (0, getters_1.getOrCreateUsageMetricHourlySnapshot)(protocol, event.block);
    const token = (0, getters_1.getOrCreateToken)(protocol, tokenAddress, chainID, event.block);
    const crosschainTokenAddress = configure_1.NetworkConfigs.getCrosschainTokenAddress(constants_1.BridgeType.ROUTER, token.id.toHexString(), crosschainID.toString());
    const crosschainToken = (0, getters_1.getOrCreateCrosschainToken)(token, crosschainID, crosschainTokenAddress, constants_1.CrosschainTokenType.WRAPPED);
    const poolID = token.id;
    const pool = (0, getters_1.getOrCreatePool)(protocol, token, poolID, constants_1.BridgePoolType.LIQUIDITY, crosschainID, event.block);
    const poolDailySnapshot = (0, getters_1.getOrCreatePoolDailySnapshot)(protocol, pool, event.block);
    const poolHourlySnapshot = (0, getters_1.getOrCreatePoolHourlySnapshot)(protocol, pool, event.block);
    const poolRoute = (0, getters_1.getOrCreatePoolRoute)(protocol, token, crosschainToken, pool, chainID, crosschainID);
    const poolRouteDailySnapshot = (0, getters_1.getOrCreatePoolRouteSnapshot)(poolRoute, poolDailySnapshot.id, event.block);
    const poolRouteHourlySnapshot = (0, getters_1.getOrCreatePoolRouteSnapshot)(poolRoute, poolHourlySnapshot.id, event.block);
    const oldPoolTVL = pool.totalValueLockedUSD;
    (0, helpers_1.updatePoolMetrics)(token, crosschainToken, pool, poolDailySnapshot, poolHourlySnapshot, poolRoute, poolRouteDailySnapshot.id, poolRouteHourlySnapshot.id, event.block);
    const deltaPoolTVL = pool.totalValueLockedUSD.minus(oldPoolTVL);
    (0, helpers_1.updateVolume)(protocol, financialMetrics, token, pool, poolDailySnapshot, poolHourlySnapshot, poolRoute, poolRouteDailySnapshot, poolRouteHourlySnapshot, false, event.params.amount);
    (0, helpers_1.updateRevenue)(protocol, financialMetrics, pool, poolDailySnapshot, poolHourlySnapshot, constants_1.BIGDECIMAL_ZERO);
    (0, helpers_1.updateUsageMetrics)(protocol, usageMetricsDaily, usageMetricsHourly, constants_1.EventType.TRANSFER_IN, crosschainID, event.block, event.params.to);
    (0, helpers_1.createBridgeTransferEvent)(protocol, token, crosschainToken, pool, poolRoute, chainID, crosschainID, false, graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS), event.params.to, event.params.amount, event.params.txhash, event);
    poolRouteHourlySnapshot.save();
    poolRouteDailySnapshot.save();
    poolRoute.save();
    poolHourlySnapshot.save();
    poolDailySnapshot.save();
    pool.save();
    crosschainToken.save();
    token.save();
    usageMetricsHourly.save();
    usageMetricsDaily.save();
    (0, helpers_1.updateProtocolTVL)(protocol, financialMetrics, deltaPoolTVL, event.block);
    financialMetrics.save();
    protocol.save();
}
exports.handleSwapIn = handleSwapIn;
function handleTransfer(event) {
    if (event.params.from == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS) ||
        event.params.to == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
        const context = graph_ts_1.dataSource.context();
        const poolID = context.getString(constants_1.CONTEXT_KEY_POOLID);
        const chainID = graph_ts_1.BigInt.fromString(context.getString(constants_1.CONTEXT_KEY_CHAINID));
        const crosschainID = graph_ts_1.BigInt.fromString(context.getString(constants_1.CONTEXT_KEY_CROSSCHAINID));
        const protocol = (0, getters_1.getOrCreateProtocol)();
        const usageMetricsDaily = (0, getters_1.getOrCreateUsageMetricDailySnapshot)(protocol, event.block);
        const usageMetricsHourly = (0, getters_1.getOrCreateUsageMetricHourlySnapshot)(protocol, event.block);
        const tokenAddress = graph_ts_1.Address.fromString(poolID);
        const token = (0, getters_1.getOrCreateToken)(protocol, tokenAddress, chainID, event.block);
        if (event.params.from == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
            (0, helpers_1.updateUsageMetrics)(protocol, usageMetricsDaily, usageMetricsHourly, constants_1.EventType.DEPOSIT, crosschainID, event.block, event.params.to);
            (0, helpers_1.createLiquidityDepositEvent)(protocol, token, graph_ts_1.Bytes.fromHexString(poolID), chainID, event.params.to, tokenAddress, event.params.value, event);
        }
        else if (event.params.to == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
            (0, helpers_1.updateUsageMetrics)(protocol, usageMetricsDaily, usageMetricsHourly, constants_1.EventType.WITHDRAW, crosschainID, event.block, event.params.from);
            (0, helpers_1.createLiquidityWithdrawEvent)(protocol, token, graph_ts_1.Bytes.fromHexString(poolID), chainID, event.params.from, tokenAddress, event.params.value, event);
        }
        usageMetricsHourly.save();
        usageMetricsDaily.save();
        protocol.save();
    }
}
exports.handleTransfer = handleTransfer;
