"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = exports.handleDecreaseLiquidity = exports.handleIncreaseLiquidity = exports.getUSDValueFromNativeTokens = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../common/constants");
const pool_1 = require("../common/entities/pool");
const position_1 = require("../common/entities/position");
const token_1 = require("../common/entities/token");
const utils_1 = require("../common/utils/utils");
const protocol_1 = require("../common/entities/protocol");
const account_1 = require("../common/entities/account");
function getUSDValueFromNativeTokens(tokens, amounts) {
    let usdValue = constants_1.BIGDECIMAL_ZERO;
    for (let i = constants_1.INT_ZERO; i < tokens.length; i++) {
        const amountConverted = (0, utils_1.convertTokenToDecimal)(amounts[i], tokens[i].decimals);
        usdValue = usdValue.plus(amountConverted.times(tokens[i].lastPriceUSD));
    }
    return usdValue;
}
exports.getUSDValueFromNativeTokens = getUSDValueFromNativeTokens;
function handleIncreaseLiquidity(event) {
    const account = (0, account_1.getOrCreateAccount)(event.transaction.from);
    const position = (0, position_1.getOrCreatePosition)(event, event.params.tokenId);
    // position was not able to be fetched
    if (position == null) {
        graph_ts_1.log.error("Position not found for transfer tx: {}, position: {}", [
            event.transaction.hash.toHexString(),
            event.params.tokenId.toString(),
        ]);
        return;
    }
    const pool = (0, pool_1.getLiquidityPool)(graph_ts_1.Address.fromBytes(position.pool));
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    if (!pool) {
        graph_ts_1.log.warning("Pool not found for position: {}", [position.id.toHexString()]);
        return;
    }
    if (position.liquidity == constants_1.BIGINT_ZERO) {
        if (isReOpened(position)) {
            pool.openPositionCount += constants_1.INT_ONE;
            pool.closedPositionCount -= constants_1.INT_ONE;
            account.openPositionCount += constants_1.INT_ONE;
            account.closedPositionCount -= constants_1.INT_ONE;
            protocol.openPositionCount += constants_1.INT_ONE;
            position.hashClosed = null;
            position.blockNumberClosed = null;
            position.timestampClosed = null;
        }
        else {
            pool.openPositionCount += constants_1.INT_ONE;
            pool.positionCount += constants_1.INT_ONE;
            account.openPositionCount += constants_1.INT_ONE;
            account.positionCount += constants_1.INT_ONE;
            protocol.openPositionCount += constants_1.INT_ONE;
            protocol.cumulativePositionCount += constants_1.INT_ONE;
        }
    }
    const token0 = (0, token_1.getOrCreateToken)(event, pool.inputTokens[constants_1.INT_ZERO]);
    const token1 = (0, token_1.getOrCreateToken)(event, pool.inputTokens[constants_1.INT_ONE]);
    position.liquidity = position.liquidity.plus(event.params.liquidity);
    position.liquidityUSD = (0, utils_1.safeDivBigDecimal)(position.liquidity.toBigDecimal(), pool.totalLiquidity.toBigDecimal()).times(pool.totalLiquidityUSD);
    position.cumulativeDepositTokenAmounts = (0, utils_1.sumBigIntListByIndex)([
        position.cumulativeDepositTokenAmounts,
        [event.params.amount0, event.params.amount1],
    ]);
    position.cumulativeDepositUSD = getUSDValueFromNativeTokens([token0, token1], position.cumulativeDepositTokenAmounts);
    position.depositCount += constants_1.INT_ONE;
    pool.save();
    account.save();
    position.save();
    protocol.save();
    (0, position_1.savePositionSnapshot)(position, event);
}
exports.handleIncreaseLiquidity = handleIncreaseLiquidity;
function handleDecreaseLiquidity(event) {
    const account = (0, account_1.getOrCreateAccount)(event.transaction.from);
    const position = (0, position_1.getOrCreatePosition)(event, event.params.tokenId);
    // position was not able to be fetched
    if (position == null) {
        graph_ts_1.log.error("Position not found for transfer tx: {}, position: {}", [
            event.transaction.hash.toHexString(),
            event.params.tokenId.toString(),
        ]);
        return;
    }
    const pool = (0, pool_1.getLiquidityPool)(graph_ts_1.Address.fromBytes(position.pool));
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    if (!pool) {
        graph_ts_1.log.warning("Pool not found for position: {}", [position.id.toHexString()]);
        return;
    }
    const token0 = (0, token_1.getOrCreateToken)(event, pool.inputTokens[constants_1.INT_ZERO]);
    const token1 = (0, token_1.getOrCreateToken)(event, pool.inputTokens[constants_1.INT_ONE]);
    position.liquidity = position.liquidity.minus(event.params.liquidity);
    position.liquidityUSD = (0, utils_1.safeDivBigDecimal)(position.liquidity.toBigDecimal(), pool.totalLiquidity.toBigDecimal()).times(pool.totalLiquidityUSD);
    position.cumulativeWithdrawTokenAmounts = (0, utils_1.sumBigIntListByIndex)([
        position.cumulativeWithdrawTokenAmounts,
        [event.params.amount0, event.params.amount1],
    ]);
    position.cumulativeWithdrawUSD = getUSDValueFromNativeTokens([token0, token1], position.cumulativeWithdrawTokenAmounts);
    position.withdrawCount += constants_1.INT_ONE;
    if (isClosed(position)) {
        pool.openPositionCount -= constants_1.INT_ONE;
        pool.closedPositionCount += constants_1.INT_ONE;
        account.openPositionCount -= constants_1.INT_ONE;
        account.closedPositionCount += constants_1.INT_ONE;
        protocol.openPositionCount -= constants_1.INT_ONE;
        position.hashClosed = event.transaction.hash;
        position.blockNumberClosed = event.block.number;
        position.timestampClosed = event.block.timestamp;
    }
    pool.save();
    account.save();
    position.save();
    protocol.save();
    (0, position_1.savePositionSnapshot)(position, event);
}
exports.handleDecreaseLiquidity = handleDecreaseLiquidity;
function handleTransfer(event) {
    if (event.params.from == constants_1.ZERO_ADDRESS) {
        return;
    }
    const position = (0, position_1.getOrCreatePosition)(event, event.params.tokenId);
    const account = (0, account_1.getOrCreateAccount)(event.params.to);
    // position was not able to be fetched
    if (position == null) {
        graph_ts_1.log.error("Position not found for transfer tx: {}, position: {}", [
            event.transaction.hash.toHexString(),
            event.params.tokenId.toString(),
        ]);
        return;
    }
    const oldAccount = (0, account_1.getOrCreateAccount)(event.params.from);
    account.positionCount += constants_1.INT_ONE;
    oldAccount.positionCount -= constants_1.INT_ONE;
    if (isClosed(position)) {
        account.closedPositionCount += constants_1.INT_ONE;
        oldAccount.closedPositionCount -= constants_1.INT_ONE;
    }
    else {
        account.openPositionCount += constants_1.INT_ONE;
        oldAccount.openPositionCount -= constants_1.INT_ONE;
    }
    position.account = event.params.to;
    account.save();
    oldAccount.save();
    position.save();
}
exports.handleTransfer = handleTransfer;
function isClosed(position) {
    return position.liquidity == constants_1.BIGINT_ZERO;
}
function isReOpened(position) {
    if (position.hashClosed) {
        return true;
    }
    return false;
}
