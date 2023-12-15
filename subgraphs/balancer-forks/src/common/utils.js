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
exports.roundToWholeNumber =
  exports.convertTokenToDecimal =
  exports.exponentToBigDecimal =
  exports.updateProtocolAfterNewLiquidityPool =
  exports.updateProtocolTotalValueLockedUSD =
  exports.getPoolFees =
  exports.getOutputTokenSupply =
  exports.getPoolTVL =
  exports.getPoolTokenWeights =
  exports.getPoolTokenWeightsForNormalizedPools =
  exports.getPoolTokenWeightsForDynamicWeightPools =
  exports.getPoolScalingFactors =
  exports.getPoolInputTokenBalances =
  exports.calculateAverage =
  exports.getOutputTokenPriceUSD =
  exports.getPoolTokensInfo =
  exports.getTokenDecimals =
  exports.getOrCreateTokenFromString =
  exports.readValue =
  exports.prefixID =
  exports.enumToPrefix =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("./initializers");
const constants = __importStar(require("../common/constants"));
const types_1 = require("./types");
const schema_1 = require("../../generated/schema");
const Vault_1 = require("../../generated/Vault/Vault");
const ERC20_1 = require("../../generated/Vault/ERC20");
const WeightedPool_1 = require("../../generated/templates/WeightedPool/WeightedPool");
const FeesCollector_1 = require("../../generated/templates/WeightedPool/FeesCollector");
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
function getOrCreateTokenFromString(tokenAddress, blockNumber) {
  return (0, initializers_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(tokenAddress),
    blockNumber
  );
}
exports.getOrCreateTokenFromString = getOrCreateTokenFromString;
function getTokenDecimals(tokenAddr) {
  const token = ERC20_1.ERC20.bind(tokenAddr);
  const decimals = readValue(token.try_decimals(), constants.DEFAULT_DECIMALS);
  return constants.BIGINT_TEN.pow(decimals.toI32()).toBigDecimal();
}
exports.getTokenDecimals = getTokenDecimals;
function getPoolTokensInfo(poolId) {
  const vaultContract = Vault_1.Vault.bind(constants.VAULT_ADDRESS);
  const poolTokens = vaultContract.try_getPoolTokens(poolId);
  if (poolTokens.reverted) return new types_1.PoolTokensType();
  return new types_1.PoolTokensType(
    poolTokens.value.getTokens(),
    poolTokens.value.getBalances()
  );
}
exports.getPoolTokensInfo = getPoolTokensInfo;
function getOutputTokenPriceUSD(poolAddress, block) {
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(poolAddress, block);
  if (pool.outputTokenSupply.equals(constants.BIGINT_ZERO))
    return constants.BIGDECIMAL_ZERO;
  const outputToken = (0, initializers_1.getOrCreateToken)(
    poolAddress,
    block.number
  );
  const outputTokenSupply = pool.outputTokenSupply.divDecimal(
    constants.BIGINT_TEN.pow(outputToken.decimals).toBigDecimal()
  );
  const outputTokenPriceUSD = pool.totalValueLockedUSD.div(outputTokenSupply);
  return outputTokenPriceUSD;
}
exports.getOutputTokenPriceUSD = getOutputTokenPriceUSD;
function calculateAverage(prices) {
  let sum = graph_ts_1.BigDecimal.fromString("0");
  for (let i = 0; i < prices.length; i++) {
    sum = sum.plus(prices[i]);
  }
  return sum.div(
    graph_ts_1.BigDecimal.fromString(
      graph_ts_1.BigInt.fromI32(prices.length).toString()
    )
  );
}
exports.calculateAverage = calculateAverage;
function getPoolInputTokenBalances(poolAddress, poolId) {
  const poolContract = WeightedPool_1.WeightedPool.bind(poolAddress);
  const poolTokensInfo = getPoolTokensInfo(poolId);
  const poolBalances = poolTokensInfo.getBalances;
  const bptTokenIndex = readValue(
    poolContract.try_getBptIndex(),
    constants.BIGINT_NEG_ONE
  );
  if (bptTokenIndex != constants.BIGINT_NEG_ONE) {
    poolBalances.splice(bptTokenIndex.toI32(), constants.BIGINT_ONE.toI32());
  }
  return poolBalances;
}
exports.getPoolInputTokenBalances = getPoolInputTokenBalances;
function getPoolScalingFactors(poolAddress, inputTokens) {
  const poolContract = WeightedPool_1.WeightedPool.bind(poolAddress);
  let scales = [];
  for (let idx = 0; idx < inputTokens.length; idx++) {
    const scale = readValue(
      poolContract.try_getScalingFactor(
        graph_ts_1.Address.fromString(inputTokens.at(idx))
      ),
      constants.BIGINT_ZERO
    );
    scales.push(scale);
  }
  if (scales.every((item) => item.isZero())) {
    scales = readValue(poolContract.try_getScalingFactors(), scales);
    const bptTokenIndex = readValue(
      poolContract.try_getBptIndex(),
      constants.BIGINT_NEG_ONE
    );
    if (bptTokenIndex != constants.BIGINT_NEG_ONE) {
      scales.splice(bptTokenIndex.toI32(), constants.BIGINT_ONE.toI32());
    }
  }
  return scales;
}
exports.getPoolScalingFactors = getPoolScalingFactors;
function getPoolTokenWeightsForDynamicWeightPools(poolAddress, inputTokens) {
  const scales = getPoolScalingFactors(poolAddress, inputTokens);
  const totalScale = scales
    .reduce((sum, current) => sum.plus(current), constants.BIGINT_ZERO)
    .toBigDecimal();
  const inputTokenWeights = [];
  for (let idx = 0; idx < scales.length; idx++) {
    if (totalScale.equals(constants.BIGDECIMAL_ZERO)) {
      inputTokenWeights.push(constants.BIGDECIMAL_ZERO);
      continue;
    }
    inputTokenWeights.push(
      scales.at(idx).divDecimal(totalScale).times(constants.BIGDECIMAL_HUNDRED)
    );
  }
  return inputTokenWeights;
}
exports.getPoolTokenWeightsForDynamicWeightPools =
  getPoolTokenWeightsForDynamicWeightPools;
