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
exports.updateProtocolAfterNewVault =
  exports.updateProtocolTotalValueLockedUSD =
  exports.deactivateFinishedRewards =
  exports.getVaultFees =
  exports.getVaultPerformanceFees =
  exports.getVaultWithdrawalFees =
  exports.getVaultAddressFromContext =
  exports.getControllerAddress =
  exports.getBribesProcessor =
  exports.getVaultAddressFromController =
  exports.getVaultStrategy =
  exports.getStrategyXSushiToken =
  exports.getStrategyFarmToken =
  exports.getStrategyWantToken =
  exports.getTokenDecimals =
  exports.readValue =
  exports.enumToPrefix =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("./initializers");
const templates_1 = require("../../generated/templates");
const types_1 = require("./types");
const constants = __importStar(require("./constants"));
const Rewards_1 = require("../modules/Rewards");
const ERC20_1 = require("../../generated/templates/Strategy/ERC20");
const schema_1 = require("../../generated/schema");
const Vault_1 = require("../../generated/templates/Strategy/Vault");
const Strategy_1 = require("../../generated/templates/Strategy/Strategy");
const Controller_1 = require("../../generated/templates/Strategy/Controller");
const RewardsLogger_1 = require("../../generated/templates/Strategy/RewardsLogger");
function enumToPrefix(snake) {
  return snake.toLowerCase().replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
function readValue(callResult, defaultValue) {
  return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function getTokenDecimals(tokenAddr) {
  const token = ERC20_1.ERC20.bind(tokenAddr);
  const decimals = readValue(token.try_decimals(), 18);
  return constants.BIGINT_TEN.pow(decimals).toBigDecimal();
}
exports.getTokenDecimals = getTokenDecimals;
function getStrategyWantToken(strategyAddress, block) {
  const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
  const wantTokenAddress = readValue(
    strategyContract.try_want(),
    constants.NULL.TYPE_ADDRESS
  );
  return (0, initializers_1.getOrCreateToken)(wantTokenAddress, block);
}
exports.getStrategyWantToken = getStrategyWantToken;
function getStrategyFarmToken(strategyAddress, block) {
  const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
  const farmTokenAddress = readValue(
    strategyContract.try_farm(),
    constants.NULL.TYPE_ADDRESS
  );
  return (0, initializers_1.getOrCreateToken)(farmTokenAddress, block);
}
exports.getStrategyFarmToken = getStrategyFarmToken;
function getStrategyXSushiToken(strategyAddress, block) {
  const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
  const farmTokenAddress = readValue(
    strategyContract.try_xsushi(),
    constants.NULL.TYPE_ADDRESS
  );
  return (0, initializers_1.getOrCreateToken)(farmTokenAddress, block);
}
exports.getStrategyXSushiToken = getStrategyXSushiToken;
function getVaultStrategy(vaultAddress, lpToken) {
  // Method 1: Vault strategy view function
  const vaultContract = Vault_1.Vault.bind(vaultAddress);
  let strategyAddress = readValue(
    vaultContract.try_strategy(),
    constants.NULL.TYPE_ADDRESS
  );
  if (strategyAddress.notEqual(constants.NULL.TYPE_ADDRESS))
    return strategyAddress;
  // Method 2: Using Controller
  const controllerAddress = readValue(
    vaultContract.try_controller(),
    constants.NULL.TYPE_ADDRESS
  );
  const controllerContract = Controller_1.Controller.bind(controllerAddress);
  strategyAddress = readValue(
    controllerContract.try_strategies(lpToken),
    constants.NULL.TYPE_ADDRESS
  );
  return strategyAddress;
}
exports.getVaultStrategy = getVaultStrategy;
function getVaultAddressFromController(controllerAddress, wantToken) {
  const controllerContract = Controller_1.Controller.bind(controllerAddress);
  let vaultAddress = readValue(
    controllerContract.try_vaults(wantToken),
    constants.NULL.TYPE_ADDRESS
  );
  if (vaultAddress.notEqual(constants.NULL.TYPE_ADDRESS)) return vaultAddress;
  if (
    controllerAddress.equals(constants.CONTROLLER_ADDRESS) &&
    wantToken.equals(constants.CVX_TOKEN_ADDRESS)
  )
    return constants.BVECVX_VAULT_ADDRESS;
  const wantTokenStore = (0, initializers_1.getOrCreateWantToken)(
    wantToken,
    null
  );
  vaultAddress = graph_ts_1.Address.fromString(wantTokenStore.vaultAddress);
  return vaultAddress;
}
exports.getVaultAddressFromController = getVaultAddressFromController;
function getBribesProcessor(vaultAddress, strategyAddress) {
  const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
  let bribesProcessor = readValue(
    strategyContract.try_BRIBES_PROCESSOR(),
    constants.NULL.TYPE_ADDRESS
  );
  if (bribesProcessor.equals(constants.NULL.TYPE_ADDRESS)) {
    bribesProcessor = readValue(
      strategyContract.try_bribesProcessor(),
      constants.NULL.TYPE_ADDRESS
    );
  }
  if (bribesProcessor.notEqual(constants.NULL.TYPE_ADDRESS)) {
    const context = new graph_ts_1.DataSourceContext();
    context.setString("vaultAddress", vaultAddress.toHexString());
    templates_1.BribesProcessor.createWithContext(bribesProcessor, context);
    graph_ts_1.log.warning(
      "[SetBribesProcessor] Vault: {}, Strategy: {}, bribesProcessor: {}",
      [
        vaultAddress.toHexString(),
        strategyAddress.toHexString(),
        bribesProcessor.toHexString(),
      ]
    );
  }
  return bribesProcessor;
}
exports.getBribesProcessor = getBribesProcessor;
function getControllerAddress(vaultAddress) {
  const vaultContract = Vault_1.Vault.bind(vaultAddress);
  const controllerAddress = readValue(
    vaultContract.try_controller(),
    constants.NULL.TYPE_ADDRESS
  );
  if (controllerAddress.notEqual(constants.NULL.TYPE_ADDRESS))
    templates_1.Controller.create(controllerAddress);
  return controllerAddress;
}
exports.getControllerAddress = getControllerAddress;
function getVaultAddressFromContext() {
  const context = graph_ts_1.dataSource.context();
  return graph_ts_1.Address.fromString(context.getString("vaultAddress"));
}
exports.getVaultAddressFromContext = getVaultAddressFromContext;
function getVaultWithdrawalFees(vaultAddress, strategyAddress) {
  const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
  let withdrawalFee = readValue(
    strategyContract.try_withdrawalFee(),
    constants.BIGINT_ZERO
  );
  if (withdrawalFee.equals(constants.BIGINT_ZERO)) {
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    withdrawalFee = readValue(
      vaultContract.try_withdrawalFee(),
      constants.BIGINT_ZERO
    );
  }
  const withdrawalFees = (0, initializers_1.getOrCreateVaultFee)(
    enumToPrefix(constants.VaultFeeType.WITHDRAWAL_FEE).concat(
      vaultAddress.toHexString()
    ),
    constants.VaultFeeType.WITHDRAWAL_FEE,
    withdrawalFee
      .divDecimal(constants.MAX_BPS)
      .times(constants.BIGDECIMAL_HUNDRED)
  );
  return withdrawalFees;
}
exports.getVaultWithdrawalFees = getVaultWithdrawalFees;
function getVaultPerformanceFees(vaultAddress, strategyAddress) {
  const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
  let performanceFeeGovernance = readValue(
    strategyContract.try_performanceFeeGovernance(),
    constants.BIGINT_ZERO
  );
  if (performanceFeeGovernance.equals(constants.BIGINT_ZERO)) {
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    performanceFeeGovernance = readValue(
      vaultContract.try_performanceFeeGovernance(),
      constants.BIGINT_ZERO
    );
  }
  let performanceFeeStrategist = readValue(
    strategyContract.try_performanceFeeStrategist(),
    constants.BIGINT_ZERO
  );
  if (performanceFeeStrategist.equals(constants.BIGINT_ZERO)) {
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    performanceFeeStrategist = readValue(
      vaultContract.try_performanceFeeStrategist(),
      constants.BIGINT_ZERO
    );
  }
  const performanceFees = (0, initializers_1.getOrCreateVaultFee)(
    enumToPrefix(constants.VaultFeeType.PERFORMANCE_FEE).concat(
      vaultAddress.toHexString()
    ),
    constants.VaultFeeType.PERFORMANCE_FEE,
    performanceFeeGovernance
      .plus(performanceFeeStrategist)
      .divDecimal(constants.MAX_BPS)
      .times(constants.BIGDECIMAL_HUNDRED)
  );
  return performanceFees;
}
exports.getVaultPerformanceFees = getVaultPerformanceFees;
function getVaultFees(vaultAddress, strategyAddress) {
  const withdrawalFees = getVaultWithdrawalFees(vaultAddress, strategyAddress);
  const performanceFees = getVaultPerformanceFees(
    vaultAddress,
    strategyAddress
  );
  return new types_1.PoolFeesType(withdrawalFees, performanceFees);
}
exports.getVaultFees = getVaultFees;
function deactivateFinishedRewards(vault, block) {
  const rewardsLoggerContract = RewardsLogger_1.RewardsLogger.bind(
    constants.REWARDS_LOGGER_ADDRESS
  );
  const unlockSchedulesArray =
    rewardsLoggerContract.try_getAllUnlockSchedulesFor(
      graph_ts_1.Address.fromString(vault.id)
    );
  if (unlockSchedulesArray.reverted) return;
  for (let i = 0; i < unlockSchedulesArray.value.length; i++) {
    const unlockSchedule = unlockSchedulesArray.value[i];
    if (unlockSchedule.end.lt(block.timestamp)) {
      (0, Rewards_1.updateRewardTokenInfo)(
        vault,
        (0, initializers_1.getOrCreateToken)(unlockSchedule.token, block),
        constants.BIGINT_ZERO,
        block
      );
    }
  }
}
exports.deactivateFinishedRewards = deactivateFinishedRewards;
function updateProtocolTotalValueLockedUSD() {
  const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
  const vaultIds = protocol._vaultIds;
  let totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
  for (let vaultIdx = 0; vaultIdx < vaultIds.length; vaultIdx++) {
    const vault = schema_1.Vault.load(vaultIds[vaultIdx]);
    if (!vault) continue;
    totalValueLockedUSD = totalValueLockedUSD.plus(vault.totalValueLockedUSD);
  }
  protocol.totalValueLockedUSD = totalValueLockedUSD;
  protocol.save();
}
exports.updateProtocolTotalValueLockedUSD = updateProtocolTotalValueLockedUSD;
function updateProtocolAfterNewVault(vaultAddress) {
  const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
  const vaultIds = protocol._vaultIds;
  vaultIds.push(vaultAddress.toHexString());
  protocol._vaultIds = vaultIds;
  protocol.totalPoolCount += 1;
  protocol.save();
}
exports.updateProtocolAfterNewVault = updateProtocolAfterNewVault;
