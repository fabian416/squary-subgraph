"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePostTotalShares = void 0;
const financialMetrics_1 = require("../entityUpdates/financialMetrics");
const constants_1 = require("../utils/constants");
const Lido_1 = require("../../generated/Lido/Lido");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function handlePostTotalShares(event) {
    // In Lido v2, PostTotalShares has been deprecated.
    // The new ETHDistributed event emitted from the main Lido contract is used instead for calculating revenue.
    // Ref: https://docs.lido.fi/integrations/api/#last-lido-apr-for-steth
    if (event.block.number >= constants_1.LIDO_V2_UPGRADE_BLOCK) {
        return;
    }
    // PostTotalShares is emitted by the oracle once a day when
    // eth rewards are updated and minted as shares on the Lido contract.
    // We use this event to calculate total & supply side revenue.
    // Protocol revenue is calulated in the Lido mapping, by listening to
    // mint events to treasury and node operators.
    const totalRevenue = event.params.postTotalPooledEther.minus(event.params.preTotalPooledEther);
    const lido = Lido_1.Lido.bind(graph_ts_1.Address.fromString(constants_1.PROTOCOL_ID));
    const supply = lido.totalSupply();
    (0, financialMetrics_1.updateTotalRevenueMetrics)(event.block, totalRevenue, supply);
    (0, financialMetrics_1.updateSupplySideRevenueMetrics)(event.block);
    (0, financialMetrics_1.updateProtocolAndPoolTvl)(event.block, constants_1.BIGINT_ZERO);
}
exports.handlePostTotalShares = handlePostTotalShares;
