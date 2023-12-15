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
exports.handleTreeDistribution =
  exports.handleSetPerformanceFeeStrategist =
  exports.handlePerformanceFeeStrategist =
  exports.handleSetPerformanceFeeGovernance =
  exports.handlePerformanceFeeGovernance =
  exports.handleSetBribesProcessor =
  exports.handleSetWithdrawalFee =
  exports.handleCurveHarvest =
  exports.handleHarvestState =
  exports.handleDiggHarvest =
  exports.handleFarmHarvest =
  exports.handleHarvest =
  exports.handleUpgraded =
    void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const Revenue_1 = require("../modules/Revenue");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const templates_1 = require("../../generated/templates");
function handleUpgraded(event) {
  const strategyAddress = event.address;
  const vaultAddress = utils.getVaultAddressFromContext();
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  const bribesProcessor = utils.getBribesProcessor(
    vaultAddress,
    strategyAddress
  );
  vault._bribesProcessor = bribesProcessor.toHexString();
  vault.save();
  graph_ts_1.log.warning(
    "[Strategy:Upgraded] Vault: {}, BribesProcessor: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      bribesProcessor.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleUpgraded = handleUpgraded;
function handleHarvest(event) {
  const strategyAddress = event.address;
  const harvestedAmount = event.params.harvested;
  if (harvestedAmount.equals(constants.BIGINT_ZERO)) return;
  const vaultAddress = utils.getVaultAddressFromContext();
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  if (vaultAddress.equals(constants.BDIGG_VAULT_ADDRESS)) return;
  const wantToken = utils.getStrategyWantToken(strategyAddress, event.block);
  const wantTokenDecimals = constants.BIGINT_TEN.pow(
    wantToken.decimals
  ).toBigDecimal();
  const supplySideRevenueUSD = harvestedAmount
    .divDecimal(wantTokenDecimals)
    .times(wantToken.lastPriceUSD);
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    supplySideRevenueUSD,
    constants.BIGDECIMAL_ZERO,
    event.block
  );
  graph_ts_1.log.warning(
    "[Harvest] Vault: {}, Strategy: {}, token: {}, amount: {}, amountUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      strategyAddress.toHexString(),
      wantToken.id,
      harvestedAmount.toString(),
      supplySideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleHarvest = handleHarvest;
function handleFarmHarvest(event) {
  const strategyAddress = event.address;
  const rewardTokenEmissionAmount = event.params.farmToRewards;
  const feesToStrategist = event.params.strategistPerformanceFee;
  const feesToGovernance = event.params.governancePerformanceFee;
  const vaultAddress = utils.getVaultAddressFromContext();
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  const rewardToken = utils.getStrategyFarmToken(strategyAddress, event.block);
  const rewardTokenDecimals = constants.BIGINT_TEN.pow(
    rewardToken.decimals
  ).toBigDecimal();
  const supplySideRevenueUSD = rewardTokenEmissionAmount
    .divDecimal(rewardTokenDecimals)
    .times(rewardToken.lastPriceUSD);
  const protocolSideRevenueUSD = feesToStrategist
    .plus(feesToGovernance)
    .divDecimal(rewardTokenDecimals)
    .times(rewardToken.lastPriceUSD);
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    supplySideRevenueUSD,
    protocolSideRevenueUSD,
    event.block
  );
  graph_ts_1.log.warning(
    "[FarmHarvest] Vault: {}, Strategy: {}, FarmToken: {}, supplySideRevenueUSD: {}, protocolSideRevenueUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      strategyAddress.toHexString(),
      rewardToken.id,
      supplySideRevenueUSD.toString(),
      protocolSideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleFarmHarvest = handleFarmHarvest;
function handleDiggHarvest(event) {
  const strategyAddress = event.address;
  const harvestedAmount = event.params.diggIncrease;
  const vaultAddress = utils.getVaultAddressFromContext();
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  const rewardToken = (0, initializers_1.getOrCreateToken)(
    constants.DIGG_TOKEN_ADDRESS,
    event.block
  );
  const rewardTokenDecimals = constants.BIGINT_TEN.pow(
    rewardToken.decimals
  ).toBigDecimal();
  const supplySideRevenueUSD = harvestedAmount
    .divDecimal(rewardTokenDecimals)
    .times(rewardToken.lastPriceUSD);
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    supplySideRevenueUSD,
    constants.BIGDECIMAL_ZERO,
    event.block
  );
  graph_ts_1.log.warning(
    "[DiggHarvestState] Vault: {}, Strategy: {}, FarmToken: {}, supplySideRevenueUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      strategyAddress.toHexString(),
      rewardToken.id,
      supplySideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleDiggHarvest = handleDiggHarvest;
function handleHarvestState(event) {
  const strategyAddress = event.address;
  const feesToStrategist = event.params.toStrategist;
  const feesToGovernance = event.params.toGovernance;
  const rewardTokenEmissionAmount = event.params.toBadgerTree;
  const vaultAddress = utils.getVaultAddressFromContext();
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  const rewardToken = utils.getStrategyXSushiToken(
    strategyAddress,
    event.block
  );
  const rewardTokenDecimals = constants.BIGINT_TEN.pow(
    rewardToken.decimals
  ).toBigDecimal();
  const supplySideRevenueUSD = rewardTokenEmissionAmount
    .divDecimal(rewardTokenDecimals)
    .times(rewardToken.lastPriceUSD);
  const protocolSideRevenueUSD = feesToStrategist
    .plus(feesToGovernance)
    .divDecimal(rewardTokenDecimals)
    .times(rewardToken.lastPriceUSD);
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    supplySideRevenueUSD,
    protocolSideRevenueUSD,
    event.block
  );
  graph_ts_1.log.warning(
    "[HarvestState] Vault: {}, Strategy: {}, XSushiToken: {}, supplySideRevenueUSD: {}, protocolSideRevenueUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      strategyAddress.toHexString(),
      rewardToken.id,
      supplySideRevenueUSD.toString(),
      protocolSideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleHarvestState = handleHarvestState;
function handleCurveHarvest(event) {
  const strategyAddress = event.address;
  const feesToStrategist = event.params.strategistPerformanceFee;
  const feesToGovernance = event.params.governancePerformanceFee;
  const rewardTokenEmissionAmount = event.params.crvHarvested;
  const vaultAddress = utils.getVaultAddressFromContext();
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  const wantToken = (0, initializers_1.getOrCreateToken)(
    constants.CRV_DAO_TOKEN,
    event.block
  );
  const rewardTokenDecimals = constants.BIGINT_TEN.pow(
    wantToken.decimals
  ).toBigDecimal();
  const supplySideRevenueUSD = rewardTokenEmissionAmount
    .divDecimal(rewardTokenDecimals)
    .times(wantToken.lastPriceUSD);
  const protocolSideRevenueUSD = feesToStrategist
    .plus(feesToGovernance)
    .divDecimal(rewardTokenDecimals)
    .times(wantToken.lastPriceUSD);
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    supplySideRevenueUSD,
    protocolSideRevenueUSD,
    event.block
  );
  graph_ts_1.log.warning(
    "[CurveHarvest] Vault: {}, Strategy: {}, XSushiToken: {}, supplySideRevenueUSD: {}, protocolSideRevenueUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      strategyAddress.toHexString(),
      wantToken.id,
      supplySideRevenueUSD.toString(),
      protocolSideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleCurveHarvest = handleCurveHarvest;
function handleSetWithdrawalFee(event) {
  const strategyAddress = event.address;
  const vaultAddress = utils.getVaultAddressFromContext();
  const withdrawalFees = utils.getVaultWithdrawalFees(
    vaultAddress,
    strategyAddress
  );
  graph_ts_1.log.warning(
    "[SetWithdrawalFee] Vault: {}, Strategy: {}, withdrawalFees: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      strategyAddress.toHexString(),
      withdrawalFees.feePercentage.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleSetWithdrawalFee = handleSetWithdrawalFee;
function handleSetBribesProcessor(call) {
  const bribesProcessor = call.inputs.newBribesProcessor;
  const vaultAddress = utils.getVaultAddressFromContext();
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, call.block);
  vault._bribesProcessor = bribesProcessor.toHexString();
  vault.save();
  const context = new graph_ts_1.DataSourceContext();
  context.setString("vaultAddress", vaultAddress.toHexString());
  templates_1.BribesProcessor.createWithContext(bribesProcessor, context);
  graph_ts_1.log.warning(
    "[Strategy:NewBribesProcessor] Vault: {}, BribesProcessor: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      bribesProcessor.toHexString(),
      call.transaction.hash.toHexString(),
    ]
  );
}
exports.handleSetBribesProcessor = handleSetBribesProcessor;
function handlePerformanceFeeGovernance(event) {
  const tokenAddress = event.params.token;
  const performanceFeeAmount = event.params.amount;
  if (performanceFeeAmount.equals(constants.BIGINT_ZERO)) return;
  const vaultAddress = utils.getVaultAddressFromContext();
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
    "[Strategy:PerformanceFeeGovernance] Vault: {}, wantToken: {}, amount: {}, protocolSideRevenueUSD: {}, TxnHash: {}",
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
function handleSetPerformanceFeeGovernance(event) {
  const strategyAddress = event.address;
  const vaultAddress = utils.getVaultAddressFromContext();
  const performanceFees = utils.getVaultPerformanceFees(
    vaultAddress,
    strategyAddress
  );
  graph_ts_1.log.warning(
    "[SetPerformanceFeeGovernance] Vault: {}, Strategy: {}, withdrawalFees: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      strategyAddress.toHexString(),
      performanceFees.feePercentage.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleSetPerformanceFeeGovernance = handleSetPerformanceFeeGovernance;
function handlePerformanceFeeStrategist(event) {
  const tokenAddress = event.params.token;
  const performanceFeeAmount = event.params.amount;
  if (performanceFeeAmount.equals(constants.BIGINT_ZERO)) return;
  const vaultAddress = utils.getVaultAddressFromContext();
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
    "[Strategy:PerformanceFeeStrategist] Vault: {}, token: {}, amount: {}, protocolSideRevenueUSD: {}, TxnHash: {}",
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
function handleSetPerformanceFeeStrategist(event) {
  const strategyAddress = event.address;
  const vaultAddress = utils.getVaultAddressFromContext();
  const performanceFees = utils.getVaultPerformanceFees(
    vaultAddress,
    strategyAddress
  );
  graph_ts_1.log.warning(
    "[SetPerformanceFeeStrategist] Vault: {}, Strategy: {}, withdrawalFees: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      strategyAddress.toHexString(),
      performanceFees.feePercentage.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleSetPerformanceFeeStrategist = handleSetPerformanceFeeStrategist;
function handleTreeDistribution(event) {
  const strategyAddress = event.address;
  const rewardTokenAddress = event.params.token;
  const rewardTokenEmissionAmount = event.params.amount;
  const vaultAddress = utils.getVaultAddressFromContext();
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
    "[TreeDistribution] Vault: {}, Strategy: {}, supplySideRevenueUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      strategyAddress.toHexString(),
      supplySideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleTreeDistribution = handleTreeDistribution;
