"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransferSentToL2 = void 0;
const bridge_1 = require("../../../../src/sdk/protocols/bridge");
const enums_1 = require("../../../../src/sdk/protocols/bridge/enums");
const configure_1 = require("../../../../configurations/configure");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const bridge_2 = require("../../../../src/sdk/util/bridge");
const index_1 = require("../../../../src/prices/index");
const numbers_1 = require("../../../../src/sdk/util/numbers");
const bridge_3 = require("../../../../src/sdk/util/bridge");
const constants_1 = require("../../../../src/sdk/util/constants");
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
function handleTransferSentToL2(event) {
    if (!configure_1.NetworkConfigs.getBridgeList().includes(event.address.toHexString())) {
        graph_ts_1.log.error("Missing Config", []);
        return;
    }
    const inputToken = configure_1.NetworkConfigs.getTokenAddressFromBridgeAddress(event.address.toHexString());
    if (inputToken.length != 1) {
        graph_ts_1.log.error("Invalid InputToken length", []);
        return;
    }
    const inputTokenOne = inputToken[0];
    graph_ts_1.log.info("inputToken1: {}, bridgeAddress: {}, chainId: {}", [
        inputTokenOne,
        event.address.toHexString(),
        event.params.chainId.toString(),
    ]);
    const poolAddress = configure_1.NetworkConfigs.getPoolAddressFromChainId(event.params.chainId.toString(), event.address.toHexString());
    const poolConfig = configure_1.NetworkConfigs.getPoolDetails(poolAddress);
    if (poolConfig.length != 2) {
        graph_ts_1.log.error("Invalid PoolConfig length", []);
        return;
    }
    const poolName = poolConfig[0];
    const poolSymbol = poolConfig[1];
    const sdk = bridge_1.SDK.initializeFromEvent(bridge_2.conf, new Pricer(), new TokenInit(), event);
    const acc = sdk.Accounts.loadAccount(event.params.recipient);
    const pool = sdk.Pools.loadPool(graph_ts_1.Address.fromString(poolAddress));
    const token = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(inputTokenOne));
    if (!pool.isInitialized) {
        pool.initialize(poolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken(event.params.chainId, graph_ts_1.Address.fromString(configure_1.NetworkConfigs.getCrossTokenAddress(event.params.chainId.toString(), inputTokenOne)), enums_1.CrosschainTokenType.CANONICAL, graph_ts_1.Address.fromString(inputTokenOne));
    graph_ts_1.log.info("S5 - chainID: {}, inputTokenOne: {}", [
        event.params.chainId.toHexString(),
        inputTokenOne,
    ]);
    pool.addDestinationToken(crossToken);
    acc.transferOut(pool, pool.getDestinationTokenRoute(crossToken), event.params.recipient, event.params.amount);
    graph_ts_1.log.info("S6 - chainID: {}, inputTokenOne: {}", [
        event.params.chainId.toString(),
        inputTokenOne,
    ]);
    pool.addInputTokenBalance(event.params.amount);
    const receipt = event.receipt;
    if (!receipt)
        return;
    graph_ts_1.log.info("S7 - chainID: {}, inputTokenOne: {}, txHash: {}", [
        event.params.chainId.toString(),
        inputTokenOne,
        event.transaction.hash.toHexString(),
    ]);
    (0, bridge_3.updateL1OutgoingBridgeMessage)(event, event.params.recipient, event.params.chainId, acc, inputTokenOne, receipt);
    graph_ts_1.log.info("TransferOUT - BridgeAddress: {},  txHash: {}", [
        event.address.toHexString(),
        event.transaction.hash.toHexString(),
    ]);
}
exports.handleTransferSentToL2 = handleTransferSentToL2;
