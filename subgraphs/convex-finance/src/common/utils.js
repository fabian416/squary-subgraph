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
exports.getConvexTokenMintAmount =
  exports.updateProtocolAfterNewVault =
  exports.updateProtocolTotalValueLockedUSD =
  exports.getPoolInfoFromPoolId =
  exports.getPool =
  exports.getPoolFromLpToken =
  exports.createFeeType =
  exports.getTokenDecimals =
  exports.readValue =
  exports.enumToPrefix =
    void 0;
const types_1 = require("./types");
const constants = __importStar(require("../common/constants"));
const schema_1 = require("../../generated/schema");
const initializers_1 = require("./initializers");
const schema_2 = require("../../generated/schema");
const ERC20_1 = require("../../generated/Booster/ERC20");
const Booster_1 = require("../../generated/Booster/Booster");
const CurveRegistry_1 = require("../../generated/Booster/CurveRegistry");
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
  let decimals = readValue(token.try_decimals(), 18);
  return constants.BIGINT_TEN.pow(decimals).toBigDecimal();
}
exports.getTokenDecimals = getTokenDecimals;
function createFeeType(feeId, feeType, feePercentage) {
  let fees = schema_1.VaultFee.load(feeId);
  if (!fees) {
    fees = new schema_1.VaultFee(feeId);
    fees.feeType = feeType;
    fees.feePercentage = feePercentage;
    fees.save();
  }
}
exports.createFeeType = createFeeType;
function getPoolFromLpToken(lpToken, registryAddress) {
  const curveRegistryContract =
    CurveRegistry_1.CurveRegistry.bind(registryAddress);
  let poolAddress = readValue(
    curveRegistryContract.try_get_pool_from_lp_token(lpToken),
    constants.NULL.TYPE_ADDRESS
  );
  return poolAddress;
}
exports.getPoolFromLpToken = getPoolFromLpToken;
function getPool(lpToken) {
  if (constants.MISSING_POOLS_MAP.get(lpToken)) {
    return constants.MISSING_POOLS_MAP.get(lpToken);
  }
  // Registry: CURVE_REGISTRY.v1
  let poolAddress = getPoolFromLpToken(lpToken, constants.CURVE_REGISTRY.v1);
  if (poolAddress.toHex() != constants.NULL.TYPE_STRING) return poolAddress;
  // Registry: CURVE_REGISTRY.v2
  poolAddress = getPoolFromLpToken(lpToken, constants.CURVE_REGISTRY.v2);
  if (poolAddress.toHex() != constants.NULL.TYPE_STRING) return poolAddress;
  // Registry: CURVE_POOL_REGISTRY.v1
  poolAddress = getPoolFromLpToken(lpToken, constants.CURVE_POOL_REGISTRY.v1);
  if (poolAddress.toHex() != constants.NULL.TYPE_STRING) return poolAddress;
  // Registry: CURVE_POOL_REGISTRY.v2
  poolAddress = getPoolFromLpToken(lpToken, constants.CURVE_POOL_REGISTRY.v2);
  if (poolAddress.toHex() != constants.NULL.TYPE_STRING) return poolAddress;
  if (constants.POOL_ADDRESS_V2.has(lpToken.toHexString()))
    return constants.POOL_ADDRESS_V2.get(lpToken.toHexString());
  return constants.NULL.TYPE_ADDRESS;
}
exports.getPool = getPool;
function getPoolInfoFromPoolId(poolId) {
  const boosterContract = Booster_1.Booster.bind(
    constants.CONVEX_BOOSTER_ADDRESS
  );
  const poolInfo = boosterContract.try_poolInfo(poolId);
  if (poolInfo.reverted) return null;
  return new types_1.PoolInfoType(poolInfo.value);
}
exports.getPoolInfoFromPoolId = getPoolInfoFromPoolId;
function updateProtocolTotalValueLockedUSD() {
  const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
  const vaultIds = protocol._vaultIds;
  let totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
  for (let vaultIdx = 0; vaultIdx < vaultIds.length; vaultIdx++) {
    const vault = schema_2.Vault.load(vaultIds[vaultIdx]);
    if (!vault) continue;
    totalValueLockedUSD = totalValueLockedUSD.plus(vault.totalValueLockedUSD);
  }
  protocol.totalValueLockedUSD = totalValueLockedUSD;
  protocol.save();
}
exports.updateProtocolTotalValueLockedUSD = updateProtocolTotalValueLockedUSD;
function updateProtocolAfterNewVault(vaultAddress) {
  const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
  let vaultIds = protocol._vaultIds;
  vaultIds.push(vaultAddress);
  protocol._vaultIds = vaultIds;
  protocol.totalPoolCount += 1;
  protocol.save();
}
exports.updateProtocolAfterNewVault = updateProtocolAfterNewVault;
function getConvexTokenMintAmount(crvRewardAmount) {
  const convexTokenContract = ERC20_1.ERC20.bind(
    constants.CONVEX_TOKEN_ADDRESS
  );
  let cvxTokenDecimals = getTokenDecimals(constants.CONVEX_TOKEN_ADDRESS);
  let cvxTokenSupply = readValue(
    convexTokenContract.try_totalSupply(),
    constants.BIGINT_ZERO
  ).toBigDecimal();
  let currentCliff = cvxTokenSupply.div(constants.CVX_CLIFF_SIZE);
  let cvxRewardAmount = constants.BIGDECIMAL_ZERO;
  if (currentCliff.lt(constants.CVX_CLIFF_COUNT.times(cvxTokenDecimals))) {
    let remaining =
      constants.CVX_CLIFF_COUNT.times(cvxTokenDecimals).minus(currentCliff);
    cvxRewardAmount = crvRewardAmount
      .toBigDecimal()
      .times(remaining)
      .div(constants.CVX_CLIFF_COUNT.times(cvxTokenDecimals));
    let amountTillMax =
      constants.CVX_MAX_SUPPLY.times(cvxTokenDecimals).minus(cvxTokenSupply);
    if (cvxRewardAmount.gt(amountTillMax)) {
      cvxRewardAmount = amountTillMax;
    }
  }
  return cvxRewardAmount;
}
exports.getConvexTokenMintAmount = getConvexTokenMintAmount;
