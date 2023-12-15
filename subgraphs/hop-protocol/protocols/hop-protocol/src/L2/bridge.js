"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransferSent = exports.handleTransferFromL1Completed = void 0;
const bridge_1 = require("../../../../src/sdk/protocols/bridge");
const enums_1 = require("../../../../src/sdk/protocols/bridge/enums");
const chainIds_1 = require("../../../../src/sdk/protocols/bridge/chainIds");
const configure_1 = require("../../../../configurations/configure");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const index_1 = require("../../../../src/prices/index");
const numbers_1 = require("../../../../src/sdk/util/numbers");
const constants_1 = require("../../../../src/sdk/util/constants");
const bridge_2 = require("../../../../src/sdk/util/bridge");
const bridge_3 = require("../../../../src/sdk/util/bridge");
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
function handleTransferFromL1Completed(event) {
    graph_ts_1.log.info("TransferFromL1 - bridgeAddress: {},  hash: {}", [
        event.address.toHexString(),
        event.transaction.hash.toHexString(),
    ]);
    if (!configure_1.NetworkConfigs.getBridgeList().includes(event.address.toHexString())) {
        graph_ts_1.log.error("Missing Config", []);
        return;
    }
    const inputToken = configure_1.NetworkConfigs.getTokenAddressFromBridgeAddress(event.address.toHexString());
    if (inputToken.length != 2) {
        graph_ts_1.log.error("Invalid InputToken length", []);
        return;
    }
    const inputTokenOne = inputToken[0];
    const inputTokenTwo = inputToken[1];
    const poolAddress = configure_1.NetworkConfigs.getPoolAddressFromBridgeAddress(event.address.toHexString());
    const poolConfig = configure_1.NetworkConfigs.getPoolDetails(poolAddress);
    if (poolConfig.length != constants_1.THREE) {
        graph_ts_1.log.error("Invalid PoolConfig length", []);
        return;
    }
    graph_ts_1.log.info("S1 - inputToken: {},  poolAddress: {}", [
        inputTokenOne,
        poolAddress,
    ]);
    const poolName = poolConfig[0];
    const poolSymbol = poolConfig[1];
    const hPoolName = poolConfig[2];
    const sdk = bridge_1.SDK.initializeFromEvent(bridge_3.conf, new Pricer(), new TokenInit(), event);
    const acc = sdk.Accounts.loadAccount(event.transaction.from);
    const tokenOne = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenOne));
    const tokenTwo = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenTwo));
    const pool = sdk.Pools.loadPool(graph_ts_1.Address.fromString(poolAddress));
    const hPool = sdk.Pools.loadPool(graph_ts_1.Bytes.fromHexString(poolAddress.concat("-").concat("1")));
    if (!pool.isInitialized) {
        pool.initialize(poolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, tokenOne);
    }
    if (!hPool.isInitialized) {
        hPool.initialize(hPoolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, tokenTwo);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken(chainIds_1.reverseChainIDs.get(constants_1.Network.MAINNET), graph_ts_1.Address.fromString(configure_1.NetworkConfigs.getMainnetCrossTokenFromTokenAddress(inputTokenOne)), enums_1.CrosschainTokenType.CANONICAL, graph_ts_1.Address.fromString(inputTokenOne));
    pool.pool.relation = hPool.getBytesID();
    hPool.pool.relation = hPool.getBytesID();
    pool.addDestinationToken(crossToken);
    acc.transferIn(pool, pool.getDestinationTokenRoute(crossToken), event.transaction.from, event.params.amount, event.transaction.hash);
    //MESSAGES
    const receipt = event.receipt;
    if (!receipt)
        return;
    (0, bridge_2.updateL2IncomingBridgeMessage)(event, event.params.recipient, acc, receipt);
}
exports.handleTransferFromL1Completed = handleTransferFromL1Completed;
function handleTransferSent(event) {
    graph_ts_1.log.info("TransferSent - bridgeAddress: {},  hash: {}, outgoingChainId: {}", [
        event.address.toHexString(),
        event.transaction.hash.toHexString(),
        event.params.chainId.toString(),
    ]);
    if (!configure_1.NetworkConfigs.getBridgeList().includes(event.address.toHexString())) {
        graph_ts_1.log.error("Missing Config", []);
        return;
    }
    const inputToken = configure_1.NetworkConfigs.getTokenAddressFromBridgeAddress(event.address.toHexString());
    if (inputToken.length != 2) {
        graph_ts_1.log.error("Invalid InputToken length", []);
        return;
    }
    const inputTokenOne = inputToken[0];
    const inputTokenTwo = inputToken[1];
    const poolAddress = configure_1.NetworkConfigs.getPoolAddressFromBridgeAddress(event.address.toHexString());
    const poolConfig = configure_1.NetworkConfigs.getPoolDetails(poolAddress);
    if (poolConfig.length != constants_1.THREE) {
        graph_ts_1.log.error("Invalid PoolConfig length", []);
        return;
    }
    graph_ts_1.log.info("S1 - inputToken: {},  poolAddress: {}", [
        inputTokenOne,
        poolAddress,
    ]);
    const poolName = poolConfig[0];
    const poolSymbol = poolConfig[1];
    const hPoolName = poolConfig[2];
    const sdk = bridge_1.SDK.initializeFromEvent(bridge_3.conf, new Pricer(), new TokenInit(), event);
    const tokenOne = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenOne));
    const tokenTwo = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenTwo));
    const acc = sdk.Accounts.loadAccount(event.params.recipient);
    const pool = sdk.Pools.loadPool(graph_ts_1.Address.fromString(poolAddress));
    const hPool = sdk.Pools.loadPool(graph_ts_1.Bytes.fromHexString(poolAddress.concat("-").concat("1")));
    if (!pool.isInitialized) {
        pool.initialize(poolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, tokenOne);
    }
    if (!hPool.isInitialized) {
        hPool.initialize(hPoolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, tokenTwo);
    }
    graph_ts_1.log.info("S2 - inputToken: {},  poolAddress: {}", [
        inputTokenOne,
        poolAddress,
    ]);
    pool.pool.relation = hPool.getBytesID();
    hPool.pool.relation = hPool.getBytesID();
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken(event.params.chainId, graph_ts_1.Address.fromString(configure_1.NetworkConfigs.getCrossTokenAddress(event.params.chainId.toString(), inputTokenOne)), enums_1.CrosschainTokenType.CANONICAL, graph_ts_1.Address.fromString(inputTokenOne));
    graph_ts_1.log.info("S3 - inputToken: {},  poolAddress: {}", [
        inputTokenOne,
        poolAddress,
    ]);
    pool.addDestinationToken(crossToken);
    acc.transferOut(pool, pool.getDestinationTokenRoute(crossToken), event.params.recipient, event.params.amount, event.transaction.hash);
    const receipt = event.receipt;
    if (!receipt)
        return;
    (0, bridge_2.updateL2OutgoingBridgeMessage)(event, event.params.recipient, event.params.chainId, acc, receipt);
}
exports.handleTransferSent = handleTransferSent;
