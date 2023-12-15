"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalPolygonConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class PortalPolygonConfigurations {
    getNetwork() {
        return constants_2.Network.MATIC;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getNetworkID() {
        return graph_ts_1.BigInt.fromI32(5);
    }
    getFactoryAddress() {
        return graph_ts_1.Address.fromString("0x7a4b5a56256163f07b2c80a7ca55abe66c4ec4d7");
    }
    getBridgeAddress() {
        return graph_ts_1.Address.fromString("0x5a58505a96d1dbf8df91cb21b54419fc36e93fde");
    }
}
exports.PortalPolygonConfigurations = PortalPolygonConfigurations;
