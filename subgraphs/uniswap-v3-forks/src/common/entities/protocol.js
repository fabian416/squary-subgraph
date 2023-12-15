"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateProtocol = void 0;
const configure_1 = require("../../../configurations/configure");
const schema_1 = require("../../../generated/schema");
const versions_1 = require("../../versions");
const constants_1 = require("../constants");
function getOrCreateProtocol() {
    let protocol = schema_1.DexAmmProtocol.load(configure_1.NetworkConfigs.getFactoryAddress());
    if (!protocol) {
        protocol = new schema_1.DexAmmProtocol(configure_1.NetworkConfigs.getFactoryAddress());
        protocol.name = configure_1.NetworkConfigs.getProtocolName();
        protocol.slug = configure_1.NetworkConfigs.getProtocolSlug();
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.activeLiquidityUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalLiquidityUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.uncollectedProtocolSideValueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.uncollectedSupplySideValueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.cumulativeUniqueTraders = constants_1.INT_ZERO;
        protocol.cumulativeUniqueLPs = constants_1.INT_ZERO;
        protocol.openPositionCount = constants_1.INT_ZERO;
        protocol.cumulativePositionCount = constants_1.INT_ZERO;
        protocol.network = configure_1.NetworkConfigs.getNetwork();
        protocol.type = constants_1.ProtocolType.EXCHANGE;
        protocol.totalPoolCount = constants_1.INT_ZERO;
        protocol._regenesis = false;
        protocol.lastSnapshotDayID = constants_1.INT_ZERO;
        protocol.lastUpdateBlockNumber = constants_1.BIGINT_ZERO;
        protocol.lastUpdateTimestamp = constants_1.BIGINT_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
