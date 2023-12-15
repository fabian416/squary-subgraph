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
const Revenue_1 = require("./Revenue");
const Prices_1 = require("./Prices");
const Vault_1 = require("../../generated/templates/Strategy/Vault");
function createWithdrawTransaction(
  vault,
  amount,
  amountUSD,
  transaction,
  block
) {
  const withdrawTransactionId = "withdraw-" + transaction.hash.toHexString();
  let withdrawTransaction = schema_1.Withdraw.load(withdrawTransactionId);
  if (!withdrawTransaction) {
    withdrawTransaction = new schema_1.Withdraw(withdrawTransactionId);
    withdrawTransaction.vault = vault.id;
    withdrawTransaction.protocol = constants.PROTOCOL_ID.toHexString();
    withdrawTransaction.to = transaction.to.toHexString();
    withdrawTransaction.from = transaction.from.toHexString();
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
function Withdraw(
  vaultAddress,
  strategyAddress,
  withdrawAmount,
  sharesBurnt,
  transaction,
  block
) {
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
  const vaultContract = Vault_1.Vault.bind(vaultAddress);
  const inputToken = (0, initializers_1.getOrCreateTokenFromString)(
    vault.inputToken,
    block
  );
  const withdrawAmountUSD = withdrawAmount
    .divDecimal(constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal())
    .times(inputToken.lastPriceUSD);
  const withdrawFeePercentage = utils.getStrategyWithdrawalFees(
    vaultAddress,
    strategyAddress
  );
  const withdrawalFeeUSD = withdrawAmountUSD
    .times(withdrawFeePercentage.feePercentage)
    .div(constants.BIGDECIMAL_HUNDRED);
  vault.outputTokenSupply = utils.readValue(
    vaultContract.try_totalSupply(),
    constants.BIGINT_ZERO
  );
  vault.inputTokenBalance = utils.readValue(
    vaultContract.try_calcPoolValueInToken(),
    constants.BIGINT_ZERO
  );
  vault.totalValueLockedUSD = vault.inputTokenBalance
    .divDecimal(constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal())
    .times(inputToken.lastPriceUSD);
  vault.pricePerShare = (0, Prices_1.getPricePerShare)(
    vaultAddress
  ).toBigDecimal();
  vault.outputTokenPriceUSD = (0, Prices_1.getPriceOfOutputTokens)(
    vaultAddress,
    block
  );
  vault.save();
  createWithdrawTransaction(
    vault,
    withdrawAmount,
    withdrawAmountUSD,
    transaction,
    block
  );
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    constants.BIGDECIMAL_ZERO,
    withdrawalFeeUSD,
    block
  );
  utils.updateProtocolTotalValueLockedUSD();
  UpdateMetricsAfterWithdraw(block);
  graph_ts_1.log.info(
    "[Withdraw] vault: {}, sharesBurnt: {}, withdrawAmount: {}, withdrawalFeeUSD: {}, withdrawAmountUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      sharesBurnt.toString(),
      withdrawAmount.toString(),
      withdrawalFeeUSD.toString(),
      withdrawAmountUSD.toString(),
      transaction.hash.toHexString(),
    ]
  );
}
exports.Withdraw = Withdraw;
