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
exports.handleTokenExchangeUnderlying =
  exports.handleTokenExchangeWithUintSoldId =
  exports.handleTokenExchange =
  exports.handleRemoveLiquidityOneWithoutTokenSupply =
  exports.handleRemoveLiquidityOne =
  exports.handleRemoveLiquidityImbalance =
  exports.handleRemoveLiquidityWithoutFee =
  exports.handleRemoveLiquidity =
  exports.handleAddLiquidityWithSingleFee =
  exports.handleAddLiquidity =
    void 0;
const Metrics_1 = require("../modules/Metrics");
const Swap_1 = require("../modules/Swap");
const Deposit_1 = require("../modules/Deposit");
const Withdraw_1 = require("../modules/Withdraw");
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
function handleAddLiquidity(event) {
  const liquidityPoolAddress = event.address;
  const provider = event.params.provider;
  const tokenAmounts = event.params.token_amounts;
  const totalSupply = event.params.token_supply;
  (0, Deposit_1.Deposit)(
    liquidityPoolAddress,
    tokenAmounts,
    totalSupply,
    provider,
    event.transaction,
    event.block
  );
  (0, Metrics_1.updateUsageMetrics)(event.block, provider);
  (0, Metrics_1.updatePoolSnapshots)(liquidityPoolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleAddLiquidity = handleAddLiquidity;
function handleAddLiquidityWithSingleFee(event) {
  const liquidityPoolAddress = event.address;
  const provider = event.params.provider;
  const tokenAmounts = event.params.token_amounts;
  const totalSupply = event.params.token_supply;
  (0, Deposit_1.Deposit)(
    liquidityPoolAddress,
    tokenAmounts,
    totalSupply,
    provider,
    event.transaction,
    event.block
  );
  (0, Metrics_1.updateUsageMetrics)(event.block, provider);
  (0, Metrics_1.updatePoolSnapshots)(liquidityPoolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleAddLiquidityWithSingleFee = handleAddLiquidityWithSingleFee;
function handleRemoveLiquidity(event) {
  const provider = event.params.provider;
  const liquidityPoolAddress = event.address;
  const withdrawnCoinAmounts = event.params.token_amounts;
  const tokenSupplyAfterWithdrawal = event.params.token_supply;
  (0, Withdraw_1.Withdraw)(
    liquidityPoolAddress,
    withdrawnCoinAmounts,
    constants.BIGINT_NEGATIVE_ONE,
    tokenSupplyAfterWithdrawal,
    provider,
    event.transaction,
    event.block,
    event
  );
  (0, Metrics_1.updateUsageMetrics)(event.block, provider);
  (0, Metrics_1.updatePoolSnapshots)(liquidityPoolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleRemoveLiquidity = handleRemoveLiquidity;
function handleRemoveLiquidityWithoutFee(event) {
  const provider = event.params.provider;
  const liquidityPoolAddress = event.address;
  const withdrawnCoinAmounts = event.params.token_amounts;
  const tokenSupplyAfterWithdrawal = event.params.token_supply;
  (0, Withdraw_1.Withdraw)(
    liquidityPoolAddress,
    withdrawnCoinAmounts,
    constants.BIGINT_NEGATIVE_ONE,
    tokenSupplyAfterWithdrawal,
    provider,
    event.transaction,
    event.block,
    event
  );
  (0, Metrics_1.updateUsageMetrics)(event.block, provider);
  (0, Metrics_1.updatePoolSnapshots)(liquidityPoolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleRemoveLiquidityWithoutFee = handleRemoveLiquidityWithoutFee;
function handleRemoveLiquidityImbalance(event) {
  const provider = event.params.provider;
  const liquidityPoolAddress = event.address;
  const withdrawnTokenAmounts = event.params.token_amounts;
  const tokenSupplyAfterWithdrawal = event.params.token_supply;
  (0, Withdraw_1.Withdraw)(
    liquidityPoolAddress,
    withdrawnTokenAmounts,
    constants.BIGINT_NEGATIVE_ONE,
    tokenSupplyAfterWithdrawal,
    provider,
    event.transaction,
    event.block,
    event
  );
  (0, Metrics_1.updateUsageMetrics)(event.block, provider);
  (0, Metrics_1.updatePoolSnapshots)(liquidityPoolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleRemoveLiquidityImbalance = handleRemoveLiquidityImbalance;
function handleRemoveLiquidityOne(event) {
  const provider = event.params.provider;
  const liquidityPoolAddress = event.address;
  const withdrawnCoinAmounts = event.params.coin_amount;
  const outputTokenBurntAmount = event.params.token_amount;
  (0, Withdraw_1.Withdraw)(
    liquidityPoolAddress,
    [withdrawnCoinAmounts],
    outputTokenBurntAmount,
    null,
    provider,
    event.transaction,
    event.block,
    event
  );
  (0, Metrics_1.updateUsageMetrics)(event.block, provider);
  (0, Metrics_1.updatePoolSnapshots)(liquidityPoolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleRemoveLiquidityOne = handleRemoveLiquidityOne;
function handleRemoveLiquidityOneWithoutTokenSupply(event) {
  const provider = event.params.provider;
  const liquidityPoolAddress = event.address;
  const withdrawnCoinAmounts = event.params.coin_amount;
  const outputTokenBurntAmount = event.params.token_amount;
  (0, Withdraw_1.Withdraw)(
    liquidityPoolAddress,
    [withdrawnCoinAmounts],
    outputTokenBurntAmount,
    null,
    provider,
    event.transaction,
    event.block,
    event
  );
  (0, Metrics_1.updateUsageMetrics)(event.block, provider);
  (0, Metrics_1.updatePoolSnapshots)(liquidityPoolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleRemoveLiquidityOneWithoutTokenSupply =
  handleRemoveLiquidityOneWithoutTokenSupply;
function handleTokenExchange(event) {
  const buyer = event.params.buyer;
  const liquidityPoolAddress = event.address;
  const soldId = event.params.sold_id;
  const amountIn = event.params.tokens_sold;
  const boughtId = event.params.bought_id;
  const amountOut = event.params.tokens_bought;
  (0, Swap_1.Swap)(
    liquidityPoolAddress,
    soldId,
    amountIn,
    boughtId,
    amountOut,
    buyer,
    event.transaction,
    event.block
  );
  (0, Metrics_1.updateUsageMetrics)(event.block, buyer);
  (0, Metrics_1.updatePoolSnapshots)(liquidityPoolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleTokenExchange = handleTokenExchange;
function handleTokenExchangeWithUintSoldId(event) {
  const buyer = event.params.buyer;
  const liquidityPoolAddress = event.address;
  const soldId = event.params.sold_id;
  const amountIn = event.params.tokens_sold;
  const boughtId = event.params.bought_id;
  const amountOut = event.params.tokens_bought;
  (0, Swap_1.Swap)(
    liquidityPoolAddress,
    soldId,
    amountIn,
    boughtId,
    amountOut,
    buyer,
    event.transaction,
    event.block
  );
  (0, Metrics_1.updateUsageMetrics)(event.block, buyer);
  (0, Metrics_1.updatePoolSnapshots)(liquidityPoolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleTokenExchangeWithUintSoldId = handleTokenExchangeWithUintSoldId;
function handleTokenExchangeUnderlying(event) {
  const buyer = event.params.buyer;
  const liquidityPoolAddress = event.address;
  const soldId = event.params.sold_id;
  const amountIn = event.params.tokens_sold;
  const boughtId = event.params.bought_id;
  const amountOut = event.params.tokens_bought;
  if (
    liquidityPoolAddress.equals(
      graph_ts_1.Address.fromString(
        "0x19ec9e3f7b21dd27598e7ad5aae7dc0db00a806d"
      )
    )
  ) {
    graph_ts_1.log.warning(
      "[TokenExchangeUnderlying] Pool {} soldId {} boughtId {} amountIn {} amountOut {}",
      [
        liquidityPoolAddress.toHexString(),
        soldId.toString(),
        boughtId.toString(),
        amountIn.toString(),
        amountOut.toString(),
      ]
    );
  }
  (0, Swap_1.Swap)(
    liquidityPoolAddress,
    soldId,
    amountIn,
    boughtId,
    amountOut,
    buyer,
    event.transaction,
    event.block,
    true
  );
  (0, Metrics_1.updateUsageMetrics)(event.block, buyer);
  (0, Metrics_1.updatePoolSnapshots)(liquidityPoolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleTokenExchangeUnderlying = handleTokenExchangeUnderlying;
