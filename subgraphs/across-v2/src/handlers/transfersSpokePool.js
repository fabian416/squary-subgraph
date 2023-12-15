"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFundsDepositedSpokePool1 =
  exports.handleFundsDepositedSpokePool2 =
  exports.handleFilledRelaySpokePool1 =
  exports.handleFilledRelaySpokePool2 =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const numbers_1 = require("../sdk/util/numbers");
const util_1 = require("../util");
const prices_1 = require("../prices");
const availableRoutesApi_1 = require("../availableRoutesApi");
const bridge_1 = require("../sdk/protocols/bridge");
const enums_1 = require("../sdk/protocols/bridge/enums");
const SpokePool1_1 = require("../../generated/SpokePool1/SpokePool1");
const chainIds_1 = require("../sdk/protocols/bridge/chainIds");
const constants_1 = require("../sdk/util/constants");
function handleFilledRelaySpokePool2(event) {
  // build params
  const amount = new graph_ts_1.ethereum.EventParam(
    "amount",
    event.parameters[0].value
  );
  const totalFilledAmount = new graph_ts_1.ethereum.EventParam(
    "totalFilledAmount",
    event.parameters[1].value
  );
  const fillAmount = new graph_ts_1.ethereum.EventParam(
    "fillAmount",
    event.parameters[2].value
  );
  const repaymentChainId = new graph_ts_1.ethereum.EventParam(
    "repaymentChainId",
    event.parameters[3].value
  );
  const originChainId = new graph_ts_1.ethereum.EventParam(
    "",
    event.parameters[4].value
  );
  const destinationChainId = new graph_ts_1.ethereum.EventParam(
    "destinationChainId",
    event.parameters[5].value
  );
  const relayerFeePct = new graph_ts_1.ethereum.EventParam(
    "",
    event.parameters[6].value
  );
  const appliedRelayerFeePct = new graph_ts_1.ethereum.EventParam(
    "appliedRelayerFeePct",
    graph_ts_1.ethereum.Value.fromI32(0)
  );
  const realizedLpFeePct = new graph_ts_1.ethereum.EventParam(
    "realizedLpFeePct",
    event.parameters[7].value
  );
  const depositId = new graph_ts_1.ethereum.EventParam(
    "depositId",
    event.parameters[8].value
  );
  const destinationToken = new graph_ts_1.ethereum.EventParam(
    "destinationToken",
    event.parameters[9].value
  );
  const relayer = new graph_ts_1.ethereum.EventParam(
    "relayer",
    event.parameters[10].value
  );
  const depositor = new graph_ts_1.ethereum.EventParam(
    "depositor",
    event.parameters[11].value
  );
  const recipient = new graph_ts_1.ethereum.EventParam(
    "recipient",
    event.parameters[12].value
  );
  const isSlowRelay = new graph_ts_1.ethereum.EventParam(
    "isSlowRelay",
    graph_ts_1.ethereum.Value.fromBoolean(false)
  );
  const params = [
    amount,
    totalFilledAmount,
    fillAmount,
    repaymentChainId,
    originChainId,
    destinationChainId,
    relayerFeePct,
    appliedRelayerFeePct,
    realizedLpFeePct,
    depositId,
    destinationToken,
    relayer,
    depositor,
    recipient,
    isSlowRelay,
  ];
  // build event
  const filledRelaySpokePool1 = new SpokePool1_1.FilledRelay(
    event.address,
    event.logIndex,
    event.transactionLogIndex,
    event.logType,
    event.block,
    event.transaction,
    params,
    event.receipt
  );
  // primary handler
  handleFilledRelaySpokePool1(filledRelaySpokePool1);
}
exports.handleFilledRelaySpokePool2 = handleFilledRelaySpokePool2;
function handleFilledRelaySpokePool1(event) {
  // Chain
  const originChainId = event.params.originChainId;
  const destinationChainId = event.params.destinationChainId;
  // mainnet vs L2s
  let conf;
  if (
    destinationChainId ==
    (0, chainIds_1.networkToChainID)(constants_1.Network.MAINNET)
  ) {
    conf = util_1.MAINNET_BRIDGE_CONFIG;
  } else {
    conf = util_1.DEPLOYER_BRIDGE_CONFIG;
  }
  const sdk = bridge_1.SDK.initializeFromEvent(
    conf,
    new util_1.Pricer(event.block),
    new util_1.TokenInit(),
    event
  );
  // InputToken
  const inputTokenAddress = event.params.destinationToken;
  const inputToken = sdk.Tokens.getOrCreateToken(inputTokenAddress);
  // CrossToken
  const crossTokenAddress = graph_ts_1.Address.fromString(
    (0, availableRoutesApi_1.findOriginToken)(
      originChainId.toI32(),
      destinationChainId.toI32(),
      inputTokenAddress.toHexString()
    )
  );
  const crossToken = sdk.Tokens.getOrCreateCrosschainToken(
    originChainId,
    crossTokenAddress,
    enums_1.CrosschainTokenType.CANONICAL,
    inputTokenAddress
  );
  // Pool
  const poolId = inputToken.id;
  const pool = sdk.Pools.loadPool(poolId);
  if (!pool.isInitialized) {
    pool.initialize(
      inputToken.name,
      inputToken.symbol,
      enums_1.BridgePoolType.LOCK_RELEASE,
      inputToken
    );
  }
  pool.addDestinationToken(crossToken);
  // Account
  const acc = sdk.Accounts.loadAccount(event.params.recipient);
  acc.transferIn(
    pool,
    pool.getDestinationTokenRoute(crossToken),
    event.params.depositor,
    event.params.amount,
    event.transaction.hash
  );
  // TVL
  pool.setInputTokenBalance(
    (0, util_1.getTokenBalance)(inputTokenAddress, event.address)
  );
  // Revenue
  // Note: We take the amount from crossChain (origin) and multiplying by inputToken price (destination).
  // This isn't ideal but we do this because we don't have access to price for the crossToken.
  const lpFeePct = (0, numbers_1.bigIntToBigDecimal)(
    event.params.realizedLpFeePct
  );
  const relayerFeePct = (0, numbers_1.bigIntToBigDecimal)(
    event.params.relayerFeePct
  );
  const supplySideRevenueAmount = (0, numbers_1.bigIntToBigDecimal)(
    event.params.amount
  ).times(lpFeePct.plus(relayerFeePct));
  const supplySideRevenue = (0, prices_1.getUsdPrice)(
    inputTokenAddress,
    supplySideRevenueAmount
  );
  pool.addSupplySideRevenueUSD(supplySideRevenue);
}
exports.handleFilledRelaySpokePool1 = handleFilledRelaySpokePool1;
function handleFundsDepositedSpokePool2(event) {
  // build params
  const amount = new graph_ts_1.ethereum.EventParam(
    "amount",
    event.parameters[0].value
  );
  const originChainId = new graph_ts_1.ethereum.EventParam(
    "originChainId",
    event.parameters[1].value
  );
  const destinationChainId = new graph_ts_1.ethereum.EventParam(
    "destinationChainId",
    event.parameters[2].value
  );
  const relayerFeePct = new graph_ts_1.ethereum.EventParam(
    "relayerFeePct",
    event.parameters[3].value
  );
  const depositId = new graph_ts_1.ethereum.EventParam(
    "depositId",
    event.parameters[4].value
  );
  const quoteTimestamp = new graph_ts_1.ethereum.EventParam(
    "quoteTimestamp",
    event.parameters[5].value
  );
  const originToken = new graph_ts_1.ethereum.EventParam(
    "originToken",
    event.parameters[6].value
  );
  const recipient = new graph_ts_1.ethereum.EventParam(
    "recipient",
    event.parameters[7].value
  );
  const depositor = new graph_ts_1.ethereum.EventParam(
    "depositor",
    event.parameters[8].value
  );
  const params = [
    amount,
    originChainId,
    destinationChainId,
    relayerFeePct,
    depositId,
    quoteTimestamp,
    originToken,
    recipient,
    depositor,
  ];
  // build event
  const fundsDepositedSpokePool1 = new SpokePool1_1.FundsDeposited(
    event.address,
    event.logIndex,
    event.transactionLogIndex,
    event.logType,
    event.block,
    event.transaction,
    params,
    event.receipt
  );
  // primary handler
  handleFundsDepositedSpokePool1(fundsDepositedSpokePool1);
}
exports.handleFundsDepositedSpokePool2 = handleFundsDepositedSpokePool2;
function handleFundsDepositedSpokePool1(event) {
  // Chain
  const originChainId = event.params.originChainId;
  const destinationChainId = event.params.destinationChainId;
  // mainnet vs L2s
  let conf;
  if (
    originChainId ==
    (0, chainIds_1.networkToChainID)(constants_1.Network.MAINNET)
  ) {
    conf = util_1.MAINNET_BRIDGE_CONFIG;
  } else {
    conf = util_1.DEPLOYER_BRIDGE_CONFIG;
  }
  const sdk = bridge_1.SDK.initializeFromEvent(
    conf,
    new util_1.Pricer(event.block),
    new util_1.TokenInit(),
    event
  );
  // InputToken
  const inputTokenAddress = event.params.originToken;
  const inputToken = sdk.Tokens.getOrCreateToken(inputTokenAddress);
  // CrossToken
  const crossTokenAddress = graph_ts_1.Address.fromString(
    (0, availableRoutesApi_1.findDestinationToken)(
      originChainId.toI32(),
      destinationChainId.toI32(),
      inputTokenAddress.toHexString()
    )
  );
  const crossToken = sdk.Tokens.getOrCreateCrosschainToken(
    destinationChainId,
    crossTokenAddress,
    enums_1.CrosschainTokenType.CANONICAL,
    inputTokenAddress
  );
  // Pool
  const poolId = inputToken.id;
  const pool = sdk.Pools.loadPool(poolId);
  if (!pool.isInitialized) {
    pool.initialize(
      inputToken.name,
      inputToken.symbol,
      enums_1.BridgePoolType.LOCK_RELEASE,
      inputToken
    );
  }
  pool.addDestinationToken(crossToken);
  // Account
  const acc = sdk.Accounts.loadAccount(event.params.depositor);
  acc.transferOut(
    pool,
    pool.getDestinationTokenRoute(crossToken),
    event.params.recipient,
    event.params.amount,
    event.transaction.hash
  );
  // TVL
  pool.setInputTokenBalance(
    (0, util_1.getTokenBalance)(inputTokenAddress, event.address)
  );
}
exports.handleFundsDepositedSpokePool1 = handleFundsDepositedSpokePool1;
