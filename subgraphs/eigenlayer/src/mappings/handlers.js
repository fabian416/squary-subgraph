"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWithdrawalCompleted =
  exports.handleShareWithdrawalQueued =
  exports.handleDeposit =
  exports.handleStrategyRemoved =
  exports.handleStrategyAdded =
  exports.handlePodDeployed =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../common/constants");
const getters_1 = require("../common/getters");
const metrics_1 = require("../common/metrics");
const events_1 = require("../common/events");
const snapshots_1 = require("../common/snapshots");
const EigenPod_1 = require("../../generated/EigenPodManager/EigenPod");
const Strategy_1 = require("../../generated/StrategyManager/Strategy");
/////////////////////////////////////////
/////////// Native Restaking ////////////
/////////////////////////////////////////
function handlePodDeployed(event) {
  const podAddress = event.params.eigenPod;
  // As per communication on EigenLayer's discord, currently native staking is technically not proven restaked
  // i.e. delegateable without the proof system launching in the upcoming M2 release,
  // so that’s why hasRestaked is false for all EigenPods for now.
  // ref: https://discord.com/channels/1089434273720832071/1090553231031140382/1162436943066443846
  let isActive = false;
  const eigenPod = EigenPod_1.EigenPod.bind(podAddress);
  const hasRestakedCall = eigenPod.try_hasRestaked();
  if (!hasRestakedCall.reverted) {
    isActive = hasRestakedCall.value;
  } else {
    graph_ts_1.log.warning(
      "[handlePodDeployed] eigenPod.try_hasRestaked reverted for podAddress: {}",
      [event.params.eigenPod.toHexString()]
    );
  }
  const underlyingToken = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS),
    event
  );
  const poolName = "EigenPod-" + underlyingToken.name;
  const poolSymbol = "E-" + underlyingToken.symbol;
  (0, getters_1.createPool)(
    podAddress,
    poolName,
    poolSymbol,
    constants_1.PoolType.EIGEN_POD,
    graph_ts_1.Address.fromBytes(underlyingToken.id),
    isActive,
    event
  );
}
exports.handlePodDeployed = handlePodDeployed;
/////////////////////////////////////////
///////////// LST Restaking /////////////
/////////////////////////////////////////
function handleStrategyAdded(event) {
  const strategyAddress = event.params.strategy;
  const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
  const underlyingTokenCall = strategyContract.try_underlyingToken();
  if (underlyingTokenCall.reverted) {
    graph_ts_1.log.error(
      "[handleStrategyAdded] strategyContract.try_underlyingToken() reverted for strategy: {}",
      [strategyAddress.toHexString()]
    );
    return;
  }
  const underlyingToken = (0, getters_1.getOrCreateToken)(
    underlyingTokenCall.value,
    event
  );
  const poolName = "Strategy-" + underlyingToken.name;
  const poolSymbol = "S-" + underlyingToken.symbol;
  (0, getters_1.createPool)(
    strategyAddress,
    poolName,
    poolSymbol,
    constants_1.PoolType.STRATEGY,
    graph_ts_1.Address.fromBytes(underlyingToken.id),
    true,
    event
  );
}
exports.handleStrategyAdded = handleStrategyAdded;
function handleStrategyRemoved(event) {
  const strategyAddress = event.params.strategy;
  (0, metrics_1.updatePoolIsActive)(strategyAddress, false);
}
exports.handleStrategyRemoved = handleStrategyRemoved;
function handleDeposit(event) {
  const strategyAddress = event.params.strategy;
  const tokenAddress = event.params.token;
  const depositorAddress = event.params.depositor;
  const shares = event.params.shares;
  const pool = (0, getters_1.getPool)(strategyAddress);
  const token = (0, getters_1.getOrCreateToken)(tokenAddress, event);
  const account = (0, getters_1.getOrCreateAccount)(depositorAddress);
  let amount = constants_1.BIGINT_ZERO;
  const receipt = event.receipt;
  if (!receipt) {
    graph_ts_1.log.error("[handleDeposit] No event receipt. Tx: {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
  const logs = receipt.logs;
  if (!logs) {
    graph_ts_1.log.error("[handleDeposit] No logs for event receipt. Tx: {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
  for (let i = 0; i < logs.length; i++) {
    const thisLog = logs.at(i);
    const logTopicSignature = thisLog.topics.at(constants_1.INT_ZERO);
    if (logTopicSignature.equals(constants_1.TRANSFER_SIGNATURE)) {
      const logTopicTo = graph_ts_1.ethereum
        .decode("address", thisLog.topics.at(constants_1.INT_TWO))
        .toAddress();
      if (logTopicTo.equals(graph_ts_1.Address.fromBytes(pool.id))) {
        const decoded = graph_ts_1.ethereum.decode(
          constants_1.TRANSFER_DATA_TYPE,
          thisLog.data
        );
        if (!decoded) continue;
        const logData = decoded.toTuple();
        amount = logData[constants_1.INT_ZERO].toBigInt();
        break;
      }
    }
  }
  const depositID = (0, events_1.createDeposit)(
    graph_ts_1.Address.fromBytes(pool.id),
    graph_ts_1.Address.fromBytes(token.id),
    graph_ts_1.Address.fromBytes(account.id),
    shares,
    amount,
    event
  );
  (0, metrics_1.updateUsage)(
    graph_ts_1.Address.fromBytes(pool.id),
    graph_ts_1.Address.fromBytes(token.id),
    graph_ts_1.Address.fromBytes(account.id),
    true,
    amount,
    depositID,
    event
  );
  const poolBalance = (0, getters_1.getPoolBalance)(
    graph_ts_1.Address.fromBytes(pool.id)
  );
  (0, metrics_1.updateTVL)(
    graph_ts_1.Address.fromBytes(pool.id),
    graph_ts_1.Address.fromBytes(token.id),
    poolBalance,
    event
  );
  (0, metrics_1.updateVolume)(
    graph_ts_1.Address.fromBytes(pool.id),
    graph_ts_1.Address.fromBytes(token.id),
    true,
    amount,
    event
  );
  (0, snapshots_1.updatePoolHourlySnapshot)(
    graph_ts_1.Address.fromBytes(pool.id),
    event
  );
  (0, snapshots_1.updatePoolDailySnapshot)(
    graph_ts_1.Address.fromBytes(pool.id),
    graph_ts_1.Address.fromBytes(token.id),
    true,
    amount,
    event
  );
  (0, snapshots_1.updateUsageMetricsHourlySnapshot)(
    graph_ts_1.Address.fromBytes(account.id),
    event
  );
  (0, snapshots_1.updateUsageMetricsDailySnapshot)(
    graph_ts_1.Address.fromBytes(account.id),
    true,
    depositID,
    event
  );
  (0, snapshots_1.updateFinancialsDailySnapshot)(
    graph_ts_1.Address.fromBytes(token.id),
    true,
    amount,
    event
  );
}
exports.handleDeposit = handleDeposit;
function handleShareWithdrawalQueued(event) {
  const depositorAddress = event.params.depositor;
  const nonce = event.params.nonce;
  const strategyAddress = event.params.strategy;
  const shares = event.params.shares;
  const pool = (0, getters_1.getPool)(strategyAddress);
  const token = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromBytes(pool.inputTokens[0]),
    event
  );
  const account = (0, getters_1.getOrCreateAccount)(depositorAddress);
  let withdrawerAddress = graph_ts_1.Address.fromString(
    constants_1.ZERO_ADDRESS
  );
  let delegatedAddress = graph_ts_1.Address.fromString(
    constants_1.ZERO_ADDRESS
  );
  let withdrawalRoot = graph_ts_1.Bytes.empty();
  const receipt = event.receipt;
  if (!receipt) {
    graph_ts_1.log.error(
      "[handleShareWithdrawalQueued] No event receipt. Tx: {}",
      [event.transaction.hash.toHexString()]
    );
    return;
  }
  const logs = receipt.logs;
  if (!logs) {
    graph_ts_1.log.error(
      "[handleShareWithdrawalQueued] No logs for event receipt. Tx: {}",
      [event.transaction.hash.toHexString()]
    );
    return;
  }
  for (let i = 0; i < logs.length; i++) {
    const thisLog = logs.at(i);
    const logTopicSignature = thisLog.topics.at(constants_1.INT_ZERO);
    if (logTopicSignature.equals(constants_1.WITHDRAWAL_QUEUED_SIGNATURE)) {
      const decoded = graph_ts_1.ethereum.decode(
        constants_1.WITHDRAWAL_QUEUED_DATA_TYPE,
        thisLog.data
      );
      if (!decoded) continue;
      const logData = decoded.toTuple();
      withdrawerAddress = logData[constants_1.INT_TWO].toAddress();
      delegatedAddress = logData[constants_1.INT_THREE].toAddress();
      withdrawalRoot = logData[constants_1.INT_FOUR].toBytes();
      break;
    }
  }
  (0, events_1.createWithdraw)(
    graph_ts_1.Address.fromBytes(pool.id),
    graph_ts_1.Address.fromBytes(token.id),
    graph_ts_1.Address.fromBytes(account.id),
    withdrawerAddress,
    delegatedAddress,
    withdrawalRoot,
    nonce,
    shares,
    event
  );
}
exports.handleShareWithdrawalQueued = handleShareWithdrawalQueued;
function handleWithdrawalCompleted(event) {
  const depositorAddress = event.params.depositor;
  const withdrawalRoot = event.params.withdrawalRoot;
  const withdraw = (0, events_1.getWithdraw)(depositorAddress, withdrawalRoot);
  if (!withdraw) return;
  const withdrawID = withdraw.id;
  const poolID = withdraw.pool;
  const tokenID = withdraw.token;
  const accountID = withdraw.depositor;
  let amount = constants_1.BIGINT_ZERO;
  const receipt = event.receipt;
  if (!receipt) {
    graph_ts_1.log.error(
      "[handleWithdrawalCompleted] No event receipt. Tx: {}",
      [event.transaction.hash.toHexString()]
    );
    return;
  }
  const logs = receipt.logs;
  if (!logs) {
    graph_ts_1.log.error(
      "[handleWithdrawalCompleted] No logs for event receipt. Tx: {}",
      [event.transaction.hash.toHexString()]
    );
    return;
  }
  for (let i = 0; i < logs.length; i++) {
    const thisLog = logs.at(i);
    const logTopicSignature = thisLog.topics.at(constants_1.INT_ZERO);
    if (logTopicSignature.equals(constants_1.TRANSFER_SIGNATURE)) {
      const logTopicFrom = graph_ts_1.ethereum
        .decode("address", thisLog.topics.at(constants_1.INT_ONE))
        .toAddress();
      if (logTopicFrom.equals(graph_ts_1.Address.fromBytes(poolID))) {
        const decoded = graph_ts_1.ethereum.decode(
          constants_1.TRANSFER_DATA_TYPE,
          thisLog.data
        );
        if (!decoded) continue;
        const logData = decoded.toTuple();
        amount = logData[constants_1.INT_ZERO].toBigInt();
        break;
      }
    }
  }
  (0, metrics_1.updateUsage)(
    graph_ts_1.Address.fromBytes(poolID),
    graph_ts_1.Address.fromBytes(tokenID),
    graph_ts_1.Address.fromBytes(accountID),
    false,
    amount,
    withdrawID,
    event
  );
  const poolBalance = (0, getters_1.getPoolBalance)(
    graph_ts_1.Address.fromBytes(poolID)
  );
  (0, metrics_1.updateTVL)(
    graph_ts_1.Address.fromBytes(poolID),
    graph_ts_1.Address.fromBytes(tokenID),
    poolBalance,
    event
  );
  (0, metrics_1.updateVolume)(
    graph_ts_1.Address.fromBytes(poolID),
    graph_ts_1.Address.fromBytes(tokenID),
    false,
    amount,
    event
  );
  (0, snapshots_1.updatePoolHourlySnapshot)(
    graph_ts_1.Address.fromBytes(poolID),
    event
  );
  (0, snapshots_1.updatePoolDailySnapshot)(
    graph_ts_1.Address.fromBytes(poolID),
    graph_ts_1.Address.fromBytes(tokenID),
    false,
    amount,
    event
  );
  (0, snapshots_1.updateUsageMetricsHourlySnapshot)(
    graph_ts_1.Address.fromBytes(accountID),
    event
  );
  (0, snapshots_1.updateUsageMetricsDailySnapshot)(
    graph_ts_1.Address.fromBytes(accountID),
    false,
    withdrawID,
    event
  );
  (0, snapshots_1.updateFinancialsDailySnapshot)(
    graph_ts_1.Address.fromBytes(tokenID),
    false,
    amount,
    event
  );
  (0, events_1.updateWithdraw)(
    graph_ts_1.Address.fromBytes(accountID),
    graph_ts_1.Address.fromBytes(tokenID),
    withdrawID,
    amount,
    event
  );
}
exports.handleWithdrawalCompleted = handleWithdrawalCompleted;
