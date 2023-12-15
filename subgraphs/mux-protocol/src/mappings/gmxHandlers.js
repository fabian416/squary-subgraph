"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleClosePosition = exports.handleGmxUpdatePositionEvent = exports.handleLiquidatePosition = exports.handleDecreasePosition = exports.handleIncreasePosition = exports.handleCreateProxyForGmx = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const Vault_1 = require("../../generated/Vault/Vault");
const event_1 = require("../entities/event");
const token_1 = require("../entities/token");
const account_1 = require("../entities/account");
const position_1 = require("../entities/position");
const protocol_1 = require("../entities/protocol");
const pool_1 = require("../entities/pool");
const snapshots_1 = require("../entities/snapshots");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const handlers_1 = require("./handlers");
function handleCreateProxyForGmx(event) {
    const proxyMap = new schema_1._ProxyMap(event.params.proxy);
    proxyMap.positionId = event.params.owner;
    proxyMap.save();
}
exports.handleCreateProxyForGmx = handleCreateProxyForGmx;
function handleIncreasePosition(event) {
    handleGmxUpdatePositionEvent(event, event.params.key, event.params.account, event.params.collateralToken, event.params.collateralDelta, event.params.indexToken, event.params.sizeDelta, event.params.price, event.params.isLong, event_1.EventType.CollateralIn, constants_1.BIGINT_ZERO);
}
exports.handleIncreasePosition = handleIncreasePosition;
function handleDecreasePosition(event) {
    handleGmxUpdatePositionEvent(event, event.params.key, event.params.account, event.params.collateralToken, event.params.collateralDelta, event.params.indexToken, event.params.sizeDelta, event.params.price, event.params.isLong, event_1.EventType.CollateralOut, constants_1.BIGINT_ZERO);
}
exports.handleDecreasePosition = handleDecreasePosition;
function handleLiquidatePosition(event) {
    handleGmxUpdatePositionEvent(event, event.params.key, event.params.account, event.params.collateralToken, event.params.collateral, event.params.indexToken, event.params.size, event.params.markPrice, event.params.isLong, event_1.EventType.Liquidated, event.params.realisedPnl);
}
exports.handleLiquidatePosition = handleLiquidatePosition;
function handleGmxUpdatePositionEvent(event, positionKey, accountAddress, collateralTokenAddress, collateralDelta, indexTokenAddress, sizeDelta, indexTokenPrice, isLong, eventType, liqudateProfit) {
    // For every trading being routed to GMX, MUX protocol creates a proxy address for the trader.
    // If the trader address from GMX contract does not exist in proxy address list in MUX protocol, the trading does not come from MUX protocol.
    const proxyMap = schema_1._ProxyMap.load(accountAddress);
    if (!proxyMap) {
        return;
    }
    const pool = (0, pool_1.getOrCreateLiquidityPool)(event, event.address, constants_1.GMX_POOL_NAME, constants_1.GMX_POOL_SYMBOL);
    (0, snapshots_1.takeSnapshots)(event, pool);
    const account = (0, account_1.getOrCreateAccount)(event, pool, accountAddress);
    (0, account_1.incrementAccountEventCount)(event, pool, account, eventType, sizeDelta);
    (0, protocol_1.incrementProtocolEventCount)(event, eventType, sizeDelta);
    const indexToken = (0, token_1.getOrCreateToken)(event, indexTokenAddress);
    (0, token_1.updateTokenPrice)(event, indexToken, (0, numbers_1.convertToDecimal)(indexTokenPrice, constants_1.GMX_PRICE_DECIMALS));
    const sizeUSDDelta = (0, numbers_1.convertToDecimal)(sizeDelta, constants_1.GMX_PRICE_DECIMALS);
    const collateralToken = (0, token_1.getOrCreateToken)(event, collateralTokenAddress);
    const collateralUSDDelta = (0, numbers_1.convertToDecimal)(collateralDelta, constants_1.GMX_PRICE_DECIMALS);
    let collateralAmountDelta = constants_1.BIGINT_ZERO;
    if (collateralToken.lastPriceUSD &&
        collateralToken.lastPriceUSD > constants_1.BIGDECIMAL_ZERO) {
        collateralAmountDelta = (0, numbers_1.bigDecimalToBigInt)(collateralUSDDelta
            .times((0, numbers_1.exponentToBigDecimal)(collateralToken.decimals))
            .div(collateralToken.lastPriceUSD));
    }
    let positionSide = constants_1.PositionSide.SHORT;
    if (isLong) {
        positionSide = constants_1.PositionSide.LONG;
    }
    if (eventType == event_1.EventType.CollateralIn) {
        const existingPosition = (0, position_1.getUserPosition)(account, pool, collateralTokenAddress, indexTokenAddress, positionSide);
        if (!existingPosition) {
            (0, position_1.createPositionMap)(positionKey, account, pool, collateralTokenAddress, indexTokenAddress, positionSide);
        }
    }
    let positionBalance = constants_1.BIGINT_ZERO;
    let positionBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    let positionCollateralBalance = constants_1.BIGINT_ZERO;
    let positionCollateralBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    const vaultContract = Vault_1.Vault.bind(event.address);
    const tryGetPosition = vaultContract.try_getPosition(graph_ts_1.Address.fromBytes(account.id), collateralTokenAddress, indexTokenAddress, isLong);
    if (!tryGetPosition.reverted) {
        positionBalanceUSD = (0, numbers_1.convertToDecimal)(tryGetPosition.value.getValue0(), constants_1.GMX_PRICE_DECIMALS);
        positionCollateralBalanceUSD = (0, numbers_1.convertToDecimal)(tryGetPosition.value.getValue1(), constants_1.GMX_PRICE_DECIMALS);
        const indexToken = (0, token_1.getOrCreateToken)(event, indexTokenAddress);
        if (indexToken.lastPriceUSD && indexToken.lastPriceUSD > constants_1.BIGDECIMAL_ZERO) {
            positionBalance = (0, numbers_1.bigDecimalToBigInt)(positionBalanceUSD
                .times((0, numbers_1.exponentToBigDecimal)(indexToken.decimals))
                .div(indexToken.lastPriceUSD));
        }
        const collateralToken = (0, token_1.getOrCreateToken)(event, collateralTokenAddress);
        if (collateralToken.lastPriceUSD &&
            collateralToken.lastPriceUSD > constants_1.BIGDECIMAL_ZERO) {
            positionCollateralBalance = (0, numbers_1.bigDecimalToBigInt)(positionCollateralBalanceUSD
                .times((0, numbers_1.exponentToBigDecimal)(collateralToken.decimals))
                .div(collateralToken.lastPriceUSD));
        }
    }
    (0, handlers_1.handleUpdatePositionEvent)(event, pool, account, collateralToken, collateralAmountDelta, collateralUSDDelta, positionCollateralBalance, positionCollateralBalanceUSD, indexToken, sizeUSDDelta, positionBalance, positionBalanceUSD, null, isLong, eventType, (0, numbers_1.convertToDecimal)(liqudateProfit, constants_1.GMX_PRICE_DECIMALS));
}
exports.handleGmxUpdatePositionEvent = handleGmxUpdatePositionEvent;
function handleClosePosition(event) {
    const pool = (0, pool_1.getOrCreateLiquidityPool)(event, event.address, constants_1.GMX_POOL_NAME, constants_1.GMX_POOL_SYMBOL);
    (0, snapshots_1.takeSnapshots)(event, pool);
    const realisedPnlUSD = (0, numbers_1.convertToDecimal)(event.params.realisedPnl, constants_1.GMX_PRICE_DECIMALS);
    (0, position_1.updatePositionRealisedPnlUSD)(event.params.key, realisedPnlUSD);
    // For GMX, every closePosition action will emit both ClosePosition() and DecreasePosition() event.
    // Most of pool volume computation has already been covered in DecreasePosition() event handler.
    // As there is not pnl in DecreasePosition() event parameters, here in ClosePosition() event handler
    // we just needs to cover the extra volumes when a users has a loss and has to use some of collateral to cover the loss.
    if (event.params.realisedPnl < constants_1.BIGINT_ZERO) {
        (0, pool_1.increasePoolVolume)(event, pool, constants_1.BIGDECIMAL_ZERO, null, constants_1.BIGINT_ZERO, constants_1.BIGINT_NEGONE.toBigDecimal().times(realisedPnlUSD), event_1.EventType.ClosePosition);
    }
}
exports.handleClosePosition = handleClosePosition;
