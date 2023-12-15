"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWithdrawalInitiated = exports.handleDepositFinalized = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const sdk_1 = require("../sdk");
const chainIds_1 = require("../sdk/protocols/bridge/chainIds");
const enums_1 = require("../sdk/protocols/bridge/enums");
const constants_1 = require("../sdk/util/constants");
function handleDepositFinalized(event) {
    const sdk = (0, sdk_1.getSDK)(event);
    const pool = sdk.Pools.loadPool(event.params._l2Token);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(event.params._l2Token);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.BURN_MINT, token);
    }
    let l1Token = event.params._l1Token;
    // ETH deposits/withdrawals have l1Token set to zero
    if (l1Token.toHexString() == constants_1.ZERO_ADDRESS) {
        l1Token = graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_1.Network.MAINNET), l1Token, enums_1.CrosschainTokenType.CANONICAL, event.params._l2Token);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.params._to);
    acc.transferIn(pool, pool.getDestinationTokenRoute(crossToken), event.params._from, event.params._amount);
}
exports.handleDepositFinalized = handleDepositFinalized;
function handleWithdrawalInitiated(event) {
    const sdk = (0, sdk_1.getSDK)(event);
    const pool = sdk.Pools.loadPool(event.params._l2Token);
    if (!pool.isInitialized) {
        const token = sdk.Tokens.getOrCreateToken(event.params._l2Token);
        pool.initialize(token.name, token.symbol, enums_1.BridgePoolType.BURN_MINT, token);
    }
    let l1Token = event.params._l1Token;
    // ETH deposits/withdrawals have l1Token set to zero
    if (l1Token.toHexString() == constants_1.ZERO_ADDRESS) {
        l1Token = graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS);
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(constants_1.Network.MAINNET), l1Token, enums_1.CrosschainTokenType.CANONICAL, event.params._l2Token);
    pool.addDestinationToken(crossToken);
    const acc = sdk.Accounts.loadAccount(event.params._from);
    acc.transferOut(pool, pool.getDestinationTokenRoute(crossToken), event.params._to, event.params._amount);
}
exports.handleWithdrawalInitiated = handleWithdrawalInitiated;
