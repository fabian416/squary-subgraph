"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = exports.handleSync = exports.handleFees = exports.handleSwap = exports.handleBurn = exports.handleMint = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const entities_1 = require("../../../../src/mappings/helpers/entities");
const pricing_1 = require("../../../../src/mappings/helpers/pricing");
const pools_1 = require("../../../../src/mappings/helpers/pools");
const metrics_1 = require("../../../../src/common/metrics");
const constants_1 = require("../../../../src/common/constants");
const getters_1 = require("../../../../src/common/getters");
const handlers_1 = require("../../../../src/common/handlers");
const constants_2 = require("../common/constants");
const PoolFactory_1 = require("../../../../generated/Factory/PoolFactory");
function handleMint(event) {
    const protocol = (0, getters_1.getOrCreateDex)(constants_2.FACTORY_ADDRESS, constants_2.PROTOCOL_NAME, constants_2.PROTOCOL_SLUG);
    const pool = (0, getters_1.getLiquidityPool)(event.address);
    if (!pool)
        return;
    (0, entities_1.createDeposit)(protocol, pool, event.params.amount0, event.params.amount1, event.params.sender, event);
    (0, pools_1.updatePoolValue)(protocol, pool, event.block); // TVL, output token price
    (0, metrics_1.updateUsageMetrics)(protocol, event.params.sender, constants_1.UsageType.DEPOSIT, event);
    (0, metrics_1.updateFinancials)(protocol, event);
    (0, metrics_1.updatePoolMetrics)(pool, event.block); // Syncs daily/hourly metrics with pool
}
exports.handleMint = handleMint;
function handleBurn(event) {
    const protocol = (0, getters_1.getOrCreateDex)(constants_2.FACTORY_ADDRESS, constants_2.PROTOCOL_NAME, constants_2.PROTOCOL_SLUG);
    const pool = (0, getters_1.getLiquidityPool)(event.address);
    if (!pool)
        return;
    (0, entities_1.createWithdraw)(protocol, pool, event.params.amount0, event.params.amount1, event.params.to, event);
    (0, pools_1.updatePoolValue)(protocol, pool, event.block); // TVL, output token price
    (0, metrics_1.updateUsageMetrics)(protocol, event.transaction.from, constants_1.UsageType.WITHDRAW, event);
    (0, metrics_1.updateFinancials)(protocol, event);
    (0, metrics_1.updatePoolMetrics)(pool, event.block); // Syncs daily/hourly metrics with pool
}
exports.handleBurn = handleBurn;
function handleSwap(event) {
    const protocol = (0, getters_1.getOrCreateDex)(constants_2.FACTORY_ADDRESS, constants_2.PROTOCOL_NAME, constants_2.PROTOCOL_SLUG);
    const pool = (0, getters_1.getLiquidityPool)(event.address);
    if (!pool)
        return;
    (0, entities_1.createSwap)(protocol, pool, event.params.amount0In, event.params.amount0Out, event.params.amount1In, event.params.amount1Out, event.params.sender, event.params.to, event);
    (0, pricing_1.updatePoolPriceFromSwap)(pool, event.params.amount0In, event.params.amount0Out, event.params.amount1In, event.params.amount1Out, event);
    (0, pools_1.updatePoolValue)(protocol, pool, event.block); // TVL, output token price
    (0, pools_1.updatePoolVolume)(protocol, pool, event.params.amount0In.plus(event.params.amount0Out), event.params.amount1In.plus(event.params.amount1Out), event);
    (0, metrics_1.updateUsageMetrics)(protocol, event.params.sender, constants_1.UsageType.SWAP, event);
    (0, metrics_1.updateFinancials)(protocol, event);
    const factoryContract = PoolFactory_1.PoolFactory.bind(graph_ts_1.Address.fromString(constants_2.FACTORY_ADDRESS));
    const fee = factoryContract
        .getFee(graph_ts_1.Address.fromString(pool.id), pool._stable)
        .toBigDecimal()
        .div(constants_1.BIGDECIMAL_HUNDRED);
    (0, entities_1.createPoolFees)(graph_ts_1.Address.fromString(pool.id), fee);
    (0, metrics_1.updatePoolMetrics)(pool, event.block); // Syncs daily/hourly metrics with pool
}
exports.handleSwap = handleSwap;
function handleFees(event) {
    const protocol = (0, getters_1.getOrCreateDex)(constants_2.FACTORY_ADDRESS, constants_2.PROTOCOL_NAME, constants_2.PROTOCOL_SLUG);
    const pool = (0, getters_1.getLiquidityPool)(event.address);
    if (!pool)
        return;
    (0, metrics_1.updateRevenue)(protocol, pool, event.params.amount0, event.params.amount1, event);
}
exports.handleFees = handleFees;
// Sync emitted whenever reserves are updated
function handleSync(event) {
    const pool = (0, getters_1.getLiquidityPool)(event.address);
    if (!pool)
        return;
    (0, pools_1.updateTokenBalances)(pool, event.params.reserve0, event.params.reserve1);
}
exports.handleSync = handleSync;
// Handle transfers event.
// The transfers are either occur as a part of the Mint or Burn event process.
// The tokens being transferred in these events are the LP tokens from the liquidity pool that emitted this event.
function handleTransfer(event) {
    const pool = (0, getters_1.getLiquidityPool)(event.address);
    if (!pool)
        return;
    // ignore initial transfers for first adds
    if (event.params.to.toHexString() == constants_1.ZERO_ADDRESS &&
        event.params.value.equals(constants_1.BIGINT_THOUSAND) &&
        pool.outputTokenSupply == constants_1.BIGINT_ZERO) {
        return;
    }
    // mints
    if (event.params.from.toHexString() == constants_1.ZERO_ADDRESS) {
        (0, handlers_1.handleTransferMint)(event, pool, event.params.value, event.params.to.toHexString());
    }
    // Case where direct send first on native token withdrawls.
    // For burns, mint tokens are first transferred to the pool before transferred for burn.
    // This gets the EOA that made the burn loaded into the _Transfer.
    if (event.params.to == event.address) {
        (0, handlers_1.handleTransferToPoolBurn)(event, event.params.from.toHexString());
    }
    // burn
    if (event.params.to.toHexString() == constants_1.ZERO_ADDRESS &&
        event.params.from == event.address) {
        (0, handlers_1.handleTransferBurn)(event, pool, event.params.value, event.params.from.toHexString());
    }
}
exports.handleTransfer = handleTransfer;
