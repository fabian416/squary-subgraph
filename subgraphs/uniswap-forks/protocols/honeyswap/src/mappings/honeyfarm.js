"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = exports.handlePoolRemoved = exports.handlePoolAdded = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const creators_1 = require("../common/creators");
const constants_1 = require("../../../../src/common/constants");
const handlers_1 = require("../common/handlers");
// WIP: HoneyFarm subgraph handlers currently not used in Honeyswap subgraph deployment
function handlePoolAdded(event) {
    graph_ts_1.log.debug("poolToken added: {}", [event.params.poolToken.toHexString()]);
    (0, creators_1.createPoolRewardToken)(event, event.params.poolToken.toHexString());
}
exports.handlePoolAdded = handlePoolAdded;
// WIP: HoneyFarm subgraph handlers currently not used in Honeyswap subgraph deployment
function handlePoolRemoved(event) {
    graph_ts_1.log.debug("poolToken removed: {}", [event.params.poolToken.toHexString()]);
    (0, creators_1.removePoolRewardToken)(event.params.poolToken.toHexString());
}
exports.handlePoolRemoved = handlePoolRemoved;
// WIP: HoneyFarm subgraph handlers currently not used in Honeyswap subgraph deployment
function handleTransfer(event) {
    // mint event representing creating a deposit (deposit event)
    if (event.params.from.toHexString() == constants_1.ZERO_ADDRESS) {
        (0, handlers_1.handleReward)(event, event.params.tokenId, constants_1.UsageType.DEPOSIT);
    }
    // burn event representing closing a deposit (withdraw event)
    if (event.params.to.toHexString() == constants_1.ZERO_ADDRESS &&
        event.params.from == event.address) {
        (0, handlers_1.handleReward)(event, event.params.tokenId, constants_1.UsageType.WITHDRAW);
    }
}
exports.handleTransfer = handleTransfer;
