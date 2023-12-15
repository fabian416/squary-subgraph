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
exports.handleStrategyAdded =
  exports.handleWithdraw =
  exports.handleDeposit =
    void 0;
const Metrics_1 = require("../modules/Metrics");
const utils = __importStar(require("../common/utils"));
const Deposit_1 = require("../modules/Deposit");
const Withdraw_1 = require("../modules/Withdraw");
const initializers_1 = require("../common/initializers");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../../generated/templates");
function handleDeposit(event) {
  const vaultAddress = event.address;
  const sharesMinted = event.params.sharesMinted;
  const depositAmount = event.params.depositAmount;
  const strategyAddress = event.params.strategyAddress;
  (0, Deposit_1.Deposit)(
    vaultAddress,
    strategyAddress,
    depositAmount,
    sharesMinted,
    event.transaction,
    event.block
  );
  (0, Metrics_1.updateFinancials)(event.block);
  (0, Metrics_1.updateUsageMetrics)(event.block, event.transaction.from);
  (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
  const vaultAddress = event.address;
  const sharesBurnt = event.params.sharesBurnt;
  const withdrawAmount = event.params.withdrawAmount;
  const strategyAddress = event.params.strategyAddress;
  (0, Withdraw_1.Withdraw)(
    vaultAddress,
    strategyAddress,
    withdrawAmount,
    sharesBurnt,
    event.transaction,
    event.block
  );
  (0, Metrics_1.updateFinancials)(event.block);
  (0, Metrics_1.updateUsageMetrics)(event.block, event.transaction.from);
  (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleWithdraw = handleWithdraw;
function handleStrategyAdded(event) {
  const vaultAddress = event.address;
  const strategyAddress = event.params.strategyAddress;
  const underlyingStrategy = utils.getUnderlyingStrategy(strategyAddress);
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  vault.fees = utils.getVaultFees(vaultAddress);
  vault.save();
  const context = new graph_ts_1.DataSourceContext();
  context.setString("vaultAddress", vaultAddress.toHexString());
  templates_1.Strategy.createWithContext(underlyingStrategy, context);
}
exports.handleStrategyAdded = handleStrategyAdded;
