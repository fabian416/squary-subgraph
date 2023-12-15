"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkNodeBalanceMinipoolMetadata = void 0;
const constants_1 = require("../utils/constants");
/**
 * Everything that is needed to calculate the network summaries (e.g. average) for a network node balance checkpoint.
 */
class NetworkNodeBalanceMinipoolMetadata {
    constructor() {
        this.totalNodesWithActiveMinipools = constants_1.BIGINT_ZERO;
        this.totalAverageFeeForAllActiveMinipools = constants_1.BIGDECIMAL_ZERO;
        this.totalMinimumEffectiveRPL = constants_1.BIGINT_ZERO;
        this.totalMaximumEffectiveRPL = constants_1.BIGINT_ZERO;
    }
}
exports.NetworkNodeBalanceMinipoolMetadata = NetworkNodeBalanceMinipoolMetadata;
