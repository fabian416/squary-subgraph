"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransferOut =
  exports.handleTransferOut3pGateway =
  exports.handleTransferIn =
  exports.handleTransferIn3pGateway =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const TokenGateway_1 = require("../../../generated/ERC20Gateway/TokenGateway");
const enums_1 = require("../../sdk/protocols/bridge/enums");
const bridge_1 = require("../../sdk/protocols/bridge");
const chainIds_1 = require("../../sdk/protocols/bridge/chainIds");
const utils_1 = require("../../common/utils");
const constants_1 = require("../../sdk/util/constants");
const _ERC20_1 = require("../../../generated/ERC20Gateway/_ERC20");
// ###################################################################################################
// ################################# Transfer Ins ####################################################
// ###################################################################################################
function handleTransferIn3pGateway(event) {
  const l1Token = new graph_ts_1.ethereum.EventParam(
    "l1token",
    event.parameters[0].value
  );
  const _from = new graph_ts_1.ethereum.EventParam(
    "_from",
    event.parameters[1].value
  );
  const _to = new graph_ts_1.ethereum.EventParam(
    "_to",
    event.parameters[2].value
  );
  const _amount = new graph_ts_1.ethereum.EventParam(
    "_amount",
    event.parameters[3].value
  );
  const params = [l1Token, _from, _to, _amount];
  const depositFinalized = new TokenGateway_1.DepositFinalized(
    event.address,
    event.logIndex,
    event.transactionLogIndex,
    event.logType,
    event.block,
    event.transaction,
    params,
    event.receipt
  );
  handleTransferIn(depositFinalized);
}
exports.handleTransferIn3pGateway = handleTransferIn3pGateway;
function handleTransferIn(event) {
  // -- SDK
  const sdk = bridge_1.SDK.initialize(
    utils_1.arbSideConf,
    new utils_1.Pricer(event.block),
    new utils_1.TokenInit(),
    event
  );
  // -- TOKENS
  const gatewayContract = TokenGateway_1.TokenGateway.bind(event.address);
  const crossTokenAddress = event.params.l1Token;
  let inputTokenAddress;
  const inputTokenAddressResult =
    gatewayContract.try_calculateL2TokenAddress(crossTokenAddress);
  if (inputTokenAddressResult.reverted) {
    graph_ts_1.log.info("calculate cross token address call reverted", []);
  } else {
    inputTokenAddress = inputTokenAddressResult.value;
  }
  const inputToken = sdk.Tokens.getOrCreateToken(inputTokenAddress);
  const crossToken = sdk.Tokens.getOrCreateCrosschainToken(
    (0, chainIds_1.networkToChainID)(constants_1.Network.ARBITRUM_ONE),
    crossTokenAddress,
    enums_1.CrosschainTokenType.CANONICAL,
    inputTokenAddress
  );
  // -- POOL
  const isInputArbToken = (0, utils_1.isArbToken)(inputTokenAddress);
  const poolId = event.address.concat(inputToken.id);
  const pool = sdk.Pools.loadPool(poolId);
  if (!pool.isInitialized) {
    pool.initialize(
      inputToken.name,
      inputToken.symbol,
      (0, utils_1.bridgePoolType)(
        isInputArbToken,
        constants_1.Network.ARBITRUM_ONE
      ),
      inputToken
    );
  }
  pool.addDestinationToken(crossToken);
  // -- ACCOUNT
  const acc = sdk.Accounts.loadAccount(event.params._to);
  acc.transferIn(
    pool,
    pool.getDestinationTokenRoute(crossToken),
    event.params._from,
    event.params._amount,
    event.transaction.hash
  );
  // -- TVL
  if (isInputArbToken) {
    let inputTokenBalance;
    const erc20 = _ERC20_1._ERC20.bind(inputTokenAddress);
    const inputTokenBalanceResult = erc20.try_balanceOf(event.address);
    if (inputTokenBalanceResult.reverted) {
      graph_ts_1.log.info(
        "calculate token balance owned by bridge contract reverted",
        []
      );
    } else {
      inputTokenBalance = inputTokenBalanceResult.value;
      pool.setInputTokenBalance(inputTokenBalance);
    }
  }
}
exports.handleTransferIn = handleTransferIn;
// ###################################################################################################
// ############################### Transfer Outs #####################################################
// ###################################################################################################
function handleTransferOut3pGateway(event) {
  const l1Token = new graph_ts_1.ethereum.EventParam(
    "l1token",
    event.parameters[0].value
  );
  const _from = new graph_ts_1.ethereum.EventParam(
    "_from",
    event.parameters[1].value
  );
  const _to = new graph_ts_1.ethereum.EventParam(
    "_to",
    event.parameters[2].value
  );
  const _l2ToL1Id = new graph_ts_1.ethereum.EventParam(
    "_l2ToL1Id",
    event.parameters[3].value
  );
  const _exitNum = new graph_ts_1.ethereum.EventParam(
    "_exitNum",
    event.parameters[4].value
  );
  const _amount = new graph_ts_1.ethereum.EventParam(
    "_amount",
    event.parameters[5].value
  );
  const params = [l1Token, _from, _to, _l2ToL1Id, _exitNum, _amount];
  const withdrawalInitiated = new TokenGateway_1.WithdrawalInitiated(
    event.address,
    event.logIndex,
    event.transactionLogIndex,
    event.logType,
    event.block,
    event.transaction,
    params,
    event.receipt
  );
  handleTransferOut(withdrawalInitiated);
}
exports.handleTransferOut3pGateway = handleTransferOut3pGateway;
function handleTransferOut(event) {
  // -- SDK
  const sdk = bridge_1.SDK.initialize(
    utils_1.arbSideConf,
    new utils_1.Pricer(event.block),
    new utils_1.TokenInit(),
    event
  );
  // -- TOKENS
  const gatewayContract = TokenGateway_1.TokenGateway.bind(event.address);
  const crossTokenAddress = event.params.l1Token;
  let inputTokenAddress;
  const inputTokenAddressResult =
    gatewayContract.try_calculateL2TokenAddress(crossTokenAddress);
  if (inputTokenAddressResult.reverted) {
    graph_ts_1.log.info("calculate cross token address call reverted", []);
  } else {
    inputTokenAddress = inputTokenAddressResult.value;
  }
  const inputToken = sdk.Tokens.getOrCreateToken(inputTokenAddress);
  const crossToken = sdk.Tokens.getOrCreateCrosschainToken(
    (0, chainIds_1.networkToChainID)(constants_1.Network.ARBITRUM_ONE),
    crossTokenAddress,
    enums_1.CrosschainTokenType.CANONICAL,
    inputTokenAddress
  );
  // -- POOL
  const isInputArbToken = (0, utils_1.isArbToken)(inputTokenAddress);
  const poolId = event.address.concat(inputToken.id);
  const pool = sdk.Pools.loadPool(poolId);
  if (!pool.isInitialized) {
    pool.initialize(
      inputToken.name,
      inputToken.symbol,
      (0, utils_1.bridgePoolType)(
        isInputArbToken,
        constants_1.Network.ARBITRUM_ONE
      ),
      inputToken
    );
  }
  pool.addDestinationToken(crossToken);
  // -- ACCOUNT
  const acc = sdk.Accounts.loadAccount(event.params._to);
  acc.transferOut(
    pool,
    pool.getDestinationTokenRoute(crossToken),
    event.params._from,
    event.params._amount,
    event.transaction.hash
  );
  // -- TVL
  if (isInputArbToken) {
    let inputTokenBalance;
    const erc20 = _ERC20_1._ERC20.bind(inputTokenAddress);
    const inputTokenBalanceResult = erc20.try_balanceOf(event.address);
    if (inputTokenBalanceResult.reverted) {
      graph_ts_1.log.info(
        "calculate token balance owned by bridge contract reverted",
        []
      );
    } else {
      inputTokenBalance = inputTokenBalanceResult.value;
      pool.setInputTokenBalance(inputTokenBalance);
    }
  }
}
exports.handleTransferOut = handleTransferOut;
