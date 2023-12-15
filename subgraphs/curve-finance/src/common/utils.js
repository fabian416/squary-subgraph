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
exports.updateProtocolAfterNewLiquidityPool =
  exports.getOutputTokenSupply =
  exports.updateProtocolTotalValueLockedUSD =
  exports.getPoolTVLExcludingBasePoolLpToken =
  exports.getPoolTVL =
  exports.getPoolFromGauge =
  exports.getLpTokenFromGauge =
  exports.getPoolFromLpToken =
  exports.getPoolFees =
  exports.getPoolTokenWeights =
  exports.getPoolTVLUsingInputTokens =
  exports.getPoolBalances =
  exports.getPoolUnderlyingCoinsFromRegistry =
  exports.getPoolUnderlyingCoins =
  exports.getPoolCoins =
  exports.getPoolFromCoins =
  exports.getLpTokenFromRegistry =
  exports.getLpTokenFromPool =
  exports.isMainRegistryPool =
  exports.isPoolRegistered =
  exports.multiArraySort =
  exports.sortRewardTokens =
  exports.sortByInputTokenOrder =
  exports.calculateAverage =
  exports.readValue =
  exports.getOrCreateTokenFromString =
  exports.getTokenDecimals =
  exports.equalsIgnoreCase =
  exports.exponentToBigDecimal =
  exports.enumToPrefix =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("./initializers");
