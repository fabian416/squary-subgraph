"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalAvalancheConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class PortalAvalancheConfigurations {
    getNetwork() {
        return constants_2.Network.AVALANCHE;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getNetworkID() {
        return graph_ts_1.BigInt.fromI32(6);
    }
    getFactoryAddress() {
        return graph_ts_1.Address.fromString("0x54a8e5f9c4cba08f9943965859f6c34eaf03e26c");
    }
    getBridgeAddress() {
        return graph_ts_1.Address.fromString("0x0e082f06ff657d94310cb8ce8b0d9a04541d8052");
    }
}
exports.PortalAvalancheConfigurations = PortalAvalancheConfigurations;
