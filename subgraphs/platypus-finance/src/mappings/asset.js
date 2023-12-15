"use strict";
// Asset is the LP token for each Token that is added to a pool
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePoolUpdated = exports.handleCashRemoved = exports.handleCashAdded = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const metrics_1 = require("../common/metrics");
const getters_1 = require("../common/getters");
const constants_1 = require("../common/constants");
function handleCashAdded(event) {
    const _asset = schema_1._Asset.load(event.address.toHexString());
    _asset.cash = _asset.cash.plus(event.params.cashBeingAdded);
    _asset.save();
    (0, metrics_1.updateProtocolTVL)(event, event.address);
}
exports.handleCashAdded = handleCashAdded;
function handleCashRemoved(event) {
    const _asset = schema_1._Asset.load(event.address.toHexString());
    _asset.cash = _asset.cash.minus(event.params.cashBeingRemoved);
    _asset.save();
    (0, metrics_1.updateProtocolTVL)(event, event.address);
}
exports.handleCashRemoved = handleCashRemoved;
function handlePoolUpdated(event) {
    graph_ts_1.log.debug("[{}][ChangePool] for asset {} from {} to {}", [
        event.transaction.hash.toHexString(),
        event.address.toHexString(),
        event.params.previousPool.toHexString(),
        event.params.newPool.toHexString(),
    ]);
    const _asset = schema_1._Asset.load(event.address.toHexString());
    const detail = constants_1.poolDetail.fromAddress(event.params.newPool.toHexString());
    const assetPool = schema_1.LiquidityPool.load(event.address.toHexString());
    const token = (0, getters_1.getOrCreateToken)(event, graph_ts_1.Address.fromString(_asset.token));
    if (assetPool._ignore && !detail.ignore) {
        const protocol = (0, getters_1.getOrCreateDexAmm)();
        protocol.totalPoolCount = protocol.totalPoolCount - 1;
        protocol.save();
    }
    else if (!assetPool._ignore && detail.ignore) {
        const protocol = (0, getters_1.getOrCreateDexAmm)();
        protocol.totalPoolCount = protocol.totalPoolCount + 1;
        protocol.save();
    }
    assetPool.poolAddress = event.params.newPool.toHexString();
    assetPool._ignore = detail.ignore;
    assetPool.name = token.symbol.concat(" on ").concat(detail.name);
    assetPool.symbol = token.symbol.concat("-").concat(detail.symbol);
    assetPool.save();
    if (!event.params.previousPool.equals(constants_1.ZERO_ADDRESS)) {
        const helper = schema_1._LiquidityPoolAssetTokenHelper.load((0, getters_1.getTokenHelperId)(event.params.previousPool, graph_ts_1.Address.fromString(_asset.token)));
        graph_ts_1.log.debug("[{}][ChangePool] from helper id {}", [event.transaction.hash.toHexString(), helper.id]);
        helper.id = (0, getters_1.getTokenHelperId)(event.params.newPool, graph_ts_1.Address.fromString(_asset.token));
        helper.save();
        graph_ts_1.log.debug("[{}][ChangePool] to helper id {}", [event.transaction.hash.toHexString(), helper.id]);
    }
    (0, metrics_1.updateProtocolTVL)(event, constants_1.ZERO_ADDRESS);
}
exports.handlePoolUpdated = handlePoolUpdated;
