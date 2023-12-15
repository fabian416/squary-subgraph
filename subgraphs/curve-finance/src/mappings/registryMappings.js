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
exports.handleLiquidityGaugeDeployedWithToken =
  exports.handleLiquidityGaugeDeployed =
  exports.handleCryptoPoolDeployed =
  exports.handleMetaPoolDeployed =
  exports.handlePlainPoolDeployed =
  exports.handleBasePoolAdded =
  exports.handlePoolAddedWithRate =
  exports.handlePoolAdded =
    void 0;
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
function handlePoolAdded(event) {
  const registryAddress = event.address;
  const poolAddress = event.params.pool;
  if (utils.isPoolRegistered(poolAddress)) return;
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block
  );
  let lpToken = utils.getLpTokenFromRegistry(
    poolAddress,
    registryAddress,
    event.block
  );
  if (!lpToken)
    lpToken = utils.getOrCreateTokenFromString(pool.outputToken, event.block);
  const lpTokenStore = (0, initializers_1.getOrCreateLpToken)(
    graph_ts_1.Address.fromString(lpToken.id)
  );
  lpTokenStore.registryAddress = registryAddress.toHexString();
  lpTokenStore.poolAddress = poolAddress.toHexString();
  pool.name = lpToken.name;
  pool.symbol = lpToken.symbol;
  pool.outputToken = lpToken.id;
  pool._registryAddress = registryAddress.toHexString();
  lpTokenStore.save();
  pool.save();
  graph_ts_1.log.warning(
    "[PoolAdded] PoolAddress: {}, Registry: {}, TxnHash: {}",
    [
      pool.id,
      registryAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handlePoolAdded = handlePoolAdded;
function handlePoolAddedWithRate(event) {
  const registryAddress = event.address;
  const poolAddress = event.params.pool;
  if (utils.isPoolRegistered(poolAddress)) return;
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block
  );
  let lpToken = utils.getLpTokenFromRegistry(
    poolAddress,
    registryAddress,
    event.block
  );
  if (!lpToken)
    lpToken = utils.getOrCreateTokenFromString(pool.outputToken, event.block);
  const lpTokenStore = (0, initializers_1.getOrCreateLpToken)(
    graph_ts_1.Address.fromString(lpToken.id)
  );
  lpTokenStore.registryAddress = registryAddress.toHexString();
  lpTokenStore.poolAddress = poolAddress.toHexString();
  pool._registryAddress = registryAddress.toHexString();
  pool.name = lpToken.name;
  pool.symbol = lpToken.symbol;
  pool.outputToken = lpToken.id;
  lpTokenStore.save();
  pool.save();
  graph_ts_1.log.warning(
    "[PoolAdded] PoolAddress: {}, Registry: {}, TxnHash: {}",
    [
      pool.id,
      registryAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handlePoolAddedWithRate = handlePoolAddedWithRate;
function handleBasePoolAdded(event) {
  const poolAddress = event.params.base_pool;
  const registryAddress = event.address.toHexString();
  if (utils.isPoolRegistered(poolAddress)) return;
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block
  );
  pool._registryAddress = registryAddress;
  pool.save();
  graph_ts_1.log.warning(
    "[BasePoolAdded] PoolAddress: {}, Registry: {}, TxnHash: {}",
    [pool.id, registryAddress, event.transaction.hash.toHexString()]
  );
}
exports.handleBasePoolAdded = handleBasePoolAdded;
function handlePlainPoolDeployed(event) {
  const coins = event.params.coins;
  const registryAddress = event.address;
  const poolAddress = utils.getPoolFromCoins(registryAddress, coins);
  if (!poolAddress) return;
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block
  );
  pool._registryAddress = registryAddress.toHexString();
  pool.save();
  graph_ts_1.log.warning(
    "[PlainPoolDeployed] PoolAddress: {}, Registry: {}, TxnHash: {}",
    [
      pool.id,
      registryAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handlePlainPoolDeployed = handlePlainPoolDeployed;
function handleMetaPoolDeployed(event) {
  const registryAddress = event.address;
  const inputCoinAddress = event.params.coin;
  const basePoolAddress = event.params.base_pool;
  const basePool = (0, initializers_1.getOrCreateLiquidityPool)(
    basePoolAddress,
    event.block
  );
  const poolCoins = [
    inputCoinAddress,
    graph_ts_1.Address.fromString(basePool.outputToken),
  ];
  const poolAddress = utils.getPoolFromCoins(registryAddress, poolCoins);
  if (!poolAddress) return;
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block
  );
  pool._registryAddress = registryAddress.toHexString();
  pool._isMetapool = true;
  pool.save();
  graph_ts_1.log.warning(
    "[MetaPoolDeployed] PoolAddress: {}, registryAddress: {}, basePoolAddress: {}, TxnHash: {}",
    [
      pool.id,
      registryAddress.toHexString(),
      basePoolAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleMetaPoolDeployed = handleMetaPoolDeployed;
function handleCryptoPoolDeployed(event) {
  const lpToken = event.params.token;
  const poolCoins = event.params.coins;
  const registryAddress = event.address;
  const poolAddress = utils.getPoolFromCoins(registryAddress, poolCoins);
  if (!poolAddress) return;
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block
  );
  pool._registryAddress = registryAddress.toHexString();
  pool.outputToken = lpToken.toHexString();
  pool.save();
  graph_ts_1.log.warning(
    "[CryptoPoolDeployed] PoolAddress: {}, registryAddress: {}, TxnHash: {}",
    [
      pool.id,
      registryAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleCryptoPoolDeployed = handleCryptoPoolDeployed;
function handleLiquidityGaugeDeployed(event) {
  const registryAddress = event.address;
  const poolAddress = event.params.pool;
  const gaugeAddress = event.params.gauge;
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block
  );
  const gauge = (0, initializers_1.getOrCreateLiquidityGauge)(
    gaugeAddress,
    poolAddress
  );
  gauge.poolAddress = pool.id;
  gauge.save();
  graph_ts_1.log.warning(
    "[LiquidityGaugeDeployed] GaugeAddress: {}, PoolAddress: {}, registryAddress: {}, TxnHash: {}",
    [
      gaugeAddress.toHexString(),
      poolAddress.toHexString(),
      registryAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleLiquidityGaugeDeployed = handleLiquidityGaugeDeployed;
function handleLiquidityGaugeDeployedWithToken(event) {
  const lpToken = event.params.token;
  const registryAddress = event.address;
  const poolAddress = event.params.pool;
  const gaugeAddress = event.params.gauge;
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block
  );
  const gauge = (0, initializers_1.getOrCreateLiquidityGauge)(
    gaugeAddress,
    poolAddress
  );
  pool.outputToken = lpToken.toHexString();
  gauge.poolAddress = pool.id;
  gauge.save();
  pool.save();
  graph_ts_1.log.warning(
    "[LiquidityGaugeDeployedWithToken] GaugeAddress: {}, PoolAddress: {}, registryAddress: {}, lpToken:{}, TxnHash: {}",
    [
      gaugeAddress.toHexString(),
      poolAddress.toHexString(),
      registryAddress.toHexString(),
      lpToken.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleLiquidityGaugeDeployedWithToken =
  handleLiquidityGaugeDeployedWithToken;
