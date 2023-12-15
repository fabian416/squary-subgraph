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
exports.handleCryptoPoolDeployed =
  exports.handleBasePoolAdded =
  exports.handleMetaPoolDeployed =
  exports.handlePlainPoolDeployed =
    void 0;
const utils = __importStar(require("../common/utils"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
function handlePlainPoolDeployed(event) {
  const registryAddress = event.address;
  const poolAddress = event.params.pool;
  if (utils.checkIfPoolExists(poolAddress)) return;
  (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block,
    registryAddress
  );
  graph_ts_1.log.warning(
    "[PlainPoolDeployed] PoolAddress: {}, Registry: {}, TxnHash: {}",
    [
      poolAddress.toHexString(),
      registryAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handlePlainPoolDeployed = handlePlainPoolDeployed;
function handleMetaPoolDeployed(event) {
  const registryAddress = event.address;
  const poolAddress = event.params.pool;
  if (utils.checkIfPoolExists(poolAddress)) return;
  (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block,
    registryAddress
  );
  graph_ts_1.log.warning(
    "[MetaPoolDeployed] PoolAddress: {}, Registry: {}, TxnHash: {}",
    [
      poolAddress.toHexString(),
      registryAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleMetaPoolDeployed = handleMetaPoolDeployed;
function handleBasePoolAdded(event) {
  const registryAddress = event.address;
  const poolAddress = event.params.base_pool;
  if (utils.checkIfPoolExists(poolAddress)) return;
  (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block,
    registryAddress
  );
  graph_ts_1.log.warning(
    "[BasePoolAdded] PoolAddress: {}, Registry: {}, TxnHash: {}",
    [
      poolAddress.toHexString(),
      registryAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleBasePoolAdded = handleBasePoolAdded;
function handleCryptoPoolDeployed(event) {
  const registryAddress = event.address;
  const poolAddress = event.params.pool;
  if (utils.checkIfPoolExists(poolAddress)) return;
  (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block,
    registryAddress
  );
  graph_ts_1.log.warning(
    "[MetaPoolDeployed] PoolAddress: {}, Registry: {}, TxnHash: {}",
    [
      poolAddress.toHexString(),
      registryAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleCryptoPoolDeployed = handleCryptoPoolDeployed;
