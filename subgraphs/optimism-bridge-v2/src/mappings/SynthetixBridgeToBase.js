"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWithdrawalInitiated = exports.handleInitiateSynthTransfer = exports.handleFinalizeSynthTransfer = exports.handleDepositFinalized = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../constants");
const sdk_1 = require("../sdk");
const chainIds_1 = require("../sdk/protocols/bridge/chainIds");
const enums_1 = require("../sdk/protocols/bridge/enums");
const constants_2 = require("../sdk/util/constants");
function handleDepositFinalized(event) {
    const sdk = (0, sdk_1.getSDK)(event);
    const pool = sdk.Pools.loadPool(constants_1.SNX_ADDRESS_OPTIMISM);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(constants_1.SNX_ADDRESS_OPTIMISM);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.BURN_MINT, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_2.Network.MAINNET), constants_1.SNX_ADDRESS_MAINNET, enums_1.CrosschainTokenType.CANONICAL, constants_1.SNX_ADDRESS_OPTIMISM);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.params._to);
    acc.transferIn(pool, pool.getDestinationTokenRoute(crossToken), event.params._to, event.params._amount);
}
exports.handleDepositFinalized = handleDepositFinalized;
function handleFinalizeSynthTransfer(event) {
    if (event.params.currencyKey.toString() != "sUSD") {
        graph_ts_1.log.error("unhandled synth currency: {}", [
            event.params.currencyKey.toString(),
        ]);
        return;
    }
    const sdk = (0, sdk_1.getSDK)(event);
    const pool = sdk.Pools.loadPool(constants_1.SUSD_ADDRESS_OPTIMISM);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(constants_1.SUSD_ADDRESS_OPTIMISM);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.BURN_MINT, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_2.Network.MAINNET), constants_1.SUSD_ADDRESS_MAINNET, enums_1.CrosschainTokenType.CANONICAL, constants_1.SUSD_ADDRESS_OPTIMISM);
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
    const pool = sdk.Pools.loadPool(constants_1.SUSD_ADDRESS_OPTIMISM);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(constants_1.SUSD_ADDRESS_OPTIMISM);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.BURN_MINT, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_2.Network.MAINNET), constants_1.SUSD_ADDRESS_MAINNET, enums_1.CrosschainTokenType.CANONICAL, constants_1.SUSD_ADDRESS_OPTIMISM);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.params.destination);
    acc.transferOut(pool, pool.getDestinationTokenRoute(crossToken), event.params.destination, event.params.amount);
}
exports.handleInitiateSynthTransfer = handleInitiateSynthTransfer;
function handleWithdrawalInitiated(event) {
    const sdk = (0, sdk_1.getSDK)(event);
    const pool = sdk.Pools.loadPool(constants_1.SNX_ADDRESS_OPTIMISM);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(constants_1.SNX_ADDRESS_OPTIMISM);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.BURN_MINT, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_2.Network.MAINNET), constants_1.SNX_ADDRESS_MAINNET, enums_1.CrosschainTokenType.CANONICAL, constants_1.SNX_ADDRESS_OPTIMISM);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.params._to);
    acc.transferOut(pool, pool.getDestinationTokenRoute(crossToken), event.params._to, event.params._amount);
}
exports.handleWithdrawalInitiated = handleWithdrawalInitiated;