function getPoolTokenWeightsForNormalizedPools(poolAddress) {
  const poolContract = WeightedPool_1.WeightedPool.bind(poolAddress);
  const weights = readValue(poolContract.try_getNormalizedWeights(), []);
  const inputTokenWeights = [];
  for (let idx = 0; idx < weights.length; idx++) {
    inputTokenWeights.push(
      weights
        .at(idx)
        .divDecimal(
          constants.BIGINT_TEN.pow(
            constants.DEFAULT_DECIMALS.toI32()
          ).toBigDecimal()
        )
        .times(constants.BIGDECIMAL_HUNDRED)
    );
  }
  return inputTokenWeights;
}
exports.getPoolTokenWeightsForNormalizedPools =
  getPoolTokenWeightsForNormalizedPools;
function getPoolTokenWeights(poolAddress, inputTokens) {
  let inputTokenWeights = getPoolTokenWeightsForNormalizedPools(poolAddress);
  if (inputTokenWeights.length > 0) return inputTokenWeights;
  inputTokenWeights = getPoolTokenWeightsForDynamicWeightPools(
    poolAddress,
    inputTokens
  );
  return inputTokenWeights;
}
exports.getPoolTokenWeights = getPoolTokenWeights;
function getPoolTVL(inputTokens, inputTokenBalances, block) {
  let totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
  for (let idx = 0; idx < inputTokens.length; idx++) {
    const inputTokenBalance = inputTokenBalances[idx];
    const inputToken = getOrCreateTokenFromString(
      inputTokens[idx],
      block.number
    );
    const amountUSD = inputTokenBalance
      .divDecimal(constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal())
      .times(inputToken.lastPriceUSD);
    totalValueLockedUSD = totalValueLockedUSD.plus(amountUSD);
  }
  return totalValueLockedUSD;
}
exports.getPoolTVL = getPoolTVL;
function getOutputTokenSupply(poolAddress, oldSupply) {
  const poolContract = WeightedPool_1.WeightedPool.bind(poolAddress);
  // Exception: Boosted Pools
  // since this pool pre-mints all BPT, `totalSupply` * remains constant,
  // whereas`getVirtualSupply` increases as users join the pool and decreases as they exit it
  let totalSupply = readValue(
    poolContract.try_getVirtualSupply(),
    constants.BIGINT_ZERO
  );
  if (totalSupply.notEqual(constants.BIGINT_ZERO)) return totalSupply;
  totalSupply = readValue(
    poolContract.try_getActualSupply(),
    constants.BIGINT_ZERO
  );
  if (totalSupply.notEqual(constants.BIGINT_ZERO)) return totalSupply;
  totalSupply = readValue(poolContract.try_totalSupply(), oldSupply);
  return totalSupply;
}
exports.getOutputTokenSupply = getOutputTokenSupply;
function getPoolFees(poolAddress) {
  const poolContract = WeightedPool_1.WeightedPool.bind(poolAddress);
  const swapFee = readValue(
    poolContract.try_getSwapFeePercentage(),
    constants.BIGINT_ZERO
  ).divDecimal(constants.FEE_DENOMINATOR);
  const tradingFeeId =
    enumToPrefix(constants.LiquidityPoolFeeType.FIXED_TRADING_FEE) +
    poolAddress.toHexString();
  const tradingFee = (0, initializers_1.getOrCreateLiquidityPoolFee)(
    tradingFeeId,
    constants.LiquidityPoolFeeType.FIXED_TRADING_FEE,
    swapFee.times(constants.BIGDECIMAL_HUNDRED)
  );
  const feesCollectorContract = FeesCollector_1.FeesCollector.bind(
    constants.PROTOCOL_FEES_COLLECTOR_ADDRESS
  );
  const protocolFees = readValue(
    feesCollectorContract.try_getSwapFeePercentage(),
    constants.BIGINT_ZERO
  ).divDecimal(constants.FEE_DENOMINATOR);
  const protocolFeeId =
    enumToPrefix(constants.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE) +
    poolAddress.toHexString();
  const protocolFee = (0, initializers_1.getOrCreateLiquidityPoolFee)(
    protocolFeeId,
    constants.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE,
    protocolFees.times(swapFee).times(constants.BIGDECIMAL_HUNDRED)
  );
  const lpFeeId =
    enumToPrefix(constants.LiquidityPoolFeeType.FIXED_LP_FEE) +
    poolAddress.toHexString();
  const lpFee = (0, initializers_1.getOrCreateLiquidityPoolFee)(
    lpFeeId,
    constants.LiquidityPoolFeeType.FIXED_LP_FEE,
    protocolFees.times(swapFee).times(constants.BIGDECIMAL_HUNDRED)
  );
  return new types_1.PoolFeesType(tradingFee, protocolFee, lpFee);
}
exports.getPoolFees = getPoolFees;
function updateProtocolTotalValueLockedUSD() {
  const protocol = (0, initializers_1.getOrCreateDexAmmProtocol)();
  const poolIds = protocol._poolIds;
  let totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
  for (let poolIdx = 0; poolIdx < poolIds.length; poolIdx++) {
    const pool = schema_1.LiquidityPool.load(poolIds[poolIdx]);
    if (
      !pool ||
      constants.BLACKLISTED_PHANTOM_POOLS.includes(
        graph_ts_1.Address.fromString(poolIds[poolIdx])
      )
    ) {
      continue;
    }
    totalValueLockedUSD = totalValueLockedUSD.plus(pool.totalValueLockedUSD);
  }
  protocol.totalValueLockedUSD = totalValueLockedUSD;
  protocol.save();
}
exports.updateProtocolTotalValueLockedUSD = updateProtocolTotalValueLockedUSD;
function updateProtocolAfterNewLiquidityPool(poolAddress) {
  const protocol = (0, initializers_1.getOrCreateDexAmmProtocol)();
  const poolIds = protocol._poolIds;
  poolIds.push(poolAddress.toHexString());
  protocol._poolIds = poolIds;
  protocol.totalPoolCount += 1;
  protocol.save();
}
exports.updateProtocolAfterNewLiquidityPool =
  updateProtocolAfterNewLiquidityPool;
// convert decimals
function exponentToBigDecimal(decimals) {
  let bd = constants.BIGDECIMAL_ONE;
  for (let i = constants.INT_ZERO; i < decimals; i = i + constants.INT_ONE) {
    bd = bd.times(constants.BIGDECIMAL_TEN);
  }
  return bd;
}
exports.exponentToBigDecimal = exponentToBigDecimal;
// convert emitted values to tokens count
function convertTokenToDecimal(tokenAmount, exchangeDecimals) {
  if (exchangeDecimals == constants.INT_ZERO) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}
exports.convertTokenToDecimal = convertTokenToDecimal;
// Round BigDecimal to whole number
function roundToWholeNumber(n) {
  return n.truncate(0);
}
exports.roundToWholeNumber = roundToWholeNumber;
