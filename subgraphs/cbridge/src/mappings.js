"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeWithdrawMsg =
  exports.WithdrawMsg =
  exports.handleMessageBusFeeWithdraw =
  exports.handleExecuteMessage2 =
  exports.handleExecuteMessage =
  exports.handlerMessageExecuted =
  exports.handleMessageWithTransfer =
  exports.handleMessage =
  exports.handleMessage2 =
  exports.handlePTBv2Burn =
  exports.handleFarmingRewardClaimed =
  exports.handlePTBv2Mint =
  exports.handlePTBBurn =
  exports.handlePTBMint =
  exports.handleOTVv2Withdrawn =
  exports.handleOTVv2Deposited =
  exports.handleOTVWithdrawn =
  exports.handleOTVDeposited =
  exports.handleRelay =
  exports.handleWithdrawCall =
  exports.handleWithdrawEvent =
  exports.handleLiquidityAdded =
  exports.handleSend =
  exports.onCreatePool =
  exports.handlePairCreated =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const bridge_1 = require("./sdk/protocols/bridge");
const enums_1 = require("./sdk/protocols/bridge/enums");
const config_1 = require("./sdk/protocols/bridge/config");
const _ERC20_1 = require("../generated/PoolBasedBridge/_ERC20");
const ERC20NameBytes_1 = require("../generated/PoolBasedBridge/ERC20NameBytes");
const ERC20SymbolBytes_1 = require("../generated/PoolBasedBridge/ERC20SymbolBytes");
const versions_1 = require("./versions");
const schema_1 = require("../generated/schema");
const numbers_1 = require("./sdk/util/numbers");
const prices_1 = require("./prices");
const chainIds_1 = require("./sdk/protocols/bridge/chainIds");
const constants_1 = require("./sdk/util/constants");
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
    const decimalsResult = erc20.try_decimals();
    let decimals = 18;
    if (!decimalsResult.reverted) {
      decimals = decimalsResult.value.toI32();
    } else {
      graph_ts_1.log.warning(
        "[getTokenParams]token {} decimals() call reverted; default to 18 decimals",
        [address.toHexString()]
      );
    }
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
          "[getTokenParams]Fail to get name for token {}; default to 'Unknown Token'",
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
          "[getTokenParams]Fail to get symbol for token {}; default to 'Unknown'",
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
    customEvent = bridge_1.CustomEventType.initialize(
      event.block,
      event.transaction,
      event.transactionLogIndex,
      event.address,
      event
    );
  } else if (call) {
    customEvent = bridge_1.CustomEventType.initialize(
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
    "cBridge",
    "cbridge",
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
      `Pool-based Bridge: ${token.name}`,
      token.name,
      aux1,
      token
    );
    // append pool id to protocol._liquidityPoolIDs
    const protocol = sdk.Protocol.protocol;
    let poolIDs = protocol._liquidityPoolIDs;
    if (!poolIDs) {
      poolIDs = [pool.getBytesID()];
    } else {
      poolIDs.push(pool.getBytesID());
    }
    protocol._liquidityPoolIDs = poolIDs;
    protocol.save();
  }
}
exports.onCreatePool = onCreatePool;
function handleSend(event) {
  const poolId = event.address.concat(event.params.token);
  const networkConstants = (0, constants_1.getNetworkSpecificConstant)(
    event.params.dstChainId
  );
  const dstPoolId = networkConstants.getPoolAddress(
    constants_1.PoolName.PoolBasedBridge
  );
  _handleTransferOut(
    event.params.token,
    event.params.sender,
    event.params.receiver,
    event.params.amount,
    event.params.dstChainId,
    poolId,
    dstPoolId,
    enums_1.BridgePoolType.LIQUIDITY,
    enums_1.CrosschainTokenType.CANONICAL,
    event,
    event.params.transferId
  );
  let refund = schema_1._Refund.load(event.params.transferId);
  if (!refund) {
    refund = new schema_1._Refund(event.params.transferId);
    refund.sender = event.params.sender.toHexString();
    refund.save();
  }
}
exports.handleSend = handleSend;
function handleLiquidityAdded(event) {
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.critical(
      "[handleLiquidityAdded]customeEvent cannot be null",
      []
    );
    return;
  }
  const sdk = _getSDK(customEvent);
  const pool = sdk.Pools.loadPool(
    event.address.concat(event.params.token),
    onCreatePool,
    enums_1.BridgePoolType.LIQUIDITY,
    event.params.token.toHexString()
  );
  const acc = sdk.Accounts.loadAccount(event.params.provider);
  acc.liquidityDeposit(pool, event.params.amount, true);
}
exports.handleLiquidityAdded = handleLiquidityAdded;
function handleWithdrawEvent(event) {
  const wdmsg = new WithdrawMsg(
    (0, chainIds_1.networkToChainID)(constants_1.Network.UNKNOWN_NETWORK),
    event.params.seqnum,
    event.params.receiver,
    event.params.token,
    event.params.amount,
    event.params.refid
  );
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.error(
      "[handleWithdrawEvent]customeEvent cannot be null",
      []
    );
    return;
  }
  _handleWithdraw(wdmsg, customEvent);
}
exports.handleWithdrawEvent = handleWithdrawEvent;
function handleWithdrawCall(call) {
  const buf = call.inputs._wdmsg;
  const wdmsg = decodeWithdrawMsg(buf);
  const customEvent = _createCustomEvent(null, call);
  if (!customEvent) {
    graph_ts_1.log.error("[handleWithdrawCall]customeEvent cannot be null", []);
    return;
  }
  _handleWithdraw(wdmsg, customEvent);
}
exports.handleWithdrawCall = handleWithdrawCall;
function _handleWithdraw(wdmsg, customEvent) {
  const poolId = customEvent.address.concat(wdmsg.token);
  const sdk = _getSDK(customEvent);
  const pool = sdk.Pools.loadPool(
    poolId,
    onCreatePool,
    enums_1.BridgePoolType.LIQUIDITY,
    wdmsg.token.toHexString()
  );
  const bridgePoolType = enums_1.BridgePoolType.LIQUIDITY;
  const txId = customEvent.transaction.hash.concatI32(
    customEvent.logIndex.toI32()
  );
  const refund = schema_1._Refund.load(wdmsg.refId);
  const tx = customEvent.transaction.hash
    .toHexString()
    .concat("-")
    .concat(customEvent.logIndex.toString());
  graph_ts_1.log.info(
    "[handleWithdraw]token={} refId={} amount={} tx={} block={}",
    [
      wdmsg.token.toHexString(),
      wdmsg.refId.toHexString(),
      wdmsg.amount.toString(),
      tx,
      customEvent.block.number.toString(),
    ]
  );
  if (wdmsg.refId.equals(graph_ts_1.Bytes.empty())) {
    // LP withdraw liquidity: refId == 0x0
    const acc = sdk.Accounts.loadAccount(wdmsg.receiver);
    acc.liquidityWithdraw(pool, wdmsg.amount, true);
  } else if (
    wdmsg.refId.equals(
      graph_ts_1.Bytes.fromHexString(
        "0x0000000000000000000000000000000000000000000000000000000000000001"
      )
    )
  ) {
    // claim fee (liquidity provider): refId == 0x1
    // Assume fees are divided evenly (50%-50%) between protocol and supply
    const feeAmount = wdmsg.amount.div(constants_1.BIGINT_TWO);
    pool.addRevenueNative(feeAmount, feeAmount);
  } else if (refund) {
    // refund, refId==xfer_id
    // refund is handled with a "transferIn"
    const srcChainId = (0, chainIds_1.networkToChainID)(
      graph_ts_1.dataSource.network()
    );
    const networkConstants = (0, constants_1.getNetworkSpecificConstant)(
      srcChainId
    );
    const srcPoolAddress = networkConstants.getPoolAddress(
      constants_1.PoolName.PoolBasedBridge
    );
    _handleTransferIn(
      wdmsg.token,
      graph_ts_1.Address.fromString(refund.sender),
      wdmsg.receiver,
      wdmsg.amount,
      srcChainId,
      srcPoolAddress,
      pool.getBytesID(),
      bridgePoolType,
      enums_1.CrosschainTokenType.CANONICAL,
      customEvent,
      wdmsg.refId,
      txId
    );
  } else {
    const networkConstants = (0, constants_1.getNetworkSpecificConstant)(
      wdmsg.chainId
    );
    const srcPoolAddress = networkConstants.getPoolAddress(
      constants_1.PoolName.PoolBasedBridge
    );
    _handleTransferIn(
      wdmsg.token,
      wdmsg.receiver,
      wdmsg.receiver,
      wdmsg.amount,
      wdmsg.chainId,
      srcPoolAddress,
      pool.getBytesID(),
      bridgePoolType,
      enums_1.CrosschainTokenType.CANONICAL,
      customEvent,
      wdmsg.refId,
      txId
    );
  }
}
function handleRelay(event) {
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.error("[handleRelay]customeEvent cannot be null", []);
    return;
  }
  const sdk = _getSDK(customEvent);
  const pool = sdk.Pools.loadPool(
    event.address.concat(event.params.token),
    onCreatePool,
    enums_1.BridgePoolType.LIQUIDITY,
    event.params.token.toHexString()
  );
  const txId = event.transaction.hash.concatI32(
    event.transaction.index.toI32()
  );
  const networkConstants = (0, constants_1.getNetworkSpecificConstant)(
    event.params.srcChainId
  );
  const srcPoolAddress = networkConstants.getPoolAddress(
    constants_1.PoolName.PoolBasedBridge
  );
  const bridgePoolType = enums_1.BridgePoolType.LIQUIDITY;
  _handleTransferIn(
    event.params.token,
    event.params.sender,
    event.params.receiver,
    event.params.amount,
    event.params.srcChainId,
    srcPoolAddress,
    pool.getBytesID(),
    bridgePoolType,
    enums_1.CrosschainTokenType.CANONICAL,
    customEvent,
    event.params.srcTransferId,
    txId
  );
}
exports.handleRelay = handleRelay;
// Bridge via the Original Token Vault
function handleOTVDeposited(event) {
  const poolId = event.address.concat(event.params.token);
  const networkConstants = (0, constants_1.getNetworkSpecificConstant)(
    event.params.mintChainId
  );
  const dstPoolId = networkConstants.getPoolAddress(
    constants_1.PoolName.PeggedTokenBridge
  );
  _handleTransferOut(
    event.params.token,
    event.params.depositor,
    event.params.mintAccount,
    event.params.amount,
    event.params.mintChainId,
    poolId,
    dstPoolId,
    enums_1.BridgePoolType.LOCK_RELEASE,
    enums_1.CrosschainTokenType.WRAPPED,
    event,
    event.params.depositId
  );
  let refund = schema_1._Refund.load(event.params.depositId);
  if (!refund) {
    refund = new schema_1._Refund(event.params.depositId);
    refund.sender = event.params.depositor.toHexString();
    refund.save();
  }
}
exports.handleOTVDeposited = handleOTVDeposited;
function handleOTVWithdrawn(event) {
  _handleOTVWithdrawn(
    event.params.token,
    event.params.burnAccount,
    event.params.receiver,
    event.params.amount,
    event.params.refChainId,
    event.params.refId,
    event
  );
}
exports.handleOTVWithdrawn = handleOTVWithdrawn;
// Bridge via the Original Token Vault V2
function handleOTVv2Deposited(event) {
  const poolId = event.address.concat(event.params.token);
  const networkConstants = (0, constants_1.getNetworkSpecificConstant)(
    event.params.mintChainId
  );
  const dstPoolId = networkConstants.getPoolAddress(
    constants_1.PoolName.PeggedTokenBridgeV2
  );
  _handleTransferOut(
    event.params.token,
    event.params.depositor,
    event.params.mintAccount,
    event.params.amount,
    event.params.mintChainId,
    poolId,
    dstPoolId,
    enums_1.BridgePoolType.LOCK_RELEASE,
    enums_1.CrosschainTokenType.WRAPPED,
    event,
    event.params.depositId
  );
  let refund = schema_1._Refund.load(event.params.depositId);
  if (!refund) {
    refund = new schema_1._Refund(event.params.depositId);
    refund.sender = event.params.depositor.toHexString();
    refund.save();
  }
}
exports.handleOTVv2Deposited = handleOTVv2Deposited;
function handleOTVv2Withdrawn(event) {
  _handleOTVWithdrawn(
    event.params.token,
    event.params.burnAccount,
    event.params.receiver,
    event.params.amount,
    event.params.refChainId,
    event.params.refId,
    event
  );
}
exports.handleOTVv2Withdrawn = handleOTVv2Withdrawn;
// Pegged Token Bridge V1
function handlePTBMint(event) {
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.error("[handleRelay]customeEvent cannot be null", []);
    return;
  }
  const poolId = event.address.concat(event.params.token);
  const networkConstants = (0, constants_1.getNetworkSpecificConstant)(
    event.params.refChainId
  );
  const srcPoolAddress = networkConstants.getPoolAddress(
    constants_1.PoolName.OriginalTokenVault
  );
  const txId = event.transaction.hash.concatI32(event.logIndex.toI32());
  _handleTransferIn(
    event.params.token,
    event.params.depositor,
    event.params.account,
    event.params.amount,
    event.params.refChainId,
    srcPoolAddress,
    poolId,
    enums_1.BridgePoolType.BURN_MINT,
    enums_1.CrosschainTokenType.WRAPPED,
    customEvent,
    event.params.refId,
    txId
  );
  const ptb = new schema_1._PTBv1(event.params.token);
  ptb.srcChainId = event.params.refChainId;
  ptb.refId = event.params.refId;
  ptb.save();
}
exports.handlePTBMint = handlePTBMint;
// Pegged Token Bridge V1
function handlePTBBurn(event) {
  const ptb = schema_1._PTBv1.load(event.params.token);
  if (!ptb) {
    graph_ts_1.log.error(
      "[handlePTBBurn]No entry found for token {} in _PTBv1; it is needed for finding destination chain",
      []
    );
    return;
  }
  const poolId = event.address.concat(event.params.token);
  const networkConstants = (0, constants_1.getNetworkSpecificConstant)(
    ptb.srcChainId
  );
  const dstPoolId = networkConstants.getPoolAddress(
    constants_1.PoolName.OriginalTokenVault
  );
  _handleTransferOut(
    event.params.token,
    event.params.account,
    event.params.withdrawAccount,
    event.params.amount,
    ptb.srcChainId,
    poolId,
    dstPoolId,
    enums_1.BridgePoolType.BURN_MINT,
    enums_1.CrosschainTokenType.WRAPPED,
    event,
    event.params.burnId
  );
}
exports.handlePTBBurn = handlePTBBurn;
function handlePTBv2Mint(event) {
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.error("[handlePTBv2Mint]customeEvent cannot be null", []);
    return;
  }
  const poolId = event.address.concat(event.params.token);
  const networkConstants = (0, constants_1.getNetworkSpecificConstant)(
    event.params.refChainId
  );
  const srcPoolAddress = networkConstants.getPoolAddress(
    constants_1.PoolName.OriginalTokenVaultV2
  );
  const txId = event.transaction.hash.concatI32(event.logIndex.toI32());
  _handleTransferIn(
    event.params.token,
    event.params.depositor,
    event.params.account,
    event.params.amount,
    event.params.refChainId,
    srcPoolAddress,
    poolId,
    enums_1.BridgePoolType.BURN_MINT,
    enums_1.CrosschainTokenType.WRAPPED,
    customEvent,
    event.params.refId,
    txId
  );
}
exports.handlePTBv2Mint = handlePTBv2Mint;
function handleFarmingRewardClaimed(event) {
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.error(
      "[handleFarmingRewardClaimed]customeEvent cannot be null",
      []
    );
    return;
  }
  const sdk = _getSDK(customEvent);
  const protocol = sdk.Protocol.protocol;
  // average reward emission over the duration in days
  const averageRewardOverDays = 7;
  if (!protocol._lastRewardTimestamp) {
    protocol._lastRewardTimestamp = event.block.timestamp;
    protocol._cumulativeRewardsClaimed = event.params.reward;
    protocol.save();
    return;
  } else if (
    event.block.timestamp <
    protocol._lastRewardTimestamp.plus(
      graph_ts_1.BigInt.fromI32(
        constants_1.SECONDS_PER_DAY * averageRewardOverDays
      )
    )
  ) {
    protocol._cumulativeRewardsClaimed =
      protocol._cumulativeRewardsClaimed.plus(event.params.reward);
    protocol.save();
    return;
  }
  // allocate rewards to pool proportional to tvl
  const rToken = sdk.Tokens.getOrCreateToken(event.params.token);
  const poolIDs = protocol._liquidityPoolIDs;
  // first iteration summing tvl
  let sumTVLUSD = constants_1.BIGDECIMAL_ZERO;
  for (let i = 0; i < poolIDs.length; i++) {
    const pool = sdk.Pools.loadPool(poolIDs[i]).pool;
    sumTVLUSD = sumTVLUSD.plus(pool.totalValueLockedUSD);
  }
  for (let i = 0; i < poolIDs.length; i++) {
    const pool = sdk.Pools.loadPool(poolIDs[i]);
    const poolRewardAmount = (0, numbers_1.bigDecimalToBigInt)(
      pool.pool.totalValueLockedUSD
        .div(sumTVLUSD)
        .times(protocol._cumulativeRewardsClaimed.toBigDecimal())
        .div(graph_ts_1.BigDecimal.fromString(averageRewardOverDays.toString()))
    );
    pool.setRewardEmissions(
      constants_1.RewardTokenType.DEPOSIT,
      rToken,
      poolRewardAmount
    );
  }
  protocol._lastRewardTimestamp = event.block.timestamp;
  protocol._cumulativeRewardsClaimed = constants_1.BIGINT_ZERO;
  protocol.save();
}
exports.handleFarmingRewardClaimed = handleFarmingRewardClaimed;
// Pegged Token Bridge V2
function handlePTBv2Burn(event) {
  const poolId = event.address.concat(event.params.token);
  const networkConstants = (0, constants_1.getNetworkSpecificConstant)(
    event.params.toChainId
  );
  const dstPoolId = networkConstants.getPoolAddress(
    constants_1.PoolName.OriginalTokenVaultV2
  );
  _handleTransferOut(
    event.params.token, //srcToken
    event.params.account,
    event.params.toAccount,
    event.params.amount,
    event.params.toChainId,
    poolId,
    dstPoolId,
    enums_1.BridgePoolType.BURN_MINT,
    enums_1.CrosschainTokenType.WRAPPED,
    event,
    event.params.burnId
  );
}
exports.handlePTBv2Burn = handlePTBv2Burn;
function handleMessage2(event) {
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.error("[handleMessage2]customeEvent cannot be null", []);
    return;
  }
  _handleMessageOut(
    event.params.dstChainId,
    event.params.sender,
    graph_ts_1.Address.fromBytes(event.params.receiver), //this may truncate addresses for non-EVM chain
    event.params.message,
    event.params.fee,
    customEvent
  );
}
exports.handleMessage2 = handleMessage2;
function handleMessage(event) {
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.error("[handleMessage]customeEvent cannot be null", []);
    return;
  }
  _handleMessageOut(
    event.params.dstChainId,
    event.params.sender,
    event.params.receiver,
    event.params.message,
    event.params.fee,
    customEvent
  );
}
exports.handleMessage = handleMessage;
function handleMessageWithTransfer(event) {
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.error(
      "[handleMessageWithTransfer]customeEvent cannot be null",
      []
    );
    return;
  }
  _handleMessageOut(
    event.params.dstChainId,
    event.params.sender,
    event.params.receiver,
    event.params.message,
    event.params.fee,
    customEvent
  );
  // Here we don't need to handle transferOut because another transfer event will be emitted
  // https://github.com/celer-network/sgn-v2-contracts/blob/9ce8ffe13389415a53e2c38838da1b99689d40f0/contracts/message/libraries/MessageSenderLib.sol#L66-L98
}
exports.handleMessageWithTransfer = handleMessageWithTransfer;
function handlerMessageExecuted(event) {
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.critical(
      "[handlerMessageExecuted]customeEvent cannot be null",
      []
    );
    return;
  }
  _handleMessageIn(
    event.params.srcChainId,
    graph_ts_1.Address.zero(), // sender not available from event.params
    event.params.receiver,
    graph_ts_1.Bytes.empty(), // msg data not available from event.params
    customEvent
  );
}
exports.handlerMessageExecuted = handlerMessageExecuted;
function handleExecuteMessage(call) {
  const customEvent = _createCustomEvent(null, call);
  if (!customEvent) {
    graph_ts_1.log.critical(
      "[handleExecuteMessage]customeEvent cannot be null",
      []
    );
    return;
  }
  // See https://github.com/celer-network/sgn-v2-contracts/blob/aa569f848165840bd4eec8134f753e105e36ae38/contracts/message/libraries/MsgDataTypes.sol#L55
  const sender = call.inputs._route.at(0).toAddress();
  const receiver = call.inputs._route.at(1).toAddress();
  const srcChainId = call.inputs._route.at(2).toBigInt();
  const data = call.inputs._message;
  _handleMessageIn(srcChainId, sender, receiver, data, customEvent);
}
exports.handleExecuteMessage = handleExecuteMessage;
// for non-EVM chain where the address may be more than 20 bytes
function handleExecuteMessage2(call) {
  const customEvent = _createCustomEvent(null, call);
  if (!customEvent) {
    graph_ts_1.log.critical(
      "[handleExecuteMessage2]customeEvent cannot be null",
      []
    );
    return;
  }
  // See https://github.com/celer-network/sgn-v2-contracts/blob/aa569f848165840bd4eec8134f753e105e36ae38/contracts/message/libraries/MsgDataTypes.sol#L55
  const sender = call.inputs._route.at(0).toAddress();
  const receiver = call.inputs._route.at(1).toAddress();
  const srcChainId = call.inputs._route.at(3).toBigInt();
  const data = call.inputs._message;
  _handleMessageIn(srcChainId, sender, receiver, data, customEvent);
}
exports.handleExecuteMessage2 = handleExecuteMessage2;
function handleMessageBusFeeWithdraw(event) {
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.error(
      "[handleMessageBusFeeWithdraw]customeEvent cannot be null",
      []
    );
    return;
  }
  const sdk = _getSDK(customEvent);
  // message fees are attributed to the liquidity-based pool for native (gas fee) token
  const networkConstants = (0, constants_1.getNetworkSpecificConstant)();
  const poolId = networkConstants.poolBasedBridge.concat(
    graph_ts_1.Address.fromByteArray(networkConstants.gasFeeToken.id)
  );
  const pool = sdk.Pools.loadPool(poolId);
  pool.addRevenueNative(event.params.amount, constants_1.BIGINT_ZERO);
}
exports.handleMessageBusFeeWithdraw = handleMessageBusFeeWithdraw;
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
  event,
  refId = null
) {
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.error("[_handleTransferOut]customeEvent cannot be null", []);
    return;
  }
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
    event.transaction.hash
  );
  if (refId) {
    transfer._refId = refId;
    transfer.save();
  }
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
  refId = null,
  transactionID = null
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
    transactionID
  );
  if (refId) {
    transfer._refId = refId;
    transfer.save();
  }
}
function _handleOTVWithdrawn(
  token,
  sender,
  receiver,
  amount,
  refChainId,
  refId,
  event
) {
  const customEvent = _createCustomEvent(event);
  if (!customEvent) {
    graph_ts_1.log.error(
      "[_handleOTVWithdrawn]customeEvent cannot be null",
      []
    );
    return;
  }
  const sdk = _getSDK(customEvent);
  const poolId = event.address.concat(token);
  const pool = sdk.Pools.loadPool(poolId);
  const txId = event.transaction.hash.concatI32(event.logIndex.toI32());
  // depending on value of refChainId, the withdraw may be fee withdraw, refund or burn-withdraw
  // https://github.com/celer-network/sgn-v2-contracts/blob/aa569f848165840bd4eec8134f753e105e36ae38/contracts/pegged-bridge/OriginalTokenVault.sol#L45
  // https://github.com/celer-network/sgn-v2-contracts/blob/aa569f848165840bd4eec8134f753e105e36ae38/contracts/pegged-bridge/OriginalTokenVaultV2.sol#L45
  const thisChainId = (0, chainIds_1.networkToChainID)(
    graph_ts_1.dataSource.network()
  );
  if (refChainId == constants_1.BIGINT_ZERO) {
    // fee withdraw
    pool.addRevenueNative(amount, constants_1.BIGINT_ZERO);
    return;
  }
  const refund = schema_1._Refund.load(refId);
  if (refund && refChainId == thisChainId) {
    // refund
    // refund is handled with a counter "transferIn"
    const thisPoolAddress = event.address;
    _handleTransferIn(
      token,
      sender,
      receiver,
      amount,
      thisChainId,
      thisPoolAddress,
      pool.getBytesID(),
      enums_1.BridgePoolType.LOCK_RELEASE,
      enums_1.CrosschainTokenType.CANONICAL,
      customEvent,
      refId,
      txId
    );
    return;
  }
  // burn-withdraw
  const networkConstants = (0, constants_1.getNetworkSpecificConstant)(
    refChainId
  );
  const srcPoolAddress = networkConstants.getPoolAddress(
    constants_1.PoolName.PeggedTokenBridge
  );
  _handleTransferIn(
    token,
    sender,
    receiver,
    amount,
    refChainId,
    srcPoolAddress,
    poolId,
    enums_1.BridgePoolType.BURN_MINT,
    enums_1.CrosschainTokenType.WRAPPED,
    customEvent,
    refId,
    txId
  );
}
function _handleMessageOut(
  dstChainId,
  sender,
  receiver,
  data,
  fee,
  customEvent
) {
  const sdk = _getSDK(customEvent);
  const acc = sdk.Accounts.loadAccount(sender);
  acc.messageOut(dstChainId, receiver, data);
  // Message send/receive on cbridge is not specific to a bridge
  // unless it is sendMessageWithTransfer or executeMessageWithTransfer
  // then in these cases, the transfer is going through the specified bridge
  // (Peg V1/V2, or Liquidity), but even then the message is execuated in a
  // separate step (e.g. https://github.com/celer-network/sgn-v2-contracts/blob/aa569f848165840bd4eec8134f753e105e36ae38/contracts/message/messagebus/MessageBusReceiver.sol#L105)
  // Here we assume all messages are associated with the liquidity-based pool (bridge)
  // because protocol side revenue has to be attributed to a pool, and the liquidity-based
  // bridge is used for signature verification for all messages:
  // 1. messageWithTransfer: https://github.com/celer-network/sgn-v2-contracts/blob/aa569f848165840bd4eec8134f753e105e36ae38/contracts/message/messagebus/MessageBusReceiver.sol#L98
  // 2. executeMessageWithTransferRefund: https://github.com/celer-network/sgn-v2-contracts/blob/aa569f848165840bd4eec8134f753e105e36ae38/contracts/message/messagebus/MessageBusReceiver.sol#L151
  // 3. executeMessage: https://github.com/celer-network/sgn-v2-contracts/blob/aa569f848165840bd4eec8134f753e105e36ae38/contracts/message/messagebus/MessageBusReceiver.sol#L225
  // alternatively, it may make sense to create a "MessageBus" pool, and assign
  // all message revenue to the MessageBus pool, but we still need to specifiy the BridgePoolType
  // for the MessageBus pool
  const gasFeeToken = (0, constants_1.getNetworkSpecificConstant)(
    (0, chainIds_1.networkToChainID)(graph_ts_1.dataSource.network())
  ).gasFeeToken;
  const pool = sdk.Pools.loadPool(
    sdk.Protocol.getBytesID(),
    onCreatePool,
    enums_1.BridgePoolType.LIQUIDITY,
    gasFeeToken.id.toHexString()
  );
  pool.addRevenueNative(fee, constants_1.BIGINT_ZERO);
}
function _handleMessageIn(srcChainId, sender, receiver, data, customeEvent) {
  // see doc in _handleMessageOut
  const sdk = _getSDK(customeEvent);
  const acc = sdk.Accounts.loadAccount(receiver);
  acc.messageIn(srcChainId, sender, data);
}
class WithdrawMsg {
  constructor(chainId, seqnum, receiver, token, amount, refId) {
    this.chainId = chainId;
    this.seqnum = seqnum;
    this.receiver = receiver;
    this.token = token;
    this.amount = amount;
    this.refId = refId;
  }
}
exports.WithdrawMsg = WithdrawMsg;
// These functions implement decWithdrawMsg in PbPool.sol (and its dependencies)
// https://github.com/celer-network/sgn-v2-contracts/blob/aa569f848165840bd4eec8134f753e105e36ae38/contracts/libraries/PbPool.sol#L20-L45
function decodeWithdrawMsg(buf) {
  const wdmsg = new WithdrawMsg(
    constants_1.BIGINT_ZERO,
    constants_1.BIGINT_ZERO,
    graph_ts_1.Address.zero(),
    graph_ts_1.Address.zero(),
    constants_1.BIGINT_ZERO,
    graph_ts_1.Bytes.empty()
  );
  let idx = 0;
  while (idx < buf.length) {
    const decoded = decodeKey(buf, idx);
    const tag = decoded[0]; // attribute position in WithdrawMsg
    const wireType = decoded[1];
    idx = decoded[2];
    graph_ts_1.log.info("[decodeWithdrawMsg]idx={},tag={},wireType={}", [
      idx.toString(),
      tag.toString(),
      wireType.toString(),
    ]);
    let retBigInt;
    let retBytes;
    switch (tag) {
      case 1:
        retBigInt = decodeVarInt(buf, idx);
        wdmsg.chainId = retBigInt[0];
        idx = retBigInt[1].toI32();
        break;
      case 2:
        retBigInt = decodeVarInt(buf, idx);
        wdmsg.seqnum = retBigInt[0];
        idx = retBigInt[1].toI32();
        break;
      case 3:
        retBytes = decodeBytes(buf, idx);
        wdmsg.receiver = graph_ts_1.Address.fromBytes(retBytes[0]);
        idx = retBytes[1].toI32();
        break;
      case 4:
        retBytes = decodeBytes(buf, idx);
        wdmsg.token = graph_ts_1.Address.fromBytes(retBytes[0]);
        idx = retBytes[1].toI32();
        break;
      case 5:
        retBytes = decodeBytes(buf, idx);
        wdmsg.amount = toBigInt(retBytes[0]);
        idx = retBytes[1].toI32();
        break;
      case 6:
        retBytes = decodeBytes(buf, idx);
        wdmsg.refId = retBytes[0];
        idx = retBytes[1].toI32();
        break;
      default:
        idx = skipValue(buf, idx, wireType);
    }
  }
  return wdmsg;
} // end decoder WithdrawMsg
exports.decodeWithdrawMsg = decodeWithdrawMsg;
function decodeKey(buf, idx) {
  const result = decodeVarInt(buf, idx);
  const v = result[0].toI32();
  const tag = v / 8;
  const wiretype = v & 7;
  return [tag, wiretype, result[1].toI32()];
}
// decode varying length integer
function decodeVarInt(buf, idx) {
  const tmpArray = new Uint8Array(10); // proto int is at most 10 bytes (7 bits can be used per byte)
  tmpArray.set(buf.slice(idx, idx + 10)); // load 10 bytes from buf[idx, idx+10] to tmp
  let b; // store current byte content
  let v = 0; // reset to 0 for return value
  let endIdx = idx;
  for (let i = 0; i < 10; i++) {
    b = tmpArray[i]; // don't use tmp[i] because it does bound check and costs extra
    v |= (b & 0x7f) << (i * 7);
    if ((b & 0x80) == 0) {
      endIdx += i + 1;
      graph_ts_1.log.info("[decodeVarInt]idx={},next={},result={}", [
        idx.toString(),
        endIdx.toString(),
        v.toString(),
      ]);
      return [graph_ts_1.BigInt.fromI32(v), graph_ts_1.BigInt.fromI32(endIdx)];
    }
  }
  throw new Error("Invalid varint stream"); // i=10, invalid varint stream
}
// decode bytes
function decodeBytes(buf, idx) {
  const retVal = decodeVarInt(buf, idx);
  const len = retVal[0].toI32();
  const endIdx = retVal[1].toI32() + len;
  if (endIdx > buf.length) {
    graph_ts_1.log.error("[decodeBytes]Error: endIdx {} > buf length {}", [
      endIdx.toString(),
      buf.length.toString(),
    ]);
    return null;
  }
  const tmpArray = new Uint8Array(len);
  const nextIdx = retVal[1].toI32();
  tmpArray.set(buf.slice(nextIdx, endIdx));
  const resultBytes = graph_ts_1.Bytes.fromUint8Array(tmpArray);
  graph_ts_1.log.info("[decodeBytes]idx={},next={},result={}", [
    idx.toString(),
    endIdx.toString(),
    resultBytes.toHexString(),
  ]);
  return [resultBytes, graph_ts_1.Bytes.fromI32(endIdx)];
}
function skipValue(buf, idx, wireType) {
  // WireType definition:
  if (wireType == 0) {
    // WireType.Varint
    const retVal = decodeVarInt(buf, idx);
    return retVal[1].toI32();
  } else if (wireType == 2) {
    //WireType.LengthDelim
    const retVal = decodeVarInt(buf, idx);
    const nextIdx = retVal[1].toI32() + retVal[0].toI32(); // skip len bytes value data
    if (nextIdx <= buf.length) {
      return nextIdx;
    }
  }
  // invalid wire type/inputs
  graph_ts_1.log.error(
    "[skipValue]invalid inputs: buf={}, idx={}, wireType={}",
    [buf.toHexString(), idx.toString(), wireType.toString()]
  );
  return 0;
}
function toBigInt(b) {
  if (b.length > 32) {
    graph_ts_1.log.error("[toBigInt]Invalid input length {}", [
      b.length.toString(),
    ]);
    return null;
  }
  const paddedByteString = `0x${b.toHexString().slice(2).padStart(32, "0")}`;
  // reverse() for little endian
  const correctBytes = graph_ts_1.Bytes.fromUint8Array(
    graph_ts_1.Bytes.fromHexString(paddedByteString).reverse()
  );
  const retVal = graph_ts_1.BigInt.fromUnsignedBytes(correctBytes);
  return retVal;
}
