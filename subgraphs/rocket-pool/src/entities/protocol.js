"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateProtocol = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
function getOrCreateProtocol() {
    let protocol = schema_1.Protocol.load(constants_1.RETH_ADDRESS);
    if (!protocol) {
        protocol = new schema_1.Protocol(constants_1.RETH_ADDRESS);
        // Metadata
        protocol.id = constants_1.RETH_ADDRESS;
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = constants_1.Network.MAINNET;
        protocol.type = constants_1.ProtocolType.GENERIC;
        // Quantitative Data
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.protocolControlledValueUSD = null;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = 0;
        protocol.totalPoolCount = 0;
    }
    protocol.schemaVersion = constants_1.PROTOCOL_SCHEMA_VERSION;
    protocol.subgraphVersion = constants_1.PROTOCOL_SUBGRAPH_VERSION;
    protocol.methodologyVersion = constants_1.PROTOCOL_METHODOLOGY_VERSION;
    protocol.save();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
