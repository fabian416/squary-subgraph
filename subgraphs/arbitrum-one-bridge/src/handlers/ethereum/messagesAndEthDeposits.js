"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleL1MessageDelivered = void 0;
const bridge_1 = require("../../sdk/protocols/bridge");
const enums_1 = require("../../sdk/protocols/bridge/enums");
const chainIds_1 = require("../../sdk/protocols/bridge/chainIds");
const constants_1 = require("../../sdk/util/constants");
const utils_1 = require("../../common/utils");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function handleL1MessageDelivered(event) {
  // -- SDK
  const sdk = bridge_1.SDK.initialize(
    utils_1.ethSideConf,
    new utils_1.Pricer(event.block),
    new utils_1.TokenInit(),
    event
  );
  // -- ACCOUNT
  const sender = graph_ts_1.Address.fromString(
    (0, utils_1.undoAlias)(event.params.sender)
  );
  const acc = sdk.Accounts.loadAccount(sender);
  // -- HANDLE ETH DEPOSIT & MESSAGES
  // Nitro
  // Message Types - https://github.com/OffchainLabs/nitro/blob/master/contracts/src/libraries/MessageTypes.sol#L10
  const L1MessageType_ethDeposit = 12;
  const L2_MSG = 3;
  if (event.params.kind == L1MessageType_ethDeposit) {
    // -- TOKENS
    // source and destination token == ethAddress
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken(
      (0, chainIds_1.networkToChainID)(constants_1.Network.ARBITRUM_ONE),
      utils_1.ethAddress,
      enums_1.CrosschainTokenType.CANONICAL,
      utils_1.ethAddress
    );
    // -- POOL
    const poolId = event.address;
    const pool = sdk.Pools.loadPool(poolId);
    if (!pool.isInitialized) {
      pool.initialize(
        constants_1.ETH_NAME,
        constants_1.ETH_SYMBOL,
        enums_1.BridgePoolType.LOCK_RELEASE,
        sdk.Tokens.getOrCreateToken(utils_1.ethAddress)
      );
    }
    pool.addDestinationToken(crossToken);
    // -- ACCOUNT
    acc.transferOut(
      pool,
      pool.getDestinationTokenRoute(crossToken),
      sender,
      event.transaction.value,
      event.transaction.hash
    );
  } else if (event.params.kind == L2_MSG) {
    acc.messageOut(
      (0, chainIds_1.networkToChainID)(constants_1.Network.ARBITRUM_ONE),
      event.transaction.to, // don't have access to receiver
      event.params.messageDataHash
    );
  }
}
exports.handleL1MessageDelivered = handleL1MessageDelivered;
