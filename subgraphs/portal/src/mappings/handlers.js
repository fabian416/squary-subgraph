"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSwapInNativeWithPayload = exports.handleSwapInNative = exports.handleSwapInWithPayload = exports.handleSwapIn = exports.handleSwapOut = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const versions_1 = require("../versions");
const configure_1 = require("../../configurations/configure");
const helpers_1 = require("./helpers");
const prices_1 = require("../prices");
const bridge_1 = require("../sdk/protocols/bridge");
const config_1 = require("../sdk/protocols/bridge/config");
const enums_1 = require("../sdk/protocols/bridge/enums");
const numbers_1 = require("../sdk/util/numbers");
const constants_1 = require("../sdk/util/constants");
const Bridge_1 = require("../../generated/Core/Bridge");
const Core_1 = require("../../generated/Core/Core");
const _ERC20_1 = require("../../generated/Core/_ERC20");
const conf = new config_1.BridgeConfig(configure_1.NetworkConfigs.getFactoryAddress().toHexString(), configure_1.NetworkConfigs.getProtocolName(), configure_1.NetworkConfigs.getProtocolSlug(), enums_1.BridgePermissionType.PRIVATE, versions_1.Versions);
class Pricer {
    getTokenPrice(token) {
        const pricedToken = graph_ts_1.Address.fromBytes(token.id);
        return (0, prices_1.getUsdPricePerToken)(pricedToken).usdPrice;
    }
    getAmountValueUSD(token, amount) {
        const pricedToken = graph_ts_1.Address.fromBytes(token.id);
        const _amount = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals);
        return (0, prices_1.getUsdPrice)(pricedToken, _amount);
    }
}
class TokenInit {
    getTokenParams(address) {
        const erc20 = _ERC20_1._ERC20.bind(address);
        let name = "unknown";
        let symbol = "UNKNOWN";
        let decimals = constants_1.INT_ZERO;
        const nameCall = erc20.try_name();
        if (!nameCall.reverted) {
            name = nameCall.value;
        }
        else {
            graph_ts_1.log.warning("[getTokenParams] nameCall reverted for {}", [
                address.toHexString(),
            ]);
        }
        const symbolCall = erc20.try_symbol();
        if (!symbolCall.reverted) {
            symbol = symbolCall.value;
        }
        else {
            graph_ts_1.log.warning("[getTokenParams] symbolCall reverted for {}", [
                address.toHexString(),
            ]);
        }
        const decimalsCall = erc20.try_decimals();
        if (!decimalsCall.reverted) {
            decimals = decimalsCall.value.toI32();
        }
        else {
            graph_ts_1.log.warning("[getTokenParams] decimalsCall reverted for {}", [
                address.toHexString(),
            ]);
        }
        return {
            name,
            symbol,
            decimals,
        };
    }
}
function handleSwapOut(event) {
    const payload = event.params.payload;
    let amount;
    let tokenAddress;
    let tokenChain;
    let to;
    let toChain;
    const bridgeContract = Bridge_1.Bridge.bind(configure_1.NetworkConfigs.getBridgeAddress());
    const parseTransferCall = bridgeContract.try_parseTransfer(payload);
    if (parseTransferCall.reverted) {
        const parseTransferWithPayloadCall = bridgeContract.try_parseTransferWithPayload(payload);
        if (parseTransferWithPayloadCall.reverted) {
            graph_ts_1.log.warning("[handleSwapOut] tx_hash: {} failed to parse payload: {}", [
                event.transaction.hash.toHexString(),
                payload.toHexString(),
            ]);
            return;
        }
        const transferStruct = parseTransferWithPayloadCall.value;
        amount = transferStruct.amount;
        tokenAddress = transferStruct.tokenAddress;
        tokenChain = transferStruct.tokenChain;
        to = transferStruct.to;
        toChain = transferStruct.toChain;
    }
    else {
        const transferStruct = parseTransferCall.value;
        amount = transferStruct.amount;
        tokenAddress = transferStruct.tokenAddress;
        tokenChain = transferStruct.tokenChain;
        to = transferStruct.to;
        toChain = transferStruct.toChain;
    }
    const chainID = configure_1.NetworkConfigs.getNetworkID();
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), event);
    let bridgePoolType = enums_1.BridgePoolType.LOCK_RELEASE;
    let crosschainTokenType = enums_1.CrosschainTokenType.WRAPPED;
    if (graph_ts_1.BigInt.fromI32(tokenChain) != chainID) {
        tokenAddress = bridgeContract.wrappedAsset(tokenChain, tokenAddress);
        bridgePoolType = enums_1.BridgePoolType.BURN_MINT;
        crosschainTokenType = enums_1.CrosschainTokenType.CANONICAL;
    }
    if (tokenAddress == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
        return;
    }
    const token = sdk.Tokens.getOrCreateToken((0, helpers_1.truncateAddress)(tokenAddress));
    amount = (0, helpers_1.denormalizeAmount)(amount, token.decimals);
    const pool = sdk.Pools.loadPool(token.id);
    if (!pool.isInitialized) {
        pool.initialize(token.name, token.symbol, bridgePoolType, token);
    }
    const crosschainTokenAddr = (0, helpers_1.getCrossTokenAddress)(token.id.toHexString(), graph_ts_1.BigInt.fromI32(tokenChain), chainID, graph_ts_1.BigInt.fromI32(toChain));
    const crosschainToken = sdk.Tokens.getOrCreateCrosschainToken(graph_ts_1.BigInt.fromI32(toChain), crosschainTokenAddr, crosschainTokenType, graph_ts_1.Address.fromBytes(token.id));
    pool.addDestinationToken(crosschainToken);
    const route = pool.getDestinationTokenRoute(crosschainToken);
    const coreContract = Core_1.Core.bind(graph_ts_1.dataSource.address());
    const protocolFee = coreContract.messageFee();
    pool.addRevenueNative(protocolFee, constants_1.BIGINT_ZERO);
    const protocol = sdk.Protocol;
    protocol.setBridgingFee(protocolFee);
    const account = sdk.Accounts.loadAccount(event.transaction.from);
    account.transferOut(pool, route, to, amount);
}
exports.handleSwapOut = handleSwapOut;
function handleSwapIn(call) {
    const coreContract = Core_1.Core.bind(configure_1.NetworkConfigs.getFactoryAddress());
    const parseVMCall = coreContract.try_parseAndVerifyVM(call.inputs.encodedVm);
    if (parseVMCall.reverted) {
        graph_ts_1.log.warning("[handleSwapIn] failed to parse encodedVM: {}", [
            call.inputs.encodedVm.toHexString(),
        ]);
        return;
    }
    const parsedVM = parseVMCall.value;
    const fromChain = parsedVM.value0.emitterChainId;
    const fromAddress = parsedVM.value0.emitterAddress;
    const payload = parsedVM.value0.payload;
    const bridgeContract = Bridge_1.Bridge.bind(graph_ts_1.dataSource.address());
    const parseTransferCall = bridgeContract.try_parseTransfer(payload);
    if (parseTransferCall.reverted) {
        graph_ts_1.log.warning("[handleSwapIn] failed to parse payload: {}", [
            payload.toHexString(),
        ]);
        return;
    }
    const transferStruct = parseTransferCall.value;
    let amount = transferStruct.amount;
    let tokenAddress = transferStruct.tokenAddress;
    const tokenChain = transferStruct.tokenChain;
    const to = transferStruct.to;
    const chainID = configure_1.NetworkConfigs.getNetworkID();
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), call);
    let bridgePoolType = enums_1.BridgePoolType.LOCK_RELEASE;
    let crosschainTokenType = enums_1.CrosschainTokenType.WRAPPED;
    if (graph_ts_1.BigInt.fromI32(tokenChain) != chainID) {
        tokenAddress = bridgeContract.wrappedAsset(tokenChain, tokenAddress);
        bridgePoolType = enums_1.BridgePoolType.BURN_MINT;
        crosschainTokenType = enums_1.CrosschainTokenType.CANONICAL;
    }
    if (tokenAddress == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
        return;
    }
    const token = sdk.Tokens.getOrCreateToken((0, helpers_1.truncateAddress)(tokenAddress));
    amount = (0, helpers_1.denormalizeAmount)(amount, token.decimals);
    const pool = sdk.Pools.loadPool(token.id);
    if (!pool.isInitialized) {
        pool.initialize(token.name, token.symbol, bridgePoolType, token);
    }
    const crosschainTokenAddr = (0, helpers_1.getCrossTokenAddress)(token.id.toHexString(), graph_ts_1.BigInt.fromI32(tokenChain), chainID, graph_ts_1.BigInt.fromI32(fromChain));
    const crosschainToken = sdk.Tokens.getOrCreateCrosschainToken(graph_ts_1.BigInt.fromI32(fromChain), crosschainTokenAddr, crosschainTokenType, graph_ts_1.Address.fromBytes(token.id));
    pool.addDestinationToken(crosschainToken);
    const route = pool.getDestinationTokenRoute(crosschainToken);
    const account = sdk.Accounts.loadAccount((0, helpers_1.truncateAddress)(to));
    account.transferIn(pool, route, fromAddress, amount);
}
exports.handleSwapIn = handleSwapIn;
function handleSwapInWithPayload(call) {
    const coreContract = Core_1.Core.bind(configure_1.NetworkConfigs.getFactoryAddress());
    const parseVMCall = coreContract.try_parseAndVerifyVM(call.inputs.encodedVm);
    if (parseVMCall.reverted) {
        graph_ts_1.log.warning("[handleSwapInWithPayload] failed to parse encodedVM: {}", [
            call.inputs.encodedVm.toHexString(),
        ]);
        return;
    }
    const parsedVM = parseVMCall.value;
    const fromChain = parsedVM.value0.emitterChainId;
    const fromAddress = parsedVM.value0.emitterAddress;
    const payload = parsedVM.value0.payload;
    const bridgeContract = Bridge_1.Bridge.bind(graph_ts_1.dataSource.address());
    const parseTransferCall = bridgeContract.try_parseTransferWithPayload(payload);
    if (parseTransferCall.reverted) {
        graph_ts_1.log.warning("[handleSwapInWithPayload] failed to parse payload: {}", [
            payload.toHexString(),
        ]);
        return;
    }
    const transferStruct = parseTransferCall.value;
    let amount = transferStruct.amount;
    let tokenAddress = transferStruct.tokenAddress;
    const tokenChain = transferStruct.tokenChain;
    const to = transferStruct.to;
    const chainID = configure_1.NetworkConfigs.getNetworkID();
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), call);
    let bridgePoolType = enums_1.BridgePoolType.LOCK_RELEASE;
    let crosschainTokenType = enums_1.CrosschainTokenType.WRAPPED;
    if (graph_ts_1.BigInt.fromI32(tokenChain) != chainID) {
        tokenAddress = bridgeContract.wrappedAsset(tokenChain, tokenAddress);
        bridgePoolType = enums_1.BridgePoolType.BURN_MINT;
        crosschainTokenType = enums_1.CrosschainTokenType.CANONICAL;
    }
    if (tokenAddress == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
        return;
    }
    const token = sdk.Tokens.getOrCreateToken((0, helpers_1.truncateAddress)(tokenAddress));
    amount = (0, helpers_1.denormalizeAmount)(amount, token.decimals);
    const pool = sdk.Pools.loadPool(token.id);
    if (!pool.isInitialized) {
        pool.initialize(token.name, token.symbol, bridgePoolType, token);
    }
    const crosschainTokenAddr = (0, helpers_1.getCrossTokenAddress)(token.id.toHexString(), graph_ts_1.BigInt.fromI32(tokenChain), chainID, graph_ts_1.BigInt.fromI32(fromChain));
    const crosschainToken = sdk.Tokens.getOrCreateCrosschainToken(graph_ts_1.BigInt.fromI32(fromChain), crosschainTokenAddr, crosschainTokenType, graph_ts_1.Address.fromBytes(token.id));
    pool.addDestinationToken(crosschainToken);
    const route = pool.getDestinationTokenRoute(crosschainToken);
    const account = sdk.Accounts.loadAccount((0, helpers_1.truncateAddress)(to));
    account.transferIn(pool, route, fromAddress, amount);
}
exports.handleSwapInWithPayload = handleSwapInWithPayload;
function handleSwapInNative(call) {
    const coreContract = Core_1.Core.bind(configure_1.NetworkConfigs.getFactoryAddress());
    const parseVMCall = coreContract.try_parseAndVerifyVM(call.inputs.encodedVm);
    if (parseVMCall.reverted) {
        graph_ts_1.log.warning("[handleSwapInNative] failed to parse encodedVM: {}", [
            call.inputs.encodedVm.toHexString(),
        ]);
        return;
    }
    const parsedVM = parseVMCall.value;
    const fromChain = parsedVM.value0.emitterChainId;
    const fromAddress = parsedVM.value0.emitterAddress;
    const payload = parsedVM.value0.payload;
    const bridgeContract = Bridge_1.Bridge.bind(graph_ts_1.dataSource.address());
    const parseTransferCall = bridgeContract.try_parseTransfer(payload);
    if (parseTransferCall.reverted) {
        graph_ts_1.log.warning("[handleSwapInNative] failed to parse payload: {}", [
            payload.toHexString(),
        ]);
        return;
    }
    const transferStruct = parseTransferCall.value;
    let amount = transferStruct.amount;
    let tokenAddress = transferStruct.tokenAddress;
    const tokenChain = transferStruct.tokenChain;
    const to = transferStruct.to;
    const chainID = configure_1.NetworkConfigs.getNetworkID();
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), call);
    let bridgePoolType = enums_1.BridgePoolType.LOCK_RELEASE;
    let crosschainTokenType = enums_1.CrosschainTokenType.WRAPPED;
    if (graph_ts_1.BigInt.fromI32(tokenChain) != chainID) {
        tokenAddress = bridgeContract.wrappedAsset(tokenChain, tokenAddress);
        bridgePoolType = enums_1.BridgePoolType.BURN_MINT;
        crosschainTokenType = enums_1.CrosschainTokenType.CANONICAL;
    }
    if (tokenAddress == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
        return;
    }
    const token = sdk.Tokens.getOrCreateToken((0, helpers_1.truncateAddress)(tokenAddress));
    amount = (0, helpers_1.denormalizeAmount)(amount, token.decimals);
    const pool = sdk.Pools.loadPool(token.id);
    if (!pool.isInitialized) {
        pool.initialize(token.name, token.symbol, bridgePoolType, token);
    }
    const crosschainTokenAddr = (0, helpers_1.getCrossTokenAddress)(token.id.toHexString(), graph_ts_1.BigInt.fromI32(tokenChain), chainID, graph_ts_1.BigInt.fromI32(fromChain));
    const crosschainToken = sdk.Tokens.getOrCreateCrosschainToken(graph_ts_1.BigInt.fromI32(fromChain), crosschainTokenAddr, crosschainTokenType, graph_ts_1.Address.fromBytes(token.id));
    pool.addDestinationToken(crosschainToken);
    const route = pool.getDestinationTokenRoute(crosschainToken);
    const account = sdk.Accounts.loadAccount((0, helpers_1.truncateAddress)(to));
    account.transferIn(pool, route, fromAddress, amount);
}
exports.handleSwapInNative = handleSwapInNative;
function handleSwapInNativeWithPayload(call) {
    const coreContract = Core_1.Core.bind(configure_1.NetworkConfigs.getFactoryAddress());
    const parseVMCall = coreContract.try_parseAndVerifyVM(call.inputs.encodedVm);
    if (parseVMCall.reverted) {
        graph_ts_1.log.warning("[handleSwapInNativeWithPayload] failed to parse encodedVM: {}", [call.inputs.encodedVm.toHexString()]);
        return;
    }
    const parsedVM = parseVMCall.value;
    const fromChain = parsedVM.value0.emitterChainId;
    const fromAddress = parsedVM.value0.emitterAddress;
    const payload = parsedVM.value0.payload;
    const bridgeContract = Bridge_1.Bridge.bind(graph_ts_1.dataSource.address());
    const parseTransferCall = bridgeContract.try_parseTransferWithPayload(payload);
    if (parseTransferCall.reverted) {
        graph_ts_1.log.warning("[handleSwapInNativeWithPayload] failed to parse payload: {}", [
            payload.toHexString(),
        ]);
        return;
    }
    const transferStruct = parseTransferCall.value;
    let amount = transferStruct.amount;
    let tokenAddress = transferStruct.tokenAddress;
    const tokenChain = transferStruct.tokenChain;
    const to = transferStruct.to;
    const chainID = configure_1.NetworkConfigs.getNetworkID();
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), call);
    let bridgePoolType = enums_1.BridgePoolType.LOCK_RELEASE;
    let crosschainTokenType = enums_1.CrosschainTokenType.WRAPPED;
    if (graph_ts_1.BigInt.fromI32(tokenChain) != chainID) {
        tokenAddress = bridgeContract.wrappedAsset(tokenChain, tokenAddress);
        bridgePoolType = enums_1.BridgePoolType.BURN_MINT;
        crosschainTokenType = enums_1.CrosschainTokenType.CANONICAL;
    }
    if (tokenAddress == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
        return;
    }
    const token = sdk.Tokens.getOrCreateToken((0, helpers_1.truncateAddress)(tokenAddress));
    amount = (0, helpers_1.denormalizeAmount)(amount, token.decimals);
    const pool = sdk.Pools.loadPool(token.id);
    if (!pool.isInitialized) {
        pool.initialize(token.name, token.symbol, bridgePoolType, token);
    }
    const crosschainTokenAddr = (0, helpers_1.getCrossTokenAddress)(token.id.toHexString(), graph_ts_1.BigInt.fromI32(tokenChain), chainID, graph_ts_1.BigInt.fromI32(fromChain));
    const crosschainToken = sdk.Tokens.getOrCreateCrosschainToken(graph_ts_1.BigInt.fromI32(fromChain), crosschainTokenAddr, crosschainTokenType, graph_ts_1.Address.fromBytes(token.id));
    pool.addDestinationToken(crosschainToken);
    const route = pool.getDestinationTokenRoute(crosschainToken);
    const account = sdk.Accounts.loadAccount((0, helpers_1.truncateAddress)(to));
    account.transferIn(pool, route, fromAddress, amount);
}
exports.handleSwapInNativeWithPayload = handleSwapInNativeWithPayload;
