"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalBscConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class PortalBscConfigurations {
    getNetwork() {
        return constants_2.Network.BSC;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getNetworkID() {
        return graph_ts_1.BigInt.fromI32(4);
    }
    getFactoryAddress() {
        return graph_ts_1.Address.fromString("0x98f3c9e6e3face36baad05fe09d375ef1464288b");
    }
    getBridgeAddress() {
        return graph_ts_1.Address.fromString("0xb6f6d86a8f9879a9c87f643768d9efc38c1da6e7");
    }
}
exports.PortalBscConfigurations = PortalBscConfigurations;
