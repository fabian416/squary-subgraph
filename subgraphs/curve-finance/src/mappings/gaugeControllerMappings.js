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
exports.handleDeployedGauge = exports.handleNewGauge = void 0;
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("../common/constants"));
function handleNewGauge(event) {
  const gaugeAddress = event.params.addr;
  const lpToken = utils.getLpTokenFromGauge(gaugeAddress);
  if (lpToken.equals(constants.NULL.TYPE_ADDRESS)) return;
  const poolAddress = utils.getPoolFromLpToken(lpToken);
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block
  );
  const gauge = (0, initializers_1.getOrCreateLiquidityGauge)(
    gaugeAddress,
    poolAddress
  );
  pool._gaugeAddress = gauge.id;
  gauge.poolAddress = pool.id;
  gauge.save();
  pool.save();
  graph_ts_1.log.warning(
    "[NewGauge] PoolAddress: {}, GaugeAddress: {}, lpToken:{}, TxnHash: {}",
    [
      pool.id,
      gauge.id,
      lpToken.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleNewGauge = handleNewGauge;
function handleDeployedGauge(event) {
  const gaugeAddress = event.params._gauge;
  const lpTokenAddress = event.params._lp_token;
  const poolAddress = utils.getPoolFromLpToken(lpTokenAddress);
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block
  );
  const gauge = (0, initializers_1.getOrCreateLiquidityGauge)(
    gaugeAddress,
    poolAddress
  );
  pool._gaugeAddress = gauge.id;
  gauge.poolAddress = pool.id;
  gauge.save();
  pool.save();
  graph_ts_1.log.warning(
    "[DeployedGauge] PoolAddress: {}, GaugeAddress: {}, lpToken:{}, TxnHash: {}",
    [
      pool.id,
      gauge.id,
      lpTokenAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleDeployedGauge = handleDeployedGauge;
