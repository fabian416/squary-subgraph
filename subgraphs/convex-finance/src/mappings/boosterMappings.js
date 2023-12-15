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
exports.handleSetFees =
  exports.handleWithdrawn =
  exports.handleDeposited =
  exports.handleAddPool =
    void 0;
const Metric_1 = require("../modules/Metric");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const Deposit_1 = require("../modules/Deposit");
const Withdraw_1 = require("../modules/Withdraw");
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const schema_1 = require("../../generated/schema");
function handleAddPool(call) {
  // Update PoolId
  const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
  const poolId = protocol._poolCount;
  protocol._poolCount = protocol._poolCount.plus(constants.BIGINT_ONE);
  protocol.save();
  (0, initializers_1.getOrCreateVault)(poolId, call.block);
}
exports.handleAddPool = handleAddPool;
function handleDeposited(event) {
  const poolId = event.params.poolid;
  const depositAmount = event.params.amount;
  const vault = (0, initializers_1.getOrCreateVault)(poolId, event.block);
  if (vault) {
    (0, Deposit_1.Deposit)(
      vault,
      depositAmount,
      event.params.user,
      event.transaction,
      event.block
    );
  }
  (0, Metric_1.updateFinancials)(event.block);
  (0, Metric_1.updateUsageMetrics)(event.block, event.transaction.from);
  (0, Metric_1.updateVaultSnapshots)(poolId, event.block);
}
exports.handleDeposited = handleDeposited;
function handleWithdrawn(event) {
  const poolId = event.params.poolid;
  const withdrawAmount = event.params.amount;
  const vault = (0, initializers_1.getOrCreateVault)(poolId, event.block);
  if (vault) {
    (0, Withdraw_1.withdraw)(
      vault,
      withdrawAmount,
      event.params.user,
      event.transaction,
      event.block
    );
  }
  (0, Metric_1.updateFinancials)(event.block);
  (0, Metric_1.updateUsageMetrics)(event.block, event.transaction.from);
  (0, Metric_1.updateVaultSnapshots)(poolId, event.block);
}
exports.handleWithdrawn = handleWithdrawn;
function handleSetFees(call) {
  const lockFees = call.inputs._lockFees;
  const callerFees = call.inputs._callerFees;
  const stakerFees = call.inputs._stakerFees;
  const platformFees = call.inputs._platform;
  const newFees = new types_1.CustomFeesType(
    lockFees,
    callerFees,
    stakerFees,
    platformFees
  );
  const performanceFeeId = utils
    .enumToPrefix(constants.VaultFeeType.PERFORMANCE_FEE)
    .concat(constants.CONVEX_BOOSTER_ADDRESS.toHexString());
  const fees = schema_1.VaultFee.load(performanceFeeId);
  fees.feePercentage = newFees.totalFees();
  fees.save();
}
exports.handleSetFees = handleSetFees;
