"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateEmptyPools = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../constants");
const Pool_1 = require("../../../generated/Factory/Pool");
const TickLens_1 = require("../../../generated/Factory/TickLens");
const ERC20_1 = require("../../../generated/Factory/ERC20");
const utils_1 = require("./utils");
const poolMappings_1 = require("./poolMappings");
const pool_1 = require("../entities/pool");
const protocol_1 = require("../entities/protocol");
const token_1 = require("../entities/token");
const tick_1 = require("../entities/tick");
/**
 * Create entries in store for each pool and token
 * before regenesis.
 */
function populateEmptyPools(event) {
    const length = poolMappings_1.POOL_MAPPINGS.length;
    const tickLensContract = TickLens_1.TickLens.bind(graph_ts_1.Address.fromString("0xbfd8137f7d1516d3ea5ca83523914859ec47f573"));
    for (let i = 0; i < length; ++i) {
        const poolMapping = poolMappings_1.POOL_MAPPINGS[i];
        const poolAddress = poolMapping[1];
        const token0Address = poolMapping[2];
        const token1Address = poolMapping[3];
        const poolContract = Pool_1.Pool.bind(poolAddress);
        (0, pool_1.createLiquidityPool)(event, poolAddress, token0Address, token1Address, poolContract.fee());
        const pool = (0, pool_1.getLiquidityPool)(poolAddress);
        const poolAmounts = (0, pool_1.getLiquidityPoolAmounts)(poolAddress);
        // create the tokens and tokentracker
        const token0 = (0, token_1.getOrCreateToken)(event, token0Address);
        const token1 = (0, token_1.getOrCreateToken)(event, token1Address);
        // populate the TVL by call contract balanceOf
        const token0Contract = ERC20_1.ERC20.bind(graph_ts_1.Address.fromBytes(pool.inputTokens[constants_1.INT_ZERO]));
        const tvlToken0Raw = token0Contract.balanceOf(graph_ts_1.Address.fromBytes(pool.id));
        const tvlToken0Adjusted = (0, utils_1.convertTokenToDecimal)(tvlToken0Raw, token0.decimals);
        const token1Contract = ERC20_1.ERC20.bind(graph_ts_1.Address.fromBytes(pool.inputTokens[constants_1.INT_ONE]));
        const tvlToken1Raw = token1Contract.balanceOf(graph_ts_1.Address.fromBytes(pool.id));
        const tvlToken1Adjusted = (0, utils_1.convertTokenToDecimal)(tvlToken1Raw, token1.decimals);
        pool.inputTokenBalances = [tvlToken0Raw, tvlToken1Raw];
        poolAmounts.inputTokenBalances = [tvlToken0Adjusted, tvlToken1Adjusted];
        pool.totalLiquidity = poolContract.liquidity();
        pool.activeLiquidity = pool.totalLiquidity;
        const tickSpacing = poolContract.tickSpacing();
        // https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/TickMath.sol
        // https://docs.uniswap.org/contracts/v3/reference/periphery/lens/TickLens
        // Min and Max tick are the range of ticks that a position can be in
        const maxTick = customCeil(887272 / tickSpacing) * tickSpacing;
        const minTick = -maxTick;
        const ticksPerWord = 256 * tickSpacing;
        const wordsCount = customCeil((maxTick - minTick) / ticksPerWord);
        let totalLiquidityGross = constants_1.BIGINT_ZERO;
        for (let i = 0; i < wordsCount; i++) {
            const tickBitmapIndex = customFloor(minTick / ticksPerWord) + i;
            const populatedTicks = tickLensContract.getPopulatedTicksInWord(poolAddress, tickBitmapIndex);
            for (let j = 0; j < populatedTicks.length; j++) {
                const populatedTick = populatedTicks[j];
                const tick = (0, tick_1.getOrCreateTick)(event, pool, graph_ts_1.BigInt.fromI32(populatedTick.tick));
                tick.liquidityGross = populatedTick.liquidityGross;
                tick.liquidityNet = populatedTick.liquidityNet;
                tick.lastUpdateTimestamp = event.block.timestamp;
                tick.lastUpdateBlockNumber = event.block.number;
                tick.save();
                totalLiquidityGross = totalLiquidityGross.plus(populatedTick.liquidityGross);
            }
        }
        pool.totalLiquidity = totalLiquidityGross.div(constants_1.BIGINT_TWO);
        poolAmounts.save();
        pool.save();
    }
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    protocol._regenesis = true;
    protocol.save();
}
exports.populateEmptyPools = populateEmptyPools;
function customFloor(value) {
    return value % 1 === 0
        ? value
        : value > 0
            ? parseInt(value.toString())
            : parseInt(value.toString()) - 1;
}
function customCeil(value) {
    return value % 1 === 0
        ? value
        : value > 0
            ? parseInt(value.toString()) + 1
            : parseInt(value.toString());
}
