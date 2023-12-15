"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolTokenWeights =
  exports.getPoolTokenWeightsForWeightedPools =
  exports.getPoolTokenWeightsForStablePools =
  exports.isBPT =
  exports.getPoolTokensInfo =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const ethereum_1 = require("./utils/ethereum");
const types_1 = require("./types");
const constants_2 = require("../prices/common/constants");
const BalancerVault_1 = require("../../generated/Booster-v1/BalancerVault");
const WeightedPool_1 = require("../../generated/Booster-v1/WeightedPool");
const StablePool_1 = require("../../generated/Booster-v1/StablePool");
function getPoolTokensInfo(poolAddress) {
  const poolContract = WeightedPool_1.WeightedPool.bind(poolAddress);
  const balancerVault = (0, ethereum_1.readValue)(
    poolContract.try_getVault(),
    graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)
  );
  const balancerPool = (0, ethereum_1.readValue)(
    poolContract.try_getPoolId(),
    new graph_ts_1.Bytes(0)
  );
  let supply = constants_1.BIGINT_ZERO;
  const stablePoolContract = StablePool_1.StablePool.bind(poolAddress);
  const actualSupplyCall = stablePoolContract.try_getActualSupply();
  if (actualSupplyCall.reverted) {
    const virtulSupplyCall = poolContract.try_getVirtualSupply();
    if (virtulSupplyCall.reverted) {
      supply = (0, ethereum_1.readValue)(
        poolContract.try_totalSupply(),
        constants_1.BIGINT_ZERO
      );
    } else {
      supply = virtulSupplyCall.value;
    }
  } else {
    supply = actualSupplyCall.value;
  }
  if (
    !(balancerVault == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS))
  ) {
    const balancerVaultContract =
      BalancerVault_1.BalancerVault.bind(balancerVault);
    const result = balancerVaultContract.try_getPoolTokens(balancerPool);
    if (result.reverted) return new types_1.PoolTokensType(poolAddress, supply);
    return new types_1.PoolTokensType(
      poolAddress,
      supply,
      result.value.getTokens(),
      result.value.getBalances()
    );
  }
  return new types_1.PoolTokensType(poolAddress, supply);
}
exports.getPoolTokensInfo = getPoolTokensInfo;
function isBPT(tokenAddress) {
  const poolContract = WeightedPool_1.WeightedPool.bind(tokenAddress);
  const balancerPool = poolContract.try_getPoolId();
  if (!balancerPool.reverted) {
    return true;
  }
  return false;
}
exports.isBPT = isBPT;
function getPoolTokenWeightsForStablePools(poolAddress, popIndex) {
  const poolContract = StablePool_1.StablePool.bind(poolAddress);
  const scales = (0, ethereum_1.readValue)(
    poolContract.try_getScalingFactors(),
    []
  );
  const inputTokenScales = [];
  for (let idx = 0; idx < scales.length; idx++) {
    if (idx == popIndex) {
      continue;
    }
    inputTokenScales.push(scales.at(idx));
  }
  const totalScale = inputTokenScales
    .reduce((sum, current) => sum.plus(current), constants_1.BIGINT_ZERO)
    .toBigDecimal();
  const inputTokenWeights = [];
  for (let idx = 0; idx < inputTokenScales.length; idx++) {
    inputTokenWeights.push(
      inputTokenScales
        .at(idx)
        .divDecimal(totalScale)
        .times(constants_1.BIGDECIMAL_HUNDRED)
    );
  }
  return inputTokenWeights;
}
exports.getPoolTokenWeightsForStablePools = getPoolTokenWeightsForStablePools;
function getPoolTokenWeightsForWeightedPools(poolAddress, popIndex) {
  const poolContract = WeightedPool_1.WeightedPool.bind(poolAddress);
  const weights = (0, ethereum_1.readValue)(
    poolContract.try_getNormalizedWeights(),
    []
  );
  const inputTokenWeights = [];
  for (let idx = 0; idx < weights.length; idx++) {
    if (idx == popIndex) {
      continue;
    }
    inputTokenWeights.push(
      weights
        .at(idx)
        .divDecimal(
          constants_1.BIGINT_TEN.pow(
            constants_2.DEFAULT_DECIMALS.toI32()
          ).toBigDecimal()
        )
        .times(constants_1.BIGDECIMAL_HUNDRED)
    );
  }
  return inputTokenWeights;
}
exports.getPoolTokenWeightsForWeightedPools =
  getPoolTokenWeightsForWeightedPools;
function getPoolTokenWeights(poolAddress, popIndex) {
  let inputTokenWeights = getPoolTokenWeightsForWeightedPools(
    poolAddress,
    popIndex
  );
  if (inputTokenWeights.length > 0) return inputTokenWeights;
  inputTokenWeights = getPoolTokenWeightsForStablePools(poolAddress, popIndex);
  return inputTokenWeights;
}
exports.getPoolTokenWeights = getPoolTokenWeights;
