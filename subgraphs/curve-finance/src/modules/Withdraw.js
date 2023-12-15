"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.Withdraw =
  exports.getWithdrawnTokenAmounts =
  exports.UpdateMetricsAfterWithdraw =
  exports.createWithdrawTransaction =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
function createWithdrawTransaction(
  pool,
  inputTokenAmounts,
  outputTokenBurntAmount,
  amountUSD,
  provider,
  event,
  block
) {
  const withdrawTransactionId = "withdraw-"
    .concat(event.transaction.hash.toHexString())
    .concat("-")
    .concat(event.logIndex.toString());
  let withdrawTransaction = schema_1.Withdraw.load(withdrawTransactionId);
  if (!withdrawTransaction) {
    withdrawTransaction = new schema_1.Withdraw(withdrawTransactionId);
    withdrawTransaction.pool = pool.id;
    withdrawTransaction.protocol = constants.PROTOCOL_ID.toHexString();
    withdrawTransaction.to = constants.NULL.TYPE_STRING;
    if (event.transaction.to)
      withdrawTransaction.to = event.transaction.to.toHexString();
    withdrawTransaction.from = provider.toHexString();
    withdrawTransaction.hash = event.transaction.hash.toHexString();
    withdrawTransaction.logIndex = event.logIndex.toI32();
    withdrawTransaction.inputTokens = pool._inputTokensOrdered;
    withdrawTransaction.inputTokenAmounts = inputTokenAmounts;
    withdrawTransaction.outputToken = pool.outputToken;
    withdrawTransaction.outputTokenAmount = outputTokenBurntAmount;
    withdrawTransaction.amountUSD = amountUSD;
    withdrawTransaction.timestamp = block.timestamp;
    withdrawTransaction.blockNumber = block.number;
    withdrawTransaction.save();
  }
  return withdrawTransaction;
}
exports.createWithdrawTransaction = createWithdrawTransaction;
function UpdateMetricsAfterWithdraw(block) {
  const protocol = (0, initializers_1.getOrCreateDexAmmProtocol)();
  // Update hourly and daily deposit transaction count
  const metricsDailySnapshot = (0,
  initializers_1.getOrCreateUsageMetricsDailySnapshot)(block);
  const metricsHourlySnapshot = (0,
  initializers_1.getOrCreateUsageMetricsHourlySnapshot)(block);
  metricsDailySnapshot.dailyWithdrawCount += 1;
  metricsHourlySnapshot.hourlyWithdrawCount += 1;
  metricsDailySnapshot.save();
  metricsHourlySnapshot.save();
  protocol.save();
}
exports.UpdateMetricsAfterWithdraw = UpdateMetricsAfterWithdraw;
function getWithdrawnTokenAmounts(
  liquidityPoolAddress,
  provider,
  inputTokens,
  event
) {
  const receipt = event.receipt;
  if (!receipt)
    return new Array(inputTokens.length).fill(constants.BIGINT_ZERO);
  const logs = event.receipt.logs;
  if (!logs) return new Array(inputTokens.length).fill(constants.BIGINT_ZERO);
  let inputToken = constants.NULL.TYPE_ADDRESS;
  let inputTokenAmount = constants.BIGINT_ZERO;
  for (let i = 0; i < logs.length; i++) {
    const log = logs.at(i);
    if (log.topics.length == 0) continue;
    const topic_signature = log.topics.at(0);
    if (
      graph_ts_1.crypto
        .keccak256(
          graph_ts_1.ByteArray.fromUTF8("Transfer(address,address,uint256)")
        )
        .equals(topic_signature)
    ) {
      const _from = graph_ts_1.ethereum
        .decode("address", log.topics.at(1))
        .toAddress();
      const _to = graph_ts_1.ethereum
        .decode("address", log.topics.at(2))
        .toAddress();
      if (_from.equals(liquidityPoolAddress) && _to.equals(provider)) {
        const data = graph_ts_1.ethereum.decode("uint256", log.data);
        if (data) {
          inputToken = log.address;
          inputTokenAmount = data.toBigInt();
        }
      }
    }
  }
  const withdrawnTokenAmounts = [];
  for (let idx = 0; idx < inputTokens.length; idx++) {
    if (graph_ts_1.Address.fromString(inputTokens.at(idx)).equals(inputToken)) {
      withdrawnTokenAmounts.push(inputTokenAmount);
      continue;
    }
    withdrawnTokenAmounts.push(constants.BIGINT_ZERO);
  }
  return withdrawnTokenAmounts;
}
exports.getWithdrawnTokenAmounts = getWithdrawnTokenAmounts;
function Withdraw(
  poolAddress,
  withdrawnTokenAmounts,
  outputTokenBurntAmount,
  tokenSupplyAfterWithdrawal,
  provider,
  transaction,
  block,
  event
) {
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(poolAddress, block);
  if (!tokenSupplyAfterWithdrawal)
    tokenSupplyAfterWithdrawal = utils.getOutputTokenSupply(
      graph_ts_1.Address.fromString(pool.outputToken),
      pool.outputTokenSupply
    );
  if (!outputTokenBurntAmount)
    outputTokenBurntAmount = pool.outputTokenSupply.minus(
      tokenSupplyAfterWithdrawal
    );
  if (withdrawnTokenAmounts.length == 0) {
    // Exception: Remove Liquidity One has no information about input token
    withdrawnTokenAmounts = getWithdrawnTokenAmounts(
      poolAddress,
      provider,
      pool._inputTokensOrdered,
      event
    );
  }
  const inputTokenAmounts = [];
  let withdrawAmountUSD = constants.BIGDECIMAL_ZERO;
  for (let idx = 0; idx < withdrawnTokenAmounts.length; idx++) {
    const inputToken = utils.getOrCreateTokenFromString(
      pool._inputTokensOrdered[idx],
      block
    );
    const inputTokenDecimals = utils.exponentToBigDecimal(inputToken.decimals);
    inputTokenAmounts.push(withdrawnTokenAmounts[idx]);
    withdrawAmountUSD = withdrawAmountUSD.plus(
      withdrawnTokenAmounts[idx]
        .divDecimal(inputTokenDecimals)
        .times(inputToken.lastPriceUSD)
    );
  }
  pool.inputTokenBalances = utils.getPoolBalances(pool);
  pool.totalValueLockedUSD = utils.getPoolTVL(
    pool,
    tokenSupplyAfterWithdrawal,
    block
  );
  pool._tvlUSDExcludingBasePoolLpTokens =
    utils.getPoolTVLExcludingBasePoolLpToken(pool, block);
  pool.inputTokenWeights = utils.getPoolTokenWeights(
    pool.inputTokens,
    pool.inputTokenBalances,
    block
  );
  pool.outputTokenSupply = tokenSupplyAfterWithdrawal;
  pool.outputTokenPriceUSD = utils.getOrCreateTokenFromString(
    pool.outputToken,
    block
  ).lastPriceUSD;
  pool.save();
  createWithdrawTransaction(
    pool,
    inputTokenAmounts,
    outputTokenBurntAmount,
    withdrawAmountUSD,
    provider,
    event,
    block
  );
  utils.updateProtocolTotalValueLockedUSD(block);
  UpdateMetricsAfterWithdraw(block);
  graph_ts_1.log.info(
    "[RemoveLiquidity] LiquidityPool: {}, sharesBurnt: {}, withdrawnAmounts: [{}], withdrawAmountUSD: {}, TxnHash: {}",
    [
      poolAddress.toHexString(),
      outputTokenBurntAmount.toString(),
      withdrawnTokenAmounts.join(", "),
      withdrawAmountUSD.truncate(1).toString(),
      transaction.hash.toHexString(),
    ]
  );
}
exports.Withdraw = Withdraw;
