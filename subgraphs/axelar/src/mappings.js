"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTxId =
  exports.bytes32ToAddressHexString =
  exports.bytes32ToAddress =
  exports.bytesToUnsignedBigInt =
  exports.handleFeeRefund =
  exports.handleNativeGasAdded =
  exports.handleGasAdded =
  exports.handleNativeGasPaidForContractCallWithToken =
  exports.handleNativeGasPaidForContractCall =
  exports.handleGasPaidForContractCallWithToken =
  exports.handleGasPaidForContractCall =
  exports.handleCommandExecuted =
  exports.handleContractCallApprovedWithMint =
  exports.handleContractCallApproved =
  exports.handleContractCall =
  exports.handleContractCallWithToken =
  exports.handleTokenSent =
  exports.handleTokenDeployed =
  exports.onCreatePool =
  exports.handlePairCreated =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const BurnableMintableCappedERC20_1 = require("../generated/AxelarGateway/BurnableMintableCappedERC20");
const bridge_1 = require("./sdk/protocols/bridge");
const events_1 = require("./sdk/util/events");
const enums_1 = require("./sdk/protocols/bridge/enums");
const config_1 = require("./sdk/protocols/bridge/config");
const _ERC20_1 = require("../generated/AxelarGateway/_ERC20");
const ERC20NameBytes_1 = require("../generated/AxelarGateway/ERC20NameBytes");
const ERC20SymbolBytes_1 = require("../generated/AxelarGateway/ERC20SymbolBytes");
const versions_1 = require("./versions");
const schema_1 = require("../generated/schema");
const numbers_1 = require("./sdk/util/numbers");
const prices_1 = require("./prices");
const chainIds_1 = require("./sdk/protocols/bridge/chainIds");
const constants_1 = require("./sdk/util/constants");
const strings_1 = require("./sdk/util/strings");
// empty handler for prices library
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
function handlePairCreated(event) {}
exports.handlePairCreated = handlePairCreated;
// Implement TokenPricer to pass it to the SDK constructor
class Pricer {
  getTokenPrice(token) {
    const price = (0, prices_1.getUsdPricePerToken)(
      graph_ts_1.Address.fromBytes(token.id)
    );
    return price.usdPrice;
  }
  getAmountValueUSD(token, amount) {
    const _amount = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals);
    return (0, prices_1.getUsdPrice)(
      graph_ts_1.Address.fromBytes(token.id),
      _amount
    );
  }
}
// Implement TokenInitializer
class TokenInit {
  getTokenParams(address) {
    const erc20 = _ERC20_1._ERC20.bind(address);
    const decimals = erc20.decimals().toI32();
    let name = "Unknown Token";
    const nameResult = erc20.try_name();
    if (!nameResult.reverted) {
      name = nameResult.value;
    } else {
      const erc20name = ERC20NameBytes_1.ERC20NameBytes.bind(address);
      const nameResult = erc20name.try_name();
      if (!nameResult.reverted) {
        name = nameResult.value.toString();
      } else {
        graph_ts_1.log.warning(
          "[getTokenParams]Fail to get name for token {}",
          [address.toHexString()]
        );
      }
    }
    let symbol = "Unknown";
    const symbolResult = erc20.try_symbol();
    if (!symbolResult.reverted) {
      symbol = symbolResult.value;
    } else {
      const erc20symbol = ERC20SymbolBytes_1.ERC20SymbolBytes.bind(address);
      const symbolResult = erc20symbol.try_symbol();
      if (!symbolResult.reverted) {
        symbol = symbolResult.value.toString();
      } else {
        graph_ts_1.log.warning(
          "[getTokenParams]Fail to get symbol for token {}",
          [address.toHexString()]
        );
      }
    }
    return {
      name,
      symbol,
      decimals,
    };
  }
}
function _createCustomEvent(event, call = null) {
  let customEvent;
  if (event) {
    customEvent = events_1.CustomEventType.initialize(
      event.block,
      event.transaction,
      event.transactionLogIndex,
      event.address,
      event
    );
  } else if (call) {
    customEvent = events_1.CustomEventType.initialize(
      call.block,
      call.transaction,
      call.transaction.index,
      call.to
    );
  } else {
    graph_ts_1.log.error(
      "[_createCustomEvent]either event or call needs to be specified",
      []
    );
    return null;
  }
  return customEvent;
}
function _getSDK(customEvent) {
  const protocolId = (0, constants_1.getNetworkSpecificConstant)()
    .getProtocolId()
    .toHexString();
  const conf = new config_1.BridgeConfig(
    protocolId,
    "Axelar",
    "axelar",
    enums_1.BridgePermissionType.PERMISSIONLESS,
    versions_1.Versions
  );
  return new bridge_1.SDK(conf, new Pricer(), new TokenInit(), customEvent);
}
function onCreatePool(
  // eslint-disable-next-line no-unused-vars
  event,
  pool,
  // eslint-disable-next-line no-unused-vars
  sdk,
  aux1 = null,
  aux2 = null
) {
  if (aux1 && aux2) {
    const token = sdk.Tokens.getOrCreateToken(
      graph_ts_1.Address.fromString(aux2)
    );
    pool.initialize(
      `${constants_1.POOL_PREFIX} ${token.name}`,
      token.name,
      aux1,
      token
    );
  }
}
exports.onCreatePool = onCreatePool;
function handleTokenDeployed(event) {
  // determine whether the token deployed is internal or external token type
  const tokenType = getTokenType(event.params.tokenAddresses);
  getOrCreateTokenSymbol(
    event.params.symbol,
    event.params.tokenAddresses.toHexString(),
    tokenType
  );
}
exports.handleTokenDeployed = handleTokenDeployed;
function handleTokenSent(event) {
  // the token should have already been deployed
  const tokenSymbol = getOrCreateTokenSymbol(event.params.symbol);
  const tokenAddress = tokenSymbol.tokenAddress;
  const poolId = event.address.concat(
    graph_ts_1.Address.fromString(tokenAddress)
  );
  const dstChainId = (0, chainIds_1.networkToChainID)(
    event.params.destinationChain.toUpperCase()
  );
  const dstNetworkConstants = (0, constants_1.getNetworkSpecificConstant)(
    dstChainId
  );
  const dstPoolId = dstNetworkConstants.getPoolAddress();
  const dstStr = event.params.destinationAddress;
  const dstAddress = (0, strings_1.isValidEVMAddress)(dstStr)
    ? graph_ts_1.Address.fromString(dstStr)
    : graph_ts_1.Bytes.fromUTF8(dstStr);
  const bridgePoolType =
    tokenSymbol.tokenType == constants_1.TokenType.EXTERNAL
      ? enums_1.BridgePoolType.LOCK_RELEASE
      : enums_1.BridgePoolType.BURN_MINT;
  const crosschainTokenType =
    tokenSymbol.tokenType == constants_1.TokenType.EXTERNAL
      ? enums_1.CrosschainTokenType.WRAPPED
      : enums_1.CrosschainTokenType.CANONICAL;
  graph_ts_1.log.info("[handleTokenSent]original={},dstAddress={}", [
    event.params.destinationAddress,
    dstAddress.toHexString(),
  ]);
  const customEvent = _createCustomEvent(event);
  _handleTransferOut(
    graph_ts_1.Address.fromString(tokenAddress),
    event.params.sender,
    dstAddress,
    event.params.amount,
    dstChainId,
    poolId,
    dstPoolId,
    bridgePoolType,
    crosschainTokenType,
    customEvent,
    null
  );
}
exports.handleTokenSent = handleTokenSent;
function handleContractCallWithToken(event) {
  const tokenSymbol = getOrCreateTokenSymbol(event.params.symbol);
  const tokenAddress = tokenSymbol.tokenAddress;
  const poolId = event.address.concat(
    graph_ts_1.Address.fromString(tokenAddress)
  );
  const dstChainId = (0, chainIds_1.networkToChainID)(
    event.params.destinationChain.toUpperCase()
  );
  const dstNetworkConstants = (0, constants_1.getNetworkSpecificConstant)(
    dstChainId
  );
  const dstPoolId = dstNetworkConstants.getPoolAddress();
  const dstAccountStr = event.params.destinationContractAddress;
  const dstAccount = (0, strings_1.isValidEVMAddress)(dstAccountStr)
    ? graph_ts_1.Address.fromString(dstAccountStr)
    : graph_ts_1.Bytes.fromUTF8(dstAccountStr);
  const bridgePoolType =
    tokenSymbol.tokenType == constants_1.TokenType.EXTERNAL
      ? enums_1.BridgePoolType.LOCK_RELEASE
      : enums_1.BridgePoolType.BURN_MINT;
  const crosschainTokenType =
    tokenSymbol.tokenType == constants_1.TokenType.EXTERNAL
      ? enums_1.CrosschainTokenType.WRAPPED
      : enums_1.CrosschainTokenType.CANONICAL;
  const customEvent = _createCustomEvent(event);
  const account = _handleTransferOut(
    graph_ts_1.Address.fromString(tokenAddress),
    event.params.sender,
    dstAccount,
    event.params.amount,
    dstChainId,
    poolId,
    dstPoolId,
    bridgePoolType,
    crosschainTokenType,
    customEvent,
    null
  );
  account.messageOut(dstChainId, dstAccount, event.params.payload);
}
exports.handleContractCallWithToken = handleContractCallWithToken;
function handleContractCall(event) {
  // contract call
  const dstChainId = (0, chainIds_1.networkToChainID)(
    event.params.destinationChain.toUpperCase()
  );
  const dstAccountStr = event.params.destinationContractAddress;
  const dstAccount = (0, strings_1.isValidEVMAddress)(dstAccountStr)
    ? graph_ts_1.Address.fromString(dstAccountStr)
    : graph_ts_1.Bytes.fromUTF8(dstAccountStr);
  const customEvent = _createCustomEvent(event);
  _handleMessageOut(
    dstChainId,
    event.params.sender,
    dstAccount,
    event.params.payloadHash,
    customEvent
  );
}
exports.handleContractCall = handleContractCall;
function handleContractCallApproved(event) {
  // contract call
  const srcChainId = (0, chainIds_1.networkToChainID)(
    event.params.sourceChain.toUpperCase()
  );
  const srcStr = event.params.sourceAddress;
  const srcAccount = (0, strings_1.isValidEVMAddress)(srcStr)
    ? graph_ts_1.Address.fromString(srcStr)
    : graph_ts_1.Bytes.fromUTF8(srcStr);
  const customEvent = _createCustomEvent(event);
  _handleMessageIn(
    srcChainId,
    srcAccount,
    event.address,
    event.params.payloadHash,
    customEvent
  );
}
exports.handleContractCallApproved = handleContractCallApproved;
function handleContractCallApprovedWithMint(event) {
  // contract call
  const srcChainId = (0, chainIds_1.networkToChainID)(
    event.params.sourceChain.toUpperCase()
  );
  // this is needed to support transferIn from non-EVM chains
  const srcStr = event.params.sourceAddress;
  const srcAccount = (0, strings_1.isValidEVMAddress)(srcStr)
    ? graph_ts_1.Address.fromString(srcStr)
    : graph_ts_1.Bytes.fromUTF8(srcStr);
  const tokenSymbol = getOrCreateTokenSymbol(event.params.symbol);
  const tokenAddress = tokenSymbol.tokenAddress;
  const poolId = event.address.concat(
    graph_ts_1.Address.fromString(tokenAddress)
  );
  const srcNetworkConstants = (0, constants_1.getNetworkSpecificConstant)(
    srcChainId
  );
  const srcPoolId = srcNetworkConstants.getPoolAddress();
  const bridgePoolType =
    tokenSymbol.tokenType == constants_1.TokenType.EXTERNAL
      ? enums_1.BridgePoolType.LOCK_RELEASE
      : enums_1.BridgePoolType.BURN_MINT;
  const crosschainTokenType =
    tokenSymbol.tokenType == constants_1.TokenType.EXTERNAL
      ? enums_1.CrosschainTokenType.WRAPPED
      : enums_1.CrosschainTokenType.CANONICAL;
  const customEvent = _createCustomEvent(event);
  const account = _handleTransferIn(
    graph_ts_1.Address.fromString(tokenAddress),
    srcAccount,
    event.params.contractAddress,
    event.params.amount,
    srcChainId,
    srcPoolId,
    poolId,
    bridgePoolType,
    crosschainTokenType,
    customEvent,
    event.params.commandId
  );
  account.messageIn(srcChainId, srcAccount, event.params.payloadHash);
}
exports.handleContractCallApprovedWithMint = handleContractCallApprovedWithMint;
function handleCommandExecuted(event) {
  graph_ts_1.log.info("[handleCommandExecuted]commandId={} tx {} logIndex={}", [
    event.params.commandId.toHexString(),
    event.transaction.hash.toHexString(),
    event.transactionLogIndex.toString(),
  ]);
  // command is one of deployToken, mintToken, approveContractCall, approveContractCallWithMint,
  // burnToken or transferOperatorship
  // https://github.com/axelarnetwork/axelar-cgp-solidity/blob/2a24602fdad6d3aa80f4e43cacfe7241adbb905e/contracts/AxelarGateway.sol#L308-L319
  // We only interest in mintToken and burnToken, we detect those events
  // by searching the log receipt for Transfer event
  const receipt = event.receipt;
  if (!receipt) {
    graph_ts_1.log.error("[handleCommandExecuted]No receipt for tx {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
  const transferSignature = graph_ts_1.crypto.keccak256(
    graph_ts_1.ByteArray.fromUTF8(constants_1.TRANSFER)
  );
  const commandId = event.params.commandId;
  let command = schema_1._Command.load(commandId);
  if (!command) {
    command = new schema_1._Command(commandId);
    command.isBurnToken = false;
    command.isProcessed = false;
    command.save();
  }
  const logs = event.receipt.logs;
  //Transfer has a logIndex that's one below event.logIndex
  const transferLogIndex = event.logIndex.minus(constants_1.BIGINT_ONE);
  for (let i = 0; i < logs.length; i++) {
    const thisLog = logs[i];
    if (thisLog.logIndex.gt(transferLogIndex)) {
      return;
    }
    // topics[0] - signature
    // topics[1] - from address
    // topics[2] - to address
    const logSignature = thisLog.topics[0];
    if (
      transferLogIndex.equals(thisLog.logIndex) &&
      logSignature == transferSignature
    ) {
      const tokenAddress = thisLog.address;
      const fromAddress = graph_ts_1.ethereum
        .decode(constants_1.ADDRESS, thisLog.topics[1])
        .toAddress();
      const toAddress = graph_ts_1.ethereum
        .decode(constants_1.ADDRESS, thisLog.topics[2])
        .toAddress();
      const transferAmount = graph_ts_1.ethereum
        .decode(constants_1.UINT256, thisLog.data)
        .toBigInt();
      // burnToken: transfer to 0x or address(this)
      if (
        toAddress.equals(graph_ts_1.Address.zero()) ||
        toAddress.equals(event.address)
      ) {
        graph_ts_1.log.info(
          "[handleCommandExecuted] burn {} {} token from {} tx={}-{}",
          [
            transferAmount.toString(),
            tokenAddress.toHexString(),
            fromAddress.toHexString(),
            thisLog.transactionHash.toHexString(),
            thisLog.logIndex.toString(),
          ]
        );
        _handleBurnToken(
          commandId,
          tokenAddress,
          fromAddress,
          transferAmount,
          event
        );
        break;
      }
      // mintToken: transfer from 0x or address(this)
      if (
        fromAddress.equals(graph_ts_1.Address.zero()) ||
        fromAddress.equals(event.address)
      ) {
        graph_ts_1.log.info(
          "[handleCommandExecuted] mint {} {} token to {} tx={}-{}",
          [
            transferAmount.toString(),
            tokenAddress.toHexString(),
            toAddress.toHexString(),
            thisLog.transactionHash.toHexString(),
            thisLog.logIndex.toString(),
          ]
        );
        _handleMintToken(
          commandId,
          tokenAddress,
          toAddress,
          transferAmount,
          event
        );
        break;
      }
    }
  }
}
exports.handleCommandExecuted = handleCommandExecuted;
function handleGasPaidForContractCall(event) {
  const customEvent = _createCustomEvent(event);
  _handleFees(event.params.gasToken, event.params.gasFeeAmount, customEvent);
}
exports.handleGasPaidForContractCall = handleGasPaidForContractCall;
function handleGasPaidForContractCallWithToken(event) {
  const customEvent = _createCustomEvent(event);
  _handleFees(event.params.gasToken, event.params.gasFeeAmount, customEvent);
}
exports.handleGasPaidForContractCallWithToken =
  handleGasPaidForContractCallWithToken;
function handleNativeGasPaidForContractCall(event) {
  const customEvent = _createCustomEvent(event);
  _handleFees(
    (0, constants_1.getNetworkSpecificConstant)().gasFeeToken,
    event.params.gasFeeAmount,
    customEvent
  );
}
exports.handleNativeGasPaidForContractCall = handleNativeGasPaidForContractCall;
function handleNativeGasPaidForContractCallWithToken(event) {
  const customEvent = _createCustomEvent(event);
  _handleFees(
    (0, constants_1.getNetworkSpecificConstant)().gasFeeToken,
    event.params.gasFeeAmount,
    customEvent
  );
}
exports.handleNativeGasPaidForContractCallWithToken =
  handleNativeGasPaidForContractCallWithToken;
function handleGasAdded(event) {
  const customEvent = _createCustomEvent(event);
  _handleFees(event.params.gasToken, event.params.gasFeeAmount, customEvent);
}
exports.handleGasAdded = handleGasAdded;
function handleNativeGasAdded(event) {
  const customEvent = _createCustomEvent(event);
  _handleFees(
    (0, constants_1.getNetworkSpecificConstant)().gasFeeToken,
    event.params.gasFeeAmount,
    customEvent
  );
}
exports.handleNativeGasAdded = handleNativeGasAdded;
function handleFeeRefund(call) {
  let tokenAddress = call.inputs.token;
  if (tokenAddress.equals(graph_ts_1.Address.zero())) {
    tokenAddress = (0, constants_1.getNetworkSpecificConstant)().gasFeeToken;
  }
  const customEvent = _createCustomEvent(null, call);
  _handleFees(
    tokenAddress,
    call.inputs.amount.times(constants_1.BIGINT_MINUS_ONE),
    customEvent
  );
}
exports.handleFeeRefund = handleFeeRefund;
//////////////////////////////// HELPER FUNCTIONS //////////////////////////////
function _handleTransferOut(
  token,
  sender,
  receiver,
  amount,
  dstChainId,
  poolId,
  dstPoolId,
  bridgePoolType,
  crosschainTokenType,
  customEvent,
  refId = null
) {
  const sdk = _getSDK(customEvent);
  const inputToken = sdk.Tokens.getOrCreateToken(token);
  const pool = sdk.Pools.loadPool(
    poolId,
    onCreatePool,
    bridgePoolType,
    inputToken.id.toHexString()
  );
  const crossToken = sdk.Tokens.getOrCreateCrosschainToken(
    dstChainId,
    dstPoolId,
    crosschainTokenType,
    token
  );
  pool.addDestinationToken(crossToken);
  const acc = sdk.Accounts.loadAccount(sender);
  const transfer = acc.transferOut(
    pool,
    pool.getDestinationTokenRoute(crossToken),
    receiver,
    amount,
    customEvent.transaction.hash
  );
  if (refId) {
    transfer._refId = refId;
    transfer.save();
  }
  return acc;
}
function _handleTransferIn(
  token,
  sender,
  receiver,
  amount,
  srcChainId,
  srcPoolId,
  poolId,
  bridgePoolType,
  crosschainTokenType,
  customEvent,
  refId = null
) {
  const sdk = _getSDK(customEvent);
  const pool = sdk.Pools.loadPool(
    poolId,
    onCreatePool,
    bridgePoolType,
    token.toHexString()
  );
  const crossToken = sdk.Tokens.getOrCreateCrosschainToken(
    srcChainId,
    srcPoolId,
    crosschainTokenType,
    token
  );
  pool.addDestinationToken(crossToken);
  const acc = sdk.Accounts.loadAccount(receiver);
  const transfer = acc.transferIn(
    pool,
    pool.getDestinationTokenRoute(crossToken),
    sender,
    amount,
    customEvent.transaction.hash
  );
  if (refId) {
    transfer._refId = refId;
    transfer.save();
  }
  return acc;
}
function _handleMintToken(commandId, tokenAddress, account, amount, event) {
  const receiver = account;
  const poolAddress = event.address;
  const poolId = poolAddress.concat(tokenAddress);
  const tokenType = getTokenType(tokenAddress);
  const bridgePoolType =
    tokenType == constants_1.TokenType.EXTERNAL
      ? enums_1.BridgePoolType.LOCK_RELEASE
      : enums_1.BridgePoolType.BURN_MINT;
  const crosschainTokenType =
    tokenType == constants_1.TokenType.EXTERNAL
      ? enums_1.CrosschainTokenType.WRAPPED
      : enums_1.CrosschainTokenType.CANONICAL;
  const srcChainId = (0, chainIds_1.networkToChainID)(
    constants_1.Network.UNKNOWN_NETWORK
  );
  const srcPoolId = graph_ts_1.Address.zero(); // Not available
  const sender = receiver; //Not available, assumed to be the same as receiver
  const customEvent = _createCustomEvent(event);
  _handleTransferIn(
    tokenAddress,
    sender,
    receiver,
    amount,
    srcChainId,
    srcPoolId,
    poolId,
    bridgePoolType,
    crosschainTokenType,
    customEvent,
    commandId
  );
}
function _handleBurnToken(commandId, tokenAddress, account, amount, event) {
  const sender = account;
  const poolAddress = event.address;
  const poolId = poolAddress.concat(tokenAddress);
  const tokenType = getTokenType(tokenAddress);
  const bridgePoolType =
    tokenType == constants_1.TokenType.EXTERNAL
      ? enums_1.BridgePoolType.LOCK_RELEASE
      : enums_1.BridgePoolType.BURN_MINT;
  const crosschainTokenType =
    tokenType == constants_1.TokenType.EXTERNAL
      ? enums_1.CrosschainTokenType.WRAPPED
      : enums_1.CrosschainTokenType.CANONICAL;
  const dstChainId = (0, chainIds_1.networkToChainID)(
    constants_1.Network.UNKNOWN_NETWORK
  );
  const dstPoolId = graph_ts_1.Address.zero(); // Not available
  const receiver = sender; //Not available, assumed to be the same as sender
  const customEvent = _createCustomEvent(event);
  _handleTransferOut(
    graph_ts_1.Address.fromBytes(tokenAddress),
    sender,
    receiver,
    amount,
    dstChainId,
    poolId,
    dstPoolId,
    bridgePoolType,
    crosschainTokenType,
    customEvent,
    commandId
  );
}
function _handleFees(tokenAddress, feeAmount, customEvent) {
  const sdk = _getSDK(customEvent);
  const poolAddress = (0,
  constants_1.getNetworkSpecificConstant)().getPoolAddress();
  const poolId = poolAddress.concat(tokenAddress);
  const inputToken = sdk.Tokens.getOrCreateToken(tokenAddress);
  const pool = sdk.Pools.loadPool(
    poolId,
    onCreatePool,
    enums_1.BridgePoolType.BURN_MINT,
    inputToken.id.toHexString()
  );
  pool.addRevenueNative(feeAmount, constants_1.BIGINT_ZERO);
}
function _handleMessageIn(srcChainId, sender, receiver, data, customeEvent) {
  // see doc in _handleMessageOut
  const sdk = _getSDK(customeEvent);
  const acc = sdk.Accounts.loadAccount(receiver);
  acc.messageIn(srcChainId, sender, data);
}
function _handleMessageOut(dstChainId, sender, receiver, data, customEvent) {
  const sdk = _getSDK(customEvent);
  const acc = sdk.Accounts.loadAccount(sender);
  acc.messageOut(dstChainId, receiver, data);
}
/**
 * get or create an TokenSymbol entity; if the entry is new, either `tokenAddress`
 * or `contractAddress` param needs to be provided
 *
 * @param symbol token symbol
 * @param tokenAddress token address
 * @param contractAddress address of AxelarGatewayMultiSig contract
 *
 */
function getOrCreateTokenSymbol(symbol, tokenAddress = null, tokenType = null) {
  let tokenSymbol = schema_1._TokenSymbol.load(symbol);
  if (!tokenSymbol) {
    tokenSymbol = new schema_1._TokenSymbol(symbol);
    tokenSymbol.tokenAddress = tokenAddress;
    tokenSymbol.tokenType = tokenType;
    tokenSymbol.save();
  }
  return tokenSymbol;
}
function getTokenType(tokenAddress) {
  const internalERC20Contract =
    BurnableMintableCappedERC20_1.BurnableMintableCappedERC20.bind(
      tokenAddress
    );
  const depositAddressResult = internalERC20Contract.try_depositAddress(
    graph_ts_1.Bytes.empty()
  );
  let tokenType = constants_1.TokenType.INTERNAL;
  if (depositAddressResult.reverted) {
    tokenType = constants_1.TokenType.EXTERNAL;
  }
  return tokenType;
}
function bytesToUnsignedBigInt(bytes, bigEndian = true) {
  // Caution: this function changes the input bytes for bigEndian
  return graph_ts_1.BigInt.fromUnsignedBytes(
    bigEndian ? graph_ts_1.Bytes.fromUint8Array(bytes.reverse()) : bytes
  );
}
exports.bytesToUnsignedBigInt = bytesToUnsignedBigInt;
function bytes32ToAddress(bytes) {
  //take the last 40 hexstring & convert it to address (20 bytes)
  const address = bytes32ToAddressHexString(bytes);
  return graph_ts_1.Address.fromString(address);
}
exports.bytes32ToAddress = bytes32ToAddress;
function bytes32ToAddressHexString(bytes) {
  //take the last 40 hexstring: 0x + 32 bytes/64 hex characters
  return `0x${bytes
    .toHexString()
    .slice(constants_1.INT_TWENTY_SIX)
    .toLowerCase()}`;
}
exports.bytes32ToAddressHexString = bytes32ToAddressHexString;
function getTxId(event, call = null) {
  if (event) {
    return event.transaction.hash.concatI32(event.transactionLogIndex.toI32());
  }
  if (call) {
    return call.transaction.hash.concatI32(call.transaction.index.toI32());
  }
  return null;
}
exports.getTxId = getTxId;
