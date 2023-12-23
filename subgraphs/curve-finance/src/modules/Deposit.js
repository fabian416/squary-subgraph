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
  pool,
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
    depositTransaction.pool = pool.id;
    depositTransaction.protocol = (0,
    initializers_1.getOrCreateDexAmmProtocol)().id;
    depositTransaction.to = pool.id;
    depositTransaction.from = provider.toHexString();
    depositTransaction.hash = transaction.hash.toHexString();
    depositTransaction.logIndex = transaction.index.toI32();
    depositTransaction.inputTokens = pool._inputTokensOrdered;
    depositTransaction.inputTokenAmounts = inputTokenAmounts;
    depositTransaction.outputToken = pool.outputToken;
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
  depositedCoinAmounts,
  totalSupplyAfterDeposit,
  provider,
  transaction,
  block
) {
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(poolAddress, block);
  const inputTokenAmounts = [];
  let depositAmountUSD = constants.BIGDECIMAL_ZERO;
  const outputTokenMintedAmount = totalSupplyAfterDeposit.minus(
    pool.outputTokenSupply
  );
  for (let idx = 0; idx < depositedCoinAmounts.length; idx++) {
    const inputToken = utils.getOrCreateTokenFromString(
      pool._inputTokensOrdered[idx],
      block
    );
    const inputTokenDecimals = utils.exponentToBigDecimal(inputToken.decimals);
    inputTokenAmounts.push(depositedCoinAmounts[idx]);
    depositAmountUSD = depositAmountUSD.plus(
      depositedCoinAmounts[idx]
        .divDecimal(inputTokenDecimals)
        .times(inputToken.lastPriceUSD)
    );
  }
  pool.inputTokenBalances = utils.getPoolBalances(pool);
  pool.totalValueLockedUSD = utils.getPoolTVL(
    pool,
    totalSupplyAfterDeposit,
    block
  );
  pool._tvlUSDExcludingBasePoolLpTokens =
    utils.getPoolTVLExcludingBasePoolLpToken(pool, block);
  pool.inputTokenWeights = utils.getPoolTokenWeights(
    pool.inputTokens,
    pool.inputTokenBalances,
    block
  );
  pool.outputTokenSupply = totalSupplyAfterDeposit;
  pool.outputTokenPriceUSD = utils.getOrCreateTokenFromString(
    pool.outputToken,
    block
  ).lastPriceUSD;
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
  utils.updateProtocolTotalValueLockedUSD(block);
  UpdateMetricsAfterDeposit(block);
  graph_ts_1.log.info(
    "[AddLiquidity] LiquidityPool: {}, sharesMinted: {}, depositAmount: [{}], depositAmountUSD: {}, TxnHash: {}",
    [
      poolAddress.toHexString(),
      outputTokenMintedAmount.toString(),
      depositedCoinAmounts.join(", "),
      depositAmountUSD.truncate(1).toString(),
      transaction.hash.toHexString(),
    ]
  );
}
exports.Deposit = Deposit;