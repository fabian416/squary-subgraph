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
  exports.getVaultFees =
  exports.getStrategyFees =
  exports.getStrategyPerformaceFees =
  exports.getStrategyWithdrawalFees =
  exports.getStrategyDepositFees =
  exports.getUnderlyingStrategy =
  exports.getVaultStrategies =
  exports.isBuyBackTransactionPresent =
  exports.isVaultRegistered =
  exports.getTokenDecimals =
  exports.readValue =
  exports.prefixID =
  exports.enumToPrefix =
    void 0;
const initializers_1 = require("./initializers");
const schema_1 = require("../../generated/schema");
const types_1 = require("./types");
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC20_1 = require("../../generated/templates/Strategy/ERC20");
const Vault_1 = require("../../generated/templates/Strategy/Vault");
const Strategy_1 = require("../../generated/templates/Strategy/Strategy");
function enumToPrefix(snake) {
  return snake.toLowerCase().replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
function prefixID(enumString, ID) {
  return enumToPrefix(enumString) + ID;
}
exports.prefixID = prefixID;
function readValue(callResult, defaultValue) {
  return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function getTokenDecimals(tokenAddr) {
  const token = ERC20_1.ERC20.bind(tokenAddr);
  const decimals = readValue(token.try_decimals(), constants.DEFAULT_DECIMALS);
  return constants.BIGINT_TEN.pow(decimals.toI32()).toBigDecimal();
}
exports.getTokenDecimals = getTokenDecimals;
function isVaultRegistered(vaultAddress) {
  const vault = schema_1.Vault.load(vaultAddress.toHexString());
  if (!vault) return false;
  return true;
}
exports.isVaultRegistered = isVaultRegistered;
function isBuyBackTransactionPresent(transaction) {
  let buyBackStore = schema_1._BuyBack.load(transaction.hash.toHexString());
  if (!buyBackStore) {
    buyBackStore = new schema_1._BuyBack(transaction.hash.toHexString());
    buyBackStore.save();
    return false;
  }
  return true;
}
exports.isBuyBackTransactionPresent = isBuyBackTransactionPresent;
function getVaultStrategies(vaultAddress) {
  const vaultContract = Vault_1.Vault.bind(vaultAddress);
  const strategyCount = readValue(
    vaultContract.try_strategyCount(),
    constants.BIGINT_ZERO
  ).toI32();
  const vaultStrategies = new Array();
  for (let idx = 0; idx < strategyCount; idx++) {
    const strategyAddress = readValue(
      vaultContract.try_strategies(graph_ts_1.BigInt.fromI32(idx)),
      constants.NULL.TYPE_ADDRESS
    );
    if (strategyAddress.equals(constants.NULL.TYPE_ADDRESS)) continue;
    vaultStrategies.push(strategyAddress);
  }
  return vaultStrategies;
}
exports.getVaultStrategies = getVaultStrategies;
function getUnderlyingStrategy(strategyAddress) {
  const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
  const underlyingStrategyAddress = readValue(
    strategyContract.try_strategy(),
    strategyAddress
  );
  return underlyingStrategyAddress;
}
exports.getUnderlyingStrategy = getUnderlyingStrategy;
function getStrategyDepositFees(vaultAddress, strategyAddress) {
  const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
  const entranceFeeNumer = readValue(
    strategyContract.try_entranceFeeNumer(),
    constants.BIGINT_ZERO
  );
  const entranceFeeDenom = readValue(
    strategyContract.try_entranceFeeDenom(),
    constants.BIGINT_ONE
  );
  const depositFees = (0, initializers_1.getOrCreateVaultFee)(
    enumToPrefix(constants.VaultFeeType.DEPOSIT_FEE)
      .concat(vaultAddress.toHexString())
      .concat("-")
      .concat(strategyAddress.toHexString()),
    constants.VaultFeeType.DEPOSIT_FEE,
    entranceFeeNumer
      .divDecimal(entranceFeeDenom.toBigDecimal())
      .times(constants.BIGDECIMAL_HUNDRED)
  );
  return depositFees;
}
exports.getStrategyDepositFees = getStrategyDepositFees;
function getStrategyWithdrawalFees(vaultAddress, strategyAddress) {
  const underlyingStrategyAddress = getUnderlyingStrategy(strategyAddress);
  const strategyContract = Strategy_1.Strategy.bind(underlyingStrategyAddress);
  const withdrawFeeNumer = readValue(
    strategyContract.try_withdrawFeeNumer(),
    constants.BIGINT_ZERO
  );
  const withdrawFeeDenom = readValue(
    strategyContract.try_withdrawFeeDenom(),
    constants.BIGINT_ONE
  );
  const withdrawalFees = (0, initializers_1.getOrCreateVaultFee)(
    enumToPrefix(constants.VaultFeeType.WITHDRAWAL_FEE)
      .concat(vaultAddress.toHexString())
      .concat("-")
      .concat(strategyAddress.toHexString()),
    constants.VaultFeeType.WITHDRAWAL_FEE,
    withdrawFeeNumer
      .divDecimal(withdrawFeeDenom.toBigDecimal())
      .times(constants.BIGDECIMAL_HUNDRED)
  );
  return withdrawalFees;
}
exports.getStrategyWithdrawalFees = getStrategyWithdrawalFees;
function getStrategyPerformaceFees(vaultAddress, strategyAddress) {
  const underlyingStrategyAddress = getUnderlyingStrategy(strategyAddress);
  const strategyContract = Strategy_1.Strategy.bind(underlyingStrategyAddress);
  const buyBackRate = readValue(
    strategyContract.try_buyBackRate(),
    constants.BIGINT_ZERO
  );
  const buyBackPoolRate = readValue(
    strategyContract.try_buyBackPoolRate(),
    constants.BIGINT_ZERO
  );
  const buyBackRateMax = readValue(
    strategyContract.try_buyBackRateMax(),
    constants.BIGINT_ONE
  );
  const performanceFees = (0, initializers_1.getOrCreateVaultFee)(
    enumToPrefix(constants.VaultFeeType.PERFORMANCE_FEE)
      .concat(vaultAddress.toHexString())
      .concat("-")
      .concat(strategyAddress.toHexString()),
    constants.VaultFeeType.PERFORMANCE_FEE,
    buyBackRate
      .plus(buyBackPoolRate)
      .divDecimal(buyBackRateMax.toBigDecimal())
      .times(constants.BIGDECIMAL_HUNDRED)
  );
  return performanceFees;
}
exports.getStrategyPerformaceFees = getStrategyPerformaceFees;
function getStrategyFees(vaultAddress, strategyAddress) {
  const depositFees = getStrategyDepositFees(vaultAddress, strategyAddress);
  const withdrawalFees = getStrategyWithdrawalFees(
    vaultAddress,
    strategyAddress
  );
  const performanceFees = getStrategyPerformaceFees(
    vaultAddress,
    strategyAddress
  );
  return new types_1.PoolFeesType(depositFees, withdrawalFees, performanceFees);
}
exports.getStrategyFees = getStrategyFees;
function getVaultFees(vaultAddress) {
  const vaultStrategies = getVaultStrategies(vaultAddress);
  let vaulFees = [];
  for (let idx = 0; idx < vaultStrategies.length; idx++) {
    vaulFees = vaulFees.concat(
      getStrategyFees(vaultAddress, vaultStrategies.at(idx)).stringIds()
    );
  }
  return vaulFees;
}
exports.getVaultFees = getVaultFees;
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
