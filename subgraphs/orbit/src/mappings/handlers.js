"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBurn = exports.handleMint = exports.handleOTVWithdraw = exports.handleLockIn = exports.onCreatePool = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const config_1 = require("../sdk/protocols/bridge/config");
const configure_1 = require("../../configurations/configure");
const enums_1 = require("../sdk/protocols/bridge/enums");
const prices_1 = require("../prices");
const bridge_1 = require("../sdk/protocols/bridge");
const events_1 = require("../sdk/util/events");
const versions_1 = require("../versions");
const numbers_1 = require("../sdk/util/numbers");
const chainIds_1 = require("../sdk/protocols/bridge/chainIds");
const constants_1 = require("../sdk/util/constants");
const constants_2 = require("../common/constants");
const tokens_1 = require("../common/tokens");
class Pricer {
    getTokenPrice(token) {
        const price = (0, prices_1.getUsdPricePerToken)(graph_ts_1.Address.fromBytes(token.id));
        return price.usdPrice;
    }
    getAmountValueUSD(token, amount) {
        const _amount = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals);
        return (0, prices_1.getUsdPrice)(graph_ts_1.Address.fromBytes(token.id), _amount);
    }
}
class TokenInit {
    getTokenParams(address) {
        const decimals = (0, tokens_1.fetchTokenDecimals)(address);
        const name = (0, tokens_1.fetchTokenName)(address);
        const symbol = (0, tokens_1.fetchTokenSymbol)(address);
        return {
            name,
            symbol,
            decimals,
        };
    }
}
function _getSDK(event = null, call = null) {
    let customEvent;
    if (event) {
        customEvent = events_1.CustomEventType.initialize(event.block, event.transaction, event.transactionLogIndex, event);
    }
    else if (call) {
        customEvent = events_1.CustomEventType.initialize(call.block, call.transaction, call.transaction.index);
    }
    else {
        graph_ts_1.log.error("[_getSDK]either event or call needs to be specified", []);
        return null;
    }
    const conf = new config_1.BridgeConfig(configure_1.NetworkConfigs.getFactoryAddress(), configure_1.NetworkConfigs.getProtocolName(), configure_1.NetworkConfigs.getProtocolSlug(), enums_1.BridgePermissionType.PRIVATE, versions_1.Versions);
    return new bridge_1.SDK(conf, new Pricer(), new TokenInit(), customEvent);
}
function onCreatePool(
// eslint-disable-next-line no-unused-vars
event, pool, 
// eslint-disable-next-line no-unused-vars
sdk, aux1 = null, aux2 = null) {
    if (aux1 && aux2) {
        const token = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromString(aux2));
        pool.initialize(`Pool-based Bridge: ${token.name}`, token.name, aux1, token);
    }
}
exports.onCreatePool = onCreatePool;
// Bridge via the Original Token Vault
function handleLockIn(event) {
    const poolId = event.address.concat(event.params.token);
    const networkConstants = (0, constants_1.getNetworkSpecificConstant)(graph_ts_1.dataSource.network());
    const dstPoolId = networkConstants.getpeggedTokenBridgeForChain(event.params.toChain);
    _handleTransferOut(event.params.token, event.params.fromAddr, event.params.toAddr, event.params.amount, event.params.toChain, poolId, enums_1.BridgePoolType.LOCK_RELEASE, enums_1.CrosschainTokenType.WRAPPED, event, event.params.depositId, dstPoolId);
}
exports.handleLockIn = handleLockIn;
// Withdraw from the Original Token Vault
function handleOTVWithdraw(event) {
    const tokenAddress = graph_ts_1.Address.fromBytes(event.params.token);
    const poolId = event.address.concat(tokenAddress);
    const networkConstants = (0, constants_1.getNetworkSpecificConstant)(graph_ts_1.dataSource.network());
    const srcPoolId = networkConstants.getpeggedTokenBridgeForChain(event.params.fromChain);
    _handleTransferIn(tokenAddress, event.params.fromAddr, event.params.toAddr, event.params.uints[0], event.params.fromChain, poolId, enums_1.BridgePoolType.BURN_MINT, enums_1.CrosschainTokenType.WRAPPED, event, srcPoolId);
}
exports.handleOTVWithdraw = handleOTVWithdraw;
// Mint on Pegged Token Minter
function handleMint(event) {
    const poolId = event.address.concat(event.params.tokenAddress);
    const networkConstants = (0, constants_1.getNetworkSpecificConstant)(event.params.fromChain);
    const srcPoolId = networkConstants.getOriginalTokenVaultAddress();
    _handleTransferIn(event.params.tokenAddress, event.params.fromAddr, event.params.toAddr, event.params.uints[0], event.params.fromChain, poolId, enums_1.BridgePoolType.BURN_MINT, enums_1.CrosschainTokenType.CANONICAL, event, srcPoolId);
}
exports.handleMint = handleMint;
// Burn on Pegged Token Minter
function handleBurn(event) {
    const poolId = event.address.concat(event.params.tokenAddress);
    const networkConstants = (0, constants_1.getNetworkSpecificConstant)(event.params.toChain);
    const dstPoolId = networkConstants.getOriginalTokenVaultAddress();
    _handleTransferOut(event.params.tokenAddress, event.params.fromAddr, event.params.toAddr, event.params.amount, event.params.toChain, poolId, enums_1.BridgePoolType.BURN_MINT, enums_1.CrosschainTokenType.CANONICAL, event, event.params.depositId, dstPoolId);
}
exports.handleBurn = handleBurn;
function _handleTransferIn(token, sender, receiver, amount, srcChain, poolId, bridgePoolType, crosschainTokenType, event, srcPoolId = null) {
    if (!srcPoolId) {
        graph_ts_1.log.warning("srcPoolId is null for srcChain: {}", [srcChain]);
        return;
    }
    const sdk = _getSDK(event);
    const pool = sdk.Pools.loadPool(poolId, onCreatePool, bridgePoolType, token.toHexString());
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(srcChain), srcPoolId, crosschainTokenType, token);
    pool.addDestinationToken(crossToken);
    const account = sdk.Accounts.loadAccount(graph_ts_1.Address.fromBytes(receiver));
    if (sender.byteLength != 20) {
        sender = receiver;
    }
    account.transferIn(pool, pool.getDestinationTokenRoute(crossToken), graph_ts_1.Address.fromBytes(sender), amount);
}
function _handleTransferOut(token, sender, receiver, amount, toChain, poolId, bridgePoolType, crosschainTokenType, event, refId, dstPoolId = null) {
    if (!dstPoolId) {
        graph_ts_1.log.warning("dstPoolId is null for transaction: {} and chain: {}", [
            event.transaction.hash.toHexString(),
            toChain,
        ]);
        return;
    }
    const sdk = _getSDK(event);
    const pool = sdk.Pools.loadPool(poolId, onCreatePool, bridgePoolType, token.toHexString());
    const account = sdk.Accounts.loadAccount(graph_ts_1.Address.fromBytes(sender));
    if (receiver.byteLength != 20) {
        receiver = sender;
    }
    // If Receiver is taxReceiver, this is the tax fee
    if (receiver.byteLength == 20 &&
        graph_ts_1.Address.fromBytes(receiver) == graph_ts_1.Address.fromString(constants_2.TAX_RECEIVER)) {
        pool.addRevenueNative(amount, constants_1.BIGINT_ZERO);
        return;
    }
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken((0, chainIds_1.networkToChainID)(toChain), dstPoolId, crosschainTokenType, token);
    pool.addDestinationToken(crossToken);
    if (sender.byteLength == 20 && receiver.byteLength == 20) {
        account.transferOut(pool, pool.getDestinationTokenRoute(crossToken), graph_ts_1.Address.fromBytes(receiver), amount);
    }
}
