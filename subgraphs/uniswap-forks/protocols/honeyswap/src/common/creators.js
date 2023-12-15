"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePoolRewardToken = exports.createPoolRewardToken = exports.createLiquidityPool = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../generated/schema");
const templates_1 = require("../../../../generated/templates");
const constants_1 = require("../../../../src/common/constants");
const creators_1 = require("../../../../src/common/creators");
const getters_1 = require("../../../../src/common/getters");
const updateMetrics_1 = require("../../../../src/common/updateMetrics");
const configure_1 = require("../../../../configurations/configure");
// Create a liquidity pool from PairCreated contract call (for WETH pairs on Polygon)
function createHalvedPoolFees(poolAddress, blockNumber) {
    const poolLpFee = new schema_1.LiquidityPoolFee(poolAddress.concat("-lp-fee"));
    const poolProtocolFee = new schema_1.LiquidityPoolFee(poolAddress.concat("-protocol-fee"));
    const poolTradingFee = new schema_1.LiquidityPoolFee(poolAddress.concat("-trading-fee"));
    poolLpFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_LP_FEE;
    poolProtocolFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE;
    poolTradingFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE;
    if (configure_1.NetworkConfigs.getFeeOnOff() == constants_1.FeeSwitch.ON) {
        poolLpFee.feePercentage =
            configure_1.NetworkConfigs.getLPFeeToOn(blockNumber).div(constants_1.BIGDECIMAL_TWO);
        poolProtocolFee.feePercentage =
            configure_1.NetworkConfigs.getProtocolFeeToOn(blockNumber).div(constants_1.BIGDECIMAL_TWO);
    }
    else {
        poolLpFee.feePercentage =
            configure_1.NetworkConfigs.getLPFeeToOff().div(constants_1.BIGDECIMAL_TWO);
        poolProtocolFee.feePercentage =
            configure_1.NetworkConfigs.getProtocolFeeToOff().div(constants_1.BIGDECIMAL_TWO);
    }
    poolTradingFee.feePercentage =
        configure_1.NetworkConfigs.getTradeFee(blockNumber).div(constants_1.BIGDECIMAL_TWO);
    poolLpFee.save();
    poolProtocolFee.save();
    poolTradingFee.save();
    return [poolLpFee.id, poolProtocolFee.id, poolTradingFee.id];
}
// Create a liquidity pool from PairCreated event emission.
function createLiquidityPool(event, poolAddress, token0Address, token1Address) {
    const protocol = (0, getters_1.getOrCreateProtocol)();
    // create the tokens and tokentracker
    const token0 = (0, getters_1.getOrCreateToken)(event, token0Address);
    const token1 = (0, getters_1.getOrCreateToken)(event, token1Address);
    const LPtoken = (0, getters_1.getOrCreateLPToken)(poolAddress, token0, token1);
    (0, updateMetrics_1.updateTokenWhitelists)(token0, token1, poolAddress);
    const pool = new schema_1.LiquidityPool(poolAddress);
    const poolAmounts = new schema_1._LiquidityPoolAmount(poolAddress);
    pool.protocol = protocol.id;
    pool.name = protocol.name + " " + LPtoken.symbol;
    pool.symbol = LPtoken.symbol;
    pool.inputTokens = [token0.id, token1.id];
    pool.outputToken = LPtoken.id;
    pool.isSingleSided = false;
    pool.createdTimestamp = event.block.timestamp;
    pool.createdBlockNumber = event.block.number;
    pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    pool.inputTokenBalances = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
    pool.inputTokenWeights = [constants_1.BIGDECIMAL_FIFTY_PERCENT, constants_1.BIGDECIMAL_FIFTY_PERCENT];
    pool.outputTokenSupply = constants_1.BIGINT_ZERO;
    pool.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    // Halve pool fees for WETH pairs
    if (configure_1.NetworkConfigs.getReferenceToken() == token0Address ||
        configure_1.NetworkConfigs.getReferenceToken() == token1Address) {
        pool.fees = createHalvedPoolFees(poolAddress, event.block.number);
    }
    else {
        pool.fees = (0, creators_1.createPoolFees)(poolAddress, event.block.number);
    }
    poolAmounts.inputTokens = [token0.id, token1.id];
    poolAmounts.inputTokenBalances = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    // Used to track the number of deposits in a liquidity pool
    const poolDeposits = new schema_1._HelperStore(poolAddress);
    poolDeposits.valueInt = constants_1.INT_ZERO;
    // update number of pools
    protocol.totalPoolCount += 1;
    protocol.save();
    // Create and track the newly created pool contract based on the template specified in the subgraph.yaml file.
    templates_1.Pair.create(graph_ts_1.Address.fromString(poolAddress));
    pool.save();
    token0.save();
    token1.save();
    LPtoken.save();
    poolAmounts.save();
    poolDeposits.save();
}
exports.createLiquidityPool = createLiquidityPool;
// Add reward token to liquidity pool from HoneyFarm add contract call (PoolAdded event)
function createPoolRewardToken(event, poolAddress) {
    const pool = (0, getters_1.getLiquidityPool)(poolAddress);
    pool.rewardTokens = [
        (0, getters_1.getOrCreateRewardToken)(event, configure_1.NetworkConfigs.getRewardToken()).id,
    ];
    pool.save();
}
exports.createPoolRewardToken = createPoolRewardToken;
// Remove reward token from liquidity pool from HoneyFarm set contract call (PoolRemoved event)
function removePoolRewardToken(poolAddress) {
    const pool = (0, getters_1.getLiquidityPool)(poolAddress);
    pool.rewardTokens = [];
    pool.save();
}
exports.removePoolRewardToken = removePoolRewardToken;
