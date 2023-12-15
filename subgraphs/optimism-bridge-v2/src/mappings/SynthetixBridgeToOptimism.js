"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWithdrawalFinalized = exports.handleInitiateSynthTransfer = exports.handleFinalizeSynthTransfer = exports.handleDepositInitiated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../constants");
const sdk_1 = require("../sdk");
const chainIds_1 = require("../sdk/protocols/bridge/chainIds");
const enums_1 = require("../sdk/protocols/bridge/enums");
const constants_2 = require("../sdk/util/constants");
function handleDepositInitiated(event) {
    const sdk = (0, sdk_1.getSDK)(event);
    const pool = sdk.Pools.loadPool(constants_1.SNX_ADDRESS_MAINNET);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(constants_1.SNX_ADDRESS_MAINNET);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.LOCK_RELEASE, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_2.Network.OPTIMISM), constants_1.SNX_ADDRESS_OPTIMISM, enums_1.CrosschainTokenType.WRAPPED, constants_1.SNX_ADDRESS_MAINNET);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.params._from);
    acc.transferOut(pool, pool.getDestinationTokenRoute(crossToken), event.params._to, event.params._amount);
}
exports.handleDepositInitiated = handleDepositInitiated;
function handleFinalizeSynthTransfer(event) {
    if (event.params.currencyKey.toString() != "sUSD") {
        graph_ts_1.log.error("unhandled synth currency: {}", [
            event.params.currencyKey.toString(),
        ]);
        return;
    }
    const sdk = (0, sdk_1.getSDK)(event);
    const pool = sdk.Pools.loadPool(constants_1.SUSD_ADDRESS_MAINNET);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(constants_1.SUSD_ADDRESS_MAINNET);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.LOCK_RELEASE, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_2.Network.OPTIMISM), constants_1.SUSD_ADDRESS_OPTIMISM, enums_1.CrosschainTokenType.WRAPPED, constants_1.SUSD_ADDRESS_MAINNET);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.params.destination);
    acc.transferIn(pool, pool.getDestinationTokenRoute(crossToken), event.params.destination, event.params.amount);
}
exports.handleFinalizeSynthTransfer = handleFinalizeSynthTransfer;
function handleInitiateSynthTransfer(event) {
    if (event.params.currencyKey.toString() != "sUSD") {
        graph_ts_1.log.error("unhandled synth currency: {}", [
            event.params.currencyKey.toString(),
        ]);
        return;
    }
    const sdk = (0, sdk_1.getSDK)(event);
    const pool = sdk.Pools.loadPool(constants_1.SUSD_ADDRESS_MAINNET);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(constants_1.SUSD_ADDRESS_MAINNET);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.LOCK_RELEASE, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_2.Network.OPTIMISM), constants_1.SUSD_ADDRESS_OPTIMISM, enums_1.CrosschainTokenType.WRAPPED, constants_1.SUSD_ADDRESS_MAINNET);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.transaction.from);
    acc.transferOut(pool, pool.getDestinationTokenRoute(crossToken), event.params.destination, event.params.amount);
}
exports.handleInitiateSynthTransfer = handleInitiateSynthTransfer;
function handleWithdrawalFinalized(event) {
    const sdk = (0, sdk_1.getSDK)(event);
    const pool = sdk.Pools.loadPool(constants_1.SNX_ADDRESS_MAINNET);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(constants_1.SNX_ADDRESS_MAINNET);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.LOCK_RELEASE, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_2.Network.OPTIMISM), constants_1.SNX_ADDRESS_OPTIMISM, enums_1.CrosschainTokenType.WRAPPED, constants_1.SNX_ADDRESS_MAINNET);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.params._to);
    acc.transferIn(pool, pool.getDestinationTokenRoute(crossToken), event.params._to, event.params._amount);
}
exports.handleWithdrawalFinalized = handleWithdrawalFinalized;
