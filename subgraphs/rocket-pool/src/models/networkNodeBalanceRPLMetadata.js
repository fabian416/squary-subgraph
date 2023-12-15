"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkNodeBalanceRPLMetadata = void 0;
const constants_1 = require("../utils/constants");
/**
 * Everything that is needed to calculate the network summaries (e.g. average) regarding RPL for a network node balance checkpoint.
 */
class NetworkNodeBalanceRPLMetadata {
    constructor() {
        this.totalNodesWithRewardClaim = constants_1.BIGINT_ZERO;
        this.totalNodeRewardClaimCount = constants_1.BIGINT_ZERO;
        this.totalNodesWithAnODAORewardClaim = constants_1.BIGINT_ZERO;
        this.totalODAORewardClaimCount = constants_1.BIGINT_ZERO;
    }
}
exports.NetworkNodeBalanceRPLMetadata = NetworkNodeBalanceRPLMetadata;
