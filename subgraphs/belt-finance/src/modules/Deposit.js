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
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const Revenue_1 = require("./Revenue");
const Prices_1 = require("./Prices");
const Vault_1 = require("../../generated/templates/Strategy/Vault");
function createDepositTransaction(
  vault,
  amount,
  amountUSD,
  transaction,
  block
) {
  const transactionId = "deposit-" + transaction.hash.toHexString();
  let depositTransaction = schema_1.Deposit.load(transactionId);
  if (!depositTransaction) {
    depositTransaction = new schema_1.Deposit(transactionId);
    depositTransaction.vault = vault.id;
    depositTransaction.protocol = constants.PROTOCOL_ID.toHexString();
    depositTransaction.to = vault.id;
    depositTransaction.from = transaction.from.toHexString();
    depositTransaction.hash = transaction.hash.toHexString();
    depositTransaction.logIndex = transaction.index.toI32();
    depositTransaction.asset = vault.inputToken;
    depositTransaction.amount = amount;
    depositTransaction.amountUSD = amountUSD;
    depositTransaction.timestamp = block.timestamp;
    depositTransaction.blockNumber = block.number;
    depositTransaction.save();
  }
  return depositTransaction;
}
exports.createDepositTransaction = createDepositTransaction;
function UpdateMetricsAfterDeposit(block) {
  const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
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
  vaultAddress,
  strategyAddress,
  depositAmount,
  sharesMinted,
  transaction,
  block
) {
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
  const vaultContract = Vault_1.Vault.bind(vaultAddress);
  const inputToken = (0, initializers_1.getOrCreateTokenFromString)(
    vault.inputToken,
    block
  );
  const depositAmountUSD = depositAmount
    .divDecimal(constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal())
    .times(inputToken.lastPriceUSD);
  const depositFeePercentage = utils.getStrategyWithdrawalFees(
    vaultAddress,
    strategyAddress
  );
  const depositFeeUSD = depositAmountUSD
    .times(depositFeePercentage.feePercentage)
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
  createDepositTransaction(
    vault,
    depositAmount,
    depositAmountUSD,
    transaction,
    block
  );
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    constants.BIGDECIMAL_ZERO,
    depositFeeUSD,
    block
  );
  utils.updateProtocolTotalValueLockedUSD();
  UpdateMetricsAfterDeposit(block);
  graph_ts_1.log.info(
    "[Deposit] vault: {}, sharesMinted: {}, depositAmount: {}, depositAmountUSD: {}, depositFeeUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      sharesMinted.toString(),
      depositAmount.toString(),
      depositAmountUSD.toString(),
      depositFeeUSD.toString(),
      transaction.hash.toHexString(),
    ]
  );
}
exports.Deposit = Deposit;
