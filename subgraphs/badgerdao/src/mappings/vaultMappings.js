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
exports.handleWithdrawAll =
  exports.handleWithdraw =
  exports.handleDepositAllWithProof =
  exports.handleDepositAll =
  exports.handleDepositForWithProof =
  exports.handleDepositFor =
  exports.handleDepositWithProof =
  exports.handleDeposit =
  exports.handleHarvested =
  exports.handleWithdrawalFee =
  exports.handleTreeDistribution =
  exports.handlePerformanceFeeStrategist =
  exports.handlePerformanceFeeGovernance =
    void 0;
const Metrics_1 = require("../modules/Metrics");
const Deposit_1 = require("../modules/Deposit");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Withdraw_1 = require("../modules/Withdraw");
const constants = __importStar(require("../common/constants"));
const Revenue_1 = require("../modules/Revenue");
const initializers_1 = require("../common/initializers");
function handlePerformanceFeeGovernance(event) {
  const vaultAddress = event.address;
  const tokenAddress = event.params.token;
  const performanceFeeAmount = event.params.amount;
  if (performanceFeeAmount.equals(constants.BIGINT_ZERO)) return;
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  const wantToken = (0, initializers_1.getOrCreateToken)(
    tokenAddress,
    event.block
  );
  const wantTokenDecimals = constants.BIGINT_TEN.pow(
    wantToken.decimals
  ).toBigDecimal();
  const protocolSideRevenueUSD = performanceFeeAmount
    .divDecimal(wantTokenDecimals)
    .times(wantToken.lastPriceUSD);
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    constants.BIGDECIMAL_ZERO,
    protocolSideRevenueUSD,
    event.block
  );
  graph_ts_1.log.warning(
    "[Vault:PerformanceFeeGovernance] Vault: {}, wantToken: {}, amount: {}, protocolSideRevenueUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      tokenAddress.toHexString(),
      performanceFeeAmount.toString(),
      protocolSideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handlePerformanceFeeGovernance = handlePerformanceFeeGovernance;
function handlePerformanceFeeStrategist(event) {
  const vaultAddress = event.address;
  const tokenAddress = event.params.token;
  const performanceFeeAmount = event.params.amount;
  if (performanceFeeAmount.equals(constants.BIGINT_ZERO)) return;
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  const wantToken = (0, initializers_1.getOrCreateToken)(
    tokenAddress,
    event.block
  );
  const wantTokenDecimals = constants.BIGINT_TEN.pow(
    wantToken.decimals
  ).toBigDecimal();
  const protocolSideRevenueUSD = performanceFeeAmount
    .divDecimal(wantTokenDecimals)
    .times(wantToken.lastPriceUSD);
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    constants.BIGDECIMAL_ZERO,
    protocolSideRevenueUSD,
    event.block
  );
  graph_ts_1.log.warning(
    "[Vault:PerformanceFeeStrategist] Vault: {}, token: {}, amount: {}, protocolSideRevenueUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      tokenAddress.toHexString(),
      performanceFeeAmount.toString(),
      protocolSideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handlePerformanceFeeStrategist = handlePerformanceFeeStrategist;
function handleTreeDistribution(event) {
  const vaultAddress = event.address;
  const rewardTokenAddress = event.params.token;
  const rewardTokenEmissionAmount = event.params.amount;
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  const rewardToken = (0, initializers_1.getOrCreateToken)(
    rewardTokenAddress,
    event.block
  );
  const rewardTokenDecimals = constants.BIGINT_TEN.pow(
    rewardToken.decimals
  ).toBigDecimal();
  const supplySideRevenueUSD = rewardTokenEmissionAmount
    .divDecimal(rewardTokenDecimals)
    .times(rewardToken.lastPriceUSD);
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    supplySideRevenueUSD,
    constants.BIGDECIMAL_ZERO,
    event.block
  );
  graph_ts_1.log.warning(
    "[Vault:TreeDistribution] Vault: {}, rewardTokenAddress: {}, Amount: {}, supplySideRevenueUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      rewardTokenAddress.toHexString(),
      rewardTokenEmissionAmount.toString(),
      supplySideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleTreeDistribution = handleTreeDistribution;
function handleWithdrawalFee(event) {
  const vaultAddress = event.address;
  const wantTokenAddress = event.params.token;
  const withdrawalFeeAmount = event.params.amount;
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  const wantToken = (0, initializers_1.getOrCreateToken)(
    wantTokenAddress,
    event.block
  );
  const wantTokenDecimals = constants.BIGINT_TEN.pow(
    wantToken.decimals
  ).toBigDecimal();
  const protocolSideRevenueUSD = withdrawalFeeAmount
    .divDecimal(wantTokenDecimals)
    .times(wantToken.lastPriceUSD);
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    constants.BIGDECIMAL_ZERO,
    protocolSideRevenueUSD,
    event.block
  );
  graph_ts_1.log.warning(
    "[Vault: WithdrawalFee] Vault: {}, token: {}, amount: {}, protocolSideRevenueUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      wantTokenAddress.toHexString(),
      withdrawalFeeAmount.toString(),
      protocolSideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleWithdrawalFee = handleWithdrawalFee;
function handleHarvested(event) {
  const harvestedAmount = event.params.amount;
  const harvestTokenAddress = event.params.token;
  if (harvestedAmount.equals(constants.BIGINT_ZERO)) return;
  const vaultAddress = event.address;
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  const harvestedToken = (0, initializers_1.getOrCreateToken)(
    harvestTokenAddress,
    event.block
  );
  const harvestedTokenDecimals = constants.BIGINT_TEN.pow(
    harvestedToken.decimals
  ).toBigDecimal();
  const supplySideRevenueUSD = harvestedAmount
    .divDecimal(harvestedTokenDecimals)
    .times(harvestedToken.lastPriceUSD);
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    supplySideRevenueUSD,
    constants.BIGDECIMAL_ZERO,
    event.block
  );
  graph_ts_1.log.warning(
    "[Vault: Harvested] Vault: {}, token: {}, amount: {}, amountUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      harvestTokenAddress.toHexString(),
      harvestedAmount.toString(),
      supplySideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleHarvested = handleHarvested;
function handleDeposit(call) {
  const vaultAddress = call.to;
  const depositAmount = call.inputs._amount;
  (0, Deposit_1.Deposit)(
    vaultAddress,
    depositAmount,
    call.transaction.from,
    call.transaction,
    call.block
  );
  (0, Metrics_1.updateFinancials)(call.block);
  (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
  (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleDeposit = handleDeposit;
function handleDepositWithProof(call) {
  const vaultAddress = call.to;
  const depositAmount = call.inputs._amount;
  (0, Deposit_1.Deposit)(
    vaultAddress,
    depositAmount,
    call.transaction.from,
    call.transaction,
    call.block
  );
  (0, Metrics_1.updateFinancials)(call.block);
  (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
  (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleDepositWithProof = handleDepositWithProof;
function handleDepositFor(call) {
  const vaultAddress = call.to;
  const depositAmount = call.inputs._amount;
  const recipientAddress = call.inputs._recipient;
  (0, Deposit_1.Deposit)(
    vaultAddress,
    depositAmount,
    recipientAddress,
    call.transaction,
    call.block
  );
  (0, Metrics_1.updateFinancials)(call.block);
  (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
  (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleDepositFor = handleDepositFor;
function handleDepositForWithProof(call) {
  const vaultAddress = call.to;
  const depositAmount = call.inputs._amount;
  const recipientAddress = call.inputs._recipient;
  (0, Deposit_1.Deposit)(
    vaultAddress,
    depositAmount,
    recipientAddress,
    call.transaction,
    call.block
  );
  (0, Metrics_1.updateFinancials)(call.block);
  (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
  (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleDepositForWithProof = handleDepositForWithProof;
function handleDepositAll(call) {
  const vaultAddress = call.to;
  const depositAmount = constants.BIGINT_NEGATIVE_ONE;
  (0, Deposit_1.Deposit)(
    vaultAddress,
    depositAmount,
    call.transaction.from,
    call.transaction,
    call.block
  );
  (0, Metrics_1.updateFinancials)(call.block);
  (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
  (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleDepositAll = handleDepositAll;
function handleDepositAllWithProof(call) {
  const vaultAddress = call.to;
  const depositAmount = constants.BIGINT_NEGATIVE_ONE;
  (0, Deposit_1.Deposit)(
    vaultAddress,
    depositAmount,
    call.transaction.from,
    call.transaction,
    call.block
  );
  (0, Metrics_1.updateFinancials)(call.block);
  (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
  (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleDepositAllWithProof = handleDepositAllWithProof;
function handleWithdraw(call) {
  const vaultAddress = call.to;
  const sharesBurnt = call.inputs._shares;
  (0, Withdraw_1.Withdraw)(
    vaultAddress,
    sharesBurnt,
    call.transaction,
    call.block
  );
  (0, Metrics_1.updateFinancials)(call.block);
  (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
  (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleWithdraw = handleWithdraw;
function handleWithdrawAll(call) {
  const vaultAddress = call.to;
  const sharesBurnt = constants.BIGINT_NEGATIVE_ONE;
  (0, Withdraw_1.Withdraw)(
    vaultAddress,
    sharesBurnt,
    call.transaction,
    call.block
  );
  (0, Metrics_1.updateFinancials)(call.block);
  (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
  (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleWithdrawAll = handleWithdrawAll;