const types_1 = require("./types");
const constants = __importStar(require("../common/constants"));
const schema_1 = require("../../generated/schema");
const Pool_1 = require("../../generated/templates/PoolTemplate/Pool");
const ERC20_1 = require("../../generated/templates/PoolTemplate/ERC20");
const Pool_2 = require("../../generated/templates/PoolTemplate/Pool");
const Registry_1 = require("../../generated/templates/PoolTemplate/Registry");
const Gauge_1 = require("../../generated/templates/LiquidityGauge/Gauge");
const AddressProvider_1 = require("../../generated/templates/PoolTemplate/AddressProvider");
function enumToPrefix(snake) {
  return snake.toLowerCase().replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
function exponentToBigDecimal(decimals) {
  let bigDecimal = graph_ts_1.BigDecimal.fromString("1");
  for (let i = 0; i < decimals; i++) {
    bigDecimal = bigDecimal.times(graph_ts_1.BigDecimal.fromString("10"));
  }
  return bigDecimal;
}
exports.exponentToBigDecimal = exponentToBigDecimal;
function equalsIgnoreCase(a, b) {
  return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
function getTokenDecimals(tokenAddr) {
  const token = ERC20_1.ERC20.bind(tokenAddr);
  const decimals = readValue(token.try_decimals(), constants.DEFAULT_DECIMALS);
  return exponentToBigDecimal(decimals.toI32());
}
exports.getTokenDecimals = getTokenDecimals;
function getOrCreateTokenFromString(
  tokenAddress,
  block,
  fetchLatestPrice = false,
  skipPricing = false
) {
  return (0, initializers_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(tokenAddress),
    block,
    fetchLatestPrice,
    skipPricing
  );
}
exports.getOrCreateTokenFromString = getOrCreateTokenFromString;
function readValue(callResult, defaultValue) {
  return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
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
function sortByInputTokenOrder(pool, arr) {
  const ordered = new Array(arr.length).fill(constants.BIGINT_ZERO);
  for (let i = 0; i < arr.length; i++) {
    const newIndex = pool.inputTokens.indexOf(pool._inputTokensOrdered[i]);
    ordered[newIndex] = arr[i];
  }
  return ordered;
}
exports.sortByInputTokenOrder = sortByInputTokenOrder;
function sortRewardTokens(pool) {
  if (pool.rewardTokens.length <= 1) {
    return;
  }
  const rewardTokens = pool.rewardTokens;
  const rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
  const rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
  multiArraySort(
    rewardTokens,
    rewardTokenEmissionsAmount,
    rewardTokenEmissionsUSD
  );
  pool.rewardTokens = rewardTokens;
  pool.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
  pool.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
}
exports.sortRewardTokens = sortRewardTokens;
function multiArraySort(ref, arr1, arr2) {
  if (ref.length != arr1.length || ref.length != arr2.length) {
    // cannot sort
    return;
  }
  const sorter = [];
  for (let i = 0; i < ref.length; i++) {
    sorter[i] = [ref[i], arr1[i].toString(), arr2[i].toString()];
  }
  sorter.sort(function (a, b) {
    if (a[0] < b[0]) {
      return -1;
    }
    return 1;
  });
  for (let i = 0; i < sorter.length; i++) {
    ref[i] = sorter[i][0];
    arr1[i] = graph_ts_1.BigInt.fromString(sorter[i][1]);
    arr2[i] = graph_ts_1.BigDecimal.fromString(sorter[i][2]);
  }
}
exports.multiArraySort = multiArraySort;
function isPoolRegistered(poolAddress) {
  const pool = schema_1.LiquidityPool.load(poolAddress.toHexString());
  if (!pool) return false;
  return true;
}
exports.isPoolRegistered = isPoolRegistered;
function isMainRegistryPool(poolAddress) {
  const addressProvider = AddressProvider_1.AddressProvider.bind(
    constants.CURVE_ADDRESS_PROVIDER
  );
  const mainRegistryAddress = readValue(
    addressProvider.try_get_registry(),
    constants.NULL.TYPE_ADDRESS
  );
  if (mainRegistryAddress.equals(constants.NULL.TYPE_ADDRESS)) return false;
  const mainRegistryContract = Registry_1.Registry.bind(mainRegistryAddress);
  const lpToken = readValue(
    mainRegistryContract.try_get_lp_token(poolAddress),
    constants.NULL.TYPE_ADDRESS
  );
  if (lpToken.equals(constants.NULL.TYPE_ADDRESS)) return false;
  return true;
}
exports.isMainRegistryPool = isMainRegistryPool;
function getLpTokenFromPool(poolAddress, block) {
  let lpToken = constants.HARDCODED_MISSING_OLD_POOLS.get(poolAddress);
  if (lpToken) return (0, initializers_1.getOrCreateToken)(lpToken, block);
  const poolContract = Pool_2.Pool.bind(poolAddress);
  lpToken = readValue(poolContract.try_lp_token(), constants.NULL.TYPE_ADDRESS);
  if (lpToken.notEqual(constants.NULL.TYPE_ADDRESS))
    return (0, initializers_1.getOrCreateToken)(lpToken, block);
  lpToken = readValue(poolContract.try_token(), constants.NULL.TYPE_ADDRESS);
  if (lpToken.notEqual(constants.NULL.TYPE_ADDRESS))
    return (0, initializers_1.getOrCreateToken)(lpToken, block);
  return (0, initializers_1.getOrCreateToken)(poolAddress, block);
}
exports.getLpTokenFromPool = getLpTokenFromPool;
function getLpTokenFromRegistry(poolAddress, registryAddress, block) {
  const registryContract = Registry_1.Registry.bind(registryAddress);
  const lpToken = readValue(
    registryContract.try_get_lp_token(poolAddress),
    constants.NULL.TYPE_ADDRESS
  );
  if (lpToken.equals(constants.NULL.TYPE_ADDRESS)) return null;
  return (0, initializers_1.getOrCreateToken)(lpToken, block);
}
exports.getLpTokenFromRegistry = getLpTokenFromRegistry;
function getPoolFromCoins(registryAddress, coins) {
  const registryContract = Registry_1.Registry.bind(registryAddress);
  if (coins.length < 2) return null;
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  for (let idx = 0; idx <= 8; idx++) {
    const poolAddress = readValue(
      registryContract.try_find_pool_for_coins1(
        coins.at(0),
        coins.at(1),
        graph_ts_1.BigInt.fromI32(idx)
      ),
      constants.NULL.TYPE_ADDRESS
    );
    if (poolAddress.equals(constants.NULL.TYPE_ADDRESS)) return null;
    if (isPoolRegistered(poolAddress)) continue;
    return poolAddress;
  }
  return null;
}
exports.getPoolFromCoins = getPoolFromCoins;
function getPoolCoins(poolAddress, block) {
  const curvePool = Pool_1.Pool.bind(poolAddress);
  let idx = 0;
  const inputTokens = [];
  while (idx >= 0) {
    let inputToken = readValue(
      curvePool.try_coins(graph_ts_1.BigInt.fromI32(idx)),
      constants.NULL.TYPE_ADDRESS
    );
    if (inputToken.equals(constants.NULL.TYPE_ADDRESS)) {
      inputToken = readValue(
        curvePool.try_coins1(graph_ts_1.BigInt.fromI32(idx)),
        constants.NULL.TYPE_ADDRESS
      );
      if (inputToken.equals(constants.NULL.TYPE_ADDRESS)) {
        return inputTokens;
      }
    }
    inputTokens.push(
      (0, initializers_1.getOrCreateToken)(inputToken, block).id
    );
    idx += 1;
  }
  return inputTokens;
}
exports.getPoolCoins = getPoolCoins;
function getPoolUnderlyingCoins(poolAddress) {
  let underlyingCoins = [];
  for (let i = 0; i < constants.POOL_REGISTRIES.length; i++) {
    const registryAddress = constants.POOL_REGISTRIES[i];
    const registryContract = Registry_1.Registry.bind(registryAddress);
    underlyingCoins = readValue(
      registryContract.try_get_underlying_coins(poolAddress),
      []
    );
    if (
      underlyingCoins.length != 0 &&
      underlyingCoins[0].notEqual(constants.NULL.TYPE_ADDRESS)
    )
      return underlyingCoins;
  }
  return underlyingCoins;
}
exports.getPoolUnderlyingCoins = getPoolUnderlyingCoins;
function getPoolUnderlyingCoinsFromRegistry(poolAddress, registryAddress) {
  if (registryAddress.equals(constants.NULL.TYPE_ADDRESS)) {
    return getPoolUnderlyingCoins(poolAddress);
  }
  const registryContract = Registry_1.Registry.bind(registryAddress);
  const underlyingCoins = readValue(
    registryContract.try_get_underlying_coins(poolAddress),
    []
  );
  return underlyingCoins;
}
exports.getPoolUnderlyingCoinsFromRegistry = getPoolUnderlyingCoinsFromRegistry;
function getPoolBalances(pool) {
  const curvePool = Pool_1.Pool.bind(graph_ts_1.Address.fromString(pool.id));
  const inputTokenBalances = [];
  for (let idx = 0; idx < pool.inputTokens.length; idx++) {
    let balance = readValue(
      curvePool.try_balances(graph_ts_1.BigInt.fromI32(idx)),
      constants.BIGINT_ZERO
    );
    if (balance.equals(constants.BIGINT_ZERO)) {
      balance = readValue(
        curvePool.try_balances1(graph_ts_1.BigInt.fromI32(idx)),
        constants.BIGINT_ZERO
      );
    }
    inputTokenBalances.push(balance);
  }
  return sortByInputTokenOrder(pool, inputTokenBalances);
}
exports.getPoolBalances = getPoolBalances;
function getPoolTVLUsingInputTokens(inputTokens, inputTokenBalances, block) {
  let totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
  for (let idx = 0; idx < inputTokens.length; idx++) {
    const balance = inputTokenBalances[idx];
    const inputToken = getOrCreateTokenFromString(inputTokens[idx], block);
    const balanceUSD = balance
      .divDecimal(exponentToBigDecimal(inputToken.decimals))
      .times(inputToken.lastPriceUSD);
    totalValueLockedUSD = totalValueLockedUSD.plus(balanceUSD);
  }
  return totalValueLockedUSD;
}
exports.getPoolTVLUsingInputTokens = getPoolTVLUsingInputTokens;
function getPoolTokenWeights(inputTokens, inputTokenBalances, block) {
  const totalValueLockedUSD = getPoolTVLUsingInputTokens(
    inputTokens,
    inputTokenBalances,
    block
  );
  const inputTokenWeights = [];
  for (let idx = 0; idx < inputTokens.length; idx++) {
    if (totalValueLockedUSD == constants.BIGDECIMAL_ZERO) {
      inputTokenWeights.push(constants.BIGDECIMAL_ZERO);
      continue;
    }
    const balance = inputTokenBalances[idx];
    const inputToken = getOrCreateTokenFromString(inputTokens[idx], block);
    const balanceUSD = balance
      .divDecimal(exponentToBigDecimal(inputToken.decimals))
      .times(inputToken.lastPriceUSD);
    const weight = balanceUSD
      .div(totalValueLockedUSD)
      .times(constants.BIGDECIMAL_HUNDRED);
    inputTokenWeights.push(weight);
  }
  return inputTokenWeights;
}
exports.getPoolTokenWeights = getPoolTokenWeights;
function getPoolFees(poolAddress) {
  const curvePool = Pool_1.Pool.bind(poolAddress);
  const totalFees = readValue(
    curvePool.try_fee(),
    constants.DEFAULT_POOL_FEE
  ).divDecimal(constants.FEE_DENOMINATOR);
  const adminFees = readValue(
    curvePool.try_admin_fee(),
    constants.DEFAULT_ADMIN_FEE
  ).divDecimal(constants.FEE_DENOMINATOR);
  const tradingFeeId =
    enumToPrefix(constants.LiquidityPoolFeeType.FIXED_TRADING_FEE) +
    poolAddress.toHexString();
  const tradingFee = (0, initializers_1.getOrCreateLiquidityPoolFee)(
    tradingFeeId,
    constants.LiquidityPoolFeeType.FIXED_TRADING_FEE,
    totalFees.times(constants.BIGDECIMAL_HUNDRED)
  );
  const protocolFeeId =
    enumToPrefix(constants.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE) +
    poolAddress.toHexString();
  const protocolFee = (0, initializers_1.getOrCreateLiquidityPoolFee)(
    protocolFeeId,
    constants.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE,
    totalFees.times(adminFees).times(constants.BIGDECIMAL_HUNDRED)
  );
  const lpFeeId =
    enumToPrefix(constants.LiquidityPoolFeeType.FIXED_LP_FEE) +
    poolAddress.toHexString();
  const lpFee = (0, initializers_1.getOrCreateLiquidityPoolFee)(
    lpFeeId,
    constants.LiquidityPoolFeeType.FIXED_LP_FEE,
    totalFees
      .minus(totalFees.times(adminFees))
      .times(constants.BIGDECIMAL_HUNDRED)
  );
  return new types_1.PoolFeesType(tradingFee, protocolFee, lpFee);
}
exports.getPoolFees = getPoolFees;
function getPoolFromLpToken(lpToken) {
  const lpTokenStore = (0, initializers_1.getOrCreateLpToken)(lpToken);
  let poolAddress = graph_ts_1.Address.fromString(lpTokenStore.poolAddress);
  if (poolAddress.notEqual(constants.NULL.TYPE_ADDRESS)) return poolAddress;
  const registryAddress = graph_ts_1.Address.fromString(
    lpTokenStore.registryAddress
  );
  if (registryAddress.equals(constants.NULL.TYPE_ADDRESS)) return lpToken;
  const registryContract = Registry_1.Registry.bind(registryAddress);
  poolAddress = readValue(
    registryContract.try_get_pool_from_lp_token(lpToken),
    lpToken
  );
  return poolAddress;
}
exports.getPoolFromLpToken = getPoolFromLpToken;
function getLpTokenFromGauge(gaugeAddress) {
  const gaugeContract = Gauge_1.Gauge.bind(gaugeAddress);
  const lpToken = readValue(
    gaugeContract.try_lp_token(),
    constants.NULL.TYPE_ADDRESS
  );
  return lpToken;
}
exports.getLpTokenFromGauge = getLpTokenFromGauge;
function getPoolFromGauge(gaugeAddress) {
  const lpToken = getLpTokenFromGauge(gaugeAddress);
  let poolAddress = constants.NULL.TYPE_ADDRESS;
  for (let i = 0; i < constants.POOL_REGISTRIES.length; i++) {
    const registryAddress = constants.POOL_REGISTRIES[i];
    const registryContract = Registry_1.Registry.bind(registryAddress);
    poolAddress = readValue(
      registryContract.try_get_pool_from_lp_token(lpToken),
      constants.NULL.TYPE_ADDRESS
    );
    if (poolAddress.notEqual(constants.NULL.TYPE_ADDRESS)) return poolAddress;
  }
  const context = graph_ts_1.dataSource.context();
  poolAddress = graph_ts_1.Address.fromString(context.getString("poolAddress"));
  return poolAddress;
}
exports.getPoolFromGauge = getPoolFromGauge;
function getPoolTVL(pool, outputTokenBalance, block) {
  const outputToken = getOrCreateTokenFromString(pool.outputToken, block);
  if (outputToken.lastPriceUSD.equals(constants.BIGDECIMAL_ZERO))
    return getPoolTVLUsingInputTokens(
      pool.inputTokens,
      pool.inputTokenBalances,
      block
    );
  const totalValueLockedUSD = outputTokenBalance
    .divDecimal(exponentToBigDecimal(outputToken.decimals))
    .times(outputToken.lastPriceUSD);
  return totalValueLockedUSD;
}
exports.getPoolTVL = getPoolTVL;
function getPoolTVLExcludingBasePoolLpToken(pool, block) {
  let totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
  for (let idx = 0; idx < pool.inputTokens.length; idx++) {
    const balance = pool.inputTokenBalances[idx];
    const inputToken = getOrCreateTokenFromString(pool.inputTokens[idx], block);
    if (inputToken.isBasePoolLpToken) continue;
    const balanceUSD = balance
      .divDecimal(exponentToBigDecimal(inputToken.decimals))
      .times(inputToken.lastPriceUSD);
    totalValueLockedUSD = totalValueLockedUSD.plus(balanceUSD);
  }
  return totalValueLockedUSD;
}
exports.getPoolTVLExcludingBasePoolLpToken = getPoolTVLExcludingBasePoolLpToken;
function updateProtocolTotalValueLockedUSD(block) {
  const protocol = (0, initializers_1.getOrCreateDexAmmProtocol)();
  const poolIds = protocol._poolIds;
  let totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
  for (let poolIdx = 0; poolIdx < poolIds.length; poolIdx++) {
    const pool = schema_1.LiquidityPool.load(poolIds[poolIdx]);
    if (!pool) continue;
    let poolTVL = pool.totalValueLockedUSD;
    for (let idx = 0; idx < pool.inputTokens.length; idx++) {
      const inputToken = getOrCreateTokenFromString(
        pool.inputTokens[idx],
        block,
        false,
        true
      );
      if (inputToken.isBasePoolLpToken) {
        poolTVL = pool._tvlUSDExcludingBasePoolLpTokens;
        break;
      }
    }
    totalValueLockedUSD = totalValueLockedUSD.plus(poolTVL);
  }
  protocol.totalValueLockedUSD = totalValueLockedUSD;
  protocol.save();
}
exports.updateProtocolTotalValueLockedUSD = updateProtocolTotalValueLockedUSD;
function getOutputTokenSupply(lpTokenAddress, oldSupply) {
  const lpTokenContract = ERC20_1.ERC20.bind(lpTokenAddress);
  const outputTokenSupply = readValue(
    lpTokenContract.try_totalSupply(),
    constants.BIGINT_ZERO
  );
  if (outputTokenSupply.equals(constants.BIGINT_ZERO)) return oldSupply;
  return outputTokenSupply;
}
exports.getOutputTokenSupply = getOutputTokenSupply;
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
