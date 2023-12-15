"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwapHandleVolumeAndFees =
  exports.createWithdraw =
  exports.createDeposit =
  exports.createLiquidityPool =
  exports.factoryContract =
    void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
// import { log } from "@graphprotocol/graph-ts"
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const templates_1 = require("../../generated/templates");
const Factory_1 = require("../../generated/templates/Pair/Factory");
const constants_1 = require("../common/constants");
const getters_1 = require("../common/getters");
exports.factoryContract = Factory_1.Factory.bind(
  graph_ts_1.Address.fromString(constants_1.FACTORY_ADDRESS)
);
// Create a liquidity pool from PairCreated contract call
function createLiquidityPool(event, poolAddress, token0Address, token1Address) {
  const protocol = (0, getters_1.getOrCreateDex)();
  // create the tokens and tokentracker
  const token0 = (0, getters_1.getOrCreateToken)(token0Address);
  const token1 = (0, getters_1.getOrCreateToken)(token1Address);
  const LPtoken = (0, getters_1.getOrCreateToken)(poolAddress);
  const pool = new schema_1.LiquidityPool(poolAddress.toHexString());
  pool.protocol = protocol.id;
  pool.inputTokens = [token0.id, token1.id];
  pool.outputToken = LPtoken.id;
  pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  pool.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
  pool.inputTokenBalances = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
  pool.inputTokenWeights = [
    constants_1.BIGDECIMAL_ONE.div(constants_1.BIGDECIMAL_TWO),
    constants_1.BIGDECIMAL_ONE.div(constants_1.BIGDECIMAL_TWO),
  ];
  pool.outputTokenSupply = constants_1.BIGINT_ZERO;
  pool.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
  pool.stakedOutputTokenAmount = constants_1.BIGINT_ZERO;
  pool.rewardTokenEmissionsAmount = [
    constants_1.BIGINT_ZERO,
    constants_1.BIGINT_ZERO,
  ];
  pool.rewardTokenEmissionsUSD = [
    constants_1.BIGDECIMAL_ZERO,
    constants_1.BIGDECIMAL_ZERO,
  ];
  pool.fees = createPoolFees(poolAddress.toHexString());
  pool.createdTimestamp = event.block.timestamp;
  pool.createdBlockNumber = event.block.number;
  pool.name = protocol.name + " " + LPtoken.symbol;
  pool.symbol = LPtoken.symbol;
  // create the tracked contract based on the template
  templates_1.Pair.create(poolAddress);
  pool.save();
  token0.save();
  token1.save();
  LPtoken.save();
}
exports.createLiquidityPool = createLiquidityPool;
function createPoolFees(poolAddress) {
  const poolLpFee = new schema_1.LiquidityPoolFee(
    poolAddress.concat("-lp-fee")
  );
  const poolProtocolFee = new schema_1.LiquidityPoolFee(
    poolAddress.concat("-protocol-fee")
  );
  const poolTradingFee = new schema_1.LiquidityPoolFee(
    poolAddress.concat("-trading-fee")
  );
  poolLpFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_LP_FEE;
  poolProtocolFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE;
  poolTradingFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE;
  poolLpFee.feePercentage = constants_1.LP_FEE_TO_ON;
  poolProtocolFee.feePercentage = constants_1.PROTOCOL_FEE_TO_ON;
  poolTradingFee.feePercentage = constants_1.TRADING_FEE;
  poolLpFee.save();
  poolProtocolFee.save();
  poolTradingFee.save();
  return [poolLpFee.id, poolProtocolFee.id, poolTradingFee.id];
}
// Generate the deposit entity and update deposit account for the according pool.
function createDeposit(event, amount0, amount1, sender) {
  // let deposit = new Deposit(event.transaction.hash.toHexString().concat("-").concat(event.logIndex.toString()));
  // deposit.hash = event.transaction.hash.toHexString();
  // deposit.logIndex = event.logIndex.toI32();
  // deposit.protocol = FACTORY_ADDRESS;
  // ..
  // deposit.save();
}
exports.createDeposit = createDeposit;
// Generate the withdraw entity
function createWithdraw(event, amount0, amount1, sender, to) {
  // let withdrawal = new Withdraw(event.transaction.hash.toHexString().concat("-").concat(event.logIndex.toString()));
  // withdrawal.hash = event.transaction.hash.toHexString();
  // withdrawal.logIndex = event.logIndex.toI32();
  // withdrawal.protocol = FACTORY_ADDRESS;
  // ..
  // withdrawal.save();
}
exports.createWithdraw = createWithdraw;
// Handle swaps data and update entities volumes and fees
function createSwapHandleVolumeAndFees(
  event,
  to,
  sender,
  amount0In,
  amount1In,
  amount0Out,
  amount1Out
) {
  // let swap = new SwapEvent(event.transaction.hash.toHexString().concat("-").concat(event.logIndex.toString()));
  // // update swap event
  // swap.hash = event.transaction.hash.toHexString();
  // swap.logIndex = event.logIndex.toI32();
  // swap.protocol = FACTORY_ADDRESS;
  // ..
  // swap.save();
  // updateVolumeAndFees(event, trackedAmountUSD, feeUSD);
}
exports.createSwapHandleVolumeAndFees = createSwapHandleVolumeAndFees;
