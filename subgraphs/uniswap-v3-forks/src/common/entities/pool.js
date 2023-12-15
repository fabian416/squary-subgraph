"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAmountUSD = exports.getTradingFee = exports.getLiquidityPoolFee = exports.getLiquidityPoolAmounts = exports.updateProtocolFees = exports.getLiquidityPool = exports.createPoolFees = exports.createLiquidityPool = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../constants");
const utils_1 = require("../utils/utils");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const templates_1 = require("../../../generated/templates");
const configure_1 = require("../../../configurations/configure");
// Create a liquidity pool from pairCreated event.
function createLiquidityPool(event, poolAddress, token0Address, token1Address, fees) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    // create the tokens and tokentracker
    const token0 = (0, token_1.getOrCreateToken)(event, token0Address);
    const token1 = (0, token_1.getOrCreateToken)(event, token1Address);
    (0, token_1.updateTokenWhitelists)(token0, token1, poolAddress);
    const pool = new schema_1.LiquidityPool(poolAddress);
    const poolAmounts = new schema_1._LiquidityPoolAmount(poolAddress);
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
    pool.fees = createPoolFees(poolAddress, fees);
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
    poolAmounts.inputTokens = [token0.id, token1.id];
    poolAmounts.inputTokenBalances = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    poolAmounts.tokenPrices = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    // Used to track the number of deposits in a liquidity pool
    const poolDeposits = new schema_1._HelperStore(poolAddress);
    poolDeposits.valueInt = constants_1.INT_ZERO;
    protocol.totalPoolCount = protocol.totalPoolCount + constants_1.INT_ONE;
    // Create and track the newly created pool contract based on the template specified in the subgraph.yaml file.
    templates_1.Pool.create(poolAddress);
    protocol.save();
    pool.save();
    poolAmounts.save();
    token0.save();
    token1.save();
    poolDeposits.save();
}
exports.createLiquidityPool = createLiquidityPool;
// create pool fee entities based on the fee structure received from pairCreated event.
function createPoolFees(poolAddress, fee) {
    const tradingFeePercentage = (0, utils_1.convertFeeToPercent)(fee);
    // Trading Fee
    const poolTradingFee = new schema_1.LiquidityPoolFee(graph_ts_1.Bytes.fromHexString("trading-fee-").concat(poolAddress));
    poolTradingFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE;
    poolTradingFee.feePercentage = tradingFeePercentage;
    // LP Fee
    const poolLpFee = new schema_1.LiquidityPoolFee(graph_ts_1.Bytes.fromHexString("xlp-fee-").concat(poolAddress));
    poolLpFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_LP_FEE;
    poolLpFee.feePercentage =
        configure_1.NetworkConfigs.getProtocolFeeOnOff() == constants_1.FeeSwitch.ON
            ? constants_1.BIGDECIMAL_ONE.minus(configure_1.NetworkConfigs.getInitialProtocolFeeProportion(fee)).times(tradingFeePercentage)
            : tradingFeePercentage;
    // Protocol Fee
    const poolProtocolFee = new schema_1.LiquidityPoolFee(graph_ts_1.Bytes.fromHexString("xprotocol-fee-").concat(poolAddress));
    poolProtocolFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE;
    poolProtocolFee.feePercentage =
        configure_1.NetworkConfigs.getProtocolFeeOnOff() == constants_1.FeeSwitch.ON
            ? configure_1.NetworkConfigs.getInitialProtocolFeeProportion(fee).times(tradingFeePercentage)
            : constants_1.BIGDECIMAL_ZERO;
    poolLpFee.save();
    poolProtocolFee.save();
    poolTradingFee.save();
    return [poolLpFee.id, poolProtocolFee.id, poolTradingFee.id];
}
exports.createPoolFees = createPoolFees;
function getLiquidityPool(poolAddress) {
    return schema_1.LiquidityPool.load(poolAddress);
}
exports.getLiquidityPool = getLiquidityPool;
// Updated protocol fees if specified by SetFeeProtocol event
function updateProtocolFees(poolAddress, feeProtocol) {
    const poolTradingFee = getLiquidityPoolFee(graph_ts_1.Bytes.fromHexString("trading-fee-").concat(poolAddress));
    const poolLpFee = getLiquidityPoolFee(graph_ts_1.Bytes.fromHexString("xlp-fee-").concat(poolAddress));
    const poolProtocolFee = getLiquidityPoolFee(graph_ts_1.Bytes.fromHexString("xprotocol-fee-").concat(poolAddress));
    // Value5 is the feeProtocol variabe in the slot0 struct of the pool contract
    const protocolFeeProportion = configure_1.NetworkConfigs.getProtocolFeeProportion(feeProtocol);
    // Update protocol and trading fees for this pool
    poolLpFee.feePercentage = poolTradingFee.feePercentage.times(constants_1.BIGDECIMAL_ONE.minus(protocolFeeProportion));
    poolProtocolFee.feePercentage = poolTradingFee.feePercentage.times(protocolFeeProportion);
    poolLpFee.save();
    poolProtocolFee.save();
}
exports.updateProtocolFees = updateProtocolFees;
function getLiquidityPoolAmounts(poolAddress) {
    return schema_1._LiquidityPoolAmount.load(poolAddress);
}
exports.getLiquidityPoolAmounts = getLiquidityPoolAmounts;
function getLiquidityPoolFee(id) {
    return schema_1.LiquidityPoolFee.load(id);
}
exports.getLiquidityPoolFee = getLiquidityPoolFee;
function getTradingFee(poolAddress) {
    const feeId = graph_ts_1.Bytes.fromHexString("trading-fee-").concat(poolAddress);
    const fee = schema_1.LiquidityPoolFee.load(feeId);
    if (fee === null) {
        graph_ts_1.log.warning("LiquidityPoolFee not found for pool: " + poolAddress.toHexString(), []);
        return constants_1.BIGDECIMAL_ZERO;
    }
    return fee.feePercentage;
}
exports.getTradingFee = getTradingFee;
// Get amounts in USD given a list of amounts and a pool
function getAmountUSD(event, pool, amounts) {
    const amountsUSD = [];
    for (let i = 0; i < amounts.length; i++) {
        const token = (0, token_1.getOrCreateToken)(event, pool.inputTokens[i]);
        amountsUSD.push((0, utils_1.convertTokenToDecimal)(amounts[i], token.decimals).times(token.lastPriceUSD));
    }
    return amountsUSD;
}
exports.getAmountUSD = getAmountUSD;
