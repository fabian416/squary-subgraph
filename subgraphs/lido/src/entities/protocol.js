"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateProtocol = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const versions_1 = require("../versions");
function getOrCreateProtocol() {
    let protocol = schema_1.Protocol.load(constants_1.PROTOCOL_ID);
    if (!protocol) {
        protocol = new schema_1.Protocol(constants_1.PROTOCOL_ID);
        // Metadata
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
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
