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
exports.handleSentBribeToTree =
  exports.handleSentBribeToGovernance =
  exports.handlePerformanceFeeGovernance =
  exports.handleBribeEmission =
    void 0;
const utils = __importStar(require("../common/utils"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("../common/constants"));
const Revenue_1 = require("../modules/Revenue");
const initializers_1 = require("../common/initializers");
function handleBribeEmission(event) {
  const tokenAddress = event.params.token;
  const bribeEmissionAmount = event.params.amount;
  if (bribeEmissionAmount.equals(constants.BIGINT_ZERO)) return;
  const vaultAddress = utils.getVaultAddressFromContext();
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  const wantToken = (0, initializers_1.getOrCreateToken)(
    tokenAddress,
    event.block
  );
  const wantTokenDecimals = constants.BIGINT_TEN.pow(
    wantToken.decimals
  ).toBigDecimal();
  const supplySideRevenueUSD = bribeEmissionAmount
    .divDecimal(wantTokenDecimals)
    .times(wantToken.lastPriceUSD);
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    supplySideRevenueUSD,
    constants.BIGDECIMAL_ZERO,
    event.block
  );
  graph_ts_1.log.warning(
    "[Bribes:BribeEmission] Vault: {}, wantToken: {}, bribeEmissionAmount: {}, supplySideRevenueUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      tokenAddress.toHexString(),
      bribeEmissionAmount.toString(),
      supplySideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleBribeEmission = handleBribeEmission;
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
    "[Bribes:PerformanceFeeGovernance] Vault: {}, wantToken: {}, amount: {}, protocolSideRevenueUSD: {}, TxnHash: {}",
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
function handleSentBribeToGovernance(event) {
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
    "[SentBribeToGovernance] Vault: {}, wantToken: {}, amount: {}, protocolSideRevenueUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      tokenAddress.toHexString(),
      performanceFeeAmount.toString(),
      protocolSideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleSentBribeToGovernance = handleSentBribeToGovernance;
function handleSentBribeToTree(event) {
  const bribesAddress = event.address;
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
    "[SentBribeToTree] Vault: {}, BribesProcessor: {}, supplySideRevenueUSD: {}, TxnHash: {}",
    [
      vaultAddress.toHexString(),
      bribesAddress.toHexString(),
      supplySideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleSentBribeToTree = handleSentBribeToTree;
