"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalMainnetConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class PortalMainnetConfigurations {
    getNetwork() {
        return constants_2.Network.MAINNET;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getNetworkID() {
        return graph_ts_1.BigInt.fromI32(2);
    }
    getFactoryAddress() {
        return graph_ts_1.Address.fromString("0x98f3c9e6e3face36baad05fe09d375ef1464288b");
    }
    getBridgeAddress() {
        return graph_ts_1.Address.fromString("0x3ee18b2214aff97000d974cf647e7c347e8fa585");
    }
}
exports.PortalMainnetConfigurations = PortalMainnetConfigurations;
