"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleETHWithdrawalFinalized = exports.handleETHDepositInitiated = exports.handleERC20WithdrawalFinalized = exports.handleERC20DepositInitiated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../constants");
const sdk_1 = require("../sdk");
const chainIds_1 = require("../sdk/protocols/bridge/chainIds");
const enums_1 = require("../sdk/protocols/bridge/enums");
const constants_2 = require("../sdk/util/constants");
function handleERC20DepositInitiated(event) {
    const sdk = (0, sdk_1.getSDK)(event);
    const pool = sdk.Pools.loadPool(event.params._l1Token);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(event.params._l1Token);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.LOCK_RELEASE, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_2.Network.OPTIMISM), event.params._l2Token, enums_1.CrosschainTokenType.WRAPPED, event.params._l1Token);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.params._from);
    acc.transferOut(pool, pool.getDestinationTokenRoute(crossToken), event.params._to, event.params._amount);
}
exports.handleERC20DepositInitiated = handleERC20DepositInitiated;
function handleERC20WithdrawalFinalized(event) {
    const sdk = (0, sdk_1.getSDK)(event);
    const pool = sdk.Pools.loadPool(event.params._l1Token);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(event.params._l1Token);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.LOCK_RELEASE, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_2.Network.OPTIMISM), event.params._l2Token, enums_1.CrosschainTokenType.WRAPPED, event.params._l1Token);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.params._to);
    acc.transferIn(pool, pool.getDestinationTokenRoute(crossToken), event.params._from, event.params._amount);
}
exports.handleERC20WithdrawalFinalized = handleERC20WithdrawalFinalized;
function handleETHDepositInitiated(event) {
    const sdk = (0, sdk_1.getSDK)(event);
    const ethAddress = graph_ts_1.Address.fromString(constants_2.ETH_ADDRESS);
    const pool = sdk.Pools.loadPool(graph_ts_1.Bytes.fromHexString(constants_2.ETH_ADDRESS));
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(ethAddress);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.LOCK_RELEASE, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_2.Network.OPTIMISM), graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS_OPTIMISM), enums_1.CrosschainTokenType.WRAPPED, ethAddress);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.params._from);
    acc.transferOut(pool, pool.getDestinationTokenRoute(crossToken), event.params._to, event.params._amount);
}
exports.handleETHDepositInitiated = handleETHDepositInitiated;
function handleETHWithdrawalFinalized(event) {
    const sdk = (0, sdk_1.getSDK)(event);
    const ethAddress = graph_ts_1.Address.fromString(constants_2.ETH_ADDRESS);
    const pool = sdk.Pools.loadPool(ethAddress);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(ethAddress);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.LOCK_RELEASE, token);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_2.Network.OPTIMISM), graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS_OPTIMISM), enums_1.CrosschainTokenType.WRAPPED, ethAddress);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.params._to);
    acc.transferIn(pool, pool.getDestinationTokenRoute(crossToken), event.params._from, event.params._amount);
}
exports.handleETHWithdrawalFinalized = handleETHWithdrawalFinalized;
