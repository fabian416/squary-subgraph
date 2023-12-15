"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._CreateStabilityPool = exports.handleOracleAdded = exports.handleRegisteredNewOracle = exports.handleTokenPriceUpdated = exports.handleLastGoodPriceUpdated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const StabilityPoolManager_1 = require("../../generated/PriceFeedV2/StabilityPoolManager");
const templates_1 = require("../../generated/templates");
const market_1 = require("../entities/market");
const token_1 = require("../entities/token");
const constants_1 = require("../utils/constants");
/**
 * Emitted whenever latest Asset price is fetched from oracle v1
 *
 * @param event LastGoodPriceUpdated event
 */
function handleLastGoodPriceUpdated(event) {
    (0, token_1.setCurrentAssetPrice)(event.block.number, event.params.token, event.params._lastGoodPrice);
}
exports.handleLastGoodPriceUpdated = handleLastGoodPriceUpdated;
/**
 * Emitted whenever latest Asset price is fetched from oracle v2
 *
 * @param event TokenPriceUpdated event
 */
function handleTokenPriceUpdated(event) {
    (0, token_1.setCurrentAssetPrice)(event.block.number, event.params._token, event.params._price);
}
exports.handleTokenPriceUpdated = handleTokenPriceUpdated;
function handleRegisteredNewOracle(event) {
    _CreateStabilityPool(event.params.token, event);
}
exports.handleRegisteredNewOracle = handleRegisteredNewOracle;
function handleOracleAdded(event) {
    _CreateStabilityPool(event.params._token, event);
}
exports.handleOracleAdded = handleOracleAdded;
/*
// ideally, StabilityPool should be created as data source by StabilityPoolManager,
// But StabilityPoolManager emits no events
// and hosted service does not support callhander for arbitrum-one
// Here we utilize the fact that AdminContract calls both vestaParameters.priceFeed().addOracle
// and stabilityPoolManager.addStabilityPool(_asset, proxyAddress);
// inside [addNewCollateral()](https://github.com/vesta-finance/vesta-protocol-v1/blob/0e89ca77659d14e53f052d5b83d4a7d3aac9ba25/contracts/AdminContract.sol#L78-L99)
*/
function _CreateStabilityPool(asset, event) {
    const stabilityPoolMgrContract = StabilityPoolManager_1.StabilityPoolManager.bind(graph_ts_1.Address.fromString(constants_1.STABILITY_POOL_MANAGER));
    const tryGetAssetStabilityPool = stabilityPoolMgrContract.try_getAssetStabilityPool(asset);
    if (tryGetAssetStabilityPool.reverted) {
        graph_ts_1.log.error("[_CreateStabilityPool]StabilityPoolManagerContract.try_getAssetStabilityPool reverted at tx {}", [event.transaction.hash.toHexString()]);
        return;
    }
    const poolAddress = tryGetAssetStabilityPool.value;
    (0, token_1.getOrCreateAssetToken)(asset);
    (0, market_1.getOrCreateStabilityPool)(poolAddress, asset, event);
    const context = graph_ts_1.dataSource.context();
    context.setString(constants_1.STABILITYPOOL_ASSET, asset.toHexString());
    templates_1.StabilityPool.createWithContext(poolAddress, context);
}
exports._CreateStabilityPool = _CreateStabilityPool;
