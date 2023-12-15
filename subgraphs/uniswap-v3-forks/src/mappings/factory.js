"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePoolCreated = void 0;
const configure_1 = require("../../configurations/configure");
const pool_1 = require("../common/entities/pool");
const protocol_1 = require("../common/entities/protocol");
const constants_1 = require("../common/constants");
const backfill_1 = require("../common/utils/backfill");
// Liquidity pool is created from the Factory contract.
// Create a pool entity and start monitoring events from the newly deployed pool contract specified in the subgraph.yaml.
function handlePoolCreated(event) {
    if (configure_1.NetworkConfigs.getUntrackedPairs().includes(event.params.pool)) {
        return;
    }
    (0, pool_1.createLiquidityPool)(event, event.params.pool, event.params.token0, event.params.token1, event.params.fee);
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    // populate pre-regenesis pools if needed
    if (configure_1.NetworkConfigs.getNetwork() == constants_1.Network.OPTIMISM &&
        protocol._regenesis == false) {
        (0, backfill_1.populateEmptyPools)(event);
    }
}
exports.handlePoolCreated = handlePoolCreated;
