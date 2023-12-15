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
  exports.UpdateMetricsAfterWithdraw =
  exports.createWithdrawTransaction =
    void 0;
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
function createWithdrawTransaction(
  pool,
  inputTokenAmounts,
  outputTokenBurntAmount,
  amountUSD,
  provider,
  transaction,
  block
) {
  const withdrawTransactionId = "withdraw-"
    .concat(transaction.hash.toHexString())
    .concat("-")
    .concat(transaction.index.toString());
  let withdrawTransaction = schema_1.Withdraw.load(withdrawTransactionId);
  if (!withdrawTransaction) {
    withdrawTransaction = new schema_1.Withdraw(withdrawTransactionId);
    withdrawTransaction.pool = pool.id;
    withdrawTransaction.protocol = constants.VAULT_ADDRESS.toHexString();
    withdrawTransaction.to = transaction.to.toHexString();
    withdrawTransaction.from = provider.toHexString();
    withdrawTransaction.hash = transaction.hash.toHexString();
    withdrawTransaction.logIndex = transaction.index.toI32();
    withdrawTransaction.inputTokens = pool.inputTokens;
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
function Withdraw(
  poolAddress,
  inputTokens,
  withdrawnTokenAmounts,
  fees,
  provider,
  transaction,
  block
) {
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(poolAddress, block);
  // deltas in a remove liquidity event are negative
  withdrawnTokenAmounts = withdrawnTokenAmounts.map((x) =>
    x.times(constants.BIGINT_NEGATIVE_ONE)
  );
  const inputTokenAmounts = [];
  const inputTokenBalances = pool.inputTokenBalances;
  let withdrawAmountUSD = constants.BIGDECIMAL_ZERO;
  for (let idx = 0; idx < withdrawnTokenAmounts.length; idx++) {
    if (inputTokens.at(idx).equals(poolAddress)) continue;
    const inputToken = (0, initializers_1.getOrCreateToken)(
      inputTokens.at(idx),
      block.number
    );
    const inputTokenIndex = pool.inputTokens.indexOf(inputToken.id);
    inputTokenBalances[inputTokenIndex] = inputTokenBalances[
      inputTokenIndex
    ].minus(withdrawnTokenAmounts[idx].minus(fees[idx]));
    inputTokenAmounts.push(withdrawnTokenAmounts[idx]);
    withdrawAmountUSD = withdrawAmountUSD.plus(
      withdrawnTokenAmounts[idx]
        .divDecimal(
          constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal()
        )
        .times(inputToken.lastPriceUSD)
    );
  }
  const tokenSupplyAfterWithdrawal = utils.getOutputTokenSupply(
    poolAddress,
    pool.outputTokenSupply
  );
  const outputTokenBurntAmount = pool.outputTokenSupply.minus(
    tokenSupplyAfterWithdrawal
  );
  pool.inputTokenBalances = inputTokenBalances;
  pool.totalValueLockedUSD = utils.getPoolTVL(
    pool.inputTokens,
    pool.inputTokenBalances,
    block
  );
  pool.inputTokenWeights = utils.getPoolTokenWeights(
    poolAddress,
    pool.inputTokens
  );
  pool.outputTokenSupply = tokenSupplyAfterWithdrawal;
  pool.outputTokenPriceUSD = utils.getOutputTokenPriceUSD(poolAddress, block);
  pool.save();
  createWithdrawTransaction(
    pool,
    inputTokenAmounts,
    outputTokenBurntAmount,
    withdrawAmountUSD,
    provider,
    transaction,
    block
  );
  utils.updateProtocolTotalValueLockedUSD();
  UpdateMetricsAfterWithdraw(block);
  graph_ts_1.log.info(
    "[RemoveLiquidity] LiquidityPool: {}, sharesBurnt: {}, inputTokenBalances: [{}], withdrawnAmounts: [{}], withdrawAmountUSD: {}, fees: [{}], TxnHash: {}",
    [
      poolAddress.toHexString(),
      outputTokenBurntAmount.toString(),
      inputTokenBalances.join(", "),
      withdrawnTokenAmounts.join(", "),
      withdrawAmountUSD.truncate(1).toString(),
      fees.join(", "),
      transaction.hash.toHexString(),
    ]
  );
}
exports.Withdraw = Withdraw;
