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
exports.Swap =
  exports.UpdateMetricsAfterSwap =
  exports.createSwapTransaction =
    void 0;
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Metrics_1 = require("./Metrics");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
function createSwapTransaction(
  liquidityPool,
  tokenIn,
  amountIn,
  amountInUSD,
  tokenOut,
  amountOut,
  amountOutUSD,
  buyer,
  transaction,
  block
) {
  const transactionId = "swap-"
    .concat(transaction.hash.toHexString())
    .concat("-")
    .concat(transaction.index.toString());
  let swapTransaction = schema_1.Swap.load(transactionId);
  if (!swapTransaction) {
    swapTransaction = new schema_1.Swap(transactionId);
    swapTransaction.pool = liquidityPool.id;
    swapTransaction.protocol = (0,
    initializers_1.getOrCreateDexAmmProtocol)().id;
    swapTransaction.to = liquidityPool.id;
    swapTransaction.from = buyer.toHexString();
    swapTransaction.hash = transaction.hash.toHexString();
    swapTransaction.logIndex = transaction.index.toI32();
    swapTransaction.tokenIn = tokenIn.id;
    swapTransaction.amountIn = amountIn;
    swapTransaction.amountInUSD = amountInUSD;
    swapTransaction.tokenOut = tokenOut.id;
    swapTransaction.amountOut = amountOut;
    swapTransaction.amountOutUSD = amountOutUSD;
    swapTransaction.timestamp = block.timestamp;
    swapTransaction.blockNumber = block.number;
    swapTransaction.save();
  }
  return swapTransaction;
}
exports.createSwapTransaction = createSwapTransaction;
function UpdateMetricsAfterSwap(block) {
  const protocol = (0, initializers_1.getOrCreateDexAmmProtocol)();
  // Update hourly and daily deposit transaction count
  const metricsDailySnapshot = (0,
  initializers_1.getOrCreateUsageMetricsDailySnapshot)(block);
  const metricsHourlySnapshot = (0,
  initializers_1.getOrCreateUsageMetricsHourlySnapshot)(block);
  metricsDailySnapshot.dailySwapCount += 1;
  metricsHourlySnapshot.hourlySwapCount += 1;
  metricsDailySnapshot.save();
  metricsHourlySnapshot.save();
  protocol.save();
}
exports.UpdateMetricsAfterSwap = UpdateMetricsAfterSwap;
function Swap(
  liquidityPoolAddress,
  sold_id,
  amountIn,
  bought_id,
  amountOut,
  buyer,
  transaction,
  block,
  underlying = false
) {
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    liquidityPoolAddress,
    block
  );
  let tokenIn;
  let tokenOut;
  if (!underlying) {
    tokenIn = pool.inputTokens[sold_id.toI32()];
    tokenOut = pool.inputTokens[bought_id.toI32()];
  } else {
    let underlyingCoins = utils.getPoolUnderlyingCoins(
      liquidityPoolAddress,
      pool._registry
        ? graph_ts_1.Address.fromString(pool._registry)
        : constants.ADDRESS_ZERO
    );
    if (liquidityPoolAddress.equals(constants.EPS_POOL_ADDRESS))
      if (underlyingCoins.length == 0) underlyingCoins = pool.inputTokens;
    if (underlyingCoins.length == 0) return;
    tokenIn = underlyingCoins[sold_id.toI32()];
    tokenOut = underlyingCoins[bought_id.toI32()];
  }
  const tokenInStore = utils.getOrCreateTokenFromString(tokenIn, block);
  const amountInUSD = amountIn
    .divDecimal(constants.BIGINT_TEN.pow(tokenInStore.decimals).toBigDecimal())
    .times(tokenInStore.lastPriceUSD);
  const tokenOutStore = utils.getOrCreateTokenFromString(tokenOut, block);
  const amountOutUSD = amountOut
    .divDecimal(constants.BIGINT_TEN.pow(tokenOutStore.decimals).toBigDecimal())
    .times(tokenOutStore.lastPriceUSD);
  createSwapTransaction(
    pool,
    tokenInStore,
    amountIn,
    amountInUSD,
    tokenOutStore,
    amountOut,
    amountOutUSD,
    buyer,
    transaction,
    block
  );
  const volumeUSD = utils.calculateAverage([amountInUSD, amountOutUSD]);
  pool.inputTokenBalances = utils.getPoolBalances(
    liquidityPoolAddress,
    pool.inputTokens
  );
  pool.inputTokenWeights = utils.getPoolTokenWeights(
    pool.inputTokens,
    pool.inputTokenBalances,
    pool.totalValueLockedUSD,
    block
  );
  pool.cumulativeVolumeUSD = pool.cumulativeVolumeUSD.plus(volumeUSD);
  pool.save();
  (0, Metrics_1.updateTokenVolume)(
    liquidityPoolAddress,
    tokenIn,
    amountIn,
    amountInUSD,
    block,
    underlying
  );
  (0, Metrics_1.updateTokenVolume)(
    liquidityPoolAddress,
    tokenOut,
    amountOut,
    amountOutUSD,
    block,
    underlying
  );
  (0, Metrics_1.updateProtocolRevenue)(liquidityPoolAddress, volumeUSD, block);
  (0, Metrics_1.updateSnapshotsVolume)(liquidityPoolAddress, volumeUSD, block);
  UpdateMetricsAfterSwap(block);
  utils.updateProtocolTotalValueLockedUSD();
  graph_ts_1.log.info(
    "[Exchange] LiquidityPool: {}, tokenIn: {}, tokenOut: {}, amountInUSD: {}, amountOutUSD: {}, isUnderlying: {}, TxnHash: {}",
    [
      liquidityPoolAddress.toHexString(),
      tokenIn,
      tokenOut,
      amountInUSD.truncate(2).toString(),
      amountOutUSD.truncate(2).toString(),
      underlying.toString(),
      transaction.hash.toHexString(),
    ]
  );
}
exports.Swap = Swap;