"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleL2ToL1Transaction = exports.handleL2ToL1Tx = void 0;
const bridge_1 = require("../../sdk/protocols/bridge");
const enums_1 = require("../../sdk/protocols/bridge/enums");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const chainIds_1 = require("../../sdk/protocols/bridge/chainIds");
const constants_1 = require("../../sdk/util/constants");
const ArbSys_1 = require("../../../generated/L2ArbSys/ArbSys");
const utils_1 = require("../../common/utils");
function handleL2ToL1Tx(event) {
  // params used in handleL2ToL1Transaction
  const caller = new graph_ts_1.ethereum.EventParam(
    "caller",
    event.parameters[0].value
  );
  const destination = new graph_ts_1.ethereum.EventParam(
    "destination",
    event.parameters[1].value
  );
  const callvalue = new graph_ts_1.ethereum.EventParam(
    "callvalue",
    event.parameters[7].value
  );
  const data = new graph_ts_1.ethereum.EventParam(
    "data",
    event.parameters[8].value
  );
  // unused params; but required for properly building the params array
  // (note: some variables don't exactly map 1:1 between L2ToL1Tx and L2ToL1Transaction)
  const uniqueId = new graph_ts_1.ethereum.EventParam(
    "uniqueId",
    event.parameters[2].value
  );
  const batchNumber = new graph_ts_1.ethereum.EventParam(
    "batchNumber",
    event.parameters[2].value
  );
  const indexInBatch = new graph_ts_1.ethereum.EventParam(
    "arbBlockNum",
    event.parameters[3].value
  );
  const arbBlockNum = new graph_ts_1.ethereum.EventParam(
    "arbBlockNum",
    event.parameters[4].value
  );
  const ethBlockNum = new graph_ts_1.ethereum.EventParam(
    "ethBlockNum",
    event.parameters[5].value
  );
  const timestamp = new graph_ts_1.ethereum.EventParam(
    "timestamp",
    event.parameters[6].value
  );
  // build param
  const params = [
    caller,
    destination,
    uniqueId,
    batchNumber,
    indexInBatch,
    arbBlockNum,
    ethBlockNum,
    timestamp,
    callvalue,
    data,
  ];
  // build event
  const l2ToL1Transaction = new ArbSys_1.L2ToL1Transaction(
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
  handleL2ToL1Transaction(l2ToL1Transaction);
}
exports.handleL2ToL1Tx = handleL2ToL1Tx;
function handleL2ToL1Transaction(event) {
  // -- SDK
  const sdk = bridge_1.SDK.initialize(
    utils_1.arbSideConf,
    new utils_1.Pricer(event.block),
    new utils_1.TokenInit(),
    event
  );
  // -- ACCOUNT
  const acc = sdk.Accounts.loadAccount(event.params.caller);
  if (event.params.callvalue > constants_1.BIGINT_ZERO) {
    // ETH TRANSFER
    // note: we can also add additional check (event.params.data.toString() != "0x")
    // -- TOKENS
    const crossToken = sdk.Tokens.getOrCreateCrosschainToken(
      (0, chainIds_1.networkToChainID)(constants_1.Network.MAINNET),
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
        enums_1.BridgePoolType.BURN_MINT,
        sdk.Tokens.getOrCreateToken(utils_1.ethAddress)
      );
    }
    pool.addDestinationToken(crossToken);
    // -- ACCOUNT
    acc.transferOut(
      pool,
      pool.getDestinationTokenRoute(crossToken),
      event.params.destination,
      event.params.callvalue,
      event.transaction.hash
    );
  } else if (
    // MESSAGING
    // note: we can also add additional check (event.params.data.toString() == "0x")
    event.params.callvalue == constants_1.BIGINT_ZERO
  ) {
    acc.messageOut(
      (0, chainIds_1.networkToChainID)(constants_1.Network.MAINNET),
      event.params.destination,
      event.params.data
    );
  }
}
exports.handleL2ToL1Transaction = handleL2ToL1Transaction;
