"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRemoveLiquidityOne = exports.handleRemoveLiquidity = exports.handleAddLiquidity = exports.handleTokenSwap = void 0;
const bridge_1 = require("../../../../src/sdk/protocols/bridge");
const enums_1 = require("../../../../src/sdk/protocols/bridge/enums");
const configure_1 = require("../../../../configurations/configure");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const index_1 = require("../../../../src/prices/index");
const numbers_1 = require("../../../../src/sdk/util/numbers");
const constants_1 = require("../../../../src/sdk/util/constants");
const tokens_1 = require("../../../../src/sdk/util/tokens");
const bridge_2 = require("../../../../src/sdk/util/bridge");
class Pricer {
    getTokenPrice(token) {
        const price = (0, index_1.getUsdPricePerToken)(graph_ts_1.Address.fromBytes(token.id));
        return price.usdPrice;
    }
    getAmountValueUSD(token, amount) {
        const _amount = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals);
        return (0, index_1.getUsdPrice)(graph_ts_1.Address.fromBytes(token.id), _amount);
    }
}
class TokenInit {
    getTokenParams(address) {
        const tokenConfig = configure_1.NetworkConfigs.getTokenDetails(address.toHex());
        if (tokenConfig.length != constants_1.FOUR) {
            graph_ts_1.log.error("Invalid tokenConfig length", []);
        }
        const name = tokenConfig[1];
        const symbol = tokenConfig[0];
        const decimals = graph_ts_1.BigInt.fromString(tokenConfig[2]).toI32();
        return { name, symbol, decimals };
    }
}
function handleTokenSwap(event) {
    if (!configure_1.NetworkConfigs.getPoolsList().includes(event.address.toHexString())) {
        graph_ts_1.log.error("Missing Config", []);
        return;
    }
    const amount = event.params.tokensSold;
    const fees = amount.times(constants_1.BIGINT_FOUR).div(constants_1.BIGINT_TEN_THOUSAND);
    graph_ts_1.log.info("FEES 2- fees: {}, fees: {}, amount: {}", [
        fees.toBigDecimal().toString(),
        fees.toString(),
        amount.toString(),
    ]);
    const inputToken = configure_1.NetworkConfigs.getTokenAddressFromPoolAddress(event.address.toHexString());
    if (inputToken.length != 2) {
        graph_ts_1.log.error("Invalid InputToken length", []);
        return;
    }
    const inputTokenOne = inputToken[0];
    const inputTokenTwo = inputToken[1];
    const poolConfig = configure_1.NetworkConfigs.getPoolDetails(event.address.toHexString());
    if (poolConfig.length != constants_1.THREE) {
        graph_ts_1.log.error("Invalid PoolConfig length", []);
        return;
    }
    const poolName = poolConfig[1];
    const poolSymbol = poolConfig[0];
    const hPoolName = poolConfig[2];
    const sdk = bridge_1.SDK.initializeFromEvent(bridge_2.conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(event.address);
    const hPool = sdk.Pools.loadPool(graph_ts_1.Bytes.fromHexString(event.address.toHexString().concat("-").concat("1")));
    const tokenOne = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenOne));
    const tokenTwo = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenTwo));
    sdk.Accounts.loadAccount(event.params.buyer);
    if (!pool.isInitialized) {
        pool.initialize(poolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, tokenOne);
    }
    if (!hPool.isInitialized) {
        hPool.initialize(hPoolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, tokenTwo);
    }
    (0, tokens_1.updateAMMTVE)(event.address, graph_ts_1.Address.fromBytes(tokenOne.id), hPool, pool);
    pool.pool.relation = hPool.getBytesID();
    hPool.pool.relation = hPool.getBytesID();
    pool.addRevenueNative(graph_ts_1.BigInt.zero(), fees);
}
exports.handleTokenSwap = handleTokenSwap;
function handleAddLiquidity(event) {
    if (!configure_1.NetworkConfigs.getPoolsList().includes(event.address.toHexString())) {
        graph_ts_1.log.error("Missing Config", []);
        return;
    }
    const amount = event.params.tokenAmounts;
    if (amount.length == 0) {
        return;
    }
    const liquidity = amount[0].plus(amount[1]);
    const inputToken = configure_1.NetworkConfigs.getTokenAddressFromPoolAddress(event.address.toHexString());
    if (inputToken.length != 2) {
        graph_ts_1.log.error("Invalid InputToken length", []);
        return;
    }
    const inputTokenOne = inputToken[0];
    const inputTokenTwo = inputToken[1];
    const poolConfig = configure_1.NetworkConfigs.getPoolDetails(event.address.toHexString());
    if (poolConfig.length != constants_1.THREE) {
        graph_ts_1.log.error("Invalid PoolConfig length", []);
        return;
    }
    const poolName = poolConfig[1];
    const hPoolName = poolConfig[2];
    const poolSymbol = poolConfig[0];
    const sdk = bridge_1.SDK.initializeFromEvent(bridge_2.conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(event.address);
    const token = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenOne));
    const hToken = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenTwo));
    const acc = sdk.Accounts.loadAccount(event.params.provider);
    const hPool = sdk.Pools.loadPool(graph_ts_1.Bytes.fromHexString(event.address.toHexString().concat("-").concat("1")));
    if (!pool.isInitialized) {
        pool.initialize(poolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, token);
    }
    if (!hPool.isInitialized) {
        hPool.initialize(hPoolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, hToken);
    }
    //Optimism had a regenesis so we need to manually set the pool's liquidity balance
    if (event.transaction.hash.toHexString() ==
        "0xb164734917a3ab5987544d99f6a5875a95bbb30d57c30dfec8db8d13789490ee") {
        pool.pool._inputTokenLiquidityBalance = event.params.lpTokenSupply.div(constants_1.BIGINT_TEN_TO_EIGHTEENTH);
    }
    pool.setOutputTokenSupply(event.params.lpTokenSupply);
    hPool.setOutputTokenSupply(event.params.lpTokenSupply);
    acc.liquidityDeposit(pool, liquidity);
    pool.pool.relation = hPool.getBytesID();
    hPool.pool.relation = hPool.getBytesID();
    (0, tokens_1.updateAMMTVE)(event.address, graph_ts_1.Address.fromBytes(token.id), hPool, pool);
    graph_ts_1.log.info(`LA ${token.id.toHexString()} - lpTokenSupply: {}, amount: {}, hash: {},  feeUsd: {}`, [
        (0, numbers_1.bigIntToBigDecimal)(event.params.lpTokenSupply).toString(),
        (0, numbers_1.bigIntToBigDecimal)(liquidity, constants_1.SIX).toString(),
        event.transaction.hash.toHexString(),
        (0, numbers_1.bigIntToBigDecimal)(event.params.fees[0], constants_1.SIX).toString(),
    ]);
}
exports.handleAddLiquidity = handleAddLiquidity;
function handleRemoveLiquidity(event) {
    if (!configure_1.NetworkConfigs.getPoolsList().includes(event.address.toHexString())) {
        graph_ts_1.log.error("Missing Config", []);
        return;
    }
    const amount = event.params.tokenAmounts;
    if (amount.length == 0) {
        return;
    }
    const liquidity = amount[0].plus(amount[1]);
    const inputToken = configure_1.NetworkConfigs.getTokenAddressFromPoolAddress(event.address.toHexString());
    if (inputToken.length != 2) {
        graph_ts_1.log.error("Invalid InputToken length", []);
        return;
    }
    const inputTokenOne = inputToken[0];
    const inputTokenTwo = inputToken[1];
    const poolConfig = configure_1.NetworkConfigs.getPoolDetails(event.address.toHexString());
    if (poolConfig.length != constants_1.THREE) {
        graph_ts_1.log.error("Invalid PoolConfig length", []);
        return;
    }
    const poolName = poolConfig[1];
    const poolSymbol = poolConfig[0];
    const hPoolName = poolConfig[2];
    const sdk = bridge_1.SDK.initializeFromEvent(bridge_2.conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(event.address);
    const token = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenOne));
    const hToken = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenTwo));
    const acc = sdk.Accounts.loadAccount(event.params.provider);
    const hPool = sdk.Pools.loadPool(graph_ts_1.Bytes.fromHexString(event.address.toHexString().toLowerCase().concat("-").concat("1")));
    if (!pool.isInitialized) {
        pool.initialize(poolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, token);
    }
    if (!hPool.isInitialized) {
        hPool.initialize(hPoolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, hToken);
    }
    pool.setOutputTokenSupply(event.params.lpTokenSupply);
    hPool.setOutputTokenSupply(event.params.lpTokenSupply);
    acc.liquidityWithdraw(pool, liquidity);
    (0, tokens_1.updateAMMTVE)(event.address, graph_ts_1.Address.fromBytes(token.id), hPool, pool);
    pool.pool.relation = hPool.getBytesID();
    hPool.pool.relation = hPool.getBytesID();
    graph_ts_1.log.info("LWITH lpTokenSupply: {}, amount6-0: {}, amount18-0: {}, amount6-1: {}, amount18-1: {}, hash: {}", [
        (0, numbers_1.bigIntToBigDecimal)(event.params.lpTokenSupply).toString(),
        (0, numbers_1.bigIntToBigDecimal)(amount[0], constants_1.SIX).toString(),
        (0, numbers_1.bigIntToBigDecimal)(amount[0]).toString(),
        (0, numbers_1.bigIntToBigDecimal)(amount[1], constants_1.SIX).toString(),
        (0, numbers_1.bigIntToBigDecimal)(amount[1]).toString(),
        event.transaction.hash.toHexString(),
    ]);
}
exports.handleRemoveLiquidity = handleRemoveLiquidity;
function handleRemoveLiquidityOne(event) {
    if (!configure_1.NetworkConfigs.getPoolsList().includes(event.address.toHexString())) {
        graph_ts_1.log.error("Missing Config", []);
        return;
    }
    graph_ts_1.log.info("LWITHONE lpTokenSupply: {}, amount: {}, txHash: {}", [
        event.params.lpTokenSupply.toString(),
        event.transaction.hash.toHexString(),
        (0, numbers_1.bigIntToBigDecimal)(event.params.lpTokenAmount).toString(),
    ]);
    const tokenIndex = event.params.boughtId;
    if (!tokenIndex.equals(graph_ts_1.BigInt.zero())) {
        return;
    }
    const amount = event.params.lpTokenAmount.div(graph_ts_1.BigInt.fromI32(2));
    const inputToken = configure_1.NetworkConfigs.getTokenAddressFromPoolAddress(event.address.toHexString());
    if (inputToken.length != 2) {
        graph_ts_1.log.error("Invalid InputToken length", []);
        return;
    }
    const inputTokenOne = inputToken[0];
    const inputTokenTwo = inputToken[1];
    const poolConfig = configure_1.NetworkConfigs.getPoolDetails(event.address.toHexString());
    if (poolConfig.length != constants_1.THREE) {
        graph_ts_1.log.error("Invalid PoolConfig length", []);
        return;
    }
    const poolName = poolConfig[1];
    const hPoolName = poolConfig[2];
    const poolSymbol = poolConfig[0];
    const sdk = bridge_1.SDK.initializeFromEvent(bridge_2.conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(event.address);
    const token = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenOne));
    const hToken = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenTwo));
    const acc = sdk.Accounts.loadAccount(event.params.provider);
    const hPool = sdk.Pools.loadPool(graph_ts_1.Bytes.fromHexString(event.address.toHexString().concat("-").concat("1")));
    if (!pool.isInitialized) {
        pool.initialize(poolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, token);
    }
    if (!hPool.isInitialized) {
        hPool.initialize(hPoolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, hToken);
    }
    pool.setOutputTokenSupply(event.params.lpTokenSupply);
    hPool.setOutputTokenSupply(event.params.lpTokenSupply);
    acc.liquidityWithdraw(pool, amount.div(constants_1.BIGINT_TEN_TO_EIGHTEENTH));
    (0, tokens_1.updateAMMTVE)(event.address, graph_ts_1.Address.fromBytes(token.id), hPool, pool);
    pool.pool.relation = hPool.getBytesID();
    hPool.pool.relation = hPool.getBytesID();
    graph_ts_1.log.info("LWITHONE lpTokenSupply: {}, amount: {}, txHash: {}", [
        event.params.lpTokenSupply.toString(),
        (0, numbers_1.bigIntToBigDecimal)(event.params.lpTokenAmount).toString(),
        event.transaction.hash.toHexString(),
    ]);
}
exports.handleRemoveLiquidityOne = handleRemoveLiquidityOne;
