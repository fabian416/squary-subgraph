"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRemoveLiquidityImbalance =
  exports.handleRemoveLiquidityOneWithSupply =
  exports.handleRemoveLiquidityOne =
  exports.handleRemoveLiquidityWithFees =
  exports.handleRemoveLiquidity =
  exports.handleAddLiquidityWithFees =
  exports.handleAddLiquidity =
  exports.handleTokenExchangeUnderlying =
  exports.handleTokenExchange =
    void 0;
const Metrics_1 = require("../modules/Metrics");
const Swap_1 = require("../modules/Swap");
const Deposit_1 = require("../modules/Deposit");
const Withdraw_1 = require("../modules/Withdraw");
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
function handleTokenExchangeUnderlying(event) {
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
    event.block,
    true
  );
  (0, Metrics_1.updateUsageMetrics)(event.block, buyer);
  (0, Metrics_1.updatePoolSnapshots)(liquidityPoolAddress, event.block);
  (0, Metrics_1.updateFinancials)(event.block);
}
exports.handleTokenExchangeUnderlying = handleTokenExchangeUnderlying;
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
function handleAddLiquidityWithFees(event) {
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
exports.handleAddLiquidityWithFees = handleAddLiquidityWithFees;
function handleRemoveLiquidity(event) {
  const provider = event.params.provider;
  const liquidityPoolAddress = event.address;
  const withdrawnCoinAmounts = event.params.token_amounts;
  const tokenSupplyAfterWithdrawal = event.params.token_supply;
  (0, Withdraw_1.Withdraw)(
    liquidityPoolAddress,
    withdrawnCoinAmounts,
    null,
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
function handleRemoveLiquidityWithFees(event) {
  const provider = event.params.provider;
  const liquidityPoolAddress = event.address;
  const withdrawnCoinAmounts = event.params.token_amounts;
  const tokenSupplyAfterWithdrawal = event.params.token_supply;
  (0, Withdraw_1.Withdraw)(
    liquidityPoolAddress,
    withdrawnCoinAmounts,
    null,
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
exports.handleRemoveLiquidityWithFees = handleRemoveLiquidityWithFees;
function handleRemoveLiquidityOne(event) {
  const provider = event.params.provider;
  const liquidityPoolAddress = event.address;
  const outputTokenBurntAmount = event.params.token_amount;
  (0, Withdraw_1.Withdraw)(
    liquidityPoolAddress,
    [],
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
function handleRemoveLiquidityOneWithSupply(event) {
  const provider = event.params.provider;
  const liquidityPoolAddress = event.address;
  const outputTokenBurntAmount = event.params.token_amount;
  (0, Withdraw_1.Withdraw)(
    liquidityPoolAddress,
    [],
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
exports.handleRemoveLiquidityOneWithSupply = handleRemoveLiquidityOneWithSupply;
function handleRemoveLiquidityImbalance(event) {
  const provider = event.params.provider;
  const liquidityPoolAddress = event.address;
  const withdrawnTokenAmounts = event.params.token_amounts;
  const tokenSupplyAfterWithdrawal = event.params.token_supply;
  (0, Withdraw_1.Withdraw)(
    liquidityPoolAddress,
    withdrawnTokenAmounts,
    null,
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
