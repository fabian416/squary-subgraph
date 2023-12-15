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
exports.withdraw =
  exports.UpdateMetricsAfterWithdraw =
  exports.createWithdrawTransaction =
    void 0;
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const prices_1 = require("../prices");
const constants = __importStar(require("../common/constants"));
const ERC20_1 = require("../../generated/Booster/ERC20");
const Pool_1 = require("../../generated/Booster/Pool");
function createWithdrawTransaction(
  vault,
  amount,
  amountUSD,
  withdrawnTo,
  transaction,
  block
) {
  const withdrawTransactionId = "withdraw-" + transaction.hash.toHexString();
  let withdrawTransaction = schema_1.Withdraw.load(withdrawTransactionId);
  if (!withdrawTransaction) {
    withdrawTransaction = new schema_1.Withdraw(withdrawTransactionId);
    withdrawTransaction.vault = vault.id;
    withdrawTransaction.protocol =
      constants.CONVEX_BOOSTER_ADDRESS.toHexString();
    withdrawTransaction.to = withdrawnTo.toHexString();
    withdrawTransaction.from = vault.id;
    withdrawTransaction.hash = transaction.hash.toHexString();
    withdrawTransaction.logIndex = transaction.index.toI32();
    withdrawTransaction.asset = vault.inputToken;
    withdrawTransaction.amount = amount;
    withdrawTransaction.amountUSD = amountUSD;
    withdrawTransaction.timestamp = block.timestamp;
    withdrawTransaction.blockNumber = block.number;
    withdrawTransaction.save();
  }
  return withdrawTransaction;
}
exports.createWithdrawTransaction = createWithdrawTransaction;
function UpdateMetricsAfterWithdraw(block) {
  const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
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
function withdraw(vault, withdrawAmount, withdrawnTo, transaction, block) {
  const poolAddress = graph_ts_1.Address.fromString(vault._pool);
  const poolContract = Pool_1.Pool.bind(poolAddress);
  const outputTokenContract = ERC20_1.ERC20.bind(
    graph_ts_1.Address.fromString(vault.outputToken)
  );
  const inputTokenAddress = graph_ts_1.Address.fromString(vault.inputToken);
  let inputTokenPrice = (0, prices_1.getUsdPricePerToken)(
    inputTokenAddress,
    block
  );
  let inputTokenDecimals = utils.getTokenDecimals(inputTokenAddress);
  if (constants.MISSING_POOLS_MAP.get(inputTokenAddress)) {
    const poolTokenAddress = constants.MISSING_POOLS_MAP.get(inputTokenAddress);
    inputTokenPrice = (0, prices_1.getUsdPricePerToken)(
      poolTokenAddress,
      block
    );
    inputTokenDecimals = utils.getTokenDecimals(poolTokenAddress);
  }
  const withdrawAmountUSD = withdrawAmount
    .toBigDecimal()
    .div(inputTokenDecimals)
    .times(inputTokenPrice.usdPrice);
  vault.outputTokenSupply = utils.readValue(
    outputTokenContract.try_totalSupply(),
    constants.BIGINT_ZERO
  );
  vault.inputTokenBalance = vault.inputTokenBalance.minus(withdrawAmount);
  vault.totalValueLockedUSD = vault.inputTokenBalance
    .toBigDecimal()
    .div(inputTokenDecimals)
    .times(inputTokenPrice.usdPrice);
  vault.pricePerShare = utils
    .readValue(poolContract.try_get_virtual_price(), constants.BIGINT_ZERO)
    .toBigDecimal();
  createWithdrawTransaction(
    vault,
    withdrawAmount,
    withdrawAmountUSD,
    withdrawnTo,
    transaction,
    block
  );
  vault.save();
  utils.updateProtocolTotalValueLockedUSD();
  UpdateMetricsAfterWithdraw(block);
  graph_ts_1.log.info(
    "[Withdraw] vault: {}, withdrawAmount: {}, withdrawAmountUSD: {}, outputTokenPriceUSD: {}, TxnHash: {}",
    [
      vault.id,
      withdrawAmount.toString(),
      withdrawAmountUSD.toString(),
      vault.outputTokenPriceUSD.toString(),
      transaction.hash.toHexString(),
    ]
  );
}
exports.withdraw = withdraw;
