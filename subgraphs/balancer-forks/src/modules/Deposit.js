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
exports.Deposit =
  exports.UpdateMetricsAfterDeposit =
  exports.createDepositTransaction =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
function createDepositTransaction(
  liquidityPool,
  inputTokenAmounts,
  outputTokenMintedAmount,
  amountUSD,
  provider,
  transaction,
  block
) {
  const transactionId = "deposit-"
    .concat(transaction.hash.toHexString())
    .concat("-")
    .concat(transaction.index.toString());
  let depositTransaction = schema_1.Deposit.load(transactionId);
  if (!depositTransaction) {
    depositTransaction = new schema_1.Deposit(transactionId);
    depositTransaction.pool = liquidityPool.id;
    depositTransaction.protocol = (0,
    initializers_1.getOrCreateDexAmmProtocol)().id;
    depositTransaction.to = liquidityPool.id;
    depositTransaction.from = provider.toHexString();
    depositTransaction.hash = transaction.hash.toHexString();
    depositTransaction.logIndex = transaction.index.toI32();
    depositTransaction.inputTokens = liquidityPool.inputTokens;
    depositTransaction.inputTokenAmounts = inputTokenAmounts;
    depositTransaction.outputToken = liquidityPool.outputToken;
    depositTransaction.outputTokenAmount = outputTokenMintedAmount;
    depositTransaction.amountUSD = amountUSD;
    depositTransaction.timestamp = block.timestamp;
    depositTransaction.blockNumber = block.number;
    depositTransaction.save();
  }
  return depositTransaction;
}
exports.createDepositTransaction = createDepositTransaction;
function UpdateMetricsAfterDeposit(block) {
  const protocol = (0, initializers_1.getOrCreateDexAmmProtocol)();
  // Update hourly and daily deposit transaction count
  const metricsDailySnapshot = (0,
  initializers_1.getOrCreateUsageMetricsDailySnapshot)(block);
  const metricsHourlySnapshot = (0,
  initializers_1.getOrCreateUsageMetricsHourlySnapshot)(block);
  metricsDailySnapshot.dailyDepositCount += 1;
  metricsHourlySnapshot.hourlyDepositCount += 1;
  metricsDailySnapshot.save();
  metricsHourlySnapshot.save();
  protocol.save();
}
exports.UpdateMetricsAfterDeposit = UpdateMetricsAfterDeposit;
function Deposit(
  poolAddress,
  inputTokens,
  depositedCoinAmounts,
  fees,
  provider,
  transaction,
  block
) {
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(poolAddress, block);
  const inputTokenAmounts = [];
  const inputTokenBalances = pool.inputTokenBalances;
  let depositAmountUSD = constants.BIGDECIMAL_ZERO;
  for (let idx = 0; idx < depositedCoinAmounts.length; idx++) {
    if (inputTokens.at(idx).equals(poolAddress)) continue;
    const inputToken = (0, initializers_1.getOrCreateToken)(
      inputTokens.at(idx),
      block.number
    );
    const inputTokenIndex = pool.inputTokens.indexOf(inputToken.id);
    inputTokenBalances[inputTokenIndex] = inputTokenBalances[
      inputTokenIndex
    ].plus(depositedCoinAmounts[idx].minus(fees[idx]));
    inputTokenAmounts.push(depositedCoinAmounts[idx]);
    depositAmountUSD = depositAmountUSD.plus(
      depositedCoinAmounts[idx]
        .divDecimal(
          constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal()
        )
        .times(inputToken.lastPriceUSD)
    );
  }
  const totalSupplyAfterDeposit = utils.getOutputTokenSupply(
    poolAddress,
    pool.outputTokenSupply
  );
  const outputTokenMintedAmount = totalSupplyAfterDeposit.minus(
    pool.outputTokenSupply
  );
  pool.inputTokenBalances = inputTokenBalances;
  pool.totalValueLockedUSD = utils.getPoolTVL(
    pool.inputTokens,
    pool.inputTokenBalances,
    block
  );
  const inputTokenWeights = utils.getPoolTokenWeightsForDynamicWeightPools(
    poolAddress,
    pool.inputTokens
  );
  if (inputTokenWeights.length > 0) {
    pool.inputTokenWeights = inputTokenWeights;
  }
  pool.outputTokenSupply = totalSupplyAfterDeposit;
  pool.outputTokenPriceUSD = utils.getOutputTokenPriceUSD(poolAddress, block);
  pool.save();
  createDepositTransaction(
    pool,
    inputTokenAmounts,
    outputTokenMintedAmount,
    depositAmountUSD,
    provider,
    transaction,
    block
  );
  utils.updateProtocolTotalValueLockedUSD();
  UpdateMetricsAfterDeposit(block);
  graph_ts_1.log.info(
    "[AddLiquidity] LiquidityPool: {}, sharesMinted: {}, depositAmount: [{}], inputTokenBalances: [{}], depositAmountUSD: {}, fees: {}, TxnHash: {}",
    [
      poolAddress.toHexString(),
      outputTokenMintedAmount.toString(),
      depositedCoinAmounts.join(", "),
      inputTokenBalances.join(", "),
      depositAmountUSD.truncate(1).toString(),
      fees.join(", "),
      transaction.hash.toHexString(),
    ]
  );
}
exports.Deposit = Deposit;
