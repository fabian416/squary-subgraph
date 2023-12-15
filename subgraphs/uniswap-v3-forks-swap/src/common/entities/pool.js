"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiquidityPool = exports.createLiquidityPool = void 0;
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const schema_1 = require("../../../generated/schema");
const templates_1 = require("../../../generated/templates");
// Create a liquidity pool from pairCreated event.
function createLiquidityPool(event, poolAddress, token0Address, token1Address, fees) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    // create the tokens and tokentracker
    const token0 = (0, token_1.getOrCreateToken)(token0Address);
    const token1 = (0, token_1.getOrCreateToken)(token1Address);
    const pool = new schema_1.LiquidityPool(poolAddress);
    pool.protocol = protocol.id;
    pool.name =
        protocol.name +
            " " +
            token0.name +
            "/" +
            token1.name +
            " " +
            (0, utils_1.convertFeeToPercent)(fees).toString() +
            "%";
    pool.symbol = token0.name + "/" + token1.name;
    pool.inputTokens = [token0.id, token1.id];
    pool.inputTokenWeights = [constants_1.BIGDECIMAL_FIFTY, constants_1.BIGDECIMAL_FIFTY];
    pool.fees = [];
    pool.isSingleSided = false;
    pool.createdTimestamp = event.block.timestamp;
    pool.createdBlockNumber = event.block.number;
    pool.liquidityToken = null;
    pool.liquidityTokenType = constants_1.TokenType.MULTIPLE;
    pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    pool.totalLiquidity = constants_1.BIGINT_ZERO;
    pool.totalLiquidityUSD = constants_1.BIGDECIMAL_ZERO;
    pool.activeLiquidity = constants_1.BIGINT_ZERO;
    pool.activeLiquidityUSD = constants_1.BIGDECIMAL_ZERO;
    pool.inputTokenBalances = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
    pool.inputTokenBalancesUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    pool.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeVolumeByTokenAmount = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
    pool.cumulativeVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.uncollectedProtocolSideTokenAmounts = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
    pool.uncollectedProtocolSideValuesUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    pool.uncollectedSupplySideTokenAmounts = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
    pool.uncollectedSupplySideValuesUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    pool.cumulativeDepositCount = constants_1.INT_ZERO;
    pool.cumulativeWithdrawCount = constants_1.INT_ZERO;
    pool.cumulativeSwapCount = constants_1.INT_ZERO;
    pool.positionCount = constants_1.INT_ZERO;
    pool.openPositionCount = constants_1.INT_ZERO;
    pool.closedPositionCount = constants_1.INT_ZERO;
    pool.lastSnapshotDayID = constants_1.INT_ZERO;
    pool.lastSnapshotHourID = constants_1.INT_ZERO;
    pool.lastUpdateBlockNumber = event.block.number;
    pool.lastUpdateTimestamp = event.block.timestamp;
    protocol.totalPoolCount = protocol.totalPoolCount + constants_1.INT_ONE;
    // Create and track the newly created pool contract based on the template specified in the subgraph.yaml file.
    templates_1.Pool.create(poolAddress);
    protocol.save();
    pool.save();
}
exports.createLiquidityPool = createLiquidityPool;
function getLiquidityPool(poolAddress) {
    return schema_1.LiquidityPool.load(poolAddress);
}
exports.getLiquidityPool = getLiquidityPool;
