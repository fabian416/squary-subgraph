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
exports.getMinterFromLpToken =
  exports.getOutputTokenPriceUSD2 =
  exports.getVirtualPriceFromPool =
  exports.getPoolFromLpToken =
  exports.calculateAverage =
  exports.getPoolUnderlyingCoins =
  exports.getOutputTokenPriceUSD =
  exports.getOrCreateTokenFromString =
  exports.getTokenDecimals =
  exports.getPoolTVL =
  exports.updateProtocolTotalValueLockedUSD =
  exports.checkIfPoolExists =
  exports.updateProtocolAfterNewLiquidityPool =
  exports.getPoolTokenWeights =
  exports.getPoolFees =
  exports.getPoolBalances =
  exports.getPoolCoins =
  exports.getLpTokenFromPool =
  exports.readValue =
  exports.enumToPrefix =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("./initializers");
const utils = __importStar(require("./utils"));
const types_1 = require("./types");
const constants = __importStar(require("./constants"));
const schema_1 = require("../../generated/schema");
const LpToken_1 = require("../../generated/Factory/LpToken");
const Factory_1 = require("../../generated/Factory/Factory");
const Registry_1 = require("../../generated/Registry/Registry");
const Pool_1 = require("../../generated/templates/PoolTemplate/Pool");
const ERC20_1 = require("../../generated/templates/PoolTemplate/ERC20");
function enumToPrefix(snake) {
  return snake.toLowerCase().replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
function readValue(callResult, defaultValue) {
  return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function getLpTokenFromPool(
  poolAddress,
  block,
  newRegistryAddress = constants.ADDRESS_ZERO
) {
  let lpTokenAddress = constants.ADDRESS_ZERO;
  if (constants.POOL_LP_TOKEN_MAP.has(poolAddress.toHexString())) {
    return (0, initializers_1.getOrCreateToken)(
      constants.POOL_LP_TOKEN_MAP.get(poolAddress.toHexString()),
      block
    );
  }
  //Pool Contract
  const poolContract = Pool_1.Pool.bind(poolAddress);
  const lpTokenCall = poolContract.try_lp_token();
  if (!lpTokenCall.reverted) {
    if (
      readValue(lpTokenCall, constants.ADDRESS_ZERO).notEqual(
        constants.ADDRESS_ZERO
      )
    ) {
      return (0, initializers_1.getOrCreateToken)(
        readValue(lpTokenCall, constants.ADDRESS_ZERO),
        block
      );
    }
  }
  // Registry Contract
  const registryContract = Registry_1.Registry.bind(constants.REGISTRY_ADDRESS);
  lpTokenAddress = readValue(
    registryContract.try_get_lp_token(poolAddress),
    constants.NULL.TYPE_ADDRESS
  );
  if (lpTokenAddress.notEqual(constants.NULL.TYPE_ADDRESS))
    return (0, initializers_1.getOrCreateToken)(lpTokenAddress, block);
  // Factory Contract
  const factoryContract = Factory_1.Factory.bind(constants.FACTORY_ADDRESS);
  lpTokenAddress = readValue(
    factoryContract.try_get_lp_token(poolAddress),
    constants.NULL.TYPE_ADDRESS
  );
  if (lpTokenAddress.notEqual(constants.NULL.TYPE_ADDRESS))
    return (0, initializers_1.getOrCreateToken)(lpTokenAddress, block);
  if (!newRegistryAddress.equals(constants.ADDRESS_ZERO)) {
    const newFactoryContract = Factory_1.Factory.bind(newRegistryAddress);
    lpTokenAddress = readValue(
      newFactoryContract.try_get_lp_token(poolAddress),
      constants.NULL.TYPE_ADDRESS
    );
    if (lpTokenAddress.notEqual(constants.NULL.TYPE_ADDRESS))
      return (0, initializers_1.getOrCreateToken)(lpTokenAddress, block);
  }
  if (!newRegistryAddress.equals(constants.ADDRESS_ZERO)) {
    const newFactoryContract = Factory_1.Factory.bind(newRegistryAddress);
    lpTokenAddress = readValue(
      newFactoryContract.try_get_token(poolAddress),
      constants.NULL.TYPE_ADDRESS
    );
    if (lpTokenAddress.notEqual(constants.NULL.TYPE_ADDRESS))
      return (0, initializers_1.getOrCreateToken)(lpTokenAddress, block);
  }
  return (0, initializers_1.getOrCreateToken)(poolAddress, block);
}
exports.getLpTokenFromPool = getLpTokenFromPool;
function getPoolCoins(poolAddress, block) {
  const poolContract = Pool_1.Pool.bind(poolAddress);
  const inputTokens = [];
  let i = 0;
  while (i >= 0) {
    const inputToken = readValue(
      poolContract.try_coins(graph_ts_1.BigInt.fromI32(i)),
      constants.NULL.TYPE_ADDRESS
    );
    if (inputToken.equals(constants.NULL.TYPE_ADDRESS)) {
      i = -1;
      continue;
    }
    inputTokens.push(
      (0, initializers_1.getOrCreateToken)(inputToken, block).id
    );
    i += 1;
  }
  return inputTokens;
}
exports.getPoolCoins = getPoolCoins;
function getPoolBalances(poolAddress, inputTokens) {
  const poolContract = Pool_1.Pool.bind(poolAddress);
  const inputTokenBalances = [];
  for (let i = 0; i < inputTokens.length; i++) {
    const balance = readValue(
      poolContract.try_balances(graph_ts_1.BigInt.fromI32(i)),
      constants.BIGINT_ZERO
    );
    inputTokenBalances.push(balance);
  }
  return inputTokenBalances;
}
exports.getPoolBalances = getPoolBalances;
function getPoolFees(poolAddress) {
  const poolContract = Pool_1.Pool.bind(poolAddress);
  const totalFees = readValue(
    poolContract.try_fee(),
    constants.DEFAULT_POOL_FEE
  ).divDecimal(constants.FEE_DENOMINATOR);
  const adminFees = readValue(
    poolContract.try_admin_fee(),
    constants.DEFAULT_ADMIN_FEE
  ).divDecimal(constants.FEE_DENOMINATOR);
  const lpFeeId =
    enumToPrefix(constants.LiquidityPoolFeeType.FIXED_LP_FEE) +
    poolAddress.toHexString();
  const tradingFeeId =
    enumToPrefix(constants.LiquidityPoolFeeType.FIXED_TRADING_FEE) +
    poolAddress.toHexString();
  const protocolFeeId =
    enumToPrefix(constants.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE) +
    poolAddress.toHexString();
  const tradingFee = (0, initializers_1.getOrCreateLiquidityPoolFee)(
    tradingFeeId,
    constants.LiquidityPoolFeeType.FIXED_TRADING_FEE,
    totalFees.times(constants.BIGDECIMAL_HUNDRED)
  );
  const protocolFee = (0, initializers_1.getOrCreateLiquidityPoolFee)(
    protocolFeeId,
    constants.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE,
    totalFees.times(adminFees).times(constants.BIGDECIMAL_HUNDRED)
  );
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
function getPoolTokenWeights(
  inputTokens,
  inputTokenBalances,
  totalValueLockedUSD,
  block
) {
  const inputTokenWeights = [];
  for (let i = 0; i < inputTokens.length; i++) {
    if (totalValueLockedUSD == constants.BIGDECIMAL_ZERO) {
      inputTokenWeights.push(constants.BIGDECIMAL_ZERO);
      continue;
    }
    const balance = inputTokenBalances[i];
    const inputToken = (0, initializers_1.getOrCreateToken)(
      graph_ts_1.Address.fromString(inputTokens[i]),
      block
    );
    const balanceUSD = balance
      .divDecimal(constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal())
      .times(inputToken.lastPriceUSD);
    const weight = balanceUSD
      .div(totalValueLockedUSD)
      .times(constants.BIGDECIMAL_HUNDRED);
    inputTokenWeights.push(weight);
  }
  return inputTokenWeights;
}
exports.getPoolTokenWeights = getPoolTokenWeights;
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
function checkIfPoolExists(poolAddress) {
  const pool = schema_1.LiquidityPool.load(poolAddress.toHexString());
  if (!pool) {
    return false;
  }
  return true;
}
exports.checkIfPoolExists = checkIfPoolExists;
function updateProtocolTotalValueLockedUSD() {
  const protocol = (0, initializers_1.getOrCreateDexAmmProtocol)();
  const poolIds = protocol._poolIds;
  let totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
  for (let poolIdx = 0; poolIdx < poolIds.length; poolIdx++) {
    const pool = schema_1.LiquidityPool.load(poolIds[poolIdx]);
    if (!pool) continue;
    totalValueLockedUSD = totalValueLockedUSD.plus(pool.totalValueLockedUSD);
  }
  protocol.totalValueLockedUSD = totalValueLockedUSD;
  protocol.save();
}
exports.updateProtocolTotalValueLockedUSD = updateProtocolTotalValueLockedUSD;
function getPoolTVL(inputTokens, inputTokenBalances, block) {
  let totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
  for (let i = 0; i < inputTokens.length; i++) {
    const inputToken = utils.getOrCreateTokenFromString(inputTokens[i], block);
    totalValueLockedUSD = totalValueLockedUSD.plus(
      inputTokenBalances[i]
        .divDecimal(
          constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal()
        )
        .times(inputToken.lastPriceUSD)
    );
  }
  return totalValueLockedUSD;
}
exports.getPoolTVL = getPoolTVL;
function getTokenDecimals(tokenAddr) {
  const token = ERC20_1.ERC20.bind(tokenAddr);
  const decimals = readValue(token.try_decimals(), constants.DEFAULT_DECIMALS);
  return constants.BIGINT_TEN.pow(decimals).toBigDecimal();
}
exports.getTokenDecimals = getTokenDecimals;
function getOrCreateTokenFromString(tokenAddress, block) {
  return (0, initializers_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(tokenAddress),
    block
  );
}
exports.getOrCreateTokenFromString = getOrCreateTokenFromString;
function getOutputTokenPriceUSD(poolAddress, block) {
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(poolAddress, block);
  if (pool.outputTokenSupply.equals(constants.BIGINT_ZERO))
    return constants.BIGDECIMAL_ZERO;
  const lpToken = getLpTokenFromPool(poolAddress, block);
  const outputTokenSupply = pool.outputTokenSupply.divDecimal(
    constants.BIGINT_TEN.pow(lpToken.decimals).toBigDecimal()
  );
  const outputTokenPriceUSD = pool.totalValueLockedUSD.div(outputTokenSupply);
  return outputTokenPriceUSD;
}
exports.getOutputTokenPriceUSD = getOutputTokenPriceUSD;
function getPoolUnderlyingCoins(
  poolAddress,
  newRegistryAddress = constants.ADDRESS_ZERO
) {
  const coins = [];
  const registryContract = Registry_1.Registry.bind(constants.REGISTRY_ADDRESS);
  let underlyingCoins = readValue(
    registryContract.try_get_underlying_coins(poolAddress),
    []
  );
  if (
    poolAddress.equals(
      graph_ts_1.Address.fromString(
        "0x19ec9e3f7b21dd27598e7ad5aae7dc0db00a806d"
      )
    )
  )
    graph_ts_1.log.warning(
      "[getUnderlyingcoins] coins from registry length {}",
      [underlyingCoins.length.toString()]
    );
  if (underlyingCoins.length != 0) {
    for (let i = 0; i < underlyingCoins.length; i++) {
      if (!underlyingCoins[i].equals(constants.ADDRESS_ZERO)) {
        coins.push(underlyingCoins[i].toHexString());
      }
    }
    return coins;
  }
  const factoryContract = Factory_1.Factory.bind(constants.FACTORY_ADDRESS);
  underlyingCoins = readValue(
    factoryContract.try_get_underlying_coins(poolAddress),
    []
  );
  if (
    poolAddress.equals(
      graph_ts_1.Address.fromString(
        "0x19ec9e3f7b21dd27598e7ad5aae7dc0db00a806d"
      )
    )
  )
    graph_ts_1.log.warning(
      "[getUnderlyingcoins] coins from factory length {}",
      [underlyingCoins.length.toString()]
    );
  if (underlyingCoins.length != 0) {
    for (let i = 0; i < underlyingCoins.length; i++) {
      if (!underlyingCoins[i].equals(constants.ADDRESS_ZERO)) {
        coins.push(underlyingCoins[i].toHexString());
      }
    }
    return coins;
  }
  if (newRegistryAddress.notEqual(constants.ADDRESS_ZERO)) {
    const factoryContract = Factory_1.Factory.bind(newRegistryAddress);
    underlyingCoins = readValue(
      factoryContract.try_get_underlying_coins(poolAddress),
      []
    );
    if (
      poolAddress.equals(
        graph_ts_1.Address.fromString(
          "0x19ec9e3f7b21dd27598e7ad5aae7dc0db00a806d"
        )
      )
    )
      graph_ts_1.log.warning(
        "[getUnderlyingcoins] coins from new registry length {}",
        [underlyingCoins.length.toString()]
      );
    if (underlyingCoins.length != 0) {
      for (let i = 0; i < underlyingCoins.length; i++) {
        if (!underlyingCoins[i].equals(constants.ADDRESS_ZERO)) {
          coins.push(underlyingCoins[i].toHexString());
        }
      }
      return coins;
    }
  }
  if (newRegistryAddress.notEqual(constants.ADDRESS_ZERO)) {
    const registryContract = Factory_1.Factory.bind(newRegistryAddress);
    underlyingCoins = readValue(
      registryContract.try_get_underlying_coins(poolAddress),
      []
    );
    if (
      poolAddress.equals(
        graph_ts_1.Address.fromString(
          "0x19ec9e3f7b21dd27598e7ad5aae7dc0db00a806d"
        )
      )
    )
      graph_ts_1.log.warning(
        "[getUnderlyingcoins] coins from new factory length {}",
        [underlyingCoins.length.toString()]
      );
    if (underlyingCoins.length != 0) {
      for (let i = 0; i < underlyingCoins.length; i++) {
        if (!underlyingCoins[i].equals(constants.ADDRESS_ZERO)) {
          coins.push(underlyingCoins[i].toHexString());
        }
      }
      return coins;
    }
  }
  return coins;
}
exports.getPoolUnderlyingCoins = getPoolUnderlyingCoins;
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
function getPoolFromLpToken(lpTokenAddress) {
  const factoryContract = Factory_1.Factory.bind(constants.FACTORY_ADDRESS);
  const registryContract = Registry_1.Registry.bind(constants.REGISTRY_ADDRESS);
  let poolAddress = readValue(
    registryContract.try_get_pool_from_lp_token(lpTokenAddress),
    constants.NULL.TYPE_ADDRESS
  );
  if (poolAddress.equals(constants.NULL.TYPE_ADDRESS)) {
    poolAddress = readValue(
      factoryContract.try_get_pool_from_lp_token(lpTokenAddress),
      constants.NULL.TYPE_ADDRESS
    );
  }
  return poolAddress;
}
exports.getPoolFromLpToken = getPoolFromLpToken;
function getVirtualPriceFromPool(poolAddress) {
  const poolContract = Pool_1.Pool.bind(poolAddress);
  const virtualPrice = readValue(
    poolContract.try_get_virtual_price(),
    constants.BIGINT_ONE
  ).divDecimal(
    constants.BIGINT_TEN.pow(constants.DEFAULT_DECIMALS).toBigDecimal()
  );
  return virtualPrice;
}
exports.getVirtualPriceFromPool = getVirtualPriceFromPool;
function getOutputTokenPriceUSD2(poolAddress, block) {
  const virtualPrice = getVirtualPriceFromPool(poolAddress);
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(poolAddress, block);
  const coins = pool.inputTokens;
  let bestTokenPriceUSD = constants.BIGDECIMAL_ZERO;
  const underlyingCoins = pool._underlyingTokens;
  for (let i = 0; i < coins.length; i++) {
    const token = (0, initializers_1.getOrCreateToken)(
      graph_ts_1.Address.fromString(coins[i]),
      block
    );
    if (token.lastPriceUSD.gt(constants.BIGDECIMAL_ZERO)) {
      bestTokenPriceUSD = token.lastPriceUSD;
      break;
    }
  }
  if (bestTokenPriceUSD.le(constants.BIGDECIMAL_ZERO)) {
    if (underlyingCoins.length > 0) {
      for (let i = 0; i < underlyingCoins.length; i++) {
        const token = (0, initializers_1.getOrCreateToken)(
          graph_ts_1.Address.fromString(underlyingCoins[i]),
          block
        );
        if (token.lastPriceUSD.gt(constants.BIGDECIMAL_ZERO)) {
          bestTokenPriceUSD = token.lastPriceUSD;
          break;
        }
      }
    }
  }
  const outputToken = getOrCreateTokenFromString(pool.outputToken, block);
  outputToken.lastPriceUSD = bestTokenPriceUSD.times(virtualPrice);
  outputToken.save();
  return bestTokenPriceUSD.times(virtualPrice);
}
exports.getOutputTokenPriceUSD2 = getOutputTokenPriceUSD2;
function getMinterFromLpToken(lpTokenAddress) {
  const lpTokenContract = LpToken_1.LpToken.bind(lpTokenAddress);
  const minter = readValue(
    lpTokenContract.try_minter(),
    constants.ADDRESS_ZERO
  );
  return minter;
}
exports.getMinterFromLpToken = getMinterFromLpToken;
