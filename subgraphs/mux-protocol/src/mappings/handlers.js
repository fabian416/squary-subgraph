"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdatePositionEvent = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const event_1 = require("../entities/event");
const account_1 = require("../entities/account");
const position_1 = require("../entities/position");
const pool_1 = require("../entities/pool");
const snapshots_1 = require("../entities/snapshots");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
function handleUpdatePositionEvent(event, pool, account, collateralToken, collateralAmountDelta, collateralUSDDelta, positionCollateralBalance, positionCollateralBalanceUSD, indexToken, sizeUSDDelta, positionBalance, positionBalanceUSD, positionPnlUSD, isLong, eventType, liqudateProfitUSD) {
    const indexTokenAddress = graph_ts_1.Address.fromBytes(indexToken.id);
    const collateralTokenAddress = graph_ts_1.Address.fromBytes(collateralToken.id);
    const accountAddress = graph_ts_1.Address.fromBytes(account.id);
    (0, pool_1.increasePoolVolume)(event, pool, sizeUSDDelta, collateralTokenAddress, collateralAmountDelta, collateralUSDDelta, eventType);
    let positionSide = constants_1.PositionSide.SHORT;
    if (isLong) {
        positionSide = constants_1.PositionSide.LONG;
    }
    let openPositionCount = constants_1.INT_ZERO;
    if (eventType == event_1.EventType.CollateralIn) {
        const existingPosition = (0, position_1.getUserPosition)(account, pool, collateralTokenAddress, indexTokenAddress, positionSide);
        if (!existingPosition) {
            openPositionCount = constants_1.INT_ONE;
        }
    }
    const position = (0, position_1.updateUserPosition)(event, account, pool, collateralTokenAddress, positionCollateralBalance, positionCollateralBalanceUSD, indexTokenAddress, positionBalance, positionBalanceUSD, positionPnlUSD, positionSide, eventType);
    if (!position.timestampClosed) {
        openPositionCount = constants_1.INT_NEGATIVE_ONE;
    }
    switch (eventType) {
        case event_1.EventType.CollateralIn:
            (0, pool_1.updatePoolOpenInterestUSD)(event, pool, sizeUSDDelta, isLong);
            (0, event_1.createCollateralIn)(event, pool, accountAddress, collateralTokenAddress, collateralAmountDelta, collateralUSDDelta, constants_1.BIGINT_ZERO, position);
            if (sizeUSDDelta > constants_1.BIGDECIMAL_ZERO) {
                let indexTokenAmountDelta = constants_1.BIGINT_ZERO;
                if (indexToken.lastPriceUSD &&
                    indexToken.lastPriceUSD > constants_1.BIGDECIMAL_ZERO) {
                    indexTokenAmountDelta = (0, numbers_1.bigDecimalToBigInt)(sizeUSDDelta
                        .times((0, numbers_1.exponentToBigDecimal)(indexToken.decimals))
                        .div(indexToken.lastPriceUSD));
                }
                (0, event_1.createBorrow)(event, pool, accountAddress, indexTokenAddress, indexTokenAmountDelta, sizeUSDDelta, position);
            }
            (0, snapshots_1.updateTempUsageMetrics)(event, accountAddress, eventType, openPositionCount, positionSide);
            break;
        case event_1.EventType.CollateralOut:
            (0, pool_1.updatePoolOpenInterestUSD)(event, pool, sizeUSDDelta.times(constants_1.BIGDECIMAL_NEGONE), isLong);
            (0, event_1.createCollateralOut)(event, pool, accountAddress, collateralTokenAddress, collateralAmountDelta, collateralUSDDelta, constants_1.BIGINT_ZERO, position);
            (0, snapshots_1.updateTempUsageMetrics)(event, accountAddress, eventType, openPositionCount, positionSide);
            break;
        case event_1.EventType.Liquidated:
            (0, pool_1.updatePoolOpenInterestUSD)(event, pool, sizeUSDDelta.times(constants_1.BIGDECIMAL_NEGONE), isLong);
            (0, event_1.createLiquidate)(event, pool, indexTokenAddress, collateralAmountDelta, collateralUSDDelta, liqudateProfitUSD, event.transaction.from, accountAddress, position);
            const liquidatorAccount = (0, account_1.getOrCreateAccount)(event, pool, event.transaction.from);
            (0, account_1.incrementAccountEventCount)(event, pool, liquidatorAccount, event_1.EventType.Liquidate, constants_1.BIGINT_ZERO);
            (0, snapshots_1.updateTempUsageMetrics)(event, event.transaction.from, event_1.EventType.Liquidate, constants_1.INT_ZERO, positionSide);
            (0, snapshots_1.updateTempUsageMetrics)(event, accountAddress, event_1.EventType.Liquidated, constants_1.INT_NEGATIVE_ONE, positionSide);
            break;
        default:
            break;
    }
}
exports.handleUpdatePositionEvent = handleUpdatePositionEvent;
