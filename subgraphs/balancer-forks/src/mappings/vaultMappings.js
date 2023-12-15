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
exports.handleSwap =
  exports.handlePoolBalanceChanged =
  exports.handleTokensRegistered =
  exports.handlePoolRegistered =
    void 0;
const Metrics_1 = require("../modules/Metrics");
const initializers_1 = require("../common/initializers");
const Swap_1 = require("../modules/Swap");
const utils = __importStar(require("../common/utils"));
const Deposit_1 = require("../modules/Deposit");
const Withdraw_1 = require("../modules/Withdraw");
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
function handlePoolRegistered(event) {
  const poolId = event.params.poolId;
  const poolAddress = event.params.poolAddress;
  const specialization = event.params.specialization;
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block
  );
  graph_ts_1.log.warning(
    "[PoolRegistered] Pool: {}, poolId: {}, specialization: {}",
    [pool.id, poolId.toHexString(), specialization.toString()]
  );
}
exports.handlePoolRegistered = handlePoolRegistered;
function handleTokensRegistered(event) {
  const poolId = event.params.poolId;
  const poolAddress = graph_ts_1.Address.fromString(
    poolId.toHexString().substring(0, 42)
  );
  const pool = (0, initializers_1.getOrCreateLiquidityPool)(
    poolAddress,
    event.block
  );
  const tokens = event.params.tokens;
  const inputTokens = [];
  const inputTokenLength = tokens.length;
  for (let idx = 0; idx < inputTokenLength; idx++) {
    // Exception: StablePoolFactory added poolAddress in event params token
    if (tokens.at(idx).equals(poolAddress)) continue;
    inputTokens.push(
      (0, initializers_1.getOrCreateToken)(tokens.at(idx), event.block.number)
        .id
    );
  }
  pool.inputTokens = inputTokens;
  pool.inputTokenBalances = new Array(inputTokens.length).fill(
    constants.BIGINT_ZERO
  );
  pool.inputTokenWeights = utils.getPoolTokenWeights(
    poolAddress,
    pool.inputTokens
  );
  pool.save();
}
exports.handleTokensRegistered = handleTokensRegistered;
function handlePoolBalanceChanged(event) {
  const poolId = event.params.poolId;
  const poolAddress = graph_ts_1.Address.fromString(
    poolId.toHexString().substring(0, 42)
  );
  const deltas = event.params.deltas;
  if (deltas.length === 0) return;
  const inputTokens = event.params.tokens;
  const fees = event.params.protocolFeeAmounts;
  const provider = event.params.liquidityProvider;
  const total = deltas.reduce(
    (sum, amount) => sum.plus(amount),
    new graph_ts_1.BigInt(0)
  );
  if (total.gt(constants.BIGINT_ZERO)) {
    (0, Deposit_1.Deposit)(
      poolAddress,
      inputTokens,
      deltas,
      fees,
      provider,
      event.transaction,
      event.block
    );
  } else {
    (0, Withdraw_1.Withdraw)(
      poolAddress,
      inputTokens,
      deltas,
      fees,
      provider,
      event.transaction,
      event.block
    );
  }
  (0, Metrics_1.updateUsageMetrics)(event.block, provider);
  (0, Metrics_1.updatePoolSnapshots)(poolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handlePoolBalanceChanged = handlePoolBalanceChanged;
function handleSwap(event) {
  const poolId = event.params.poolId;
  const poolAddress = graph_ts_1.Address.fromString(
    poolId.toHexString().substring(0, 42)
  );
  const tokenIn = event.params.tokenIn;
  const amountIn = event.params.amountIn;
  const tokenOut = event.params.tokenOut;
  const amountOut = event.params.amountOut;
  (0, Swap_1.Swap)(
    poolAddress,
    tokenIn,
    amountIn,
    tokenOut,
    amountOut,
    event.transaction,
    event.block
  );
  (0, Metrics_1.updateUsageMetrics)(event.block, event.transaction.from);
  (0, Metrics_1.updatePoolSnapshots)(poolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleSwap = handleSwap;
